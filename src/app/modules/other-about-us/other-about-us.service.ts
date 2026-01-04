/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';

const create = async (payload: any) => {
  if (!payload.image) {
    throw new Error('Image is required');
  }
  // Check if a OthersAboutSection record already exists
  const existing = await prisma.othersAboutSection.findFirst();
  if (existing) {
    // If exists, update the existing record
    return prisma.othersAboutSection.update({
      where: { id: existing.id },
      data: {
        ...payload,
        image: payload.image || existing.image,
      },
    });
  }
  // If not exists, create new
  return prisma.othersAboutSection.create({
    data: {
      ...payload,
      id: payload.id ? String(payload.id) : undefined,
    },
  });
};


const getOtherAboutUsFromDB = async () => {
  const response = await prisma.othersAboutSection.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  return response;
};

const getById = async (id: string) => {
  return prisma.othersAboutSection.findUniqueOrThrow({ where: { id } });
};

const update = async (id: string, payload: any) => {
  const existing = await prisma.othersAboutSection.findUniqueOrThrow({ where: { id } });
  // If no new image is provided, keep the existing image
  const image = payload.image || existing.image;
  if (!image) {
    throw new Error('Image is required');
  }
  return prisma.othersAboutSection.update({
    where: { id },
    data: {
      ...payload,
      image,
    },
  });
};

const deleteOtherAboutUs = async (id: string) => {
  return prisma.othersAboutSection.delete({ where: { id } });
};

export const OtherAboutUsService = {
  create,
  getOtherAboutUsFromDB,
  getById,
  update,
  delete: deleteOtherAboutUs,
};
