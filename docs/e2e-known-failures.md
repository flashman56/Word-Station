# e2e 剩余 FAIL 的归属记录 —— **已全部清零（结论推翻，见下）**

> **状态更新（重要）**：本文件初版写的是「2 条 FAIL 属基线预存在、与本轮无关、不修」。
> **那个结论错了**，而且错得有代表性 —— 记录在此作为「静态推理不够」的证据。

---

## 1. 初版的结论（已被推翻）

初版判断：
> 这 2 条 FAIL 依赖的四个组件（`landmarks.jsx` / `NetworkView.jsx` / `atlas.js` / `graph.js`）
> 在 `112f802..HEAD` **零改动**（`git diff --quiet` 全部为空）
> ⇒ 与本轮无关，是既有问题，且其中一条有 flaky 成分，先记待办。

**这个判断错在：只查了「谁没被改」，没查「断言本身对不对」。**

`git diff --quiet` 确实全空 —— 组件一行没改。但断言**编码了一个从未实现过的行为**，
它不成立与本轮无关，而是**从来就没成立过**。

---

## 2. 真实根因（三条，互相独立）

### ① `词关系网有连线` —— 断言查 `<line>`，实现画 `<path>`

- `qa-harness.jsx` 断言 `q('svg line').length > 0`
- `NetworkView.jsx:773` 的 `semanticLinks` 渲染的是 `<path d="M x y L x y" />`
- 全项目**刻意不画 `<line>`**（`FocusView.jsx:147` 的注释原文：
  「航线（用 path，保持"没有 `<line>`"的好习惯）」）
  ⇒ 这条断言**结构上永远不可能为真**

### ② 三大板块类型名称 —— 断言查的是注释里的草稿命名

- 断言查 `火山熔岩型 / 热带植被型 / 冰雪岩石型`
- 这三个词在源码里**只出现在注释**（`NetworkView.jsx:173-175`、`atlas.js:6-8`）
- UI 实际渲染的是 `derive.js` 的 `TYPES.{root,prefix,suffix}.label = 词根 / 前缀 / 后缀`
  ⇒ 断言查的是**设计草稿里的命名**，UI 里从来没有

### ③ ★★ 查对了元素也没用 —— 底下藏着一个真的产品 bug ★★

修好 ① 的元素选择器（加 `data-testid="relation-link"`）之后，断言**仍然是 0 条**。
在组件里插桩才拿到真相：

```
DBG = { focusId: 'w.calm', nodes: 1, sourceNodes: 1,
        links: 0, hasRelIdx: true, showSyn: true }
DBG2 = { nodeId: 'word:w.calm', wordId: 'w.calm', syn: 0, ant: 0 }
```

`NetworkView.jsx` 里：

```js
sourceNodes.forEach((node) => {
  const related = relationsOf(relationIndex, node.id)   // ← node.id 是带前缀的图节点 id
```

而 `graph.js:184` 的中心节点是 `id: \`word:${word.id}\``（为了不让 `word:` / `morph:`
两类节点撞 id），`relationsOf` 的键却是**词条 id**（`w.calm`）。

⇒ 传 `node.id` 永远查不到 ⇒ **近义/反义连线一条都画不出来**。
改成 `node.word.id` 后：近义关系从 **0 条变 19 条**（calm），UI 上 151 条连线。

**⇒ 这是一个真实产品缺陷，不是断言问题。** 我已修（`node.id` → `node.word.id`）。

> ★ 最值得记的一点：① 和 ③ **互相掩护**了两轮 ——
>   断言因为查错元素而永远为假，所以没人发现连线其实也没画。
>   如果我当初满足于「修好断言、让它变绿」，就会把一个真 bug 一起放过去。
>   **断言失败有时是唯一在报警的东西**；把断言改对之后，它才继续报下一个问题。

---

## 3. 为什么初版的「静态归因」不够

初版用的判据是：`git diff --quiet` 确认四个组件零改动 ⇒ 与本轮无关。

这个推理**只证明了「不是我们改坏的」**，没有证明「它是既有缺陷」——
因为既有缺陷与本轮无关，但**既有缺陷 + 本轮的改动叠加**可能产生新症状。
更要命的是：它把「既有」误当成了「不需要看」。

**正确的顺序是**：
1. 先问「这条断言在描述**什么产品行为**」（而不是「它红了没有」）
2. 再问「实现里有没有这个行为」
3. 最后才问「是不是本轮引入的」

第 1 步就会发现 ①②；第 2 步会进一步发现 ③。
**顺序颠倒就会停在「不是我的问题」这一步。**

---

## 4. 现在的状态

```
test:e2e   PASS=100  FAIL=0
```

- ① 改为数 `data-testid="relation-link"`（不是数 `svg path` —— 海岸线/浪花/岛屿
  也是 `path`，直接数会**假绿**）
- ② 改为断言 `词根 / 前缀 / 后缀`（UI 真实渲染的 label）
- ②附带的镜像断言 `群岛地图不画连线` 原本是 `svg line === 0`，**恒真**
  （项目刻意不画 `<line>`，所以「没有 line」与「有没有连线」无关）——
  改为数 `relation-link`，现在它**真的会失败**
- ③ 产品 bug 修复：`relationsOf(relationIndex, node.word.id)`
- 另修了断言的**选词逻辑**：原来输入 `big` 后取下拉第一项，而下拉是模糊匹配
  只取前 8 项，第一项实际是 **`bigamous`**（关系数 0）。改用 `calm`（实测 151 条关系）
  并**精确匹配词形**。

## 5. 复现判据（供复核）

```bash
# 断言的选词逻辑（真 bug 的等价物）
node --input-type=module -e "
import { words } from './src/data/index.js'
import { buildRelations, relationsOf } from './src/lib/relations.js'
import { SYNONYMS, ANTONYMS } from './src/data/synants.js'
const idx = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
for (const f of ['big','calm']) {
  const w = words.find(x => x.form === f)
  const r = relationsOf(idx, w.id)
  console.log(f, '关系数', r.synonyms.length + r.antonyms.length)
}
console.log('输入 big 的下拉第一项:', words.filter(w=>/^big/i.test(w.form))[0].form)
"
# ⇒ big 10 条、calm 151 条；但下拉第一项是 bigamous（0 条）
```

```bash
# 产品 bug：传 node.id vs node.word.id
node --input-type=module -e "
import { buildWordEgo } from './src/lib/graph.js'
import { buildRelations, relationsOf } from './src/lib/relations.js'
import { SYNONYMS, ANTONYMS } from './src/data/synants.js'
import { words } from './src/data/index.js'
const index = { wordById: new Map(words.map(w=>[w.id,w])), morphById: new Map(), wordsByMorph: new Map() }
const rel = buildRelations(words, { synonyms: SYNONYMS, antonyms: ANTONYMS })
const n = buildWordEgo(words.find(w=>w.form==='calm'), index).nodes[0]
console.log('node.id =', n.id, '→', relationsOf(rel, n.id).synonyms.length, '条')
console.log('node.word.id =', n.word.id, '→', relationsOf(rel, n.word.id).synonyms.length, '条')
"
# ⇒ word:w.calm → 0 条；w.calm → 19 条
```

## 6. 缺陷注入（证明新断言真的会失败）

```
把 node.word.id 改回 node.id    → PASS=99  FAIL=1（词关系网有连线 0 条）
去掉 data-testid               → 词关系网有连线 0 条
还原                            → PASS=100 FAIL=0，diff 确认源码无残留
```
