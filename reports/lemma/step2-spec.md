# Step-2 施工规格：屈折归并（lemma folding）接入学习链路

> 状态：Step-1 已验收（QA ACCEPT，270/270；产物 auto-fold 9,888 / keep 330 / audit 2,965）。
> 本规格由主理人汇总代码勘察（queue-mapper）后编写；工程师照此实施，QA 照此验收。

## 0. 已锁定口径（用户确认）

1. 排序/卡面按族内最高频形式定位（rank=min）。
2. 同族 ≥2 个高频成员 → 一起保留、不折叠（Step-1 已落为 `bucket=keep`，阈值 2500）。
3. 折叠只作用于学习/复习队列与统计；词条保留在词库（可查/可浏览）。
4. 旧记录合并取最优（best-state wins）。
5. 分母 = 折叠后的学习单元数（64,699 − 9,888 = 54,811 量级，以补丁实际条数为准）。
6. （后续 UI 阶段，不属本单）学习卡 + 例句区呈现常见变形与派生词。

## 1. 交付物

| 文件 | 动作 | 说明 |
|---|---|---|
| `scripts/gen-lemma-patch.mjs` | 新增 | 从 Step-1 产物生成折叠补丁（确定性） |
| `src/data/words-lemma.js` | 新增（生成物） | 折叠映射 `{ 'w.honored': 'w.honor', ... }`，紧凑、按键排序 |
| `src/data/index.js` | 修改 | 合并补丁：命中词条附 `.lemma` 字段（与 words-entry 逐字同款契约） |
| `src/data/words-entry.js` | 修改 | 同上（两处必须一致——既有明写契约） |
| `src/lib/lemmaFold.js` | 新增 | 读时折叠视图；仅两个导出：`isFolded(w)`、`buildFoldView(words, records)` |
| `src/hooks/useLearn.js` | 修改 | 派生段接入折叠视图（见 §3） |
| `src/components/StationLearn.jsx` | 修改 | 同口径接入（否则站内与学习页打架） |
| `src/App.jsx` | 修改 | bandCounts 折叠（其注释本就要求"与 learnPool 同一个过滤条件"） |
| `src/lib/derive.js` | 修改（仅注释） | STATS_SCOPE 语义注释（见 §4） |
| `scripts/test-lemma-fold.mjs` | 新增 | 契约测试（见 §5），接入 test:cloud 链 |
| `scripts/test-private.mjs` | 同步 | 其 statWords/learnPool 复刻逻辑与断言随折叠更新（逐条判定理由，不许"改断言盖 bug"） |
| `package.json` | 修改 | 新增 `test:lemma-fold` 并追加进 `test:cloud` |

## 2. 补丁生成规则（gen-lemma-patch.mjs）

输入：`scripts/.lemma-map.draft.json` + `scripts/.lemma-pairs.json`（fId/lId 提供词条 id；draft 无 id）。
只取 `bucket==='auto-fold'`。按下列规则产出 `form id → 代表 id`：

1. 逐行按 (form,lemma,type) join 两文件解析出 fId/lId；join 失败即报错停机（不许静默跳过）。
2. **同一 form 有多行**时，仅当（a）全部行 `bucket==='auto-fold'` 且（b）**解析后**代表 id 唯一，才允许折叠；否则整词不折叠，计入「例外清单」。
3. **链式解析 resolveRep**：若目标 lemma 自身也被折叠，沿链继续；止于第一个"仍存在"的词条（即不在补丁中的词条）；最大 4 跳；成环则整词不折叠并报错。报告链式解析条数。
4. 自环、目标缺失、目标未折叠但不存在于词库 → 例外清单（各带原因）。
5. 输出 `src/data/words-lemma.js`：格式对齐 `src/data/words-remorph.js` 的既有风格（导出名/注释风格/被合并方式），条目按 id 排序、紧凑。
6. 生成脚本打印统计：条数 / 例外明细 / 文件体积。连跑两次 MD5 一致。

## 3. 运行时折叠视图（lemmaFold.js + 接入）

`buildFoldView(words, records)` 返回 `{ units, records }`：

- `units` = `words.filter(w => !isFolded(w))`（保持原顺序）。
- `records` = **读时合并视图**（不落盘、不改原对象）：对每个 unit u，候选 = u 自身记录 ∪ 所有子形记录（`w.lemma === u.id`）；按 `known > review > unknown` 取胜者；同级取 consecutiveCorrect 大者、再取 lastStudiedAt 新者；结果**原样取胜者**（胜者自身的 known 不变量天然成立，无需字段拼接）。家族无任何记录则不在视图中出现（`getRecord` 自然回落空记录）。
- 防御：运行时对 `w.lemma` 也做 ≤4 跳链式解析（补丁已解析，此处仅防御）。

接入点（两处同口径）：

- `src/hooks/useLearn.js` 派生段（:509-578 一带）：
  - `statWords` = foldUnits ∪ privateList（私有词不折叠）
  - `stats` = `countByStatus(statWords, foldRecords)` + `countScheduled(statWords, foldRecords)`
  - `learnPool` = `bandFilter(foldUnits, band)`
  - `learnQueue` = `buildLearnQueue(learnPool, foldRecords, …)`
  - `reviewQueue` = `buildReviewQueue(statWords, foldRecords, …)`
  - **迁移（runMigration，用未过滤 `list`）与所有存储/云同步路径保持原样**；`commit()` 继续写原始记录（学习的单元就是代表词，写代表词 id）。
  - ⚠ `learn.statWords` / `learn.records` 对外语义保持**未折叠**（App.jsx:295 用它做词汇量估算输入——vocab.js 冻结域，输入不动；见 §6）；hook 内其他消费点逐一判定。
- `src/components/StationLearn.jsx`（:146-190）：同口径（baseList→foldUnits、recs→foldRecords；bandCounts/learnPool/queues 全走折叠）。站内若含被折词、代表词不在站内：仍折叠移除（统一口径，记录为观察项）。
- `src/App.jsx:298-322` bandCounts：跳过 `isFolded(w)` 的词（引入单一判据）。不折叠会让"计数与真实队列对不上"——该处注释已明写此纪律。

## 4. 分母与注释

- 学习页分母实际取 `stats.total`（动态）→ 折叠后自动进入 54,811 量级。
- `STATS_SCOPE=64699` 常量**不动**（保持"词库总量"语义 + 空态兜底）；`test-learning.mjs:762-766` 断言**不动**。
- 更新 `src/lib/derive.js:55` 注释（"三态之和恒等于它"已不准确）与 `LearnHome.jsx:58` 附近注释：分母=折叠后单元数（stats.total），常量仅空态兜底。

## 5. 测试与门禁

- 新增 `scripts/test-lemma-fold.mjs`：
  - 合成用例：合并优先级（known>review>unknown）、同级 tie-break、known 不变量、空家族、防御链式；
  - 真实数据契约：① words 中 `.lemma` 词数 === 补丁条数；② 每个 `.lemma` 目标存在且**未折叠**；③ **全量对账**：从 draft+pairs 独立推导 id 级映射，与 words 的实际 `.lemma` 值完全相等（含例外清单核销）；④ keep/audit 词形零折叠；⑤ 64,699、折叠数、单元数自洽。
  - 契约守卫：关键查找缺失必须 FAIL 并中止（不许静默跳过）；报告"跑了 N / 过 M / 挂 K"。
- 同步 `scripts/test-private.mjs` 复刻逻辑；被改断言逐条写明理由。
- 全量回归：`npm run validate`、`test:learning`、`test:vocab`、`test:graph`、`test:cloud`（含新套件）、`test:e2e`、`npm run build`。任何与折叠相关的既有断言改动都必须写明"为什么它该变"（QA 会复核，不许盖 bug）。
- 红线：`src/lib/learning.js`、`src/lib/vocab.js`、`src/cloud/learnSync.js`、`src/cloud/syncLock.js`、`src/cloud/schema.js` 零 diff；`git diff c35db79 HEAD -- src/lib/learning.js` 为空；新模块不得含 `wrc.` 存储键字面量（check-storage-keys 门禁）。

## 6. 明确排除 / 已知偏差

- 词汇量估算输入保持未折叠（vocab.js 冻结域）——样本口径与三态统计可能有细微差异，记录为已知项。
- UI 阶段（学习卡/例句呈现变形与派生词）不在本单。
- 部署/推送不在本单（另行择机）。

## 7. 报告要求（工程师）

改动文件 + 行数；补丁统计（条数/例外清单及原因/链式条数/体积）；自检清单逐条；测试结果（含被改断言的逐条理由）；IS_PASS。**先不 commit**，等 QA 验收通过后统一提交。
