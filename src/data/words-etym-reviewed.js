/**
 * 逐词复核后的词源修订。
 *
 * 这里的条目有意单独于 bookmorph / remorph 自动补丁：两个旧补丁文件可能命中同一
 * 个词，而 words-entry / index 的优先级会让 bookmorph 覆盖后续 remorph 修订。
 * 只有有词典依据并完成逐词判断的修订才放在这里；不要从相同词尾推导批量条目。
 */
const wordsEtymReviewed = [
  {
    id: 'w.treatment',
    morphHints: ['r.treat', 's.ment'],
    chain: [
      { morph: 'r.treat', form: 'treat', gloss: '处理' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：结果、产物、手段、行为' },
    ],
  },
  {
    id: 'w.environment',
    morphHints: ['s.ment'],
    chain: [
      { morph: null, form: 'environ', gloss: '环绕（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：结果、产物、手段、行为' },
    ],
  },
  {
    id: 'w.environmental',
    morphHints: ['s.ment', 's.al'],
    chain: [
      { morph: null, form: 'environ', gloss: '环绕（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：结果、产物、手段、行为' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.measurement',
    morphHints: ['s.ment'],
    chain: [
      { morph: null, form: 'measure', gloss: '测量（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：结果、产物、手段、行为' },
    ],
  },
  {
    id: 'w.dimension',
    morphHints: ['s.tion'],
    chain: [
      { morph: null, form: 'dimens', gloss: '测量（拉丁 dīmētior；项目暂无对应词根）' },
      { morph: 's.tion', form: '-ion', gloss: '名词后缀：动作、过程、结果' },
    ],
  },
  {
    id: 'w.immense',
    morphHints: ['p.in'],
    chain: [
      { morph: 'p.in', form: 'im-', gloss: '否定' },
      { morph: null, form: 'mense', gloss: '测量过的（拉丁 mēnsus；项目暂无对应词根）' },
    ],
  },
  {
    id: 'w.impediment',
    morphHints: ['s.ment'],
    chain: [
      { morph: null, form: 'imped-i-', gloss: '阻碍（拉丁 impedīre 词干；项目暂无对应词根）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：结果、产物、手段、行为' },
    ],
  },
  {
    id: 'w.hospital',
    morphHints: ['r.hospit', 's.al'],
    chain: [
      { morph: 'r.hospit', form: 'hospit', gloss: '主人；客人' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.local',
    morphHints: ['r.loc', 's.al'],
    chain: [
      { morph: 'r.loc', form: 'loc', gloss: '地方，位置' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.normal',
    morphHints: ['r.norm', 's.al'],
    chain: [
      { morph: 'r.norm', form: 'norm', gloss: '标准，规范' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.social',
    morphHints: ['r.soci', 's.al'],
    chain: [
      { morph: 'r.soci', form: 'soci', gloss: '社会，同伴' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.final',
    morphHints: ['r.fin', 's.al'],
    chain: [
      { morph: 'r.fin', form: 'fin', gloss: '界限，结束' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.animal',
    morphHints: ['r.anim', 's.al'],
    chain: [
      { morph: 'r.anim', form: 'anim', gloss: '生命，精神' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.medical',
    morphHints: ['r.medic', 's.al'],
    chain: [
      { morph: 'r.medic', form: 'medic', gloss: '治愈' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.trial',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'try', gloss: '挑选、筛选（Old French trier）' },
      { morph: 's.al', form: '-al', gloss: '名词后缀：结果、产物、手段、行为' },
    ],
  },
  {
    id: 'w.natural',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'natur(e)', gloss: 'nature（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.criminal',
    morphHints: ['r.crimin', 's.al'],
    chain: [
      { morph: 'r.crimin', form: 'crimin', gloss: '罪，指控' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.central',
    morphHints: ['r.centr', 's.al'],
    chain: [
      { morph: 'r.centr', form: 'centr', gloss: '中心；中间' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.federal',
    morphHints: ['r.feder', 's.al'],
    chain: [
      { morph: 'r.feder', form: 'feder', gloss: '联盟；盟约' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.material',
    morphHints: ['r.matr', 's.al'],
    chain: [
      { morph: 'r.matr', form: 'matr', gloss: '母，母亲' },
      { morph: null, form: 'i', gloss: '连接元音' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.legal',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'leg', gloss: '法律（拉丁 lex 的词干变体；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.national',
    morphHints: ['r.nat', 's.tion', 's.al'],
    chain: [
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.tion', form: '-tion', gloss: '名词后缀：动作、过程、结果' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.international',
    morphHints: ['p.inter', 'r.nat', 's.tion', 's.al'],
    chain: [
      { morph: 'p.inter', form: 'inter-', gloss: '在…之间，相互' },
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.tion', form: '-tion', gloss: '名词后缀：动作、过程、结果' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.original',
    morphHints: ['r.orig', 's.al'],
    chain: [
      { morph: 'r.orig', form: 'origin', gloss: '起源；来源（词根变体）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.usual',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'us(u)', gloss: 'use / 习惯（拉丁 ūsus；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.signal',
    morphHints: ['r.sign', 's.al'],
    chain: [
      { morph: 'r.sign', form: 'sign', gloss: '记号，标志' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.alarm',
    morphHints: ['r.arm'],
    chain: [
      { morph: null, form: "all'", gloss: '意大利语短语成分：向、到' },
      { morph: 'r.arm', form: 'arme', gloss: '武器（意大利语 arme；拉丁 arma）' },
    ],
  },
  {
    id: 'w.emotional',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'emotion', gloss: '情感（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.equal',
    morphHints: ['r.equ', 's.al'],
    chain: [
      { morph: 'r.equ', form: 'equ', gloss: '相等，平均' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.manual',
    morphHints: ['r.man', 's.al'],
    chain: [
      { morph: 'r.man', form: 'manu', gloss: '手' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.penalty',
    morphHints: ['r.pen', 's.al', 's.ity'],
    chain: [
      { morph: 'r.pen', form: 'poen', gloss: '惩罚（拉丁 poena）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: 's.ity', form: '-ity', gloss: '名词后缀：性质、状态' },
    ],
  },
  {
    id: 'w.financial',
    morphHints: [],
    chain: [
      { morph: null, form: 'finance', gloss: '金融、财政（整体词干）' },
      { morph: null, form: '-ial', gloss: '形容词后缀（项目暂无对应词素）' },
    ],
  },
  {
    id: 'w.bilingual',
    morphHints: ['p.bi', 'r.lingu', 's.al'],
    chain: [
      { morph: 'p.bi', form: 'bi-', gloss: '二，双' },
      { morph: 'r.lingu', form: 'lingu', gloss: '语言' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.bilingualism',
    morphHints: ['p.bi', 'r.lingu', 's.al'],
    chain: [
      { morph: 'p.bi', form: 'bi-', gloss: '二，双' },
      { morph: 'r.lingu', form: 'lingu', gloss: '语言' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: null, form: '-ism', gloss: '名词后缀（项目暂无对应词素）' },
    ],
  },
  {
    id: 'w.classical',
    morphHints: ['s.ic'],
    chain: [
      { morph: null, form: 'class', gloss: '等级、类别（整体词干）' },
      { morph: 's.ic', form: '-ical', gloss: '形容词后缀：…的，与…有关' },
    ],
  },
  {
    id: 'w.interpersonal',
    morphHints: ['p.inter'],
    chain: [
      { morph: 'p.inter', form: 'inter-', gloss: '在…之间，相互' },
      { morph: null, form: 'personal', gloss: '个人的（整体词干）' },
    ],
  },
  {
    id: 'w.mistrial',
    morphHints: ['p.mis'],
    chain: [
      { morph: 'p.mis', form: 'mis-', gloss: '错误、不当' },
      { morph: null, form: 'trial', gloss: '审判（整体词干）' },
    ],
  },
  {
    id: 'w.multinational',
    morphHints: ['p.multi', 'r.nat', 's.tion', 's.al'],
    chain: [
      { morph: 'p.multi', form: 'multi-', gloss: '多，许多' },
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.tion', form: '-tion', gloss: '名词后缀：动作、过程、结果' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.removal',
    morphHints: ['p.re', 'r.mov', 's.al'],
    chain: [
      { morph: 'p.re', form: 're-', gloss: '回、再；在 remove 中表示移开' },
      { morph: 'r.mov', form: 'mov', gloss: '移动' },
      { morph: 's.al', form: '-al', gloss: '名词后缀：动作、结果' },
    ],
  },
  {
    id: 'w.alert',
    morphHints: [],
    chain: [
      { morph: null, form: "all'erta", gloss: '意大利语短语「到高处/瞭望处」（整体词源）' },
    ],
  },
  {
    id: 'w.cereal',
    morphHints: ['s.al'],
    chain: [
      { morph: null, form: 'Cere(s)', gloss: 'Ceres，罗马农业女神（专名词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.neonatal',
    morphHints: ['p.neo', 'r.nat', 's.al'],
    chain: [
      { morph: 'p.neo', form: 'neo-', gloss: '新' },
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.nominal',
    morphHints: ['r.nomin', 's.al'],
    chain: [
      { morph: 'r.nomin', form: 'nomin', gloss: '名称，名字' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
    ],
  },
  {
    id: 'w.emotionally',
    morphHints: ['s.al', 's.ly'],
    chain: [
      { morph: null, form: 'emotion', gloss: '情感（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.incidentally',
    morphHints: ['s.al', 's.ly'],
    chain: [
      { morph: null, form: 'incident', gloss: '事件（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.intentionally',
    morphHints: ['s.al', 's.ly'],
    chain: [
      { morph: null, form: 'intention', gloss: '意图（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.occasionally',
    morphHints: ['s.al', 's.ly'],
    chain: [
      { morph: null, form: 'occasion', gloss: '时机、场合（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的；动作、结果' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.mental',
    morphHints: ['r.ment', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mental',
    chain: [
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.mentally',
    morphHints: ['r.ment', 's.al', 's.ly'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentally',
    chain: [
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.announcement',
    morphHints: ['s.ment'],
    sourceName: 'Etymonline',
    sourceUrl: 'https://www.etymonline.com/word/announcement',
    chain: [
      { morph: null, form: 'announce', gloss: '宣布（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.garment',
    morphHints: [],
    sourceName: 'Etymonline',
    sourceUrl: 'https://www.etymonline.com/word/garment',
    chain: [],
  },
  {
    id: 'w.illegally',
    morphHints: ['p.in', 's.al', 's.ly'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/illegally',
    chain: [
      { morph: 'p.in', form: 'il-', gloss: '否定前缀（in- 的同化变体）' },
      { morph: null, form: 'leg', gloss: '法律（未收录词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.ethical',
    morphHints: ['s.ic', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/ethical',
    chain: [
      { morph: null, form: 'eth', gloss: '品格、伦理（整体词干；项目暂无对应词根）' },
      { morph: 's.ic', form: '-ic', gloss: '形容词后缀：…的' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.unnatural',
    morphHints: ['p.un', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/unnatural',
    chain: [
      { morph: 'p.un', form: 'un-', gloss: '否定、相反' },
      { morph: null, form: 'natur(e)', gloss: '自然（整体词干；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.traditionally',
    morphHints: ['s.al', 's.ly'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/traditionally',
    chain: [
      { morph: null, form: 'tradition', gloss: '传统（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.individual',
    morphHints: ['p.in', 'r.div', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/individual',
    chain: [
      { morph: 'p.in', form: 'in-', gloss: '否定前缀：不、非' },
      { morph: 'r.div', form: 'dividu', gloss: '分开、可分（拉丁 dīviduus）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.individually',
    morphHints: ['p.in', 'r.div', 's.al', 's.ly'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/individually',
    chain: [
      { morph: 'p.in', form: 'in-', gloss: '否定前缀：不、非' },
      { morph: 'r.div', form: 'dividu', gloss: '分开、可分（拉丁 dīviduus）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.continually',
    morphHints: ['p.con', 'r.tin', 's.al', 's.ly'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/continually',
    chain: [
      { morph: 'p.con', form: 'con-', gloss: '共同，一起' },
      { morph: 'r.tin', form: 'tinu', gloss: '持有、保持（continue 的词干变体）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ly', form: '-ly', gloss: '副词后缀：以…方式' },
    ],
  },
  {
    id: 'w.uncritical',
    morphHints: ['p.un', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/uncritical',
    chain: [
      { morph: 'p.un', form: 'un-', gloss: '否定、相反' },
      { morph: null, form: 'critic', gloss: '批评（整体词干；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.nourish',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/nourish',
    chain: [],
  },
  {
    id: 'w.withdrawal',
    morphHints: ['p.with', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/withdrawal',
    chain: [
      { morph: 'p.with', form: 'with-', gloss: '反向，后退' },
      { morph: null, form: 'draw', gloss: '拉、抽回（整体词干；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '名词后缀：动作或结果' },
    ],
  },
  {
    id: 'w.bilateral',
    morphHints: ['p.bi', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/bilateral',
    chain: [
      { morph: 'p.bi', form: 'bi-', gloss: '二，双' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.transcontinental',
    morphHints: ['p.trans', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/transcontinental',
    chain: [
      { morph: 'p.trans', form: 'trans-', gloss: '跨越，转变' },
      { morph: null, form: 'continent', gloss: '大陆（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.metaphysical',
    morphHints: ['p.meta', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/metaphysical',
    chain: [
      { morph: 'p.meta', form: 'meta-', gloss: '超越，变化' },
      { morph: null, form: 'physic', gloss: '自然、物理（整体词干；项目暂无对应词根）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.circumstantial',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/circumstantial',
    chain: [{ morph: null, form: 'circumstantial', gloss: '整体词干（表层派生后缀 -ial 未收录）' }],
  },
  {
    id: 'w.multilateral',
    morphHints: ['p.multi', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/multilateral',
    chain: [
      { morph: 'p.multi', form: 'multi-', gloss: '多' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.neutralize',
    morphHints: ['s.ize'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/neutralize',
    chain: [
      { morph: null, form: 'neutral', gloss: '中性的（整体词干）' },
      { morph: 's.ize', form: '-ize', gloss: '动词后缀：使成为、使具有…性质' },
    ],
  },
  {
    id: 'w.unilateral',
    morphHints: ['p.uni', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/unilateral',
    chain: [
      { morph: 'p.uni', form: 'uni-', gloss: '一，单一' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.subliminal',
    morphHints: ['p.sub', 'r.limin', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/subliminal',
    chain: [
      { morph: 'p.sub', form: 'sub-', gloss: '在…之下' },
      { morph: 'r.limin', form: 'limin', gloss: '门槛，界限' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.subtropical',
    morphHints: ['p.sub', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/subtropical',
    chain: [
      { morph: 'p.sub', form: 'sub-', gloss: '低于、次于' },
      { morph: null, form: 'tropic', gloss: '热带（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.homicidal',
    morphHints: ['s.cide', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/homicidal',
    chain: [
      { morph: null, form: 'homi', gloss: '人（整体词干）' },
      { morph: 's.cide', form: '-cide', gloss: '杀害、杀手（构词成分）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.analgesic',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/analgesic',
    chain: [{ morph: null, form: 'analgesic', gloss: '整体借词（希腊语词素组合，项目词素表暂无对应项）' }],
  },
  {
    id: 'w.orbital',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/orbital',
    chain: [
      { morph: null, form: 'orbit', gloss: '轨道（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.menthol',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/menthol',
    chain: [
      { morph: null, form: 'menth', gloss: '薄荷（词干变体，项目无对应词根）' },
      { morph: null, form: '-ol', gloss: '化学名词后缀：醇' },
    ],
  },
  {
    id: 'w.neoclassical',
    morphHints: ['p.neo', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/neoclassical',
    chain: [
      { morph: 'p.neo', form: 'neo-', gloss: '新' },
      { morph: null, form: 'classic', gloss: '古典（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.quadrilateral',
    morphHints: ['p.quadr', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/quadrilateral',
    chain: [
      { morph: 'p.quadr', form: 'quadri-', gloss: '四' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.carnal',
    morphHints: ['r.carn', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/carnal',
    chain: [
      { morph: 'r.carn', form: 'carn', gloss: '肉' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.mural',
    morphHints: ['r.mur', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mural',
    chain: [
      { morph: 'r.mur', form: 'mur', gloss: '墙' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.transcultural',
    morphHints: ['p.trans', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/transcultural',
    chain: [
      { morph: 'p.trans', form: 'trans-', gloss: '跨越' },
      { morph: null, form: 'cultur(e)', gloss: '文化（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.sublingual',
    morphHints: ['p.sub', 'r.lingu', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/sublingual',
    chain: [
      { morph: 'p.sub', form: 'sub-', gloss: '在…之下' },
      { morph: 'r.lingu', form: 'lingu', gloss: '舌，语言' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.bifocal',
    morphHints: ['p.bi', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/bifocal',
    chain: [
      { morph: 'p.bi', form: 'bi-', gloss: '二，双' },
      { morph: null, form: 'foc(us)', gloss: '焦点（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.reversal',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/reversal',
    chain: [
      { morph: null, form: 'reverse', gloss: '反转（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '名词后缀：动作或结果' },
    ],
  },
  {
    id: 'w.inimical',
    morphHints: ['p.in', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/inimical',
    chain: [
      { morph: 'p.in', form: 'in-', gloss: '否定、相反' },
      { morph: null, form: 'amic', gloss: '朋友（拉丁语词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.phrasal',
    morphHints: ['r.phras', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/phrasal',
    chain: [
      { morph: 'r.phras', form: 'phras(e)', gloss: '说，表述' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.optional',
    morphHints: ['r.opt', 's.tion', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/optional',
    chain: [
      { morph: 'r.opt', form: 'opt', gloss: '选择' },
      { morph: 's.tion', form: '-ion', gloss: '名词后缀：行为、过程或结果' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.alimentary',
    morphHints: ['r.al', 's.ary'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimentary',
    chain: [
      { morph: 'r.al', form: 'aliment', gloss: '滋养，食物' },
      { morph: 's.ary', form: '-ary', gloss: '形容词后缀：与…有关的' },
    ],
  },
  {
    id: 'w.extramural',
    morphHints: ['p.extra', 'r.mur', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/extramural',
    chain: [
      { morph: 'p.extra', form: 'extra-', gloss: '在…之外' },
      { morph: 'r.mur', form: 'mur', gloss: '墙' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.parchment',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/parchment',
    chain: [{ morph: null, form: 'parchment', gloss: '整体借词；与 mens「心」无关' }],
  },
  {
    id: 'w.quasigovernment',
    morphHints: ['p.quasi', 's.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/quasigovernment',
    chain: [
      { morph: 'p.quasi', form: 'quasi-', gloss: '准，类，似' },
      { morph: null, form: 'govern', gloss: '治理（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.natal',
    morphHints: ['r.nat', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/natal',
    chain: [
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.cataclysmal',
    morphHints: ['p.cata', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/cataclysmal',
    chain: [
      { morph: 'p.cata', form: 'cata-', gloss: '向下、彻底' },
      { morph: null, form: 'clysm', gloss: '冲洗、泛滥（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.astral',
    morphHints: ['r.astr', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/astral',
    chain: [
      { morph: 'r.astr', form: 'astr', gloss: '星' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.demented',
    morphHints: ['p.de', 'r.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/demented',
    chain: [
      { morph: 'p.de', form: 'de-', gloss: '离开、去除' },
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: null, form: '-ed', gloss: '过去分词/形容词词尾' },
    ],
  },
  {
    id: 'w.reinforcement',
    morphHints: ['s.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/reinforcement',
    chain: [
      { morph: null, form: 'reinforce', gloss: '加强（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.spatial',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/spatial',
    chain: [{ morph: null, form: 'spatial', gloss: '整体派生词干（-ial 未收录）' }],
  },
  {
    id: 'w.quasigovernmental',
    morphHints: ['p.quasi', 's.ment', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/quasi-governmental',
    chain: [
      { morph: 'p.quasi', form: 'quasi-', gloss: '准，类，似' },
      { morph: null, form: 'govern', gloss: '治理（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.denationalize',
    morphHints: ['p.de', 'r.nat', 's.tion', 's.ize'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/denationalize',
    chain: [
      { morph: 'p.de', form: 'de-', gloss: '去除，反向' },
      { morph: 'r.nat', form: 'nat', gloss: '出生，天生' },
      { morph: 's.tion', form: '-ion', gloss: '名词后缀：行为、过程或结果' },
      { morph: 's.ize', form: '-ize', gloss: '动词后缀：使成为、使具有…性质' },
    ],
  },
  {
    id: 'w.banal',
    morphHints: ['r.ban', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/banal',
    chain: [
      { morph: 'r.ban', form: 'ban', gloss: '公告、法令' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.transpersonal',
    morphHints: ['p.trans'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/transpersonal',
    chain: [
      { morph: 'p.trans', form: 'trans-', gloss: '超越，跨越' },
      { morph: null, form: 'personal', gloss: '个人的（整体词干）' },
    ],
  },
  {
    id: 'w.postglacial',
    morphHints: ['p.post', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/postglacial',
    chain: [
      { morph: 'p.post', form: 'post-', gloss: '在…之后' },
      { morph: null, form: 'glaci', gloss: '冰川（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.alimentation',
    morphHints: ['r.al', 's.tion'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimentation',
    chain: [
      { morph: 'r.al', form: 'aliment', gloss: '滋养，食物' },
      { morph: 's.tion', form: '-ation', gloss: '名词后缀：行为、过程或结果' },
    ],
  },
  {
    id: 'w.hypercritical',
    morphHints: ['p.hyper', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/hypercritical',
    chain: [
      { morph: 'p.hyper', form: 'hyper-', gloss: '过度，超过' },
      { morph: null, form: 'critic', gloss: '批评（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.megafaunal',
    morphHints: ['p.mega', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/megafaunal',
    chain: [
      { morph: 'p.mega', form: 'mega-', gloss: '巨大' },
      { morph: null, form: 'fauna', gloss: '动物群（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.bilateralism',
    morphHints: ['p.bi', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/bilateralism',
    chain: [
      { morph: 'p.bi', form: 'bi-', gloss: '二，双' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: null, form: '-ism', gloss: '名词后缀（项目暂无对应词素）' },
    ],
  },
  {
    id: 'w.alimental',
    morphHints: ['r.al', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimental',
    chain: [
      { morph: 'r.al', form: 'aliment', gloss: '滋养，食物' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.intraabdominal',
    morphHints: ['p.intra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/intraabdominal',
    chain: [
      { morph: 'p.intra', form: 'intra-', gloss: '在…之内' },
      { morph: null, form: 'abdomin', gloss: '腹部（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.mentation',
    morphHints: ['r.ment', 's.tion'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentation',
    chain: [
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.tion', form: '-ation', gloss: '名词后缀：行为、过程或结果' },
    ],
  },
  {
    id: 'w.amazement',
    morphHints: ['s.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/amazement',
    chain: [
      { morph: null, form: 'amaze', gloss: '使惊奇（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.finalist',
    morphHints: ['r.fin', 's.al', 's.ist'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/finalist',
    chain: [
      { morph: 'r.fin', form: 'fin', gloss: '界限，结束' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ist', form: '-ist', gloss: '名词后缀：从业者、参与者' },
    ],
  },
  {
    id: 'w.stepparental',
    morphHints: ['p.step', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/stepparental',
    chain: [
      { morph: 'p.step', form: 'step-', gloss: '继亲关系' },
      { morph: null, form: 'parent', gloss: '父母（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.pigment',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/pigment',
    chain: [{ morph: null, form: 'pigment', gloss: '整体借词（来自拉丁 pigmentum；非 mens「心」）' }],
  },
  {
    id: 'w.catarrhal',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/catarrhal',
    chain: [
      { morph: null, form: 'catarrh', gloss: '卡他、黏膜炎症（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.neuralgia',
    morphHints: ['r.neur', 's.ia'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/neuralgia',
    chain: [
      { morph: 'r.neur', form: 'neur', gloss: '神经' },
      { morph: null, form: 'alg', gloss: '疼痛（希腊词干，项目暂无对应词根）' },
      { morph: 's.ia', form: '-ia', gloss: '名词后缀：状态、疾病' },
    ],
  },
  {
    id: 'w.hemicerebral',
    morphHints: ['p.hemi', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/hemicerebral',
    chain: [
      { morph: 'p.hemi', form: 'hemi-', gloss: '半' },
      { morph: null, form: 'cerebr', gloss: '大脑（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.factual',
    morphHints: ['r.fac'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/factual',
    chain: [
      { morph: 'r.fac', form: 'fact', gloss: '做，制造；事实' },
      { morph: null, form: '-ual', gloss: '形容词后缀成分（项目未单列；不拆成 -al）' },
    ],
  },
  {
    id: 'w.myalgia',
    morphHints: ['s.ia'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/myalgia',
    chain: [
      { morph: null, form: 'myalg', gloss: '肌肉疼痛（希腊词干组合，项目暂无对应词根）' },
      { morph: 's.ia', form: '-ia', gloss: '名词后缀：状态、疾病' },
    ],
  },
  {
    id: 'w.vicecomital',
    morphHints: ['p.vice', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/vicecomital',
    chain: [
      { morph: 'p.vice', form: 'vice-', gloss: '副，代理' },
      { morph: null, form: 'comit', gloss: '伯爵（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.retroperitoneal',
    morphHints: ['p.retro', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/retroperitoneal',
    chain: [
      { morph: 'p.retro', form: 'retro-', gloss: '在…后方' },
      { morph: null, form: 'peritone', gloss: '腹膜（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.aboriginal',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/aboriginal',
    chain: [
      { morph: null, form: 'aborigin(e)', gloss: '原住民、原始起源（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.assortment',
    morphHints: ['s.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/assortment',
    chain: [
      { morph: null, form: 'assort', gloss: '分类，搭配（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.radial',
    morphHints: ['r.radi', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/radial',
    chain: [
      { morph: 'r.radi', form: 'radi', gloss: '辐条，光线；半径' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.embankment',
    morphHints: ['p.en', 's.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/embankment',
    chain: [
      { morph: 'p.en', form: 'em-', gloss: '使进入某状态（同化变体）' },
      { morph: null, form: 'bank', gloss: '堤岸（整体词干）' },
      { morph: 's.ment', form: '-ment', gloss: '名词后缀：行为或其结果' },
    ],
  },
  {
    id: 'w.neutrality',
    morphHints: ['r.neutr', 's.al', 's.ity'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/neutrality',
    chain: [
      { morph: 'r.neutr', form: 'neutr', gloss: '中间；不偏不倚' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
      { morph: 's.ity', form: '-ity', gloss: '名词后缀：性质、状态' },
    ],
  },
  {
    id: 'w.heptagonal',
    morphHints: ['p.hept', 'r.agon', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/heptagonal',
    chain: [
      { morph: 'p.hept', form: 'hepta-', gloss: '七' },
      { morph: 'r.agon', form: 'agon', gloss: '角' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.infraorbital',
    morphHints: ['p.infra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/infraorbital',
    chain: [
      { morph: 'p.infra', form: 'infra-', gloss: '在…之下、内部' },
      { morph: null, form: 'orbit', gloss: '眼眶/轨道（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.empirical',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/empirical',
    chain: [
      { morph: null, form: 'empiric', gloss: '经验的（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.neocerebellum',
    morphHints: ['p.neo'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/neocerebellum',
    chain: [
      { morph: 'p.neo', form: 'neo-', gloss: '新' },
      { morph: null, form: 'cerebellum', gloss: '小脑（整体词干）' },
    ],
  },
  {
    id: 'w.mentative',
    morphHints: ['r.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentative',
    chain: [
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: null, form: '-ative', gloss: '形容词后缀成分（项目未单列）' },
    ],
  },
  {
    id: 'w.alimonious',
    morphHints: ['s.ous'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimonious',
    chain: [
      { morph: null, form: 'alimony', gloss: '赡养费（整体词干）' },
      { morph: 's.ous', form: '-ous', gloss: '形容词后缀：充满…的，具有…性质的' },
    ],
  },
  {
    id: 'w.departmental',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/departmental',
    chain: [
      { morph: null, form: 'department', gloss: '部门（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.intravesical',
    morphHints: ['p.intra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/intravesical',
    chain: [
      { morph: 'p.intra', form: 'intra-', gloss: '在…之内' },
      { morph: null, form: 'vesic', gloss: '膀胱（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.omnicausal',
    morphHints: ['p.omni', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/omnicausal',
    chain: [
      { morph: 'p.omni', form: 'omni-', gloss: '全部，所有' },
      { morph: null, form: 'caus', gloss: '原因（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.contrapuntal',
    morphHints: ['p.contra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/contrapuntal',
    chain: [
      { morph: 'p.contra', form: 'contra-', gloss: '相对，反对' },
      { morph: null, form: 'punt', gloss: '点（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.infracostal',
    morphHints: ['p.infra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/infracostal',
    chain: [
      { morph: 'p.infra', form: 'infra-', gloss: '在…之下' },
      { morph: null, form: 'cost', gloss: '肋骨（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.midlateral',
    morphHints: ['p.mid', 'r.later', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/midlateral',
    chain: [
      { morph: 'p.mid', form: 'mid-', gloss: '中间' },
      { morph: 'r.later', form: 'later', gloss: '边，侧' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.triconsonantal',
    morphHints: ['p.tri', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/triconsonantal',
    chain: [
      { morph: 'p.tri', form: 'tri-', gloss: '三' },
      { morph: null, form: 'consonant', gloss: '辅音（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.procedural',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/procedural',
    chain: [
      { morph: null, form: 'procedure', gloss: '程序、步骤（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.dementing',
    morphHints: ['p.de', 'r.ment', 's.ing'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/dementing',
    chain: [
      { morph: 'p.de', form: 'de-', gloss: '离开、去除' },
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.ing', form: '-ing', gloss: '动词现在分词/名词后缀' },
    ],
  },
  {
    id: 'w.intrapleural',
    morphHints: ['p.intra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/intrapleural',
    chain: [
      { morph: 'p.intra', form: 'intra-', gloss: '在…之内' },
      { morph: null, form: 'pleur', gloss: '胸膜（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.intrathecal',
    morphHints: ['p.intra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/intrathecal',
    chain: [
      { morph: 'p.intra', form: 'intra-', gloss: '在…之内' },
      { morph: null, form: 'thec', gloss: '鞘、囊（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.alimentotherapy',
    morphHints: ['r.al', 'r.therap'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimentotherapy',
    chain: [
      { morph: 'r.al', form: 'aliment', gloss: '滋养，食物' },
      { morph: null, form: 'o', gloss: '连接元音' },
      { morph: 'r.therap', form: 'therapy', gloss: '治疗' },
    ],
  },
  {
    id: 'w.infralingual',
    morphHints: ['p.infra', 'r.lingu', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/infralingual',
    chain: [
      { morph: 'p.infra', form: 'infra-', gloss: '在…之下' },
      { morph: 'r.lingu', form: 'lingu', gloss: '舌，语言' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.alimentativeness',
    morphHints: ['r.al', 's.ment', 's.ness'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alimentativeness',
    chain: [
      { morph: 'r.al', form: 'aliment', gloss: '滋养，食物' },
      { morph: null, form: '-ative', gloss: '形容词后缀成分（项目未单列）' },
      { morph: 's.ness', form: '-ness', gloss: '名词后缀：性质、状态' },
    ],
  },
  {
    id: 'w.mentoring',
    morphHints: ['s.ing'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentoring',
    chain: [
      { morph: null, form: 'mentor', gloss: '导师（整体词干，源自人名 Mentor）' },
      { morph: 's.ing', form: '-ing', gloss: '动词现在分词/名词后缀' },
    ],
  },
  {
    id: 'w.mentioned',
    morphHints: ['r.ment'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mention',
    chain: [
      { morph: 'r.ment', form: 'ment', gloss: '记忆，想到（与拉丁 meminī 同源）' },
      { morph: null, form: 'ion', gloss: '拉丁名词构词成分（非英语 -tion 后缀）' },
      { morph: null, form: '-ed', gloss: '过去式/过去分词词尾' },
    ],
  },
  {
    id: 'w.coalesce',
    morphHints: ['p.con', 'r.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/coalesce',
    chain: [
      { morph: 'p.con', form: 'co-', gloss: '共同，一起' },
      { morph: 'r.al', form: 'alesce', gloss: '生长（拉丁 alēscō；与 alere「滋养」同源）' },
    ],
  },
  {
    id: 'w.alenon',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/Alen%C3%A7on',
    chain: [{ morph: null, form: 'Alençon', gloss: '法国地名及其蕾丝名称（专名整体）' }],
  },
  {
    id: 'w.exoperidermal',
    morphHints: ['p.exo', 'r.derm', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/exoperidermal',
    chain: [
      { morph: 'p.exo', form: 'exo-', gloss: '外，外部' },
      { morph: null, form: 'peri-', gloss: '周围（项目未单列）' },
      { morph: 'r.derm', form: '-derm-', gloss: '皮肤，层' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.circummural',
    morphHints: ['p.circum', 'r.mur', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/circummural',
    chain: [
      { morph: 'p.circum', form: 'circum-', gloss: '周围，环绕' },
      { morph: 'r.mur', form: 'mur', gloss: '墙' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.dementation',
    morphHints: ['p.de', 'r.ment', 's.tion'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/dementation',
    chain: [
      { morph: 'p.de', form: 'de-', gloss: '离开、去除' },
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.tion', form: '-ation', gloss: '名词后缀：行为、过程或结果' },
    ],
  },
  {
    id: 'w.syncytial',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/syncytial',
    chain: [{ morph: null, form: 'syncytial', gloss: '整体派生词干；不是 alere「滋养」构词' }],
  },
  {
    id: 'w.circumnasal',
    morphHints: ['p.circum'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/circumnasal',
    chain: [
      { morph: 'p.circum', form: 'circum-', gloss: '周围，环绕' },
      { morph: null, form: 'nasal', gloss: '鼻部的（整体词干）' },
    ],
  },
  {
    id: 'w.mentiferous',
    morphHints: ['r.ment', 'r.fer', 's.ous'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentiferous',
    chain: [
      { morph: 'r.ment', form: 'menti', gloss: '心，思想，精神' },
      { morph: 'r.fer', form: 'fer', gloss: '带，承载，运送' },
      { morph: 's.ous', form: '-ous', gloss: '形容词后缀：充满…的' },
    ],
  },
  {
    id: 'w.secretarial',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/secretarial',
    chain: [
      { morph: null, form: 'secretary', gloss: '秘书（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.incidental',
    morphHints: ['s.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/incidental',
    chain: [
      { morph: null, form: 'incident', gloss: '事件（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.menticulture',
    morphHints: ['r.ment', 'r.cult'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/menticulture',
    chain: [
      { morph: 'r.ment', form: 'menti', gloss: '心，思想，精神' },
      { morph: 'r.cult', form: 'culture', gloss: '耕种，培养' },
    ],
  },
  {
    id: 'w.infrarenal',
    morphHints: ['p.infra', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/infrarenal',
    chain: [
      { morph: 'p.infra', form: 'infra-', gloss: '在…之下' },
      { morph: null, form: 'renal', gloss: '肾脏的（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.hypoglossal',
    morphHints: ['p.hypo', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/hypoglossal',
    chain: [
      { morph: 'p.hypo', form: 'hypo-', gloss: '在下，次于' },
      { morph: null, form: 'gloss', gloss: '舌（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.mentimutation',
    morphHints: ['r.ment', 'r.mut', 's.tion'],
    sourceName: 'Wiktionary / OED',
    sourceUrl: 'https://en.wiktionary.org/wiki/mentimutation',
    chain: [
      { morph: 'r.ment', form: 'menti', gloss: '心，思想，精神' },
      { morph: 'r.mut', form: 'mut', gloss: '变，改变' },
      { morph: 's.tion', form: '-ation', gloss: '名词后缀：行为、过程或结果' },
    ],
  },
  {
    id: 'w.dementive',
    morphHints: ['p.de', 'r.ment', 's.ive'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/dementive',
    chain: [
      { morph: 'p.de', form: 'de-', gloss: '离开、去除' },
      { morph: 'r.ment', form: 'ment', gloss: '心，思想，精神' },
      { morph: 's.ive', form: '-ive', gloss: '形容词后缀：具有…性质的' },
    ],
  },
  {
    id: 'w.pachymeningitis',
    morphHints: ['r.pachy', 's.itis'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/pachymeningitis',
    chain: [
      { morph: 'r.pachy', form: 'pachy-', gloss: '厚' },
      { morph: null, form: 'mening', gloss: '脑膜（整体词干；与 mens「心」无关）' },
      { morph: 's.itis', form: '-itis', gloss: '医学后缀：炎症' },
    ],
  },
  {
    id: 'w.rhinalgia',
    morphHints: ['r.rhin', 'r.alg', 's.ia'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/rhinalgia',
    chain: [
      { morph: 'r.rhin', form: 'rhin', gloss: '鼻' },
      { morph: 'r.alg', form: 'alg', gloss: '痛' },
      { morph: 's.ia', form: '-ia', gloss: '名词后缀：状态、疾病' },
    ],
  },
  {
    id: 'w.hemiglossal',
    morphHints: ['p.hemi', 's.al'],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/hemiglossal',
    chain: [
      { morph: 'p.hemi', form: 'hemi-', gloss: '半' },
      { morph: null, form: 'gloss', gloss: '舌（整体词干）' },
      { morph: 's.al', form: '-al', gloss: '形容词后缀：…的，与…有关的' },
    ],
  },
  {
    id: 'w.alundum',
    morphHints: [],
    sourceName: 'Wiktionary',
    sourceUrl: 'https://en.wiktionary.org/wiki/alundum',
    chain: [{ morph: null, form: 'alundum', gloss: '商品名/合成词整体；不是 alere「滋养」词根' }],
  },
  { id: 'w.vicemal', status: 'unverified', morphHints: ['p.vice'], sourceName: 'Wiktionary 搜索（未找到词条）', sourceUrl: 'https://en.wiktionary.org/w/index.php?search=vicemal', chain: [{ morph: 'p.vice', form: 'vice-', gloss: '副职、代理' }, { morph: null, form: 'emal', gloss: '未找到可靠词典依据；不解释为 alere「滋养」' }] },
  { id: 'w.menticide', morphHints: ['r.ment', 's.cide'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/menticide', chain: [{ morph: 'r.ment', form: 'menti', gloss: '心智（拉丁 mens/mentis）' }, { morph: 's.cide', form: '-cide', gloss: '杀灭、毁灭' }] },
  { id: 'w.cynicidal', status: 'unverified', morphHints: [], sourceName: 'Wiktionary 搜索（未找到词条）', sourceUrl: 'https://en.wiktionary.org/w/index.php?search=cynicidal', chain: [{ morph: null, form: 'cynicidal', gloss: '未找到可靠词典收录；不能据词面臆拆成 cyn + -cide + -al' }] },
  { id: 'w.mentimeter', status: 'unverified', morphHints: [], sourceName: 'Wiktionary 搜索（未找到词条）', sourceUrl: 'https://en.wiktionary.org/w/index.php?search=mentimeter', chain: [{ morph: null, form: 'mentimeter', gloss: '未找到可靠通用词典词源；作为品牌/专名整体处理，不拆成 mens「心」+ meter' }] },
  { id: 'w.locality', morphHints: ['r.loc', 's.al', 's.ity'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/locality', chain: [{ morph: 'r.loc', form: 'loc', gloss: '地方、位置' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }, { morph: 's.ity', form: '-ity', gloss: '性质、状态' }] },
  { id: 'w.hemihedral', morphHints: ['p.hemi', 'r.hedr', 's.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/hemihedral', chain: [{ morph: 'p.hemi', form: 'hemi-', gloss: '半' }, { morph: 'r.hedr', form: 'hedr', gloss: '面' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }] },
  { id: 'w.centesimally', morphHints: ['s.al', 's.ly'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/centesimally', chain: [{ morph: null, form: 'centesim', gloss: '百分之一（整体词干；不与 centi- 机械等同）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }, { morph: 's.ly', form: '-ly', gloss: '副词后缀' }] },
  { id: 'w.alible', morphHints: ['r.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/alible', chain: [{ morph: 'r.al', form: 'al(i)', gloss: '滋养、供养（拉丁 alere）' }] },
  { id: 'w.aliferous', morphHints: ['r.fer', 's.ous'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/aliferous', chain: [{ morph: null, form: 'ala', gloss: '翼（拉丁 ala；词中 i 为连接成分；不是 alere「滋养」）' }, { morph: 'r.fer', form: '-fer', gloss: '携带、承载' }, { morph: 's.ous', form: '-ous', gloss: '形容词后缀' }] },
  { id: 'w.mentilumin', status: 'unverified', morphHints: [], sourceName: 'Wiktionary 搜索（未找到词条）', sourceUrl: 'https://en.wiktionary.org/w/index.php?search=mentilumin', chain: [{ morph: null, form: 'mentilumin', gloss: '未找到可靠词典词源；疑似未证实造词，不挂 mens「心」' }] },
  { id: 'w.circumlittoral', morphHints: ['p.circum', 's.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/circumlittoral', chain: [{ morph: 'p.circum', form: 'circum-', gloss: '周围、环绕' }, { morph: null, form: 'littor', gloss: '海岸（拉丁 litus；清单无对应根）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }] },
  { id: 'w.withdrawalment', morphHints: ['p.with', 's.al', 's.ment'], sourceName: 'Wiktionary / historical dictionaries', sourceUrl: 'https://en.wiktionary.org/wiki/withdrawalment', chain: [{ morph: 'p.with', form: 'with-', gloss: '向后、撤回' }, { morph: null, form: 'draw', gloss: '拉；动词词干' }, { morph: 's.al', form: '-al', gloss: '构成 withdrawal 名词' }, { morph: 's.ment', form: '-ment', gloss: '罕见再派生名词后缀' }] },
  { id: 'w.temporomental', status: 'unverified', morphHints: [], sourceName: 'Wiktionary 搜索（未找到词条）', sourceUrl: 'https://en.wiktionary.org/w/index.php?search=temporomental', chain: [{ morph: null, form: 'temporomental', gloss: '未找到可靠词典收录；清除推测性拆解，词根匹配待原始来源核实' }] },
  { id: 'w.ministerial', morphHints: [], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/ministerial', chain: [{ morph: null, form: 'ministerial', gloss: 'minister + -ial（复合后缀）；不挂 alere 词根' }] },
  { id: 'w.alimentiveness', morphHints: ['r.al', 's.ment', 's.ive', 's.ness'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/alimentiveness', chain: [{ morph: 'r.al', form: 'ali-', gloss: '滋养（拉丁 alere）' }, { morph: 's.ment', form: '-ment', gloss: 'aliment 词干中的名词构成成分' }, { morph: 's.ive', form: '-ive', gloss: '形容词后缀；alimentive 的派生' }, { morph: 's.ness', form: '-ness', gloss: '性质、状态' }] },
  { id: 'w.cereals', morphHints: ['s.al', 's.plural'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/cereal', chain: [{ morph: null, form: 'Ceres', gloss: '罗马农业女神专名' }, { morph: 's.al', form: '-al', gloss: '形容词后缀；构成 cereal' }, { morph: 's.plural', form: '-s', gloss: '复数屈折后缀' }] },
  { id: 'w.mentalist', morphHints: ['r.ment', 's.al', 's.ist'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/mentalist', chain: [{ morph: 'r.ment', form: 'ment', gloss: '心智（拉丁 mens/mentis）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀，构成 mental' }, { morph: 's.ist', form: '-ist', gloss: '从事者、信奉者' }] },
  { id: 'w.equatorial', morphHints: [], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/equatorial', chain: [{ morph: null, form: 'equatorial', gloss: 'equator + -ial；项目未收录 -ial，不能误挂 -al 或 alere 词根' }] },
  { id: 'w.doctoral', morphHints: ['s.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/doctoral', chain: [{ morph: null, form: 'doctor', gloss: '医生、博士（整体词干）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }] },
  { id: 'w.mentored', morphHints: ['s.ed'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/mentor', chain: [{ morph: null, form: 'mentor', gloss: '导师；源自人名 Mentor，不是 mens「心」词根' }, { morph: 's.ed', form: '-ed', gloss: '过去式/过去分词屈折后缀' }] },
  { id: 'w.coronal', morphHints: ['r.coron', 's.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/coronal', chain: [{ morph: 'r.coron', form: 'coron', gloss: '冠、冠状物' }, { morph: 's.al', form: '-al', gloss: '形容词后缀；不是 alere「滋养」' }] },
  { id: 'w.appeasement', morphHints: ['s.ment'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/appeasement', chain: [{ morph: null, form: 'appease', gloss: '平息、安抚（整体动词词干）' }, { morph: 's.ment', form: '-ment', gloss: '行为或结果名词后缀；不是 mens「心」' }] },
  { id: 'w.multilingual', morphHints: ['p.multi', 'r.lingu', 's.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/multilingual', chain: [{ morph: 'p.multi', form: 'multi-', gloss: '多' }, { morph: 'r.lingu', form: 'lingu', gloss: '语言' }, { morph: 's.al', form: '-al', gloss: '形容词后缀' }] },
  { id: 'w.microbial', morphHints: ['s.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/microbial', chain: [{ morph: null, form: 'microbe', gloss: '微生物（整体词干）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀；不能拆成 bi「二」' }] },
  { id: 'w.maximal', morphHints: ['s.al'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/maximal', chain: [{ morph: null, form: 'maximum', gloss: '最大值（派生基词；拼写有缩减）' }, { morph: 's.al', form: '-al', gloss: '形容词后缀；maximum + -al' }] },
  { id: 'w.commensurate', morphHints: ['p.con'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/commensurate', chain: [{ morph: 'p.con', form: 'com-', gloss: '共同、一起' }, { morph: null, form: 'mensur', gloss: '测量（拉丁 mensura；不是 mens「心」）' }, { morph: null, form: '-ate', gloss: '拉丁分词/形容词后缀' }] },
  { id: 'w.unmentionable', morphHints: ['p.un', 's.able'], sourceName: 'Wiktionary', sourceUrl: 'https://en.wiktionary.org/wiki/unmentionable', chain: [{ morph: 'p.un', form: 'un-', gloss: '不、不可' }, { morph: null, form: 'mention', gloss: '提及（完整词干；不要按拼写拆出 -ment）' }, { morph: 's.able', form: '-able', gloss: '能够被…的' }] },
]

export default wordsEtymReviewed
