export type FaqCategory =
  | 'ordering' | 'artwork' | 'uv-dtf' | 'printing' | 'signage' | 'banners' | 'apparel' | 'packaging'
  | 'gifts' | 'books' | 'branding' | 'events' | 'turnaround' | 'payment' | 'delivery';

export interface FaqEntry { q: string; a: string; cat: FaqCategory }

export const faqCategories: { id: FaqCategory; label: string }[] = [
  { id: 'ordering', label: 'Ordering' },
  { id: 'artwork', label: 'Artwork' },
  { id: 'uv-dtf', label: 'UV DTF' },
  { id: 'printing', label: 'Printing' },
  { id: 'signage', label: 'Signage' },
  { id: 'banners', label: 'Banners' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'packaging', label: 'Packaging' },
  { id: 'gifts', label: 'Corporate gifts' },
  { id: 'books', label: 'Books' },
  { id: 'branding', label: 'Branding' },
  { id: 'events', label: 'Events' },
  { id: 'turnaround', label: 'Turnaround' },
  { id: 'payment', label: 'Payment' },
  { id: 'delivery', label: 'Delivery' },
];

export const faqs: FaqEntry[] = [
  { cat: 'ordering', q: 'How do I request a quote?', a: 'Use the Request a Quote form and include the product, quantity, size and the date you need it. You can upload artwork or reference images, or send the same details on WhatsApp. We reply with a quotation tailored to your specifications.' },
  { cat: 'ordering', q: 'What information do you need to give me a price?', a: 'Usually the product, size, quantity, material or finish, artwork and deadline. If you are unsure about any of these, tell us what you are trying to achieve and we will help work out the specification.' },
  { cat: 'ordering', q: 'Why are prices not listed on the website?', a: 'Almost every job is custom: size, quantity, material, finishing and artwork all change the price. Rather than publish figures that rarely match a real order, we quote each project individually, quickly, on WhatsApp or by email.' },
  { cat: 'ordering', q: 'Can I order a small quantity?', a: 'Yes, for many products. DTF-printed garments can start from a single piece, and UV DTF stickers start from half a metre of film (58 × 50 cm), which can carry many designs. Neither needs screens or plates. Minimums for other products depend on the production method and are stated on your quotation.' },
  { cat: 'ordering', q: 'Do you work with individuals or only companies?', a: 'Both. We work with individuals, startups, SMEs, schools, churches, NGOs, established businesses and corporate clients across Kenya.' },
  { cat: 'ordering', q: 'Can Betapixel handle several products in one project?', a: 'Yes. A single project can combine signage, uniforms, business cards, packaging, merchandise and office graphics, managed together so the colours and branding match across everything.' },
  { cat: 'ordering', q: 'Is everything produced in-house?', a: 'Yes. Design, printing, UV DTF, apparel branding, signage and finishing are all produced by the Betapixel team in Nairobi, which is how we keep colour, quality and deadlines under our own control.' },

  { cat: 'artwork', q: 'Do I need a finished design?', a: 'No. You can send print-ready artwork, just a logo, or simply describe what you need. Where design work is required we tell you before production and include it in the quotation.' },
  { cat: 'artwork', q: 'Which file formats do you accept?', a: 'Vector files are preferred: AI, PDF, EPS or SVG with text converted to outlines. High-resolution PSD, PNG or JPG at 300 dpi at the printed size can also work, depending on the job.' },
  { cat: 'artwork', q: 'Can you print a logo I saved from WhatsApp?', a: 'Sometimes, but WhatsApp compresses images heavily. For clean printing we may ask for the original or a vector version. If that is unavailable, we can redraw the logo so it prints sharply at any size.' },
  { cat: 'artwork', q: 'Why does my artwork look clear on my phone but blurry in print?', a: 'Phone screens make small images look sharper than they are. When enlarged for printing there is not enough image detail to reproduce cleanly. We flag obvious resolution problems before anything is printed.' },
  { cat: 'artwork', q: 'Will printed colours match my screen exactly?', a: 'Not always. Screens mix light while printing mixes inks, and every screen is set differently. We match to CMYK values or Pantone references where supplied; if exact colour matters, tell us before production so we can proof it.' },

  { cat: 'uv-dtf', q: 'What are UV DTF stickers?', a: 'UV DTF stickers are full-colour prints made with UV-cured ink on a transfer film. Pressed onto a hard surface and peeled, they leave only the design behind, with no sticker background, so the product looks printed directly.' },
  { cat: 'uv-dtf', q: 'Are magic stickers, 3D crystal labels and UV DTF stickers different products?', a: 'No. They are three names for the same product. UV DTF stickers is the technical name, magic stickers is the name most Kenyan buyers use, and 3D crystal labels describes the raised, glossy finish.' },
  { cat: 'uv-dtf', q: 'What is the minimum order for UV DTF stickers?', a: 'Half a metre of film, which measures 58 cm wide by 50 cm long. A full metre measures 58 cm by 100 cm. One sheet can carry many designs, logos or personalised names, and there are no screens, plates or setup charges. Larger orders lower the unit cost because more designs fit on each length of film.' },
  { cat: 'uv-dtf', q: 'Do UV DTF stickers need a heat press?', a: 'No. They are applied by pressure: clean the surface, press the transfer down, rub it firmly and peel the top film away slowly.' },
  { cat: 'uv-dtf', q: 'What surfaces do UV DTF stickers stick to?', a: 'Clean, smooth, hard surfaces: glass, stainless steel, aluminium, powder coat, acrylic, ceramic, sealed wood, leather, PVC and most rigid plastics. They do not hold on silicone, wax coatings, heavily textured stone or fabric.' },
  { cat: 'uv-dtf', q: 'Are UV DTF stickers waterproof and dishwasher safe?', a: 'Once properly applied they are water-resistant and handle hand washing and everyday use. We do not recommend dishwashers or sustained heat above about 60°C, because hot cycles and strong detergents weaken the adhesive over time.' },
  { cat: 'uv-dtf', q: 'Can UV DTF stickers go on T-shirts?', a: 'No. UV DTF is designed for hard surfaces and cracks on fabric that stretches and is washed. Garments are branded with DTF printing, embroidery or screen printing instead.' },

  { cat: 'printing', q: 'What commercial printing do you do?', a: 'Business cards, flyers, brochures, posters, company profiles, booklets, catalogues, menus, certificates, invitations, notebooks, calendars, NCR books, presentation folders and full company stationery.' },
  { cat: 'printing', q: 'Can you print custom sizes and finishes?', a: 'Yes. Most items can be produced in custom sizes, with finishes such as matte or gloss lamination, soft-touch, spot UV, foiling, folding, binding and rounded corners, depending on the product.' },
  { cat: 'printing', q: 'Will I see a proof before printing?', a: 'Yes. Every job gets a digital proof to approve before production. For critical brand colours or long runs, ask for a printed proof as well.' },

  { cat: 'signage', q: 'Do you make and install shop signs?', a: 'Yes. We produce indoor and outdoor signage (ACP and aluminium signboards, acrylic signs, 3D letters, lightboxes and illuminated signs) and install them in Nairobi and elsewhere in Kenya.' },
  { cat: 'signage', q: 'Do you visit the site before quoting?', a: 'When measurements, mounting surfaces or access need checking, we arrange a site assessment before confirming the final quotation. Simple jobs with known dimensions can be quoted without one.' },
  { cat: 'signage', q: 'Can you brand vehicles?', a: 'Yes, from door logos and contact details to partial and full wraps, reflective graphics and consistent layouts across whole fleets of cars, vans, pickups, trucks and motorcycles.' },
  { cat: 'banners', q: 'Can you reprint a roll-up for a stand I already have?', a: 'Yes. Bring or describe the stand (narrow-base or broad-base; most are 85 × 200 cm) and we print a new graphic to fit it, which costs noticeably less than a complete new roll-up.' },
  { cat: 'banners', q: 'What is a backlit banner?', a: 'A banner printed on backlit flex and fitted in a lightbox, so light shines through it from behind. It is printed with denser ink so the colours stay strong when lit, which keeps it readable day and night.' },
  { cat: 'banners', q: 'Do media banners come with a frame?', a: 'Yes. Media banners are printed on fabric and fitted to a portable frame that folds into a carry bag. If you already own a compatible frame, we can print the fabric only.' },
  { cat: 'signage', q: 'How long do outdoor signs and banners last?', a: 'It depends on the material and exposure. Laminated vinyl and quality substrates last several years; PVC banners in direct Nairobi sun stay presentable for about a year. We recommend materials to match how long you need it.' },

  { cat: 'apparel', q: 'Can you print a single T-shirt?', a: 'Yes. DTF printing needs no screens, so one-off shirts and mixed-size orders are practical. Embroidery and screen printing suit larger or corporate orders.' },
  { cat: 'apparel', q: 'Which is better, embroidery or printing?', a: 'Neither is better in every case. Embroidery gives a stitched, premium finish for corporate logos on polos, shirts, caps and jackets. DTF printing suits detailed, colourful or large graphics. We recommend the right method for your garment and artwork.' },
  { cat: 'apparel', q: 'Can I bring my own garments?', a: 'Often yes. We check that the fabric suits the chosen branding method before production, and customer-supplied garments are approved before we start.' },
  { cat: 'apparel', q: 'How should printed garments be washed?', a: 'Wait 24 hours, wash inside out at 30–40°C, avoid bleach and do not iron directly on the print. Cared for this way, prints last as long as the garment.' },

  { cat: 'packaging', q: 'Which label material should I use?', a: 'It depends on the surface, moisture, refrigeration and handling. Paper suits dry goods; clear and white vinyl are waterproof and oil-resistant for drinks, cosmetics and chilled products. Tell us how the product is stored and we recommend the stock.' },
  { cat: 'packaging', q: 'Can you print barcodes and QR codes?', a: 'Yes. They can be built into labels and packaging. Supply the correct codes and always test-scan the proof before the full run.' },
  { cat: 'packaging', q: 'Can you design and print everything for a new product?', a: 'Yes. We can design and produce the label, box or sleeve, hang tags, inserts, bags and launch materials, and photograph the finished product for your online listings.' },

  { cat: 'gifts', q: 'Can you recommend gifts within our budget?', a: 'Yes. Share the number of recipients, the budget per person and the occasion, and we will propose suitable products and combinations.' },
  { cat: 'gifts', q: 'Can every gift carry a different name?', a: 'Yes. Names can be personalised on selected products at no extra setup cost with UV DTF or engraving. Send the list as a spreadsheet, spelled exactly as it should print.' },
  { cat: 'gifts', q: 'Can you make complete gift boxes?', a: 'Yes. We combine branded products with a custom box, printed card and packaging so the whole gift feels like one consistent brand experience.' },

  { cat: 'books', q: 'Can you help me self-publish a book?', a: 'Yes. We handle typesetting, cover design, ISBN guidance and printing, and send a printed proof copy before the run. You keep the rights and the print-ready files.' },
  { cat: 'books', q: 'Have you published books yourselves?', a: 'Yes. Betapixel designs, prints and publishes its own titles, including Betapixel’s Alphabet Colouring Book and Mindful Colouring – Pocket Edition, so we work through the same process our authors do.' },
  { cat: 'books', q: 'Do you edit manuscripts?', a: 'We typeset, lay out and design covers, and flag obvious errors we notice. For structural or copy editing we recommend a professional editor before the manuscript comes to us.' },

  { cat: 'branding', q: 'Can you handle our entire branding project?', a: 'Yes. Signage, office graphics, uniforms, stationery, vehicle branding, merchandise and packaging can be coordinated as one project with one point of contact, so everything matches.' },
  { cat: 'branding', q: 'Can you work with our existing brand guidelines?', a: 'Yes. We implement an established identity across physical applications, matching colours, logo usage and typography. If you have no guidelines, our design team can create them first.' },
  { cat: 'branding', q: 'Do you offer graphic design on its own?', a: 'Yes. Logos, brand identities, packaging, company profiles and print-ready artwork are designed in-house by a team that also prints, so every file is built for production.' },

  { cat: 'events', q: 'Can you brand a whole event?', a: 'Yes: entrance, registration, stage, media wall, directional signs, lanyards, badges, delegate packs, staff apparel and merchandise, designed as one visual identity.' },
  { cat: 'banners', q: 'What sizes do media banners come in?', a: 'Media banners, also called backdrop banners, come in three standard sizes (width by height): 2.25 m × 2.25 m, 3 m × 2.25 m and 6 m × 2.25 m. Each is printed on fabric and fitted to a portable frame. Custom sizes are quoted on request.' },
  { cat: 'events', q: 'How far ahead should we order event branding?', a: 'Allow at least a week for a typical conference package after artwork approval, longer for large backdrops or merchandise. Tell us the event date as well as the delivery date so we plan to the right deadline.' },

  { cat: 'turnaround', q: 'How long will my order take?', a: 'It depends on the product, quantity and finishing. UV DTF stickers are typically ready in 24–48 hours and many print jobs in a few working days. We confirm an estimated timeline with every quotation.' },
  { cat: 'turnaround', q: 'Do you offer same-day or urgent printing?', a: 'Sometimes, depending on the job and our production schedule. Urgent work may carry an extra charge and must be confirmed by us before it is accepted on that deadline.' },
  { cat: 'turnaround', q: 'When does production time start?', a: 'Once the artwork is approved and the required payment has been received, as stated on your quotation.' },

  { cat: 'payment', q: 'Do you require a deposit?', a: 'Orders may require full payment or a deposit before production begins. The payment terms for your job are stated on the quotation or invoice.' },
  { cat: 'payment', q: 'Can I cancel an order?', a: 'Before production starts, yes, though completed design work remains chargeable. Once materials are bought or production has begun, costs already committed may not be refundable, because custom products cannot be resold.' },

  { cat: 'delivery', q: 'Where is your printing shop in Nairobi?', a: 'Our studio is at The print hub building, Mezzanine Floor Room M02, Kweria Rd, Nairobi. We are open Monday to Friday 08:30–19:00 and Saturday 08:30–14:00, and closed on Sundays and public holidays.' },
  { cat: 'delivery', q: 'Can I collect my order?', a: 'Yes, from our studio at The print hub building, Mezzanine Floor Room M02, Kweria Rd, Nairobi, once we confirm it is ready.' },
  { cat: 'delivery', q: 'Do you deliver outside Nairobi?', a: 'Yes. We deliver within Nairobi and send orders by courier to towns across Kenya. Delivery is quoted separately from production.' },
];

export const faqsFor = (...cats: FaqCategory[]) => faqs.filter((f) => cats.includes(f.cat));
