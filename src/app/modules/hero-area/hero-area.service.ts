/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';

const create = async (payload: any) => {
  // Create HeroSection with images
  return prisma.heroSection.create({
    data: {
      subtitle: payload.subtitle,
      title: payload.title,
      youtubeUrl: payload.youtubeUrl,
      packageTitle: payload.packageTitle,
      serviceTitle: payload.serviceTitle,
      images: {
        create: payload.images || [], // [{ image: "url" }]
      },
    },
    include: { images: true },
  });
};

const getAll = async () => {
  return prisma.heroSection.findMany({
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id: string) => {
  return prisma.heroSection.findUniqueOrThrow({
    where: { id },
    include: { images: true },
  });
};

const update = async (
  id: string,
  payload: any,
  existingImageUrls: string[] = [],
  newImageUrls: string[] = []
) => {
  // Prepare update data for HeroSection
  const updateData: any = {};
  if (payload.subtitle) updateData.subtitle = payload.subtitle;
  if (payload.title) updateData.title = payload.title;
  if (payload.description) updateData.description = payload.description;
  if (payload.youtubeUrl) updateData.youtubeUrl = payload.youtubeUrl;
  if (payload.packageTitle) updateData.packageTitle = payload.packageTitle;
  if (payload.serviceTitle) updateData.serviceTitle = payload.serviceTitle;

  // Get current HeroSection to manage images
  const currentHero = await prisma.heroSection.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!currentHero) throw new Error('HeroSection not found');

  // Find images to delete (images that were in DB but not in existingImageUrls)
  const imagesToDelete = currentHero.images.filter(
    (img) => !existingImageUrls.includes(img.image)
  );
  for (const img of imagesToDelete) {
    await prisma.heroImages.delete({ where: { id: img.id } });
    // Optionally delete image file from storage if needed
  }

  // Add new images to database
  for (const imageUrl of newImageUrls) {
    await prisma.heroImages.create({
      data: {
        image: imageUrl,
        heroSectionId: id,
      },
    });
  }

  // Update HeroSection details
  return prisma.heroSection.update({
    where: { id },
    data: updateData,
    include: { images: true },
  });
};

const deleteHeroSection = async (id: string) => {
  // Delete all images first
  const hero = await prisma.heroSection.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!hero) throw new Error('HeroSection not found');
  for (const img of hero.images) {
    await prisma.heroImages.delete({ where: { id: img.id } });
    // Optionally delete image file from storage if needed
  }
  return prisma.heroSection.delete({ where: { id } });
};

export const HeroAreaService = {
  create,
  getAll,
  getById,
  update,
  delete: deleteHeroSection,
};
