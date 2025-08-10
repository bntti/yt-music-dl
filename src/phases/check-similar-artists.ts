import assert from 'node:assert/strict';
import { findBestMatch } from 'string-similarity';

import { getRenamedSongs } from '../repository';

export const checkSimilarArtists = async (): Promise<void> => {
    const songs = await getRenamedSongs();
    const artists = new Set<string>();
    for (const song of songs) {
        assert.ok(song.renamed);
        artists.add(song.artist);
    }

    const artistList = [...artists];
    for (const artist of artistList) {
        const matches = findBestMatch(artist, artistList);
        const ratings = matches.ratings.toSorted((a, b) => b.rating - a.rating);
        for (const rating of ratings) {
            // Only log each pair once
            if (rating.rating > 0.5 && rating.rating !== 1 && artist > rating.target) {
                console.log(artist, rating.target);
            }
        }
    }
};
