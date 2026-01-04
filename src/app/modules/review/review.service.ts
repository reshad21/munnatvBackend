
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import { deleteImageFile } from '../../utils/deleteFile';

const create = async (payload: any) => {
    if (!payload.image) {
        throw new Error('Image is required');
    }
    return prisma.review.create({
        data: {
            ...payload,
            rating: Number(payload.rating),
            status: payload.status !== undefined ? Boolean(payload.status) : undefined,
            id: payload.id ? String(payload.id) : undefined,
        },
    });
};

const getAll = async (query: Record<string, any>) => {
    const reviewsQuery = builderQuery({
        searchFields: ['author', 'description'],
        searchTerm: query.searchTerm,
        filter: query.filter ? JSON.parse(query.filter) : {},
        orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
    });

    const totalReviews = await prisma.review.count({ where: reviewsQuery.where });
    const currentPage = Number(query.page) || 1;
    const totalPages = Math.ceil(totalReviews / reviewsQuery.take);

    const response = await prisma.review.findMany({
        ...reviewsQuery,
    });

    return {
        meta: {
            totalItems: totalReviews,
            totalPages,
            currentPage,
        },
        data: response,
    };
};

const getById = async (id: string) => {
  return prisma.review.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
    if (!payload.image) {
        throw new Error('Image is required');
    }
    const existing = await prisma.review.findUniqueOrThrow({ where: { id } });
    const updated = await prisma.review.update({
        where: { id },
        data: {
            ...payload,
            rating: Number(payload.rating),
            status: payload.status !== undefined ? Boolean(payload.status) : undefined,
        },
    });
    if (payload.image && existing.image && existing.image !== payload.image) {
        deleteImageFile(existing.image);
    }
    return updated;
};

const deleteReview = async (id: string) => {
    const existing = await prisma.review.findUniqueOrThrow({ where: { id } });
    const deleted = await prisma.review.delete({ where: { id } });
    if (existing.image) {
        deleteImageFile(existing.image);
    }
    return deleted;
};

const updateStatus = async (id: string, status: boolean) => {
    return prisma.review.update({
        where: { id },
        data: { status: Boolean(status) },
    });
};

export const ReviewService = {
    create,
    getAll,
    getById,
    update,
    delete: deleteReview,
    updateStatus,
};
