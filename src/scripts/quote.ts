const KEY = 'bp-quote-v2';
const MAX_BYTES = 4 * 1024 * 1024;
const WA = '254746873985';

export function initQuote() {
  const form = document.querySelector<HTMLFormElement>('[data-quote]');
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('.qstep')];
  const stepper = document.querySelector<HTMLElement>('[data-stepper]');
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitErr = form.querySelector<HTMLElement>('[data-submit-error]')!;
  const success = document.querySelector<HTMLElement>('[data-success]')!;
  const services = [...form.querySelectorAll<HTMLInputElement>('input[name="services[]"]')];
  const conds = [...form.querySelectorAll<HTMLElement>('[data-cond-block]')];
  const fileInput = form.querySelector<HTMLInputElement>('[data-files]')!;
  const fileList = form.querySelector<HTMLElement>('[data-file-list]')!;
  const dropzone = form.querySelector<HTMLElement>('[data-dropzone]')!;
  const summaryWrap = form.querySelector<HTMLElement>('[data-summary-wrap]')!;
  const summary = form.querySelector<HTMLElement>('[data-summary]')!;
  const err = (k: string) => form.querySelector<HTMLElement>(`[data-err="${k}"]`)!;
  let current = 0;

  form.querySelector<HTMLInputElement>('[data-started]')!.value = String(Date.now());
  stepper?.removeAttribute('hidden');

  const syncConds = () => {
    const on = new Set(services.filter((s) => s.checked).map((s) => s.dataset.cond).filter(Boolean));
    conds.forEach((c) => { c.hidden = !on.has(c.dataset.condBlock); });
  };
  const toggleBy = (sel: string, target: string) => {
    const box = form.querySelector<HTMLElement>(target);
    if (!box) return;
    const sync = () => { box.hidden = !form.querySelector<HTMLInputElement>(`${sel}:checked`); };
    form.addEventListener('change', sync); sync();
  };
  toggleBy('[data-event-toggle]', '[data-event-date]');
  toggleBy('[data-delivery]', '[data-delivery-area]');

  const save = () => {
    const data: Record<string, string[]> = {};
    for (const [k, v] of new FormData(form).entries()) {
      if (typeof v !== 'string' || ['started', 'company-website', 'form_type', 'page'].includes(k)) continue;
      (data[k] ||= []).push(v);
    }
    try { localStorage.setItem(KEY, JSON.stringify({ data, step: current })); } catch { }
  };
  const restore = () => {
    let saved: { data: Record<string, string[]>; step: number } | null = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { }
    if (!saved) return 0;
    for (const [k, vals] of Object.entries(saved.data)) {
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(k)}"]`).forEach((el) => {
        if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) el.checked = vals.includes(el.value);
        else if (!(el instanceof HTMLInputElement && el.type === 'file')) el.value = vals[0] ?? '';
      });
    }
    return Math.min(saved.step ?? 0, steps.length - 1);
  };

  const wanted = new URLSearchParams(location.search).get('service');
  const restoredStep = restore();
  if (wanted) services.forEach((s) => { if (s.dataset.slug === wanted) s.checked = true; });
  syncConds();

  const showFiles = () => {
    const files = [...(fileInput.files ?? [])];
    const total = files.reduce((n, f) => n + f.size, 0);
    fileList.innerHTML = files.map((f) => `<li>${f.name.replace(/[<>&]/g, '')} · ${Math.max(1, Math.round(f.size / 1024))} KB</li>`).join('');
    const e = err('files');
    e.hidden = total <= MAX_BYTES;
    if (!e.hidden) e.textContent = `These files add up to ${(total / 1048576).toFixed(1)} MB. The limit is 4 MB. Please share larger artwork as a link below.`;
    return total <= MAX_BYTES;
  };
  fileInput.addEventListener('change', showFiles);
  ['dragenter', 'dragover'].forEach((t) => dropzone.addEventListener(t, () => dropzone.classList.add('is-over')));
  ['dragleave', 'drop'].forEach((t) => dropzone.addEventListener(t, () => dropzone.classList.remove('is-over')));

  const val = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? '';
  const validate = (i: number) => {
    if (i === 0) { const ok = services.some((s) => s.checked); err('services').hidden = ok; return ok; }
    if (i === 1) { const ok = !!(val('project') || val('description')); err('project').hidden = ok; return ok; }
    if (i === 2) return showFiles();
    if (i === 4) {
      const consent = (form.elements.namedItem('consent') as HTMLInputElement).checked;
      const ok = !!val('name') && !!val('phone') && consent;
      err('contact').hidden = ok;
      return ok;
    }
    return true;
  };

  const buildSummary = () => {
    const fd = new FormData(form);
    const get = (k: string) => fd.getAll(k).filter((v) => typeof v === 'string' && v).join(', ');
    const rows: [string, string][] = [
      ['Service', get('services[]')], ['Project', get('project')], ['Quantity', get('quantity') || get('uv_qty') || get('recipients')],
      ['Size', get('size') || get('uv_size') || get('print_size') || get('sign_dims') || get('pack_dims')],
      ['Surface', get('uv_surface')], ['Garments', get('garment[]')], ['Quantities', get('garment_qty')], ['Artwork', fileInput.files?.length ? `${fileInput.files.length} file(s) attached` : get('artwork_link') || get('artwork_status')],
      ['Required', get('required_date')], ['Delivery', [get('delivery'), get('delivery_area')].filter(Boolean).join(', ')],
      ['Contact', [get('name'), get('phone'), get('email')].filter(Boolean).join(' · ')],
    ].filter(([, v]) => v) as [string, string][];
    summary.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v.replace(/[<>&]/g, '')}</dd></div>`).join('');
    return rows;
  };

  const show = (i: number, focus = true) => {
    current = i;
    steps.forEach((s, j) => { s.hidden = j !== i; });
    stepper?.querySelectorAll('li').forEach((li, j) => { li.classList.toggle('is-done', j < i); li.classList.toggle('is-current', j === i); });
    prev.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    if (i === steps.length - 1) { buildSummary(); summaryWrap.hidden = false; }
    if (focus) {
      const h = steps[i].querySelector<HTMLElement>('h2');
      h?.setAttribute('tabindex', '-1'); h?.focus({ preventScroll: true });
      form.closest('.quote-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    save();
  };
  next.addEventListener('click', () => { if (validate(current)) show(current + 1); });
  prev.addEventListener('click', () => show(current - 1));
  form.querySelector('[data-edit]')?.addEventListener('click', () => show(0));
  form.addEventListener('change', (e) => { if ((e.target as HTMLInputElement).name === 'services[]') syncConds(); save(); if (current === steps.length - 1) buildSummary(); });
  form.addEventListener('input', () => save());
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && current < steps.length - 1) { e.preventDefault(); next.click(); }
  });
  show(restoredStep && !wanted ? restoredStep : 0, false);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    for (let i = 0; i < steps.length; i++) if (!validate(i)) { show(i); return; }
    submitErr.hidden = true;
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json', 'x-requested-with': 'fetch' } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || 'We could not send your request just now.');
      const rows = buildSummary();
      form.hidden = true;
      stepper?.setAttribute('hidden', '');
      success.hidden = false;
      success.querySelector('[data-ref]')!.textContent = body.ref;
      const msg = `Hello Betapixel, I just sent quote request ${body.ref}.\n` + rows.filter(([k]) => ['Service', 'Project', 'Quantity', 'Required'].includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n');
      success.querySelector<HTMLAnchorElement>('[data-continue-wa]')!.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
      success.focus();
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { localStorage.removeItem(KEY); } catch { }
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', { form: 'quote', ref: body.ref });
    } catch (x) {
      submitErr.hidden = false;
      submitErr.innerHTML = `${(x as Error).message} You can also <a href="https://wa.me/${WA}" target="_blank" rel="noopener">send it on WhatsApp</a>.`;
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
