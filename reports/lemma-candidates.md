# 补全 lemma 折叠 · 候选清单

> 由 `scripts/gen-lemma-candidates.mjs` 生成，**只读**，未写入 `src/data/words-lemma.js`。
> 折叠 = 把变形形的「学习记录」并到代表形。判错一次就是把记录并到错误的词上，比不折叠更糟。

## 为什么不出手直接补

检测器在已审 draft（13,183 对）上的精确率：

| 主键 | 精确率 |
|---|---|
| 形态学优先 | **98.74%** |
| 有 chain 优先 | 98.70% |
| 词频优先 | 98.38% |

两边都会错，且参考基准 draft 自身也含错例（`putting→putt`、`feels→felt`、`falls→fell`、`better→good`）。
按 2,168 条 × 约 1.3% 估算，**约有 28 个错误折叠**——不可接受，故只出清单。

## 分级口径

- **T1 自动安全** — 原形来自手写不规则表（不靠启发式猜）+ 变形形不比原形常用。判据不依赖检测器的判断力。
- **T2 待复核** — 原形靠形态规则推断，需逐词人工确认。
- **T3 不建议** — 变形形比原形更常用，折叠会把学习者推到冷僻原形。

## 统计

| 桶 | 条数 | 占比 |
|---|---|---|
| T1 自动安全 | **0** | 0.0% |
| T2 待复核 | 2147 | 82.4% |
| T3 不建议 | 459 | 17.6% |

已折叠 9888 条；draft 里已判定过（故不在本清单）3043 条。

其中「折叠后学习单元有 chain」的数量（直接受益于「按词素学习」）：

- T1：**0** / 0
- T2：298 / 2147

## T1 · 自动安全（不规则形，判据不依赖检测器）

原形来自 `scripts/lib/base-form.mjs` 的手写 `IRREGULAR` 表。

（空）

## T2 · 待复核（形态规则推断，需人工确认）

| form | → 原形 | form rank | 原形 rank | 有chain | 折叠后有chain |
|---|---|---|---|---|---|
| properly | proper | 1706 | 1469 | — | **✓** |
| reporter | report | 1826 | 500 | — | **✓** |
| previously | previous | 1919 | 1500 | — | **✓** |
| normally | normal | 1929 | 581 | — | **✓** |
| entirely | entire | 1966 | 554 | — | **✓** |
| naturally | natural | 2002 | 1046 | — | **✓** |
| particularly | particular | 2127 | 1468 | — | **✓** |
| partly | part | 7056 | 269 | — | **✓** |
| tender | tend | 7971 | 900 | — | **✓** |
| marker | mark | 8316 | 5994 | — | **✓** |
| parenting | parent | 9334 | 2841 | — | **✓** |
| financially | financial | 9439 | 2296 | — | **✓** |
| professionally | professional | 9478 | 1386 | — | **✓** |
| surroundings | surrounding | 9483 | 5266 | — | **✓** |
| destroyer | destroy | 9547 | 900 | — | **✓** |
| exclusively | exclusive | 10193 | 4309 | — | **✓** |
| partially | partial | 10547 | 6466 | — | **✓** |
| pager | page | 11150 | 8247 | — | **✓** |
| formerly | former | 12087 | 1682 | — | **✓** |
| charger | charge | 12545 | 6753 | — | **✓** |
| negroes | negro | 12585 | 6805 | — | **✓** |
| endlessly | endless | 12669 | 5000 | — | **✓** |
| magically | magical | 13048 | 3076 | — | **✓** |
| undertaker | undertake | 13532 | 4000 | — | **✓** |
| locally | local | 14682 | 941 | — | **✓** |
| manually | manual | 14889 | 4624 | — | **✓** |
| mutually | mutual | 14903 | 4539 | — | **✓** |
| hopelessly | hopeless | 14925 | 6000 | — | **✓** |
| entertainer | entertain | 15003 | 5478 | — | **✓** |
| discreetly | discreet | 15015 | 13400 | — | **✓** |
| fester | fest | 15244 | 14254 | — | **✓** |
| miraculously | miraculous | 15409 | 14000 | — | **✓** |
| visually | visual | 15524 | 3704 | — | **✓** |
| independently | independent | 15603 | 3284 | — | **✓** |
| internally | internal | 15968 | 2885 | — | **✓** |
| logically | logical | 16077 | 4588 | — | **✓** |
| inhaler | inhale | 16394 | 10197 | — | **✓** |
| anonymously | anonymous | 16468 | 3630 | — | **✓** |
| archers | archer | 16669 | 4426 | — | **✓** |
| excitedly | excited | 16686 | 908 | — | **✓** |
| spontaneously | spontaneous | 16795 | 9000 | — | **✓** |
| financials | financial | 16844 | 2296 | — | **✓** |
| efficiently | efficient | 17046 | 5359 | — | **✓** |
| ideally | ideal | 17452 | 3434 | — | **✓** |
| radically | radical | 17466 | 5212 | — | **✓** |
| aggressively | aggressive | 17482 | 3700 | — | **✓** |
| filly | file | 17557 | 12000 | — | **✓** |
| appropriately | appropriate | 17599 | 3016 | — | **✓** |
| famously | famous | 17628 | 800 | — | **✓** |
| adventurer | adventure | 17657 | 2500 | — | **✓** |
| betrayer | betray | 17779 | 3174 | — | **✓** |
| promoter | promote | 17780 | 6856 | — | **✓** |
| gracefully | graceful | 17863 | 11017 | — | **✓** |
| hysterically | hysterical | 17885 | 6002 | — | **✓** |
| spiritually | spiritual | 17988 | 3509 | — | **✓** |
| consciously | conscious | 18274 | 12050 | — | **✓** |
| unofficially | unofficial | 18337 | 15207 | — | **✓** |
| gravely | grave | 18439 | 1515 | — | **✓** |
| frightfully | frightful | 18544 | 15150 | — | **✓** |
| caper | cape | 18774 | 4551 | — | **✓** |
| graciously | gracious | 18788 | 5361 | — | **✓** |
| reluctantly | reluctant | 18842 | 6500 | — | **✓** |
| stupidly | stupid | 18883 | 368 | — | **✓** |
| prematurely | premature | 18936 | 9160 | — | **✓** |
| voter | vote | 19002 | 1036 | — | **✓** |
| evilly | evil | 19020 | 692 | — | **✓** |
| unconditionally | unconditional | 19098 | 15206 | — | **✓** |
| famed | fame | 19156 | 3708 | — | **✓** |
| particulars | particular | 19611 | 1468 | — | **✓** |
| delicately | delicate | 19856 | 3283 | — | **✓** |
| reportedly | reported | 19927 | 2219 | — | **✓** |
| intellectually | intellectual | 20034 | 5904 | — | **✓** |
| internationally | international | 20074 | 1200 | — | **✓** |
| anxiously | anxious | 20088 | 12200 | — | **✓** |
| enforcer | enforce | 20463 | 12037 | — | **✓** |
| criminally | criminal | 20604 | 1097 | — | **✓** |
| humanly | human | 20627 | 12000 | — | **✓** |
| organizer | organize | 20708 | 2000 | — | **✓** |
| decently | decent | 20784 | 1693 | — | **✓** |
| notoriously | notorious | 20973 | 12500 | — | **✓** |
| recklessly | reckless | 21202 | 10000 | — | **✓** |
| objectively | objective | 21300 | 12800 | — | **✓** |
| grader | grade | 21548 | 8325 | — | **✓** |
| carelessly | careless | 21624 | 5500 | — | **✓** |
| decidedly | decided | 21702 | 506 | — | **✓** |
| artificially | artificial | 21705 | 12000 | — | **✓** |
| pleasantly | pleasant | 21793 | 2465 | — | **✓** |
| laborer | labor | 21834 | 3115 | — | **✓** |
| unconsciously | unconscious | 21863 | 7000 | — | **✓** |
| mover | move | 21907 | 8091 | — | **✓** |
| curiously | curious | 22005 | 3000 | — | **✓** |
| biologically | biological | 22012 | 4874 | — | **✓** |
| explicitly | explicit | 22074 | 14751 | — | **✓** |
| mercilessly | merciless | 22190 | 15700 | — | **✓** |
| rudely | rude | 22371 | 5514 | — | **✓** |
| aimlessly | aimless | 22408 | 16200 | — | **✓** |
| unjustly | unjust | 22645 | 15700 | — | **✓** |
| vividly | vivid | 22830 | 6000 | — | **✓** |
| economically | economical | 22856 | 20612 | — | **✓** |
| subconsciously | subconscious | 22888 | 9117 | — | **✓** |
| trillions | trillion | 22934 | 11531 | — | **✓** |
| musically | musical | 23006 | 3066 | — | **✓** |
| unanimously | unanimous | 23081 | 13000 | — | **✓** |
| unwittingly | unwitting | 23283 | 19000 | — | **✓** |
| chemically | chemical | 23467 | 3227 | — | **✓** |
| splendidly | splendid | 23564 | 3459 | — | **✓** |
| definitively | definitive | 23582 | 14300 | — | **✓** |
| vigorously | vigorous | 23734 | 13600 | — | **✓** |
| expressly | express | 23747 | 2142 | — | **✓** |
| securely | secure | 23822 | 1955 | — | **✓** |
| culturally | cultural | 23851 | 4779 | — | **✓** |
| profiler | profile | 24019 | 2719 | — | **✓** |
| mathematically | mathematical | 24149 | 9609 | — | **✓** |
| affectionately | affectionate | 24168 | 11846 | — | **✓** |
| extensively | extensive | 24176 | 10500 | — | **✓** |
| meticulously | meticulous | 24185 | 13600 | — | **✓** |
| modeled | model | 24271 | 8724 | — | **✓** |
| cautiously | cautious | 24417 | 6959 | — | **✓** |
| fatally | fatal | 24633 | 4177 | — | **✓** |
| adequately | adequate | 24701 | 10609 | — | **✓** |
| … | 另有 2027 条 | | | | |

## T3 · 不建议（变形形比原形更常用）

| form | → 原形 | form rank | 原形 rank | 有chain | 折叠后有chain |
|---|---|---|---|---|---|
| really | real | 74 | 193 | — | — |
| something | someth | 81 | 40773 | — | — |
| never | neve | 88 | 35426 | — | — |
| after | aft | 122 | 12874 | — | — |
| always | alway | 134 | 40899 | — | — |
| mother | moth | 167 | 4302 | — | — |
| actually | actual | 201 | 1950 | — | — |
| brother | broth | 213 | 4707 | — | — |
| matter | matte | 228 | 26981 | — | — |
| exactly | exact | 272 | 1779 | — | — |
| under | und | 273 | 10937 | — | — |
| power | pow | 358 | 7844 | — | — |
| water | wat | 370 | 17641 | — | — |
| sometimes | sometime | 371 | 1873 | — | — |
| dinner | din | 391 | 13147 | — | — |
| finally | final | 432 | 768 | — | — |
| master | mast | 444 | 13908 | — | — |
| absolutely | absolute | 477 | 2743 | — | — |
| darling | darl | 484 | 29437 | — | — |
| completely | complete | 523 | 600 | ✓ | — |
| totally | total | 524 | 1179 | — | — |
| definitely | definite | 531 | 6276 | — | — |
| certainly | certain | 533 | 604 | ✓ | — |
| letter | lett | 568 | 44918 | — | — |
| quickly | quick | 595 | 1520 | — | — |
| cover | cove | 603 | 8741 | — | — |
| honest | hon | 650 | 3699 | — | — |
| obviously | obvious | 679 | 2500 | — | — |
| besides | beside | 682 | 2514 | — | — |
| congratulations | congratulation | 704 | 12200 | ✓ | — |
| immediately | immediate | 737 | 3444 | ✓ | — |
| computer | compute | 745 | 13000 | ✓ | — |
| arrest | arr | 753 | 25983 | — | — |
| suddenly | sudden | 755 | 1335 | — | — |
| usually | usual | 756 | 1166 | — | — |
| summer | sum | 769 | 3753 | — | — |
| press | pres | 788 | 26866 | ✓ | — |
| danger | dang | 894 | 5290 | — | — |
| interest | inter | 899 | 23521 | — | — |
| apparently | apparent | 907 | 6776 | — | — |
| simply | simp | 923 | 47477 | — | — |
| driver | drive | 938 | 5742 | — | — |
| commander | command | 967 | 12100 | ✓ | — |
| princess | princes | 973 | 8592 | ✓ | — |
| clearly | clear | 978 | 8070 | — | — |
| corner | corn | 981 | 4548 | ✓ | — |
| leader | lead | 996 | 8100 | — | — |
| morning | morn | 1020 | 11939 | — | — |
| manager | manage | 1035 | 1306 | ✓ | — |
| career | care | 1039 | 5421 | ✓ | — |
| super | sup | 1041 | 14743 | — | — |
| towards | toward | 1055 | 2280 | — | — |
| nearly | near | 1064 | 1480 | — | — |
| center | cent | 1080 | 4742 | — | — |
| truly | true | 1100 | 1340 | — | — |
| discuss | discus | 1125 | 41194 | ✓ | — |
| unfortunately | unfortunate | 1156 | 3120 | — | — |
| mister | mist | 1197 | 5610 | — | — |
| lately | late | 1211 | 1510 | — | — |
| recently | recent | 1252 | 2324 | — | — |
| barely | bare | 1348 | 5229 | — | — |
| player | play | 1455 | 2608 | — | — |
| proper | prop | 1469 | 8092 | ✓ | — |
| eventually | eventual | 1478 | 13400 | — | — |
| carefully | careful | 1488 | 7947 | — | — |
| winner | win | 1567 | 2680 | — | — |
| extremely | extreme | 1643 | 2714 | — | — |
| chatter | chat | 1647 | 1972 | — | — |
| literally | literal | 1656 | 12607 | — | — |
| deeply | deep | 1662 | 6204 | — | — |
| former | forme | 1682 | 38718 | ✓ | — |
| motherfucker | motherfuck | 1687 | 28562 | — | — |
| flower | flow | 1701 | 2566 | — | — |
| directly | direct | 1710 | 12300 | — | — |
| announcer | announce | 1728 | 3476 | ✓ | — |
| series | serie | 1785 | 45756 | ✓ | — |
| tower | tow | 1797 | 6659 | — | — |
| stairs | stair | 1825 | 4878 | — | — |
| writer | write | 1888 | 2656 | — | — |
| tiger | tig | 1990 | 17129 | — | — |
| refer | ref | 2000 | 12532 | ✓ | — |
| hunter | hunt | 2035 | 5997 | — | — |
| quarter | quart | 2082 | 20827 | — | — |
| supply | supp | 2108 | 45042 | ✓ | — |
| hopefully | hopeful | 2109 | 7923 | — | — |
| customer | custom | 2167 | 5045 | ✓ | — |
| singer | singe | 2195 | 41171 | — | — |
| commissioner | commission | 2220 | 2988 | ✓ | — |
| afterwards | afterward | 2241 | 11909 | — | — |
| practically | practical | 2291 | 3595 | — | — |
| contest | cont | 2340 | 44866 | ✓ | — |
| trigger | trig | 2367 | 26433 | — | — |
| frankly | frank | 2369 | 5448 | — | — |
| headquarters | headquarter | 2411 | 27006 | — | — |
| miller | mille | 2428 | 27999 | — | — |
| slightly | slight | 2578 | 3890 | — | — |
| precisely | precise | 2606 | 3500 | ✓ | — |
| merely | mere | 2609 | 3744 | ✓ | — |
| apply | app | 2684 | 6836 | ✓ | — |
| technically | technical | 2712 | 3937 | ✓ | — |
| chaos | chao | 2727 | 14289 | — | — |
| softly | soft | 2783 | 6219 | — | — |
| supper | supp | 2853 | 45042 | — | — |
| fighter | fight | 2858 | 6318 | — | — |
| locker | lock | 2924 | 4899 | — | — |
| pajamas | pajama | 2936 | 21747 | ✓ | — |
| constantly | constant | 2936 | 3208 | ✓ | — |
| nicely | nice | 2938 | 5505 | ✓ | — |
| cookies | cookie | 3032 | 3191 | ✓ | — |
| baker | bake | 3109 | 4722 | — | — |
| inner | inn | 3155 | 3631 | — | — |
| counter | count | 3196 | 8328 | — | — |
| temper | temp | 3243 | 8851 | — | — |
| poker | poke | 3253 | 5971 | — | — |
| sober | sob | 3275 | 12186 | — | — |
| gently | gent | 3311 | 16645 | ✓ | — |
| backwards | backward | 3317 | 12400 | ✓ | — |
| soccer | soc | 3405 | 40244 | — | — |
| fairly | fair | 3423 | 5436 | — | — |
| burger | burg | 3499 | 30283 | — | — |
| … | 另有 339 条 | | | | |
