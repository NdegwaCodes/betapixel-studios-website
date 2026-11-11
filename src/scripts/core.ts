const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE_INOUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

const store = {
  get: (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { } },
  del: (k: string) => { try { sessionStorage.removeItem(k); } catch { } },
};

type Gtag = (...args: unknown[]) => void;
declare global { interface Window { __GA4?: string; dataLayer?: unknown[]; gtag?: Gtag } }
function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params);
}
function loadAnalytics() {
  const id = window.__GA4;
  if (!id || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); } as Gtag;
  window.gtag('js', new Date());
  window.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.append(s);
  if (document.body.dataset.conversion === 'lead') track('generate_lead', { form: 'quote' });
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-wa], a[href^="https://wa.me"]');
  if (a) track('whatsapp_click', { link_url: a.href, page_path: location.pathname });
  const t = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="tel:"]');
  if (t) track('phone_click', { page_path: location.pathname });
  const l = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
  if (l) track('link_in_bio_click', { link: l.dataset.link, page_path: location.pathname });
});

const header = document.querySelector<HTMLElement>('[data-header]');
const overlayHeader = header?.hasAttribute('data-overlay');
const hero = document.querySelector<HTMLElement>('[data-hero]');
let lastY = scrollY;
function onScroll() {
  if (!header) return;
  const y = scrollY;
  if (overlayHeader && hero) header.classList.toggle('is-over-hero', y < hero.offsetHeight - header.offsetHeight);
  const menuOpen = document.querySelector('.mobile-nav.is-open');
  header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4);
  if (y < lastY - 4 || y < 400) header.classList.remove('is-hidden');
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true });

const svcBtn = document.querySelector<HTMLButtonElement>('.nav__toggle');
const svcMenu = document.getElementById('mega-menu');
function setSvc(open: boolean) {
  svcBtn?.setAttribute('aria-expanded', String(open));
  svcMenu?.classList.toggle('is-open', open);
}
svcBtn?.addEventListener('click', () => setSvc(svcBtn.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('.nav__services')) setSvc(false); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (svcBtn?.getAttribute('aria-expanded') === 'true') { setSvc(false); svcBtn.focus(); }
  if (menuBtn?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
});
svcMenu?.addEventListener('focusout', (e) => { if (!svcMenu.parentElement!.contains(e.relatedTarget as Node)) setSvc(false); });

const menuBtn = document.querySelector<HTMLButtonElement>('.menu-btn');
const mobileNav = document.getElementById('mobile-nav');
function setMenu(open: boolean) {
  menuBtn?.setAttribute('aria-expanded', String(open));
  mobileNav?.classList.toggle('is-open', open);
  header?.classList.remove('is-hidden');
  if (open) header?.classList.remove('is-over-hero'); else onScroll();
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));

function runPreloader(): Promise<void> {
  const el = document.querySelector<HTMLElement>('.preloader');
  if (!html.classList.contains('has-pl') || !el) return Promise.resolve();
  store.set('bp-pl', '1');
  const done = () => { html.classList.remove('has-pl'); };

  if (innerWidth < 768) {
    return new Promise((res) => {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 150, easing: 'ease-out', fill: 'forwards' }).finished
        .then(done, done).then(() => res());
    });
  }

  const counter = el.querySelector<HTMLElement>('.preloader__count')!;
  const cols = [...el.querySelectorAll<HTMLElement>('.preloader__col')];
  const inner = el.querySelector<HTMLElement>('.preloader__inner')!;
  const CAP = 1800;
  const t0 = performance.now();

  const imgs = [...document.images].filter((i) => i.loading !== 'lazy');
  const tasks: Promise<unknown>[] = imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); })));
  tasks.push(document.fonts ? document.fonts.ready : Promise.resolve());
  let loaded = 0;
  tasks.forEach((p) => p.then(() => { loaded++; }));
  let shown = 0;

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const target = Math.max(loaded / tasks.length, Math.min((now - t0) / CAP, 1)) * 100;
      shown += (target - shown) * 0.18;
      if (target >= 100 && shown > 99.4) shown = 100;
      counter.textContent = String(Math.round(shown));
      if (shown >= 100 || now - t0 >= CAP) {
        counter.textContent = '100';
        inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
        const anims = cols.map((c, i) => c.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,-100%,0)' }],
          { duration: 800, delay: 150 + i * 60, easing: EASE_INOUT, fill: 'forwards' }));
        anims[anims.length - 1].finished.then(done, done).then(() => resolve());
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const panel = document.querySelector<HTMLElement>('.pt-panel');
function transitionIn() {
  if (!html.classList.contains('pt-in') || !panel) return;
  store.del('bp-pt');
  const a = panel.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,-100%,0)' }], { duration: 350, easing: EASE_INOUT, fill: 'forwards' });
  const end = () => { html.classList.remove('pt-in'); a.cancel(); };
  a.finished.then(end, end);
  const h1 = document.querySelector<HTMLElement>('main h1');
  if (h1 && !location.hash) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
}
function isInternal(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute('download') || a.origin !== location.origin) return false;
  if (a.pathname === location.pathname && (a.hash || a.search === location.search)) return false;
  if (/\.(xml|txt|pdf|jpg|png|webp|avif)$/i.test(a.pathname)) return false;
  return true;
}
if (!reduced && panel) {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || !isInternal(a, e)) return;
    e.preventDefault();
    store.set('bp-pt', '1');
    panel.animate([{ transform: 'translate3d(0,100%,0)' }, { transform: 'translate3d(0,0,0)' }], { duration: 350, easing: EASE_INOUT, fill: 'forwards' })
      .finished.then(() => { location.href = a.href; });
    setTimeout(() => { location.href = a.href; }, 600);
  });
}
addEventListener('pageshow', (e) => {
  if ((e as PageTransitionEvent).persisted && panel) {
    panel.getAnimations().forEach((a) => a.cancel());
    html.classList.remove('pt-in');
    store.del('bp-pt');
  }
});

document.querySelectorAll<HTMLInputElement>('[data-started]').forEach((i) => { if (!i.value) i.value = String(Date.now()); });
document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
  const err = form.querySelector<HTMLElement>('[data-form-error]')!;
  const ok = form.parentElement!.querySelector<HTMLElement>('[data-contact-success]')!;
  form.addEventListener('submit', async (e) => {
    if (!form.checkValidity()) return;
    const file = form.querySelector<HTMLInputElement>('input[type=file]')?.files?.[0];
    e.preventDefault();
    if (file && file.size > 4 * 1024 * 1024) {
      err.hidden = false;
      err.textContent = `That file is ${(file.size / 1048576).toFixed(1)} MB. The limit is 4 MB. Send larger files on WhatsApp or by email.`;
      return;
    }
    err.hidden = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json', 'x-requested-with': 'fetch' } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || 'We could not send your message just now.');
      form.hidden = true; ok.hidden = false;
      ok.querySelector('[data-contact-ref]')!.textContent = body.ref;
      ok.focus();
      track('generate_lead', { form: 'contact', ref: body.ref });
    } catch (x) {
      err.hidden = false;
      err.textContent = `${(x as Error).message} Please try WhatsApp on +254 746 873 985.`;
    }
  });
});
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-buy]');
  if (b) track('buy_at_nuria_click', { product: b.dataset.buy });
});

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((g) => {
  const main = g.querySelector<HTMLElement>('[data-gallery-main]')!;
  const slides = [...main.querySelectorAll<HTMLImageElement>('[data-gallery-slide]')];
  const thumbs = [...g.querySelectorAll<HTMLButtonElement>('[data-gallery-thumb]')];
  thumbs.forEach((t) => t.addEventListener('click', () => {
    const i = Number(t.dataset.galleryThumb);
    slides.forEach((s, j) => { s.style.display = j === i ? '' : 'none'; if (j === i && s.loading === 'lazy') s.loading = 'eager'; });
    thumbs.forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    main.classList.toggle('is-dark', slides[i].hasAttribute('data-dark'));
  }));
});

document.querySelectorAll<HTMLElement>('[data-open-badge]').forEach((el) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday');
  const mins = Number(get('hour')) * 60 + Number(get('minute'));
  const hours: Record<string, [number, number] | null> = { Mon: [510, 1140], Tue: [510, 1140], Wed: [510, 1140], Thu: [510, 1140], Fri: [510, 1140], Sat: [510, 840], Sun: null };
  const h = hours[day];
  const open = !!h && mins >= h[0] && mins < h[1];
  el.classList.toggle('is-open', open);
  el.textContent = open ? `Open now · closes ${day === 'Sat' ? '14:00' : '19:00'}` : 'Closed now · opens 08:30';
});

const faqSearch = document.querySelector<HTMLInputElement>('[data-faq-search]');
const faqFilter = document.querySelector<HTMLElement>('[data-faq-filter]');
if (faqSearch && faqFilter) {
  const groups = [...document.querySelectorAll<HTMLElement>('[data-faq-group]')];
  const empty = document.querySelector<HTMLElement>('[data-faq-empty]')!;
  const status = document.querySelector<HTMLElement>('[data-faq-status]')!;
  let topic = 'all';
  const apply = () => {
    const q = faqSearch.value.trim().toLowerCase();
    let n = 0;
    groups.forEach((g) => {
      let shown = 0;
      g.querySelectorAll<HTMLDetailsElement>('[data-faq-item]').forEach((d) => {
        const ok = (topic === 'all' || g.dataset.faqGroup === topic) && (!q || d.textContent!.toLowerCase().includes(q));
        d.hidden = !ok; if (ok) shown++;
        if (q && ok) d.open = true;
      });
      g.hidden = shown === 0; n += shown;
    });
    empty.hidden = n > 0;
    status.textContent = `${n} questions shown`;
  };
  faqSearch.addEventListener('input', apply);
  faqFilter.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-value]');
    if (!b) return;
    topic = b.dataset.value!;
    faqFilter.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
}

const topicFilter = document.querySelector<HTMLElement>('[data-topic-filter]');
if (topicFilter) {
  const items = [...document.querySelectorAll<HTMLElement>('[data-topic]')];
  const status = document.querySelector<HTMLElement>('[data-topic-status]')!;
  const set = (v: string) => {
    let n = 0;
    items.forEach((it) => { const ok = v === 'all' || it.dataset.topic === v; it.hidden = !ok; if (ok) n++; });
    topicFilter.querySelectorAll<HTMLButtonElement>('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.value === v)));
    status.textContent = `${n} guides shown`;
  };
  topicFilter.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-value]'); if (b) set(b.dataset.value!); });
  const q = new URLSearchParams(location.search).get('topic');
  if (q && topicFilter.querySelector(`[data-value="${CSS.escape(q)}"]`)) set(q);
}

type Consent = { analytics: boolean; marketing: boolean; t: number };
const CONSENT_KEY = 'bp-consent';
function readConsent(): Consent | null {
  try { const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); return c && Date.now() - c.t < 365 * 864e5 ? c : null; } catch { return null; }
}
const banner = document.querySelector<HTMLElement>('[data-cookie]');
if (banner) {
  const manage = banner.querySelector<HTMLElement>('[data-cookie-manage]')!;
  const toggle = banner.querySelector<HTMLButtonElement>('[data-cookie-toggle]')!;
  const saveBtn = banner.querySelector<HTMLButtonElement>('[data-cookie-save]')!;
  const cats = [...banner.querySelectorAll<HTMLInputElement>('[data-cookie-cat]')];
  const choose = (c: Omit<Consent, 't'>) => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...c, t: Date.now() })); } catch { }
    banner.hidden = true;
    if (c.analytics) loadAnalytics();
  };
  const open = () => {
    const c = readConsent();
    cats.forEach((x) => { x.checked = !!c?.[x.dataset.cookieCat as 'analytics' | 'marketing']; });
    banner.hidden = false;
  };
  banner.querySelector('[data-cookie-accept]')!.addEventListener('click', () => choose({ analytics: true, marketing: true }));
  banner.querySelector('[data-cookie-reject]')!.addEventListener('click', () => choose({ analytics: false, marketing: false }));
  toggle.addEventListener('click', () => {
    const show = manage.hidden;
    manage.hidden = !show; saveBtn.hidden = !show; toggle.setAttribute('aria-expanded', String(show));
  });
  saveBtn.addEventListener('click', () => choose({
    analytics: cats.find((x) => x.dataset.cookieCat === 'analytics')!.checked,
    marketing: cats.find((x) => x.dataset.cookieCat === 'marketing')!.checked,
  }));
  document.querySelectorAll('[data-cookie-open]').forEach((b) => b.addEventListener('click', open));
  if (!readConsent()) setTimeout(() => { banner.hidden = false; }, 1200);
}

document.querySelectorAll<HTMLButtonElement>('[data-map-load]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const box = btn.closest<HTMLElement>('.map-facade')!;
    const f = document.createElement('iframe');
    f.src = btn.dataset.mapLoad!;
    f.title = 'Map showing the Betapixel Studios location in Nairobi';
    f.loading = 'lazy';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    box.append(f);
    btn.closest('.map-facade__inner')?.remove();
  });
});

const clips = [...document.querySelectorAll<HTMLVideoElement>('video[data-inview-play]')];
if (clips.length) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) clips.forEach((v) => { v.controls = true; });
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    }), { threshold: 0.4 });
    clips.forEach((v) => io.observe(v));
  }
  const near = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const v = e.target as HTMLVideoElement;
    v.poster = v.dataset.poster ?? '';
    near.unobserve(v);
  }), { rootMargin: '400px 0px' });
  clips.forEach((v) => near.observe(v));
}

const filter = document.querySelector<HTMLElement>('[data-filter]');
if (filter) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-cat]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  const set = (v: string) => {
    filter.querySelectorAll<HTMLButtonElement>('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.value === v)));
    let n = 0;
    cards.forEach((c) => { const show = v === 'all' || c.dataset.cat === v || c.dataset.service === v; c.hidden = !show; if (show) n++; });
    if (status) status.textContent = `${n} items shown`;
    window.dispatchEvent(new Event('bp:layout'));
  };
  filter.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-value]');
    if (b) set(b.dataset.value!);
  });
  const q = new URLSearchParams(location.search).get('service');
  if (q && (filter.querySelector(`[data-value="${CSS.escape(q)}"]`) || cards.some((c) => c.dataset.service === q))) set(q);
}

requestAnimationFrame(onScroll);
const pre = runPreloader();
transitionIn();

const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
const boot = () => idle(() => {
  if (!reduced) pre.then(() => import('./motion').then((m) => m.initMotion()));
  if (readConsent()?.analytics) loadAnalytics();
});
if (document.readyState === 'complete') boot(); else addEventListener('load', boot, { once: true });

export {};
