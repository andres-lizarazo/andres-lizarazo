import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Artículos del blog: un archivo .md por artículo en src/blog/. El nombre del archivo es la URL (/blog/<nombre>).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/blog' }),
  schema: z.object({
    title: z.string().max(110),
    description: z.string().min(70).max(170),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    keyword: z.string(),
    readingMinutes: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
