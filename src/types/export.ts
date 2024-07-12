import { z } from 'zod';

export const ExportSchema = z.array(
    z.object({
        id: z.string(),
        artist: z.string(),
        title: z.string(),
    }),
);

export type Export = z.infer<typeof ExportSchema>;
