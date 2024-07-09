import * as fs from 'fs';
import path from 'path';

import { Config, ConfigSchema } from './types';

const readConfig = (): Config => {
    const configFile = path.join(__dirname, '..', 'config.json');
    let rawConfig;
    try {
        rawConfig = fs.readFileSync(configFile);
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
            const exampleFile = path.join(__dirname, '..', 'config.json.example');
            fs.copyFileSync(exampleFile, configFile);

            console.log('Created config.json file.');
            process.exit();
        }
        console.error('Unknown error while reading config.json\n' + String(e));
        process.exit();
    }

    let result;
    try {
        result = ConfigSchema.safeParse(JSON.parse(rawConfig.toString()));
    } catch (e) {
        console.error('Unable to parse config.json\n' + String(e));
        process.exit();
    }

    if (!result.success) {
        console.error('Invalid config.json\n' + result.error.toString());
        process.exit();
    }

    return result.data;
};

const config = readConfig();
export const SONG_DIR = config.song_dir;
export const SONG_EXT = config.song_ext;
export const TARGET_DBFS = config.DBFS;
export const PLAYLIST_URLS = config.playlist_urls;
