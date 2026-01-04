import { z } from 'zod';

const createAboutUsValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }),
  }),
});

const updateAboutUsValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }),
  }),
});

export const AboutUsValidation = {
  createAboutUsValidation,
  updateAboutUsValidation,
};
