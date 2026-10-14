#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
lemmatize-corpus.py —— 用 lemminflect 对全库词形做屈折还原（只读，输出 JSON）
------------------------------------------------------------------
为什么用 lemminflect 而不是手写规则：
  手写规则（scripts/lib/base-form.mjs）在已审 draft 上只有 98.74%，且被
  passed→passe / touched→touche / notes→not / caring→car 这类坑到。
  lemminflect 带完整不规则形表，测试用例全对 cared→care passed→pass
  touched→touch putting→put writing→write serving→serve cities→city。

★ 精确性靠 round-trip 校验，不靠「像不像」★
  对每个候选 (form → lemma)，用 lemminflect.getInflection(lemma, tag, form)
  反查「form 是否真是 lemma 在某个 tag 下的屈折形」。查不到就丢弃。
  这样 even if 候选里混进了同形词（car/care、put/putt），也判不出就淘汰。

用法：
  python scripts/lemmatize-corpus.py scripts/.lemma-input.json scripts/.lemma-lemmas.json
"""
import json
import sys
from collections import defaultdict

try:
    from lemminflect import getLemma, getAllInflections
except ImportError:
    print("需要 lemminflect：pip install lemminflect", file=sys.stderr)
    sys.exit(1)

IN = sys.argv[1] if len(sys.argv) > 1 else "scripts/.lemma-input.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "scripts/.lemma-lemmas.json"

# 词性候选顺序：先试动词（屈折变化最规则的往往先命中），再名词/形容词/副词
POSES = ["VERB", "NOUN", "ADJ", "ADV"]

with open(IN, "r", encoding="utf-8") as f:
    rows = json.load(f)

# form(小写) -> 词条
index = {}
for r in rows:
    index.setdefault(r["form"].lower(), r)

out = {}
stats = defaultdict(int)

for r in rows:
    form = r["form"]
    low = form.lower()
    if len(low) < 3:
        stats["tooShort"] += 1
        continue

    cands = []
    for pos in POSES:
        try:
            lems = getLemma(form, pos)
        except Exception:
            lems = ()
        for lem in lems:
            if not lem or lem == low:
                continue
            tgt = index.get(lem.lower())
            if not tgt or tgt["id"] == r["id"]:
                continue
            if tgt.get("kind") == "proper":
                continue
            cands.append((lem.lower(), pos, tgt))

    if not cands:
        stats["noCandidate"] += 1
        continue

    # ★ round-trip 校验：form 必须**真的出现在** lemma 在该词性下的全部屈折形里 ★
    #   （不用 getInflection —— 它的第二参要 Penn tag(VBD) 而非 upos(VERB)，
    #     传 upos 会返回 None 并刷 "Invalid upos type"。改用 getAllInflections 更稳。）
    verified = []
    seen = set()
    for lem, pos, tgt in cands:
        if lem in seen:
            continue
        try:
            infl = getAllInflections(lem, pos) or {}
        except Exception:
            infl = {}
        # infl 结构是 {PennTag: (form, ...)}，例如 {'VBD': ('cared',), 'VBG': ('caring',)}
        hit_tags = [tag for tag, forms in infl.items() if form in forms]
        if hit_tags:
            verified.append({
                "lemma": lem,
                "pos": pos,
                "tags": hit_tags[:4],
                "target": tgt,
            })
            seen.add(lem)

    if not verified:
        stats["noVerified"] += 1
        continue

    # 多候选时取「原形比变形形更常用」的那个（freqRank 数值更小）；
    # 都满足则取 POS 靠前的（VERB 优先）。
    def rank(c):
        tf = r.get("freqRank")
        tl = c["target"].get("freqRank")
        tf = tf if isinstance(tf, (int, float)) else 10**9
        tl = tl if isinstance(tl, (int, float)) else 10**9
        return (0 if tl <= tf else 1, POSES.index(c["pos"]))

    verified.sort(key=rank)
    out[form] = verified
    stats["ok"] += 1

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)

print(f"输入 {len(rows)} 词形 → 成功还原 {len(out)}")
for k in ("ok", "noCandidate", "noVerified", "tooShort"):
    print(f"  {k}: {stats[k]}")