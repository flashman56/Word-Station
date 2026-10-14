/**
 * base-form —— 屈折形 → 原形候选识别（供补全 lemma 折叠用）
 * ------------------------------------------------------------------
 * ★ 为什么不能用「按候选顺序取第一个存在的」 ★
 *   第一版这么写，在已审的 13,183 对上只有 98.0% 一致率，且 224 条不一致**全是同一个
 *   系统性 bug**：候选按构造顺序返回，先命中的常常是裸词干，而它恰好是真实存在的词——
 *     scared  → 命中 scar   （应 scare）
 *     putting  → 命中 putt   （应 put，putt 是板球术语）
 *     writing  → 命中 writ   （应 write，writ 是古体「书面」）
 *     served   → 命中 serv   （应 serve）
 *     writing/leaves/states 同类。
 *   这类误判会把学习记录并到**错误的词**上——比不折叠更糟。
 *
 * ★ 本版的判据：候选都存在时，按数据择优，不靠语感 ★
 *   1. 候选形必须**在库里**（非专名），否则不是本库成员；
 *   2. 择优排序：**有 chain 的优先**（折叠的目的正是让学习者落在有拆解的代表形上），
 *      其次 **freqRank 数值更小的优先**（更高频）；
 *   3. 仍并列则取更长的候选（silently-restored -e 形式通常更长：make > mak）。
 *
 * 本模块**只读**，不写任何数据文件。
 */

const POSSESSIVES = new Set(['hers', 'ours', 'yours', 'theirs', 'its', 'mine'])

/** 不规则屈折：形态变化大、后缀剥离够不到，必须手列 */
export const IRREGULAR = {
  blown: 'blow', drank: 'drink', flew: 'fly', hid: 'hide', won: 'win', drawn: 'draw',
  built: 'build', sang: 'sing', swam: 'swim', ran: 'run', began: 'begin', threw: 'throw',
  grew: 'grow', knew: 'know', blew: 'blow', rode: 'ride', rose: 'rise', chose: 'choose',
  froze: 'freeze', spoke: 'speak', broke: 'break', wrote: 'write', ate: 'eat', fell: 'fall',
  stole: 'steal', took: 'take', shook: 'shake', slept: 'sleep', kept: 'keep', left: 'leave',
  meant: 'mean', sent: 'send', spent: 'spend', lost: 'lose', paid: 'pay', laid: 'lay',
  said: 'say', sold: 'sell', told: 'tell', found: 'find', stood: 'stand', understood: 'understand',
  wore: 'wear', tore: 'tear', dug: 'dig', hung: 'hang', stuck: 'stick', struck: 'strike',
  slid: 'slide', shot: 'shoot', sought: 'seek', brought: 'bring', thought: 'think',
  caught: 'catch', taught: 'teach', fought: 'fight', lit: 'light', met: 'meet', bit: 'bite',
  came: 'come', become: 'become', sank: 'sink', got: 'get', forgot: 'forget', gave: 'give',
  drove: 'drive', awoke: 'awake', woke: 'wake', wove: 'weave', spun: 'spin', clung: 'cling',
  flung: 'fling', stung: 'sting', swung: 'swing', shrank: 'shrink', sprang: 'spring',
  forbade: 'forbid', arose: 'arise', bet: 'bet', dealt: 'deal', burnt: 'burn', learnt: 'learn',
  dreamt: 'dream', leapt: 'leap', knelt: 'kneel', sped: 'speed', spilt: 'spill', spurned: 'spurn',
  weaved: 'weave', worked: 'work', swerved: 'swerve',
}

const deDouble = (s) => s.replace(/(.)\1$/, '$1')

/**
 * @param {string} form 变形形
 * @param {Map<string, object>} index form(小写) -> 词条
 * @returns {string|null} 最可能的原形；判不出返回 null（**保守跳过，不猜**）
 */
export function findBaseForm(form, index) {
  const w = String(form || '').toLowerCase()
  if (!w || POSSESSIVES.has(w)) return null
  if (IRREGULAR[w]) {
    const t = index.get(IRREGULAR[w])
    return t && t.kind !== 'proper' ? IRREGULAR[w] : null
  }

  /**
   * 候选原形。**push 的顺序就是优先级**——最终排序以「越小越优先」为主键。
   *
   * ★ 顺序依据英语形态规则，不是数据统计 ★
   *   第一版按「碰巧在库里」取第一个，一致率只有 98.0%；改成「优先有 chain」后
   *   又被 car/care 这类同形词坑到 98.44%。真正决定原形的是**形态规则**：
   *
   *   -ed / -ing  → 优先「词干 + e」：cared→care、hiding→hide、riding→ride、
   *                 staring→stare、shining→shine、making→make、caring→care
   *     再去重复辅音：stopping→stop、dropped→drop、running→run（否则 'stope' 之类）
   *     最后才是裸词干：visited→visit（'visite' 不成词）
   *
   *   -s / -es    → 优先「去掉 -s」：cares→care、lives→live、boxes→boxe(不成立)
   *     再「去掉 -es」：boxes→box、watches→watch
   *     （顺序反了会把 cares 判成 car）
   */
  const raw = []
  const push = (x) => {
    if (x && x.length >= 3 && x !== w && !raw.includes(x)) raw.push(x)
  }
  if (w.endsWith('ies') && w.length > 4) push(w.slice(0, -3) + 'y')
  if (w.endsWith('es') && w.length > 4) { push(w.slice(0, -1)); push(w.slice(0, -2)) }
  if (w.endsWith('s') && w.length > 4) push(w.slice(0, -1))
  if (w.endsWith('ing') && w.length > 5) {
    const st = w.slice(0, -3)
    push(st + 'e'); push(deDouble(st)); push(st)
  }
  if (w.endsWith('ed') && w.length > 4) {
    const st = w.slice(0, -2)
    push(st + 'e'); push(deDouble(st)); push(st)
  }
  if (w.endsWith('est') && w.length > 5) { const st = w.slice(0, -3); push(st); push(st + 'e'); push(deDouble(st)) }
  if (w.endsWith('er') && w.length > 4) { const st = w.slice(0, -2); push(st + 'e'); push(st); push(deDouble(st)) }
  if (w.endsWith('ly') && w.length > 4) { const st = w.slice(0, -2); push(st); push(st + 'e') }

  // ★ 主键 = **形态学优先级**（实测最优 98.74%，次要键无影响）★
  //   跑过基准对比：morph-first 98.74% > chain-first 98.70% > freq-first 98.38%。
  //   freq-first 被 `notes→not` / `staring→star` / `cares→car` 坑掉（裸词干恰好是高频词）；
  //   morph-first 被 `passed→passe` / `touched→touche` 坑掉（冷僻词恰好在库里）。
  //   两者都不是 100% —— **所以本模块的产物只能进人工复核，不能直接批量写进
  //   words-lemma.js**：判错一次 = 把学习记录并到错误的词上，比不折叠更糟。
  const found = []
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw[i]
    const t = index.get(c)
    if (!t || t.kind === 'proper' || t.id === form) continue
    found.push({ form: c, word: t, rank: i })
  }
  if (!found.length) return null
  found.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    const ar = Number.isFinite(a.word.freqRank) ? a.word.freqRank : Infinity
    const br = Number.isFinite(b.word.freqRank) ? b.word.freqRank : Infinity
    return ar - br
  })
  return found[0].form
}

/**
 * 该词是否为**不规则屈折**（原形来自手列表 IRREGULAR，不靠启发式猜）。
 * 只有这一类的 base 是可信的，可用于自动折叠。
 */
export function isIrregular(form) {
  return Object.prototype.hasOwnProperty.call(IRREGULAR, String(form || '').toLowerCase())
}

/** 取不规则原形（仅当该词确在库中且非专名时返回，否则 null） */
export function irregularBase(form, index) {
  const w = String(form || '').toLowerCase()
  if (!Object.prototype.hasOwnProperty.call(IRREGULAR, w)) return null
  const base = IRREGULAR[w]
  const t = index.get(base)
  return t && t.kind !== 'proper' ? base : null
}