import prompt from 'prompt-sync';

import { checkPlaylists, checkSimilarArtists, downloadSongs, exportData, importData, renameSongs } from './phases';
import { getSongData as getSongData } from './repository';

const input = prompt();

const main = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        const songData = await getSongData();
        console.log(
            `
------------------------------
Songs in total    | ${songData.numSongs}
Songs to download | ${songData.numSongs - songData.numDownloaded}
Songs to rename   | ${songData.numDownloaded - songData.numRenamed}

What do you want to do?
    u | update playlists
    r | rename songs
    c | check for duplicate artists
    e | export renaming data
    i | import renaming data
    q | quit
------------------------------
`.trim(),
        );

        const command = input(': ').toLowerCase().trim();
        switch (command) {
            case 'u':
                await checkPlaylists();
                await downloadSongs();
                break;
            case 'r':
                await renameSongs();
                break;
            case 'c':
                await checkSimilarArtists();
                break;
            case 'e':
                await exportData();
                break;
            case 'i':
                await importData();
                break;
            case 'q':
                process.exit();
                break;
            default:
                console.warn(`Invalid command ${command}`);
        }
    }
};

main().catch(console.error);
