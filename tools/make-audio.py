#!/usr/bin/env python3
"""Generate natural audio (ElevenLabs) for the official reading lessons.

Each paragraph becomes data/audio/<lesson-id>/<n>.mp3. In dialogues the narrator and every
character get their own Taiwanese-Mandarin voice (same character = same voice in the whole lesson).

Usage:
  ELEVENLABS_API_KEY=... python3 tools/make-audio.py              # all lessons that have no audio yet
  ELEVENLABS_API_KEY=... python3 tools/make-audio.py <lesson-id>  # only these lessons
  python3 tools/make-audio.py --dry <lesson-id>                   # show who reads what, no API calls
Files that already exist are skipped, so the script can be re-run safely.
"""
import json, os, re, subprocess, sys, tempfile, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'posts', 'official.json')
OUT = os.path.join(ROOT, 'data', 'audio')
MODEL = 'eleven_multilingual_v2'
FORMAT = 'mp3_44100_64'
# Taiwanese Mandarin voices from the ElevenLabs voice library
NARRATOR = '1AKkSX7KMPHIWuz76m0n'                                # Tiffy – bilingual narrator (female)
MALE = ['ZhxuUPFU7Hvp3p8qIPQP', '7Sk22fdUzAroSHJkVoXB']          # Chun, Juin
FEMALE = ['r4thHOi5MAZw256OxDPJ', 'JtZhgM7XBhFvWPvHL8ZX']        # Lucy, Chen
SETTINGS = {'stability': 0.55, 'similarity_boost': 0.75, 'style': 0.15, 'use_speaker_boost': True, 'speed': 0.92}

FEM_NAME = re.compile(r'她|女|小姐|太太|媽|姐|妹|阿姨|奶奶|婆|老闆娘|美|婷|玲|雅|靜|晴|璇|純|如|真|英|芳|華|珍|琪|娟|家家|安安|曉')
MALE_NAME = re.compile(r'他|男|先生|爸|哥|弟|叔|伯|爺|公公|偉|哲|傑|凱|豪|明|廷|強|志|剛|軍|遠')
SAY = re.compile(r'(說|問|道|喊|回答|寫道)[^，。！？「」]{0,8}[：:，,]?\s*$')
MARK = re.compile(r'微笑|笑著|輕聲|小聲|大聲|平靜|靜靜|緩緩|想了|沉默|嘆|聽完|聽了|搖搖|搖頭|點點|點頭|看著|看了|對著|舉起|拿起|放下|翻著|發現|繼續|常|曾|才|跟|向|也|又|就|在|說|問|道|喊|回答|寫|告訴|叫')
TIME = re.compile(r'^(有一天|那天|過了幾天|然後|後來|最後|於是|這時候?|突然|忽然|沒想到|想不到)')


def subject(c):
    c = re.sub(r'[（(][^）)]*[）)]', '', c)
    c = TIME.sub('', c).strip()
    m = MARK.search(c)
    who = (c[:m.start()] if m else c).strip()
    if '的' in who: who = who.split('的')[-1]          # 她的好朋友小玲 → 好朋友小玲
    if len(who) > 3: who = who[-2:]                    # → 小玲 / 哲學家 → 學家
    return who if who not in ('這樣', '這麼', '如此', '') else None


def speaker_of(before):
    """The subject of the sentence that ends with 說/問…：  (first clause that has one)"""
    if not SAY.search(before):
        return None
    sent = re.split(r'[。！？」”]', before)[-1]
    for c in [x.strip() for x in re.split(r'[，,；]', sent) if x.strip()]:
        who = subject(c)
        if who: return who
    return None


def parse(text, state=None):
    """state carries a speaker across paragraphs: 小傑問老師：  ⏎  「老師，……」"""
    state = state if state is not None else {}
    out = []
    for line in [l.strip() for l in text.split('\n') if l.strip()]:
        # a paragraph that is entirely one quotation, said by the speaker announced just before
        if state.get('who') and (state.get('open') or (line[:1] in '「“' and (line.count('「') + line.count('“') <= 1))):
            out.append([line.strip('「」“”'), state['who']])
            state['open'] = not re.search(r'[」”]\s*$', line)
            if not state['open']: state['who'] = None
            continue
        state['who'] = None
        for ln in re.split(r'\s+(?=(?:[A-Z]|[男女])[：:])', line):
            m = re.match(r'^((?:[A-Z]|[男女])|[一-鿿]{1,4})[：:]\s*(?![「“])(.+)$', ln)
            if m and not re.search(r'[，。]', m.group(1)):
                out.append([m.group(2), m.group(1)]); continue
            last, who = 0, None
            for q in re.finditer(r'[「“]([^」”]+)[」”]', ln):
                before = ln[last:q.start()]
                sp = speaker_of(before)
                if sp and len(q.group(1)) > 4:
                    if before.strip(): out.append([before, None])
                    who = sp
                    out.append([q.group(1), who])
                else:
                    out.append([before + q.group(0), None])
                last = q.end()
            rest = ln[last:]
            if rest.strip(): out.append([rest, None])
            # "……說：" at the end announces a quotation in the next paragraph
            if rest.strip() and re.search(r'[：:]\s*$', rest): state['who'] = speaker_of(rest) or speaker_of(ln)
    merged = []
    for t, w in out:
        if merged and merged[-1][1] == w: merged[-1][0] += t
        else: merged.append([t, w])
    return merged


class Cast:
    def __init__(self):
        self.roles, self.n = {}, 0

    def voice(self, who):
        if not who:
            return NARRATOR
        if who not in self.roles:
            if re.fullmatch(r'男|B', who): g = 'm'
            elif re.fullmatch(r'女|A', who): g = 'f'
            elif MALE_NAME.search(who) and not FEM_NAME.search(who): g = 'm'
            elif FEM_NAME.search(who): g = 'f'
            else: g = 'f' if self.n % 2 else 'm'
            pool = MALE if g == 'm' else FEMALE
            used = list(self.roles.values())
            self.roles[who] = next((v for v in pool if v not in used), pool[self.n % len(pool)])
            self.n += 1
        return self.roles[who]


# 地 = "de" as the adverbial particle (慢慢地走), "dì" in place words (地方, 特地). Same rule as js/zh.js.
DI_PREV = re.compile(r'(天|土|本|當|当|外|各|內|内|陸|陆|草|場|场|基|境|餘|余|特|原|就|遍|滿|满|落|在|田|心|的|園|园|領|领|墓|產|产|大|營|营|工|空|平|高|山|林|綠|绿|民|據|据|之|盆|耕|濕|湿|聖|圣|勝|胜|寶|宝|腹|席|死|此|該|该|某|兩|两|異|异|重|險|险|陣|阵|殖|處|处|塌)$')
DI_NEXT = re.compile(r'^(方|圖|图|址|點|点|區|区|球|鐵|铁|下|上|面|板|位|震|帶|带|步|產|产|理|獄|狱|毯|瓜|主|道|形|勢|势|質|质|域|價|价|名|盤|盘|標|标|層|层|段|基|雷|皮|攤|摊|心|平|窖|租|契|界)')
FUNC_PREV = re.compile(r'(的|在|到|這|这|那|個|个|了|是|有|一|各|此|滿|满|把|往|向|從|从|和|與|与|及|上|中|裡|里|全|整|當|当|本|多|少|些|種|种|麼|么|好|新|老|大|小|個)$')
HAN = re.compile(r'[\u4e00-\u9fff]')


DI_STRONG = re.compile(r'^(位|帶|带|圖|图|區|区|球|址|鐵|铁|震|獄|狱|毯|瓜|盤|盘|基)')


def particle_de(prev, nxt, prev2, nxt2=''):
    if not prev or not HAN.match(prev): return False
    if prev2 and prev2 == prev: return True
    if prev2 == '天': return False
    if nxt and DI_STRONG.match(nxt) and not (nxt == '基' and re.match(r'[於于]', nxt2 or '')): return False
    if DI_PREV.search(prev) and prev2 != prev: return False
    if prev2 and prev2 == prev: return True
    if nxt and DI_NEXT.match(nxt) and FUNC_PREV.search(prev): return False
    return True


def tts_text(t):
    """The voice reads particle 地 as 的 (same sound) so it never says dì by mistake."""
    return ''.join('的' if c == '地' and particle_de(t[i - 1] if i else '', t[i + 1] if i + 1 < len(t) else '', t[i - 2] if i > 1 else '', t[i + 2] if i + 2 < len(t) else '') else c for i, c in enumerate(t))


def tts(text, voice, prev, nxt, path):
    body = {'text': tts_text(text), 'model_id': MODEL, 'voice_settings': SETTINGS, 'previous_text': prev or None, 'next_text': nxt or None}
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format={FORMAT}',
                                 data=json.dumps(body).encode(), method='POST',
                                 headers={'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', ''), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f:
        f.write(r.read())


def concat(parts, path, gap=0.35):
    """Join segment mp3s with a short pause between speakers."""
    if len(parts) == 1:
        os.replace(parts[0], path); return
    with tempfile.TemporaryDirectory() as tmp:
        sil = os.path.join(tmp, 'sil.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', str(gap), '-b:a', '64k', sil], check=True)
        lst = os.path.join(tmp, 'list.txt')
        with open(lst, 'w') as f:
            for i, p in enumerate(parts):
                if i: f.write(f"file '{sil}'\n")
                f.write(f"file '{p}'\n")
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-ar', '44100', '-b:a', '64k', path, '-y'], check=True)


def main():
    dry = '--dry' in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith('--')]
    data = json.load(open(DATA, encoding='utf-8'))
    for L in data:
        if ids and L['id'] not in ids: continue
        if not ids and L.get('audio'): continue
        cast, d = Cast(), os.path.join(OUT, L['id'])
        os.makedirs(d, exist_ok=True)
        paras = [x['zh'] for x in L['text']]
        state = {}
        for n, para in enumerate(paras):
            segs = parse(para, state)
            if dry:
                print(L['id'], n, ' | '.join((w or '旁白') + '→' + cast.voice(w)[:4] + ': ' + t[:18] for t, w in segs)); continue
            path = os.path.join(d, f'{n}.mp3')
            if os.path.exists(path): continue
            with tempfile.TemporaryDirectory() as tmp:
                parts = []
                for k, (t, w) in enumerate(segs):
                    p = os.path.join(tmp, f'{k}.mp3')
                    prev = segs[k - 1][0] if k else (paras[n - 1] if n else '')
                    nxt = segs[k + 1][0] if k + 1 < len(segs) else (paras[n + 1] if n + 1 < len(paras) else '')
                    tts(t.strip(), cast.voice(w), prev[-300:], nxt[:300], p)
                    parts.append(p)
                concat(parts, path)
            print('✓', L['id'], n, flush=True)
        if not dry:
            L['audio'] = len(paras)
    if not dry:
        json.dump(data, open(DATA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
