import z from 'zod';


export const createVideoGallerySchema = z.object({
  body: z.object({
    title: z.string(),
    videoUrl: z.string().url({ message: 'Invalid video URL' }),
    status: z.string({ required_error: 'Status is required' }),
  }),
});


export const updateVideoGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    videoUrl: z.string().url({ message: 'Invalid video URL' }).optional(),
    status: z.string().optional(),
  }),
});
