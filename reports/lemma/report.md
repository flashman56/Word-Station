# lemma 屈折形归并 · Step-1 数据产物报告

> 生成器：`scripts/gen-lemma-map.mjs`（同输入同输出，确定性；复跑不依赖网络）。
> 红线：**不碰产品代码**（`src/` 零改动）、不 commit、不删任何词。

## 1. 方法与数据源

- 数据源：ECDICT `exchange` 字段（词典数据，非规则剥离）+ 词库 `words`（64,699 条）。
- 配对：复用 `.lemma-probe.mjs` 的双向印证逻辑
  - A（变形→原型）：本词有 `0:原型` 且原型也在词库；
  - B（基词→变形）：本词 `p:/d:/i:/s:/3:/r:/t:` 的值也在词库 → 该值→本词；
  - 每个 pair 记录 `seenA`/`seenB` 两个方向是否**各触达过 ≥1 次**（同方向重复触达**不**升级）；
  - `src = seenA && seenB ? 'AB' : seenA ? 'A' : 'B'`（仅「A∧B 真双向」才进 G2 放行）。
- 四道闸门 + 规则②（见下）决定每条落 `auto-fold` / `keep` / `audit` 三桶之一。

## 2. 闸门规则

| 闸门 | 规则 | 落桶 |
| --- | --- | --- |
| G1 目标可信 | 目标在库（配对已保证）+ kind ≠ proper + ECDICT translation 有实义（非空非占位） | 不通过→audit |
| G2 双源一致 | 仅 `src=AB` 可进 auto-fold；A-only / B-only 一律 audit | 不通过→audit |
| G3 高潮/词汇化 | `fRank < lRank && fRank ≤ 5000` 全部 audit（`highfreq-before`）；`fRank < lRank` 但 > 5000 亦 audit（`form-more-frequent`）；`fRank == lRank`（`rank-tie`）与同形异义观察名单涉及的在库对（`homograph`）一律 audit | 命中→audit |
| G4 可疑目标 | `lRank > 3×fRank && lRank > 15000` 标 `suspect-target` | 命中→audit |
| 规则② 多高频成员保留 | 族成员 = {lemma}∪{所有 form'→lemma 的行}；族内 `freqRank ≤ 2500`（=derive.js FREQ_BANDS 高频档 / AUTO_KNOWN_RANK）成员 ≥2，且本行 form 的 fRank ≤ 2500 | auto-fold→**keep**（flags += multi-highfreq） |

**auto-fold 充要条件**：G1 通过 且 G2 通过（`src=AB`）且 未命中 G3/G4 且 `fRank > lRank`（变形比原型罕见）且 未命中规则②。

**三桶语义**：`auto-fold`（安全折叠，Step-2 可直接折叠）｜ `keep`（命中规则②的多高频成员，保留不折叠）｜ `audit`（人工裁决，Step-2 不折叠）。三桶之和恒 = 记录总数。

## 3. 计数与桶分布

- 生成记录总数：**13183**
- 基线 `scripts/.lemma-pairs.json`：**13183** 对；差异 **0**（应为 0）
- `auto-fold`：**9888**（75.0%）
- `keep`（规则②，保留）：**330**（2.5%）
- `audit`：**2965**（22.5%）
- **三桶之和**：9888 + 330 + 2965 = **13183**（= 总数 13183，必须相等）
- `src` 分布：AB 12714 / B 416 / A 53
- 唯一变形词：**13138**

### 规则② 阈值敏感度（生效值 = 2500）

> 阈值 T：族内 freqRank ≤ T 的成员视为「高频」；族内高频成员 ≥2 且本行 form ≤T → keep。

| 阈值 T | keep 条数 | 是否生效 |
| --- | --- | --- |
| 1000 | 82 |  |
| 2500 | 330 | **✅ 生效** |
| 5000 | 845 |  |

### keep 桶 Top20 样本（按 form fRank 升序）

| form→lemma | fRank/lRank | type | src | flags |
| --- | --- | --- | --- | --- |
| had → have | 69/18 | pd | AB | multi-highfreq |
| been → be | 71/23 | d | AB | multi-highfreq |
| has → have | 82/18 | 3 | AB | multi-highfreq |
| thanks → thank | 152/99 | 3 | AB | multi-highfreq |
| wanted → want | 153/50 | p | AB | multi-highfreq |
| being → be | 158/23 | i | AB | multi-highfreq |
| trying → try | 190/183 | i | AB | multi-highfreq |
| killed → kill | 249/176 | d | AB | multi-highfreq |
| wants → want | 256/50 | 3 | AB | multi-highfreq |
| having → have | 262/18 | i | AB | multi-highfreq |
| minutes → minute | 292/274 | s | AB | multi-highfreq |
| waiting → wait | 315/121 | i | AB | multi-highfreq |
| started → start | 326/310 | p | AB | multi-highfreq |
| met → meet | 346/229 | p | AB | multi-highfreq |
| tried → try | 362/183 | pd | AB | multi-highfreq |
| needs → need | 375/80 | s | AB | multi-highfreq |
| happens → happen | 428/279 | 3 | AB | multi-highfreq |
| meeting → meet | 439/229 | i | AB | multi-highfreq |
| others → other | 441/120 | s | AB | multi-highfreq |
| loved → love | 472/330 | p | AB | multi-highfreq |

### flags 分布

| flag | 条数 |
| --- | --- |
| form-more-frequent | 1494 |
| highfreq-before | 815 |
| src-b-only | 416 |
| multi-highfreq | 330 |
| lemma-proper | 233 |
| lemma-no-gloss | 144 |
| homograph | 116 |
| suspect-target | 75 |
| src-a-only | 53 |
| rank-tie | 2 |

### type 分布（全部 11 类，合计 13183）

| type | 条数 |
| --- | --- |
| s | 5985 |
| i | 2809 |
| d | 1805 |
| p | 1190 |
| 3 | 939 |
| r | 169 |
| t | 125 |
| dp | 72 |
| pd | 51 |
| s3 | 33 |
| 3s | 5 |

## 4. 硬案例落桶表

| 词 | form→lemma | fRank/lRank | type | src | bucket | flags |
| --- | --- | --- | --- | --- | --- | --- |
| shelves | shelves → shelf | 9813/4893 | s | AB | **audit** | homograph |
| shelves | shelves → shelve | 9813/47466 | 3 | B | **audit** | src-b-only, form-more-frequent, homograph, suspect-target |
| honored | honored → honor | 3735/589 | p | B | **audit** | src-b-only, homograph |
| honored | honored → honore | 3735/34938 | pd | A | **audit** | lemma-proper, lemma-no-gloss, src-a-only, highfreq-before, homograph, suspect-target |
| sled | sled → sle | 8352/45315 | p | AB | **audit** | form-more-frequent, suspect-target |
| sled | sledding → sled | 35780/8352 | i | AB | **auto-fold** | - |
| saw | saw → see | 8337/1720 | p | AB | **audit** | homograph |
| saw | sawing → saw | 19181/8337 | i | AB | **audit** | homograph |
| saw | saws → saw | 26186/8337 | s | AB | **audit** | homograph |
| saw | sawed → saw | 25119/8337 | p | AB | **audit** | homograph |
| rose | rose → rise | 4659/5757 | p | AB | **audit** | highfreq-before, homograph |
| rose | roses → rose | 3252/4659 | s | AB | **audit** | highfreq-before, homograph |
| means | means → mean | 294/5496 | 3 | AB | **audit** | highfreq-before, homograph |
| better | better → good | 130/270 | r | AB | **audit** | highfreq-before, homograph |
| better | betters → better | 36478/130 | s | AB | **audit** | homograph |
| lay | laid → lay | 1651/949 | dp | AB | **audit** | homograph |
| lay | lay → lie | 949/5328 | p | AB | **audit** | highfreq-before, homograph |
| lay | laying → lay | 3568/949 | i | AB | **audit** | homograph |
| lay | lays → lay | 9125/949 | 3 | AB | **audit** | homograph |
| left | left → leave | 161/8109 | d | AB | **audit** | highfreq-before, homograph |
| found | found → find | 178/1740 | d | AB | **audit** | highfreq-before, homograph |
| found | founded → found | 6710/178 | d | AB | **audit** | homograph |
| found | founding → found | 10736/178 | i | AB | **audit** | homograph |
| bound | bound → bind | 2084/5214 | d | AB | **audit** | highfreq-before, homograph |
| bound | bounds → bound | 9767/2084 | s | AB | **audit** | homograph |
| bound | bounded → bound | 41025/2084 | d | AB | **audit** | homograph |
| blown | blown → blow | 2502/8034 | d | AB | **audit** | highfreq-before |
| headphones | headphones → headphone | 9872/45180 | s | AB | **audit** | form-more-frequent, suspect-target |
| headphone | headphones → headphone | 9872/45180 | s | AB | **audit** | form-more-frequent, suspect-target |
| footsteps | footsteps → footstep | 2326/39507 | s | AB | **audit** | highfreq-before, suspect-target |
| footstep | footsteps → footstep | 2326/39507 | s | AB | **audit** | highfreq-before, suspect-target |
| according | according → accord | 841/11415 | i | AB | **audit** | highfreq-before |
| amazing | amazing → amaze | 491/13208 | i | B | **audit** | src-b-only, highfreq-before |
| advanced | advanced → advance | 3229/8145 | d | AB | **audit** | highfreq-before |
| accused | accused → accuse | 2088/4864 | d | AB | **audit** | highfreq-before |
| arms | arms → arm | 774/1240 | s | AB | **audit** | highfreq-before |
| aliens | aliens → alien | 3296/12200 | s | AB | **audit** | highfreq-before |

## 5. 同族 ≥2 高频成员统计

> 口径：以 lemma 为族核，成员 = {lemma} ∪ {f : f→lemma}；成员 `freqRank ≤ 5000` 视为高频（此为 Step-1 统计口径）。
> 注：规则②的**生效阈值**为 `2500`（见 §3），本节 `5000` 仅用于「多高频成员族」规模统计。

- 族总数（以 lemma 计）：**8438**
- **同族 ≥2 高频成员（双方 fRank ≤ 5000）的族数：916**

Top 20（按族内最高频成员 rank 升序）：

| lemma | 族内高频成员（rank） |
| --- | --- |
| be | is(8), was(20), be(23), were(67), been(71), being(158) |
| have | have(18), had(69), has(82), having(262) |
| can | can(26), could(77) |
| like | like(35), liked(690), likes(700), liking(4835) |
| one | one(45), ones(492) |
| get | got(49), getting(180), gets(340) |
| want | want(50), wanted(153), wants(256), wanting(1921) |
| do | did(52), doing(104), does(136), done(148), do(1850) |
| let | let(56), letting(1147), lets(2062) |
| go | going(60), went(184), gone(236), goes(330), go(1810) |
| need | need(80), needs(375), needed(495), needing(4815) |
| way | way(85), ways(853) |
| please | please(94), pleased(1452) |
| say | said(96), saying(238), says(257), say(1860) |
| thank | thank(99), thanks(152) |
| big | big(100), bigger(843), biggest(1044) |
| even | even(102), evening(1030) |
| small | small(110), smaller(2500) |
| god | god(113), gods(1616) |
| large | large(120), largest(3201), larger(3413) |

## 6. 复跑与确定性

```bash
node scripts/gen-lemma-map.mjs
```

产物：`scripts/.lemma-map.draft.json`、`reports/lemma/audit.csv`、`reports/lemma/audit.md`、`reports/lemma/report.md`。
同一输入连续两次运行，MD5 一致（见回报）。

