# 工程纪律（本轮沉淀）

> 三条都是**我自己踩过**的，写在这里是因为它们的共同点：
> **失败不是「报错」，而是「看起来是绿的」。**

---

## 1. 验证「这个失败是否我改之前就有」时，只读比对，绝不动工作区

**错误做法（我踩过）**：

```bash
git stash                                    # ❌ 会清掉我未提交的修复
git checkout <commit> -- <file>              # ❌ 会覆盖工作区文件
```

我用这两条去比对 e2e 基线，结果**把自己刚做完的 harness 修复覆盖掉了**，不得不重做一遍。

**正确做法**：

```bash
# 首选：拉一份干净的基线，全程不动主工作区
git worktree add /tmp/wrc-base <commit>
cd /tmp/wrc-base && npm run test:e2e        # 需要 node_modules 时：
                                                # cp -r <主仓>/node_modules ./node_modules
                                                # 或 npm ci
cd .. && git worktree remove --force /tmp/wrc-base

# 次选：只读取单个文件
git show <commit>:<path> > /tmp/x
diff /tmp/x <path>
```

> ★ 用 worktree 时注意：Windows 上 `/tmp` 会被解析成 `C:\tmp`，
>   `git worktree list` 显示的路径才是真身；`remove` 前先确认没有大目录残留
>   （`node_modules` 复制很慢，宁可先 `npm i --omit=optional` 或直接用主仓的软链）。

**判据本身也要给**：报告时要写清「哪几条、在哪个 commit、跑了几次」，
否则「基线也有」这句话无法被复核。

---

## 2. 测试不仅要验证「它能失败」，还要验证「它以正确的方式失败」

这一条我犯了两次，症状相同：**测试红了，但红的原因不是我以为的那个。**

### 案例 A：`new Function` 造的故障不是真实路径

我为了复现「`MorphDetail` 里 `addToStationProps` 作用域不成立」，
用 `new Function` 造了个看不到外层作用域的函数体。结果断言打到的是
**`new Function` 自己的 ReferenceError**，与 React 的渲染失败路径**不是同一条**。
测试红了，但红得毫无意义。

正确做法：**在探针里放一个真的不解构该 prop 的组件**，挂上真 React 渲染它 ——
断言打在真实的渲染失败上。

```jsx
// 探针里：真的少解构一个 prop
function MorphDetailBroken({ selectedIds }) {
  return <div>{Object.keys(addToStationProps).length}</div>  // ← ReferenceError
}
```

### 案例 B：替身模块没真的替换掉目标

esbuild 的 `onResolve` filter 写成 `/lib\/cloud\/stationWords\.js$/`，
而 `lib/addToStation.js` 里写的是 `'./cloud/stationWords.js'`（**不含** `lib/cloud/`）
→ 那次调用打到了**真模块**，而测试在断言 mock 的记录 —— 全绿，实际什么都没拦到。

**修法**：① 按**文件名**匹配（`/(^|\/)(stationWords|generate)\.js$/`）
② 打包后读产物做前置自检，断言「mock 的标记在、真模块的特征不在」。

### 两条附带的陷阱

- `const m = /re/` 拿到的是 **RegExp 对象**不是匹配结果，`Boolean(m)` 恒 `true`
  → 这条断言**永远绿**，且看起来完全正常。写完断言要问一句：「它有可能永远绿吗？」
- 断言「代码里没有某词」时**必须先剥注释** —— 解释性注释里提到该词是必要文档，
  不剥会逼人删掉正确说明。反过来，断言「只有一处 X」时也必须剥，否则会把
  注释里的讨论数成代码（我写「只有一处 `setRaw('')`」时数出 4 处就是这么来的）。

---

## 3. 凡「某组件用了新 prop」，必须渲染**那个组件**

`MorphDetail` 是 `App.jsx` 里的**顶层函数**（缩进 0），拿不到 `AppShell` 的变量。
我在它函数体里用了 `{...addToStationProps}` 却没在签名里解构
→ **右侧词群详情里勾选任意一个词就白屏**。

它逃过了三层：

| 检查 | 为什么没抓到 |
|---|---|
| `npm run build` | **esbuild 不做作用域分析** |
| 源码正则断言 | 只检查「`{...addToStationProps}` 这个**字符串**在不在」 |
| `test:cloud` | 那条断言是「匹配字符串」+ **单独 mount 被传的子组件** |

**修正后的规则**：
- 组件 A 用了新 prop ⇒ 测试要 **mount A**，不能只 mount A 内部的子组件；
- 「新增了一个 UI 状态」（比如某个按钮变 disabled）⇒ 断言**那个状态本身**，
  而不是它旁边的说明文字。我漏掉 C-04 的「不可点」就是这么漏的 ——
  我验了「下拉头有口径说明」，没验「那一项本身 disabled」。

---

## 4. 测试套件「静默吞掉后半段」比「失败」更危险

`qa-harness` 曾因一处文案变更导致 `byText(...)` 返回 `undefined`，
下一行 `.match()` 抛 TypeError → 整场中止 → **后面约 60 条断言一条没跑**，
而前面已经打出 30 条 PASS。**看起来是跑过了。**

**修法**（已实装）：

```js
class E2EContractBreak extends Error {}
function mustFind(sel, text, what) {
  const el = byText(sel, text)
  if (!el) {
    ok(false, `契约断裂：找不到${sel}「${text}」`)
    throw new E2EContractBreak(msg)   // 让 runner 明确区分「契约断裂」与「代码 bug」
  }
  return el
}
```

配套：runner 的 catch 要**在输出上就区分**这两者，并明说「后续用例**未执行**」——
否则读者只会看到一堆 PASS。

**通用形态**：凡是「后续要读它的属性」的查找，都要能判空并**显式失败**。
判空不能靠 `ok(false)` 然后继续往下跑（那样只是多一条红），
也不能靠抛裸异常（那样分不清是代码 bug 还是契约变了）。
