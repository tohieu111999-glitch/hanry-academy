#!/usr/bin/env python3
"""Import an EduVerse mock test PDF (questions + answer key + Vietnamese explanations in one file).

  python3 tools/import-exam-eduverse.py "Gói Luyện Tập/Đề Số 1.pdf" --id eduverse-09 --pack eduverse-luyen-tap --out x.json

Text is re-written as text (no page images). If the answer key is heavily biased to one letter
(e.g. almost always A), the options of every question are shuffled (seeded) so the answer is spread over A–D."""
import json, random, re, sys
import pdfplumber

JUNK = re.compile(r'^(Bản quyền thuộc về.*|© EduVerse.*|\d{1,2}|Tài liệu được soạn.*|Dựa trên Giáo Trình.*)$')
SEC = re.compile(r'^(?:([一二三四五六])、(.+?)（第\s*(\d+)\s*[–-]\s*(\d+)\s*題）|第([一二三四五六])部分\s*(\S+)（(\d+)\s*題）)')
SUB = re.compile(r'^（[一二三四五六七八九十]）|^(?:材料|短文|閱讀|對話)[一二三四五六七八九十]+（第')
Q = re.compile(r'^(\d{1,2})\.\s*(.*)$')
OPT = re.compile(r'[ⒶⒷⒸⒹ]')
KEYSTART = re.compile(r'^(一、完成句子（1[–-]25）|（?Đáp án）?|第一部分\s*詞彙)$')


def text_lines(pdf):
    out = []
    for pg in pdf.pages:
        for l in (pg.extract_text() or '').split('\n'):
            l = re.sub('�', '', l).strip()
            if l and not JUNK.match(l):
                out.append(re.sub(r'\(([A-D])\)\s*', lambda m: 'ⒶⒷⒸⒹ'['ABCD'.index(m.group(1))] + ' ', l))
    return out


def split_key(lines):
    """index where the answer key starts (the first key line after all questions)"""
    for i, l in enumerate(lines):
        if re.search(r'(?:^|\s)1\.[A-D]\s+2\.[A-D]', l):
            j = i
            while j > 0 and not KEYSTART.match(lines[j - 1]) and not lines[j - 1].endswith('Đáp án）') and j > i - 3:
                j -= 1
            return j - 1 if j > 0 and (KEYSTART.match(lines[j - 1]) or 'Đáp án' in lines[j - 1]) else i
    return len(lines)


def parse_questions(lines):
    sections, cur, q, passage = [], None, None, []
    nq = 0
    for idx, l in enumerate(lines):
        sm = SEC.match(l)
        if sm:
            if sm.group(1):
                title, a, b = '%s、%s' % (sm.group(1), sm.group(2)), int(sm.group(3)), int(sm.group(4))
            else:
                title, a, b = '第%s部分 %s' % (sm.group(5), sm.group(6)), nq + 1, nq + int(sm.group(7))
            cur = {'title': '%s（第 %d–%d 題）' % (title, a, b), 'kind': 'reading', 'instructions': '', 'questions': [], '_r': (a, b)}
            sections.append(cur); q = None; passage = []
            continue
        if cur is None:
            continue
        if SUB.match(l) and (cur['questions'] or passage):
            cur = {'title': cur['title'].split('　')[0] + '　' + l, 'kind': 'reading', 'instructions': '', 'questions': [], '_r': cur['_r']}
            sections.append(cur); q = None; passage = []
            continue
        if SUB.match(l):
            cur['title'] = cur['title'].split('　')[0] + '　' + l; continue
        qm = Q.match(l)
        if qm and int(qm.group(1)) == nq + 1 and (OPT.search(l) or not passage or True):
            if passage:
                if cur['questions']:        # a new text inside the same part (material 2, passage 3 …)
                    cur = {'title': cur['title'].split('　')[0], 'kind': 'reading', 'instructions': '', 'questions': [], '_r': cur['_r']}
                    sections.append(cur)
                cur['passage'] = '\n'.join(passage)
            passage = []
            nq += 1
            q = {'n': nq, 'q': qm.group(2), 'o': []}
            cur['questions'].append(q)
            if OPT.search(q['q']):
                s = q['q']; q['q'] = s[:OPT.search(s).start()].strip(); q['o'] = [o.strip() for o in OPT.split(s[OPT.search(s).start():])[1:]]
            continue
        if q is not None and len(q['o']) < 4:
            if OPT.search(l):
                pre = l[:OPT.search(l).start()].strip()
                if pre and not q['o']: q['q'] += pre
                elif pre and q['o']: q['o'][-1] += pre
                q['o'] += [o.strip() for o in OPT.split(l[OPT.search(l).start():])[1:]]
            elif q['o']:
                q['o'][-1] += l
            else:
                q['q'] += l
            continue
        if q is not None and len(q['o']) == 4 and len(l) <= 14 and not re.search(r'[：:]$', l) and _next_is_new(lines, idx):
            q['o'][-1] += l; continue
        if l.startswith('請') and not cur['questions'] and not passage:
            cur['instructions'] = l; continue
        passage.append(l); q = None
    return [s for s in sections if s['questions']]


def _next_is_new(lines, idx):
    nxt = lines[idx + 1] if idx + 1 < len(lines) else ''
    return bool(Q.match(nxt) or SEC.match(nxt) or SUB.match(nxt) or not nxt)


def parse_key(lines):
    key = {}
    for l in lines:
        for n, a in re.findall(r'(?<![\d.])(\d{1,2})\.([A-D])\b', l):
            key.setdefault(int(n), 'ABCD'.index(a))
    return key


def parse_expl(pdf, key_lines):
    """explanations: tables (Câu | Đáp án | why) and lines 'N X：…' / 'N 詞：…'"""
    expl = {}
    for pg in pdf.pages:
        for tb in pg.extract_tables() or []:
            for row in tb:
                cells = [re.sub(r'\s*\n\s*', ' ', c or '').strip() for c in row]
                if len(cells) >= 3 and re.fullmatch(r'\d{1,2}', cells[0] or ''):
                    expl[int(cells[0])] = (cells[1] + '：' + cells[2]).strip('：')
    txt = '\n'.join(key_lines)
    for m in re.finditer(r'(?m)^(\d{1,2})\s+([A-D]|[一-鿿]{1,6})[：:](.*?)(?=^\d{1,2}\s+(?:[A-D]|[一-鿿]{1,6})[：:]|^Đoạn|^Phần|\Z)', txt, re.S):
        n = int(m.group(1))
        body = re.sub(r'\s*\n\s*', ' ', m.group(3)).replace('❖', '').strip()
        expl.setdefault(n, (m.group(2) + '：' + body).strip())
    return expl


def build(path, exam_id, pack, title_vi=None, seed=None):
    with pdfplumber.open(path) as pdf:
        lines = text_lines(pdf)
        k = split_key(lines)
        head = ' '.join(lines[:3])
        m = re.search(r'第\s*(\d+)\s*套', head)
        set_no = int(m.group(1)) if m else 0
        sections = parse_questions(lines[:k])
        key = parse_key(lines[k:k + 40])
        expl = parse_expl(pdf, lines[k:])
    # blanks in cloze passages are bare numbers: 相當 34，→ 相當 （34），
    for s in sections:
        if s.get('passage'):
            nums = {q['n'] for q in s['questions']}
            s['passage'] = re.sub(r'(?<![\d.,／/:：A-Za-z])(\d{1,2})(?![\d.,／/:%A-Za-z年月日歲元分公個號點])', lambda x: ' （%s） ' % x.group(1) if int(x.group(1)) in nums else x.group(0), s['passage'])
            s['passage'] = re.sub(r'\(\s*（(\d+)）\s*\)', r'（\1）', s['passage'])
            for q in s['questions']:
                if not q['q']: q['q'] = '（%d）' % q['n']
    allq = [q for s in sections for q in s['questions']]
    letters = [key.get(q['n']) for q in allq]
    bias = max(letters.count(i) for i in range(4)) / max(1, len(letters))
    rnd = random.Random(seed if seed is not None else exam_id)
    for q in allq:
        assert len(q['o']) == 4, (exam_id, q['n'], q)
        if q['n'] not in key and re.match(r'^[A-D]：', expl.get(q['n'], '')):
            key[q['n']] = 'ABCD'.index(expl[q['n']][0])      # answer missing from the key table but given in the explanation
        q['a'] = key[q['n']]
        q['why'] = expl.get(q['n'], '')
        if bias > 0.45:                        # answer nearly always the same letter → shuffle options
            order = list(range(4)); rnd.shuffle(order)
            q['o'] = [q['o'][i] for i in order]; q['a'] = order.index(q['a'])
            q['why'] = re.sub(r'^[A-D]：', '', q['why'])
        q['_n'] = q.pop('n')
    for s in sections: s.pop('_r', None)
    return {'id': exam_id, 'title': {'zh': '華語文能力測驗 模擬試題 第 %d 套' % set_no, 'vi': title_vi or 'Đề luyện TOCFL — Đề số %d' % set_no},
            'exam': 'TOCFL', 'band': 'B', 'level': 'B1', 'duration': 60, 'source': '© EduVerse - Educational Center', 'author': 'EduVerse - Educational Center',
            'pack': pack, 'checked': {'by': 'ai', 'fixes': []}, 'sections': sections, '_set': set_no, '_bias': round(bias, 2), '_count': len(allq),
            '_noexpl': [q['_n'] for q in allq if not q['why']]}


if __name__ == '__main__':
    a = sys.argv
    E = build(a[1], a[a.index('--id') + 1], a[a.index('--pack') + 1])
    if '--out' in a: json.dump(E, open(a[a.index('--out') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    else: print(json.dumps(E, ensure_ascii=False, indent=1)[:3000])
