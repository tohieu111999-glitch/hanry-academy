/* Dictionary page (Hanzii-style) */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const Z = HA.zh;
  const view = () => $('#view');

  function search(q) {
    q = q.trim();
    if (!q) return [];
    const D = Z.dict;
    const out = []; const seen = new Set();
    const push = (e, score) => { const k = e.s + '|' + e.p; if (seen.has(k)) return; seen.add(k); out.push({ e, score }); };
    if (Z.hasHan(q)) {
      const simp = Z.toSimp(q);
      [q, simp].forEach((k) => (D.index.get(k) || []).forEach((i) => push(D.entries[i], 0)));
      // curated not in big dict
      const cur = Z.curated.get(simp);
      if (cur && !out.length) out.push({ e: { s: cur.w, t: cur.w, p: '', vi: cur.vi, en: cur.en, cur: true }, score: 0 });
      // words starting with / containing
      for (const e of D.entries) {
        if (out.length > 300) break;
        if (e.s !== simp && (e.s.startsWith(simp) || e.t.startsWith(q))) push(e, 1 + e.s.length / 10 + (/^[A-Z]/.test(e.p) ? 3 : 0));
      }
      if (out.length < 60) for (const e of D.entries) { if (out.length > 120) break; if (e.s.includes(simp) && !e.s.startsWith(simp)) push(e, 3 + e.s.length / 10); }
      if (!out.length) [...simp].forEach((c) => (D.index.get(c) || []).forEach((i) => push(D.entries[i], 5)));
    } else {
      const lower = q.toLowerCase();
      const isPy = /^[a-zü:\d\s']+$/i.test(q) && !/\s{2,}/.test(q);
      const qn = Z.normPinyin(q);
      const hasTone = /[1-5]/.test(q) || /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(q);
      const qTone = hasTone ? q.toLowerCase().replace(/\s+/g, '') : null;
      for (const e of D.entries) {
        if (isPy && qn) {
          const pn = e.p.toLowerCase().replace(/[\s\d]/g, '').replace(/u:/g, 'v');
          if (pn === qn) {
            let sc = 10 + e.s.length;
            if (qTone) { const pt = e.p.toLowerCase().replace(/\s+/g, ''); const pm = Z.pinyinNumToMarks(e.p).toLowerCase().replace(/\s+/g, ''); sc = pt === qTone || pm === qTone ? 5 + e.s.length : 20 + e.s.length; }
            if (/^[A-Z]/.test(e.p)) sc += 10;
            push(e, sc); continue;
          }
        }
        const m = HA.state.settings.lang === 'vi' ? e.vi || e.en : e.en || e.vi;
        if (m && lower.length >= 2) {
          const ml = m.toLowerCase();
          const idx = ml.indexOf(lower);
          if (idx >= 0) {
            const exact = new RegExp('(^|[;/,(]\\s*)' + lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*($|[;/,)])').test(ml);
            push(e, (exact ? 30 : 60) + e.s.length * 2 + idx / 50 + (/^[A-Z]/.test(e.p) ? 20 : 0));
          }
        }
        if (out.length > 1500) break;
      }
    }
    return out.sort((a, b) => a.score - b.score).slice(0, 80).map((x) => x.e);
  }
  HA.dictSearch = search;

  HA.route(/^\/dict(?:\/(.+))?$/, function (word) {
    const lang = HA.state.settings.lang === 'vi' ? 'vi' : 'en';
    const loaded = Z.dict.loaded[lang] || Z.dict.loaded.vi || Z.dict.loaded.en;
    const hist = HA.state.data.history || [];
    view().innerHTML =
      '<div class="dict-head"><h1>🔎 ' + t('navDict') + '</h1><div class="search-box"><input class="input big" id="dq" placeholder="' + t('dictPlaceholder') + '" value="' + esc(word || '') + '" autocomplete="off"><button class="btn blue" id="dgo">' + t('search') + '</button></div>' +
      '<div class="row wrap small"><span class="muted">' + (loaded ? '📚 ' + Z.dict.entries.length.toLocaleString() + ' ' + t('entries') : '⏳ ' + t('dictLoading')) + '</span>' +
      '<label><input type="checkbox" id="bothLang"' + (Z.dict.loaded.vi && Z.dict.loaded.en ? ' checked' : '') + '> VI + EN</label></div></div>' +
      '<div class="dict-layout"><div id="dres" class="dres"></div><div id="ddetail" class="ddetail"></div></div>' +
      (hist.length && !word ? '<div class="card"><b>🕘 ' + t('history') + '</b><div class="chips-row">' + hist.slice(0, 30).map((h) => '<a class="chip zh" href="#/dict/' + encodeURIComponent(h) + '">' + esc(Z.disp(h)) + '</a>').join('') + '</div></div>' : '') +
      '<p class="tiny muted">' + t('dictCredit') + '</p>';
    const inp = $('#dq');
    let timer = null;
    const run = () => {
      const q = inp.value.trim();
      if (!q) { $('#dres').innerHTML = ''; $('#ddetail').innerHTML = ''; return; }
      if (!loaded) { $('#dres').innerHTML = '<div class="loading">' + t('dictLoading') + '</div>'; return; }
      const res = search(q);
      $('#dres').innerHTML = res.length ? res.map((e, i) => '<a class="dr ' + (i === 0 ? 'on' : '') + '" href="#/dict/' + encodeURIComponent(e.s) + '" data-w="' + esc(e.s) + '"><span class="zh lg">' + esc(HA.state.settings.script === 't' ? e.t : e.s) + '</span><span class="py">' + esc(Z.phon(Z.pinyinNumToMarks(e.p))) + '</span><span class="m">' + esc(HA.ui.meaningOf(e)).slice(0, 90) + '</span></a>').join('') : '<div class="empty">' + t('notFound') + '</div>';
      if (word) return;
      if (res[0]) showDetail(Z.hasHan(q) && Z.dict.index.has(q) ? Z.toSimp(q) : res[0].s);
    };
    inp.oninput = () => { clearTimeout(timer); timer = setTimeout(run, 250); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { const q = inp.value.trim(); if (Z.hasHan(q)) location.hash = '#/dict/' + encodeURIComponent(q); else run(); } };
    $('#dgo').onclick = () => inp.onkeydown({ key: 'Enter' });
    $('#bothLang').onchange = (e) => { if (e.target.checked) { Z.loadDict('vi'); Z.loadDict('en'); } };
    view().onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak);
      const nb = e.target.closest('[data-note]'); if (nb) { const ok = HA.nb.toggle(HA.ui.noteItem(nb.dataset.note, nb.dataset.p)); nb.textContent = ok ? '★ ' + t('inNote') : '☆ ' + t('addNote'); nb.classList.toggle('yellow', !ok); HA.ui.toast(ok ? t('added') : t('removed'), 'good'); }
      const wr = e.target.closest('[data-write]'); if (wr) HA.games.writeModal(wr.dataset.write);
    };
    if (word) {
      run();
      showDetail(Z.toSimp(word));
      const h = HA.state.data.history || (HA.state.data.history = []);
      const i = h.indexOf(word); if (i >= 0) h.splice(i, 1); h.unshift(word); h.length = Math.min(h.length, 50); HA.saveData();
    } else inp.focus();
  });

  let detailTok = 0;
  function showDetail(w) {
    const box = $('#ddetail'); if (!box) return;
    const tok = ++detailTok;
    if (!Z.hasHan(w)) return;
    const { cur, list } = Z.lookup(w);
    const py = cur ? cur.p : list[0] ? Z.pinyinNumToMarks(list[0].p) : Z.pinyinOf(w);
    const trad = list[0] ? list[0].t : Z.analyze(w).map((x) => x.trad || x.text).join('');
    const dispW = HA.state.settings.script === 't' ? trad : w;
    const chars = [...w].filter(Z.isHan);
    const sentences = [];
    HA.lessons.forEach((L) => L.text.forEach((x) => { if (x.zh.includes(w) && sentences.length < 6) sentences.push({ x, L }); }));
    HA.lessons.forEach((L) => L.vocab.forEach((v) => { if (v.ex && v.ex[0].includes(w) && sentences.length < 8 && !sentences.find((s) => s.x.zh === v.ex[0])) sentences.push({ x: { zh: v.ex[0], vi: v.ex[1] }, L }); }));
    const compounds = [];
    if ([...w].length <= 2) for (const e of Z.dict.entries) { if (compounds.length >= 24) break; if (e.s !== w && e.s.startsWith(w) && e.s.length <= w.length + 2 && !/^[A-Z]/.test(e.p)) compounds.push(e); }
    const inNb = HA.nb.has(w);
    box.innerHTML = '<div class="card entry">' +
      '<div class="entry-top"><div><div class="entry-zh zh">' + esc(dispW) + '</div>' + (trad !== w ? '<div class="muted zh">' + esc(HA.state.settings.script === 't' ? w : trad) + ' (' + (HA.state.settings.script === 't' ? t('simplified') : t('traditional')) + ')</div>' : '') + '</div>' +
      '<div class="entry-btns"><button class="btn blue" data-speak="' + esc(w) + '">🔊</button><button class="btn ' + (inNb ? 'ghost' : 'yellow') + '" data-note="' + esc(w) + '" data-p="' + esc(py) + '">' + (inNb ? '★ ' + t('inNote') : '☆ ' + t('addNote')) + '</button><button class="btn green" data-write="' + esc(w) + '">✍️ ' + t('gameWrite') + '</button></div></div>' +
      '<div class="entry-py"><b>' + esc(py) + '</b> · <span>' + esc(py.split(/\s+/).map(Z.toZhuyin).join(' ')) + '</span>' + (HA.state.settings.lang === 'vi' && Z.hanViet(w) ? ' · <span class="hv">' + t('hanviet') + ': ' + esc(Z.hanViet(w).toUpperCase()) + '</span>' : '') + '</div>' +
      (cur ? '<div class="entry-sec cur"><span class="badge">' + t('builtIn') + '</span> ' + (cur.pos ? '<em class="pos">' + esc(HA.ui.posLabel(cur.pos)) + '</em> ' : '') + '<b>' + esc(HA.ui.meaningOf(cur)) + '</b>' +
        (cur.ex ? '<div class="ex"><div class="zh">' + HA.R(cur.ex[0]) + '</div><div class="muted">' + esc(cur.ex[1]) + '</div></div>' : '') +
        (cur.syn.length ? '<div>≈ ' + t('synonyms') + ': ' + cur.syn.map((s) => '<a class="chip zh" href="#/dict/' + encodeURIComponent(s) + '">' + esc(Z.disp(s)) + '</a>').join('') + '</div>' : '') +
        (cur.ant.length ? '<div>≠ ' + t('antonyms') + ': ' + cur.ant.map((s) => '<a class="chip red zh" href="#/dict/' + encodeURIComponent(s) + '">' + esc(Z.disp(s)) + '</a>').join('') + '</div>' : '') + '</div>' : '') +
      list.map((e) => '<div class="entry-sec"><div class="py-s">' + esc(Z.pinyinNumToMarks(e.p)) + ' <small class="muted">' + esc(e.p.split(' ').map((s) => Z.toZhuyin(Z.numToMark(s))).join(' ')) + '</small></div><ol class="defs">' +
        [e.vi && ['🇻🇳', e.vi], e.en && ['🇬🇧', e.en]].filter(Boolean).filter((x) => HA.state.settings.lang === 'vi' || x[0] === '🇬🇧' || !e.en).map(([flag, d]) => d.split('; ').map((s) => '<li>' + flag + ' ' + linkify(s) + '</li>').join('')).join('') + '</ol></div>').join('') +
      '<div class="entry-sec"><h4>' + t('strokeOrder') + '</h4><div class="stroke-row">' + chars.map((c, i) => '<div class="sbox"><div id="so' + i + '" class="hw grid-bg sm"></div><div class="zh">' + esc(HA.state.settings.script === 't' ? Z.toTradChar(c) : c) + (HA.state.settings.lang === 'vi' && Z.hanViet(c) ? ' <small class="hv">' + esc(Z.hanViet(c).toUpperCase()) + '</small>' : '') + '</div><a class="tiny" href="#/dict/' + encodeURIComponent(c) + '">' + t('openDict') + '</a></div>').join('') + '</div></div>' +
      (sentences.length ? '<div class="entry-sec"><h4>' + t('inLessons') + '</h4><ul class="examples">' + sentences.map((s) => '<li><button class="icon-btn" data-speak="' + esc(s.x.zh) + '">🔊</button><div><div class="zh">' + HA.R(s.x.zh) + '</div><div class="muted small">' + esc(HA.tr(s.x)) + ' · <a href="#/lesson/' + s.L.id + '">' + esc(HA.tr(s.L.title)) + '</a></div></div></li>').join('') + '</ul></div>' : '') +
      (compounds.length ? '<div class="entry-sec"><h4>' + t('compounds') + '</h4><div class="compounds">' + compounds.map((e) => '<a href="#/dict/' + encodeURIComponent(e.s) + '"><b class="zh">' + esc(HA.state.settings.script === 't' ? e.t : e.s) + '</b> <small>' + esc(Z.pinyinNumToMarks(e.p)) + '</small><span>' + esc(HA.ui.meaningOf(e)).slice(0, 50) + '</span></a>').join('') + '</div></div>' : '') +
      '</div>';
    HA.games.loadHW().then(() => tok === detailTok && chars.forEach((c, i) => {
      const el = document.getElementById('so' + i); if (!el) return;
      const w2 = HanziWriter.create(el, HA.state.settings.script === 't' ? Z.toTradChar(c) : c, HA.games.writerOpts(110));
      el.onclick = () => w2.animateCharacter();
      setTimeout(() => w2.animateCharacter(), 300 + i * 1200);
    })).catch(() => {});
  }
  function linkify(s) {
    return esc(s).replace(/([\u3400-\u9fff]+)(?:\|([\u3400-\u9fff]+))?(\[[^\]]+\])?/g, (m, a, b) => '<a class="zh" href="#/dict/' + encodeURIComponent(b || a) + '">' + (b || a) + '</a>');
  }
})();
