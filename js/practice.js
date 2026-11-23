/* Duolingo-style practice session */
(function () {
  const { esc, $, $$, shuffle, pick } = HA.ui;
  const t = HA.t;
  const P = (HA.practice = {});

  /* ---------- Sound effects (WebAudio) ---------- */
  let ac = null;
  P.beep = function (good) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const notes = good ? [660, 880] : [220, 180];
      notes.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = good ? 'sine' : 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.11);
        g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + i * 0.11 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.11 + 0.18);
        o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + i * 0.11); o.stop(ac.currentTime + i * 0.11 + 0.2);
      });
    } catch (e) {}
  };

  const mean = (v) => HA.ui.meaningOf(v);
  const disp = (w) => HA.zh.disp(w);

  /* ---------- Exercise generation ---------- */
  P.build = function (L) {
    const V = L.vocab.filter((v) => v.w);
    const levelPool = HA.lessons.filter((x) => Math.abs(x.level - L.level) <= 1).flatMap((x) => x.vocab);
    const distract = (v, n, key) => {
      const own = V.filter((x) => x.w !== v.w);
      const extra = levelPool.filter((x) => x.w !== v.w && !own.includes(x));
      const seen = new Set([key(v)]);
      const out = [];
      for (const x of shuffle(own).concat(shuffle(extra))) { const k = key(x); if (!seen.has(k) && k) { seen.add(k); out.push(x); } if (out.length >= n) break; }
      return out;
    };
    const ex = [];
    const vs = shuffle(V);
    vs.slice(0, 4).forEach((v) => ex.push({ type: 'meaning', v, opts: shuffle([v].concat(distract(v, 3, mean))) }));
    vs.slice(4, 6).concat(vs.slice(0, Math.max(0, 2 - vs.slice(4, 6).length))).forEach((v) => ex.push({ type: 'hanzi', v, opts: shuffle([v].concat(distract(v, 3, (x) => x.w))) }));
    if (HA.zh.canSpeak()) vs.slice(6, 8).concat(vs.slice(1, 1 + Math.max(0, 2 - vs.slice(6, 8).length))).forEach((v) => ex.push({ type: 'listen', v, opts: shuffle([v].concat(distract(v, 3, (x) => x.w))) }));
    if (V.length >= 4) ex.splice(3, 0, { type: 'match', pairs: pick(V, Math.min(5, V.length)) });
    // sentence ordering
    const lines = shuffle(L.text.filter((x) => { const n = HA.zh.analyze(x.zh).filter((k) => k.han).length; return n >= 3 && n <= 9; })).slice(0, 2);
    lines.forEach((x) => {
      const toks = HA.zh.analyze(x.zh).filter((k) => k.han).map((k) => k.text);
      ex.push({ type: 'order', line: x, toks, bank: shuffle(toks.map((w, i) => ({ w, i }))) });
    });
    // fill in blank
    shuffle(V.filter((v) => v.ex && v.ex[0].includes(v.w) && v.ex[0] !== v.w)).slice(0, 2).forEach((v) => {
      ex.push({ type: 'fill', v, sentence: v.ex[0], opts: shuffle([v].concat(distract(v, 3, (x) => x.w))) });
    });
    // type pinyin
    const tp = vs.find((v) => v.p && !/[A-Z]/.test(v.p[0])) || vs[0];
    if (tp) ex.push({ type: 'pinyin', v: tp });
    // comprehension TF from lesson questions
    L.questions.filter((q) => q.type === 'tf').slice(0, 1).forEach((q) => ex.push({ type: 'tf', q }));
    return ex.filter((e) => e.type !== 'meaning' || e.opts.length >= 2);
  };

  document.addEventListener('keydown', (e) => { if (P._key && document.querySelector('.practice-overlay') && e.target.tagName !== 'INPUT') P._key(e); });
  /* ---------- Session runner ---------- */
  P.start = function (L, onDone) { P.run(P.build(L), { title: HA.tr(L.title), onDone }); };
  P.run = function (exercises, opts) {
    opts = opts || {};
    const queue = exercises.slice();
    const total = queue.length;
    let done = 0, hearts = 5, right = 0, tries = 0;
    const start = Date.now();
    const ov = document.createElement('div');
    ov.className = 'practice-overlay';
    document.body.appendChild(ov);
    document.body.classList.add('noscroll');
    const close = () => { P._key = null; ov.remove(); document.body.classList.remove('noscroll'); window.speechSynthesis && speechSynthesis.cancel(); };

    function frame(inner, footer) {
      ov.innerHTML = '<div class="p-top"><button class="icon-btn" id="pClose" aria-label="close">✕</button><div class="p-bar"><i style="width:' + (done / total) * 100 + '%"></i></div><div class="p-hearts">❤️ ' + hearts + '</div></div>' +
        '<div class="p-body">' + inner + '</div><div class="p-foot" id="pFoot">' + footer + '</div>';
      $('#pClose', ov).onclick = async () => { if (await HA.ui.confirm(t('close') + '?')) close(); };
    }
    function next() {
      if (hearts <= 0) return fail();
      if (!queue.length) return finish();
      const ex = queue.shift();
      render(ex);
    }
    function checkBtn(disabled) { return '<button class="btn green lg" id="pCheck"' + (disabled ? ' disabled' : '') + '>' + t('check') + '</button>'; }
    function feedback(ok, ex, answerHTML) {
      tries++;
      if (ok) { right++; done++; } else { hearts--; queue.push(ex); }
      P.beep(ok);
      const foot = $('#pFoot', ov);
      foot.className = 'p-foot ' + (ok ? 'good' : 'bad');
      foot.innerHTML = '<div class="fb"><b>' + (ok ? '🎉 ' + t('correct') : '😕 ' + t('wrong')) + '</b>' + (!ok && answerHTML ? '<div>' + t('answerIs') + ' ' + answerHTML + '</div>' : '') + '</div><button class="btn ' + (ok ? 'green' : 'red') + ' lg" id="pNext">' + t('continue') + '</button>';
      $('#pNext', ov).onclick = next;
      $('#pNext', ov).focus();
      ov.querySelector('.p-hearts').textContent = '❤️ ' + hearts;
      ov.querySelector('.p-bar i').style.width = (done / total) * 100 + '%';
    }
    function choiceUI(ex, title, promptHTML, optLabel, isRight, answerHTML) {
      frame('<h2 class="p-title">' + title + '</h2>' + promptHTML + '<div class="p-opts">' + ex.opts.map((o, i) => '<button class="p-opt" data-i="' + i + '"><span class="k">' + (i + 1) + '</span>' + optLabel(o) + '</button>').join('') + '</div>', checkBtn(true));
      let sel = null;
      ov.querySelector('.p-opts').onclick = (e) => {
        const b = e.target.closest('.p-opt'); if (!b) return;
        $$('.p-opt', ov).forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = +b.dataset.i;
        $('#pCheck', ov).disabled = false;
        if (ex.type !== 'meaning') { const w = ex.opts[sel].w; if (ex.type === 'hanzi' || ex.type === 'listen') HA.zh.speak(w); }
      };
      P._key = (e) => { const n = +e.key; if (n >= 1 && n <= ex.opts.length) $$('.p-opt', ov)[n - 1].click(); if (e.key === 'Enter') { const b = $('#pCheck', ov) || $('#pNext', ov); if (b && !b.disabled) b.click(); } };
      $('#pCheck', ov).onclick = () => {
        const ok = isRight(ex.opts[sel]);
        $$('.p-opt', ov).forEach((x, i) => { x.disabled = true; if (isRight(ex.opts[i])) x.classList.add('right'); else if (i === sel) x.classList.add('wrong'); });
        feedback(ok, ex, answerHTML);
      };
    }
    function render(ex) {
      P._key = null;
      const v = ex.v;
      if (ex.type === 'meaning') {
        choiceUI(ex, t('exMeaning'), '<div class="p-prompt"><button class="icon-btn big" data-sp="' + esc(v.w) + '">🔊</button><span class="zh huge">' + HA.R(v.w, { tip: false }) + '</span></div>', (o) => esc(mean(o)), (o) => o.w === v.w, esc(mean(v)));
        HA.zh.speak(v.w);
      } else if (ex.type === 'hanzi') {
        choiceUI(ex, t('exHanzi'), '<div class="p-prompt"><span class="big-text">“' + esc(mean(v)) + '”</span></div>', (o) => '<span class="zh lg">' + esc(disp(o.w)) + '</span>', (o) => o.w === v.w, '<span class="zh">' + esc(disp(v.w)) + '</span> ' + esc(HA.zh.phon(v.p)));
      } else if (ex.type === 'listen') {
        choiceUI(ex, t('exListen'), '<div class="p-prompt"><button class="btn blue xl" data-sp="' + esc(v.w) + '">🔊</button><button class="btn ghost" data-spslow="' + esc(v.w) + '">🐢</button></div>', (o) => '<span class="zh lg">' + esc(disp(o.w)) + '</span>', (o) => o.w === v.w, '<span class="zh">' + esc(disp(v.w)) + '</span> ' + esc(HA.zh.phon(v.p)));
        setTimeout(() => HA.zh.speak(v.w), 300);
      } else if (ex.type === 'fill') {
        const parts = ex.sentence.split(v.w);
        const sentHTML = parts.map((p) => HA.R(p)).join('<span class="blank">＿＿</span>');
        choiceUI(ex, t('exFill'), '<div class="p-prompt col"><div class="zh lg">' + sentHTML + '</div>' + (HA.state.settings.lang === 'vi' && v.ex[1] ? '<div class="muted">' + esc(v.ex[1]) + '</div>' : '') + '</div>', (o) => '<span class="zh lg">' + esc(disp(o.w)) + '</span>', (o) => o.w === v.w, '<span class="zh">' + esc(disp(ex.sentence)) + '</span>');
      } else if (ex.type === 'tf') {
        ex.opts = [{ w: '1' }, { w: '0' }];
        choiceUI(ex, t('exTF'), '<div class="p-prompt col"><div class="zh lg">' + HA.R(ex.q.q) + '</div>' + (HA.state.settings.lang === 'vi' && ex.q.qvi ? '<div class="muted">' + esc(ex.q.qvi) + '</div>' : '') + '</div>', (o) => (o.w === '1' ? '✔ ' + t('trueW') + ' 对' : '✘ ' + t('falseW') + ' 错'), (o) => (o.w === '1') === ex.q.a, ex.q.a ? t('trueW') : t('falseW'));
      } else if (ex.type === 'match') {
        const colL = shuffle(ex.pairs), colR = shuffle(ex.pairs);
        frame('<h2 class="p-title">' + t('exMatch') + '</h2><div class="match"><div class="mcol">' + colL.map((p) => '<button class="mt zh lg" data-w="' + esc(p.w) + '" data-s="L">' + esc(disp(p.w)) + '</button>').join('') + '</div><div class="mcol">' + colR.map((p) => '<button class="mt" data-w="' + esc(p.w) + '" data-s="R">' + esc(mean(p)).slice(0, 60) + '</button>').join('') + '</div></div>', '<span class="muted">' + t('exMatch') + '</span>');
        let selL = null, selR = null, matched = 0, mistakes = 0;
        ov.querySelector('.match').onclick = (e) => {
          const b = e.target.closest('.mt'); if (!b || b.classList.contains('ok')) return;
          if (b.dataset.s === 'L') { HA.zh.speak(b.dataset.w); $$('.mt[data-s=L]', ov).forEach((x) => x.classList.remove('sel')); selL = b; } else { $$('.mt[data-s=R]', ov).forEach((x) => x.classList.remove('sel')); selR = b; }
          b.classList.add('sel');
          if (selL && selR) {
            if (selL.dataset.w === selR.dataset.w) { [selL, selR].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); }); matched++; P.beep(true); }
            else { mistakes++; [selL, selR].forEach((x) => { x.classList.add('bad'); const y = x; setTimeout(() => y.classList.remove('bad', 'sel'), 450); }); P.beep(false); }
            selL = selR = null;
            if (matched === ex.pairs.length) { tries++; right++; done++; if (mistakes > 2) hearts--; setTimeout(next, 500); }
          }
        };
      } else if (ex.type === 'order') {
        const trans = HA.tr(ex.line) || ex.line.vi;
        const answer = [];
        frame('<h2 class="p-title">' + t('exOrder') + '</h2><div class="p-prompt col"><div class="big-text">“' + esc(trans) + '”</div><button class="icon-btn" data-sp="' + esc(ex.line.zh) + '">🔊</button></div><div class="answer-line" id="ansLine"></div><div class="bank" id="bank">' + ex.bank.map((b, k) => '<button class="tile zh" data-k="' + k + '">' + esc(disp(b.w)) + '</button>').join('') + '</div>', checkBtn(true));
        const draw = () => {
          $('#ansLine', ov).innerHTML = answer.map((k) => '<button class="tile zh" data-k="' + k + '">' + esc(disp(ex.bank[k].w)) + '</button>').join('');
          $$('#bank .tile', ov).forEach((x) => (x.style.visibility = answer.includes(+x.dataset.k) ? 'hidden' : 'visible'));
          $('#pCheck', ov).disabled = !answer.length;
        };
        $('#bank', ov).onclick = (e) => { const b = e.target.closest('.tile'); if (!b) return; answer.push(+b.dataset.k); HA.zh.speak(ex.bank[+b.dataset.k].w); draw(); };
        $('#ansLine', ov).onclick = (e) => { const b = e.target.closest('.tile'); if (!b) return; answer.splice(answer.indexOf(+b.dataset.k), 1); draw(); };
        $('#pCheck', ov).onclick = () => {
          const built = answer.map((k) => ex.bank[k].w).join('');
          const ok = built === ex.toks.join('');
          feedback(ok, ex, '<span class="zh">' + esc(disp(ex.line.zh)) + '</span>');
          if (ok) HA.zh.speak(ex.line.zh);
        };
      } else if (ex.type === 'pinyin') {
        frame('<h2 class="p-title">' + t('exType') + '</h2><div class="p-prompt col"><span class="zh huge">' + esc(disp(v.w)) + '</span><div class="muted">' + esc(mean(v)) + '</div></div><input class="input big center" id="pyIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + t('exTypeHint') + '">', checkBtn(true));
        const inp = $('#pyIn', ov); inp.focus();
        inp.oninput = () => ($('#pCheck', ov).disabled = !inp.value.trim());
        inp.onkeydown = (e) => { if (e.key === 'Enter' && inp.value.trim()) { e.stopPropagation(); $('#pCheck', ov).click(); } };
        $('#pCheck', ov).onclick = () => {
          const ok = HA.zh.normPinyin(inp.value) === HA.zh.normPinyin(v.p);
          inp.disabled = true; HA.zh.speak(v.w);
          feedback(ok, ex, esc(v.p));
        };
      }
      ov.querySelectorAll('[data-sp]').forEach((b) => (b.onclick = () => HA.zh.speak(b.dataset.sp)));
      ov.querySelectorAll('[data-spslow]').forEach((b) => (b.onclick = () => HA.zh.speak(b.dataset.spslow, 0.55)));
    }
    function finish() {
      const acc = Math.round((right / Math.max(1, tries)) * 100);
      const xp = 10 + Math.round(acc / 10);
      HA.addXP(xp);
      const secs = Math.round((Date.now() - start) / 1000);
      ov.innerHTML = '<div class="p-done"><div class="confetti">🎉</div><h1>' + t('lessonDone') + '</h1><div class="done-stats"><div class="ds yellow"><small>' + t('earned') + '</small><b>💎 ' + xp + '</b></div><div class="ds green"><small>' + t('accuracy') + '</small><b>🎯 ' + acc + '%</b></div><div class="ds blue"><small>' + t('time') + '</small><b>⏱ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</b></div></div><button class="btn green lg" id="pFin">' + t('continue') + '</button></div>';
      P.beep(true);
      $('#pFin', ov).onclick = () => { close(); opts.onDone && opts.onDone(acc); };
    }
    function fail() {
      ov.innerHTML = '<div class="p-done"><div class="confetti">💔</div><h2>' + t('outOfHearts') + '</h2><button class="btn blue lg" id="pRetry">' + t('retry') + '</button> <button class="btn ghost lg" id="pQuit">' + t('close') + '</button></div>';
      $('#pRetry', ov).onclick = () => { close(); P.run(exercises, opts); };
      $('#pQuit', ov).onclick = close;
    }
    next();
  };
})();
