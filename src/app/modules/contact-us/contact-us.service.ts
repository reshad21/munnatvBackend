/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';

const create = async (payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  // Check if a ContactUs record already exists
  const existing = await prisma.contactUs.findFirst();
  if (existing) {
    // If exists, update the existing record
    return prisma.contactUs.update({
      where: { id: existing.id },
      data: {
        ...payload,
        image: payload.image || existing.image,
      },
    });
  }
  // If not exists, create new
  return prisma.contactUs.create({
    data: {
      ...payload,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};

const getAll = async (query: Record<string, any>) => {
  const contactUsQuery = builderQuery({
    searchFields: [
      'subTitle',
      'title',
      'companyNumber',
      'companyEmail',
      'companyLocation',
      'facebookUrl',
      'instagramUrl',
      'youtubeUrl',
      'image',
    ],
    searchTerm: query.searchTerm,
    filter: query.filter ? JSON.parse(query.filter) : {},
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const totalItems = await prisma.contactUs.count({ where: contactUsQuery.where });
  const currentPage = Number(query.page) || 1;
  const totalPages = Math.ceil(totalItems / contactUsQuery.take);

  const data = await prisma.contactUs.findMany({
    ...contactUsQuery,
  });

  return {
    meta: {
      totalItems,
      totalPages,
      currentPage,
    },
    data,
  };
};

const getById = async (id: string) => {
  return prisma.contactUs.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
  const existing = await prisma.contactUs.findUniqueOrThrow({ where: { id } });
  // If no new image is provided, keep the existing image
  const image = payload.image || existing.image;
  if (!image) {
    throw new Error('Image is required');
  }
  return prisma.contactUs.update({
    where: { id },
    data: {
      ...payload,
      image,
    },
  });
};

const deleteContactUs = async (id: string) => {
  return prisma.contactUs.delete({ where: { id } });
};

export const ContactUsService = {
  create,
  getAll,
  getById,
  update,
  delete: deleteContactUs,
};
