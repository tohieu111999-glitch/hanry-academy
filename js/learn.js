/* Learning path. Part 1 (Chinese): learn to read Pinyin or Zhuyin (user's choice). Later parts: coming soon. */
(function () {
  const { esc, $, $$, shuffle, pick } = HA.ui;
  const t = HA.t;
  const S = HA.state;
  const Z = HA.zh;
  const view = () => $('#view');
  const vi = () => S.settings.lang === 'vi';

  // [pinyin symbol, example char, example pinyin, Vietnamese tip, English tip]
  const INITIALS = [
    ['b', '爸', 'bà', 'Giống "p" nhẹ, không bật hơi (gần "b" nhưng môi không rung mạnh)', 'Unaspirated p, like "p" in "spin"'],
    ['p', '怕', 'pà', 'Như "p" nhưng bật mạnh luồng hơi ra (để tờ giấy trước miệng sẽ bay)', 'Aspirated p, like "p" in "pen"'],
    ['m', '妈', 'mā', 'Giống "m" tiếng Việt', 'Like "m"'],
    ['f', '发', 'fā', 'Giống "ph" tiếng Việt', 'Like "f"'],
    ['d', '大', 'dà', 'Giống "t" tiếng Việt, không bật hơi', 'Unaspirated t, like "t" in "stop"'],
    ['t', '他', 'tā', 'Giống "th" tiếng Việt (bật hơi)', 'Aspirated t, like "t" in "top"'],
    ['n', '你', 'nǐ', 'Giống "n"', 'Like "n"'],
    ['l', '来', 'lái', 'Giống "l"', 'Like "l"'],
    ['g', '哥', 'gē', 'Giống "c/k" tiếng Việt, không bật hơi', 'Unaspirated k, like "k" in "skin"'],
    ['k', '可', 'kě', 'Như "k" nhưng bật hơi mạnh (khác "kh" tiếng Việt)', 'Aspirated k, like "k" in "kite"'],
    ['h', '好', 'hǎo', 'Giữa "h" và "kh", hơi xát ở cuống lưỡi', 'Like "h", with friction at the back of the mouth'],
    ['j', '鸡', 'jī', 'Gần "ch" nhưng mặt lưỡi áp lên ngạc, không bật hơi', 'Like "j" in "jeep", tongue flat'],
    ['q', '七', 'qī', 'Như j nhưng bật hơi (gần "ch" bật hơi)', 'Like "ch" in "cheap", aspirated'],
    ['x', '西', 'xī', 'Gần "x" tiếng Việt, mặt lưỡi áp gần ngạc', 'Like "sh" in "sheep", tongue flat'],
    ['zh', '中', 'zhōng', 'Như "tr" tiếng Việt: uốn đầu lưỡi, không bật hơi', 'Like "j" in "jump" with the tongue curled back'],
    ['ch', '吃', 'chī', 'Như zh nhưng bật hơi mạnh', 'Like "ch" in "church" with the tongue curled back'],
    ['sh', '是', 'shì', 'Như "s" tiếng Việt miền Bắc đọc uốn lưỡi', 'Like "sh" with the tongue curled back'],
    ['r', '日', 'rì', 'Như "r" uốn lưỡi nhẹ, gần "gi" đọc rung nhẹ', 'Like "r" in "run" with the tongue curled back'],
    ['z', '在', 'zài', 'Như "ts" (chữ "ch" đầu lưỡi), không bật hơi', 'Like "ds" in "kids"'],
    ['c', '菜', 'cài', 'Như "ts" bật hơi mạnh', 'Like "ts" in "cats", aspirated'],
    ['s', '四', 'sì', 'Giống "x" tiếng Việt', 'Like "s"']
  ];
  const FINALS1 = [
    ['a', '啊', 'ā', 'Như "a"', 'Like "a" in "father"'],
    ['o', '哦', 'ó', 'Như "ô" hơi kéo về "ua" (thường đi sau b p m f)', 'Like "aw", often after b p m f'],
    ['e', '饿', 'è', 'Giữa "ơ" và "ưa", miệng không tròn', 'Like "uh" with unrounded lips'],
    ['i', '一', 'yī', 'Như "i". Sau zh ch sh r z c s đọc thành âm "ư" ngắn', 'Like "ee"; after zh ch sh r z c s it is a buzzy "r/z" sound'],
    ['u', '五', 'wǔ', 'Như "u"', 'Like "oo"'],
    ['ü', '鱼', 'yú', 'Đặt lưỡi như "i" nhưng tròn môi như "u" (giống "uy" tròn môi)', 'Say "ee" with rounded lips (like French "u")'],
    ['ai', '爱', 'ài', 'Như "ai"', 'Like "eye"'],
    ['ei', '累', 'lèi', 'Như "ây"', 'Like "ay" in "say"'],
    ['ao', '好', 'hǎo', 'Như "ao"', 'Like "ow" in "cow"'],
    ['ou', '狗', 'gǒu', 'Như "âu"', 'Like "o" in "go"'],
    ['er', '二', 'èr', 'Như "ơ" rồi cong lưỡi lên', 'Like "are" with the tongue curled']
  ];
  const FINALS2 = [
    ['ia', '家', 'jiā', 'Như "i-a" đọc liền ("gia")', 'i + a'],
    ['ie', '谢', 'xiè', 'Như "iê"', 'Like "ye" in "yes"'],
    ['iao', '小', 'xiǎo', 'Như "i-ao" ("iêu" mở)', 'i + ao'],
    ['iu', '六', 'liù', 'Viết tắt của iou, đọc như "iêu"', 'Short for iou, like "yo"'],
    ['ua', '花', 'huā', 'Như "oa"', 'Like "wa"'],
    ['uo', '我', 'wǒ', 'Như "uô"', 'Like "wo"'],
    ['uai', '快', 'kuài', 'Như "oai"', 'Like "why"'],
    ['ui', '对', 'duì', 'Viết tắt của uei, đọc như "uây"', 'Short for uei, like "way"'],
    ['üe', '月', 'yuè', 'Như "uyê" tròn môi', 'ü + e']
  ];
  const FINALS3 = [
    ['an', '安', 'ān', 'Như "an"', 'Like "an" in "Ann" (open)'],
    ['en', '门', 'mén', 'Như "ân"', 'Like "un" in "under"'],
    ['ang', '忙', 'máng', 'Như "ang"', 'Like "ahng"'],
    ['eng', '冷', 'lěng', 'Như "âng"', 'Like "ung" in "lung"'],
    ['ong', '中', 'zhōng', 'Như "ung" (tròn môi)', 'Like "oong"'],
    ['ian', '天', 'tiān', 'Như "iên"', 'Like "yen"'],
    ['in', '心', 'xīn', 'Như "in"', 'Like "in"'],
    ['iang', '想', 'xiǎng', 'Như "i-ang"', 'i + ang'],
    ['ing', '星', 'xīng', 'Như "inh"', 'Like "ing"'],
    ['iong', '用', 'yòng', 'Như "i-ung" ("dung" tròn môi)', 'i + ong'],
    ['uan', '欢', 'huān', 'Như "oan"', 'Like "wan"'],
    ['un', '春', 'chūn', 'Viết tắt của uen, đọc như "uân"', 'Short for uen, like "won"'],
    ['uang', '黄', 'huáng', 'Như "oang"', 'Like "wahng"'],
    ['ueng', '翁', 'wēng', 'Như "uâng" (chỉ có dạng weng)', 'Only as weng'],
    ['üan', '远', 'yuǎn', 'Như "uyên"', 'ü + an'],
    ['ün', '云', 'yún', 'Như "uyn"', 'ü + n']
  ];
  const TONES = [
    ['1', '妈', 'mā', 'Thanh 1 (ˉ): cao và bằng, giữ giọng đều (cao hơn thanh ngang tiếng Việt)', 'Tone 1: high and level'],
    ['2', '麻', 'má', 'Thanh 2 (ˊ): đi lên từ trung lên cao, gần thanh sắc', 'Tone 2: rising, like asking "what?"'],
    ['3', '马', 'mǎ', 'Thanh 3 (ˇ): xuống thấp rồi lên, gần thanh hỏi. Trong câu thường chỉ đọc phần thấp', 'Tone 3: low dipping; in speech often just low'],
    ['4', '骂', 'mà', 'Thanh 4 (ˋ): rơi mạnh từ cao xuống thấp, dứt khoát, gần thanh huyền nhưng nhanh và mạnh', 'Tone 4: sharp falling'],
    ['5', '吗', 'ma', 'Thanh nhẹ: ngắn và nhẹ, không ghi dấu', 'Neutral tone: short and light, no mark']
  ];
  const RULES_PY = [
    ['Viết y, w khi không có thanh mẫu', 'y / w when there is no initial', 'i → yi, ia → ya, ie → ye, in → yin; u → wu, ua → wa, uo → wo; ü → yu', '一 yī, 也 yě, 五 wǔ, 我 wǒ, 鱼 yú'],
    ['Bỏ hai chấm của ü sau j, q, x, y', 'ü loses its dots after j q x y', 'jü → ju, qü → qu, xü → xu, yü → yu. Sau n, l vẫn giữ: nǚ, lǜ', '去 qù, 女 nǚ, 绿 lǜ'],
    ['Viết tắt iou, uei, uen', 'iou, uei, uen are shortened', 'liou → liu, duei → dui, chuen → chun', '六 liù, 对 duì, 春 chūn'],
    ['Vị trí dấu thanh', 'Where the tone mark goes', 'Ưu tiên a > o, e > i, u, ü. Với iu, ui đặt dấu trên nguyên âm sau', '好 hǎo, 多 duō, 六 liù, 对 duì'],
    ['Biến điệu thanh 3', 'Third-tone sandhi', 'Hai thanh 3 đi liền, thanh 3 đầu đọc thành thanh 2 (vẫn viết dấu thanh 3)', '你好 nǐ hǎo → ní hǎo; 很好 hěn hǎo → hén hǎo'],
    ['Biến điệu của 一 và 不', 'Tone changes of 一 and 不', '一 trước thanh 4 → yí, trước thanh 1/2/3 → yì. 不 trước thanh 4 → bú', '一个 yí ge, 一起 yìqǐ, 不是 bú shì'],
    ['Thanh nhẹ', 'Neutral tone', 'Trợ từ và âm tiết sau của nhiều từ đọc nhẹ, ngắn', '吗 ma, 的 de, 朋友 péngyou, 谢谢 xièxie'],
    ['Âm cuốn lưỡi (儿化)', 'Erhua', 'Thêm r vào cuối âm tiết, đọc cong lưỡi', '哪儿 nǎr, 一点儿 yìdiǎnr'],
    ['Dấu cách âm \'', 'The apostrophe', 'Dùng khi âm tiết sau bắt đầu bằng a, o, e để tránh đọc nhầm', '西安 Xī\'ān (khác 先 xiān)']
  ];
  const RULES_ZY = [
    ['Thứ tự ghép', 'Order', 'Thanh mẫu + (âm đệm ㄧ ㄨ ㄩ) + vận mẫu + dấu thanh', 'ㄋㄧˇ 你, ㄏㄠˇ 好, ㄒㄩㄝˊ 学'],
    ['Thanh 1 không ghi dấu', 'Tone 1 is unmarked', 'ˊ thanh 2, ˇ thanh 3, ˋ thanh 4, ˙ thanh nhẹ (đặt TRƯỚC)', 'ㄇㄚ 妈, ㄇㄚˊ 麻, ㄇㄚˇ 马, ㄇㄚˋ 骂, ˙ㄇㄚ 吗'],
    ['ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ đứng một mình', 'Standalone ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ', 'zhi chi shi ri zi ci si chỉ viết một ký hiệu, không thêm ㄧ', '是 ㄕˋ, 吃 ㄔ, 四 ㄙˋ'],
    ['Viết dọc', 'Vertical writing', 'Ở Đài Loan zhuyin thường viết dọc bên phải chữ Hán, dấu thanh đặt bên phải ký hiệu cuối', '中 ㄓㄨㄥ'],
    ['Biến điệu', 'Tone sandhi', 'Giống pinyin: hai thanh 3 liền nhau thì đầu đọc thành thanh 2; 一, 不 đổi thanh', '你好 ㄋㄧˇ ㄏㄠˇ → ní hǎo']
  ];

  const zy = (py) => Z.toZhuyin(py);
  const mode = () => (S.settings.phon === 'zhuyin' ? 'zhuyin' : 'pinyin');
  const ZF_ONLY = { a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ê: 'ㄝ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ', i: 'ㄧ', u: 'ㄨ', ü: 'ㄩ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iao: 'ㄧㄠ', iu: 'ㄧㄡ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', üe: 'ㄩㄝ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ', uan: 'ㄨㄢ', un: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ', üan: 'ㄩㄢ', ün: 'ㄩㄣ', ong: 'ㄨㄥ' };
  const ZI_ONLY = { b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ', g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ' };
  const symbolOf = (item, kind) => {
    if (kind === 'tone') return mode() === 'pinyin' ? ['ā', 'á', 'ǎ', 'à', 'a'][+item[0] - 1] : ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'][+item[0] - 1];
    if (mode() === 'pinyin') return item[0];
    return (kind === 'ini' ? ZI_ONLY : ZF_ONLY)[item[0]] || item[0];
  };
  const otherOf = (item, kind) => {
    if (kind === 'tone') return mode() === 'pinyin' ? ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'][+item[0] - 1] : 'Thanh ' + item[0];
    return mode() === 'pinyin' ? (kind === 'ini' ? ZI_ONLY : ZF_ONLY)[item[0]] || '' : item[0];
  };
  const exPhon = (py) => (mode() === 'zhuyin' ? zy(py) : py);

  const UNITS = [
    { id: 'tones', icon: '🎵', kind: 'tone', items: TONES, vi: 'Thanh điệu', en: 'Tones', zyvi: 'Dấu thanh', zyen: 'Tone marks' },
    { id: 'initials', icon: '🅱️', kind: 'ini', items: INITIALS, vi: 'Thanh mẫu (phụ âm đầu)', en: 'Initials', zyvi: 'Thanh mẫu ㄅㄆㄇㄈ', zyen: 'Initials ㄅㄆㄇㄈ' },
    { id: 'finals1', icon: '🅰️', kind: 'fin', items: FINALS1, vi: 'Vận mẫu đơn & kép', en: 'Simple finals', zyvi: 'Vận mẫu ㄚㄛㄜ & âm đệm ㄧㄨㄩ', zyen: 'Finals ㄚㄛㄜ & medials ㄧㄨㄩ' },
    { id: 'finals2', icon: '🔗', kind: 'fin', items: FINALS2, vi: 'Vận mẫu ghép với i, u, ü', en: 'Compound finals', zyvi: 'Ghép âm đệm + vận', zyen: 'Medial + final' },
    { id: 'finals3', icon: '👃', kind: 'fin', items: FINALS3, vi: 'Vận mẫu mũi (-n, -ng)', en: 'Nasal finals', zyvi: 'Vận mũi ㄢㄣㄤㄥ', zyen: 'Nasal finals ㄢㄣㄤㄥ' },
    { id: 'rules', icon: '📏', kind: 'rule', vi: 'Quy tắc viết & biến điệu', en: 'Spelling & tone rules', zyvi: 'Quy tắc ghép & biến điệu', zyen: 'Combining & tone rules' }
  ];
  const unitName = (u) => (mode() === 'zhuyin' ? (vi() ? u.zyvi : u.zyen) : vi() ? u.vi : u.en);
  const done = (id) => (S.data.course || {})[mode() + ':' + id];

  /* ---------- Path ---------- */
  HA.route(/^\/learn$/, function () {
    const subs = HA.config.subjects.filter((s) => s.id !== 'other');
    view().innerHTML =
      '<div class="page-head"><div><h1>🧭 ' + t('navLearn') + '</h1><p class="muted">' + t('learnIntro') + '</p></div></div>' +
      '<div class="chips-row mb">' + subs.map((s) => '<span class="chip big ' + (s.id === 'zh' ? 'on' : 'soon') + '">' + s.icon + ' ' + esc(HA.subjectName(s)) + (s.id === 'zh' ? '' : ' · ' + t('comingSoon')) + '</span>').join('') + '</div>' +
      '<section class="unit-block"><div class="ub-head"><div><small>' + t('part') + ' 1</small><h2>🔤 ' + t('readPhonetic') + '</h2><p class="small">' + t('readPhoneticD') + '</p></div>' +
      '<div class="seg" id="modeSeg"><button data-v="pinyin" class="' + (mode() === 'pinyin' ? 'on' : '') + '">Pinyin<br><small>hàn yǔ</small></button><button data-v="zhuyin" class="' + (mode() === 'zhuyin' ? 'on' : '') + '">Zhuyin 注音<br><small>ㄏㄢˋ ㄩˇ</small></button></div></div>' +
      '<div class="unit-list">' + UNITS.map((u, i) => '<a class="unit-item ' + (done(u.id) != null ? 'done' : '') + '" href="#/learn/unit/' + u.id + '"><span class="ui-n">' + (done(u.id) != null ? '✓' : i + 1) + '</span><span class="ui-icon">' + u.icon + '</span><span class="ui-text"><b>' + esc(unitName(u)) + '</b><small>' + (u.items ? u.items.length + ' ' + t('items') : t('rulesLabel')) + (done(u.id) != null ? ' · ' + t('best') + ' ' + done(u.id) + '%' : '') + '</small></span><span>›</span></a>').join('') +
      '<a class="unit-item practice" href="#/learn/practice/all"><span class="ui-n">★</span><span class="ui-icon">🎯</span><span class="ui-text"><b>' + t('practiceAll') + '</b><small>' + t('practiceAllD') + '</small></span><span>›</span></a></div></section>' +
      [[2, '📚', 'part2'], [3, '🗣️', 'part3'], [4, '✍️', 'part4']].map(([n, i, k]) => '<section class="unit-block locked"><div class="ub-head"><div><small>' + t('part') + ' ' + n + '</small><h2>' + i + ' ' + t(k) + '</h2><p class="small muted">⏳ ' + t('updatingSoon') + '</p></div></div></section>').join('');
    $('#modeSeg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; S.settings.phon = b.dataset.v; HA.saveSettings(); HA.refresh(); };
  });

  /* ---------- Unit ---------- */
  HA.route(/^\/learn\/unit\/(\w+)$/, function (id) {
    const u = UNITS.find((x) => x.id === id);
    if (!u) { location.hash = '#/learn'; return; }
    const idx = UNITS.indexOf(u);
    let body;
    if (u.kind === 'rule') {
      const rules = mode() === 'zhuyin' ? RULES_ZY : RULES_PY;
      body = '<div class="rule-list">' + rules.map((r, i) => '<div class="card rule"><div class="g-num">' + (i + 1) + '</div><h3>' + esc(vi() ? r[0] : r[1]) + '</h3><p>' + esc(r[2]) + '</p><div class="rule-ex zh" data-speak="' + esc(r[3].replace(/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü'→\s,，;()ㄅ-ㄩˉˊˇˋ˙]+/g, '，')) + '">🔊 ' + esc(r[3]) + '</div></div>').join('') + '</div>';
    } else {
      body = '<div class="sym-grid">' + u.items.map((it) => '<button class="sym-card" data-speak="' + esc(it[1]) + '"><span class="sym ' + (mode() === 'zhuyin' ? 'zy' : '') + '">' + esc(symbolOf(it, u.kind)) + '</span><span class="sym-other">' + esc(otherOf(it, u.kind)) + '</span>' +
        '<span class="sym-ex"><b class="zh">' + esc(Z.disp(it[1])) + '</b> ' + esc(exPhon(it[2])) + '</span><span class="sym-tip">' + esc(vi() ? it[3] : it[4]) + '</span></button>').join('') + '</div>';
    }
    view().innerHTML = '<a class="back" href="#/learn">← ' + t('navLearn') + '</a>' +
      '<div class="lesson-head" style="--c:#1cb0f6"><div class="lh-main"><span class="lh-emoji">' + u.icon + '</span><div><small>' + t('part') + ' 1 · ' + (mode() === 'zhuyin' ? 'Zhuyin' : 'Pinyin') + ' · ' + (idx + 1) + '/' + UNITS.length + '</small><h1>' + esc(unitName(u)) + '</h1><p>' + t('tapToHear') + '</p></div></div></div>' +
      body +
      '<div class="row center mt wrap">' + (u.kind !== 'rule' ? '<a class="btn green lg" href="#/learn/practice/' + u.id + '">🎯 ' + t('practiceUnit') + '</a>' : '<button class="btn green lg" id="markRules">✓ ' + t('completed') + '</button>') +
      (UNITS[idx + 1] ? '<a class="btn ghost lg" href="#/learn/unit/' + UNITS[idx + 1].id + '">' + t('next') + ' →</a>' : '') + '</div>';
    view().onclick = (e) => {
      const sp = e.target.closest('[data-speak]'); if (sp) HA.zh.speak(sp.dataset.speak, { rate: 0.75 });
      if (e.target.id === 'markRules') { mark('rules', 100); HA.ui.toast(t('completed'), 'good'); location.hash = '#/learn'; }
    };
  });
  function mark(id, score) {
    S.data.course = S.data.course || {};
    const k = mode() + ':' + id;
    S.data.course[k] = Math.max(S.data.course[k] || 0, score);
    HA.saveData();
  }

  /* ---------- Practice: listen & pick the symbol ---------- */
  HA.route(/^\/learn\/practice\/(\w+)$/, function (id) {
    const units = id === 'all' ? UNITS.filter((u) => u.items) : UNITS.filter((u) => u.id === id && u.items);
    if (!units.length) { location.hash = '#/learn'; return; }
    const pool = units.flatMap((u) => u.items.map((it) => ({ it, kind: u.kind, unit: u })));
    const qs = pick(pool, Math.min(10, pool.length));
    let i = 0, right = 0;
    view().innerHTML = '<a class="back" href="#/learn">← ' + t('navLearn') + '</a><h2>🎯 ' + (id === 'all' ? t('practiceAll') : esc(unitName(units[0]))) + '</h2><div id="pq" class="card"></div>';
    const box = $('#pq');
    const ask = () => {
      if (i >= qs.length) {
        const sc = Math.round((right / qs.length) * 100);
        units.forEach((u) => mark(u.id, sc));
        box.innerHTML = '<div class="center"><div class="emoji-big">' + (sc >= 80 ? '🎉' : '💪') + '</div><h2>' + right + ' / ' + qs.length + '</h2><div class="row center"><button class="btn green" id="again">🔁 ' + t('retry') + '</button><a class="btn ghost" href="#/learn">' + t('navLearn') + '</a></div></div>';
        $('#again').onclick = () => HA.dispatch(true);
        return;
      }
      const q = qs[i];
      const same = pool.filter((x) => x.kind === q.kind && x.it[0] !== q.it[0]);
      const opts = shuffle([q].concat(pick(same, 3)));
      box.innerHTML = '<div class="muted center">' + (i + 1) + ' / ' + qs.length + '</div><p class="center">' + t('listenPick') + '</p>' +
        '<div class="p-prompt"><button class="btn purple xl" id="pl">🔊</button><button class="btn ghost" id="slow">🐢</button></div>' +
        '<div class="p-opts four">' + opts.map((o, k) => '<button class="p-opt sym-opt" data-k="' + k + '"><span class="sym ' + (mode() === 'zhuyin' ? 'zy' : '') + '">' + esc(symbolOf(o.it, o.kind)) + '</span></button>').join('') + '</div>';
      const play = (r) => HA.zh.speak(q.it[1], { rate: r || 0.75 });
      $('#pl').onclick = () => play(); $('#slow').onclick = () => play(0.5);
      setTimeout(play, 250);
      $('.p-opts', box).onclick = (e) => {
        const b = e.target.closest('.p-opt'); if (!b || b.disabled) return;
        const ok = opts[+b.dataset.k] === q; if (ok) right++;
        $$('.p-opt', box).forEach((x, k) => { x.disabled = true; if (opts[k] === q) { x.classList.add('right'); x.insertAdjacentHTML('beforeend', '<small class="py">' + esc(Z.disp(q.it[1])) + ' ' + esc(exPhon(q.it[2])) + '</small>'); } });
        if (!ok) b.classList.add('wrong');
        HA.games.beep(ok); i++; setTimeout(ask, ok ? 900 : 1700);
      };
    };
    ask();
  });
})();
