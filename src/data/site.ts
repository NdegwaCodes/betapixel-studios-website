export const site = {
  url: 'https://betapixels.studio',
  name: 'Betapixel Studios',
  legalName: 'Betapixel Studios LTD',
  tagline: 'Build a brand people remember.',
  foundingYear: 2021,
  ageLine: 'since 2021',
  email: 'hello@betapixels.studio',
  vercelAnalytics: Boolean(process.env.VERCEL),
  phone: {
    e164: '+254746873985',
    display: '+254 746 873 985',
  },
  whatsapp: {
    number: '254746873985',
    message: 'Hello Betapixel Studios, I would like a quotation for: ',
  },
  address: {
    streetAddress: 'The print hub building, Mezzanine Floor Room M02 Kweria Rd',
    locality: 'Nairobi',
    region: 'Nairobi County',
    country: 'KE',
    countryName: 'Kenya',
  },
  geo: { lat: -1.2803217, lng: 36.8219142 } as null | { lat: number; lng: number },
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.822240018591!2d36.81933927583522!3d-1.2803163356214213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8feb4df1abbe5591%3A0x6954b865866c68e9!2sBetapixel%20studios!5e0!3m2!1sen!2ske!4v1790182286244!5m2!1sen!2ske',
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '19:00', label: 'Mon – Fri' },
    { days: ['Saturday'], opens: '08:30', closes: '14:00', label: 'Saturday' },
  ],
  closedLine: 'Sunday and public holidays: closed',
  priceRange: 'KSh',
  social: {
    instagram: 'https://www.instagram.com/betapixels.studio/',
    facebook: 'https://www.facebook.com/Betapixels.Studio/',
    tiktok: 'https://www.tiktok.com/@betapixels.studio',
    linkedin: 'https://www.linkedin.com/company/betapixel-studios/',
  },
  instagramHandle: '@betapixels.studio',
  googleBusiness: 'https://maps.google.com/?cid=7589894018212587753',
  googleMapsShort: 'https://maps.app.goo.gl/MRfbUB5x8XgCqkV89',
  form: { maxUploadMb: 4 },
  ga4Id: 'G-5J9SMK135W',
  responseWindow: 'itemised quotation within the working day',
} as const;

export const whatsappUrl = (context = '') =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message + context)}`;

export const addressLine = () => [site.address.streetAddress, site.address.locality].filter(Boolean).join(', ');
