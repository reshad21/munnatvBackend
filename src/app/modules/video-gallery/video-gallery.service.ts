/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';

const create = async (payload: any) => {
    if (!payload.videoUrl) {
        throw new Error('Video URL is required');
    }
    return prisma.videoGallery.create({
        data: {
            ...payload,
            status: payload.status !== undefined ? Boolean(payload.status) : undefined,
            id: payload.id ? String(payload.id) : undefined,
        },
    });
};

const getAll = async (query: Record<string, any>) => {
    const videosQuery = builderQuery({
        searchFields: ['title', 'description'],
        searchTerm: query.searchTerm,
        filter: query.filter ? JSON.parse(query.filter) : {},
        orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
    });

    const totalVideos = await prisma.videoGallery.count({ where: videosQuery.where });
    const currentPage = Number(query.page) || 1;
    const totalPages = Math.ceil(totalVideos / videosQuery.take);

    const response = await prisma.videoGallery.findMany({
        ...videosQuery,
    });

    return {
        meta: {
            totalItems: totalVideos,
            totalPages,
            currentPage,
        },
        data: response,
    };
};

const getById = async (id: string) => {
    return prisma.videoGallery.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
    return prisma.videoGallery.update({
        where: { id },
        data: payload,
    });
};

const deleteVideo = async (id: string) => {
    return prisma.videoGallery.delete({ where: { id } });
};

export const VideoGalleryService = {
    create,
    getAll,
    getById,
    update,
    delete: deleteVideo,
};
