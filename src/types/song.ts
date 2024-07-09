import { z } from 'zod';

const SongBaseSchema = z.object({
    id: z.string(),
    url: z.string().url(),
    uploader: z.string(),
    ytTitle: z.string(),
    length: z.number().int(),
});
export const SongSchema = z.union([
    SongBaseSchema.extend({
        downloaded: z.literal(false),
        renamed: z.literal(false),
    }),
    SongBaseSchema.extend({
        downloaded: z.literal(true),
        filename: z.string(),
        imageUrl: z.string().url().nullable(),
        renamed: z.literal(false),
    }),
    SongBaseSchema.extend({
        downloaded: z.literal(true),
        filename: z.string(),
        imageUrl: z.string().url(),
        renamed: z.literal(true),
        artist: z.string(),
        title: z.string(),
    }),
]);
export const SongArraySchema = z.array(SongSchema);

export type Song = z.infer<typeof SongSchema>;
