# 词根词云 · 上线部署教程（Cloudflare Pages）

本教程说明如何把 `word-root-cloud` 做成可公开访问的在线网页。
核心思路：**浏览器全程只跟你的网站域名通信**，所有 Supabase 请求由同源网关转发（开发时用 Vite 代理，上线后用 Cloudflare Pages Function），从根上避免「直连 supabase.co 被本机代理/插件拦截」导致的注册失败、加词卡死。

---

## 0. 你需要准备什么

- 一个 Cloudflare 账号（免费版即可，https://dash.cloudflare.com/sign-up）
- 本机已装 Node.js 18+（你环境是 22，满足）
- 你自己的 Supabase 项目信息：
  - **项目 URL**：`https://svnwsbkhpzejygugtorl.supabase.co`（已内置在 wrangler.toml）
  - **anon key**（公开值，RLS 保护数据，暴露无妨）：去 Supabase 控制台 → 项目 Settings → API → `Project API keys` → 复制 `anon` `public` 那一串

---

## 1. 关键：两类环境变量（别搞混）

| 变量名 | 作用阶段 | 设在哪里 | 是否必填 |
|--------|----------|----------|----------|
| `VITE_SUPABASE_URL` | **构建期**（Vite 内联进 JS） | 构建环境（本地 export 或 Pages 控制台） | 必填 |
| `VITE_SUPABASE_ANON_KEY` | **构建期**（Vite 内联进 JS） | 同上 | 必填 |
| `SUPABASE_URL` | **运行时**（Function 转发用） | 已在 `wrangler.toml` 的 `[vars]` 配好 | 已配好，无需动 |

为什么 `VITE_*` 必须在构建时设：Vite 在 `npm run build` 时把这两个值硬编码进打包产物。如果构建环境没这两个变量，线上客户端拿不到 Supabase 地址，会退化成「本地游客模式」（数据存自己浏览器，不进云端）。

---

## 2. 方式一：手动部署（wrangler 命令，推荐先走这条）

适合：你一个人用、不常改、想最快上线。

### 第 1 步：登录 Cloudflare（交互式，需你的账号授权）
```
npx wrangler login
```
浏览器会弹授权页，点允许。这一步我没法替你做，因为要你的账号密码/二次验证。

### 第 2 步：设置构建期环境变量
二选一：

**A. 在 Cloudflare Pages 控制台设点（最稳，推荐）**
1. 打开 Cloudflare 控制台 → Workers & Pages → 你的项目（首次部署后会自动建好）→ Settings → Build & deployments → Environment variables
2. 加两条，**作用域选 Production**：
   - `VITE_SUPABASE_URL` = `https://svnwsbkhpzejygugtorl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<你的 anon key>`

**B. 本地 export 后构建（不登录控制台也能用）**
```
export VITE_SUPABASE_URL="https://svnwsbkhpzejygugtorl.supabase.co"
export VITE_SUPABASE_ANON_KEY="<你的 anon key>"
npm run build
```

### 第 3 步：构建
如果你用方式 A（控制台设变量），**仍然要在本地构建**（本地构建时也要能读到变量，否则产物里还是空的）。最省心的是方式 B 本地 export 后构建：
```
npm run build
```
产物在 `dist/`。注意：默认 `build` 会先跑 `split:data` 重新切词库；如果词库没变、想快一点，可用 `npm run build:skip-data`。

### 第 4 步：部署
```
npx wrangler pages deploy dist
```
首次会问「Create a new project?」，输入项目名（如 `word-root-cloud`）回车。之后每次这条命令就是更新上线。
`wrangler.toml` 里的 `pages_build_output_dir = "dist"` 和 `[vars].SUPABASE_URL` 会自动生效，Function 网关无需额外配置。

### 第 5 步：冒烟测试
打开给你的 `*.pages.dev` 域名，走一遍：注册 → 登录 → 建站 → 批量加词。开发者工具 Network 里应看到请求都打向 `你的域名/supabase/...`，不再直连 `supabase.co`。

---

## 3. 方式二：Git 自动部署（push 即上线）

适合：你打算长期迭代、想「改完 push 一下就自动更新」。

1. 把 `word-root-cloud` 推到一个 GitHub 仓库（项目目前没 git，先 `git init` 再推）。
2. Cloudflare 控制台 → Workers & Pages → Create → Pages → 连接 GitHub → 选仓库。
3. 构建命令填 `npm run build`，构建输出目录填 `dist`。
4. 在 Settings → Environment variables 加那两个 `VITE_*`（Production 作用域）。
5. 之后每次 `git push`，Cloudflare 自动构建 + 部署。`wrangler.toml` 的 `[vars].SUPABASE_URL` 在 Git 模式下也会被读取，Function 网关照常工作。

---

## 4. 做成在线后，改东西方便吗？

诚实说：**在线 ≠ 在网页里直接改代码**。

- **改功能逻辑 / 样式 / 代码**：任何情况下都必须在你本地改，然后重新构建 + 重新部署。网页上没有「在线编辑器」能改源码（也不该有，那是生产环境）。
- **改数据 / 内容**：在线后反而最方便——你（和任何有账号的人）随时打开浏览器就能加词、建站、学，数据全在云端 Supabase，跟在哪台电脑无关。
- **改配置**（比如换 Supabase 项目）：环境变量在 Cloudflare 控制台点几下就能改，不用重新构建。

所以便利性取决于你要改的是什么：
- 日常「用」这个产品 → 在线最方便，随时随地。
- 日常「改」这个产品 → 和离线一样，都在本地改完重新部署；接了 Git 后只是少敲一条部署命令。

**重新部署成本**：本地改完，跑 `npm run build:skip-data`（词库没变时）＋ `npx wrangler pages deploy dist`，一两分钟上线。不重。

---

## 5. 离线用（不部署也能跑）

如果你暂时不想上线，本地完全能正常用：
```
npm run dev
```
打开 `http://localhost:5199` 即可。本地开发走 Vite 的 `/supabase` 代理，同样不直连 supabase.co，加词/登录都正常（你之前硬刷新后已验证可用）。数据照常进云端 Supabase，只是网站只在你这台电脑能访问。

**结论**：部署不会「锁死」你。代码永远在本地，想上线随时上，想改随时改完重新部署。先离线用完全没问题，等哪天想分享给别人或随时随地用，再花 10 分钟走第 2 节就行。

---

## 6. 常见问题

- **上线后注册/加词报 Failed to fetch**：99% 是漏了 `VITE_*` 两个构建期变量。回控制台补上，重新 `npm run build` + `deploy`。
- **改了代码线上没变**：确认重新 `build` 并 `deploy` 了；Git 模式确认 push 成功且构建没报错（控制台看 Build log）。
- **想换 Supabase 项目**：本地 `.env` / 控制台改 `VITE_SUPABASE_URL` 和 key，同时改 `wrangler.toml` 的 `SUPABASE_URL`，重新构建部署。
- **本地 dev 正常、线上不行**：多半是环境变量或 `dist` 是旧构建。删掉 `dist/` 重新 build。
