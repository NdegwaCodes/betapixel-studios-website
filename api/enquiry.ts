const TO_DEFAULT = 'hello@betapixels.studio';
const FROM_DEFAULT = 'Betapixel Website <website@betapixels.studio>';
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXT = /\.(ai|pdf|eps|svg|psd|png|jpe?g|tiff?|zip)$/i;
const MIN_FILL_MS = 3000;
const MAX_FIELDS = 150;
const FIELD_KEY = /^[a-z][a-z0-9_]{0,39}$/;
const SEND_TIMEOUT_MS = 10_000;
const NO_STORE = { 'Cache-Control': 'no-store' };

export const SECTIONS: { title: string; fields: [string, string][] }[] = [
  { title: 'Project', fields: [['services', 'Services'], ['project', 'Project / product'], ['quantity', 'Quantity'], ['quantity_help', 'Needs help with quantity'], ['size', 'Dimensions / size'], ['description', 'Description']] },
  { title: 'UV DTF stickers', fields: [['uv_size', 'Transfer size (W × H)'], ['uv_qty', 'Quantity / sheets'], ['uv_surface', 'Surface'], ['uv_apply', 'Apply for customer']] },
  { title: 'Commercial printing', fields: [['print_product', 'Product'], ['print_size', 'Finished size'], ['print_sides', 'Sides'], ['print_finish', 'Finishing']] },
  { title: 'Banners', fields: [['banner_type', 'Banner type'], ['banner_size', 'Size'], ['banner_env', 'Indoor / outdoor']] },
  { title: 'Signage', fields: [['sign_type', 'Sign type'], ['sign_dims', 'Approx. dimensions'], ['sign_env', 'Indoor / outdoor'], ['sign_install', 'Installation'], ['sign_location', 'Installation location']] },
  { title: 'Apparel', fields: [['garment', 'Garments'], ['garment_qty', 'Quantity of each item'], ['garments_own', 'Customer has garments'], ['placement', 'Branding placement'], ['method', 'Preferred method']] },
  { title: 'Packaging & labels', fields: [['pack_product', 'Product being packaged'], ['pack_type', 'Packaging / label type'], ['pack_dims', 'Dimensions'], ['pack_env', 'Water / refrigeration / handling']] },
  { title: 'Corporate gifts', fields: [['recipients', 'Number of recipients'], ['budget_pp', 'Budget per person (KSh)'], ['occasion', 'Occasion'], ['recommend', 'Recommend products']] },
  { title: 'Corporate branding', fields: [['branding_what', 'Branding'], ['consult', 'Consultation / site assessment']] },
  { title: 'Events & exhibitions', fields: [['event_type', 'Event type'], ['attendance', 'Expected attendance'], ['venue', 'Venue']] },
  { title: 'Book publishing', fields: [['book_stage', 'Manuscript stage'], ['book_size', 'Trim size'], ['copies', 'Copies']] },
  { title: 'Artwork', fields: [['artwork_status', 'Artwork status'], ['artwork_link', 'Artwork link'], ['artwork_notes', 'Artwork instructions']] },
  { title: 'Deadline & delivery', fields: [['required_date', 'Required date'], ['date_flexible', 'Date flexible'], ['for_event', 'For an event'], ['event_date', 'Event date'], ['delivery', 'Collection / delivery'], ['delivery_area', 'Delivery area / town']] },
  { title: 'Contact', fields: [['name', 'Name'], ['company', 'Company / organisation'], ['kra_pin', 'KRA PIN'], ['phone', 'Phone / WhatsApp'], ['email', 'Email'], ['contact_pref', 'Preferred contact'], ['subject', 'Subject'], ['message', 'Message'], ['page', 'Sent from page']] },
];
const SKIP = new Set(['form_type', 'company-website', 'started', 'consent', 'files']);

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function makeRef(prefix: 'BPQ' | 'BPC', now = new Date(), rand = Math.random) {
  const d = now.toISOString().slice(2, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += chars[Math.floor(rand() * chars.length)];
  return `${prefix}-${d}-${r}`;
}

export function collect(form: FormData) {
  const out = new Map<string, string>();
  let n = 0;
  for (const [raw, v] of form.entries()) {
    if (++n > MAX_FIELDS) break;
    const k = raw.endsWith('[]') ? raw.slice(0, -2) : raw;
    if (typeof v !== 'string' || SKIP.has(k) || !FIELD_KEY.test(k)) continue;
    const val = v.trim().slice(0, 4000);
    if (!val) continue;
    out.set(k, out.has(k) ? `${out.get(k)}, ${val}` : val);
  }
  return out;
}

export function renderEmail(kind: 'quote' | 'contact', ref: string, data: Map<string, string>, files: string[]) {
  const used = new Set<string>();
  const blocks: { title: string; rows: [string, string][] }[] = [];
  for (const s of SECTIONS) {
    const rows = s.fields.filter(([k]) => data.has(k)).map(([k, label]) => { used.add(k); return [label, data.get(k)!] as [string, string]; });
    if (rows.length) blocks.push({ title: s.title, rows });
  }
  const other = [...data.entries()].filter(([k]) => !used.has(k));
  if (other.length) blocks.push({ title: 'Other details', rows: other });
  if (files.length) blocks.push({ title: 'Attached files', rows: files.map((f, i) => [`File ${i + 1}`, f]) });

  const heading = kind === 'quote' ? 'New quote request' : 'New website message';
  const text = [`${heading} — ${ref}`, '', ...blocks.flatMap((b) => [`== ${b.title} ==`, ...b.rows.map(([l, v]) => `${l}: ${v}`), ''])].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#F7F9FC;font-family:Arial,Helvetica,sans-serif;color:#1C274C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border:1px solid #E7ECF4;border-radius:16px;overflow:hidden">
<tr><td style="background:#10297D;padding:22px 28px;color:#fff">
<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Betapixel Studios · ${esc(heading)}</div>
<div style="font-size:26px;font-weight:bold;margin-top:6px">${esc(ref)}</div></td></tr>
${blocks.map((b) => `<tr><td style="padding:20px 28px 4px"><div style="font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#B04A12;margin-bottom:8px">${esc(b.title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${b.rows.map(([l, v]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E7ECF4;width:38%;vertical-align:top;font-weight:bold;font-size:14px">${esc(l)}</td><td style="padding:8px 0;border-bottom:1px solid #E7ECF4;font-size:14px;white-space:pre-line">${esc(v)}</td></tr>`).join('')}</table></td></tr>`).join('')}
<tr><td style="padding:20px 28px 26px;font-size:13px;color:#505a7a">Reply to this email to answer the customer directly.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: `${kind === 'quote' ? 'Quote request' : 'Website message'} ${ref} — ${data.get('name') ?? 'Customer'}${data.get('services') ? ` · ${data.get('services')}` : ''}`, text, html };
}

function confirmation(ref: string, name: string, kind: 'quote' | 'contact') {
  const what = kind === 'quote' ? 'quote request' : 'message';
  const text = `Hello ${name},\n\nThank you — your ${what} has reached Betapixel Studios. Your reference is ${ref}.\n\nWe will review the details and get back to you on WhatsApp or by email. If it is urgent, message us on WhatsApp at +254 746 873 985 and mention your reference.\n\nBetapixel Studios\nThe print hub building, Mezzanine Floor Room M02 Kweria Rd, Nairobi\nhttps://betapixels.studio`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1C274C;font-size:15px;line-height:1.6">${esc(text).replace(/\n/g, '<br>')}</div>`;
  return { subject: `We received your ${what} — ${ref}`, text, html };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE } });

function sameSite(origin: string, req: Request): boolean {
  let host: string;
  try { host = new URL(origin).host; } catch { return false; }
  const own = [new URL(req.url).host, req.headers.get('x-forwarded-host'), req.headers.get('host')];
  return own.some((h) => h && h.split(',')[0].trim() === host);
}

export async function POST(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
  const wantsHtml = (req.headers.get('accept') ?? '').includes('text/html') && !(req.headers.get('x-requested-with'));
  const fail = (error: string, status = 400) => (wantsHtml ? new Response(`<p>${esc(error)}</p><p><a href="/request-a-quote/">Go back</a></p>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...NO_STORE } }) : json({ ok: false, error }, status));

  const origin = req.headers.get('origin');
  if (origin && !sameSite(origin, req)) return fail('This form can only be sent from the Betapixel website.', 403);

  let form: FormData;
  try { form = await req.formData(); } catch { return fail('Could not read the form.'); }

  const kind = form.get('form_type') === 'contact' ? 'contact' : 'quote';
  const ref = makeRef(kind === 'quote' ? 'BPQ' : 'BPC');

  const started = Number(form.get('started') ?? 0);
  if (String(form.get('company-website') ?? '') !== '' || (started && Date.now() - started < MIN_FILL_MS)) {
    return wantsHtml ? Response.redirect(new URL(`/thank-you/?ref=${ref}`, req.url).toString(), 303) : json({ ok: true, ref });
  }

  const data = collect(form);
  const name = data.get('name');
  const phone = data.get('phone');
  const email = data.get('email');
  if (!name || !(phone || email)) return fail('Please give your name and a phone number or email.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please check the email address.');
  const kra = data.get('kra_pin')?.replace(/\s+/g, '').toUpperCase();
  if (kra) {
    if (!/^[AP]\d{9}[A-Z]$/.test(kra)) return fail('Please check the KRA PIN (e.g. A123456789B), or leave it blank.');
    data.set('kra_pin', kra);
  }

  const attachments: { filename: string; content: string }[] = [];
  const names: string[] = [];
  let total = 0;
  for (const f of [...form.getAll('files'), ...form.getAll('files[]')]) {
    if (typeof f === 'string' || !f.size) continue;
    if (!ALLOWED_EXT.test(f.name)) return fail(`${f.name}: file type not accepted.`);
    total += f.size;
    if (total > MAX_TOTAL_BYTES) return fail('Attachments are over 4 MB in total — please share large artwork as a link instead.');
    attachments.push({ filename: f.name.replace(/[^\w.\- ]+/g, '_'), content: Buffer.from(await f.arrayBuffer()).toString('base64') });
    names.push(`${f.name} (${Math.round(f.size / 1024)} KB)`);
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return fail('The enquiry service is not configured yet. Please use WhatsApp: +254 746 873 985.', 503);
  const to = process.env.ENQUIRY_TO || TO_DEFAULT;
  const from = process.env.ENQUIRY_FROM || FROM_DEFAULT;
  const mail = renderEmail(kind, ref, data, names);

  const send = (payload: Record<string, unknown>) => fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });

  const res = await send({ from, to: [to], reply_to: email || undefined, subject: mail.subject, text: mail.text, html: mail.html, attachments: attachments.length ? attachments : undefined }).catch(() => null);
  if (!res?.ok) {
    console.error('Resend error', res?.status ?? 'unreachable', res ? await res.text().catch(() => '') : '');
    return fail('We could not send your enquiry just now. Please try again or use WhatsApp: +254 746 873 985.', 502);
  }
  if (email) {
    const c = confirmation(ref, name, kind);
    await send({ from, to: [email], reply_to: to, subject: c.subject, text: c.text, html: c.html }).catch(() => undefined);
  }

  return wantsHtml ? Response.redirect(new URL(`/thank-you/?ref=${ref}`, req.url).toString(), 303) : json({ ok: true, ref });
}
