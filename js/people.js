/* People: public profiles, follow / unfollow, friends (= following each other), people search */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const view = () => $('#view');
  const P = (HA.people = {});

  // who I follow — cached for the session, refreshed after each change
  let myFollowing = null;
  P.following = async function (force) {
    if (!S.user) return new Set();
    if (!myFollowing || force) {
      try { myFollowing = new Set(await HA.api.listFollowing(S.user.uid)); } catch (e) { myFollowing = new Set(); }
    }
    return myFollowing;
  };
  P.reset = () => { myFollowing = null; };

  const avatar = (p, cls) => '<span class="avatar ' + (cls || '') + '">' + (p && p.photo ? '<img src="' + esc(p.photo) + '" alt="" referrerpolicy="no-referrer">' : esc(((p && p.name) || '?')[0].toUpperCase())) + '</span>';
  const roleBadge = (r) => (r === 'admin' ? '<span class="badge admin">' + t('admin') + '</span>' : r === 'teacher' ? '<span class="badge teacher">' + t('teacher') + '</span>' : '');

  // Button markup; state filled by P.fill(root)
  P.btn = (uid, small) => (S.user && uid === S.user.uid ? '' : '<button class="btn ' + (small ? 'sm ' : '') + 'follow-btn" data-follow="' + esc(uid) + '">+ ' + t('follow') + '</button>');
  P.fill = async function (root) {
    const btns = $$('[data-follow]', root || document);
    if (!btns.length || !S.user) return;
    const set = await P.following();
    btns.forEach((b) => paint(b, set.has(b.dataset.follow), b.dataset.mutual === '1'));
  };
  function paint(b, on, mutual) {
    b.classList.toggle('on', on);
    b.classList.toggle('green', !on);
    b.textContent = on ? (mutual ? '✓ ' + t('friendsW') : '✓ ' + t('followingW')) : '+ ' + t('follow');
    b.title = on ? t('unfollow') : '';
  }
  // one click handler for every follow button on the site
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-follow]');
    if (!b) return;
    e.preventDefault();
    if (!S.user) { HA.openLogin(); return; }
    const uid = b.dataset.follow;
    const set = await P.following();
    b.disabled = true;
    try {
      if (set.has(uid)) { await HA.api.unfollow(uid); set.delete(uid); HA.ui.toast(t('unfollowed')); }
      else { await HA.api.follow(uid); set.add(uid); HA.ui.toast(t('followed'), 'good'); }
      $$('[data-follow="' + CSS.escape(uid) + '"]').forEach((x) => paint(x, set.has(uid), x.dataset.mutual === '1'));
      if (location.hash.startsWith('#/u/')) HA.refresh();
    } catch (err) { HA.ui.toast(err.message || t('error'), 'bad'); }
    b.disabled = false;
  });

  P.row = (p, mutual) => '<div class="person"><a href="#/u/' + encodeURIComponent(p.uid) + '">' + avatar(p, 'sm') + '</a><a class="pn" href="#/u/' + encodeURIComponent(p.uid) + '"><b>' + esc(p.name || '?') + '</b> ' + roleBadge(p.role) + (mutual ? ' <span class="badge good">' + t('friendsW') + '</span>' : '') + '</a>' + P.btn(p.uid, true).replace('data-follow', 'data-mutual="' + (p.followsMe ? 1 : 0) + '" data-follow') + '</div>';
  async function profiles(uids) { return (await Promise.all(uids.slice(0, 60).map((u) => HA.api.getProfile(u).catch(() => null)))).filter(Boolean); }

  /* ---------- Profile page ---------- */
  HA.route(/^\/u\/([^/]+)(?:\/(\w+))?$/, async function (id, tab) {
    id = decodeURIComponent(id);
    if (id === 'me') { if (!S.user) { HA.openLogin(); location.hash = '#/'; return; } location.replace('#/u/' + encodeURIComponent(S.user.uid) + (tab ? '/' + tab : '')); return; }
    tab = tab || 'posts';
    view().innerHTML = '<div class="loading">' + t('loading') + '</div>';
    const [prof, followers, following, posts] = await Promise.all([
      HA.api.getProfile(id).catch(() => null), HA.api.listFollowers(id).catch(() => []), HA.api.listFollowing(id).catch(() => []), HA.api.listByOwner(id).catch(() => [])]);
    if (!prof) { view().innerHTML = '<div class="card empty"><p>' + t('notFound') + '</p></div>'; return; }
    const isMe = S.user && S.user.uid === id;
    const fset = new Set(followers);
    const friends = following.filter((u) => fset.has(u));
    const mutual = S.user && !isMe && fset.has(S.user.uid) && following.includes(S.user.uid);
    const followsMe = S.user && !isMe && following.includes(S.user.uid);
    const tabs = [['posts', '📝 ' + t('tabPosts'), posts.length], ['friends', '🤝 ' + t('friendsW'), friends.length], ['followers', '👥 ' + t('followersW'), followers.length], ['following', '➡️ ' + t('followingW'), following.length]];
    view().innerHTML =
      '<div class="card profile pub-profile">' + avatar(prof, 'xl') + '<div class="pp-main"><h2>' + esc(prof.name) + ' ' + roleBadge(prof.role) + '</h2>' +
      (followsMe ? '<p class="small muted">' + (mutual ? '🤝 ' + t('friendsW') : '👋 ' + t('followsYou')) + '</p>' : '') +
      '<div class="pp-stats">' + tabs.map(([k, l, n]) => '<a href="#/u/' + encodeURIComponent(id) + '/' + k + '"><b>' + n + '</b><span>' + l.replace(/^\S+ /, '') + '</span></a>').join('') + '</div>' +
      '<div class="row wrap">' + (isMe ? '<a class="btn ghost sm" href="#/profile">⚙️ ' + t('settings') + '</a><button class="btn ghost sm" id="copyLink">🔗 ' + t('copyLink') + '</button>' : P.btn(id).replace('data-follow', 'data-mutual="' + (followsMe ? 1 : 0) + '" data-follow')) + '</div></div></div>' +
      '<div class="tabs pp-tabs">' + tabs.map(([k, l, n]) => '<a class="tab ' + (tab === k ? 'on' : '') + '" href="#/u/' + encodeURIComponent(id) + '/' + k + '">' + l + ' <small>' + n + '</small></a>').join('') + '</div>' +
      '<div id="ppBody"><div class="loading"></div></div>';
    const body = $('#ppBody');
    if (tab === 'posts') {
      body.innerHTML = posts.length ? '<div class="feed">' + posts.map((x) => HA.feed.card(Object.assign({ author: prof.name }, x))).join('') + '</div>' : '<div class="card empty">📭 ' + t('noPosts') + '</div>';
      HA.feed.fillReactions(body, posts);
      body.onclick = HA.feed.actions(body, posts);
    } else {
      const ids = tab === 'friends' ? friends : tab === 'followers' ? followers : following;
      const list = await profiles(ids);
      const myFr = S.user ? new Set(await HA.api.listFollowers(S.user.uid).catch(() => [])) : new Set();
      const mine = await P.following();
      list.forEach((p) => (p.followsMe = myFr.has(p.uid)));
      body.innerHTML = list.length ? '<div class="card people-list">' + list.map((p) => P.row(p, myFr.has(p.uid) && mine.has(p.uid))).join('') + '</div>' : '<div class="card empty">' + t('noPeople') + '</div>';
    }
    P.fill(view());
    const cl = $('#copyLink'); if (cl) cl.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(location.href.split('#')[0] + '#/u/' + encodeURIComponent(id)); HA.ui.toast(t('copied'), 'good'); };
  });

  /* ---------- People search (used by the home search) ---------- */
  P.searchHTML = async function (q) {
    let list = [];
    try { list = await HA.api.searchProfiles(q); } catch (e) {}
    if (!list.length) return '';
    return '<div class="card people-list"><h3>👥 ' + t('peopleW') + '</h3>' + list.map((p) => P.row(p)).join('') + '</div>';
  };
})();
