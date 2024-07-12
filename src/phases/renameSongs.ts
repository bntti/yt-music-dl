import prompt from 'prompt-sync';

const input = prompt();

import { getSongsToRename } from '../repository';
import { renameSong } from '../services';

export const renameSongs = async (): Promise<void> => {
    console.log('Renaming songs');
    const songsToRename = await getSongsToRename();
    for (let i = 0; i < songsToRename.length; i++) {
        console.log(`\nRenaming songs (${i + 1}/${songsToRename.length})`);

        const song = songsToRename[i];
        console.log(`Uploader: ${song.uploader}\n` + `Title: ${song.ytTitle}`);

        let artist = song.uploader;
        let title = song.ytTitle;
        if (title.includes(' - ')) [artist, title] = title.split(' - ');
        const inputArtist = input(`Song artist [${artist}}]: `);
        const inputTitle = input(`Song title [${title}}]: `);
        artist = inputArtist || artist;
        title = inputTitle || title;

        await renameSong(song, artist, title);
    }
};
