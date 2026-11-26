/* Ngữ pháp TOCFL (Hanry Academy books Band A / B / C): 383 grammar points with formula, usage, examples,
   sentence analysis, comparison, common mistakes, memory tip and exercises with answers.
   Data: data/grammar/band-a.json … made by tools/import-grammar-book.py */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const Z = HA.zh;
  const view = () => $('#view');
  const BANDS = { a: ['A0', 'A1', 'A2'], b: ['B1', 'B2'], c: ['C1', 'C2'] };
  const cache = {};
  const load = (b) => cache[b] || (cache[b] = fetch('data/grammar/band-' + b + '.json').then((r) => r.json()));
  const M = (x) => (Z.hasHan(x || '') ? HA.R(x, { ruby: false }) : esc(x || ''));   // mixed Vietnamese/Chinese text, hover look-up
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const done = (code) => ((HA.state.data.grammarSeen || {})[code]);

  const item = (b, p) => '<a class="unit-item ' + (done(p.code) ? 'done' : '') + '" href="#/grammar/' + b + '/' + p.code + '"><span class="lb-level sm">' + esc(p.code) + '</span><span class="ui-text"><b><span class="zh">' + esc(Z.disp(p.struct)) + '</span></b><small>' + M(p.title) + '</small></span><span>›</span></a>';

  /* ---------- Overview & search ---------- */
  HA.route(/^\/grammar$/, function () {
    view().innerHTML = '<div class="page-head"><div><h1>🧩 ' + t('navGrammar') + '</h1><p class="muted">' + t('grammarIntro') + '</p></div></div>' +
      '<div class="search-box mb"><input class="input big" id="gq" placeholder="' + t('grammarSearch') + '" autocomplete="off"></div><div id="gres" class="unit-list"></div>' +
      '<div class="unit-list">' + Object.keys(BANDS).map((b) => '<a class="unit-item" href="#/grammar/' + b + '"><span class="lb-level">Band ' + b.toUpperCase() + '</span><span class="ui-text"><b>' + t('navGrammar') + ' TOCFL Band ' + b.toUpperCase() + '</b><small>' + BANDS[b].join(' · ') + ' · <span data-count="' + b + '">…</span> ' + t('grammarPoints') + '</small></span><span>›</span></a>').join('') + '</div><p class="tiny muted mt">© Hanry Academy</p>';
    Object.keys(BANDS).forEach((b) => load(b).then((d) => { const el = $('[data-count="' + b + '"]'); if (el) el.textContent = d.points.length; }));
    search($('#gq'), $('#gres'), Object.keys(BANDS));
  });

  function search(inp, out, bands) {
    let timer = null;
    inp.oninput = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = inp.value.trim();
        if (!q) { out.innerHTML = ''; return; }
        const qt = [...q].map(Z.toTradChar).join(''), qn = norm(q);
        const res = [];
        (await Promise.all(bands.map(load))).forEach((d, k) => d.points.forEach((p) => {
          const hay = p.struct + ' ' + p.formula.join(' ') + ' ' + p.code;
          if (hay.includes(qt) || hay.includes(q) || norm(p.title + ' ' + (p.meta['Nghĩa'] || '') + ' ' + p.pinyin).includes(qn)) res.push(item(bands[k], p));
        }));
        out.innerHTML = res.length ? res.slice(0, 50).join('') : '<div class="card empty">' + t('notFound') + '</div>';
      }, 250);
    };
  }

  /* ---------- Band: list by level ---------- */
  HA.route(/^\/grammar\/([abc])$/, async function (b) {
    view().innerHTML = '<div class="loading">…</div>';
    const d = await load(b);
    view().innerHTML = '<a class="back" href="#/grammar">← ' + t('navGrammar') + '</a>' +
      '<div class="page-head"><div><h1>🧩 ' + t('navGrammar') + ' TOCFL Band ' + b.toUpperCase() + '</h1><p class="muted">' + d.points.length + ' ' + t('grammarPoints') + ' · ' + BANDS[b].join(' · ') + '</p></div></div>' +
      '<div class="search-box mb"><input class="input big" id="gq" placeholder="' + t('grammarSearch') + '" autocomplete="off"></div><div id="gres" class="unit-list"></div>' +
      BANDS[b].map((lv) => {
        const ps = d.points.filter((p) => p.level === lv);
        const n = ps.filter((p) => done(p.code)).length;
        return '<details class="pack" ' + (lv === BANDS[b][0] ? 'open' : '') + '><summary><b>' + lv + '</b> <span class="muted small">· ' + ps.length + ' ' + t('grammarPoints') + (n ? ' · ✓ ' + n : '') + '</span></summary><div class="unit-list">' + ps.map((p) => item(b, p)).join('') + '</div></details>';
      }).join('');
    search($('#gq'), $('#gres'), [b]);
  });

  /* ---------- One grammar point ---------- */
  HA.route(/^\/grammar\/([abc])\/([ABC][0-2]-G\d{3})$/, async function (b, code) {
    view().innerHTML = '<div class="loading">…</div>';
    const d = await load(b);
    const i = d.points.findIndex((p) => p.code === code);
    const p = d.points[i];
    if (!p) { location.hash = '#/grammar/' + b; return; }
    const prev = d.points[i - 1], next = d.points[i + 1];
    const meta = Object.entries(p.meta).filter(([k]) => !['Mã ngữ pháp', 'Cấp độ', 'Chữ Hán', 'Pinyin'].includes(k));
    const sec = (n, title, body) => (body ? '<section class="card gp-sec"><h2><span class="g-num">' + n + '</span> ' + title + '</h2>' + body + '</section>' : '');
    let n = 0;
    view().innerHTML = '<a class="back" href="#/grammar/' + b + '">← Band ' + b.toUpperCase() + '</a>' +
      '<div class="lesson-banner gp-head"><span class="lb-level">' + esc(p.code) + '</span><div><div class="zh lb-title">' + esc(Z.disp(p.struct)) + ' <button class="icon-btn" data-say="' + esc(p.struct.replace(/[…⋯／+＋()（）A-Za-z]/g, '，')) + '">🔊</button></div><div class="py">' + esc(p.pinyin) + '</div><div class="muted">' + M(p.title) + '</div></div></div>' +
      '<div class="gp-meta">' + meta.map(([k, v]) => '<div><small class="muted">' + esc(k) + '</small><b>' + M(v) + '</b></div>').join('') + '</div>' +
      sec(++n, t('gFormula'), (p.formula.length ? '<div class="formula-box">' + p.formula.map((f) => '<div class="zh">' + M(f) + '</div>').join('') + '</div>' : '') +
        (p.terms.length ? '<table class="gp-table">' + p.terms.map((r) => '<tr><th>' + M(r[0]) + '</th><td>' + M(r[1]) + '</td></tr>').join('') + '</table>' : '')) +
      sec(++n, t('gUsage'), p.usage.length ? '<ul class="gp-list">' + p.usage.map((u) => '<li>' + M(u) + '</li>').join('') + '</ul>' : '') +
      sec(++n, t('gExamples'), '<ol class="gp-ex">' + p.examples.map((e) => '<li><div><span class="zh lg">' + HA.R(e[0], { ruby: false }) + '</span> <button class="icon-btn sm" data-say="' + esc(e[0]) + '">🔊</button></div><div class="py small">' + esc(e[1]) + '</div><div class="muted">' + esc(e[2]) + '</div></li>').join('') + '</ol>') +
      sec(++n, t('gAnalysis'), p.analysis.words.length ? '<div class="gp-an">' + p.analysis.words.map((w, k) => '<div><span class="zh lg">' + M(w) + '</span><small>' + M(p.analysis.roles[k] || '') + '</small></div>').join('') + '</div>' + (p.analysis.note ? '<p>' + M(p.analysis.note) + '</p>' : '') : '') +
      (p.compare.length ? sec(++n, t('gCompare'), '<div class="table-wrap"><table class="gp-table cmp">' + p.compare.map((r, k) => '<tr>' + r.map((c) => (k ? '<td>' : '<th>') + M(c) + (k ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table></div>') : '') +
      sec(++n, t('gMistakes'), p.mistakes.map((m) => '<div class="gp-mis"><div><span class="bad">❌ <span class="zh">' + M(m.wrong) + '</span></span> → <span class="good">✅ <span class="zh">' + M(m.right) + '</span></span></div>' + (m.py ? '<div class="py small">' + esc(m.py) + '</div>' : '') + (m.note ? '<div class="small">' + M(m.note) + '</div>' : '') + '</div>').join('')) +
      (p.tip ? '<div class="card gp-tip"><b>💡 HANRY MEMORY TIP — ' + t('gTip') + '</b><p>' + M(p.tip) + '</p></div>' : '') +
      sec(++n, t('gExercises'), '<ol class="gp-exer">' + p.exercises.map((q, k) => '<li><div>' + M(q) + '</div>' + (p.answers[k] ? '<details><summary>' + t('gShowAnswer') + '</summary><div class="gp-ans">' + M(p.answers[k]) + '</div></details>' : '') + '</li>').join('') + '</ol>') +
      '<div class="row center mt wrap"><button class="btn green" id="gDone">' + (done(p.code) ? '✓ ' + t('completed') : '✓ ' + t('gMarkDone')) + '</button></div>' +
      '<div class="row center mt wrap">' + (prev ? '<a class="btn ghost" href="#/grammar/' + b + '/' + prev.code + '">← ' + esc(prev.code) + ' ' + esc(Z.disp(prev.struct)) + '</a>' : '') + (next ? '<a class="btn ghost" href="#/grammar/' + b + '/' + next.code + '">' + esc(next.code) + ' ' + esc(Z.disp(next.struct)) + ' →</a>' : '') + '</div>' +
      '<p class="tiny muted mt">© Hanry Academy — ' + t('navGrammar') + ' TOCFL Band ' + b.toUpperCase() + '</p>';
    view().onclick = (e) => {
      const sp = e.target.closest('[data-say]'); if (sp) { Z.speak(sp.dataset.say); return; }
      if (e.target.id === 'gDone') {
        const D = HA.state.data; D.grammarSeen = D.grammarSeen || {}; D.grammarSeen[p.code] = Date.now(); HA.saveData();
        e.target.textContent = '✓ ' + t('completed'); if (HA.addXP) HA.addXP(5);
        if (next) location.hash = '#/grammar/' + b + '/' + next.code;
      }
    };
  });
})();
