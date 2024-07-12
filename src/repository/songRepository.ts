import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';

import { Playlist, Song, SongArraySchema, SongSchema } from '../types';

const prisma = new PrismaClient();

export const getSongs = async (): Promise<Song[]> => {
    const songs = await prisma.song.findMany();
    return SongArraySchema.parse(songs);
};

export const getNotDownloadedSongs = async (): Promise<Song[]> => {
    const songs = await prisma.song.findMany({ where: { downloaded: false } });
    return SongArraySchema.parse(songs);
};

export const getSongsToRename = async (): Promise<Song[]> => {
    const songs = await prisma.song.findMany({ where: { downloaded: true, renamed: false } });
    return SongArraySchema.parse(songs);
};

export const getRenamedSongs = async (): Promise<Song[]> => {
    const songs = await prisma.song.findMany({ where: { renamed: true } });
    return SongArraySchema.parse(songs);
};

export const getOrphans = async (): Promise<Song[]> => {
    const orphans = await prisma.song.findMany({
        where: { playlists: { none: {} } },
    });
    return SongArraySchema.parse(orphans);
};

export const getSong = async (id: string): Promise<Song> => {
    const song = await prisma.song.findUniqueOrThrow({ where: { id } });
    return SongSchema.parse(song);
};

/** Returns number of songs, downloaded songs and renamed songs */
export const getNums = async (): Promise<{ songs: number; downloaded: number; renamed: number }> => {
    const songCount = await prisma.song.count();

    const downloadedCount = await prisma.song.count({
        where: { downloaded: true },
    });

    const renamedCount = await prisma.song.count({
        where: { downloaded: true, renamed: true },
    });

    return { songs: songCount, downloaded: downloadedCount, renamed: renamedCount };
};

export const addSong = async (playlist: Playlist, song: Song): Promise<void> => {
    await prisma.song.create({
        data: {
            id: song.id,
            url: song.url,
            uploader: song.uploader,
            ytTitle: song.ytTitle,
            length: song.length,
            downloaded: false,
            renamed: false,
            playlists: { connect: { id: playlist.id } },
        },
    });
};

export const dbAddSongToPlaylist = async (playlist: Playlist, song: Song): Promise<void> => {
    await prisma.song.update({
        where: { id: song.id },
        data: { playlists: { connect: { id: playlist.id } } },
    });
};

export const songHasPlaylist = async (song: Song): Promise<boolean> => {
    const count = await prisma.song.count({
        where: { id: song.id, playlists: { some: {} } },
    });
    return count > 0;
};

export const songFilenameExists = async (filename: string): Promise<boolean> => {
    const count = await prisma.song.count({
        where: { filename: filename },
    });
    return count > 0;
};

export const songExists = async (id: string): Promise<boolean> => {
    const count = await prisma.song.count({ where: { id } });
    return count > 0;
};

export const setSongAsDownloaded = async (song: Song, filename: string): Promise<Song> => {
    const newSong = await prisma.song.update({
        where: { id: song.id },
        data: { downloaded: true, filename: filename, renamed: false },
    });
    return SongSchema.parse(newSong);
};

export const updateSongImageUrl = async (id: string, imageUrl: string): Promise<void> => {
    await prisma.song.update({ where: { id }, data: { imageUrl } });
};

export const setSongAsRenamed = async (
    song: Song,
    artist: string,
    title: string,
    newFilename: string,
): Promise<void> => {
    assert(song.downloaded);
    await prisma.song.update({
        where: { id: song.id },
        data: {
            renamed: true,
            artist: artist,
            title: title,
            filename: newFilename,
        },
    });
};

export const exportRenamedSongs = async (): Promise<{ id: string; artist: string; title: string }[]> => {
    const dbRenamedSongs = await getRenamedSongs();
    const renamedSongs = SongArraySchema.parse(dbRenamedSongs);
    return renamedSongs.map((song) => {
        assert(song.renamed); // Always true
        return {
            id: song.id,
            artist: song.artist,
            title: song.title,
        };
    });
};

export const dbRemoveSongFromPlaylist = async (playlist: Playlist, song: Song): Promise<void> => {
    await prisma.song.update({
        where: { id: song.id },
        data: { playlists: { disconnect: [{ id: playlist.id }] } },
    });
};

export const removeSong = async (song: Song): Promise<void> => {
    await prisma.song.delete({ where: { id: song.id } });
};
