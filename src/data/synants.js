import { MONO_SYNONYMS, MONO_ANTONYMS } from './synants-mono.js'
import { MONO_SEED_SYNONYMS, MONO_SEED_ANTONYMS } from './synants-mono-seed.js'

/** 把同一语义簇展开为无向词对；词簇较大时使用 grade=3 表示相关语义。 */
function clusterPairs(forms, grade, note = '') {
  const pairs = []
  for (let i = 0; i < forms.length; i += 1) {
    for (let j = i + 1; j < forms.length; j += 1) {
      pairs.push({ a: forms[i], b: forms[j], grade, ...(note ? { note } : {}) })
    }
  }
  return pairs
}

/** 把两个相对语义组展开为反义词对。 */
function oppositePairs(left, right, grade = 1) {
  return left.flatMap((a) => right.map((b) => ({ a, b, grade })))
}

export const SYNONYMS = [
  ...clusterPairs(['big', 'large'], 1, '尺寸或程度大'),
  ...clusterPairs(['begin', 'start', 'open'], 2, '开始某事'),
  ...clusterPairs(['end', 'stop', 'close'], 2, '使过程结束'),
  ...clusterPairs(['happy', 'glad', 'laugh', 'smile'], 2, '积极情绪'),
  ...clusterPairs(['fast', 'quick'], 1, '速度快'),
  ...clusterPairs(['clever', 'smart', 'quick'], 2, '思维敏捷'),
  ...clusterPairs(['good', 'kind', 'right', 'true'], 3, '积极或正确'),
  ...clusterPairs(['strong', 'brave'], 2, '有力量或勇气'),
  ...clusterPairs(['sad', 'cry'], 2, '悲伤表现'),
  ...clusterPairs(['angry', 'hate'], 3, '负面情绪'),
  ...clusterPairs(['harm', 'hate', 'cruel', 'bad'], 3, '伤害或负面'),
  ...clusterPairs(['peace', 'calm', 'quiet', 'safe'], 2, '安宁状态'),
  ...clusterPairs(['run', 'walk', 'jump', 'swim', 'dance', 'play'], 3, '身体活动'),
  ...clusterPairs(['eat', 'food', 'bread', 'rice', 'meat', 'egg', 'milk'], 3, '食物与进食'),
  ...clusterPairs(['think', 'know', 'mind'], 2, '认知活动'),
  ...clusterPairs(['man', 'woman', 'boy', 'girl', 'child'], 3, '人物称谓'),
  ...clusterPairs(['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep'], 3, '常见动物'),
  ...clusterPairs(['home', 'house', 'room'], 2, '居住空间'),
  ...clusterPairs(['door', 'window'], 3, '建筑开口'),
  ...clusterPairs(['table', 'chair', 'bed'], 3, '家具'),
  ...clusterPairs(['water', 'sea', 'river', 'lake', 'rain', 'snow'], 3, '自然水体或水象'),
  ...clusterPairs(['sky', 'sun', 'moon', 'star'], 3, '天空与天体'),
  ...clusterPairs(['earth', 'mountain', 'hill', 'road'], 3, '地表事物'),
  ...clusterPairs(['car', 'bus', 'train', 'ship', 'boat'], 3, '交通工具'),
  ...clusterPairs(['day', 'morning', 'evening', 'night', 'week', 'month', 'year', 'time'], 3, '时间概念'),
  ...clusterPairs(['life', 'alive', 'live', 'well'], 2, '生命状态'),
  ...clusterPairs(['death', 'dead', 'die'], 1, '死亡状态'),
  ...clusterPairs(['hand', 'arm'], 2, '上肢部位'),
  ...clusterPairs(['head', 'face'], 2, '头面部'),
  ...clusterPairs(['eye', 'look', 'see'], 2, '视觉'),
  ...clusterPairs(['ear', 'hear'], 2, '听觉'),
  ...clusterPairs(['mouth', 'speak', 'say', 'tell', 'ask', 'answer'], 3, '语言交流'),
  ...clusterPairs(['foot', 'leg'], 2, '下肢部位'),
  ...clusterPairs(['red', 'blue', 'green', 'black', 'white', 'brown'], 3, '颜色'),
  ...clusterPairs(['young', 'new'], 2, '较新的状态'),
  ...clusterPairs(['near', 'close'], 1, '距离近'),
  ...clusterPairs(['kind', 'good', 'glad'], 3, '正面品质'),
  ...clusterPairs(['busy', 'work'], 3, '忙于工作'),
  ...clusterPairs(['free', 'safe'], 3, '无约束或无危险'),
  ...clusterPairs(['laugh', 'smile', 'happy', 'glad'], 2, '快乐表现'),
  ...clusterPairs(['find', 'see', 'know'], 3, '发现或认知'),
  ...clusterPairs(['lose', 'fail'], 2, '未取得目标'),
  ...clusterPairs(['give', 'help'], 2, '给予支持'),
  ...clusterPairs(['make', 'do', 'work'], 3, '执行或产出'),
  ...clusterPairs(['read', 'write', 'speak'], 3, '语言能力'),
  ...clusterPairs(['sushi', 'ramen', 'tempura', 'tofu'], 3, '日本及东亚食品'),
  ...clusterPairs(['karate', 'judo', 'sumo'], 3, '日本运动'),
  ...clusterPairs(['manga', 'anime', 'emoji'], 3, '日本流行文化'),
  ...clusterPairs(['cafe', 'restaurant', 'menu'], 3, '餐饮场景'),
  ...clusterPairs(['piano', 'soprano', 'ballet', 'waltz'], 3, '表演艺术'),
  ...clusterPairs(['Paris', 'London', 'Rome', 'Athens', 'Tokyo'], 3, '世界名城'),
  ...clusterPairs(['Einstein', 'Newton', 'Darwin', 'Galileo', 'Tesla', 'Edison'], 3, '科学人物'),
  ...clusterPairs(['Socrates', 'Plato', 'Aristotle'], 3, '古希腊思想家'),
  { a: 'destroy', b: 'harm', grade: 2, note: '造成破坏' },
  { a: 'increase', b: 'big', grade: 3, note: '数量或程度增大' },
  { a: 'reduce', b: 'small', grade: 3, note: '数量或程度减小' },
  { a: 'accept', b: 'include', grade: 3, note: '接纳或纳入' },
  // 重复样例：构建器应保留更小 grade，并合并 note。
  { a: 'large', b: 'big', grade: 2, note: '重复写法：词序相反' },
  { a: 'quick', b: 'fast', grade: 3, note: '重复写法：较宽泛' },
  { a: 'happy', b: 'smile', grade: 3, note: '重复写法：情绪表达' },
]

export const ANTONYMS = [
  ...oppositePairs(['big', 'large'], ['small']),
  ...oppositePairs(['hot', 'fire'], ['cold', 'snow'], 2),
  ...oppositePairs(['fast', 'quick'], ['slow', 'walk'], 2),
  ...oppositePairs(['happy', 'glad', 'laugh', 'smile'], ['sad', 'cry'], 1),
  ...oppositePairs(['strong', 'brave'], ['weak', 'afraid'], 1),
  ...oppositePairs(['rich'], ['poor']),
  ...oppositePairs(['easy'], ['hard']),
  ...oppositePairs(['good', 'kind', 'help'], ['bad', 'cruel', 'harm'], 2),
  ...oppositePairs(['begin', 'start', 'open'], ['end', 'stop', 'close'], 1),
  ...oppositePairs(['love'], ['hate']),
  ...oppositePairs(['war', 'harm'], ['peace', 'help'], 2),
  ...oppositePairs(['life', 'live', 'alive'], ['death', 'die', 'dead'], 1),
  ...oppositePairs(['young', 'new'], ['old'], 1),
  ...oppositePairs(['true', 'right'], ['wrong'], 1),
  ...oppositePairs(['clean'], ['dirty']),
  ...oppositePairs(['light'], ['dark']),
  ...oppositePairs(['loud'], ['quiet']),
  ...oppositePairs(['high'], ['low']),
  ...oppositePairs(['long'], ['short']),
  ...oppositePairs(['near'], ['far']),
  ...oppositePairs(['early'], ['late']),
  ...oppositePairs(['kind', 'brave'], ['cruel', 'afraid'], 2),
  ...oppositePairs(['busy', 'work'], ['free', 'play'], 3),
  ...oppositePairs(['safe', 'well'], ['sick', 'harm'], 3),
  ...oppositePairs(['laugh', 'smile'], ['cry', 'sad'], 1),
  ...oppositePairs(['find', 'win'], ['lose', 'fail'], 2),
  ...oppositePairs(['give', 'sell'], ['take', 'buy'], 3),
  ...oppositePairs(['come'], ['go']),
  ...oppositePairs(['sit'], ['stand']),
  ...oppositePairs(['push'], ['pull']),
  { a: 'increase', b: 'reduce', grade: 1 },
  { a: 'destroy', b: 'make', grade: 2 },
  { a: 'accept', b: 'hate', grade: 3 },
  // 冲突样例：应被冲突检测捕获
  { a: 'big', b: 'large', grade: 3, note: '测试同一词对跨类型冲突' },
  // 冲突样例：应被冲突检测捕获
  { a: 'happy', b: 'glad', grade: 3, note: '测试同一词对跨类型冲突' },
  // 冲突样例：应被冲突检测捕获
  { a: 'open', b: 'start', grade: 3, note: '测试同一词对跨类型冲突' },
  // 冲突样例：应被冲突检测捕获
  { a: 'laugh', b: 'smile', grade: 3, note: '测试同一词对跨类型冲突' },
]

// 无词素词条扩充词的近义/反义（由 scripts/gen-mono-words.mjs 生成）
SYNONYMS.push(...MONO_SYNONYMS)
ANTONYMS.push(...MONO_ANTONYMS)

// 词表种子标注词条的近义/反义（由 scripts/gen-mono-seed.mjs 生成）
SYNONYMS.push(...MONO_SEED_SYNONYMS)
ANTONYMS.push(...MONO_SEED_ANTONYMS)

export default { synonyms: SYNONYMS, antonyms: ANTONYMS }
