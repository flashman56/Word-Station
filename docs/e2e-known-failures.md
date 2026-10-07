# e2e 剩余 2 条 FAIL：归属记录与复现判据

> **结论**：这 2 条**属基线预存在，与本轮（`112f802` → `80efdd3`）无关**，**本轮不修**。
> 依据 team-lead 裁决：「属于本轮范围外，不要顺手修」——
> ① 它们与数据安全无关；② 其中一条有 flaky 成分，**顺手修 flaky 是最危险的**
> （可能只是把偶发失败调成稳定失败，然后以为修好了）。
> **下一轮若要处理，应单独立项**，不混进功能交付。

## 涉及的 2 条断言

| # | 断言 | 代码位置 | 依赖 |
|---|---|---|---|
| 1 | `词关系网有连线（N 条）` | `scripts/qa-harness.jsx:820` | `q('svg line')` —— 词关系网的 SVG 连线 |
| 2 | `三大板块的类型名称各自可见` | `scripts/qa-harness.jsx:771` | `document.body.textContent` 含「火山熔岩型 / 热带植被型 / 冰雪岩石型」 |

## 可复现的判据

**归属判定（本轮实测，静态可查）**：这 2 条依赖的全部组件**本轮零改动**。

```bash
git diff --stat 112f802..HEAD -- src/
# 17 个文件，全部是本轮的小站打磨相关（App/AddWordsPanel/useStationWords/migrate 等）

# 逐个确认依赖组件未改：
git diff --quiet 112f802..HEAD -- src/components/landmarks.jsx   && echo 未改
git diff --quiet 112f802..HEAD -- src/components/NetworkView.jsx && echo 未改
git diff --quiet 112f802..HEAD -- src/lib/atlas.js               && echo 未改
git diff --quiet 112f802..HEAD -- src/lib/graph.js               && echo 未改
# → 四项全为「未改」
```

断言 1 的直接依赖是 `NetworkView.jsx` 的关系网 SVG（`svg line`）；
断言 2 的「三大板块」是 `landmarks.jsx` 的集群地形（`data-atlas-clusters`）。

**基线实跑（QA 独立复核）**：QA 在 `git worktree` 里对 `112f802` 实跑，
同样得到这 2 条 FAIL，且报告**基线首跑时断言 2 飘过 1 次** ⇒ 含 flaky 成分。

**要复现基线行为，用 worktree（不要动主工作区）**：

```bash
git worktree add /tmp/wrc-base 112f802
cd /tmp/wrc-base
cp -r <主仓>/node_modules ./node_modules     # 软链在 Windows 上不可靠
node scripts/qa-react-e2e.mjs
cd .. && git worktree remove --force /tmp/wrc-base
```

## flaky 的成因（已定位，未修）

断言 1 依赖 `flush(350)` 后 SVG 是否已渲染完成 —— 这是一个**定时器与渲染时序的竞争**，
不是数据问题。断言 2 同理（`document.body.textContent` 的读取时机）。

**为什么本轮坚决不修**：
- 「加长 flush 时长」能让它变绿，但那是**把偶发失败调成稳定通过**，不是修好；
- 真正要修得给这类异步渲染一个确定性的等待条件（如轮询到「`svg line` 数量 > 0」
  或某个 `data-*` 就绪标记），那是 harness 结构的改动，属于下一轮立项范围。

## 附：本轮 e2e 从 30 条恢复到 97 条

修 bug 前 e2e 因契约漂移**整场中止**（`byText('button','全选当前结果')` 返回 undefined
→ 下一行 `.match()` 抛 TypeError → 附加 C–J 约 60 条一条没跑，而前面已打出 30 条 PASS）。
修复后 97 条 PASS —— 那 60 条里就包含本轮 C-02 要验的 MorphDetail / FocusView 覆盖。
