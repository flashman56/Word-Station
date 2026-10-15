# 词根缺口清单（「每生成一个单词就继续找词根」）

> 由 `scripts/gen-morph-gap.mjs` 生成，**只读、不写任何数据文件**。
> 输出是**候选**，不是结论——词根必须逐词考证后写进 `src/data/words-etym-reviewed.js`。
>
> 扫描：64,699 词，其中 20,752 个「拼写上可拆但 morphs 为空」。

## 一、真缺口（词素库里没有这个构词成分）

共 **7** 个候选形态。这些是最值得优先考证的一批——
形态规则明确、语义单一，补上后能一次带动多个词的拆解。

> 已剔除 6 个**已知假缺口**：`ally`（-ly 副词后缀）、`ise`（多为借词内部拼写）、
> `sur`（与 surrender 同源，是词根非前缀）、`ture`（词根拼写变体）、`ure`/`ing`（非构词成分）。

| 候选形态 | 命中词数 | 优先级 | 示例词 |
|---|---|---|---|
| `ation` | 122 | 高（规则后缀） | `workstation` `investigation` `assassination` `starvation` `devastation` `stimulation` |
| `ical` | 32 | 高（规则后缀） | `rhetorical` `whimsical` `umbilical` `clerical` `sabbatical` `ecological` |
| `sion` | 8 | 高（规则后缀） | `explosion` `contusion` `exclusion` `implosion` `inclusion` `indecision` |
| `ition` | 5 | 高（规则后缀） | `contrition` `fruition` `perdition` `predisposition` `attrition` |
| `ution` | 2 | 高（规则后缀） | `electrocution` `redistribution` |
| `sym` | 11 | 中（需判断形态性质） | `symbols` `symptom` `sympathies` `symbolizes` `symbiote` `symbolically` |
| `counter` | 9 | 中（需判断形态性质） | `counterfeit` `counterattack` `counterfeiting` `counterparts` `countermeasures` `counterintelligence` |

## 二、拼写像但词素库已有（勿重复造词）

共 **52** 个。它们多半已经收录，只是拼写形式与词素表 form 字段不同。
这一类的正确处理是**统一 form 写法或加 variants**，而不是新建词素条目。

| 候选形态 | 命中词数 | 库内已有 | 示例词 |
|---|---|---|---|
| `ness` | 136 | `s.ness` | `business` `illness` `sickness` `witness` |
| `able` | 112 | `s.able` | `unbelievable` `understandable` `unstoppable` `unreliable` |
| `ity` | 86 | `s.ity` | `authority` `possibility` `creativity` `disability` |
| `ous` | 73 | `s.ous` | `rendezvous` `serious` `jealous` `gorgeous` |
| `ist` | 58 | `s.ist` | `revanchist` `fascist` `baptist` `stylist` |
| `ment` | 48 | `r.ment` | `garment` `payment` `appointment` `argument` |
| `ance` | 31 | `s.ance` | `reconnaissance` `advance` `insurance` `balance` |
| `ism` | 31 | `s.ism` | `irredentism` `fascism` `fauvism` `revanchism` |
| `ive` | 28 | `s.ive` | `massive` `thrive` `strive` `relive` |
| `ence` | 26 | `s.ence` | `intelligence` `presence` `defence` `commence` |
| `ible` | 12 | `s.ible` | `gullible` `incomprehensible` `unintelligible` `inadmissible` |
| `re` | 674 | `p.re` | `restaurant` `reckon` `reconnaissance` `revanche` |
| `un` | 424 | `p.un` | `undress` `unhappy` `unkind` `understand` |
| `de` | 360 | `p.de` | `decolletage` `dealer` `dessert` `definitely` |
| `ex` | 165 | `p.ex` | `extravaganza` `excuse` `exactly` `excellent` |
| `dis` | 165 | `p.dis` | `disappeared` `disease` `disappear` `discussed` |
| `pro` | 151 | `p.pro` | `profiterole` `prosciutto` `prosecco` `provolone` |
| `pre` | 100 | `p.pre` | `pregnant` `presence` `previously` `preparing` |
| `over` | 91 | `p.over` | `overskirt` `overnight` `overseas` `overtime` |
| `ful` | 71 | `s.ful` | `cheerful` `faithful` `thankful` `truthful` |
| `less` | 70 | `s.less` | `thoughtless` `restless` `thankless` `lifeless` |
| `sub` | 49 | `p.sub` | `subjects` `submitted` `substances` `submarines` |
| `inter` | 46 | `p.inter` | `intermezzo` `interesting` `interested` `interests` |
| `mis` | 46 | `p.mis` | `mistress` `mistaken` `misunderstood` `missions` |
| `trans` | 39 | `p.trans` | `transferred` `transformed` `translated` `transported` |
| `ary` | 31 | `s.ary` | `library` `unnecessary` `rosemary` `burglary` |
| `ship` | 30 | `s.ship` | `friendship` `worship` `lordship` `spaceship` |
| `ize` | 22 | `s.ize` | `baptize` `fantasize` `hypnotize` `maximize` |
| `super` | 21 | `p.super` | `superhero` `superheroes` `supervised` `superiority` |
| `ory` | 18 | `s.ory` | `history` `theory` `category` `celebratory` |
| `anti` | 15 | `p.anti` | `antiques` `antimatter` `anticipating` `antichrist` |
| `mid` | 14 | `p.mid` | `midwife` `midtown` `middleman` `midsummer` |
| `syn` | 11 | `p.syn` | `syncytial` `synagogue` `synthesizer` `synaptic` |
| `hood` | 10 | `s.hood` | `neighborhood` `neighbourhood` `brotherhood` `livelihood` |
| `ward` | 10 | `s.ward` | `awkward` `straightforward` `steward` `afterward` |
| `post` | 10 | `p.post` | `postcard` `postcards` `posterity` `posterior` |
| `multi` | 10 | `p.multi` | `multiplied` `multitasking` `multitudes` `multinationals` |
| `contra` | 9 | `p.contra` | `contractors` `contraption` `contradictions` `contracting` |
| `mal` | 9 | `p.mal` | `malignant` `malfunctioning` `mallard` `malfunctioned` |
| `epi` | 8 | `p.epi` | `episode` `episodes` `epilepsy` `epileptic` |
| `non` | 8 | `p.non` | `nonetheless` `nonstop` `nonexistent` `nonprofit` |
| `mono` | 8 | `p.mono` | `monoxide` `monotony` `monorail` `monogrammed` |
| `auto` | 7 | `p.auto` | `automatically` `autographs` `autographed` `autopsies` |
| `micro` | 6 | `p.micro` | `microwave` `microphones` `microfilm` `microwaves` |
| `bene` | 5 | `p.bene` | `benefits` `benefited` `benefactors` `beneficiaries` |
| `hypo` | 5 | `p.hypo` | `hypocrites` `hypochondriac` `hypotheses` `hypothalamus` |
| `ante` | 5 | `p.ante` | `antelope` `anterior` `antennae` `antennas` |
| `poly` | 5 | `p.poly` | `polyester` `polynomial` `polymers` `polymerase` |
| `semi` | 5 | `p.semi` | `seminars` `semifinals` `semifinal` `semiautomatic` |
| `hyper` | 3 | `p.hyper` | `hyperspace` `hyperdrive` `hyperlink` |
| `circum` | 2 | `p.circum` | `circumstances` `circumstantial` |
| `like` | 2 | `s.like` | `dislike` `lookalike` |

## 三、下一步怎么用这份清单

1. **逐词考证第一类**：对每个候选形态，查 OED/Wiktionary 确认它确实是可复用的构词成分（而非巧合同形）。
2. 确认后的词素写入 `src/data/morphemes.js`；确认后的**具体词条拆解**写入 `src/data/words-etym-reviewed.js`。
3. **第二类不要新建词素**——先看是不是 variants 漏收，这属于数据卫生问题，改起来更安全。
4. 重新跑 `npm run validate` 确认 `词素挂载冲突` 与逐词复核两道闸门仍是绿的。

> ⚠️ 红线提醒：不要因为「同词尾」就批量给一批词加同一个词根。
> 项目已实测过子串匹配的精确率只有 15–20%（每 5 个错 4 个）。
