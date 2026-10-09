# 词库垃圾条目清理报告

- 基线 HEAD：`f05142a`
- 扫描范围：`src/data/words-*.js` 全部 7 个文件，共 **64,825** 条
- 扫描脚本：`scripts/scan-junk-words.mjs`（只读，可重复运行）
- 清理脚本：`scripts/purge-junk-words.mjs`（按行号精确删除，幂等）
- 原始数据快照：`reports/junk-scan-HEAD-f05142a.json`（行号对应 HEAD `f05142a`）
- 清理后复扫快照：`reports/junk-scan.json`

---

## 1. A 类 —— gloss 自认是错词（**已全部删除，共 102 条**）

判定规则：关键词（拼写有误 / 拼写错误 / 误拼 / 疑似 / 非标准 / 乱码 / 无实义 …）必须满足其一：

1. 出现在中文括号「（…）」内部，例如「（拼写有误，疑为 everything）」；
2. 以「X 的<关键词>」引用式出现，例如「everything 的误拼」。

> 为什么要这条规则：否则 `cacography`（释义「拙劣的书法；拼写错误」）、
> `misspell`（「拼错」）、`misspelled`（「拼错的」）、`denormalize`（「使非正常化；使不规范」）
> 这些**以“拼写错误”为词义的正常词**会被误杀。它们已被列入扫描器的
> `A_FALSE_POSITIVE_WHITELIST` 显式排除，本次未被删除。

**全部 102 条都集中在 `src/data/words-mono-seed.js`**（其它 6 个文件 A 类为 0）。

### 1.1 你点名的 9 条

| 文件:行号(HEAD) | form | gloss |
|---|---|---|
| words-mono-seed.js:29431 | `evemhing` | （拼写有误，疑为everything） |
| words-mono-seed.js:12247 | `iong` | （拼写有误，无法释义） |
| words-mono-seed.js:14342 | `ieast` | （疑似拼写有误） |
| words-mono-seed.js:14353 | `ge` | （疑似拼写有误） |
| words-mono-seed.js:18622 | `ieft` | （拼写有误，无法释义） |
| words-mono-seed.js:20032 | `lnspector` | 检查员（拼写有误） |
| words-mono-seed.js:21085 | `ofhere` | （拼写有误，疑为 of here） |
| words-mono-seed.js:24635 | `ionger` | （拼写有误，无常见义） |
| words-mono-seed.js:29320 | `commited` | 犯（错）；承诺（拼写有误） |

### 1.2 另外扫出的 93 条（同批删除）

**纯乱码 / 拼写片段（无对应真词，删除零风险）**

| 行号 | form | gloss |
|---|---|---|
| 6812 | `nder` | （无实义，拼写片段） |
| 6817 | `a-a` | （拼写片段，无实义） |
| 6834 | `iove` | （拼写变体，无实义） |
| 11561 | `the-the` | （重复的定冠词，非标准词） |
| 11832 | `alphahff` | （无实义拼写，疑似专名） |
| 12131 | `wasrt` | （疑似拼写错误） |
| 12145 | `ther` | （疑似拼写错误） |
| 12153 | `we-we` | （重复词，无实义） |
| 16591 | `ifwe` | （非标准拼写，人名/代号） |
| 18051 | `aegisshi` | （疑似专名，无通用义） |
| 20880 | `tlhe` | （专名，拼写异常） |
| 23225 | `foryour` | （拼写异常，疑为 for your） |
| 23343 | `subxpacio` | （未明词，疑似拼写变体） |
| 25123 | `butyou` | （拼写异常，无实义） |
| 25326 | `ofit` | （非标准拼写） |
| 25801 | `werert` | （疑似拼写错误，无实义） |
| 29954 | `tthe` | （拼写变体，无实义） |
| 29987 | `vel` | （缩写/词尾，无实义） |
| 30102 | `didrt` | （疑似拼写错误） |
| 30931 | `slpowlcz` | （无意义拼写，疑似乱码） |
| 34376 | `hejust` | （拼写异常）他刚…… |
| 38617 | `t-the` | （拼写变体，无实义） |
| 38632 | `ngs` | （缩写，无实义） |
| 38652 | `thet` | （拼写变体，无实义） |

**l/I 混淆（OCR 式错拼，如 `iike`=like、`lnspector`=inspector）**

| 行号 | form | gloss |
|---|---|---|
| 3319 | `iike` | 喜欢（like 的误拼） |
| 18428 | `wouid` | would 的拼写错误 |
| 18622 | `ieft` | （拼写有误，无法释义） |
| 19144 | `lmpossible` | 不可能的（拼写错误） |
| 19941 | `iook` | （拼写异常，疑为look） |
| 14342 | `ieast` | （疑似拼写有误） |
| 24635 | `ionger` | （拼写有误，无常见义） |
| 24771 | `fiind` | （非标准拼写）发现 |
| 30020 | `shouidn` | shouldn't 的误拼 |
| 35455 | `couidn` | （拼写错误）couldn't |
| 40344 | `wouidn` | （wouldn 的误拼） |

**常见错拼（对应真词已在库中，删除不掉词）**

| 行号 | form | gloss | 对应真词 |
|---|---|---|---|
| 18449 | `noone` | 没有人（no one 的误拼） | no one |
| 18702 | `eveything` | 一切（everything 的误拼） | everything |
| 19159 | `doesnt` | does not 的缩写（非标准拼写） | doesn't |
| 22053 | `happend` | 发生（happen 的误拼） | happened |
| 22565 | `eveyone` | 每个人（everyone 拼写错误） | everyone |
| 26617 | `momento` | 纪念品（memento 的误拼） | memento |
| 29269 | `realy` | 真正地（really 误拼） | really |
| 29301 | `eveybody` | 每个人（everybody 误拼） | everybody |
| 30289 | `tought` | 教（teach 的误拼） | taught |
| 31284 | `occured` | 发生（occur 的拼写错误） | occurred |
| 31623 | `appartment` | 公寓（apartment 的误拼） | apartment |
| 32027 | `affraid` | 害怕的（afraid 的拼写错误） | afraid |
| 36311 | `someting` | 某事物（something 误拼） | something |
| 36368 | `embarassed` | 尴尬的（拼写错误） | embarrassed |
| 36711 | `youself` | 你自己（yourself 的误拼） | yourself |
| 37303 | `begining` | 开始（beginning 的拼写错误） | beginning |
| 37663 | `everthing` | 一切（everything 的误拼） | everything |
| 38816 | `goverment` | 政府（government 的拼写错误） | government |
| 39306 | `strenght` | 力量（strength 拼错） | strength |
| 40250 | `tommorow` | 明天（拼写错误） | tomorrow |
| 41682 | `seperate` | 分开（separate 的错误拼写） | separate |
| 41951 | `shoud` | 应该（should 的误拼） | should |
| 42147 | `transfered` | 转移（transfer 的误拼） | transferred |
| 43787 | `accomodation` | 住宿；适应（拼写错误） | accommodation |
| 43966 | `amature` | 业余爱好者（拼写错误） | amateur |
| 44035 | `insest` | 乱伦（incest的误拼） | incest |
| 44057 | `amatuer` | 业余爱好者（amateur的误拼） | amateur |
| 44949 | `definately` | 肯定地（definitely的误拼） | definitely |
| 45082 | `millenium` | 千年（millennium 的误拼） | millennium |
| 45090 | `lingere` | 女式内衣（lingerie 的误拼） | lingerie |

**缩写/口语/非标准变形（这批偏“擦边”，如果口径要更严可以只删上面两组）**

| 行号 | form | gloss |
|---|---|---|
| 293 | `aren` | are not 的缩写（非标准拼写） |
| 466 | `weren` | were 的缩写（非标准） |
| 9629 | `dum` | 哑的（非标准拼写） |
| 13481 | `hes` | 他（非标准拼写） |
| 14090 | `everytime` | 每次（非标准拼写） |
| 15265 | `gots` | 得到（got 的非标准拼写） |
| 17421 | `dok` | 码头（非标准拼写） |
| 18981 | `holdin` | 持有（holding的非标准拼写） |
| 19128 | `shes` | 她（非标准拼写） |
| 22622 | `hopin` | 希望（非标准拼写） |
| 22644 | `knowed` | 知道（非标准过去式） |
| 22774 | `fleed` | 逃走（非标准过去式） |
| 22798 | `brung` | 带来（非标准过去分词） |
| 23284 | `childrens` | 儿童的（非标准拼写） |
| 23310 | `blowin` | 吹（非标准拼写） |
| 23339 | `theyre` | 他们是（非标准拼写） |
| 24194 | `ofher` | 她的（误拼） |
| 24789 | `dreamin` | 做梦（非标准拼写） |
| 25800 | `bringin` | 引入；带来（非标准拼写） |
| 32789 | `lifes` | （非标准）life 的复数 |
| 33903 | `growed` | grow 的非标准过去式 |
| 35349 | `knowin` | 知道（knowing 的非标准拼写） |
| 36111 | `smilin` | 微笑的（非标准拼写） |
| 36211 | `throwed` | 扔（throw 的非标准过去式） |
| 38393 | `curiouser` | 更奇怪的（非标准比较级） |
| 40740 | `heared` | 听到（非标准拼写） |
| 40973 | `lov` | 爱（非标准拼写） |
| 41023 | `catched` | 抓住（catch 的非标准过去式） |
| 42325 | `believin` | 相信（非标准拼写） |
| 42821 | `foto` | 照片（非标准拼写） |
| 43937 | `ments` | （非标准）ment的复数 |

> 完整机读清单（含 id / kind / 命中关键词）：`reports/junk-scan-HEAD-f05142a.json` → `classA`；
> 实际删除明细：`reports/purged-junk.json`。

---

## 2. B 类 —— form 本身不像合法英文词（**仅报告，未删除**）

共 **1402 条**（HEAD 时点）。按原因分布：

| 数量 | 原因 | 说明 / 建议 |
|---:|---|---|
| 774 | 含空格/连字符但 `kind=mono` | 绝大多数是 `good-looking`、`part-time`、`brand-new` 这类**正常复合词**，只是 kind 标成了 mono。**不建议删**，至多把 kind 改成 `phrase`。 |
| 517 | 长度 ≤2 且不在白名单 | 混合。`oh/ah/er/mm/hm/eh/ha/aw/ex/pm/mr/dr/st` 等是真词或通用缩写，**必须保留**；`ls/lf/ll/th/wh/qu/ee`（释义就是「字母组合」）才是垃圾。 |
| 79 | 含空格/连字符但 `kind` 为空 | `words-extra.js` 里的 `vice-chancellor`、`self-evident`、`mea culpa`、`ultra vires` 等，**都是合法的复合词/短语**，只是 kind 字段缺失。**不建议删**。 |
| 14 | 全辅音且长度 ≥5（疑似乱码） | 见下表，大部分其实是缩写/技术词（`https`/`xhtml`/`dhtml`/`pgsql`/`msnbc`/`httpd`），真垃圾只有 `chffffff`。 |
| 12 | 长度 2 + 含连字符 | `a-`、`i-` 这类「前缀条目」，本质是词素不是词。**建议删或转成词素**。 |
| 5 | 含非 ASCII 字符 | `vivandière`/`technopôle`/`flambé`/`alençon`/`émigré` —— 法语借词，**是合法词条，不要删**。 |
| 1 | 含异常符号 + 长度 2 | `words-extra.js` 的 `n.`，见下方「B 类高危」。 |

### 2.1 B 类高危（强烈建议一并删除，等你确认）

| 文件:行号 | id | form | 问题 |
|---|---|---|---|
| `words-extra.js:5237` | `w.n` | `n.` | **损坏条目**：form 被写成了词性标记「n.」，但释义/音标/例句/词素链全都是 **concession**（`/kənˈseʃn/`，con+cess+ion）。而 `w.concession` 已经在 `words-extra.js:11052` 正常存在 —— 这条是**重复且损坏**的副本，删掉不掉词。 |
| `words-extra.js:2024` | `w.extraviv` | `extra viv` | **占位符**：gloss「（占位）」、音标「/x/」、例句「Placeholder.」。不是英文词。 |

### 2.2 疑似乱码（14 条全辅音）明细

| 文件:行号 | form | gloss | 判断 |
|---|---|---|---|
| words-mono-seed.js:2397 | `chffffff` | （无意义字符串） | **垃圾**，建议删 |
| words-mono-seed.js:43017 | `msgstr` | 消息字符串（缩写） | 技术缩写，可留 |
| words-mono-seed.js:43189 | `sbjct` | 主题（缩写，subject） | 技术缩写，偏垃圾 |
| words-mono-seed.js:42915 | `phpbb` | phpBB（论坛软件） | 专名，可留 |
| words-mono-seed.js:43388 | `https` | 超文本传输安全协议 | 可留 |
| words-mono-seed.js:43396 | `pgsql` | PostgreSQL数据库 | 可留 |
| words-mono-seed.js:43850 | `msnbc` | 微软全国广播公司 | 可留 |
| words-mono-seed.js:44031 | `httpd` | HTTP守护进程（服务器程序） | 可留 |
| words-mono-seed.js:44332 | `dhtml` | 动态HTML | 可留 |
| words-mono-seed.js:42859 | `xhtml` | 可扩展超文本标记语言 | 可留 |
| words-mono-seed.js:16618 | `mmhmm` | 嗯嗯（表示同意） | 拟声词，可留 |
| words-mono-seed.js:21026 | `shhhh` | 嘘（示意安静） | 拟声词，可留 |
| words-mono-seed.js:27327 | `mmmmm` | 嗯（表示美味） | 拟声词，可留 |
| words-mono-seed.js:41104 | `hmmph` | 哼（不满声） | 拟声词，可留 |

### 2.3 短词里释义就是「字母组合」的 7 条（建议删）

| 文件:行号 | form | gloss |
|---|---|---|
| words-mono-seed.js:1747 | `ls` | 字母组合；列表命令 |
| words-mono-seed.js:1779 | `lf` | 字母组合；换行符 |
| words-mono-seed.js:1780 | `ll` | 字母组合；将（缩写） |
| words-mono-seed.js:4228 | `th` | （字母组合）th；序数词尾 |
| words-mono-seed.js:5565 | `wh` | wh（字母组合/缩写） |
| words-mono-seed.js:11225 | `qu` | （字母组合/缩写） |
| words-mono-seed.js:11238 | `ee` | （字母组合/缩写） |

> 完整 1402 条机读清单：`reports/junk-scan-HEAD-f05142a.json` → `classB`（含 file/line/form/gloss/kind/reasons）。

---

## 3. 防复活：这些条目是脚本产物，已在生成脚本加黑名单

**结论：是脚本产物，不是手写种子。**

链路：`scripts/seed-words.txt`（种子词表，含这批非词）
→ `scripts/gen-mono-seed.mjs` 逐批交给 DeepSeek 标注
→ DeepSeek 如实标成「（拼写有误，疑为 everything）」
→ 写进 `src/data/words-mono-seed.js` + 缓存 `scripts/.gen-mono-seed-cache.json`。

`gen-mono-words.mjs`、`gen-words.mjs` **不读** `seed-words.txt`，与这批垃圾无关。

### 改动位置：`scripts/gen-mono-seed.mjs`

| 位置 | 内容 |
|---|---|
| 第 35 行起（新增） | `JUNK_FORM_BLOCKLIST` 常量（102 个词形，带成因注释）+ `JUNK_FORMS` Set |
| 第 88 行起（新增） | `isSelfAdmittedErrorGloss(gloss)` —— **通用护栏**：释义里出现「拼写有误/误拼/疑似乱码/无实义…」且位于括号内或为「X 的误拼」引用式，一律判定为自认错词 |
| 第 148 行附近 `loadSeed()` | **拦截 1**：黑名单种子不进标注批次（省 API 调用） |
| `normalize()` | **拦截 2**：`JUNK_FORMS.has(lower)` → `'junk blocklisted form'`；`isSelfAdmittedErrorGloss(w.gloss)` → `'self-admitted error gloss'` |
| 缓存加载后 | **拦截 3（自愈）**：旧 `.gen-mono-seed-cache.json` 里的脏条目就地剔除，同时剔除引用它们的近义/反义对 |
| `writeOutputs()` 开头 | **拦截 4（兜底）**：落盘前再过滤一次 |

有「通用护栏」在，即使将来 `seed-words.txt` 混进**新的**垃圾串、被模型标成「（疑似拼写错误）」，也会被 `normalize()` 拒收，不会复活。

合规校验：`node --check scripts/gen-mono-seed.mjs` 通过。

> ⚠️ 未改动 `scripts/seed-words.txt`：它是 4.7 万行语料，删行会让所有后续种子的
> `freqRank`（= 种子行号）整体位移，与已落盘的 `words-mono-seed.js` 不一致。
> 黑名单已经能拦住它，如果你希望连源头一起清，我可以单独做一次并同步重排 freqRank。

---

## 4. 计数 / 断言同步

| 项 | 基线 | 现在 | 处理 |
|---|---|---|---|
| 全库单词数（`npm run validate` 输出） | 64,825 | **64,723** | 自动跟随 |
| `src/lib/derive.js` `STATS_SCOPE` | 64,825 | **64,723** | **已改**（加了变更说明注释） |
| `src/data/words-mono-seed.js` 头部「词数」 | 46,513 | **46,411** | 脚本自动同步 |
| `src/data/synants-mono-seed.js` 近义/反义 | 7,829 / 2,587 | **7,818 / 2,583** | 删掉 15 对引用被删词的关系 |

### 4.1 因词数变化而（本会）失败的断言

**只有 1 处，已按「更新期望值」处理：**

- `scripts/test-learning.mjs:762-765`
  ```js
  check('STATS_SCOPE 等于去重后的单词数（全库分母）', () => {
    eq(STATS_SCOPE, new Set(REAL_WORDS.map((w) => w.id)).size)
  ```
  这是**守口径的断言**（常量必须等于真实词数），不是写死的期望值。
  按 `derive.js` 注释「词库扩容时改这一个数字即可」的约定，把 `STATS_SCOPE`
  从 64825 改成 64723 是**正确修法**，不是放宽断言。改完断言仍然严格成立。

### 4.2 仍残留旧数字 64825 的地方（**都没动，等你判断**）

| 位置 | 性质 | 影响 | 建议 |
|---|---|---|---|
| `src/lib/vocab.js:25` `VOCAB_BOUNDS` 末档上界 | **红线文件，我没碰** | 词汇量估算最高档按 45001~64825 计分母，实际库只有 64723，误差 102/18225 ≈ 0.6% | 建议改成 64723，但需要你来动 `vocab.js` |
| `src/hooks/useLearn.js:47` | 注释里的举例 | 无 | 可不动 |
| `scripts/test-vocab.mjs:53` `[45001, 64825]` | 测试夹具（对齐 `VOCAB_BOUNDS`） | 与 vocab.js 同源，测试仍 PASS=13 | 随 vocab.js 一起改 |
| `scripts/qa-features-harness.jsx:70` `EDGES` | QA 压测用的分档边界 | 无 | 可不动 |
| `scripts/gen-phon.mjs:8`、`qa-dropdown-truncation.mjs:21`、`qa-edward-data-check.mjs:119` | 注释/日志文案 | 无 | 可不动 |

---

## 5. 测试结果（清理前基线 → 清理后）

| 命令 | 基线 | 清理后 | 结论 |
|---|---|---|---|
| `npm run validate` | IS_PASS: YES（warn 648 / error 0） | IS_PASS: YES（warn **648** / error 0） | ✅ 无变化（warn 数量也没变，说明被删词都不挂在词素上） |
| `npm run test:learning` | PASS=65 FAIL=0 | **PASS=65 FAIL=0** | ✅ |
| `npm run test:vocab` | PASS=13 FAIL=0 | **PASS=13 FAIL=0** | ✅ |
| `npm run test:graph` | PASS=18 FAIL=0 | **PASS=18 FAIL=0** | ✅ |
| `npm run test:atlas` | PASS=20 FAIL=0 | **PASS=20 FAIL=0** | ✅ |

**没有任何断言因词数变化而失败**（唯一相关的 `STATS_SCOPE` 断言已随常量同步）。

---

## 6. 构建验证

```
mv dist dist-prev-junk-$(date +%s)   # vite 会 emptyDir dist，先挪走
npm run build:skip-data
```

- 构建成功：`✓ 145 modules transformed`，`✓ built in 49.07s`，无 error。
- 产物自验（`grep -a`，快照目录 `dist-prev-1791505298`，即本次构建的产物；
  构建后有同事又把 `dist` 挪走了一次，所以按快照核对）：

| 词 | 本次产物命中数 | 清理前旧产物命中数 |
|---|---:|---:|
| `evemhing` | **0** | 1 |
| `iong` / `ieast` / `ieft` / `lnspector` / `ofhere` / `ionger` / `commited` | **0** | — |
| `slpowlcz` / `werert` / `iike` / `nder` / `iove` / `alphahff` / `subxpacio` / `aegisshi` | **0** | — |
| `momento` / `definately` / `seperate` / `accomodation` / `tommorow` / `goverment` | **0** | — |

正常词**仍在**产物中（对照组，均 >0）：

`everything` 2、`inspector` 1、`longer` 1、`left` 4、`committed` 1、`memento` 3、
`definitely` 3、`accommodation` 1、`government` 8、`separate` 22、`tomorrow` 1、
`apple` 2、`book` 4、`water` 12。

> 注：`words-data-*.js` 是 14MB 单行文件，`grep` 会按二进制处理并吞掉输出，
> 必须带 `-a`，否则会得到假阴性。

---

## 7. 改动文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `src/data/words-mono-seed.js` | 改 | 删除 102 条 A 类；头部「词数」46,513 → 46,411 |
| `src/data/synants-mono-seed.js` | 改 | 删除 15 对引用被删词的关系；头部计数同步 |
| `src/lib/derive.js` | 改 | `STATS_SCOPE` 64,825 → 64,723 + 变更说明注释 |
| `scripts/gen-mono-seed.mjs` | 改 | 新增 `JUNK_FORM_BLOCKLIST` + 通用护栏，四重拦截防复活 |
| `scripts/scan-junk-words.mjs` | 新增 | 只读扫描器（`node scripts/scan-junk-words.mjs`） |
| `scripts/purge-junk-words.mjs` | 新增 | 按行号精确删除器（幂等，支持 `--dry`） |
| `reports/junk-scan-HEAD-f05142a.json` | 新增 | HEAD 时点的 A/B 两类完整清单 |
| `reports/junk-scan.json` | 新增 | 清理后复扫（A=0，B=1397） |
| `reports/purged-junk.json` | 新增 | 实际删除明细 |
| `reports/baseline/*`、`reports/after/*` | 新增 | 5 个测试的前后对照输出 |
| `reports/junk-purge-report.md` | 新增 | 本报告 |

**未触碰**：`src/lib/learning.js`、`migrate.js`、`vocab.js`、`learnSync.js`、`syncLock.js`、
`src/lib/cloud/`、`src/App.jsx`、`src/components/`。
`src/data/phonetics.js`（11.5MB）也没动 —— 里面残留 102 条孤儿音标条目，但它不进
前端 bundle（只有离线的 `src/data/index.js` 会 import），不影响产物与统计；
如需一并清理请告知。
