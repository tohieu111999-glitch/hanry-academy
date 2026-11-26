/* UI helpers: escaping, toast, modal, word tooltip */
(function () {
  const ui = (HA.ui = {});
  ui.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  ui.$ = (sel, root) => (root || document).querySelector(sel);
  ui.$$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  ui.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  ui.pick = (a, n) => ui.shuffle(a).slice(0, n);

  ui.toast = function (msg, type) {
    let box = ui.$('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3000);
  };

  ui.modal = function (html, opts) {
    opts = opts || {};
    ui.closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal ' + (opts.cls || '') + '" role="dialog" aria-modal="true"><button class="modal-x" aria-label="close">✕</button>' + html + '</div>';
    document.body.appendChild(wrap);
    document.body.classList.add('noscroll');
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.classList.contains('modal-x')) ui.closeModal(); });
    if (opts.onOpen) opts.onOpen(wrap.querySelector('.modal'));
    return wrap.querySelector('.modal');
  };
  ui.closeModal = function () { ui.$$('.modal-wrap').forEach((m) => m.remove()); document.body.classList.remove('noscroll'); };
  ui.confirm = function (msg) {
    return new Promise((res) => {
      const m = ui.modal('<p class="confirm-msg">' + ui.esc(msg) + '</p><div class="row end"><button class="btn ghost" data-v="0">' + HA.t('cancel') + '</button><button class="btn red" data-v="1">' + HA.t('ok') + '</button></div>', { cls: 'small' });
      m.addEventListener('click', (e) => { const v = e.target.dataset.v; if (v != null) { ui.closeModal(); res(v === '1'); } });
    });
  };

  // Meaning text for a dictionary entry / curated item based on UI language
  ui.meaningOf = function (obj) {
    if (!obj) return '';
    const lang = HA.state.settings.lang;
    if (lang === 'vi') return obj.vi || obj.en || '';
    return obj.en || obj.vi || '';
  };
  ui.posLabel = (pos) => { const p = HA.POS[pos]; if (!p) return ''; return HA.state.settings.lang === 'vi' ? p[0] : p[1]; };

  /* ---------- Word tooltip ---------- */
  let tip = null, hideT = null, showT = null, curEl = null;
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'wtip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    tip.addEventListener('mouseenter', () => clearTimeout(hideT));
    tip.addEventListener('mouseleave', () => scheduleHide());
    tip.addEventListener('click', onTipClick);
    return tip;
  }
  function scheduleHide() { clearTimeout(hideT); hideT = setTimeout(ui.hideTip, 280); }
  ui.hideTip = function () { if (tip) tip.classList.remove('show'); if (curEl) curEl.classList.remove('active'); curEl = null; };

  ui.wordCardHTML = function (w, pyHint, compact) {
    const Z = HA.zh;
    const { cur, list } = Z.lookup(w);
    const lang = HA.state.settings.lang;
    const py = cur ? cur.p : pyHint || (list[0] ? Z.pinyinNumToMarks(list[0].p) : Z.pinyinOf(w));
    const hv = lang === 'vi' ? Z.hanViet(w) : '';
    const trad = Z.analyze(w).map((t) => (t.han ? t.trad : t.text)).join('');
    const disp = HA.state.settings.script === 't' ? trad : w;
    const other = HA.state.settings.script === 't' ? w : trad;
    let h = '<div class="wc-head"><span class="wc-zh zh">' + ui.esc(disp) + '</span>' + (other !== disp ? '<span class="wc-alt zh">' + ui.esc(other) + '</span>' : '') +
      '<button class="icon-btn" data-act="speak" data-w="' + ui.esc(w) + '" title="🔊">🔊</button></div>' +
      '<div class="wc-py">' + ui.esc(Z.phon(py)) + (HA.state.settings.phon === 'zhuyin' ? ' <small>' + ui.esc(py) + '</small>' : '') + (hv ? ' · <span class="wc-hv">' + ui.esc(hv.toUpperCase()) + '</span>' : '') + '</div>';
    const means = [];
    if (cur) means.push('<li>' + (cur.pos ? '<em class="pos">' + ui.esc(ui.posLabel(cur.pos)) + '</em> ' : '') + ui.esc(ui.meaningOf(cur)) + '</li>');
    const seen = new Set();
    list.slice(0, compact ? 3 : 8).forEach((e) => {
      const m = ui.meaningOf(e); if (!m) return;
      const key = e.p + m; if (seen.has(key)) return; seen.add(key);
      means.push('<li><span class="py-s">' + ui.esc(Z.pinyinNumToMarks(e.p)) + '</span> ' + ui.esc(compact && m.length > 140 ? m.slice(0, 140) + '…' : m) + '</li>');
    });
    if (!means.length && !HA.zh.dict.loaded.vi && !HA.zh.dict.loaded.en) means.push('<li class="muted">' + HA.t('dictLoading') + '</li>');
    if (!means.length) {
      // char-by-char fallback
      [...w].forEach((c) => { const r = Z.lookup(c); const e = r.cur || r.list[0]; if (e) means.push('<li><b class="zh">' + ui.esc(HA.zh.disp(c)) + '</b> ' + ui.esc(ui.meaningOf(e)).slice(0, 100) + '</li>'); });
    }
    h += '<ul class="wc-mean">' + means.join('') + '</ul>';
    if (cur && cur.note) h += '<div class="wc-sec small">📌 ' + ui.esc(cur.note) + '</div>';
    if (cur && cur.ex && cur.ex[0]) h += '<div class="wc-sec"><b>' + HA.t('usage') + '</b><div class="zh">' + ui.esc(HA.zh.disp(cur.ex[0])) + '</div><div class="muted small">' + ui.esc(Z.pinyinOf(cur.ex[0])) + '</div>' + (lang === 'vi' && cur.ex[1] ? '<div class="small">' + ui.esc(cur.ex[1]) + '</div>' : '') + '</div>';
    if (cur && ((cur.syn || []).length || (cur.ant || []).length)) {
      h += '<div class="wc-sec chips">';
      if ((cur.syn || []).length) h += '<b>' + HA.t('synonyms') + ':</b> ' + cur.syn.map((s) => '<a class="chip zh" data-act="dict" data-w="' + ui.esc(s) + '">' + ui.esc(HA.zh.disp(s)) + '</a>').join('');
      if ((cur.ant || []).length) h += ' <b>' + HA.t('antonyms') + ':</b> ' + cur.ant.map((s) => '<a class="chip red zh" data-act="dict" data-w="' + ui.esc(s) + '">' + ui.esc(HA.zh.disp(s)) + '</a>').join('');
      h += '</div>';
    }
    const inNb = HA.nb.has(w);
    h += '<div class="wc-actions"><button class="btn sm ' + (inNb ? 'ghost' : 'yellow') + '" data-act="note" data-w="' + ui.esc(w) + '" data-p="' + ui.esc(py) + '">' + (inNb ? '✓ ' + HA.t('inNote') : '⭐ ' + HA.t('addNote')) + '</button>' +
      '<button class="btn sm ghost" data-act="dict" data-w="' + ui.esc(w) + '">🔎 ' + HA.t('openDict') + '</button></div>';
    return h;
  };
  ui.noteItem = function (w, py) {
    const { cur, list } = HA.zh.lookup(w);
    const e = list[0] || {};
    return { w, p: py || (cur && cur.p) || (e.p ? HA.zh.pinyinNumToMarks(e.p) : HA.zh.pinyinOf(w)), vi: (cur && cur.vi) || e.vi || '', en: (cur && cur.en) || e.en || '' };
  };
  function onTipClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const w = b.dataset.w;
    const lang = b.dataset.lang || 'zh';
    if (b.dataset.act === 'speak') HA.zh.speak(w, { lang });
    if (b.dataset.act === 'dict') { ui.hideTip(); ui.closeModal(); location.hash = '#/word/' + encodeURIComponent(w); }
    if (b.dataset.act === 'note') {
      const item = lang === 'zh' ? ui.noteItem(w, b.dataset.p) : { w, p: '', lang, vi: b.dataset.m || '', en: b.dataset.m || '' };
      const added = HA.nb.toggle(item);
      ui.toast(added ? HA.t('added') : HA.t('removed'), added ? 'good' : '');
      b.outerHTML = '<button class="btn sm ' + (added ? 'ghost' : 'yellow') + '" data-act="note" data-w="' + ui.esc(w) + '" data-p="' + ui.esc(b.dataset.p) + '">' + (added ? '✓ ' + HA.t('inNote') : '⭐ ' + HA.t('addNote')) + '</button>';
      document.dispatchEvent(new CustomEvent('ha:notebook'));
    }
  }
  function showTip(el) {
    const t = ensureTip();
    if (curEl) curEl.classList.remove('active');
    curEl = el; el.classList.add('active');
    const lang = el.dataset.lang || 'zh';
    t.innerHTML = (lang === 'zh' ? ui.wordCardHTML(el.dataset.w, el.dataset.p, true) : foreignCard(el.dataset.w, lang)) + sentenceBlock(el, lang);
    t.classList.add('show');
    place(el);
    fillAsync(t, el);
  }
  function foreignCard(w, lang) {
    const inNb = HA.nb.has(w);
    return '<div class="wc-head"><span class="wc-zh">' + ui.esc(w) + '</span><button class="icon-btn" data-act="speak" data-lang="' + lang + '" data-w="' + ui.esc(w) + '">🔊</button></div>' +
      '<div class="wc-mean" data-fill="word">' + HA.t('loading') + '</div>' +
      '<div class="wc-actions"><button class="btn sm ' + (inNb ? 'ghost' : 'yellow') + '" data-act="note" data-lang="' + lang + '" data-w="' + ui.esc(w) + '">' + (inNb ? '✓ ' + HA.t('inNote') : '⭐ ' + HA.t('addNote')) + '</button></div>';
  }
  function sentenceBlock(el, lang) {
    const ctx = el.closest('[data-src]');
    if (!ctx || lang === 'code') return '';
    const src = ctx.dataset.src;
    if (!src || src === el.dataset.w) return '';
    const tr = ctx.dataset.tr;
    return '<div class="wc-sec wc-sent"><div class="row between"><b>📝 ' + HA.t('sentMeaning') + '</b><button class="icon-btn" data-act="speak" data-lang="' + lang + '" data-w="' + ui.esc(src) + '">🔊</button></div>' +
      '<div data-fill="sent" data-src="' + ui.esc(src) + '">' + (tr ? ui.esc(tr) : '<span class="muted">' + HA.t('translating') + '</span>') + '</div>' +
      (tr ? '' : '') + '</div>';
  }
  function fillAsync(t, el) {
    const lang = el.dataset.lang || 'zh';
    const w = el.dataset.w;
    const wf = t.querySelector('[data-fill="word"]');
    if (wf) HA.mt.translate(w, lang, null, 'word').then((m) => {
      if (curEl !== el) return;
      wf.textContent = m;
      const nb = t.querySelector('[data-act="note"]'); if (nb) nb.dataset.m = m;
      place(el);
    }).catch(() => { if (curEl === el) wf.innerHTML = '<span class="muted">' + HA.t('mtUnavailable') + '</span>'; });
    const sf = t.querySelector('[data-fill="sent"]');
    const ctx = el.closest('[data-src]');
    if (sf && ctx && !ctx.dataset.tr) HA.mt.translate(sf.dataset.src, lang).then((m) => {
      if (curEl !== el) return;
      sf.textContent = m; place(el);
    }).catch(() => {
      if (curEl !== el) return;
      sf.innerHTML = lang === 'zh' ? '<span class="muted small">' + HA.t('glossNote') + '</span><br>' + ui.esc(HA.mt.gloss(sf.dataset.src)) : '<span class="muted">' + HA.t('mtUnavailable') + '</span>';
      place(el);
    });
  }
  function place(el) {
    const t = tip;
    const r = el.getBoundingClientRect();
    const tw = Math.min(340, window.innerWidth - 16);
    t.style.width = tw + 'px';
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    const th = t.offsetHeight;
    let top = r.bottom + 8;
    if (top + th > window.innerHeight - 8 && r.top - th - 8 > 0) top = r.top - th - 8;
    t.style.left = left + 'px';
    t.style.top = Math.max(8, top) + 'px';
  }
  const fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.addEventListener('mouseover', (e) => {
    if (!fine) return;
    const el = e.target.closest && e.target.closest('.w');
    if (el && !el.closest('.no-tip')) { clearTimeout(hideT); clearTimeout(showT); showT = setTimeout(() => showTip(el), 220); }
  });
  document.addEventListener('mouseout', (e) => {
    if (!fine) return;
    const el = e.target.closest && e.target.closest('.w');
    if (el) { clearTimeout(showT); scheduleHide(); }
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('.w');
    if (el && !e.target.closest('.no-tip')) { e.preventDefault(); clearTimeout(hideT); showTip(el); return; }
    if (tip && !e.target.closest('#wtip')) ui.hideTip();
  });
  window.addEventListener('scroll', () => { if (!fine) return; ui.hideTip(); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { ui.hideTip(); ui.closeModal(); } });
})();
