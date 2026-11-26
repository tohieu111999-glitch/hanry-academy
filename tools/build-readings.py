#!/usr/bin/env python3
"""Turn readings parsed by tools/import-reading-skill.py (RS.json) plus a folder of translation/fix files
(TR/*.json, keyed by reading number or a short key) into lessons in data/posts/official.json.

  python3 tools/build-readings.py RS.json TR_DIR

Each TR entry: {title_vi, vi:[paragraphs], zhfix:[[old,new]], qfix:{qi:{q|o:[[old,new]]}}, whyfix:[[old,new]],
join:[paragraph index to merge with the next], parts:[[zh heading, vi heading]] (two-part readings),
book_trans:true (use the book's own translation), split_trans:[markers], vocabvi:{word: vi}}.
Lessons with the same id are replaced, so the script can be re-run."""
import glob, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'posts', 'official.json')
LV = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
HAN_SP = re.compile(r'(?<=[一-鿿，。、「」：；？！）（]) +(?=[一-鿿，。、「」：；？！（）])')


def level_of(no):
    n = int(re.match(r'\d+', str(no)).group())
    if n <= 21: return 'B1'          # short texts: healing stories, food, careers
    if n <= 25: return 'B2'          # longer opinion texts
    return 'C1'                      # literary essays (26–50)


def sub_all(s, pairs):
    for a, b in pairs or []:
        s = s.replace(a, b)
    return s


def grammar_of(g):
    g = dict(g)
    ex = g.get('example') or []
    if ex and '」' in ex[0]:                      # 「sentence in the text」 + other example
        quote, rest = ex[0].split('」', 1)
        rest = re.sub(r'^\s*(結構|Cấu trúc)\s*[:：]\s*', '', rest).strip()
        g['example'] = [rest, ex[1]] if rest else [quote.strip('「'), ex[1]]
    m = re.search(r'\s*Bài tập\s*[:：]\s*(.*)$', g.get('note', ''))
    if m and not g.get('practice'):              # practice list written inline in the note
        g['note'] = g['note'][:m.start()].strip()
        for q in re.split(r'\s*\d+\.\s+', ' ' + m.group(1))[1:]:
            qa = re.match(r'^(.*?)\s*->\s*(.*)$', q.strip())
            if qa: g.setdefault('practice', []).append({'q': qa.group(1), 'a': qa.group(2)})
    return g


def build(r, T, key, created):
    t = T.get(key, {})
    zh = [sub_all(p, t.get('zhfix')) for p in r['text']]
    for i in sorted(t.get('join', []), reverse=True):
        zh[i:i + 2] = [zh[i] + zh[i + 1]]
    if t.get('book_trans'):
        vi = ' '.join(r['trans'])
        for mk in t.get('split_trans', []): vi = vi.replace(' ' + mk, '\n' + mk)
        vi = vi.split('\n')
    else:
        vi = t.get('vi', [])
    assert len(vi) == len(zh), (key, len(vi), len(zh))
    text = [{'sp': '', 'zh': z, 'vi': v, 'en': '', 'indent': True} for z, v in zip(zh, vi)]
    if t.get('parts'):                            # two-part reading: headings before each part
        (h1z, h1v), (h2z, h2v) = t['parts']
        text = [{'sp': '', 'zh': h1z, 'vi': h1v, 'en': ''}, text[0], {'sp': '', 'zh': h2z, 'vi': h2v, 'en': ''}] + text[1:]
    qs = []
    for i, q in enumerate(r['questions']):
        q = dict(q)
        f = t.get('qfix', {}).get(str(i), {})
        q['q'] = sub_all(q['q'], f.get('q'))
        q['o'] = [sub_all(o, f.get('o')) for o in q['o']]
        q['why'] = HAN_SP.sub('', sub_all(q.get('why', ''), t.get('whyfix')))
        if not q['why']: q.pop('why')
        qs.append(q)
    vocab = []
    for v in r['vocab']:
        v = dict(v)
        if v['w'] in t.get('vocabvi', {}): v['vi'] = t['vocabvi'][v['w']]
        v.update(t.get('vocabfix', {}).get(v['w'], {}))
        if not v.get('note'): v.pop('note', None)
        vocab.append(v)
    code = t.get('level') or level_of(r['no'])
    return {'id': key_id(key), 'subject': 'zh', 'lang': 'zh', 'kind': 'passage', 'emoji': '📖',
            'title': {'zh': r['title_zh'] if not t.get('parts') else '真正的價值在於你自己／多雲轉晴', 'vi': t.get('title_vi') or r['title_vi'], 'en': ''},
            'level': LV[code], 'levelCode': code, 'exam': 'TOCFL', 'author': 'Hanry Academy', 'authorRole': 'admin',
            'sourceType': 'self', 'visibility': 'public', 'official': True, 'text': text,
            'trSource': 'author' if t.get('book_trans') else 'ai', 'questions': qs, 'vocab': vocab,
            'grammar': [grammar_of(g) for g in r['grammar']], 'exercises': [], 'quote': None,
            'file': r['file'], 'created': created}


def key_id(key):
    return {'mecung': 'doc-me-cung-so', 'nhaccu': 'doc-tong-quan-nhac-cu'}.get(key) or 'doc-tocfl-%02d' % int(key)


if __name__ == '__main__':
    R = json.load(open(sys.argv[1], encoding='utf-8'))
    T = {}
    for f in sorted(glob.glob(os.path.join(sys.argv[2], '*.json'))):
        T.update(json.load(open(f, encoding='utf-8')))
    # 8a (passage only) + 8b (passage + questions on both) → one lesson "8"
    r8a = next(r for r in R if r['no'] == '8a'); r8b = next(r for r in R if r['no'] == '8b')
    r8b['text'] = r8a['text'] + r8b['text']; r8b['no'] = 8
    R = [r for r in R if r['no'] != '8a']
    base = int(time.time() * 1000)
    out = []
    for i, r in enumerate(R):
        key = {'Mê Cung Số Check.pdf': 'mecung', 'Tổng Quan Về Nhạc Cụ.pdf': 'nhaccu'}.get(r['file'], str(r['no']))
        out.append(build(r, T, key, base - i * 60000))
    L = json.load(open(DATA, encoding='utf-8'))
    ids = {x['id'] for x in out}
    old = {x['id']: x for x in L}
    for x in out:                                 # keep generated audio when the paragraphs did not change
        o = old.get(x['id'])
        if o and o.get('audio') and [p['zh'] for p in o['text']] == [p['zh'] for p in x['text']]:
            x['audio'] = o['audio']; x['created'] = o['created']
    L = [x for x in L if x['id'] not in ids] + out
    json.dump(L, open(DATA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(out), 'lessons;', len(L), 'in official.json')
