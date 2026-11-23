/* Chinese text engine: dictionary, segmentation, pinyin/zhuyin, traditional, TTS */
(function () {
  const ZH = (HA.zh = {});
  const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;
  ZH.isHan = (c) => HAN.test(c);
  ZH.hasHan = (s) => HAN.test(s || '');

  /* ---------- Pinyin helpers ---------- */
  const TONES = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', v: 'ǖǘǚǜ' };
  ZH.numToMark = function (syl) {
    // "hao3" -> "hǎo", "lv4" -> "lǜ", "r5" -> "r"
    const m = /^([a-zü:]+?)([1-5])?$/i.exec(syl);
    if (!m) return syl;
    let s = m[1].replace(/u:|ü/gi, 'v');
    const t = +(m[2] || 5);
    if (t === 5 || t === 0) return s.replace(/v/g, 'ü');
    const lower = s.toLowerCase();
    let idx = lower.search(/[ae]/);
    if (idx < 0) idx = lower.indexOf('ou');
    if (idx < 0) {
      for (let i = lower.length - 1; i >= 0; i--) if ('aeiouv'.includes(lower[i])) { idx = i; break; }
    }
    if (idx < 0) return s;
    const ch = lower[idx];
    const marked = TONES[ch][t - 1];
    const out = s.slice(0, idx) + (s[idx] === s[idx].toUpperCase() && s[idx] !== s[idx].toLowerCase() ? marked.toUpperCase() : marked) + s.slice(idx + 1);
    return out.replace(/v/g, 'ü');
  };
  ZH.pinyinNumToMarks = (p) => p.split(/\s+/).map(ZH.numToMark).join(' ');
  const STRIP = {};
  Object.entries(TONES).forEach(([b, set]) => [...set].forEach((c, i) => (STRIP[c] = [b === 'v' ? 'ü' : b, i + 1])));
  ZH.toneOf = function (syl) {
    for (const c of syl) if (STRIP[c]) return STRIP[c][1];
    return 5;
  };
  ZH.stripTones = (s) => [...(s || '')].map((c) => (STRIP[c] ? STRIP[c][0] : c)).join('').replace(/ü/g, 'v');
  ZH.normPinyin = (s) => ZH.stripTones(String(s || '').toLowerCase()).replace(/[1-5]/g, '').replace(/u:/g, 'v').replace(/[^a-zv]/g, '');

  /* ---------- Zhuyin (Bopomofo) ---------- */
  const ZI = { b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ', g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ' };
  const ZF = {
    a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ê: 'ㄝ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', ong: 'ㄨㄥ', er: 'ㄦ',
    i: 'ㄧ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iao: 'ㄧㄠ', iu: 'ㄧㄡ', iou: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ', io: 'ㄧㄛ',
    u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uei: 'ㄨㄟ', uan: 'ㄨㄢ', un: 'ㄨㄣ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ',
    v: 'ㄩ', ve: 'ㄩㄝ', van: 'ㄩㄢ', vn: 'ㄩㄣ'
  };
  const ZT = ['', 'ˊ', 'ˇ', 'ˋ', '˙'];
  ZH.toZhuyin = function (syl) {
    if (!syl || !/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(syl)) return syl;
    const tone = ZH.toneOf(syl);
    let s = ZH.stripTones(syl.toLowerCase());
    if (s === 'r') return '˙ㄦ';
    let ini = '';
    const im = /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/.exec(s);
    if (im) { ini = im[1]; s = s.slice(ini.length); }
    else if (s[0] === 'y') { s = s.slice(1); if (s[0] === 'u') s = 'v' + s.slice(1); else if (s[0] !== 'i') s = 'i' + s; }
    else if (s[0] === 'w') { s = s.slice(1); if (s[0] !== 'u') s = 'u' + s; }
    if (ini && 'jqx'.includes(ini) && s[0] === 'u') s = 'v' + s.slice(1);
    let fin;
    if (s === 'i' && /^(zh|ch|sh|r|z|c|s)$/.test(ini)) fin = '';
    else fin = ZF[s];
    if (fin === undefined) return syl;
    let out = (ZI[ini] || '') + fin;
    if (tone === 5) return '˙' + out;
    return out + ZT[tone - 1];
  };

  /* ---------- Dictionary ---------- */
  const D = (ZH.dict = { entries: [], index: new Map(), loaded: { vi: false, en: false }, hv: new Map(), s2t: new Map(), t2s: new Map(), sSet: new Set() });
  const curated = new Map(); // simplified word -> lesson vocab item
  ZH.curated = curated;
  ZH.addCurated = function (v, lessonId) {
    if (!v || !v.w) return;
    if (!curated.has(v.w)) curated.set(v.w, Object.assign({ lesson: lessonId }, v));
    addKey(v.w, null);
  };
  let maxLen = 1;
  function addKey(k, idx) {
    if (!k) return;
    let arr = D.index.get(k);
    if (!arr) D.index.set(k, (arr = []));
    if (idx !== null) arr.push(idx);
    const l = [...k].length;
    if (l > maxLen && l <= 8) maxLen = l;
  }
  function parseTSV(text, lang) {
    const lines = text.split('\n');
    // Merge into existing entries keyed by s|t|p
    const keyMap = D._keyMap || (D._keyMap = new Map());
    for (const line of lines) {
      if (!line) continue;
      const [s, t0, p, def] = line.split('\t');
      const t = t0 || s;
      const key = s + '|' + t + '|' + p;
      let idx = keyMap.get(key);
      if (idx === undefined) {
        idx = D.entries.length;
        D.entries.push({ s, t, p, vi: '', en: '' });
        keyMap.set(key, idx);
        addKey(s, idx);
        if (t !== s) addKey(t, idx);
        if ([...s].length === 1) D.sSet.add(s);
        if ([...s].length === 1 && t !== s) {
          if (!D.s2t.has(s) && !/^[A-Z]/.test(p)) D.s2t.set(s, t);
          if (!D.t2s.has(t)) D.t2s.set(t, s);
        }
      }
      D.entries[idx][lang] = def;
    }
  }
  const loading = {};
  ZH.loadDict = function (lang) {
    if (loading[lang]) return loading[lang];
    loading[lang] = fetch('data/dict-' + lang + '.tsv')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((txt) => { parseTSV(txt, lang); D.loaded[lang] = true; document.dispatchEvent(new CustomEvent('ha:dict')); })
      .catch((e) => { console.warn('dict load failed', lang, e); loading[lang] = null; });
    return loading[lang];
  };
  ZH.loadHanViet = function () {
    if (loading.hv) return loading.hv;
    loading.hv = fetch('data/hanviet.tsv').then((r) => r.text()).then((txt) => {
      for (const l of txt.split('\n')) { const [c, r] = l.split('\t'); if (c) D.hv.set(c, r); }
    }).catch(() => {});
    return loading.hv;
  };
  ZH.hanViet = function (word) {
    const cur = curated.get(word);
    if (cur && cur.hv) return cur.hv;
    const parts = [...word].map((c) => (D.hv.get(c) || '').split(',')[0]).filter(Boolean);
    return parts.length === [...word].length ? parts.join(' ') : '';
  };
  ZH.lookup = function (word) {
    const idxs = D.index.get(word) || [];
    const list = idxs.map((i) => D.entries[i]);
    // lower-case pinyin (common words) first, proper nouns last
    list.sort((a, b) => (/^[A-Z]/.test(a.p) ? 1 : 0) - (/^[A-Z]/.test(b.p) ? 1 : 0));
    return { cur: curated.get(word) || curated.get(ZH.toSimp(word)), list };
  };

  /* ---------- Script conversion ---------- */
  // Simplified -> Traditional (Taiwan standard) via OpenCC; dictionary map as fallback
  let cc = null;
  ZH.cc = function (s) {
    if (!cc && window.OpenCC) { try { cc = window.OpenCC.Converter({ from: 'cn', to: 'tw' }); } catch (e) { cc = null; } }
    return cc ? cc(s) : null;
  };
  ZH.toTradChar = (c) => { const r = ZH.cc(c); return r && [...r].length === 1 ? r : D.s2t.get(c) || c; };
  ZH.toSimp = function (text) {
    return [...(text || '')].map((c) => (D.sSet.has(c) ? c : D.t2s.get(c) || c)).join('');
  };

  /* ---------- Segmentation + pinyin ---------- */
  const cache = new Map();
  ZH.clearCache = () => cache.clear();
  ZH.analyze = function (text) {
    text = String(text || '');
    if (cache.has(text)) return cache.get(text);
    const chars = [...text];
    const tokens = [];
    let i = 0;
    while (i < chars.length) {
      const c = chars[i];
      if (!ZH.isHan(c)) {
        let j = i;
        while (j < chars.length && !ZH.isHan(chars[j])) j++;
        tokens.push({ text: chars.slice(i, j).join(''), han: false });
        i = j;
        continue;
      }
      let found = 1;
      for (let L = Math.min(maxLen, chars.length - i); L > 1; L--) {
        const w = chars.slice(i, i + L).join('');
        if (!ZH.hasHanAll(w)) continue;
        if (D.index.has(w)) { found = L; break; }
      }
      // A non-curated dictionary compound that splits fully into curated lesson words
      // (e.g. 都会 -> 都 + 会) is read as separate words, which matches lesson context better.
      if (found > 1) {
        const w = chars.slice(i, i + found).join('');
        if (!curated.has(w)) {
          const parts = splitCurated(chars.slice(i, i + found));
          if (parts) found = parts[0];
          else {
            // a lesson word overlapping the end wins (做作业 -> 做 + 作业, not 做作 + 业)
            outer: for (let k = 1; k < found; k++) {
              for (let L2 = Math.min(6, chars.length - i - k); L2 > found - k; L2--) {
                if (curated.has(chars.slice(i + k, i + k + L2).join(''))) { found = k; break outer; }
              }
            }
          }
        }
      }
      tokens.push({ text: chars.slice(i, i + found).join(''), han: true });
      i += found;
    }
    // Simplified form per token (for pinyin + lookup)
    tokens.forEach((t) => {
      if (!t.han) return;
      const ents = (D.index.get(t.text) || []).map((k) => D.entries[k]);
      const e = ents.find((x) => x.t === t.text && x.t !== x.s);
      t.simp = e ? e.s : ZH.toSimp(t.text);
      t.ents = ents;
    });
    // Context pinyin from pinyin-pro for the whole simplified sentence
    const simpText = tokens.map((t) => (t.han ? t.simp : t.text)).join('');
    let pp = [];
    try { pp = window.pinyinPro.pinyin(simpText, { type: 'array', toneSandhi: false }); } catch (e) { pp = []; }
    const tradAll = ZH.cc(simpText);
    const tradChars = tradAll && [...tradAll].length === [...simpText].length ? [...tradAll] : null;
    let pos = 0;
    tokens.forEach((t) => {
      const len = [...(t.han ? t.simp : t.text)].length;
      if (t.han) {
        const ctx = pp.slice(pos, pos + len);
        t.py = choosePinyin(t, ctx, len);
        // traditional rendering
        if (tradChars) t.trad = tradChars.slice(pos, pos + len).join('');
        else {
          const tr = (t.ents || []).find((x) => x.s === t.simp && !/^[A-Z]/.test(x.p)) || (t.ents || [])[0];
          t.trad = tr && [...tr.t].length === len ? tr.t : [...t.simp].map(ZH.toTradChar).join('');
        }
      }
      pos += len;
    });
    if (cache.size > 3000) cache.clear();
    cache.set(text, tokens);
    return tokens;
  };
  ZH.hasHanAll = (w) => [...w].every((c) => ZH.isHan(c));
  function splitCurated(cs) {
    // returns lengths of a full decomposition into >= 2 curated words, or null
    const n = cs.length;
    const best = new Array(n + 1).fill(null); best[0] = [];
    for (let a = 0; a < n; a++) {
      if (!best[a]) continue;
      for (let b = n; b > a; b--) {
        if (b - a === n) continue;
        if (curated.has(cs.slice(a, b).join('')) && !best[b]) best[b] = best[a].concat([b - a]);
      }
    }
    return best[n] && best[n].length >= 2 ? best[n] : null;
  }
  // Split a pinyin string without spaces into syllables ("hǎochu" -> ["hǎo","chu"]).
  // n (optional) = expected number of syllables; a vowel-initial syllable inside a chunk is
  // avoided (pinyin writes an apostrophe there).
  const SYLS = new Set('a ai an ang ao ba bai ban bang bao bei ben beng bi bian biang biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei deng di dian diao die ding diu dong dou du duan dui dun duo e ei en er fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu long lou lu luan lun luo lv lve ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nv nve o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun r ran rang rao re ren reng ri rong rou ru ruan rui run ruo sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun xx ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo'.split(' '));
  ZH.splitPinyin = function (p, n) {
    p = String(p || '').toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü' -]/g, '');
    const chunks = p.split(/[\s'-]+/).filter(Boolean);
    const solve = (strict) => {
      // DP over all chunks; returns array of syllables (count n if given)
      let states = [[]];
      for (const chunk of chunks) {
        const base = ZH.stripTones(chunk);
        const memo = new Map();
        const rec = (i) => {
          if (i === base.length) return [[]];
          if (memo.has(i)) return memo.get(i);
          const res = [];
          for (let e = Math.min(base.length, i + 6); e > i; e--) {
            const sy = base.slice(i, e);
            if (!SYLS.has(sy)) continue;
            if (strict && i > 0 && /^[aeo]/.test(sy)) continue;
            for (const rest of rec(e)) { res.push([chunk.slice(i, e)].concat(rest)); if (res.length > 12) break; }
          }
          memo.set(i, res);
          return res;
        };
        const opts = rec(0);
        if (!opts.length) return null;
        const next = [];
        for (const s0 of states) for (const o of opts) { next.push(s0.concat(o)); if (next.length > 50) break; }
        states = next;
      }
      if (n) { const hit = states.find((x) => x.length === n); return hit || null; }
      return states.sort((a, b) => a.length - b.length)[0] || null;
    };
    return solve(true) || solve(false);
  };
  function choosePinyin(t, ctx, len) {
    const cur = curated.get(t.simp);
    const cands = (t.ents || []).filter((e) => e.s === t.simp || e.t === t.text)
      .map((e) => ZH.pinyinNumToMarks(e.p).toLowerCase().split(' '))
      .filter((a) => a.length === len);
    if (len === 1) return ctx.length ? ctx : cands[0] || [''];
    const ctxJ = ctx.join(' ');
    if (cur && cur.p) {
      const cp = ZH.splitPinyin(cur.p, len);
      if (cp && cp.length === len) return cp;
    }
    if (cands.some((c) => c.join(' ') === ctxJ)) return ctx;
    // Prefer dictionary reading for multi-char words (fixes 长得 etc.), but keep context
    // neutral-tone particles at the end (到了 -> dào le, not dào liǎo)
    const pick = (cands[0] || ctx).slice();
    const last = [...t.simp].pop();
    if ('了着过'.includes(last) && ctx[len - 1] && ZH.toneOf(ctx[len - 1]) === 5) pick[len - 1] = ctx[len - 1];
    return pick;
  }
  ZH.pinyinOf = function (text) {
    return ZH.analyze(text).map((t) => (t.han ? t.py.join('') : t.text)).join(' ').replace(/\s+([，。！？、,.!?；：])/g, '$1').replace(/\s+/g, ' ').trim();
  };

  /* ---------- Rendering ---------- */
  // opts: {ruby:bool, tip:bool, script:'s'|'t', phon:'pinyin'|'zhuyin'|'none'}
  ZH.render = function (text, opts) {
    opts = opts || {};
    const st = HA.state ? HA.state.settings : {};
    const script = opts.script || st.script || 's';
    const phon = opts.ruby === false ? 'none' : opts.phon || (st.showRuby === false ? 'none' : st.phon || 'pinyin');
    const tip = opts.tip !== false;
    return ZH.analyze(text).map((t) => {
      if (!t.han) return HA.ui.esc(t.text);
      const display = script === 't' ? [...t.trad] : [...t.text];
      let inner;
      if (phon === 'none') inner = HA.ui.esc(display.join(''));
      else {
        // one ruby per word keeps characters together; each syllable is tone-colored
        const rt = display.map((c, k) => {
          const py = t.py[k] || '';
          const r = phon === 'zhuyin' ? ZH.toZhuyin(py) : py;
          return '<span class="t' + ZH.toneOf(py) + '">' + HA.ui.esc(r) + '</span>';
        }).join(phon === 'zhuyin' ? ' ' : '');
        inner = '<ruby' + (phon === 'zhuyin' ? ' class="zy"' : '') + '>' + HA.ui.esc(display.join('')) + '<rt>' + rt + '</rt></ruby>';
      }
      return tip ? '<span class="w" data-w="' + HA.ui.esc(t.simp) + '" data-p="' + HA.ui.esc(t.py.join(' ')) + '">' + inner + '</span>' : '<span class="wn">' + inner + '</span>';
    }).join('');
  };
  // Display a word in selected script without ruby
  ZH.disp = function (text) {
    const st = HA.state ? HA.state.settings : {};
    if (st.script !== 't') return text;
    return ZH.analyze(text).map((t) => (t.han ? t.trad : t.text)).join('');
  };
  ZH.phon = function (pinyin) {
    const st = HA.state ? HA.state.settings : {};
    if (st.phon === 'zhuyin') return pinyin.split(/\s+/).map(ZH.toZhuyin).join(' ');
    return pinyin;
  };

  /* ---------- TTS (natural-sounding: best voice + phrase pauses) ---------- */
  const VLANG = { zh: 'zh-CN', zht: 'zh-TW', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR', fr: 'fr-FR', de: 'de-DE', vi: 'vi-VN' };
  let voices = [];
  function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; document.dispatchEvent(new CustomEvent('ha:voices')); }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  ZH.canSpeak = () => !!window.speechSynthesis;
  // Rank voices: neural/natural/online voices sound far less robotic than legacy desktop voices
  function score(v, want) {
    let s = 0;
    const L = v.lang.replace('_', '-');
    if (L.toLowerCase() === want.toLowerCase()) s += 50; else if (L.slice(0, 2) === want.slice(0, 2)) s += 30; else return -1;
    if (/natural|neural|online|premium|enhanced|siri/i.test(v.name)) s += 25;
    if (/google/i.test(v.name)) s += 15;
    if (/xiaoxiao|xiaoyi|yunxi|yunjian|hsiaochen|hsiaoyu|yunjhe|tingting|meijia|lili|nanami|sunhi|jenny|aria|guy|ava|andrew|emma/i.test(v.name)) s += 10;
    if (/huihui|kangkang|yaoyao|hanhan|zhiwei|compact|espeak/i.test(v.name)) s -= 10;
    if (!v.localService) s += 3;
    return s;
  }
  ZH.voicesFor = function (lang) {
    const want = VLANG[lang] || lang;
    return voices.map((v) => [v, score(v, want)]).filter((x) => x[1] >= 0).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  };
  function pickVoice(lang) {
    const st = HA.state ? HA.state.settings : {};
    const saved = st.voices && st.voices[lang];
    const list = ZH.voicesFor(lang);
    return list.find((v) => v.name === saved) || list[0] || null;
  }
  // Split into phrases at punctuation so the engine breathes between them
  function phrases(text, lang) {
    const out = [];
    const re = lang === 'zh' || lang === 'zht' || lang === 'ja'
      ? /[^，,、；;：:。！!？?…\n]+[，,、；;：:。！!？?…]*/g
      : /[^,;:.!?\n]+[,;:.!?]*/g;
    (String(text).match(re) || [String(text)]).forEach((p) => { p = p.trim(); if (p) out.push(p); });
    return out;
  }
  function pauseAfter(p) {
    const c = p.slice(-1);
    if ('。！？!?…'.includes(c) || c === '.') return 420;
    if ('，,、；;：:'.includes(c)) return 160;
    return 60;
  }
  let speakToken = 0;
  ZH.stop = () => { speakToken++; if (window.speechSynthesis) speechSynthesis.cancel(); };
  // speak(text, rateOrOpts) ; opts: {rate, lang, onend, onphrase}
  ZH.speak = function (text, opts) {
    if (!window.speechSynthesis) { HA.ui.toast(HA.t('noTts')); return; }
    if (typeof opts === 'number') opts = { rate: opts };
    opts = opts || {};
    let lang = opts.lang || 'zh';
    if (lang === 'zh' && HA.state && HA.state.settings.script === 't') lang = 'zht';
    ZH.stop();
    const tok = speakToken;
    const v = pickVoice(lang);
    const st = HA.state ? HA.state.settings : {};
    const rate = opts.rate || st.rate || 0.9;
    const parts = phrases(text, lang);
    let i = 0;
    const next = () => {
      if (tok !== speakToken) return;
      if (i >= parts.length) { opts.onend && opts.onend(); return; }
      const p = parts[i++];
      const u = new SpeechSynthesisUtterance(p);
      if (v) u.voice = v;
      u.lang = v ? v.lang : VLANG[lang] || lang;
      u.rate = rate;
      // a slightly lower pitch and a lift on questions make the reading less flat
      u.pitch = /[？?]$/.test(p) ? 1.08 : 1.0;
      u.onend = () => setTimeout(next, parts.length > 1 ? pauseAfter(p) : 0);
      u.onerror = () => setTimeout(next, 50);
      opts.onphrase && opts.onphrase(p, i - 1);
      speechSynthesis.speak(u);
    };
    next();
  };

  /* ---------- Generic text rendering for other languages (word hover) ---------- */
  ZH.renderText = function (text, lang, opts) {
    if (lang === 'zh') return ZH.render(text, opts);
    const esc = HA.ui.esc;
    if (lang === 'code') return '<code class="code-line">' + esc(text) + '</code>';
    let segs;
    try { segs = [...new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)]; }
    catch (e) { segs = text.split(/(\s+|[.,!?;:()"“”])/).filter(Boolean).map((x) => ({ segment: x, isWordLike: /\w/.test(x) })); }
    return segs.map((s) => (s.isWordLike ? '<span class="w" data-w="' + esc(s.segment) + '" data-lang="' + lang + '">' + esc(s.segment) + '</span>' : esc(s.segment))).join('');
  };
})();
