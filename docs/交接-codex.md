# 交接文档 · word-root-cloud（词根词缀单词云）

> **给 Codex**：读完这份文档即可接手。不要重新调研已核实的事实，文档里的数字都经过实测。
> 文档末尾的「三、剩余待办」是唯一需要你动手的部分。

## ★★★ 给 Codex 的硬约束（先读这一段）★★★

**你只在本地改代码。你不部署，也不碰任何密钥。**

| 你要做 | 你不做 |
|---|---|
| 逐词考证、跑门禁、改 `src/` 与 `scripts/`、本地 commit | ❌ 部署（`api-push.mjs` / `git push` / Cloudflare） |
| 出证据表与报告到 `reports/` | ❌ 索取、读取、写入任何 token / PAT / API key |
| 跑测试并报告 exit code | ❌ `git add -A`（会混入 30+ 个别人的临时脚本） |
| 报告「改了哪些文件、门禁结果、建议推哪个 commit」 | ❌ 改 `docs/课程技术报告-词根词缀单词云.md`（别人的在途改动） |

**部署由用户自己做，或由另一位协作者（workbuddy）负责——两者都不需要你提供密钥。**
如果你发现自己需要一个 token 才能继续，**停下并报告**，不要想办法绕过。

**为什么这条约束存在**：本项目曾发生过 token 误入仓库文档的事故（已清除）。密钥只应存在于用户的机器与 GitHub 之间，任何 agent 都不该持有。

- 仓库：`C:/Users/lyy/WorkBuddy/2026-09-26-22-28-35/word-root-cloud`
- 远端：`github.com/flashman56/Word-Station`（分支 `main`，Cloudflare Pages 自动构建）
- 当前线上：`9c73c9c696`
- 技术栈：React 18 + Vite 5 + Tailwind + Supabase，离线优先（localStorage 按账号分区 + 可选云同步）

---

## 一、项目定位（决定你怎么做取舍）

单页应用，无路由（tabs：小站 / 学习 / 总览 / 聚焦 / 列表）。

**核心卖点是「按词素（词根词缀）学习」**——学习单元按构词链组织，有词族视图、有独立的「按词素学习」路径。这条路径的数据质量就是产品的全部价值。

**明确不做的事**（用户已确认的竞争判断）：功能覆盖与内容工业化打不过有道/百词斩，不追例句库数量、不做社交打卡、不做图片助记。优势在于「词根是第一性原理」+「数据诚实性」+「离线无账号」。

---

## 二、红线（违反会毁数据，务必先读）

1. **冻结文件，零 diff，连注释都不能改**：
   `src/lib/learning.js`、`src/lib/vocab.js`、`src/lib/learnSync.js`、`src/lib/syncLock.js`、`src/lib/schema.js`
   cloud 层禁止 SRS 字段（ease / interval / lapses / reps）。

2. **词源红线「错的词源比没有更糟」**
   子串匹配做自动化拆解的精确率只有 15–20%（每 5 个错 4 个）。**只能逐词考证**，不可批量生成。
   - ❌ 已被证实反面案例：`environment`/`announcement`/`dimension`/`immense`/`measurement` 曾挂 `r.ment`（拉丁 mens「心」），
     真实来源是 `metiri`「测量」；`treatment`←`tractare`「拉、处理」；`garment`←`garnir`「配备」；`parchment`←`pergamene`；`impediment`←`impedire`「绊住」。
   - **批量替换形态规则 = 制造新的错词源**。任何「批量修正词素挂载」的提案都要先过精度基准。

3. **音标红线**：绝不生成。任何模型生成的音标都不接受（错的音标比没有更糟）。只能查表（`src/lib/dict.js` / ECDICT / ipa-dict / kaikki）。

4. **测评（placement）绝不写 `learn.records`**
   `vocab.js` 的判别式是 `records[id]` 存在且 `statusSource !== 'migration'` ⇒ 任何 `status:'known'` 记录都会被读成「实测已知」。
   若把自评写进去，`interpolateNulls` 会把无样本档也填成 1.0 ⇒ 11 档全计入 ⇒ **词汇量变成 64,700（全库）**。

5. **存储键分区**：新增 localStorage key 必须走 `src/lib/migrate.js` 的 `scopeOf`/`keysFor`/`ensurePartition`。
   `npm run test:keys` 会连注释一起扫，白名单外任何 `wrc.*` 字面量即失败。

6. **push 前必须本地 `git commit`，绝不 `git add -A`**（工作区有 30+ 个别人的临时脚本：`dist.bak*` / `_*.mjs` / `.probe*` / `.gate-*`）。
   ⚠️ 另有 `docs/课程技术报告-词根词缀单词云.md` 是别人的在途改动，全程未提交，**不要带上**。

---

## 三、剩余待办（唯一需要动手的部分）

### 3.1 【最高优先】190 词高危词源考证 —— 唯一卡在外部词典的一项

**清单已生成**：`reports/suspect-morph-audit.md`

成因：`r.al`（拉丁 `al-`「养育、滋养」，note 只承认 `aliment`/`alimony`）被挂到 **152 个**英语词上；
`r.ment`（mens「心」，note 只承认 `mental`/`mention`/`dementia`）被挂到 **47 个**词上。
其中大部分与词素本义无关，例如 `final / normal / local / social / legal / central / material / medical / environmental`。

清单已用**词素自身 note 点名过的例词**做白名单分级：
- **190 词高危**（note 未点名）→ 需逐词查 OED / Wiktionary 定夺
- **9 词大概率合法**（note 已点名）

**做法建议**：
1. 用 Wiktionary API 批量取 etymology，不要靠语感：
   `https://en.wiktionary.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=<word>`
   一次可查多个 title。
2. 判据：看 Etymology 段给出的**拉丁/希腊原形**。若与 `ment`/`al` 的词素义无关 → 该挂 `s.ment`/`s.al`，或干脆拆掉。
3. 产出**证据表**（词 / 现挂 / 词典给的来源 / 结论 / 建议动作），人工过一遍再改数据。
4. 注意 `origin` 字段本身也可能是错的（remorph-prune 发现 251 条「origin=germanic 却挂拉丁/希腊词根」，其中约 15–20 条是真垃圾）——这个字段单独列在下面 3.4。

**红线提醒**：这批只能逐词定夺，不要为了「清掉告警」而批量翻转。

### 3.2 loan 可拆词逐词考证

新用户队列前 1000 词的无链构成（实测，折叠后）：
- **A. 屈折形，原形在库**：109 个 → **已在第三轮用 lemminflect 处理完**，见 3.5
- **B. 非屈折形 505 个**：loan 249 + mono 237 + phrase 19
  - loan 里真正有拉丁/希腊源的粗估仅 **30–40 个**：`scale / academy / algebra / chamber / romance / strategy / chaos / alpha / diet / trauma / cactus / comedy / basis / phase / tragic / galaxy / purple / poet / cemetery / counsel / improve / envy / supreme / vessel / develop / achieve / humor / chapter / tube / throne`
  - 其余 ~210 个是真借词，**不该拆**：`booth / pour / bishop / tattoo / sushi / karaoke / pizza / chocolate / coffee / whiskey / banana / jungle / curry / avatar / guru / lemon / tofu / kimono / judo / sumo / ramen / taco / burrito / potato / cookie / kiwi / vodka / bazaar / kiosk / sofa / garage / tennis / bacon / ranch / pearl / cherry / cattle / turtle / luggage / burger / tissue / puppy / cotton / carpet / medal / embassy / cabinet / vault / helmet / cruise / rumor / gallery / envy / villa`
  - mono 237 多为真单音节或复合/助词词：`ouch / pour / beside / nearby / unlike / backup / noon / dance / talk / push / write`
  - phrase 19 个是习语，**本就不该拆**

⚠️ **95% 有链这个目标不成立，别去追**。见 3.6。

### 3.3 补全 lemma 折叠的剩余部分

`reports/lemma-candidates.md`：T2 待复核 **2,147** 条（其中 **298** 条折叠后代表形有 chain），T3 不建议 459 条。
这批靠形态规则推断，**需人工逐词确认后才能写进 `src/data/words-lemma.js`**。

### 3.4 remorph-prune 遗留精度子任务

- **251 条** `origin=germanic` 却挂拉丁/希腊词根：绝大多数是「base 数据把正确借词错标 origin」（`pay`/`plant`/`quiet`/`strict`/`test` 都源自拉丁），
  但**混有约 15–20 条真垃圾**：`grandmother`(r.mov+r.her)、`helpers`(r.iatr)、`breathless`(r.athl)、
  `postmaster`/`stationmaster`(r.astr)、`pathfinder`(r.path)、`password`(r.ord)、`salesperson`(r.sal+r.sper+r.son)。**必须逐条人工审，不能自动化删**。
- **83 条**多词单位带 chain：来源是 base 词库（73）+ `words-bookmorph.js`（10），remorph 补丁表 0 条。

---

## 四、已交付 / 已完成（不要重复做，也不要回退）

| 事项 | 状态 | commit |
|---|---|---|
| 自适应二分式起点测评 + 二次确认（题量 12~40 按置信区间收敛） | 已上线 | `3f3668f` → 远端 `3932f8ae33` |
| `test-placement-stuck` 失效断言修复 | 已上线 | `3c23524` → 远端 `b843ef9ff9` |
| remorph 残留垃圾 8 条清理（dens/lys/cred/anchorage/anchorman/falling/fallout/chortling） | 已上线 | `313511d` → 远端 `edc9f8ee4b` |
| **词素挂载冲突 56 词**（r.ment→s.ment 25 条 + r.al→s.al 31 条）+ 合并去重 + 通用闸门 | 已上线 | `2a357d8` → 远端 `0b94156212` |
| 可疑词源审计清单（190 高危 / 9 合法） | 已上线 | `c2bcbe8` → 远端 `b6aeab9f6a` |
| 屈折检测器 + 精度基准 + 候选清单 | 已上线 | `6104241` → 远端 `04bf02ebae` |
| **lemminflect 补齐折叠 9,888 → 10,127（+239）** | 已上线 | `538087c` → 远端 `9c73c9c696` |
| morphless 标记 | **早已 100% 完成**，无需做 | 无 chain 的 44,187 词全部已标；UI 经 `derive.morphlessKindLabel` 渲染「无词素 · 单纯词/外来词/专有名词/固定搭配」 |

**morphless 的判据坑**（照抄原注释，别改错）：
UI 判据是 `derive.hasDecomposition`（看 chain 有没有内容），**不是 `word.morphless` 标记**——
因为 remorph 补丁给 2,244 个 morphless 词补了 chain 但必须保留 `morphless:true`（validate 硬约束），判标记会让这批补丁失效。

---

## 五、验证与部署（接手后请照此执行）

### 门禁
```bash
npm run test:cloud        # 24 套件，含 placement / lemma / word-forms
npm run test:e2e          # 真挂载 AppShell，专抓 TDZ 白屏（不在 test:cloud 里）
npm run validate          # 数据校验，error 必须 0
npm run test:quality      # 数据质量，IS_PASS: YES
npm run test:lemma-fold   # 折叠表不变量
npm run test:word-forms   # 展示关系
```
`test:cloud` **不编译 Sidebar.jsx / 任意 UI**（只当文本读）⇒ **改 UI 必跑 `npm run build`，且 `test:e2e` 要单独跑**。

### 已加的闸门（`scripts/validate-data.mjs`，warn 级）
「同一 form 的 root 与 suffix 不得挂在同一个词上」——从 `morphemes.js` 反推同 form 的 root/suffix 组合。
首次运行就查出 31 个 `s.al`+`r.al` 冲突，是写死 `ment` 检查发现不了的。**扩表前先看这个闸门的输出**。

### 部署（沙箱限制：`github.com:443` 被挡）
```bash
# ★ PAT 绝不要写进本文件或任何会被提交的文件 ★
#   本文件曾误含 PAT，2026-10-14 已清除。token 只放在 shell 历史或已 gitignore 的 .env 里。
#   ★ 执行者是用户本人（或 workbuddy），不是 Codex。Codex 只负责改代码 + 报告该推哪个 commit。
GH_TOKEN=<你的 GitHub PAT：ghp_…> node scripts/api-push.mjs
```
`scripts/api-push.mjs` 走 Git Data API（POST blobs→trees→commits + PATCH `/git/refs/heads/main`，以真实远端 tip 为 parent 快进，绝不强推）。

**每次推送前必须改脚本里两处常量**：
- `LOCAL_BASE` = 上一次已推送的本地 commit
- `NEW` = 本次要推的本地 commit

⚠️ `api-push.mjs` 保持 **untracked**，不进远端。
⚠️ **Cloudflare 的 `build` 脚本不跑测试**（`split:data && vite build && clean-vite-temp`）——「部署成功」≠「测试通过」，两者必须分开验。

---

## 六、五个必须知道的坑（都是这次实际踩过的）

1. **改产品状态前先读上游的 bucket / flags，别用自己的启发式推断「该怎么做」。**
   我曾断言「109 个屈折形该折叠，是最大的安全赢」——查 `.lemma-map.draft.json` 后发现它们全是 `bucket='audit'`、flag `highfreq-before`（变形形比原形更常用：`held 1012 vs hold 5349`、`blown 2502 vs blow 8034`），折叠它们会把学习者推到 rank 8000 的冷僻原形。**那个判断完全错了。**

2. **「精确率 98.74%」这类指标，必须在与生产同分布的无标注数据上再验一次。**
   手写检测器 `scripts/lib/base-form.mjs` 在 draft 已有形式上 98.74%，看着能用；但在全新形式上，它估的 2,168 条「真漏掉」里 lemminflect 只确认 **285 条——假阳性约 87%**。
   原因：98.74% 是在「参照答案现成」的集合上测的。**换到没标注的新数据上立刻失效。**

3. **源码断言会随改写失效。**
   `test-placement-stuck.mjs` 查的是正则 `items.length === 0...setStartError`，而 `usePlacement.start()` 改写成「抽不到首题 `!first` 才 setStartError」后，行为正确但断言失效。改 hook 结构时同步查这类正则断言。
   同类：`test-word-forms` 曾把「折叠 9888」钉死，补齐后必须更新。

4. **「A 条件 === B 条件」这类自洽断言可能只是巧合。**
   `test-word-forms` 里 `displayCount === FORMS_BY_ID.size` 把「有任一代表关系的词数」与「展示表条数」混算（`repRawOf` 会回退到 `lemma`），之前相等纯属巧合，补数据后立刻差 239。已拆成两条分别断言。

5. **lemminflect 的 API 细节**：
   - `getInflection(lemma, tag, form)` 第二参要 **Penn tag（VBD）**，传 `upos`（`'VERB'`）会返回 `None` 并刷「Invalid upos type」
   - `getAllInflections(lemma, upos)` 返回 **`{tag: (forms...)}`**，key 是 tag 不是 form
   - 安装位置：`C:/Users/lyy/.workbuddy/binaries/python/envs/default/Scripts/python.exe -m pip install lemminflect`

---

## 七、当前实测基线（Codex 改完后应与这些对照）

| 指标 | 数值 | 测量方式 |
|---|---|---|
| 词库总词数 | 64,699 | `src/data/index.js` |
| 词素数 | 982 | `morphemes.js` |
| **新用户队列前 1000 的 chain 覆盖率** | **38.6%** | 见下方命令 |
| 全部学习单元的 chain 覆盖率 | 48.0% | |
| 学习单元数（折叠后） | 40,871 | |
| 无 chain 且已标 morphless | 44,187（100%） | |
| 折叠条目 | 10,127 | `words-lemma.js` |

```bash
# 复现覆盖率测量
node --input-type=module -e "
const { default: WORDS } = await import('./src/data/words-entry.js')
const { bandFilter } = await import('./src/hooks/useLearn.js')
const { buildLearnQueue } = await import('./src/lib/learning.js')
const lemmaFold = await import('./src/lib/lemmaFold.js')
const records={}
WORDS.forEach(w=>{ if(w&&Number.isFinite(w.freqRank)&&w.freqRank<=2500&&w.kind!=='proper'){ records[w.id]={status:'known',statusSource:'migration'} } })
const pool=bandFilter(WORDS.filter(w=>w.kind!=='proper'),'all')
const fold=lemmaFold.buildFoldView(pool,records)
const q=buildLearnQueue(fold.units,fold.records,1000)
const c=q.filter(w=>Array.isArray(w.chain)&&w.chain.length).length
console.log('前1000 有 chain:', c, (c/q.length*100).toFixed(1)+'%')
"
```

**建模口径**（测出来是这个数的原因，别以为是随机波动）：
- 新用户 = `freqRank <= 2500` 自动视为已掌握（`AUTO_KNOWN_RANK`）
- 默认排除专有名词（`excludeProper` 默认 true）
- 队列经 `lemmaFold.buildFoldView` 折叠后再取前 1000

---

## 八、覆盖率目标的修正（重要，别按旧目标做）

**「95% 的词有 chain」这个目标不成立，别去追。**

即便把可折叠的、可拆的词全部处理完，队列里也只有约 **43%** 有链——剩下约 470 个要么真无词根、要么该标 morphless。硬追只有两条路：把 `booth`/`pour`/`sushi` 强行拆成错词源（违反红线），或者造假。

**正确的指标是「解释率」=（有 chain ∪ 已标 morphless）/ 总数**，
即「每个词要么有拆解，要么明确告诉你为什么没有」。按此口径队列可从 38.6% 做到约 **90%**，且不违反任何红线。

这也正是「数据诚实性」这个差异化优势的落地点——大厂不会这么做，因为一个模棱两可的「你认识 8000 词」比一句「我给不了」更能留住用户。

---

## 九、下一步建议（按优先级）

1. **3.1 的 190 词词源考证** —— 唯一卡外部词典、且直接决定产品核心卖点是否可信。用 Wiktionary API 批量取 etymology，产出证据表后再改数据。
2. **3.2 的 loan 可拆词（~35 个）** —— 量小、可逐词考证，收益直接（进队列的 chain 覆盖率）。
3. **3.3 的 T2 折叠（2,147 条）** —— 量最大但每条只需确认「原形对不对」，可分批。
4. **3.4 的 origin 错标审计** —— 251 条里挑出 15–20 条真垃圾。

## 十、收尾流程（谁做什么）

**Codex 做到这里就停：**
1. 跑全门禁，报告 exit code（`test:cloud` / `validate` / `test:quality` / `test:lemma-fold` / `test:word-forms`）
2. 本地 commit（**逐个文件 `git add`，绝不 `git add -A`**）
3. 报告三件事：**改了哪些文件**、**门禁结果**、**建议推送的 commit SHA**
4. **到此为止——不要部署**

**用户或 workbuddy 做：**
- 更新 `scripts/api-push.mjs` 的 `LOCAL_BASE` / `NEW` 两处常量
- 执行 `GH_TOKEN=<PAT> node scripts/api-push.mjs`
- 确认 Cloudflare 自动构建

改完任何一条都请：跑全门禁 → 本地 commit → 报告该推哪个 commit →**停下交回部署**。