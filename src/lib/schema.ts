import type { ImageMetadata } from 'astro';
import { site } from '../data/site';
import { services, type Service } from '../data/services';
import type { Product } from '../data/products';

export const ORG_ID = `${site.url}/#organization`;
export const abs = (path: string) => new URL(path, site.url).href;

export interface Faq { q: string; a: string }
export interface Crumb { name: string; path: string }

const postalAddress = () => ({
  '@type': 'PostalAddress',
  ...(site.address.streetAddress ? { streetAddress: site.address.streetAddress } : {}),
  addressLocality: site.address.locality,
  addressRegion: site.address.region,
  addressCountry: site.address.country,
});

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: `${site.url}/`,
    logo: abs('/logo-512.png'),
    image: abs('/og/betapixel-studios-share.jpg'),
    email: site.email,
    telephone: site.phone.e164,
    foundingDate: String(site.foundingYear),
    address: postalAddress(),
    ...(site.geo && { geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } }),
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: site.priceRange,
    areaServed: { '@type': 'Country', name: 'Kenya' },
    slogan: site.tagline,
    hasMap: site.googleBusiness,
    sameAs: [site.social.instagram, site.social.facebook, site.social.tiktok, site.social.linkedin, site.googleBusiness],
    knowsAbout: ['UV DTF stickers', 'Magic stickers', '3D crystal labels', 'Commercial printing', 'Large format printing', 'Signage',
      'Vehicle branding', 'DTF printing', 'Embroidery', 'Corporate gifts', 'Product labels', 'Packaging design', 'Book publishing',
      'Graphic design', 'Corporate branding', 'Event and exhibition branding'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Printing, branding and publishing services',
      itemListElement: services.map((sv) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: sv.name, url: abs(`/${sv.slug}/`) } })),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone.e164,
      contactType: 'sales',
      areaServed: 'KE',
      availableLanguage: ['en', 'sw'],
    },
    description: `Print and design studio in Nairobi, Kenya, ${site.ageLine}. UV DTF magic stickers, promotional branding, garment, sticker, label, large-format and bulk printing.`,
  };
}

export function breadcrumbs(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function service(s: Service, extra: Record<string, unknown> = {}, image = `/og/${s.art}.jpg`) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${abs(`/${s.slug}/`)}#service`,
    name: s.name,
    serviceType: s.name,
    description: s.description,
    url: abs(`/${s.slug}/`),
    image: abs(image),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Kenya' },
    ...extra,
  };
}

export function faqPage(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface HowToStep { name: string; text: string }
export function howTo(name: string, description: string, steps: HowToStep[], url: string, extra: Record<string, unknown> = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((st, i) => ({ '@type': 'HowToStep', position: i + 1, name: st.name, text: st.text, url: `${abs(url)}#step-${i + 1}` })),
    ...extra,
  };
}

export function article(p: { title: string; description: string; path: string; published: Date; updated?: Date; image: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    mainEntityOfPage: abs(p.path),
    image: abs(p.image),
    datePublished: p.published.toISOString(),
    dateModified: (p.updated ?? p.published).toISOString(),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export function imageGallery(name: string, path: string, images: { url: string; caption: string; width: number; height: number; name?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: abs(path),
    hasPart: images.map((im) => ({
      '@type': 'ImageObject',
      contentUrl: abs(im.url),
      ...(im.name ? { name: im.name } : {}),
      caption: im.caption,
      width: im.width,
      height: im.height,
      creator: { '@id': ORG_ID },
      creditText: site.name,
      copyrightNotice: `© ${site.legalName}`,
      license: abs('/terms-and-conditions/#website-images'),
      acquireLicensePage: abs('/contact/'),
    })),
  };
}

export function videoObjects(items: { title: string; caption: string; photo?: ImageMetadata; video?: { src: string; duration: number; date: string } }[]) {
  return items.filter((w) => w.video && w.photo).map((w) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: w.title,
    description: w.caption,
    thumbnailUrl: abs(w.photo!.src),
    contentUrl: abs(w.video!.src),
    uploadDate: `${w.video!.date}T12:00:00+03:00`,
    duration: `PT${Math.max(1, Math.round(w.video!.duration))}S`,
    creator: { '@id': ORG_ID },
  }));
}

export function webPage(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: abs(path),
    description,
    isPartOf: { '@type': 'WebSite', url: `${site.url}/`, name: site.name, publisher: { '@id': ORG_ID } },
  };
}

export function book(p: Product, path: string, imageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${abs(path)}#book`,
    name: p.name,
    alternateName: p.subtitle,
    description: p.short,
    url: abs(path),
    image: abs(imageUrl),
    bookFormat: 'https://schema.org/Paperback',
    inLanguage: 'en',
    genre: p.category,
    audience: { '@type': 'Audience', audienceType: p.audience },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    countryOfOrigin: { '@type': 'Country', name: 'Kenya' },
    potentialAction: { '@type': 'BuyAction', target: p.buyUrl, seller: { '@type': 'Organization', name: 'Nuria Store', url: 'https://nuriakenya.com/' } },
  };
}

export function itemList(name: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.url) })),
  };
}
