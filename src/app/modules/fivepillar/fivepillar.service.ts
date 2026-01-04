import prisma from '../../../db/db.config';
import { deleteImageFile } from '../../utils/deleteFile';
import { builderQuery } from '../../builders/prismaBuilderQuery';

const create = async (payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  return prisma.fivePillar.create({
    data: {
      ...payload,
      order: Number(payload.order),
      status:
        payload.status !== undefined ? Boolean(payload.status) : undefined,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};

const getAll = async (query: Record<string, any>) => {
  const pillarsQuery = builderQuery({
    searchFields: ['title', 'description'],
    searchTerm: query.searchTerm,
    filter: query.filter ? JSON.parse(query.filter) : {},
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : { order: 'asc' },
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const totalPillars = await prisma.fivePillar.count({
    where: pillarsQuery.where,
  });
  const currentPage = Number(query.page) || 1;
  const totalPages = Math.ceil(totalPillars / pillarsQuery.take);

  const response = await prisma.fivePillar.findMany({
    ...pillarsQuery,
  });

  return {
    meta: {
      totalItems: totalPillars,
      totalPages,
      currentPage,
    },
    data: response,
  };
};

const getById = async (id: string) => {
  return prisma.fivePillar.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  const existing = await prisma.fivePillar.findUniqueOrThrow({
    where: { id },
  });
  const updated = await prisma.fivePillar.update({
    where: { id },
    data: {
      ...payload,
      order: payload.order !== undefined ? Number(payload.order) : undefined,
      status:
        payload.status !== undefined ? Boolean(payload.status) : undefined,
    },
  });
  if (payload.image && existing.image && existing.image !== payload.image) {
    deleteImageFile(existing.image);
  }
  return updated;
};

const deletePillar = async (id: string) => {
  const existing = await prisma.fivePillar.findUniqueOrThrow({
    where: { id },
  });
  const deleted = await prisma.fivePillar.delete({ where: { id } });
  if (existing.image) {
    deleteImageFile(existing.image);
  }
  return deleted;
};

const updateStatus = async (id: string, status: boolean) => {
  const updated = await prisma.fivePillar.update({
    where: { id: String(id) },
    data: { status: Boolean(status) },
  });
  return updated;
};

export const FivePillarService = {
  create,
  getAll,
  getById,
  update,
  delete: deletePillar,
  updateStatus,
};
