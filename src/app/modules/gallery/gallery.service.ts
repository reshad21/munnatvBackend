/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';

const create = async (payload: any) => {
    if (!payload.image) {
        throw new Error('Image URL is required');
    }
        // Ensure status is boolean if provided as string
        let status = payload.status;
        if (typeof status === 'string') {
            status = status === 'true' || status === '1';
        } else if (typeof status !== 'boolean') {
            status = undefined;
        }
        return prisma.gallery.create({
            data: {
                ...payload,
                status: status,
                id: payload.id ? String(payload.id) : undefined,
            },
        });
};

const getAll = async (query: Record<string, any>) => {
    const galleryQuery = builderQuery({
        searchFields: ['image'],
        searchTerm: query.searchTerm,
        filter: query.filter ? JSON.parse(query.filter) : {},
        orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
    });

    const totalGalleries = await prisma.gallery.count({ where: galleryQuery.where });
    const currentPage = Number(query.page) || 1;
    const totalPages = Math.ceil(totalGalleries / galleryQuery.take);

    const response = await prisma.gallery.findMany({
        ...galleryQuery,
    });

    return {
        meta: {
            totalItems: totalGalleries,
            itemCount: response.length,
            itemsPerPage: galleryQuery.take,
            totalPages,
            currentPage,
        },
        data: response,
    };
};

const getById = async (id: string) => {
    return prisma.gallery.findUnique({ where: { id } });
};

const update = async (id: string, payload: any) => {
    // Fetch the existing gallery item
    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
        throw new Error('Gallery item not found');
    }
    // If image is not provided in payload, retain the existing image
    const data = {
        ...payload,
        image: payload.image !== undefined ? payload.image : existing.image,
    };
    return prisma.gallery.update({
        where: { id },
        data,
    });
};

const deleteGallery = async (id: string) => {
    return prisma.gallery.delete({ where: { id } });
};


const updateStatus = async (id: string, status: boolean) => {
  const updated = await prisma.gallery.update({
    where: { id: String(id) },
    data: { status: Boolean(status) },
  });
  return updated;
};

export const GalleryService = {
    create,
    getAll,
    getById,
    update,
    delete: deleteGallery,
    updateStatus,
};
