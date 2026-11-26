/* Exams (Đề thi): practice tests sent by Hanry Academy, answers checked before publishing.
   Data: data/exams/exams.json — see docs/HUONG-DAN-QUAN-TRI.md (mục Đề thi) for the format. */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');
  const BANDS = { A: ['A1', 'A2'], B: ['B1', 'B2'], C: ['C1', 'C2'] };

  HA.exams = [];
  HA.loadExams = function () {
    if (HA._examsP) return HA._examsP;
    HA._examsP = fetch('data/exams/exams.json').then((r) => (r.ok ? r.json() : [])).then((list) => (HA.exams = Array.isArray(list) ? list : [])).catch(() => []);
    return HA._examsP;
  };
  const results = () => (S.data.exams = S.data.exams || {});
  const allQ = (E) => E.sections.reduce((a, s) => a.concat(s.questions), []);
  const R = (x) => (HA.zh.hasHan(x || '') ? '<span class="zh">' + HA.R(x) + '</span>' : esc(x || ''));
  const bandOf = (E) => E.band || (Object.keys(BANDS).find((b) => BANDS[b].includes(E.level)) || '');
  const fmtTime = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  /* ---------- Packs & locks ---------- */
  const PACKS = { 'hanry-band-a': 'packHanryA', 'eduverse-trai-nghiem': 'packTrial', 'eduverse-luyen-tap': 'packPractice', 'eduverse-chuyen-sau': 'packAdvanced' };
  HA.examPacks = PACKS;
  let locksP = null;
  HA.examLocks = (force) => (locksP && !force ? locksP : (locksP = HA.api.getExamLocks().catch(() => [])));
  const canOpen = async (E) => !E.pack || !(await HA.examLocks()).includes(E.pack) || HA.isAdmin(S.user) || S.bookAccess;

  /* ---------- List ---------- */
  HA.route(/^\/exams$/, async function () {
    view().innerHTML = '<div class="loading">…</div>';
    const [list, locks] = await Promise.all([HA.loadExams(), HA.examLocks(true)]);
    const free = HA.isAdmin(S.user) || S.bookAccess;
    const groups = {};
    list.forEach((E) => { const b = bandOf(E) || '?'; const k = E.pack || ''; ((groups[b] = groups[b] || {})[k] = groups[b][k] || []).push(E); });
    const card = (E) => {
      const r = results()[E.id];
      const n = allQ(E).length;
      const lock = E.pack && locks.includes(E.pack) && !free;
      return '<a class="unit-item ' + (r ? 'done' : '') + (lock ? ' locked' : '') + '" href="#/exam/' + encodeURIComponent(E.id) + '"><span class="lb-level">' + esc(E.level || bandOf(E)) + '</span>' +
        '<span class="ui-text"><b>' + (lock ? '🔒 ' : '') + R(E.title.zh || E.title.vi) + '</b><small>' + esc(E.title.vi || '') + ' · ' + n + ' ' + t('examQs') + (E.duration ? ' · ' + E.duration + ' ' + t('examMin') : '') +
        (r ? ' · ' + t('best') + ' ' + r.best + '%' : '') + '</small></span><span>›</span></a>';
    };
    view().innerHTML =
      '<div class="page-head"><div><h1>📝 ' + t('navExams') + '</h1><p class="muted">' + t('examsIntro') + '</p></div></div>' +
      (list.length ? Object.keys(groups).sort().map((b) => '<section class="unit-block"><div class="ub-head"><div><small>TOCFL</small><h2>Band ' + esc(b) + (BANDS[b] ? ' <span class="muted small">(' + BANDS[b].join(' – ') + ')</span>' : '') + '</h2></div></div>' +
        Object.keys(groups[b]).map((k) => '<details class="pack" ' + (Object.keys(groups[b]).length === 1 ? 'open' : '') + '><summary><b>' + esc(PACKS[k] ? t(PACKS[k]) : k || '—') + '</b> <span class="muted small">· ' + groups[b][k].length + ' ' + t('navExams').toLowerCase() + (locks.includes(k) ? ' · 🔒 ' + t('lockedW') : '') + '</span></summary><div class="unit-list">' + groups[b][k].map(card).join('') + '</div></details>').join('') + '</section>').join('')
        : '<div class="card empty"><p>📭 ' + t('noExams') + '</p></div>');
  });

  /* ---------- Exam page ---------- */
  let timer = null;
  HA.route(/^\/exam\/([^/]+)$/, async function (id) {
    clearInterval(timer);
    const list = await HA.loadExams();
    const E = list.find((x) => x.id === decodeURIComponent(id));
    if (!E) { view().innerHTML = '<div class="card empty"><p>' + t('notFound') + '</p><a class="btn" href="#/exams">← ' + t('navExams') + '</a></div>'; return; }
    if (!(await canOpen(E))) { view().innerHTML = '<a class="back" href="#/exams">← ' + t('navExams') + '</a><div class="card empty"><p>🔒 ' + t('packLocked') + '</p><a class="btn blue" href="#/contact">✉️ ' + t('navContact') + '</a></div>'; return; }
    const Q = allQ(E);
    const r = results()[E.id];
    const fixes = (E.checked && E.checked.fixes) || [];
    view().innerHTML =
      '<a class="back" href="#/exams">← ' + t('navExams') + '</a>' +
      '<div class="card exam-head"><div class="eh-top"><span class="lb-level">' + esc(E.level || bandOf(E)) + '</span><span class="chip">' + esc(E.exam || 'TOCFL') + ' · Band ' + esc(bandOf(E)) + '</span></div>' +
      '<h1>' + R(E.title.zh || '') + '</h1>' + (E.title.vi ? '<p class="muted">' + esc(E.title.vi) + '</p>' : '') +
      '<div class="eh-meta"><span>❓ ' + Q.length + ' ' + t('examQs') + '</span>' + (E.duration ? '<span>⏱ ' + E.duration + ' ' + t('examMin') + '</span>' : '') + (r ? '<span>🏆 ' + t('best') + ' ' + r.best + '%</span>' : '') + '</div>' +
      (E.levelNote ? '<p class="small">📊 <b>' + t('examLevelEst') + ':</b> ' + esc(E.levelNote) + '</p>' : '') +
      (E.checked ? '<p class="small">✅ ' + t('examChecked') + (fixes.length ? ' · ' + t('examFixed').replace('{n}', fixes.length) : '') + '</p>' : '') +
      (E.source ? '<p class="small muted">📚 ' + esc(E.source) + '</p>' : '') +
      '<div class="row gap"><button class="btn green" id="exStart">▶ ' + t('examStart') + '</button><button class="btn" id="exPractice">📖 ' + t('examPractice') + '</button></div></div>' +
      '<div id="exBody"></div>';
    $('#exStart').onclick = () => run(E, true);
    $('#exPractice').onclick = () => run(E, false);
  });

  function run(E, timed) {
    clearInterval(timer);
    const Q = allQ(E);
    let n = 0;
    const qHTML = (q) => {
      const i = n++;
      return '<li class="q" data-i="' + i + '" value="' + (i + 1) + '"><div class="q-text">' + R(q.q) + '</div>' +
        (q.img ? '<img class="ex-img" src="' + esc(q.img) + '" alt="" loading="lazy">' : '') +
        '<div class="opts">' + q.o.map((o, k) => '<label class="opt"><input type="radio" name="eq' + i + '" value="' + k + '"> <b>' + 'ABCDEFGH'[k] + '.</b> ' + R(o) + '</label>').join('') + '</div>' +
        '<div class="why" hidden></div></li>';
    };
    $('#exBody').innerHTML =
      (timed && E.duration ? '<div class="ex-timer" id="exTimer">⏱ ' + fmtTime(E.duration * 60) + '</div>' : '') +
      E.sections.map((s) => '<div class="card ex-sec"><h2>' + (s.kind === 'listening' ? '🎧 ' : '📖 ') + R(s.title || '') + '</h2>' +
        (s.instructions ? '<p class="muted">' + R(s.instructions) + '</p>' : '') +
        (s.audio ? '<audio controls preload="none" src="' + esc(s.audio) + '"></audio>' : s.script ? '<button class="btn" data-speak="' + esc(s.script) + '">🔊 ' + t('examPlay') + '</button>' : '') +
        (s.passage ? '<div class="ex-passage">' + s.passage.split(/\n+/).map((p) => '<p>' + R(p) + '</p>').join('') + '</div>' : '') +
        '<ol class="quiz">' + s.questions.map(qHTML).join('') + '</ol></div>').join('') +
      '<div class="card"><div id="exRes"></div><button class="btn green full" id="exSubmit">' + t('submit') + '</button></div>';
    $('#exBody').classList.toggle('no-tip', timed);  // timed = real exam conditions: no word look-up until submitted
    $('#exBody').scrollIntoView({ behavior: 'smooth' });
    $('#exBody').onclick = (e) => { const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak); };
    if (timed && E.duration) {
      let left = E.duration * 60;
      timer = setInterval(() => {
        const el = $('#exTimer');
        if (!el) { clearInterval(timer); return; }
        left--; el.textContent = '⏱ ' + fmtTime(Math.max(left, 0)); el.classList.toggle('low', left < 300);
        if (left <= 0) { clearInterval(timer); HA.ui.toast && HA.ui.toast(t('examTimeUp')); grade(E, Q); }
      }, 1000);
    }
    $('#exSubmit').onclick = () => {
      const blank = Q.filter((q, i) => !$('input[name="eq' + i + '"]:checked')).length;
      if (blank && !confirm(t('examConfirm').replace('{n}', blank))) return;
      grade(E, Q);
    };
  }

  function grade(E, Q) {
    clearInterval(timer);
    $('#exBody').classList.remove('no-tip');
    let right = 0;
    Q.forEach((q, i) => {
      const li = $('.q[data-i="' + i + '"]');
      const sel = $('input[name="eq' + i + '"]:checked', li);
      const v = sel ? +sel.value : -1;
      if (v === q.a) right++;
      $$('.opt', li).forEach((o, k) => { o.classList.toggle('right', k === q.a); o.classList.toggle('wrong', k === v && v !== q.a); });
      $$('input', li).forEach((x) => (x.disabled = true));
      const why = $('.why', li);
      why.innerHTML = (v === -1 ? '⚪ ' + t('examBlank') + ' · ' : '') + '✔ ' + t('examAnswer') + ': <b>' + 'ABCDEFGH'[q.a] + '</b>' + (q.why ? ' — ' + esc(HA.zh.disp(q.why)) : '');
      why.hidden = false;
    });
    const pct = Q.length ? Math.round((right / Q.length) * 100) : 0;
    const r = results()[E.id] || { best: 0, tries: 0 };
    r.best = Math.max(r.best, pct); r.tries++; r.last = pct; r.at = Date.now();
    results()[E.id] = r; HA.saveData();
    if (HA.addXP) HA.addXP(Math.round(pct / 5));
    $('#exRes').innerHTML = '<div class="ex-score ' + (pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'low') + '"><b>' + right + '/' + Q.length + '</b> · ' + pct + '%</div><p class="muted">' + t(pct >= 80 ? 'examGood' : pct >= 60 ? 'examOk' : 'examLow') + '</p>';
    const b = $('#exSubmit'); b.textContent = '↻ ' + t('retry'); b.onclick = () => run(E, !!E.duration);
    $('#exRes').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
