import { z } from 'zod';

const createServiceValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    shortDescription: z.string({ required_error: 'Short description is required' }),
    description: z.string({ required_error: 'Description is required' }),
    image: z.string().optional(),
    status: z.string({ required_error: 'Status is required' }),
  }),
});

const updateServiceValidation = z.object({
  body: z.object({
    title: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const ServiceValidation = {
  createServiceValidation,
  updateServiceValidation,
};
