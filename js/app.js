/* App shell, router and core pages (home, learn, lesson, notebook, profile) */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');
  HA.pages = {};

  /* ---------- Shell ---------- */
  const NAV = [
    ['#/', '🏠', 'navHome'], ['#/learn', '🗺️', 'navLearn'], ['#/games', '🎮', 'navGames'], ['#/dict', '🔎', 'navDict'],
    ['#/notebook', '⭐', 'navNotebook'], ['#/community', '🌐', 'navCommunity'], ['#/classes', '🏫', 'navClasses'], ['#/books', '📕', 'navBooks']
  ];
  HA.renderShell = function () {
    document.documentElement.lang = { vi: 'vi', en: 'en', zhs: 'zh-Hans', zht: 'zh-Hant', ja: 'ja' }[S.settings.lang];
    document.documentElement.dataset.theme = S.settings.dark ? 'dark' : 'light';
    const u = S.user;
    const route = location.hash.split('/').slice(0, 2).join('/') || '#/';
    const isActive = (h) => (h === '#/' ? route === '#/' || route === '#' || route === '' : route === h);
    const navItems = NAV.concat(HA.isAdmin(u) ? [['#/admin', '🛡️', 'navAdmin']] : []);
    $('#side').innerHTML =
      '<a class="logo" href="#/"><span class="logo-mark">汉</span><span class="logo-text">Hanry<b>Academy</b></span></a>' +
      '<nav>' + navItems.map(([h, i, k]) => '<a href="' + h + '" class="' + (isActive(h) ? 'on' : '') + '"><span class="ni">' + i + '</span><span>' + t(k) + '</span></a>').join('') + '</nav>' +
      '<div class="side-foot"><a href="#/feedback">💬 ' + t('navFeedback') + '</a><a href="#/contact">✉️ ' + t('navContact') + '</a></div>';
    const streak = HA.streakNow();
    const todayXp = S.data.days[HA.today()] || 0;
    $('#top').innerHTML =
      '<a class="logo m-only" href="#/"><span class="logo-mark">汉</span></a>' +
      '<div class="stats"><span class="stat fire" title="' + t('streak') + '">🔥 ' + streak + '</span><span class="stat gem" title="' + t('xp') + '">💎 ' + S.data.xp + '</span><span class="stat goal" title="' + t('todayXp') + '">🎯 ' + todayXp + '/' + S.settings.dailyGoal + '</span></div>' +
      '<div class="top-right">' +
      '<select id="langSel" class="sel" aria-label="' + t('uiLang') + '">' + HA.LANGS.map((l) => '<option value="' + l.code + '"' + (l.code === S.settings.lang ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>').join('') + '</select>' +
      '<button class="seg-btn" id="scriptBtn" title="' + t('script') + '">' + (S.settings.script === 't' ? '繁' : '简') + '</button>' +
      '<button class="seg-btn" id="phonBtn" title="' + t('phonetic') + '">' + (S.settings.phon === 'zhuyin' ? 'ㄅ' : 'pīn') + '</button>' +
      '<button class="icon-btn" id="settingsBtn" title="' + t('settings') + '">⚙️</button>' +
      (u ? '<a class="avatar" href="#/profile" title="' + esc(u.email) + '">' + (u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : esc((u.name || u.email)[0].toUpperCase())) + '</a>'
        : '<button class="btn sm blue" id="loginBtn">' + t('login') + '</button>') +
      '</div>';
    $('#bottom').innerHTML = [['#/', '🏠', 'navHome'], ['#/learn', '🗺️', 'navLearn'], ['#/games', '🎮', 'navGames'], ['#/dict', '🔎', 'navDict'], ['#/notebook', '⭐', 'navNotebook']]
      .map(([h, i, k]) => '<a href="' + h + '" class="' + (isActive(h) ? 'on' : '') + '"><span>' + i + '</span><small>' + t(k) + '</small></a>').join('') +
      '<a href="#" id="moreBtn"><span>☰</span><small>' + t('more') + '</small></a>';
    $('#foot').innerHTML =
      '<div class="foot-grid">' +
      '<div><div class="logo"><span class="logo-mark">汉</span><span class="logo-text">Hanry<b>Academy</b></span></div><p class="muted">' + t('tagline') + '</p>' +
      '<p>✉️ <a href="mailto:' + HA.config.contact.email + '">' + HA.config.contact.email + '</a><br>' + HA.config.contact.phones.map((p) => '📞 <a href="tel:' + p.tel + '">' + p.value + '</a>').join('<br>') + '</p></div>' +
      '<div><h4>' + t('navLearn') + '</h4><a href="#/learn">' + t('navLearn') + '</a><a href="#/games">' + t('navGames') + '</a><a href="#/dict">' + t('navDict') + '</a><a href="#/community">' + t('navCommunity') + '</a><a href="#/classes">' + t('navClasses') + '</a></div>' +
      '<div><h4>' + t('navTerms') + '</h4><a href="#/legal/terms">' + t('navTerms') + '</a><a href="#/legal/privacy">' + t('navPrivacy') + '</a><a href="#/legal/copyright">' + t('navCopyright') + '</a><a href="#/legal/cookies">' + t('navCookies') + '</a></div>' +
      '<div><h4>' + t('navContact') + '</h4><a href="#/contact">' + t('navContact') + '</a><a href="#/feedback">' + t('navFeedback') + '</a><a href="#/feedback/copyright">' + t('fbCopyright') + '</a></div>' +
      '</div><p class="tiny muted">© ' + new Date().getFullYear() + ' Hanry Academy. ' + t('footerRights') + ' ' + t('dictCredit') + '</p>';
  };

  function bindShell() {
    document.addEventListener('change', (e) => {
      if (e.target.id === 'langSel') { S.settings.lang = e.target.value; if (e.target.value === 'zht') S.settings.script = 't'; if (e.target.value === 'zhs') S.settings.script = 's'; HA.saveSettings(); HA.ensureDict(); HA.refresh(); }
    });
    document.addEventListener('click', (e) => {
      const id = e.target.closest('button,a') && e.target.closest('button,a').id;
      if (id === 'scriptBtn') { S.settings.script = S.settings.script === 't' ? 's' : 't'; HA.saveSettings(); HA.refresh(); }
      if (id === 'phonBtn') { S.settings.phon = S.settings.phon === 'zhuyin' ? 'pinyin' : 'zhuyin'; HA.saveSettings(); HA.refresh(); }
      if (id === 'settingsBtn') HA.openSettings();
      if (id === 'loginBtn') HA.openLogin();
      if (id === 'moreBtn') { e.preventDefault(); HA.openMore(); }
    });
    document.addEventListener('ha:stats', () => HA.renderShell());
  }

  HA.openMore = function () {
    const items = [['#/community', '🌐', 'navCommunity'], ['#/classes', '🏫', 'navClasses'], ['#/books', '📕', 'navBooks'], ['#/profile', '👤', 'navProfile']]
      .concat(HA.isAdmin(S.user) ? [['#/admin', '🛡️', 'navAdmin']] : [])
      .concat([['#/feedback', '💬', 'navFeedback'], ['#/contact', '✉️', 'navContact'], ['#/legal/terms', '📜', 'navTerms'], ['#/legal/privacy', '🔒', 'navPrivacy'], ['#/legal/copyright', '©️', 'navCopyright']]);
    HA.ui.modal('<h3>' + t('more') + '</h3><div class="more-grid">' + items.map(([h, i, k]) => '<a href="' + h + '" onclick="HA.ui.closeModal()"><span>' + i + '</span>' + t(k) + '</a>').join('') + '</div>');
  };

  HA.openSettings = function () {
    const s = S.settings;
    const m = HA.ui.modal(
      '<h3>⚙️ ' + t('settings') + '</h3>' +
      '<label class="fl">' + t('uiLang') + '<select id="s-lang" class="input">' + HA.LANGS.map((l) => '<option value="' + l.code + '"' + (l.code === s.lang ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>').join('') + '</select></label>' +
      '<div class="fl">' + t('script') + '<div class="seg" data-k="script"><button data-v="s" class="' + (s.script === 's' ? 'on' : '') + '">' + t('simplified') + ' 简</button><button data-v="t" class="' + (s.script === 't' ? 'on' : '') + '">' + t('traditional') + ' 繁</button></div></div>' +
      '<div class="fl">' + t('phonetic') + '<div class="seg" data-k="phon"><button data-v="pinyin" class="' + (s.phon === 'pinyin' ? 'on' : '') + '">' + t('pinyin') + ' (hàn)</button><button data-v="zhuyin" class="' + (s.phon === 'zhuyin' ? 'on' : '') + '">' + t('zhuyin') + ' (ㄏㄢˋ)</button></div></div>' +
      '<label class="fl row"><input type="checkbox" id="s-ruby"' + (s.showRuby ? ' checked' : '') + '> ' + t('showPhon') + '</label>' +
      '<label class="fl row"><input type="checkbox" id="s-dark"' + (s.dark ? ' checked' : '') + '> ' + t('darkMode') + '</label>' +
      '<label class="fl">' + t('speechRate') + ' <input type="range" id="s-rate" min="0.5" max="1.3" step="0.05" value="' + s.rate + '"></label>' +
      '<label class="fl">' + t('dailyGoal') + '<select id="s-goal" class="input">' + [10, 20, 30, 50, 100].map((g) => '<option' + (g === s.dailyGoal ? ' selected' : '') + '>' + g + '</option>').join('') + '</select></label>' +
      '<button class="btn green full" onclick="HA.ui.closeModal()">' + t('save') + '</button>'
    );
    m.addEventListener('click', (e) => {
      const b = e.target.closest('.seg button'); if (!b) return;
      const k = b.parentElement.dataset.k; s[k] = b.dataset.v; HA.saveSettings();
      $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', x === b)); HA.refresh();
    });
    m.addEventListener('change', (e) => {
      const id = e.target.id;
      if (id === 's-lang') { s.lang = e.target.value; HA.ensureDict(); }
      if (id === 's-ruby') s.showRuby = e.target.checked;
      if (id === 's-dark') s.dark = e.target.checked;
      if (id === 's-rate') { s.rate = +e.target.value; HA.zh.speak('你好，欢迎！'); }
      if (id === 's-goal') s.dailyGoal = +e.target.value;
      HA.saveSettings(); HA.refresh();
    });
  };

  HA.openLogin = function () {
    const local = HA.api.mode === 'local';
    const m = HA.ui.modal(
      '<div class="center"><div class="logo big"><span class="logo-mark">汉</span></div><h3>' + t('login') + ' Hanry Academy</h3></div>' +
      (local
        ? '<p class="note">' + t('localModeNote') + '</p>' +
          '<label class="fl">' + t('email') + '<input class="input" id="l-email" type="email" placeholder="ban@gmail.com" autocomplete="email"></label>' +
          '<label class="fl">' + t('displayName') + '<input class="input" id="l-name" maxlength="40"></label>' +
          '<label class="fl">' + t('password') + '<input class="input" id="l-pw" type="password" autocomplete="current-password"></label>'
        : '') +
      '<label class="fl row small"><input type="checkbox" id="l-agree"> <span>' + t('agreeTerms').replace(t('navTerms'), '<a href="#/legal/terms" target="_blank">' + t('navTerms') + '</a>') + ' (<a href="#/legal/terms" onclick="HA.ui.closeModal()">' + t('navTerms') + '</a>, <a href="#/legal/privacy" onclick="HA.ui.closeModal()">' + t('navPrivacy') + '</a>)</span></label>' +
      '<p class="tiny muted">' + t('ageNote') + '</p>' +
      '<button class="btn ' + (local ? 'green' : 'white') + ' full" id="l-go">' + (local ? t('login') : '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt=""> ' + t('loginGoogle')) + '</button>'
    , { cls: 'small' });
    $('#l-go', m).onclick = async () => {
      if (!$('#l-agree', m).checked) return HA.ui.toast(t('mustAgree'), 'bad');
      try {
        if (local) {
          const email = $('#l-email', m).value.trim(), pw = $('#l-pw', m).value;
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return HA.ui.toast(t('invalidEmail'), 'bad');
          if (pw.length < 6) return HA.ui.toast(t('password') + ' ≥ 6', 'bad');
          await HA.api.signIn({ email, name: $('#l-name', m).value.trim(), password: pw });
        } else await HA.api.signIn();
        LS_set_consent();
        HA.ui.closeModal();
      } catch (err) { HA.ui.toast(err.message || String(err), 'bad'); }
    };
  };
  function LS_set_consent() { HA.LS.set('ha_consent', { terms: HA.config.legalUpdated, at: Date.now() }); }

  /* ---------- Router ---------- */
  const routes = [];
  HA.route = (re, fn) => routes.push([re, fn]);
  HA.refresh = function () { HA.zh.clearCache(); HA.renderShell(); HA.dispatch(true); };
  let lastHash = null;
  HA.dispatch = function (keepScroll) {
    const hash = location.hash || '#/';
    const path = hash.slice(1) || '/';
    HA.ui.hideTip();
    if (hash !== lastHash && !keepScroll) window.scrollTo(0, 0);
    lastHash = hash;
    for (const [re, fn] of routes) {
      const m = path.match(re);
      if (m) {
        const v = view();
        v.onclick = null; v.oninput = null; v.onchange = null; v.onsubmit = null; v.onkeydown = null;
        try { fn(...m.slice(1).map((x) => (x ? decodeURIComponent(x) : x))); } catch (e) { console.error(e); v.innerHTML = '<div class="card">Error: ' + esc(e.message) + '</div>'; }
        return;
      }
    }
    view().innerHTML = '<div class="empty"><h2>404</h2><a class="btn green" href="#/">' + t('navHome') + '</a></div>';
  };
  window.addEventListener('hashchange', () => {
    document.querySelectorAll('.practice-overlay').forEach((o) => o.remove());
    document.body.classList.remove('noscroll');
    if (window.speechSynthesis) speechSynthesis.cancel();
    HA.ui.closeModal();
    HA.renderShell(); HA.dispatch();
  });

  HA.R = (text, opts) => HA.zh.render(text, opts);
  HA.levelOf = (n) => HA.LEVELS.find((l) => l.n === n) || HA.LEVELS[0];
  HA.lessonLabel = (L) => {
    const idx = HA.lessons.filter((x) => x.level === L.level).indexOf(L) + 1;
    return idx > 0 ? t('lesson') + ' ' + idx + t('lessonSuffix') : '';
  };

  /* ---------- Home ---------- */
  HA.route(/^\/?$/, function () {
    const d = S.data;
    const next = HA.lessons.find((L) => !HA.lessonProgress(L.id).done) || HA.lessons[0];
    const dayIdx = Math.floor(Date.now() / 864e5);
    const allV = HA.lessons.flatMap((L) => L.vocab.map((v) => Object.assign({ lesson: L.id }, v)));
    const wod = allV[dayIdx % allV.length];
    const todayXp = d.days[HA.today()] || 0;
    const pct = Math.min(100, Math.round((todayXp / S.settings.dailyGoal) * 100));
    const done = HA.lessons.filter((L) => HA.lessonProgress(L.id).done).length;
    view().innerHTML =
      '<section class="hero">' +
      '<div class="hero-text"><h1>' + t('heroTitle') + '</h1><p>' + t('heroSub') + '</p>' +
      '<div class="row wrap"><a class="btn green lg" href="#/lesson/' + next.id + '">▶ ' + (done ? t('continueLearning') : t('start')) + '</a><a class="btn white lg" href="#/dict">🔎 ' + t('navDict') + '</a></div></div>' +
      '<div class="hero-art" aria-hidden="true"><div class="bubble b1 zh">你好！</div><div class="bubble b2 zh">学中文</div><div class="bubble b3 zh">加油！</div><div class="mascot">🐼</div></div>' +
      '</section>' +
      '<section class="grid3">' +
      '<div class="card stat-card"><div class="ring" style="--p:' + pct + '"><span>' + pct + '%</span></div><div><b>' + t('todayXp') + '</b><div class="big">' + todayXp + ' / ' + S.settings.dailyGoal + ' XP</div></div></div>' +
      '<div class="card stat-card"><div class="emoji-big">🔥</div><div><b>' + t('streak') + '</b><div class="big">' + HA.streakNow() + '</div></div></div>' +
      '<div class="card stat-card"><div class="emoji-big">📚</div><div><b>' + t('statLessons') + '</b><div class="big">' + done + ' / ' + HA.lessons.length + '</div></div></div>' +
      '</section>' +
      '<section class="grid2">' +
      '<a class="card next-card" href="#/lesson/' + next.id + '" style="--c:' + HA.levelOf(next.level).color + '"><div class="tag">' + t('continueLearning') + ' · ' + HA.levelOf(next.level).name + '</div><div class="next-emoji">' + next.emoji + '</div><h3 class="zh">' + esc(HA.zh.disp(next.title.zh)) + '</h3><p>' + esc(HA.tr(next.title)) + '</p></a>' +
      '<div class="card wod"><div class="tag">' + t('wordOfDay') + '</div><div class="wod-zh zh">' + HA.R(wod.w, { ruby: false }) + '</div><div class="muted">' + esc(HA.zh.phon(wod.p)) + '</div><p>' + esc(HA.ui.meaningOf(wod)) + '</p>' +
      (wod.ex ? '<div class="zh small">' + HA.R(wod.ex[0]) + '</div>' : '') + '<div class="row"><button class="btn sm blue" data-speak="' + esc(wod.w) + '">🔊</button><button class="btn sm yellow" data-note="' + esc(wod.w) + '">⭐ ' + t('addNote') + '</button></div></div>' +
      '</section>' +
      '<section class="features">' +
      [['👆', 'featureTap', 'featureTapD', '#/lesson/1-1'], ['🎮', 'featureGame', 'featureGameD', '#/games'], ['📖', 'featureDict', 'featureDictD', '#/dict'], ['🏫', 'featureClass', 'featureClassD', '#/classes']]
        .map(([i, a, b, h]) => '<a class="feature" href="' + h + '"><span>' + i + '</span><b>' + t(a) + '</b><small>' + t(b) + '</small></a>').join('') +
      '</section>' +
      '<h2 class="sec-title">' + t('navLearn') + '</h2><section class="level-cards">' +
      HA.LEVELS.map((lv) => {
        const ls = HA.lessons.filter((L) => L.level === lv.n);
        const dn = ls.filter((L) => HA.lessonProgress(L.id).done).length;
        return '<a class="level-card" href="#/learn/' + lv.n + '" style="--c:' + lv.color + '"><span class="lv-icon">' + lv.icon + '</span><b>' + lv.name + '</b><small>' + esc(HA.tr(lv)) + '</small><div class="bar"><i style="width:' + (ls.length ? (dn / ls.length) * 100 : 0) + '%"></i></div><small>' + dn + '/' + ls.length + ' ' + t('lessons') + '</small></a>';
      }).join('') + '</section>';
    view().onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak);
      const nb = e.target.closest('[data-note]');
      if (nb) { const ok = HA.nb.add(HA.ui.noteItem(nb.dataset.note)); HA.ui.toast(ok ? t('added') : t('inNote'), 'good'); }
    };
  });

  /* ---------- Learn path ---------- */
  HA.route(/^\/learn(?:\/(\d))?$/, function (lvSel) {
    const levels = lvSel ? HA.LEVELS.filter((l) => l.n === +lvSel) : HA.LEVELS;
    const firstUndone = HA.lessons.find((L) => !HA.lessonProgress(L.id).done);
    view().innerHTML =
      '<div class="level-tabs">' + '<a href="#/learn" class="' + (!lvSel ? 'on' : '') + '">' + t('all') + '</a>' + HA.LEVELS.map((l) => '<a href="#/learn/' + l.n + '" class="' + (+lvSel === l.n ? 'on' : '') + '" style="--c:' + l.color + '">' + l.icon + ' ' + l.name + '</a>').join('') + '</div>' +
      levels.map((lv) => {
        const ls = HA.lessons.filter((L) => L.level === lv.n);
        return '<section class="unit" style="--c:' + lv.color + '"><div class="unit-head"><div><small>' + t('level') + ' ' + lv.n + '</small><h2>' + lv.icon + ' ' + lv.name + ' · ' + esc(HA.tr(lv)) + '</h2></div><a class="btn white sm" href="#/games?lv=' + lv.n + '">🎮 ' + t('review') + '</a></div>' +
          '<div class="path">' + ls.map((L, i) => {
            const pr = HA.lessonProgress(L.id);
            const parts = Object.keys(pr.parts || {}).length;
            const cls = pr.done ? 'done' : L === firstUndone ? 'current' : parts ? 'started' : '';
            const off = [0, 60, 90, 60, 0, -60, -90, -60][i % 8];
            return '<div class="node-wrap" style="--x:' + off + 'px"><a class="node ' + cls + '" href="#/lesson/' + L.id + '" title="' + esc(HA.tr(L.title)) + '"><span>' + (pr.done ? '👑' : L.emoji) + '</span>' + (parts ? '<svg class="prog" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" style="stroke-dasharray:' + (parts / 5) * 100.5 + ' 100.5"/></svg>' : '') + '</a>' +
              (L === firstUndone ? '<div class="start-pop">' + t('start') + '</div>' : '') +
              '<div class="node-label"><small>' + HA.lessonLabel(L) + '</small><b class="zh">' + esc(HA.zh.disp(L.title.zh)) + '</b><span>' + esc(HA.tr(L.title)) + '</span></div></div>';
          }).join('') + '</div></section>';
      }).join('');
  });

  /* ---------- Lesson ---------- */
  const TABS = [['read', '📖', 'tabRead'], ['vocab', '🔤', 'tabVocab'], ['grammar', '🧩', 'tabGrammar'], ['quiz', '❓', 'tabQuestions'], ['practice', '🏋️', 'tabPractice']];
  HA.route(/^\/lesson\/([^/]+)(?:\/(\w+))?$/, function (id, tab) {
    const L = HA.lessonById[id];
    if (!L) { view().innerHTML = '<div class="empty">404</div>'; return; }
    HA.renderLesson(L, tab || 'read');
  });
  HA.route(/^\/ulesson\/([^/]+)(?:\/(\w+))?$/, async function (id, tab) {
    view().innerHTML = '<div class="loading">' + t('loading') + '</div>';
    try {
      const L = await HA.api.getLesson(id);
      if (!L) throw new Error('404');
      L.vocab.forEach((v) => HA.zh.addCurated(v, L.id));
      HA.renderLesson(Object.assign({ id, user: true }, L), tab || 'read');
    } catch (e) { view().innerHTML = '<div class="empty">🔒 ' + esc(e.message) + '</div>'; }
  });

  HA.renderLesson = function (L, tab) {
    const base = (L.user ? '#/ulesson/' : '#/lesson/') + L.id;
    const lv = HA.levelOf(L.level);
    const pr = HA.lessonProgress(L.id);
    const idx = HA.lessons.indexOf(L);
    const nextL = idx >= 0 ? HA.lessons[idx + 1] : null;
    const srcName = { self: t('srcSelf'), collected: t('srcCollected'), cited: t('srcCited') };
    view().innerHTML =
      '<div class="lesson-head" style="--c:' + lv.color + '">' +
      '<a class="back" href="' + (L.user ? '#/community' : '#/learn/' + L.level) + '">← ' + t('back') + '</a>' +
      '<div class="lh-main"><span class="lh-emoji">' + L.emoji + '</span><div><small>' + lv.name + (L.user ? '' : ' · ' + HA.lessonLabel(L)) + ' · ' + (L.kind === 'dialogue' ? t('dialogue') : t('passage')) + '</small>' +
      '<h1 class="zh">' + HA.R(L.title.zh) + '</h1><p>' + esc(HA.tr(L.title)) + '</p>' +
      (L.user ? '<p class="small">✍️ ' + t('author') + ': <b>' + esc(L.author || '') + '</b> · ' + t('source') + ': ' + esc(srcName[L.sourceType] || '') + (L.sourceRef ? ' — ' + esc(L.sourceRef) : '') + '</p>' : '<p class="small">✍️ ' + t('author') + ': Hanry Academy · ' + t('srcSelf') + '</p>') +
      '</div></div></div>' +
      '<div class="tabs">' + TABS.map(([k, i, n]) => '<a href="' + base + '/' + k + '" class="' + (tab === k ? 'on' : '') + '">' + (pr.parts && pr.parts[k] != null ? '✅' : i) + ' <span>' + t(n) + '</span></a>').join('') + '</div>' +
      '<div id="tabBody"></div>';
    const body = $('#tabBody');
    const goNext = (cur) => {
      const i = TABS.findIndex((x) => x[0] === cur);
      if (i < TABS.length - 1) return '<a class="btn green lg" data-mark="' + cur + '" href="' + base + '/' + TABS[i + 1][0] + '">' + t('continue') + ' → ' + t(TABS[i + 1][2]) + '</a>';
      return nextL ? '<a class="btn green lg" href="#/lesson/' + nextL.id + '">' + t('next') + ': ' + esc(HA.tr(nextL.title)) + ' →</a>' : '';
    };
    const tip = '<p class="hint">💡 ' + t('tapHint') + '</p>';

    if (tab === 'read') {
      body.innerHTML = tip + readToolbar() + '<div class="reading card ' + (L.kind === 'dialogue' ? 'dlg' : 'psg') + '">' + readingHTML(L) + '</div><div class="center mt">' + goNext('read') + '</div>';
    } else if (tab === 'vocab') {
      body.innerHTML = tip + '<div class="row wrap mb"><button class="btn yellow" id="addAll">⭐ ' + t('addNote') + ' (' + L.vocab.length + ')</button><a class="btn blue" href="#/games?lesson=' + L.id + '">🎮 ' + t('navGames') + '</a></div>' +
        '<div class="vocab-grid">' + L.vocab.map((v, i) => vocabCard(v, i)).join('') + '</div><div class="center mt">' + goNext('vocab') + '</div>';
    } else if (tab === 'grammar') {
      body.innerHTML = tip + (L.grammar.length ? L.grammar.map((g, i) => '<div class="card grammar"><div class="g-num">' + (i + 1) + '</div><h3>' + esc(HA.tr(g.t)) + '</h3>' +
        (g.f ? '<div class="formula zh">' + HA.R(g.f, { ruby: false }) + '</div>' : '') + '<p>' + esc(HA.tr(g.ex)) + '</p>' +
        '<ul class="examples">' + g.examples.map((x) => '<li><button class="icon-btn" data-speak="' + esc(x.zh) + '">🔊</button><div><div class="zh lg">' + HA.R(x.zh) + '</div><div class="muted">' + esc(HA.tr(x)) + '</div></div></li>').join('') + '</ul></div>').join('') : '<div class="empty">—</div>') +
        '<div class="center mt">' + goNext('grammar') + '</div>';
    } else if (tab === 'quiz') {
      body.innerHTML = '<div class="split">' +
        '<div class="card split-text"><div class="row between"><h3>📖 ' + t('tabRead') + '</h3><button class="btn sm ghost" id="toggleText">' + t('viewText') + '</button></div><div id="qText" class="reading ' + (L.kind === 'dialogue' ? 'dlg' : 'psg') + ' collapsible">' + readingHTML(L, true) + '</div></div>' +
        '<div class="card split-q"><h3>❓ ' + t('tabQuestions') + '</h3><p class="muted">' + t('readFirst') + '</p><ol class="quiz">' +
        L.questions.map((q, i) => '<li class="q" data-i="' + i + '"><div class="q-text zh">' + HA.R(q.q) + '</div>' + (S.settings.lang === 'vi' && q.qvi ? '<div class="muted small q-trans">' + esc(q.qvi) + '</div>' : '') +
          '<div class="opts">' + (q.type === 'tf'
            ? '<label class="opt"><input type="radio" name="q' + i + '" value="1"> ✔ ' + t('trueW') + ' <span class="zh">对</span></label><label class="opt"><input type="radio" name="q' + i + '" value="0"> ✘ ' + t('falseW') + ' <span class="zh">错</span></label>'
            : q.o.map((o, k) => '<label class="opt"><input type="radio" name="q' + i + '" value="' + k + '"> <b>' + 'ABCD'[k] + '.</b> <span class="zh">' + HA.R(o) + '</span></label>').join('')) + '</div></li>').join('') +
        '</ol><div id="quizRes"></div><button class="btn green lg full" id="submitQuiz">' + t('submit') + '</button></div></div>' +
        '<div class="center mt" id="quizNext" hidden>' + goNext('quiz') + '</div>';
    } else if (tab === 'practice') {
      const best = pr.parts && pr.parts.practice;
      body.innerHTML = '<div class="card practice-start"><div class="ps-icon">🏋️</div><h2>' + t('tabPractice') + '</h2><p>' +
        [t('exMeaning'), t('exHanzi'), t('exListen'), t('exMatch'), t('exOrder'), t('exFill'), t('exType')].map((x) => '<span class="chip">' + x + '</span>').join(' ') + '</p>' +
        (best != null ? '<p>' + t('best') + ': <b>' + best + '%</b></p>' : '') +
        '<button class="btn green lg" id="startPractice">▶ ' + t('start') + '</button></div><div class="center mt">' + goNext('practice') + '</div>';
    }

    body.onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) { HA.zh.speak(sp.dataset.speak); return; }
      const mk = e.target.closest('[data-mark]'); if (mk) { HA.markPart(L.id, mk.dataset.mark); if (!pr.parts[mk.dataset.mark]) HA.addXP(5); }
      const nb = e.target.closest('[data-note]');
      if (nb) { const ok = HA.nb.toggle(HA.ui.noteItem(nb.dataset.note)); nb.classList.toggle('on', ok); nb.textContent = ok ? '★' : '☆'; HA.ui.toast(ok ? t('added') : t('removed'), ok ? 'good' : ''); }
      const wr = e.target.closest('[data-write]'); if (wr) HA.games.writeModal(wr.dataset.write);
      if (e.target.id === 'addAll') { let n = 0; L.vocab.forEach((v) => { if (HA.nb.add({ w: v.w, p: v.p, vi: v.vi, en: v.en })) n++; }); HA.ui.toast(t('added') + ' (+' + n + ')', 'good'); HA.markPart(L.id, 'vocab'); HA.renderLesson(L, 'vocab'); }
      if (e.target.id === 'playAll') playAll(L);
      if (e.target.id === 'toggleTrans') { S.settings.showTrans = !S.settings.showTrans; HA.saveSettings(); HA.renderLesson(L, tab); }
      if (e.target.id === 'toggleRuby') { S.settings.showRuby = !S.settings.showRuby; HA.saveSettings(); HA.zh.clearCache(); HA.renderLesson(L, tab); }
      if (e.target.id === 'toggleText') $('#qText').classList.toggle('open');
      if (e.target.id === 'startPractice') HA.practice.start(L, (score) => { HA.markPart(L.id, 'practice', score); HA.renderLesson(L, 'practice'); });
      if (e.target.id === 'submitQuiz') {
        let ok = 0;
        L.questions.forEach((q, i) => {
          const li = $('.q[data-i="' + i + '"]', body);
          const sel = $('input[name="q' + i + '"]:checked', li);
          const correct = q.type === 'tf' ? (q.a ? '1' : '0') : String(q.a);
          $$('.opt', li).forEach((o) => { const v = $('input', o).value; o.classList.toggle('right', v === correct); o.classList.toggle('wrong', sel && sel.value === v && v !== correct); });
          if (sel && sel.value === correct) ok++;
        });
        const score = Math.round((ok / L.questions.length) * 100);
        $('#quizRes').innerHTML = '<div class="result ' + (score >= 60 ? 'good' : 'bad') + '">' + t('score') + ': <b>' + ok + '/' + L.questions.length + '</b> (' + score + '%) ' + (score === 100 ? '🎉' : score >= 60 ? '👍' : '💪') + '</div>';
        $('#submitQuiz').textContent = t('retry');
        $('#submitQuiz').id = 'retryQuiz';
        $('#quizNext').hidden = false;
        const first = !pr.parts.quiz;
        HA.markPart(L.id, 'quiz', score);
        if (first) HA.addXP(Math.round(score / 10));
        $('#qText').classList.add('open');
      } else if (e.target.id === 'retryQuiz') HA.renderLesson(L, 'quiz');
    };
  };

  function readToolbar() {
    return '<div class="toolbar"><button class="btn sm blue" id="playAll">▶ ' + t('playAll') + '</button>' +
      '<button class="btn sm ' + (S.settings.showRuby ? 'purple' : 'ghost') + '" id="toggleRuby">' + (S.settings.phon === 'zhuyin' ? 'ㄅㄆ' : 'pīnyīn') + '</button>' +
      '<button class="btn sm ' + (S.settings.showTrans ? 'orange' : 'ghost') + '" id="toggleTrans">' + (S.settings.showTrans ? t('hideTrans') : t('showTrans')) + '</button></div>';
  }
  function readingHTML(L, compact) {
    const showT = S.settings.showTrans && !compact;
    const speakers = [...new Set(L.text.map((x) => x.sp).filter(Boolean))];
    const colors = ['#1cb0f6', '#ff9600', '#ce82ff', '#58cc02', '#ff4b4b'];
    return L.text.map((x, i) => {
      const trans = HA.tr(x);
      const spk = x.sp ? '<div class="spk" style="--c:' + colors[speakers.indexOf(x.sp) % 5] + '"><span class="av">' + esc(HA.zh.disp(x.sp)[0]) + '</span><span class="zh">' + HA.R(x.sp, { ruby: false, tip: false }) + '</span></div>' : '';
      return '<div class="line ' + (x.sp && speakers.indexOf(x.sp) % 2 ? 'right' : '') + '" data-i="' + i + '">' + spk +
        '<div class="bubble-line"><div class="zh lg">' + HA.R(x.zh) + '</div>' + (showT && trans ? '<div class="trans">' + esc(trans) + '</div>' : '') + '</div>' +
        '<button class="icon-btn" data-speak="' + esc(x.zh) + '" aria-label="play">🔊</button></div>';
    }).join('');
  }
  function playAll(L) {
    if (!window.speechSynthesis) return HA.ui.toast(t('noTts'));
    let i = 0;
    const lines = $$('.reading .line');
    const next = () => {
      lines.forEach((l) => l.classList.remove('playing'));
      if (i >= L.text.length) return;
      const el = lines[i]; if (el) { el.classList.add('playing'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      const u = new SpeechSynthesisUtterance(L.text[i].zh);
      const vs = speechSynthesis.getVoices();
      const v = vs.find((x) => /^zh/i.test(x.lang.replace('_', '-')) && (S.settings.script === 't' ? /TW|HK/i.test(x.lang) : /CN/i.test(x.lang))) || vs.find((x) => /^zh|cmn/i.test(x.lang));
      if (v) u.voice = v; u.lang = v ? v.lang : 'zh-CN'; u.rate = S.settings.rate;
      u.onend = () => { i++; setTimeout(next, 350); };
      speechSynthesis.speak(u);
    };
    speechSynthesis.cancel(); next();
  }
  function vocabCard(v, i) {
    const inNb = HA.nb.has(v.w);
    return '<div class="vcard" style="--d:' + i * 40 + 'ms">' +
      '<div class="v-top"><div class="v-zh zh">' + HA.R(v.w, { ruby: false }) + '</div><div class="v-btns"><button class="icon-btn" data-speak="' + esc(v.w) + '">🔊</button><button class="icon-btn star ' + (inNb ? 'on' : '') + '" data-note="' + esc(v.w) + '">' + (inNb ? '★' : '☆') + '</button><button class="icon-btn" data-write="' + esc(v.w) + '" title="' + t('gameWrite') + '">✍️</button></div></div>' +
      '<div class="v-py">' + esc(HA.zh.phon(v.p)) + (S.settings.lang === 'vi' && v.hv ? ' · <span class="hv">' + esc(v.hv.toUpperCase()) + '</span>' : '') + '</div>' +
      '<div class="v-mean">' + (v.pos ? '<em class="pos">' + esc(HA.ui.posLabel(v.pos)) + '</em> ' : '') + esc(HA.ui.meaningOf(v)) + '</div>' +
      (v.ex ? '<div class="v-ex"><div class="zh">' + HA.R(v.ex[0]) + '</div>' + (S.settings.lang === 'vi' ? '<div class="muted small">' + esc(v.ex[1]) + '</div>' : '') + '</div>' : '') +
      (v.syn.length || v.ant.length ? '<div class="v-rel">' + (v.syn.length ? '<span class="small">≈ ' + v.syn.map((s) => '<a class="chip zh" href="#/dict/' + encodeURIComponent(s) + '">' + esc(HA.zh.disp(s)) + '</a>').join('') + '</span>' : '') + (v.ant.length ? '<span class="small"> ≠ ' + v.ant.map((s) => '<a class="chip red zh" href="#/dict/' + encodeURIComponent(s) + '">' + esc(HA.zh.disp(s)) + '</a>').join('') + '</span>' : '') + '</div>' : '') +
      '</div>';
  }

  /* ---------- Notebook ---------- */
  HA.route(/^\/notebook$/, function () {
    const list = HA.nb.list();
    const due = HA.nb.due().length;
    const mastered = list.filter((x) => x.box >= 4).length;
    view().innerHTML =
      '<div class="page-head"><h1>⭐ ' + t('navNotebook') + '</h1><div class="row wrap"><a class="btn green" href="#/games/flash?src=nb">🃏 ' + t('review') + ' (' + due + ')</a><a class="btn blue" href="#/games?src=nb">🎮 ' + t('navGames') + '</a></div></div>' +
      '<div class="grid3"><div class="card stat-mini"><b>' + list.length + '</b><span>' + t('words') + '</span></div><div class="card stat-mini"><b>' + due + '</b><span>' + t('dueToday') + '</span></div><div class="card stat-mini"><b>' + mastered + '</b><span>' + t('mastered') + '</span></div></div>' +
      (list.length
        ? '<div class="row between mb wrap"><input class="input" id="nbSearch" placeholder="🔎 ' + t('search') + '"><div class="row"><button class="btn sm ghost" id="nbExport">⬇ ' + t('export') + ' CSV</button><label class="btn sm ghost">⬆ ' + t('importF') + '<input type="file" id="nbImport" accept=".csv,.txt" hidden></label></div></div>' +
          '<div class="nb-list" id="nbList">' + list.map((x) => '<div class="nb-item" data-w="' + esc(x.w) + '"><div class="nb-zh zh">' + HA.R(x.w, { ruby: false }) + '</div><div class="nb-info"><div class="py">' + esc(HA.zh.phon(x.p)) + '</div><div class="small">' + esc(HA.ui.meaningOf(x)).slice(0, 120) + '</div></div>' +
            '<div class="nb-box" title="SRS">' + '●'.repeat(x.box) + '<span class="muted">' + '○'.repeat(6 - x.box) + '</span></div><div class="nb-act"><button class="icon-btn" data-speak="' + esc(x.w) + '">🔊</button><button class="icon-btn" data-write="' + esc(x.w) + '">✍️</button><a class="icon-btn" href="#/dict/' + encodeURIComponent(x.w) + '">🔎</a><button class="icon-btn" data-del="' + esc(x.w) + '">🗑</button></div></div>').join('') + '</div>'
        : '<div class="empty card"><div class="emoji-big">📒</div><p>' + t('notebookEmpty') + '</p><a class="btn green" href="#/learn">' + t('navLearn') + '</a></div>');
    view().onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak);
      const wr = e.target.closest('[data-write]'); if (wr) HA.games.writeModal(wr.dataset.write);
      const del = e.target.closest('[data-del]'); if (del) { HA.nb.remove(del.dataset.del); HA.dispatch(true); }
      if (e.target.id === 'nbExport') {
        const csv = '﻿word,pinyin,vietnamese,english\n' + list.map((x) => [x.w, x.p, x.vi, x.en].map((c) => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'hanry-notebook.csv'; a.click();
      }
    };
    view().oninput = (e) => {
      if (e.target.id !== 'nbSearch') return;
      const q = e.target.value.trim().toLowerCase();
      const qn = HA.zh.normPinyin(q);
      $$('.nb-item').forEach((el) => { const x = list.find((i) => i.w === el.dataset.w); el.hidden = q && !(x.w.includes(q) || HA.zh.normPinyin(x.p).includes(qn) && qn || (x.vi + x.en).toLowerCase().includes(q)); });
    };
    view().onchange = (e) => {
      if (e.target.id !== 'nbImport' || !e.target.files[0]) return;
      e.target.files[0].text().then((txt) => {
        let n = 0;
        txt.split(/\r?\n/).slice(1).forEach((line) => {
          const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
          const c = cells.map((x) => x.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
          if (c[0] && HA.zh.hasHan(c[0]) && HA.nb.add({ w: c[0].trim(), p: c[1], vi: c[2], en: c[3] })) n++;
        });
        HA.ui.toast(t('added') + ' +' + n, 'good'); HA.dispatch(true);
      });
    };
  });

  /* ---------- Profile ---------- */
  HA.route(/^\/profile$/, function () {
    const u = S.user;
    const d = S.data;
    const role = HA.roleOf(u);
    const days = Object.entries(d.days).sort().slice(-14);
    const maxX = Math.max(10, ...days.map((x) => x[1]));
    view().innerHTML =
      '<div class="card profile"><div class="avatar xl">' + (u && u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : esc(u ? (u.name || u.email)[0].toUpperCase() : '🐼')) + '</div>' +
      '<div><h2>' + esc(u ? u.name || u.email : t('guest')) + '</h2>' + (u ? '<p class="muted">' + esc(u.email) + '</p><span class="badge ' + role + '">' + t(role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'student') + '</span>' : '<button class="btn blue" onclick="HA.openLogin()">' + t('login') + '</button>') + '</div></div>' +
      '<div class="grid3"><div class="card stat-mini"><b>🔥 ' + HA.streakNow() + '</b><span>' + t('streak') + '</span></div><div class="card stat-mini"><b>💎 ' + d.xp + '</b><span>XP</span></div><div class="card stat-mini"><b>⭐ ' + d.notebook.length + '</b><span>' + t('statWords') + '</span></div></div>' +
      '<div class="card"><h3>📈 XP</h3><div class="xp-chart">' + (days.length ? days.map(([day, x]) => '<div class="xp-bar" title="' + day + ': ' + x + '"><i style="height:' + (x / maxX) * 100 + '%"></i><small>' + day.slice(8) + '</small></div>').join('') : '<p class="muted">—</p>') + '</div></div>' +
      '<div class="card"><h3>⚙️ ' + t('settings') + '</h3><button class="btn ghost" onclick="HA.openSettings()">' + t('settings') + '</button> ' +
      (u && role === 'student' ? '<a class="btn purple" href="#/classes">🔑 ' + t('teacherKey') + '</a> ' : '') +
      (u ? '<button class="btn ghost" id="logout">' + t('logout') + '</button>' : '') + '</div>' +
      '<div class="card danger-zone"><h3>⚠️</h3><button class="btn ghost" id="clearData">' + t('clearData') + '</button> ' + (u ? '<button class="btn red" id="delAcc">' + t('deleteAccount') + '</button>' : '') + '<p class="tiny muted">' + t('navPrivacy') + ': <a href="#/legal/privacy">#/legal/privacy</a></p></div>';
    view().onclick = async (e) => {
      if (e.target.id === 'logout') { await HA.api.signOut(); location.hash = '#/'; }
      if (e.target.id === 'clearData' && (await HA.ui.confirm(t('confirmDelete')))) { HA.LS.del('ha_data_' + (u ? u.email : 'guest')); HA.loadUserData(); HA.refresh(); }
      if (e.target.id === 'delAcc' && (await HA.ui.confirm(t('deleteAccount') + ' — ' + t('confirmDelete')))) {
        try { await HA.api.deleteAccount(); location.hash = '#/'; } catch (err) { HA.ui.toast(err.message, 'bad'); }
      }
    };
  });

  /* ---------- Boot ---------- */
  HA.ensureDict = function () {
    const lang = S.settings.lang === 'vi' ? 'vi' : 'en';
    HA.zh.loadDict(lang);
    if (lang === 'vi') HA.zh.loadHanViet();
  };
  let dictTimer = null;
  document.addEventListener('ha:dict', () => { clearTimeout(dictTimer); dictTimer = setTimeout(() => { HA.zh.clearCache(); if (!document.querySelector('.practice-overlay') && !document.querySelector('.game-live')) HA.dispatch(true); }, 50); });

  HA.boot = function () {
    HA.registerCurated();
    HA.initBackend();
    bindShell();
    HA.ensureDict();
    HA.renderShell();
    HA.dispatch();
    HA.api.onAuth((u) => {
      S.user = u;
      HA.loadUserData();
      HA.renderShell();
      HA.dispatch(true);
    });
    if (!S.settings.cookieOk) {
      const c = document.createElement('div');
      c.className = 'cookie';
      c.innerHTML = '<span>🍪 ' + t('cookieMsg') + ' <a href="#/legal/cookies">' + t('navCookies') + '</a></span><button class="btn sm green">' + t('ok') + '</button>';
      c.querySelector('button').onclick = () => { S.settings.cookieOk = true; HA.saveSettings(); c.remove(); };
      document.body.appendChild(c);
    }
  };
})();
