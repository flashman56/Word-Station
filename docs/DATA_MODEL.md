# 词根词缀单词云 — 数据模型定义

本文件是数据源的唯一权威说明。改数据前先看这里，改完跑 `npm run validate`。

---

## 一、两个实体

```
词素 Morpheme（父节点：词根 / 前缀 / 后缀）
   └── 单词 Word（叶子节点，可挂在多个词素下 → 网状结构）
```

一个单词可以同时属于多个词群（`morphs` 数组），例如 `education` 既挂在 `r.duc`（引导）下，也挂在 `s.tion`（名词后缀）下。这是**特性，不是重复数据**。

---

## 二、Morpheme 词素

| 字段 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | string | ✅ | 全局唯一。约定：词根 `r.*`、前缀 `p.*`、后缀 `s.*` | `r.spect` |
| `type` | enum | ✅ | `root`（词根）/ `prefix`（前缀）/ `suffix`（后缀） | `root` |
| `form` | string | ✅ | 主词形，**不带连字符** | `spect` |
| `display` | string | 建议 | 展示用写法，含主要变体 | `spect / spec / spic` |
| `variants` | string[] | ✅ | 变体，检索时与主词形同等命中 | `["spec", "spic"]` |
| `gloss` | string | ✅ | 中文含义 | `看，观察` |
| `glossEn` | string | 建议 | 英文含义（便于用英文检索） | `to look, to see` |
| `origin` | enum | ✅ | `latin` / `greek` / `germanic` / `old_english` / `french` / `other` | `latin` |
| `note` | string | 可选 | 助记、辨析、易混点 | `与 ter-（恐吓）不同源` |

文件位置：`src/data/morphemes.js`

---

## 三、Word 单词

| 字段 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | string | ✅ | 全局唯一，约定 `w.` + 单词；**整库只允许定义一次** | `w.inspect` |
| `form` | string | ✅ | 词形 | `inspect` |
| `pos` | string | 建议 | 词性 | `v.` |
| `gloss` | string | ✅ | 中文释义 | `检查；视察` |
| `morphs` | string[] | ✅ | 所属词素 id 列表（≥1 个，可多个） | `["p.in", "r.spect"]` |
| `chain` | object[] | ✅ | **有序**构词拆解路径 | 见下 |
| `chain[].form` | string | ✅ | 该部件在单词里**实际出现**的形态 | `in-` / `spect` / `-ion` |
| `chain[].gloss` | string | ✅ | 该部件含义 | `向内` |
| `chain[].morph` | string \| null | ✅ | 指向已注册词素 id；**该部件尚未注册为词素时填 `null`** | `r.spect` |
| `freqRank` | int | ✅ | 词频序号，**越小越常见**，参考 COCA 20000 词表量级 | `2450` |
| `cefr` | enum | ✅ | `A1` `A2` `B1` `B2` `C1` `C2` | `B2` |

文件位置（按来源拆三个文件，便于分批扩充）：
- `src/data/words-latin.js` — 拉丁词根下的词
- `src/data/words-greek.js` — 希腊词根下的词
- `src/data/words-affix.js` — 前后缀下的词
- `src/data/index.js` — 合并入口（新建文件后要在这里 import）

---

## 四、派生字段（不写进数据，由 `src/lib/derive.js` 计算）

| 派生量 | 规则 |
|---|---|
| `freqBand.key` | `freqRank ≤ 1000` → `base`（基础）；`≤ 2500` → `high`（高频）；`≤ 6000` → `mid`（中频）；`≤ 12000` → `lowmid`（次低频）；其余 → `low`（低频） |
| `cefrScore` | A1=1, A2=2, B1=3, B2=4, C1=5, C2=6 |
| `autoKnown` | `freqRank ≤ 2500` → **视为你已掌握**，弱化展示 |
| `effectiveStatus` | 手动标注优先 → 否则回落到 `autoKnown ? "known" : "new"` |
| `isManual` | 该词是否被手动标注过（手动标注可覆盖自动判定） |

阈值常量在 `src/lib/derive.js` 顶部：

```js
export const AUTO_KNOWN_RANK = 2500   // 改这里即可调整"已掌握"判定线
```

**针对你 12000 词汇量的默认策略**：词频序号 ≤ 2500 的词默认灰显并计入"已掌握"，左侧栏默认勾选「隐藏自动判定的已知高频词」，默认最低难度 `B1`。所以打开即看到的是**中频以上的 B1~C2 词**，而不是你已经会的那批基础词。

---

## 五、用户标注

- 存 localStorage：`wrc.status.v1` → `{ "w.inspect": "review", ... }`
- 过滤设置存：`wrc.settings.v1`
- 导出/导入 JSON 在左侧栏底部
- 三个状态：`known`（已掌握）/ `review`（待复习）/ `new`（生词）
- **再点一次同一个状态按钮 = 取消标注**，回到自动判定

---

## 六、扩充指南

### 新增一个词根，三步

**第 1 步** — 在 `src/data/morphemes.js` 末尾追加（注意注释分组）：

```js
{ id: 'r.manu', type: 'root', form: 'manu', display: 'manu / man', variants: ['man'],
  gloss: '手', glossEn: 'hand', origin: 'latin',
  note: 'manual（手工的）、manufacture（原义：手工制造）' },
```

**第 2 步** — 在 `src/data/words-latin.js` 追加示例词（每个词根建议 6~10 个，
其中至少 2 个 `freqRank ≤ 2500`，至少 3 个 B2 及以上）：

```js
{ id: 'w.manual', form: 'manual', pos: 'adj./n.', gloss: '手工的；手册',
  morphs: ['r.manu'],
  chain: [{ morph: 'r.manu', form: 'manu', gloss: '手' }, { morph: null, form: '-al', gloss: '形容词后缀' }],
  freqRank: 3200, cefr: 'B2' },

{ id: 'w.manufacture', form: 'manufacture', pos: 'v./n.', gloss: '制造，生产',
  morphs: ['r.manu', 'r.cap'],
  chain: [{ morph: 'r.manu', form: 'manu', gloss: '手' }, { morph: 'r.cap', form: 'fact', gloss: '做' }],
  freqRank: 5200, cefr: 'B2' },
```

**第 3 步** — `npm run validate`，确认 0 error。

### 常见坑

| 坑 | 后果 | 怎么避 |
|---|---|---|
| `chain[].morph` 填了不存在的 id | 校验报错、拆解链路断 | 该部件没注册成词素就填 `null` |
| 同一个单词在两个文件里各定义一次 | 统计重复、状态标注只对一份生效 | 定义一次，靠 `morphs` 挂多个词素 |
| `morphs` 为空数组 | 该词不在任何词群下，永远看不见 | 至少填一个 |
| `freqRank` 全填一样 | 字号/聚类密度失去意义 | 拉开梯度，基础词几百，高级词上万 |
| 新建了 `words-xxx.js` 却忘了在 `index.js` 里注册 | 数据静默丢失 | 改完 `index.js` 再 validate |
| `cefr` 写成 `b2` 小写 | 校验报错 | 必须大写 |

### 当前数据规模

```text
词素 50 个（词根 29 / 前缀 12 / 后缀 9；拉丁 35、希腊 10、古英语 3、日耳曼 1、法语 1）
单词 310 个
难度分布  A1 4 · A2 57 · B1 50 · B2 94 · C1 95 · C2 10
词频分档  基础 45 · 高频 65 · 中频 88 · 次低频 97 · 低频 15
```

### 关于 validate 的 warn

跑校验会出现约 17 条 warn，形如「词素 r.mort 下高频词仅 0 个」。这是**正常的**：
`mort`(死)、`chron`(时间)、`bio`(生命)、`anthrop`(人类)、`path`(情感) 这类词根本身只出现在中高级词汇里，
天然没有 A1/A2 级的高频词。warn 不阻断，只有 error 才会让校验失败。
