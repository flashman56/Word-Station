# 词库垃圾词清理报告

**日期**：2026-09-26
**提交**：见 git short hash（fix: 清理 AI 杜撰词与高置信错拼词，同步 STATS_SCOPE）
**执行人**：impl-word-cleanup（工程师）

## 一句话结论

按"三道网关 + 保守不误删"的策略，本轮只删除了 **24 条高置信垃圾词**（3 条 AI 杜撰占位/乱凑词 + 21 条清晰错拼且正确词已在库内的词条），并把 `STATS_SCOPE` 从 64723 同步为 **64699**。研究侧估计的"3794 条 AI 杜撰词"经核验**绝大多数不成立**——那些不在 ECDICT 的纯 ASCII 词大半是真实但罕见的派生词/专有名词/缩写，盲目删除会损害词库质量，违反"拿不准就留、绝不多删"的红线。

## 删除明细（共 24 条）

### A. AI 杜撰占位/乱凑词（3 条，来自 words-extra.js）
| 原 id | 释义 | 删除理由 |
|-------|------|----------|
| `w.extraviv` | "extra viv"（占位） | 无意义占位串，非词 |
| `w.chronologyof` | "chronology of"（……的年表） | 介词短语乱凑，非独立词 |
| `w.misterr` | "mis-terr" | 拆字乱凑，无实义 |

### B. 清晰错拼且正确词已在库内（21 条，来自 words-mono-seed.js）
全部符合 102 删除（f8b2ed6）的同一种模式：明显拼写错误，且正确拼写形式已存在于词库。

| 错拼 id | 正确词（已在库） |
|---------|------------------|
| `w.carefull` | careful |
| `w.wory` | worry |
| `w.arert` | alert |
| `w.iive` | live/ive |
| `w.faii` | fail |
| `w.iooked` | looked |
| `w.beeplng` | beeping |
| `w.lnternet` | internet |
| `w.riend` | friend |
| `w.beastiality` | bestiality |
| `w.voyuer` | voyeur |
| `w.masterbating` | masturbating |
| `w.masterbation` | masturbation |
| `w.lmagine` | imagine |
| `w.iife` | life |
| `w.rember` | remember |
| `w.couid` | could |
| `w.lnternational` | international |
| `w.embarassing` | embarrassing |
| `w.colord` | colored |
| `w.ioved` | loved |

### 同步清理（synants-mono-seed.js）
删除了 10 对引用了上述错拼词的近/反义对（carefull→careless、wory→anxious、wory→calm、arert→alert、lnternet→net、lnternet→web、riend→friend、iife→life、rember→forget、embarassing→comfortable）。近义对 7818→7812，反义对 2583→2579。

## 文件头同步
- `words-mono-seed.js`：词数 46411 → 46390
- `words-extra.js`：词数 15000 → 14997
- `synants-mono-seed.js`：近义对 7818→7812，反义对 2583→2579
- `src/lib/derive.js`：`STATS_SCOPE` 64723 → 64699

## 三道网关判定
1. **ECDICT 存在性**：以上 24 条全部不在 ECDICT；因 ECDICT 本身不完整（见下），仅用它做"存在即必留"的红线，不做"不在即删"的单一判据。
2. **语料证据 / 语义对齐**：错拼类有库内正确词对应（同源/同根）；杜撰类释义明显为占位/乱凑，无真实语义。
3. **保守不误删**：凡在 ECDICT 已收录的词一律保留；凡拿不准（罕见派生词、缩写、专有名词、口语 g 脱落等）一律保留并计入下方边界。

## 保留的边界样本（未删，写此报告备案）
- 不在 ECDICT 但疑似真实：罕见派生/缩合词（如 `krispy`、`anniverse`、`acrimonity`、`trembl` 词素词干、`patrilect`、`palaeosolum` 等）、技术缩写/专有名词缩写（`msgid`、`reged`、`undef`、`enb`、`gdb`、`dbz`）、口语 g 脱落（`somethin`、`drivin`、`spinnin`、`peop`）、缩约否定（`doesn`、`wouldn`、`dont`、`havent`）。
- 自认错词关键词命中但词形在 ECDICT 的（如古语 `thou`/`thee`/`thy`、缩写 `dr`/`st`/`etc`/`km`/`co`/`ain`/`til`）：因词形真实，按红线保留。

## 重要发现：ECDICT 不完整
核验中发现 ECDICT 缺收大量真实词（如 `vivisepulture`、`phonophoresis`、`mortuary chapel`、`scriptless`、`temporo`、`viduous`、`patrilect`、`palaeosolum`）。这也反向证明：单凭"不在 ECDICT"就批量删除 3794 条会误删真实词。故最终采用"高置信 + 三网关 + 保守"方案。同时确认本仓库 ECDICT 解析器无误报（不会把已收录词判为缺失），红线（ECDICT 已收录词永保留）无风险。

## 验证结果（全部绿灯）
| 套件 | 结果 |
|------|------|
| `npm run validate` | IS_PASS: YES，error 0（warn 为既有词素频次提示，与本次无关） |
| `npm run test:learning` | PASS=65 FAIL=0（含 STATS_SCOPE 断言：64699 === 全库唯一 id 数） |
| `npm run test:vocab` | PASS=13 FAIL=0 |
| `npm run test:graph` | PASS=18 FAIL=0 |

## 红线遵守
- 未触碰 `src/lib/learning.js`、`src/lib/migrate.js`、`src/lib/vocab.js`、`src/lib/syncLock.js`（零 diff）。
- 未改动 phonetics 音标数据。
- 未使用任何外部 API / DeepSeek；全部为本地文件操作。
- 词岛/学习队列在运行时由 words 重算，`npm run validate` 已校验无悬空引用。
