import assert from 'node:assert/strict';
import { findBestMatch } from 'string-similarity';

import { getRenamedSongs } from '../repository';

export const checkSimilarArtists = async (): Promise<void> => {
    const songs = await getRenamedSongs();
    const artists: string[] = [];
    for (const song of songs) {
        assert(song.renamed);
        if (!artists.includes(song.artist)) artists.push(song.artist);
    }
    for (const song of songs) {
        assert(song.renamed);
        const matches = findBestMatch(song.artist, artists);
        const ratings = matches.ratings.toSorted((a, b) => b.rating - a.rating);
        for (const rating of ratings) {
            if (rating.rating > 0.1 && rating.rating !== 1) {
                console.log(song.artist, rating.target);
            }
        }
    }
};
