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

    // Read data
    let rawData: string;
    try {
        rawData = (await fs.readFile(exportFile)).toString();
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.warn('export.json not found');
            return;
        }
        throw error;
    }

    // Parse json
    let jsonData: JSON;
    try {
        jsonData = JSON.parse(rawData) as JSON;
    } catch (error) {
        assert.ok(error instanceof SyntaxError);
        throw new Error('Failed to parse export.json\n' + `${shortenString(rawData)}\n` + error.message, {
            cause: error,
        });
    }

    // Validate json
    const result = ExportSchema.safeParse(jsonData);
    if (!result.success) {
        throw new Error(
            'Failed to validate export.json\n' + `${shortenString(rawData)}\n` + JSON.stringify(result.error),
        );
    }

    for (const exportSong of result.data) {
        if (!(await songExists(exportSong.id))) {
            console.warn(`Song ${exportSong.title} not found`);
            continue;
        }

        const song = await getSong(exportSong.id);
        if (!song.downloaded) continue;

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
