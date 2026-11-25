/* App shell, router, settings, sign-in, profile, boot */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');

  /* ---------- Shell ---------- */
  function navItems() {
    const u = S.user;
    const items = [['#/', '🏠', 'navHome'], ['#/learn', '🧭', 'navLearn'], ['#/notebook', '⭐', 'navNotebook'], ['#/classes', '🏫', 'navClasses']];
    if (S.bookAccess) items.push(['#/books', '📕', 'navBooks']);
    if (HA.isAdmin(u)) items.push(['#/admin', '🛡️', 'navAdmin']);
    return items;
  }
  HA.renderShell = function () {
    document.documentElement.lang = { vi: 'vi', en: 'en', zhs: 'zh-Hans', zht: 'zh-Hant', ja: 'ja' }[S.settings.lang];
    document.documentElement.dataset.theme = S.settings.dark ? 'dark' : 'light';
    document.body.classList.toggle('no-ruby', !S.settings.showRuby);
    const u = S.user;
    const route = (location.hash.split('?')[0].split('/').slice(0, 2).join('/')) || '#/';
    const isActive = (h) => (h === '#/' ? ['#/', '#', '', '#/post', '#/search'].includes(route) : route === h || (h === '#/notebook' && route === '#/game'));
    $('#side').innerHTML =
      '<a class="logo" href="#/"><span class="logo-mark">H</span><span class="logo-text">Hanry<b>Academy</b></span></a>' +
      '<a class="btn green full compose-btn" href="#/compose">✍️ ' + t('compose') + '</a>' +
      '<nav>' + navItems().map(([h, i, k]) => '<a href="' + h + '" class="' + (isActive(h) ? 'on' : '') + '"><span class="ni">' + i + '</span><span>' + t(k) + '</span></a>').join('') + '</nav>' +
      '<div class="side-foot"><a href="#/feedback">💬 ' + t('navFeedback') + '</a><a href="#/contact">✉️ ' + t('navContact') + '</a><a href="#/legal/terms">📜 ' + t('navTerms') + '</a></div>';
    $('#top').innerHTML =
      '<a class="logo m-only" href="#/"><span class="logo-mark">H</span></a>' +
      '<div class="top-right">' +
      '<select id="langSel" class="sel" aria-label="' + t('uiLang') + '">' + HA.LANGS.map((l) => '<option value="' + l.code + '"' + (l.code === S.settings.lang ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>').join('') + '</select>' +
      '<button class="seg-btn" id="scriptBtn" title="' + t('script') + '">' + (S.settings.script === 't' ? '繁' : '简') + '</button>' +
      '<button class="seg-btn" id="phonBtn" title="' + t('phonetic') + '">' + (S.settings.phon === 'zhuyin' ? 'ㄅ' : 'pīn') + '</button>' +
      '<button class="icon-btn" id="settingsBtn" title="' + t('settings') + '">⚙️</button>' +
      (u ? '<a class="avatar" href="#/profile" title="' + esc(u.email) + '">' + (u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : esc((u.name || u.email)[0].toUpperCase())) + '</a>'
        : '<button class="btn sm blue" id="loginBtn">' + t('login') + '</button>') +
      '</div>';
    $('#bottom').innerHTML = [['#/', '🏠', 'navHome'], ['#/learn', '🧭', 'navLearn'], ['#/compose', '✍️', 'compose'], ['#/notebook', '⭐', 'navNotebook']]
      .map(([h, i, k]) => '<a href="' + h + '" class="' + (isActive(h) ? 'on' : '') + '"><span>' + i + '</span><small>' + t(k) + '</small></a>').join('') +
      '<a href="#" id="moreBtn"><span>☰</span><small>' + t('more') + '</small></a>';
    $('#foot').innerHTML =
      '<div class="foot-grid">' +
      '<div><div class="logo"><span class="logo-mark">H</span><span class="logo-text">Hanry<b>Academy</b></span></div><p class="muted">' + t('tagline') + '</p>' +
      '<p>✉️ <a href="mailto:' + HA.config.contact.email + '">' + HA.config.contact.email + '</a><br>' + HA.config.contact.phones.map((p) => '📞 <a href="tel:' + p.tel + '">' + p.value + '</a>').join('<br>') + '</p></div>' +
      '<div><h4>Hanry Academy</h4><a href="#/">' + t('navHome') + '</a><a href="#/learn">' + t('navLearn') + '</a><a href="#/notebook">' + t('navNotebook') + '</a><a href="#/classes">' + t('navClasses') + '</a></div>' +
      '<div><h4>' + t('legal') + '</h4><a href="#/legal/terms">' + t('navTerms') + '</a><a href="#/legal/privacy">' + t('navPrivacy') + '</a><a href="#/legal/rights">' + t('navRights') + '</a><a href="#/legal/copyright">' + t('navCopyright') + '</a><a href="#/legal/community">' + t('navCommunityRules') + '</a><a href="#/legal/cookies">' + t('navCookies') + '</a></div>' +
      '<div><h4>' + t('navContact') + '</h4><a href="#/contact">' + t('navContact') + '</a><a href="#/feedback">' + t('navFeedback') + '</a><a href="#/feedback/copyright">' + t('fbCopyright') + '</a></div>' +
      '</div><p class="tiny muted">© ' + new Date().getFullYear() + ' Hanry Academy. ' + t('footerRights') + ' ' + t('dictCredit') + '</p>';
  };

  function bindShell() {
    document.addEventListener('change', (e) => {
      if (e.target.id === 'langSel') { S.settings.lang = e.target.value; if (e.target.value === 'zht') S.settings.script = 't'; if (e.target.value === 'zhs') S.settings.script = 's'; HA.saveSettings(); HA.ensureDict(); HA.refresh(); }
    });
    document.addEventListener('click', (e) => {
      const el = e.target.closest('button,a');
      const id = el && el.id;
      if (id === 'scriptBtn') { S.settings.script = S.settings.script === 't' ? 's' : 't'; HA.saveSettings(); HA.refresh(); }
      if (id === 'phonBtn') { S.settings.phon = S.settings.phon === 'zhuyin' ? 'pinyin' : 'zhuyin'; HA.saveSettings(); HA.refresh(); }
      if (id === 'settingsBtn') HA.openSettings();
      if (id === 'loginBtn') HA.openLogin();
      if (id === 'moreBtn') { e.preventDefault(); HA.openMore(); }
    });
  }

  HA.openMore = function () {
    const items = navItems().filter((x) => !['#/', '#/learn', '#/notebook'].includes(x[0]))
      .concat([['#/profile', '👤', 'navProfile'], ['#/feedback', '💬', 'navFeedback'], ['#/contact', '✉️', 'navContact'], ['#/legal/terms', '📜', 'navTerms'], ['#/legal/privacy', '🔒', 'navPrivacy'], ['#/legal/rights', '🛟', 'navRights']]);
    HA.ui.modal('<h3>' + t('more') + '</h3><div class="more-grid">' + items.map(([h, i, k]) => '<a href="' + h + '" onclick="HA.ui.closeModal()"><span>' + i + '</span>' + t(k) + '</a>').join('') +
      '<a href="#" onclick="HA.ui.closeModal();HA.openSettings();return false"><span>⚙️</span>' + t('settings') + '</a></div>');
  };

  function voiceOptions(lang) {
    const list = HA.zh.voicesFor(lang);
    const cur = (S.settings.voices || {})[lang];
    if (!list.length) return '<option value="">' + t('noVoice') + '</option>';
    return list.map((v, i) => '<option value="' + esc(v.name) + '"' + ((cur ? v.name === cur : i === 0) ? ' selected' : '') + '>' + esc(v.name) + (i === 0 ? ' ★' : '') + '</option>').join('');
  }
  HA.openSettings = function () {
    const s = S.settings;
    const vlang = s.script === 't' ? 'zht' : 'zh';
    const m = HA.ui.modal(
      '<h3>⚙️ ' + t('settings') + '</h3>' +
      '<label class="fl">' + t('uiLang') + '<select id="s-lang" class="input">' + HA.LANGS.map((l) => '<option value="' + l.code + '"' + (l.code === s.lang ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>').join('') + '</select></label>' +
      '<div class="fl">' + t('script') + '<div class="seg" data-k="script"><button data-v="s" class="' + (s.script === 's' ? 'on' : '') + '">' + t('simplified') + ' 简</button><button data-v="t" class="' + (s.script === 't' ? 'on' : '') + '">' + t('traditional') + ' 繁</button></div></div>' +
      '<div class="fl">' + t('phonetic') + '<div class="seg" data-k="phon"><button data-v="pinyin" class="' + (s.phon === 'pinyin' ? 'on' : '') + '">' + t('pinyin') + ' (hàn)</button><button data-v="zhuyin" class="' + (s.phon === 'zhuyin' ? 'on' : '') + '">' + t('zhuyin') + ' (ㄏㄢˋ)</button></div></div>' +
      '<label class="fl row"><input type="checkbox" id="s-ruby"' + (s.showRuby ? ' checked' : '') + '> ' + t('showPhon') + '</label>' +
      '<label class="fl row"><input type="checkbox" id="s-dark"' + (s.dark ? ' checked' : '') + '> ' + t('darkMode') + '</label>' +
      '<div class="card soft"><b>🔊 ' + t('voiceTitle') + '</b><p class="tiny muted">' + t('voiceHelp') + '</p>' +
      '<label class="fl">' + t('voiceChinese') + '<select id="s-voice" class="input" data-lang="' + vlang + '">' + voiceOptions(vlang) + '</select></label>' +
      '<label class="fl">' + t('speechRate') + ' <input type="range" id="s-rate" min="0.5" max="1.3" step="0.05" value="' + s.rate + '"></label>' +
      '<button class="btn sm blue" id="s-test">▶ ' + t('voiceTest') + '</button></div>' +
      '<button class="btn green full" onclick="HA.ui.closeModal()">' + t('save') + '</button>'
    );
    const sample = '你好！欢迎来到Hanry Academy。今天天气很好，我们一起去公园散步，好吗？';
    m.addEventListener('click', (e) => {
      if (e.target.id === 's-test') HA.zh.speak(sample);
      const b = e.target.closest('.seg button'); if (!b) return;
      const k = b.parentElement.dataset.k; s[k] = b.dataset.v; HA.saveSettings();
      $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', x === b)); HA.refresh();
    });
    m.addEventListener('change', (e) => {
      const id = e.target.id;
      if (id === 's-lang') { s.lang = e.target.value; HA.ensureDict(); }
      if (id === 's-ruby') s.showRuby = e.target.checked;
      if (id === 's-dark') s.dark = e.target.checked;
      if (id === 's-rate') { s.rate = +e.target.value; HA.zh.speak(sample); }
      if (id === 's-voice') { s.voices = Object.assign({}, s.voices, { [e.target.dataset.lang]: e.target.value }); HA.zh.speak(sample); }
      HA.saveSettings(); if (id !== 's-voice' && id !== 's-rate') HA.refresh();
    });
  };

  HA.openLogin = function () {
    const local = HA.api.mode === 'local';
    const m = HA.ui.modal(
      '<div class="center"><div class="logo big"><span class="logo-mark">H</span></div><h3>' + t('login') + ' Hanry Academy</h3></div>' +
      (local
        ? '<p class="note">' + t('localModeNote') + '</p>' +
          '<label class="fl">' + t('email') + '<input class="input" id="l-email" type="email" placeholder="ban@gmail.com" autocomplete="email"></label>' +
          '<label class="fl">' + t('displayName') + '<input class="input" id="l-name" maxlength="40"></label>' +
          '<label class="fl">' + t('password') + '<input class="input" id="l-pw" type="password" autocomplete="current-password"></label>'
        : '') +
      '<label class="fl row small"><input type="checkbox" id="l-agree"> <span>' + t('agreeTerms') + ' (<a href="#/legal/terms" onclick="HA.ui.closeModal()">' + t('navTerms') + '</a>, <a href="#/legal/privacy" onclick="HA.ui.closeModal()">' + t('navPrivacy') + '</a>, <a href="#/legal/community" onclick="HA.ui.closeModal()">' + t('navCommunityRules') + '</a>)</span></label>' +
      '<p class="tiny muted">' + t('ageNote') + '</p>' +
      '<button class="btn ' + (local ? 'green' : 'white') + ' full" id="l-go">' + (local ? t('login') : 'G ' + t('loginGoogle')) + '</button>'
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
        HA.LS.set('ha_consent', { terms: HA.config.legalUpdated, at: Date.now() });
        HA.ui.closeModal();
      } catch (err) { HA.ui.toast(err.message || String(err), 'bad'); }
    };
  };
  HA.requireLogin = function () { if (S.user) return true; HA.ui.toast(t('needLogin')); HA.openLogin(); return false; };

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
    HA.zh.stop();
    HA.ui.closeModal();
    HA.renderShell(); HA.dispatch();
  });

  HA.R = (text, opts) => HA.zh.render(text, opts);
  HA.levelOf = (n) => HA.LEVELS.find((l) => l.n === +n) || HA.LEVELS[0];
  HA.subjectOf = (id) => HA.config.subjects.find((s) => s.id === id) || HA.config.subjects[0];
  HA.subjectName = (s) => (S.settings.lang === 'vi' ? s.name : s.en);

  /* ---------- Profile ---------- */
  HA.route(/^\/profile$/, function () {
    const u = S.user;
    const d = S.data;
    const role = HA.roleOf(u);
    view().innerHTML =
      '<div class="card profile"><div class="avatar xl">' + (u && u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : esc(u ? (u.name || u.email)[0].toUpperCase() : '🙂')) + '</div>' +
      '<div><h2>' + esc(u ? u.name || u.email : t('guest')) + '</h2>' + (u ? '<p class="muted">' + esc(u.email) + '</p><span class="badge ' + role + '">' + t(role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'student') + '</span>' : '<button class="btn blue" onclick="HA.openLogin()">' + t('login') + '</button>') + '</div></div>' +
      '<div class="grid3"><div class="card stat-mini"><b>⭐ ' + d.notebook.length + '</b><span>' + t('statWords') + '</span></div><div class="card stat-mini"><b>📖 ' + Object.keys(d.lessons).length + '</b><span>' + t('postsRead') + '</span></div><div class="card stat-mini"><b>🧭 ' + Object.keys(d.course || {}).length + '</b><span>' + t('unitsDone') + '</span></div></div>' +
      '<div class="card"><h3>⚙️ ' + t('settings') + '</h3><div class="row wrap"><button class="btn ghost" onclick="HA.openSettings()">' + t('settings') + '</button>' +
      (u ? '<a class="btn ghost" href="#/compose?mine=1">📁 ' + t('myLessons') + '</a>' : '') +
      (u && role === 'student' ? '<a class="btn purple" href="#/classes">🔑 ' + t('teacherKey') + '</a>' : '') +
      (u ? '<button class="btn ghost" id="logout">' + t('logout') + '</button>' : '') + '</div></div>' +
      '<div class="card"><h3>🛟 ' + t('yourRights') + '</h3><p class="small">' + t('yourRightsD') + '</p><div class="row wrap"><button class="btn ghost sm" id="exportData">⬇ ' + t('exportData') + '</button><a class="btn ghost sm" href="#/legal/rights">' + t('navRights') + '</a></div></div>' +
      '<div class="card danger-zone"><h3>⚠️</h3><button class="btn ghost" id="clearData">' + t('clearData') + '</button> ' + (u ? '<button class="btn red" id="delAcc">' + t('deleteAccount') + '</button>' : '') + '</div>';
    view().onclick = async (e) => {
      if (e.target.id === 'logout') { await HA.api.signOut(); location.hash = '#/'; }
      if (e.target.id === 'exportData') {
        const blob = new Blob([JSON.stringify({ account: u, settings: S.settings, learning: S.data }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hanry-academy-data.json'; a.click();
      }
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
  document.addEventListener('ha:dict', () => { clearTimeout(dictTimer); dictTimer = setTimeout(() => { HA.zh.clearCache(); if (!document.querySelector('.practice-overlay') && !document.querySelector('.game-live') && !document.querySelector('.composer-form')) HA.dispatch(true); }, 50); });

  HA.boot = function () {
    HA.registerCurated();
    HA.initBackend();
    bindShell();
    HA.ensureDict();
    HA.renderShell();
    HA.dispatch();
    HA.api.onAuth(async (u) => {
      S.user = u;
      HA.loadUserData();
      S.bookAccess = false;
      HA.renderShell();
      HA.dispatch(true);
      if (u) { try { S.bookAccess = await HA.api.hasBookAccess(); } catch (e) {} HA.renderShell(); }
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
