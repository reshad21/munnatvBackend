/* eslint-disable @typescript-eslint/no-explicit-any */

// import { AboutUs, AboutUsImages } from '@prisma/client';
import prisma from '../../../db/db.config';
import { deleteImageFile } from '../../utils/deleteFile';




const createAboutUsIntoDB = async (payload: any) => {
  const response = await prisma.aboutUs.create({
    data: {
      title: payload.title,
      description: payload.description,
      featureTitle1: payload.featureTitle1,
      featureShortDesc1: payload.featureShortDesc1,
      featureTitle2: payload.featureTitle2,
      featureShortDesc2: payload.featureShortDesc2,
      featureTitle3: payload.featureTitle3,
      featureShortDesc3: payload.featureShortDesc3,
      aboutUsImages: {
        create: payload.aboutUsImages,
      },
    },
    include: {
      aboutUsImages: true,
    },
  });
  return response;
};


const getAboutUsFromDB = async () => {
  const response = await prisma.aboutUs.findFirst({
    include: {
      aboutUsImages: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return response;
};


const updateAboutUs = async (
  id: string,
  payload: any,
  existingImageUrls: string[] = [],
  newImageUrls: string[] = []
) => {
  if (!id) {
    throw new Error('AboutUs id is required for update');
  }
  // Prepare update data for AboutUs
  const updateData: any = {};
  if (payload.title) updateData.title = payload.title;
  if (payload.description) updateData.description = payload.description;
  if (payload.featureTitle1) updateData.featureTitle1 = payload.featureTitle1;
  if (payload.featureShortDesc1) updateData.featureShortDesc1 = payload.featureShortDesc1;
  if (payload.featureTitle2) updateData.featureTitle2 = payload.featureTitle2;
  if (payload.featureShortDesc2) updateData.featureShortDesc2 = payload.featureShortDesc2;
  if (payload.featureTitle3) updateData.featureTitle3 = payload.featureTitle3;
  if (payload.featureShortDesc3) updateData.featureShortDesc3 = payload.featureShortDesc3;

  // Get current AboutUs to manage images
  const currentAboutUs = await prisma.aboutUs.findUnique({
    where: { id },
    include: { aboutUsImages: true },
  });

  if (!currentAboutUs) {
    throw new Error('AboutUs not found');
  }

  // Find images to delete (images that were in DB but not in existingImageUrls)
  const imagesToDelete = currentAboutUs.aboutUsImages.filter(
    (img) => !existingImageUrls.includes(img.image)
  );

  // Delete removed images from database and filesystem
  for (const img of imagesToDelete) {
    await prisma.aboutUsImages.delete({
      where: { id: img.id },
    });
    deleteImageFile(img.image);
  }

  // Add new images to database
  for (const imageUrl of newImageUrls) {
    await prisma.aboutUsImages.create({
      data: {
        image: imageUrl,
        aboutUsId: id,
      },
    });
  }

  // Update AboutUs details
  return prisma.aboutUs.update({
    where: { id },
    data: updateData,
    include: { aboutUsImages: true },
  });
};


const addAboutUsImage = async (payload: any) => {
  const existingAboutUs = await prisma.aboutUs.findFirst();
  if (!existingAboutUs) throw new Error('No AboutUs found to associate the image with.');
  const response = await prisma.aboutUsImages.create({
    data: {
      image: payload.image || '',
      aboutUsId: existingAboutUs.id,
    },
  });
  return response;
};


const deleteAboutUsImage = async (imageId: string) => {
  const existingImage = await prisma.aboutUsImages.findUnique({
    where: { id: imageId },
  });
  if (!existingImage) throw new Error('Image not found');
  const response = await prisma.aboutUsImages.delete({
    where: { id: imageId },
  });
  deleteImageFile(existingImage.image);
  return response;
};


export const AboutUsService = {
  createAboutUsIntoDB,
  getAll: getAboutUsFromDB, // for consistency if needed
  getAboutUsFromDB,
  updateAboutUs,
  update: updateAboutUs, // alias for controller pattern
  addAboutUsImage,
  deleteAboutUsImage,
};
