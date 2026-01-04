import { z } from 'zod';

const createPackageValidation = z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    duration: z.string({ required_error: 'Duration is required' }),
    country: z.string({ required_error: 'Country is required' }),
    maxTravelers: z.string({ required_error: 'Max travelers is required' }),
    minPax: z.string({ required_error: 'Min pax is required' }),
    status: z.string().optional(),
});

const updatePackageValidation = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    country: z.string().optional(),
    maxTravelers: z.string().optional(),
    minPax: z.string().optional(),
    status: z.string().optional(),
});

export const PackageValidation = {
    createPackageValidation,
    updatePackageValidation,
};
