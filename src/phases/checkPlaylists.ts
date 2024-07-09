import assert from 'node:assert/strict';

import { PLAYLIST_URLS } from '../config';
import { addSong, getPlaylists, playlistContainsSong, songExists } from '../repository';
import {
    addNewPlaylist,
    addSongToPlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    ytGetPlaylistData,
} from '../services';
import { Playlist } from '../types';

/** Check for new playlists */
const checkNewPlaylists = async (youtubePlaylists: Playlist[]): Promise<void> => {
    const localPlaylists = await getPlaylists();

    const localIds = localPlaylists.map((pl) => pl.id);
    for (const pl of youtubePlaylists) {
        if (!localIds.includes(pl.id)) await addNewPlaylist(pl);
    }
};

/** Check for removed playlists */
const checkRemovedPlaylists = async (youtubePlaylists: Playlist[]): Promise<void> => {
    const localPlaylists = await getPlaylists();

    const youtubeIds = youtubePlaylists.map((pl) => pl.id);
    for (const pl of localPlaylists) {
        if (!youtubeIds.includes(pl.id)) await deletePlaylist(pl);
    }
};

/** Check for new songs */
const checkNewSongs = async (youtubePlaylists: Playlist[]): Promise<void> => {
    const localPlaylists = await getPlaylists();

    for (const pl of youtubePlaylists) {
        const localPlaylist = localPlaylists.find((lpl) => lpl.id === pl.id);
        const songIds = new Set(localPlaylist!.songs.map((song) => song.id));

        for (const song of pl.songs) {
            if (songIds.has(song.id)) continue;

            if (!(await songExists(song))) await addSong(pl, song);
            else if (!(await playlistContainsSong(pl.id, song.id))) await addSongToPlaylist(pl, song);
            else throw new Error('Shouldnt happen');
        }
    }
};

/** Check for removed songs */
const chekcRemovedSongs = async (youtubePlaylists: Playlist[]): Promise<void> => {
    const localPlaylists = await getPlaylists();

    for (const pl of localPlaylists) {
        const youtubePlaylist = youtubePlaylists.find((ypl) => ypl.id === pl.id);
        const songIds = new Set(youtubePlaylist!.songs.map((song) => song.id));

        for (const song of pl.songs) {
            if (songIds.has(song.id)) continue;
            await removeSongFromPlaylist(pl, song);
        }
    }
};

/** Check playlists for changes */
export const checkPlaylists = async (): Promise<void> => {
    console.log('Checking playlists');
    console.log('Downloading playlist data from youtube');

    const youtubePlaylists = [];
    for (let i = 0; i < PLAYLIST_URLS.length; i++) {
        console.log(`Downloading playlist data ${i + 1}/${PLAYLIST_URLS.length}`);
        try {
            const playlistData = await ytGetPlaylistData(PLAYLIST_URLS[i]); // Might throw
            youtubePlaylists.push(playlistData);
        } catch (e) {
            assert(e instanceof Error);
            console.warn('Failed to download playlist data\n' + `${PLAYLIST_URLS[i]}\n` + e.message);
            return;
        }
    }
    // First check new and then removed to be able to copy over the song files before removing them.
    await checkNewPlaylists(youtubePlaylists);
    await checkNewSongs(youtubePlaylists);
    await chekcRemovedSongs(youtubePlaylists);
    await checkRemovedPlaylists(youtubePlaylists);
};
