# Betapixel Studios — website

The website for [Betapixel Studios](https://betapixels.studio), a print and branding studio in Nairobi. A static site built with Astro 7, GSAP 3 (ScrollTrigger, SplitText) and Lenis, with self-hosted Manrope + K2D type (OFL). Quote and contact forms email the studio through a small PHP endpoint on cPanel, or a serverless function on Vercel.

**Live:** https://betapixels.studio

## Highlights

- Service pages, a product catalogue and a Knowledge Centre generated from typed data files and Markdown collections
- Content schema that rejects SEO titles of 60+ characters and descriptions outside 200 to 240 characters
- An audit script that fails the build on SEO regressions
- Quote forms with file uploads, rate limiting and an emailed reference number
- Redirect map from the old WordPress site, generated into the host config

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 22+) |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static build to `dist/` |
| `npm run preview` | Serve the built site |
| `npm test` | Run the enquiry email function tests |
| `npm run verify` | Type-check, tests, build, SEO/content audit, regenerate the handover table |
| `npm run art` | Regenerate the placeholder vector illustrations, OG images and logo derivatives |
| `npm run redirects` | Regenerate the `redirects` in `vercel.json` and `docs/redirect-map.csv` |

## Editing content

- Business details (address, phone, hours, GA4 ID): `src/data/site.ts` — one place, used everywhere.
- Service pages: `src/pages/<service>.astro`; titles and descriptions: `src/data/services.ts`; FAQs: `src/data/faqs.ts`.
- Betapixel Products: add an entry to `src/data/products.ts` (images in `src/assets/products/`) — it appears automatically.
- Knowledge Centre: add a Markdown file to `src/content/guides/`. The schema rejects titles of 60+ characters and descriptions outside 200–240.
- Run `npm run verify` before deploying; it fails on SEO regressions.

Production runs on cPanel: `npm run build:cpanel` packages the site and the PHP enquiry endpoint, configured by a `betapixels-config.php` kept outside the web root (see `cpanel/betapixels-config.sample.php`). A Vercel setup (`vercel.json`, `api/enquiry.ts`) is also supported.
