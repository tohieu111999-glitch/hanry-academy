#!/usr/bin/env python3
"""Import the Hanry Academy "Ngữ Pháp TOCFL Band A/B/C" books into data/grammar/band-<x>.json.

  python3 tools/import-grammar-book.py A "Ngữ Pháp TOCFL Band A HANRY Academy.pdf"

Each grammar point (2 pages in the book) becomes:
  {code, level, struct, title, pinyin, meta:{…}, formula:[lines], terms:[[term, desc]], usage:[bullets],
   examples:[[zh, pinyin, vi]], analysis:{words, roles, note}, compare:[[cells]], mistakes:[{wrong, right, py, note}],
   tip, exercises:[q], answers:[a]}
The text is re-written as data from the PDF's word positions (no page images)."""
import json, os, re, sys
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE = re.compile(r'^([ABC][0-2])-G(\d{3})$')
SEC = {'Công thức ngữ pháp': 'formula', 'Cách dùng chi tiết': 'usage', 'Bảng ví dụ': 'examples', 'Phân tích câu': 'analysis',
       'So sánh cấu trúc dễ nhầm': 'compare', 'Lỗi sai thường gặp': 'mistakes', 'Bài tập vận dụng': 'exercises'}
HAN = re.compile(r'[一-鿿]')


def join(a, b):
    if not a: return b
    if not b: return a
    if HAN.search(a[-1]) and (HAN.search(b[0]) or b[0] in '，。！？、；：」）'): return a + b
    if a[-1] in '（「': return a + b
    return a + ' ' + b


def page_lines(pg):
    """[(top, [(x0, text), …cells])] — a cell is a run of words with small gaps"""
    ws = sorted(pg.extract_words(), key=lambda w: (w['top'], w['x0']))
    rows, last = [], None
    for w in ws:
        if last is None or w['top'] - last > 3: rows.append([])
        last = w['top']; rows[-1].append(w)
    for l in pg.lines + pg.rects:                       # underlines = blanks of fill-in exercises
        if l['bottom'] - l['top'] <= 2 and 15 <= l['x1'] - l['x0'] <= 200:
            r = next((r for r in rows if abs(max(w['bottom'] for w in r) - l['top']) < 4 and re.match(r'^\d+\.$', min(r, key=lambda w: w['x0'])['text'])), None)
            if r: r.append({'x0': l['x0'], 'x1': l['x1'], 'top': r[0]['top'], 'bottom': l['top'], 'text': '＿＿'})
    out = []
    for r in rows:
        r.sort(key=lambda w: w['x0'])
        cells = [[r[0]]]
        for a, b in zip(r, r[1:]):
            if b['x0'] - a['x1'] > 9: cells.append([b])
            else: cells[-1].append(b)
        out.append((r[0]['top'], [(c[0]['x0'], ' '.join(w['text'] for w in c), c) for c in cells]))
    return out


def text_of(cells): return ' '.join(c[1] for c in cells)


def table(rows, ncol=None):
    """rows of cells → list of rows of strings; a row whose first cell is not at the left column continues the previous row"""
    out, xs = [], None
    for cells in rows:
        if not cells: continue
        if xs is None or (cells[0][0] < xs[0] + 8 and (ncol is None or len(cells) >= ncol - 1 or len(cells) > 1)):
            if xs is None or len(cells) >= len(xs) - 1:
                xs = [c[0] for c in cells] if xs is None or len(cells) >= len(xs) else xs
                row = [''] * len(xs)
                for x, t, _ in cells:
                    k = min(range(len(xs)), key=lambda i: abs(xs[i] - x)); row[k] = join(row[k], t)
                out.append(row); continue
        if not out: continue
        for x, t, _ in cells:                                  # continuation of a wrapped row
            k = min(range(len(xs)), key=lambda i: abs(xs[i] - x)); out[-1][k] = join(out[-1][k], t)
    return out


def parse_point(code, level, struct, rows):
    P = {'code': code, 'level': level, 'struct': struct, 'title': '', 'pinyin': '', 'meta': {}}
    sec, buf = 'head', {}
    for top, cells in rows:
        t = text_of(cells)
        if len(cells) == 2 and re.fullmatch(r'[1-7]', cells[0][1]) and cells[1][1] in SEC:
            sec = SEC[cells[1][1]]; continue
        if t.startswith('HANRY MEMORY TIP'): sec = 'tip'; continue
        buf.setdefault(sec, []).append(cells)
    # head: title / pinyin / meta table
    for cells in buf.get('head', []):
        t = text_of(cells)
        if len(cells) >= 2 and cells[0][1] in ('Mã ngữ pháp', 'Chữ Hán', 'Nghĩa', 'Mức độ sử dụng'):
            for k in range(0, len(cells) - 1, 2): P['meta'][cells[k][1]] = cells[k + 1][1]
            continue
        if P['meta'] and cells[0][0] > 140 and len(cells) <= 2:   # wrapped meta value
            continue
        if cells[0][0] < 70: P['title'] = join(P['title'], t)
        else: P['pinyin'] = join(P['pinyin'], t)
    P['struct'] = P['meta'].get('Chữ Hán') or P['struct']
    P['pinyin'] = P['meta'].get('Pinyin') or P['pinyin']
    # 1 formula + term definitions
    f = buf.get('formula', [])
    two = [c[1][0] for c in f if len(c) >= 2 and c[0][0] < 70]
    dx = min(two) - 3 if two else None
    P['formula'], P['terms'] = [], []
    for cells in f:
        words = [w for c in cells for w in c[2]]
        if dx and words[0]['x0'] < 70:
            term = ' '.join(w['text'] for w in words if w['x0'] < dx); desc = ' '.join(w['text'] for w in words if w['x0'] >= dx)
            P['terms'].append([term, desc])
        elif dx and P['terms'] and words[0]['x0'] >= dx - 5 and not P['formula'][-1:] == []:
            P['terms'][-1][1] = join(P['terms'][-1][1], text_of(cells))
        elif P['terms']:
            P['terms'][-1][1] = join(P['terms'][-1][1], text_of(cells))
        else:
            P['formula'].append(text_of(cells))
    # 2 usage bullets
    P['usage'] = []
    for cells in buf.get('usage', []):
        t = text_of(cells)
        if t.startswith('•'): P['usage'].append(t[1:].strip())
        elif P['usage']: P['usage'][-1] = join(P['usage'][-1], t)
    # 3 examples
    ex = [r for r in table(buf.get('examples', [])) if r and r[0] != 'STT']
    P['examples'] = [r[1:4] for r in ex if len(r) >= 4]
    # 4 analysis
    an = buf.get('analysis', [])
    P['analysis'] = {'words': [c[1] for c in an[0]] if an else [], 'roles': [c[1] for c in an[1]] if len(an) > 1 else [],
                     'note': ''}
    for cells in an[2:]: P['analysis']['note'] = join(P['analysis']['note'], text_of(cells))
    # 5 compare table
    P['compare'] = table(buf.get('compare', []))
    if len(P['compare']) > 1 and len(P['compare'][0]) < len(P['compare'][1]):
        P['compare'][0] = [''] * (len(P['compare'][1]) - len(P['compare'][0])) + P['compare'][0]
    # 6 mistakes
    P['mistakes'] = []
    for cells in buf.get('mistakes', []):
        t = text_of(cells)
        m = re.match(r'^❌\s*(.*?)\s*→\s*✅\s*(.*)$', t)
        if m:
            right = m.group(2)
            k = next((i for i, ch in enumerate(right) if i > 0 and re.match(r'[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]', ch) and not HAN.search(right[i:i + 1]) and right[:i].rstrip()[-1:] in '。？！）' + ''.join(chr(c) for c in range(0x4e00, 0x9fff))), None)
            P['mistakes'].append({'wrong': m.group(1), 'right': right[:k].strip() if k else right, 'py': right[k:].strip() if k else '', 'note': ''})
        elif P['mistakes']:
            mk = P['mistakes'][-1]
            pm = re.match(r"^([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü][^.?!。]*?[.?!])\s*(.*)$", t)
            if mk['py'] and not re.search(r'[.?!]$', mk['py']) and not mk['note'] and pm:
                mk['py'] = join(mk['py'], pm.group(1)); t = pm.group(2)
            mk['note'] = join(mk['note'], t)
    P['tip'] = ' '.join(text_of(c) for c in buf.get('tip', []))
    # 7 exercises
    P['exercises'] = []
    for cells in buf.get('exercises', []):
        t = text_of(cells)
        m = re.match(r'^(\d+)\.\s*(.*)$', t)
        if m: P['exercises'].append(m.group(2))
        elif P['exercises']: P['exercises'][-1] = join(P['exercises'][-1], t)
    P['answers'] = []
    return P


def parse_answers(pdf, start):
    """two-column answer pages: 'A0-G001 · 主謂賓' then '1. …' lines"""
    ans, cur = {}, None
    for pg in pdf.pages[start:]:
        txt = pg.extract_text() or ''
        if 'Đáp án' not in txt.split('\n')[0] and 'ĐÁP ÁN' not in txt[:200]: break
        for half in (pg.crop((0, 70, pg.width / 2, pg.height - 40)), pg.crop((pg.width / 2, 70, pg.width, pg.height - 40))):
            for l in (half.extract_text() or '').split('\n'):
                l = l.strip()
                m = re.match(r'^([ABC][0-2]-G\d{3})\s*·', l)
                if m: cur = ans.setdefault(m.group(1), []); continue
                if l.startswith('Đáp án Bài luyện tập') or 'Đáp án Bài luyện tập tổng hợp' in l:
                    if cur and l != 'Đáp án Bài luyện tập tổng hợp' and cur: cur[-1] = cur[-1].split(' Đáp án Bài luyện tập')[0]
                    cur = None; continue
                if cur is None or not l or l.startswith('©'): continue
                n = re.match(r'^(\d+)\.\s*(.*)$', l)
                if n: cur.append(n.group(2))
                elif cur: cur[-1] = join(cur[-1], l)
    return ans


def main(band, path):
    points, cur, ans_start = [], None, None
    with pdfplumber.open(path) as pdf:
        for i, pg in enumerate(pdf.pages):
            rows = page_lines(pg)
            if len(rows) < 3: continue
            head = rows[1][1]
            first = head[0][1]
            if CODE.match(first) and len(head) >= 2 and re.fullmatch(r'[ABC][0-2]', head[1][1]):                      # first page of a point
                cur = parse_rows = {'code': first, 'level': head[1][1], 'struct': text_of(head[2:]), 'rows': []}
                points.append(cur)
                cur['rows'] += [r for r in rows[2:] if not text_of(r[1]).startswith('©')]
            elif re.match(r'^[ABC][0-2]-G\d{3} · TIẾP THEO', text_of(head)) and cur:
                cur['rows'] += [r for r in rows[2:] if not text_of(r[1]).startswith('©')]
            else:
                cur = None
                if ans_start is None and text_of(rows[0][1]).endswith('Đáp án và giải thích'): ans_start = i
        answers = parse_answers(pdf, ans_start) if ans_start is not None else {}
    out = []
    for p in points:
        P = parse_point(p['code'], p['level'], p['struct'], p['rows'])
        A = answers.get(p['code'], [])
        while len(A) > len(P['exercises']) and re.match(r'^[A-D] — ', A[-1]): A.pop()   # comprehensive-test answers after the last point
        if A: A[-1] = A[-1].split(' Đáp án Bài luyện tập')[0]
        P['answers'] = A
        out.append(P)
    os.makedirs(os.path.join(ROOT, 'data', 'grammar'), exist_ok=True)
    dst = os.path.join(ROOT, 'data', 'grammar', 'band-%s.json' % band.lower())
    json.dump({'band': band.upper(), 'points': out}, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    from collections import Counter
    print(dst, len(out), 'points', dict(Counter(p['level'] for p in out)),
          '| no examples:', [p['code'] for p in out if not p['examples']][:8], '| ex≠ans:', [p['code'] for p in out if len(p['exercises']) != len(p['answers'])][:8])


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
