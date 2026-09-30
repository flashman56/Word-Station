# 词根词缀单词云 · 单词小站（Word Station）

以词根、前缀、后缀为核心节点，单词挂在对应分支上的网状词群视图。
词根展开即是一簇同源词（word family）。

在此基础上新增「**单词小站**」：注册账号后可创建多个小站，每天批量往里扔生词，
不在 64825 公共库的词一键生成入库，学习进度跨设备同步、断网可用。
设计文档：[`docs/wordstation-design.md`](./docs/wordstation-design.md)

## 运行

```bash
npm install
npm run dev        # http://localhost:5199
```

其他命令：

```bash
npm run validate   # 校验数据（改完词根词缀数据后务必跑一次）
npm run build      # 生产构建（会先跑 split:data 切分片）
npm run preview    # 预览构建产物
npm run test:e2e   # 端到端回归测试（jsdom + 真实 React 渲染，覆盖多选批量标注等场景）
npm run test:cloud # 新增：解析 / 合并 / SRS 红线单测
```

## 首次接入 Supabase（必须做一次，否则云端功能不可用）

1. **建表**：打开 Supabase Dashboard → **SQL Editor** → 粘贴
   `supabase/migrations/0001_init.sql` 的全部内容 → Run。
   （脚本幂等，可重复执行。7 张表 + 索引 + RLS + 配额函数 + 新用户触发器）
2. **导入 dict_cache**（服务端查表用，只做一次）：
   Dashboard → **Table Editor** → `dict_cache` → Import data via CSV →
   选 `supabase/dict_cache.csv`（由 `npm run export:dict` 生成）。
   若界面不支持 CSV，改用 `supabase/dict_cache.sql` 粘到 SQL Editor 执行。
3. **关闭邮箱验证（开发期）**：Authentication → Providers → Email →
   关掉 **Confirm email**，否则注册后需点邮件链接才能登录。
4. **配置环境变量**：复制 `.env.example` 为 `.env.local` 并填写
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`。
   > 红线：`DEEPSEEK_API_KEY` **严禁**加 `VITE_` 前缀，只放在 `.env` / Supabase Secrets。
5. **部署生成服务（上线前）**：
   ```bash
   supabase secrets set DEEPSEEK_API_KEY=sk-...
   supabase functions deploy generate-word
   ```
   未部署时本地 `npm run dev` 会用 `scripts/dev-generate-plugin.mjs`
   在 `/functions/v1/generate-word` 上接管，**复用同一份 prompt**，端到端照样跑得通。

## 数据分片（28MB 词库的按需加载）

公共词库不再打进 JS bundle，改为构建期切到 `public/data/v1/`：

| 文件 | 内容 |
|---|---|
| `manifest.json` | 版本 + 分片清单 |
| `words-index.json` | `formSlug → [分片号, 片内下标, 词频, CEFR]`，首屏后台预取 |
| `words/w-<n>.json` | 完整词条，1500 条/片，按需加载 |
| `phon/p-<a..z\|_>.json` | 音标 / 例句 / 用法，按首字母分片，打开详情时才取 |

`npm run split:data` 重新生成；`public/data/` 已加入 `.gitignore`。

## 两条红线（改动时务必遵守）

1. **音标严禁模型生成**：只查 ECDICT（`src/data/phonetics.js` / `public/data/v1/phon/*.json` /
   服务端 `dict_cache.phonetic`）。查不到显示「音标待补」，生成函数绝不给 phonetic 字段。
2. **严禁 SRS 参数**：`next_due_at` 只有「答错 +24h」一条路径，
   不得出现 `ease / interval / lapses / reps`（`src/lib/cloud/schema.js` 有写入断言）。

## 界面速览

| 区域 | 作用 |
|---|---|
| 左栏 | 检索（词根/词缀/单词/释义）、掌握状态过滤、最低难度、类型、来源、统计、标注导入导出 |
| 总览 | 气泡打包图，气泡大小与字号 ∝ 词群规模，外圈红弧 = 未掌握占比 |
| 聚焦 | 单个词素展开：中心是词根，单词按难度或词频由内环到外环排布 |
| 列表 | 按词群折叠的表格，可排序，每行可标注状态 |
| 右栏 | 选中单词的完整构词拆解 + 所属词群跳转 |

## 多选与批量标注

一个个点 ✓ / ~ / ! 太慢，批量走这套：

- **列表视图**：行首勾选复选框即可多选；**Shift 点**另一行可以选中两者之间的一整段（再 Shift 点一次同一行会把整段取消，跟文件管理器手感一致）
- **词群标题**右侧「全选本群」选中该词群全部单词，**顶部**「全选当前结果」选中当前过滤条件下的全部单词（跨词群去重）
- 选中后出现**批量操作条**：✓ 标为已掌握 / ~ 标为待复习 / ! 标为生词 / 清除标注（退回自动判定）
- **聚焦视图**：Ctrl（Mac 上 Cmd）或 Shift + 点单词加入/移出多选，被选中的词用蓝色虚线框标出；普通点击仍是打开详情
- **右栏词群面板**：同源词列表上方有「全选 / 反选 / 清空」，配合批量操作条用
- 批量标注后**选择会保留**，方便连着打第二种标签；想从头再来点操作条上的「取消选择」

## 针对 12000 词汇量的默认设置

- 词频序号 ≤ 2500 的词**自动视为已掌握**并灰显（阈值在 `src/lib/derive.js` 的 `AUTO_KNOWN_RANK`）
- 默认隐藏这批词，默认最低难度 B1 → 打开看到的就是中频以上的 B1~C2 词
- 手动标注（✓ 已掌握 / ~ 待复习 / ! 生词）**优先于**自动判定，再点一次取消标注
- 标注存在浏览器 localStorage，可在左栏导出 JSON 备份

## 扩充数据

见 [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)，里面有完整字段表、派生规则、三步扩充指南和常见坑。

## 目录

```
src/
  data/
    morphemes.js      50 个词素骨架
    words-latin.js    拉丁词根下的词
    words-greek.js    希腊词根下的词
    words-affix.js    前后缀下的词
    index.js          数据合并入口（新建词表要在这里注册）
  lib/
    derive.js         派生规则：词频分档、已知判定、状态合并、索引、检索、过滤
    layout.js         气泡打包 / 同心环布局 / 字号映射（无第三方依赖）
  hooks/useStatus.js  标注与设置的 localStorage 持久化
  components/
    Sidebar.jsx       检索与过滤
    OverviewView.jsx  总览气泡图
    FocusView.jsx     同源词聚焦图
    ListView.jsx      列表
    WordRow.jsx       单词行 + 状态按钮
    BulkActionBar.jsx 批量操作条（列表 / 聚焦 / 右栏共用）
scripts/validate-data.mjs   数据校验（npm run validate）
scripts/qa-react-e2e.mjs    e2e 回归测试入口（npm run test:e2e）
scripts/qa-harness.jsx      e2e 用例主体（真实渲染 src/App.jsx 并派发 DOM 事件）
docs/DATA_MODEL.md          数据模型与扩充指南
```
