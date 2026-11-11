import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const HOST = 'https://betapixels.studio';

const pages = {
  '/contact-us/': '/contact/',
  '/our-products/': '/products/',
  '/shop/': '/products/',
  '/sample-page/': '/',
  '/my-account/': '/',
  '/cart/': '/',
  '/checkout/': '/',
  '/refund_returns/': '/terms-and-conditions/',
  '/book-an-apointment/': '/contact/',
  '/submit-your-feedback-to-betapixels-studio/': '/contact/',
  '/careers/': '/about/',
  '/professional-photography/': '/packaging-labels/',
  '/service/signage/': '/signage/',
  '/signage-large-format/': '/signage/',
  '/service/branding/': '/corporate-branding/',
  '/service/graphics-design/': '/corporate-branding/',
  '/service/creative-videography/': '/packaging-labels/',
  '/service/professional-photography/': '/packaging-labels/',
  '/service/additional-services/': '/services/',
  '/category/blog/': '/knowledge-centre/',
  '/category/services/': '/services/',
  '/category/uncategorized/': '/knowledge-centre/',
  '/feed/': '/knowledge-centre/',
  '/how-betapixel-studios-creates-stunning-3d-layered-lit-acrylic-artworks-for-your-home-or-office/': '/portfolio/',
  '/welcome-to-betapixel-studios-how-we-capture-your-memories-in-high-quality/': '/portfolio/',
  '/betapixel-studios-the-one-stop-shop-for-all-your-graphic-design-and-printing-needs/': '/about/',
  '/2025-calendar-printing-in-kenya/': '/commercial-printing/',
  '/uv-dtf-magic-stickers/': '/uv-dtf-stickers/',
  '/bulk-printing/': '/commercial-printing/',
  '/banners-large-format/': '/banners/',
  '/t-shirt-printing/': '/custom-apparel/',
  '/promotional-branding/': '/corporate-gifts/',
  '/label-printing/': '/packaging-labels/',
  '/sticker-printing/': '/packaging-labels/',
  '/graphic-design/': '/corporate-branding/',
  '/photography/': '/packaging-labels/',
  '/blog/': '/knowledge-centre/',
  '/sitemap.xml': '/sitemap-index.xml',
  '/sitemap_index.xml': '/sitemap-index.xml',
  '/wp-sitemap.xml': '/sitemap-index.xml',
};

const shop = {
  '/commercial-printing/': ['business-cards', 'business-cards-2', 'posters', 'posters-minimum-200-pieces', 'flyers', 'flyers-minimum-200-pieces', 'brochures', 'brochures-2', 'booklets', 'magazines', 'wedding-cards'],
  '/corporate-gifts/': ['diaries', 'digital-water-bottles', 'plain-digital-water-bottles', 'engraved-digital-water-bottle', 'heartfelt-digital-water-bottle'],
  '/banners/': ['rollup-banners', 'narrow-base-rollup-banner-design-provided', 'wide-base-rollup-banner-design-provided', 'narrow-base-roll-up-banner-plus-design', 'wide-base-rollup-banner-plus-design'],
  '/products/alphabet-colouring-book/': ['betapixels-alphabet-colouring-book'],
  '/custom-apparel/': [
    't-shirts', 'hoodies', 'hoodie_mockup', 'papas-special-day-hoodie', 'your-babe-ill-be', 'astronaut-in-space-personalized-hoodie',
    'sisterly-love-birthday-hoodie', 'cosmic-burst-premium-hoodie', 'happy-birthday-to-you-white', 'darlings-birthday-delight-hoodie',
    'greatest-husband-ever-birthday-hoodie', 'i-am-yours-forever-hoodie', 'moms-birthday-love-hoodie', 'my-girlfriend-birthday-blue',
    'my-boyfriend-birthday-wishes', 'keep-calm-and-hail-at-the-birthday-queen-blue', 'its-my-darling-birthday-pink',
    'i-love-you-happy-birthday-white', 'i-hope-your-day-is-full-of-fun-and-celebration', 'i-am-so-excited-today-is-your-birthday-white',
    'hugs-kisses-and-a-lot-of-birthday-wishes-white', 'hoodie-with-vector-lion-print-red', 'happy-birthday-red',
    'to-my-fabulous-friend-wish-you-have-a-happy-birthday', 'positive-black', 'grafiti-boy', 'she-thinks-she-is-in-charge',
    'she-thinks-she-is-in-charge-couple-combo', 'the-ultimate-deadlifter', 'super-mum', 'the-adventure', 'in-the-storms-of-life',
    'ill-keep-you-safe-white', 'im-in-charge-around-here', 'today-is-my-birthday',
  ],
  '/products/': [
    'mdf-board-frame', 'glass-photo-frames', 'wooden-canvas-frames', 'clear-acrylic-picture-frames', 'woman-on-red-bikini', 'woman-on-red-bikini-2',
    'beautiful-plant-with-bokeh', 'spiderman-and-venom', 'celestial-embrace-hands-holding-the-moon-acrylic-glass-print', 'mahat-magandi',
    'lady-holding-the-moon-in-a-beautiful-evening-background', 'hdr-landscape-kajiado', 'colored-lion-in-black', 'cocounut-landscape',
    'black-rose', 'black-panther', 'black-and-red-rose', 'arabic-caligraphy-peace-be-upon-him', 'african-alephant', 'ord-shiva-nataraja-lord-of-dance',
    'african-elephant-black-and-white-acrylic-print', 'beautiful-high-resolution-cat', 'eternal-love-romantic-sunrise-silhouette', 'the-kaaba',
    'timeless-elegance-vintage-40s-gentleman-acrylic-glass-print', 'beautiful-morning-dusk', 'lord-krishna', 'beautiful-cute-fluffy-love-heart-for-her',
    'arabic-caligraphy-eid-mubarak', 'beautiful-big-moon-silhuoette-with-tree-and-people-viewing-the-landscape', 'old-rustic-ancient-map-of-the-world',
    'woman-with-white-bikini-staring-at-the-sea', 'vintage-rustic-textured-flowers', 'special-portrait-with-red-ribbons-reading-i-love-you',
    'impressionistic-art', 'golden-chess-players-with-silver-king',
    'starey-night-with-lots-of-stars-and-a-beutiful-view-of-the-moon-with-a-tree-silhuoette-in-the-background',
    'flat-earth-concept-of-the-world-with-dome', 'christmas-tree-with-shimmering-boke-of-falling-snow', 'christmas-tree-with-jingles-and-two-hands',
    'ancient-rustic-yellow-simplified-map-of-the-world', 'abstract-wavy-blue-futuristic-art', 'abstract-colorart-with-defined-brush-strokes',
    'woman-with-burning-cash-and-red-lips', 'mahat-magandi-impressionist-artwork-black', 'child-on-a-floating-baloon', 'blue-and-pink-lion-side-profile',
  ],
};

const rows = [];
for (const [from, to] of Object.entries(pages)) rows.push([from, to, 'page']);
for (const [to, slugs] of Object.entries(shop)) for (const s of slugs) rows.push([`/shop/${s}/`, to, 'product']);

const r = (source, destination, extra = {}) => ({ source, destination, statusCode: 301, ...extra });
const redirects = [
  r('/:path*', `${HOST}/:path*`, { has: [{ type: 'host', value: 'www.betapixels.studio' }] }),
  ...rows.map(([f, t]) => r(f, t)),
  r('/:name(.*)-sitemap.xml', '/sitemap-index.xml'),
  r('/shop/:slug/feed/', '/shop/:slug/'),
  r('/:slug/feed/', '/:slug/'),
  r('/shop/(.*)', '/products/'),
  r('/product-category/promotional-materials/(.*)', '/commercial-printing/'),
  r('/product-category/apparells/(.*)', '/custom-apparel/'),
  r('/product-category/apparel/(.*)', '/custom-apparel/'),
  r('/product-category/(.*)', '/'),
  r('/product-tag/(.*)', '/'),
  r('/service/(.*)', '/services/'),
  r('/category/(.*)', '/knowledge-centre/'),
  r('/tag/(.*)', '/knowledge-centre/'),
  r('/author/(.*)', '/about/'),
  r('/blog/:rest(.*)', '/knowledge-centre/:rest'),
  r('/wp-content/(.*)', '/'),
];
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
config.redirects = redirects;
writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');

mkdirSync('docs', { recursive: true });
writeFileSync('docs/redirect-map.csv', ['old_url,new_url,type,status', ...rows.map(([f, t, k]) => `${HOST}${f},${HOST}${t},${k},301`)].join('\n') + '\n');
console.log(`redirects: ${rows.length} explicit rules, ${redirects.length} total in vercel.json`);
