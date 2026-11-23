/* Notebook: saved words + review games */
(function () {
  const { esc, $, $$ } = HA.ui;
  const t = HA.t;
  const view = () => $('#view');

  HA.route(/^\/notebook(?:\/(\w+))?$/, function (tab) {
    tab = tab || 'words';
    const list = HA.nb.list();
    const due = HA.nb.due().length;
    const mastered = list.filter((x) => x.box >= 4).length;
    const zhCount = list.filter((x) => !x.lang || x.lang === 'zh').length;
    view().innerHTML =
      '<div class="page-head"><div><h1>⭐ ' + t('navNotebook') + '</h1><p class="muted">' + t('notebookIntro') + '</p></div><a class="btn green" href="#/game/flash">🃏 ' + t('review') + ' (' + due + ')</a></div>' +
      '<div class="grid3"><div class="card stat-mini"><b>' + list.length + '</b><span>' + t('words') + '</span></div><div class="card stat-mini"><b>' + due + '</b><span>' + t('dueToday') + '</span></div><div class="card stat-mini"><b>' + mastered + '</b><span>' + t('mastered') + '</span></div></div>' +
      '<div class="tabs small"><a href="#/notebook" class="' + (tab === 'words' ? 'on' : '') + '">📒 ' + t('wordList') + '</a><a href="#/notebook/games" class="' + (tab === 'games' ? 'on' : '') + '">🎮 ' + t('reviewGames') + '</a></div>' +
      (tab === 'games'
        ? (zhCount < 4 ? '<div class="note">' + t('needWords') + '</div>' : '') + HA.games.hubHTML({})
        : list.length
          ? '<div class="row between mb wrap"><input class="input" id="nbSearch" placeholder="🔎 ' + t('search') + '"><div class="row"><button class="btn sm ghost" id="nbExport">⬇ CSV</button><label class="btn sm ghost">⬆ ' + t('importF') + '<input type="file" id="nbImport" accept=".csv,.txt" hidden></label></div></div>' +
            '<div class="nb-list" id="nbList">' + list.map((x) => {
              const zh = !x.lang || x.lang === 'zh';
              return '<div class="nb-item" data-w="' + esc(x.w) + '"><div class="nb-zh ' + (zh ? 'zh' : '') + '">' + (zh ? HA.R(x.w, { ruby: false }) : esc(x.w)) + '</div><div class="nb-info"><div class="py">' + esc(zh ? HA.zh.phon(x.p) : HA.subjectName(HA.subjectOf(x.lang))) + '</div><div class="small">' + esc(HA.ui.meaningOf(x)).slice(0, 120) + '</div></div>' +
                '<div class="nb-box" title="SRS">' + '●'.repeat(x.box) + '<span class="muted">' + '○'.repeat(6 - x.box) + '</span></div><div class="nb-act"><button class="icon-btn" data-speak="' + esc(x.w) + '" data-lang="' + esc(x.lang || 'zh') + '">🔊</button>' + (zh ? '<button class="icon-btn" data-write="' + esc(x.w) + '">✍️</button><a class="icon-btn" href="#/word/' + encodeURIComponent(x.w) + '">🔎</a>' : '') + '<button class="icon-btn" data-del="' + esc(x.w) + '">🗑</button></div></div>';
            }).join('') + '</div>'
          : '<div class="empty card"><div class="emoji-big">📒</div><p>' + t('notebookEmpty') + '</p><a class="btn green" href="#/">' + t('navHome') + '</a></div>');
    view().onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak, { lang: sp.dataset.lang });
      const wr = e.target.closest('[data-write]'); if (wr) HA.games.writeModal(wr.dataset.write);
      const del = e.target.closest('[data-del]'); if (del) { HA.nb.remove(del.dataset.del); HA.dispatch(true); }
      if (e.target.id === 'nbExport') {
        const csv = '﻿word,pinyin,vietnamese,english,language\n' + list.map((x) => [x.w, x.p, x.vi, x.en, x.lang || 'zh'].map((c) => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'hanry-notebook.csv'; a.click();
      }
    };
    view().oninput = (e) => {
      if (e.target.id !== 'nbSearch') return;
      const q = e.target.value.trim().toLowerCase();
      const qn = HA.zh.normPinyin(q);
      $$('.nb-item').forEach((el) => { const x = list.find((i) => i.w === el.dataset.w); el.hidden = !!q && !(x.w.toLowerCase().includes(q) || (qn && HA.zh.normPinyin(x.p).includes(qn)) || ((x.vi || '') + (x.en || '')).toLowerCase().includes(q)); });
    };
    view().onchange = (e) => {
      if (e.target.id !== 'nbImport' || !e.target.files[0]) return;
      e.target.files[0].text().then((txt) => {
        let n = 0;
        txt.split(/\r?\n/).slice(1).forEach((line) => {
          const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
          const c = cells.map((x) => x.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
          if (c[0] && HA.nb.add({ w: c[0].trim(), p: c[1], vi: c[2], en: c[3], lang: c[4] || (HA.zh.hasHan(c[0]) ? 'zh' : 'en') })) n++;
        });
        HA.ui.toast(t('added') + ' +' + n, 'good'); HA.dispatch(true);
      });
    };
  });
})();
