import prompt from 'prompt-sync';

import { checkPlaylists, downloadSongs, renameSongs, checkSimilarArtists, exportData, importData } from './phases';
import { getNums } from './repository';

const input = prompt();

const main = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        const nums = await getNums();
        console.log(
            `
------------------------------
Songs in total    | ${nums.songs}
Songs to download | ${nums.songs - nums.downloaded}
Songs to rename   | ${nums.downloaded - nums.renamed}

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

if (require.main === module) main().catch(console.error);
