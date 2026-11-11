import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const guideCategories = ['UV DTF', 'Printing', 'Packaging & Labels', 'Signage', 'Apparel', 'Branding', 'Artwork & Design'] as const;

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().max(60),
    headline: z.string(),
    description: z.string().min(120).max(160),
    keyword: z.string(),
    category: z.enum(guideCategories),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    art: z.enum(['magic-stickers', 'promotional-branding', 't-shirt-printing', 'sticker-printing', 'banners-large-format', 'bulk-printing', 'label-printing', 'book-publishing', 'graphic-design', 'photography', 'commercial-printing', 'corporate-branding', 'events-exhibitions']),
    service: z.string(),
    image: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
  }),
});

export const collections = { guides };
