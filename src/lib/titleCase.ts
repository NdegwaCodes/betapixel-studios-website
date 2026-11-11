const SMALL = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'as', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'vs', 'vs.', 'with', 'from', 'into', 'over', 'than']);
const UNITS = new Set(['cm', 'mm', 'm', 'km', 'gsm', 'pt', 'dpi', 'ml', 'kg', 'g', 'h', 'x', '×', 'e.g.', 'i.e.']);
const BREAK = /[:.!?—–]$/;

function capitalise(word: string): string {
  return word.replace(/^([^\p{L}\p{N}]*)(\p{L})/u, (_, lead: string, ch: string) => lead + ch.toUpperCase());
}

function fixWord(word: string, forceCap: boolean): string {
  const core = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.]+$/gu, '');
  const lower = core.toLowerCase();
  if (!core || word.startsWith('&') || /\d/.test(core) || /[@/]/.test(core) || core.split('-').some((s) => /\p{Lu}/u.test(s.slice(1)))) return word;
  if (UNITS.has(lower)) return word;
  if (!forceCap && SMALL.has(lower)) return word.replace(core, lower);
  const parts = word.split('-');
  return parts.map((part, i) => (i > 0 && i < parts.length - 1 && SMALL.has(part.toLowerCase()) ? part.toLowerCase() : capitalise(part))).join('-');
}

export function titleCase(text: string): string {
  const parts = text.split(/(\s+)/);
  const words = parts.map((p, i) => ({ p, i })).filter(({ p }) => p.trim());
  let previous = '';
  words.forEach(({ p, i }, n) => {
    const forceCap = n === 0 || n === words.length - 1 || BREAK.test(previous) || /^[(“"‘']/.test(p);
    parts[i] = fixWord(p, forceCap);
    previous = p;
  });
  return parts.join('');
}
