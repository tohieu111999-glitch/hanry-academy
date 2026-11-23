/* Machine translation (sentence meaning like Google Translate / AI) with caching */
(function () {
  const MT = (HA.mt = {});
  const CODES = { zh: 'zh-CN', zht: 'zh-TW', en: 'en', ja: 'ja', ko: 'ko', fr: 'fr', de: 'de', vi: 'vi' };
  const mem = new Map();
  const KEY = 'ha_mt_cache';
  let store = HA.LS.get(KEY, {});
  const save = () => {
    const keys = Object.keys(store);
    if (keys.length > 600) keys.slice(0, keys.length - 500).forEach((k) => delete store[k]);
    HA.LS.set(KEY, store);
  };
  // Target language for translations, from the interface language
  MT.target = function (srcLang) {
    const ui = HA.state.settings.lang;
    let t = { vi: 'vi', en: 'en', zhs: 'zh', zht: 'zht', ja: 'ja' }[ui] || 'vi';
    if ((t === 'zh' || t === 'zht') && srcLang === 'zh') t = 'en';
    if (t === srcLang) t = srcLang === 'en' ? 'vi' : 'en';
    return t;
  };
  MT.available = () => !!HA.config.translate && (HA.config.translate.provider === 'mymemory' || !!HA.config.translate.endpoint);

  async function viaMyMemory(text, from, to) {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 480)) + '&langpair=' + encodeURIComponent(CODES[from] + '|' + CODES[to]);
    const r = await fetch(url);
    if (!r.ok) throw new Error('MT ' + r.status);
    const j = await r.json();
    const out = j && j.responseData && j.responseData.translatedText;
    if (!out || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE/i.test(out) || (j.responseStatus && +j.responseStatus !== 200)) throw new Error('quota');
    return out;
  }
  async function viaEndpoint(text, from, to, mode) {
    const r = await fetch(HA.config.translate.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 2000), source: CODES[from], target: CODES[to], mode: mode || 'sentence' })
    });
    if (!r.ok) throw new Error('MT ' + r.status);
    const j = await r.json();
    if (!j.translation) throw new Error('MT empty');
    return j.translation;
  }
  // translate(text, from, to?, mode?) -> Promise<string>
  MT.translate = function (text, from, to, mode) {
    text = String(text || '').trim();
    if (!text) return Promise.resolve('');
    to = to || MT.target(from);
    if (from === 'code') return Promise.reject(new Error('code'));
    const key = (HA.config.translate.provider) + '|' + from + '>' + to + '|' + (mode || '') + '|' + text;
    if (store[key]) return Promise.resolve(store[key]);
    if (mem.has(key)) return mem.get(key);
    const p = (HA.config.translate.provider === 'ai' && HA.config.translate.endpoint ? viaEndpoint(text, from, to, mode) : viaMyMemory(text, from, to))
      .then((out) => { store[key] = out; save(); mem.delete(key); return out; })
      .catch((e) => { mem.delete(key); throw e; });
    mem.set(key, p);
    return p;
  };
  // Word-by-word gloss from the dictionary when machine translation is unavailable (Chinese only)
  MT.gloss = function (text) {
    return HA.zh.analyze(text).filter((t) => t.han).map((t) => {
      const r = HA.zh.lookup(t.simp);
      const e = r.cur || r.list[0];
      const m = e ? HA.ui.meaningOf(e).split(/[;,/]/)[0].replace(/\(.*?\)/g, '').trim() : '';
      return m || t.text;
    }).join(' · ');
  };
})();
