# lemma 映射产物 · QA 对抗性验收报告（Step-1）

> 验收人：QA（Edward）｜仓库：`word-root-cloud`｜命令均在仓库根目录执行
> 验收对象：`scripts/gen-lemma-map.mjs` + `scripts/.lemma-map.draft.json` + `reports/lemma/{audit.csv,audit.md,report.md}`
> 验收脚本（已留存）：`scripts/qa-lemma-verify.mjs`、`scripts/qa-lemma-sample.mjs`、`scripts/qa-lemma-attack.mjs`

## 0. 结论

**REJECT（1×P0 + 1×P1）** —— 数据/计数/确定性与代码完全自洽，但 `src=AB` 的语义与报告声明不符（P0），且设计规则②「多高频成员不折叠」未落进数据（P1）。
断言统计：**跑了 146 条 / 过 146 条 / 挂 0 条**（另做自检注入反例，已证明脚本会红）。
> 若主理人裁定：① 将 `src=AB` 重新定义为「触达≥2 次」并接受其后果；② 明确规则②由 Step-2 重算——则本批可降为 **ACCEPT-WITH-RISKS**。

## 1. 断言统计

| 脚本 | 断言 | 结果 |
| --- | --- | --- |
| `qa-lemma-verify.mjs` | 115 | 115 过 / 0 挂（`ALL_PASS`） |
| `qa-lemma-sample.mjs` | 4（含全量回查） | 4 过 / 0 挂（`ALL_PASS`） |
| `qa-lemma-attack.mjs` | 27 | 27 过 / 0 挂（`ALL_PASS`） |
| **合计** | **146** | **146 / 0** |

自检：`QA_SELFTEST=1 node scripts/qa-lemma-verify.mjs` → 注入「auto-fold==-999999」反例 → **脚本变红**（跑了 116 / 挂 1）。已证明验收脚本能失败。

## 2. 六项逐项结果

### ① 硬案例落桶（全部 PASS，数据实测）

| 目标 | 实测（bucket / flags） | 判定 |
| --- | --- | --- |
| `shelves` 全部行 | `shelves→shelf [audit]{homograph}`；`shelves→shelve [audit]{form-more-frequent,homograph,suspect-target}` | PASS（均 audit，无 auto-fold） |
| `honored→honore` | `[audit]{lemma-proper,lemma-no-gloss,src-a-only,highfreq-before,homograph,suspect-target}` | PASS（含 lemma-proper，不在 auto-fold） |
| `saw` | `saw→see [audit]{homograph}`；sawing/saws/sawed→saw 均 `[audit]{homograph}` | PASS |
| `rose` | `rose→rise [audit]{highfreq-before,homograph}`；roses→rose 同 | PASS |
| `means` | `means→mean [audit]{highfreq-before,homograph}` | PASS |
| `better` | `better→good [audit]{highfreq-before,homograph}`；betters→better 同 | PASS |
| `lay` | `lay→lie [audit]{highfreq-before,homograph}`；laid/laying/lays→lay `[audit]{homograph}` | PASS |
| `left` | `left→leave [audit]{highfreq-before,homograph}` | PASS |
| `found` | `found→find [audit]{highfreq-before,homograph}`；founded/founding→found 同 | PASS |
| `bound` | `bound→bind [audit]{highfreq-before,homograph}`；bounds/bounded→bound 同 | PASS |
| `according` | `according→accord [audit]{highfreq-before}` | PASS |
| `amazing` | `amazing→amaze [audit]{src-b-only,highfreq-before}` | PASS |
| `advanced` | `advanced→advance [audit]{highfreq-before}` | PASS |
| `accused` | `accused→accuse [audit]{highfreq-before}` | PASS |
| `arms` | `arms→arm [audit]{highfreq-before}` | PASS |
| `aliens` | `aliens→alien [audit]{highfreq-before}` | PASS |
| `headphones→headphone` | `[audit]{form-more-frequent,suspect-target}` | PASS |
| `footsteps→footstep` | `[audit]{highfreq-before,suspect-target}` | PASS |

所有硬案例的 flags 与其代码规则一致（逐条已在脚本内用谓词复算）。

### ② 抽样复核（种子 `20260926`，可复现）——PASS
- **全量加强**：对**全部 10,315 条 auto-fold** 独立回查 `ecdict.csv` 原文，屈折关系成立 **10,315/10,315**。
- auto-fold 随机 30：**30/30 PASS**（无 flag、src=AB、fRank>lRank、lemma 在库且非 proper、字典关系成立）。
- audit 随机 30：**30/30 PASS**（每条 ≥1 flag 且理由成立）。
- 附带发现见 P0-1（175 条 src=AB 实为单向触达）。

### ③ 计数独立复算（不引用 report.md）——PASS

| 口径 | 复算值 | 声明值 |
| --- | --- | --- |
| 总行数 | 13183 | 13183 ✅ |
| auto-fold / audit | 10315 / 2868 | 10315 / 2868 ✅ |
| flags | form-more-frequent 1494 / highfreq-before 815 / src-b-only 241 / lemma-proper 233 / lemma-no-gloss 144 / homograph 116 / suspect-target 75 / src-a-only 53 / rank-tie 2 | 一致 ✅ |
| type | s5985/i2809/d1805/p1190/3=939/r169/t125/dp72/pd51/s3=33/3s=5（共 11 类，求和=13183） | report 标「Top16」实列 11 类（无缺失） |
| src | AB 12889 / A 53 / B 241 | 一致 ✅ |
| 唯一 form | 13138 | 13138 ✅ |
| 同族≥2高频族 | 916 | 916 ✅ |

- **13,183 − 13,138 = 45**：恰有 **45 个 form 各含 2 个 lemma 目标**（同形异义，如 `shelves→{shelf,shelve}`、`lives→{life,live}`），每个贡献 1 条额外行 → 45。
- draft 与 pairs 按 `(form,lemma,type)` 精确相等、双向无多余、无重复行；fRank/lRank 完全一致。
- `audit.csv` 2869 行（1 表头 + 2868）、14 列、fRank 升序、集合=draft audit 桶；`audit.md` 2868 个条目。
- JSON 结构：8 字段、类型正确、src/bucket 枚举合法、flags 为字符串数组且取值全在合法词表内 — **0 违规**。

### ④ 反向扫描 ——PASS（含 2 个关键结论）
- auto-fold `flags` 非空：**0**（P0 条件未触发）。
- auto-fold `src≠AB`：**0**；auto-fold `fRank<lRank`：**0**；自环 `form===lemma`：**0**；auto-fold lemma 缺库/proper：**0**。
- **G3>5000 结论**：全局倒挂 2309 条（≤5000 借 815 / >5000 借 1494）。**>5000 的倒挂没有被放行**——1494 条全部带 `form-more-frequent` 落 audit，**0 条 auto-fold**（且判定式另有 `fRank>lRank` 兜底）。放行风险 = 无。
- auto-fold 中 type 含 r/t：**256** 条。Top5 逐条判定：`bigger→big`、`faster→fast`、`biggest→big`、`greatest→great`、`easier→easy` —— 均为同词族比较级/最高级，**折叠语义正确**（PASS）。⚠ 但见 P1-1（这些高频成员按规则②本不应折叠）。
- 目标不在 64,699 词库内的行：**0**（配对阶段即要求 lemma 在库）。

### ⑤ 攻门测试 ——PASS
生成器**无任何 export**，故以「**独立复刻 judge() 谓词**」（明确声明：未直接调用生成器函数，以复刻谓词替代）做攻门：
- 复刻判定对**全部 13,183 行**复算 bucket **与** flags → 不一致 **0 / 0**（证明数据忠实反映代码逻辑）。
- 阈值边界构造：`fRank=5000`（含端点）→ highfreq-before+audit；`fRank=5001<lRank` → form-more-frequent+audit；`fRank==lRank` → rank-tie；G4 严格不等 `lRank=3×fRank` 不算、`+1` 且 `>15000` 才算；`src∈{A,B}` → audit；前向+AB+无 flag → auto-fold。全部按预期拦截。
- 9 类 flag 命中的行全部落 audit（非 audit=0）；auto-fold 无任何违规放行行。

### ⑥ 红线与洁净度 ——PASS
- `git status --porcelain src/ package.json`：**空**。
- `git diff c35db79 HEAD -- src/lib/learning.js`：**0 行**（自初始提交零改动）。
- 生成器仅写声明的 4 路径（`writeFileSync` L319/347/364/496 = draft/csv/md/report），**不碰 src/**。
- 确定性：先备份 4 产物 → 重跑生成器 → **4/4 MD5 逐字节一致** → 已删备份。
  - draft `b981c4ee…` / audit.csv `d97a10c9…` / audit.md `8b81643f…` / report.md `21ca30c0…`

## 3. 疑点清单（分级）

### P0-1 · `src=AB` 语义与声明不符 → G2 双源闸门被绕过
- **代码事实**：配对升级逻辑为 `else p.src = 'AB'`（gen-lemma-map.mjs L194/L196）。即「**同一 pair 第二次触达即置 AB**」，与方向无关。
  - A 方向对同一 key 只会触达一次；故 `src=AB` 实际 = **A∧B**（12,714 条）**或 B∧B**（同一词条用两个类型码列出该变形，如 `fee` 同时 `p:feed`/`d:feed`）。
- **声明**：report.md §1「双向都命中 → `src=AB`；单向 → `src=A`/`src=B`」。
- **实测**：`src=AB` 共 12,889，其中**真双向 12,714 / 伪AB（单向）175**；伪AB 中 **97 条落 auto-fold**、78 条落 audit。
  - 伪AB auto-fold 样本（均为**独立词条**形态，本应由 A 缺失→G2 拦下）：`tired→tire`、`colored→color`、`practiced→practice`、`winged→wing`、`seasoned→season`、`armored→armor` …
- **影响**：G2 宣称「仅双源印证可折叠」，实际放行 97 条单源行；报告自身的 src 计数（AB 12889）也与其方法描述（应为 12,714）不一致。
- **最小修复方向**（供工程师，勿由 QA 改）：
  1. 配对时对每个 pair 记录 `seenA`/`seenB` 布尔；`src = seenA && seenB ? 'AB' : seenA ? 'A' : 'B'`（同方向重复触达**不**升级）。
  2. 重跑后更新 report.md 的 src 分布与相关计数（预计 auto-fold 10315→10218，AB 12889→12714）。

### P1-1 · 设计规则②「同族≥2高频成员→都保留、不折叠」未落进数据
- **代码事实**：`judge()` 只有 G1–G4，**无规则②分支**；draft 无任何行级「保留/不折叠」信号；report.md §5 却称「按规则②这些成员都保留、不折叠」。
- **实测**：多高频族 916 个；其中 **845 条 auto-fold 行**属多高频族且自身 fRank≤5000（即按规则②应保留），代表样本：
  `had→have`、`been→be`、`has→have`、`being→be`、`wanted→want`、`wants→want`、`thanks→thank`、`minutes→minute`、`waiting→wait`、`killed→kill` …
- **影响与决策点**：若 Step-2 仅按 `bucket=auto-fold` 折叠，则这些高频词（含 be/have/want 等核心词）会被错误折叠 → 此时**升级为 P0**。请主理人明确：规则②由 **Step-1 落桶/打标** 还是 **Step-2 重算**（draft 已含 form/lemma/fRank/lRank，Step-2 可复算）。

### P2（观察，不阻塞）
- report.md「type 分布 Top16」实际仅 11 类（数据无缺失，仅标题措辞）。
- 交付口径「3 个产物」实为 4 个（draft + csv + md + report）。
- `x-rayed→x-ray`、`radioed→radio` 等连字符/派生词亦在 auto-fold，语义成立（PASS）。

## 4. 建议动作
1. **修 P0-1** 的 src 升级逻辑（约 2 行）→ 重跑 → 更新 report.md 计数 → 交 QA 复验（Round 2，仅回归受影响口径）。
2. **裁定 P1-1**：明确规则②归属；若归 Step-2，请在 report.md/Step-2 设计中写明「折叠前须按族重算并跳过 ≥2 高频成员的族」。
3. 上述两项确认后，其余 144 条断言已全绿，可直接进入 Step-2。

---

# Round 2 · 定向回归（P0-1 修复 + keep 桶 + 计数/确定性复核）

> 触发：工程师修复 P0-1（src=AB 语义）+ 落地规则②（新桶 `keep`）+ 重跑产物。
> 方法：Round-1 脚本已按新规格更新（改自己的 `scripts/qa-lemma-*.mjs`，未动工程师产物与 src/）。
> 新规格基线（工程师声明，已独立复算）：桶 auto-fold **9888** / keep **330** / audit **2965**；src AB **12714** / B **416** / A **53**。

## 0. 结论

**ACCEPT** —— 十项必验全部通过，269 条断言全绿（另自检已证明脚本可失败）；Round-1 的 P0-1、P1-1 均已修复并独立验证，无新增 P0/P1。

## 1. 断言统计（Round 2）

| 脚本 | 断言 | 结果 |
| --- | --- | --- |
| `qa-lemma-verify.mjs` | 214 | 214 过 / 0 挂 |
| `qa-lemma-sample.mjs` | 7 | 7 过 / 0 挂 |
| `qa-lemma-attack.mjs` | 49 | 49 过 / 0 挂 |
| **合计** | **270** | **270 / 0** |

（含自检：`QA_SELFTEST=1 node scripts/qa-lemma-verify.mjs` → 注入反例后变红，跑了 215 / 挂 1。）

## 2. 十项逐项结果

1. **P0-1 修复 —— PASS**：旧「触达≥2次」语义下的 175 条伪AB **全部**不再为 AB（AB 12889→**12714**、B 241→**416**）；原 97 条误放行 auto-fold **全部落 audit**（2868+97=**2965**）；抽查 `tired→tire`、`colored→color`、`practiced→practice`、`winged→wing`、`seasoned→season`、`armored→armor` 现均为 **audit + src=B + `src-b-only`**。
2. **执行序与互斥 —— PASS**：`10315 − 97 − 330 = 9888` 成立；以独立复刻的「旧判定」重建旧 auto-fold(10315)/旧 audit(2868)，与「新判定」比对：**旧 audit 集合无一条被移除**（旧 2868 → 新 2965，仅增 97），迁移集(97) 与 keep 集(330) **互斥**，那 97 条即使算术上命中规则②也保持 audit（audit 优先级正确）。
3. **规则② 全量核验 —— PASS**：330 条 keep **逐条**满足 flags 恰 `['multi-highfreq']` + src=AB + fRank>lRank + form `fRank ≤ 2500` + 族内 ≤2500 成员数 ≥2；**反向泄漏 = 0**（auto-fold 中无任何满足规则②条件的行）；keep 桶无混入 audit 条件（src≠AB / 倒挂 / proper）的行。
4. **全量复刻 —— PASS**：独立复刻「新 judge()（含 seenA/seenB 的 src）+ 规则② 转换」，对**全部 13,183 行**复算 bucket **与** flags → 不一致 **0 / 0**。
5. **计数/结构 —— PASS**：三桶和 9888+330+2965=13183；flags 全表复算一致（form-more-frequent 1494 / highfreq-before 815 / src-b-only 416 / multi-highfreq 330 / lemma-proper 233 / lemma-no-gloss 144 / homograph 116 / suspect-target 75 / src-a-only 53 / rank-tie 2）；type 11 类合计 13183；唯一 form 13138（45 个双 lemma form 解释差值）；916 族口径复算一致；draft≡pairs 按 (form,lemma,type) 精确相等无重复；`audit.csv` 数据行 **2965** 且 fRank 升序、14 列、集合=draft audit 桶、`audit.md` 2965 条，三方一致；bucket 枚举 {auto-fold,keep,audit} 与 8 字段契约 **0 违规**。
6. **auto-fold 不变式 —— PASS**：flags 全空、src 全 AB、无倒挂/并列、无自环、lemma 全在库且非 proper。
7. **硬案例 18 组 —— PASS**：桶全部不变；**仅** `shelves→shelve` 与 `honored→honor` 新增 `src-b-only`（其 src 确由 AB→**B**，单源），其余 16 组 flag 完全不变（逐条精确比对通过）。
8. **report.md —— PASS**：23/23 关键声明与数据一致（含敏感度表 82/330/845、11 类合计、"A∧B 真双向→AB" 描述、4 产物路径、硬案例表）。
9. **确定性 —— PASS**：备份 4 产物 → 重跑 → **4/4 MD5 与声明逐字节一致**（draft `5f0d8c6f…` / csv `7a5f7882…` / md `37346ce7…` / report `3b5a9193…`）→ 已删备份。
10. **红线 —— PASS**：`git status --porcelain src/ package.json` 空；`git diff c35db79 HEAD -- src/lib/learning.js` 行数 **0**；生成器仅写 4 声明路径。

## 3. 新发现问题分级

- **P0：无。**
- **P1：无。**
- **P2（观察，不阻塞）**：
  - keep 桶 flags 恒为 `['multi-highfreq']`，不含其他 flag —— 与设计一致；audit 行即使命中规则②也不打该 flag（无需，因 audit 本就不折叠）。
  - 规则②的族成员统计口径（`highFreqRankMax=2500`）与 §5 的「多高频族规模」统计口径（`familyHighFreqMax=5000`）不同值，report 已加注说明，非缺陷。
  - 敏感性 5000→845 与 Round-1 的 845 一致，交叉印证良好。

## 4. Round 2 建议动作

1. 进入 Step-2（数据层加 `lemma` 字段 + 队列上游折叠）；Step-2 折叠规则：`auto-fold` 直接折叠，`keep`/`audit` 均不折叠。
2. 建议 Step-2 落地时补充一条契约测试：断言「不存在 `keep` 行被折叠」「不存在 `audit` 行被折叠」。

---

# Step-2 · 对抗性验收（数据补丁 + 读时折叠 + 接入）

> 验收人：QA（Edward）｜仓库：`word-root-cloud`｜命令均在仓库根目录执行
> 验收对象：`scripts/gen-lemma-patch.mjs` + `src/data/words-lemma.js`（生成物）+ `src/lib/lemmaFold.js` + 接入（`useLearn.js` / `StationLearn.jsx` / `App.jsx` / `index.js` / `words-entry.js`）+ `scripts/test-lemma-fold.mjs` + `scripts/test-private.mjs`
> 验收基线：`reports/lemma/step2-spec.md`（§1–§7）
> 验收脚本（已留存，未改工程师产物/`src/`）：`scripts/qa-lemma-step2-patch.mjs`、`scripts/qa-lemma-step2-runtime.mjs`、`scripts/qa-lemma-step2-static.mjs`

## 0. 结论

**ACCEPT（0×P0 + 0×P1 + 2×P2 观察）** —— 规格 §1–§6 全部落地且与代码/数据完全自洽；十项必验全绿；QA 用**独立复算**（不引用生成器）得到的 id 级折叠映射与补丁逐键双向相等（差集 0/0、值差 0）；"9,888 零丢失"成立；红线无 Step-2 改动；全量回归 + 构建通过。未发现需回退 Engineer 的缺陷。

## 1. 断言统计

| 脚本（QA 独立实现） | 断言 | 结果 |
| --- | --- | --- |
| `qa-lemma-step2-patch.mjs`（① / ② 补丁复算 + 链式 + 例外核销） | 30 | 30 过 / 0 挂（`ALL_PASS`） |
| `qa-lemma-step2-runtime.mjs`（③ 运行时语义 / ⑤ 端到端口径 / ⑩ 反例攻击） | 43 | 43 过 / 0 挂（`ALL_PASS`） |
| `qa-lemma-step2-static.mjs`（④ 接入真实性 / ⑥ 分母口径 / ⑧ 洁净度） | 31 | 31 过 / 0 挂（`ALL_PASS`） |
| **QA 自有断言合计** | **104** | **104 / 0** |

外部回归（工程师既有/新增套件，QA 复跑）：

| 套件 | 结果 |
| --- | --- |
| `validate-data.mjs` | error **0**（warn 609，均为既有词素覆盖提示，非本单） |
| `test:learning` | **65 / 65** |
| `test:vocab` | **13 / 13** |
| `test:graph` | **18 / 18** |
| `test:e2e`（`qa-react-e2e.mjs`） | **PASS=106 / FAIL=0**（exit 0） |
| `test:cloud` | exit **0**（含新套件 `test:lemma-fold`） |
| `test:lemma-fold` | **19 / 19** |
| `test:private` | **17 / 17** |
| `npm run build`（生产构建） | exit **0** |

测试可信度自检：备份补丁 → 删除 1 条期望折叠 `"w.abandoning":"w.abandon"` → `test:lemma-fold` 由 **19/0** 变 **17/2（红）** → 还原后 MD5 逐字节复原（`edb9d3eb…`）。已证明契约测试能失败、非同义反复。

## 2. 十项逐项结果

### ① 补丁独立复算（不引用生成器）—— PASS
- 按 §2 规则由 `draft`+`pairs` **QA 独立推导** id 级映射：`draft×pairs` 全 join（joinFail **0**）；独立推导 **9888** == 补丁 **9888** == `LEMMA_BY_ID.size` **9888**。
- **逐键双向比对**：仅推导有 **0** / 仅补丁有 **0** / 同键值不同 **0**（完全相等）。
- 键按 id 升序（字典序）：**0** 逆序；文件条目行 **9888**。
- `words` 装配 `.lemma` 词数 **9888** == 补丁；每个 `.lemma` 值 == 补丁值（wDiff **0**）；每个 `.lemma` 目标**存在**（targetMiss 0）且**自身未折叠**（targetFold 0）。
- **零丢失**：draft `auto-fold` 行 **9888** → 其 form 被折叠的行 **9888** / 未被折叠的 auto-fold 行 **0**（即每条 auto-fold 行都被折叠，无静默丢弃）。
- `keep`/`audit` 词形零折叠（nonAutoFolded **0**）。

### ② 链式解析与例外清单 —— PASS
- 链式解析条数 **53**（= 声明 53）。抽查 `blessings→…→bless`、`savings→…→save`、`lowered→…→lower` 逐跳核对，终态均为**未被折叠**的代表形。
- 全量：补丁中「目标本身也被折叠」的条数 **0**（所有目标已解析到终态）。
- 例外清单 **45** 条，分布仅 `form-has-nonfold-row=45`；**逐条核销**：45 个例外词形在 `words` 中**均无 `.lemma`**（exBad 0），即"整词不折叠"确已生效。

### ③ 运行时模块语义（`src/lib/lemmaFold.js`）—— PASS
- 模块表面恰 **2 个导出**：`isFolded`、`buildFoldView`（无多余导出）。
- 无副作用符号：源码不含 `localStorage`/`sessionStorage`/`wrc.`/`persist`/`writeFileSync`/`fetch(`。
- QA 独立合成用例 C1–C7 全过：
  - C1 优先级 `known > review > unknown`（子形 known 胜代表形 unknown）且**原样取胜者**（同引用）、子形键被移除；
  - C2 同级取 `consecutiveCorrect` 大者（时间不参与）；C3 同级同 cc 取 `lastStudiedAt` 新者；
  - C4 **known 不变量**：胜者 `status==='known' ⇒ cc>=2`（证明未做字段拼接，保留 learning 不变量）；
  - C5 空家族：无家族键、units 正确；
  - C6 防御链式 `a→b→c`：仅终态 c 是单元、a 的 known 沿链并入 c、中间键移除；
  - **C7 输入不可变**：对 `words`/`records` 做 `Object.freeze`（深冻）后调用不抛错、结果正确、入参 `records` 键数与内容不变 —— **证明确不改动入参**。

### ④ 接入真实性（源码锚定，非"看起来接上了"）—— PASS
- `useLearn.js` 派生段锚点逐一命中：`buildFoldView(baseList, records)`、`countByStatus(foldStatWords, foldRecords)`、`countScheduled(foldStatWords, foldRecords)`、`bandFilter(foldUnits, band)`、`buildLearnQueue(learnPool, foldRecords, …)`、`buildReviewQueue(foldStatWords, foldRecords, …)`。
- **对外仍未折叠**：`statWords` 未被删除，表达式仍为 `baseList ∪ privateList`（私有词不折叠）；`recordOf` 走**未折叠** `records`；`return {}` 暴露 `records`/`statWords`，**未**暴露 `foldRecords`/`foldUnits`（保护 `App.jsx:295` 词汇量估算输入）。
- **迁移未被污染**：`runMigration({ scope: sc, words: list, …})` 恰 **3** 处均传未过滤 `list`；不含 `runMigration({ scope: sc, words: foldUnits`。
- `StationLearn.jsx` 同口径锚点全中（buildFoldView / stats / learnPool / learnQueue / reviewQueue / bandCounts.all=foldUnits.length / bandCounts 遍历 foldUnits）。
- `App.jsx`：`import { isFolded } from './lib/lemmaFold.js'` + `if (isFolded(w)) return`（bandCounts 跳过被折叠形）。
- **两份数据装配一致**：`words-entry.js` 与 `index.js` 的 merge 代码块提取后**逐字相等**（b1 === b2）。

### ⑤ 端到端口径 54,811 —— PASS
- `words.length` **64699**；`buildFoldView(words, {})` → `units` **54811**；`countByStatus(units, records).total` **54811**；`54811 + 9888 = 64699`。
- 合成：子形 `w.abandoning` known → 代表形 `w.abandon` 浮为 known、子形不在 units、total 仍 54811、known==1；子形到期 → **代表形**入复习队列、子形自身不入队；子形与代表形同时 known → known 只计 **1**（不重复计数）。
- `App` bandCounts.all **54811**；App 与 StationLearn bandCounts **逐档一致**；bandCounts 与 `bandFilter(foldUnits, band)` **逐档一致**（计数==真实队列池）。

### ⑥ 分母非回归 —— PASS
- `STATS_SCOPE=64699` 常量**未动**；`test-learning.mjs:762-766` 断言**未动**（65/65 通过印证）。
- `LearnHome.jsx` 分母表达式 = `stats.total || STATS_SCOPE`（动态取折叠后单元数，常量仅空态回落）——锚点命中。

### ⑦ 测试可信度 —— PASS
- `test:lemma-fold` **19/19**：覆盖合成用例（优先级/tie-break/known 不变量/空家族/防御链式）+ 真实数据契约 B1–B8（`.lemma` 词数==补丁、目标存在且未折叠、**全量对账**独立推导 == words 实际、例外核销、keep/audit 零折叠、计数自洽、units 一致）。
- **变异自检**：删 1 条期望折叠 → 该套件 **19→17/2 变红**；还原后补丁 MD5 复原（见 §1）。
- `test-private.mjs` 审计：numstat **+52 / −22**；被删除的 **5 条**断言行**全部 1:1 对应**新增的 fold-aware 等价断言（`records`→`foldRecords`/`statWords` 更新），另**新增 6 条**（"被折叠形不在学习单元集""代表形在""代表形继承子形 known""私有词记录不被吞掉""单元 honor+私有 quixotic=2""新学池仅剩代表形"）。**无一条断言被削弱或删除以掩盖 bug**；结果 17/17。

### ⑧ 红线与洁净度 —— PASS
- §5 五条红线文件工作区**零改动**：`src/lib/learning.js`、`src/lib/vocab.js`、`src/cloud/learnSync.js`、`src/cloud/syncLock.js`、`src/cloud/schema.js`（`git status --porcelain` 全空）；`git diff c35db79 HEAD -- src/lib/learning.js` = **0 行**。
- 新模块 `src/lib/lemmaFold.js`、`src/data/words-lemma.js` 均**不含** `wrc.` 存储键字面量。
- `check-storage-keys` 门禁通过（扫 83 文件；R1–R5 全 ✓；自检 4 正/8 反）。
- 生成器确定性：连跑 2 次 → 输出 MD5 **逐字节一致** `edb9d3eb4dce7898f9eed250b91195d3`（269058 bytes）。
- 改动文件与声明一致：**9 个 tracked 修改**（`package.json`、`scripts/test-private.mjs`、`src/App.jsx`、`src/components/LearnHome.jsx`、`src/components/StationLearn.jsx`、`src/data/index.js`、`src/data/words-entry.js`、`src/hooks/useLearn.js`、`src/lib/derive.js`）+ 4 个新增（`scripts/gen-lemma-patch.mjs`、`src/data/words-lemma.js`、`src/lib/lemmaFold.js`、`scripts/test-lemma-fold.mjs`），无越界。

### ⑨ 全量回归 —— PASS
见 §1 外部回归表：`validate`(error0) / `learning` 65 / `vocab` 13 / `graph` 18 / `e2e` 106 / `test:cloud` exit0 / `test:lemma-fold` 19 / `test-private` 17 / `build` exit0 —— 全绿。与折叠相关的既有断言改动**仅** `test-private.mjs`，逐条理由见 ⑦，无"改断言盖 bug"。

### ⑩ 反向攻击（构造反例验证边界）—— PASS（6/6）
| 攻击 | 预期 | 实际 | 判定 |
| --- | --- | --- | --- |
| known 子形 + review 代表形 | 取 `known` | `known` | PASS |
| 三跳链 `a→b→c→d` | a 的记录并入终态 d、units 仅 d | `w.d\|known` | PASS |
| 子形与代表形同时 known | known=1、total=2 | `total=2,known=1` | PASS |
| `w.lemma` 指向不存在 id | 不崩、子形移出 units、记录挂缺失 id | 一致 | PASS |
| 自环 `lemma===id` | 视作未折叠（仍在 units） | `units=w.x\|isFolded=false` | PASS |
| 真实数据：keep 目标的折叠态 | 子形目标不被折叠（0） | **0** | PASS |

## 3. 疑点清单（分级）

- **P0：无。**
- **P1：无。**
- **P2（观察，不阻塞）**：
  1. **站内折叠口径**：`StationLearn` 对站内含被折词、代表形不在站内的情形，仍按统一口径折叠移除（记录为观察项，符合 §3 明写约定，非缺陷）。
  2. **既有 React key 警告**：e2e 期间出现 `Encountered two children with the same key ... r.pos::w.postpositive`。**与 Step-2 无关**：`ListView.jsx::rowKey = ${morphId}::${wordId}`，而基础数据 `words-extra.js` 中 `w.postpositive` 的 `morphs` 本就含**重复** `["r.pos","r.pos","s.ive"]`；`ListView.jsx` 未被本单改动、也不消费折叠。属**既有数据瑕疵**，非致命。
  3. **§5 红线措辞歧义**：`src/lib/vocab.js` 对 `c35db79` 有 283 行差异，但来自**更早的功能提交 `6500949`（发音/词汇量预测/词源故事）**，非本单；本单工作区对 5 条红线文件**零改动**。建议后续把红线判定统一表述为"相对本单基线工作区零改动"。

## 4. Step-2 建议动作

1. **可提交 Step-2**：无 P0/P1，104/0 自有断言 + 全量回归 + 构建全绿。建议 commit message 记录关键口径：`9,888 折叠 / 54,811 单元 / 53 链式 / 45 例外（form-has-nonfold-row）`，并附 QA ACCEPT 引用本报告。
2. **P2-2（`postpositive` 重复词素）**：建议另开小单修基础数据（去重 `r.pos`），与本单解耦。
3. **后续 UI 阶段**（学习卡/例句呈现常见变形与派生词）按 §6 另行开展，本单不覆盖。
