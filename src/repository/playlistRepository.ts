import { PrismaClient } from '@prisma/client';

import { Playlist, PlaylistArraySchema, PlaylistSchema, Song } from '../types';

const prisma = new PrismaClient();

export const getPlaylists = async (): Promise<Playlist[]> => {
    const playlists = await prisma.playlist.findMany({
        include: { songs: true },
    });
    return PlaylistArraySchema.parse(playlists);
};

export const getPlaylist = async (id: string): Promise<Playlist> => {
    const playlist = await prisma.playlist.findUniqueOrThrow({
        where: { id },
        include: { songs: true },
    });

    return PlaylistSchema.parse(playlist);
};

export const getSongPlaylists = async (song: Song): Promise<Playlist[]> => {
    const playlists = await prisma.playlist.findMany({
        where: { songs: { some: { id: song.id } } },
        include: { songs: true },
    });
    return PlaylistArraySchema.parse(playlists);
};

export const playlistContainsSong = async (id: string, songId: string): Promise<boolean> => {
    const count = await prisma.playlist.count({
        where: {
            id,
            songs: { some: { id: songId } },
        },
    });
    return count > 0;
};

export const playlistExists = async (id: string): Promise<boolean> => {
    const count = await prisma.playlist.count({ where: { id } });
    return count > 0;
};

export const playlistDirExists = async (dirName: string): Promise<boolean> => {
    const count = await prisma.playlist.count({ where: { dirName } });
    return count > 0;
};

export const updatePlaylistImage = async (playlist: Playlist, imageUrl: string): Promise<void> => {
    await prisma.playlist.update({
        where: { id: playlist.id },
        data: { imageUrl: imageUrl },
    });
};

export const addPlaylist = async (playlist: Playlist): Promise<void> => {
    await prisma.playlist.create({
        data: {
            id: playlist.id,
            url: playlist.url,
            title: playlist.title,
            imageUrl: playlist.imageUrl,
            dirName: playlist.dirName,
        },
    });
};

export const removePlaylist = async (playlist: Playlist): Promise<void> => {
    await prisma.playlist.delete({
        where: { id: playlist.id },
    });
};
