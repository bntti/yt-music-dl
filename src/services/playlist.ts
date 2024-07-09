import { addSongToPlaylist } from '.';
import { addPlaylist, addSong, deletePlaylistDir, deleteSongFile, removePlaylist, songExists } from '../repository';
import { Playlist } from '../types';

/** Adds new playlist and its songs to the db copying existing song files */
export const addNewPlaylist = async (playlist: Playlist): Promise<void> => {
    console.log(`Adding new playlist ${playlist.title}`);

    await addPlaylist(playlist);
    for (const song of playlist.songs) {
        if (await songExists(song)) {
            await addSongToPlaylist(playlist, song);
            continue;
        }
        await addSong(playlist, song);
    }
};
export const deletePlaylist = async (playlist: Playlist): Promise<void> => {
    console.log(`Deleting playlist ${playlist.title}`);

    for (const song of playlist.songs) await deleteSongFile(playlist, song);
    await removePlaylist(playlist);
    await deletePlaylistDir(playlist);
};
