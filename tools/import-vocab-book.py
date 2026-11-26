#!/usr/bin/env python3
"""Import the Hanry Academy "Từ Vựng TOCFL Band A/B/C" books into data/vocab/band-<x>.json.

  python3 tools/import-vocab-book.py a "Từ Vựng TOCFL Band A - Hanry Academy.pdf"

Output: {band, levels:{code:name}, topics:[{level, name, words:[[w, pinyin, pos, vi, exZh, exVi, usage]]}]}
Words are re-written as data (table cells), never page images."""
import json, os, re, sys
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOPIC = re.compile(r'^(A0|A1|A2|B1|B2|C1|C2)\s+(.+?)\s+(\d+)\s+từ$')


def clean(s): return re.sub(r'\s*\n\s*', ' ', s or '').strip()


def ex_split(s):
    """'中文句子。\\nCâu tiếng Việt' → (zh, vi); the Chinese part may wrap over several lines"""
    lines = [l.strip() for l in (s or '').split('\n') if l.strip()]
    zh, vi = [], []
    for l in lines:
        (vi if (vi or not re.search(r'[一-鿿]', l)) else zh).append(l)
    return ''.join(zh), ' '.join(vi)


def join(parts):
    out = ''
    for t in parts:
        if out and not (HAN.search(out[-1]) and HAN.search(t[0])) and not (HAN.search(out[-1]) and t[0] in ',.;:)') and not (out[-1] in '(' ): out += ' '
        out += t
    return out


HAN = re.compile(r'[\u4e00-\u9fff，。！？、；：「」（）]')


def main(band, path):
    """rows are read from word positions: the striped tables are not detected reliably as tables"""
    topics, cur, cols = [], None, None
    with pdfplumber.open(path) as pdf:
        for pg in pdf.pages:
            lines, last = {}, None
            for w in sorted(pg.extract_words(keep_blank_chars=False), key=lambda w: w['top']):
                if last is None or w['top'] - last > 3: k0 = w['top']
                last = w['top']
                lines.setdefault(k0, []).append(w)
            row = None
            for k in sorted(lines):
                ws = sorted(lines[k], key=lambda w: w['x0'])
                txt = ' '.join(w['text'] for w in ws)
                m = TOPIC.match(txt)
                if m:
                    cur = {'level': m.group(1), 'name': m.group(2), 'n': int(m.group(3)), 'words': []}
                    topics.append(cur); row = None; continue
                if ws[0]['text'] == 'STT' and len(ws) > 5:
                    xs = {w['text']: w['x0'] for w in ws}
                    cols = [xs['Chữ'] - 4, xs['Pinyin'] - 4, xs['Từ'] - 4, xs['Nghĩa'] - 4, xs['Ví'] - 4, xs['Cách'] - 4]
                    continue
                if cols is None or cur is None or ws[0]['top'] < 40 or txt.startswith('©'): continue
                if re.fullmatch(r'\d+', ws[0]['text']) and ws[0]['x0'] < cols[0]:
                    row = [[] for _ in range(6)]; cur['words'].append(row); ws = ws[1:]
                if row is None: continue
                for w in ws:
                    c = sum(1 for x in cols if w['x0'] >= x) - 1
                    if c >= 0: row[c].append((k, w['text']))
    for t in topics:
        for i, r in enumerate(t['words']):
            ex = {}
            for k, x in r[4]: ex.setdefault(k, []).append(x)
            exl = [join(v) for _, v in sorted(ex.items())]
            n = next((j for j, l in enumerate(exl) if re.search(r'[a-zà-ỹđ]{2,}\W+[a-zà-ỹđ]{1,}', l) or not re.search(r'[\u4e00-\u9fff]', l)), len(exl))
            zh, vi = ''.join(exl[:n]), ' '.join(exl[n:])
            w0 = join([x for _, x in r[0]])
            t['words'][i] = [re.sub(r'[^\u4e00-\u9fff\u3400-\u4dbf…⋯．·（）()／/A-Za-z0-9]|nhiều|từ|loại', '', w0.replace('nhiều từ loại', '')), join([x for _, x in r[1]]), join([x for _, x in r[2]]), join([x for _, x in r[3]]), zh, vi, join([x for _, x in r[5]])]
    for t in topics:
        if len(t['words']) != t['n']: print('count?', t['level'], t['name'], len(t['words']), t['n'])
        del t['n']
    out = os.path.join(ROOT, 'data', 'vocab', 'band-%s.json' % band.lower())
    json.dump({'band': band.upper(), 'topics': topics}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(out, len(topics), 'topics', sum(len(t['words']) for t in topics), 'words')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
