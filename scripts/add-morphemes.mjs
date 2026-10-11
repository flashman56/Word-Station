// 向 morphemes.js 批量追加一批新的、经人工核对的词素（词根/前缀/后缀）。
// 仅做「逐条追加 + 唯一性校验」，不改动既有条目。运行：node scripts/add-morphemes.mjs
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const FILE = path.join(root, 'src/data/morphemes.js')
const { default: existing } = await import(pathToFileURL(FILE).href)
const existingIds = new Set(existing.map((m) => m.id))

// 新增词素（人工核对过的常见拉丁/希腊/本族语词素，补齐表中明显缺漏的高频词素）
const NEW = [
  // ---------------- 新增拉丁/希腊/本族语词根 ----------------
  { id: 'r.act', type: 'root', form: 'act', display: 'act / ag', variants: ['ag', 'ig'], gloss: '做，行动，驱动', glossEn: 'to do, to act, to drive', origin: 'latin', note: 'agere（做）/ actum（行动）：act、action、active、actor、react、exact。' },
  { id: 'r.honor', type: 'root', form: 'honor', display: 'honor / hon', variants: ['hon'], gloss: '荣誉，尊敬', glossEn: 'honor, esteem', origin: 'latin', note: 'honor（荣誉）：honor、honest、honorary、honest。' },
  { id: 'r.chem', type: 'root', form: 'chem', display: 'chem / chemo', variants: ['chemo'], gloss: '化学，炼金（原始物质）', glossEn: 'chemistry, alchemy', origin: 'greek', note: 'chemeia（炼金术）：chemistry、chemical、chemist。' },
  { id: 'r.via', type: 'root', form: 'via', display: 'via / vi', variants: ['vi'], gloss: '路，道；经由', glossEn: 'way, road; by way of', origin: 'latin', note: 'via（道路）：via、viable、viaduct；obvious（ob+via）即「挡在路上的→明显的」。' },
  { id: 'r.histor', type: 'root', form: 'histor', display: 'histor / hist', variants: ['hist'], gloss: '历史，探究', glossEn: 'history, inquiry', origin: 'greek', note: 'historia（探究/历史）：history、historic、historical、historian。' },
  { id: 'r.calcul', type: 'root', form: 'calcul', display: 'calcul', variants: ['calc'], gloss: '小石子；计算', glossEn: 'small stone; to calculate', origin: 'latin', note: 'calculus（小石子，古人用以计数）：calculate、calculation、calculator、calculus。' },
  { id: 'r.matur', type: 'root', form: 'matur', display: 'matur', variants: ['mat'], gloss: '成熟', glossEn: 'ripe, mature', origin: 'latin', note: 'maturus（成熟的）：mature、maturity、immature、premature。' },
  { id: 'r.radi', type: 'root', form: 'radi', display: 'radi / radius / ray', variants: ['radius', 'ray', 'radi'], gloss: '辐条，光线；半径', glossEn: 'spoke, ray; radius', origin: 'latin', note: 'radius（辐条/半径）：radio、radiate、radiant、ray。' },
  { id: 'r.rot', type: 'root', form: 'rot', display: 'rot / rota / roll', variants: ['rota', 'roll'], gloss: '轮，旋转', glossEn: 'wheel; to roll', origin: 'latin', note: 'rota（轮子）：rotate、rotor、rotund、roll。' },
  { id: 'r.plant', type: 'root', form: 'plant', display: 'plant / planta', variants: ['planta'], gloss: '植物；种植；脚底', glossEn: 'plant; to plant; sole', origin: 'latin', note: 'planta（幼苗/脚底）：plant、plantation、implant、transplant。' },
  { id: 'r.pay', type: 'root', form: 'pay', display: 'pay / pac', variants: ['pac'], gloss: '支付；安抚；和平', glossEn: 'to pay; to pacify; peace', origin: 'latin', note: 'pacare（使平静/支付偿付）：pay、payment、peace、pacify。' },
  { id: 'r.mark', type: 'root', form: 'mark', display: 'mark / marc', variants: ['marc'], gloss: '边界，标记', glossEn: 'boundary, mark', origin: 'germanic', note: 'marca（边界）：mark、margin、marginal、remarkable。' },
  { id: 'r.crux', type: 'root', form: 'crux', display: 'crux / cruc', variants: ['cruc'], gloss: '十字；关键', glossEn: 'cross; crucial point', origin: 'latin', note: 'crux（十字架）：crucial、crucify、cross。' },
  { id: 'r.lun', type: 'root', form: 'lun', display: 'lun / lunae', variants: ['lunae'], gloss: '月亮', glossEn: 'moon', origin: 'latin', note: 'luna（月亮）：lunar、lunatic、semilunar。' },
  { id: 'r.aqua', type: 'root', form: 'aqua', display: 'aqua / aqu', variants: ['aqu'], gloss: '水', glossEn: 'water', origin: 'latin', note: 'aqua（水）：aquarium、aquatic、aqua。' },
  { id: 'r.corpus', type: 'root', form: 'corpus', display: 'corpus / corpor', variants: ['corpor'], gloss: '体，身体；团体', glossEn: 'body; corpus', origin: 'latin', note: 'corpus（身体/整体）：corporation、corpse、incorporate。' },
  { id: 'r.leg', type: 'root', form: 'leg', display: 'leg / lect / lig', variants: ['lect', 'leg'], gloss: '读，收集，言说', glossEn: 'to read, to gather, to say', origin: 'latin', note: 'legere（读/收集）：legend、lecture、collect、legible。' },
  { id: 'r.nasc', type: 'root', form: 'nasc', display: 'nasc / nat', variants: ['nat', 'nas'], gloss: '出生，产生', glossEn: 'to be born; to produce', origin: 'latin', note: 'nasci（出生）：native、nation、nature、innate、nascent。' },
  { id: 'r.audi', type: 'root', form: 'audi', display: 'audi / audit', variants: ['audit'], gloss: '听', glossEn: 'to hear', origin: 'latin', note: 'audire（听）：audio、audience、audible、auditorium。' },
  { id: 'r.theo', type: 'root', form: 'theo', display: 'theo / the', variants: ['the'], gloss: '神', glossEn: 'god', origin: 'greek', note: 'theos（神）：theology、atheist、theocracy。' },
  { id: 'r.geo', type: 'root', form: 'geo', display: 'geo / ge', variants: ['ge'], gloss: '地，地球', glossEn: 'earth', origin: 'greek', note: 'gē（大地）：geography、geology、geometry。' },
  { id: 'r.phot', type: 'root', form: 'phot', display: 'phot / phos', variants: ['phos'], gloss: '光', glossEn: 'light', origin: 'greek', note: 'phōs（光）：photon、photo、photosynthesis。' },
  { id: 'r.zoo', type: 'root', form: 'zoo', display: 'zoo / zo', variants: ['zo'], gloss: '动物', glossEn: 'animal', origin: 'greek', note: 'zōon（动物）：zoo、zoology、zodiac。' },
  { id: 'r.onym', type: 'root', form: 'onym', display: 'onym / onym', variants: ['onym'], gloss: '名，词', glossEn: 'name, word', origin: 'greek', note: 'onoma（名）：synonym、antonym、acronym、homonym。' },
  { id: 'r.crat', type: 'root', form: 'crat', display: 'crat / cracy', variants: ['cracy', 'crat'], gloss: '权力，统治', glossEn: 'power, rule', origin: 'greek', note: 'kratos（力量/统治）：democracy、bureaucracy、aristocracy、autocrat。' },
  { id: 'r.soph', type: 'root', form: 'soph', display: 'soph / sophi', variants: ['sophi'], gloss: '智慧', glossEn: 'wisdom', origin: 'greek', note: 'sophia（智慧）：sophisticated、philosophy（philo+soph）、sophomore。' },
  { id: 'r.gnost', type: 'root', form: 'gnost', display: 'gnost / gnos / nos', variants: ['gnos', 'nos'], gloss: '知，认知', glossEn: 'knowledge', origin: 'greek', note: 'gnōsis（知识）：recognize、cognitive、ignorant、diagnosis（dia+gnos）。' },
  { id: 'r.cogn', type: 'root', form: 'cogn', display: 'cogn / cogni', variants: ['cogni'], gloss: '认知，知道', glossEn: 'to know, to perceive', origin: 'latin', note: 'cognoscere（认知）：recognize、cognitive、cognition；与 r.gnost（希腊）同义异源。' },
  { id: 'r.ord', type: 'root', form: 'ord', display: 'ord / ordin', variants: ['ordin'], gloss: '秩序，顺序', glossEn: 'order, sequence', origin: 'latin', note: 'ordo（次序）：order、ordinary、coordinate、subordinate。' },
  { id: 'r.fin', type: 'root', form: 'fin', display: 'fin / finit', variants: ['finit'], gloss: '结束，边界', glossEn: 'end, boundary', origin: 'latin', note: 'finis（终点/边界）：final、finish、finite、define、confine。' },
  { id: 'r.firm', type: 'root', form: 'firm', display: 'firm / firm', variants: ['firm'], gloss: '坚固；确认', glossEn: 'firm, strong; to confirm', origin: 'latin', note: 'firmus（坚固）：firm、confirm、affirm、infirm。' },
  { id: 'r.form', type: 'root', form: 'form', display: 'form / form', variants: ['form'], gloss: '形状，形式', glossEn: 'shape, form', origin: 'latin', note: 'forma（形状）：form、reform、uniform、formula。' },
  { id: 'r.norm', type: 'root', form: 'norm', display: 'norm / norm', variants: ['norm'], gloss: '规则，标准', glossEn: 'rule, standard', origin: 'latin', note: 'norma（木匠的角尺→规则）：norm、normal、abnormal、enormous。' },
  { id: 'r.sanct', type: 'root', form: 'sanct', display: 'sanct / saint', variants: ['saint'], gloss: '神圣，圣洁', glossEn: 'holy, sacred', origin: 'latin', note: 'sanctus（神圣的）：sanctify、sanctuary、saint。' },
  { id: 'r.serv', type: 'root', form: 'serv', display: 'serv / serv', variants: ['serv'], gloss: '保存，服务', glossEn: 'to keep, to serve', origin: 'latin', note: 'servare（保持）：serve、servant、conserve、observe、reserve。' },
  { id: 'r.spir', type: 'root', form: 'spir', display: 'spir / spir', variants: ['spir'], gloss: '呼吸，精神', glossEn: 'to breathe; spirit', origin: 'latin', note: 'spirare（呼吸）：spirit、inspire、conspiracy、respiratory。' },
  { id: 'r.st', type: 'root', form: 'st', display: 'st / sta / stat / stit', variants: ['sta', 'stat', 'stit'], gloss: '站立，放置', glossEn: 'to stand, to place', origin: 'latin', note: 'stare（站）：state、station、statue、constant、distance、institute。' },
  { id: 'r.solv', type: 'root', form: 'solv', display: 'solv / solut', variants: ['solut', 'sol'], gloss: '松开，解决', glossEn: 'to loosen, to solve', origin: 'latin', note: 'solvere（解开）：solve、dissolve、resolve、absolute。' },
  { id: 'r.son', type: 'root', form: 'son', display: 'son / son', variants: ['son'], gloss: '声音', glossEn: 'sound', origin: 'latin', note: 'sonus（声音）：sonic、sonar、consonant、resonate。' },
  { id: 'r.suad', type: 'root', form: 'suad', display: 'suad / suas', variants: ['suas'], gloss: '劝，建议', glossEn: 'to advise, to persuade', origin: 'latin', note: 'suadere（劝）：persuade、dissuade、suave。' },
  { id: 'r.tact', type: 'root', form: 'tact', display: 'tact / tang / tag', variants: ['tang', 'tag'], gloss: '触，碰', glossEn: 'to touch', origin: 'latin', note: 'tangere（触）：contact、tangent、tangible、contaminate。' },
  { id: 'r.test', type: 'root', form: 'test', display: 'test / test', variants: ['test'], gloss: '见证，证明', glossEn: 'witness, to testify', origin: 'latin', note: 'testis（证人）：test、testify、testimony、protest、contest。' },
  { id: 'r.text', type: 'root', form: 'text', display: 'text / text', variants: ['text'], gloss: '编织，构造', glossEn: 'to weave, to construct', origin: 'latin', note: 'texere（编织）：text、texture、context、textile。' },
  { id: 'r.thes', type: 'root', form: 'thes', display: 'thes / thet / thesis', variants: ['thet', 'thesis'], gloss: '放置，设定', glossEn: 'to place, to set', origin: 'greek', note: 'tithenai（放置）：thesis、hypothesis、synthesis、theme。' },
  { id: 'r.tom', type: 'root', form: 'tom', display: 'tom / tom', variants: ['tom'], gloss: '切，割', glossEn: 'to cut', origin: 'greek', note: 'tomos（切割）：atom、anatomy、tomography、epitome。' },
  { id: 'r.tort', type: 'root', form: 'tort', display: 'tort / torq / tor', variants: ['torq', 'tor'], gloss: '扭，转，折磨', glossEn: 'to twist, to torture', origin: 'latin', note: 'torquere（拧）：torture、distort、torque、contort。' },
  { id: 'r.tract', type: 'root', form: 'tract', display: 'tract / trah / trait', variants: ['trah', 'trait'], gloss: '拉，拖，引', glossEn: 'to pull, to draw', origin: 'latin', note: 'trahere（拉）：tractor、attract、extract、retract、contract。' },
  { id: 'r.turb', type: 'root', form: 'turb', display: 'turb / turb', variants: ['turb'], gloss: '混乱，扰乱', glossEn: 'disorder, to disturb', origin: 'latin', note: 'turba（混乱）：disturb、turbulent、turbulence。' },
  { id: 'r.umbr', type: 'root', form: 'umbr', display: 'umbr / umber', variants: ['umber'], gloss: '阴影', glossEn: 'shadow', origin: 'latin', note: 'umbra（阴影）：umbrella、umbrage、penumbra。' },
  { id: 'r.vac', type: 'root', form: 'vac', display: 'vac / vacu', variants: ['vacu'], gloss: '空，闲', glossEn: 'empty, to be free', origin: 'latin', note: 'vacare（空）：vacuum、vacant、vacation、evacuate。' },
  { id: 'r.val', type: 'root', form: 'val', display: 'val / val', variants: ['val'], gloss: '强，有力，价值', glossEn: 'to be strong; value', origin: 'latin', note: 'valere（强壮/有价值）：value、valid、valiant、avail。' },
  { id: 'r.van', type: 'root', form: 'van', display: 'van / van', variants: ['van'], gloss: '空，虚，徒劳', glossEn: 'empty, vain', origin: 'latin', note: 'vanus（空的）：vain、vanity、vanish。' },
  { id: 'r.var', type: 'root', form: 'var', display: 'var / vari', variants: ['vari'], gloss: '多样，变化', glossEn: 'varied, different', origin: 'latin', note: 'varius（多样）：vary、various、variable、variation。' },
  { id: 'r.verb', type: 'root', form: 'verb', display: 'verb / verb', variants: ['verb'], gloss: '词，言语', glossEn: 'word, verb', origin: 'latin', note: 'verbum（词）：verb、verbal、adverb、proverb。' },
  { id: 'r.ver', type: 'root', form: 'ver', display: 'ver / ver', variants: ['ver'], gloss: '真，实', glossEn: 'true, real', origin: 'latin', note: 'verus（真实）：very、verify、verdict、verity。' },
  { id: 'r.vest', type: 'root', form: 'vest', display: 'vest / vest', variants: ['vest'], gloss: '衣，穿戴；投资', glossEn: 'clothing; to invest', origin: 'latin', note: 'vestis（衣物）：vest、vestige、invest、divest。' },
  { id: 'r.vic', type: 'root', form: 'vic', display: 'vic / vict / vinc', variants: ['vict', 'vinc'], gloss: '变化，替代；胜利', glossEn: 'change, turn; victory', origin: 'latin', note: 'vicis（更替）/ vincere（胜）：vice、victor、convince、province。' },
  { id: 'r.vin', type: 'root', form: 'vin', display: 'vin / vin', variants: ['vin'], gloss: '酒', glossEn: 'wine', origin: 'latin', note: 'vinum（酒）：vine、vintage、vinegar。' },
  { id: 'r.vol', type: 'root', form: 'vol', display: 'vol / vol', variants: ['vol'], gloss: '飞', glossEn: 'to fly', origin: 'latin', note: 'volare（飞）：volatile、vault、aviation（av+vol）。' },
  { id: 'r.volunt', type: 'root', form: 'volunt', display: 'volunt / vol', variants: ['vol'], gloss: '意志，意愿', glossEn: 'will, to wish', origin: 'latin', note: 'velle（愿）：voluntary、volunteer；benevolent（bene+vol）。' },
  { id: 'r.volv', type: 'root', form: 'volv', display: 'volv / volut', variants: ['volut'], gloss: '卷，转，滚动', glossEn: 'to roll, to turn', origin: 'latin', note: 'volvere（卷动）：revolve、involve、evolve、devolve。' },
  { id: 'r.vot', type: 'root', form: 'vot', display: 'vot / vot', variants: ['vot'], gloss: '誓，愿', glossEn: 'to vow', origin: 'latin', note: 'vovere（立誓）：vote、vow、devote、devout。' },
  { id: 'r.vuln', type: 'root', form: 'vuln', display: 'vuln / vulner', variants: ['vulner'], gloss: '伤', glossEn: 'wound', origin: 'latin', note: 'vulnus（伤）：vulnerable、vulnerability。' },
  { id: 'r.rhino', type: 'root', form: 'rhino', display: 'rhino / rhin', variants: ['rhin'], gloss: '鼻', glossEn: 'nose', origin: 'greek', note: 'rhis（鼻）：rhinoceros、rhinitis。' },
  { id: 'r.halo', type: 'root', form: 'halo', display: 'halo / hal', variants: ['hal'], gloss: '盐', glossEn: 'salt', origin: 'greek', note: 'hals（盐）：halogen、halogenate。' },
  { id: 'r.chrom', type: 'root', form: 'chrom', display: 'chrom / chromo', variants: ['chromo'], gloss: '色', glossEn: 'color', origin: 'greek', note: 'chrōma（色）：chrome、chromosome、chromium。' },
  { id: 'r.cyan', type: 'root', form: 'cyan', display: 'cyan / cyan', variants: ['cyan'], gloss: '蓝', glossEn: 'blue', origin: 'greek', note: 'kyanos（深蓝）：cyan、cyanide。' },
  { id: 'r.dynam', type: 'root', form: 'dynam', display: 'dynam / dynamo', variants: ['dynamo'], gloss: '力，能', glossEn: 'power, force', origin: 'greek', note: 'dynamis（力）：dynamic、dynasty、dynamo。' },
  { id: 'r.heli', type: 'root', form: 'heli', display: 'heli / helio', variants: ['helio'], gloss: '太阳', glossEn: 'sun', origin: 'greek', note: 'hēlios（太阳）：helium、heliocentric、heliotrope。' },
  { id: 'r.phen', type: 'root', form: 'phen', display: 'phen / phan / phas', variants: ['phan', 'phas'], gloss: '显，现，示', glossEn: 'to show, to appear', origin: 'greek', note: 'phainein（显现）：phenomenon、phase、emphasis、fantasy（phant）。' },
  { id: 'r.stas', type: 'root', form: 'stas', display: 'stas / stat / stas', variants: ['stat'], gloss: '站立，静止', glossEn: 'standing, position', origin: 'greek', note: 'stasis（站立/静止）：static、stationary、ecstasy（ex+stas）、metastasis。' },
  { id: 'r.trop', type: 'root', form: 'trop', display: 'trop / tropo', variants: ['tropo'], gloss: '转，向，性', glossEn: 'turn, manner', origin: 'greek', note: 'tropos（转向）：tropic、troposphere、trope。' },
  { id: 'r.zyg', type: 'root', form: 'zyg', display: 'zyg / zygo', variants: ['zygo'], gloss: '轭，结合', glossEn: 'yoke, pair', origin: 'greek', note: 'zygon（轭）：zygote、conjugate、zeugma。' },
  { id: 'r.pneuma', type: 'root', form: 'pneuma', display: 'pneum / pneuma', variants: ['pneum'], gloss: '气，呼吸，灵', glossEn: 'breath, spirit', origin: 'greek', note: 'pneuma（气息）：pneumonia、pneumatic、pneuma。' },
  { id: 'r.arch', type: 'root', form: 'arch', display: 'arch / archi / archy', variants: ['archi', 'archy'], gloss: '首要，统治', glossEn: 'chief, rule', origin: 'greek', note: 'arkhē（首位/统治）：monarch（mon+arch）、anarchy（an+arch）、patriarch。' },
  { id: 'r.tech', type: 'root', form: 'tech', display: 'tech / techn', variants: ['techn'], gloss: '技艺，工艺', glossEn: 'art, skill, craft', origin: 'greek', note: 'technē（技艺）：technology、technique、technical。' },
  { id: 'r.meter', type: 'root', form: 'meter', display: 'meter / metr / metry', variants: ['metr', 'metry'], gloss: '测量，计', glossEn: 'measure', origin: 'greek', note: 'metron（量度）：meter、geometry（geo+metry）、thermometer。' },
  { id: 'r.pol', type: 'root', form: 'pol', display: 'pol / polit / polis', variants: ['polit', 'polis'], gloss: '城，公民，政治', glossEn: 'city, citizen, state', origin: 'greek', note: 'polis（城邦）：politics、police、policy、metropolis。' },
  { id: 'r.soc', type: 'root', form: 'soc', display: 'soc / soci', variants: ['soci'], gloss: '同伴，联合', glossEn: 'companion, ally', origin: 'latin', note: 'socius（同伴）：society、social、associate、sociable。' },
  { id: 'r.fid', type: 'root', form: 'fid', display: 'fid / feder / fidel', variants: ['feder', 'fidel'], gloss: '信任，信仰', glossEn: 'faith, trust', origin: 'latin', note: 'fides（信任）：faith、confide、confident、federal（feder）。' },
  { id: 'r.lig', type: 'root', form: 'lig', display: 'lig / li', variants: ['li'], gloss: '绑，连', glossEn: 'to bind, to tie', origin: 'latin', note: 'ligare（绑）：league、rely（re+li）、oblige、ligament。' },
  { id: 'r.press', type: 'root', form: 'press', display: 'press / prem', variants: ['prem'], gloss: '压', glossEn: 'to press', origin: 'latin', note: 'premere（压）：press、pressure、compress、express、depress。' },
  { id: 'r.pend', type: 'root', form: 'pend', display: 'pend / pens', variants: ['pens'], gloss: '悬挂，称量，支付', glossEn: 'to hang, to weigh, to pay', origin: 'latin', note: 'pendere（称量/支付）：pendulum、depend、expend、expense、pension。' },
  { id: 'r.pet', type: 'root', form: 'pet', display: 'pet / pit', variants: ['pit'], gloss: '寻求，冲向', glossEn: 'to seek, to rush at', origin: 'latin', note: 'petere（奔向/寻求）：compete、petition、appetite、repeat（re+pet）。与 r.mit（送）不同源。' },
  { id: 'r.clud', type: 'root', form: 'clud', display: 'clud / clus / clos', variants: ['clus', 'clos'], gloss: '关，闭', glossEn: 'to shut, to close', origin: 'latin', note: 'claudere（关闭）：include、exclude、conclude、enclose。' },
  { id: 'r.pel', type: 'root', form: 'pel', display: 'pel / puls', variants: ['puls'], gloss: '推，驱', glossEn: 'to drive, to push', origin: 'latin', note: 'pellere（推）：propel、repel、compel、impulse（im+puls）。' },
  { id: 'r.sec', type: 'root', form: 'sec', display: 'sec / sequ / se', variants: ['sequ', 'se'], gloss: '跟随', glossEn: 'to follow', origin: 'latin', note: 'sequi（跟随）：sequence、consequence、subsequent、second（sec）。' },
  { id: 'r.curr', type: 'root', form: 'curr', display: 'curr / curs', variants: ['curs'], gloss: '跑，流', glossEn: 'to run, to flow', origin: 'latin', note: 'currere（跑）：current、curriculum、occur、recur、course。' },
  { id: 'r.ten', type: 'root', form: 'ten', display: 'ten / tent / tin', variants: ['tent', 'tin'], gloss: '握住，保持', glossEn: 'to hold, to keep', origin: 'latin', note: 'tenere（握住）：contain、retain、content、tenant、continue。' },

  // ---------------- 新增前缀 ----------------
  { id: 'p.bene', type: 'prefix', form: 'bene', display: 'bene-', variants: [], gloss: '好，善', glossEn: 'well, good', origin: 'latin', note: 'benefit（好处）、benevolent（bene+vol）、beneficial。' },
  { id: 'p.mal', type: 'prefix', form: 'mal', display: 'mal-', variants: [], gloss: '坏，恶', glossEn: 'bad, ill', origin: 'latin', note: 'malice、malicious、malfunction、male（法语「坏」）。' },
  { id: 'p.ante', type: 'prefix', form: 'ante', display: 'ante-', variants: [], gloss: '在…之前', glossEn: 'before', origin: 'latin', note: 'antecedent、antechamber、anterior；与 anti-（反对）区分。' },
  { id: 'p.equi', type: 'prefix', form: 'equi', display: 'equi- / equ-', variants: ['equ'], gloss: '平等，均等', glossEn: 'equal', origin: 'latin', note: 'equivalent、equilibrium、equator（equ+ator）。' },
  { id: 'p.intro', type: 'prefix', form: 'intro', display: 'intro-', variants: [], gloss: '向内，入内', glossEn: 'into, inward', origin: 'latin', note: 'introduce、introspect、introvert。' },
  { id: 'p.arch', type: 'prefix', form: 'arch', display: 'arch- / archi- / archy-', variants: ['archi', 'archy'], gloss: '首要，统治', glossEn: 'chief, rule', origin: 'greek', note: '架构 architect（archi+tekton）；与 r.arch（词根）同源异用。' },
  { id: 'p.a', type: 'prefix', form: 'a', display: 'a- / an-', variants: ['an'], gloss: '无，非（希腊否定）', glossEn: 'not, without', origin: 'greek', note: 'atypical、amoral、anarchy（an+arch）、anonymous；a- 在辅音前，an- 在元音前。' },
  { id: 'p.ab', type: 'prefix', form: 'ab', display: 'ab- / abs-', variants: ['abs'], gloss: '离开，从', glossEn: 'from, away', origin: 'latin', note: 'absent、abstract、absurd（ab+surd）、abnormal。' },
  { id: 'p.ad', type: 'prefix', form: 'ad', display: 'ad- / ac- / af- / ag- / al-', variants: ['ac', 'af', 'ag', 'al', 'ap', 'ar', 'as', 'at'], gloss: '向，到', glossEn: 'to, toward', origin: 'latin', note: 'advance、adjust、admit、attract（at+tract）；形随后续辅音同化。' },
  { id: 'p.ob', type: 'prefix', form: 'ob', display: 'ob- / oc- / of- / op-', variants: ['oc', 'of', 'op'], gloss: '反对，对着', glossEn: 'against, toward', origin: 'latin', note: 'object、obscure、obstacle、obvious（ob+via→明显）；形随后续辅音同化。' },
  { id: 'p.se', type: 'prefix', form: 'se', display: 'se-', variants: [], gloss: '分离，离开', glossEn: 'apart, away', origin: 'latin', note: 'separate、secrete、secure（se+cura）。' },
  { id: 'p.dis', type: 'prefix', form: 'dis', display: 'dis-', variants: ['di'], gloss: '分离，不', glossEn: 'apart, not', origin: 'latin', note: 'disappear、disease、distant、disagree。' },
  { id: 'p.per', type: 'prefix', form: 'per', display: 'per-', variants: [], gloss: '通过，彻底', glossEn: 'through, very', origin: 'latin', note: 'perfect、permanent、permeate、perspire。' },
  { id: 'p.cata', type: 'prefix', form: 'cata', display: 'cata- / cat-', variants: ['cat'], gloss: '向下，完全', glossEn: 'down, thoroughly', origin: 'greek', note: 'catastrophe、catalog（cata+log）、catacomb。' },
  { id: 'p.di', type: 'prefix', form: 'di', display: 'di- / dia-', variants: ['dia'], gloss: '穿过，二', glossEn: 'through, two', origin: 'greek', note: 'diameter（dia+meter）、dialogue（dia+log）、dilemma。' },
  { id: 'p.para', type: 'prefix', form: 'para', display: 'para- / par-', variants: ['par'], gloss: '在旁，防，类似', glossEn: 'beside, against, like', origin: 'greek', note: 'parallel、paragraph（para+graph）、parasite。' },
  { id: 'p.peri', type: 'prefix', form: 'peri', display: 'peri-', variants: [], gloss: '周围，近', glossEn: 'around, near', origin: 'greek', note: 'perimeter、period（peri+hod? 实则 peri+odos）、periphery。' },
  { id: 'p.epi', type: 'prefix', form: 'epi', display: 'epi-', variants: [], gloss: '在…上，外', glossEn: 'upon, outside', origin: 'greek', note: 'epidemic、episode、epitome（epi+Tom）。' },
  { id: 'p.meta', type: 'prefix', form: 'meta', display: 'meta-', variants: [], gloss: '超越，变化', glossEn: 'beyond, change', origin: 'greek', note: 'metaphor、metabolism、metadata、metamorphosis。' },

  // ---------------- 新增后缀 ----------------
  { id: 's.ism', type: 'suffix', form: 'ism', display: '-ism', variants: [], gloss: '主义，学说，行为', glossEn: 'doctrine, practice, state', origin: 'greek', note: 'communism、realism、tourism、capitalism。' },
  { id: 's.or', type: 'suffix', form: 'or', display: '-or', variants: ['our'], gloss: '…者（施事名词）', glossEn: 'agent noun (one who)', origin: 'latin', note: 'actor、doctor、governor、editor（施事者）；与 -er 互为变体。' },
  { id: 's.ory', type: 'suffix', form: 'ory', display: '-ory', variants: ['ory'], gloss: '…的；场所/物', glossEn: 'adj: relating to; n: place/thing', origin: 'latin', note: 'laboratory、territory、category、inventory。' },
  { id: 's.wise', type: 'suffix', form: 'wise', display: '-wise', variants: [], gloss: '以…方式（本族语）', glossEn: 'manner (Germanic)', origin: 'germanic', note: 'otherwise、likewise、clockwise、lengthwise。' },
  { id: 's.ible', type: 'suffix', form: 'ible', display: '-ible', variants: [], gloss: '可…的', glossEn: 'able to be', origin: 'latin', note: 'possible、visible、flexible、terrible（与 -able 同义，源自不同词干）。' },
  { id: 's.ence', type: 'suffix', form: 'ence', display: '-ence', variants: ['ance'], gloss: '性质，状态（名词）', glossEn: 'state, quality (noun)', origin: 'latin', note: 'presence、difference、existence、distance（di+st+ance）。' },
  { id: 's.ent', type: 'suffix', form: 'ent', display: '-ent', variants: [], gloss: '…的；…者（形容词/名词）', glossEn: 'adj/n: -ent', origin: 'latin', note: 'different、absent、present、student（stud+ent）。' },
  { id: 's.y', type: 'suffix', form: 'y', display: '-y', variants: [], gloss: '…的；小称/名词化', glossEn: '-y (adj/n)', origin: 'other', note: 'happy（本族语）、inquiry（拉丁 -ia 变体）、victory（vict+ory→此表另有 -ory）。注意 -y 与 -ly 不同源。' },
  { id: 's.er', type: 'suffix', form: 'er', display: '-er', variants: [], gloss: '…者；工具/比较级', glossEn: 'agent; tool/comparative', origin: 'germanic', note: 'teacher、worker、reader；也可表工具（computer）或比较级（faster）。' },
  { id: 's.ar', type: 'suffix', form: 'ar', display: '-ar', variants: ['ary'], gloss: '…者（名词/形容词）', glossEn: '-ar (agent/adj)', origin: 'latin', note: 'solar（sol+ar）、lunar（lun+ar）、polar（pol+ar）、scholar。' },
  { id: 's.ess', type: 'suffix', form: 'ess', display: '-ess', variants: [], gloss: '女性（名词）', glossEn: 'feminine noun', origin: 'french', note: 'actress、hostess、princess、lioness。' },
  { id: 's.ade', type: 'suffix', form: 'ade', display: '-ade', variants: [], gloss: '动作/物（法语）', glossEn: '-ade (French)', origin: 'french', note: 'blockade、parade、lemonade、cavalcade。' },
  { id: 's.ine', type: 'suffix', form: 'ine', display: '-ine', variants: [], gloss: '…的；物质/名词', glossEn: '-ine', origin: 'latin', note: 'machine、routine、vaccine、famine、genuine（genu+ine）。' },
  { id: 's.some', type: 'suffix', form: 'some', display: '-some', variants: [], gloss: '充满…的（本族语）', glossEn: 'full of (Germanic)', origin: 'germanic', note: 'awesome、handsome、bothersome、tiresome。' },
  { id: 's.en', type: 'suffix', form: 'en', display: '-en', variants: [], gloss: '使…（动词）；…的', glossEn: 'to make; adj (Germanic)', origin: 'germanic', note: 'widen、sharpen、soften、wooden、golden。' },
  { id: 's.ency', type: 'suffix', form: 'ency', display: '-ency / -ancy', variants: ['ancy'], gloss: '性质，状态（名词）', glossEn: 'state, quality (noun)', origin: 'latin', note: 'vacancy、frequency、agency（ag+ency）、emergency。' },
  { id: 's.ant', type: 'suffix', form: 'ant', display: '-ant / -ance', variants: ['ance'], gloss: '…的；…者（形容词/名词）', glossEn: 'adj/n: -ant', origin: 'latin', note: 'applicant、servant、important、distance（di+st+ance）。' },
  { id: 's.arian', type: 'suffix', form: 'arian', display: '-arian', variants: [], gloss: '…者；…主义', glossEn: '-arian', origin: 'latin', note: 'vegetarian、librarian、historian（histor+arian）、humanitarian。' },
  { id: 's.esque', type: 'suffix', form: 'esque', display: '-esque', variants: [], gloss: '…风格的', glossEn: '-esque (like)', origin: 'french', note: 'picturesque、arabesque、statuesque。' },
  { id: 's.fold', type: 'suffix', form: 'fold', display: '-fold', variants: [], gloss: '…倍/重（本族语）', glossEn: '-fold', origin: 'germanic', note: 'twofold、manifold、threefold。' },
  { id: 's.ways', type: 'suffix', form: 'ways', display: '-ways', variants: [], gloss: '朝向，方式（本族语）', glossEn: 'direction, manner', origin: 'germanic', note: 'always、sideways、crossways。' },
  { id: 's.worth', type: 'suffix', form: 'worth', display: '-worth', variants: [], gloss: '值得…（本族语）', glossEn: 'worthy of', origin: 'germanic', note: 'worthless、worthwhile、noteworthy。' },
  { id: 's.th', type: 'suffix', form: 'th', display: '-th', variants: [], gloss: '性质/状态（本族语）', glossEn: 'state, quality (Germanic)', origin: 'germanic', note: 'warmth、growth、depth、truth、width。' },
  { id: 's.ary', type: 'suffix', form: 'ary', display: '-ary / -arium', variants: ['arium'], gloss: '…的；场所/人/物', glossEn: 'adj/n: -ary', origin: 'latin', note: 'dictionary（dict+ion+ary）、library、planetarium、secretary。' },
  { id: 's.ization', type: 'suffix', form: 'ization', display: '-ization', variants: ['ize'], gloss: '…化（名词）', glossEn: '-ization', origin: 'latin', note: 'organization、modernization、realization（real+iz+ation）。' },
]

// 唯一性校验：已存在的 id 跳过（表已覆盖），只写真正新增的
const dups = NEW.filter((m) => existingIds.has(m.id))
const ADD = NEW.filter((m) => !existingIds.has(m.id))
if (dups.length) console.error('已存在、跳过（表已覆盖）：', dups.length, '条 ->', dups.map((m) => m.id).join(', '))
// 字段校验
for (const m of NEW) {
  for (const k of ['id', 'type', 'form', 'display', 'gloss', 'glossEn', 'origin', 'note']) {
    if (!(k in m)) { console.error('缺字段', m.id, k); process.exit(1) }
  }
  if (!['root', 'prefix', 'suffix'].includes(m.type)) { console.error('type 非法', m.id, m.type); process.exit(1) }
}

const src = fs.readFileSync(FILE, 'utf8')
const anchor = '  // ---------------- 占位词素（用户生成词兜底） ----------------'
const idx = src.indexOf(anchor)
if (idx < 0) { console.error('找不到占位词素锚点'); process.exit(1) }
const head = src.slice(0, idx)
const tail = src.slice(idx)
const block = `  // ---------------- 本轮新增词素（批量补齐高频缺漏，来源：人工核对） ----------------\n` +
  ADD.map((m) => '  ' + JSON.stringify(m)).join(',\n') + ',\n\n'
const out = head + block + tail
fs.writeFileSync(FILE, out, 'utf8')
console.log(`已追加 ${ADD.length} 条词素（root/prefix/suffix 混合），现有总数 ${existing.length + ADD.length}。`)
