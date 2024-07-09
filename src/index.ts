import prompt from 'prompt-sync';

import { checkPlaylists, downloadSongs } from './phases';

const input = prompt();
const main = async (): Promise<void> => {
    const command = input('1. dl\n: ');
    if (command === '1') {
        await checkPlaylists();
        await downloadSongs();
    } else {
        console.warn(`Invalid command ${command}`);
    }
};

if (require.main === module) main().catch(console.error);
