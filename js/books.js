/* Sách (licensed books): catalogue, unlock (free or paid), chapter reader.
   Book doc: {title, author, cover, desc, url, content, visibility: 'admin'|'access'|'public', price}
   Chapters (books/{id}/chapters/{cid}, imported as JSON by the admin):
     {id, n, title, blocks: [
       {t:'h', text}                                   heading
       {t:'text', paras:[{zh, vi}]}                    reading text
       {t:'dialog', lines:[{sp, zh, py, vi}]}          dialogue
       {t:'vocab', items:[{w, p, pos, vi}]}            vocabulary
       {t:'grammar', title, desc, examples:[{zh, py, vi}]}
       {t:'ex', title, items:[{q, a}]}                 exercises (answer hidden)
       {t:'note', text} ]} */
(function () {
  const { esc, $ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const Z = HA.zh;
  const view = () => $('#view');
  const M = (x) => (Z.hasHan(x || '') ? HA.R(x, { ruby: false }) : esc(x || ''));
  const notFound = '<div class="empty"><h2>404</h2><a class="btn green" href="#/">' + t('navHome') + '</a></div>';
  const priceTag = (b) => (b.price ? Number(b.price).toLocaleString('vi-VN') + ' đ' : t('free'));
  const canRead = async (b) => HA.isAdmin(S.user) || ((b.visibility || 'access') === 'access' ? await HA.api.hasBookAccess() : await HA.api.isUnlocked(b.id));

  async function getBooks() { try { return await HA.api.listBooks(); } catch (e) { return []; } }

  /* ---------- Catalogue ---------- */
  HA.route(/^\/books$/, async function () {
    if (!S.user) { view().innerHTML = '<div class="card empty"><p>📕 ' + t('booksLogin') + '</p><button class="btn blue" onclick="HA.openLogin()">' + t('login') + '</button></div>'; return; }
    view().innerHTML = '<div class="loading"></div>';
    const books = await getBooks();
    view().innerHTML = '<div class="page-head"><div><h1>📕 ' + t('navBooks') + '</h1><p class="muted">' + t('booksIntro') + '</p></div></div>' +
      '<div class="book-grid">' + (books.length ? books.map((b) => '<a class="book" href="#/books/' + esc(b.id) + '"><span class="book-cover">' + esc(b.cover || '📕') + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.author || '') + '</small><span class="chip sm">' + (b.visibility === 'admin' ? '🛡️ ' + t('visAdmin') : priceTag(b)) + '</span></a>').join('') : '<div class="empty card">' + t('noBooks') + '</div>') + '</div>';
  });

  /* ---------- Book page: unlock + chapters ---------- */
  HA.route(/^\/books\/([^/]+)$/, async function (bookId) {
    if (!S.user) { view().innerHTML = notFound; return; }
    view().innerHTML = '<div class="loading"></div>';
    const b = (await getBooks()).find((x) => x.id === bookId);
    if (!b) { view().innerHTML = notFound; return; }
    const ok = await canRead(b);
    let chapters = [];
    if (ok) { try { chapters = await HA.api.getChapters(b.id); } catch (e) {} }
    const em = /drive\.google\.com\/file\/d\/([^/]+)/.exec(b.url || '');
    view().innerHTML = '<a class="back" href="#/books">← ' + t('navBooks') + '</a>' +
      '<div class="card book-head"><span class="book-cover big">' + esc(b.cover || '📕') + '</span><div><h1>' + esc(b.title) + '</h1><p>✍️ ' + esc(b.author || '') + '</p><p>' + esc(b.desc || '') + '</p>' +
      (ok ? '<p class="good small">🔓 ' + t('unlocked') + '</p>' + (b.url ? '<a class="btn blue" href="' + esc(b.url) + '" target="_blank" rel="noopener">📖 ' + t('openBook') + '</a>' : '')
        : (b.price ? '<p><b>' + priceTag(b) + '</b></p><p class="small muted">' + t('buyHint') + '</p><a class="btn green" href="#/contact">✉️ ' + t('buyBook') + '</a>'
          : '<button class="btn green" id="unlock">🔓 ' + t('unlockFree') + '</button>')) +
      '<p class="tiny muted">© ' + esc(b.author || '') + ' — ' + t('navCopyright') + '</p></div></div>' +
      (ok && chapters.length ? '<div class="unit-list">' + chapters.map((c) => '<a class="unit-item ' + ((S.data.bookRead || {})[b.id + '/' + c.id] ? 'done' : '') + '" href="#/books/' + esc(b.id) + '/' + esc(c.id) + '"><span class="ui-n">' + esc(c.n != null ? c.n : '•') + '</span><span class="ui-text"><b>' + M(c.title) + '</b></span><span>›</span></a>').join('') + '</div>' : '') +
      (ok && em ? '<div class="book-embed"><iframe src="https://drive.google.com/file/d/' + esc(em[1]) + '/preview" loading="lazy" referrerpolicy="no-referrer"></iframe></div>' : '') +
      (ok && b.content ? '<div class="card reading psg">' + b.content.split('\n').filter(Boolean).map((p) => '<p class="line"><span class="zh lg">' + HA.R(p) + '</span></p>').join('') + '</div>' : '');
    const u = $('#unlock');
    if (u) u.onclick = async () => { try { await HA.api.unlockBook(b.id); HA.ui.toast(t('unlocked'), 'good'); HA.dispatch(true); } catch (e) { HA.ui.toast(e.message, 'bad'); } };
  });

  /* ---------- Chapter reader ---------- */
  HA.route(/^\/books\/([^/]+)\/([^/]+)$/, async function (bookId, cid) {
    if (!S.user) { view().innerHTML = notFound; return; }
    view().innerHTML = '<div class="loading"></div>';
    const b = (await getBooks()).find((x) => x.id === bookId);
    if (!b || !(await canRead(b))) { view().innerHTML = notFound; return; }
    let c = null, list = [];
    try { [c, list] = await Promise.all([HA.api.getChapter(bookId, cid), HA.api.getChapters(bookId)]); } catch (e) {}
    if (!c) { view().innerHTML = notFound; return; }
    const i = list.findIndex((x) => x.id === cid);
    const showPy = S.settings.bookPy !== false, showVi = S.settings.bookVi !== false;
    const line = (zh, py, vi) => '<div class="bl"><div><span class="zh lg">' + HA.R(zh, { ruby: false }) + '</span> <button class="icon-btn sm" data-say="' + esc(zh) + '">🔊</button></div>' + (py ? '<div class="py small bpy">' + esc(py) + '</div>' : '') + (vi ? '<div class="muted bvi">' + esc(vi) + '</div>' : '') + '</div>';
    const block = (k) => {
      switch (k.t) {
        case 'h': return '<h2 class="bh">' + M(k.text) + '</h2>';
        case 'note': return '<div class="note">' + M(k.text) + '</div>';
        case 'text': return '<div class="card">' + (k.paras || []).map((p) => line(p.zh, p.py, p.vi)).join('') + '</div>';
        case 'dialog': return '<div class="card dialog">' + (k.lines || []).map((l) => '<div class="dl"><b class="sp">' + M(l.sp || '') + '</b>' + line(l.zh, l.py, l.vi) + '</div>').join('') + '</div>';
        case 'vocab': return '<div class="vw-grid">' + (k.items || []).map((v) => '<div class="card vw"><div class="vw-top"><span class="zh vw-w">' + esc(Z.disp(v.w)) + '</span><span class="py">' + esc(v.p || '') + '</span>' + (v.pos ? '<span class="chip sm">' + esc(v.pos) + '</span>' : '') + '<span class="vw-act"><button class="icon-btn" data-say="' + esc(v.w) + '">🔊</button><button class="icon-btn" data-nb="' + esc(JSON.stringify([v.w, v.p, v.vi])) + '">' + (HA.nb.has(v.w) ? '⭐' : '☆') + '</button></span></div><div class="vw-m"><b>' + esc(v.vi || '') + '</b></div></div>').join('') + '</div>';
        case 'grammar': return '<div class="card"><h3>' + M(k.title) + '</h3>' + (k.desc ? '<p>' + M(k.desc) + '</p>' : '') + (k.examples || []).map((e) => line(e.zh, e.py, e.vi)).join('') + '</div>';
        case 'ex': return '<div class="card"><h3>✏️ ' + M(k.title || t('gExercises')) + '</h3><ol class="gp-exer">' + (k.items || []).map((x) => '<li><div>' + M(x.q) + '</div>' + (x.a ? '<details><summary>' + t('gShowAnswer') + '</summary><div class="gp-ans">' + M(x.a) + '</div></details>' : '') + '</li>').join('') + '</ol></div>';
        default: return '';
      }
    };
    view().innerHTML = '<a class="back" href="#/books/' + esc(bookId) + '">← ' + esc(b.title) + '</a>' +
      '<div class="page-head"><div><h1>' + M(c.title) + '</h1></div><div class="row gap wrap"><button class="btn sm ' + (showPy ? 'blue' : 'ghost') + '" id="tPy">pīnyīn</button><button class="btn sm ' + (showVi ? 'blue' : 'ghost') + '" id="tVi">' + t('translation') + '</button></div></div>' +
      '<div class="book-body' + (showPy ? '' : ' no-py') + (showVi ? '' : ' no-vi') + '">' + (c.blocks || []).map(block).join('') + '</div>' +
      '<div class="row center mt wrap">' + (list[i - 1] ? '<a class="btn ghost" href="#/books/' + esc(bookId) + '/' + esc(list[i - 1].id) + '">← ' + M(list[i - 1].title) + '</a>' : '') + (list[i + 1] ? '<a class="btn ghost" href="#/books/' + esc(bookId) + '/' + esc(list[i + 1].id) + '">' + M(list[i + 1].title) + ' →</a>' : '') + '</div>' +
      '<p class="tiny muted mt">© ' + esc(b.author || '') + '</p>';
    S.data.bookRead = S.data.bookRead || {}; S.data.bookRead[bookId + '/' + cid] = Date.now(); HA.saveData();
    $('#tPy').onclick = () => { S.settings.bookPy = !showPy; HA.saveSettings(); HA.dispatch(true); };
    $('#tVi').onclick = () => { S.settings.bookVi = !showVi; HA.saveSettings(); HA.dispatch(true); };
    view().onclick = (e) => {
      const sp = e.target.closest('[data-say]'); if (sp) { Z.speak(sp.dataset.say); return; }
      const nb = e.target.closest('[data-nb]');
      if (nb) { const [w, p, vi] = JSON.parse(nb.dataset.nb); const on = HA.nb.toggle({ w, p, vi, lang: 'zh' }); nb.textContent = on ? '⭐' : '☆'; HA.ui.toast(t(on ? 'added' : 'removed'), on ? 'good' : ''); }
    };
  });
})();
