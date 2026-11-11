import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as handler, makeRef, renderEmail, collect, esc } from '../api/enquiry.ts';

type Sent = { url: string; body: any };
let sent: Sent[] = [];
const realFetch = globalThis.fetch;

beforeEach(() => {
  sent = [];
  process.env.RESEND_API_KEY = 'test_key';
  delete process.env.ENQUIRY_TO;
  globalThis.fetch = (async (url: string, init: any) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ id: 'x' }), { status: 200 });
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; });

const base = (extra: Record<string, string | string[]> = {}) => {
  const f = new FormData();
  const fields: Record<string, string | string[]> = {
    form_type: 'quote', started: String(Date.now() - 60_000), 'company-website': '',
    'services[]': ['UV DTF Stickers', 'Corporate Gifts'], project: '200 branded bottles', quantity: '200',
    uv_size: '80 × 40 mm', uv_surface: 'Metal', name: 'Jane Wanjiru', phone: '0712345678', email: 'jane@example.com', ...extra,
  };
  for (const [k, v] of Object.entries(fields)) for (const x of [v].flat()) f.append(k, x);
  return f;
};
const post = (form: FormData, headers: Record<string, string> = { 'x-requested-with': 'fetch', accept: 'application/json' }) =>
  handler(new Request('https://betapixels.studio/api/enquiry', { method: 'POST', body: form, headers }));

test('valid quote: emails the studio (formatted, reply-to customer) and confirms to the customer', async () => {
  const f = base();
  f.append('files[]', new File([new Uint8Array(2048)], 'logo.pdf', { type: 'application/pdf' }));
  const res = await post(f);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.match(body.ref, /^BPQ-\d{6}-[A-Z2-9]{4}$/);
  assert.equal(sent.length, 2);
  const studio = sent[0].body;
  assert.deepEqual(studio.to, ['hello@betapixels.studio']);
  assert.equal(studio.reply_to, 'jane@example.com');
  assert.match(studio.subject, /Quote request BPQ-.* — Jane Wanjiru · UV DTF Stickers, Corporate Gifts/);
  assert.match(studio.html, /UV DTF stickers/);
  assert.match(studio.html, /80 × 40 mm/);
  assert.equal(studio.attachments.length, 1);
  assert.equal(studio.attachments[0].filename, 'logo.pdf');
  assert.deepEqual(sent[1].body.to, ['jane@example.com']);
  assert.match(sent[1].body.subject, /We received your quote request — BPQ-/);
});

test('missing name or contact is rejected without sending', async () => {
  const res = await post(base({ name: '' }));
  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
  const res2 = await post(base({ phone: '', email: '' }));
  assert.equal(res2.status, 400);
});

test('optional KRA PIN: normalised into the studio email, rejected when malformed', async () => {
  const res = await post(base({ kra_pin: ' p051234567x ' }));
  assert.equal(res.status, 200);
  assert.match(sent[0].body.html, /KRA PIN/);
  assert.match(sent[0].body.html, /P051234567X/);
  sent.length = 0;
  const bad = await post(base({ kra_pin: '12345' }));
  assert.equal(bad.status, 400);
  assert.equal(sent.length, 0);
});

test('cross-site posts are refused; unknown field names are ignored', async () => {
  const res = await post(base(), { 'x-requested-with': 'fetch', accept: 'application/json', origin: 'https://evil.example' });
  assert.equal(res.status, 403);
  assert.equal(sent.length, 0);
  const ok = await post(base({ 'Bad Key<script>': 'x' }), { 'x-requested-with': 'fetch', accept: 'application/json', origin: 'https://betapixels.studio' });
  assert.equal(ok.status, 200);
  assert.doesNotMatch(sent[0].body.html, /Bad Key/);
});

test('invalid email is rejected', async () => {
  const res = await post(base({ email: 'not-an-email' }));
  assert.equal(res.status, 400);
});

test('honeypot and too-fast submissions pretend success but send nothing', async () => {
  const r1 = await post(base({ 'company-website': 'http://spam' }));
  assert.equal((await r1.json()).ok, true);
  const r2 = await post(base({ started: String(Date.now()) }));
  assert.equal((await r2.json()).ok, true);
  assert.equal(sent.length, 0);
});

test('attachments over 4 MB total or of a disallowed type are rejected', async () => {
  const big = base();
  big.append('files', new File([new Uint8Array(4.5 * 1024 * 1024)], 'huge.png'));
  assert.equal((await post(big)).status, 400);
  const bad = base();
  bad.append('files', new File([new Uint8Array(10)], 'virus.exe'));
  assert.equal((await post(bad)).status, 400);
  assert.equal(sent.length, 0);
});

test('no-JS form post redirects to /thank-you/ with the reference', async () => {
  const res = await post(base(), { accept: 'text/html' });
  assert.equal(res.status, 303);
  assert.match(res.headers.get('location') ?? '', /\/thank-you\/\?ref=BPQ-/);
});

test('contact form uses the BPC prefix and a message subject', async () => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ form_type: 'contact', started: String(Date.now() - 10_000), name: 'Otieno', phone: '0700000000', subject: 'Visit', message: 'Can I visit on Saturday?' })) f.append(k, v);
  const res = await post(f);
  const body = await res.json();
  assert.match(body.ref, /^BPC-/);
  assert.match(sent[0].body.subject, /Website message BPC-/);
  assert.equal(sent.length, 1);
});

test('missing API key fails safely with 503 and a WhatsApp fallback message', async () => {
  delete process.env.RESEND_API_KEY;
  const res = await post(base());
  assert.equal(res.status, 503);
  assert.match((await res.json()).error, /WhatsApp/);
});

test('helpers: escaping, multi-value collection, stable reference format', () => {
  assert.equal(esc('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  const f = new FormData(); f.append('placement', 'Front'); f.append('placement', 'Back'); f.append('consent', 'yes');
  const c = collect(f);
  assert.equal(c.get('placement'), 'Front, Back');
  assert.equal(c.has('consent'), false);
  assert.equal(makeRef('BPQ', new Date('2026-09-24T10:00:00Z'), () => 0), 'BPQ-260924-AAAA');
  const m = renderEmail('quote', 'BPQ-1', new Map([['name', '<script>'], ['odd_field', 'x']]), []);
  assert.ok(!m.html.includes('<script>'));
  assert.match(m.text, /Other details/);
});
