# 小站词条缓存列裁剪方案（待审 · 未实施）

> **状态**：方案阶段，**未写任何生产代码**。只新增了一个只读测量脚本 `scripts/measure-station-cache.mjs`。
> **触发**：QA 实测「单条 `station_word` ≈ 390B → 1 站×500 词 ≈ 191KB → 256KB 护栏在第 2 个站就拒写」，
> 并指出这让 **A-02（断网刷新小站消失）在多站场景下等于没修好** —— 属于本轮核心交付的完整性问题。
> **team-lead 裁决**：采纳「先列裁剪、再谈提高上限」，要求本方案含逐字段论证 + 实测体积 + 不牺牲能力 + 不破坏 QA 已验证的护栏行为。

---

## 0. 一个决定方案形态的前提（先说，因为它约束后面所有选择）

**`src/lib/cloud/schema.js` 与 `src/lib/cloud/stationWords.js` 都在本轮红线里（零 diff）。**

所以裁剪**不可能**发生在 `stationWordFromRow`（那是 schema.js 的导出），也**不可能**改 `updateNote` 的签名或实现。

合法的落点只有一个：**写入缓存那一刻，在 `useStationWords.js` 里对 `list` 做一次投影**，
即 `writeStationRefs(stationId, list.map(pickCacheFields), scope)`。

> ★ 这个落点选择有个额外好处：内存态的 `refs` 仍持有全字段，
>   任何「按 id / 按 addedAt 排序 / 未来接笔记 UI」的需求都能立刻拿到完整数据 ——
>   裁剪只影响**落盘的副本**，不减少内存里的信息。

---

## 1. 逐字段论证（8 个字段，实测 + 代码追踪）

`stationWordFromRow` 返回 8 个字段。下表逐个给出**实测字节**与**消费点追踪结论**。

| 字段 | 实测省下 | 占比 | 谁在读它 | 裁剪结论 |
|---|---|---|---|---|
| `id` | 68.0 B | **22.7%** | **无人** | **可裁**（最大单一浪费） |
| `stationId` | 51.0 B | 17.0% | **无人**（缓存是按 stationId 分条目的，条目内每行再存一遍纯属重复） | **可裁** |
| `ownerId` | 49.0 B | 16.3% | **无人**（分区由 storage key 的 scope 保证，行内再存 ownerId 是第二重冗余） | **可裁** |
| `wordKey` | 24.1 B | 8.0% | `useStationWords.js:132`（`noteByKey`）、`:95-96`（`isUserKey` 分流）、`:149`（排序）、`:277`（`synced` 去重）、`App.jsx:220`（`existingKeys`） | **必留**（唯一不可裁的字段） |
| `source` | 17.6 B | 5.9% | **无人**（见下方「关键发现」） | **可裁** |
| `note` | 12.0 B | 4.0% | `useStationWords.js:132`（`noteByKey` → `words[].note`） | **见 §3 权衡** |
| `addedAt` | 37.0 B | 12.3% | **无人**（`useStationWords.js:144` 注释说「按加入时间倒序」，但实际靠 refs **数组顺序**，`listByStation` 已 `.order('added_at', {ascending:false})`） | **可裁** |
| `updatedAt` | 39.0 B | 13.0% | **无人** | **可裁** |

### 关键发现 1：`source` 也是冗余的（比 team-lead 的初步判断更彻底）

`useStationWords` 里 `words[].source` 是**硬编码**的，不是从 `r.source` 读的：

```js
// useStationWords.js:134-138
const pub = (publicWords || []).map((w) => ({ ...w, wordKey: w.id, source: 'public', ... }))
const own = (userWords || []).map((w) => toUserWordView(w, ...))   // toUserWordView 里 source: 'user'
```

分流用的是 `isUserKey(r.wordKey)`（`startsWith('u.')`），**不是** `r.source`。
所以 `r.source` 与 `wordKey` 的前缀是**同一信息的两个副本** —— 裁掉它零风险。

### 关键发现 2：`updateNote` **不依赖** 缓存里的任何字段（回答 team-lead 的具体疑问）

```js
// stationWords.js:108-117（红线，只读）
export async function updateNote(stationId, wordKey, note) {
  ... .update({ note: ..., updated_at: new Date().toISOString() })
      .match({ station_id: stationId, word_key: wordKey })
}
```

- 入参只有 `(stationId, wordKey, note)` —— **全部来自调用处的变量，没有一个来自 refs**；
  调用处 `useStationWords.js:190` 的 `wordKey` 是用户操作时传的，不是从缓存行里取的。
- `updated_at` 是它**自己写**的（`new Date().toISOString()`），**从不读**。
- 它**不做**任何并发/顺序判定（没有 `eq('updated_at', ...)`），所以「缺 `updated_at` 导致误判」这个担心**不成立**。

> ⇒ team-lead 的疑问（"`updateNote` 在没有 `updated_at` 的情况下会不会出问题"）答案是：**不会，它连 `updated_at` 都不读。**

---

## 2. 实测体积对比（`node scripts/measure-station-cache.mjs`，非估算）

测量脚本用 `new Function` 从 `schema.js` 里取出**真的** `stationWordFromRow` 来跑，
不重抄字段清单（重抄就会漂移，而字段漂移正是本次要解决的问题）。
样本 1000 条，`Buffer.byteLength(JSON.stringify(...), 'utf8')`，与 localStorage 同口径。

```
方案                         单条      1 站×500      10 站×500    256KB 可存    1MB 可存
现状（8 字段）             299.7B      146.3 KB     1463.4 KB          1 站        6 站
A 只留 wordKey             26.1B       12.7 KB      127.4 KB         20 站       80 站
B wordKey + note           38.1B       18.6 KB      186.0 KB         13 站       55 站
```

**裁掉 7 个字段只省 91.3%**（273.6 B/条）—— 也就是说现状那 300 字节里，
**只有 8% 是真正承载信息的 wordKey**，其余全是每行重复的上下文。

`wordKey` 长度的影响（长词更贵，但量级不变）：
```
wordKey = w.a                        18.0 B/条
wordKey = w.photosynthesis            31.0 B/条
wordKey = w.internationalization      37.0 B/条
```

---

## 3. `note` 怎么处理（team-lead 要求我独立判断，不盲从）

`note` 是唯一一个「代码里确实在读」的字段（`noteByKey` → `words[].note`），所以不能一句「UI 没用到」就裁掉。

**三条事实**：
1. PRD §8-3 / B-08 明确写：**站内笔记「既无入口也无展示」，本期不做**（P2，会引出笔记编辑器范围问题）。
2. 但 `updateNote` 全链路已通（`stationWordsApi.updateNote` / `useStationWords.updateNote` / `wordView` 的 `note`）。
   → 将来接上 UI 时，**在线状态下 `refresh()` 会从云端拿到 note**，缓存里没有也不影响。
3. **实测所有写入路径的 `note` 恒为 `null`**：`addToStation.js` 构造的 item 是
   `{ wordKey, source }`（无 note 字段）→ `addMany` 里 `note: it.note ?? null` → 落库就是 `null`。
   也就是说**当前用户的库里 100% 是 `null`**，裁掉它对今天的数据零损失。

**结论：裁掉 `note`，方案 A（只留 `wordKey`）。**
理由：
- 今天零损失（库里全是 null）；
- 将来接 UI 时，缓存缺失的 note 会在**下一次 `refresh()`**（联网时必然发生）自动补齐；
- 离线时看不到 note —— 这是唯一的能力降级，而 K5 本期不做，**当前没有任何用户可见后果**；
- 换来 46% 的额外体积优势（38.1B → 26.1B）。

> ⚠️ 如果 team-lead 认为「为 K5 预留」更重要，方案 B（`wordKey + note`）也能满足
> 「10 站满配 186KB < 256KB」，即**不调护栏也够**。这个取舍请架构定。

---

## 4. 护栏取值（team-lead 要求「两步都做，给实测依据」）

按方案 A 的实测 26.1 B/条：

| 护栏 | 可存站数（×500 词） | 评价 |
|---|---|---|
| 256KB（现状） | 20 站 | **够用** —— LRU 上限本来就是 10 站 |
| 1MB | 80 站 | 过剩 |
| 2MB | 160 站 | 严重过剩 |

**我的建议：裁剪后 `MAX_CACHE_BYTES` 保持 256KB 不动。**

理由（与你之前的判断有出入，说明一下）：
- 你担心「256KB 下只够 3.5 站」—— 那是按**未裁剪**的 38.1B 算的；裁剪后是 **20 站**。
- LRU 上限 `MAX_CACHED_STATIONS = 10` 决定了**最多只可能存 10 站**，20 站的上限意味着
  **这条护栏在正常路径上永远不会触发** —— 它退化成一道纯兜底，这正是我们想要的。
- 真正的极端场景是「单站 5000 词」：`26.1B × 5000 = 127KB`，仍 < 256KB。
  再往上（单站 2 万词）才会拒写 —— 而那本来就是 LRU 该淘汰的量级。

**所以：只做裁剪，不动护栏。** 这样 A-02 在多站场景下真正修好（10 站全可离线读），
而 quota 风险比未裁剪时低一个数量级。若 team-lead 仍希望留更多余量（例如未来小站词数
普遍上千），提到 512KB 也很安全 —— 但那不是必需的。

---

## 5. 不能牺牲的能力（逐项确认）

| 能力 | 裁剪后是否受影响 | 依据 |
|---|---|---|
| 断网 + F5 能看到小站词条 | **完全不受影响** | 消费点只用 `wordKey`（`useStationWords.js:132/95/96/149/277`、`App.jsx:220`） |
| 站内复习队列 | **完全不受影响** | `buildLearnQueue/buildReviewQueue(list, ...)` 的入参是 `words`（由 `wordKey` 驱动的视图对象），不读 refs 的其余字段 |
| 三态徽标 / 标记 / 退回复习 | **完全不受影响** | 同上，`records` 以 `wordKey` 为键 |
| 「已在当前小站 ✓」标记 | **完全不受影响** | `App.jsx:220` 的 `existingKeys` 只 map `r.wordKey` |
| 「站内笔记」展示 | 离线时看不到 | **当前无 UI**（PRD B-08 本期不做），联网后一次 `refresh()` 即补齐 |
| 词条按加入时间倒序 | **完全不受影响** | 靠 refs 的**数组顺序**，而 `listByStation` 已 `.order('added_at', {ascending:false})`；数组顺序被 `normalizeByStation` 的 `filter`（保持原序）保留 |

---

## 6. 不破坏 QA 已验证的护栏行为

QA 已独立验证「超限静默拒写 / 旧值不清空 / 不抛错 / 返回 false / 不留半截数据」这条**现在是对的**。裁剪只改**送进** `writeStationRefs` 的数组，不改它内部逻辑：

- `if (exceedsCacheBudget(payload)) return false` —— 裁剪只会让 payload **更小**，更难触发拒写；行为不变。
- 拒写时 `return false` **在任何 setItem 之前** → 旧值完好、不留半截。**不触碰这段。**
- `lruTrim` 在超限时按 `savedAt`/`seq` 裁掉最旧条目 —— 裁剪后体积小，更少触发。**不触碰。**
- `normalizeByStation` 的过滤条件 `typeof r.wordKey === 'string'` —— **投影后必然满足**（只留 wordKey），过滤行为不变。

**新增一条测试**（`test-station-cache.mjs`）：断言「写入 1000 条只留 wordKey 的 refs，
读回来的对象**只含** `wordKey` 一个键，且 `typeof r.wordKey === 'string'`」，
以及「裁剪后的体积 < 未裁剪」（用同一条真实数据对比）。

---

## 7. 实施时的红线检查

- 改动文件**只有** `src/hooks/useStationWords.js`（加一个投影函数）+ `scripts/test-station-cache.mjs`（补测试）。
- **不动** `schema.js` / `stationWords.js` / `migrate.js` 的护栏逻辑 / `offline.js`。
- 存储键不新增（仍走 `keysFor`）、`DRAIN_ORDER` 仍 4 项、零新增依赖、零 SRS 字段。

---

## 8. 请 team-lead / 架构定夺的两点

1. **`note` 裁不裁**（§3）：裁 → 26.1B，不裁 → 38.1B。我建议裁（今天零损失，K5 本期不做）。
2. **护栏是否还调**（§4）：我建议**不调**（裁剪后 256KB 已能存 20 站 > LRU 的 10 站上限，护栏退化为纯兜底）。
   若仍希望留余量，512KB 是安全档。

批准后我再实施。**本轮未改任何生产代码。**
