export type ArtKey =
  | 'magic-stickers' | 'promotional-branding' | 't-shirt-printing' | 'sticker-printing'
  | 'banners-large-format' | 'signage' | 'bulk-printing' | 'label-printing' | 'book-publishing'
  | 'graphic-design' | 'photography' | 'commercial-printing' | 'corporate-branding' | 'events-exhibitions';

export type Group = 'print' | 'brand' | 'publishing';

export interface Service {
  slug: string;
  name: string;
  menu: string;
  slide: string;
  line: string;
  keyword: string;
  secondary: string[];
  title: string;
  description: string;
  art: ArtKey;
  alt?: string;
  group: Group;
}

export const services: Service[] = [
  {
    slug: 'uv-dtf-stickers', name: 'UV DTF Stickers', menu: 'Also known as Magic Stickers & 3D Crystal Labels',
    slide: 'UV DTF Stickers', line: 'Magic stickers and 3D crystal labels for bottles, glass, metal and acrylic, from half a metre of film.',
    keyword: 'UV DTF stickers Kenya', secondary: ['magic stickers Nairobi', '3D crystal labels Kenya', 'UV DTF printing Nairobi'],
    title: 'UV DTF Stickers Kenya: Magic Stickers & 3D Crystal Labels',
    description: 'UV DTF stickers, also called magic stickers and 3D crystal labels, printed in Nairobi. Raised-gloss transfers for bottles, glass, metal and acrylic.',
    art: 'magic-stickers', group: 'print',
  },
  {
    slug: 'commercial-printing', name: 'Commercial Printing', menu: 'Business cards, flyers, brochures, profiles',
    slide: 'Commercial Printing', line: 'Business cards, flyers, brochures, company profiles, menus and stationery.',
    keyword: 'commercial printing Nairobi', secondary: ['business card printing Nairobi', 'flyer printing Nairobi', 'brochure printing Kenya'],
    title: 'Printing Services in Nairobi: Business Cards & Flyers',
    description: 'Commercial printing in Nairobi: business cards, flyers, brochures, company profiles, menus, calendars and NCR books, proofed first and delivered across Kenya.',
    art: 'commercial-printing', group: 'print',
  },
  {
    slug: 'signage', name: 'Signage', menu: 'Shop signs, 3D letters, offices, vehicles',
    slide: 'Signage', line: 'Shop signs, 3D and illuminated letters, office, window and vehicle branding, made and installed.',
    keyword: 'shop signs and signage Nairobi', secondary: ['3D letter signs Nairobi', 'illuminated signs Kenya', 'vehicle branding Nairobi', 'office branding Nairobi'],
    title: 'Shop Signs, 3D & Illuminated Signage Nairobi | Betapixel',
    description: 'Signage in Nairobi: shop signs, 3D and illuminated letters, acrylic and ACP signboards, office branding, window graphics, vehicle wraps and customised mirrors.',
    art: 'signage', group: 'print',
  },
  {
    slug: 'banners', name: 'Media Banners & Roll-Ups', menu: 'Media banners, roll-ups, PVC banners, flags',
    slide: 'Media Banners & Roll-Ups', line: 'Media and backdrop banners, broad- and narrow-base roll-ups, PVC and backlit banners and flags.',
    keyword: 'media banners and roll-up banners Nairobi', secondary: ['backdrop banners Nairobi', 'roll up banners Kenya', 'banner printing Nairobi', 'teardrop flags Nairobi'],
    title: 'Media Banners & Roll-Up Banners in Nairobi | Betapixel',
    description: 'Media and backdrop banners in three sizes, broad- and narrow-base roll-ups, PVC and backlit banners and teardrop flags, printed in Nairobi with stands included.',
    art: 'banners-large-format', group: 'print',
  },
  {
    slug: 'custom-apparel', name: 'Custom Apparel & Corporate Wear', menu: 'T-shirts, polos, uniforms, embroidery',
    slide: 'T-Shirts & Uniforms', line: 'T-shirts, polos, hoodies, caps and uniforms, printed or embroidered.',
    keyword: 't-shirt printing Nairobi', secondary: ['corporate wear Kenya', 'embroidery Nairobi', 'custom t-shirts Kenya', 'staff uniforms Nairobi'],
    title: 'T-Shirt Printing & Corporate Wear Nairobi | Betapixel',
    description: 'T-shirt printing and corporate wear in Nairobi: branded T-shirts, polos, hoodies, caps and uniforms with DTF, embroidery and screen printing, from one piece.',
    art: 't-shirt-printing', group: 'print',
  },
  {
    slug: 'corporate-gifts', name: 'Promotional Merchandise & Corporate Gifts', menu: 'Bottles, flasks, mugs, gift boxes',
    slide: 'Corporate Gifts', line: 'Branded bottles, flasks, mugs, notebooks and complete gift boxes.',
    keyword: 'corporate gifts Nairobi', secondary: ['branded water bottles Nairobi', 'promotional merchandise Kenya', 'branded mugs Nairobi'],
    title: 'Corporate Gifts & Branded Merchandise Nairobi | Betapixel',
    description: 'Corporate gifts in Nairobi: branded water bottles, flasks, mugs, notebooks, pens, tote bags, awards and gift boxes, personalised with names and logos.',
    art: 'promotional-branding', group: 'print',
  },
  {
    slug: 'packaging-labels', name: 'Packaging & Product Labels', menu: 'Labels, boxes, sleeves, hang tags',
    slide: 'Labels & Packaging', line: 'Bottle, food and cosmetic labels, boxes, sleeves and hang tags.',
    keyword: 'product labels and packaging Nairobi', secondary: ['label printing Kenya', 'sticker printing Nairobi', 'custom packaging Kenya', 'product photography Nairobi'],
    title: 'Label, Sticker & Packaging Printing Nairobi | Betapixel',
    description: 'Product labels and packaging in Nairobi: bottle, food and cosmetic labels, stickers, boxes, sleeves, hang tags and paper bags, with barcodes and design.',
    art: 'label-printing', group: 'print',
  },
  {
    slug: 'book-publishing', name: 'Book Publishing', menu: 'Typesetting, covers, short-run book printing',
    slide: 'Book Publishing', line: 'Typesetting, covers and short-run printing. We publish our own books too.',
    keyword: 'book printing Kenya', secondary: ['self publishing Kenya', 'book printers Nairobi'],
    title: 'Book Printing & Self-Publishing in Kenya | Betapixel',
    description: 'Book printing and self-publishing in Kenya: typesetting, cover design, ISBN guidance and short-run printing from a Nairobi studio that publishes its own books.',
    art: 'book-publishing', group: 'publishing',
  },
  {
    slug: 'corporate-branding', name: 'Corporate Branding', menu: 'Offices, retail, fleets, graphic design',
    slide: 'Corporate Branding', line: 'Offices, shops, fleets and uniforms under one consistent identity.',
    keyword: 'corporate branding Nairobi', secondary: ['office branding Nairobi', 'graphic design company Nairobi', 'brand identity design Kenya'],
    title: 'Corporate & Office Branding Company Nairobi | Betapixel',
    description: 'Corporate branding in Nairobi: office and reception branding, signage, uniforms, stationery and fleet graphics, with graphic design and brand guidelines.',
    art: 'corporate-branding', group: 'brand',
  },
  {
    slug: 'events-exhibitions', name: 'Events & Exhibitions', menu: 'Backdrops, expo stands, delegate packs',
    slide: 'Events & Exhibitions', line: 'Backdrops, media walls, expo stands, badges and delegate packs.',
    keyword: 'event and exhibition branding Nairobi', secondary: ['exhibition stands Nairobi', 'event backdrops Nairobi', 'media wall printing Kenya'],
    title: 'Event & Exhibition Branding in Nairobi | Betapixel',
    description: 'Event and exhibition branding in Nairobi: stage backdrops, media walls, expo stands, roll-up banners, lanyards, badges and event merchandise, set up on time.',
    art: 'events-exhibitions', group: 'brand',
  },
];

export const serviceBySlug = (slug: string) => {
  const s = services.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service: ${slug}`);
  return s;
};
export const servicePath = (slug: string) => `/${slug}/`;
export const byGroup = (g: Group) => services.filter((s) => s.group === g);

export const menuGroups: { label: string; group: Group }[] = [
  { label: 'Print & Production', group: 'print' },
  { label: 'Brand Solutions', group: 'brand' },
  { label: 'Publishing', group: 'publishing' },
];

export const marqueeItems = ['UV DTF Stickers', 'Signage', 'Corporate Gifts', 'T-Shirts & Uniforms', 'Labels & Packaging', 'Events', 'Book Publishing'];
