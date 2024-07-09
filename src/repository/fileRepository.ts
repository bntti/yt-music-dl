import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import nodeID3 from 'node-id3';
import assert from 'node:assert/strict';
import path from 'path';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';

import { songFilenameExists, playlistDirExists } from '.';
import { SONG_DIR, SONG_EXT, TARGET_DBFS } from '../config';
import { Playlist, Song } from '../types';

export const sanitizeFilename = (filename: string): string => {
    return sanitize(filename);
};

export const getSongFilename = async (
    oldFilename: string | null,
    artist: string,
    title: string,
    assertUnique: boolean = false,
): Promise<string> => {
    const filename = sanitizeFilename(`${artist} - ${title}`);
    if (oldFilename !== filename && assertUnique && (await songFilenameExists(filename)))
        throw new Error(`Filename exists\n${filename}`);

    return filename;
};

/** Create folder for playlist if necessary */
export const createPlaylistFolder = async (dirName: string): Promise<void> => {
    const fullPath = path.join(SONG_DIR, dirName);
    await fs.mkdir(fullPath).catch(() => {});
};

/** Get path of song file */
export const getSongPath = (playlist: Playlist, song: Song): string => {
    assert(song.downloaded);
    return path.join(SONG_DIR, playlist.dirName, `${song.filename}${SONG_EXT}`);
};

/** Rename song to new filename */
export const renameSong = async (playlists: Playlist[], song: Song, newFilename: string): Promise<void> => {
    assert(song.downloaded);
    const updatedSong: Song = { ...structuredClone(song), filename: newFilename };

    for (const pl of playlists) {
        const oldPath = getSongPath(pl, song);
        const newPath = getSongPath(pl, updatedSong);
        await fs.rename(oldPath, newPath);
    }
};

/** Copy song to new playlist */
export const copySong = async (oldPlaylist: Playlist, newPlaylist: Playlist, song: Song): Promise<void> => {
    assert(oldPlaylist.id !== newPlaylist.id);
    assert(song.downloaded);
    const oldPath = getSongPath(oldPlaylist, song);
    const newPath = getSongPath(newPlaylist, song);
    await fs.copyFile(oldPath, newPath);
};

/** Convert image to 1:1 by adding blur */
const generateSquareImage = async (inputImage: Buffer): Promise<Buffer> => {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    assert(metadata.width && metadata.height);

    if (metadata.width === metadata.height) return inputImage;
    const maxSize = Math.max(metadata.width, metadata.height);

    // Create a blurred enlarged version of the image
    const blurredBackground = await image
        .resize(maxSize, maxSize, { fit: 'cover' })
        .blur(20) // Adjust the blur amount as needed
        .toBuffer();

    // // Resize the original image to fit within the square while maintaining its aspect ratio
    // const resizedImage = await image
    //     .resize(maxSize, maxSize, {
    //         fit: 'inside',
    //         background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background if the image doesn't fit exactly
    //     })
    //     .toBuffer();

    // Composite the original image on top of the blurred background
    const finalImage = await sharp(blurredBackground)
        .composite([{ input: inputImage, gravity: 'center' }])
        .toBuffer();
    return finalImage;
};

/** Generate cover image from image URL */
const getSongCoverImage = async (url: string): Promise<Buffer> => {
    const res = await fetch(url);
    const imageBuffer = Buffer.from(await res.arrayBuffer());
    const squareImage = await generateSquareImage(imageBuffer);
    return squareImage;
};

/** Write/update song cover images */
export const writeCoverImages = async (playlist: Playlist): Promise<void> => {
    assert(playlist.imageUrl);
    const imageData = await getSongCoverImage(playlist.imageUrl);

    for (const song of playlist.songs) {
        assert(song.downloaded);
        if (song.imageUrl === playlist.imageUrl) continue;

        const filepath = getSongPath(playlist, song);
        const fileBuffer = await fs.readFile(filepath);
        const tags = await nodeID3.Promise.read(fileBuffer);
        tags.image = {
            mime: 'image/png',
            type: { id: 3, name: 'Cover image' },
            imageBuffer: await sharp(imageData).png().toBuffer(),
            description: 'Cover image',
        };

        await nodeID3.Promise.write(tags, filepath);
    }
};

/** Write the song metadata */
export const writeSongMetadata = async (playlist: Playlist, song: Song): Promise<void> => {
    assert(song.downloaded);

    const filepath = getSongPath(playlist, song);
    const fileBuffer = await fs.readFile(filepath);
    const tags = await nodeID3.Promise.read(fileBuffer);

    let artist = song.uploader;
    let title = song.ytTitle;
    if (title.includes(' - ')) [artist, title] = title.split(' - ');

    tags.artist = artist;
    tags.title = title;
    tags.album = playlist.title;
    await nodeID3.Promise.write(tags, filepath);
};

/** Write the new artist and the new title to the song metadata */
export const updateSongMetadata = async (
    playlists: Playlist[],
    song: Song,
    artist: string,
    title: string,
    newFilename: string,
): Promise<void> => {
    assert(song.downloaded);
    const updatedSong: Song = { ...structuredClone(song), filename: newFilename };

    for (const pl of playlists) {
        const filepath = getSongPath(pl, updatedSong);
        const fileBuffer = await fs.readFile(filepath);
        const tags = await nodeID3.Promise.read(fileBuffer);

        tags.artist = artist;
        tags.title = title;
        await nodeID3.Promise.write(tags, filepath);
    }
};

/** Normalize audio and re-encode using ffmpeg */
const ffmpegNormalize = async (inputPath: string, outputPath: string): Promise<void> => {
    // Construct the ffmpeg arguments for normalization
    const args = [
        '-i',
        inputPath,
        '-af',
        `loudnorm=I=${TARGET_DBFS}`, // Applies the loudnorm filter
        // '-ar', '44100', // Sets the audio sampling rate to 44100 Hz
        '-y', // Overwrite output file if it exists
        outputPath,
    ];

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args);

        // ffmpeg.stdout.on('data', (data) => {
        //     console.log(`stdout: ${data}`);
        // });

        // ffmpeg.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });
    });
};

/** Normalize song, convert song file to configured format and return the filename */
export const normalizeAndConvertSongToCorrectFormat = async (songPath: string): Promise<string> => {
    const { dir: basePath, name: filename } = path.parse(songPath);
    const newPath = path.join(basePath, `${filename}${SONG_EXT}`);

    await ffmpegNormalize(songPath, newPath);
    await fs.rm(songPath);

    return filename;
};

/** Remove empty directories from SONG_DIR */
export const removeExtraSongFolders = async (): Promise<void> => {
    const dirs = await fs.readdir(SONG_DIR);
    for (const dir of dirs) {
        if (!(await playlistDirExists(dir))) await fs.rm(dir, { recursive: true });
    }
};

/** Delete playlist directory */
export const deletePlaylistDir = async (playlist: Playlist): Promise<void> => {
    const playlistDir = path.join(SONG_DIR, playlist.dirName);
    await fs.rmdir(playlistDir);
};

/** Delete song file */
export const deleteSongFile = async (playlist: Playlist, song: Song): Promise<void> => {
    await fs.rm(getSongPath(playlist, song));
};
