
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import { deleteImageFile } from '../../utils/deleteFile';

const create = async (payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  return prisma.service.create({
    data: {
      ...payload,
      status: payload.status !== undefined ? Boolean(payload.status) : undefined,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};


const getAll = async (query: Record<string, any>) => {
  const servicesQuery = builderQuery({
    searchFields: ['title', 'description', 'shortDescription'],
    searchTerm: query.searchTerm,
    filter: query.filter ? JSON.parse(query.filter) : {},
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const totalServices = await prisma.service.count({ where: servicesQuery.where });
  const currentPage = Number(query.page) || 1;
  const totalPages = Math.ceil(totalServices / servicesQuery.take);

  const response = await prisma.service.findMany({
    ...servicesQuery,
  });

  return {
    meta: {
      totalItems: totalServices,
      totalPages,
      currentPage,
    },
    data: response,
  };
};

const getById = async (id: string) => {
  return prisma.service.findUniqueOrThrow({ where: { id } });
};


const update = async (id: string, payload: any) => {
  const existing = await prisma.service.findUniqueOrThrow({ where: { id } });
  // If no new image is provided, keep the existing image
  const image = payload.image || existing.image;
  if (!image) {
    throw new Error('Image is required');
  }
  const updated = await prisma.service.update({
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

const deleteService = async (id: string) => {
  const existing = await prisma.service.findUniqueOrThrow({ where: { id } });
  const deleted = await prisma.service.delete({ where: { id } });
  if (existing.image) {
    deleteImageFile(existing.image);
  }
  return deleted;
};

const updateStatus = async (id: string, status: boolean) => {
  return prisma.service.update({
    where: { id },
    data: { status: Boolean(status) },
  });
};

export const ServiceService = {
  create,
  getAll,
  getById,
  update,
  delete: deleteService,
  updateStatus,
};
