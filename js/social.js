/* Community lessons, lesson editor, classes, licensed books, admin, feedback, contact */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');
  const needLogin = () => '<div class="empty card"><div class="emoji-big">🔐</div><p>' + t('needLogin') + '</p><button class="btn blue" onclick="HA.openLogin()">' + t('login') + '</button></div>';
  const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString() : '');
  const srcName = (k) => ({ self: t('srcSelf'), collected: t('srcCollected'), cited: t('srcCited') }[k] || '');
  const roleBadge = (r) => (r === 'admin' ? '<span class="badge admin">🛡️ ' + t('admin') + '</span>' : r === 'teacher' ? '<span class="badge teacher">🎓 ' + t('teacher') + '</span>' : '');
  const errBox = (e) => '<div class="empty card">⚠️ ' + esc(e.message || e) + '</div>';

  function lessonCard(L) {
    const lv = HA.levelOf(L.level);
    const mine = S.user && (L.ownerUid === S.user.uid || HA.isAdmin(S.user));
    return '<div class="lcard" style="--c:' + lv.color + '"><a href="#/ulesson/' + esc(L.id) + '" class="lc-main"><span class="lc-emoji">' + esc(L.emoji || '📘') + '</span><div><small>' + lv.name + ' · ' + (L.kind === 'dialogue' ? t('dialogue') : t('passage')) + (L.visibility !== 'public' ? ' · 🔒 ' + (L.visibility === 'class' ? t('visClass') : t('visPrivate')) : '') + '</small>' +
      '<h3 class="zh">' + esc(HA.zh.disp(L.title.zh || '')) + '</h3><p>' + esc(HA.tr(L.title)) + '</p>' +
      '<p class="small">✍️ ' + esc(L.author || '') + ' ' + roleBadge(L.authorRole) + ' · ' + esc(srcName(L.sourceType)) + (L.sourceRef ? ' (' + esc(L.sourceRef).slice(0, 60) + ')' : '') + ' · ' + fmtDate(L.created) + '</p></div></a>' +
      '<div class="lc-act">' + (mine ? '<a class="icon-btn" href="#/editor/' + esc(L.id) + '" title="' + t('edit') + '">✏️</a><button class="icon-btn" data-del-lesson="' + esc(L.id) + '" title="' + t('delete') + '">🗑</button>' : '') +
      '<button class="icon-btn" data-report="' + esc(L.id) + '" title="' + t('report') + '">🚩</button></div></div>';
  }
  async function lessonActions(e) {
    const d = e.target.closest('[data-del-lesson]');
    if (d && (await HA.ui.confirm(t('confirmDelete')))) { try { await HA.api.deleteLesson(d.dataset.delLesson); HA.dispatch(true); } catch (err) { HA.ui.toast(err.message, 'bad'); } }
    const r = e.target.closest('[data-report]');
    if (r) reportModal('content', 'lesson:' + r.dataset.report);
  }
  function reportModal(type, ref) {
    const m = HA.ui.modal('<h3>🚩 ' + t('report') + '</h3><textarea class="input" id="rMsg" rows="4" maxlength="2000" placeholder="' + t('fbMessage') + '"></textarea><button class="btn red full" id="rSend">' + t('send') + '</button>', { cls: 'small' });
    $('#rSend', m).onclick = async () => {
      const msg = $('#rMsg', m).value.trim(); if (!msg) return;
      try { await HA.api.submitReport({ type, ref, message: msg.slice(0, 2000), page: location.hash }); HA.ui.closeModal(); HA.ui.toast(t('reported'), 'good'); } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
  }
  HA.reportModal = reportModal;

  /* ---------- Community ---------- */
  HA.route(/^\/community(?:\/(\w+))?$/, async function (tab) {
    tab = tab || 'official';
    view().innerHTML = '<div class="page-head"><div><h1>🌐 ' + t('navCommunity') + '</h1><p class="muted">' + t('communityIntro') + '</p></div><a class="btn green" href="#/editor">✍️ ' + t('createLesson') + '</a></div>' +
      '<div class="tabs small">' + [['official', '🎓', 'official2'], ['community', '👥', 'communityPosts'], ['mine', '📁', 'myLessons']].map(([k, i, n]) => '<a href="#/community/' + k + '" class="' + (tab === k ? 'on' : '') + '">' + i + ' ' + t(n) + '</a>').join('') + '</div>' +
      '<div class="row wrap mb"><select class="input sm" id="lvFilter"><option value="">' + t('filterLevel') + '</option>' + HA.LEVELS.map((l) => '<option value="' + l.n + '">' + l.name + '</option>').join('') + '</select></div><div id="lc" class="lc-list"><div class="loading">' + t('loading') + '</div></div>';
    if (tab === 'mine' && !S.user) { $('#lc').innerHTML = needLogin(); return; }
    let list;
    try { list = await HA.api.listLessons(tab === 'mine' ? { mine: true } : {}); } catch (e) { $('#lc').innerHTML = errBox(e); return; }
    if (tab === 'official') list = list.filter((L) => L.authorRole === 'teacher' || L.authorRole === 'admin');
    if (tab === 'community') list = list.filter((L) => L.authorRole !== 'teacher' && L.authorRole !== 'admin');
    const draw = () => {
      const lv = $('#lvFilter').value;
      const l2 = lv ? list.filter((L) => String(L.level) === lv) : list;
      $('#lc').innerHTML = l2.length ? l2.map(lessonCard).join('') : '<div class="empty card">📭 —</div>';
    };
    draw();
    $('#lvFilter').onchange = draw;
    view().onclick = lessonActions;
  });

  /* ---------- Lesson editor ---------- */
  function parseText(txt) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split('|').map((x) => x.trim());
      let zh = parts[0], sp = '';
      const m = /^([^:：]{1,16})[:：]\s*(.+)$/.exec(zh);
      if (m && HA.zh.hasHan(m[2])) { sp = m[1].trim(); zh = m[2].trim(); }
      return { sp, zh, vi: parts[1] || '', en: parts[2] || '' };
    }).filter((x) => x.zh);
  }
  function parseVocab(txt) {
    return txt.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 80).map((line) => {
      const [w, vi, en, ex] = line.split('|').map((x) => x.trim());
      return { w, p: HA.zh.pinyinOf(w), pos: '', vi: vi || '', en: en || '', hv: '', ex: ex ? [ex, ''] : null, syn: [], ant: [] };
    }).filter((v) => v.w && HA.zh.hasHan(v.w));
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
      const o = parts.slice(1);
      const a = o.findIndex((x) => x.startsWith('*'));
      return { type: 'mc', q: parts[0], qvi: '', o: o.map((x) => x.replace(/^\*/, '')), a: a < 0 ? 0 : a };
    }).filter((q) => q.q && (q.type === 'tf' || q.o.length >= 2));
  }
  const ser = {
    text: (L) => (L.text || []).map((x) => (x.sp ? x.sp + ': ' : '') + x.zh + (x.vi || x.en ? ' | ' + (x.vi || '') + (x.en ? ' | ' + x.en : '') : '')).join('\n'),
    vocab: (L) => (L.vocab || []).map((v) => [v.w, v.vi, v.en, v.ex ? v.ex[0] : ''].join(' | ').replace(/( \| )+$/, '')).join('\n'),
    grammar: (L) => (L.grammar || []).map((g) => [g.t.vi, g.f, g.ex.vi, g.examples.map((x) => x.zh + (x.vi ? '=' + x.vi : '')).join('; ')].join(' | ')).join('\n'),
    q: (L) => (L.questions || []).map((q) => (q.type === 'tf' ? q.q + ' | ' + (q.a ? 'Đ' : 'S') : q.q + ' | ' + q.o.map((o, i) => (i === q.a ? '*' : '') + o).join(' | '))).join('\n')
  };

  HA.route(/^\/editor(?:\/([^?]+))?(?:\?(.*))?$/, async function (id, query) {
    if (!S.user) { view().innerHTML = needLogin(); return; }
    const params = Object.fromEntries((query || '').split('&').filter(Boolean).map((kv) => kv.split('=').map(decodeURIComponent)));
    let L = { level: 1, emoji: '📘', kind: 'dialogue', title: {}, visibility: 'public', sourceType: 'self', author: S.user.name || '' };
    if (id) { try { L = (await HA.api.getLesson(id)) || L; } catch (e) { view().innerHTML = errBox(e); return; } }
    if (params.class) { L.visibility = 'class'; L.classId = params.class; }
    const canTeach = HA.canTeach(S.user);
    let classes = [];
    if (canTeach) { try { classes = (await HA.api.myClasses()).filter((c) => c.ownerUid === S.user.uid); } catch (e) {} }
    view().innerHTML =
      '<div class="page-head"><h1>✍️ ' + (id ? t('edit') : t('createLesson')) + '</h1><a class="btn ghost" href="#/community/mine">' + t('myLessons') + '</a></div>' +
      '<form class="card editor" id="ed">' +
      '<div class="grid2"><label class="fl">' + t('titleZh') + ' *<input class="input zh" name="tzh" maxlength="120" required value="' + esc(L.title.zh || '') + '"></label>' +
      '<label class="fl">' + t('title') + ' (VI)<input class="input" name="tvi" maxlength="160" value="' + esc(L.title.vi || '') + '"></label>' +
      '<label class="fl">' + t('title') + ' (EN)<input class="input" name="ten" maxlength="160" value="' + esc(L.title.en || '') + '"></label>' +
      '<div class="grid3"><label class="fl">' + t('level') + '<select class="input" name="level">' + HA.LEVELS.map((l) => '<option value="' + l.n + '"' + (l.n === +L.level ? ' selected' : '') + '>' + l.name + '</option>').join('') + '</select></label>' +
      '<label class="fl">' + t('kind') + '<select class="input" name="kind"><option value="dialogue"' + (L.kind === 'dialogue' ? ' selected' : '') + '>' + t('dialogue') + '</option><option value="passage"' + (L.kind === 'passage' ? ' selected' : '') + '>' + t('passage') + '</option></select></label>' +
      '<label class="fl">Emoji<input class="input" name="emoji" maxlength="4" value="' + esc(L.emoji || '📘') + '"></label></div></div>' +
      '<label class="fl">📖 ' + t('textLines') + ' *<small class="muted">' + t('textHelp') + '</small><textarea class="input zh" name="text" rows="8" maxlength="12000" required placeholder="A: 你好！| Xin chào! | Hello!\nB: 你好，你叫什么名字？| Chào bạn, bạn tên gì?">' + esc(ser.text(L)) + '</textarea></label>' +
      '<label class="fl">🔤 ' + t('tabVocab') + '<small class="muted">' + t('vocabHelp') + '</small><textarea class="input zh" name="vocab" rows="6" maxlength="8000" placeholder="学习 | học tập | to study | 我每天学习汉语。">' + esc(ser.vocab(L)) + '</textarea></label>' +
      '<label class="fl">🧩 ' + t('tabGrammar') + '<small class="muted">' + t('grammarHelp') + '</small><textarea class="input zh" name="grammar" rows="4" maxlength="6000" placeholder="Câu hỏi với 吗 | Câu + 吗？ | Thêm 吗 cuối câu để hỏi | 你好吗？=Bạn khỏe không?">' + esc(ser.grammar(L)) + '</textarea></label>' +
      '<label class="fl">❓ ' + t('tabQuestions') + '<small class="muted">' + t('questionHelp') + '</small><textarea class="input zh" name="questions" rows="5" maxlength="6000" placeholder="他叫什么名字？| *王明 | 李月 | 大卫\n他是学生。| Đ">' + esc(ser.q(L)) + '</textarea></label>' +
      '<div class="grid3"><label class="fl">' + t('author') + ' *<input class="input" name="author" maxlength="80" required value="' + esc(L.author || '') + '"></label>' +
      '<label class="fl">' + t('source') + '<select class="input" name="sourceType"><option value="self"' + (L.sourceType === 'self' ? ' selected' : '') + '>' + t('srcSelf') + '</option><option value="collected"' + (L.sourceType === 'collected' ? ' selected' : '') + '>' + t('srcCollected') + '</option><option value="cited"' + (L.sourceType === 'cited' ? ' selected' : '') + '>' + t('srcCited') + '</option></select></label>' +
      '<label class="fl">' + t('visibility') + '<select class="input" name="visibility"><option value="public"' + (L.visibility === 'public' ? ' selected' : '') + '>🌐 ' + t('visPublic') + '</option>' +
      (canTeach ? '<option value="class"' + (L.visibility === 'class' ? ' selected' : '') + '>🏫 ' + t('visClass') + '</option><option value="private"' + (L.visibility === 'private' ? ' selected' : '') + '>🔒 ' + t('visPrivate') + '</option>' : '') + '</select></label></div>' +
      (canTeach ? '<label class="fl" id="classPick"' + (L.visibility === 'class' ? '' : ' hidden') + '>' + t('className') + '<select class="input" name="classId">' + classes.map((c) => '<option value="' + esc(c.id) + '"' + (c.id === L.classId ? ' selected' : '') + '>' + esc(c.name) + ' (' + esc(c.code) + ')</option>').join('') + '</select></label>' : '<p class="tiny muted">🎓 ' + t('teacherLocked') + ' <a href="#/classes">' + t('teacherZone') + '</a></p>') +
      '<label class="fl">' + t('sourceRef') + '<input class="input" name="sourceRef" maxlength="300" value="' + esc(L.sourceRef || '') + '"></label>' +
      '<label class="fl row small"><input type="checkbox" name="pledge" required> <span>' + t('contentPledge') + ' (<a href="#/legal/copyright" target="_blank">' + t('navCopyright') + '</a>)</span></label>' +
      '<div class="row end"><button type="button" class="btn ghost" id="prev">👁 ' + t('preview') + '</button><button class="btn green lg">📤 ' + (id ? t('save') : t('publish')) + '</button></div></form><div id="prevBox"></div>';
    const form = $('#ed');
    form.visibility.onchange = () => { const cp = $('#classPick'); if (cp) cp.hidden = form.visibility.value !== 'class'; };
    const collect = () => {
      const f = form;
      return {
        title: { zh: f.tzh.value.trim(), vi: f.tvi.value.trim(), en: f.ten.value.trim() }, level: +f.level.value, kind: f.kind.value, emoji: f.emoji.value.trim() || '📘',
        desc: { vi: '', en: '' }, text: parseText(f.text.value), vocab: parseVocab(f.vocab.value), grammar: parseGrammar(f.grammar.value), questions: parseQuestions(f.questions.value),
        author: f.author.value.trim(), sourceType: f.sourceType.value, sourceRef: f.sourceRef.value.trim(), visibility: f.visibility.value, classId: f.visibility.value === 'class' && f.classId ? f.classId.value : null
      };
    };
    $('#prev').onclick = () => {
      const d = collect();
      $('#prevBox').innerHTML = '<div class="card"><h3>👁 ' + t('preview') + '</h3><h2 class="zh">' + HA.R(d.title.zh) + '</h2><div class="reading">' + d.text.map((x) => '<div class="line"><b>' + esc(x.sp) + '</b> <span class="zh lg">' + HA.R(x.zh) + '</span><div class="trans">' + esc(HA.tr(x)) + '</div></div>').join('') + '</div>' +
        '<div class="vocab-grid">' + d.vocab.map((v) => '<div class="vcard"><div class="v-zh zh">' + esc(v.w) + '</div><div class="v-py">' + esc(v.p) + '</div><div>' + esc(HA.ui.meaningOf(v)) + '</div></div>').join('') + '</div>' +
        '<p>' + d.questions.length + ' ' + t('questionsOf') + ' · ' + d.grammar.length + ' ' + t('tabGrammar') + '</p></div>';
      $('#prevBox').scrollIntoView({ behavior: 'smooth' });
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const d = collect();
      if (!d.text.length) return HA.ui.toast(t('textLines') + ' ✗', 'bad');
      if (d.visibility === 'class' && !d.classId) return HA.ui.toast(t('className') + ' ✗', 'bad');
      if (id) d.id = id;
      try {
        const newId = await HA.api.saveLesson(d);
        HA.ui.toast(t('published'), 'good');
        location.hash = '#/ulesson/' + newId;
      } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
  });

  /* ---------- Classes ---------- */
  HA.route(/^\/classes$/, async function () {
    if (!S.user) { view().innerHTML = '<div class="page-head"><h1>🏫 ' + t('navClasses') + '</h1></div>' + needLogin(); return; }
    const role = HA.roleOf(S.user);
    view().innerHTML = '<div class="page-head"><h1>🏫 ' + t('navClasses') + '</h1></div>' +
      '<div class="grid2"><div class="card"><h3>🔑 ' + t('join') + '</h3><p class="muted">' + t('classIntro') + '</p><div class="row"><input class="input code" id="code" maxlength="8" placeholder="ABC123"><button class="btn green" id="joinBtn">' + t('join') + '</button></div></div>' +
      '<div class="card teacher-zone"><h3>🎓 ' + t('teacherZone') + '</h3>' +
      (HA.canTeach(S.user)
        ? '<div class="row"><input class="input" id="cname" maxlength="80" placeholder="' + t('className') + '"><button class="btn purple" id="mkClass">+ ' + t('createClass') + '</button></div><p class="small"><a href="#/editor">✍️ ' + t('createLesson') + '</a></p>'
        : '<p class="muted">' + t('teacherLocked') + '</p><div class="row"><input class="input code" id="tkey" maxlength="20" placeholder="HT-XXXX-XXXX"><button class="btn purple" id="unlock">' + t('unlock') + '</button></div><p class="small"><a href="mailto:' + HA.config.contact.email + '?subject=' + encodeURIComponent('[Hanry Academy] Xin key giáo viên / Teacher key request') + '&body=' + encodeURIComponent('Email: ' + S.user.email + '\nHọ tên / Name:\nTrường / School:\nGiới thiệu / About:') + '">📧 ' + t('requestKey') + '</a></p>') +
      '</div></div><h2 class="sec-title">' + t('myClasses') + '</h2><div id="cl" class="class-list"><div class="loading">' + t('loading') + '</div></div>';
    const load = async () => {
      try {
        const cls = await HA.api.myClasses();
        $('#cl').innerHTML = cls.length ? cls.map((c) => '<a class="class-card" href="#/class/' + esc(c.id) + '"><span class="cc-icon">🏫</span><div><b>' + esc(c.name) + '</b><small>' + (c.ownerUid === S.user.uid ? '🎓 ' + t('teacher') + ' · ' + t('classCode') + ': <code>' + esc(c.code) + '</code>' : '👨‍🏫 ' + esc(c.ownerName || '')) + ' · ' + (c.members || []).length + ' ' + t('members') + '</small></div></a>').join('') : '<div class="empty card">' + t('noClasses') + '</div>';
      } catch (e) { $('#cl').innerHTML = errBox(e); }
    };
    load();
    view().onclick = async (e) => {
      try {
        if (e.target.id === 'joinBtn') { const c = $('#code').value.trim(); if (!c) return; const r = await HA.api.joinClass(c); HA.ui.toast(t('joined'), 'good'); location.hash = '#/class/' + r.id; }
        if (e.target.id === 'mkClass') { const n = $('#cname').value.trim(); if (!n) return; const c = await HA.api.createClass(n); HA.ui.toast(t('classCode') + ': ' + c.code, 'good'); load(); $('#cname').value = ''; }
        if (e.target.id === 'unlock') { const k = $('#tkey').value.trim(); if (!k) return; await HA.api.redeemKey(k); HA.ui.toast(t('teacherUnlocked'), 'good'); HA.refresh(); }
      } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
    void role;
  });

  HA.route(/^\/class\/([^/]+)$/, async function (id) {
    if (!S.user) { view().innerHTML = needLogin(); return; }
    view().innerHTML = '<div class="loading">' + t('loading') + '</div>';
    try {
      const c = (await HA.api.myClasses()).find((x) => x.id === id);
      if (!c) throw new Error(t('classNotFound'));
      const owner = c.ownerUid === S.user.uid;
      const lessons = await HA.api.listLessons({ classId: id });
      view().innerHTML = '<a class="back" href="#/classes">← ' + t('navClasses') + '</a><div class="card class-hero"><span class="cc-icon big">🏫</span><div><h1>' + esc(c.name) + '</h1><p>👨‍🏫 ' + esc(c.ownerName || '') + ' · ' + (c.members || []).length + ' ' + t('members') + '</p>' +
        (owner ? '<p>' + t('classCode') + ': <code class="big-code">' + esc(c.code) + '</code> <button class="btn sm ghost" id="copyCode">' + t('copy') + '</button></p>' : '') + '</div></div>' +
        '<div class="row wrap mb">' + (owner ? '<a class="btn green" href="#/editor?class=' + esc(id) + '">✍️ ' + t('createLesson') + '</a><button class="btn red" id="delClass">' + t('delete') + '</button>' : '<button class="btn ghost" id="leave">🚪 ' + t('leaveClass') + '</button>') + '</div>' +
        '<div class="lc-list">' + (lessons.length ? lessons.map(lessonCard).join('') : '<div class="empty card">📭 —</div>') + '</div>';
      view().onclick = async (e) => {
        if (e.target.id === 'copyCode') { navigator.clipboard && navigator.clipboard.writeText(c.code); HA.ui.toast(t('copied'), 'good'); }
        if (e.target.id === 'delClass' && (await HA.ui.confirm(t('confirmDelete')))) { await HA.api.deleteClass(id); location.hash = '#/classes'; }
        if (e.target.id === 'leave' && (await HA.ui.confirm(t('confirmDelete')))) { await HA.api.leaveClass(id); location.hash = '#/classes'; }
        lessonActions(e);
      };
    } catch (e) { view().innerHTML = errBox(e); }
  });

  /* ---------- Licensed books ---------- */
  const embedUrl = (u) => { const m = /drive\.google\.com\/file\/d\/([^/]+)/.exec(u || ''); return m ? 'https://drive.google.com/file/d/' + m[1] + '/preview' : null; };
  HA.route(/^\/books(?:\/([^/]+))?$/, async function (bookId) {
    const head = '<div class="page-head"><div><h1>📕 ' + t('navBooks') + '</h1><p class="muted">' + t('booksLocked') + '</p></div></div>';
    if (!S.user) { view().innerHTML = head + needLogin(); return; }
    view().innerHTML = head + '<div class="loading">' + t('loading') + '</div>';
    let ok = false;
    try { ok = await HA.api.hasBookAccess(); } catch (e) {}
    if (!ok) {
      view().innerHTML = head + '<div class="empty card"><div class="emoji-big">🔒</div><p>' + t('booksNoAccess') + '</p><p class="small">' + esc(S.user.email) + '</p><a class="btn blue" href="mailto:' + HA.config.contact.email + '?subject=' + encodeURIComponent('[Hanry Academy] Book access request') + '&body=' + encodeURIComponent('Gmail: ' + S.user.email) + '">📧 ' + t('navContact') + '</a></div><p class="center"><a href="#/learn">→ ' + t('navLearn') + '</a></p>';
      return;
    }
    let books = [];
    try { books = await HA.api.listBooks(); } catch (e) { view().innerHTML = head + errBox(e); return; }
    if (bookId) {
      const b = books.find((x) => x.id === bookId);
      if (!b) { view().innerHTML = head + '<div class="empty card">404</div>'; return; }
      const em = embedUrl(b.url);
      view().innerHTML = '<a class="back" href="#/books">← ' + t('navBooks') + '</a><div class="card"><h1>' + esc(b.cover || '📕') + ' ' + esc(b.title) + '</h1><p>✍️ ' + esc(b.author || '') + '</p><p>' + esc(b.desc || '') + '</p>' +
        (b.url ? '<a class="btn blue" href="' + esc(b.url) + '" target="_blank" rel="noopener">📖 ' + t('openBook') + '</a>' : '') + '<p class="tiny muted">© ' + esc(b.author || '') + ' — ' + t('navCopyright') + '</p></div>' +
        (em ? '<div class="book-embed"><iframe src="' + esc(em) + '" allow="autoplay" loading="lazy" referrerpolicy="no-referrer"></iframe></div>' : '') +
        (b.content ? '<div class="card reading psg">' + b.content.split('\n').filter(Boolean).map((p) => '<p class="line"><span class="zh lg">' + HA.R(p) + '</span></p>').join('') + '</div>' : '');
      return;
    }
    view().innerHTML = head + '<div class="book-grid">' + (books.length ? books.map((b) => '<a class="book" href="#/books/' + esc(b.id) + '"><span class="book-cover">' + esc(b.cover || '📕') + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.author || '') + '</small></a>').join('') : '<div class="empty card">' + t('noBooks') + '</div>') + '</div>';
  });

  /* ---------- Admin ---------- */
  HA.route(/^\/admin$/, async function () {
    if (!HA.isAdmin(S.user)) { view().innerHTML = '<div class="empty card">🛡️ 403</div>'; return; }
    view().innerHTML = '<div class="page-head"><h1>🛡️ ' + t('navAdmin') + '</h1></div>' + (HA.api.mode === 'local' ? '<div class="note bad">⚠️ ' + t('insecureLocal') + '</div>' : '<div class="note good">✅ Firebase</div>') +
      '<div class="admin-grid">' +
      '<div class="card"><h3>📧 ' + t('adminBookAccess') + '</h3><div class="row"><input class="input" id="accEmail" type="email" placeholder="hocvien@gmail.com"><button class="btn green" id="accAdd">' + t('add') + '</button></div><ul class="plain" id="accList"></ul></div>' +
      '<div class="card"><h3>🔑 ' + t('adminKeys') + '</h3><div class="row"><input class="input" id="keyNote" placeholder="' + t('description') + ' (Cô Lan – THPT A)"><button class="btn purple" id="keyGen">' + t('generate') + '</button></div><ul class="plain" id="keyList"></ul></div>' +
      '<div class="card wide"><h3>📕 ' + t('adminBooks') + '</h3><p class="note">💡 ' + t('bookNote') + '</p><form id="bookForm" class="grid2"><input class="input" name="title" required maxlength="160" placeholder="' + t('bookTitle') + '"><input class="input" name="author" maxlength="120" placeholder="' + t('author') + ' / NXB"><input class="input" name="url" maxlength="500" placeholder="' + t('bookLink') + '"><input class="input" name="cover" maxlength="4" placeholder="📕"><textarea class="input" name="desc" rows="2" maxlength="1000" placeholder="' + t('description') + '"></textarea><textarea class="input zh" name="content" rows="2" maxlength="20000" placeholder="(Tuỳ chọn) Nội dung văn bản"></textarea><input type="hidden" name="id"><button class="btn green">' + t('save') + '</button></form><div id="bookList" class="lc-list"></div></div>' +
      '<div class="card wide"><h3>🚩 ' + t('adminReports') + '</h3><div id="repList"></div></div>' +
      '<div class="card wide"><h3>📝 ' + t('adminLessons') + '</h3><div id="modList" class="lc-list"></div></div></div>';
    const A = HA.api;
    const loadAcc = async () => { const l = await A.listAccess(); $('#accList').innerHTML = l.map((e) => '<li><span>' + esc(e) + '</span><button class="icon-btn" data-rm-acc="' + esc(e) + '">✕</button></li>').join('') || '<li class="muted">—</li>'; };
    const loadKeys = async () => { const l = await A.listKeys(); $('#keyList').innerHTML = l.sort((a, b) => (b.created || 0) - (a.created || 0)).map((k) => '<li><code>' + esc(k.key) + '</code> <small>' + esc(k.note || '') + '</small> ' + (k.usedBy ? '<span class="badge">' + t('used') + ': ' + esc(k.usedEmail || k.usedBy) + '</span>' : '<span class="badge good">' + t('unused') + '</span> <button class="icon-btn" data-copy="' + esc(k.key) + '">📋</button>') + '<button class="icon-btn" data-rm-key="' + esc(k.key) + '">✕</button></li>').join('') || '<li class="muted">—</li>'; };
    let books = [];
    const loadBooks = async () => { books = await A.listBooks(); $('#bookList').innerHTML = books.map((b) => '<div class="lcard"><div class="lc-main"><span class="lc-emoji">' + esc(b.cover || '📕') + '</span><div><h3>' + esc(b.title) + '</h3><p class="small">' + esc(b.author || '') + ' · ' + esc(b.url || '').slice(0, 60) + '</p></div></div><div class="lc-act"><button class="icon-btn" data-edit-book="' + esc(b.id) + '">✏️</button><button class="icon-btn" data-rm-book="' + esc(b.id) + '">🗑</button></div></div>').join(''); };
    const loadReps = async () => { const l = await A.listReports(); $('#repList').innerHTML = l.length ? '<table class="tbl"><tr><th>📅</th><th>' + t('fbType') + '</th><th>Email</th><th>' + t('fbMessage') + '</th><th></th></tr>' + l.map((r) => '<tr><td>' + fmtDate(r.created) + '</td><td>' + esc(r.type) + '<br><small>' + esc(r.ref || '') + '</small></td><td>' + esc(r.email || '') + '</td><td>' + esc(r.message || '') + (r.link ? '<br><a href="' + esc(r.link) + '" target="_blank" rel="noopener nofollow">' + esc(r.link).slice(0, 60) + '</a>' : '') + '</td><td><button class="icon-btn" data-rm-rep="' + esc(r.id) + '">✕</button></td></tr>').join('') + '</table>' : '<p class="muted">—</p>'; };
    const loadMod = async () => { const l = await A.listLessons({}); $('#modList').innerHTML = l.map(lessonCard).join('') || '<p class="muted">—</p>'; };
    const safe = (fn) => fn().catch((e) => HA.ui.toast(e.message, 'bad'));
    [loadAcc, loadKeys, loadBooks, loadReps, loadMod].forEach(safe);
    view().onclick = async (e) => {
      const d = e.target.dataset;
      try {
        if (e.target.id === 'accAdd') { const em = $('#accEmail').value.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return HA.ui.toast(t('invalidEmail'), 'bad'); await A.addAccess(em); $('#accEmail').value = ''; loadAcc(); }
        if (d.rmAcc && (await HA.ui.confirm(t('confirmDelete')))) { await A.removeAccess(d.rmAcc); loadAcc(); }
        if (e.target.id === 'keyGen') { const k = await A.createKey($('#keyNote').value.trim()); HA.ui.toast(k.key, 'good'); $('#keyNote').value = ''; loadKeys(); }
        if (d.copy) { navigator.clipboard && navigator.clipboard.writeText(d.copy); HA.ui.toast(t('copied'), 'good'); }
        if (d.rmKey && (await HA.ui.confirm(t('confirmDelete')))) { await A.deleteKey(d.rmKey); loadKeys(); }
        if (d.rmBook && (await HA.ui.confirm(t('confirmDelete')))) { await A.deleteBook(d.rmBook); loadBooks(); }
        if (d.editBook) { const b = books.find((x) => x.id === d.editBook); const f = $('#bookForm'); ['title', 'author', 'url', 'cover', 'desc', 'content', 'id'].forEach((k) => (f[k].value = b[k] || '')); f.scrollIntoView({ behavior: 'smooth' }); }
        if (d.rmRep) { await A.deleteReport(d.rmRep); loadReps(); }
        if (d.delLesson || d.report) lessonActions(e);
      } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
    $('#bookForm').onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target; const b = {}; ['title', 'author', 'url', 'cover', 'desc', 'content'].forEach((k) => (b[k] = f[k].value.trim()));
      if (b.url && !/^https:\/\//.test(b.url)) return HA.ui.toast('URL https:// ✗', 'bad');
      if (f.id.value) b.id = f.id.value;
      try { await A.saveBook(b); f.reset(); f.id.value = ''; loadBooks(); HA.ui.toast(t('save') + ' ✓', 'good'); } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
  });

  /* ---------- Feedback ---------- */
  HA.route(/^\/feedback(?:\/(\w+))?$/, function (type) {
    const types = [['bug', t('fbBug')], ['idea', t('fbIdea')], ['content', t('fbContent')], ['copyright', t('fbCopyright')], ['other', t('fbOther')]];
    view().innerHTML = '<div class="page-head"><div><h1>💬 ' + t('navFeedback') + '</h1><p class="muted">' + t('feedbackIntro') + '</p></div></div>' +
      '<form class="card narrow" id="fb"><label class="fl">' + t('fbType') + '<select class="input" name="type">' + types.map(([k, n]) => '<option value="' + k + '"' + (k === type ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
      (S.user ? '' : '<label class="fl">' + t('email') + '<input class="input" name="email" type="email" maxlength="120"></label>') +
      '<label class="fl">' + t('fbMessage') + ' *<textarea class="input" name="message" rows="6" maxlength="3000" required></textarea></label>' +
      '<label class="fl">' + t('fbLink') + '<input class="input" name="link" maxlength="500" value="' + esc(type === 'content' ? location.href : '') + '"></label>' +
      (type === 'copyright' ? '<p class="note small">' + t('navCopyright') + ': <a href="#/legal/copyright">#/legal/copyright</a></p>' : '') +
      '<div class="row end"><a class="btn ghost" id="fbMail" href="#">📧 ' + t('fbMail') + '</a><button class="btn green">' + t('send') + '</button></div></form>';
    const f = $('#fb');
    const mailHref = () => 'mailto:' + HA.config.contact.email + '?subject=' + encodeURIComponent('[Hanry Academy] ' + f.type.options[f.type.selectedIndex].text) + '&body=' + encodeURIComponent(f.message.value + '\n\n' + f.link.value);
    $('#fbMail').onclick = (e) => { e.currentTarget.href = mailHref(); };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const last = HA.LS.get('ha_fb_last', 0);
      if (Date.now() - last < 60000) return HA.ui.toast('⏳ 60s', 'bad');
      const r = { type: f.type.value, message: f.message.value.trim().slice(0, 3000), link: f.link.value.trim().slice(0, 500), page: location.hash };
      if (f.email) r.email = f.email.value.trim();
      try { await HA.api.submitReport(r); HA.LS.set('ha_fb_last', Date.now()); f.reset(); HA.ui.toast(t('fbSent'), 'good'); }
      catch (err) { HA.ui.toast(err.message, 'bad'); location.href = mailHref(); }
    };
  });

  /* ---------- Contact ---------- */
  HA.route(/^\/contact$/, function () {
    const c = HA.config.contact;
    view().innerHTML = '<div class="page-head"><div><h1>✉️ ' + t('navContact') + '</h1><p class="muted">' + t('contactIntro') + '</p></div></div>' +
      '<div class="contact-grid"><a class="contact-card" href="mailto:' + c.email + '" style="--c:#ff4b4b"><span>📧</span><b>Email</b><small>' + c.email + '</small></a>' +
      c.phones.map((p, i) => '<a class="contact-card" href="tel:' + p.tel + '" style="--c:' + (i ? '#1cb0f6' : '#58cc02') + '"><span>' + (i ? '🇹🇼' : '🇻🇳') + '</span><b>' + esc(p.label) + ' · ' + t('phone') + '</b><small>' + esc(p.value) + '</small></a>').join('') +
      '<a class="contact-card" href="#/feedback" style="--c:#ce82ff"><span>💬</span><b>' + t('navFeedback') + '</b><small>' + t('fbIdea') + ' · ' + t('fbBug') + '</small></a></div>' +
      '<div class="card"><h3>🕘</h3><p>' + (S.settings.lang === 'vi' ? 'Thời gian phản hồi: trong vòng 1–3 ngày làm việc. Khiếu nại bản quyền và báo cáo nội dung vi phạm được ưu tiên xử lý trong 24–72 giờ.' : 'Response time: within 1–3 business days. Copyright complaints and content reports are prioritized within 24–72 hours.') + '</p></div>';
  });
})();
