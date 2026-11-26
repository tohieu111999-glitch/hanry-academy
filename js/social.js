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

  function reportModal(type, ref) {
    const m = HA.ui.modal('<h3>🚩 ' + t('report') + '</h3><textarea class="input" id="rMsg" rows="4" maxlength="2000" placeholder="' + t('fbMessage') + '"></textarea><button class="btn red full" id="rSend">' + t('send') + '</button>', { cls: 'small' });
    $('#rSend', m).onclick = async () => {
      const msg = $('#rMsg', m).value.trim(); if (!msg) return;
      try { await HA.api.submitReport({ type, ref, message: msg.slice(0, 2000), page: location.hash }); HA.ui.closeModal(); HA.ui.toast(t('reported'), 'good'); } catch (err) { HA.ui.toast(err.message, 'bad'); }
    };
  }
  HA.reportModal = reportModal;

  /* ---------- Classes ---------- */
  HA.route(/^\/classes$/, async function () {
    if (!S.user) { view().innerHTML = '<div class="page-head"><h1>🏫 ' + t('navClasses') + '</h1></div>' + needLogin(); return; }
    const role = HA.roleOf(S.user);
    view().innerHTML = '<div class="page-head"><h1>🏫 ' + t('navClasses') + '</h1></div>' +
      '<div class="grid2"><div class="card"><h3>🔑 ' + t('join') + '</h3><p class="muted">' + t('classIntro') + '</p><div class="row"><input class="input code" id="code" maxlength="8" placeholder="ABC123"><button class="btn green" id="joinBtn">' + t('join') + '</button></div></div>' +
      '<div class="card teacher-zone"><h3>🎓 ' + t('teacherZone') + '</h3>' +
      (HA.canTeach(S.user)
        ? '<div class="row"><input class="input" id="cname" maxlength="80" placeholder="' + t('className') + '"><button class="btn purple" id="mkClass">+ ' + t('createClass') + '</button></div><p class="small"><a href="#/compose">✍️ ' + t('compose') + '</a></p>'
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
        '<div class="row wrap mb">' + (owner ? '<a class="btn green" href="#/compose?class=' + esc(id) + '">✍️ ' + t('compose') + '</a><button class="btn red" id="delClass">' + t('delete') + '</button>' : '<button class="btn ghost" id="leave">🚪 ' + t('leaveClass') + '</button>') + '</div>' +
        '<div class="feed">' + (lessons.length ? lessons.map((P) => HA.feed.card(Object.assign(P, { user: true }))).join('') : '<div class="empty card">📭 ' + t('noPosts') + '</div>') + '</div>';
      HA.feed.fillReactions(view(), lessons);
      const act = HA.feed.actions(view(), lessons);
      view().onclick = async (e) => {
        if (e.target.id === 'copyCode') { navigator.clipboard && navigator.clipboard.writeText(c.code); HA.ui.toast(t('copied'), 'good'); }
        if (e.target.id === 'delClass' && (await HA.ui.confirm(t('confirmDelete')))) { await HA.api.deleteClass(id); location.hash = '#/classes'; }
        if (e.target.id === 'leave' && (await HA.ui.confirm(t('confirmDelete')))) { await HA.api.leaveClass(id); location.hash = '#/classes'; }
        act(e);
      };
    } catch (e) { view().innerHTML = errBox(e); }
  });

  /* ---------- Licensed books ---------- */
  const embedUrl = (u) => { const m = /drive\.google\.com\/file\/d\/([^/]+)/.exec(u || ''); return m ? 'https://drive.google.com/file/d/' + m[1] + '/preview' : null; };
  HA.route(/^\/books(?:\/([^/]+))?$/, async function (bookId) {
    const head = '<div class="page-head"><div><h1>📕 ' + t('navBooks') + '</h1><p class="muted">' + t('booksLocked') + '</p></div></div>';
    // The licensed area is invisible to anyone without access: same page as an unknown address
    const notFound = '<div class="empty"><h2>404</h2><a class="btn green" href="#/">' + t('navHome') + '</a></div>';
    if (!S.user) { view().innerHTML = notFound; return; }
    view().innerHTML = '<div class="loading"></div>';
    let ok = false;
    try { ok = await HA.api.hasBookAccess(); } catch (e) {}
    if (!ok) { view().innerHTML = notFound; return; }
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
      '<div class="card"><h3>🔒 ' + t('adminExamLocks') + '</h3><p class="small muted">' + t('adminExamLocksD') + '</p><ul class="plain" id="lockList"></ul></div>' +
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
    let modList = [];
    const loadMod = async () => { modList = (await A.listLessons({})).map((P) => Object.assign(P, { user: true })); $('#modList').innerHTML = modList.map((P) => HA.feed.card(P)).join('') || '<p class="muted">—</p>'; };
    const loadLocks = async () => { const l = await HA.examLocks(true); $('#lockList').innerHTML = Object.keys(HA.examPacks || {}).map((k) => '<li><span>' + esc(t(HA.examPacks[k])) + '</span><button class="btn sm ' + (l.includes(k) ? 'red' : 'ghost') + '" data-lock="' + esc(k) + '" data-on="' + (l.includes(k) ? 1 : 0) + '">' + (l.includes(k) ? '🔒 ' + t('lockedW') : '🔓 ' + t('openW')) + '</button></li>').join(''); };
    const safe = (fn) => fn().catch((e) => HA.ui.toast(e.message, 'bad'));
    [loadAcc, loadKeys, loadBooks, loadReps, loadMod, loadLocks].forEach(safe);
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
        if (d.lock) { await A.setExamLock(d.lock, d.on !== '1'); loadLocks(); }
        if (e.target.closest('[data-del-post],[data-report],[data-like],[data-play]')) HA.feed.actions(view(), modList)(e);
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
