# queue-loan-chains 人工抽检记录

脚本：`scripts/queue-loan-chains.mjs`（只写 `reports/`，未改 `src/data/`）
产出：`reports/queue-loan-chains.json`（3,900 条判定）
样本文件：`reports/queue-loan-audit-sample.json`（第二批 30 条；第一批见下表）

判读口径：**看每个 piece 里那个实词素选得对不对**（词根的义项是否真能解释该词现代词义、
段形是否与该词素的词形/变体对得上）。分类：`对` / `存疑` / `错`。

---

## 第一批（前 300 个词，随机抽 30 条 decomposable）

| # | 词 | pieces | 判读 |
|---|---|---|---|
| 1 | organization | organ[null] + iz[s.ize] + ation[s.tion] | 对 |
| 2 | activity | activ[null] + ity[s.ity] | 对 |
| 3 | determined | de[p.de] + termin[r.termin] + ed[s.ed] | 对 |
| 4 | reasonable | reason[null] + able[s.able] | 对 |
| 5 | tradition | tradi[null] + tion[s.tion] | 对 |
| 6 | motive | mot[r.mov] + ive[s.ive] | 对 |
| 7 | merely | mere[null] + ly[s.ly] | 对 |
| 8 | personality | person[null] + al[null] + ity[s.ity] | 对 |
| 9 | traveling | travel[null] + ing[s.ing] | 对（仅屈折） |
| 10 | annoying | annoy[null] + ing[s.ing] | 对（仅屈折） |
| 11 | intense | in[p.in] + tens[r.tend] + e[null] | 对 |
| 12 | respond | re[p.re] + spond[r.spond] | 对 |
| 13 | occasion | occa[null] + sion[s.tion] | 对 |
| 14 | sets | set[null] + s[s.plural] | 对（仅屈折） |
| 15 | stable | sta[null] + ble[s.able] | 对 |
| 16 | emotions | e[p.ex] + mot[r.mov] + ion[s.tion] + s[s.plural] | 对 |
| 17 | peaceful | peace[null] + ful[s.ful] | 对 |
| 18 | painted | paint[null] + ed[s.ed] | 对（仅屈折） |
| 19 | dressing | dress[null] + ing[s.ing] | 对（仅屈折） |
| 20 | attached | at[p.ad] + tach[null] + ed[s.ed] | **存疑** — attach ← 古法语 atachier，主流词源认为来自 estachier（法兰克语 \*stakka），at- 是否等于 ad- 有争议 |
| 21 | visitors | vis[r.vid] + it[null] + or[s.er] + s[s.plural] | 对 |
| 22 | fabulous | fabul[null] + ous[s.ous] | 对 |
| 23 | nerves | nerv[r.nerv] + es[s.plural] | 对（仅屈折） |
| 24 | facility | facil[null] + ity[s.ity] | 对（偏保守：facil 可归 r.fac，未归） |
| 25 | motor | mot[r.mov] + or[s.er] | 对 |
| 26 | resources | re[p.re] + source[null] + s[s.plural] | 对（re- ↔ 法语 ressource 的 re-） |
| 27 | communication | communicat[null] + ion[s.tion] | 对 |
| 28 | waiter | wait[null] + er[s.er] | 对 |
| 29 | meters | meter[r.metr] + s[s.plural] | 对 |
| 30 | creative | creat[null] + ive[s.ive] | 对 |

**对 29 / 存疑 1 / 错 0** → 正确率（非错）100%，严格正确率 96.7%。

判定：≥70%，放行继续跑。

---

## 第二批（300→3900 新增结果里随机抽 30 条）

| # | 词 | pieces | 判读 |
|---|---|---|---|
| 1 | independent | in[p.in] + depend[null] + ent[s.ant] | 对 |
| 2 | alliance | alli[null] + ance[s.ance] | 对 |
| 3 | register | re[p.re] + gister[null] | 对（regerere = re- + gerere） |
| 4 | spiritual | spirit[r.spir] + u[null] + al[s.ic] | **错** — `-al` 被贴成 s.ic；应为 null（清单无 s.al） |
| 5 | economy | eco[r.oik] + nom[null] + y[s.cy] | **存疑** — eco→r.oik 正确，但词尾 -y 贴 s.cy 牵强 |
| 6 | located | loc[r.loc] + at[s.ate] + ed[s.ed] | 对 |
| 7 | relations | relation[null] + s[s.plural] | 对（仅屈折） |
| 8 | observe | ob[p.ob] + serv[r.serv] + e[null] | 对 |
| 9 | locate | loc[r.loc] + ate[s.ate] | 对 |
| 10 | strictly | strict[r.strict] + ly[s.ly] | 对 |
| 11 | identical | ident[null] + ic[s.ic] + al[null] | 对 |
| 12 | villagers | villag[null] + er[s.er] + s[s.plural] | 对 |
| 13 | tasted | tast[null] + ed[s.ed] | 对（仅屈折） |
| 14 | federation | feder[null] + ation[s.tion] | 对 |
| 15 | semester | se[p.semi] + mester[null] | **存疑** — 词源是 sex(六)+mensis(月)，se- 归 p.semi(半) 属习见误附 |
| 16 | biscuits | biscuit[null] + s[s.plural] | 对（仅屈折） |
| 17 | stereo | stere[r.stere] + o[null] | 对 |
| 18 | embarrassment | em[p.en] + barrass[null] + ment[s.ment] | 对 |
| 19 | genuinely | genuine[null] + ly[s.ly] | 对 |
| 20 | incapable | in[p.in] + cap[r.cap] + able[s.able] | 对 |
| 21 | automobile | auto[p.auto] + mobile[null] | 对 |
| 22 | cruelty | cruel[null] + ty[s.ity] | 对 |
| 23 | tuition | tuit[null] + ion[s.tion] | 对 |
| 24 | treacherous | treacher[null] + ous[s.ous] | 对 |
| 25 | inject | in[p.in] + ject[r.ject] | 对 |
| 26 | journalism | journal[null] + ism[s.ist] | 对（s.ist 释义含「…主义」） |
| 27 | electromagnetic | electro[null] + magnet[null] + ic[s.ic] | 对 |
| 28 | triad | tri[p.tri] + ad[null] | 对 |
| 29 | dangerously | danger[null] + ous[s.ous] + ly[s.ly] | 对 |
| 30 | theatrical | theatr[null] + ical[s.ic] | 对 |

**对 27 / 存疑 2 / 错 1** → 正确率（非错）96.7%，严格正确率 90%。

### 第二批发现的 1 个错 → 已回修脚本
`spiritual` 的 `-al` 被判给 `s.ic`，能通过旧校验是因为 s.ic 的变体 `ical` 包含 `al`。
已把校验规则 (f) 收紧为「段形与变体互为子串时，段形长度 ≥ 变体长度 − 1」，
并用 `--revalidate` 对全部 3,900 条离线重跑（不花钱）：**降级 58 条**（典型：`-al/-ical/-ual`
误贴 s.ic 的那批），同时清理了 58 条「verdict 已降级但仍挂着 pieces」的残留。

---

## 合计

| 轮次 | 对 | 存疑 | 错 | 非错率 |
|---|---|---|---|---|
| 第一批（前 300） | 29 | 1 | 0 | 100% |
| 第二批（新增） | 27 | 2 | 1 | 96.7% |
| **合计 60 条** | **56** | **3** | **1** | **98.3%** |

对比上一轮自动重切审计的 36.7% 错误率，本轮把「找不到词根就写 null」写进硬规则后，
绝大多数 decomposable 走的是「派生后缀 + null 词干」这种几乎不可能错的形式。
