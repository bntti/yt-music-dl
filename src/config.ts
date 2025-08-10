import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Config, ConfigSchema } from './types';

export const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const readConfig = (): Config => {
    const configFile = path.join(PROJECT_ROOT, 'config.json');
    let rawConfig;
    try {
        rawConfig = fs.readFileSync(configFile);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            const exampleFile = path.join(PROJECT_ROOT, 'config.json.example');
            fs.copyFileSync(exampleFile, configFile);

            console.log('Created config.json file.');
            process.exit();
        }
        console.error('Unknown error while reading config.json\n' + String(error));
        process.exit();
    }

    let result;
    try {
        result = ConfigSchema.safeParse(JSON.parse(rawConfig.toString()));
    } catch (error) {
        console.error('Unable to parse config.json\n' + String(error));
        process.exit();
    }

    if (!result.success) {
        console.error('Invalid config.json\n' + JSON.stringify(result.error));
        process.exit();
    }

    return result.data;
};

const config = readConfig();

export const SONG_DIR = config.song_dir;
export const SONG_EXT = config.song_ext;
export const PLAYLIST_URLS = config.playlist_urls;
