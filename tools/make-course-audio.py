#!/usr/bin/env python3
"""Audio for the Pinyin / Zhuyin course (js/learn.js): the sound of every letter (NAME: b → 玻 bō, ㄅ …), every example
character and rule example, saved as data/audio/course/<hex>.mp3 (hex = UTF-8 hex of the text the page plays).
Single syllables are read with Google's zh-TW voice: measured pitch contours show it keeps the four tones apart, while
the ElevenLabs voices read isolated characters with a rising-questioning contour (媽/麻/馬 sounded alike).

  python3 tools/make-course-audio.py            # missing files only
  python3 tools/make-course-audio.py --force    # regenerate all
  python3 tools/make-course-audio.py --check                         # tone check of the single characters (pitch contour)
"""
import json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'audio', 'course')
VOICE = '1AKkSX7KMPHIWuz76m0n'
TRAD = dict(zip('妈发来鸡饿鱼爱谢对门欢黄远云马骂吗个儿点绿学', '媽發來雞餓魚愛謝對門歡黃遠雲馬罵嗎個兒點綠學'))


def key(s): return s.encode('utf-8').hex()


def items():
    s = open(os.path.join(ROOT, 'js', 'learn.js'), encoding='utf-8').read()
    out = {}
    for sym, ch, py in re.findall(r"^\s*\['([^']*)', '([一-鿿]+)', '([^']*)'", s, re.M):
        out[ch] = py
    for ex in re.findall(r"^\s*\['[^\n]*', '([^'\n]*[一-鿿][^'\n]*)'\],?$", s, re.M):
        sp = re.sub(r"[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü'→\s,，;()ㄅ-ㄩˉˊˇˋ˙]+", '，', ex)
        out.setdefault(sp, None)
    m = re.search(r'const NAME = \{(.*?)\};', s, re.S)
    for ch in re.findall(r":\s*'([\u4e00-\u9fff]+)'", m.group(1)):
        out.setdefault(ch, None)
    return out


def tts(text, path):
    import time, urllib.parse
    url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-TW&client=tw-ob&q=' + urllib.parse.quote(text)
    data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
    assert len(data) > 1000, text
    open(path, 'wb').write(data); time.sleep(0.4)


def tts_eleven(text, path):
    body = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'language_code': 'zh',
                       'voice_settings': {'stability': 0.8, 'similarity_boost': 0.75, 'style': 0, 'speed': 0.85}}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_64' % VOICE, body,
                                 {'xi-api-key': os.environ.get('ELEVENLABS_API_KEY', ''), 'Content-Type': 'application/json'})
    open(path, 'wb').write(urllib.request.urlopen(req, timeout=120).read())


def contour(path):
    """pitch (Hz) every 10 ms of the voiced part, by autocorrelation"""
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float)
    f0 = []
    for i in range(0, len(x) - 640, 160):
        w = x[i:i + 640] * np.hanning(640)
        if np.sqrt((w ** 2).mean()) < 300: continue
        ac = np.correlate(w, w, 'full')[639:]
        lo, hi = 16000 // 400, 16000 // 80
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.35 * ac[0]: f0.append(16000 / lag)
    return f0


def tone_of(f0):
    import numpy as np
    if len(f0) < 6: return '?'
    f = np.array(f0); f = f[(f > np.median(f) * 0.6) & (f < np.median(f) * 1.6)]
    n = len(f); a, m, b = f[:n // 4].mean(), f[n // 3: 2 * n // 3].min(), f[-n // 4:].mean()
    st = lambda p, q: 12 * np.log2(q / p)            # semitones
    if st(a, b) < -3: return '4'
    if st(m, a) > 1.5 and st(m, b) > 1.5: return '3'
    if st(a, b) > 2: return '2'
    if abs(st(a, b)) <= 2: return '1'
    return '?'


def main():
    os.makedirs(OUT, exist_ok=True)
    it = items()
    if '--check' in sys.argv:
        marks = {'1': 'āēīōūǖ', '2': 'áéíóúǘ', '3': 'ǎěǐǒǔǚ', '4': 'àèìòùǜ'}
        bad = 0
        for ch, py in it.items():
            if not py: continue
            want = next((t for t, m in marks.items() if any(c in py for c in m)), '5')
            got = tone_of(contour(os.path.join(OUT, key(ch) + '.mp3')))
            ok = want == got or want == '5' or (want == '3' and got in '23')   # a dipping 3rd tone is often only low-rising
            if not ok: bad += 1
            print('OK ' if ok else '?? ', ch, py, 'want', want, 'got', got)
        print(bad, 'to listen to')
        return
    for text in it:
        p = os.path.join(OUT, key(text) + '.mp3')
        if os.path.exists(p) and '--force' not in sys.argv: continue
        tts(''.join(TRAD.get(c, c) for c in text).strip('，'), p)
        print('✓', text)


if __name__ == '__main__':
    main()
