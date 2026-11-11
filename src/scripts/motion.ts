import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const DESKTOP_PIN = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const FINE = '(min-width: 768px) and (hover: hover) and (pointer: fine)';

let lenis: Lenis | null = null;
const pad = (n: number) => String(n).padStart(2, '0');
const belowFold = (el: Element) => el.getBoundingClientRect().top > innerHeight * 0.92;

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });

  smoothScroll();
  const steps: (() => void)[] = [
    textReveals,
    sectionWipes,
    () => { marquee(); counters(); },
    () => {
      const mm = gsap.matchMedia();
      mm.add(FINE, () => cursor());
      mm.add('(min-width: 1024px) and (hover: hover) and (pointer: fine)', () => serviceRowThumb());
      mm.add(DESKTOP_PIN, () => pins());
      let t: number | undefined;
      addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 250); });
      addEventListener('bp:layout', () => ScrollTrigger.refresh());
      restoreScrollAfterPins();
    },
  ];
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 200 }) : setTimeout(fn, 16));
  const run = () => { const step = steps.shift(); if (step) { step(); idle(run); } };
  run();
}

function smoothScroll() {
  lenis = new Lenis({ lerp: 0.08, duration: 1.2, anchors: { offset: -90 }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
}

function textReveals() {
  const heads = new Set<HTMLElement>([
    ...document.querySelectorAll<HTMLElement>('main h1, main h2, [data-split]'),
  ]);
  const queue = [...heads].filter((el) => !el.closest('[data-hero], [data-pinseq], .visually-hidden') && !el.querySelector('a, button') && belowFold(el));
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 16));
  const next = () => {
    const el = queue.shift();
    if (!el) return;
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 100, duration: 0.9, stagger: 0.08, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
    idle(next);
  };
  next();

  const paras = [...document.querySelectorAll<HTMLElement>('main p, main .lead, main li.service-row, main .steps li, main .spec-list > div')]
    .filter((p) => !p.closest('[data-hero], [data-pinseq], .faq, form, .breadcrumbs') && belowFold(p));
  gsap.set(paras, { autoAlpha: 0, y: 20 });
  const io = new IntersectionObserver((entries) => {
    const show = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!show.length) return;
    show.forEach((el) => io.unobserve(el));
    gsap.to(show, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05, clearProps: 'transform,visibility' });
  }, { rootMargin: '0px 0px -12% 0px' });
  paras.forEach((p) => io.observe(p));
}

function sectionWipes() {
  const els = [...document.querySelectorAll<HTMLElement>('main .frame, main .card, main .table-wrap')]
    .filter((el) => !el.closest('[data-hero], [data-pinseq]') && !(el.classList.contains('frame') && el.closest('.card')) && belowFold(el));
  if (!els.length) return;
  gsap.set(els, { clipPath: 'inset(100% 0% 0% 0%)' });
  const io = new IntersectionObserver((entries) => {
    const show = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!show.length) return;
    show.forEach((el) => io.unobserve(el));
    gsap.to(show, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut', stagger: 0.06, clearProps: 'clipPath' });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach((el) => io.observe(el));
}

function marquee() {
  document.querySelectorAll<HTMLElement>('[data-marquee] .marquee__track').forEach((track) => {
    const anim = track.getAnimations()[0];
    if (!anim) return;
    const proxy = { rate: 1 };
    let dir = 1;
    ScrollTrigger.create({
      trigger: track, start: 'top bottom', end: 'bottom top',
      onUpdate(self) {
        dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 800, 3);
        gsap.to(proxy, {
          rate: dir * boost, duration: 0.4, ease: 'power2.out', overwrite: true,
          onUpdate: () => { anim.playbackRate = proxy.rate; },
          onComplete: () => { gsap.to(proxy, { rate: dir, duration: 1.2, ease: 'power2.out', onUpdate: () => { anim.playbackRate = proxy.rate; } }); },
        });
      },
    });
  });
}

function counters() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    if (!belowFold(el) || !Number.isFinite(end)) return;
    const decimals = (el.dataset.count?.split('.')[1] ?? '').length;
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: end, duration: 2, ease: 'power2.out',
      onUpdate: () => { el.textContent = obj.v.toFixed(decimals); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

function cursor() {
  const dot = document.querySelector<HTMLElement>('.cursor-dot');
  const ring = document.querySelector<HTMLElement>('.cursor-ring');
  if (!dot || !ring) return;
  document.documentElement.classList.add('has-cursor');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
  const setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') };
  const move = (e: PointerEvent) => { pos.x = e.clientX; pos.y = e.clientY; setDot.x(pos.x); setDot.y(pos.y); };
  const tick = () => {
    ringPos.x += (pos.x - ringPos.x) * 0.15;
    ringPos.y += (pos.y - ringPos.y) * 0.15;
    setRing.x(ringPos.x); setRing.y(ringPos.y);
  };
  gsap.ticker.add(tick);
  addEventListener('pointermove', move, { passive: true });

  const over = (e: Event) => {
    const t = e.target as HTMLElement;
    ring.classList.toggle('is-view', !!t.closest('[data-cursor="view"], .card'));
    ring.classList.toggle('is-hover', !!t.closest('a, button, summary, label, select, input, textarea'));
  };
  document.addEventListener('pointerover', over);

  const magnets = [...document.querySelectorAll<HTMLElement>('.btn, .hero__btn, .menu-btn, .wa-float')];
  const handlers = magnets.map((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * 16);
      yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * 12);
    };
    const lv = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', mv);
    el.addEventListener('pointerleave', lv);
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); gsap.set(el, { x: 0, y: 0 }); };
  });

  return () => {
    gsap.ticker.remove(tick);
    removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', over);
    handlers.forEach((h) => h());
    document.documentElement.classList.remove('has-cursor');
  };
}

function serviceRowThumb() {
  const lists = document.querySelectorAll<HTMLElement>('[data-service-rows]');
  if (!lists.length) return;
  const box = document.createElement('div');
  box.className = 'row-thumb';
  box.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  img.width = 520; img.height = 325;
  box.append(img);
  document.body.append(box);
  const xTo = gsap.quickTo(box, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(box, 'y', { duration: 0.5, ease: 'power3.out' });
  const cleanups: (() => void)[] = [];
  lists.forEach((list) => {
    const enter = (e: Event) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-thumb]');
      if (!a) return;
      if (img.getAttribute('src') !== a.dataset.thumb) img.src = a.dataset.thumb!;
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    };
    const move = (e: PointerEvent) => { xTo(e.clientX + 150); yTo(e.clientY); };
    const leave = () => gsap.to(box, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power3.in', overwrite: 'auto' });
    list.addEventListener('pointerover', enter);
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerleave', leave);
    cleanups.push(() => { list.removeEventListener('pointerover', enter); list.removeEventListener('pointermove', move); list.removeEventListener('pointerleave', leave); });
  });
  return () => { cleanups.forEach((c) => c()); box.remove(); };
}

function pins() {
  const seqs = [...document.querySelectorAll<HTMLElement>('[data-pinseq]')];
  const cleanups: (() => void)[] = [];

  seqs.forEach((seq) => {
    const panels = [...seq.querySelectorAll<HTMLElement>('.pinseq__panel')];
    const n = panels.length;
    if (n < 2) return;
    const stage = seq.querySelector<HTMLElement>('.pinseq__stage')!;
    const cur = seq.querySelector<HTMLElement>('[data-pin-current]');
    const bar = seq.querySelector<HTMLElement>('[data-pin-bar]');
    seq.classList.add('is-pinned');

    const setActive = (i: number) => {
      panels.forEach((p, j) => { p.style.pointerEvents = j === i ? 'auto' : 'none'; });
      if (cur) cur.textContent = pad(i + 1);
    };

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.addLabel('p0').to({}, { duration: 0.35 });
    for (let i = 1; i < n; i++) {
      tl.to(panels[i - 1], { opacity: 0, y: -48, duration: 1 })
        .fromTo(panels[i], { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1 }, '<')
        .addLabel(`p${i}`)
        .to({}, { duration: 0.35 });
    }

    const st = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: () => `+=${Math.min(n * 0.8, 3.5) * innerHeight}`,
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, animation: tl,
      onUpdate(self) {
        const t = self.progress * tl.duration();
        let i = 0;
        for (let k = 0; k < n; k++) if (t >= tl.labels[`p${k}`] - 0.5) i = k;
        setActive(i);
        if (bar) bar.style.transform = `scaleY(${self.progress})`;
      },
    });
    setActive(0);

    const yFor = (i: number) => st.start + (tl.labels[`p${i}`] / tl.duration()) * (st.end - st.start) + 2;

    const onFocus = (e: FocusEvent) => {
      const p = (e.target as HTMLElement).closest<HTMLElement>('.pinseq__panel');
      if (p) scrollToY(yFor(panels.indexOf(p)));
    };
    seq.addEventListener('focusin', onFocus);

    const toHash = (hash: string) => {
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      const p = target?.closest<HTMLElement>('.pinseq__panel');
      if (!p || !seq.contains(p)) return false;
      scrollToY(yFor(panels.indexOf(p)));
      return true;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!a || a.pathname !== location.pathname) return;
      if (toHash(a.hash)) { e.preventDefault(); e.stopPropagation(); history.pushState(null, '', a.hash); }
    };
    const onHash = () => toHash(location.hash);
    document.addEventListener('click', onClick, true);
    addEventListener('hashchange', onHash);
    if (location.hash) requestAnimationFrame(onHash);

    cleanups.push(() => {
      seq.removeEventListener('focusin', onFocus);
      document.removeEventListener('click', onClick, true);
      removeEventListener('hashchange', onHash);
      st.kill(true);
      tl.kill();
      gsap.set(panels, { clearProps: 'all' });
      seq.classList.remove('is-pinned');
    });
  });

  return () => cleanups.forEach((c) => c());
}

function restoreScrollAfterPins() {
  const key = `bp-scroll:${location.pathname}`;
  addEventListener('pagehide', () => { try { sessionStorage.setItem(key, String(scrollY)); } catch { } });
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type !== 'back_forward' || !document.querySelector('.pinseq.is-pinned')) return;
  let y: number | null = null;
  try { y = Number(sessionStorage.getItem(key)); } catch { }
  if (y && Number.isFinite(y)) { ScrollTrigger.refresh(); scrollToY(y); }
}
