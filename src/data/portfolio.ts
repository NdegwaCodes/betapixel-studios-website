import type { ImageMetadata } from 'astro';
import type { ArtKey } from './services';
import { products } from './products';
import { services } from './services';
import { samples, realSamples, type Video } from './work';

export interface Category { id: string; name: string; service: string }

export const categories: Category[] = services.flatMap((s) => (s.slug === 'signage'
  ? [{ id: 'signage', name: s.name, service: s.slug }, { id: 'customised-mirrors', name: 'Customised Mirrors', service: s.slug }]
  : [{ id: s.slug, name: s.name, service: s.slug }]));

export interface Work {
  title: string;
  service: string;
  category: string;
  art?: ArtKey;
  photo?: ImageMetadata;
  caption: string;
  spec: string;
  href?: string;
  real?: boolean;
  onSite?: boolean;
  video?: Video;
}

export const work: Work[] = [
  ...[...realSamples, ...samples].map((x) => ({ title: x.title, service: x.service, category: x.category ?? x.service, photo: x.src, caption: x.alt, spec: x.spec, onSite: x.onSite, video: x.video })),
  ...products.map((p) => ({
    title: p.name, service: 'book-publishing', category: 'book-publishing', photo: p.images[0].src, caption: p.images[0].alt,
    spec: `Designed, printed & published by Betapixel · ${p.specs.find((s) => s.label === 'Size')?.value ?? ''}`,
    href: `/products/${p.slug}/`, real: true,
  })),
];

export const categoryById = (id: string) => categories.find((c) => c.id === id)!;
