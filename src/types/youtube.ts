import { z } from 'zod';

export const YtSongSchema = z.object({
    thumbnail: z.string().url(),
});

export const YTPlaylistEntrySchema = z.object({
    id: z.string(),
    url: z.string(),
    title: z.string(),
    uploader: z.string(),
    duration: z.number().int().positive(),
});

export const YTPlaylistSchema = z.object({
    id: z.string(),
    title: z.string(),
    webpage_url: z.string().url(),
    entries: z.array(YTPlaylistEntrySchema),
});

export type YTSong = z.infer<typeof YtSongSchema>;
export type YTPlaylist = z.infer<typeof YTPlaylistSchema>;
