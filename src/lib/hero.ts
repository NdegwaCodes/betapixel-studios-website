import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { WIDTHS } from './art';

export const HERO_SIZES = '100vw';

export async function heroSources(src: ImageMetadata) {
  const build = async (format: 'avif' | 'webp') => {
    const imgs = await Promise.all(WIDTHS.map((w) => getImage({ src, width: w, format, quality: format === 'avif' ? 55 : 72 })));
    return imgs.map((im, i) => `${im.src} ${WIDTHS[i]}w`).join(', ');
  };
  const fallback = await getImage({ src, width: 1600, format: 'webp', quality: 72 });
  return { avif: await build('avif'), webp: await build('webp'), fallback: fallback.src, width: src.width, height: src.height };
}

export const MOBILE_MEDIA = '(max-width: 767px)';
const MOBILE_WIDTHS = [480, 720, 940];

export async function heroMobileSources(src: ImageMetadata) {
  const widths = MOBILE_WIDTHS.filter((w) => w <= src.width);
  const build = async (format: 'avif' | 'webp') => {
    const imgs = await Promise.all(widths.map((w) => getImage({ src, width: w, format, quality: format === 'avif' ? 55 : 72 })));
    return imgs.map((im, i) => `${im.src} ${widths[i]}w`).join(', ');
  };
  return { avif: await build('avif'), webp: await build('webp') };
}
