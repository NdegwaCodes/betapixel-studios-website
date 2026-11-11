import type { ImageMetadata } from 'astro';
import videoMeta from './videos.json';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/work/**/*.webp', { eager: true });
const img = (name: string, dir = '') => {
  const f = files[`../assets/work/${dir}${name}.webp`];
  if (!f) throw new Error(`Missing work image: ${dir}${name}.webp (run python scripts/work-images.py)`);
  return f.default;
};

export interface WorkImage { src: ImageMetadata; alt: string; caption: string }
export interface Video { src: string; duration: number; date: string; width: number; height: number }
export interface Sample extends WorkImage { title: string; service: string; spec: string; category?: string; onSite?: boolean; video?: Video }

const LOCAL: Record<string, string> = {
  'uv-dtf-stickers': 'UV DTF magic stickers printed in Nairobi',
  'commercial-printing': 'commercial printing in Nairobi',
  'signage': 'signage made in Nairobi',
  'banners': 'banner printing in Nairobi',
  'custom-apparel': 'T-shirt printing and branding in Nairobi',
  'corporate-gifts': 'corporate gifts branded in Nairobi',
  'packaging-labels': 'label and packaging printing in Nairobi',
  'book-publishing': 'book printing in Nairobi',
  'corporate-branding': 'corporate branding in Nairobi',
  'events-exhibitions': 'event branding in Nairobi',
  'customised-mirrors': 'customised mirrors made in Nairobi',
};
const keyFor = (name: string) => {
  if (name.startsWith('signage-large-format')) return /roll-up|banner/.test(name) ? 'banners' : 'signage';
  return Object.keys(LOCAL).find((k) => name.startsWith(`${k}-`)) ?? '';
};
const localAlt = (key: string, alt: string) =>
  !LOCAL[key] || /nairobi|kenya/i.test(alt) ? alt : `${alt.replace(/[.\s]+$/, '')}, ${LOCAL[key]}`;

const g = (name: string, alt: string, caption: string): WorkImage => ({ src: img(name), alt: localAlt(keyFor(name), alt), caption });
export const G = {
  uvPrinter: g('uv-dtf-stickers-printer-full-colour-transfers', 'UV DTF printer printing a sheet of full-colour sticker designs onto clear transfer film', 'Full-colour UV DTF transfers coming off the printer, ready to cut and apply.'),
  uvPeel: g('uv-dtf-stickers-peel-off-logo-on-leather-notebook', 'Hand peeling the clear film off a raised, glossy UV DTF logo on a black leather notebook', 'The transfer film peels away and only the raised logo stays on the notebook.'),
  bottles: g('uv-dtf-stickers-branded-water-bottles-and-tumbler', 'Black steel water bottle, white bamboo-lid bottle and steel travel tumbler branded with colourful UV DTF sticker designs', 'Water bottles and a travel tumbler branded with UV DTF magic stickers.'),
  gifts: g('corporate-gifts-executive-gift-boxes', 'Two executive corporate gift boxes with branded notebooks, pens, keyrings, a water bottle and a card holder, beside a leather notebook with a logo', 'Executive gift boxes: notebook, pen, keyring and bottle, all in the client’s brand colours.'),
  drinkware: g('corporate-gifts-branded-mugs-cups-and-tumblers', 'Branded ceramic mugs, printed plastic drinks cups, a clear glass and a patterned steel tumbler for cafés and companies', 'Mugs, cups, glassware and tumblers branded for cafés, restaurants and companies.'),
  notebooks: g('corporate-gifts-custom-branded-notebooks', 'Custom spiral notebooks with full-colour printed covers and branded inner pages for a company and a tech conference', 'Custom notebooks: printed covers plus a logo and contact band on every page.'),
  notebookIn: g('corporate-gifts-notebook-branded-inner-pages', 'Open spiral notebooks showing ruled inner pages with a company logo header and a printed contact footer', 'Branded inner pages keep the logo in front of the user every day.'),
  cards: g('commercial-printing-business-cards', 'Stacks of printed business cards in different finishes, including metallic, black, rounded-corner and QR code cards (contact details blurred)', 'Business cards in metallic, matte, rounded-corner and QR designs. Contact details blurred for privacy.'),
  menus: g('commercial-printing-restaurant-menus-and-table-tents', 'Printed restaurant menu covers and QR code table tent cards for cafés and restaurants in Nairobi', 'Menu covers and scan-to-order QR table tents for restaurants and cafés.'),
  magazines: g('book-publishing-school-magazine-and-graduation-booklet', 'Printed school magazine, strategic plan booklet and graduation booklet with full-colour photographs', 'School magazine and graduation booklet, designed and printed for schools and colleges.'),
  rollups: g('signage-large-format-roll-up-banners', 'Five printed roll-up banners on silver stands for a training authority, restaurants, a book launch and a fashion brand', 'Roll-up banners for training, food, retail and book-launch campaigns.'),
  flags: g('events-exhibitions-flags-and-pop-up-banners', 'Branded pole flags, feather flags, a teardrop flag, desk flags and a pop-up A-frame banner for events', 'Pole, feather, teardrop and desk flags plus a pop-up banner for events and exhibitions.'),
  hoodies: g('custom-apparel-branded-hoodies', 'Printed hoodies in charcoal, tan, cream and black with front and back logo designs for brands and cafés', 'Branded hoodies with front and back prints for a coffee brand, a ministry and a restaurant.'),
  calendars: g('commercial-printing-wall-and-desk-calendars', 'Printed three-month wall calendar beside three branded desk calendars for property, agribusiness and auto-parts companies', 'Wall and desk calendars that keep a brand on the wall and the desk all year.'),
  deskCalendars: g('commercial-printing-desk-calendars', 'Three spiral-bound desk calendars on tent stands, each with a company photo, monthly grid and contact band', 'Desk calendars with a photo, a monthly grid and the company’s contacts on every page.'),
  menuCovers: g('commercial-printing-menu-covers-and-food-table-tents', 'Printed drinks menu, restaurant menu covers, a laminated menu card and two food photo table tents for Nairobi cafés and restaurants', 'Menu covers, a laminated menu card and food photo table tents for cafés, lounges and restaurants.'),
  labels: g('packaging-labels-bottle-jar-and-juice-labels', 'Printed product labels on a hair-oil bottle, a hair-food jar, ginger-honey drinks and cold-pressed juice bottles, with loose die-cut labels in front', 'Product labels for cosmetics, drinks and agricultural products, shown on the pack and as loose die-cut labels.'),
  procArtwork: g('uv-dtf-stickers-process-artwork-preparation', 'UV DTF artwork being prepared in design software: a ceremonial declaration cover laid out with fonts, colours and spacing checked before printing', 'Artwork preparation: every file is checked and laid out before any film is used.'),
  procPrint: g('uv-dtf-stickers-process-print-and-cure', 'UV DTF printer printing a declaration cover design onto transfer film, with the UV lamp curing the ink as the print head passes', 'Print and cure: white, colour and gloss varnish, cured instantly by UV light.'),
  procLaminate: g('uv-dtf-stickers-process-lamination', 'Betapixel Studios logo transfer coming off a UV DTF printer as the clear transfer film is laminated over the cured print', 'Lamination: a clear film is laminated over the print so the design lifts as one piece.'),
  procApply: g('uv-dtf-stickers-process-transfer-to-product', 'Hand peeling the clear film away from colourful UV DTF circle and rose transfers on a black surface, leaving only the printed design', 'Transfer to the product: press, rub down and peel the film away; only the design stays.'),
  backdrop: g('events-exhibitions-media-backdrop-banner', 'Media backdrop banner with a repeating training authority logo pattern on a portable pop-up frame at an indoor event', 'A step-and-repeat media banner, also called a backdrop banner, on a portable frame.'),
  shopSign: g('signage-large-format-illuminated-restaurant-shop-sign', 'Illuminated restaurant shop sign with glowing white 3D letters and a mask logo on a black fascia at dusk', 'An illuminated fascia sign: 3D letters lit from behind so the brand reads day and night.'),
  restoBanner: g('signage-large-format-restaurant-banner-and-counter-branding', 'Restaurant interior with a large printed fabric banner, a branded service counter and bunting under a covered terrace', 'In-store branding: a printed wall banner and a branded counter for a burger restaurant.'),
  signLandscape: g('signage-ghost-burgers-illuminated-wall-sign', 'Illuminated restaurant wall sign with red-backlit 3D lettering and a glowing white mask logo above a dining table', 'A 3D illuminated wall sign, designed, built and installed by Betapixel.'),
  ghostSign3d: { src: img('signage-large-format-ghost-burgers-3d-illuminated-sign-installed', 'portfolio/'), alt: 'Restaurant wall sign with red 3D lettering and a white mask logo, lit from behind with a red glow', caption: 'A 3D illuminated wall sign, designed, built and installed by Betapixel.' },
  selfieMirror: { src: img('customised-mirrors-social-media-frame-selfie-mirror', 'portfolio/'), alt: localAlt('customised-mirrors', 'Full-length selfie mirror printed as a social media post frame for a restaurant, standing on a wooden easel'), caption: 'A selfie mirror printed as a social media post frame.' },
  etchedGlass: { src: img('customised-mirrors-etched-glass-restaurant-frontage', 'portfolio/'), alt: localAlt('customised-mirrors', 'Restaurant glass frontage decorated with white frosted floral designs, a bow and the garden name'), caption: 'Frosted-effect designs on a restaurant glass frontage.' },
  cafeHoodies: g('custom-apparel-cafe-brand-hoodies-three-colours', 'Tan, grey and brown hoodies with a small café brand logo printed on the chest', 'One café brand across three hoodie colours, printed small on the chest.'),
  tees: g('custom-apparel-t-shirts-and-polo', 'Printed T-shirts with typography and illustrated designs and a yellow polo shirt with a hospital logo', 'T-shirts and a staff polo printed with slogans, illustrations and a hospital logo.'),
};

export const groupsFor: Record<string, WorkImage[]> = {
  'uv-dtf-stickers': [G.procLaminate, G.uvPeel, G.bottles, G.procApply, G.uvPrinter],
  'corporate-gifts': [G.gifts, G.drinkware, G.notebooks, G.notebookIn],
  'commercial-printing': [G.menus, G.calendars, G.menuCovers, G.cards, G.deskCalendars, G.magazines],
  'book-publishing': [G.magazines],
  'signage': [G.signLandscape, G.shopSign, G.restoBanner],
  'banners': [G.rollups, G.backdrop, G.flags],
  'events-exhibitions': [G.flags, G.backdrop, G.rollups],
  'custom-apparel': [G.hoodies, G.cafeHoodies, G.tees],
  'packaging-labels': [G.labels, G.drinkware, G.bottles],
  'corporate-branding': [G.cards, G.gifts, G.calendars, G.flags, G.notebooks],
};

const s = (name: string, service: string, title: string, spec: string, alt: string, category?: string): Sample =>
  ({ src: img(name, 'portfolio/'), service, title, spec, alt: localAlt(category === 'customised-mirrors' ? category : service, alt), caption: alt, category });

export const samples: Sample[] = [
  s('uv-dtf-stickers-3d-logo-transfer-peel', 'uv-dtf-stickers', 'Raised logo on a leather notebook', 'UV DTF · peel-off transfer · gloss', 'Glossy raised UV DTF logo transfer being peeled onto a black leather notebook cover'),
  s('uv-dtf-stickers-applying-transfer-to-acrylic-award', 'uv-dtf-stickers', 'Applying a transfer to an award', 'UV DTF · applied to acrylic and wood', 'Hands pressing a UV DTF transfer onto the wooden base of an acrylic star award for a national debate championship'),
  s('uv-dtf-stickers-acrylic-star-award-wooden-base', 'uv-dtf-stickers', 'Acrylic star award', 'UV DTF · full colour on clear acrylic', 'Clear acrylic star award with a full-colour UV DTF championship logo and a wooden base branded for debate champions'),
  s('uv-dtf-stickers-leather-presentation-folder', 'uv-dtf-stickers', 'Leather presentation folder', 'UV DTF · gold, red and blue on black leather', 'Black leather presentation folder with a ceremonial declaration cover applied in UV DTF, with gold lettering and coloured bands'),
  s('uv-dtf-stickers-black-steel-water-bottle', 'uv-dtf-stickers', 'Illustrated steel water bottle', 'UV DTF · full wrap on black steel', 'Black stainless steel water bottle with a full-colour illustrated UV DTF sticker design'),
  s('uv-dtf-stickers-white-bamboo-bottle-sticker-collage', 'uv-dtf-stickers', 'Sticker-collage bottle', 'UV DTF · multiple transfers · bamboo lid', 'White bamboo-lid water bottle covered in pink UV DTF magic sticker graphics and slogans'),
  s('uv-dtf-stickers-steel-travel-tumbler', 'uv-dtf-stickers', 'Travel tumbler set', 'UV DTF · curved surface', 'Steel travel tumbler with a matching collage of UV DTF sticker designs'),
  s('corporate-gifts-insurance-executive-gift-box', 'corporate-gifts', 'Executive gift box', 'Notebook, pen, keyring, bottle · gold logo', 'Black executive gift box with a gold-printed lid, navy notebook, pen, keyring and water bottle'),
  s('corporate-gifts-blue-notebook-pen-keyring-set', 'corporate-gifts', 'Blue branded gift set', 'Notebook, pen, keyring, card holder', 'Blue corporate gift set with a branded notebook, metal pen, keyring and card holder in a fitted box'),
  s('corporate-gifts-leather-notebook-logo', 'corporate-gifts', 'Leather notebook with logo', 'A5 notebook · full-colour logo', 'Black leather A5 notebook with a full-colour property company logo and a metal pen clip'),
  s('corporate-gifts-blue-notebook-and-pen-gift-box', 'corporate-gifts', 'Notebook and pen gift box', 'Leather notebook · branded pens · fitted box', 'Blue leather notebook with a gold logo and two branded pens in a fitted blue gift box'),
  s('corporate-gifts-branded-pen-and-ring-binder', 'corporate-gifts', 'Branded pen and ring binder', 'Branded pen · leather ring binder', 'Hand writing with a blue and gold branded pen in a leather ring binder with lined refill pages'),
  s('corporate-gifts-branded-mug-glass-bottle-and-coaster', 'corporate-gifts', 'Branded drinkware set', 'Mug, glass, steel bottle and wooden coaster', 'Matching branded set of a ceramic mug, a drinking glass, a steel water bottle and a wooden coaster with one logo'),
  s('corporate-gifts-two-tone-branded-mug', 'corporate-gifts', 'Two-tone branded mug', 'Ceramic mug · full-colour logo', 'White ceramic mug with a navy handle and interior, printed with a full-colour company logo'),
  s('corporate-gifts-patterned-steel-tumbler', 'corporate-gifts', 'Patterned steel tumbler', 'Insulated tumbler · full wrap', 'Cream insulated steel tumbler with a full-wrap botanical pattern'),
  s('corporate-gifts-agri-brand-spiral-notebook', 'corporate-gifts', 'Agribusiness notebook', 'Spiral notebook · full-colour cover', 'Spiral notebook with a full-colour cover for an agricultural biological-solutions company'),
  s('corporate-gifts-conference-notebook-cover', 'corporate-gifts', 'Conference notebook', 'Spiral notebook · printed cover', 'Spiral conference notebook with a bold typographic cover and event logo'),
  s('corporate-gifts-tech-expo-notebook', 'corporate-gifts', 'Tech expo notebook', 'Spiral notebook · event branding', 'Spiral notebook for a Kenyan technology expo with a city-skyline cover and sponsor logos'),
  s('commercial-printing-swahili-restaurant-menu', 'commercial-printing', 'Swahili restaurant menu', 'Menu cover · full colour', 'Printed menu cover for a Swahili cuisine restaurant with a wood-texture design and contact details'),
  s('commercial-printing-fast-food-menu-cover', 'commercial-printing', 'Fast-food menu', 'Menu cover · photo print', 'Black fast-food menu cover with a burger and chicken photograph and bold MENU title'),
  s('commercial-printing-qr-table-tent-yellow', 'commercial-printing', 'QR table tent, black and yellow', 'Table tent · scan-for-menu QR', 'Black and yellow table tent card with a large scan-for-menu QR code for a lounge'),
  s('commercial-printing-qr-table-tent-green', 'commercial-printing', 'QR table tent, green', 'Table tent · order-now QR', 'Green and marble table tent card with an order-now QR code and opening hours for a restaurant'),
  s('commercial-printing-qr-menu-table-tents-set', 'commercial-printing', 'QR menu table tents, set of three', 'Table tents · scan-for-menu QR', 'Three scan-for-menu QR table tents in black, green and yellow designs for a lounge, a kitchen and a café'),
  s('commercial-printing-qr-table-tent-black', 'commercial-printing', 'QR table tent, black', 'Table tent · scan-for-menu QR', 'Black table tent card with a white scan-for-menu QR code and social handles'),
  s('commercial-printing-three-month-wall-calendar', 'commercial-printing', 'Three-month wall calendar', 'Wall calendar · 3 months per view · spiral bound', 'Tall three-month wall calendar with a house photograph header, spiral-bound month pads and a contact footer for a property company'),
  s('commercial-printing-property-company-desk-calendar', 'commercial-printing', 'Property company desk calendar', 'Desk calendar · tent stand · photo page', 'Desk calendar for a property company with a family outside a to-let house, a monthly grid and a services band'),
  s('commercial-printing-agribusiness-desk-calendar', 'commercial-printing', 'Agribusiness desk calendar', 'Desk calendar · tent stand · product photo', 'Desk calendar for an agricultural chemicals company showing watermelons, a product container and a green contact band'),
  s('commercial-printing-auto-parts-desk-calendar', 'commercial-printing', 'Auto-parts desk calendar', 'Desk calendar · tent stand · bold month header', 'Desk calendar for a vehicle spare-parts dealer with a black and red January header and a product photo'),
  s('commercial-printing-lounge-drinks-menu', 'commercial-printing', 'Lounge drinks menu', 'Menu cover · black with metallic-look logo', 'Black drinks menu cover for a Nairobi lounge with a winged eye logo and reservation details'),
  s('commercial-printing-traditional-cuisine-menu', 'commercial-printing', 'Traditional cuisine menu', 'Menu cover · green and white', 'Green and white menu cover for a Luhya traditional cuisine restaurant with a food photo and halal badge'),
  s('commercial-printing-restaurant-wine-cellar-menu', 'commercial-printing', 'Restaurant and wine cellar menu', 'Menu folder · gold print on dark cover', 'Dark menu folder for a restaurant and wine cellar with gold lettering and food photo side panels'),
  s('commercial-printing-laminated-menu-card', 'commercial-printing', 'Laminated menu card', 'Menu card · single sheet in clear sleeve', 'Single-page white menu card in a clear sleeve listing wings, sliders and loaded fries with prices'),
  s('commercial-printing-cafe-table-tent-veggie-melt', 'commercial-printing', 'Café table tent, veggie melt', 'Table tent · full-bleed food photo', 'Café table tent card with a full-bleed photo of a cheesy veggie melt sandwich'),
  s('commercial-printing-cafe-table-tent-sandwich', 'commercial-printing', 'Café table tent, PB&J', 'Table tent · full-bleed food photo', 'Café table tent card with a full-bleed photo of a peanut butter and jelly toasted sandwich'),
  s('book-publishing-school-magazine', 'book-publishing', 'School magazine', 'Magazine · full-colour cover and inside', 'Printed school magazine cover and back page celebrating ten years, with photo collage'),
  s('book-publishing-graduation-booklet', 'book-publishing', 'Graduation booklet', 'Booklet · full-colour cover', 'Graduation booklet cover for a Christian training institute class of 2025'),
  s('signage-large-format-training-authority-roll-up', 'banners', 'Training programme roll-up', 'Roll-up banner · information layout', 'Roll-up banner explaining apprenticeship and training programmes for a national training authority', 'banners'),
  s('signage-large-format-burger-restaurant-roll-up', 'banners', 'Restaurant roll-up', 'Roll-up banner · photo-led', 'Dark roll-up banner for a burger restaurant with a masked character and bold logo', 'banners'),
  s('signage-large-format-education-charity-roll-up', 'banners', 'Education charity roll-up', 'Roll-up banner · photos, impact figures, QR', 'Black and yellow roll-up banner for a children’s education centre with classroom photos, impact figures and a donation QR code', 'banners'),
  s('signage-large-format-colouring-book-roll-up', 'banners', 'Book launch roll-up', 'Roll-up banner · event booth', 'Colourful roll-up banner promoting the Betapixel Alphabet Colouring Book at a holiday event', 'banners'),
  s('signage-large-format-ice-pop-roll-up', 'banners', 'Ice-pop roll-up', 'Roll-up banner · product photography', 'Roll-up banner for an ice-pop brand listing flavours over a photo of frozen pops', 'banners'),
  s('signage-large-format-fashion-brand-roll-up', 'banners', 'Fashion brand roll-up', 'Roll-up banner · minimal typography', 'Minimal white roll-up banner on a silver stand with an elegant fashion brand wordmark and tagline', 'banners'),
  s('signage-large-format-illuminated-restaurant-shop-sign', 'signage', 'Illuminated shop sign', 'Fascia sign · backlit 3D letters', 'Illuminated restaurant shop sign with glowing white 3D letters and a mask logo on a black fascia at dusk', 'signage'),
  s('signage-large-format-restaurant-banner-and-counter-branding', 'signage', 'Restaurant banner and counter branding', 'Fabric wall banner · branded counter', 'Restaurant interior with a large printed fabric banner, a branded service counter and bunting under a covered terrace', 'signage'),
  s('signage-large-format-organic-hair-care-roll-up-banner', 'banners', 'Hair-care brand roll-up', 'Roll-up banner · product photography', 'Dark roll-up banner for an organic hair-care brand with product photos, organic and vegan badges and contacts', 'banners'),
  s('signage-large-format-gadget-shop-roll-up-banner', 'banners', 'Gadget shop roll-up', 'Roll-up banner · brand logo grid', 'White and red roll-up banner for a phone and electronics shop listing the brands it stocks, with shop number and phone', 'banners'),
  s('customised-mirrors-social-media-frame-selfie-mirror', 'signage', 'Social media selfie mirror', 'Custom mirror · printed frame on an easel', 'Full-length selfie mirror printed as a social media post frame for a restaurant, standing on a wooden easel', 'customised-mirrors'),
  s('customised-mirrors-etched-glass-restaurant-frontage', 'signage', 'Etched glass frontage', 'Glass and mirror graphics · frosted white designs', 'Restaurant glass frontage decorated with white frosted floral designs, a bow and the garden name, looking onto a lit terrace', 'customised-mirrors'),
  s('events-exhibitions-branded-pole-flag', 'events-exhibitions', 'Branded pole flag', 'Pole flag · printed fabric', 'Black printed pole flag for a tour company with a bird logo, tagline and contacts'),
  s('events-exhibitions-tour-company-fabric-flag', 'events-exhibitions', 'Tour company fabric flag', 'Printed fabric flag · white on black', 'Black printed fabric flag for a luxury tour company with a white bird logo, tagline and contacts'),
  s('events-exhibitions-feather-flag-green', 'events-exhibitions', 'Feather flag', 'Feather flag · outdoor', 'Green feather flag for an agricultural machinery dealer printed with a vertical logo'),
  s('events-exhibitions-festival-feather-flag', 'events-exhibitions', 'Festival feather flag', 'Feather flag · event welcome', 'Lilac feather flag welcoming visitors to a festival'),
  s('events-exhibitions-teardrop-flag', 'events-exhibitions', 'Teardrop flag', 'Teardrop flag · charity event', 'Blue teardrop flag for a feed-the-needy charity initiative'),
  s('events-exhibitions-vertical-pole-banner', 'events-exhibitions', 'Community walk banner', 'Pole banner · printed fabric', 'Vertical pole banner for a community elder-care walk with a hands logo'),
  s('events-exhibitions-media-backdrop-banner', 'banners', 'Media backdrop banner', 'Backdrop banner · 2.25 × 2.25 m, 3 × 2.25 m or 6 × 2.25 m', 'Step-and-repeat media backdrop banner with a repeating training authority logo on a portable pop-up frame'),
  s('events-exhibitions-desk-flags', 'events-exhibitions', 'Desk flags', 'Desk flags · chrome stands', 'Three green desk flags on chrome stands for a law firm'),
  s('events-exhibitions-pop-up-a-frame-banner', 'events-exhibitions', 'Pop-up A-frame banner', 'Pop-up banner · ground display', 'Blue pop-up A-frame ground banner for a hospital with a health slogan'),
  s('custom-apparel-charcoal-printed-hoodie', 'custom-apparel', 'Charcoal logo hoodie', 'Hoodie · full-colour front print', 'Charcoal hoodie with a large full-colour circular logo print on the chest'),
  s('custom-apparel-black-restaurant-hoodie', 'custom-apparel', 'Restaurant hoodie, front and back', 'Hoodie · front logo, back slogan print', 'Black restaurant hoodies showing a red masked-face logo on the front and a red splatter slogan print on the back'),
  s('custom-apparel-cafe-brand-hoodies-three-colours', 'custom-apparel', 'Café brand hoodies', 'Hoodies · small chest logo · 3 colours', 'Tan, grey and brown hoodies with a small café brand logo printed on the chest'),
  s('custom-apparel-coffee-brand-hoodie-back-print', 'custom-apparel', 'Coffee brand hoodie, back print', 'Hoodie · large back print', 'Tan hoodie with a large black brush-stroke 65° speciality coffee print across the back'),
  s('custom-apparel-white-t-shirt-left-chest-logo', 'custom-apparel', 'White T-shirt, chest logo', 'T-shirt · small left-chest print', 'White T-shirt with a small black location-pin logo printed on the left chest for a creative studio'),
  s('custom-apparel-beauty-academy-t-shirt', 'custom-apparel', 'Beauty academy T-shirt', 'T-shirt · two-colour print on black', 'Black T-shirt printed with a pink and white nail and beauty academy logo'),
  s('custom-apparel-black-typography-t-shirt', 'custom-apparel', 'Typography T-shirt', 'T-shirt · white print on black', 'Black T-shirt with a white hand-lettered typography design'),
  s('custom-apparel-magenta-graffiti-t-shirt', 'custom-apparel', 'Graffiti-style T-shirt', 'T-shirt · full-colour DTF', 'Magenta T-shirt with a full-colour graffiti-style motivational print'),
  s('custom-apparel-hospital-staff-polo', 'custom-apparel', 'Hospital staff polo', 'Polo shirt · left-chest logo', 'Yellow polo shirt with a small hospital logo on the left chest'),
  s('custom-apparel-mountain-bike-t-shirt', 'custom-apparel', 'Mountain bike T-shirt', 'T-shirt · full-colour print', 'White T-shirt with a red and black mountain-bike illustration'),
  s('packaging-labels-hair-oil-bottle-label', 'packaging-labels', 'Hair oil bottle label', 'Pump bottle · black and gold label', 'Black and gold label on a 500 ml pump bottle of organic hair growth oil'),
  s('packaging-labels-hair-food-jar-label', 'packaging-labels', 'Hair food jar lid label', 'Round lid label · gold', 'Round gold label on the lid of an anti-dandruff hair food jar'),
  s('packaging-labels-ginger-honey-drink-bottle-labels', 'packaging-labels', 'Drink bottle labels', 'Wrap-around labels · 500 ml bottles', 'Bright yellow labels on two 500 ml ginger and honey drink bottles, one designed for children'),
  s('packaging-labels-cold-pressed-juice-bottle-labels', 'packaging-labels', 'Cold-pressed juice labels', 'Oval labels · 500 ml and 250 ml bottles', 'Minimal cream oval labels on passion and ginger cold-pressed juice bottles in two sizes'),
  s('packaging-labels-die-cut-product-labels', 'packaging-labels', 'Die-cut labels, ready to apply', 'Die-cut labels · front, back and lid', 'Loose die-cut product labels: a drink front and back label with nutrition facts and barcode, and round gold lid labels'),
  s('packaging-labels-agricultural-product-label', 'packaging-labels', 'Agricultural product label', 'Product label · full colour with safety icons', 'Full-colour label for a fruit-fly control product with avocado photos, instructions and safety icons'),
  s('packaging-labels-branded-plastic-drinks-cup', 'packaging-labels', 'Branded drinks cup', 'Plastic cup · logo and stickers', 'Clear plastic iced-drink cup branded with a café logo and sticker labels'),
  s('packaging-labels-restaurant-milkshake-cups', 'packaging-labels', 'Restaurant milkshake cups', 'Plastic cups and glass · logo print', 'Milkshake cups and a clear glass printed with restaurant and café logos'),
];

const r = (name: string, service: string, category: string, title: string, spec: string, alt: string): Sample =>
  ({ ...s(name, service, title, spec, alt, category), onSite: true });
const v = (name: keyof typeof videoMeta, service: string, category: string, title: string, spec: string, alt: string): Sample =>
  ({ src: img(name, 'video/'), service, category, title, spec, alt: localAlt(category === 'customised-mirrors' ? category : service, alt), caption: alt, onSite: true, video: { src: `/video/${name}.mp4`, ...videoMeta[name] } });

export const realSamples: Sample[] = [
  r('signage-large-format-ghost-burgers-3d-illuminated-sign-installed', 'signage', 'signage', '3D illuminated sign, installed', 'Real photo · 3D letters with red backlight', 'Restaurant wall sign with red 3D lettering and a white mask logo, lit from behind with a red glow'),
  v('signage-large-format-ghost-burgers-illuminated-sign', 'signage', 'signage', '3D illuminated sign in motion', 'Video · backlit 3D lettering', 'Short video of a red-backlit 3D restaurant sign with a mask logo'),
  r('signage-large-format-ghost-burgers-branded-counter-installed', 'signage', 'signage', 'Branded service counter', 'Real photo · printed counter wrap', 'Black restaurant service counter wrapped with a red mask logo, with the illuminated wall sign behind'),
  v('signage-large-format-ghost-burgers-fascia-sign', 'signage', 'signage', 'Shop fascia sign', 'Video · 3D letters on a black fascia', 'Short video of a black restaurant fascia sign with white 3D lettering'),
  v('signage-large-format-ghost-burgers-terrace-banner', 'signage', 'signage', 'Restaurant terrace banner', 'Video · fabric banner and counter branding', 'Short video of a printed fabric banner and a branded counter on a restaurant terrace'),
  r('signage-large-format-al-baraka-acrylic-logo-sign-installed', 'signage', 'signage', 'Acrylic logo sign, installed', 'Real photo · black acrylic, gold 3D lettering', 'Black circular acrylic wall sign with a gold 3D building logo and lettering for a real estate company, installed in its office'),
  v('signage-large-format-al-baraka-acrylic-sign', 'signage', 'signage', 'Acrylic logo sign in motion', 'Video · black acrylic, gold 3D lettering', 'Short video of a black acrylic real estate sign with gold 3D lettering on an office wall'),
  v('signage-large-format-al-baraka-backlit-sign', 'signage', 'signage', 'Backlit acrylic sign', 'Video · warm LED halo', 'Short video of a circular acrylic sign with a warm LED halo glowing on an office wall'),
  r('signage-large-format-seefle-led-logo-sign-installed', 'signage', 'signage', 'LED logo sign, installed', 'Real photo · backlit acrylic, blue LED', 'Round grey wall sign with a blue LED-lit rooftop logo for a real estate company, installed on an office wall'),
  v('signage-large-format-seefle-led-sign', 'signage', 'signage', 'LED logo sign in motion', 'Video · blue LED logo', 'Short video of a round office sign with a blue LED rooftop logo'),
  v('signage-large-format-window-film-installation', 'signage', 'signage', 'Window film installation', 'Video · frosted film on glass', 'Short video of a Betapixel installer applying frosted window film to a glass shopfront'),
  v('signage-large-format-window-graphic-installation', 'signage', 'signage', 'Window graphic installation', 'Video · printed graphic on glass', 'Short video of an installer applying a large printed graphic to a shop window'),
  v('signage-large-format-glass-door-sticker-application', 'signage', 'signage', 'Glass door sticker', 'Video · printed promotional sticker', 'Short video of a printed promotional sticker being applied to a glass door'),
  r('customised-mirrors-ghost-burgers-selfie-mirror-installed', 'signage', 'customised-mirrors', 'Selfie mirror, installed', 'Real photo · printed frame mirror on an easel', 'Social media frame selfie mirror on a wooden easel outside a restaurant at night'),
  v('packaging-labels-sinia-branded-cans-and-bowls', 'packaging-labels', 'packaging-labels', 'Branded cans and food bowls', 'Video · printed cans, bowls and wall lettering', 'Short video of a restaurant opening with branded drink cans, printed food bowls and Indulge in Flavour wall lettering'),
  r('packaging-labels-karak-and-go-branded-cups-and-boxes', 'packaging-labels', 'packaging-labels', 'Branded cups and food boxes', 'Real photo · printed cups, boxes and wrap paper', 'Branded takeaway cups, food boxes and printed wrap paper for a cafe, shown in a delivery launch photo'),
  r('packaging-labels-treats-branded-dessert-cup', 'packaging-labels', 'packaging-labels', 'Branded dessert cup', 'Real photo · printed takeaway cup', 'Clear takeaway dessert cup printed with a bold pink Treats logo, filled with fruit and ice cream'),
  r('packaging-labels-ginger-shot-bottle-label', 'packaging-labels', 'packaging-labels', 'Ginger shot bottle label', 'Real photo · product label and photography', 'Ginger shot bottle with a yellow and black product label among floating lemon slices and ginger'),
  r('packaging-labels-ginger-shot-label-with-fresh-ginger', 'packaging-labels', 'packaging-labels', 'Ginger shot label, flat lay', 'Real photo · product label and photography', 'Ginger shot bottle with its yellow product label surrounded by fresh ginger, lemon, turmeric and leaves'),
  r('packaging-labels-ghost-burgers-printed-fries-box', 'packaging-labels', 'packaging-labels', 'Printed fries box', 'Real photo · custom food packaging', 'Black printed fries box with red graffiti-style restaurant branding, filled with chips'),
  v('packaging-labels-ghost-burgers-fries-box', 'packaging-labels', 'packaging-labels', 'Fries box in hand', 'Video · custom food packaging', 'Short video of a printed black fries box with red restaurant branding'),
  v('packaging-labels-ghost-burgers-branded-cup', 'packaging-labels', 'packaging-labels', 'Branded takeaway cup', 'Video · printed cup', 'Short video of a printed takeaway cup with a restaurant slogan and logo'),
  v('packaging-labels-ghost-burgers-smash-sip-box', 'packaging-labels', 'packaging-labels', 'Slogan food box', 'Video · printed food box', 'Short video of a black printed food box with a hand-lettered slogan'),
  r('commercial-printing-agricultural-brochure-range', 'commercial-printing', 'commercial-printing', 'Agricultural brochure range', 'Real photo · brochure series', 'Spread of printed brochures for crop products covering berries, citrus, potato, avocado and row crops'),
  v('commercial-printing-brochure-page-flip', 'commercial-printing', 'commercial-printing', 'Brochure page flip', 'Video · printed product brochure', 'Short video flipping through the pages of a printed product brochure'),
  r('commercial-printing-biostimulant-product-brochure', 'commercial-printing', 'commercial-printing', 'Biostimulant product brochure', 'Real photo · A4 brochure, full colour', 'Stack of printed A4 brochures for an agricultural biostimulant product with a plant illustration'),
  r('commercial-printing-prebiotic-product-brochure', 'commercial-printing', 'commercial-printing', 'Soil prebiotic brochure', 'Real photo · A4 brochure, full colour', 'Printed A4 product brochures for a soil prebiotic with a cut-away plant and root illustration'),
  v('commercial-printing-lamination-in-production', 'commercial-printing', 'commercial-printing', 'Lamination in production', 'Video · in the Betapixel studio', 'Short video of printed sheets going through the laminator at the Betapixel studio in Nairobi'),
  r('book-publishing-through-the-fog-printed-copies', 'book-publishing', 'book-publishing', 'Through the Fog, printed copies', 'Real photo · paperback book printing', 'Stack of printed paperback copies of the book Through the Fog with a red title on a dark cover'),
  r('book-publishing-through-the-fog-book-spines', 'book-publishing', 'book-publishing', 'Through the Fog, book spines', 'Real photo · paperback book printing', 'Spines of printed paperback copies lined up, showing the book title and author name'),
];

export const artImage: Record<string, WorkImage> = {
  'magic-stickers': G.uvPeel,
  'sticker-printing': G.uvPrinter,
  'promotional-branding': G.gifts,
  't-shirt-printing': G.hoodies,
  'banners-large-format': G.rollups,
  'signage': G.signLandscape,
  'bulk-printing': G.cards,
  'commercial-printing': G.menus,
  'label-printing': G.labels,
  'book-publishing': G.magazines,
  'graphic-design': G.cards,
  'photography': G.bottles,
  'corporate-branding': G.notebooks,
  'events-exhibitions': G.flags,
};

export const heroImage: Record<string, WorkImage> = {
  'uv-dtf-stickers': G.procLaminate,
  'commercial-printing': G.cards,
  'signage': G.signLandscape,
  'banners': G.rollups,
  'custom-apparel': G.hoodies,
  'corporate-gifts': G.gifts,
  'packaging-labels': G.labels,
  'book-publishing': G.magazines,
  'corporate-branding': G.notebooks,
  'events-exhibitions': G.flags,
};

const mobileFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/hero-mobile/*.webp', { eager: true });
const m = (name: string, alt: string) => {
  const f = mobileFiles[`../assets/hero-mobile/${name}.webp`];
  if (!f) throw new Error(`Missing mobile hero image: ${name}.webp (run python scripts/hero-mobile.py)`);
  return { src: f.default, alt: localAlt(keyFor(name), alt) };
};

export const heroMobile: Record<string, { src: ImageMetadata; alt: string }> = {
  'uv-dtf-stickers': m('uv-dtf-stickers-uv-printer-printing-transfers', 'UV printer head curing a sheet of UV DTF sticker transfers under violet light'),
  'packaging-labels': m('packaging-labels-juice-bottle-and-hair-care-labels', 'Printed labels on juice bottles, a hair oil pump bottle and a hair food tin, with loose label samples in front'),
  'corporate-branding': m('corporate-branding-calendars-notebooks-and-stationery', 'Branded wall calendar, desk calendar, spiral notebooks and company profile booklets on display plinths'),
  'corporate-gifts': m('corporate-gifts-branded-executive-gift-boxes', 'Two executive gift boxes with branded notebook, pen, keyring, water bottle and bamboo power bank'),
  'custom-apparel': m('custom-apparel-branded-hoodies-polos-and-t-shirts', 'Printed and embroidered hoodies, polo shirts and a T-shirt arranged on display blocks'),
  'banners': m('banners-roll-up-banners-on-display', 'Three printed roll-up banners standing side by side on aluminium bases'),
  'events-exhibitions': m('events-exhibitions-branded-flags-and-feather-banner', 'Branded fabric flag on a chrome pole, a printed feather banner and a desk flag for an event'),
  'book-publishing': m('book-publishing-school-magazine-graduation-booklet-and-novel', 'Printed school magazine, graduation booklet and a stack of paperback novels with one magazine open'),
  'signage': m('signage-illuminated-3d-restaurant-wall-sign-portrait', 'Illuminated 3D restaurant wall sign with red backlit lettering and a glowing white mask logo'),
};
