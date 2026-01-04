import { z } from 'zod';

const createOtherAboutUsValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    experienceYears: z.string({ required_error: 'Experience years is required' }),
    trustedReviews: z.string({ required_error: 'Trusted reviews is required' }),
    servicesProvided: z.string({ required_error: 'Services provided is required' }),
    image: z.string().optional(),
  }),
});

const updateOtherAboutUsValidation = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    experienceYears: z.string().optional(),
    trustedReviews: z.string().optional(),
    servicesProvided: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const OtherAboutUsValidation = {
  createOtherAboutUsValidation,
  updateOtherAboutUsValidation,
};
