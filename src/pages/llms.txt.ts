import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, addressLine } from '../data/site';
import { services } from '../data/services';
import { products } from '../data/products';
import { samples } from '../data/work';
import { categories } from '../data/portfolio';

export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
  const u = (p: string) => `${site.url}${p}`;
  const text = `# ${site.name}

> ${site.name} (${site.legalName}) is a printing, branding and publishing company in Nairobi, Kenya, founded in ${site.foundingYear}. It specialises in UV DTF stickers (also known as magic stickers and 3D crystal labels) and produces commercial printing, signage, custom apparel, corporate gifts, packaging and labels, corporate and event branding, and books. All work is produced in-house in Nairobi, with delivery across Kenya.

Key facts:
- Address: ${addressLine()}, Kenya
- Phone and WhatsApp: ${site.phone.display}
- Email: ${site.email}
- Hours: ${site.hours.map((h) => `${h.label} ${h.opens}–${h.closes}`).join('; ')}; ${site.closedLine}
- Founded: ${site.foundingYear}
- Prices: quoted per job (custom work); request a quote online or on WhatsApp
- Instagram: ${site.social.instagram}
- Facebook: ${site.social.facebook}
- Google Business Profile: ${site.googleBusiness}

## Services
${services.map((s) => `- [${s.name}](${u(`/${s.slug}/`)}): ${s.line}`).join('\n')}

## Betapixel Products (own publications, sold on Nuria Store)
${products.map((p) => `- [${p.name}](${u(`/products/${p.slug}/`)}): ${p.short}`).join('\n')}

## Guides
${guides.map((g) => `- [${g.data.headline}](${u(`/knowledge-centre/${g.id}/`)}): ${g.data.description}`).join('\n')}

## Portfolio (designs by Betapixel, shown as product mockups)
${categories.filter((c) => samples.some((x) => (x.category ?? x.service) === c.id)).map((c) => `- [${c.name} samples](${u(`/portfolio/?service=${c.id}`)}): ${samples.filter((x) => (x.category ?? x.service) === c.id).map((x) => x.title.toLowerCase()).join(', ')}`).join('\n')}

## Company
- [About](${u('/about/')})
- [Portfolio](${u('/portfolio/')})
- [FAQ](${u('/faq/')})
- [Request a quote](${u('/request-a-quote/')})
- [Contact](${u('/contact/')})
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
