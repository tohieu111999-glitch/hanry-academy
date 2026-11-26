#!/usr/bin/env python3
"""Turn a HANRY Academy TOCFL mock test (試題 PDF + 解答與詳解 PDF) into an exam for data/exams/exams.json.

  python3 tools/import-exam.py --dry  "Đề Số 8.pdf" "ĐA Đề Số 8.pdf"      # print the parsed exam (JSON)
  python3 tools/import-exam.py "Đề Số 8.pdf" "ĐA Đề Số 8.pdf" --out x.json  # write the parsed exam to x.json

Text is re-written as text; only the drawings of 看圖 questions are cut out as images
(data/exams/img/<exam-id>/q<n>.png). Answer checking / fixes / level notes are added afterwards
(tools/apply-exam.py)."""
import json, os, re, sys
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'data', 'exams', 'img')
JUNK = re.compile(r'^(HANRY|ACADEMY|H TOCFL.*|© HANRY.*|Bản quyền thuộc về.*|姓名 Họ tên.*|Tài liệu được biên soạn.*)$')
SEC = re.compile(r'^([一二三四五六])、(.+?)（第\s*(\d+)\s*[–-]\s*(\d+)\s*題）')
SUB = re.compile(r'^（[一二三四五六]）\s*第\s*(\d+)\s*[–-]\s*(\d+)\s*題|^【材料[一二三四五六七八九十]+】')
QNUM = re.compile(r'^(\d{1,2})\.\s*(.*)$')
OPT = re.compile(r'[ⒶⒷⒸⒹ]')


def lines_of(pdf):
    """[(page_index, top, bottom, text)] without headers/footers."""
    out = []
    for pi, pg in enumerate(pdf.pages):
        for ln in pg.extract_text_lines(layout=False, strip=True):
            t = re.sub(r'�', '', ln['text']).strip()
            if t and not JUNK.match(t):
                out.append((pi, ln['top'], ln['bottom'], t))
    return out


def parse_key(path):
    """answer letters + explanations from 解答與詳解"""
    with pdfplumber.open(path) as pdf:
        text = '\n'.join(l[3] for l in lines_of(pdf))
    key = {int(n): 'ABCD'.index(a) for n, a in re.findall(r'(?<![\d.])(\d{1,2})\.([A-D])(?![A-Za-z])', text.split('詳細解析')[0])}
    expl = {}
    for m in re.finditer(r'第\s*(\d+)\s*題\s*正確答案：([A-D])(.*?)(?=第\s*\d+\s*題\s*正確答案|$)', text, re.S):
        n = int(m.group(1))
        assert 'ABCD'.index(m.group(2)) == key.get(n, 'ABCD'.index(m.group(2))), ('key mismatch', n)
        key[n] = 'ABCD'.index(m.group(2))
        d = {}
        for tag, body in re.findall(r'【(.+?)】\s*(.*?)(?=【|$)', m.group(3), re.S):
            body = re.sub(r'\s*\n\s*', lambda x: '' if re.search(r'[一-鿿]$', x.string[:x.start()]) else ' ', body.strip())
            body = re.sub(r'\n?[一二三四五六]、\S+$', '', body).strip()
            d[tag] = body
        parts = [d.get('解析', '')]
        if d.get('其他選項'): parts.append('Các phương án khác: ' + d['其他選項'])
        if d.get('文法'): parts.append('Ngữ pháp: ' + d['文法'])
        if d.get('TOCFL 應試技巧'): parts.append('Mẹo: ' + d['TOCFL 應試技巧'])
        expl[n] = ' · '.join(p for p in parts if p)
    return key, expl


def opts_of(s):
    return [o.strip() for o in OPT.split(s)[1:]]


def parse_test(path, exam_id, write_images=True):
    with pdfplumber.open(path) as pdf:
        L = lines_of(pdf)
        head = ' '.join(l[3] for l in L[:12])
        m = re.search(r'第\s*(\d+)\s*套（(.+?)）', head)
        set_no, kind = (int(m.group(1)), m.group(2)) if m else (0, '閱讀')
        dur = re.search(r'作答時間：(\d+)', head)
        sections, cur, q, passage = [], None, None, []
        i = 0
        while i < len(L):
            pi, top, bot, t = L[i]
            sm = SEC.match(t)
            if sm:
                cur = {'title': t.split('（')[0] + '（第 %s–%s 題）' % (sm.group(3), sm.group(4)), 'kind': 'reading', 'instructions': '', 'questions': [], '_pic': '看圖' in t}
                sections.append(cur); q = None; passage = []; i += 1
                if i < len(L) and L[i][3].startswith('請'):
                    cur['instructions'] = L[i][3]; i += 1
                continue
            if cur is None: i += 1; continue
            if t.startswith('請') and not cur['questions'] and not passage:
                cur['instructions'] = cur['instructions'] or t; i += 1; continue
            if SUB.match(t):
                # a new passage / material inside the section → new sub-section
                if cur['questions']:
                    cur = {'title': cur['title'].split('　')[0], 'kind': 'reading', 'instructions': '', 'questions': [], '_pic': cur['_pic']}
                    sections.append(cur)
                cur['title'] = cur['title'].split('　')[0] + '　' + t
                q = None; passage = []; i += 1; continue
            qm = QNUM.match(t)
            if qm and int(qm.group(1)) == (q['n'] + 1 if q else (int(SEC.match(sections[0]['title']).group(3)) if False else int(qm.group(1)))):
                if passage and not cur.get('passage'):
                    cur['passage'] = '\n'.join(passage); passage = []
                q = {'n': int(qm.group(1)), 'q': qm.group(2).strip(), 'o': [], '_top': (pi, bot)}
                cur['questions'].append(q); i += 1
                # collect until options complete
                fig = []
                while i < len(L) and len(q['o']) < 4:
                    pj, tp, bt, tx = L[i]
                    if OPT.search(tx):
                        if cur['_pic'] and write_images and not q.get('img') and not q['o']:
                            q['img'] = crop(pdf, exam_id, q, (pj, tp))
                        pre = tx[:OPT.search(tx).start()].strip()
                        if pre and not q['o']: q['q'] = (q['q'] + ' ' + pre).strip() if not cur['_pic'] else q['q']
                        q['o'] += opts_of(tx[OPT.search(tx).start():])
                    elif q['o']:
                        q['o'][-1] += tx
                    elif cur['_pic']:
                        fig.append((pj, tp))
                    else:
                        q['q'] = (q['q'] + tx).strip()
                    i += 1
                if not q['q']:
                    q['q'] = '（%d）' % q['n']
                continue
            if q is None or (q and len(q['o']) >= 4):
                passage.append(t); q = None if q and len(q['o']) >= 4 else q
            i += 1
        for s in sections:
            s.pop('_pic', None)
            for x in s['questions']: x.pop('_top', None)
        return set_no, kind, int(dur.group(1)) if dur else 60, [s for s in sections if s['questions']]


def crop(pdf, exam_id, q, end):
    """cut the drawing between the question line and its options (only the picture, never the whole page)"""
    p2, top2 = end
    pg = pdf.pages[p2]
    top = q['_top'][1] + 2 if q['_top'][0] == p2 else 55     # picture continued on the next page: start below the header
    if top2 - top < 18:
        return None
    os.makedirs(os.path.join(IMG, exam_id), exist_ok=True)
    out = os.path.join(IMG, exam_id, 'q%d.png' % q['n'])
    pg.crop((30, top, pg.width - 30, top2 - 2)).to_image(resolution=110).save(out)
    return 'data/exams/img/%s/q%d.png' % (exam_id, q['n'])


def build(test_pdf, key_pdf, exam_id=None, write_images=True):
    key, expl = parse_key(key_pdf)
    set_no = int(re.search(r'(\d+)', os.path.basename(test_pdf)).group(1))
    exam_id = exam_id or 'tocfl-band-a-%02d' % set_no
    set_no, kind, dur, sections = parse_test(test_pdf, exam_id, write_images)
    n = 0
    for s in sections:
        for x in s['questions']:
            n += 1
            assert len(x['o']) == 4, (exam_id, x['n'], x)
            x['a'] = key[x['n']]
            x['why'] = expl.get(x['n'], '')
            x.pop('n')
    return {'id': exam_id, 'title': {'zh': '華語文能力測驗 Band A 模擬試題 第 %d 套（%s）' % (set_no, kind), 'vi': 'Đề luyện TOCFL Band A — Đề số %d (%s)' % (set_no, 'Đọc hiểu, có xem tranh' if '看圖' in kind else 'Đọc hiểu')},
            'exam': 'TOCFL', 'band': 'A', 'level': 'A2', 'duration': dur, 'source': 'Hanry Academy', 'author': 'Hanry Academy', 'pack': 'hanry-band-a',
            'checked': {'by': 'ai', 'fixes': []}, 'sections': sections, '_count': n}


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None
    if out: args = [a for a in args if a != out]
    E = build(args[0], args[1], write_images='--dry' not in sys.argv)
    if out: json.dump(E, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    else: print(json.dumps(E, ensure_ascii=False, indent=1))
