// Example validation file for Gallery (using zod)
import { z } from 'zod';

const createGalleryValidation = z.object({
    imageUrl: z.string({ required_error: 'Image URL is required' }),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const updateGalleryValidation = z.object({
    imageUrl: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const GalleryValidation = {
    createGalleryValidation,
    updateGalleryValidation,
};
