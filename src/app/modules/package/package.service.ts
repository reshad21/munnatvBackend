/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import { deleteImageFile } from '../../utils/deleteFile';

const create = async (payload: any) => {
    return prisma.package.create({
        data: {
            title: payload.title,
            travellPlace: payload.travellPlace,
            country: payload.country,
            maxTravelers: payload.maxTravelers,
            minPax: payload.minPax,
            duration: payload.duration,
            description: payload.description,
            status: payload.status !== undefined ? Boolean(payload.status) : true,
            packageImages: {
                create: payload.packageImages  // Controller already sends [{ image: "url" }]
            }
        },
        include: { packageImages: true },
    });
};

const getAll = async (query: Record<string, any>) => {
    const packageQuery = builderQuery({
        searchFields: ['title', 'description', 'country'],
        searchTerm: query.searchTerm,
        filter: query.filter ? JSON.parse(query.filter) : {},
        orderBy: query.orderBy ? JSON.parse(query.orderBy) : { createdAt: 'desc' },
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
    });

    const totalPackages = await prisma.package.count({ where: packageQuery.where });
    const currentPage = Number(query.page) || 1;
    const totalPages = Math.ceil(totalPackages / packageQuery.take);

    const response = await prisma.package.findMany({
        ...packageQuery,
        include: { packageImages: true },
    });

    return {
        meta: {
            totalItems: totalPackages,
            itemCount: response.length,
            itemsPerPage: packageQuery.take,
            totalPages,
            currentPage,
        },
        data: response,
    };
};

const getById = async (id: string) => {
    return prisma.package.findUnique({ where: { id }, include: { packageImages: true } });
};

const update = async (
    id: string, 
    payload: any, 
    existingImageUrls: string[] = [], 
    newImageUrls: string[] = []
) => {
    // Prepare update data for package
    const updateData: any = {};
    
    if (payload.title) updateData.title = payload.title;
    if (payload.travellPlace) updateData.travellPlace = payload.travellPlace;
    if (payload.country) updateData.country = payload.country;
    if (payload.maxTravelers) updateData.maxTravelers = payload.maxTravelers;
    if (payload.minPax) updateData.minPax = payload.minPax;
    if (payload.duration) updateData.duration = payload.duration;
    if (payload.description) updateData.description = payload.description;
    if (payload.status !== undefined) updateData.status = Boolean(payload.status);

    // Get current package to manage images
    const currentPackage = await prisma.package.findUnique({
        where: { id },
        include: { packageImages: true }
    });

    if (!currentPackage) {
        throw new Error('Package not found');
    }

    // Find images to delete (images that were in DB but not in existingImageUrls)
    const imagesToDelete = currentPackage.packageImages.filter(
        (img) => !existingImageUrls.includes(img.image)
    );

    // Delete removed images from database and filesystem
    for (const img of imagesToDelete) {
        await prisma.packageImage.delete({
            where: { id: img.id }
        });
        deleteImageFile(img.image);
    }

    // Add new images to database
    for (const imageUrl of newImageUrls) {
        await prisma.packageImage.create({
            data: {
                image: imageUrl,
                packageId: id
            }
        });
    }

    // Update package details
    return prisma.package.update({
        where: { id },
        data: updateData,
        include: { packageImages: true },
    });
};

const deletePackage = async (id: string) => {
    // First get the package with images
    const packageData = await prisma.package.findUnique({
        where: { id },
        include: { packageImages: true }
    });

    if (!packageData) {
        throw new Error('Package not found');
    }

    // Delete image files from storage
    for (const img of packageData.packageImages) {
        deleteImageFile(img.image);
    }

    // Delete the package (cascade will handle packageImages)
    return prisma.package.delete({ where: { id } });
};

const packageImageCreate = async (payload: { image: string | null; packageId?: string }) => {
    // If packageId is not provided, find the first package or throw error
    let packageId = payload.packageId;
    
    if (!packageId) {
        const firstPackage = await prisma.package.findFirst();
        if (!firstPackage) {
            throw new Error('No Package found to associate the image with.');
        }
        packageId = firstPackage.id;
    }

    const response = await prisma.packageImage.create({
        data: {
            image: payload.image || '',
            packageId: packageId,
        },
    });

    return response;
};

const deletePackageImage = async (imageId: string) => {
    const existingImage = await prisma.packageImage.findUnique({
        where: { id: imageId },
    });

    if (!existingImage) {
        throw new Error('Image not found');
    }

    const response = await prisma.packageImage.delete({
        where: { id: imageId },
    });

    deleteImageFile(existingImage.image);

    return response;
};


const updateStatus = async (id: string, status: boolean) => {
  return prisma.package.update({
    where: { id },
    data: { status: Boolean(status) },
  });
};

export const PackageService = {
    create,
    getAll,
    getById,
    update,
    delete: deletePackage,
    packageImageCreate,
    deletePackageImage,
    updateStatus,
};