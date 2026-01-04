import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import { deleteImageFile } from '../../utils/deleteFile';

const create = async (payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  return prisma.blog.create({
    data: {
      ...payload,
      status: payload.status !== undefined ? Boolean(payload.status) : undefined,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};

const getAll = async (query: Record<string, any>) => {
  const blogQuery = builderQuery({
    searchFields: ['author', 'title', 'shortDescription', 'description', 'image'],
    searchTerm: query.searchTerm,
    filter: query.filter ? JSON.parse(query.filter) : {},
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const totalBlogs = await prisma.blog.count({ where: blogQuery.where });
  const currentPage = Number(query.page) || 1;
  const totalPages = Math.ceil(totalBlogs / blogQuery.take);

  const response = await prisma.blog.findMany({
    ...blogQuery,
  });

  return {
    meta: {
      totalItems: totalBlogs,
      totalPages,
      currentPage,
    },
    data: response,
  };
};

const getById = async (id: string) => {
  return prisma.blog.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
  const existing = await prisma.blog.findUniqueOrThrow({ where: { id } });
  // If no new image is provided, keep the existing image
  const image = payload.image || existing.image;
  if (!image) {
    throw new Error('Image is required');
  }
  const updated = await prisma.blog.update({
    where: { id },
    data: {
      ...payload,
      image,
      status: payload.status !== undefined ? Boolean(payload.status) : undefined,
    },
  });
  if (payload.image && existing.image && existing.image !== payload.image) {
    deleteImageFile(existing.image);
  }
  return updated;
};

const deleteBlog = async (id: string) => {
  const existing = await prisma.blog.findUniqueOrThrow({ where: { id } });
  const deleted = await prisma.blog.delete({ where: { id } });
  if (existing.image) {
    deleteImageFile(existing.image);
  }
  return deleted;
};

const updateStatus = async (id: string, status: boolean) => {
  return prisma.blog.update({
    where: { id },
    data: { status: Boolean(status) },
  });
};

export const BlogService = {
  create,
  getAll,
  getById,
  update,
  delete: deleteBlog,
  updateStatus,
};


