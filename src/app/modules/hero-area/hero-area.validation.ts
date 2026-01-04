import { z } from 'zod';

const createHeroSectionValidation = z.object({
  body: z.object({
    subtitle: z.string({ required_error: 'Subtitle is required' }),
    packageTitle: z.string().optional(),
    serviceTitle: z.string().optional(),
    title: z.string({ required_error: 'Title is required' }),
    youtubeUrl: z.string({ required_error: 'YouTube URL is required' }),
    images: z.string().optional(),
  }),
});

const updateHeroSectionValidation = z.object({
  body: z.object({
    subtitle: z.string().optional(),
    packageTitle: z.string().optional(),
    serviceTitle: z.string().optional(),
    title: z.string().optional(),
    youtubeUrl: z.string().optional(),
    images: z.string().optional(),
  }),
});

export const HeroAreaValidation = {
  createHeroSectionValidation,
  updateHeroSectionValidation,
};
