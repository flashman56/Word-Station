// 由审核后的 loan 候选生成 words-loan.js 补丁。
// 审核口径（与 reports/loan-decomp-candidates.json 对应，2026-10-14）：
//   - 红线「错的词源比没有更糟」：凡是把不存在的词根/错词根/假连接赋给词的，一律剔除。
//   - 候选里 DeepSeek 幻构了 4 个词素 id（r.count / r.honor / r.matur / s.or），
//     它们不在 morphemes.js，按「只保留真实词素」规则降级为 null 词干。
//   - 硬剔除（词义/词根_assign 错误，非单纯缺 id）：
//       w.delighted  → p.de + light + ed 是假拆（delight 与 light 无关）
//       w.humor      → r.hum 义为「土；人」(humus/homo)，humor 实际来自 umor「湿润」，错词根 + 错后缀 -er
//       w.razor      → s.or 不存在，raz 亦非清单词根，整体借词
//       w.mature     → 仅 r.matur（不存在）幻觉；降级后全 null，merge 层会丢弃 chain，无价值，剔除
import fs from 'fs';

const cand = JSON.parse(fs.readFileSync('reports/loan-decomp-candidates.json', 'utf8'));
const morphSrc = fs.readFileSync('src/data/morphemes.js', 'utf8');
const MORPH_IDS = new Set();
const re = /id:\s*['"]([^'"]+)['"]/g;
let m; while ((m = re.exec(morphSrc))) MORPH_IDS.add(m[1]);

const HARD_REJECT = new Set(['w.delighted', 'w.humor', 'w.razor', 'w.mature']);
const rejected = [];
const kept = [];

for (const w of cand.candidates) {
  if (HARD_REJECT.has(w.id)) {
    rejected.push({ id: w.id, form: w.form, reason: 'hard-reject' });
    continue;
  }
  // 修正 chain：把所有「不存在的词素 id」降级为 null 词干（保留其 form）
  const chain = w.chain.map((p) => {
    if (p.morph && MORPH_IDS.has(p.morph)) return { morph: p.morph, form: p.form, gloss: p.gloss };
    if (p.morph && !MORPH_IDS.has(p.morph)) {
      return { morph: null, form: p.form, gloss: '（整体借入，清单无对应词根）' };
    }
    return { morph: null, form: p.form, gloss: p.gloss };
  });
  const morphHints = chain.filter((p) => p.morph).map((p) => p.morph);
  if (morphHints.length === 0) {
    // 纯 null（如 mature）→ merge 层会丢弃 chain，无价值，剔除
    rejected.push({ id: w.id, form: w.form, reason: 'no-real-morph' });
    continue;
  }
  kept.push({ id: w.id, morphHints, chain });
}

// 写文件
const header = `/**
 * 借词（loan / mono）构词提示补丁表（morphHints）
 * ------------------------------------------------------------------
 * 由 scripts/gen-loan-patch.mjs 依据审核后的 reports/loan-decomp-candidates.json 生成。
 * 仅覆盖「新用户队列里确可拆出真实词素」的借词；凡 DeepSeek 幻构的不存在词根、
 * 或错词根/假连接，均已按红线「错的词源比没有更糟」剔除（见脚本内 HARD_REJECT）。
 * 格式与 words-remorph.js 完全一致：{id, morphHints:[真实词素 id], chain:[...]}。
 * 合并逻辑沿用 words-entry.js / index.js：morphHints 追加进 morphs，chain 收敛 gloss；
 * **不动 morphless 标记**（这些词仍无独立词根，validate 据此放行）。
 *
 * 词条数: ${kept.length}
 */
`;
const lines = kept.map((e) => {
  const hints = JSON.stringify(e.morphHints);
  const chain = JSON.stringify(e.chain);
  return `{id:${JSON.stringify(e.id)},morphHints:${hints},chain:${chain}}`;
});
const out = header + '\nconst wordsLoan = [\n  ' + lines.join(',\n  ') + ',\n]\n\nexport default wordsLoan\n';
fs.writeFileSync('src/data/words-loan.js', out);

console.log('KEPT:', kept.length);
console.log('REJECTED:', rejected.length);
for (const r of rejected) console.log('  REJECT', r.id, r.form, r.reason);
// 校验：所有 morphHints / chain.morph 必须存在
let bad = 0;
for (const e of kept) {
  for (const mid of e.morphHints) if (!MORPH_IDS.has(mid)) { console.log('BAD HINT', e.id, mid); bad++; }
  for (const p of e.chain) if (p.morph && !MORPH_IDS.has(p.morph)) { console.log('BAD CHAIN', e.id, p.morph); bad++; }
}
console.log('BAD MORPH REFERENCES:', bad);
