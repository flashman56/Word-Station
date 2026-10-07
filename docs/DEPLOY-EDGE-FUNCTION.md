# 部署 Edge Function `generate-word`

> 对应函数源码：`supabase/functions/generate-word/index.ts`
> 自动化脚本：`scripts/deploy-generate-fn.mjs`
> 项目配置：`supabase/config.toml`

本文档只覆盖 **Edge Function（服务端）** 的部署。前端（Cloudflare Pages）的部署见根目录 `DEPLOY-GUIDE.md`。

---

## 0. TL;DR

```bash
# 一次性：登录（通常只需要这一步，之后无需任何 export）
npx supabase login

#   登录后直接跑脚本即可。脚本会自行判断认证状态：
#   优先用环境变量 / 旧版登录态文件；都没有时自动探测 CLI 自身的认证。

#   若要显式指定 token（优先级最高，用于切账号或 CI）：
#   supabase.com → Account → Access Tokens → Generate new token → 复制 sbp_xxx
#   export SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxx

# 预检（不写任何东西）
node scripts/deploy-generate-fn.mjs --dry-run --use-api

# 真正部署：设 secret + 部署函数
node scripts/deploy-generate-fn.mjs --use-api
```

**必须带 `--use-api`**，原因见 [§2](#2-必读为什么必须加---use-api)。
**必须带 `--use-api` 还需要 Supabase CLI ≥ 2.13.3**，脚本会在预检阶段自动校验版本，不用你手动查。

---

## 1. 前置条件

### 1.1 认证：脚本优先用显式 token，否则自动依赖 CLI 自身的登录态

**日常你什么都不用做**——只要 `npx supabase login` 成功过，就可以直接跑脚本，无需任何 `export`。

脚本的判据是「**CLI 自己能不能认证**」，而不是「我们能不能读到 token 文件」。
原因：新版 Supabase CLI 可能把凭证存在**我们读不到的位置**（例如 Windows 凭据管理器），
此时 `~/.supabase/access-token` 不存在，但 CLI 依然完全可用。
**「读不到文件」≠「未登录」**，所以脚本不会因此拦住你。

脚本按以下顺序处理：

| 顺序 | 情况 | 脚本行为 |
| --- | --- | --- |
| ① | 环境变量 `SUPABASE_ACCESS_TOKEN` 有值 | 直接用它，打印来源 / 长度 / 3 字符前缀，**优先级最高**（用于切账号、CI） |
| ② | 旧版 CLI 登录态文件 `~/.supabase/access-token` 可读且是 `sbp_` 开头 | 用它，打印来源（文件内容会 `trim`，CLI 写入时带结尾换行） |
| ③ | 上面两个都没有 | **自动探测 CLI 认证**：跑只读的 `projects list --output json`（60s 超时，不触发交互、不写任何东西）。能列出项目就继续，报 `CLI 认证：OK（由 CLI 自身登录态管理）` |
| ④ | ③ 也失败 | 才 `BLOCKED`，并同时给出 `npx supabase login` 与 sbp token 两条出路 |

CLI 登录态文件的位置（脚本用 `os.homedir()` 拼路径，跨平台）：

| 系统 | 路径 |
| --- | --- |
| Windows | `%USERPROFILE%\.supabase\access-token` |
| macOS / Linux | `~/.supabase/access-token` |

> 手动验证 CLI 是否已登录：`npx --yes supabase@latest projects list`
> ——能列出项目就是已登录（与脚本的探测是同一条命令）。
>
> 脚本**从不打印 token 本身**，只打印来源、长度与 3 字符前缀。
> 登录态文件本身也是明文全账号凭据，不要拷贝或同步它。

### 1.2 其他前置条件

| 项 | 值 / 来源 | 说明 |
| --- | --- | --- |
| Supabase CLI | ≥ **2.13.3** | `--use-api` 参数自该版本起才存在。脚本预检时会自动校验并给出升级命令。 |
| `DEEPSEEK_API_KEY` | 本仓库 `.env.local` | 脚本自动读取，**你不需要手动 export**，也绝不要写进 `VITE_*` 变量（会被打进前端产物）。 |
| Docker | **不需要**（因为用 `--use-api`） | 只跑 `supabase functions serve` 本地调试才需要 Docker。 |
| Node | ≥ 18 | 脚本用 ESM + `node:` 内置模块。 |

> ⚠️ Access Token 授予的是你账号下**所有项目**的权限。泄漏后果比 service_role key 更严重，
> 不要提交进 git、不要贴进聊天窗口。用完可回 Access Tokens 页面撤销。
> CLI 登录态文件（`~/.supabase/access-token`）同样是明文全账号凭据，不要拷贝或同步它。

---

## 2. 必读：为什么必须加 `--use-api`

函数入口第 32 行：

```ts
import morphemesRaw from '../../../src/data/morphemes.js'
```

这个路径逃出了 `supabase/` 目录（指向仓库根的 `src/data/morphemes.js`，145 KB 词素数据）。

Supabase CLI 的**默认部署机制（Docker）只上传 `supabase/` 目录内的文件**，
因此这次部署会直接失败，报错形如：

```
400 failed to create the graph
Caused by: Module not found ".../source/src/data/morphemes.js"
```

这会让函数进入 `BOOT_ERROR` 状态——**部署命令可能返回成功，但函数根本起不来**，
客户端拿到的仍然是 `404 / NOT_FOUND`，看起来跟没部署一样。

`--use-api` 是 Supabase 官方提供的实验性参数（CLI ≥ 2.13.3），跳过 Docker 直接上传，
从而保留 `supabase/` 之外的本地依赖。本机实测 CLI 版本 `2.120.0`，支持该参数。

脚本会在 `[2/4] 预检` 阶段解析 CLI 版本，**低于 2.13.3 就立刻退出**并打印升级命令
（`npx supabase@latest` 或 `npm i -g supabase@latest`），
这样你不会在部署跑到一半时才看到一个不认识的 flag 报错。

### 备选方案（更稳，但需要改代码）

把 `morphemes.js` 复制一份到 `supabase/functions/_shared/morphemes.js`，
并把 import 改成 `../_shared/morphemes.js`。这样不依赖实验性参数，
但会产生一份数据副本，需要考虑同步问题。**当前代码未做此改动**，故本脚本默认要求 `--use-api`。

---

## 3. 两条命令

### 3.1 设 secret

```bash
npx supabase secrets set --env-file <(grep '^DEEPSEEK_API_KEY=' .env.local) --project-ref svnwsbkhpzejygugtorl
```

或直接用脚本（推荐，它会自动生成只含该 key 的临时文件、用完即删，
避免 key 出现在 `ps` 的 argv 和 shell history 里）：

```bash
node scripts/deploy-generate-fn.mjs --use-api
```

### 3.2 部署函数

```bash
npx supabase functions deploy generate-word --use-api --project-ref svnwsbkhpzejygugtorl
```

两条都由 `scripts/deploy-generate-fn.mjs` 串成一步。脚本特性：

- 认证判据是 **CLI 自身的认证状态**：优先用显式 token，读不到就自动探测
  `projects list`（60s 超时、只读），详见 [§1.1](#11-认证脚本优先用显式-token否则自动依赖-cli-自身的登录态)
- 登录态文件为空 / 不以 `sbp_` 开头 → **只警告不阻断**（文件坏掉不代表没登录，交给 CLI 探测定夺）
- 预检 `config.toml` 存在、`verify_jwt = true`、函数入口存在
- 预检 Supabase CLI ≥ 2.13.3（`--use-api` 的硬性要求），过低 → **立刻退出并给出升级命令**
- 缺 key → **立刻退出**，不做任何降级尝试
- 预检依赖是否逃出 `supabase/`，逃出则**拒绝部署**（除非加 `--use-api`）
- `DEEPSEEK_API_KEY` 只经**临时 env-file + `--env-file`** 传给 CLI（`0o600`，用完即删），
  绝不出现在 argv / shell history / 日志里
- 所有子进程输出经脱敏过滤；打印每条命令的 exit code

### 脚本参数

| 参数 | 作用 |
| --- | --- |
| `--dry-run` | 只做全部预检，不调任何写命令 |
| `--use-api` | 跳过 Docker 直传（**本项目必加**） |
| `--skip-secret` | 跳过设 secret（key 未轮换时可省一次） |

---

## 4. 部署后验证

### 4.1 确认函数已注册（不再是 404）

```bash
curl -i -X POST \
  "https://svnwsbkhpzejygugtorl.supabase.co/functions/v1/generate-word" \
  -H "Authorization: Bearer <一个登录用户的 access_token>" \
  -H "Content-Type: application/json" \
  -d '{"forms":["photosynthesis"]}'
```

**期望结果**（按顺序判断）：

| 现象 | 含义 |
| --- | --- |
| `404 {"code":"NOT_FOUND"}` | 函数仍未部署成功 → 大概率是 §2 的打包问题，看 Dashboard → Edge Functions → Logs |
| `401 {"error":{"code":"UNAUTHORIZED"}}` | ✅ 函数活着！只是 token 无效。说明部署成功，去拿一个真 token 再测 |
| `500 {"code":"BOOT_ERROR"}` | 依赖没打进去，同 §2 |
| `200` + `{"results":[...],"quota":{...}}` | ✅ 完全正常 |

> 排查入口：supabase.com → 项目 → **Edge Functions → Logs**，能看到 Deno 侧的完整堆栈。
> 也可加 `--debug` 到 deploy 命令看打包过程。

### 4.2 经网关验证（与生产前端同路径）

生产前端走 Cloudflare Pages 的同源网关 `/supabase`，所以要确认这一条链路也通：

```bash
curl -i -X POST \
  "https://<你的站点域名>/supabase/functions/v1/generate-word" \
  -H "Authorization: Bearer <用户 access_token>" \
  -H "Content-Type: application/json" \
  -d '{"forms":["photosynthesis"]}'
```

网关（`functions/_middleware.js`）只做路径前缀剥离和逐跳头清洗，路径能对上 `/functions/v1/generate-word`。

### 4.3 端到端

浏览器登录 → 打开任一小站 → 「批量加词」→ 粘一个公共库里没有的生词（如 `quixotic`）
→ 应看到「新生成 N 词」。

### 4.4 配额守卫生效验证（重要，必做）

修好 R1 之后，**必须确认配额是真的在拦**，否则等于没修。配额上限 50 次/天（`generation_usage.quota` 默认值）。

**Step 1 · 确认配额在累加（证明 RPC 通了）**

用同一个 token 连续调用，每次换一个公共库里没有的生词（避免被 `public_hit` 短路，也不命中生成缓存）：

```bash
for w in alpha1word beta2word gamma3word delta4word; do
  curl -s -X POST "https://svnwsbkhpzejygugtorl.supabase.co/functions/v1/generate-word" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"forms\":[\"$w\"]}"
  echo
done
```

观察响应里的 `quota.used`：**必须单调递增**（1 → 2 → 3 → 4）。

- `used` 一直不涨或恒为 `null` → 配额检查又坏了，回看 §5 R1
- `used` 递增 → ✅ RPC 通了，`auth.uid()` 正常推导

**Step 2 · 确认超额后 DeepSeek 不再被调用**

把 `generation_usage` 该用户的 `quota` 临时压到已用量以下（Dashboard → SQL Editor）：

```sql
update public.generation_usage
   set quota = 2, used = 2
 where owner_id = '<该用户 uuid>' and day = (now() at time zone 'utc')::date;
```

再调一次，**必须**得到：

```json
{"results":[{"form":"...","status":"failed","code":"QUOTA_EXCEEDED",
             "message":"今日 2 次生成已用完，明日 0 点重置"}]}
```

判定要点：

| 现象 | 含义 |
| --- | --- |
| `code: "QUOTA_EXCEEDED"` | ✅ 配额守卫生效 |
| `code: "QUOTA_CHECK_FAILED"` | ✅ fail closed 生效（RPC 异常被正确拒绝，**不是放行**）——查 Logs 看 RPC 报错原因 |
| 仍然 `status: "generated"` | 🔴 **守卫失效**，立即回滚（§6） |

**Step 3 · 确认没有真的烧 DeepSeek**

超额那次调用**不应**产生 DeepSeek 请求。可用两种方式确认：
Dashboard → Edge Functions → Logs 里该次调用应只有配额分支、没有上游调用记录；
或看 DeepSeek 控制台的请求计数在 Step 2 期间**没有增长**。

> Step 2 会临时改限额，测完请把 `quota` 改回 50（或直接删掉该行让它回落默认）。

---

## 5. 已知的「部署成功但功能仍不可用」风险点

> 这一节是本文档最重要的部分。**部署成功 ≠ 功能可用**。

### ✅ R1 · 配额 RPC 失效 —— 已修复

**病根（两层，都已修）**

**第一层：用错客户端。** 原 `index.ts:155` 用 **service_role** 调 `consume_generation_quota`：

```ts
const { data: quotaRow, error: quotaErr } = await admin.rpc('consume_generation_quota', { n: toGenerate.length })
```

但该 RPC（`0001_init.sql:163`）内部靠 `auth.uid()` 取身份，而 service_role 的 JWT 没有 `sub`
→ `auth.uid()` 为 NULL → 函数体第一行 `raise exception 'not authenticated'`。

**修前实测证据**（`.env.local` 的 service_role key 直连 PostgREST）：

```
POST /rest/v1/rpc/consume_generation_quota
→ 400 {"code":"P0001","message":"not authenticated"}
```

> 附带确认：这**不是**权限问题。传 `{}` 得到 `P0001`（说明语句已执行、命中 raise），
> 而签名不对时错误码是 `PGRST202`。所以 service_role 是有 EXECUTE 权限的，纯粹是身份推导不出来。

**修法**：另建一个带用户 Authorization 的客户端 `anonAsUser`，用它调 RPC，让 PostgREST
把 JWT claims 注入 `auth.uid()`。

> ⛔ **绝不能**改成给 RPC 加 `p_uid uuid` 参数再传 `uid`。那会把「配额按令牌推导身份」
> 变成「配额由调用方指定」，任何人传别人的 uid 就能烧别人的额度。身份必须永远由 JWT 推导。

**第二层（更危险）：错误分支被当成「无限额」。** 原判定是：

```ts
if (!quotaErr && q && q.allowed === false) { /* 超额 */ } else { /* 生成 */ }
```

`quotaErr` 为真时短路判假 → **直接进生成分支**。这意味着任何配额检查异常
（RPC 抖动、函数被误删、权限变更、数据库超时）都会变成「静默放行烧钱」。

**修法：fail closed**，三态显式区分：

```ts
if (quotaErr)              → QUOTA_CHECK_FAILED（拒绝生成）
else if (q.allowed===false) → QUOTA_EXCEEDED（拒绝生成）
else                       → 生成
```

**修复后的行为已用线上真实响应仿真验证**：

| 场景 | DeepSeek 调用次数 |
| --- | --- |
| RPC 返回 `not authenticated`（线上真实响应） | **0** ✅ 修前是 1（放行） |
| 配额用尽 `allowed:false` | **0** ✅ |
| 还有额度 `allowed:true` | 1 ✅ 正常生成 |

**部署后请务必按 §4.4 实测验证**，确认 `quota.used` 会累加、超额后返回 `QUOTA_EXCEEDED`。

### ✅ R1b · 本地 dev 中间件 —— 已同步修复

`scripts/dev-generate-plugin.mjs:312` 曾与线上同一个 bug（`admin.rpc` + service_role）。

留着不修的实际后果不是「多一个 bug」，而是**误导判断**：本地永远跑不出
`QUOTA_EXCEEDED`，将来任何人拿本地表现去判断线上配额逻辑是否生效都会被带偏。

已按与 `index.ts` **同构**的方式修复：按请求新建带用户 `Authorization` 的
`anonAsUser` 客户端（token 只在 handler 内可得），并且 RPC 报错或抛异常
一律 `QUOTA_CHECK_FAILED` + 拒绝生成，绝不 fall through 到 `callDeepSeek`。
只有 DB 真正不可用时才退回本地配额（纯本地兜底，不涉及线上烧钱）。

**本地验证 `QUOTA_CHECK_FAILED`（不必改数据库）**：把 `.env.local` 里的
`VITE_SUPABASE_URL` 临时改成一个非法地址 → `anonAsUser.rpc` 抛异常 →
返回 `QUOTA_CHECK_FAILED`。恢复 URL 即可。

```bash
# 触发 fail-closed
# 1) 编辑 .env.local：VITE_SUPABASE_URL=https://invalid.invalid
# 2) npm run dev，登录后粘一个公共库里没有的生词 → 应看到 ⚠ 配额校验失败
# 3) 改回正确 URL
```

### 🟡 R2 · DeepSeek key 有效性

`.env.local` 里的 `DEEPSEEK_API_KEY` 已实测有效（`POST /chat/completions` → `HTTP 200`，正常返回 completion）。
若部署后出现 `status: 'failed'` / `code: 'INTERNAL'` / message 含「服务端未配置 DEEPSEEK_API_KEY」，
说明 secret 没设成功——重跑 §3.1。

### ✅ R4 · `stationId` 写入静默失败 —— 已修复

**原症状**：函数丢弃了 `station_words` upsert 的返回值。若 `stationId` 不存在，
PostgREST 会报外键错误，但没人看——词条生成了、`user_words` 写进去了，**却没进小站**，
前端毫无提示。用户以为加词成功了，回小站一看没有。

**修复**：捕获 `error`，并在响应里明确回传「词生成了但没进你的小站」：

```json
{"form":"quixotic","status":"generated",
 "stationAdded":false,
 "stationAddCode":"STATION_WRITE_FAILED",
 "stationAddMessage":"词条已保存到个人词库，但加入小站失败：..."}
```

成功时 `stationAdded: true`。**注意 `status` 仍是 `generated`**——词条确实已入库，
标成 `failed` 会让前端把它算进失败数，用户会以为白花了额度。

**顺带修掉一个越权写入（原本更危险）**

写入用的是 service_role 客户端，而 **service_role 绕过 RLS**
（证据：本项目 `dict_cache` 零策略，但 service_role 能全表读 64559 行）。
`stations` 的 RLS 策略是 `owner_id = auth.uid()`，对 service_role 不生效。
原代码又从不校验 stationId 归属 ⇒ **调用方可传任意他人的 stationId，
把词条塞进别人的小站**。

现在插入前先应用层核对归属（`stations.id = stationId AND owner_id = uid`），
不匹配则返回 `stationAddCode: "STATION_FORBIDDEN"`，不写库。

**⚠️ 前端已消费这些字段（本次一并修复）**

`AddWordsPanel` 现在会显示琥珀色 ⚠ 列表，逐条说明原因：

| 响应字段 | 用户看到 |
| --- | --- |
| `stationAddCode: "STATION_FORBIDDEN"` | 「该小站不属于当前账号，词条已存入个人词库但未加入小站」 |
| `stationAdded: false`（写入失败） | 「词条已保存到个人词库，但加入小站失败：<原因>」 |
| `code: "QUOTA_CHECK_FAILED"` | 「配额校验失败，请稍后重试（本次未消耗生成额度，也未调用生成服务）」 |
| `code: "QUOTA_EXCEEDED"` | 沿用服务端 message |

**统计口径刻意未变**：已入库的词仍计 `generated`，不因「没进小站」改判 `failed`
——那会让用户以为白花了额度。提示与计数分开，用琥珀色而非红色错误块，
因为这些情况下词往往已经生成成功了。

### 🟡 R3 · 公共库命中率

`dict_cache` 现有 **64559 行**，其中 `word_id` 非空的公共库条目可正常查到，
`public_hit` 路径（不消耗 DeepSeek）工作正常。
但注意：`dict_cache` 开启 RLS 且**没有任何策略**，只有 service_role 能读写——
函数用的是 service_role 客户端，符合设计。

### 🟢 R5 · 客户端契约

`src/lib/cloud/generate.js` 与 `index.ts` 的契约一致：请求体 `{ forms, stationId }`、
成功返回 `{ results, quota }`、失败返回 `{ error: { code, message } }`。
`supabase.functions.invoke` 会注入 `Authorization: Bearer <access_token>`，
所以 `verify_jwt = true` 不会挡住正常用户。**此项无阻塞。**

新增的错误码 `QUOTA_CHECK_FAILED` 走 `status: 'failed'`，与前端既有的
「非 public_hit 且非 generated 即计入 failed」逻辑兼容，前端无需改动即可正确计数。

---

## 6. 回滚

```bash
npx supabase functions delete generate-word --project-ref svnwsbkhpzejygugtorl
```

删除后接口立即回到 `404 {"code":"NOT_FOUND"}`，前端「自动生成词条」功能随之下线
（其余功能不受影响，生成失败会被 AddWordsPanel 计入 `failed` 并提示）。

**注意**：`functions delete` **不会**删除已写入的 `user_words` / `dict_cache` 数据，
也不会撤销 secret。如需彻底清理，单独到 Dashboard → Edge Functions → Secrets 删除 `DEEPSEEK_API_KEY`。

回滚后前端仍有降级路径：`supabase.functions.invoke` 报错 → `AddWordsPanel` 计入 `failed` 并提示，
不会白屏或崩溃。

---

## 7. 排查速查表

| 症状 | 先看 |
| --- | --- |
| `BLOCKED: 无法确认 Supabase 认证状态` | CLI 也没登录。跑 `npx supabase login`，或 export sbp token；验证：`npx --yes supabase@latest projects list`（§1.1） |
| `BLOCKED: Supabase CLI 版本过低` | `--use-api` 需 ≥ 2.13.3，按提示 `npx supabase@latest`（§2） |
| 登录了但脚本报 `探测超时` | CLI 探测 60s 没返回，多为网络问题；重跑，或先手动 `npx --yes supabase@latest projects list` 排除网络（§1.1） |
| `⚠ CLI 登录态文件内容不合法` | 只是警告，不影响部署。若 CLI 探测也失败，重跑 `npx supabase login`（§1.1） |
| `404 NOT_FOUND` | Dashboard → Edge Functions（函数列表里根本没有它 = 部署失败） |
| `500 BOOT_ERROR` | §2 的 `--use-api`；再查 Logs 里的 `Module not found` 路径 |
| `401 UNAUTHORIZED`（带真 token） | `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 默认 secret 是否被误删 |
| 生成结果全是 `failed` + `INTERNAL` | secret 没设好 → 重跑 §3.1 |
| 生成结果 `VALIDATION_FAILED` 居多 | 模型没按候选词素约束输出，与部署无关（可调 prompt） |
| 配额显示一直不涨 | 就是 §5 的 R1，**已知问题**，配额检查实际被跳过 |
| `ps` 里看到 key / 日志里出现 `sk-` | 立刻轮换 DeepSeek key |
