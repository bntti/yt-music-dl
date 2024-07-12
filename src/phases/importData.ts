import * as fs from 'fs/promises';
import assert from 'node:assert/strict';
import path from 'path';

import { getSong, getSongFilename } from '../repository';
import { renameSong, shortenString } from '../services';
import { ExportSchema } from '../types';

export const importData = async (): Promise<void> => {
    console.log('Importing song renaming data');
    const exportFile = path.join(__dirname, '..', '..', 'export.json');
    const data = await fs.readFile(exportFile);

    // Parse json
    let result;
    try {
        result = ExportSchema.safeParse(JSON.parse(data.toString()));
    } catch (e) {
        assert(e instanceof SyntaxError);
        throw new Error('Failed to parse export.json\n' + `${shortenString(data.toString())}\n` + e.message);
    }

    // Validate json
    if (!result.success) {
        throw new Error(
            'Failed to validate export.json\n' + `${shortenString(data.toString())}\n` + result.error.toString(),
        );
    }

    for (const exportSong of result.data) {
        const song = await getSong(exportSong.id);
        assert(song.downloaded);

        const newFilename = await getSongFilename(song.filename, exportSong.artist, exportSong.title, false);
        if (
            !song.renamed ||
            song.artist !== exportSong.artist ||
            song.title !== exportSong.title ||
            song.filename !== newFilename
        ) {
            console.log(`Old filename: ${song.filename}\n` + `New filename: ${newFilename}`);
            await renameSong(song, exportSong.artist, exportSong.title);
        }
    }
};
