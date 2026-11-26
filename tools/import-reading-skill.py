#!/usr/bin/env python3
"""Import Hanry Academy reading-practice PDFs (template: "N.閱讀測驗：title", passage, 選擇題 with 答：(X),
一、課文生詞總表 table, 二、語法結構, optional 課文翻譯) into lesson objects for data/posts/official.json.

  python3 tools/import-reading-skill.py OUT.json "TOCFL練習閱讀技巧.pdf" "Mê Cung Số Check.pdf" ...
Text is re-written as text; nothing is copied as page images."""
import json, re, sys
import pdfplumber

HEAD = re.compile(r'^(?:(\d+)\.\s*)?閱讀測驗(?:（([一二三])）)?：(.*)$')
PAGE_NO = re.compile(r'^\d{1,3}$')
BULLET = re.compile(r'^[❖➢•\-]\s*')


def han(s): return bool(re.search(r'[一-鿿]', s or ''))


def cat(a, b):
    """join two wrapped PDF lines: Chinese joins directly, Latin (Vietnamese) needs a space"""
    if a and b and re.match(r'[\w(“"]', b[0]) and re.search(r'[\w,.;:)”"]$', a) and not (han(a[-1]) or han(b[0])):
        return a + ' ' + b
    return a + b


def clean(s): return re.sub(r'\s+', ' ', (s or '').replace('\n', ' ')).strip()


def read_pdf(path):
    lines, tables = [], []      # lines: (page, text); tables: (page, rows)
    with pdfplumber.open(path) as pdf:
        for i, pg in enumerate(pdf.pages):
            for ln in pg.extract_text_lines(layout=False, strip=True):
                l = ln['text'].replace('�', '').strip()
                if l and not PAGE_NO.match(l):
                    lines.append((i, l, round(ln['x0'])))
            for tb in pg.extract_tables() or []:
                tables.append((i, tb))
    return lines, tables


def paragraphs(lines):
    """PDF lines → paragraphs: a short line ending a sentence closes the paragraph."""
    if not lines: return []
    width = max(len(l) for l in lines)
    out, cur = [], ''
    for l in lines:
        cur += l
        if len(l) < width - 3 and re.search(r'[。！？」』）)]$', l):
            out.append(cur); cur = ''
    if cur: out.append(cur)
    return [p.strip() for p in out if p.strip()]


def paragraphs_x(lines, xs):
    """paragraph = starts with an indented line (first-line indent of the PDF)"""
    if not lines: return []
    base = min(xs)
    if not any(x > base + 12 for x in xs): return paragraphs(lines)
    out = []
    for l, x in zip(lines, xs):
        if not out or x > base + 12: out.append(l)
        else: out[-1] += l
    return [p.strip() for p in out if p.strip()]


def split_readings(lines, single_title=None):
    """[(no, title_lines..., body_lines, pages)]"""
    idx = [k for k, (_, l, _x) in enumerate(lines) if HEAD.match(l)]
    if not idx:                                   # standalone file: first line is the title
        return [(1, lines)]
    out, last = [], 0
    for a, b in zip(idx, idx[1:] + [len(lines)]):
        m = HEAD.match(lines[a][1])
        no = int(m.group(1)) if m.group(1) else last
        last = no
        out.append(('%d%s' % (no, {'一': 'a', '二': 'b', '三': 'c'}[m.group(2)]) if m.group(2) else no, lines[a:b]))
    return out


def parse_one(no, block, tables):
    pages = {p for p, _, _x in block}
    L = [l for _, l, _x in block]
    X = [x for _, _, x in block]
    first = HEAD.match(L[0])
    title_zh = first.group(3) if first else re.sub(r'\s*\(.*$', '', L[0])
    title_vi = ''
    k = 1
    m0 = re.search(r'\(([^)]*)\)\s*$', L[0])
    if not first and m0: title_vi = m0.group(1)
    # wrapped title + "(Vietnamese title)" lines
    while k < len(L) and not L[k].startswith('(') and len(L[k]) < 16 and not re.search(r'[。，]', L[k]) and first:
        title_zh += (' ' if '(' in title_zh and ')' not in title_zh else '') + L[k]; k += 1
    if k < len(L) and L[k].startswith('('):
        vi = L[k]; k += 1
        while not vi.rstrip().endswith(')') and k < len(L): vi += ' ' + L[k]; k += 1
        title_vi = vi.strip().strip('()')
    m1 = re.match(r'^(.*?)\s*\((.+?)\)?\s*$', title_zh)
    if m1 and re.search(r'[A-Za-zÀ-ỹ]', m1.group(2)):
        title_zh, title_vi = m1.group(1), m1.group(2)
        while k < len(L) and not han(L[k][:1]) and not L[k].startswith('('): title_vi += ('' if title_vi.endswith(' ') else ' ') + L[k]; k += 1
        title_vi = title_vi.rstrip(')').strip()
    rest = L[k:]
    RX = X[k:]
    def find(pred, start=0):
        for i in range(start, len(rest)):
            if pred(rest[i]): return i
        return len(rest)
    i_q = find(lambda t: t.startswith('選擇題'))
    i_v = find(lambda t: re.match(r'^一、\s*(課文|核心)生詞', t) is not None)
    i_g = find(lambda t: re.match(r'^二、\s*語法', t) is not None)
    i_t = find(lambda t: '課文翻譯' in t)
    text = paragraphs_x(rest[:i_q], RX[:i_q])
    # ---- questions
    qs, q = [], None
    for t in rest[i_q + 1:min(i_v, i_t, i_g)]:
        m = re.match(r'^(\d+)\.\s*(.*)$', t)
        if m and (q is None or q.get('a') is not None):
            q = {'type': 'mc', 'q': m.group(2), 'o': [], 'a': None, 'why': ''}; qs.append(q); continue
        if q is None: continue
        if re.match(r'^答[：:]', t):
            m = re.search(r'\(([A-D])\)|([A-D])', t); q['a'] = 'ABCD'.index((m.group(1) or m.group(2))); continue
        if re.match(r'^(解析|Giải thích)', t) or (q['a'] is not None):
            body = BULLET.sub('', re.sub(r'^(解析|Giải thích)[：:]\s*', '', t))
            q['why'] = (q['why'] + ('\n' if re.match(r'^(解析|Giải thích)', t) and q['why'] else '') + body if re.match(r'^(解析|Giải thích)', t) else cat(q['why'], body)).strip(); continue
        if re.match(r'^\([A-D]\)', t):
            for o in re.split(r'\s*\([A-D]\)\s*', t)[1:]: q['o'].append(o.strip())
        elif q['o']:
            q['o'][-1] += t
        else:
            q['q'] += t
    qs = [x for x in qs if len(x['o']) == 4 and x['a'] is not None]
    # ---- vocab from tables on the reading's pages
    vocab, seen = [], set()
    for p, tb in tables:
        if p not in pages: continue
        for row in tb:
            cells = [clean(c) for c in row]
            if len(cells) < 3 or not han(cells[0]) or '從屬' in cells[0] or 'Từ vựng' in cells[0] or 'Chữ' in cells[0]: continue
            w = cells[0].replace(' ', '')
            if w in seen or len(w) > 12: continue
            seen.add(w)
            if len(cells) >= 4:
                # two layouts: [word, pinyin, vi, usage] or [word, vi(usage), pinyin, …]
                py, vi, note = cells[1], cells[2], cells[3]
                if han(py) or re.search(r'[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]', py, re.I) and not re.search(r'[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]', py):
                    py, vi = cells[2], cells[1]
            else:
                py, vi, note = cells[1], cells[2], ''
            vocab.append({'w': w, 'p': py, 'vi': vi, 'note': note})
    # ---- grammar
    gram, g = [], None
    G = rest[i_g + 1:i_t if i_t > i_g else len(rest)]
    for t in G:
        m = re.match(r'^(\d+)\.\s*(.+)$', t)
        if m and han(m.group(2).lstrip('.…⋯ ')[:2]) and '->' not in t and ('...' in m.group(2) or '⋯' in m.group(2) or '…' in m.group(2) or len(m.group(2)) < 60):
            head = m.group(2)
            g = {'title': re.split(r'\s*\(', head)[0].strip(), 'titleVi': '', 'pinyin': '', 'meaning': '', 'usage': '', 'note': '', 'example': [], 'practice': [], '_last': 'head', '_head': head}
            gram.append(g); continue
        if g is None: continue
        s = BULLET.sub('', t)
        lab = re.match(r'^(Công dụng|Dịch nghĩa|Nghĩa|Cách dùng|Trong bài|Tác dụng trong bài|Ví dụ khác|Ví dụ|Câu trong bài|Pinyin|Bài tập luyện tập)[：:]?\s*(.*)$', s)
        if lab:
            key = {'Công dụng': 'usage', 'Dịch nghĩa': 'meaning', 'Nghĩa': 'meaning', 'Cách dùng': 'usage', 'Trong bài': 'note', 'Tác dụng trong bài': 'note',
                   'Ví dụ': 'example', 'Ví dụ khác': 'example', 'Câu trong bài': 'quote', 'Pinyin': 'pinyin', 'Bài tập luyện tập': 'practice'}[lab.group(1)]
            g['_last'] = key; s = lab.group(2)
            if key in ('example', 'quote') and not s: continue
        k2 = g['_last']
        if k2 == 'head':
            g['_head'] += ' ' + s
        elif k2 == 'practice':
            pm = re.match(r'^\d+\.\s*(.*)$', s)
            if pm: g['practice'].append({'q': pm.group(1), 'a': ''})
            elif g['practice']: g['practice'][-1]['q'] = cat(g['practice'][-1]['q'], s)
            continue
        elif k2 in ('example', 'quote'):
            if k2 == 'quote' and not g['example']: g['example'] = [s, '']
            elif k2 == 'quote': g['example'][0] = cat(g['example'][0], s)
            elif not g['example'] or k2 == 'example' and g.get('_exdone'): g['example'] = [s, '']
            else: g['example'][0] = cat(g['example'][0], s)
            if k2 == 'example': g['_exdone'] = False
        else:
            g[k2] = cat(g[k2], s).strip()
    for g in gram:
        head = g.pop('_head'); g.pop('_last', None); g.pop('_exdone', None)
        py = re.search(r'\(([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü .…,\'-]+)\)', head)
        g['pinyin'] = g['pinyin'] or (py.group(1) if py else '')
        vis = [x for x in re.findall(r'\(([^()]+)\)', head) if not re.fullmatch(r'[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü .…,\'-]+', x)]
        g['titleVi'] = vis[-1] if vis else ''
        if g['example']:
            ex = g['example'][0]
            m = re.match(r'^(.*?[。！？」])\s*\((.+)\)\s*$', ex)
            g['example'] = [m.group(1).strip('「」'), m.group(2)] if m else [ex.strip('「」'), '']
        for p in g['practice']:
            m = re.match(r'^(.*?)\s*->\s*(.*)$', p['q'])
            if m: p['q'], p['a'] = m.group(1).strip(), m.group(2).strip()
    # ---- translation (課文翻譯) if present: Vietnamese paragraphs
    trans = []
    if i_t < len(rest):
        seg = list(zip(rest, RX))[i_t + 1:i_v if i_v > i_t else len(rest)]
        T = [(l, x) for l, x in seg if not han(l[:2])]
        if T:
            base = min(x for _, x in T)
            for l, x in T:
                if not trans or x > base + 12: trans.append(l)
                else: trans[-1] += ' ' + l
    return {'no': no, 'title_zh': title_zh.strip(), 'title_vi': title_vi.strip(), 'text': text, 'trans': trans, 'questions': qs, 'vocab': vocab, 'grammar': gram}


if __name__ == '__main__':
    out, res = sys.argv[1], []
    for path in sys.argv[2:]:
        lines, tables = read_pdf(path)
        for no, block in split_readings(lines):
            r = parse_one(no, block, tables); r['file'] = path.split('/')[-1]; res.append(r)
    json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for r in res:
        print(r['file'][:14], r['no'], r['title_zh'][:16], '|', r['title_vi'][:24], '| p', len(r['text']), 'q', len(r['questions']), 'v', len(r['vocab']), 'g', len(r['grammar']), 'tr', len(r['trans']))
