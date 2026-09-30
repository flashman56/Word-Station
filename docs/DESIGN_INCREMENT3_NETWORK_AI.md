# 增量3（网络掌握全景 + AI 扩词 + 交互精简）架构设计

> 文档状态：设计拆解（待实现）
> 上游依据：`docs/PRD_INCREMENT3_NETWORK_AI.md`、`docs/DESIGN_LEARNING.md`、`docs/DATA_MODEL.md`
> 代码现状基线：Vite + React 18.3 + Tailwind 3，纯 JSX，浅色主题，界面中文。
> 本文**只描述设计与接口，不含实现代码**。执行顺序遵循用户拍板：**3-A AI 扩词 → 3-B 网络图 → 3-C 总览查找 → 3-D 按钮改名**，每阶段完成并确认后再进下一阶段。

---

## 0. 已确认决策（用户拍板，强制遵循）

| 决策点 | 结论 |
|---|---|
| Q1 网络图渲染库 | `react-force-graph-2d`（canvas 渲染，支持点击高亮邻居、缩放聚焦） |
| Q2 语义数据 | AI 扩词时一并产出 `synonyms/antonyms/themes`；语义边仅在两端都在库内才绘制 |
| Q3 总览结构 | 网络图为主；原气泡 `OverviewView` 作为「网络 / 气泡」子切换保留（P2，R-13） |
| Q4 新词文件 | 新增 `src/data/words-extra.js`（约 1690 词），在 `data/index.js` 合并；**不并入**现有三文件 |
| Q5 MASTER_THRESHOLD | 保留 = 2，仅服务 `markKnown` 置 `consecutiveCorrect=2`；卡片不再用「答对累计」门控 |
| Q7 连线策略 | 默认只绘制「选中/悬停节点」的邻边，全量 morph 边懒绘制（R-15） |
| Q8 新词 freqRank | 从既有最大（约 18000）顺延，仅用于排序 |
| 执行顺序 | 3-A → 3-B → 3-C → 3-D |

---

## 1. 实现方案 + 框架选型

### 1.1 网络图依赖：`react-force-graph-2d`

- **选型结论**：采用 `react-force-graph-2d`（React 组件封装，底层 `force-graph` 走 HTML5 Canvas 2D 渲染）。
- **React 18 兼容**：项目为 `react@^18.3.1`，需锁定 `react-force-graph-2d@^1.25`（1.25+ 已适配 React 18 并发渲染；不要用 1.24 以下或需要 React 19 的版本）。
- **按需引入 / 控包体**：`react-force-graph-2d` 及其底层 `force-graph` 体积较大。**采用代码分割**：在 `App.jsx` 用 `React.lazy(() => import('./components/NetworkView.jsx'))` + `<Suspense>` 包裹；`ForceGraph2D` 的 import 仅出现在 `NetworkView.jsx` 内部。这样力导向库被拆成独立 chunk，仅当用户进入「总览 → 网络」时才按需加载，不影响首屏与「学习/列表」路径（满足性能与包体约束）。
- **底层依赖说明**：`react-force-graph-2d` 的传递依赖为 `force-graph`、`react-kapsule`、`prop-types` 等，**不依赖 `three`**（`three` 仅 3D 变体 `react-force-graph-3d` 需要，本次不引入）。
- **渲染关键能力（已验证该库支持）**：`nodeColor` / `linkColor` / `linkWidth` / `onNodeClick` / `onNodeHover` / `ref.centerAt(x,y)` / `ref.zoom(k)` / `ref.zoomToFit()`。用于「点节点高亮邻居+其余变暗」「搜索命中自动居中+缩放」。

### 1.2 零运行时 AI 成本红线（贯穿全局）

- AI 仅在开发期 `scripts/gen-words.mjs` 运行；产物 `src/data/words-extra.js` 是纯静态数据，**不**含任何密钥、**不**发起任何外部请求。
- `.env`（`DEEPSEEK_API_KEY`）**不进仓库**：当前项目**无 `.gitignore`**，本增量必须新增 `.gitignore`（含 `.env`、`node_modules`、`dist`）。
- 应用代码（src/）中**禁止** import 任何 AI SDK / `fetch` 外部域名；`scripts/` 下的生成脚本不时被 app 引用（不出现在 `data/index.js` 的导入链里）。

---

## 2. 文件列表及相对路径

### 3-A AI 扩词（前置，必须先完成）

| 文件 | 动作 | 说明 |
|---|---|---|
| `scripts/gen-words.mjs` | 新增 | DeepSeek 批量扩词脚本（读词素清单 → 调 API → 解析 → 校验 morphs → 写 `words-extra.js`）。dev-only，不被 app import |
| `src/data/words-extra.js` | 新增（脚本生成） | 约 1690 词，导出 `export const wordsExtra = [...]`；字段对齐 PRD §3.1 |
| `src/data/index.js` | 修改 | 在 `WORD_FILES` 追加 `wordsExtra`，`words = WORD_FILES.flat()`（自动更新 `STATS_SCOPE`、统计、队列分母） |
| `scripts/validate-data.mjs` | 扩展 | 覆盖新字段校验（R-16）：pos/phoneticBr/example/cefr 必填，morphs 引用合法，synonyms/antonyms/themes 形状合法，跨文件 id 去重 |
| `scripts/qa-harness.jsx` | 同步 | 新增断言：全库去重 ≈ 2000、`npm run validate` 0 error、新词 morphs 全命中库存；回归既有 65 条 |
| `scripts/qa-react-e2e.mjs` | 不改（或仅确认） | 入口不变 |
| `.gitignore` | 新增 | `.env` / `node_modules` / `dist` |
| `package.json` | 修改 | 新增 `gen:words` 脚本（可选）；`npm i react-force-graph-2d` 会写入 dependencies |

### 3-B 网络图（核心）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/lib/graph.js` | 新增 | 图数据构建：`buildGraph` / `neighborsOf` / `formToId` / 语义边解析 |
| `src/components/NetworkView.jsx` | 新增 | 力导向画布、点节点高亮邻居+其余变暗、顶部掌握统计、图层开关、退化模式 |
| `src/components/WordDetail.jsx` | 新增 | 从 `App.jsx` 抽出 `WordDetail`（含语义关系区 synonyms/antonyms/themes），供 NetworkView 与 App 复用 |
| `src/App.jsx` | 修改 | 懒加载 `NetworkView`；总览「网络/气泡」子切换；接线搜索框 + 图层开关 + 选中态 → WordDetail |
| `src/hooks/useLearn.js` | 修改 | 新增 `statusOf(wordId)` 派生（图所需） |
| `src/lib/derive.js` | 确认/微调 | 确认 `STATS_SCOPE` 已动态（见 §6）；可选新增 `graphStatusMap` 工具 |
| `src/components/OverviewView.jsx` | 保留 | 作为「气泡」子视图，行为不变（R-13） |

### 3-C 总览查找

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/components/NetworkView.jsx` | 扩展 | 顶部搜索框：按 `form`/词根`gosphs`/`gloss` 实时过滤并 `centerAt`+`zoom` 聚焦命中节点 |
| `src/lib/graph.js` | 复用 | 复用 `derive.search` 的匹配逻辑（或图内 `searchGraph`） |

### 3-D 按钮改名

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/components/StudyCard.jsx` | 修改 | 三按钮 → 「不记得 / 记得」两按钮（见 §3.4 + §4） |
| `src/components/StudySession.jsx` | 不改/微调 | 复用 StudyCard，`mode` 文案同步（R-14 复习卡同款两按钮） |
| `src/App.jsx` | 微调 | 详情面板「我会了」按钮文案可对齐为「记得」（一致性，P2，不阻塞） |
| `scripts/qa-harness.jsx` | 同步 | 确认 StudyCard 文案变更不破坏既有断言（批量条「我会了」在 `BulkActionBar`，独立组件，不受影响） |

---

## 3. 数据结构和接口

### 3.1 新词记录 schema（对齐 PRD §3.1）

`words-extra.js` 中每个元素（与现有 310 词同基结构，**新增语义字段**）：

```js
{
  id: 'w.portray',            // 'w.' + 单词，全库唯一（含 310 词），脚本去重校验
  form: 'portray',            // 词形
  pos: 'v.',                  // 词性，沿用现有写法
  gloss: '描绘；表现',          // 中文释义
  morphs: ['r.port', 's.able'],// 词素 id 数组，只能引用 morphemes.js 既有 id（红线）
  chain: [                    // 建议：有序构词拆解（morph 可 null）
    { morph: 'r.port', form: 'port', gloss: '携带' },
    { morph: 's.able', form: '-able', gloss: '可…的' },
  ],
  phoneticBr: '/pɔːˈtreɪ/',    // DJ 英式，首尾斜杠
  example: { en: '...', zh: '...' }, // 双语例句，义项与 gloss 一致
  freqRank: 18001,            // 顺延自既有最大 ~18000；仅排序用
  cefr: 'C1',                 // 'C1' | 'C2'
  synonyms: ['depict', 'describe'], // 语义图层用，form 字符串数组
  antonyms: [],                  // 语义图层用
  themes: ['art', 'expression'], // 自由标签，主题聚合用
}
```

**不变量**：现有 310 词**不补**语义字段（默认 `synonyms/antonyms/themes` 为 `undefined`/空数组）；`v2` 学习记录结构 `wrc.learn.v2` 不变，新词无记录时按 `emptyRecord()` 计算、不为新词预写空记录。

### 3.2 图数据模型

`src/lib/graph.js`：

```js
/**
 * 由全量词表 + 学习记录构建图数据。
 * @returns {{
 *   nodes: Array<{ id, form, status, x?, y? }>,
 *   edges: Array<{ source, target, kind: 'morph'|'syn'|'ant'|'theme', label }>,
 *   neighborsOf: (id) => Array<{ id, sharedMorphs: string[] }>,
 *   formToId: Map<string, string>,
 * }}
 */
export function buildGraph(words, records) { /* ... */ }
```

- **nodes**：每个单词一个节点，`status = effectiveStatus(word, records)`（走 `derive.effectiveStatus`，配色用 `derive.STATUS`）。`x?/y?` 由力导向引擎填充（后续渲染时由库维护，构建期可不传）。
- **morph 边（kind:'morph'）**：两词 `morphs` 交集非空即连；`label` = 共享词素的 `gloss` 拼接（如 `"看"`）。每条 `(a,b)` 去重为一根边，附 `sharedMorphs`（词素 id 数组）供高亮与边标签。**默认不把全量边喂给画布**（见 R-15），由 `neighborsOf` 在点击/悬停时按需取邻边。
- **语义边（kind:'syn'|'ant'|'theme'）**：由 `synonyms/antonyms/themes` 生成；运行时用 `formToId` 把 `form` 解析为库内 `id`，**仅当两端都在库内才建边**。`themes` 为自由标签，语义图层开启时按主题着色/聚合（theme 边可视为「共享主题」的连线，绘制时按主题区分色）。语义边**默认不绘制**（R-11，图层开关默认关）。
- **neighborsOf(id)**：基于 `derive.buildIndex` 的 `wordsByMorph`，返回该节点全部邻居及共享词素——用于默认「只画选中节点邻边」的渲染热路径，**避免 O(n²) 预生成全量 clique 边**（满足 R-15 性能策略）。

> 性能说明：`buildGraph` 的 `edges` 字段为「完整模型」便于单测与「显示全量边」降级模式；但 `NetworkView` 默认渲染只取 `neighborsOf(selectedId)` 的结果（无选中时仅画节点，不画边）。这样 2000 节点下首屏只渲染节点 + 点击后增量边，流畅且视觉清晰。

### 3.3 `useLearn` 新增派生

`src/hooks/useLearn.js` 新增（复用 `derive.effectiveStatus` + 内部 `wordById`）：

```js
// 在 useLearn 内构建一次 wordById Map（memo）
const wordById = useMemo(() => new Map(list.map(w => [w.id, w])), [list])
const statusOf = useCallback(
  (wordId) => effectiveStatus(wordById.get(wordId), recordsRef.current),
  [wordById],
)
// return { ...现有, statusOf }
```

- 顶部「我会了多少」统计直接复用 `learn.stats`（`countByStatus` 已按合并后全量 `words` 去重统计 `unknown/review/known/total`），分母 = 动态 `STATS_SCOPE` ≈ 2000，随学习实时更新（R-07）。
- NetworkView 通过 `statusOf(id)` 给每个节点上三态色，状态变化后图立即重着色。

### 3.4 StudyCard 接口变更（3-D）

- 现有 props 不变（`word/mode/onAnswer/onMarkKnown/onNext/record`）。
- 内部由「不认识 / 认识 / 我会了」三按钮，改为「**不记得 / 记得**」两按钮：
  - 「不记得」 → `onAnswer('incorrect')` → `applyAnswer` 使 `status='review'`、`consecutiveCorrect=0`。
  - 「记得」 → `onMarkKnown()` → `markKnown`（`consecutiveCorrect=2`、`statusSource='manual-known'`、累计次数不变）。
  - 移除「认识（correct）」路径与「答对累计 2 次」门槛（R-08/R-09）。
- 作答后展开区文案：`buildFeedback` 改为「已掌握 ✓ / 已加入待复习」；仍显示「连续答对 x/2」「累计答对 N 次 / 累计答错 M 次」（不变量保留，R-09）。
- 复习卡（`StudySession mode='review'`）复用同一 `StudyCard`，天然获得同款两按钮（R-14）。

---

## 4. 程序调用流程（时序图）

### 4.1 3-A 生成脚本流程（`scripts/gen-words.mjs`）

```
开发者本地
  │
  ├─ 读取 src/data/morphemes.js → 得到全量词素清单（id/display/gloss/type）
  ├─ 读取 src/data/words-*.js（含既有 310 词）→ 算出现有最大 freqRank（≈18000）
  ├─ 读 .env（脚本内置极简 .env 解析，无第三方依赖）→ DEEPSEEK_API_KEY
  ├─ 组装 prompt：附完整词素清单 + 字段 schema（PRD §3.1）+ 批次规模
  ├─ fetch POST https://api.deepseek.com/v1/chat/completions  (OpenAI 兼容)
  │     body: { model, messages:[system+user], response_format:{type:'json_object'} }
  ├─ 解析 JSON → 词数组
  ├─ 校验循环（复用 validate-data.mjs 的校验纯逻辑或等价内联）：
  │     ├─ 每个词 morphs 是否全 ∈ 词素库存？否则报错拦截（红线，不入文件）
  │     ├─ id 唯一？（与 310 词 + 已生成批次去重）
  │     ├─ 必填字段 / 形状（pos/phoneticBr/example/cefr/syn/ant/theme）
  │     └─ 失败：打印错误并 exit 1（不写文件）
  ├─ 通过：分配 freqRank（既有 max + 1 顺延，或采用 AI 估值）
  └─ 写入 src/data/words-extra.js（export const wordsExtra = [...]）
        → 开发者手动跑 npm run validate 确认 0 error
        → 提交 words-extra.js（.env 不提交）
```

关键点：**生成脚本与校验脚本共用「morphs 必须命中库存」校验**，凡含未知 id 一律拦截，确保主连线不断链（工程约束 1）。

### 4.2 3-B 渲染流程（挂载 NetworkView → 构建图 → 渲染 → 交互）

```
App (view==='overview' 且子切换='网络')
  │  React.lazy 加载 NetworkView.jsx（仅此时加载 force-graph chunk）
  ▼
NetworkView 挂载
  │  入参：words(全量), records(learn.records), statusOf, stats(learn.stats)
  ├─ buildGraph(words, records) → { nodes, edges, neighborsOf, formToId }
  ├─ <ForceGraph2D data={{nodes, links:[]}}  // 默认 links 为空（R-15 只画节点）
  │     nodeColor = STATUS[statusOf(id)].color
  │     onNodeClick(id):
  │        selectedId = id
  │        links = neighborsOf(id).map(→ {source,target,kind,label})  // 仅邻边
  │        linkColor/linkWidth 按 kind 区分；非邻居节点降透明度（灰）
  │        setSelectedWord(word) → 右侧显示 <WordDetail/>（含语义关系区）
  │     onNodeHover(id): 同上（悬停也高亮邻边，R-07 交互细则）
  │     ref.zoomToFit() 首屏适配
  ├─ 顶部统计条：未知/待复习/已掌握 = stats.unknown/review/known，分母 stats.total
  └─ 图层开关：☑ 词根连线（默认开） ☐ 语义连线（默认关）
        语义开 → links 追加 neighborsOf 的语义边（syn/ant/theme，按 formToId 命中）
        退化模式（R-15）：「仅节点」开关 → 彻底不传 links
```

### 4.3 3-C 查找流程

```
NetworkView 顶部搜索框 onChange(q)
  │ 复用 derive.search(q, morphemes, words, morphById) 或 graph 内等价匹配
  │  匹配维度：form 包含 / morphs 命中（display/variants/gloss）/ gloss 包含
  ▼
  matchedIds = Set(命中节点 id)
  │  ├─ 命中节点高亮、其余淡化（或隐藏）
  │  ├─ 计算命中节点质心 → ref.centerAt(cx, cy) + ref.zoom(k) 自动聚焦
  │  └─ 无命中 → 显示「无匹配」
  清空 q → 恢复全图（links 回到 selectedId 的邻边或空）
```

---

## 5. 任务列表（有序、含依赖、按 3-A → 3-B → 3-C → 3-D 分组）

> 约定：验收点含「可运行命令」与「行为判据」。3-A 必须先完成（数据存在）再做 3-B。

### 3-A AI 扩词（P0，前置）

1. **A1 新增 `.gitignore`** — 负责文件：`.gitignore`；依赖：无；验收：含 `.env`、`node_modules`、`dist`；`git status` 不显示 `.env`。
2. **A2 安装 `react-force-graph-2d`** — 负责文件：`package.json`；依赖：无；验收：`npm ls react-force-graph-2d` 存在且版本 `^1.25`；`react` 仍 `^18.3.1`。
3. **A3 编写 `scripts/gen-words.mjs`** — 负责文件：`scripts/gen-words.mjs`；依赖：A1/A2；验收：本地可跑；从 `.env` 读 key；prompt 附完整词素清单；解析 JSON；对 morphs 含未知 id 一律 exit 1 拦截；输出 `src/data/words-extra.js`（`wordsExtra` 导出）。**零运行时成本**（脚本不在 src 导入链）。
4. **A4 合并 `words-extra.js` 进 `data/index.js`** — 负责文件：`src/data/index.js`；依赖：A3 产物；验收：`npm run validate` 通过；全库去重 ≈ 2000（`new Set(words.map(w=>w.id)).size`）；原 310 词回归不受影响。
5. **A5 扩展 `validate-data.mjs`（R-16）** — 负责文件：`scripts/validate-data.mjs`；依赖：A3；验收：对 `words-extra.js` 新字段（pos/phoneticBr/example/cefr 必填、morphs 引用合法、syn/ant/theme 形状合法）报错能拦截；跨文件 id 去重报错能拦截；`npm run validate` 0 error。
6. **A6 同步 `qa-harness.jsx`** — 负责文件：`scripts/qa-harness.jsx`；依赖：A4/A5；验收：`npm run test:e2e` 全绿（既有 65 条不回退）；新增断言全库去重 ≈ 2000、新词 morphs 全命中库存。

### 3-B 网络图（P0，依赖 3-A）

7. **B1 新增 `src/lib/graph.js`** — 负责：`buildGraph`/`neighborsOf`/`formToId`/语义边解析；依赖：A4；验收：单测/手验 `buildGraph` 对 310+新词产出 nodes 与 morph 边（共享 morphs 正确）；语义边仅两端在库内才生成；`neighborsOf` 返回正确邻居。
8. **B2 抽出 `src/components/WordDetail.jsx`** — 负责：从 `App.jsx` 抽出 `WordDetail`，新增语义关系区（synonyms/antonyms/themes）；`App.jsx` 改为 import；依赖：无；验收：App 详情行为不变；WordDetail 可独立复用；语义区在字段为空时隐藏。
9. **B3 `useLearn` 新增 `statusOf`** — 负责：`src/hooks/useLearn.js`；依赖：无；验收：`statusOf(id)` 等价于 `effectiveStatus`，状态变化即返回新值；`learn.stats` 分母随合并后全量变化。
10. **B4 新增 `NetworkView.jsx` + App 接线** — 负责：`src/components/NetworkView.jsx`、`src/App.jsx`；依赖：B1/B2/B3；验收：总览默认渲染网络图；点/悬停节点高亮邻居、其余变暗；节点三态配色与 `STATUS` 一致；右侧弹出 `WordDetail`；顶部「我会了多少」= 未知/待复习/已掌握，分母=动态总数，随学习实时更新；`ForceGraph2D` 经 `React.lazy` 懒加载。
11. **B5 语义图层开关（R-11/R-12）** — 负责：`NetworkView.jsx`；依赖：B4；验收：默认关；开启后叠加 syn(绿实线)/ant(红虚线)/theme(按主题着色)；关闭仅 morph 主连线；开关独立可组合。
12. **B6 气泡子视图保留（R-13）** — 负责：`App.jsx` + `OverviewView.jsx`（保留）；依赖：B4；验收：「网络 / 气泡」子切换可用；气泡视图行为不变。
13. **B7 性能与退化（R-15）** — 负责：`NetworkView.jsx`；依赖：B4；验收：默认只画选中/悬停邻边；提供「仅节点」降级开关；首屏可交互、无明显卡顿。

### 3-C 总览查找（P1，依赖 3-B）

14. **C1 网络视图搜索框** — 负责：`NetworkView.jsx` + 复用 `derive.search`/`graph` 匹配；依赖：B4；验收：输入即过滤（form/词根/释义）；命中节点高亮并 `centerAt`+`zoom` 聚焦；清空恢复全图；与图层开关、三态配色正交。

### 3-D 按钮改名（P0，独立，可与 3-B 并行但建议放后）

15. **D1 `StudyCard` 改两按钮** — 负责：`src/components/StudyCard.jsx`；依赖：无（概念依赖 Q5 已定）；验收：仅「不记得/记得」两按钮；「记得」→`markKnown`（一次直达 known，consecutiveCorrect=2）；「不记得」→`applyAnswer('incorrect')`→review；移除「答对累计 2 次」门槛；详情「累计答对/答错」不变量保留。
16. **D2 复习卡同步（R-14，P2）** — 负责：`StudySession.jsx`/`StudyCard.jsx`；依赖：D1；验收：复习会话同款两按钮；既有 E2E 不回退。
17. **D3 详情面板文案对齐（P2，可选）** — 负责：`App.jsx` WordDetail「我会了」→「记得」；依赖：D1；验收：一致性，不破坏 E2E。
18. **D4 E2E 同步** — 负责：`scripts/qa-harness.jsx`；依赖：D1；验收：`npm run test:e2e` 全绿（批量条「我会了」在 `BulkActionBar`，不受 StudyCard 变更影响）。

---

## 6. 依赖包列表

| 包 | 类型 | 版本 | 说明 |
|---|---|---|---|
| `react-force-graph-2d` | 运行时依赖（新增） | `^1.25` | 网络图 React 组件；底层 `force-graph`（Canvas 2D） |
| `force-graph` | 传递依赖（自动） | — | `react-force-graph-2d` 依赖，无需手动安装 |
| `react-kapsule` / `prop-types` | 传递依赖（自动） | — | 同上 |
| `three` | **不需要** | — | 仅 3D 变体需要，本次不引入 |
| `react` / `react-dom` | 已有 | `^18.3.1` | 保持，兼容 |
| `dotenv` | **不引入**（可选） | — | 生成脚本用内置极简 `.env` 解析，零新依赖 |

安装命令：`npm i react-force-graph-2d@^1.25`（其余为传递依赖，自动安装）。

---

## 7. 共享知识（跨文件约定）

1. **动态 `STATS_SCOPE` 取法**：`derive.js:56` 已为 `export const STATS_SCOPE = new Set(ALL_WORDS.map(w=>w.id)).size`，**已是动态派生、无硬编码 310**。本增量只需在 `data/index.js` 把 `words-extra` 合并进 `words`，分母即自动变 ≈ 2000；进度条 / 三态统计 / 学习复习队列分母全部跟随（无需改 `derive.js` 计算逻辑，仅确认不被硬编码覆盖）。
2. **morphs 命中词素库存校验约定**：所有词的 `morphs` 必须 ⊆ `morphemes.js` 的 id 集合。生成期（`gen-words.mjs`）与校验期（`validate-data.mjs`）共用同一判据，凡含未知 id 一律拦截，确保主连线不断链（工程约束 1）。
3. **运行时零 AI 成本红线**：app 代码（src/）禁止 import AI SDK / `fetch` 外部域名；密钥仅存在于 `.env`（已 gitignore）；`scripts/` 不被 app 导入链引用（工程约束 3）。
4. **三态配色统一走 `STATUS`**：节点色、详情徽标、列表/卡片状态色一律 `import { STATUS } from '../lib/derive.js'`，组件不得硬编码 `#c9484b/#c98a17/#9aa1ac`（PRD 配色口径）。
5. **语义边绘制前提**：`synonyms/antonyms/themes` 以 `form` 存储；绘制前必须经 `formToId` 解析，仅当两端 id 都在库内才建边；语义图层默认关（R-11）。
6. **v2 学习记录结构不变**：`wrc.learn.v2` 结构、不预写空记录、新词按 `emptyRecord()` 计算等既有不变量全程保留（工程约束 4 / PRD §3.4）。
7. **新词 id 唯一性**：`'w.' + 单词` 全库唯一（含 310 词）；`validate-data.mjs` 的 `wordIds` 集合跨合并后全量校验去重。

---

## 8. 待明确事项（需用户拍板）

| # | 待明确点 | 推荐默认值 | 理由 |
|---|---|---|---|
| U1 | 网络图是否受左侧 `status/cefr/origin` 筛选影响？ | **默认全库**（筛选仅作用于「气泡」子视图 R-13）；网络图用顶部搜索框过滤（3-C） | 网络图定位为「全库关系全景」，叠加侧栏筛选会让图随筛选大幅变样，与「看我掌握哪一片」诉求冲突 |
| U2 | morph 边 label 显示策略（2000 节点下边较多） | 默认**不显示静态边标签**，仅在悬停/选中某节点时于详情或 tooltip 显示其共享词素 | 全量边标签会糊成一片；按需显示更清晰（R-04 要求「边标签显示共享词素 gloss」，可折中为选中时显示） |
| U3 | 生成脚本的分批策略 | 单批 ~1690 词一次生成；若 API 超时则按词根分批（每批一个/多个词根） | 控制单次 token；批次间 id 去重由脚本保证 |
| U4 | 是否给 `package.json` 加 `gen:words` 便捷脚本 | 建议加 `"gen:words": "node scripts/gen-words.mjs"` | 开发者易用，不改行为 |
| U5 | D3 详情面板「我会了」是否一并改名「记得」 | 建议改（一致性） | 但属 P2，不阻塞 3-D 主路径 |
| U6 | 语义边 `theme` 的视觉表达 | 按主题聚色 + 同主题词连线（弱色）；或仅做主题着色不连线 | 连线在主题词多时也会成 clique，需降级；建议「按主题着色 + 可选连线」 |

> 以上 U1~U6 均不阻塞 3-A 启动；U1/U2 建议在进入 3-B 前确认。

---

## 9. 验收总览（与 PRD §8 对齐）

- **3-A**：`npm run validate` 0 error；`npm run test:e2e` 65/0 不回退；全库去重 ≈ 2000；`.env` 不提交；build 产物无密钥、无外部请求。
- **3-B**：总览默认网络图；点/悬停节点高亮邻居、其余变暗；三态配色一致；顶部统计实时更新；语义图层开关可切换且默认关。
- **3-C**：搜索框按 word/词根/释义实时过滤并聚焦命中节点；清空恢复全图。
- **3-D**：StudyCard 仅「不记得/记得」两按钮；「记得」一次→known，「不记得」→review；详情累计不变量保留；既有 E2E 不回退。
