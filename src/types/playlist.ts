import { z } from 'zod';

import { SongSchema } from './song';

export const PlaylistSchema = z.strictObject({
    id: z.string(),
    url: z.string().url(),
    title: z.string(),
    imageUrl: z.string().url().nullable(),
    dirName: z.string(),
    songs: z.array(SongSchema),
});
export const PlaylistArraySchema = z.array(PlaylistSchema);

export type Playlist = z.infer<typeof PlaylistSchema>;
