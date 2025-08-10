import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';

import { PROJECT_ROOT } from '../config';
import { getSong, getSongFilename, songExists } from '../repository';
import { renameSong, shortenString } from '../services';
import { ExportSchema } from '../types';

export const importData = async (): Promise<void> => {
    console.log('Importing song renaming data');
    const exportFile = path.join(PROJECT_ROOT, 'export.json');
    const data = await fs.readFile(exportFile);

    // Parse json
    let result;
    try {
        result = ExportSchema.safeParse(JSON.parse(data.toString()));
    } catch (error) {
        assert.ok(error instanceof SyntaxError);
        throw new Error('Failed to parse export.json\n' + `${shortenString(data.toString())}\n` + error.message);
    }

    // Validate json
    if (!result.success) {
        throw new Error(
            'Failed to validate export.json\n' + `${shortenString(data.toString())}\n` + JSON.stringify(result.error),
        );
    }

    for (const exportSong of result.data) {
        if (!(await songExists(exportSong.id))) {
            console.warn(`Song ${exportSong.title} not found`);
            continue;
        }

        const song = await getSong(exportSong.id);
        assert.ok(song.downloaded);

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
