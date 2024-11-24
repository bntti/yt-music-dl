/* eslint-disable camelcase */

import { z } from 'zod';

export const ConfigSchema = z.strictObject({
    song_dir: z.string(),
    song_ext: z.enum(['.mp3']), // TODO: Add more supported song extensions?
    playlist_urls: z.array(z.string().url().startsWith('https://youtube.com/playlist?list=')),
});

export type Config = z.infer<typeof ConfigSchema>;
