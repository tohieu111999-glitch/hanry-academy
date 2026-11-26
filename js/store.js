/* State, persistence and backend adapters (local / Firebase) */
(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  HA.LS = LS;
  const today = () => new Date().toISOString().slice(0, 10);
  HA.today = today;

  const defSettings = { lang: 'vi', script: 's', phon: 'pinyin', showRuby: false, showTrans: false, dark: false, rate: 0.85, dailyGoal: 30, cookieOk: false };
  const navLang = (navigator.language || 'vi').toLowerCase();
  if (!LS.get('ha_settings')) {
    if (navLang.startsWith('ja')) defSettings.lang = 'ja';
    else if (/zh-(tw|hk|hant)/.test(navLang)) { defSettings.lang = 'zht'; defSettings.script = 't'; defSettings.phon = 'zhuyin'; }
    else if (navLang.startsWith('zh')) defSettings.lang = 'zhs';
    if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) defSettings.dark = true;
  }
  const S = (HA.state = {
    settings: Object.assign({}, defSettings, LS.get('ha_settings', {})),
    user: null
  });
  HA.saveSettings = () => LS.set('ha_settings', S.settings);
  // v3: reading shows plain characters; pinyin/zhuyin and translations appear only when the reader turns them on
  if (!S.settings.plainV3) { S.settings.showRuby = false; S.settings.showTrans = false; S.settings.plainV3 = true; HA.saveSettings(); }
  // Link options, e.g. ?script=t&phon=zhuyin&lang=vi  (script: s|t, phon: pinyin|zhuyin)
  try {
    const q = new URLSearchParams(location.search);
    if (['s', 't'].includes(q.get('script'))) S.settings.script = q.get('script');
    if (['pinyin', 'zhuyin'].includes(q.get('phon'))) S.settings.phon = q.get('phon');
    if (['vi', 'en', 'zhs', 'zht', 'ja'].includes(q.get('lang'))) S.settings.lang = q.get('lang');
    if (q.toString()) HA.saveSettings();
  } catch (e) {}

  /* ---------- Per-user learning data (stored on device) ---------- */
  const uk = () => 'ha_data_' + (S.user ? S.user.email : 'guest');
  function blankData() { return { xp: 0, streak: 0, lastDay: null, days: {}, lessons: {}, notebook: [], games: {}, history: [] }; }
  S.data = LS.get(uk(), blankData());
  HA.loadUserData = () => { S.data = Object.assign(blankData(), LS.get(uk(), {})); };
  HA.saveData = () => LS.set(uk(), S.data);

  HA.addXP = function (n) {
    const d = S.data, t = today();
    d.xp += n;
    d.days[t] = (d.days[t] || 0) + n;
    if (d.lastDay !== t) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      d.streak = d.lastDay === y ? d.streak + 1 : 1;
      d.lastDay = t;
    }
    HA.saveData();
    document.dispatchEvent(new CustomEvent('ha:stats'));
  };
  HA.streakNow = () => {
    const d = S.data; if (!d.lastDay) return 0;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    return d.lastDay === today() || d.lastDay === y ? d.streak : 0;
  };
  HA.lessonProgress = (id) => S.data.lessons[id] || { parts: {} };
  HA.markPart = function (id, part, score) {
    const l = S.data.lessons[id] || (S.data.lessons[id] = { parts: {} });
    l.parts[part] = Math.max(l.parts[part] || 0, score == null ? 100 : score);
    const need = ['read', 'vocab', 'grammar', 'quiz', 'practice'];
    l.done = need.every((p) => l.parts[p] != null);
    HA.saveData();
  };

  /* ---------- Notebook with spaced repetition (Leitner boxes) ---------- */
  const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
  HA.nb = {
    list: () => S.data.notebook,
    has: (w) => S.data.notebook.some((x) => x.w === w),
    add(item) {
      if (!item || !item.w || HA.nb.has(item.w)) return false;
      S.data.notebook.unshift({ w: item.w, lang: item.lang || 'zh', p: item.p || '', m: item.m || '', vi: item.vi || '', en: item.en || '', added: Date.now(), box: 0, due: today() });
      HA.saveData(); return true;
    },
    remove(w) { S.data.notebook = S.data.notebook.filter((x) => x.w !== w); HA.saveData(); },
    toggle(item) { if (HA.nb.has(item.w)) { HA.nb.remove(item.w); return false; } HA.nb.add(item); return true; },
    grade(w, ok) {
      const it = S.data.notebook.find((x) => x.w === w); if (!it) return;
      it.box = ok ? Math.min(it.box + 1, BOX_DAYS.length - 1) : 0;
      it.due = new Date(Date.now() + BOX_DAYS[it.box] * 864e5).toISOString().slice(0, 10);
      HA.saveData();
    },
    due: () => S.data.notebook.filter((x) => !x.due || x.due <= today())
  };

  /* ---------- Roles ---------- */
  HA.isAdmin = (u) => !!(u && u.email && HA.config.adminEmails.map((e) => e.toLowerCase()).includes(u.email.toLowerCase()) && u.verified !== false);
  HA.roleOf = (u) => (!u ? 'guest' : HA.isAdmin(u) ? 'admin' : u.role || 'student');
  HA.canTeach = (u) => ['teacher', 'admin'].includes(HA.roleOf(u));

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const genCode = (n) => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; const r = crypto.getRandomValues(new Uint32Array(n)); for (let i = 0; i < n; i++) s += a[r[i] % a.length]; return s; };
  HA.genCode = genCode;

  /* =========================================================
   * LOCAL ADAPTER — everything in this browser (demo / offline)
   * ========================================================= */
  function LocalAdapter() {
    const db = () => Object.assign({ users: {}, lessons: [], classes: [], books: [], bookAccess: [], keys: [], reports: [], likes: {}, comments: [], follows: [] }, LS.get('ha_db', {}));
    const put = (d) => LS.set('ha_db', d);
    async function sha(s) {
      if (!crypto.subtle) return s;
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    let listeners = [];
    const me = () => S.user;
    const A = {
      mode: 'local',
      onAuth(cb) { listeners.push(cb); const e = LS.get('ha_session'); const d = db(); cb(e && d.users[e] ? pub(d.users[e]) : null); },
      async signIn({ email, name, password }) {
        email = email.trim().toLowerCase();
        const d = db(); const h = await sha(email + '::' + password);
        let u = d.users[email];
        if (u && u.pw !== h) throw new Error(HA.t('password') + ' ✗');
        if (!u) u = d.users[email] = { uid: uid(), email, name: name || email.split('@')[0], pw: h, role: 'student', created: Date.now() };
        put(d); LS.set('ha_session', email);
        listeners.forEach((cb) => cb(pub(u)));
      },
      async signOut() { LS.del('ha_session'); listeners.forEach((cb) => cb(null)); },
      async deleteAccount() {
        const d = db(); const u = me(); if (!u) return;
        delete d.users[u.email]; d.lessons = d.lessons.filter((l) => l.ownerUid !== u.uid);
        put(d); LS.del('ha_data_' + u.email); await A.signOut();
      },
      async redeemKey(key) {
        const d = db(); const k = d.keys.find((x) => x.key === key.trim().toUpperCase() && !x.usedBy);
        if (!k || !me()) throw new Error(HA.t('keyInvalid'));
        k.usedBy = me().email; k.usedAt = Date.now();
        d.users[me().email].role = 'teacher'; put(d);
        S.user.role = 'teacher';
      },
      async listLessons(filter) {
        const d = db(); const u = me();
        const myClassIds = d.classes.filter((c) => u && (c.ownerUid === u.uid || c.members.includes(u.uid))).map((c) => c.id);
        return d.lessons.filter((l) => {
          if (filter.classId) return l.visibility === 'class' && l.classId === filter.classId && myClassIds.includes(l.classId);
          if (filter.mine) return u && l.ownerUid === u.uid;
          return l.visibility === 'public';
        }).sort((a, b) => b.created - a.created);
      },
      async getLesson(id) { return db().lessons.find((l) => l.id === id) || null; },
      async saveLesson(l) {
        const d = db(); const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        if (l.id) { const i = d.lessons.findIndex((x) => x.id === l.id); if (i >= 0 && (d.lessons[i].ownerUid === u.uid || HA.isAdmin(u))) d.lessons[i] = Object.assign(d.lessons[i], l, { updated: Date.now() }); }
        else { l.id = 'u-' + uid(); l.ownerUid = u.uid; l.ownerEmail = u.email; l.authorRole = HA.roleOf(u); l.created = Date.now(); d.lessons.push(l); }
        put(d); return l.id;
      },
      async deleteLesson(id) { const d = db(); const u = me(); d.lessons = d.lessons.filter((l) => !(l.id === id && (l.ownerUid === u.uid || HA.isAdmin(u)))); put(d); },
      async createClass(name) {
        const d = db(); const u = me(); const c = { id: 'c-' + uid(), name, code: genCode(6), ownerUid: u.uid, ownerName: u.name, members: [], created: Date.now() };
        d.classes.push(c); put(d); return c;
      },
      async joinClass(code) {
        const d = db(); const c = d.classes.find((x) => x.code === code.trim().toUpperCase());
        if (!c) throw new Error(HA.t('classNotFound'));
        if (!c.members.includes(me().uid) && c.ownerUid !== me().uid) c.members.push(me().uid);
        put(d); return c;
      },
      async leaveClass(id) { const d = db(); const c = d.classes.find((x) => x.id === id); if (c) c.members = c.members.filter((m) => m !== me().uid); put(d); },
      async deleteClass(id) { const d = db(); d.classes = d.classes.filter((c) => !(c.id === id && c.ownerUid === me().uid)); put(d); },
      async myClasses() { const d = db(); const u = me(); if (!u) return []; return d.classes.filter((c) => c.ownerUid === u.uid || c.members.includes(u.uid)); },
      async hasBookAccess() { const u = me(); if (!u) return false; return HA.isAdmin(u) || db().bookAccess.includes(u.email); },
      async listBooks() { return (await A.hasBookAccess()) ? db().books : []; },
      async saveBook(b) { const d = db(); if (b.id) { const i = d.books.findIndex((x) => x.id === b.id); d.books[i] = b; } else { b.id = 'b-' + uid(); b.created = Date.now(); d.books.push(b); } put(d); },
      async deleteBook(id) { const d = db(); d.books = d.books.filter((b) => b.id !== id); put(d); },
      async listAccess() { return db().bookAccess; },
      async addAccess(email) { const d = db(); email = email.trim().toLowerCase(); if (!d.bookAccess.includes(email)) d.bookAccess.push(email); put(d); },
      async removeAccess(email) { const d = db(); d.bookAccess = d.bookAccess.filter((e) => e !== email); put(d); },
      async listKeys() { return db().keys; },
      async createKey(note) { const d = db(); const k = { key: 'HT-' + genCode(4) + '-' + genCode(4), note: note || '', created: Date.now(), usedBy: null }; d.keys.push(k); put(d); return k; },
      async deleteKey(key) { const d = db(); d.keys = d.keys.filter((k) => k.key !== key); put(d); },
      async submitReport(r) { const d = db(); r.id = uid(); r.created = Date.now(); r.email = me() ? me().email : r.email || ''; d.reports.push(r); put(d); },
      async listReports() { return db().reports.slice().reverse(); },
      async deleteReport(id) { const d = db(); d.reports = d.reports.filter((r) => r.id !== id); put(d); },
      async getReactions(ids) {
        const d = db(); const u = me(); const out = {};
        ids.forEach((id) => { const l = d.likes[id] || []; out[id] = { likes: l.length, liked: !!(u && l.includes(u.uid)), comments: d.comments.filter((c) => c.postId === id).length }; });
        return out;
      },
      async toggleLike(id) {
        const d = db(); const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        const l = d.likes[id] || (d.likes[id] = []); const i = l.indexOf(u.uid);
        if (i >= 0) l.splice(i, 1); else l.push(u.uid); put(d); return i < 0;
      },
      async listComments(id) { return db().comments.filter((c) => c.postId === id).sort((a, b) => a.created - b.created); },
      async addComment(id, text) {
        const d = db(); const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        d.comments.push({ id: uid(), postId: id, uid: u.uid, name: u.name || u.email, text: text.slice(0, 1000), created: Date.now() }); put(d);
      },
      async deleteComment(cid) { const d = db(); const u = me(); d.comments = d.comments.filter((c) => !(c.id === cid && (c.uid === u.uid || HA.isAdmin(u)))); put(d); },
      // ---- People: public profiles + follows (two people following each other = friends)
      async saveProfile() {},
      async getProfile(id) { const x = Object.values(db().users).find((u) => u.uid === id); return x ? { uid: x.uid, name: x.name, role: HA.isAdmin(x) ? 'admin' : x.role } : null; },
      async searchProfiles(q) { q = q.toLowerCase(); return Object.values(db().users).filter((u) => (u.name || '').toLowerCase().includes(q)).slice(0, 20).map((x) => ({ uid: x.uid, name: x.name, role: HA.isAdmin(x) ? 'admin' : x.role })); },
      async follow(to) { const d = db(); const u = me(); if (!u) throw new Error(HA.t('needLogin')); if (to !== u.uid && !d.follows.some((f) => f.from === u.uid && f.to === to)) d.follows.push({ from: u.uid, to, created: Date.now() }); put(d); },
      async unfollow(to) { const d = db(); const u = me(); d.follows = d.follows.filter((f) => !(f.from === u.uid && f.to === to)); put(d); },
      async listFollowing(id) { return db().follows.filter((f) => f.from === id).map((f) => f.to); },
      async listFollowers(id) { return db().follows.filter((f) => f.to === id).map((f) => f.from); },
      async listByOwner(id) { return db().lessons.filter((l) => l.ownerUid === id && l.visibility === 'public').sort((a, b) => b.created - a.created); },
      // exam packs locked by the admin (only Gmail accounts with access can open them)
      async getExamLocks() { return db().examLocks || []; },
      async setExamLock(pack, locked) { const d = db(); const l = new Set(d.examLocks || []); locked ? l.add(pack) : l.delete(pack); d.examLocks = [...l]; put(d); }
    };
    function pub(u) { return { uid: u.uid, email: u.email, name: u.name, role: u.role, verified: true }; }
    return A;
  }

  /* =========================================================
   * FIREBASE ADAPTER — real Google sign-in + Firestore
   * Security is enforced server-side by firestore.rules
   * ========================================================= */
  function FirebaseAdapter(cfg) {
    firebase.initializeApp(cfg);
    const auth = firebase.auth();
    const fs = firebase.firestore();
    const FV = firebase.firestore.FieldValue;
    const me = () => S.user;
    const all = (snap) => snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
    const A = {
      mode: 'firebase',
      onAuth(cb) {
        auth.onAuthStateChanged(async (fu) => {
          if (!fu) return cb(null);
          const ref = fs.collection('users').doc(fu.uid);
          let snap = await ref.get().catch(() => null);
          if (!snap || !snap.exists) {
            await ref.set({ email: fu.email.toLowerCase(), name: fu.displayName || fu.email.split('@')[0], role: 'student', created: Date.now() }).catch(console.warn);
            snap = await ref.get().catch(() => null);
          }
          const d = (snap && snap.data()) || {};
          const user = { uid: fu.uid, email: (fu.email || '').toLowerCase(), name: d.name || fu.displayName, role: d.role || 'student', verified: fu.emailVerified, photo: fu.photoURL };
          A.saveProfile(user).catch(console.warn);
          cb(user);
        });
      },
      async signIn() { const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); await auth.signInWithPopup(p); },
      async signOut() { await auth.signOut(); },
      async deleteAccount() {
        const u = me(); if (!u) return;
        const mine = await fs.collection('lessons').where('ownerUid', '==', u.uid).get();
        const fol = await fs.collection('follows').where('from', '==', u.uid).get().catch(() => ({ docs: [] }));
        const b = fs.batch(); mine.docs.forEach((d) => b.delete(d.ref)); fol.docs.forEach((d) => b.delete(d.ref));
        b.delete(fs.collection('profiles').doc(u.uid)); b.delete(fs.collection('users').doc(u.uid)); await b.commit();
        LS.del('ha_data_' + u.email);
        await auth.currentUser.delete().catch(async () => { await A.signOut(); throw new Error('Please sign in again, then retry.'); });
      },
      async redeemKey(key) {
        key = key.trim().toUpperCase();
        const b = fs.batch();
        b.update(fs.collection('teacherKeys').doc(key), { usedBy: me().uid, usedEmail: me().email, usedAt: Date.now() });
        b.update(fs.collection('users').doc(me().uid), { role: 'teacher', teacherKey: key });
        try { await b.commit(); } catch (e) { throw new Error(HA.t('keyInvalid')); }
        S.user.role = 'teacher';
      },
      async listLessons(filter) {
        let q = fs.collection('lessons');
        if (filter.classId) q = q.where('visibility', '==', 'class').where('classId', '==', filter.classId);
        else if (filter.mine) q = q.where('ownerUid', '==', me().uid);
        else q = q.where('visibility', '==', 'public');
        const list = all(await q.limit(300).get());
        return list.sort((a, b) => (b.created || 0) - (a.created || 0));
      },
      async getLesson(id) { const s = await fs.collection('lessons').doc(id).get(); return s.exists ? Object.assign({ id: s.id }, s.data()) : null; },
      async saveLesson(l) {
        const u = me(); const data = JSON.parse(JSON.stringify(l));
        if (l.id) { const id = l.id; delete data.id; data.updated = Date.now(); await fs.collection('lessons').doc(id).update(data); return id; }
        Object.assign(data, { ownerUid: u.uid, ownerEmail: u.email, authorRole: HA.roleOf(u), created: Date.now() });
        const ref = await fs.collection('lessons').add(data); return ref.id;
      },
      async deleteLesson(id) { await fs.collection('lessons').doc(id).delete(); },
      async createClass(name) {
        const u = me(); let code;
        for (let i = 0; i < 5; i++) { code = genCode(6); const s = await fs.collection('classCodes').doc(code).get(); if (!s.exists) break; }
        const ref = fs.collection('classes').doc();
        const c = { name, code, ownerUid: u.uid, ownerName: u.name, members: [], created: Date.now() };
        const b = fs.batch(); b.set(ref, c); b.set(fs.collection('classCodes').doc(code), { classId: ref.id, ownerUid: u.uid }); await b.commit();
        return Object.assign({ id: ref.id }, c);
      },
      async joinClass(code) {
        code = code.trim().toUpperCase();
        const s = await fs.collection('classCodes').doc(code).get().catch(() => null);
        if (!s || !s.exists) throw new Error(HA.t('classNotFound'));
        const id = s.data().classId;
        await fs.collection('classes').doc(id).update({ members: FV.arrayUnion(me().uid) });
        return { id };
      },
      async leaveClass(id) { await fs.collection('classes').doc(id).update({ members: FV.arrayRemove(me().uid) }); },
      async deleteClass(id) {
        const c = await fs.collection('classes').doc(id).get(); const b = fs.batch();
        b.delete(c.ref); if (c.exists) b.delete(fs.collection('classCodes').doc(c.data().code)); await b.commit();
      },
      async myClasses() {
        const u = me(); if (!u) return [];
        const [a, b] = await Promise.all([fs.collection('classes').where('ownerUid', '==', u.uid).get(), fs.collection('classes').where('members', 'array-contains', u.uid).get()]);
        return all(a).concat(all(b));
      },
      async hasBookAccess() {
        const u = me(); if (!u) return false; if (HA.isAdmin(u)) return true;
        const s = await fs.collection('bookAccess').doc(u.email).get().catch(() => null); return !!(s && s.exists);
      },
      async listBooks() { try { return all(await fs.collection('books').get()); } catch (e) { return []; } },
      async saveBook(b) { const d = JSON.parse(JSON.stringify(b)); if (b.id) { const id = d.id; delete d.id; await fs.collection('books').doc(id).set(d); } else { d.created = Date.now(); await fs.collection('books').add(d); } },
      async deleteBook(id) { await fs.collection('books').doc(id).delete(); },
      async listAccess() { return (await fs.collection('bookAccess').get()).docs.map((d) => d.id); },
      async addAccess(email) { await fs.collection('bookAccess').doc(email.trim().toLowerCase()).set({ added: Date.now(), by: me().email }); },
      async removeAccess(email) { await fs.collection('bookAccess').doc(email).delete(); },
      async listKeys() { return (await fs.collection('teacherKeys').get()).docs.map((d) => Object.assign({ key: d.id }, d.data())); },
      async createKey(note) { const key = 'HT-' + genCode(4) + '-' + genCode(4); await fs.collection('teacherKeys').doc(key).set({ note: note || '', created: Date.now(), usedBy: null }); return { key }; },
      async deleteKey(key) { await fs.collection('teacherKeys').doc(key).delete(); },
      async submitReport(r) { r.created = Date.now(); r.email = me() ? me().email : String(r.email || '').slice(0, 120); r.uid = me() ? me().uid : null; await fs.collection('reports').add(r); },
      async listReports() { return all(await fs.collection('reports').orderBy('created', 'desc').limit(200).get()); },
      async deleteReport(id) { await fs.collection('reports').doc(id).delete(); },
      async getReactions(ids) {
        const out = {}; ids.forEach((id) => (out[id] = { likes: 0, liked: false, comments: 0 }));
        const u = me();
        for (let i = 0; i < ids.length; i += 30) {
          const chunk = ids.slice(i, i + 30);
          const [ls, cs] = await Promise.all([
            fs.collection('likes').where('postId', 'in', chunk).get().catch(() => ({ docs: [] })),
            fs.collection('comments').where('postId', 'in', chunk).get().catch(() => ({ docs: [] }))
          ]);
          ls.docs.forEach((d) => { const x = d.data(); const r = out[x.postId]; if (r) { r.likes++; if (u && x.uid === u.uid) r.liked = true; } });
          cs.docs.forEach((d) => { const r = out[d.data().postId]; if (r) r.comments++; });
        }
        return out;
      },
      async toggleLike(id) {
        const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        const ref = fs.collection('likes').doc(id + '__' + u.uid);
        const s = await ref.get();
        if (s.exists) { await ref.delete(); return false; }
        await ref.set({ postId: id, uid: u.uid, created: Date.now() }); return true;
      },
      async listComments(id) { return all(await fs.collection('comments').where('postId', '==', id).get()).sort((a, b) => a.created - b.created); },
      async addComment(id, text) {
        const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        await fs.collection('comments').add({ postId: id, uid: u.uid, name: String(u.name || u.email).slice(0, 80), text: text.slice(0, 1000), created: Date.now() });
      },
      async deleteComment(cid) { await fs.collection('comments').doc(cid).delete(); },
      // ---- People: public profiles (no email) + follows. Two people following each other = friends.
      async saveProfile(u) {
        const name = String(u.name || u.email.split('@')[0]).slice(0, 80);
        await fs.collection('profiles').doc(u.uid).set({ name, nameLower: name.toLowerCase(), photo: String(u.photo || '').slice(0, 500), role: HA.isAdmin(u) ? 'admin' : u.role || 'student', updated: Date.now() });
      },
      async getProfile(id) { const s = await fs.collection('profiles').doc(id).get().catch(() => null); return s && s.exists ? Object.assign({ uid: id }, s.data()) : null; },
      async searchProfiles(q) {
        q = q.trim().toLowerCase(); if (!q) return [];
        const snap = await fs.collection('profiles').where('nameLower', '>=', q).where('nameLower', '<=', q + '\uf8ff').limit(20).get().catch(() => ({ docs: [] }));
        return snap.docs.map((d) => Object.assign({ uid: d.id }, d.data()));
      },
      async follow(to) {
        const u = me(); if (!u) throw new Error(HA.t('needLogin'));
        if (to === u.uid) return;
        await fs.collection('follows').doc(u.uid + '__' + to).set({ from: u.uid, to, created: Date.now() });
      },
      async unfollow(to) { await fs.collection('follows').doc(me().uid + '__' + to).delete(); },
      async listFollowing(id) { return (await fs.collection('follows').where('from', '==', id).limit(500).get()).docs.map((d) => d.data().to); },
      async listFollowers(id) { return (await fs.collection('follows').where('to', '==', id).limit(500).get()).docs.map((d) => d.data().from); },
      async listByOwner(id) { return all(await fs.collection('lessons').where('ownerUid', '==', id).where('visibility', '==', 'public').limit(100).get()).sort((a, b) => (b.created || 0) - (a.created || 0)); },
      async getExamLocks() { const s = await fs.collection('settings').doc('examLocks').get().catch(() => null); return (s && s.exists && s.data().locked) || []; },
      async setExamLock(pack, locked) { await fs.collection('settings').doc('examLocks').set({ locked: locked ? FV.arrayUnion(pack) : FV.arrayRemove(pack), updated: Date.now() }, { merge: true }); }
    };
    return A;
  }

  HA.initBackend = function () {
    const c = HA.config.firebase;
    if (c && c.apiKey && window.firebase) {
      try { HA.api = FirebaseAdapter(c); return; } catch (e) { console.error(e); }
    }
    HA.api = LocalAdapter();
  };
})();
