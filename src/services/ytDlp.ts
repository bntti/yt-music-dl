import { spawn } from 'child_process';
import assert from 'node:assert/strict';
import path from 'path';

import { shortenString } from '.';
import { SONG_DIR } from '../config';
import { createPlaylistFolder, sanitizeFilename } from '../repository';
import { Playlist, Song, YTPlaylistSchema, YtSongSchema } from '../types';

/** Get song data json using yt-dlp */
const ytDlpGetSongData = async (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const ytDl = spawn('yt-dlp', ['--dump-single-json', url]);
        const error: string[] = [];
        const stdout: string[] = [];

        ytDl.stdout.on('data', (data: Buffer) => {
            stdout.push(data.toString());
        });
        ytDl.stderr.on('data', (data: Buffer) => {
            error.push(data.toString());
        });

        ytDl.on('close', (code) => {
            if (code !== 0) reject(error.join(''));
            else resolve(stdout.join(''));
        });
    });

/** Get playlist data json using yt-dlp */
const ytDlpGetPlaylistData = async (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const ytDl = spawn('yt-dlp', ['--flat-playlist', '--dump-single-json', url]);
        const error: string[] = [];
        const stdout: string[] = [];

        ytDl.stdout.on('data', (data: Buffer) => {
            stdout.push(data.toString());
        });
        ytDl.stderr.on('data', (data: Buffer) => {
            error.push(data.toString());
        });

        ytDl.on('close', (code) => {
            if (code !== 0) reject(error.join(''));
            else resolve(stdout.join(''));
        });
    });

/** Download song from youtube and return the relative file path */
const ytDlpDownloadSong = async (dirPath: string, song: Song): Promise<string> =>
    new Promise((resolve, reject) => {
        const flags = [
            '-f',
            'bestaudio',
            '-o',
            '%(title)s.%(ext)s',
            '-P',
            dirPath,
            '--print',
            'filename',
            '--no-simulate',
            song.url,
        ];
        const ytDl = spawn('yt-dlp', flags);
        const error: string[] = [];
        const stdout: string[] = [];

        ytDl.stdout.on('data', (data: Buffer) => {
            stdout.push(data.toString());
        });
        ytDl.stderr.on('data', (data: Buffer) => {
            error.push(data.toString());
        });

        ytDl.on('close', (code) => {
            if (code !== 0) reject(error.join(''));
            else resolve(stdout.join(''));
        });
    });

export const ytGetSongThumbnailUrl = async (url: string): Promise<string | null> => {
    const rawSongData = await ytDlpGetSongData(url).catch((error) => {
        throw new Error('Failed to download song data from youtube\n' + String(error));
    });

    if (rawSongData.trim() === 'null') throw new Error('Failed to download song data');

    // Parse json
    let result;
    try {
        result = YtSongSchema.safeParse(JSON.parse(rawSongData));
    } catch (e) {
        assert(e instanceof SyntaxError);
        throw new Error('Failed to parse youtube song json response\n' + `${shortenString(rawSongData)}\n` + e.message);
    }

    // Validate json
    if (!result.success) {
        throw new Error(
            'Failed to validate youtube song json response\n' +
                `${shortenString(rawSongData)}\n` +
                result.error.toString(),
        );
    }

    return result.data.thumbnail;
};

export const ytGetPlaylistData = async (url: string): Promise<Playlist> => {
    const rawPlaylistData = await ytDlpGetPlaylistData(url).catch((error) => {
        throw new Error('Failed to download playlist data from youtube\n' + String(error));
    });

    if (rawPlaylistData.trim() === 'null') throw new Error('Failed to download playlist data');

    // Parse json
    let result;
    try {
        result = YTPlaylistSchema.safeParse(JSON.parse(rawPlaylistData));
    } catch (e) {
        assert(e instanceof SyntaxError);
        throw new Error(
            'Failed to parse youtube playlist json response\n' + `${shortenString(rawPlaylistData)}\n` + e.message,
        );
    }

    // Validate json
    if (!result.success) {
        // Will fail on removed songs. TODO: fix.
        throw new Error(
            'Failed to validate youtube playlist json response\n' +
                `${shortenString(rawPlaylistData)}\n` +
                result.error.toString(),
        );
    }
    const playlistData = result.data;

    const songs: Song[] = [];
    for (const entry of playlistData.entries) {
        songs.push({
            id: entry.id,
            url: entry.url,
            uploader: entry.uploader,
            ytTitle: entry.title,
            length: entry.duration,
            downloaded: false,
            renamed: false,
        });
    }

    const dirName = sanitizeFilename(playlistData.title);
    await createPlaylistFolder(dirName);

    const imageUrl = songs.length > 0 ? await ytGetSongThumbnailUrl(songs[0].url) : null;
    const playlist: Playlist = {
        id: playlistData.id,
        url: playlistData.webpage_url,
        title: playlistData.title,
        imageUrl: imageUrl,
        dirName: dirName,
        songs: songs,
    };

    return playlist;
};

/** Download song from youtube and return the relative path to the downloaded song */
export const ytDownloadSong = async (playlist: Playlist, song: Song): Promise<string> => {
    const dirPath = path.join(SONG_DIR, playlist.dirName);
    const songPath = await ytDlpDownloadSong(dirPath, song).catch((error) => {
        throw new Error('Failed to download song from youtube\n' + String(error));
    });
    if (songPath.trim() === '') throw new Error('Failed to download song');

    return songPath.trim();
};
