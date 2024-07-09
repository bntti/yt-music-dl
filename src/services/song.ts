import assert from 'node:assert/strict';

import { ytDownloadSong } from './ytDlp';
import {
    copySong,
    dbAddSongToPlaylist,
    dbRemoveSongFromPlaylist,
    deleteSongFile,
    getSongPlaylists,
    getSong,
    getSongFilename,
    normalizeAndConvertSongToCorrectFormat,
    setSongAsDownloaded,
    updateSongMetadata,
    songHasPlaylist,
    removeSong,
} from '../repository';
import { Playlist, Song } from '../types';

/** Download song, convert downloaded file to the correct format, and set it as downloaded. Returns the filename */
export const downloadSong = async (song: Song): Promise<string> => {
    console.log(`Downloading song ${song.ytTitle}`);

    const playlists = await getSongPlaylists(song);
    assert(playlists.length > 0);
    const playlist = playlists.pop()!;

    const path = await ytDownloadSong(playlist, song);
    console.log('Normalizing the song and converting it to the correct format');
    const filename = await normalizeAndConvertSongToCorrectFormat(path);
    const dlSong = await setSongAsDownloaded(song, filename);
    assert(dlSong.downloaded);

    for (const pl of playlists) {
        console.log(`Copying existing song file ${dlSong.filename}`);
        await copySong(playlist, pl, song);
    }

    return filename;
};

/** Rename song to format artist - title and add the new data to the database */
export const renameSong = async (song: Song, artist: string, title: string): Promise<void> => {
    assert(song.downloaded);

    const playlists = await getSongPlaylists(song);
    const oldFilename = song.filename;
    const newFilename = await getSongFilename(oldFilename, artist, title, true);

    console.log(`Renaming song ${oldFilename} to ${newFilename}`);
    await setSongAsDownloaded(song, newFilename);
    await updateSongMetadata(playlists, song, artist, title, newFilename);
};

/** Add song to new playlist and copy it if downloaded */
export const addSongToPlaylist = async (playlist: Playlist, song: Song): Promise<void> => {
    console.log(`Adding song ${song.ytTitle} to playlist ${playlist.title}`);

    await dbAddSongToPlaylist(playlist, song);
    const existingSong = await getSong(song.id);
    if (!existingSong.downloaded) return;

    console.log(`Copying existing song file ${existingSong.filename}`);
    const playlists = (await getSongPlaylists(song)).filter((pl) => pl.id !== playlist.id);
    assert(playlists.length > 0);
    await copySong(playlists[0], playlist, song);
};

/** Remove song from playlist and delete the file and the song object if necessary */
export const removeSongFromPlaylist = async (playlist: Playlist, song: Song): Promise<void> => {
    console.log(`Deleting song ${song.ytTitle} from playlist ${playlist.title}`);

    await dbRemoveSongFromPlaylist(playlist, song);
    const dbSong = await getSong(song.id);
    if (dbSong.downloaded) await deleteSongFile(playlist, song);
    const hasPlaylist = await songHasPlaylist(song);
    if (!hasPlaylist) await removeSong(song);
};
