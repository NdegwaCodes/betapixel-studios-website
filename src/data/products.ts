import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/products/*.{png,webp}', { eager: true });
const img = (name: string) => {
  const hit = Object.entries(files).find(([p]) => p.split('/').pop()!.startsWith(name + '.'));
  if (!hit) throw new Error(`Missing product image: ${name}`);
  return hit[1].default;
};

export interface ProductImage { src: ImageMetadata; alt: string; dark?: boolean }
export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  category: 'Colouring Books';
  audience: 'Children' | 'Adults';
  short: string;
  about: string[];
  inside: string[];
  whoFor: string[];
  specs: { label: string; value: string }[];
  images: ProductImage[];
  buyUrl: string;
  title: string;
  description: string;
}

const nuria = (path: string) => `https://nuriakenya.com/product/${path}/?utm_source=betapixels.studio&utm_medium=referral&utm_campaign=betapixel-products`;

export const products: Product[] = [
  {
    slug: 'alphabet-colouring-book',
    name: 'Betapixel’s Alphabet Colouring Book',
    subtitle: 'Learn · Colour · Create',
    tagline: 'Learn. Colour. Create.',
    category: 'Colouring Books',
    audience: 'Children',
    short: 'A fun and creative introduction to the alphabet, designed to make learning more engaging through letter tracing, colouring and activity.',
    about: [
      'Betapixel’s Alphabet Colouring Book turns the alphabet into something children can hold, trace and colour. Every letter gets its own spread: a page of tracing practice for the capital and small letter, and a friendly character to colour beside it: A for Ant, U for Umbrella, O for Octopus.',
      'It was written, illustrated, designed and printed by the Betapixel team in Nairobi, as part of our own growing collection of publications.',
    ],
    inside: [
      'Letter tracing rows for every capital and small letter, with dotted guides.',
      'A “Colour me” picture for each letter, with a small coloured example to follow.',
      'A maze game on the back cover: help the hen find her nest.',
      'A “This book belongs to” line on the cover, so it becomes the child’s own.',
    ],
    whoFor: ['Children learning their letters', 'Parents and guardians looking for screen-free learning', 'Pre-schools and early-years classrooms', 'Gift bags, birthdays and holiday activity packs'],
    specs: [
      { label: 'Format', value: 'Paperback, saddle-stitched' },
      { label: 'Size', value: 'A4 (210 × 297 mm)' },
      { label: 'Audience', value: 'Children' },
      { label: 'Publisher', value: 'Betapixel Studios LTD, Nairobi' },
    ],
    images: [
      { src: img('alphabet-colouring-book-cover'), alt: 'Front cover of Betapixel’s Alphabet Colouring Book with a smiling purple octopus for the letter O' },
      { src: img('alphabet-colouring-book-front-and-back-cover'), alt: 'Front and back covers of the Alphabet Colouring Book; the back cover has a maze game titled Help me find my nest' },
      { src: img('alphabet-colouring-book-letter-a-tracing-page'), alt: 'Inside spread with rows of A and a tracing practice and an ant to colour' },
      { src: img('alphabet-colouring-book-letter-u-tracing-page'), alt: 'Inside spread with U and u tracing practice and a smiling umbrella to colour' },
    ],
    buyUrl: nuria('betapixels-alphabet-colouring-book'),
    title: 'Alphabet Colouring Book for Kids | Betapixel',
    description: 'Betapixel’s Alphabet Colouring Book: A4 letter tracing and colouring for children, a picture for every letter and a maze on the back. Made in Nairobi.',
  },
  {
    slug: 'mindful-colouring-pocket-edition',
    name: 'Mindful Colouring – Pocket Edition',
    subtitle: 'Adult Colouring Book · Volume 1',
    tagline: 'A little space to slow down.',
    category: 'Colouring Books',
    audience: 'Adults',
    short: 'A compact adult colouring book created for quiet moments of creativity, relaxation and mindful colouring, small enough to take anywhere.',
    about: [
      'Mindful Colouring – Pocket Edition is a small book, by design: small enough to slip into a bag, and to open whenever the world feels loud. There are no instructions to follow and no finish line.',
      'Detailed florals, blossoms and a peacock in full display are paired with short, quiet lines on the facing pages: “This page offers a pause, not a task” and “You don’t need to finish, just begin.”',
    ],
    inside: [
      'Detailed line illustrations: florals, blossom branches and a peacock.',
      'Each illustration faces a calm, near-blank page with a single mindful line.',
      'A short prologue that sets the tone: there is no right way to colour these pages.',
      'Kraft-style back cover, printed and bound in Nairobi.',
    ],
    whoFor: ['Adults looking for a screen-free way to unwind', 'Commuters and travellers (it fits in a bag)', 'Thoughtful gifts for friends, colleagues and clients', 'Wellness corners, cafés and quiet workplaces'],
    specs: [
      { label: 'Format', value: 'Paperback' },
      { label: 'Size', value: '14 × 21 cm (pocket edition)' },
      { label: 'Series', value: 'Volume 1' },
      { label: 'Audience', value: 'Adults' },
      { label: 'Publisher', value: 'Betapixel Studios LTD, Nairobi' },
    ],
    images: [
      { src: img('mindful-colouring-pocket-edition-isometric'), alt: 'Three copies of Mindful Colouring Pocket Edition Volume 1, with the peacock cover illustration' },
      { src: img('mindful-colouring-pocket-edition-front-and-back-cover'), alt: 'Front and kraft-style back cover of Mindful Colouring Pocket Edition', dark: true },
      { src: img('mindful-colouring-peacock-colouring-page'), alt: 'Open spread with a detailed peacock line illustration and the line This page offers a pause, not a task', dark: true },
      { src: img('mindful-colouring-floral-colouring-page'), alt: 'Open spread with a dense lily pattern to colour and the line You don’t need to finish, just begin' },
      { src: img('mindful-colouring-prologue-page'), alt: 'The prologue page of Mindful Colouring Pocket Edition' },
      { src: img('mindful-colouring-pocket-edition-cover-stack'), alt: 'Stacked copies of Mindful Colouring Pocket Edition seen from the front' },
    ],
    buyUrl: nuria('mindful-colouring-pocket-edition-adult-colouring-book-volume-1'),
    title: 'Mindful Colouring Pocket Edition – Adult Colouring Book',
    description: 'Mindful Colouring – Pocket Edition, Volume 1: a 14 × 21 cm adult colouring book of detailed florals and a peacock, designed and printed in Nairobi.',
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
