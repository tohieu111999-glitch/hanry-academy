/* Games hub: flashcards, speed match, 60s quiz, listening, memory, word rain, writing, tones */
(function () {
  const { esc, $, $$, shuffle, pick } = HA.ui;
  const t = HA.t;
  const G = (HA.games = {});
  const mean = (v) => HA.ui.meaningOf(v);
  const disp = (w) => HA.zh.disp(w);
  const view = () => $('#view');

  const GAMES = [
    ['flash', '🃏', 'gameFlash', 'gameFlashD', '#58cc02'],
    ['match', '⚡', 'gameMatch', 'gameMatchD', '#1cb0f6'],
    ['speed', '⏱️', 'gameSpeed', 'gameSpeedD', '#ff9600'],
    ['listen', '🎧', 'gameListen', 'gameListenD', '#ce82ff'],
    ['memory', '🧠', 'gameMemory', 'gameMemoryD', '#ff4b4b'],
    ['rain', '🌧️', 'gameRain', 'gameRainD', '#2b70c9'],
    ['write', '✍️', 'gameWrite', 'gameWriteD', '#ffc800'],
    ['tone', '🎵', 'gameTone', 'gameToneD', '#00c2a8']
  ];

  function parseQ(q) { const o = {}; (q || '').split('&').forEach((kv) => { const [k, v] = kv.split('='); if (k) o[k] = decodeURIComponent(v || ''); }); return o; }
  function poolFrom(q) {
    if (q.post) {
      const P = HA.lessonById[q.post] || (HA.feed.allPosts || []).find((x) => x.id === q.post);
      return P ? (P.vocab || []).slice() : [];
    }
    return HA.nb.list().filter((x) => !x.lang || x.lang === 'zh').map((x) => ({ w: x.w, p: x.p, vi: x.vi, en: x.en }));
  }
  function srcLabel(q) {
    if (q.post) { const P = HA.lessonById[q.post]; return P ? HA.tr(P.title) || P.title.zh : t('tabVocab'); }
    return t('fromNotebook');
  }
  const qs = (q) => Object.entries(q).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  function bestKey(g, q) { return g + ':' + (q.post || 'nb'); }
  function saveBest(g, q, score, lowerBetter) {
    const k = bestKey(g, q); const b = HA.state.data.games[k];
    if (b == null || (lowerBetter ? score < b : score > b)) { HA.state.data.games[k] = score; HA.saveData(); return true; }
    return false;
  }

  /* ---------- Sound effects ---------- */
  let ac = null;
  G.beep = function (good) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      (good ? [660, 880] : [220, 180]).forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = good ? 'sine' : 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.11);
        g.gain.exponentialRampToValueAtTime(0.1, ac.currentTime + i * 0.11 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.11 + 0.18);
        o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + i * 0.11); o.stop(ac.currentTime + i * 0.11 + 0.2);
      });
    } catch (e) {}
  };

  /* ---------- Game cards (shown inside the Notebook page) ---------- */
  G.hubHTML = function (q) {
    q = q || {};
    return '<div class="games-grid">' + GAMES.map(([id, icon, n, d, c]) => {
      const b = HA.state.data.games[bestKey(id, q)];
      return '<a class="game-card" style="--c:' + c + '" href="#/game/' + id + (qs(q) ? '?' + qs(q) : '') + '"><span class="g-icon">' + icon + '</span><b>' + t(n) + '</b><small>' + t(d) + '</small>' + (b != null ? '<span class="g-best">🏆 ' + b + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  };
  HA.route(/^\/game\/(\w+)(?:\?(.*))?$/, function (game, query) { G.play(game, parseQ(query)); });

  G.play = function (game, q) {
    const pool = poolFrom(q).filter((v) => v && v.w);
    const uniq = []; const seen = new Set(); pool.forEach((v) => { if (!seen.has(v.w)) { seen.add(v.w); uniq.push(v); } });
    const meta = GAMES.find((g) => g[0] === game);
    if (!meta) { location.hash = '#/notebook'; return; }
    if (uniq.length < 4 && game !== 'write' && game !== 'flash') {
      view().innerHTML = '<div class="empty card"><p>' + t('needWords') + '</p><a class="btn green" href="#/notebook">' + t('back') + '</a></div>';
      return;
    }
    view().innerHTML = '<div class="game-head" style="--c:' + meta[4] + '"><a class="back" href="' + (q.post ? '#/post/' + encodeURIComponent(q.post) : '#/notebook') + '">← ' + t(q.post ? 'back' : 'navNotebook') + '</a><h2>' + meta[1] + ' ' + t(meta[2]) + '</h2><span class="chip">' + esc(srcLabel(q)) + ' · ' + uniq.length + ' ' + t('words') + '</span></div><div id="game" class="game-live"></div>';
    const box = $('#game');
    ({ flash, match, speed, listen, memory, rain, write: writeGame, tone })[game](box, uniq, q);
  };

  function endScreen(box, html, q, game) {
    box.innerHTML = '<div class="card center game-end"><div class="emoji-big">🏁</div><h2>' + t('gameOver') + '</h2>' + html +
      '<div class="row center wrap"><button class="btn green lg" id="again">🔁 ' + t('retry') + '</button><a class="btn ghost lg" href="#/notebook">' + t('navNotebook') + '</a></div></div>';
    $('#again', box).onclick = () => G.play(game, q);
  }

  /* ---------- 1. Flashcards (SRS) ---------- */
  function flash(box, pool, q) {
    let cards = !q.post ? HA.nb.due().map((x) => ({ w: x.w, p: x.p, vi: x.vi, en: x.en })) : shuffle(pool).slice(0, 20);
    if (!cards.length) cards = shuffle(pool).slice(0, 20);
    if (!cards.length) { box.innerHTML = '<div class="empty card">' + t('notebookEmpty') + '</div>'; return; }
    cards = shuffle(cards);
    let i = 0, known = 0;
    function show() {
      if (i >= cards.length) { HA.addXP(Math.max(2, known)); return endScreen(box, '<p class="big">✅ ' + known + ' / ' + cards.length + '</p>', q, 'flash'); }
      const c = cards[i];
      box.innerHTML = '<div class="flash-wrap"><div class="muted center">' + (i + 1) + ' / ' + cards.length + '</div>' +
        '<div class="flashcard" id="fc"><div class="fc-front"><span class="zh huge">' + esc(disp(c.w)) + '</span><small class="muted">' + t('flip') + ' ↻</small></div>' +
        '<div class="fc-back"><span class="zh lg">' + esc(disp(c.w)) + '</span><div class="py">' + esc(HA.zh.phon(c.p || HA.zh.pinyinOf(c.w))) + '</div><div>' + esc(mean(c) || HA.ui.meaningOf(HA.ui.noteItem(c.w))) + '</div></div></div>' +
        '<div class="row center"><button class="btn red lg" id="no">✘ ' + t('dontKnow') + '</button><button class="btn blue" id="sp">🔊</button><button class="btn green lg" id="yes">✔ ' + t('know') + '</button></div></div>';
      $('#fc', box).onclick = () => { $('#fc', box).classList.toggle('flipped'); HA.zh.speak(c.w); };
      $('#sp', box).onclick = () => HA.zh.speak(c.w);
      const grade = (ok) => { if (ok) known++; if (HA.nb.has(c.w)) HA.nb.grade(c.w, ok); if (!ok && !!q.post) cards.push(c); i++; show(); };
      $('#yes', box).onclick = () => grade(true);
      $('#no', box).onclick = () => grade(false);
    }
    show();
  }

  /* ---------- 2. Speed match ---------- */
  function match(box, pool, q) {
    let round = 0, mistakes = 0; const t0 = Date.now(); const ROUNDS = 3;
    let timer = setInterval(() => { const el = $('#mTime', box); if (!el) return clearInterval(timer); el.textContent = ((Date.now() - t0) / 1000).toFixed(1) + 's'; }, 100);
    function newRound() {
      if (round >= ROUNDS) {
        clearInterval(timer);
        const secs = +((Date.now() - t0) / 1000 + mistakes * 2).toFixed(1);
        const rec = saveBest('match', q, secs, true);
        HA.addXP(10);
        return endScreen(box, '<p class="big">⏱ ' + secs + 's</p><p class="muted">(+2s × ' + mistakes + ' ✘)</p>' + (rec ? '<p>🏆 ' + t('best') + '!</p>' : ''), q, 'match');
      }
      round++;
      const items = pick(pool, 6);
      const tiles = shuffle(items.map((v) => ({ v, side: 'zh' })).concat(items.map((v) => ({ v, side: 'm' }))));
      box.innerHTML = '<div class="row between"><b>' + t('unit') + ' ' + round + '/' + ROUNDS + '</b><b id="mTime">0.0s</b></div><div class="match-grid">' +
        tiles.map((x) => '<button class="mtile ' + (x.side === 'zh' ? 'zh lg' : '') + '" data-w="' + esc(x.v.w) + '" data-s="' + x.side + '">' + esc(x.side === 'zh' ? disp(x.v.w) : mean(x.v).slice(0, 50)) + '</button>').join('') + '</div>';
      let sel = null, left = items.length;
      $('.match-grid', box).onclick = (e) => {
        const b = e.target.closest('.mtile'); if (!b || b.classList.contains('ok')) return;
        if (b.dataset.s === 'zh') HA.zh.speak(b.dataset.w);
        if (!sel) { sel = b; b.classList.add('sel'); return; }
        if (sel === b) { b.classList.remove('sel'); sel = null; return; }
        if (sel.dataset.w === b.dataset.w && sel.dataset.s !== b.dataset.s) {
          [sel, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); }); G.beep(true);
          if (--left === 0) setTimeout(newRound, 350);
        } else { mistakes++; G.beep(false); const a = sel; [a, b].forEach((x) => x.classList.add('bad')); setTimeout(() => [a, b].forEach((x) => x.classList.remove('bad', 'sel')), 400); }
        sel = null;
      };
    }
    newRound();
  }

  /* ---------- 3. 60-second challenge ---------- */
  function speed(box, pool, q) {
    let score = 0, streak = 0, left = 60;
    const timer = setInterval(() => { left--; const el = $('#sTime', box); if (!el) return clearInterval(timer); el.textContent = left + 's'; el.parentElement.style.setProperty('--p', (left / 60) * 100); if (left <= 0) { clearInterval(timer); end(); } }, 1000);
    function end() { const rec = saveBest('speed', q, score); HA.addXP(Math.max(3, score)); endScreen(box, '<p class="big">⭐ ' + score + '</p>' + (rec ? '<p>🏆 ' + t('best') + '!</p>' : ''), q, 'speed'); }
    function ask() {
      const v = pick(pool, 1)[0];
      const opts = shuffle([v].concat(pick(pool.filter((x) => x.w !== v.w && mean(x) !== mean(v)), 3)));
      const rev = Math.random() < 0.4;
      box.innerHTML = '<div class="row between"><div class="timer-bar" style="--p:' + (left / 60) * 100 + '"><span id="sTime">' + left + 's</span></div><b>⭐ ' + score + (streak > 2 ? ' 🔥x' + streak : '') + '</b></div>' +
        '<div class="p-prompt">' + (rev ? '<span class="big-text">' + esc(mean(v)) + '</span>' : '<span class="zh huge">' + esc(disp(v.w)) + '</span>') + '</div>' +
        '<div class="p-opts two">' + opts.map((o, i) => '<button class="p-opt" data-i="' + i + '">' + (rev ? '<span class="zh lg">' + esc(disp(o.w)) + '</span>' : esc(mean(o)).slice(0, 70)) + '</button>').join('') + '</div>';
      $('.p-opts', box).onclick = (e) => {
        const b = e.target.closest('.p-opt'); if (!b) return;
        const ok = opts[+b.dataset.i].w === v.w;
        b.classList.add(ok ? 'right' : 'wrong'); G.beep(ok);
        if (ok) { score += 1 + (streak >= 3 ? 1 : 0); streak++; } else { streak = 0; $$('.p-opt', box)[opts.indexOf(v)].classList.add('right'); }
        setTimeout(() => left > 0 && ask(), ok ? 250 : 700);
      };
    }
    ask();
  }

  /* ---------- 4. Listening ---------- */
  function listen(box, pool, q) {
    if (!HA.zh.canSpeak()) { box.innerHTML = '<div class="empty card">' + t('noTts') + '</div>'; return; }
    const qsList = pick(pool, Math.min(10, pool.length)); let i = 0, score = 0;
    function ask() {
      if (i >= qsList.length) { saveBest('listen', q, score); HA.addXP(score); return endScreen(box, '<p class="big">🎧 ' + score + ' / ' + qsList.length + '</p>', q, 'listen'); }
      const v = qsList[i];
      const opts = shuffle([v].concat(pick(pool.filter((x) => x.w !== v.w), 3)));
      box.innerHTML = '<div class="muted center">' + (i + 1) + '/' + qsList.length + '</div><div class="p-prompt"><button class="btn purple xl" id="play">🔊</button><button class="btn ghost" id="slow">🐢</button></div>' +
        '<div class="p-opts two">' + opts.map((o, k) => '<button class="p-opt" data-i="' + k + '"><span class="zh lg">' + esc(disp(o.w)) + '</span></button>').join('') + '</div>';
      $('#play', box).onclick = () => HA.zh.speak(v.w);
      $('#slow', box).onclick = () => HA.zh.speak(v.w, 0.55);
      setTimeout(() => HA.zh.speak(v.w), 250);
      $('.p-opts', box).onclick = (e) => {
        const b = e.target.closest('.p-opt'); if (!b || b.disabled) return;
        const ok = opts[+b.dataset.i].w === v.w; if (ok) score++;
        $$('.p-opt', box).forEach((x, k) => { x.disabled = true; if (opts[k].w === v.w) { x.classList.add('right'); x.innerHTML += '<small class="py">' + esc(HA.zh.phon(v.p)) + ' · ' + esc(mean(v)).slice(0, 40) + '</small>'; } });
        if (!ok) b.classList.add('wrong');
        G.beep(ok); i++; setTimeout(ask, ok ? 900 : 1700);
      };
    }
    ask();
  }

  /* ---------- 5. Memory flip ---------- */
  function memory(box, pool, q) {
    const items = pick(pool, 6);
    const cards = shuffle(items.map((v) => ({ v, s: 'zh' })).concat(items.map((v) => ({ v, s: 'm' }))));
    let open = [], found = 0, moves = 0; const t0 = Date.now();
    box.innerHTML = '<div class="row between"><b id="mv">0</b><span class="muted">' + t('gameMemoryD') + '</span></div><div class="mem-grid">' +
      cards.map((c, i) => '<button class="mem" data-i="' + i + '"><span class="mem-in"><span class="mem-back">汉</span><span class="mem-face ' + (c.s === 'zh' ? 'zh lg' : '') + '">' + esc(c.s === 'zh' ? disp(c.v.w) : mean(c.v).slice(0, 40)) + '</span></span></button>').join('') + '</div>';
    $('.mem-grid', box).onclick = (e) => {
      const b = e.target.closest('.mem'); if (!b || b.classList.contains('up') || open.length >= 2) return;
      b.classList.add('up'); const c = cards[+b.dataset.i]; if (c.s === 'zh') HA.zh.speak(c.v.w);
      open.push(b);
      if (open.length === 2) {
        moves++; $('#mv', box).textContent = moves;
        const [a, d] = open.map((x) => cards[+x.dataset.i]);
        if (a.v.w === d.v.w && a.s !== d.s) { open.forEach((x) => x.classList.add('ok')); open = []; G.beep(true); if (++found === items.length) { const sc = moves; saveBest('memory', q, sc, true); HA.addXP(8); setTimeout(() => endScreen(box, '<p class="big">🧠 ' + moves + ' · ⏱ ' + Math.round((Date.now() - t0) / 1000) + 's</p>', q, 'memory'), 600); } }
        else setTimeout(() => { open.forEach((x) => x.classList.remove('up')); open = []; }, 900);
      }
    };
  }

  /* ---------- 6. Word rain ---------- */
  function rain(box, pool, q) {
    box.innerHTML = '<div class="row between"><b id="rScore">⭐ 0</b><b id="rLives">❤️❤️❤️</b></div><div class="rain-field" id="field"></div><input class="input big center" id="rIn" placeholder="pinyin…" autocomplete="off" autocapitalize="off" spellcheck="false"><p class="tiny muted center">' + t('exTypeHint') + '</p>';
    const field = $('#field', box), inp = $('#rIn', box);
    inp.focus();
    let drops = [], score = 0, lives = 3, speedF = 1, last = performance.now(), spawnT = 0, alive = true;
    function spawn() {
      const v = pick(pool, 1)[0];
      const el = document.createElement('div'); el.className = 'drop zh'; el.textContent = disp(v.w);
      el.style.left = Math.random() * 80 + 5 + '%';
      field.appendChild(el);
      drops.push({ v, el, y: -40, key: HA.zh.normPinyin(v.p || HA.zh.pinyinOf(v.w)) });
    }
    function loop(now) {
      if (!alive || !document.body.contains(field)) return;
      const dt = (now - last) / 1000; last = now; spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = Math.max(0.9, 2.6 - score * 0.06); }
      const H = field.clientHeight;
      drops.forEach((d) => { d.y += dt * 40 * speedF; d.el.style.transform = 'translateY(' + d.y + 'px)'; });
      const missed = drops.filter((d) => d.y > H - 30);
      missed.forEach((d) => { d.el.classList.add('miss'); setTimeout(() => d.el.remove(), 400); lives--; G.beep(false); field.insertAdjacentHTML('beforeend', '<div class="reveal" style="left:' + d.el.style.left + '">' + esc(d.v.p) + '</div>'); });
      drops = drops.filter((d) => d.y <= H - 30);
      $('#rLives', box).textContent = '❤️'.repeat(Math.max(0, lives)) || '💔';
      if (lives <= 0) { alive = false; const rec = saveBest('rain', q, score); HA.addXP(Math.max(3, score)); return endScreen(box, '<p class="big">⭐ ' + score + '</p>' + (rec ? '<p>🏆 ' + t('best') + '!</p>' : ''), q, 'rain'); }
      requestAnimationFrame(loop);
    }
    inp.oninput = () => {
      const val = HA.zh.normPinyin(inp.value);
      const hit = drops.find((d) => d.key === val);
      if (hit) {
        hit.el.classList.add('pop'); setTimeout(() => hit.el.remove(), 300); drops = drops.filter((d) => d !== hit);
        score++; speedF = 1 + score * 0.04; inp.value = ''; G.beep(true); HA.zh.speak(hit.v.w);
        $('#rScore', box).textContent = '⭐ ' + score;
      }
    };
    requestAnimationFrame((n) => { last = n; loop(n); });
  }

  /* ---------- 7. Writing (Hanzi Writer) ---------- */
  let hwLoading = null;
  G.loadHW = function () {
    if (window.HanziWriter) return Promise.resolve();
    if (hwLoading) return hwLoading;
    hwLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return hwLoading;
  };
  G.writerOpts = (size) => {
    const dark = HA.state.settings.dark;
    return { width: size, height: size, padding: 6, showOutline: true, strokeColor: dark ? '#e8eef7' : '#1f2a37', outlineColor: dark ? '#3a4658' : '#dde3ea', drawingColor: '#1cb0f6', highlightColor: '#58cc02', radicalColor: '#ff9600', strokeAnimationSpeed: 1.2, delayBetweenStrokes: 180 };
  };
  G.writeModal = function (word) {
    const chars = [...disp(word)].filter((c) => HA.zh.isHan(c));
    const m = HA.ui.modal('<h3>✍️ ' + t('gameWrite') + ' <span class="zh">' + esc(disp(word)) + '</span> <small class="muted">' + esc(HA.zh.pinyinOf(word)) + '</small></h3><div class="write-row" id="wr">' + chars.map((c, i) => '<div class="wbox"><div id="hw' + i + '" class="hw grid-bg"></div><div class="row center"><button class="btn sm blue" data-a="anim" data-i="' + i + '">▶ ' + t('animate') + '</button><button class="btn sm green" data-a="quiz" data-i="' + i + '">✍ ' + t('quizMe') + '</button></div></div>').join('') + '</div><p class="tiny muted">Hanzi Writer · Make Me a Hanzi (Arphic Public License)</p>');
    G.loadHW().then(() => {
      const ws = chars.map((c, i) => HanziWriter.create('hw' + i, c, G.writerOpts(Math.min(220, window.innerWidth - 80))));
      m.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]'); if (!b) return;
        const w = ws[+b.dataset.i];
        if (b.dataset.a === 'anim') w.animateCharacter();
        else w.quiz({ onComplete: () => { G.beep(true); HA.ui.toast('🎉 ' + t('correct'), 'good'); } });
      });
    }).catch(() => HA.ui.toast('Hanzi Writer: offline', 'bad'));
  };
  function writeGame(box, pool, q) {
    const chars = [];
    pool.forEach((v) => [...v.w].forEach((c) => { if (HA.zh.isHan(c) && !chars.find((x) => x.c === c)) chars.push({ c, v }); }));
    if (!chars.length) { box.innerHTML = '<div class="empty card">' + t('needWords') + '</div>'; return; }
    const list = shuffle(chars).slice(0, 10); let i = 0, perfect = 0;
    box.innerHTML = '<div class="center">' + t('loading') + '</div>';
    G.loadHW().then(() => {
      function show() {
        if (i >= list.length) { HA.addXP(perfect + 3); saveBest('write', q, perfect); return endScreen(box, '<p class="big">✍️ ' + perfect + ' / ' + list.length + '</p>', q, 'write'); }
        const { c, v } = list[i];
        const ch = HA.state.settings.script === 't' ? HA.zh.toTradChar(c) : c;
        box.innerHTML = '<div class="muted center">' + (i + 1) + '/' + list.length + '</div><div class="write-game"><div class="wg-info"><div class="py big">' + esc(HA.zh.phon(HA.zh.analyze(c)[0].py[0] || '')) + '</div><div>' + esc(mean(v)) + '</div><div class="muted small">' + t('tabVocab') + ': <span class="zh">' + esc(disp(v.w)) + '</span></div></div>' +
          '<div id="hwg" class="hw grid-bg big"></div><div class="row center"><button class="btn ghost" id="hint">💡 ' + t('hint') + '</button><button class="btn blue" id="anim">▶ ' + t('animate') + '</button><button class="btn ghost" id="skip">' + t('skip') + ' →</button></div></div>';
        const size = Math.min(300, window.innerWidth - 60);
        const w = HanziWriter.create('hwg', ch, Object.assign(G.writerOpts(size), { showOutline: false, showHintAfterMisses: 3 }));
        let misses = 0;
        w.quiz({ onMistake: () => { misses++; }, onComplete: () => { if (misses <= 2) perfect++; G.beep(true); HA.zh.speak(c); setTimeout(() => { i++; show(); }, 900); } });
        $('#hint', box).onclick = () => { w.showOutline(); misses += 2; };
        $('#anim', box).onclick = () => { misses += 3; w.cancelQuiz(); w.animateCharacter({ onComplete: () => w.quiz({ onMistake: () => misses++, onComplete: () => { G.beep(true); setTimeout(() => { i++; show(); }, 700); } }) }); };
        $('#skip', box).onclick = () => { i++; show(); };
      }
      show();
    }).catch(() => { box.innerHTML = '<div class="empty card">Hanzi Writer could not load (offline).</div>'; });
  }

  /* ---------- 8. Tone quiz ---------- */
  function tone(box, pool, q) {
    const items = [];
    pool.forEach((v) => {
      const toks = HA.zh.analyze(v.w).filter((x) => x.han);
      toks.forEach((tk) => [...tk.text].forEach((c, k) => { const py = tk.py[k]; if (py && HA.zh.toneOf(py) <= 4 && !items.find((x) => x.c === c)) items.push({ c, py, v }); }));
    });
    const list = shuffle(items).slice(0, 12); let i = 0, score = 0;
    const marks = ['ˉ 1', 'ˊ 2', 'ˇ 3', 'ˋ 4'];
    function ask() {
      if (i >= list.length) { saveBest('tone', q, score); HA.addXP(score); return endScreen(box, '<p class="big">🎵 ' + score + ' / ' + list.length + '</p>', q, 'tone'); }
      const it = list[i]; const base = HA.zh.stripTones(it.py).replace(/v/g, 'ü');
      box.innerHTML = '<div class="muted center">' + (i + 1) + '/' + list.length + '</div><div class="p-prompt col"><span class="zh huge">' + esc(disp(it.c)) + '</span><div class="big-text">' + esc(base) + ' ?</div><button class="btn purple" id="pl">🔊</button></div>' +
        '<div class="p-opts four">' + [1, 2, 3, 4].map((n) => '<button class="p-opt tone-btn t' + n + '" data-n="' + n + '"><b>' + esc(HA.zh.numToMark(base.replace(/ü/g, 'v') + n)) + '</b><small>' + t('tone') + ' ' + marks[n - 1] + '</small></button>').join('') + '</div>';
      $('#pl', box).onclick = () => HA.zh.speak(it.c);
      setTimeout(() => HA.zh.speak(it.c), 250);
      $('.p-opts', box).onclick = (e) => {
        const b = e.target.closest('.p-opt'); if (!b || b.disabled) return;
        const right = HA.zh.toneOf(it.py); const ok = +b.dataset.n === right; if (ok) score++;
        $$('.p-opt', box).forEach((x) => { x.disabled = true; if (+x.dataset.n === right) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        G.beep(ok); i++; setTimeout(ask, ok ? 700 : 1400);
      };
    }
    if (!list.length) { box.innerHTML = '<div class="empty card">' + t('needWords') + '</div>'; return; }
    ask();
  }
})();
