import {
    getNotDownloadedSongs,
    getPlaylists,
    getSongPlaylists,
    writeCoverImages,
    writeSongMetadata,
} from '../repository';
import { downloadSong } from '../services';
import { Song } from '../types';

/** Download songs that have not been downloaded yet and write some metadata to them */
export const downloadSongs = async (): Promise<void> => {
    console.log('Downloading songs');

    const missingSongs = await getNotDownloadedSongs();
    if (missingSongs.length === 0) {
        console.log('All songs have been downloaded!');
        return;
    }

    for (let i = 0; i < missingSongs.length; i++) {
        const song = missingSongs[i];
        console.log(`Downloading songs (${i + 1}/${missingSongs.length})`);
        const filename = await downloadSong(song);

        const updatedSong: Song = {
            ...structuredClone(song),
            downloaded: true,
            filename,
            imageUrl: null,
            renamed: false,
        };
        const playlists = await getSongPlaylists(song);
        for (const playlist of playlists) await writeSongMetadata(playlist, updatedSong);
    }

    console.log('Updating cover images');
    for (const playlist of await getPlaylists()) {
        await writeCoverImages(playlist);
    }
};
