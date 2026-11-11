import type { ImageMetadata } from 'astro';
import type { ArtKey } from '../data/services';
import { artImage } from '../data/work';

export const art = Object.fromEntries(Object.entries(artImage).map(([k, v]) => [k, v.src])) as Record<ArtKey, ImageMetadata>;
export const artAlt = (key: ArtKey) => artImage[key].alt;

export const WIDTHS = [640, 1024, 1600];
