const DWELL = 5000;
const WIPE = 900;
const EASE_INOUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function initHero() {
  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root) return;
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-goto]')];
  const current = root.querySelector<HTMLElement>('[data-hero-current]')!;
  const bar = root.querySelector<HTMLElement>('[data-hero-progress]')!;
  const live = root.querySelector<HTMLElement>('[data-hero-live]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-hero-toggle]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let userPaused = reduced;
  let hoverPause = false;
  let focusPause = false;
  let hiddenPause = document.hidden;
  let progress: Animation | null = null;
  let kenBurns: Animation | null = null;
  let running: Animation[] = [];

  const isPaused = () => userPaused || hoverPause || focusPause || hiddenPause;
  const pad = (n: number) => String(n).padStart(2, '0');
  const imgOf = (i: number) => slides[i]?.querySelector('img');

  function warm(i: number) {
    const img = imgOf(i % slides.length);
    if (img && img.loading === 'lazy') img.loading = 'eager';
  }

  function startTimers() {
    progress?.cancel();
    kenBurns?.cancel();
    if (reduced) { bar.style.transform = 'scaleX(0)'; return; }
    progress = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DWELL, easing: 'linear', fill: 'forwards' });
    progress.onfinish = () => go(index + 1, false);
    const img = imgOf(index);
    if (img) kenBurns = img.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }], { duration: DWELL + WIPE, easing: 'linear', fill: 'forwards' });
    syncPause();
  }

  function syncPause() {
    const p = isPaused();
    if (progress) p ? progress.pause() : progress.play();
    if (kenBurns) p ? kenBurns.pause() : kenBurns.play();
    toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    toggle.classList.toggle('is-paused', userPaused);
  }

  function go(target: number, byUser: boolean) {
    const n = (target + slides.length) % slides.length;
    if (n === index) return;
    running.forEach((a) => a.finish());
    running = [];
    const out = slides[index];
    const inn = slides[n];
    out.classList.remove('is-active');
    inn.classList.add('is-active');

    if (!reduced) {
      out.classList.add('is-leaving');
      const a = inn.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: WIPE, easing: EASE_INOUT });
      const b = out.animate([{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(100% 0 0 0)' }], { duration: WIPE, easing: EASE_INOUT });
      b.finished.then(() => out.classList.remove('is-leaving')).catch(() => out.classList.remove('is-leaving'));
      running.push(a, b);
      inn.querySelectorAll<HTMLElement>('.mask > span').forEach((el, i) => {
        running.push(el.animate([{ transform: 'translate3d(0, 100%, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
          { duration: 800, delay: 200 + i * 60, easing: EASE_OUT, fill: 'backwards' }));
      });
    }

    index = n;
    current.textContent = pad(n + 1);
    dots.forEach((d, i) => d.setAttribute('aria-current', i === n ? 'true' : 'false'));
    if (byUser) live.textContent = slides[n].getAttribute('aria-label') ?? '';
    warm(n + 1);
    startTimers();
  }

  root.querySelector('[data-hero-next]')?.addEventListener('click', () => go(index + 1, true));
  root.querySelector('[data-hero-prev]')?.addEventListener('click', () => go(index - 1, true));
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.goto), true)));
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncPause(); });

  root.addEventListener('mouseenter', () => { hoverPause = true; syncPause(); });
  root.addEventListener('mouseleave', () => { hoverPause = false; syncPause(); });
  root.addEventListener('focusin', (e) => {
    focusPause = true;
    const slide = (e.target as HTMLElement).closest<HTMLElement>('[data-slide]');
    if (slide) go(Number(slide.dataset.slide), true); else syncPause();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) { focusPause = false; syncPause(); }
  });
  document.addEventListener('visibilitychange', () => { hiddenPause = document.hidden; syncPause(); });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
  });

  let sx = 0, sy = 0;
  root.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  const first = imgOf(0);
  const afterPaint = () => requestAnimationFrame(() => setTimeout(() => warm(1), 0));
  if (first?.complete) afterPaint(); else first?.addEventListener('load', afterPaint, { once: true });

  startTimers();
}
