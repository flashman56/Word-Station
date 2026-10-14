# 新手队列 loan 词 · 构词拆解候选清单

> 脚本 `scripts/gen-loan-candidates.mjs` · 生成于 2026-10-13T15:55:42.087Z

## 汇总

| 档位 | 数量 | 含义 |
|---|---|---|
| **high** | 6 | 含至少一个源自词素表的**真词根**，语义吻合，拼接校验通过 |
| **low** | 102 | 只认出了前缀/后缀（词干整体借入写 null）或仅屈折，结构正确但词根仍是空白 |
| **none** | 436 | 不可拆解 / 无把握，见下方不可拆清单 |

口径：新手队列（freqRank>2500、去折叠形）前 3000 词中「无 chain」的 2243 个词，按 kind 分 {"mono":1101,"loan":544,"proper":558,"phrase":40}；本次取其中 `kind==='loan'` 的 **544** 个。

本次 API 花费 ≈ $0。

### 出报告前的人工复核（逐条，附理由）

| 处理 | 内容 |
|---|---|
| wailing | 形态补全 wail + s.ing |
| pajamas | 形态补全 pajama + s.plural |
| humor | → low（humor 走的是拉丁 hūmor「体液、湿气」→ 中世纪四体液说 → 心情 → 幽默，而词素表 r.hum 的义项是「土；人」，中间隔着好几层且“土/人”解释不了现代义，降为 low 供人工判断。） |
| pockets | 形态补全 pocket + s.plural |
| chanting | 形态补全 chant + s.ing |
| ancestors | 形态补全 ancestor + s.plural |
| fried | 形态补全 fri + s.ed |
| rumors | 形态补全 rumor + s.plural |
| november | → none（November 来自拉丁 novem（九，罗马历第九月），与词素表 r.nov（novus「新」）同形而不同源 —— 教员要是按 nov(新) 讲十一月就是教错，故踢出候选。） |
| dining | 形态补全 din + s.ing |
| francs | 形态补全 franc + s.plural |
| euros | 形态补全 euro + s.plural |
| rolls | 形态补全 roll + s.plural |
| jewels | 形态补全 jewel + s.plural |
| chimes | 形态补全 chime + s.plural |
| bowling | 形态补全 bowl + s.ing |
| buttons | 形态补全 button + s.plural |
| jeans | 形态补全 jean + s.plural |
| murmuring | 形态补全 murmur + s.ing |
| residents | 形态补全 resident + s.plural |
| meds | 形态补全 med + s.plural |
| bandits | 形态补全 bandit + s.plural |
| zombies | 形态补全 zombie + s.plural |

### 不可拆原因分布

| 原因 | 数量 |
|---|---|
| 整体借入词 | 262 |
| 日耳曼/古英语基本词 | 64 |
| 来源不明 | 41 |
| 疑似脏数据 | 21 |
| 整体借入 / 无可用词素 | 21 |
| 专有名词派生 | 13 |
| 代码校验拦截 | 12 |
| 非单词形 | 1 |
| 人工复核纠偏 | 1 |

---

## high（6 条）

| # | 词 | freq | 释义 | 建议 chain | morphHints | 词源依据 | 备注 |
|---|---|---|---|---|---|---|---|
| 1 | obsessed | 3073 | 着迷的；困扰的 | ob[p.ob] + sess[r.sess] + ed[s.ed] | p.ob r.sess s.ed | 拉丁 ob-（对着）+ sedere（坐）→ obsidere（围困）→ obsess + -ed | 含屈折后缀、未折叠屈折形(词干 obsess) |
| 2 | honored | 3735 | 尊敬；给…荣誉（honor 的过去式） | honor[r.honor] + ed[s.ed] | r.honor s.ed | 拉丁 honor + -ed | 含屈折后缀、未折叠屈折形(词干 honor) |
| 3 | mature | 4154 | 成熟的；成年的 | matur[r.matur] + e[null] | r.matur | 拉丁 maturus(成熟的)，经法语借入；含清单词根 r.matur |  |
| 4 | equally | 4708 | 同样地；平等地 | equ[r.equ] + al[s.al] + ly[s.ly] | r.equ s.al s.ly | 拉丁 aequalis(相等) + -ly |  |
| 5 | counted | 5183 | 数；计算；认为 | count[r.count] + ed[s.ed] | r.count s.ed | 拉丁 computare → 古法语 conter + -ed | 含屈折后缀、未折叠屈折形(词干 count) |
| 6 | execute | 5221 | 执行；处决 | ex[p.ex] + ecut[r.sequ] + e[null] | p.ex r.sequ | 拉丁 ex-（向外）+ sequi（跟随）→ exsequi（跟到底、执行） |  |

## low（102 条）

| # | 词 | freq | 释义 | 建议 chain | morphHints | 词源依据 | 备注 |
|---|---|---|---|---|---|---|---|
| 1 | cleared | 2505 | 清除（clear 的过去式） | clear[null] + ed[s.ed] | s.ed | clear(拉丁 clarus 明亮) + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 clear) |
| 2 | developed | 2536 | 发展；开发（过去式） | develop[null] + ed[s.ed] | s.ed | develop(法语 développer) + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 develop) |
| 3 | annoying | 2579 | 烦人的；讨厌的 | annoy[null] + ing[s.ing] | s.ing | 古法语 anuier（使厌烦）+ -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 annoy) |
| 4 | traveling | 2628 | 旅行（现在分词，美式） | travel[null] + ing[s.ing] | s.ing | 古法语 travailler（劳作、旅行）+ -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 travel) |
| 5 | relief | 2632 | 宽慰；救济 | re[p.re] + lief[null] | p.re | 古法语 relief，源自拉丁 relevare（re- 再 + lev 举起） | 词干未拆解 |
| 6 | lessons | 2638 | 课；教训（复数） | lesson[null] + s[s.plural] | s.plural | 古法语 leçon，源自拉丁 lectio（读）+ -s 复数 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 lesson) |
| 7 | sets | 2640 | 套；集合（复数） | set[null] + s[s.plural] | s.plural | 古英语 settan 的第三人称单数/复数，仅屈折后缀 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 set) |
| 8 | classes | 2650 | 班级；课程（复数） | class[null] + es[s.plural] | s.plural | 拉丁 classis + 复数 -es，仅屈折 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 class) |
| 9 | wailing | 2662 | 哀号；恸哭（现在分词） | wail[null] + ing[s.ing] | s.ing | 形态学确定：本词是词库中「wail」的现在分词形式 | 形态补全、未折叠屈折形(词干 wail) |
| 10 | pays | 2718 | 支付；值得 | pay[null] + s[s.plural] | s.plural | 拉丁 pacare（安抚、支付）→ pay + 第三人称单数 -s，仅屈折 | 仅屈折、含屈折后缀、词干未拆解 |
| 11 | furniture | 2777 | 家具 | furnit[null] + ure[s.ure] | s.ure | 法语 fourniture，源自 fournir(供应) + -ure | 词干未拆解 |
| 12 | engineer | 2781 | 工程师 | engine[null] + er[s.er] | s.er | 古法语 engigneor，源自拉丁 ingenium(天赋) + -arius | 词干未拆解 |
| 13 | schools | 2782 | 学校（复数） | school[null] + s[s.plural] | s.plural | 拉丁 schola + 复数屈折 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 school) |
| 14 | fascinating | 2795 | 迷人的；极有趣的 | fascinat[null] + ing[s.ing] | s.ing | 拉丁 fascinare(施魔法) + -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 fascinate) |
| 15 | obey | 2830 | 服从；遵守 | ob[p.ob] + ey[null] | p.ob | 拉丁 oboedire = ob-(朝向) + audire(听) | 词干未拆解 |
| 16 | talented | 2890 | 有才能的；有天赋的 | talent[null] + ed[s.ed] | s.ed | talent（希腊 talanton 天平、才能，整体借入）+ -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 talent) |
| 17 | painted | 2896 | 画；涂（paint的过去式） | paint[null] + ed[s.ed] | s.ed | 古法语 peint (paint) + -ed，paint 源自拉丁 pingere(画) | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 paint) |
| 18 | dressing | 2905 | 调料；敷料；穿衣 | dress[null] + ing[s.ing] | s.ing | 古法语 dresser(安排) + -ing，dress 源自拉丁 directus | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 dress) |
| 19 | pajamas | 2936 | 睡衣 | pajama[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「pajama」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 pajama) |
| 20 | plates | 2961 | 盘子；板（plate的复数） | plate[null] + s[s.plural] | s.plural | 拉丁 plata（薄板）经古法语 plate 借入 + 英语复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 plat) |
| 21 | counts | 2966 | 数；计算；重要（count的第三人称单数） | count[null] + s[s.plural] | s.plural | 拉丁 computare（计算）经古法语 conter 借入 + 第三人称单数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 count) |
| 22 | colleague | 2968 | 同事；同僚 | col[p.con] + league[null] | p.con | 拉丁 collega = col-(共同) + legare(委派) | 词干未拆解 |
| 23 | pages | 2999 | 页；页面（page的复数） | page[null] + s[s.plural] | s.plural | 拉丁 pagina(页) → page + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 page) |
| 24 | cookies | 3032 | 饼干（复数） | cookie[null] + s[s.plural] | s.plural | 荷兰语 koekje(小蛋糕) → 英语 cookie + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 cookie) |
| 25 | potatoes | 3049 | 土豆（复数） | potato[null] + es[s.plural] | s.plural | 西班牙语 patata → 英语 potato + -es | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 potato) |
| 26 | poetry | 3054 | 诗歌 | poet[null] + ry[s.ery] | s.ery | 希腊 poiein(制作) → 拉丁 poeta → 古法语 poete → 英语 poet + -ry | 词干未拆解 |
| 27 | entering | 3132 | 进入 | enter[null] + ing[s.ing] | s.ing | enter(拉丁 intrare) + -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 enter) |
| 28 | humor | 3168 | 幽默；心情 | hum[r.hum] + or[s.er] | r.hum s.er | 拉丁 humor(体液、湿气) | 人工复核降级 |
| 29 | betray | 3174 | 背叛；出卖 | be[p.be] + tray[null] | p.be | 中古英语 betrayen < be- + 古法语 trair(背叛) < 拉丁 tradere(交出) | 词干未拆解 |
| 30 | delighted | 3182 | 高兴的；愉快的 | de[p.de] + light[null] + ed[s.ed] | p.de s.ed | 拉丁 delectare(愉悦) → 古法语 delit + -ed | 含屈折后缀、词干未拆解、未折叠屈折形(词干 delight) |
| 31 | advanced | 3229 | 先进的；高级的 | advanc[null] + ed[s.ed] | s.ed | 法语 avancer（前进）+ -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 advance) |
| 32 | contrary | 3251 | 相反的 | contra[p.contra] + ry[s.ary] | p.contra s.ary | 拉丁 contra(相反) + -arius → 英语 contrary | 词干未拆解 |
| 33 | roses | 3252 | 玫瑰（复数） | ros[null] + es[s.plural] | s.plural | 拉丁 rosa(玫瑰) + 英语复数 -es | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 ros) |
| 34 | pockets | 3272 | 口袋（复数） | pocket[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「pocket」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 pocket) |
| 35 | gently | 3311 | 温柔地；轻轻地 | gent[null] + ly[s.ly] | s.ly | 拉丁 gentilis(出身好的) → 古法语 gentil + -ly | 词干未拆解 |
| 36 | chanting | 3343 | 吟唱；诵经 | chant[null] + ing[s.ing] | s.ing | 形态学确定：本词是词库中「chant」的现在分词形式 | 形态补全、未折叠屈折形(词干 chant) |
| 37 | ancestors | 3354 | 祖先；祖宗 | ancestor[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「ancestor」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 ancestor) |
| 38 | fried | 3358 | 油炸的；煎的 | fri[null] + ed[s.ed] | s.ed | 形态学确定：本词是词库中「fri」的过去式/过去分词形式 | 形态补全、未折叠屈折形(词干 fri) |
| 39 | rumors | 3392 | 谣言；传闻（复数） | rumor[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「rumor」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 rumor) |
| 40 | elements | 3566 | 元素；要素 | element[null] + s[s.plural] | s.plural | 拉丁 elementum（元素）+ 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 element) |
| 41 | cocaine | 3571 | 可卡因 | coca[null] + ine[s.ine] | s.ine | 西班牙语 coca + -ina（化学后缀 -ine） | 词干未拆解 |
| 42 | symptoms | 3694 | 症状（复数） | symptom[null] + s[s.plural] | s.plural | 希腊 symptoma（发生的事、症状）→ 拉丁 symptoma，含复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 symptom) |
| 43 | dining | 3758 | 用餐；进餐 | din[null] + ing[s.ing] | s.ing | 形态学确定：本词是词库中「din」的现在分词形式 | 形态补全、未折叠屈折形(词干 din) |
| 44 | models | 3775 | 模型；模特（model 的复数） | model[null] + s[s.plural] | s.plural | 拉丁 modulus(尺度) → model + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 model) |
| 45 | arriving | 3796 | 到达；抵达（arrive 的现在分词） | arriv[null] + ing[s.ing] | s.ing | 拉丁 ad- + ripa(岸) → 古法语 ariver → arrive + -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 arrive) |
| 46 | candles | 3848 | 蜡烛 | candle[null] + s[s.plural] | s.plural | 拉丁 candela(蜡烛) → candle + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 candle) |
| 47 | francs | 3871 | 法郎（货币） | franc[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「franc」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 franc) |
| 48 | doubts | 3902 | 怀疑；疑虑 | doubt[null] + s[s.plural] | s.plural | 拉丁 dubitare → doubt + -s（第三人称单数/复数） | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 doubt) |
| 49 | established | 3907 | 已确立的；著名的 | establish[null] + ed[s.ed] | s.ed | 拉丁 stabilire → establish + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 establish) |
| 50 | dresses | 3949 | 连衣裙；服装 | dress[null] + es[s.plural] | s.plural | 古法语 dresser + -es（复数） | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 dress) |
| 51 | chased | 3983 | 追逐（过去式） | chas[null] + ed[s.ed] | s.ed | 古法语 chacier + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 chas) |
| 52 | funds | 4006 | 资金；基金 | fund[null] + s[s.plural] | s.plural | 拉丁 fundus(底、基础) → fund + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 fund) |
| 53 | euros | 4029 | 欧元（复数） | euro[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「euro」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 euro) |
| 54 | rolls | 4032 | 卷；面包卷（复数） | roll[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「roll」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 roll) |
| 55 | muscles | 4044 | 肌肉（复数） | muscle[null] + s[s.plural] | s.plural | 拉丁 musculus（小老鼠，肌肉）+ 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 muscle) |
| 56 | coins | 4090 | 硬币（复数） | coin[null] + s[s.plural] | s.plural | 拉丁 cuneus（楔子）→ 古法语 coin + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 coin) |
| 57 | beers | 4104 | 啤酒（复数） | beer[null] + s[s.plural] | s.plural | 古英语 beor + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 beer) |
| 58 | debts | 4142 | 债务；欠款（复数） | debt[null] + s[s.plural] | s.plural | 拉丁 debitum(欠) → debt + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 debt) |
| 59 | prices | 4231 | 价格（复数） | price[null] + s[s.plural] | s.plural | 拉丁 pretium(价格) → price + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 price) |
| 60 | cured | 4244 | 治愈（过去式） | cur[null] + ed[s.ed] | s.ed | 拉丁 curare(照料、治疗) → cure + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 cur) |
| 61 | jewels | 4258 | 珠宝；宝石（复数） | jewel[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「jewel」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 jewel) |
| 62 | domestic | 4266 | 国内的；家庭的 | domest[null] + ic[s.ic] | s.ic | 拉丁 domus(家) + -estic | 词干未拆解 |
| 63 | chimes | 4310 | 钟声；风铃（复数） | chime[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「chime」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 chime) |
| 64 | bowling | 4313 | 保龄球运动 | bowl[null] + ing[s.ing] | s.ing | 形态学确定：本词是词库中「bowl」的现在分词形式 | 形态补全、未折叠屈折形(词干 bowl) |
| 65 | buttons | 4314 | 纽扣；按钮（复数） | button[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「button」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 button) |
| 66 | ruining | 4318 | 毁坏；破坏 | ruin[null] + ing[s.ing] | s.ing | 拉丁 ruina（崩塌）→ 古法语 ruine → 英语 ruin + -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 ruin) |
| 67 | jeans | 4399 | 牛仔裤 | jean[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「jean」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 jean) |
| 68 | murmuring | 4400 | 低声说；喃喃（现在分词） | murmur[null] + ing[s.ing] | s.ing | 形态学确定：本词是词库中「murmur」的现在分词形式 | 形态补全、未折叠屈折形(词干 murmur) |
| 69 | customs | 4451 | 海关；习俗（复数） | custom[null] + s[s.plural] | s.plural | 拉丁 consuetudo → 古法语 custume + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 custom) |
| 70 | rolled | 4462 | 滚动；卷（过去式） | roll[null] + ed[s.ed] | s.ed | 古法语 roler → roll + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 roll) |
| 71 | regards | 4504 | 问候；致意 | regard[null] + s[s.plural] | s.plural | 古法语 regarder（re- + garder 看） + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 regard) |
| 72 | carries | 4516 | 携带；搬运 | carrie[null] + s[s.plural] | s.plural | 拉丁 carrus(车) → 古北法 carry + -s(第三人称单数) | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 carrie) |
| 73 | qualified | 4549 | 合格的；有资格的 | qualifi[null] + ed[s.ed] | s.ed | 拉丁 qualis(何种) → qualify + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 qualify) |
| 74 | occupied | 4563 | 被占用的；忙碌的 | occupi[null] + ed[s.ed] | s.ed | 拉丁 occupare(抓住、占据) + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 occupy) |
| 75 | traveled | 4586 | 旅行（travel 的过去式） | travel[null] + ed[s.ed] | s.ed | 古法语 travailler(劳作、旅行) + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 travel) |
| 76 | canceled | 4597 | 取消（cancel 的过去式，美式拼写） | cancel[null] + ed[s.ed] | s.ed | 拉丁 cancellare（画格线划掉）→ cancel + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 cancel) |
| 77 | sexually | 4682 | 在性方面 | sexu[null] + al[s.al] + ly[s.ly] | s.al s.ly | 拉丁 sexus(性别) + -al + -ly | 词干未拆解 |
| 78 | rupees | 4730 | 卢比（复数） | rupee[null] + s[s.plural] | s.plural | 梵语 rūpya(银币) → 印地语 rupayā → 英语 rupee + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 rupee) |
| 79 | classified | 4778 | 机密的；分类的 | classifi[null] + ed[s.ed] | s.ed | 拉丁 classis(类别) + facere(做) → classify + -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 classify) |
| 80 | measures | 4780 | 措施；量度 | measure[null] + s[s.plural] | s.plural | 拉丁 mensura(测量) → 古法语 mesure → 英语 measure + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 measure) |
| 81 | races | 4896 | 比赛；种族 | race[null] + s[s.plural] | s.plural | 古法语 race + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 rac) |
| 82 | billions | 4962 | 数十亿；大量 | billion[null] + s[s.plural] | s.plural | 法语 billion + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 billion) |
| 83 | noodles | 4966 | 面条（复数） | noodle[null] + s[s.plural] | s.plural | 德语 Nudel + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 noodle) |
| 84 | charging | 4973 | 充电；收费（现在分词） | charg[null] + ing[s.ing] | s.ing | 古法语 chargier + -ing | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 charge) |
| 85 | touches | 4988 | 触摸；感动（第三人称单数） | touch[null] + es[s.plural] | s.plural | 古法语 tochier + 第三人称单数 -es | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 touch) |
| 86 | features | 5021 | 特征；面貌（复数） | feature[null] + s[s.plural] | s.plural | 拉丁 factura（制作）→ 古法语 faiture → feature + -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 feature) |
| 87 | residents | 5027 | 居民；住户（复数） | resident[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「resident」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 resident) |
| 88 | amusing | 5068 | 有趣的；逗人笑的 | amus[null] + ing[s.ing] | s.ing | amuse(使发笑) + -ing，仅屈折/派生后缀 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 amuse) |
| 89 | profits | 5162 | 利润；收益 | profit[null] + s[s.plural] | s.plural | 拉丁 profectus（进展、收益）→ 古法语 profit + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 profit) |
| 90 | adore | 5217 | 热爱；崇拜 | ad[p.ad] + ore[null] | p.ad | 拉丁 ad- + orare(说、祈祷) | 词干未拆解 |
| 91 | meds | 5240 | 药物（口语） | med[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「med」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 med) |
| 92 | assets | 5246 | 资产；优点 | asset[null] + s[s.plural] | s.plural | 盎格鲁-法语 asetz（足够），源自拉丁 ad satis（足够），词尾 -s 为复数屈折 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 asset) |
| 93 | veins | 5275 | 静脉；纹理 | vein[null] + s[s.plural] | s.plural | 拉丁 vena（血管）经古法语 veine 借入，词尾 -s 为复数屈折 | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 vein) |
| 94 | razor | 5281 | 剃刀；刮胡刀 | raz[null] + or[s.or] | s.or | 古法语 rasor < 拉丁 radere(刮、擦) + -or | 词干未拆解 |
| 95 | cardinal | 5326 | 主要的；基本的 | cardin[null] + al[s.al] | s.al | 拉丁 cardinalis < cardo(铰链、关键) + -alis | 词干未拆解 |
| 96 | pains | 5340 | 疼痛；辛劳 | pain[null] + s[s.plural] | s.plural | 拉丁 poena(惩罚、痛苦) → 古法语 peine → pain + 复数 -s | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 pain) |
| 97 | tasted | 5355 | 品尝（过去式） | tast[null] + ed[s.ed] | s.ed | 古法语 taster(触摸、品尝) → taste + 过去式 -ed | 仅屈折、含屈折后缀、词干未拆解、未折叠屈折形(词干 taste) |
| 98 | mechanic | 5368 | 机械师；技工 | mechan[null] + ic[s.ic] | s.ic | 希腊 mēkhanē(机械、装置) → 拉丁 mechanicus → mechanic | 词干未拆解 |
| 99 | bandits | 5423 | 强盗；土匪（复数） | bandit[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「bandit」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 bandit) |
| 100 | zombies | 5425 | 僵尸（复数） | zombie[null] + s[s.plural] | s.plural | 形态学确定：本词是词库中「zombie」的复数/第三人称单数形式 | 形态补全、未折叠屈折形(词干 zombie) |
| 101 | epic | 5432 | 史诗般的；宏大的 | ep[null] + ic[s.ic] | s.ic | 希腊 epos（言词、歌）+ -ic | 词干未拆解 |
| 102 | prophet | 5437 | 先知；预言家 | pro[p.pro] + phet[null] | p.pro | 希腊 pro-（在前）+ phanai（说）→ prophetes（代言人） | 词干未拆解 |

## none（不可拆 436 条）

| # | 词 | freq | 释义 | 不可拆原因（分类） | 依据 |
|---|---|---|---|---|---|
| 1 | booth | 2503 | 亭；摊位 | 日耳曼/古英语基本词 | 中古英语 bothe，源自北欧语，日耳曼基本词｜日耳曼基本词，无清单词素 |
| 2 | pour | 2504 | 倒；灌 | 日耳曼/古英语基本词 | 中古英语 pouren，来源不明｜来源不明/日耳曼基本词 |
| 3 | le | 2513 | 乐（音译用字） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2513 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 4 | bishop | 2518 | 主教 | 日耳曼/古英语基本词 | 古英语 bisceop，源自希腊 episkopos，但已整体借入且拼写不可切｜整体借入词，拼写无法逐字母切分 |
| 5 | favourite | 2539 | 最喜爱的（英式） | 整体借入词 | 拉丁 favere(喜爱) → 法语 favorit，整体借入｜整体借入词，-ite 非清单后缀 |
| 6 | paradise | 2550 | 天堂；乐园 | 整体借入词 | 希腊 paradeisos → 古法语 paradis，整体借入｜整体借入词，无清单词素 |
| 7 | exam | 2555 | 考试；测验 | 整体借入词 | examination 的缩略形式，整体借入｜缩略词，无清单词素 |
| 8 | fairy | 2557 | 仙女；小精灵 | 整体借入词 | 古法语 faerie，源自拉丁 fata(命运)，整体借入｜整体借入词，-y 非清单后缀 |
| 9 | sample | 2573 | 样品；样本 | 代码校验拦截 | 拉丁 exemplum → 古法语 essample，词源上含拉丁 s.able 同源后缀 -able（可…的）｜sample 整体借入，仅词尾 -ple 对应 -able 变体，词干 null |
| 10 | tattoo | 2593 | 纹身；刺青 | 整体借入词 | 波利尼西亚语 tatau，经航海者借入英语｜整体借入词，来源为波利尼西亚语，无清单词素 |
| 11 | st | 2600 | 街（street 缩写） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2600 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 12 | colour | 2620 | 颜色（英式） | 整体借入词 | 古法语 colour，源自拉丁 color，整体借入｜整体借入词，清单无对应词根 |
| 13 | pope | 2621 | 教皇 | 日耳曼/古英语基本词 | 古英语 pāpa，源自拉丁 papa，整体借入｜整体借入词，清单无对应词根 |
| 14 | patrol | 2635 | 巡逻；巡逻队 | 来源不明 | 法语 patrouille，源自 patrouiller（踩水、巡逻），来源不明｜整体借入词，来源不明，清单无对应词根 |
| 15 | ad | 2642 | 广告（缩写） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2642 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 16 | auntie | 2646 | 阿姨（昵称） | 日耳曼/古英语基本词 | aunt（拉丁 amita）+ -ie 昵称后缀，-ie 不在清单｜日耳曼/整体借入词干 + 清单外后缀 |
| 17 | ii | 2717 | 二（罗马数字） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2717 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 18 | ex | 2724 | 前任；前配偶 | 疑似脏数据 | 词长 2 个字母，且 freqRank 2724 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 19 | theatre | 2725 | 剧院；戏剧 | 整体借入词 | 希腊 theatron（观看场所），整体借入｜整体借入词，清单无对应词根 |
| 20 | chaos | 2727 | 混乱 | 整体借入词 | 希腊 khaos（混沌），整体借入｜整体借入词，清单无对应词根 |
| 21 | rocket | 2728 | 火箭 | 日耳曼/古英语基本词 | 意大利 rocchetto（线轴），源自日耳曼语 rocco（纺线），非拉丁/希腊词素｜整体借入词，来源为意大利语/日耳曼语，清单无对应词素 |
| 22 | sushi | 2728 | 寿司 | 整体借入词 | 日语 すし（寿司），借自日语｜日语借词，非拉丁/希腊/法语词素构成 |
| 23 | tsunami | 2736 | 海啸 | 整体借入词 | 日语 津波（つなみ），借自日语｜日语借词，非拉丁/希腊/法语词素构成 |
| 24 | karaoke | 2744 | 卡拉 OK | 整体借入词 | 日语 カラオケ，借自日语｜日语借词，非拉丁/希腊/法语词素构成 |
| 25 | tragedy | 2745 | 悲剧；惨事 | 整体借入词 | 希腊 tragōidia（山羊歌），tragos(山羊) + ōidē(歌)；英语中 -edy 段无清单词素｜整体借入希腊词，清单无对应词根，仅能标 null |
| 26 | piano | 2760 | 钢琴 | 整体借入词 | 意大利 pianoforte（弱-强），piano(弱) + forte(强)，借自意大利语｜意大利语借词，清单无对应词素 |
| 27 | escort | 2766 | 护送；陪同 | 日耳曼/古英语基本词 | 法语 escorte，源自意大利 scorta，来源为日耳曼语｜整体借入词，来源为意大利/日耳曼语，清单无对应词素 |
| 28 | cafe | 2768 | 咖啡馆 | 整体借入词 | 法语 café，源自意大利 caffè，借自土耳其 kahve｜整体借入词，来源为土耳其/阿拉伯语，清单无对应词素 |
| 29 | scale | 2769 | 规模；刻度；鳞片 | 整体借入词 | 拉丁 scala（梯子、台阶），整体借入，清单无对应词根｜整体借入拉丁词，清单无对应词素 |
| 30 | academy | 2774 | 学院；研究院 | 专有名词派生 | 希腊 Akadēmeia（柏拉图学园，源自地名/英雄名 Akademos）｜专有名词派生，清单无对应词素 |
| 31 | kindergarten | 2776 | 幼儿园 | 整体借入词 | 德语借入词：Kinder(儿童) + Garten(花园)，非拉丁/希腊词素｜整体借入的德语复合词，清单无对应词素 |
| 32 | ketchup | 2784 | 番茄酱 | 来源不明 | 源自汉语/马来语借入词，来源不明｜整体借入词，无清单词素 |
| 33 | algebra | 2792 | 代数 | 整体借入词 | 阿拉伯语 al-jabr 借入词｜整体借入的阿拉伯语词，无清单词素 |
| 34 | chamber | 2796 | 房间；会议厅 | 整体借入词 | 古法语 chambre，源自拉丁 camera，整体借入｜整体借入词，无清单词素可切 |
| 35 | romance | 2798 | 浪漫；爱情故事 | 整体借入词 | 古法语 romanz，源自拉丁 romanice，整体借入｜整体借入词，无清单词素可切 |
| 36 | coffee | 2800 | 咖啡 | 整体借入词 | 源自阿拉伯语 qahwa 经土耳其语借入｜整体借入词，无清单词素 |
| 37 | yogurt | 2808 | 酸奶 | 整体借入词 | 源自土耳其语 yoğurt，整体借入｜整体借入词，清单无对应词素 |
| 38 | sauna | 2816 | 桑拿浴 | 整体借入词 | 源自芬兰语 sauna，整体借入｜整体借入词，清单无对应词素 |
| 39 | jazz | 2824 | 爵士乐 | 来源不明 | 20世纪初美国英语，来源不明｜来源不明的基本词 |
| 40 | robot | 2824 | 机器人 | 整体借入词 | 源自捷克语 robota(劳役)，由 Čapek 造词，整体借入｜整体借入词，清单无对应词素 |
| 41 | july | 2825 | 七月 | 整体借入词 | 拉丁 Julius(凯撒名) → 古法语 jule，专有名词派生｜专有名词派生，清单无对应词素 |
| 42 | pizza | 2832 | 比萨饼 | 整体借入词 | 源自意大利语 pizza，整体借入｜整体借入词，清单无对应词素 |
| 43 | moron | 2834 | 傻瓜；笨蛋 | 整体借入词 | 源自希腊 moros(愚笨)，由 Goddard 1908 年借入，整体借入｜整体借入词，清单无对应词素 |
| 44 | soprano | 2840 | 女高音；最高声部 | 整体借入词 | 意大利 soprano，源自拉丁 supra(在上)｜整体借入音乐术语，清单无对应词素 |
| 45 | strategy | 2840 | 策略；战略 | 整体借入词 | 希腊 strategia = stratos(军队) + agein(引导) → 法语 stratégie｜希腊复合词整体借入，清单无对应词素，仅词尾 -y 可视为名词化但不足以支撑 |
| 46 | jin | 2842 | 斤（中国重量单位） | 整体借入词 | 阿拉伯语 jinn（精灵），整体借入｜整体借入词，清单无对应词素 |
| 47 | powder | 2846 | 粉末；火药 | 整体借入词 | 古法语 poudre，源自拉丁 pulvis（粉尘），整体借入｜整体借入词，无清单词素可切 |
| 48 | sync | 2847 | 同步；同步更新 | 整体借入 / 无可用词素 | synchronization 的缩略，源自希腊 syn- + chronos｜缩略词，非词素组合 |
| 49 | alley | 2852 | 小巷；胡同 | 整体借入词 | 古法语 alee（行走），源自 aler（走）｜整体借入词，无清单词素可切 |
| 50 | supper | 2853 | 晚餐；晚饭 | 日耳曼/古英语基本词 | 古法语 soper，日耳曼来源，非 sup + -er｜整体借入词，-er 非后缀 |
| 51 | yoga | 2856 | 瑜伽 | 整体借入词 | 梵语 yoga（结合），整体借入｜整体借入词，清单无对应词素 |
| 52 | alpha | 2861 | 阿尔法；首位；领头 | 整体借入词 | 希腊字母表首字母 alpha，闪米特来源｜字母名称，整体借入 |
| 53 | diet | 2862 | 饮食；节食 | 整体借入词 | 希腊 diaita（生活方式）经拉丁、古法语借入｜整体借入词，无清单词素可切 |
| 54 | jet | 2863 | 喷气机；喷射 | 整体借入词 | 法语 jeter（投掷），源自拉丁 iactare｜整体借入词，无清单词素可切 |
| 55 | kangaroo | 2864 | 袋鼠 | 整体借入词 | 澳洲原住民 Guugu Yimithirr 语 gangurru｜整体借入词，来源为原住民语言 |
| 56 | award | 2868 | 奖；奖品；授予 | 日耳曼/古英语基本词 | 中古英语 awarden，源自古法语 eswarder（es- + warder 看守），日耳曼语源｜整体借入，词根 ward 为日耳曼语源，清单无对应词素 |
| 57 | grief | 2869 | 悲伤；悲痛 | 整体借入词 | 古法语 grief，源自拉丁 gravis（重），但已整体借入｜整体借入词，清单无对应词根（r.grav 词形为 grav，与 grief 对不上） |
| 58 | random | 2871 | 随机的；随意的 | 日耳曼/古英语基本词 | 中古英语 randon，源自古法语 randon（冲力），日耳曼语源｜整体借入，来源为日耳曼语，清单无对应词素 |
| 59 | safari | 2872 | 游猎；观兽旅行 | 整体借入词 | 斯瓦希里语 safari，源自阿拉伯语 safar（旅行）｜整体借入，非拉丁/希腊/法语词素 |
| 60 | trauma | 2876 | 创伤；精神创伤 | 整体借入词 | 希腊语 trauma（伤），但作为整体借入词，清单无对应词根｜整体借入，清单无 trauma 词根 |
| 61 | waltz | 2880 | 华尔兹；跳华尔兹 | 日耳曼/古英语基本词 | 德语 Walzer，源自 walzen（滚动），日耳曼语源｜整体借入，日耳曼语源 |
| 62 | chocolate | 2888 | 巧克力 | 整体借入词 | 西班牙语 chocolate，源自纳瓦特尔语 chocolatl｜整体借入，非拉丁/希腊/法语词素 |
| 63 | li | 2891 | 里（中国长度单位） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2891 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 64 | aid | 2892 | 帮助；援助 | 整体借入词 | 古法语 aide，源自拉丁 adiutare（帮助），但已整体借入｜整体借入词，清单无对应词素 |
| 65 | elephant | 2893 | 大象 | 整体借入词 | 希腊 elephas (elephant-) 整体借入，非清单词素构成｜整体借入词，清单无对应词素 |
| 66 | tomato | 2896 | 番茄；西红柿 | 整体借入词 | 西班牙语 tomate，源自纳瓦特尔语 tomatl，整体借入｜整体借入词，来源为美洲原住民语 |
| 67 | whiskey | 2902 | 威士忌 | 整体借入词 | 爱尔兰/苏格兰盖尔语 uisce beatha(生命之水) 借入｜整体借入词，非拉丁希腊词素构成 |
| 68 | vanilla | 2904 | 香草；香草味的 | 整体借入词 | 西班牙语 vainilla(小荚)，源自拉丁 vagina(鞘)，整体借入｜整体借入词，清单无对应词素 |
| 69 | cactus | 2912 | 仙人掌 | 整体借入词 | 拉丁 cactus，源自希腊 kaktos，整体借入｜整体借入词，清单无对应词素 |
| 70 | ln | 2917 | 自然对数（ln） | 疑似脏数据 | 词长 2 个字母，且 freqRank 2917 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 71 | banana | 2920 | 香蕉 | 整体借入词 | 西班牙语/葡萄牙语 banana，源自西非 Wolof 语，整体借入｜整体借入词，来源为西非语言 |
| 72 | shampoo | 2928 | 洗发水；洗头 | 整体借入词 | 印地语 chāmpo(按摩) 借入｜整体借入词，非拉丁希腊词素构成 |
| 73 | tent | 2931 | 帐篷 | 整体借入词 | 拉丁 tentorium/tendere 经古法语 tente 借入，现代英语 tent 为整体借入名词｜整体借入词，虽与 r.tend/r.tin 拼写相近，但现代词义「帐篷」无法由「伸展/持有」词根直接解释，且单段不可拆 |
| 74 | bungalow | 2944 | 平房 | 整体借入词 | 源自印地语 bangla（孟加拉式房屋）｜整体借入词，来源为印地语，清单无对应词素 |
| 75 | admiral | 2951 | 海军上将；舰队司令 | 整体借入词 | 源自阿拉伯语 amīr al-（指挥官），经古法语 amiral 借入｜整体借入词，阿拉伯语来源，清单无对应词素 |
| 76 | jungle | 2952 | 丛林；密林 | 整体借入词 | 源自印地语 jangal（荒地、森林）｜整体借入词，印地语来源，清单无对应词素 |
| 77 | pro | 2955 | 职业选手；赞成者；好处 | 整体借入词 | 拉丁 pro（为了、代替），作为独立借词整体使用｜单段独立借词，不可拆 |
| 78 | curry | 2960 | 咖喱 | 整体借入词 | 源自泰米尔语 kari（酱汁），经葡萄牙语借入｜整体借入词，泰米尔语来源，清单无对应词素 |
| 79 | avatar | 2968 | 化身；头像 | 整体借入词 | 源自梵语 avatāra（化身），经印地语借入｜整体借入词，梵语来源，清单无对应词素 |
| 80 | porn | 2969 | 色情作品；色情 | 整体借入词 | 希腊 pornē(妓女) 的缩略，整体借入｜缩略借入词，清单无对应词素 |
| 81 | guru | 2976 | 古鲁；权威导师 | 整体借入词 | 梵语 guru(重、尊敬)，整体借入｜梵语借词，非拉丁/希腊/法语词素 |
| 82 | lemon | 2977 | 柠檬 | 整体借入词 | 古法语 limon，来源为波斯/阿拉伯语，整体借入｜整体借入词，清单无对应词素 |
| 83 | appeal | 2980 | 吸引力；呼吁；上诉 | 代码校验拦截 | 拉丁 appellare = ad-(朝向) + pellere(驱动、呼叫)｜ap(朝向)+peal(pell 推/驱)，语义可解释为诉求 |
| 84 | mantra | 2984 | 咒语；信条 | 整体借入词 | 梵语 mantra(咒语)，整体借入｜梵语借词，清单无对应词素 |
| 85 | fraud | 2992 | 欺诈；骗子 | 整体借入词 | 拉丁 fraus/fraudis(欺骗)，整体借入｜整体借入词，清单无对应词根 |
| 86 | nirvana | 2992 | 涅槃；极乐境界 | 整体借入词 | 梵语 nirvāṇa，整体借入｜梵语借词，清单无对应词素 |
| 87 | branch | 2993 | 树枝；分支；分店 | 整体借入词 | 晚期拉丁 branca(爪、掌)，经古法语借入｜整体借入词，清单无对应词素 |
| 88 | typhoon | 3000 | 台风 | 整体借入词 | 源自希腊 typhon（旋风）经阿拉伯/葡萄牙语借入，非清单词素构成｜整体借入词，无清单词素可拆 |
| 89 | blonde | 3003 | 金发的；金发女郎 | 整体借入词 | 法语借入词，源自拉丁 blundus（黄褐色），非清单词素｜整体借入词 |
| 90 | tea | 3008 | 茶 | 整体借入词 | 源自闽南语 tê，经荷兰语借入｜整体借入词，无清单词素 |
| 91 | von | 3009 | 冯（德语贵族姓氏前缀） | 整体借入 / 无可用词素 | 德语介词，贵族姓氏前缀｜德语借入虚词，非清单词素 |
| 92 | comedy | 3010 | 喜剧 | 整体借入词 | 希腊 komoidia（komos 狂欢 + aeidein 唱），整体借入｜整体借入词，清单无对应词素 |
| 93 | tofu | 3016 | 豆腐 | 整体借入词 | 源自汉语/日语借入词｜整体借入词 |
| 94 | kimono | 3024 | 和服 | 整体借入词 | 日语借入词｜整体借入词 |
| 95 | ambassador | 3025 | 大使 | 整体借入词 | 源自拉丁 ambactus（仆人）经古法语借入，非清单词素可拆｜整体借入词，无清单词素 |
| 96 | pile | 3027 | 堆；大量 | 整体借入词 | 源自拉丁 pila（柱、堆），经法语借入，清单无对应词素｜整体借入词 |
| 97 | soda | 3029 | 苏打；汽水 | 来源不明 | 源自意大利/中世纪拉丁借入词，来源不确定｜整体借入词，来源不明 |
| 98 | origami | 3032 | 折纸艺术 | 整体借入词 | 日语折り紙(ori 折 + kami 纸)，整体借入｜日语整体借入词，清单无对应词素 |
| 99 | steak | 3039 | 牛排；肉排 | 日耳曼/古英语基本词 | 古诺斯语 steik，日耳曼基本词｜日耳曼基本词，无可拆词素 |
| 100 | manga | 3040 | 日本漫画 | 整体借入词 | 日语漫画，整体借入｜日语整体借入词，清单无对应词素 |
| 101 | tube | 3040 | 管；地铁（伦敦） | 整体借入词 | 法语 tube / 拉丁 tubus，整体借入｜整体借入词，清单无对应词根 |
| 102 | herr | 3043 | 先生（德语称呼） | 整体借入词 | 德语 Herr(先生)，整体借入｜德语整体借入词，清单无对应词素 |
| 103 | throne | 3046 | 王座；王位 | 整体借入词 | 希腊 thronos → 拉丁 thronus → 古法语 trone，整体借入｜整体借入词，清单无对应词根 |
| 104 | anime | 3048 | 日本动画 | 整体借入词 | 日语アニメ(animation 缩略)，整体借入｜日语借入缩略词，清单无对应词素 |
| 105 | cable | 3056 | 电缆；缆绳 | 整体借入词 | 拉丁 capulum（绳索）经古北法语 cable 借入，词干整体借入｜整体借入词，清单无对应词根 |
| 106 | emoji | 3056 | 表情符号 | 整体借入词 | 日语 絵文字（e-moji），20世纪借入｜日语借词，非拉丁/希腊/法语词素 |
| 107 | september | 3060 | 九月 | 整体借入 / 无可用词素 | 拉丁 september，源自 septem（七），但 -ember 段清单无对应词素，无法逐字母覆盖｜专有月份名，缺少清单词素，无法完整切分 |
| 108 | karate | 3064 | 空手道 | 整体借入词 | 日语 空手，20世纪借入｜日语借词，非拉丁/希腊/法语词素 |
| 109 | pork | 3070 | 猪肉 | 整体借入词 | 拉丁 porcus（猪）经古法语 porc 借入，词干整体借入｜整体借入词，清单无对应词根 |
| 110 | judo | 3072 | 柔道 | 整体借入词 | 日语 柔道，19世纪借入｜日语借词，非拉丁/希腊/法语词素 |
| 111 | sumo | 3080 | 相扑 | 整体借入词 | 日语 相撲，借入｜日语借词，非拉丁/希腊/法语词素 |
| 112 | battery | 3087 | 电池；一系列 | 整体借入词 | 法语 batterie，源自 battre（打），但 -ery 段与清单 s.ery 语义/词形不完全吻合，且词干 batt 不在清单｜整体借入词，缺少清单词素 |
| 113 | samurai | 3088 | 日本武士 | 整体借入词 | 日语 侍，借入｜日语借词，非拉丁/希腊/法语词素 |
| 114 | motel | 3090 | 汽车旅馆 | 整体借入 / 无可用词素 | motor + hotel 的混成词（blend），20世纪美国英语｜混成词，非拉丁/希腊词素构成 |
| 115 | cinema | 3092 | 电影院；电影 | 整体借入词 | 希腊 kinema(运动) 经法语 cinématographe 缩略借入｜整体借入缩略词，词干无法用清单词素逐字母覆盖 |
| 116 | rifle | 3094 | 步枪 | 日耳曼/古英语基本词 | 法语 rifler(刮、刻) 借入，日耳曼来源｜整体借入词，来源为日耳曼语 |
| 117 | geisha | 3096 | 艺伎 | 整体借入词 | 日语 芸者(geisha) 借入｜日语借词 |
| 118 | pill | 3102 | 药丸 | 日耳曼/古英语基本词 | 拉丁 pilula(小球) 经中古英语借入，词形已高度简化｜整体借入词，无法逐字母切分 |
| 119 | delay | 3103 | 延迟；耽搁 | 来源不明 | 古法语 delaier，来源不明｜整体借入词，来源不明 |
| 120 | ramen | 3104 | 拉面 | 整体借入词 | 日语 ラーメン 借入｜日语借词 |
| 121 | mall | 3107 | 购物中心 | 专有名词派生 | 源自 Pall Mall（伦敦林荫路），最终来自意大利 pallamaglio｜专名派生借入词 |
| 122 | badge | 3111 | 徽章；标记 | 日耳曼/古英语基本词 | 中古英语 bage，来源不明｜来源不明的基本词 |
| 123 | tempura | 3112 | 天妇罗 | 整体借入词 | 日语 天ぷら 借入，最终或源自葡萄牙语｜日语借词 |
| 124 | taco | 3120 | 墨西哥玉米卷 | 来源不明 | 墨西哥西班牙语 taco，来源不明｜整体借入词，无清单词素 |
| 125 | poem | 3123 | 诗 | 整体借入词 | 希腊 poiema(制作物) → 拉丁 poema，整体借入｜整体借入词，清单无对应词根 |
| 126 | burrito | 3128 | 墨西哥卷饼 | 整体借入词 | 西班牙语 burrito(小驴)，burro+-ito，整体借入｜整体借入词，无清单词素 |
| 127 | satellite | 3128 | 卫星 | 整体借入词 | 拉丁 satelles(随从、护卫)，整体借入｜整体借入词，无清单词素 |
| 128 | chapter | 3130 | 章节 | 整体借入词 | 拉丁 capitulum(小头)，capit- 整体借入演变｜整体借入词，词干与清单词根对不上 |
| 129 | clan | 3134 | 氏族；部落 | 整体借入词 | 苏格兰盖尔语 clann(子女、家族)，整体借入｜整体借入词，无清单词素 |
| 130 | mosquito | 3136 | 蚊子 | 整体借入词 | 西班牙语 mosquito(小苍蝇)，mosca+-ito，整体借入｜整体借入词，无清单词素 |
| 131 | canoe | 3144 | 独木舟；划独木舟 | 整体借入词 | 加勒比语 canaoua → 西班牙语 canoa，整体借入｜整体借入词，无清单词素 |
| 132 | rage | 3144 | 愤怒；暴怒 | 整体借入词 | 古法语 rage，拉丁 rabies(狂怒)，整体借入｜整体借入词，无清单词素 |
| 133 | basis | 3146 | 基础；根据 | 代码校验拦截 | 希腊 basis(基础、踏步) → 拉丁 basis｜bas(基底)+is，词尾 -is 非清单复数后缀，语义勉强；判 decomposable 存疑 |
| 134 | item | 3151 | 项目；物品 | 整体借入词 | 拉丁 item(同样地、也)，整体借入｜整体借入词，清单无对应词素 |
| 135 | hammock | 3152 | 吊床 | 整体借入词 | 西班牙语 hamaca，源自泰诺语，整体借入｜来源为美洲原住民语，非拉丁/希腊/法语词素 |
| 136 | patch | 3159 | 补丁；小块 | 日耳曼/古英语基本词 | 中古英语 pacche，来源不明｜日耳曼基本词/来源不明 |
| 137 | barbecue | 3160 | 烧烤；烤制 | 整体借入词 | 西班牙语 barbacoa，源自泰诺语，整体借入｜来源为美洲原住民语，非清单词素 |
| 138 | tobacco | 3168 | 烟草 | 整体借入词 | 西班牙语 tabaco，源自泰诺语/加勒比语，整体借入｜来源为美洲原住民语，非清单词素 |
| 139 | e-mail | 3170 | 电子邮件 | 非单词形 | 词形含非字母字符（e-mail），无法按词素逐段拼接 |
| 140 | soviet | 3175 | 苏联的；苏维埃的 | 整体借入词 | 俄语 sovet(委员会)，整体借入｜俄语借词，非拉丁/希腊/法语词素 |
| 141 | potato | 3176 | 马铃薯；土豆 | 整体借入词 | 西班牙语 patata，源自泰诺语 batata，整体借入｜整体借入词，无清单词素 |
| 142 | cocoa | 3184 | 可可；可可饮料 | 整体借入词 | 西班牙语 cacao，源自纳瓦特尔语 cacahuatl，整体借入｜整体借入词，无清单词素 |
| 143 | radar | 3185 | 雷达 | 整体借入 / 无可用词素 | radio detection and ranging 的首字母缩略词｜缩略词，非词素构成 |
| 144 | amber | 3187 | 琥珀；琥珀色 | 整体借入词 | 阿拉伯语 anbar，经古法语 ambre 借入｜整体借入词，无清单词素 |
| 145 | vast | 3188 | 广阔的；巨大的 | 整体借入词 | 拉丁 vastus(空旷、巨大)，整体借入｜整体借入词，无清单词素 |
| 146 | cookie | 3191 | 饼干；小甜饼 | 整体借入词 | 荷兰语 koekje(小蛋糕)，koek + -je 指小后缀｜整体借入词，-ie 非清单后缀 |
| 147 | papaya | 3192 | 木瓜 | 整体借入词 | 西班牙语 papaya，源自加勒比语系，整体借入｜整体借入词，无清单词素 |
| 148 | pump | 3194 | 泵；抽水机 | 日耳曼/古英语基本词 | 中古英语 pumpe，来源不明｜来源不明/日耳曼基本词 |
| 149 | counter | 3196 | 柜台；计数器 | 整体借入词 | 古法语 comptoir(柜台)，源自拉丁 computare(计算)｜整体借入词，-er 非派生后缀 |
| 150 | kiwi | 3200 | 猕猴桃；几维鸟 | 整体借入词 | 毛利语 kiwi，借入词｜整体借入词，无清单词素 |
| 151 | achieve | 3203 | 实现；达到 | 整体借入词 | 古法语 achever，源自拉丁 ad caput（到头），整体借入｜整体借入词，词干无法用清单词素切分 |
| 152 | dope | 3206 | 毒品；笨蛋 | 来源不明 | 荷兰语 doop（蘸酱），来源不明｜来源不明/借入词 |
| 153 | vodka | 3208 | 伏特加 | 整体借入 / 无可用词素 | 俄语 vodka，指小形式 voda（水）｜俄语借入词，无清单词素 |
| 154 | booze | 3211 | 酒；酗酒 | 日耳曼/古英语基本词 | 中古荷兰语 busen，日耳曼来源｜日耳曼借入词 |
| 155 | bazaar | 3216 | 集市；市场 | 整体借入 / 无可用词素 | 波斯语 bāzār，经土耳其语/意大利语借入｜波斯语借入词 |
| 156 | caravan | 3224 | 商队；旅行拖车 | 整体借入 / 无可用词素 | 波斯语 kārvān，经意大利语借入｜波斯语借入词 |
| 157 | suitcase | 3226 | 手提箱；行李箱 | 日耳曼/古英语基本词 | 英语复合词 suit + case，均为日耳曼/法语借入基本词｜英语复合词，无清单词素 |
| 158 | kiosk | 3232 | 售货亭；自助终端 | 整体借入词 | 土耳其语 köşk，经法语借入｜土耳其语借入词 |
| 159 | phase | 3232 | 阶段；时期 | 整体借入词 | 希腊 phasis(显现) → 拉丁 phasis → 英语 phase，整体借入｜整体借入词，清单中 r.phas 义为「说，显示」，但 phase 为整体借入的天文/阶段术语，不宜拆 |
| 160 | prom | 3233 | （高中）毕业舞会 | 整体借入词 | promenade 的缩略，源自法语 se promener(散步)｜缩略词，来源为法语整体借入，无可拆词素 |
| 161 | zero | 3240 | 零；零点 | 整体借入词 | 阿拉伯 ṣifr(空) → 意大利 zero，整体借入｜整体借入词，清单无对应词素 |
| 162 | sofa | 3248 | 沙发 | 整体借入词 | 阿拉伯 ṣuffah(长凳) → 法语 sofa，整体借入｜整体借入词，清单无对应词素 |
| 163 | poker | 3253 | 扑克牌戏；拨火棍 | 来源不明 | 来源不明，可能源自法语 poque 或德语 pochen｜来源不明，-er 非清单后缀可解释 |
| 164 | magazine | 3256 | 杂志；弹仓 | 整体借入词 | 阿拉伯 maḵzan(仓库) → 意大利 magazzino → 法语 magasin，整体借入｜整体借入词，清单无对应词素 |
| 165 | mi | 3257 | 大调音阶第三音 | 疑似脏数据 | 词长 2 个字母，且 freqRank 3257 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 166 | fu | 3258 | （中文音译）夫；福 | 疑似脏数据 | 词长 2 个字母，且 freqRank 3258 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 167 | tragic | 3262 | 悲剧的；悲惨的 | 整体借入词 | 希腊 tragikos（与山羊歌有关），经拉丁 tragicus、法语 tragique 借入｜整体借入词，清单无 trag- 词根；-ic 虽为后缀但词干无法归属 |
| 168 | restaurant | 3264 | 餐馆；饭店 | 整体借入词 | 法语 restaurer（恢复）的现在分词 restaurant，整体借入｜整体借入法语词，清单无对应词根 |
| 169 | garage | 3272 | 车库；修车厂 | 整体借入词 | 法语 garer（停放）派生，整体借入｜整体借入法语词，清单无对应词根 |
| 170 | sober | 3275 | 清醒的；未醉的 | 整体借入词 | 拉丁 sobrius，经古法语 sobre 借入｜整体借入词，清单无对应词根 |
| 171 | niece | 3278 | 侄女；外甥女 | 整体借入词 | 拉丁 neptia，经古法语 niece 借入｜整体借入词，清单无对应词根 |
| 172 | menu | 3280 | 菜单；选单 | 整体借入词 | 法语 menu（小的、详细的），源自拉丁 minutus｜整体借入法语词，清单无对应词根 |
| 173 | tennis | 3280 | 网球 | 日耳曼/古英语基本词 | 中古英语 tenetz，源自古法语 tenez（接住），来源有争议｜整体借入词，来源不确定，清单无对应词根 |
| 174 | omelet | 3288 | 煎蛋卷 | 来源不明 | 法语 omelette，来源不明｜整体借入词，来源不明 |
| 175 | croissant | 3296 | 羊角面包 | 整体借入词 | 法语 croissant（新月），源自拉丁 crescere 的现在分词｜整体借入法语词，清单无对应词根 |
| 176 | boutique | 3304 | 精品店 | 整体借入词 | 法语 boutique，源自希腊 apotheke（仓库），整体借入｜整体借入法语词，清单无对应词素 |
| 177 | con | 3308 | 骗局；反对 | 来源不明 | 拉丁 contra 缩略，或英语本族语动词，来源复杂｜整体借入/来源不明，单音节词不可拆 |
| 178 | souvenir | 3312 | 纪念品 | 整体借入词 | 法语 souvenir，源自拉丁 subvenire（想起），整体借入｜整体借入法语词，清单无对应词素 |
| 179 | skill | 3318 | 技能；技巧 | 日耳曼/古英语基本词 | 古诺斯语 skil（区分、判断），日耳曼基本词｜日耳曼基本词，不可拆 |
| 180 | baron | 3320 | 男爵；大亨 | 整体借入词 | 古法语 baron，源自法兰克语，整体借入｜整体借入词，清单无对应词素 |
| 181 | marshal | 3323 | 元帅；执法官 | 整体借入词 | 古法语 mareschal（马夫），源自法兰克语，整体借入｜整体借入词，清单无对应词素 |
| 182 | petty | 3324 | 琐碎的；小气的 | 整体借入词 | 法语 petit（小），整体借入｜整体借入法语词，清单无对应词素 |
| 183 | massage | 3326 | 按摩；推拿 | 整体借入词 | 法语 massage，源自阿拉伯语 massa（触摸），整体借入｜整体借入法语词，清单无对应词素 |
| 184 | bacon | 3334 | 培根；熏猪肉 | 日耳曼/古英语基本词 | 古法语 bacon，源自法兰克语，日耳曼来源｜整体借入词，清单无对应词素 |
| 185 | absurd | 3366 | 荒谬的；荒唐的 | 整体借入词 | 拉丁 absurdus（不和谐），整体借入｜整体借入词，ab- 虽在清单但语义与词源 surdus 不匹配，不可拆 |
| 186 | ruby | 3370 | 红宝石；露比（人名） | 整体借入词 | 古法语 rubi < 拉丁 rubeus（红），整体借入｜整体借入词，无清单词素 |
| 187 | ranch | 3379 | 大牧场；农场 | 整体借入词 | 西班牙语 rancho（营地），整体借入｜整体借入词，无清单词素 |
| 188 | yen | 3393 | 日元；渴望 | 来源不明 | 日语 円（en）借入，或来源不明｜整体借入词，无清单词素 |
| 189 | kang | 3402 | 炕（中国北方砖砌暖床） | 专有名词派生 | 来源不明/专名｜来源不明，无清单词素 |
| 190 | pearl | 3404 | 珍珠 | 来源不明 | 古法语 perle，来源不明，整体借入｜整体借入词，无清单词素 |
| 191 | khan | 3411 | 汗（中亚统治者称号） | 整体借入词 | 源自突厥语/蒙古语，整体借入｜整体借入词，无清单词素 |
| 192 | november | 3414 | 十一月 | 人工复核纠偏 | November 来自拉丁 novem（九，罗马历第九月），与词素表 r.nov（novus「新」）同形而不同源 —— 教员要是按 nov(新) 讲十一月就是教错，故踢出候选。｜原判见 etym 字段 |
| 193 | cherry | 3417 | 樱桃 | 整体借入词 | 源自希腊语 kerasos 经拉丁、古北法语 cherise 借入｜整体借入词，无清单词素 |
| 194 | cattle | 3421 | 牛；牲口 | 日耳曼/古英语基本词 | 古北法语 catel，源自拉丁 capitale，日耳曼/古法语借入｜整体借入词，无清单词素 |
| 195 | sarge | 3433 | 中士（军士长昵称） | 整体借入 / 无可用词素 | sergeant 的缩略形式，源自拉丁 servientem｜缩略形式，无清单词素 |
| 196 | turtle | 3435 | 龟；海龟 | 来源不明 | 可能源自法语 tortue，来源不确定｜来源不明/整体借入 |
| 197 | spoil | 3436 | 破坏；宠坏 | 整体借入词 | 拉丁 spoliare(剥夺) 经古法语 espoillier 借入｜整体借入词，无清单词素 |
| 198 | lance | 3441 | 长矛；标枪 | 整体借入词 | 拉丁 lancea(长矛) 经古法语借入｜整体借入词，无清单词素 |
| 199 | develop | 3453 | 发展；开发 | 整体借入词 | 法语 développer，源自古法语 desveloper｜整体借入词，无清单词素 |
| 200 | en | 3456 | 半角字母 n；恩（音译） | 疑似脏数据 | 词长 2 个字母，且 freqRank 3456 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 201 | pm | 3461 | 首相；下午 | 疑似脏数据 | 词长 2 个字母，且 freqRank 3461 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 202 | yang | 3462 | 阳（中国哲学概念） | 整体借入词 | 汉语借词（阳），来源为中文音译｜汉语借词，非拉丁/希腊/法语词素 |
| 203 | halloween | 3463 | 万圣节前夕 | 专有名词派生 | 苏格兰英语 All Hallows' Even 的缩略，Halloween 为专名化整体词｜专名缩略整体词，清单无对应词素 |
| 204 | ace | 3471 | 王牌；高手 | 整体借入词 | 拉丁 as（单位、铜币），经古法语 as 借入，整体词｜整体借入词，无可拆词素 |
| 205 | cart | 3472 | 手推车；马车 | 日耳曼/古英语基本词 | 古诺斯语 kartr，日耳曼基本词｜日耳曼基本词，非拉丁/希腊词素 |
| 206 | galaxy | 3479 | 星系；银河 | 整体借入词 | 希腊 gala(奶) → 拉丁 galaxias → 法语 galaxie，整体借入｜整体借入词，清单无 gala/galact 词根 |
| 207 | jewelry | 3484 | 珠宝；首饰 | 整体借入词 | 古法语 jouel(珠宝) + -erie，jewel 为整体借入词干｜词干 jewel 整体借入，清单无对应词根 |
| 208 | luggage | 3486 | 行李 | 日耳曼/古英语基本词 | lug(拖、拉，日耳曼语源) + -age，lug 非拉丁词根｜词干 lug 为日耳曼语源，清单无对应词根 |
| 209 | burger | 3499 | 汉堡包 | 专有名词派生 | Hamburger 的截短（源自德语 Hamburg 专名），非词素构词｜专名截短词，非可拆词素 |
| 210 | sire | 3510 | 陛下；父兽 | 整体借入词 | 古法语 sire，源自拉丁 senior(长者)，整体借入词｜整体借入词，清单无对应词根 |
| 211 | inch | 3513 | 英寸；少量 | 日耳曼/古英语基本词 | 古英语 ynce，源自拉丁 uncia（十二分之一），整体借入｜日耳曼基本词/整体借入，清单无对应词素 |
| 212 | counsel | 3533 | 忠告；律师 | 整体借入词 | 古法语 conseil，源自拉丁 consilium，整体借入｜整体借入词，清单无对应词素 |
| 213 | heroin | 3538 | 海洛因 | 专有名词派生 | 德语 Heroin，源自希腊 heros（英雄）+ 化学后缀 -in，专名派生｜专名派生/整体借入，清单无对应词素 |
| 214 | tissue | 3546 | 纸巾；组织 | 整体借入词 | 古法语 tissu（编织物），源自拉丁 texere，整体借入｜整体借入词，清单无对应词素 |
| 215 | et | 3548 | 和（拉丁语）；外星人 | 疑似脏数据 | 词长 2 个字母，且 freqRank 3548 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 216 | supreme | 3550 | 最高的；至上的 | 整体借入词 | 拉丁 supremus（最高的），整体借入｜整体借入词，清单无对应词素 |
| 217 | vessel | 3558 | 船；容器；血管 | 整体借入词 | 古法语 vaissel，源自拉丁 vascellum，整体借入｜整体借入词，清单无对应词素 |
| 218 | coma | 3567 | 昏迷 | 整体借入词 | 希腊 koma（深睡），整体借入｜整体借入词，清单无对应词素 |
| 219 | coffin | 3569 | 棺材 | 整体借入词 | 古法语 cofin，源自拉丁 cophinus（篮子），整体借入｜整体借入词，清单无对应词素 |
| 220 | puppy | 3572 | 小狗；幼犬 | 来源不明 | 中古法语 poupée（玩偶），来源不明｜整体借入词，词尾 -y 非清单后缀，无对应词素 |
| 221 | mob | 3577 | 暴民；人群 | 整体借入词 | 拉丁 mobile vulgus（激动的人群）缩略，但已整体借入｜缩略整体借入词，无法逐字母切分 |
| 222 | cotton | 3578 | 棉花；棉布 | 整体借入词 | 阿拉伯语 quṭn 经古法语传入｜整体借入词，无清单词素 |
| 223 | purple | 3599 | 紫色的 | 日耳曼/古英语基本词 | 古英语 purpul，源自拉丁 purpura，整体借入｜整体借入词，无清单词素 |
| 224 | suite | 3601 | 套房；组曲 | 整体借入词 | 法语 suite，源自通俗拉丁 sequita，整体借入｜整体借入词，无清单词素 |
| 225 | poet | 3604 | 诗人 | 整体借入词 | 希腊 poiētēs（制作者），经拉丁 poeta 传入｜整体借入词，清单无对应词根 |
| 226 | carpet | 3607 | 地毯 | 整体借入词 | 意大利语 carpita，源自拉丁 carpere（梳理），整体借入｜整体借入词，无清单词素 |
| 227 | ay | 3622 | 唉；是（表决用语） | 疑似脏数据 | 词长 2 个字母，且 freqRank 3622 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 228 | si | 3628 | 西（音阶唱名） | 疑似脏数据 | 词长 2 个字母，且 freqRank 3628 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 229 | medal | 3662 | 奖牌；勋章 | 整体借入词 | 法语 médaille，源自意大利语 medaglia，最终源自拉丁 metallum（金属），整体借入｜整体借入词，清单无对应词素 |
| 230 | cemetery | 3665 | 墓地；公墓 | 整体借入词 | 希腊 koimeterion（睡觉的地方）→ 拉丁 coemeterium，整体借入｜整体借入词，清单无对应词素 |
| 231 | rear | 3666 | 后部；抚养 | 整体借入词 | 古法语 rere，源自拉丁 retro（向后），但词形已整体演变，无法用清单词素逐字母切分｜整体借入/演变词，无法逐字母切分 |
| 232 | era | 3683 | 时代；纪元 | 整体借入词 | 晚期拉丁 aera（纪元、计数），整体借入｜整体借入词，清单无对应词素 |
| 233 | scout | 3695 | 侦察员；童子军 | 整体借入词 | 古法语 escouter（听），源自拉丁 auscultare，整体借入｜整体借入词，清单无对应词素 |
| 234 | pale | 3701 | 苍白的；浅色的 | 整体借入词 | 古法语 pale，源自拉丁 pallidus（苍白），整体借入｜整体借入词，清单无对应词素 |
| 235 | embassy | 3705 | 大使馆 | 整体借入词 | 古法语 ambassade，源自拉丁 ambactus（仆人），整体借入｜整体借入词，清单无对应词素 |
| 236 | defence | 3706 | 防御；辩护 | 代码校验拦截 | 拉丁 de- + fendere(击打) + -ce｜de(去除)+fence(击打，fend变体)+ce(名词后缀)，defence=击退→防御 |
| 237 | cabinet | 3707 | 橱柜；内阁 | 整体借入词 | 法语 cabinet，源自意大利语 gabinetto，整体借入｜整体借入词，清单无对应词素 |
| 238 | vault | 3717 | 拱顶；金库；跳跃 | 整体借入词 | 古法语 voute，源自拉丁 volvere 的俗拉丁变体，但词形已整体借入，无法按清单词素逐字母切分｜整体借入词，清单无对应词素可完整切分 |
| 239 | bargain | 3721 | 便宜货；交易；讨价还价 | 日耳曼/古英语基本词 | 古法语 bargaignier，来源日耳曼语，整体借入｜整体借入词，非清单词素构成 |
| 240 | helmet | 3725 | 头盔；安全帽 | 日耳曼/古英语基本词 | 古法语 helmet，指小形式，日耳曼来源｜整体借入词，-et 非清单后缀 |
| 241 | scar | 3726 | 伤疤；创伤 | 日耳曼/古英语基本词 | 中古英语 scarre，来源不明，日耳曼基本词｜日耳曼基本词/来源不明 |
| 242 | mere | 3744 | 仅仅的；纯粹的 | 日耳曼/古英语基本词 | 古英语/古法语 merus，日耳曼基本词｜日耳曼基本词，无可切词素 |
| 243 | un | 3764 | 家伙；东西（方言/口语） | 疑似脏数据 | 词长 2 个字母，且 freqRank 3764 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 244 | chess | 3770 | 国际象棋 | 来源不明 | 古法语 eschec，源自波斯语，整体借入｜整体借入词，来源不明 |
| 245 | cruise | 3772 | 乘船游览；巡航 | 整体借入词 | 荷兰语 kruisen，源自拉丁 crux，但词形整体借入｜整体借入词，无法按清单词素完整切分 |
| 246 | ally | 3786 | 盟友；同盟者 | 代码校验拦截 | 拉丁 ad- + ligare(绑) → alligare → 古法语 alier｜al(ad-向)+ly(lig绑)，ally=绑在一起→同盟 |
| 247 | rumor | 3802 | 谣言；传闻 | 整体借入词 | 拉丁 rumor(喧闹、传闻)，整体借入｜整体借入词，清单无对应词根 |
| 248 | gallery | 3815 | 画廊；美术馆 | 来源不明 | 中世纪拉丁 galeria，来源不明，整体借入｜整体借入词，-ery 非真实后缀 |
| 249 | ginger | 3816 | 姜；姜黄色 | 整体借入词 | 古法语 gingibre，源自希腊 zingiberis，整体借入｜整体借入词，非 X+-er |
| 250 | improve | 3821 | 改善；提高 | 来源不明 | 盎格鲁-法语 emprower，来源不明｜来源不明，非 in-+prove |
| 251 | envy | 3835 | 嫉妒；羡慕 | 整体借入词 | 拉丁 invidia(嫉妒) → 古法语 envie，整体借入｜整体借入词，非 en-+vy |
| 252 | villa | 3847 | 别墅；度假屋 | 整体借入词 | 意大利语 villa，源自拉丁 villa(乡间住宅)，整体借入｜整体借入词，清单无对应词根 |
| 253 | neat | 3859 | 整洁的；巧妙的 | 整体借入词 | 法语 net，源自拉丁 nitidus（明亮的、干净的），整体借入｜整体借入词，清单无对应词素 |
| 254 | pierce | 3860 | 刺穿；穿透 | 来源不明 | 古法语 percer，来源不确定｜来源不明，清单无对应词素 |
| 255 | blank | 3886 | 空白的；茫然的 | 日耳曼/古英语基本词 | 古法语 blanc（白），日耳曼借入｜整体借入词，清单无对应词素 |
| 256 | prey | 3894 | 猎物；受害者 | 整体借入词 | 古法语 preie，源自拉丁 praeda，整体借入｜整体借入词，清单无对应词素 |
| 257 | fry | 3899 | 油炸；煎 | 整体借入词 | 古法语 frire，源自拉丁 frigere，整体借入｜整体借入词，清单无对应词素 |
| 258 | warden | 3903 | 看守人；监狱长 | 日耳曼/古英语基本词 | 古法语 warden，日耳曼语源，非拉丁词根派生｜日耳曼语源基本词，-en 非清单后缀 |
| 259 | zombie | 3908 | 僵尸；木讷的人 | 整体借入词 | 西非刚果语 nzambi，整体借入｜来源为非洲语言，清单无对应词素 |
| 260 | myth | 3925 | 神话；谬见 | 整体借入词 | 希腊 mythos（故事、传说），整体借入｜整体借入希腊词，清单无对应词素 |
| 261 | vain | 3945 | 徒劳的；虚荣的 | 整体借入词 | 拉丁 vanus（空的），经古法语 vain 借入｜整体借入词，清单无对应词素 |
| 262 | chi | 3947 | 气（能量） | 整体借入词 | 希腊字母名 chi，整体借入｜专有字母名，不可拆 |
| 263 | picnic | 3961 | 野餐 | 来源不明 | 法语 pique-nique，来源不明｜整体借入词，不可拆 |
| 264 | idol | 3963 | 偶像；神像 | 整体借入词 | 希腊 eidolon（影像），经拉丁、法语借入｜整体借入词，清单无对应词素 |
| 265 | rank | 3965 | 等级；军衔 | 日耳曼/古英语基本词 | 古法语 ranc，日耳曼来源｜整体借入词，不可拆 |
| 266 | butcher | 3982 | 屠夫；肉贩 | 整体借入词 | 古法语 bochier，源自 bouc（公羊）｜整体借入词，-er 非清单后缀 |
| 267 | brandy | 3984 | 白兰地酒 | 整体借入词 | 荷兰语 brandewijn（烧过的酒）缩写借入｜整体借入词，不可拆 |
| 268 | nazi | 3989 | 纳粹分子 | 整体借入 / 无可用词素 | 德语 Nationalsozialist 的缩略，专有名词派生｜专有名词缩略，非拉丁/希腊词素构成 |
| 269 | parole | 3990 | 假释 | 整体借入词 | 法语 parole（言语、诺言），整体借入｜整体借入法语词，清单无对应词素 |
| 270 | luxury | 4003 | 奢侈；豪华 | 整体借入词 | 拉丁 luxuria（过度、奢侈），整体借入｜整体借入词，lux- 段清单无对应词根 |
| 271 | pistol | 4004 | 手枪 | 来源不明 | 法语 pistole，来源不确定（可能源自捷克 píšťala）｜来源不明/整体借入 |
| 272 | tomb | 4010 | 坟墓 | 整体借入词 | 希腊 tymbos → 拉丁 tumba → 古法语 tombe，整体借入｜整体借入词，无清单词素 |
| 273 | element | 4014 | 元素；要素 | 来源不明 | 拉丁 elementum，来源不明，整体借入｜整体借入词，-ment 非真实后缀（elementum 非 element+ment） |
| 274 | ninja | 4019 | 忍者 | 整体借入词 | 日语 忍者 借入｜日语借词，非拉丁/希腊词素 |
| 275 | pace | 4025 | 步速；节奏 | 整体借入词 | 拉丁 passus(步) → 古法语 pas，整体借入｜整体借入词，清单无对应词根 |
| 276 | allah | 4027 | 安拉（真主） | 整体借入词 | 阿拉伯语 Allāh，专有名词｜阿拉伯语专有名词 |
| 277 | sausage | 4030 | 香肠 | 整体借入词 | 古北法语 saussiche，源自拉丁 salsicia（盐腌之物），但词形已整体借入｜整体借入词，无法用清单词素逐字母切分 |
| 278 | scent | 4059 | 气味；香味 | 日耳曼/古英语基本词 | 中古英语 sent，源自古法语 sentir，词形受 scent 影响，整体借入｜整体借入词，无清单词素可切分 |
| 279 | airplane | 4063 | 飞机 | 整体借入 / 无可用词素 | air（空气）+ plane（源自拉丁 planum 平面）｜air[null]+plane[null]，无清单词素，判不可拆 |
| 280 | plague | 4079 | 瘟疫；灾害 | 整体借入词 | 拉丁 plaga（打击、创伤），整体借入｜整体借入词，无清单词素可切分 |
| 281 | rascal | 4081 | 淘气鬼；无赖 | 来源不明 | 古法语 rascaille，来源不明｜来源不明，无清单词素可切分 |
| 282 | dong | 4084 | 盾（越南货币） | 来源不明 | 拟声词/来源不明｜来源不明，无清单词素可切分 |
| 283 | laser | 4102 | 激光；激光器 | 整体借入 / 无可用词素 | acronym: Light Amplification by Stimulated Emission of Radiation｜首字母缩略词，非词素构成 |
| 284 | kung | 4106 | 功夫（音译） | 整体借入词 | 汉语借词（如 kung fu 中的 kung）｜外来借词，无可拆词素 |
| 285 | lobby | 4119 | 大厅；游说团体 | 整体借入词 | 中世纪拉丁 lobia（门廊），整体借入｜整体借入词，清单无对应词素 |
| 286 | recipe | 4120 | 食谱；秘诀 | 整体借入词 | 拉丁 recipe（取，祈使式），整体借入｜整体借入拉丁词，无可拆词素 |
| 287 | las | 4121 | 激光（laser的旧拼法） | 来源不明 | 来源不明/外来词｜来源不明，无可拆词素 |
| 288 | hockey | 4130 | 曲棍球；冰球 | 来源不明 | 来源不明（可能源自法语 hoquet）｜来源不明，无可拆词素 |
| 289 | maximum | 4133 | 最大的；最高的 | 代码校验拦截 | 拉丁 magnus(大) 的最高级 maximus + -um｜maxim(magn大，最高级)+um(名词后缀)，maximum=最大值 |
| 290 | cellar | 4143 | 地窖；地下室 | 整体借入词 | 拉丁 cellarium(储藏室)，整体借入｜整体借入词，非 X+-ar 可拆 |
| 291 | pirate | 4159 | 海盗；盗版者 | 整体借入词 | 希腊 peirates(攻击者) → 拉丁 pirata → 法语，整体借入｜整体借入词，清单无对应词素 |
| 292 | copper | 4178 | 铜；警察 | 日耳曼/古英语基本词 | 古英语 coper，源自拉丁 cuprum(塞浦路斯金属)，整体借入｜整体借入词，无清单词素可切 |
| 293 | heir | 4180 | 继承人 | 整体借入词 | 古法语 heir，源自拉丁 heres(继承人)，整体借入｜整体借入词，清单无对应词根 |
| 294 | lesbian | 4186 | 女同性恋者 | 专有名词派生 | 源自希腊地名 Lesbos(莱斯博斯岛)+ -ian，专有名词派生｜专有名词派生，规则禁止 |
| 295 | ja | 4192 | 是（德语/荷兰语“是”） | 疑似脏数据 | 词长 2 个字母，且 freqRank 4192 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 296 | bachelor | 4202 | 单身汉；学士 | 来源不明 | 古法语 bacheler，来源不明，整体借入｜整体借入词，来源不明 |
| 297 | cocktail | 4213 | 鸡尾酒；混合物 | 日耳曼/古英语基本词 | 英语复合词 cock+tail，日耳曼基本词｜日耳曼基本词复合，无拉丁希腊词素 |
| 298 | butler | 4216 | 男管家 | 整体借入词 | 古法语 bouteillier(司酒者)，整体借入｜整体借入词，-er 非派生后缀 |
| 299 | bully | 4219 | 欺凌；欺负 | 来源不明 | 源自荷兰语 boel(情人)，来源不明，整体借入｜整体借入词，无清单词素可切 |
| 300 | patty | 4227 | 肉饼；小馅饼 | 整体借入词 | 法语 pâté 的变体，来源为整体借入词｜整体借入词，无清单词素可拆 |
| 301 | bra | 4235 | 胸罩 | 整体借入词 | brassiere 的缩略，源自法语，整体借入｜缩略/整体借入词，无清单词素可拆 |
| 302 | deceased | 4247 | 已故的；死者 | 代码校验拦截 | 拉丁 de- + cedere(走，让) + -ed｜de(离开)+ceas(ced走)+ed，deceased=已离去→死亡的 |
| 303 | dime | 4265 | 一角硬币（美） | 整体借入词 | 古法语 disme，源自拉丁 decima，整体借入｜整体借入词，无清单词素可拆 |
| 304 | ransom | 4269 | 赎金；赎回 | 整体借入词 | 古法语 ransoun，源自拉丁 redemptio，整体借入｜整体借入词，无清单词素可拆 |
| 305 | muslim | 4272 | 穆斯林；伊斯兰教徒 | 整体借入词 | 阿拉伯语 muslim，专有/整体借入词｜专有/整体借入词，无清单词素可拆 |
| 306 | spite | 4277 | 恶意；怨恨 | 日耳曼/古英语基本词 | 中古英语 despite 的缩略，源自拉丁 despicere（向下看、轻视），但现代词形 spite 已无法按清单词素逐字母切分｜整体借入并缩略，无清单内可切分的词素 |
| 307 | orbit | 4283 | 轨道；运行轨道 | 整体借入词 | 拉丁 orbita（车辙、轨道），源自 orbis（圆、轮），清单无对应词根｜整体借入词，清单无 orb 词根 |
| 308 | gin | 4284 | 杜松子酒 | 专有名词派生 | 源自荷兰语 jenever（杜松子酒）的缩略，来源为专名/借入词｜整体借入词，无可切分词素 |
| 309 | column | 4296 | 柱；专栏 | 整体借入词 | 拉丁 columna（柱），整体借入，清单无对应词根｜整体借入词，无清单内词素 |
| 310 | email | 4334 | 电子邮件 | 整体借入 / 无可用词素 | electronic mail 的缩合词，现代构词，非拉丁/希腊词素｜现代缩合词，无可切分词素 |
| 311 | label | 4351 | 标签；商标 | 来源不明 | 古法语 label（布条），来源不确定，整体借入｜整体借入词，无清单内词素 |
| 312 | tan | 4352 | 棕褐色；晒黑的肤色 | 日耳曼/古英语基本词 | 古英语 tannian，源自拉丁 tannare（鞣革），但英语形式为整体借入的日耳曼化词，无可切分的清单词素｜日耳曼/古英语基本词，无可切分的清单词素 |
| 313 | ego | 4353 | 自我；自尊心 | 代码校验拦截 | 拉丁 ego(我)｜ego(我)，整体为拉丁词根 |
| 314 | phoenix | 4355 | 凤凰；不死鸟 | 专有名词派生 | 希腊 phoinix（腓尼基人/紫红色/凤凰），整体借入专名｜整体借入的希腊专名，清单无对应词素 |
| 315 | lottery | 4357 | 彩票；抽奖 | 整体借入 / 无可用词素 | 意大利 lotteria，源自 lotto（抽签），词干 lot 不在清单｜词干 lot 不在清单，仅 -ery 后缀不足以判定 |
| 316 | establish | 4360 | 建立；确立 | 整体借入词 | 古法语 establir，源自拉丁 stabilire（使稳固），词干 stabil 不在清单｜词干 stabil 不在清单，无可切分的清单词素 |
| 317 | intimate | 4362 | 亲密的；私人的 | 整体借入 / 无可用词素 | 拉丁 intimatus，源自 intus（在内），词干 intim 不在清单｜词干 intim 不在清单，无可切分的清单词素 |
| 318 | se | 4363 | （西班牙语）自己；我 | 疑似脏数据 | 词长 2 个字母，且 freqRank 4363 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 319 | ink | 4392 | 墨水；墨汁 | 日耳曼/古英语基本词 | 古英语 inc，源自希腊 enkauston（烧入的颜料），但英语形式为整体借入｜整体借入词，无可切分的清单词素 |
| 320 | lawn | 4397 | 草坪；草地 | 日耳曼/古英语基本词 | 古法语 launde（荒地），来源不明，日耳曼基本词｜来源不明/日耳曼基本词，无可切分的清单词素 |
| 321 | messenger | 4416 | 信使；送信人 | 整体借入词 | 古法语 messager，源自拉丁 missaticum，词尾 -er 为古法语 -ier 演变，非清单后缀｜整体借入词，-er 非清单后缀，词干无对应词根 |
| 322 | disguise | 4425 | 伪装；掩饰 | 日耳曼/古英语基本词 | 古法语 desguiser（de- + guiser 装扮），来源日耳曼，非清单词素｜整体借入词，无清单词素可对应 |
| 323 | que | 4474 | 什么（法语疑问词） | 整体借入词 | 法语疑问词 que，非英语词素构成｜外来功能词，无清单词素 |
| 324 | autumn | 4489 | 秋天 | 整体借入词 | 拉丁 autumnus，整体借入，无清单词素｜整体借入词，无清单词素可对应 |
| 325 | sperm | 4495 | 精子；鲸油 | 整体借入词 | 希腊 sperma（种子），整体借入，清单无对应词根｜整体借入词，清单无对应词根 |
| 326 | savage | 4512 | 野蛮的；凶猛的 | 整体借入词 | 古法语 sauvage，源自拉丁 silvaticus（森林的），整体借入｜整体借入词，无清单词素可对应 |
| 327 | pony | 4519 | 小马 | 来源不明 | 源自苏格兰语 powny，可能来自古法语 poulenet(小马)，来源不确定｜整体借入词，清单无对应词素 |
| 328 | engage | 4535 | 从事；吸引；订婚 | 整体借入词 | 古法语 engagier，en- + gage(抵押、保证)｜整体借入词，gage 段清单无对应词素 |
| 329 | violet | 4538 | 紫罗兰；紫色 | 整体借入词 | 古法语 violette，源自拉丁 viola(紫罗兰)｜整体借入词，清单无对应词素 |
| 330 | buffalo | 4552 | 水牛；野牛 | 整体借入词 | 意大利语 bufalo，源自拉丁 bubalus，源自希腊 boubalos｜整体借入词，清单无对应词素 |
| 331 | nicer | 4564 | 更好的；更友好的 | 日耳曼/古英语基本词 | 古法语 nice(愚蠢、单纯)，来源拉丁 nescius(无知)｜日耳曼/整体借入词，-er 为比较级屈折，非清单后缀 |
| 332 | font | 4577 | 字体；洗礼池 | 日耳曼/古英语基本词 | 古英语 font，源自拉丁 fons(泉、源)｜整体借入词，清单无对应词素 |
| 333 | auto | 4587 | 汽车 | 代码校验拦截 | 希腊 autos(自己)｜auto(自己)，希腊词根 |
| 334 | carbon | 4591 | 碳 | 整体借入词 | 拉丁 carbo, carbonis（炭），整体借入｜整体借入词，清单无对应词根 |
| 335 | quest | 4605 | 探索；追求 | 代码校验拦截 | 拉丁 quaerere(寻求) 的过去分词 quaesitus → 古法语 queste｜quest(quir/quest寻求)，整体为拉丁词根 |
| 336 | echo | 4622 | 回声；共鸣 | 整体借入词 | 希腊 ekho（声音），整体借入｜整体借入词，清单无对应词根 |
| 337 | pursue | 4629 | 追求；追赶 | 整体借入词 | 古法语 poursivre，整体借入｜整体借入词，清单无对应词根 |
| 338 | assassin | 4649 | 刺客；暗杀者 | 整体借入词 | 阿拉伯 hashshashin，经中世纪拉丁/意大利语借入｜整体借入词，来源为阿拉伯语，清单无对应词根 |
| 339 | torch | 4652 | 火炬；手电筒 | 来源不明 | 古法语 torche，来源不明｜整体借入词，清单无对应词根 |
| 340 | sub | 4660 | 替补；潜艇；三明治 | 整体借入 / 无可用词素 | 拉丁 sub（在…之下），独立借入的介词/名词｜独立借入的拉丁介词，非可拆复合词 |
| 341 | riot | 4667 | 暴乱；骚乱 | 来源不明 | 古法语 riote，来源不明｜整体借入词，清单无对应词根 |
| 342 | morgue | 4678 | 太平间；停尸房 | 来源不明 | 法语 morgue，原指监狱停尸间，来源不明｜整体借入法语词，清单无对应词素 |
| 343 | panel | 4681 | 面板；专家小组 | 整体借入词 | 古法语 panel，源自拉丁 pannus(布片)，非清单词素｜整体借入词，-el 非清单后缀 |
| 344 | anxiety | 4687 | 焦虑；忧虑 | 整体借入词 | 拉丁 anxietas，源自 angere(使窒息)，清单无对应词根｜词干 anx- 不在清单，-ity 虽为后缀但词干无法归属，整体借入 |
| 345 | dice | 4692 | 骰子 | 日耳曼/古英语基本词 | 中古英语 dees，源自古法语 dé，来源不明｜日耳曼/古法语基本词，非清单词素 |
| 346 | orphan | 4693 | 孤儿 | 整体借入词 | 希腊 orphanos，经拉丁、法语借入｜整体借入词，清单无对应词素 |
| 347 | courtesy | 4713 | 礼貌；殷勤 | 整体借入词 | 古法语 cortesie，源自 cort(宫廷)，清单无对应词根｜整体借入词，-sy 非清单后缀 |
| 348 | quid | 4722 | 英镑（英俚） | 整体借入词 | 拉丁 quid(什么)，英语俚语借入｜整体借入词，清单无对应词素 |
| 349 | pose | 4727 | 摆姿势；造成 | 代码校验拦截 | 拉丁 ponere(放) → 古法语 poser｜pose(pos放，置)，拉丁词根 |
| 350 | labour | 4739 | 劳动；工党（英式） | 整体借入词 | 拉丁 labor(劳动) → 古法语 labour → 英语 labour｜整体借入词，清单无 labor 词根（r.labor 未在清单中出现） |
| 351 | calendar | 4744 | 日历；历法 | 整体借入词 | 拉丁 calendae(每月初一) → 古法语 calendier → 英语 calendar｜整体借入词，词干 calend- 与清单词根无对应 |
| 352 | regard | 4748 | 认为；注视；关于 | 整体借入词 | 古法语 regarder(看) → 英语 regard｜整体借入词，re-+gard 中 gard 段清单无对应词根 |
| 353 | hallelujah | 4796 | 哈利路亚（赞美神） | 整体借入词 | 希伯来语 hallĕlū yāh(赞美耶和华) → 英语 hallelujah｜整体借入的希伯来语宗教叹词，清单无对应词素 |
| 354 | es | 4798 | 字母S；西班牙语缩写 | 疑似脏数据 | 词长 2 个字母，且 freqRank 4798 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 355 | pudding | 4813 | 布丁 | 日耳曼/古英语基本词 | 中古英语 poding，来源不明｜日耳曼基本词/来源不明 |
| 356 | cease | 4821 | 停止；终止 | 整体借入词 | 拉丁 cessare(停止) → 古法语 cesser → 英语 cease｜整体借入词，清单无 cess 词根（r.ced 词形为 ced/cess，但语义为走/让，与停止关联弱，且词形 cess 段可对应——但整体为借入动词，保守判不可拆） |
| 357 | bribe | 4828 | 贿赂 | 日耳曼/古英语基本词 | 中古英语 bribe（乞讨物、偷窃），源自古法语 bribe，来源不明｜整体借入词，来源不明，无可拆词素 |
| 358 | lodge | 4839 | 小屋；旅舍 | 日耳曼/古英语基本词 | 中古英语 logge，源自古法语 loge，日耳曼来源｜整体借入词，无可拆词素 |
| 359 | olive | 4854 | 橄榄；橄榄色 | 整体借入词 | 拉丁 oliva，经古法语 olive 借入｜整体借入词，清单无对应词根 |
| 360 | cue | 4877 | 提示；暗示 | 来源不明 | 来源不明，可能源自拉丁 quando 的缩写或法语 queue｜来源不明，无可拆词素 |
| 361 | sketch | 4884 | 素描；草图 | 整体借入词 | 荷兰语 schets，源自意大利语 schizzo｜整体借入词，无可拆词素 |
| 362 | topic | 4888 | 话题；主题 | 整体借入词 | 拉丁 topica，源自希腊 ta topika（亚里士多德《论题篇》）｜整体借入词，清单无对应词根 |
| 363 | blond | 4894 | 金发的；浅色的 | 日耳曼/古英语基本词 | 古法语 blond，日耳曼来源｜整体借入词，无可拆词素 |
| 364 | plead | 4895 | 恳求；辩护 | 整体借入词 | 古法语 plaidier，源自拉丁 placitare｜整体借入词，无可拆词素 |
| 365 | bizarre | 4899 | 奇异的；古怪的 | 来源不明 | 法语 bizarre，源自意大利语 bizzarro，来源不明｜整体借入词，来源不明 |
| 366 | cd | 4910 | 光盘；激光唱片 | 疑似脏数据 | 词长 2 个字母，且 freqRank 4910 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 367 | puppet | 4937 | 木偶；傀儡 | 日耳曼/古英语基本词 | 中古英语 popet，源自古法语 poupette，来源不明｜整体借入词，无清单词素 |
| 368 | corridor | 4941 | 走廊；通道 | 整体借入词 | 意大利语 corridoio，源自 correre(跑)，非清单词素｜整体借入词，corr 不在清单 |
| 369 | cigar | 4961 | 雪茄 | 来源不明 | 西班牙语 cigarro，来源不明｜整体借入词，无清单词素 |
| 370 | fountain | 4975 | 喷泉；源泉 | 整体借入词 | 古法语 fontaine，源自拉丁 fons(泉)，非清单词素｜整体借入词，-ain 非清单后缀 |
| 371 | railroad | 4978 | 铁路；铁道 | 日耳曼/古英语基本词 | rail + road，均为日耳曼基本词｜日耳曼复合词，无清单词素 |
| 372 | jade | 4989 | 玉；翡翠 | 来源不明 | 西班牙语 piedra de ijada（胁痛石），来源不明｜整体借入词，清单无对应词素 |
| 373 | griffin | 4991 | 狮鹫（神话生物） | 整体借入词 | 希腊 gryps（钩喙神兽），经拉丁、法语借入｜整体借入词，清单无对应词素 |
| 374 | attic | 4999 | 阁楼；顶楼 | 专有名词派生 | 希腊 Attikos（阿提卡地区的），专有地名派生｜专有地名派生，清单无对应词素 |
| 375 | plea | 5008 | 恳求；抗辩；申诉 | 整体借入词 | 古法语 plaid/plait，源自拉丁 placitum（判决），来源复杂｜整体借入词，清单无对应词素 |
| 376 | aunty | 5015 | 阿姨；姑妈 | 日耳曼/古英语基本词 | aunt + -y，aunt 源自拉丁 amita，日耳曼/法语借入基本词｜aunt 为整体借入亲属词，-y 非清单后缀 |
| 377 | gap | 5033 | 缺口；差距；间隔 | 日耳曼/古英语基本词 | 古诺斯语 gap（裂口），日耳曼基本词｜日耳曼基本词，清单无对应词素 |
| 378 | chapel | 5036 | 小教堂；礼拜堂 | 整体借入词 | 古法语 chapele，源自拉丁 cappa（斗篷），整体借入｜整体借入词，清单无对应词素 |
| 379 | railway | 5041 | 铁路；铁道 | 日耳曼/古英语基本词 | rail（拉丁 regula 小杆）+ way（古英语 weg）｜rail[null]+way[null]，无清单词素，判不可拆 |
| 380 | dame | 5043 | 夫人；贵妇；女爵士 | 整体借入词 | 古法语 dame < 拉丁 domina(女主人)，整体借入｜整体借入词，清单无对应词素 |
| 381 | poster | 5050 | 海报；招贴画 | 日耳曼/古英语基本词 | post(柱子) + -er，日耳曼/拉丁 postis 来源，非清单词素｜post 不在清单，-er 虽在清单但词干非清单词素，整体不可拆 |
| 382 | feature | 5052 | 特征；特色；专题 | 整体借入词 | 古法语 faiture < 拉丁 facere(做)，整体借入｜整体借入词，-ure 段与清单 s.ure 语义/词形不吻合，不可拆 |
| 383 | cope | 5053 | 应对；处理 | 日耳曼/古英语基本词 | 中古英语 coupen，来源不明｜来源不明基本词 |
| 384 | tumor | 5066 | 肿瘤；肿块 | 整体借入词 | 拉丁 tumor(肿胀) < tumere，整体借入｜整体借入词，-or 非施事后缀，不可拆 |
| 385 | stadium | 5073 | 体育场；运动场 | 整体借入词 | 拉丁 stadium < 希腊 stadion，整体借入｜整体借入词，清单无对应词素 |
| 386 | pledge | 5082 | 誓言；承诺；抵押 | 来源不明 | 古法语 plege，来源不明｜整体借入词，来源不明 |
| 387 | vagina | 5096 | 阴道 | 整体借入词 | 拉丁 vagina(鞘)，整体借入｜整体借入词，清单无对应词素 |
| 388 | grain | 5107 | 谷物；颗粒 | 整体借入词 | 古法语 grain < 拉丁 granum，整体借入｜整体借入词，清单无对应词素 |
| 389 | rogue | 5124 | 流氓；无赖 | 来源不明 | 16世纪出现，来源不明，可能源自法语 rogue（傲慢的）｜来源不明，无法用清单词素切分 |
| 390 | ski | 5134 | 滑雪板；滑雪 | 日耳曼/古英语基本词 | 借自挪威语 ski（雪板），日耳曼语源｜整体借入的日耳曼词，无清单词素 |
| 391 | flavor | 5136 | 味道；风味 | 日耳曼/古英语基本词 | 中古英语 flavour，借自古法语 flaor，源自拉丁 flare（吹）｜整体借入词，清单无对应词根（fla- 非 r.flat） |
| 392 | vet | 5139 | 兽医；老兵 | 整体借入 / 无可用词素 | veterinarian 的缩略，源自拉丁 veterinarius｜缩略词，无清单词素可切 |
| 393 | canal | 5143 | 运河；水道 | 整体借入词 | 借自古法语 canal，源自拉丁 canalis（管道）｜整体借入词，清单无 can- 词根 |
| 394 | orchestra | 5147 | 管弦乐队 | 整体借入词 | 借自希腊 orkhestra（跳舞场地），来自 orkheisthai（跳舞）｜整体借入的希腊词，清单无对应词根 |
| 395 | purchase | 5154 | 购买 | 整体借入词 | 来自古法语 purchacier（追求、获得），pur- + chacier｜整体借入词，pur-/chase 段与清单词素语义不符 |
| 396 | elite | 5158 | 精英；上层集团 | 整体借入词 | 借自法语 élite，来自 élire（选择），拉丁 eligere｜整体借入的法语词，清单无对应词素 |
| 397 | whisky | 5161 | 威士忌 | 整体借入词 | 缩略自 usquebaugh，源自苏格兰盖尔语 uisge beatha（生命之水）｜盖尔语借词，无清单词素 |
| 398 | chart | 5165 | 图表；海图 | 整体借入词 | 拉丁 charta < 希腊 khartes（纸莎草纸），整体借入｜整体借入词，清单无对应词根（r.cart 虽列 chart 变体，但语义为页/纸张，此处不宜强拆） |
| 399 | resident | 5176 | 居民；住户 | 代码校验拦截 | 拉丁 re-（回、再）+ sedere（坐）→ residere（留下、居住）+ -ent｜re(回)+sid(坐，r.sed 变体)+ent(人)：坐下留下→居民 |
| 400 | triumph | 5185 | 胜利；凯旋 | 整体借入词 | 拉丁 triumphus，整体借入｜整体借入词，无可拆词素 |
| 401 | nun | 5186 | 修女；尼姑 | 日耳曼/古英语基本词 | 古英语 nunne < 拉丁 nonna，日耳曼/教会借词｜基本词，无可拆词素 |
| 402 | fierce | 5203 | 凶猛的；激烈的 | 整体借入词 | 古法语 fers/fier < 拉丁 ferus(野的)，整体借入｜整体借入形容词，无可拆词素 |
| 403 | delta | 5223 | 三角洲；希腊字母Δ | 专有名词派生 | 希腊字母 delta，整体借入｜专名/字母借词，无可拆词素 |
| 404 | dose | 5226 | 剂量；一剂 | 整体借入词 | 希腊 dosis(给予) → 法语 dose，整体借入｜整体借入词，清单无对应词根 |
| 405 | bugger | 5229 | 讨厌鬼；家伙 | 专有名词派生 | 源自中世纪拉丁 Bulgarus（保加利亚人，异教徒），经古法语 bougre 借入，非清单词素构成｜整体借入词，源自专名/民族名，清单无对应词素 |
| 406 | wardrobe | 5250 | 衣柜；全部衣物 | 日耳曼/古英语基本词 | 古北法语 warderobe，warder（看守，日耳曼来源）+ robe（袍），非清单拉丁/希腊词素｜日耳曼来源复合词，清单无对应词素 |
| 407 | disco | 5255 | 迪斯科；迪厅 | 整体借入词 | discotheque 的缩略，源自希腊 diskos（圆盘）+ theke（箱），非清单词素直接构成｜缩略词，整体借入，清单无对应词素 |
| 408 | pumpkin | 5260 | 南瓜 | 整体借入词 | 源自希腊 pepon（成熟瓜），经法语 pompon 改造，词尾 -kin 为民间词源误加，非清单词素｜整体借入词，词尾 -kin 非清单后缀 |
| 409 | urge | 5265 | 催促；强烈欲望 | 整体借入词 | 源自拉丁 urgere（推、压），整体借入，清单无对应词根｜整体借入词，清单无对应词素 |
| 410 | blanche | 5269 | （使）变白；漂白 | 日耳曼/古英语基本词 | 法语 blanche（白色的，阴性），源自日耳曼 blank，非清单词素｜整体借入法语词，清单无对应词素 |
| 411 | ceo | 5272 | 首席执行官 | 整体借入 / 无可用词素 | Chief Executive Officer 的首字母缩略词｜首字母缩略词，非词素构成 |
| 412 | canyon | 5296 | 峡谷 | 整体借入词 | 西班牙语 cañón(管、峡谷)，来源为拉丁 canna(管)，非清单词素｜整体借入词，无清单词素 |
| 413 | pigeon | 5305 | 鸽子 | 整体借入词 | 古法语 pijon < 拉丁 pipio(雏鸟)，来源为拟声，非清单词素｜整体借入词，无清单词素 |
| 414 | treason | 5311 | 叛国；背叛 | 整体借入词 | 古法语 traison < 拉丁 traditio(交出、背叛)，词干非清单词素｜整体借入词，无清单词素 |
| 415 | violin | 5313 | 小提琴 | 专有名词派生 | 意大利语 violino，源自 viola(维奥尔琴)，来源为专名/借入词｜整体借入词，无清单词素 |
| 416 | realm | 5315 | 领域；王国 | 整体借入词 | 古法语 reaume < 拉丁 regimen(统治)，词干非清单词素｜整体借入词，无清单词素 |
| 417 | tuna | 5320 | 金枪鱼 | 整体借入词 | 西班牙语 atún < 阿拉伯语，来源非清单词素｜整体借入词，无清单词素 |
| 418 | jelly | 5331 | 果冻；果酱 | 整体借入词 | 古法语 gelee < 拉丁 gelare(冻结)，词干非清单词素｜整体借入词，无清单词素 |
| 419 | lounge | 5333 | 休息室；候机厅 | 来源不明 | 来源不明，可能源自法语 s'allonger(躺下)，非清单词素｜来源不明/整体借入词，无清单词素 |
| 420 | cha | 5334 | 茶（口语） | 整体借入词 | 源自汉语「茶」的音译（tea 的另一种借入形式），非拉丁/希腊词素构成｜整体借入词，无清单词素 |
| 421 | hogan | 5336 | 纳瓦霍人泥盖木屋 | 整体借入 / 无可用词素 | 源自纳瓦霍语 hooghan，指纳瓦霍人传统住所｜来源为美洲原住民语言，非拉丁/希腊词素 |
| 422 | courtroom | 5344 | 法庭；审判室 | 日耳曼/古英语基本词 | court(古法语 cort，庭院) + room(古英语 rūm)，均为日耳曼/古法语基本词复合｜复合词两部分均非清单词素，court 与 room 皆整体借入/日耳曼基本词 |
| 423 | slaughter | 5362 | 屠杀；屠宰 | 日耳曼/古英语基本词 | 古诺斯语 slátr(屠宰) + 古英语 -sleht，日耳曼基本词｜日耳曼基本词，非拉丁/希腊词素 |
| 424 | marijuana | 5363 | 大麻 | 来源不明 | 源自墨西哥西班牙语 marihuana，来源不明｜整体借入词，来源不明 |
| 425 | karma | 5378 | 因果报应；业力 | 整体借入词 | 源自梵语 karman(行为、业)，非拉丁/希腊词素｜整体借入词，来源为梵语 |
| 426 | info | 5381 | 信息（口语） | 整体借入 / 无可用词素 | information 的口语缩略形式，缩略后无法按词素完整切分｜缩略词，无法逐字母切分覆盖 |
| 427 | vow | 5390 | 誓言；誓约 | 日耳曼/古英语基本词 | 中古英语 vou，源自古法语 vou，源自拉丁 votum（誓愿），但现代词形 vow 为整体借入，清单无对应词根｜整体借入词，清单无对应词素 |
| 428 | dvd | 5392 | 数字影碟 | 整体借入 / 无可用词素 | 缩写词（Digital Versatile Disc），非词素构成｜缩写词，不可拆 |
| 429 | non | 5427 | 非；不（前缀性否定） | 整体借入词 | 拉丁 non（不），但作为独立英语词为整体借入，清单中 p.non 为前缀而非独立词｜独立小品词，非可拆词素组合 |
| 430 | bounty | 5446 | 赏金；慷慨 | 整体借入词 | 源自古法语 bonté（善行），源自拉丁 bonitas，但现代词形 bounty 为整体借入，清单无对应词根｜整体借入词，清单无对应词素 |
| 431 | asylum | 5451 | 庇护；避难所 | 整体借入词 | 拉丁 asylum，源自希腊 asylon（不可侵犯之地），a-（不）+ syle（夺取权），清单无对应词根｜整体借入词，清单无对应词素 |
| 432 | duel | 5453 | 决斗 | 整体借入词 | 源自拉丁 duellum（战争），与 duo（二）相关，但现代词形 duel 为整体借入，清单无对应词根｜整体借入词，清单无对应词素 |
| 433 | consult | 5455 | 咨询；请教 | 整体借入词 | 拉丁 consultare（商议），整体借入，con- 在此为加强前缀但词干 sult 无清单对应词根｜整体借入词，sult 段无清单词素可对应，不硬拆 |
| 434 | au | 5457 | 金（化学符号Au）；澳式 | 疑似脏数据 | 词长 2 个字母，且 freqRank 5457 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |
| 435 | baba | 5458 | 爸爸（儿语）；一种糕点 | 来源不明 | 借入词（多种语言中表“祖母/糕点”等），来源不明｜来源不明，无清单词素 |
| 436 | te | 5464 | （音名）西；茶（西语） | 疑似脏数据 | 词长 2 个字母，且 freqRank 5464 排在全库前 6000，怀疑是缩写/切词错误产生的脏词条，不予拆解 |

## 词素缺口（missingTop）

| 缺失词素 | 被引用次数 |
|---|---|
| clar=清楚，明亮（清单无对应词根） | 1 |
| velop=包裹（清单无对应词根） | 1 |
| exempl=样本（清单无对应词根） | 1 |
| anuier=使厌烦（清单无对应词根） | 1 |
| travailler=劳作、旅行（清单无对应词根） | 1 |
| lev=举起（清单无对应词根） | 1 |
| lectio=读（清单无对应词根） | 1 |
| -ie=昵称后缀（清单无） | 1 |
| thea=观看（清单无对应词根） | 1 |
| tragos=山羊 | 1 |
| ōidē=歌 | 1 |
| fournir=供应（清单无对应词根） | 1 |
| ingenium=天赋（清单无对应词根） | 1 |
| schola=学校（清单无对应词根） | 1 |
| fascinare=施魔法（清单无对应词根） | 1 |
| audire=听（清单 r.aud 词形对不上 ey 段） | 1 |
| stratos=军队 | 1 |
| agein=引导 | 1 |
| talent=才能（清单无对应词根） | 1 |
| ping/pict=画（清单无对应词根） | 1 |
| direct=引导（清单无对应词根） | 1 |
| plata=薄板（清单无对应词根） | 1 |
| computare=计算（清单无对应词根） | 1 |
| legare=委派（清单无对应词根） | 1 |
| pagina=页（清单无对应词根） | 1 |
| koek=蛋糕（清单无对应词根） | 1 |
| patata=马铃薯（清单无对应词根） | 1 |
| poiein=制作（清单无对应词根） | 1 |
| septem=七（清单无对应词根） | 1 |
| battre=打（清单无对应词根） | 1 |
| kine=运动（清单有 r.kine 但词形对不上 cinema 的 cine-） | 1 |
| pilula=小球（清单无对应词素） | 1 |
| poie=做，制作（清单无对应词根） | 1 |
| intra=向内（清单无对应词根） | 1 |
| tray=交出/背叛（拉丁 tradere，清单无对应词根） | 1 |
| delectare=愉悦（清单无对应词根） | 1 |
| advanc=前进（清单无对应词根） | 1 |
| rosa=玫瑰（清单无对应词根） | 1 |
| gentilis=出身好、温和（清单无对应词根） | 1 |
| cant=唱（清单无对应词根） | 1 |

## 巡检发现的数据问题

### 极短词条疑似脏数据（21）

这些词排在 freqRank 前 6000 却只有 1~2 个字母，怀疑是缩写/切词错误被当成了单词；已直接判为不可拆，建议单独清洗。

```
le(2513,「乐（音译用字）」)
st(2600,「街（street 缩写）」)
ad(2642,「广告（缩写）」)
ii(2717,「二（罗马数字）」)
ex(2724,「前任；前配偶」)
li(2891,「里（中国长度单位）」)
ln(2917,「自然对数（ln）」)
mi(3257,「大调音阶第三音」)
fu(3258,「（中文音译）夫；福」)
en(3456,「半角字母 n；恩（音译）」)
pm(3461,「首相；下午」)
et(3548,「和（拉丁语）；外星人」)
ay(3622,「唉；是（表决用语）」)
si(3628,「西（音阶唱名）」)
un(3764,「家伙；东西（方言/口语）」)
ja(4192,「是（德语/荷兰语“是”）」)
se(4363,「（西班牙语）自己；我」)
es(4798,「字母S；西班牙语缩写」)
cd(4910,「光盘；激光唱片」)
au(5457,「金（化学符号Au）；澳式」)
te(5464,「（音名）西；茶（西语）」)
```

### 与上一轮 scripts/.queue-loan-cache.json 判定不一致（40）

词素表已从 757 增至 982 条（新增 s.al 等），部分结论变化属正常；不一致项建议优先人工复核。

```
relief: 旧=uncertain → 新=low
wailing: 旧=decomposable → 新=low
furniture: 旧=not-decomposable → 新=low
engineer: 旧=not-decomposable → 新=low
schools: 旧=not-decomposable → 新=low
obey: 旧=not-decomposable → 新=low
colleague: 旧=not-decomposable → 新=low
cookies: 旧=not-decomposable → 新=low
potatoes: 旧=not-decomposable → 新=low
poetry: 旧=not-decomposable → 新=low
humor: 旧=not-decomposable → 新=low
betray: 旧=not-decomposable → 新=low
contrary: 旧=uncertain → 新=low
gently: 旧=uncertain → 新=low
chanting: 旧=decomposable → 新=low
ancestors: 旧=decomposable → 新=low
fried: 旧=decomposable → 新=low
rumors: 旧=decomposable → 新=low
november: 旧=uncertain → 新=none
cocaine: 旧=not-decomposable → 新=low
euros: 旧=decomposable → 新=low
rolls: 旧=decomposable → 新=low
mature: 旧=not-decomposable → 新=high
jewels: 旧=decomposable → 新=low
domestic: 旧=not-decomposable → 新=low
qualified: 旧=uncertain → 新=low
sexually: 旧=uncertain → 新=low
equally: 旧=uncertain → 新=high
rupees: 旧=not-decomposable → 新=low
classified: 旧=uncertain → 新=low
```

### 新手队列前 3000 词里同形重复词条（1）

同一词形有多个词条且都未被 words-lemma.js 折叠，学习队列里会出现内容重复的卡。

```
email ×2 (w.e-mail,w.email)
```

### 应折叠却未折叠的屈折形（占着独立学习单元名额）（87）

词干已在库但 w.lemma 为空，既没被 words-lemma.js 折叠，也没有构词拆解；建议补进 words-lemma.js，或至少给一条 X + s.ed/s.ing/s.plural 的 chain。

```
cleared ← clear
developed ← develop
annoying ← annoy
traveling ← travel
lessons ← lesson
sets ← set
classes ← class
wailing ← wail
chaos ← chao
schools ← school
fascinating ← fascinate
talented ← talent
painted ← paint
dressing ← dress
pajamas ← pajama
plates ← plat
counts ← count
pages ← page
cookies ← cookie
potatoes ← potato
obsessed ← obsess
entering ← enter
delighted ← delight
advanced ← advance
roses ← ros
pockets ← pocket
chanting ← chant
ancestors ← ancestor
fried ← fri
rumors ← rumor
```

### 词根 / 前缀「双身份」条目（可能是有意为之，提请注意）（2）

同一个拉丁基础既登记了词根 r.* 又登记了前缀 p.*，且词形集合相交 —— 这通常是刻意设计，但会让「哪段归哪个 id」出现二义性。

```
r.bene(bene/bon) ↔ p.bene(bene) 共有变体 bene｜义「好，善」
r.mal(mal/male) ↔ p.mal(mal) 共有变体 mal｜义「坏，恶」
```

### 词素缺变体 ⇒ 有依据的拆解被硬校验拦下（8）

这些词的词源是对的，只是词素表没登记该异体形式。要么给对应词素补 variants，要么人工确认后放行。本次一律按 none 处理（宁可不拆）。

```
resident: 段形 "sid" 与 r.sed(sed) 不匹配
ally: 段形 "ly" 与 r.lig(lig) 不匹配
maximum: 段形 "maxim" 与 r.magn(magn) 不匹配
deceased: 段形 "ceas" 与 r.ced(ced) 不匹配
residents: 段形 "sid" 与 r.sed(sed) 不匹配
sample: 段形 "ple" 与 s.able(able) 不匹配
appeal: 段形 "peal" 与 r.pell(pell) 不匹配
basis: 段形 "is" 与 s.plural(s) 不匹配
```


---

★ 本清单为**候选**，未落库。`src/data/` 下任何文件均未修改，也未 commit。