import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parse } from 'node-html-parser';
import { titleCase } from '../src/lib/titleCase.ts';

const DIST = 'dist';
const SITE = 'https://betapixels.studio';
const SERVICES = ['uv-dtf-stickers', 'commercial-printing', 'signage', 'banners', 'custom-apparel', 'corporate-gifts',
  'packaging-labels', 'book-publishing', 'corporate-branding', 'events-exhibitions'];
const WORDS = [900, 3200];
const DESC = [120, 160];
const BANNED = [/\baffordable\b/i, /best in kenya/i, /one-stop shop/i, /we pride ourselves/i, /\bunlock\b/i, /\belevate\b/i, /next level/i, /over 10 years/i, /\b10\+? years\b/i];

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(basename(f)));
const urlOf = (f) => '/' + relative(DIST, f).split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '/');
const exists = (path) => {
  const clean = path.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return existsSync(join(DIST, 'index.html'));
  return existsSync(join(DIST, clean)) || existsSync(join(DIST, clean, 'index.html'));
};

const errors = [];
const titles = new Map();
const warn = [];
const report = [];
const fail = (url, msg) => errors.push(`${url}: ${msg}`);

for (const file of pages) {
  const url = urlOf(file);
  const html = readFileSync(file, 'utf8');
  const root = parse(html);
  const noindex = !!root.querySelector('meta[name="robots"][content*="noindex"]');
  const title = root.querySelector('title')?.text.trim() ?? '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const h1s = root.querySelectorAll('h1');

  if (h1s.length !== 1) fail(url, `expected 1 <h1>, found ${h1s.length}`);
  for (const h of root.querySelectorAll('h1, h2, h3, h4')) {
    const text = h.text.replace(/\s+/g, ' ').trim();
    if (text && titleCase(text) !== text) fail(url, `heading not in Title Case: "${text}" (expected "${titleCase(text)}")`);
  }
  if (!noindex) {
    if (title.length === 0 || title.length >= 60) fail(url, `title length ${title.length} (must be < 60): ${title}`);
    if (desc.length < DESC[0] || desc.length > DESC[1]) fail(url, `meta description length ${desc.length} (${DESC[0]}–${DESC[1]})`);
    if (canonical !== SITE + url) fail(url, `canonical ${canonical} ≠ ${SITE + url}`);
    if (!root.querySelector('meta[property="og:image"]')) fail(url, 'missing og:image');
  }

  const ld = root.querySelectorAll('script[type="application/ld+json"]').map((s) => { try { return JSON.parse(s.text); } catch { fail(url, 'invalid JSON-LD'); return {}; } });
  const types = ld.flatMap((o) => [].concat(o['@type'] ?? []));
  if (url !== '/' && !noindex && url !== '/404/' && !types.includes('BreadcrumbList')) fail(url, 'missing BreadcrumbList');
  if (url === '/' && !types.includes('LocalBusiness')) fail(url, 'home missing Organization/LocalBusiness');
  if (root.querySelector('.faq') && !types.includes('FAQPage')) fail(url, 'FAQ block without FAQPage schema');
  for (const o of ld) {
    const t = [].concat(o['@type'] ?? []);
    const need = (keys) => keys.filter((k) => o[k] === undefined || (Array.isArray(o[k]) && !o[k].length)).forEach((k) => fail(url, `${t[0]} missing ${k}`));
    if (t.includes('FAQPage')) { need(['mainEntity']); o.mainEntity.forEach((q) => { if (!q.name || !q.acceptedAnswer?.text) fail(url, 'FAQ question without name/answer'); }); }
    if (t.includes('BreadcrumbList')) { need(['itemListElement']); o.itemListElement.forEach((i, n) => { if (i.position !== n + 1 || !i.name || !i.item) fail(url, 'bad breadcrumb item'); }); }
    if (t.includes('Article')) need(['headline', 'image', 'datePublished', 'dateModified', 'author']);
    if (t.includes('HowTo')) need(['name', 'step']);
    if (t.includes('Service')) need(['name', 'provider', 'areaServed']);
    if (t.includes('LocalBusiness')) need(['name', 'address', 'telephone', 'openingHoursSpecification', 'sameAs']);
    if (t.includes('CollectionPage')) (o.hasPart ?? []).forEach((im) => { if (im['@type'] !== 'ImageObject' || !im.contentUrl) fail(url, 'bad ImageObject'); });
  }
  if (url === '/uv-dtf-stickers/' && !types.includes('HowTo')) fail(url, 'flagship missing HowTo schema');
  if (url.startsWith('/knowledge-centre/') && url !== '/knowledge-centre/' && !types.includes('Article')) fail(url, 'guide missing Article schema');
  if (/^\/products\/[^/]+\/$/.test(url) && !types.includes('Book')) fail(url, 'product page missing Book schema');
  if (!noindex) { if (titles.has(title)) fail(url, `duplicate title with ${titles.get(title)}`); titles.set(title, url); }

  for (const img of root.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) fail(url, `img without alt: ${img.getAttribute('src')}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) fail(url, `img without width/height: ${img.getAttribute('src')}`);
  }

  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//') && !exists(href)) fail(url, `broken internal link ${href}`);
    if (/^(click here|here|read more)$/i.test(a.text.trim())) fail(url, `non-descriptive anchor "${a.text.trim()}"`);
  }

  const main = root.querySelector('main');
  const text = (main?.text ?? '').replace(/\s+/g, ' ');
  for (const re of BANNED) if (re.test(text)) fail(url, `banned phrase ${re}`);
  if (/!(\s|$)/.test(main?.querySelectorAll('p, h1, h2, h3, li').map((n) => n.text).join(' ') ?? '')) warn.push(`${url}: exclamation mark in copy`);

  const slug = url.replace(/\//g, '');
  if (SERVICES.includes(slug)) {
    const article = main.querySelector('article');
    const plain = (article?.innerHTML ?? '').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
    const words = plain.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    const bodyLinks = new Set((article?.querySelectorAll('a[href]') ?? []).map((a) => a.getAttribute('href')));
    const siblings = SERVICES.filter((s) => s !== slug && bodyLinks.has(`/${s}/`)).length;
    const blog = [...bodyLinks].some((h) => h.startsWith('/knowledge-centre/'));
    if (words < WORDS[0] || words > WORDS[1]) fail(url, `service copy ${words} words (${WORDS[0]}–${WORDS[1]})`);
    if (siblings < 3) fail(url, `only ${siblings} sibling service links in body copy`);
    if (!blog) fail(url, 'no link down to a Knowledge Centre guide');
    report.push({ url, words, siblings, title, titleLen: title.length, descLen: desc.length });
  }
}

const LEAKS = [/[A-Za-z]:\x5C(Users|Websites)/, /\/Users\/[A-Za-z]/, /localhost:\d/, /127\.0\.0\.1/, /\bTODO\b|\bFIXME\b/, /RESEND_API_KEY|\bre_[A-Za-z0-9]{20,}/];
if (files.some((f) => f.endsWith('.map'))) fail('build', 'source maps must not be published');
for (const f of files.filter((f) => /\.(html|js|css|txt|xml|svg|json)$/.test(f))) {
  const t = readFileSync(f, 'utf8');
  const u = '/' + relative(DIST, f).split(sep).join('/');
  if (/\.(html|svg|xml)$/.test(f) && t.includes('<!--')) fail(u, 'comment in published markup');
  if (/\.(js|css)$/.test(f) && t.includes('/*')) fail(u, 'comment in published script or stylesheet');
  if (/\.(html|js)$/.test(f) && /\bconsole\.[a-z]+\(|\bdebugger\b/.test(t)) fail(u, 'console or debugger call in published code');
  if (t.includes('sourceMappingURL')) fail(u, 'source map reference');
  for (const re of LEAKS) if (re.test(t)) fail(u, `internal detail in published output (${re})`);
}

const js = files.filter((f) => f.endsWith('.js'));
const jsGz = js.reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0);
if (jsGz > 180 * 1024) fail('budget', `total JS ${Math.round(jsGz / 1024)} KB gz > 180 KB`);

console.log('\nService pages');
console.table(report.map((r) => ({ url: r.url, words: r.words, siblings: r.siblings, title: r.titleLen, desc: r.descLen })));
console.log(`Pages: ${pages.length} · JS total: ${(jsGz / 1024).toFixed(1)} KB gz across ${js.length} files`);
warn.forEach((w) => console.log('WARN', w));
if (errors.length) { console.error('\nFAIL\n' + errors.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log('\nAudit passed.');
