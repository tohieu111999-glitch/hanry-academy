/* Lesson data loader. Compact authoring format -> normalized lesson objects.
 * Lesson fields:
 *  t:   'zh|vi|en' title        d: 'vi|en' description
 *  kind:'d' dialogue | 'p' passage
 *  text: lines "Speaker|中文|Tiếng Việt|English" (speaker empty for passages)
 *  v:   lines "word|pinyin|pos|vi|en|HánViệt|example zh|example vi|syn1,syn2|ant1,ant2"
 *  g:   [titleVi, titleEn, structure, explainVi, explainEn, [zh, vi, en], ...]
 *  q:   ['Question zh', 'Question vi', '*correct', 'wrong', ...]  or  ['T'|'F', 'statement zh', 'statement vi']
 */
(function () {
  // Proficiency levels (CEFR-style, used by TOCFL bands too)
  HA.LEVELS = [
    { n: 1, code: 'A1', color: '#58cc02', icon: '🌱', vi: 'A1 · Nhập môn', en: 'A1 · Beginner' },
    { n: 2, code: 'A2', color: '#1cb0f6', icon: '🌿', vi: 'A2 · Sơ cấp', en: 'A2 · Elementary' },
    { n: 3, code: 'B1', color: '#ce82ff', icon: '🌳', vi: 'B1 · Trung cấp', en: 'B1 · Intermediate' },
    { n: 4, code: 'B2', color: '#ff9600', icon: '🏔️', vi: 'B2 · Trung cao cấp', en: 'B2 · Upper-intermediate' },
    { n: 5, code: 'C1', color: '#ff4b4b', icon: '🚀', vi: 'C1 · Cao cấp', en: 'C1 · Advanced' },
    { n: 6, code: 'C2', color: '#2b70c9', icon: '👑', vi: 'C2 · Thành thạo', en: 'C2 · Proficient' }
  ];
  HA.LEVELS.forEach((l) => Object.defineProperty(l, 'name', { get: () => HA.tr(l) }));
  HA.POS = {
    n: ['danh từ', 'noun'], v: ['động từ', 'verb'], adj: ['tính từ', 'adjective'], adv: ['phó từ', 'adverb'], pron: ['đại từ', 'pronoun'],
    num: ['số từ', 'numeral'], mw: ['lượng từ', 'measure word'], part: ['trợ từ', 'particle'], prep: ['giới từ', 'preposition'],
    conj: ['liên từ', 'conjunction'], phr: ['cụm từ', 'phrase'], int: ['thán từ', 'interjection'], tw: ['từ chỉ thời gian', 'time word'],
    pn: ['danh từ riêng', 'proper noun'], idiom: ['thành ngữ', 'idiom'], vo: ['động tân', 'verb-object']
  };
  HA.lessons = [];
  HA.lessonById = {};
  const split = (s) => (s || '').split('|').map((x) => x.trim());
  HA.normalizeLesson = function (src, builtIn) {
    const [tz, tvi, ten] = split(src.t);
    const [dvi, den] = split(src.d);
    const L = {
      id: src.id, level: src.lv || 1, emoji: src.emoji || '📘', kind: src.kind === 'p' ? 'passage' : 'dialogue',
      title: { zh: tz, vi: tvi, en: ten || tvi }, desc: { vi: dvi, en: den || dvi }, builtIn: !!builtIn,
      text: [], vocab: [], grammar: [], questions: []
    };
    (src.text || '').trim().split('\n').filter((x) => x.trim()).forEach((line) => {
      const [sp, zh, vi, en] = split(line);
      L.text.push({ sp, zh, vi, en });
    });
    (src.v || '').trim().split('\n').filter((x) => x.trim()).forEach((line) => {
      const [w, p, pos, vi, en, hv, exz, exv, syn, ant] = split(line);
      L.vocab.push({ w, p, pos, vi, en, hv, ex: exz ? [exz, exv || ''] : null, syn: syn ? syn.split(',').filter(Boolean) : [], ant: ant ? ant.split(',').filter(Boolean) : [] });
    });
    (src.g || []).forEach((g) => {
      const [tvi2, ten2, f, evi, een, ...ex] = g;
      L.grammar.push({ t: { vi: tvi2, en: ten2 }, f, ex: { vi: evi, en: een }, examples: ex.map((e) => ({ zh: e[0], vi: e[1], en: e[2] })) });
    });
    (src.q || []).forEach((q) => {
      if (q[0] === 'T' || q[0] === 'F') L.questions.push({ type: 'tf', q: q[1], qvi: q[2], a: q[0] === 'T' });
      else {
        const opts = q.slice(2);
        const a = opts.findIndex((o) => o[0] === '*');
        L.questions.push({ type: 'mc', q: q[0], qvi: q[1], o: opts.map((o) => o.replace(/^\*/, '')), a });
      }
    });
    return L;
  };
  // Built-in sample reading posts written by Hanry Academy (shown in the feed)
  const BASE = Date.UTC(2026, 10, 20, 2);
  HA.L = function (src) {
    const L = HA.normalizeLesson(src, true);
    Object.assign(L, { subject: 'zh', lang: 'zh', author: 'Hanry Academy', authorRole: 'admin', sourceType: 'self', visibility: 'public', sample: true, created: BASE - HA.lessons.length * 36e5 * 7 });
    HA.lessons.push(L);
    HA.lessonById[L.id] = L;
  };
  // Official reading lessons imported from Hanry Academy PDFs (tools/import-lesson.py)
  HA.official = [];
  HA.loadOfficial = function () {
    if (HA._officialP) return HA._officialP;
    HA._officialP = fetch('data/posts/official.json').then((r) => (r.ok ? r.json() : [])).then((list) => {
      HA.official = list.map((L) => Object.assign({ official: true, user: false }, L));
      HA.official.forEach((L) => { HA.lessonById[L.id] = L; (L.vocab || []).forEach((v) => HA.zh.addCurated(v, L.id)); });
      HA.zh.clearCache();
      return HA.official;
    }).catch(() => []);
    return HA._officialP;
  };
  HA.registerCurated = function () {
    HA.lessons.forEach((L) => L.vocab.forEach((v) => HA.zh.addCurated(v, L.id)));
  };
})();
