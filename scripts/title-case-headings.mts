import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { titleCase } from '../src/lib/titleCase.ts';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let changed = 0;

function convertInner(inner: string): string {
  const pieces = inner.split(/(<[^>]+>|\{[^}]*\})/);
  const textIdx = pieces.map((p, i) => (!/^[<{]/.test(p) && p.trim() ? i : -1)).filter((i) => i >= 0);
  if (!textIdx.length) return inner;
  const joined = textIdx.map((i) => pieces[i]).join('\u0001');
  const out = titleCase(joined).split('\u0001');
  textIdx.forEach((i, n) => { pieces[i] = out[n]; });
  return pieces.join('');
}

for (const f of walk('src').filter((f) => f.endsWith('.astro'))) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/(<h([1-4])\b[^>]*>)([\s\S]*?)(<\/h\2>)/g, (_, open, _l, inner, close) => open + convertInner(inner) + close);
  if (out !== src) { writeFileSync(f, out); changed++; }
}
for (const f of walk('src/content').filter((f) => f.endsWith('.md'))) {
  const src = readFileSync(f, 'utf8');
  const out = src
    .replace(/^(#{1,4} )(.+)$/gm, (_, h, t) => h + titleCase(t))
    .replace(/^(headline: ")(.*)(")$/m, (_, a, t, b) => a + titleCase(t) + b);
  if (out !== src) { writeFileSync(f, out); changed++; }
}
console.log('files changed', changed);
