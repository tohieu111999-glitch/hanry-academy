/* Home feed (all posts), search (translate first, then related posts), post page, composer, likes & comments */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');
  const F = (HA.feed = {});

  /* ---------- helpers ---------- */
  const langOf = (P) => P.lang || HA.subjectOf(P.subject || 'zh').lang;
  F.render = (text, P, opts) => HA.zh.renderText(text, langOf(P), opts);
  F.timeAgo = function (ms) {
    if (!ms) return '';
    const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
    const lang = S.settings.lang;
    const unit = (n, vi, en) => (lang === 'vi' ? n + ' ' + vi + ' trước' : n + ' ' + en + (n > 1 ? 's' : '') + ' ago');
    if (s < 60) return lang === 'vi' ? 'vừa xong' : 'just now';
    if (s < 3600) return unit(Math.floor(s / 60), 'phút', 'minute');
    if (s < 86400) return unit(Math.floor(s / 3600), 'giờ', 'hour');
    if (s < 86400 * 7) return unit(Math.floor(s / 86400), 'ngày', 'day');
    return new Date(ms).toLocaleDateString(lang === 'vi' ? 'vi-VN' : undefined);
  };
  const srcName = (k) => ({ self: t('srcSelf'), collected: t('srcCollected'), cited: t('srcCited') }[k] || '');
  const roleBadge = (r) => (r === 'admin' ? '<span class="badge admin">' + t('admin') + '</span>' : r === 'teacher' ? '<span class="badge teacher">' + t('teacher') + '</span>' : '');
  const postUrl = (P) => '#/post/' + encodeURIComponent(P.id);
  const trLine = (x) => { const l = S.settings.lang; return l === 'vi' ? x.vi || '' : x.en || x.vi || ''; };
  const trTitle = (P) => { const l = S.settings.lang; return l === 'vi' ? P.title.vi || '' : P.title.en || P.title.vi || ''; };
  F.lineAttrs = (x, P) => ' data-src="' + esc(x.zh) + '" data-tr="' + esc(trLine(x)) + '" data-lang="' + langOf(P) + '"';
  const canEdit = (P) => !P.sample && S.user && (P.ownerUid === S.user.uid || HA.isAdmin(S.user));

  F.loadPosts = async function (filter) {
    let list = [];
    try { list = await HA.api.listLessons(filter || {}); } catch (e) { console.warn(e); }
    list.forEach((P) => { P.user = true; (P.vocab || []).forEach((v) => HA.zh.addCurated(v, P.id)); });
    if (!filter || (!filter.mine && !filter.classId)) {
      if (S.user) { try { (await HA.api.listLessons({ mine: true })).filter((P) => P.visibility === 'private').forEach((P) => { P.user = true; list.push(P); }); } catch (e) {} }
      list = list.concat(await HA.loadOfficial());
      if (HA.config.showSamplePosts) list = list.concat(HA.lessons);
    }
    const seen = new Set();
    return list.filter((P) => (seen.has(P.id) ? false : seen.add(P.id))).sort((a, b) => (b.created || 0) - (a.created || 0));
  };

  /* ---------- Post card ---------- */
  F.card = function (P, opts) {
    opts = opts || {};
    const sub = HA.subjectOf(P.subject || 'zh');
    const lang = langOf(P);
    const lines = (P.text || []).slice(0, opts.full ? 999 : 3);
    const more = (P.text || []).length > lines.length;
    const author = P.author || 'Hanry Academy';
    const showTr = S.settings.showTrans;
    const body = lang === 'code'
      ? '<pre class="code-block">' + esc(lines.map((x) => x.zh).join('\n')) + '</pre>'
      : lines.map((x) => '<p class="pl ' + lang + '"' + F.lineAttrs(x, P) + '>' + (x.sp ? '<b class="sp">' + esc(HA.zh.disp(x.sp)) + '：</b>' : '') + '<span class="' + (lang === 'zh' ? 'zh' : '') + '">' + F.render(x.zh, P) + '</span>' + (showTr && trLine(x) ? '<span class="pl-tr">' + esc(trLine(x)) + '</span>' : '') + '</p>').join('');
    return '<article class="post" data-id="' + esc(P.id) + '">' +
      '<header class="post-head"><span class="avatar sm" style="--c:' + (P.sample ? '#58cc02' : '#ce82ff') + '">' + esc(author[0].toUpperCase()) + '</span>' +
      '<div class="ph-meta"><div><b>' + esc(author) + '</b> ' + roleBadge(P.authorRole) + (P.sample ? ' <span class="badge">' + t('samplePost') + '</span>' : '') + (P.official ? ' <span class="badge good">✔ ' + t('official') + '</span>' : '') + '</div>' +
      '<small class="muted">' + F.timeAgo(P.created) + ' · ' + sub.icon + ' ' + esc(HA.subjectName(sub)) + (P.level ? ' · ' + esc(P.levelCode && P.exam ? P.levelCode + ' · ' + P.exam : HA.levelOf(P.level).name) : '') + (P.visibility === 'private' ? ' · 🔒 ' + t('visPrivate') : P.visibility === 'class' ? ' · 🏫 ' + t('visClass') : ' · 🌐') + '</small></div>' +
      '<div class="ph-act">' + (canEdit(P) ? '<a class="icon-btn" href="#/compose/' + encodeURIComponent(P.id) + '" title="' + t('edit') + '">✏️</a><button class="icon-btn" data-del-post="' + esc(P.id) + '" title="' + t('delete') + '">🗑</button>' : '') + '<button class="icon-btn" data-report="' + esc(P.id) + '" title="' + t('report') + '">🚩</button></div></header>' +
      '<a class="post-title" href="' + postUrl(P) + '"><span class="pt-emoji">' + esc(P.emoji || sub.icon) + '</span><span><span class="pt-main ' + (lang === 'zh' ? 'zh' : '') + '">' + esc(lang === 'zh' ? HA.zh.disp(P.title.zh) : P.title.zh) + '</span>' + (trTitle(P) ? '<span class="pt-tr">' + esc(trTitle(P)) + '</span>' : '') + '</span></a>' +
      '<div class="post-body">' + body + '</div>' +
      (more ? '<a class="more-link" href="' + postUrl(P) + '">' + t('readMore') + ' →</a>' : '') +
      '<div class="post-tags">' + ((P.vocab || []).length ? '<span class="chip">🔤 ' + P.vocab.length + ' ' + t('words') + '</span>' : '') + ((P.grammar || []).length ? '<span class="chip">🧩 ' + P.grammar.length + ' ' + t('tabGrammar') + '</span>' : '') + ((P.questions || []).length ? '<span class="chip">❓ ' + P.questions.length + ' ' + t('questionsOf') + '</span>' : '') + ((P.exercises || []).length ? '<span class="chip">✏️ ' + P.exercises.length + ' ' + t('exercises') + '</span>' : '') + (P.sourceType ? '<span class="chip ghost-chip">' + esc(srcName(P.sourceType)) + (P.sourceRef ? ': ' + esc(P.sourceRef).slice(0, 40) : '') + '</span>' : '') + '</div>' +
      '<footer class="post-foot"><button class="pf-btn" data-like="' + esc(P.id) + '">🤍 <span>' + t('like') + '</span> <b class="n-like"></b></button>' +
      '<a class="pf-btn" href="' + postUrl(P) + '#comments">💬 <span>' + t('comment') + '</span> <b class="n-com"></b></a>' +
      (lang !== 'code' ? '<button class="pf-btn" data-play="' + esc(P.id) + '">🔊 <span>' + t('listen') + '</span></button>' : '') + '</footer></article>';
  };
  F.fillReactions = async function (root, posts) {
    if (!posts.length) return;
    let r = {};
    try { r = await HA.api.getReactions(posts.map((P) => P.id)); } catch (e) { return; }
    Object.entries(r).forEach(([id, x]) => {
      const el = root.querySelector('.post[data-id="' + CSS.escape(id) + '"]'); if (!el) return;
      const lb = el.querySelector('[data-like]');
      lb.classList.toggle('on', x.liked); lb.firstChild.textContent = x.liked ? '❤️ ' : '🤍 ';
      el.querySelector('.n-like').textContent = x.likes || '';
      el.querySelector('.n-com').textContent = x.comments || '';
    });
  };
  F.actions = function (root, posts) {
    return async (e) => {
      const lk = e.target.closest('[data-like]');
      if (lk) {
        if (!HA.requireLogin()) return;
        try { await HA.api.toggleLike(lk.dataset.like); F.fillReactions(root, posts.filter((P) => P.id === lk.dataset.like)); } catch (err) { HA.ui.toast(err.message, 'bad'); }
      }
      const pl = e.target.closest('[data-play]');
      if (pl) { const P = posts.find((x) => x.id === pl.dataset.play); if (P) F.playAll(P, root.querySelector('.post[data-id="' + CSS.escape(P.id) + '"]')); }
      const dl = e.target.closest('[data-del-post]');
      if (dl && (await HA.ui.confirm(t('confirmDelete')))) { try { await HA.api.deleteLesson(dl.dataset.delPost); HA.dispatch(true); } catch (err) { HA.ui.toast(err.message, 'bad'); } }
      const rp = e.target.closest('[data-report]');
      if (rp) HA.reportModal('content', 'post:' + rp.dataset.report);
    };
  };
  F.playAll = function (P, root) {
    const lines = root ? $$('[data-src]', root) : [];
    let i = 0;
    const lang = langOf(P);
    const items = (P.text || []);
    const next = () => {
      lines.forEach((l) => l.classList.remove('playing'));
      if (i >= items.length) return;
      const el = lines[i]; if (el) { el.classList.add('playing'); if (root.closest('#view') && el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      HA.zh.speak(items[i].zh, { lang, onend: () => { i++; setTimeout(next, 350); } });
    };
    next();
  };

  /* ---------- Home: search + feed ---------- */
  HA.route(/^\/(?:search\/(.*))?$/, async function (q) {
    const subs = HA.config.subjects;
    const sel = S.feedSubject || '';
    const nb = HA.nb.due().length;
    view().innerHTML =
      '<div class="home">' +
      '<div class="home-main">' +
      '<form class="searchbar" id="sform" role="search"><span class="sb-icon">🔎</span><input id="q" class="input" autocomplete="off" placeholder="' + t('searchPlaceholder') + '" value="' + esc(q || '') + '"><button class="btn blue sm">' + t('search') + '</button></form>' +
      '<div id="sres"></div>' +
      '<div id="feedWrap"' + (q ? ' hidden' : '') + '>' +
      '<a class="composer-card" href="#/compose"><span class="avatar sm">' + esc(S.user ? (S.user.name || S.user.email)[0].toUpperCase() : '✍') + '</span><span class="cc-ph">' + t('composerPrompt') + '</span><span class="btn sm green">' + t('compose') + '</span></a>' +
      '<div class="chips-row subj-row"><button class="chip big ' + (!sel ? 'on' : '') + '" data-subj="">' + t('all') + '</button>' + subs.map((s) => '<button class="chip big ' + (sel === s.id ? 'on' : '') + '" data-subj="' + s.id + '">' + s.icon + ' ' + esc(HA.subjectName(s)) + '</button>').join('') + '</div>' +
      '<div id="feed" class="feed"><div class="loading">' + t('loading') + '</div></div></div></div>' +
      '<aside class="home-side">' +
      '<a class="card side-card" href="#/learn"><b>🧭 ' + t('navLearn') + '</b><span class="small muted">' + (S.settings.phon === 'zhuyin' ? t('courseZhuyin') : t('coursePinyin')) + '</span></a>' +
      '<a class="card side-card" href="#/notebook"><b>⭐ ' + t('navNotebook') + '</b><span class="small muted">' + HA.nb.list().length + ' ' + t('words') + ' · ' + nb + ' ' + t('dueToday') + '</span></a>' +
      '<div class="card side-card"><b>💡</b><span class="small muted">' + t('tapHint') + '</span></div>' +
      '</aside></div>';
    const form = $('#sform'), inp = $('#q');
    let timer = null;
    form.onsubmit = (e) => { e.preventDefault(); const v = inp.value.trim(); if (v) { history.replaceState(null, '', '#/search/' + encodeURIComponent(v)); doSearch(v); } };
    inp.oninput = () => { clearTimeout(timer); const v = inp.value.trim(); if (!v) { $('#sres').innerHTML = ''; $('#feedWrap').hidden = false; history.replaceState(null, '', '#/'); return; } timer = setTimeout(() => doSearch(v), 500); };
    let posts = [];
    const draw = () => {
      const s = S.feedSubject || '';
      const list = s ? posts.filter((P) => (P.subject || 'zh') === s) : posts;
      $('#feed').innerHTML = list.length ? list.map((P) => F.card(P)).join('') : '<div class="empty card">📭 ' + t('noPosts') + '</div>';
      F.fillReactions($('#feed'), list);
    };
    view().onclick = (e) => {
      const sb = e.target.closest('[data-subj]');
      if (sb) { S.feedSubject = sb.dataset.subj; $$('[data-subj]').forEach((x) => x.classList.toggle('on', x === sb)); draw(); }
      const ex = e.target.closest('[data-q]'); if (ex) { inp.value = ex.dataset.q; form.onsubmit(new Event('submit')); }
      const nbb = e.target.closest('[data-note]'); if (nbb) { const ok = HA.nb.toggle(HA.ui.noteItem(nbb.dataset.note)); nbb.textContent = ok ? '★ ' + t('inNote') : '☆ ' + t('addNote'); HA.ui.toast(ok ? t('added') : t('removed'), 'good'); }
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak, { lang: sp.dataset.lang || 'zh' });
      F.actions(view(), posts.concat(F.lastResults || []))(e);
    };
    if (q) doSearch(q);
    posts = await F.loadPosts();
    F.allPosts = posts;
    if ($('#feed')) draw();
  });

  /* ---------- Search: translate first, then related posts ---------- */
  function detectLang(q) {
    if (HA.zh.hasHan(q)) return 'zh';
    if (/[぀-ヿ]/.test(q)) return 'ja';
    if (/[가-힯]/.test(q)) return 'ko';
    if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(q)) return 'vi';
    if (/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü\d\s']+$/i.test(q) && /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\d]/i.test(q)) return 'pinyin';
    return S.settings.lang === 'vi' ? 'vi' : 'en';
  }
  async function doSearch(q) {
    const box = $('#sres'); if (!box) return;
    $('#feedWrap').hidden = true;
    const lang = detectLang(q);
    const Z = HA.zh;
    let html = '<div class="card search-card"><div class="row between"><h3>🌐 ' + t('translation') + '</h3><button class="icon-btn" data-close-search>✕</button></div>' +
      '<div class="tr-row"><div class="tr-src ' + (lang === 'zh' ? 'zh' : '') + '">' + (lang === 'zh' ? '<span class="lg">' + HA.R(q) + '</span>' : esc(q)) + '</div><div class="tr-arrow">→</div><div class="tr-out" id="trOut"><span class="muted">' + t('translating') + '</span></div></div></div>';
    // dictionary block
    let related = [q];
    if (lang === 'zh') {
      const simp = Z.toSimp(q);
      const { cur, list } = Z.lookup(simp);
      if (cur || list.length) {
        html += '<div class="card search-card">' + HA.ui.wordCardHTML(simp, null, false).replace(/data-act="dict"/g, 'data-act="dict"') + '</div>';
      } else {
        const words = Z.analyze(q).filter((x) => x.han);
        html += '<div class="card search-card"><h4>' + t('wordByWord') + '</h4><div class="wbw">' + words.map((w) => { const r = Z.lookup(w.simp); const e = r.cur || r.list[0]; return '<a class="wbw-item" href="#/word/' + encodeURIComponent(w.simp) + '"><b class="zh">' + esc(Z.disp(w.text)) + '</b><small>' + esc(Z.phon(w.py.join(' '))) + '</small><span>' + esc(e ? HA.ui.meaningOf(e).slice(0, 60) : '') + '</span></a>'; }).join('') + '</div></div>';
        related = related.concat(words.filter((w) => [...w.simp].length > 1).map((w) => w.simp));
      }
    } else if (lang === 'vi' || lang === 'en' || lang === 'pinyin') {
      const res = HA.dictSearch ? HA.dictSearch(q).slice(0, 8) : [];
      if (res.length) {
        html += '<div class="card search-card"><h4>📖 ' + t('dictMatches') + '</h4><div class="wbw">' + res.map((e) => '<a class="wbw-item" href="#/word/' + encodeURIComponent(e.s) + '"><b class="zh">' + esc(S.settings.script === 't' ? e.t : e.s) + '</b><small>' + esc(Z.phon(Z.pinyinNumToMarks(e.p))) + '</small><span>' + esc(HA.ui.meaningOf(e)).slice(0, 70) + '</span></a>').join('') + '</div></div>';
        related = related.concat(res.slice(0, 4).map((e) => e.s));
      } else if (!Z.dict.loaded.vi && !Z.dict.loaded.en) html += '<div class="card search-card muted">' + t('dictLoading') + '</div>';
    }
    html += '<h3 class="sec-title">📰 ' + t('relatedPosts') + '</h3><div id="relPosts" class="feed"><div class="loading">' + t('loading') + '</div></div>';
    box.innerHTML = html;
    box.querySelector('[data-close-search]').onclick = () => { $('#q').value = ''; box.innerHTML = ''; $('#feedWrap').hidden = false; history.replaceState(null, '', '#/'); };
    // translation
    const from = lang === 'pinyin' ? 'vi' : lang;
    const to = lang === 'zh' ? HA.mt.target('zh') : lang === 'pinyin' ? null : 'zh';
    if (lang === 'pinyin') $('#trOut').innerHTML = '<span class="muted">' + t('pinyinSearchNote') + '</span>';
    else HA.mt.translate(q, from, to).then((out) => {
      const o = $('#trOut'); if (!o) return;
      o.innerHTML = to === 'zh' ? '<span class="zh lg">' + HA.R(out) + '</span> <button class="icon-btn" data-speak="' + esc(out) + '">🔊</button>' : esc(out);
      if (to === 'zh') { related.push(out); showRelated(related); }
    }).catch(() => {
      const o = $('#trOut'); if (!o) return;
      o.innerHTML = lang === 'zh' ? '<span class="muted small">' + t('glossNote') + '</span><br>' + esc(HA.mt.gloss(q)) : '<span class="muted">' + t('mtUnavailable') + '</span>';
    });
    showRelated(related);
  }
  async function showRelated(terms) {
    const posts = F.allPosts || (F.allPosts = await F.loadPosts());
    const box = $('#relPosts'); if (!box) return;
    const ts = [...new Set(terms.filter(Boolean).map((x) => String(x).toLowerCase()))];
    const tsSimp = ts.concat(ts.map((x) => HA.zh.toSimp(x)));
    const score = (P) => {
      const raw = [P.title.zh, P.title.vi, P.title.en].concat((P.text || []).map((x) => x.zh + ' ' + (x.vi || '') + ' ' + (x.en || ''))).concat((P.vocab || []).map((v) => v.w + ' ' + (v.vi || '') + ' ' + (v.en || ''))).join('\n');
      const hay = (raw + '\n' + HA.zh.toSimp(raw)).toLowerCase();
      return tsSimp.reduce((n, term) => n + (term && hay.includes(term) ? (HA.zh.hasHan(term) ? 3 : 1) : 0), 0);
    };
    const res = posts.map((P) => [P, score(P)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 12).map((x) => x[0]);
    F.lastResults = res;
    box.innerHTML = res.length ? res.map((P) => F.card(P)).join('') : '<div class="empty card">' + t('notFound') + '</div>';
    F.fillReactions(box, res);
  }

  /* ---------- Post page ---------- */
  HA.route(/^\/post\/([^?#]+)/, async function (id) {
    let P = HA.lessonById[id];
    if (!P) { await HA.loadOfficial(); P = HA.lessonById[id]; }
    if (!P) {
      view().innerHTML = '<div class="loading">' + t('loading') + '</div>';
      try { P = await HA.api.getLesson(id); } catch (e) { P = null; }
      if (!P) { view().innerHTML = '<div class="empty card">🔒 ' + t('postNotFound') + '</div>'; return; }
      P.id = id; P.user = true; (P.vocab || []).forEach((v) => HA.zh.addCurated(v, P.id));
    }
    S.data.lessons[P.id] = Object.assign(S.data.lessons[P.id] || {}, { read: Date.now() }); HA.saveData();
    renderPost(P);
  });
  function renderPost(P) {
    const lang = langOf(P);
    const isZh = lang === 'zh';
    const showTr = S.settings.showTrans;
    const speakers = [...new Set((P.text || []).map((x) => x.sp).filter(Boolean))];
    const colors = ['#1cb0f6', '#ff9600', '#ce82ff', '#58cc02', '#ff4b4b'];
    const reading = lang === 'code'
      ? '<pre class="code-block">' + esc((P.text || []).map((x) => x.zh).join('\n')) + '</pre>'
      : (P.text || []).map((x, i) => '<div class="line ' + (x.sp && speakers.indexOf(x.sp) % 2 ? 'right ' : '') + (x.indent ? 'indent' : '') + '"' + F.lineAttrs(x, P) + ' data-i="' + i + '">' +
        (x.sp ? '<div class="spk" style="--c:' + colors[speakers.indexOf(x.sp) % 5] + '"><span class="av">' + esc(HA.zh.disp(x.sp)[0]) + '</span><span class="' + (isZh ? 'zh' : '') + '">' + esc(HA.zh.disp(x.sp)) + '</span></div>' : '') +
        '<div class="bubble-line"><div class="' + (isZh ? 'zh ' : '') + 'lg">' + F.render(x.zh, P) + '</div>' + (showTr ? '<div class="trans" data-trfor="' + i + '">' + esc(trLine(x)) + '</div>' : '') + '</div>' +
        '<button class="icon-btn" data-speakline="' + i + '" aria-label="play">🔊</button></div>').join('');
    const sec = [];
    const add = (id, icon, title, html) => { if (html) sec.push({ id, icon, title, html }); };
    add('sec-q', '❓', t('tabQuestions'), (P.questions || []).length ? questionsHTML(P, isZh) : '');
    add('sec-v', '🔤', t('tabVocab'), (P.vocab || []).length ? '<div class="row wrap mb"><button class="btn sm yellow" id="addAll">⭐ ' + t('addNote') + ' (' + P.vocab.length + ')</button><a class="btn sm blue" href="#/game/flash?post=' + encodeURIComponent(P.id) + '">🃏 ' + t('reviewGames') + '</a></div>' + (P.official ? vocabTable(P) : '<div class="vocab-grid">' + P.vocab.map(vocabCard).join('') + '</div>') : '');
    add('sec-g', '🧩', t('tabGrammar'), (P.grammar || []).length ? P.grammar.map((g, i) => grammarHTML(g, i, P)).join('') : '');
    add('sec-x', '✏️', t('exercises'), (P.exercises || []).length ? P.exercises.map((x, i) => exerciseHTML(x, i, P)).join('') : '');
    const levelCode = P.levelCode || (P.level ? HA.levelOf(P.level).code : '');
    view().innerHTML =
      '<a class="back" href="#/">← ' + t('navHome') + '</a>' +
      '<div class="single">' + F.card(Object.assign({}, P, { text: [] }), {}).replace('<div class="post-body"></div>', '') + '</div>' +
      (P.official ? '<div class="lesson-banner"><span class="lb-level">' + esc(levelCode) + (P.exam ? ' · ' + esc(P.exam) : '') + '</span><div><div class="zh lb-title">' + F.render(P.title.zh, P) + '</div><div class="muted">' + esc(P.title.vi || '') + '</div></div></div>' : '') +
      (sec.length ? '<nav class="sec-nav"><button data-goto="sec-read">📖 ' + t('tabRead') + '</button>' + sec.map((x) => '<button data-goto="' + x.id + '">' + x.icon + ' ' + x.title + '</button>').join('') + '<button data-goto="comments">💬 ' + t('comments') + '</button></nav>' : '') +
      '<div class="toolbar" id="sec-read">' + (lang !== 'code' ? '<button class="btn sm blue" id="playAll">▶ ' + t('playAll') + '</button><button class="btn sm ghost" id="stopAll">■</button>' : '') +
      (isZh ? '<button class="btn sm ' + (S.settings.showRuby ? 'purple' : 'ghost') + '" id="toggleRuby">' + (S.settings.showRuby ? '✓ ' : '') + (S.settings.phon === 'zhuyin' ? t('showZhuyin') : t('showPinyin')) + '</button>' : '') +
      '<button class="btn sm ' + (showTr ? 'orange' : 'ghost') + '" id="toggleTrans">' + (showTr ? '✓ ' + t('showTrans') : t('showTrans')) + '</button>' +
      (lang !== 'code' ? '<button class="btn sm ghost" id="mtAll">🌐 ' + t('translateAll') + '</button>' : '') + '</div>' +
      '<p class="hint">💡 ' + t('tapHint') + '</p>' +
      '<div class="reading card ' + (P.kind === 'dialogue' ? 'dlg' : 'psg') + '">' + reading + '</div>' +
      (showTr && P.trSource === 'ai' ? '<p class="tiny muted">🤖 ' + t('aiTranslationNote') + '</p>' : '') +
      sec.map((x) => '<h2 class="sec-title" id="' + x.id + '">' + x.icon + ' ' + x.title + '</h2>' + x.html).join('') +
      (P.quote && P.quote.zh ? quoteHTML(P.quote, P) : '') +
      '<h2 class="sec-title" id="comments">💬 ' + t('comments') + '</h2><div class="card"><div id="comList"><div class="loading">' + t('loading') + '</div></div>' +
      '<form id="comForm" class="row com-form"><input class="input" id="comText" maxlength="1000" placeholder="' + t('writeComment') + '"><button class="btn blue sm">' + t('send') + '</button></form><p class="tiny muted">' + t('commentRule') + ' <a href="#/legal/community">' + t('navCommunityRules') + '</a></p></div>';
    const loadComments = async () => {
      let list = [];
      try { list = await HA.api.listComments(P.id); } catch (e) {}
      const box = $('#comList'); if (!box) return;
      box.innerHTML = list.length ? list.map((c) => '<div class="com"><span class="avatar sm">' + esc((c.name || '?')[0].toUpperCase()) + '</span><div><b>' + esc(c.name || '') + '</b> <small class="muted">' + F.timeAgo(c.created) + '</small><div>' + esc(c.text) + '</div></div>' +
        (S.user && (c.uid === S.user.uid || HA.isAdmin(S.user)) ? '<button class="icon-btn" data-delcom="' + esc(c.id) + '">🗑</button>' : '<button class="icon-btn" data-reportcom="' + esc(c.id) + '">🚩</button>') + '</div>').join('') : '<p class="muted">' + t('noComments') + '</p>';
    };
    loadComments();
    F.fillReactions(view(), [P]);
    if (location.hash.includes('#comments')) setTimeout(() => $('#comments') && $('#comments').scrollIntoView(), 300);
    $('#comForm').onsubmit = async (e) => {
      e.preventDefault();
      if (!HA.requireLogin()) return;
      const v = $('#comText').value.trim(); if (!v) return;
      try { await HA.api.addComment(P.id, v); $('#comText').value = ''; loadComments(); F.fillReactions(view(), [P]); } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
    const act = F.actions(view(), [P]);
    view().onclick = async (e) => {
      act(e);
      const sl = e.target.closest('[data-speakline]'); if (sl) HA.zh.speak(P.text[+sl.dataset.speakline].zh, { lang });
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak, { lang });
      const nb = e.target.closest('[data-note]');
      if (nb) { const ok = HA.nb.toggle(HA.ui.noteItem(nb.dataset.note)); nb.classList.toggle('on', ok); nb.textContent = ok ? '★' : '☆'; HA.ui.toast(ok ? t('added') : t('removed'), ok ? 'good' : ''); }
      const wr = e.target.closest('[data-write]'); if (wr) HA.games.writeModal(wr.dataset.write);
      const dc = e.target.closest('[data-delcom]'); if (dc && (await HA.ui.confirm(t('confirmDelete')))) { await HA.api.deleteComment(dc.dataset.delcom); loadComments(); }
      const rc = e.target.closest('[data-reportcom]'); if (rc) HA.reportModal('content', 'comment:' + rc.dataset.reportcom);
      const gt = e.target.closest('[data-goto]'); if (gt) { const el = document.getElementById(gt.dataset.goto); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
      const cf = e.target.closest('[data-check-fill]');
      if (cf) {
        const norm = (x) => HA.zh.toSimp(String(x || '')).replace(/[\s、，,／/。]/g, '');
        $$('.fill-item', cf.closest('.exercise')).forEach((li) => {
          const want = (li.dataset.ans || '').split(/[、，,]/).map(norm).filter(Boolean);
          const got = $$('.fill-in', li).map((inp) => norm(inp.value));
          const ok = want.length > 0 && ((got.length === want.length && got.every((g, k) => g === want[k])) || norm(got.join('')) === norm(want.join('')));
          $('.fill-res', li).textContent = ok ? '✅' : '❌ ' + HA.zh.disp(li.dataset.ans);
          li.classList.toggle('ok', ok);
        });
      }
      const tile = e.target.closest('.order-item .tile');
      if (tile) {
        const li = tile.closest('.order-item'); const line = $('.answer-line', li);
        if (tile.parentElement === line) $('.bank', li).appendChild(tile); else line.appendChild(tile);
        const built = $$('.tile', line).map((x) => x.textContent).join('');
        const want = HA.zh.disp(li.dataset.ans || '').replace(/[，。！？、\s]/g, '');
        const done = $$('.bank .tile', li).length === 0;
        const ok = done && HA.zh.toSimp(built) === HA.zh.toSimp(want);
        line.classList.toggle('good', ok);
        line.classList.toggle('bad', done && !ok);
        if (done) HA.games.beep(ok);
      }
      const id = e.target.id;
      if (id === 'playAll') F.playAll(P, $('.reading'));
      if (id === 'stopAll') HA.zh.stop();
      if (id === 'toggleRuby') { S.settings.showRuby = !S.settings.showRuby; HA.saveSettings(); HA.zh.clearCache(); document.body.classList.toggle('no-ruby', !S.settings.showRuby); renderPost(P); }
      if (id === 'toggleTrans') { S.settings.showTrans = !S.settings.showTrans; HA.saveSettings(); renderPost(P); }
      if (id === 'addAll') { let n = 0; P.vocab.forEach((v) => { if (HA.nb.add({ w: v.w, p: v.p, vi: v.vi, en: v.en, lang })) n++; }); HA.ui.toast(t('added') + ' (+' + n + ')', 'good'); }
      if (id === 'mtAll') {
        if (!S.settings.showTrans) { S.settings.showTrans = true; HA.saveSettings(); renderPost(P); }
        $$('.reading .line').forEach((el) => {
          const tr = el.querySelector('.trans'); if (!tr || tr.textContent.trim()) return;
          tr.innerHTML = '<span class="muted">' + t('translating') + '</span>';
          HA.mt.translate(el.dataset.src, lang).then((m) => { tr.textContent = m; el.dataset.tr = m; }).catch(() => { tr.innerHTML = '<span class="muted">' + (isZh ? esc(HA.mt.gloss(el.dataset.src)) : t('mtUnavailable')) + '</span>'; });
        });
      }
      if (id === 'submitQuiz') {
        let ok = 0;
        P.questions.forEach((q, i) => {
          const li = $('.q[data-i="' + i + '"]');
          const sel = $('input[name="q' + i + '"]:checked', li);
          const correct = q.type === 'tf' ? (q.a ? '1' : '0') : String(q.a);
          $$('.opt', li).forEach((o) => { const v = $('input', o).value; o.classList.toggle('right', v === correct); o.classList.toggle('wrong', !!(sel && sel.value === v && v !== correct)); });
          if (sel && sel.value === correct) ok++;
          const why = $('.why', li); if (why) why.hidden = false;
        });
        const score = Math.round((ok / P.questions.length) * 100);
        $('#quizRes').innerHTML = '<div class="result ' + (score >= 60 ? 'good' : 'bad') + '">' + t('score') + ': <b>' + ok + '/' + P.questions.length + '</b> (' + score + '%)</div>';
        S.data.lessons[P.id] = Object.assign(S.data.lessons[P.id] || {}, { quiz: score }); HA.saveData();
      }
    };
  }
  /* ---------- Official lesson sections ---------- */
  function questionsHTML(P, isZh) {
    let lastCat = null;
    return '<div class="card"><p class="muted">' + t('readFirst') + '</p><ol class="quiz">' + P.questions.map((q, i) => {
      const head = q.cat && q.cat !== lastCat ? '<li class="q-cat">' + esc(q.cat) + '</li>' : '';
      lastCat = q.cat;
      return head + '<li class="q" data-i="' + i + '" value="' + (i + 1) + '"' + F.lineAttrs({ zh: q.q, vi: q.qvi || '', en: '' }, P) + '><div class="q-text ' + (isZh ? 'zh' : '') + '">' + F.render(q.q, P) + '</div>' + (S.settings.lang === 'vi' && q.qvi ? '<div class="muted small">' + esc(q.qvi) + '</div>' : '') +
        '<div class="opts">' + (q.type === 'tf' ? '<label class="opt"><input type="radio" name="q' + i + '" value="1"> ✔ ' + t('trueW') + '</label><label class="opt"><input type="radio" name="q' + i + '" value="0"> ✘ ' + t('falseW') + '</label>'
          : q.o.map((o, k) => '<label class="opt"><input type="radio" name="q' + i + '" value="' + k + '"> <b>' + 'ABCDEFGH'[k] + '.</b> <span class="' + (isZh ? 'zh' : '') + '">' + F.render(o, P) + '</span></label>').join('')) + '</div>' +
        (q.why ? '<div class="why" hidden>💡 ' + esc(q.why) + '</div>' : '') + '</li>';
    }).join('') + '</ol><div id="quizRes"></div><button class="btn green" id="submitQuiz">' + t('submit') + '</button></div>';
  }
  function vocabTable(P) {
    return '<div class="vtable">' + P.vocab.map((v) => {
      const inNb = HA.nb.has(v.w);
      return '<div class="vrow"><div class="vr-word"><span class="zh vr-zh">' + HA.R(v.w, { ruby: false }) + '</span><span class="vr-py">' + esc(HA.zh.phon(v.p || HA.zh.pinyinOf(v.w))) + '</span>' +
        '<span class="vr-btns"><button class="icon-btn" data-speak="' + esc(v.w) + '">🔊</button><button class="icon-btn star ' + (inNb ? 'on' : '') + '" data-note="' + esc(v.w) + '">' + (inNb ? '★' : '☆') + '</button><button class="icon-btn" data-write="' + esc(v.w) + '">✍️</button></span></div>' +
        '<div class="vr-body"><b>' + esc(v.vi || '') + '</b>' + (v.note ? '<div class="small muted">' + esc(v.note) + '</div>' : '') +
        (v.ex && v.ex[0] ? '<div class="vr-ex" data-src="' + esc(v.ex[0]) + '" data-tr="' + esc(v.ex[1] || '') + '" data-lang="zh"><span class="zh">' + HA.R(v.ex[0]) + '</span><span class="small">' + esc(v.ex[1] || '') + '</span></div>' : '') + '</div></div>';
    }).join('') + '</div>';
  }
  function practiceList(items, P, kind) {
    return '<ol class="prac">' + items.map((x) => '<li><div class="pr-q ' + (HA.zh.hasHan(x.q) ? 'zh' : '') + '"' + (HA.zh.hasHan(x.q) ? F.lineAttrs({ zh: x.q, vi: '', en: '' }, P) : '') + '>' + (HA.zh.hasHan(x.q) ? F.render(x.q, P) : esc(x.q)) + '</div>' +
      (x.a ? '<details class="pr-a"><summary>' + t('showAnswer') + '</summary><div class="' + (HA.zh.hasHan(x.a) ? 'zh' : '') + '"' + (HA.zh.hasHan(x.a) ? F.lineAttrs({ zh: x.a, vi: '', en: '' }, P) : '') + '>' + (HA.zh.hasHan(x.a) ? F.render(x.a, P) : esc(x.a)) + '</div>' + (HA.zh.hasHan(x.a) ? '<button class="icon-btn" data-speak="' + esc(x.a) + '">🔊</button>' : '') + '</details>' : '') + '</li>').join('') + '</ol>';
  }
  function grammarHTML(g, i, P) {
    if (g.t && g.examples) {  // community-post format
      return '<div class="card grammar"><div class="g-num">' + (i + 1) + '</div><h3>' + esc(HA.tr(g.t)) + '</h3>' + (g.f ? '<div class="formula zh">' + esc(HA.zh.disp(g.f)) + '</div>' : '') + '<p>' + esc(HA.tr(g.ex)) + '</p><ul class="examples">' + g.examples.map((x) => '<li' + F.lineAttrs(x, P) + '><button class="icon-btn" data-speak="' + esc(x.zh) + '">🔊</button><div><div class="zh lg">' + F.render(x.zh, P) + '</div><div class="muted">' + esc(HA.tr(x)) + '</div></div></li>').join('') + '</ul></div>';
    }
    return '<div class="card grammar"><div class="g-num">' + (i + 1) + '</div>' +
      '<div class="formula zh">' + esc(HA.zh.disp(g.title)) + (g.titleVi ? ' <span class="muted small">(' + esc(g.titleVi) + ')</span>' : '') + '</div>' +
      (g.pinyin ? '<div class="g-py">' + esc(g.pinyin) + '</div>' : '') +
      (g.meaning ? '<p><b>' + t('meaning') + ':</b> ' + esc(g.meaning) + '</p>' : '') +
      (g.usage ? '<p><b>' + t('usageLabel') + ':</b> ' + esc(g.usage) + '</p>' : '') +
      (g.note ? '<p class="g-note">⚠️ ' + esc(g.note) + '</p>' : '') +
      (g.example && g.example[0] ? '<div class="g-ex"' + F.lineAttrs({ zh: g.example[0], vi: g.example[1] || '', en: '' }, P) + '><small class="muted">' + t('exampleInText') + '</small><div class="zh lg">' + F.render(g.example[0], P) + ' <button class="icon-btn" data-speak="' + esc(g.example[0]) + '">🔊</button></div><div class="muted">' + esc(g.example[1] || '') + '</div></div>' : '') +
      ((g.practice || []).length ? '<details class="adv"><summary>✏️ ' + t('grammarPractice') + ' (' + g.practice.length + ')</summary>' + practiceList(g.practice, P) + '</details>' : '') + '</div>';
  }
  function exerciseHTML(x, i, P) {
    let body = '';
    if (x.kind === 'fill') {
      body = (x.bank.length ? '<div class="bank fill-bank">' + x.bank.map((w) => '<span class="tile zh" data-speak="' + esc(w) + '">' + esc(HA.zh.disp(w)) + '</span>').join('') + '</div>' : '') +
        '<ol class="prac">' + x.items.map((it, k) => '<li class="fill-item" data-ans="' + esc(it.a) + '"><div class="zh">' + F.render(it.q.replace(/＿[\s＿]*/g, '＿＿'), P).replace(/＿＿/g, '<input class="fill-in zh" size="4" autocomplete="off">') + '</div><span class="fill-res"></span></li>').join('') + '</ol>' +
        '<div class="row"><button class="btn sm green" data-check-fill>' + t('check') + '</button><details class="pr-a inline"><summary>' + t('showAnswer') + '</summary><span class="zh">' + x.items.map((it, k) => (k + 1) + '. ' + esc(HA.zh.disp(it.a))).join(' ／ ') + '</span></details></div>';
    } else if (x.kind === 'order') {
      body = '<ol class="prac">' + x.items.map((it) => {
        const parts = it.q.split(/[／\/]/).map((s) => s.trim()).filter(Boolean);
        return '<li class="order-item" data-ans="' + esc(it.a) + '"><div class="bank">' + HA.ui.shuffle(parts).map((w) => '<button class="tile zh">' + esc(HA.zh.disp(w)) + '</button>').join('') + '</div><div class="answer-line small-line"></div>' +
          '<details class="pr-a"><summary>' + t('showAnswer') + '</summary><div class="zh"' + F.lineAttrs({ zh: it.a, vi: '', en: '' }, P) + '>' + F.render(it.a, P) + '</div></details></li>';
      }).join('') + '</ol>';
    } else if (x.kind === 'write') {
      body = '<div class="card soft"><b class="zh">' + F.render(x.prompt || '', P) + '</b>' + (x.hint ? '<div class="small muted">' + t('hint') + ': <span class="zh">' + esc(HA.zh.disp(x.hint)) + '</span></div>' : '') +
        '<textarea class="input zh" rows="4" placeholder="' + t('writeHere') + '"></textarea>' +
        (x.sample ? '<details class="pr-a"><summary>' + t('sampleAnswer') + '</summary><div class="zh"' + F.lineAttrs({ zh: x.sample, vi: '', en: '' }, P) + '>' + F.render(x.sample, P) + '</div></details>' : '') + '</div>';
    } else {
      body = practiceList(x.items, P);
    }
    return '<div class="card exercise"><h3>' + (i + 1) + '. <span class="zh">' + esc(HA.zh.disp(x.title)) + '</span></h3>' + body + '</div>';
  }
  function quoteHTML(q, P) {
    return '<div class="quote-card"' + F.lineAttrs({ zh: q.zh, vi: q.vi, en: '' }, P) + '>' + (q.label ? '<small>' + esc(HA.zh.disp(q.label)) + '</small>' : '') +
      '<div class="qc-zh zh">' + F.render(q.zh, P, { ruby: false }) + '</div>' + (q.py ? '<div class="qc-py">' + esc(q.py) + '</div>' : '') + '<div class="qc-vi">' + esc(q.vi) + '</div>' +
      '<button class="btn sm white" data-speak="' + esc(q.zh) + '">🔊</button></div>';
  }
  function vocabCard(v, i) {
    const inNb = HA.nb.has(v.w);
    return '<div class="vcard" style="--d:' + i * 30 + 'ms">' +
      '<div class="v-top"><div class="v-zh zh">' + HA.R(v.w, { ruby: false }) + '</div><div class="v-btns"><button class="icon-btn" data-speak="' + esc(v.w) + '">🔊</button><button class="icon-btn star ' + (inNb ? 'on' : '') + '" data-note="' + esc(v.w) + '">' + (inNb ? '★' : '☆') + '</button><button class="icon-btn" data-write="' + esc(v.w) + '">✍️</button></div></div>' +
      '<div class="v-py">' + esc(HA.zh.phon(v.p || HA.zh.pinyinOf(v.w))) + (S.settings.lang === 'vi' && v.hv ? ' · <span class="hv">' + esc(v.hv.toUpperCase()) + '</span>' : '') + '</div>' +
      '<div class="v-mean">' + (v.pos ? '<em class="pos">' + esc(HA.ui.posLabel(v.pos)) + '</em> ' : '') + esc(HA.ui.meaningOf(v)) + '</div>' +
      (v.ex ? '<div class="v-ex" data-src="' + esc(v.ex[0]) + '" data-tr="' + esc(v.ex[1] || '') + '" data-lang="zh"><div class="zh">' + HA.R(v.ex[0]) + '</div>' + (S.settings.lang === 'vi' && v.ex[1] ? '<div class="muted small">' + esc(v.ex[1]) + '</div>' : '') + '</div>' : '') +
      ((v.syn || []).length || (v.ant || []).length ? '<div class="v-rel">' + (v.syn.length ? '<span class="small">≈ ' + v.syn.map((s) => '<a class="chip zh" href="#/word/' + encodeURIComponent(s) + '">' + esc(HA.zh.disp(s)) + '</a>').join('') + '</span>' : '') + (v.ant.length ? '<span class="small"> ≠ ' + v.ant.map((s) => '<a class="chip red zh" href="#/word/' + encodeURIComponent(s) + '">' + esc(HA.zh.disp(s)) + '</a>').join('') + '</span>' : '') + '</div>' : '') +
      '</div>';
  }

  /* ---------- Composer ---------- */
  function parseText(txt) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split('|').map((x) => x.trim());
      let zh = parts[0], sp = '';
      const m = /^([^:：]{1,16})[:：]\s*(.+)$/.exec(zh);
      if (m && !/^https?$/i.test(m[1])) { sp = m[1].trim(); zh = m[2].trim(); }
      return { sp, zh, vi: parts[1] || '', en: parts[2] || '' };
    }).filter((x) => x.zh).slice(0, 200);
  }
  function parseCode(txt) { return txt.replace(/\r/g, '').split('\n').slice(0, 400).map((l) => ({ sp: '', zh: l, vi: '', en: '' })); }
  function parseVocab(txt, lang) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 80).map((line) => {
      const [w, vi, en, ex] = line.split('|').map((x) => x.trim());
      return { w, p: lang === 'zh' ? HA.zh.pinyinOf(w) : '', pos: '', vi: vi || '', en: en || '', hv: '', ex: ex ? [ex, ''] : null, syn: [], ant: [] };
    }).filter((v) => v.w);
  }
  function parseGrammar(txt) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 20).map((line) => {
      const [name, f, ex, exs] = line.split('|').map((x) => x.trim());
      return { t: { vi: name || '', en: name || '' }, f: f || '', ex: { vi: ex || '', en: ex || '' }, examples: (exs || '').split(/[;；]/).map((x) => x.trim()).filter(Boolean).map((x) => { const [zh, tr] = x.split('='); return { zh: zh.trim(), vi: (tr || '').trim(), en: (tr || '').trim() }; }) };
    });
  }
  function parseQuestions(txt) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 30).map((line) => {
      const parts = line.split('|').map((x) => x.trim());
      if (parts.length === 2 && /^(đ|đúng|t|true|对|對|s|sai|f|false|错|錯)$/i.test(parts[1])) return { type: 'tf', q: parts[0], qvi: '', a: /^(đ|đúng|t|true|对|對)$/i.test(parts[1]) };
      const o = parts.slice(1); const a = o.findIndex((x) => x.startsWith('*'));
      return { type: 'mc', q: parts[0], qvi: '', o: o.map((x) => x.replace(/^\*/, '')), a: a < 0 ? 0 : a };
    }).filter((q) => q.q && (q.type === 'tf' || q.o.length >= 2));
  }
  const ser = {
    text: (L) => (L.text || []).map((x) => (x.sp ? x.sp + ': ' : '') + x.zh + (x.vi || x.en ? ' | ' + (x.vi || '') + (x.en ? ' | ' + x.en : '') : '')).join('\n'),
    code: (L) => (L.text || []).map((x) => x.zh).join('\n'),
    vocab: (L) => (L.vocab || []).map((v) => [v.w, v.vi, v.en, v.ex ? v.ex[0] : ''].join(' | ').replace(/( \| )+$/, '')).join('\n'),
    grammar: (L) => (L.grammar || []).map((g) => [g.t.vi, g.f, g.ex.vi, g.examples.map((x) => x.zh + (x.vi ? '=' + x.vi : '')).join('; ')].join(' | ')).join('\n'),
    q: (L) => (L.questions || []).map((q) => (q.type === 'tf' ? q.q + ' | ' + (q.a ? 'Đ' : 'S') : q.q + ' | ' + q.o.map((o, i) => (i === q.a ? '*' : '') + o).join(' | '))).join('\n')
  };

  HA.route(/^\/compose(?:\/([^?]+))?(?:\?(.*))?$/, async function (id, query) {
    const params = Object.fromEntries(new URLSearchParams(query || ''));
    if (!S.user) { view().innerHTML = '<div class="empty card"><div class="emoji-big">✍️</div><p>' + t('needLogin') + '</p><button class="btn blue" onclick="HA.openLogin()">' + t('login') + '</button></div>'; return; }
    if (params.mine) {
      view().innerHTML = '<div class="page-head"><h1>📁 ' + t('myLessons') + '</h1><a class="btn green" href="#/compose">✍️ ' + t('compose') + '</a></div><div id="mine" class="feed"><div class="loading"></div></div>';
      const list = (await HA.api.listLessons({ mine: true }).catch(() => [])).map((P) => Object.assign(P, { user: true }));
      $('#mine').innerHTML = list.length ? list.map((P) => F.card(P)).join('') : '<div class="empty card">📭</div>';
      view().onclick = F.actions(view(), list);
      return;
    }
    let L = { subject: S.lastSubject || 'zh', level: 0, emoji: '', kind: 'passage', title: {}, visibility: 'public', sourceType: 'self', author: S.user.name || '' };
    if (id) { try { L = (await HA.api.getLesson(id)) || L; } catch (e) { view().innerHTML = '<div class="empty card">' + esc(e.message) + '</div>'; return; } }
    if (params.class) { L.visibility = 'class'; L.classId = params.class; }
    const canTeach = HA.canTeach(S.user);
    let classes = [];
    if (canTeach) { try { classes = (await HA.api.myClasses()).filter((c) => c.ownerUid === S.user.uid); } catch (e) {} }
    const subs = HA.config.subjects;
    const isCode = () => HA.subjectOf($('#ed').subject.value).lang === 'code';
    view().innerHTML =
      '<div class="page-head"><h1>✍️ ' + (id ? t('edit') : t('compose')) + '</h1><a class="btn ghost" href="#/compose?mine=1">📁 ' + t('myLessons') + '</a></div>' +
      '<form class="card editor composer-form" id="ed">' +
      '<div class="grid3"><label class="fl">' + t('subject') + '<select class="input" name="subject">' + subs.map((s) => '<option value="' + s.id + '"' + (s.id === (L.subject || 'zh') ? ' selected' : '') + '>' + s.icon + ' ' + esc(HA.subjectName(s)) + '</option>').join('') + '</select></label>' +
      '<label class="fl">' + t('kind') + '<select class="input" name="kind"><option value="passage"' + (L.kind !== 'dialogue' ? ' selected' : '') + '>' + t('passage') + '</option><option value="dialogue"' + (L.kind === 'dialogue' ? ' selected' : '') + '>' + t('dialogue') + '</option></select></label>' +
      '<label class="fl">' + t('level') + '<select class="input" name="level"><option value="0">—</option>' + HA.LEVELS.map((l) => '<option value="' + l.n + '"' + (l.n === +L.level ? ' selected' : '') + '>' + esc(l.name) + '</option>').join('') + '</select></label></div>' +
      '<label class="fl">' + t('title') + ' *<input class="input" name="tzh" maxlength="120" required value="' + esc(L.title.zh || '') + '"></label>' +
      '<label class="fl">' + t('titleTrans') + '<input class="input" name="tvi" maxlength="160" value="' + esc(L.title.vi || '') + '"></label>' +
      '<label class="fl">📖 ' + t('postBody') + ' *<small class="muted" id="bodyHelp">' + t('postBodyHelp') + '</small><textarea class="input" name="text" rows="10" maxlength="20000" required placeholder="' + esc(t('postBodyPh')) + '">' + esc(HA.subjectOf(L.subject).lang === 'code' ? ser.code(L) : ser.text(L)) + '</textarea></label>' +
      '<div class="row wrap"><button type="button" class="btn sm blue" id="autoTr">🌐 ' + t('autoTranslate') + '</button><span class="tiny muted">' + t('autoTranslateHelp') + '</span></div>' +
      '<details class="adv"' + ((L.vocab || []).length || (L.questions || []).length ? ' open' : '') + '><summary>➕ ' + t('extras') + '</summary>' +
      '<label class="fl">🔤 ' + t('tabVocab') + '<small class="muted">' + t('vocabHelp') + '</small><textarea class="input" name="vocab" rows="4" maxlength="8000">' + esc(ser.vocab(L)) + '</textarea></label>' +
      '<label class="fl">🧩 ' + t('tabGrammar') + '<small class="muted">' + t('grammarHelp') + '</small><textarea class="input" name="grammar" rows="3" maxlength="6000">' + esc(ser.grammar(L)) + '</textarea></label>' +
      '<label class="fl">❓ ' + t('tabQuestions') + '<small class="muted">' + t('questionHelp') + '</small><textarea class="input" name="questions" rows="4" maxlength="6000">' + esc(ser.q(L)) + '</textarea></label></details>' +
      '<div class="grid3"><label class="fl">' + t('author') + ' *<input class="input" name="author" maxlength="80" required value="' + esc(L.author || '') + '"></label>' +
      '<label class="fl">' + t('source') + '<select class="input" name="sourceType"><option value="self"' + (L.sourceType === 'self' ? ' selected' : '') + '>' + t('srcSelf') + '</option><option value="collected"' + (L.sourceType === 'collected' ? ' selected' : '') + '>' + t('srcCollected') + '</option><option value="cited"' + (L.sourceType === 'cited' ? ' selected' : '') + '>' + t('srcCited') + '</option></select></label>' +
      '<label class="fl">' + t('visibility') + '<select class="input" name="visibility"><option value="public"' + (L.visibility === 'public' ? ' selected' : '') + '>🌐 ' + t('visPublic') + '</option>' +
      (canTeach ? '<option value="class"' + (L.visibility === 'class' ? ' selected' : '') + '>🏫 ' + t('visClass') + '</option><option value="private"' + (L.visibility === 'private' ? ' selected' : '') + '>🔒 ' + t('visPrivate') + '</option>' : '') + '</select></label></div>' +
      (canTeach ? '<label class="fl" id="classPick"' + (L.visibility === 'class' ? '' : ' hidden') + '>' + t('className') + '<select class="input" name="classId">' + classes.map((c) => '<option value="' + esc(c.id) + '"' + (c.id === L.classId ? ' selected' : '') + '>' + esc(c.name) + ' (' + esc(c.code) + ')</option>').join('') + '</select></label>' : '<p class="tiny muted">🎓 ' + t('teacherLocked') + ' <a href="#/classes">' + t('teacherZone') + '</a></p>') +
      '<label class="fl">' + t('sourceRef') + '<input class="input" name="sourceRef" maxlength="300" value="' + esc(L.sourceRef || '') + '"></label>' +
      '<label class="fl row small"><input type="checkbox" name="pledge" required> <span>' + t('contentPledge') + ' (<a href="#/legal/copyright" target="_blank">' + t('navCopyright') + '</a>, <a href="#/legal/community" target="_blank">' + t('navCommunityRules') + '</a>)</span></label>' +
      '<div class="row end"><button type="button" class="btn ghost" id="prev">👁 ' + t('preview') + '</button><button class="btn green lg">📤 ' + (id ? t('save') : t('publish')) + '</button></div></form><div id="prevBox"></div>';
    const form = $('#ed');
    form.visibility.onchange = () => { const cp = $('#classPick'); if (cp) cp.hidden = form.visibility.value !== 'class'; };
    const collect = () => {
      const f = form; const sub = HA.subjectOf(f.subject.value); const lang = sub.lang;
      return {
        subject: sub.id, lang, title: { zh: f.tzh.value.trim(), vi: f.tvi.value.trim(), en: '' }, level: +f.level.value || 0, kind: f.kind.value, emoji: L.emoji || '',
        text: lang === 'code' ? parseCode(f.text.value) : parseText(f.text.value), vocab: parseVocab(f.vocab.value, lang), grammar: parseGrammar(f.grammar.value), questions: parseQuestions(f.questions.value),
        author: f.author.value.trim(), sourceType: f.sourceType.value, sourceRef: f.sourceRef.value.trim(), visibility: f.visibility.value, classId: f.visibility.value === 'class' && f.classId ? f.classId.value : null
      };
    };
    $('#autoTr').onclick = async () => {
      if (isCode()) return;
      const lang = HA.subjectOf(form.subject.value).lang;
      const lines = form.text.value.split('\n');
      const btn = $('#autoTr'); btn.disabled = true;
      let fails = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]; if (!line.trim() || line.includes('|')) continue;
        const m = /^([^:：]{1,16})[:：]\s*(.+)$/.exec(line.trim());
        const body = m ? m[2] : line.trim();
        btn.textContent = '🌐 ' + (i + 1) + '/' + lines.length;
        try { lines[i] = line.trim() + ' | ' + (await HA.mt.translate(body, lang, 'vi')); } catch (e) { fails++; }
      }
      if (!form.tvi.value.trim() && form.tzh.value.trim()) { try { form.tvi.value = await HA.mt.translate(form.tzh.value.trim(), lang, 'vi'); } catch (e) {} }
      form.text.value = lines.join('\n');
      btn.disabled = false; btn.textContent = '🌐 ' + t('autoTranslate');
      if (fails) HA.ui.toast(t('mtUnavailable'), 'bad');
    };
    $('#prev').onclick = () => {
      const d = collect();
      $('#prevBox').innerHTML = '<h3 class="sec-title">👁 ' + t('preview') + '</h3>' + F.card(Object.assign({ id: 'preview', author: d.author, authorRole: HA.roleOf(S.user), created: Date.now() }, d), { full: true });
      $('#prevBox').scrollIntoView({ behavior: 'smooth' });
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const d = collect();
      if (!d.text.length) return HA.ui.toast(t('postBody') + ' ✗', 'bad');
      if (d.visibility === 'class' && !d.classId) return HA.ui.toast(t('className') + ' ✗', 'bad');
      if (id) d.id = id;
      S.lastSubject = d.subject;
      try {
        const newId = await HA.api.saveLesson(d);
        F.allPosts = null;
        HA.ui.toast(t('published'), 'good');
        location.hash = '#/post/' + encodeURIComponent(newId);
      } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
  });
})();
