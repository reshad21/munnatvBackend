// ContactUs Validation
import { z } from 'zod';

const create = z.object({
  body: z.object({
    subTitle: z.string(),
    title: z.string(),
    companyNumber: z.string(),
    companyEmail: z.string().email(),
    companyLocation: z.string(),
    facebookUrl: z.string().url(),
    instagramUrl: z.string().url(),
    youtubeUrl: z.string().url(),
    image: z.string().optional(),
  }),
});

const update = create.partial();

export default { create, update };
