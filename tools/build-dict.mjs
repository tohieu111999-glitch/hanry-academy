// Builds compact dictionary files for the site from open-licensed sources.
// Sources (download yourself, see README):
//   CVDICT.u8  — https://github.com/ph0ngp/CVDICT (CC BY-SA 4.0, Vietnamese)
//   cedict.txt — https://www.mdbg.net/chinese/dictionary?page=cc-cedict (CC BY-SA 4.0, English)
//   Unihan_Readings.txt — https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip (Unicode License)
// Usage: node tools/build-dict.mjs <srcDir> <outDir>
import fs from 'node:fs';
import path from 'node:path';

const [src = '.', out = 'data'] = process.argv.slice(2);
const LINE = /^(\S+) (\S+) \[([^\]]+)\] \/(.*)\/\s*$/;

function parse(file) {
  const rows = [];
  for (const line of fs.readFileSync(path.join(src, file), 'utf8').split('\n')) {
    if (!line || line[0] === '#') continue;
    const m = LINE.exec(line);
    if (!m) continue;
    const [, t, s, p, defs] = m;
    rows.push({ t, s, p: p.replace(/u:/g, 'v'), d: defs.split('/').filter(Boolean).join('; ') });
  }
  return rows;
}
const clean = (x) => x.replace(/[\t\n\r]/g, ' ');

function write(rows, name) {
  // TSV: simplified \t traditional(or "" if same) \t pinyin(numbered) \t definition
  const lines = rows.map((r) => [r.s, r.t === r.s ? '' : r.t, r.p, clean(r.d)].join('\t'));
  fs.writeFileSync(path.join(out, name), lines.join('\n'));
  console.log(name, rows.length, (fs.statSync(path.join(out, name)).size / 1e6).toFixed(2) + 'MB');
}

const vi = parse('CVDICT.u8');
const en = parse('cedict.txt');
write(vi, 'dict-vi.tsv');
write(en, 'dict-en.tsv');

// Hán Việt readings (Unihan kVietnamese), keyed by traditional char; map simplified too.
const s2t = new Map();
for (const r of vi) if ([...r.s].length === 1 && [...r.t].length === 1 && !s2t.has(r.s)) s2t.set(r.s, r.t);
const hv = new Map();
for (const line of fs.readFileSync(path.join(src, 'Unihan_Readings.txt'), 'utf8').split('\n')) {
  const m = /^U\+([0-9A-F]+)\tkVietnamese\t(.+)$/.exec(line);
  if (m) hv.set(String.fromCodePoint(parseInt(m[1], 16)), m[2].trim().split(/\s+/).slice(0, 3).join(','));
}
for (const [s, t] of s2t) if (!hv.has(s) && hv.has(t)) hv.set(s, hv.get(t));
fs.writeFileSync(path.join(out, 'hanviet.tsv'), [...hv].map(([c, r]) => c + '\t' + r).join('\n'));
console.log('hanviet', hv.size);
