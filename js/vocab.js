/* Từ vựng TOCFL (Hanry Academy books Band A / B / C): browse by level & topic, search, add to notebook.
   Data: data/vocab/band-a.json … made by tools/import-vocab-book.py
   word = [chữ Hán, pinyin, từ loại, nghĩa, ví dụ, dịch ví dụ, cách dùng] */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const Z = HA.zh;
  const view = () => $('#view');
  const BANDS = { a: ['A0', 'A1', 'A2'], b: ['B1', 'B2'], c: ['C1', 'C2'] };
  const cache = {};
  const load = (b) => cache[b] || (cache[b] = fetch('data/vocab/band-' + b + '.json').then((r) => r.json()));
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[\s']/g, '');

  function wordHTML(w, i) {
    const inNb = HA.nb.has(w[0]);
    return '<div class="card vw" data-i="' + i + '"><div class="vw-top"><span class="zh vw-w">' + esc(Z.disp(w[0])) + '</span><span class="py">' + esc(Z.phon(w[1])) + '</span>' +
      (w[2] ? '<span class="chip sm">' + esc(w[2]) + '</span>' : '') +
      '<span class="vw-act"><button class="icon-btn" data-say="' + esc(w[0]) + '" title="🔊">🔊</button><button class="icon-btn' + (inNb ? ' on' : '') + '" data-nb="' + i + '" title="' + t(inNb ? 'inNote' : 'addNote') + '">' + (inNb ? '⭐' : '☆') + '</button></span></div>' +
      '<div class="vw-m"><b>' + esc(w[3]) + '</b></div>' +
      (w[4] ? '<div class="vw-ex"><span class="zh">' + HA.R(w[4]) + '</span> <button class="icon-btn sm" data-say="' + esc(w[4]) + '">🔊</button><div class="muted small">' + esc(w[5]) + '</div></div>' : '') +
      (w[6] ? '<div class="small vw-use">💡 ' + esc(Z.disp(w[6])) + '</div>' : '') + '</div>';
  }

  /* ---------- Overview ---------- */
  HA.route(/^\/vocab$/, function () {
    view().innerHTML = '<div class="page-head"><div><h1>📚 ' + t('navVocab') + '</h1><p class="muted">' + t('vocabIntro') + '</p></div></div>' +
      '<div class="search-box mb"><input class="input big" id="vq" placeholder="' + t('vocabSearch') + '" autocomplete="off"></div><div id="vres"></div>' +
      '<div class="unit-list" id="bandList">' + Object.keys(BANDS).map((b) => '<a class="unit-item" href="#/vocab/' + b + '"><span class="lb-level">Band ' + b.toUpperCase() + '</span><span class="ui-text"><b>' + t('vocabBook') + ' TOCFL Band ' + b.toUpperCase() + '</b><small>' + BANDS[b].join(' · ') + ' · <span data-count="' + b + '">…</span> ' + t('words') + '</small></span><span>›</span></a>').join('') + '</div>' +
      '<p class="tiny muted mt">© Hanry Academy</p>';
    Object.keys(BANDS).forEach((b) => load(b).then((d) => { const el = $('[data-count="' + b + '"]'); if (el) el.textContent = d.topics.reduce((n, x) => n + x.words.length, 0).toLocaleString(); }));
    searchBox($('#vq'), $('#vres'), Object.keys(BANDS));
  });

  function searchBox(inp, out, bands) {
    let timer = null, list = [];
    const run = async () => {
      const q = inp.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      const all = (await Promise.all(bands.map(load))).flatMap((d, k) => d.topics.flatMap((tp) => tp.words.map((w) => ({ w, band: bands[k], lv: tp.level }))));
      const qs = [...q].map(Z.toTradChar).join(''), qn = norm(q);
      const hit = (x) => (Z.hasHan(q) ? x.w[0].includes(qs) || x.w[0].includes(q) || x.w[4].includes(qs) : norm(x.w[1]) === qn || norm(x.w[1]).startsWith(qn) || norm(x.w[3]).includes(norm(q)));
      list = all.filter(hit).sort((a, b) => (a.w[0] === qs ? -1 : 0) - (b.w[0] === qs ? -1 : 0) || a.w[0].length - b.w[0].length).slice(0, 60);
      out.innerHTML = list.length ? '<p class="small muted">' + list.length + (list.length === 60 ? '+' : '') + ' ' + t('words') + '</p><div class="vw-grid">' + list.map((x, i) => wordHTML(x.w, i).replace('<div class="vw-top">', '<div class="vw-top"><span class="lb-level sm">' + x.lv + '</span>')).join('') + '</div>' : '<div class="card empty">' + t('notFound') + '</div>';
    };
    inp.oninput = () => { clearTimeout(timer); timer = setTimeout(run, 250); };
    out.onclick = (e) => act(e, () => list.map((x) => x.w));
  }

  function act(e, words) {
    const sp = e.target.closest('[data-say]'); if (sp) { Z.speak(sp.dataset.say); return; }
    const nb = e.target.closest('[data-nb]');
    if (nb) {
      const w = words()[+nb.dataset.nb];
      const on = HA.nb.toggle({ w: w[0], p: w[1], vi: w[3], lang: 'zh' });
      nb.textContent = on ? '⭐' : '☆'; nb.classList.toggle('on', on);
      HA.ui.toast(t(on ? 'added' : 'removed'), on ? 'good' : '');
    }
  }

  /* ---------- One band: levels → topics → words ---------- */
  HA.route(/^\/vocab\/([abc])(?:\/(\d+))?$/, async function (b, ti) {
    view().innerHTML = '<div class="loading">…</div>';
    const d = await load(b);
    const topics = d.topics;
    if (ti != null && topics[+ti]) return topicPage(b, d, +ti);
    view().innerHTML = '<a class="back" href="#/vocab">← ' + t('navVocab') + '</a>' +
      '<div class="page-head"><div><h1>📚 ' + t('vocabBook') + ' TOCFL Band ' + b.toUpperCase() + '</h1><p class="muted">' + topics.reduce((n, x) => n + x.words.length, 0).toLocaleString() + ' ' + t('words') + ' · ' + BANDS[b].join(' · ') + '</p></div></div>' +
      '<div class="search-box mb"><input class="input big" id="vq" placeholder="' + t('vocabSearch') + '" autocomplete="off"></div><div id="vres"></div>' +
      BANDS[b].map((lv) => {
        const ts = topics.map((x, i) => [x, i]).filter(([x]) => x.level === lv);
        if (!ts.length) return '';
        return '<section class="unit-block"><div class="ub-head"><div><small>TOCFL</small><h2>' + lv + ' <span class="muted small">· ' + ts.reduce((n, [x]) => n + x.words.length, 0) + ' ' + t('words') + '</span></h2></div></div><div class="unit-list">' +
          ts.map(([x, i]) => { const nIn = x.words.filter((w) => HA.nb.has(w[0])).length; return '<a class="unit-item ' + (nIn === x.words.length ? 'done' : '') + '" href="#/vocab/' + b + '/' + i + '"><span class="ui-text"><b>' + esc(x.name) + '</b><small>' + x.words.length + ' ' + t('words') + (nIn ? ' · ⭐ ' + nIn : '') + ' · ' + x.words.slice(0, 5).map((w) => esc(Z.disp(w[0]))).join('、') + '…</small></span><span>›</span></a>'; }).join('') + '</div></section>';
      }).join('');
    searchBox($('#vq'), $('#vres'), [b]);
  });

  function topicPage(b, d, i) {
    const tp = d.topics[i];
    const prev = d.topics[i - 1], next = d.topics[i + 1];
    view().innerHTML = '<a class="back" href="#/vocab/' + b + '">← Band ' + b.toUpperCase() + '</a>' +
      '<div class="page-head"><div><small class="muted">TOCFL ' + tp.level + '</small><h1>' + esc(tp.name) + '</h1><p class="muted">' + tp.words.length + ' ' + t('words') + '</p></div>' +
      '<div class="row gap wrap"><button class="btn green" id="addAll">⭐ ' + t('vocabAddAll') + '</button></div></div>' +
      '<div class="vw-grid" id="vwList">' + tp.words.map(wordHTML).join('') + '</div>' +
      '<div class="row center mt wrap">' + (prev ? '<a class="btn ghost" href="#/vocab/' + b + '/' + (i - 1) + '">← ' + esc(prev.name) + '</a>' : '') + (next ? '<a class="btn ghost" href="#/vocab/' + b + '/' + (i + 1) + '">' + esc(next.name) + ' →</a>' : '') + '</div>';
    $('#vwList').onclick = (e) => act(e, () => tp.words);
    $('#addAll').onclick = () => {
      let n = 0;
      tp.words.forEach((w) => { if (HA.nb.add({ w: w[0], p: w[1], vi: w[3], lang: 'zh' })) n++; });
      HA.ui.toast(t('vocabAdded').replace('{n}', n), 'good');
      $$('[data-nb]').forEach((x) => { x.textContent = '⭐'; x.classList.add('on'); });
    };
  }
})();
