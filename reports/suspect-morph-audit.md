# 可疑词源审计清单（root 被当成 suffix 用）

> 由 `scripts/gen-suspect-morph-audit.mjs` 生成，只读，不改任何数据文件。
> 已修掉的是「同一词 root 与 suffix 双挂」的显性冲突（2026-10-14，56 词）。
> 本清单是剩下的**单挂**可疑用法：形态上像后缀，却挂了词根 id。
> **红线：错的词源比没有更糟——必须逐词考证，不可批量替换。**

## r.ment（root，form `ment`） vs s.ment（suffix）

- **r.ment 声称的地盘**（note）：心，思想，精神　——　⚠️ 只收拉丁 mens / mentis「心」：mental / mention（想到、说出）/ mentor / mentality / dementia / amentia。词尾 -ment（comment、management）不是本词根，而是拉丁名词后缀 -mentum，见 s.ment。
- **s.ment 的地盘**（note）：名词后缀：结果、产物、手段、行为　——　拉丁名词中缀 -mentum「工具、手段、行为之结果」，经古法语 -ment 进入英语：development、amazement、government。⚠️ 与拉丁词根 r.ment（mens「心」）形同义不同，不要混为一谈：comment / management / document / parliament / equipment / experiment / fragment 归本后缀，mental / mention / mentor / mentality 归 r.ment。
- 全库挂 r.ment 的词：**47**　其中 note 点名 8 / 未点名 39

### ✅ note 点名过（大概率合法，8）

mentality · mentor · amentia · ament · mention · mental · dementia · ment

### ⚠️ note 未点名（需逐词考证，39）

demented(r20000) · dementation(r29800) · menticide(r31200) · dementive(r31000) · dementing(r29000) · mentation(r24000) · mentative(r27000) · mentally(r12500) · menticulture(r30400) · pachymeningitis(r31000) · menthol(r17000) · mentiferous(r30100) · mentimeter(r31400) · temporomental(r32100) · mentimutation(r30900) · withdrawalment(r32000) · quasigovernment(r19500) · mentilumin(r31750) · garment(r5046) · mentioned(r1416) · treatment(r1638) · environment(r2468) · announcement(r3575) · dimension(r5337) · immense(r7558) · measurement(r16409) · parchment(r19306) · reinforcement(r20013) · impediment(r23187) · amazement(r24413) · pigment(r24604) · assortment(r26168) · embankment(r26408) · mentoring(r29188) · mentalist(r35728) · mentored(r42283) · appeasement(r43258) · commensurate(r46614) · unmentionable(r47654)

## r.al（root，form `al`） vs s.al（suffix）

- **r.al 声称的地盘**（note）：养育，滋养　——　aliment（食物）、alimony（赡养费）。
- **s.al 的地盘**（note）：形容词/名词后缀：…的，与…有关的；动作、结果　——　internal（内部的）、global（全球的）、musical（音乐的）、arrival（到达）、rehearsal（排练）。⚠️ -ical / -ual 是 -ic / -u- 与 -al 的复合，切分时只把末尾 -al 归本条（如 musical = music + al、spiritual = spiritu + al），**不要**把 ical / ual 当成 s.al 的变体——否则会重现「段形与变体互为子串」的误判漏洞（曾把 -al 错贴到 s.ic 上）。
- 全库挂 r.al 的词：**152**　其中 note 点名 1 / 未点名 151

### ✅ note 点名过（大概率合法，1）

alimony

### ⚠️ note 未点名（需逐词考证，151）

international(r1200) · subliminal(r14800) · transcontinental(r16500) · mistrial(r17500) · inimical(r18500) · denationalize(r20800) · unnatural(r12500) · interpersonal(r12600) · transpersonal(r22000) · transcultural(r17600) · subtropical(r15400) · sublingual(r18200) · uncritical(r13400) · unilateral(r14200) · metaphysical(r15000) · multilateral(r14000) · neoclassical(r17000) · bilingual(r13000) · homicidal(r16000) · hypercritical(r22900) · bilingualism(r21100) · withdrawal(r14500) · multinational(r13900) · intrapleural(r29000) · intrathecal(r29000) · extramural(r19000) · bilateralism(r23000) · syncytial(r30000) · hemihedral(r31500) · infracostal(r28000) · infrarenal(r30500) · exoperidermal(r29400) · contrapuntal(r27800) · quasi-governmental(r20500) · bifocal(r18400) · bilateral(r13400) · circumlittoral(r31800) · hypoglossal(r30600) · stepparental(r24600) · triconsonantal(r28600) · cataclysmal(r19800) · catarrhal(r24800) · coalesce(r15800) · alimentary(r18900) · alimentation(r22600) · neocerebellum(r26800) · phrasal(r18600) · alible(r31600) · alimentiveness(r33400) · heptagonal(r26500) · quadrilateral(r17000) · vicecomital(r26000) · natal(r19800) · rhinalgia(r31000) · nourish(r12600) · alimental(r23000) · aliferous(r31700) · alimonious(r27000) · postglacial(r22000) · hemiglossal(r31000) · cynicidal(r31200) · circummural(r29500) · circumnasal(r30000) · alundum(r31000) · retroperitoneal(r26000) · megafaunal(r23000) · alençon(r24800) · alimentotherapy(r29000) · infraorbital(r26500) · infralingual(r29000) · intravesical(r27500) · intraabdominal(r23500) · alimentativeness(r29000) · centesimally(r31500) · analgesic(r16000) · neuralgia(r25000) · myalgia(r25500) · midlateral(r28000) · vicemal(r31000) · omnicausal(r27500) · hemicerebral(r25000) · alert(r7917) · hospital(r437) · normal(r581) · final(r768) · animal(r925) · medical(r932) · local(r941) · trial(r1021) · national(r1038) · natural(r1046) · criminal(r1097) · original(r1120) · usual(r1166) · social(r1190) · alarm(r1257) · signal(r1282) · legal(r1354) · central(r1618) · material(r1749) · mental(r1953) · federal(r1957) · emotional(r1958) · financial(r2296) · equal(r2412) · penalty(r3720) · manual(r4624) · occasionally(r4957) · classical(r4965) · emotionally(r5061) · environmental(r6454) · cereal(r6577) · illegally(r7949) · intentionally(r8809) · incidentally(r9233) · ethical(r9760) · removal(r9997) · circumstantial(r11073) · individually(r12747) · traditionally(r13292) · continually(r13775) · neutralize(r14156) · orbital(r16271) · carnal(r17034) · mural(r17113) · reversal(r18400) · optional(r18612) · astral(r19836) · spatial(r20206) · banal(r21352) · nominal(r24174) · finalist(r24484) · factual(r25259) · aboriginal(r26081) · radial(r26245) · neutrality(r26415) · empirical(r26751) · departmental(r27200) · procedural(r28611) · secretarial(r30185) · incidental(r30201) · locality(r31476) · ministerial(r32864) · cereals(r33611) · equatorial(r35943) · doctoral(r36660) · coronal(r42899) · multilingual(r45362) · microbial(r45455) · maximal(r45672) · neonatal(r46261)

---

合计：**190** 个高危（note 未点名，需逐词考证）+ **9** 个大概率合法（note 已点名）。

考证时请注意常见误判（本项目已实测踩过）：

- `treatment` ← 拉丁 `tractare`「拉、处理」，与 mens「心」无关
- `garment` ← 法语 `garnir`「配备」；`parchment` ← `pergamene`；`assortment` ← `assortir`
- `environment / announcement / dimension / immense / measurement` ← 拉丁 `metiri`「测量」，与「心」无关
- `impediment` ← `impedire`「绊住」；`amenable` ← `amabilis`；`appeasement` ← appease「使平静」
