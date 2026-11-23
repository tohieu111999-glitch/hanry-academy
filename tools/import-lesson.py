#!/usr/bin/env python3
"""Convert Hanry Academy reading-lesson PDFs into the site's lesson JSON.

Usage:
  python3 tools/import-lesson.py lesson1.pdf lesson2.pdf ...   # adds/updates data/posts/official.json
  python3 tools/import-lesson.py --dry lesson.pdf               # print the JSON only

Expected PDF layout (the template Hanry Academy uses):
  【Bài đọc】 / 中文標題 / （Tiêu đề tiếng Việt） / Cấp độ: A1 | TOCFL / reading (indented = dialogue)
  【Câu hỏi】 閱讀測驗  (optional 【認知題 – Nhận biết】 … category headings), options A–D
  ✅ Đáp án  table: Câu | Đáp án | Giải thích
  【Dịch bài đọc】 (optional)
  I. 【Từ Vựng】 table: 中文詞語 | 拼音 | Nghĩa | Cách dùng | Ví dụ | Dịch ví dụ
  II. 【Ngữ Pháp】 一、… Pinyin / Nghĩa / Cách dùng chi tiết / Lưu ý / Ví dụ trong bài / Dịch / Bài tập / Đáp án mẫu
  III. 【Bài tập bổ sung】 1、填填看 2、排列句子 3、短文寫作 4、5、翻譯練習 … closing quote
Requires: pip install pdfplumber
"""
import json, os, re, sys, time, unicodedata
import pdfplumber

HAN = re.compile(r'[㐀-鿿豈-﫿]')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'posts', 'official.json')
LEVELS = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
CN_NUM = '一二三四五六七八九十'


def han(s):
    return bool(HAN.search(s or ''))


def join(a, b):
    """Join two wrapped lines: no space between CJK, a space between Latin words."""
    if not a:
        return b
    if not b:
        return a
    if han(a[-1]) or han(b[0]) or a[-1] in '，。！？、；：「」（）…—-' or b[0] in '，。！？、；：「」（）…':
        return a + b
    return a + ' ' + b


def clean_cell(s):
    s = (s or '').replace('\n', ' ').strip()
    # remove spaces the PDF puts between CJK characters ("每 個 人" -> "每個人")
    s = re.sub(r'(?<=[㐀-鿿＀-￯，。！？、；：「」])\s+(?=[㐀-鿿＀-￯，。！？、；：「」])', '', s)
    return re.sub(r'\s{2,}', ' ', s)


def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'bai'


# ---------------------------------------------------------------- extraction
def extract(path):
    lines, tables = [], []
    with pdfplumber.open(path) as pdf:
        for pno, page in enumerate(pdf.pages):
            found = page.find_tables()
            boxes = [t.bbox for t in found]
            for t in found:
                tables.append({'page': pno, 'top': t.bbox[1], 'rows': [[clean_cell(c) for c in r] for r in t.extract()]})
            prev_bottom = None
            inside = lambda o: any(b[0] - 1 <= (o['x0'] + o['x1']) / 2 <= b[2] + 1 and b[1] - 1 <= (o['top'] + o['bottom']) / 2 <= b[3] + 1 for b in boxes)
            raw = [dict(ln) for ln in page.filter(lambda o: not inside(o)).extract_text_lines(keep_blank_chars=False)]
            # small free-form tables (e.g. the closing quote card) are read as normal text lines
            for t in found:
                rows = t.extract()
                if rows and rows[0] and not any(k in (rows[0][0] or '') + ' '.join(c or '' for c in rows[0]) for k in ('中文', 'Câu', 'Đáp')) and max(len(r) for r in rows) <= 2:
                    h = (t.bbox[3] - t.bbox[1]) / max(1, len(rows))
                    for k, r in enumerate(rows):
                        txt = clean_cell(' '.join(c or '' for c in r))
                        if txt:
                            raw.append({'x0': t.bbox[0], 'top': t.bbox[1] + k * h, 'bottom': t.bbox[1] + (k + 1) * h - 2, 'text': txt})
            raw.sort(key=lambda ln: (round(ln['top'] / 3), ln['x0']))
            for ln in raw:
                x0, top, bottom = ln['x0'], ln['top'], ln['bottom']
                text = ln['text'].strip()
                if not text or re.fullmatch(r'\d{1,3}', text):
                    continue
                gap = (top - prev_bottom) if prev_bottom is not None else 99
                prev_bottom = bottom
                lines.append({'t': text, 'x': x0, 'gap': gap, 'h': bottom - top, 'page': pno, 'top': top})
            lines.append({'t': '', 'x': 0, 'gap': 99, 'h': 0, 'page': pno, 'top': 9999, 'pagebreak': True})
    return lines, tables


def paragraphs(lines, base_x=None):
    """Group lines into paragraphs using vertical gaps; keep indentation info."""
    paras, cur = [], None
    xs = [l['x'] for l in lines if l['t']]
    base_x = base_x if base_x is not None else (min(xs) if xs else 0)
    for l in lines:
        if l.get('pagebreak'):
            continue
        new = cur is None or l['gap'] > max(4, l['h'] * 0.45)
        if new:
            cur = {'t': l['t'], 'indent': l['x'] > base_x + 15}
            paras.append(cur)
        else:
            cur['t'] = join(cur['t'], l['t'])
    return paras


def find(lines, pred, start=0):
    for i in range(start, len(lines)):
        if pred(lines[i]['t']):
            return i
    return len(lines)


# ---------------------------------------------------------------- sections
def parse_questions(qlines):
    qs, cat, cur, target = [], '', None, None
    text = []
    for l in qlines:
        t = l['t']
        if not t:
            continue
        m = re.match(r'^【(.+?)】$', t)
        if m and '閱讀測驗' not in t:
            cat = m.group(1)
            continue
        if t.startswith('【Câu hỏi】'):
            continue
        m = re.match(r'^(\d+)[.、]\s*(.*)$', t)
        if m and not re.match(r'^[A-D][.、]', t):
            cur = {'type': 'mc', 'cat': cat, 'q': m.group(2), 'o': [], 'a': -1}
            qs.append(cur)
            target = 'q'
            continue
        if cur is None:
            continue
        parts = re.split(r'(?:(?<=\s)|^)(?=[A-D][.、]\s)', t)
        parts = [p for p in parts if p.strip()]
        if parts and re.match(r'^[A-D][.、]\s', parts[0]):
            for p in parts:
                cur['o'].append(re.sub(r'^[A-D][.、]\s*', '', p).strip())
            target = 'o'
        elif target == 'o' and cur['o']:
            cur['o'][-1] = join(cur['o'][-1], t)
        else:
            cur['q'] = join(cur['q'], t)
    for q in qs:
        flat = ' '.join('ABCDEFGH'[i] + '. ' + o for i, o in enumerate(q['o']))
        parts = re.split(r'(?:^|(?<=\s))[A-H][.、]\s', flat)
        q['o'] = [p.strip() for p in parts if p.strip()]
    return qs


def answer_table(tables):
    ans = {}
    for tb in tables:
        rows = tb['rows']
        if not rows:
            continue
        head = ' '.join(rows[0]).lower()
        body = rows[1:] if ('đáp' in head or 'câu' in head) else (rows if all(len(r) >= 3 and re.fullmatch(r'\d+', r[0] or '') for r in rows[:2]) else [])
        if not body:
            continue
        last = None
        for r in body:
            if len(r) < 3:
                continue
            if re.fullmatch(r'\d+', r[0] or ''):
                last = int(r[0])
                ans[last] = {'a': (r[1] or '').strip()[:1], 'why': r[2]}
            elif last and r[2]:
                ans[last]['why'] = join(ans[last]['why'], r[2])
    return ans


def vocab_tables(tables):
    out = []
    for tb in tables:
        rows = tb['rows']
        if not rows or not rows[0] or '中文' not in rows[0][0]:
            continue
        for r in rows[1:]:
            r = (r + [''] * 6)[:6]
            if not r[0] and out:
                prev = out[-1]
                prev['note'] = join(prev['note'], r[3]); prev['ex'][0] = (prev['ex'][0] + r[4]).strip(); prev['ex'][1] = join(prev['ex'][1], r[5])
                prev['p'] = join(prev['p'], r[1]); prev['vi'] = join(prev['vi'], r[2])
                continue
            if not r[0]:
                continue
            out.append({'w': r[0].replace(' ', ''), 'p': r[1], 'vi': r[2], 'note': r[3], 'ex': [r[4], r[5]]})
    for v in out:
        v['ex'][0] = clean_cell(v['ex'][0])
    return out


def numbered(lines):
    """['1. foo', 'bar', '2. baz'] -> ['foo bar', 'baz']"""
    items = []
    for t in lines:
        m = re.match(r'^(\d+)[.、]\s*(.*)$', t)
        if m:
            items.append(m.group(2))
        elif items:
            items[-1] = join(items[-1], t)
    return items


def parse_grammar(glines):
    blocks, cur = [], None
    for l in glines:
        t = l['t']
        if not t or 'Ngữ Pháp' in t:
            continue
        if re.match('^[' + CN_NUM + r']+[、：:]', t):
            cur = {'lines': [], 'head': re.sub('^[' + CN_NUM + r']+[、：:]\s*', '', t)}
            blocks.append(cur)
        elif cur:
            cur['lines'].append(t)
    out = []
    labels = ['Pinyin:', 'Nghĩa:', 'Cách dùng chi tiết:', 'Cách dùng:', 'Lưu ý:', 'Ví dụ trong bài:', 'Dịch:', 'Bài tập dịch Việt → Trung:', 'Bài tập', 'Đáp án mẫu:']
    for b in blocks:
        m = re.match(r'^(.*?)[（(](.*)[)）]\s*$', b['head'])
        g = {'title': m.group(1).strip() if m else b['head'], 'titleVi': m.group(2).strip() if m else '', 'pinyin': '', 'meaning': '', 'usage': '', 'note': '', 'example': ['', ''], 'practice': []}
        # split into labelled segments
        segs, key = {}, None
        prac, answers, mode = [], [], None
        for t in b['lines']:
            hit = None
            for lab in labels:
                if t.startswith(lab):
                    hit = lab
                    break
            if hit in ('Bài tập dịch Việt → Trung:', 'Bài tập'):
                mode = 'prac'; continue
            if hit == 'Đáp án mẫu:':
                mode = 'ans'; continue
            if mode == 'prac' and not hit:
                prac.append(t); continue
            if mode == 'ans' and not hit:
                answers.append(t); continue
            if hit:
                mode = None
                rest = t[len(hit):].strip()
                # "Pinyin: xxx Nghĩa: yyy" on one line
                if hit == 'Pinyin:' and 'Nghĩa:' in rest:
                    py, mean = rest.split('Nghĩa:', 1)
                    segs['Pinyin:'] = py.strip(); key = 'Nghĩa:'; segs[key] = mean.strip(); continue
                key = hit; segs[key] = rest
            elif key:
                segs[key] = join(segs[key], t)
        g['pinyin'] = segs.get('Pinyin:', '')
        g['meaning'] = segs.get('Nghĩa:', '')
        g['usage'] = segs.get('Cách dùng chi tiết:', segs.get('Cách dùng:', ''))
        g['note'] = segs.get('Lưu ý:', '')
        g['example'] = [segs.get('Ví dụ trong bài:', ''), segs.get('Dịch:', '')]
        qs, ans = numbered(prac), numbered(answers)
        g['practice'] = [{'q': q, 'a': ans[i] if i < len(ans) else ''} for i, q in enumerate(qs)]
        out.append(g)
    return out


def parse_exercises(elines):
    secs, cur, quote = [], None, None
    for l in elines:
        t = l['t']
        if not t or 'Bài tập bổ sung' in t:
            continue
        if quote is not None:
            quote.append(l); continue
        if re.match(r'^[A-C][12]\s*[-–]\s*\S', t) and secs:
            quote = [l]; continue
        m = re.match(r'^(\d+)[、.]\s*((?:填填看|填空|排列|短文|寫作|翻譯|翻译|選擇|改錯|造句|連連看|閱讀|問答|配對|聽力|口說).*)$', t)
        if m:
            cur = {'title': m.group(2), 'lines': []}
            secs.append(cur)
        elif cur:
            cur['lines'].append(t)
    out, quote_lines = [], []
    for s in secs:
        ex = {'title': s['title'], 'kind': 'qa', 'bank': [], 'items': [], 'prompt': '', 'hint': '', 'sample': ''}
        title = s['title']
        if '填' in title:
            ex['kind'] = 'fill'
        elif '排列' in title:
            ex['kind'] = 'order'
        elif '寫作' in title or '作文' in title:
            ex['kind'] = 'write'
        elif '翻譯' in title or '翻译' in title:
            ex['kind'] = 'translate'
        mode, qs, ans, sample = 'q', [], [], []
        rest = []
        for t in s['lines']:
            if t.startswith('Đáp án:'):
                inline = t[len('Đáp án:'):]
                ans = [re.sub(r'^\d+[.、]\s*', '', x.strip()).strip() for x in re.split(r'[／/]', inline) if x.strip()]
                mode = 'done'; continue
            if t.startswith('Đáp án mẫu:'):
                mode = 'ans'; continue
            if t.startswith('Đáp án tham khảo:'):
                mode = 'sample'; continue
            if t.startswith('題目：') or t.startswith('題目:'):
                ex['prompt'] = t.split('：', 1)[-1].split(':', 1)[-1].strip(); mode = 'prompt'; continue
            if t.startswith('Gợi ý'):
                ex['hint'] = t.split(':', 1)[-1].strip(); mode = 'q'; continue
            if mode == 'q' and ex['kind'] == 'fill' and not ex['bank'] and '／' in t and not re.match(r'^\d', t):
                ex['bank'] = [x.strip() for x in t.split('／') if x.strip()]; continue
            if mode == 'prompt':
                ex['prompt'] = join(ex['prompt'], t); continue
            if mode == 'q':
                qs.append(t)
            elif mode == 'ans':
                ans.append(t)
            elif mode == 'sample':
                sample.append(t)
            elif mode == 'done':
                rest.append(t)
        if mode == 'ans':
            # trailing closing-quote text can follow the last answers
            items = numbered(ans)
            tail = []
            if items:
                last_raw = ans
            ans_items = items
        else:
            ans_items = ans if mode == 'done' or ans and not re.match(r'^\d', ans[0] if ans else '') else numbered(ans)
        q_items = numbered(qs)
        if ex['kind'] == 'write':
            ex['sample'] = ''.join(sample) if sample else ''
        q_items = [re.sub(r'＿[\s＿]*', '＿＿＿', q) for q in q_items]
        ex['items'] = [{'q': q, 'a': ans_items[i] if i < len(ans_items) else ''} for i, q in enumerate(q_items)]
        out.append(ex)
    return out, (parse_quote(quote) if quote else None)


VI_CHARS = re.compile(r'[ăâđêôơưạảãẹẻẽịỉĩọỏõụủũỳỷỹỵấầẩẫậắằẳẵặếềểễệốồổỗộớờởỡợứừửữự]', re.I)


def parse_quote(qlines):
    label = re.sub(r'\s+', ' ', qlines[0]['t']).strip()
    zh, py, vi = [], [], []
    for l in qlines[1:]:
        t = l['t']
        hz = ''.join(re.findall(r'[\u3400-\u9fff，。！？、；：「」…]+', t))
        if hz:
            zh.append(hz)
        latin = re.sub(r'[\u3400-\u9fff，。！？、；：「」…]+', ' ', t).split()
        if not latin:
            continue
        if not hz and l['x'] > 300:      # right-column continuation (Vietnamese)
            vi.append(' '.join(latin)); continue
        k = next((i for i, w in enumerate(latin) if VI_CHARS.search(w)), len(latin))
        if py and k == 0 and not hz and not vi:
            pass
        if k > 0:
            py.append(' '.join(latin[:k]))
        if k < len(latin):
            vi.append(' '.join(latin[k:]))
    return {'label': label, 'zh': ''.join(zh), 'py': ' '.join(py), 'vi': ' '.join(vi)}


def split_quote(exercises):
    """The last translation answer list may swallow the closing quote card; pull it out."""
    if not exercises:
        return None
    last = exercises[-1]
    if not last['items']:
        return None
    a = last['items'][-1]['a']
    m = re.search(r'\s([A-C][12]\s*[-–]\s*\S.*)$', a)
    if not m:
        return None
    last['items'][-1]['a'] = a[:m.start()].strip()
    tail = m.group(1)
    label_m = re.match(r'^([A-C][12]\s*[-–]\s*[^\s]+(?:\s*·\s*[^\s·]+)*)\s*(.*)$', tail)
    label, body = (label_m.group(1), label_m.group(2)) if label_m else ('', tail)
    zh = ''.join(re.findall(r'[㐀-鿿，。！？、；：「」…]+', body))
    rest = re.sub(r'[㐀-鿿，。！？、；：「」…]+', ' ', body).strip()
    words = rest.split()
    tone = re.compile(r'[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]')
    # pinyin = leading run of words that look like pinyin
    py_words, i = [], 0
    while i < len(words) and (tone.search(words[i]) or re.fullmatch(r"[a-zA-Z,.'’]+", words[i])) and not re.search(r'[ăâđêôơư]', words[i], re.I):
        py_words.append(words[i]); i += 1
    return {'label': label.strip(), 'zh': zh, 'py': ' '.join(py_words), 'vi': ' '.join(words[i:])}


def parse(path):
    lines, tables = extract(path)
    T = lambda pred, s=0: find(lines, pred, s)
    i_read = T(lambda t: t.startswith('【Bài đọc】'))
    i_level = T(lambda t: t.startswith('Cấp độ'), i_read)
    head = [l['t'] for l in lines[i_read + 1:i_level] if l['t']]
    title_zh = next((h for h in head if han(h) and not h.startswith('（')), '')
    title_vi = next((h.strip('（）() ') for h in head if h.startswith('（') or h.startswith('(')), '')
    level_txt = lines[i_level]['t'] if i_level < len(lines) else ''
    lm = re.search(r'([A-C][12])', level_txt)
    level_code = lm.group(1) if lm else 'A1'
    exam = 'TOCFL' if 'TOCFL' in level_txt else ('HSK' if 'HSK' in level_txt else '')
    i_q = T(lambda t: t.startswith('【Câu hỏi】'), i_level)
    reading = paragraphs(lines[i_level + 1:i_q])
    i_ans = T(lambda t: t.startswith('✅') or t.startswith('Đáp án') and 'mẫu' not in t, i_q)
    i_tr = T(lambda t: t.startswith('【Dịch bài đọc】'), i_q)
    i_vocab = T(lambda t: 'Từ Vựng' in t and '【' in t, i_q)
    i_gram = T(lambda t: 'Ngữ Pháp' in t and '【' in t, i_vocab)
    i_ex = T(lambda t: 'Bài tập bổ sung' in t, i_gram)
    questions = parse_questions(lines[i_q:min(i_ans, i_tr, i_vocab)])
    answers = answer_table([tb for tb in tables])
    for n, q in enumerate(questions, 1):
        if n in answers:
            letter = answers[n]['a']
            q['a'] = 'ABCD'.find(letter) if letter in 'ABCD' else -1
            q['why'] = answers[n]['why']
    trans = paragraphs(lines[i_tr + 1:i_vocab]) if i_tr < i_vocab else []
    text = [{'sp': '', 'zh': p['t'], 'vi': '', 'en': '', 'indent': p['indent']} for p in reading]
    if trans and len(trans) == len(text):
        for x, tr in zip(text, trans):
            x['vi'] = tr['t']
    elif trans:
        # different paragraph counts: keep the full translation as one block on the first line
        text[0]['vi'] = ' '.join(tr['t'] for tr in trans)
    vocab = vocab_tables(tables)
    grammar = parse_grammar(lines[i_gram:i_ex])
    exercises, quote = parse_exercises(lines[i_ex:])
    slug = slugify(title_vi or os.path.basename(path))
    return {
        'id': 'tocfl-' + level_code.lower() + '-' + slug if exam == 'TOCFL' else level_code.lower() + '-' + slug,
        'subject': 'zh', 'lang': 'zh', 'kind': 'passage', 'emoji': '📖',
        'title': {'zh': title_zh, 'vi': title_vi, 'en': ''},
        'level': LEVELS.get(level_code, 1), 'levelCode': level_code, 'exam': exam,
        'author': 'Hanry Academy', 'authorRole': 'admin', 'sourceType': 'self', 'visibility': 'public', 'official': True,
        'text': text, 'trSource': 'author' if trans else '',
        'questions': questions, 'vocab': vocab, 'grammar': grammar, 'exercises': exercises, 'quote': quote,
        'file': os.path.basename(path)
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry' in sys.argv
    lessons = [parse(p) for p in args]
    if dry:
        print(json.dumps(lessons, ensure_ascii=False, indent=1))
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    data = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else []
    byid = {d['id']: d for d in data}
    now = int(time.time() * 1000)
    for i, L in enumerate(lessons):
        old = byid.get(L['id'])
        L['created'] = old['created'] if old and old.get('created') else now - i * 60000
        if old:  # keep hand-edited fields (e.g. translations added later)
            for k in ('text',):
                if old.get('trSource') and not L.get('trSource'):
                    L['text'] = [dict(x, vi=(old['text'][j]['vi'] if j < len(old['text']) else '')) for j, x in enumerate(L['text'])]
                    L['trSource'] = old['trSource']
        byid[L['id']] = L
        print('✓', L['id'], '|', L['title']['zh'], '|', len(L['text']), 'đoạn,', len(L['questions']), 'câu hỏi,', len(L['vocab']), 'từ,', len(L['grammar']), 'ngữ pháp,', len(L['exercises']), 'bài tập')
    out = sorted(byid.values(), key=lambda d: (d['level'], d.get('created', 0)))
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('→', OUT, len(out), 'bài')


if __name__ == '__main__':
    main()
