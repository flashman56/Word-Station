# lemma 归并 · 人工审计清单

> 共 **2965** 条待审（`auto-fold` 与 `keep` 桶已自动放行，不在此列）。按 fRank 升序，优先审高频。
> 证据列：form/lemma 的 rank、kind、词库 gloss、ECDICT translation 摘要（各截 ~60 字）、type、src、flags。
> `建议` 为机器可判者（fold / keep / fix-target:<原型>）；`?` 表示需人工语义裁决。

## is → be
- rank：form 8 / lemma 23 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「是（be 第三人称单数）」 / lemma「是；存在」
- ECDICT：form「be的现在式第三人称 [计] 加下标次序, 信息系统, 国际标准, 中间系统」 / lemma「v. 是, 表示, 在 [计] 后端, 总线允许」
- **建议：`keep`**

## was → be
- rank：form 20 / lemma 23 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「是（be 过去式单数）」 / lemma「是；存在」
- ECDICT：form「be的过去式」 / lemma「v. 是, 表示, 在 [计] 后端, 总线允许」
- **建议：`keep`**

## got → get
- rank：form 49 / lemma 6072 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「得到（get 过去式）」 / lemma「得到；获得；变得」
- ECDICT：form「get的过去式和过去分词 [化] 谷草转氨酶; 谷氨酸草酰乙酸转氨酶」 / lemma「vt. 得到, 获得, 变成, 使得, 收获, 接通, 抓住, 染上 vi. 到达, 成为, 变得 n. (网球等)救球…」
- **建议：`keep`**

## did → do
- rank：form 52 / lemma 1850 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（do 过去式）」 / lemma「做；完成」
- ECDICT：form「do的过去式」 / lemma「v. 做, 进行, 完成」
- **建议：`keep`**

## going → go
- rank：form 60 / lemma 1810 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「去（go 现在分词）」 / lemma「去；离开」
- ECDICT：form「n. 去, 离去, 工作情况, 地面状况, 行为 a. 进行中的, 流行的, 成功的, 现存的」 / lemma「vi. 去, 走, 达到, 运转, 查阅, 消失, 结束, 放弃, 花费, 流传, 趋于, 打算, 剩下 vt. 以..…」
- **建议：`keep`**

## were → be
- rank：form 67 / lemma 23 ｜ type `p` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「是（be 过去式复数）」 / lemma「是；存在」
- ECDICT：form「be的过去式」 / lemma「v. 是, 表示, 在 [计] 后端, 总线允许」
- **建议：`?`**

## could → can
- rank：form 77 / lemma 26 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「能；可以（can 过去式）」 / lemma「能；可以」
- ECDICT：form「aux. 可以, 能」 / lemma「vt. 装罐 n. 罐头, 容器 aux. 能, 可以 [计] 作废字符」
- **建议：`?`**

## said → say
- rank：form 96 / lemma 1860 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说（say 过去式）」 / lemma「说；表达」
- ECDICT：form「a. 上述的 say的过去式和过去分词」 / lemma「vt. 说, 讲, 念, 说明, 指明 vi. 说, 讲 n. 意见, 发言权」
- **建议：`keep`**

## doing → do
- rank：form 104 / lemma 1850 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（do 现在分词）」 / lemma「做；完成」
- ECDICT：form「n. 行为, 活动」 / lemma「v. 做, 进行, 完成」
- **建议：`keep`**

## won → win
- rank：form 123 / lemma 2680 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赢（win 的过去式）」 / lemma「赢；获胜」
- ECDICT：form「win的过去式和过去分词」 / lemma「vt. 赢得, 打胜, 成功 vi. 获胜, 达到, 影响 n. 胜利, 赢, 收益」
- **建议：`keep`**

## better → good
- rank：form 130 / lemma 270 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更好的」 / lemma「好的；有益的」
- ECDICT：form「a. 较好的 adv. 比较好」 / lemma「n. 善行, 好处, 利益 a. 好的, 优良的, 上等的, 愉快的, 有益的, 好心的, 慈善的, 虔诚的」
- **建议：`keep`**

## told → tell
- rank：form 132 / lemma 1870 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「告诉（tell 的过去式）」 / lemma「告诉；辨别」
- ECDICT：form「tell的过去式和过去分词」 / lemma「vt. 告诉, 说, 吩咐, 断定, 知道 vi. 讲述, 泄密, 告发, 表明」
- **建议：`keep`**

## things → thing
- rank：form 133 / lemma 5163 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「东西；事情（thing 的复数）」 / lemma「东西；物品」
- ECDICT：form「n. 所有物, 财产, 用具, 用品, 局面, 形势, 情况 [法] 物」 / lemma「n. 事物, 东西, 物, 用品, 事, 事件, 情况, 行为, 特征」
- **建议：`keep`**

## years → year
- rank：form 135 / lemma 1060 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「年（year 的复数）」 / lemma「年；年度」
- ECDICT：form「n. 年代；岁月；年；年龄」 / lemma「n. 年, 年度, 年龄 [经] 年度」
- **建议：`keep`**

## does → do
- rank：form 136 / lemma 1850 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（do 的第三人称单数）」 / lemma「做；完成」
- ECDICT：form「v. 做；工作；有用（do的第三人称单数形式）」 / lemma「v. 做, 进行, 完成」
- **建议：`keep`**

## does → doe
- rank：form 136 / lemma 5522 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（do 的第三人称单数）」 / lemma「母鹿」
- ECDICT：form「v. 做；工作；有用（do的第三人称单数形式）」 / lemma「n. 母鹿, 雌兔」
- **建议：`keep`**

## guys → guy
- rank：form 141 / lemma 143 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「家伙们；各位」 / lemma「家伙；男人」
- ECDICT：form「n. 各位, 朋友们；球员」 / lemma「n. 家伙, 支索 vt. 用支索撑住, 取笑, 嘲弄 vi. 逃跑」
- **建议：`keep`**

## made → make
- rank：form 144 / lemma 1840 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（make 的过去式）」 / lemma「制作；使得」
- ECDICT：form「a. 人工制成的, 成功的, 创造的 make的过去式和过去分词」 / lemma「vt. 制造, 安排, 创造, 构成, 使得, 产生, 造成, 整理, 布置, 引起, 到达, 进行 vi. 开始, 前…」
- **建议：`keep`**

## done → do
- rank：form 148 / lemma 1850 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做（do 的过去分词）」 / lemma「做；完成」
- ECDICT：form「a. 完成了的, 好了的 do的过去分词」 / lemma「v. 做, 进行, 完成」
- **建议：`keep`**

## coming → come
- rank：form 154 / lemma 1800 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「来（come 的现在分词）」 / lemma「来；到达」
- ECDICT：form「n. 来临 a. 就要来的, 接着的」 / lemma「vi. 过来, 来, 到达, 出现, 开始 interj. 喂」
- **建议：`keep`**

## left → leave
- rank：form 161 / lemma 8109 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「左边的；剩下的」 / lemma「离开；留下；出发」
- ECDICT：form「a. 左边的, 左倾的, 左侧的, 左派的 adv. 在左面 n. 左, 左面, 左派 leave的过去式和过去分词」 / lemma「n. 许可, 告别, 请假, 休假 vt. 离开, 剩下, 遗忘, 委托, 丢弃 vi. 出发, 离开, 生叶」
- **建议：`keep`**

## happened → happen
- rank：form 164 / lemma 279 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发生（happen 的过去式）」 / lemma「发生；碰巧」
- ECDICT：form「v. 发生（happen的过去式, 过去分词）」 / lemma「vi. 发生, 发生, 恰巧」
- **建议：`keep`**

## came → come
- rank：form 165 / lemma 1800 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「来（come 的过去式）」 / lemma「来；到达」
- ECDICT：form「come的过去式」 / lemma「vi. 过来, 来, 到达, 出现, 开始 interj. 喂」
- **建议：`keep`**

## talking → talk
- rank：form 177 / lemma 5916 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「谈话（talk 的现在分词）」 / lemma「谈话；讨论」
- ECDICT：form「a. 说话的, 多嘴的, 富有表情的 n. 讲话, 谈论」 / lemma「n. 谈话, 交谈, 会谈, 讲话, 演讲, 空谈, 谣言, 方言, 语言 vi. 讲话, 演讲, 说话, 谈话, 交流…」
- **建议：`keep`**

## found → find
- rank：form 178 / lemma 1740 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「找到（find 的过去式）」 / lemma「找到；发现」
- ECDICT：form「vt. 建立, 创立, 铸造 find的过去式和过去分词」 / lemma「vt. 发现, 感到, 找到, 认为, 得到 vi. 裁决 n. 发现 [计] 查找; DOS外部命令:在指定的文件或从…」
- **建议：`keep`**

## getting → get
- rank：form 180 / lemma 6072 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「得到（get 的现在分词）」 / lemma「得到；获得；变得」
- ECDICT：form「n. 采煤, 采掘；获得」 / lemma「vt. 得到, 获得, 变成, 使得, 收获, 接通, 抓住, 染上 vi. 到达, 成为, 变得 n. (网球等)救球…」
- **建议：`keep`**

## looking → look
- rank：form 181 / lemma 1730 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看（look 的现在分词）」 / lemma「看；外观」
- ECDICT：form「a. 有…相貌的；有…样子的」 / lemma「n. 一看, 神色, 样子, 面容 vi. 看, 注意, 朝着, 显得 vt. 打量, 看上去与...一样, 以眼色(或…」
- **建议：`keep`**

## went → go
- rank：form 184 / lemma 1810 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「去（go 的过去式）」 / lemma「去；离开」
- ECDICT：form「go的过去式」 / lemma「vi. 去, 走, 达到, 运转, 查阅, 消失, 结束, 放弃, 花费, 流传, 趋于, 打算, 剩下 vt. 以..…」
- **建议：`keep`**

## best → good
- rank：form 188 / lemma 270 ｜ type `t` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「最好的」 / lemma「好的；有益的」
- ECDICT：form「a. 最好的 adv. 最好地 n. 最好的人」 / lemma「n. 善行, 好处, 利益 a. 好的, 优良的, 上等的, 愉快的, 有益的, 好心的, 慈善的, 虔诚的」
- **建议：`keep`**

## seen → see
- rank：form 199 / lemma 1720 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看见（see 的过去分词）」 / lemma「看见；理解」
- ECDICT：form「see的过去分词」 / lemma「vt. 看见, 查看, 参观, 游览, 理解, 知道, 同意 vi. 看, 观看, 注意, 知道, 考虑 n. 主教的职…」
- **建议：`keep`**

## heard → hear
- rank：form 205 / lemma 1710 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「听见（hear 过去式/过去分词）」 / lemma「听见；听说」
- ECDICT：form「hear的过去式和过去分词」 / lemma「vt. 听到, 倾听, 听说, 审理 vi. 听见, 听」
- **建议：`keep`**

## called → call
- rank：form 207 / lemma 5943 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叫；打电话（call 过去式）」 / lemma「叫；称呼；打电话」
- ECDICT：form「a. 被呼叫的」 / lemma「n. 呼叫, 访问, 打电话, 号召, 召集, 要求 vt. 呼叫, 召集, 打电话 vi. 叫喊, 访问, 叫牌 [计…」
- **建议：`keep`**

## used → use
- rank：form 208 / lemma 222 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使用（use 过去式）；习惯于」 / lemma「使用；利用」
- ECDICT：form「a. 使用过的, 二手的, 习惯的」 / lemma「n. 使用, 习惯, 使用价值, 用法, 使用权 vt. 使用, 利用, 运用, 耗费 vi. 惯常」
- **建议：`keep`**

## knew → know
- rank：form 210 / lemma 520 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「知道（know 过去式）」 / lemma「知道；认识」
- ECDICT：form「know的过去式」 / lemma「v. 知道, 了解, 认识, 确信」
- **建议：`keep`**

## bit → bite
- rank：form 216 / lemma 5334 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「一点；小块」 / lemma「咬；咬住」
- ECDICT：form「n. 少量, 马嚼子, 辅币 vt. 给马上嚼子, 控制 bite的过去式和过去分词 [计] 比特, 二进制数位, 机内…」 / lemma「n. 咬, 一口 v. 咬, 刺痛, 穿透」
- **建议：`keep`**

## took → take
- rank：form 217 / lemma 1770 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿（take 过去式）」 / lemma「拿；带走；花费」
- ECDICT：form「take的过去式」 / lemma「vt. 拿, 取, 抓, 带领, 获得, 就座, 接受, 吃, 吸引, 采取, 乘, 需要, 花费 vi. 吃掉对方棋子…」
- **建议：`keep`**

## men → man
- rank：form 220 / lemma 530 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「男人（man 的复数）」 / lemma「男人；人」
- ECDICT：form「pl. man的复数」 / lemma「n. 男人, 人类, 人 vt. 为...配备人手, 操纵, 使振奋 [计] 城域网, 手册」
- **建议：`keep`**

## days → day
- rank：form 226 / lemma 1000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「天；日子（day 的复数）」 / lemma「一天；白天」
- ECDICT：form「n. 一生, 时期 adv. 每天, 在白天」 / lemma「n. 天, 日子, 白天, 工作日 [医] 日(一昼夜), 昼, 白天」
- **建议：`keep`**

## gone → go
- rank：form 236 / lemma 1810 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「走了的；消失的」 / lemma「去；离开」
- ECDICT：form「a. 离去的, 死去的, 用完的 go的过去分词」 / lemma「vi. 去, 走, 达到, 运转, 查阅, 消失, 结束, 放弃, 花费, 流传, 趋于, 打算, 剩下 vt. 以..…」
- **建议：`keep`**

## saying → say
- rank：form 238 / lemma 1860 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「谚语；说法」 / lemma「说；表达」
- ECDICT：form「n. 叙述, 话, 说, 言论」 / lemma「vt. 说, 讲, 念, 说明, 指明 vi. 说, 讲 n. 意见, 发言权」
- **建议：`keep`**

## looks → look
- rank：form 240 / lemma 1730 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「外貌；长相」 / lemma「看；外观」
- ECDICT：form「n. 美貌」 / lemma「n. 一看, 神色, 样子, 面容 vi. 看, 注意, 朝着, 显得 vt. 打量, 看上去与...一样, 以眼色(或…」
- **建议：`keep`**

## fucking → fuck
- rank：form 242 / lemma 212 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「他妈的（粗话强调）」 / lemma「他妈的（粗话）」
- ECDICT：form「a. 该死的, 难完成的, 难做的, 低劣的, 讨厌的, 丑恶的, 混乱的, 乱糟糟的」 / lemma「vt. 与...性交, 欺骗, 诅咒 vi. 性交 n. 性交, 些微, 杂种 interj. 他妈的, 混帐」
- **建议：`?`**

## friends → friend
- rank：form 245 / lemma 420 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「朋友（friend 的复数）」 / lemma「朋友」
- ECDICT：form「n. 老友记（剧集）」 / lemma「n. 朋友, 支持者, 赞助者 [法] 朋友, 友人, 赞助者」
- **建议：`keep`**

## lost → lose
- rank：form 252 / lemma 1750 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「迷路的；丢失的」 / lemma「失去；输掉」
- ECDICT：form「a. 失去的, 遗失的, 迷惑的 lose的过去式和过去分词」 / lemma「vt. 遗失, 损失, 丢失, 使失去, 错过, 浪费, 迷失, 使迷路, 输去, 使沉溺于 vi. 受损失, 失败」
- **建议：`keep`**

## says → say
- rank：form 257 / lemma 1860 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说（say 第三人称单数）」 / lemma「说；表达」
- ECDICT：form「v. 说（第三人称单数）」 / lemma「vt. 说, 讲, 念, 说明, 指明 vi. 说, 讲 n. 意见, 发言权」
- **建议：`keep`**

## later → late
- rank：form 260 / lemma 1510 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「后来；稍后」 / lemma「晚的（地）；迟到的」
- ECDICT：form「adv. 以后, 随后」 / lemma「a. 迟的, 晚的, 已故的 adv. 很晚, 很迟, 晚」
- **建议：`keep`**

## working → work
- rank：form 267 / lemma 2600 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工作（work 的现在分词）」 / lemma「工作；起作用」
- ECDICT：form「n. 工作, 运转, 劳动 a. 工作的, 劳动的, 经营的, 抽搐的, 运转的」 / lemma「n. 工作, 劳动, 职业, 行为, 功, 作品, 成果, 产品, 工程 vi. 工作, 劳动, 做, 运转, 起作用,…」
- **建议：`keep`**

## kids → kid
- rank：form 270 / lemma 7479 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「孩子（kid 的复数）」 / lemma「小山羊」
- ECDICT：form「n. 小山羊；儿童（kid的复数）」 / lemma「n. 小山羊, 小山羊肉, 小孩, 欺骗 a. 小山羊皮制的 v. 哄骗, 嘲弄」
- **建议：`keep`**

## gave → give
- rank：form 278 / lemma 1760 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给（give 过去式）」 / lemma「给；给予」
- ECDICT：form「give的过去式」 / lemma「n. 弹性, 适应性 vt. 给, 授予, 供给, 产生, 发表, 付出, 献出, 让出 vi. 捐赠, 支持不住, 让…」
- **建议：`keep`**

## knows → know
- rank：form 282 / lemma 520 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「知道；认识（第三人称单数）」 / lemma「知道；认识」
- ECDICT：form「v. 知道（know的第三人称单数形式）」 / lemma「v. 知道, 了解, 认识, 确信」
- **建议：`keep`**

## eyes → eye
- rank：form 285 / lemma 1130 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眼睛（复数）」 / lemma「眼睛；注视」
- ECDICT：form「n. 眼睛（eye的复数）」 / lemma「n. 眼睛, 视力, 看 vt. 看, 注视」
- **建议：`keep`**

## taking → take
- rank：form 288 / lemma 1770 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿；取；花费（现在分词）」 / lemma「拿；带走；花费」
- ECDICT：form「n. 取得, 捕获, 进款 a. 迷人的, 可爱的, 会传染的」 / lemma「vt. 拿, 取, 抓, 带领, 获得, 就座, 接受, 吃, 吸引, 采取, 乘, 需要, 花费 vi. 吃掉对方棋子…」
- **建议：`keep`**

## times → time
- rank：form 289 / lemma 1070 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「次数；时代；乘以」 / lemma「时间；次数；计时」
- ECDICT：form「n. 时代, 境遇, 时报」 / lemma「n. 时间, 时侯, 时机, 时期, 期限, 次数, 节拍, 暂停, 规定时间 vt. 测定...的时间, 记录...的…」
- **建议：`keep`**

## hands → hand
- rank：form 291 / lemma 1100 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手（复数）」 / lemma「手；递给」
- ECDICT：form「n. 拥有, 所有 [计] 动手」 / lemma「n. 手, 爪, 指针, 掌握, 协助, 人手, 手艺, 手迹, 支配, 插手 vt. 交给, 支持, 搀扶」
- **建议：`keep`**

## means → mean
- rank：form 294 / lemma 5496 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「方法；手段；意味着（动词）」 / lemma「刻薄的；小气的」
- ECDICT：form「n. 方法, 手段, 工具, 财产, 收入 [经] 方法, 手段, 工具; 意谓」 / lemma「a. 低劣的, 卑贱的, 简陋的, 吝啬的, 惭愧的, 平均的, 中间的, 普通的 vt. 意谓, 想要, 意欲, 预定…」
- **建议：`keep`**

## makes → make
- rank：form 297 / lemma 1840 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「制作；使得（第三人称单数）」 / lemma「制作；使得」
- ECDICT：form「v. 做, 制作（make的第三人称单数）」 / lemma「vt. 制造, 安排, 创造, 构成, 使得, 产生, 造成, 整理, 布置, 引起, 到达, 进行 vi. 开始, 前…」
- **建议：`keep`**

## asked → ask
- rank：form 298 / lemma 1880 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「问；要求（过去式）」 / lemma「问；请求」
- ECDICT：form「n. 卖方要价」 / lemma「vi. 问, 要求 vt. 问, 要求, 邀请, 需要」
- **建议：`keep`**

## making → make
- rank：form 301 / lemma 1840 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「制作；使得（现在分词）」 / lemma「制作；使得」
- ECDICT：form「n. 制造, (手工)制造业, 制作, 形成, 发展, 要素, 内在因素, 赚头, 制造物」 / lemma「vt. 制造, 安排, 创造, 构成, 使得, 产生, 造成, 整理, 布置, 引起, 到达, 进行 vi. 开始, 前…」
- **建议：`keep`**

## comes → come
- rank：form 309 / lemma 1800 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「来（第三人称单数）」 / lemma「来；到达」
- ECDICT：form「v. 来自；从…来（come的三单形式）」 / lemma「vi. 过来, 来, 到达, 出现, 开始 interj. 喂」
- **建议：`keep`**

## number → numb
- rank：form 312 / lemma 8412 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「数字；号码」 / lemma「麻木的；失去感觉的」
- ECDICT：form「n. 数, 数字, 数目, 号码 vt. 数, 计算, 共计 vi. 计算, 报数 [计] 数字」 / lemma「a. 麻木的, 失去知觉的 vt. 使麻木, 使昏迷, 使失去知觉」
- **建议：`keep`**

## girls → girl
- rank：form 319 / lemma 560 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「女孩（复数）」 / lemma「女孩」
- ECDICT：form「n. 女孩（girl的复数）」 / lemma「n. 女孩, 少女, 女佣」
- **建议：`keep`**

## married → marry
- rank：form 320 / lemma 518 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已婚的」 / lemma「结婚；嫁娶」
- ECDICT：form「a. 已婚的, 婚姻的 [法] 结了婚的, 有配偶的, 夫妇的」 / lemma「vt. 与...结婚, 娶, 嫁 vi. 结婚」
- **建议：`keep`**

## children → child
- rank：form 323 / lemma 430 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「孩子们（复数）」 / lemma「儿童；孩子」
- ECDICT：form「pl. 孩子, 孩子们」 / lemma「n. 孩子, 产物, 追随者 [医] 儿童」
- **建议：`keep`**

## supposed → suppose
- rank：form 328 / lemma 1500 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「应该；假定（过去式）」 / lemma「假设；认为」
- ECDICT：form「a. 想象上的, 假定的, 被信以为真的 [法] 推测的, 想像的, 被信以为真的」 / lemma「vt. 推想, 假设, 以为, 想像, 假定 vi. 料想」
- **建议：`keep`**

## goes → go
- rank：form 330 / lemma 1810 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「去（第三人称单数）」 / lemma「去；离开」
- ECDICT：form「v. 前进；行走（go的第三人称单数形式）」 / lemma「vi. 去, 走, 达到, 运转, 查阅, 消失, 结束, 放弃, 花费, 流传, 趋于, 打算, 剩下 vt. 以..…」
- **建议：`keep`**

## hours → hour
- rank：form 331 / lemma 402 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「小时（复数）」 / lemma「小时；钟头」
- ECDICT：form「n. 小时（hour的复数形式）」 / lemma「n. 小时, 钟头, 时间, ...点钟, 课时」
- **建议：`keep`**

## women → woman
- rank：form 332 / lemma 540 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「女人（复数）」 / lemma「女人」
- ECDICT：form「pl. 女人」 / lemma「n. 女人, 妇女, 女仆 a. 女用的, 女性的, 妇女的 vt. 贬称...为女人, 使成女人腔」
- **建议：`keep`**

## playing → play
- rank：form 339 / lemma 2608 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「玩；演奏（现在分词）」 / lemma「玩；演奏；戏剧」
- ECDICT：form「n. 游戏, 玩耍, 竞技, 比赛, 扮演, 演奏, 赌博」 / lemma「n. 游戏, 游玩, 玩笑, 运动, 比赛, 赌博, 跳动, 表演, 剧本 v. 玩, 游戏, 假装, 开玩笑, 比赛,…」
- **建议：`keep`**

## gets → get
- rank：form 340 / lemma 6072 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「得到；变得（第三人称单数）」 / lemma「得到；获得；变得」
- ECDICT：form「abbr. 政府电子贸易服务（Government Electronic Tendering Service）；美国政府…」 / lemma「vt. 得到, 获得, 变成, 使得, 收获, 接通, 抓住, 染上 vi. 到达, 成为, 变得 n. (网球等)救球…」
- **建议：`keep`**

## shot → shoot
- rank：form 341 / lemma 4626 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「射击；镜头；注射」 / lemma「嫩芽；新枝」
- ECDICT：form「n. 发射, 炮弹, 射击, 射手, 投篮, 射门, 子弹, 射程, 拍摄, 注射 vt. 装弹, 使成颗粒状 a. 杂…」 / lemma「n. 射击, 狩猎, 芽, 射伤, 发射, 发芽, 急流, 推力, 摄影, 急送, 滑运道, 浪费 vt. 射击, 射中…」
- **建议：`keep`**

## brought → bring
- rank：form 349 / lemma 6237 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「带来（过去式）」 / lemma「带来；拿来」
- ECDICT：form「bring的过去式和过去分词」 / lemma「vt. 带来, 产生, 促使, 提出 vi. 生产」
- **建议：`keep`**

## died → die
- rank：form 355 / lemma 1830 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「死亡（过去式）」 / lemma「死亡；消失」
- ECDICT：form「v. 死亡, 消逝（die的过去式和过去分词）」 / lemma「vi. 死亡, 消逝, 平息, 熄灭, 漠然, 渴望 vt. 死 n. 骰子, 冲模」
- **建议：`keep`**

## seems → seem
- rank：form 357 / lemma 434 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「似乎（第三人称单数）」 / lemma「似乎；好像」
- ECDICT：form「v. 好像, 仿佛（ seem的第三人称单数 ）」 / lemma「vi. 象是, 似乎」
- **建议：`keep`**

## telling → tell
- rank：form 361 / lemma 1870 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有效的；说明问题的」 / lemma「告诉；辨别」
- ECDICT：form「a. 有效的, 显著的, 显露内心活动的」 / lemma「vt. 告诉, 说, 吩咐, 断定, 知道 vi. 讲述, 泄密, 告发, 表明」
- **建议：`keep`**

## boys → boy
- rank：form 365 / lemma 550 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「男孩们（boy 的复数）」 / lemma「男孩」
- ECDICT：form「n. 男孩子们；小伙子们（boy的复数）」 / lemma「n. 男孩 [法] 男孩, 少年, 儿子」
- **建议：`keep`**

## months → month
- rank：form 369 / lemma 1050 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「月份（month 的复数）」 / lemma「月；月份」
- ECDICT：form「月份（month的复数）」 / lemma「n. 月 [经] 月」
- **建议：`keep`**

## feeling → feel
- rank：form 385 / lemma 5343 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感觉；情感」 / lemma「感觉；触摸」
- ECDICT：form「n. 摸, 触觉, 知觉, 感觉, 情绪, 同情 a. 有同情心的, 有感觉的, 仁慈的, 动人的」 / lemma「vt. 感觉, 觉得, 触摸, 以为 vi. 有知觉, 摸索, 同情 n. 感觉, 觉得, 触摸」
- **建议：`keep`**

## feeling → felt
- rank：form 385 / lemma 5199 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感觉；情感」 / lemma「毛毡；毡制品」
- ECDICT：form「n. 摸, 触觉, 知觉, 感觉, 情绪, 同情 a. 有同情心的, 有感觉的, 仁慈的, 动人的」 / lemma「n. 毛毯, 毡 vt. 制毡, 使粘结 vi. 粘结 feel的过去式和过去分词」
- **建议：`keep`**

## living → live
- rank：form 386 / lemma 1820 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生计；生活；活着的」 / lemma「生活；居住；现场直播的」
- ECDICT：form「n. 生活, 生计, 生存 a. 活的, 逼真的, 现存的」 / lemma「a. 活的, 生动的, 精力充沛的, 实况转播的 vi. 活, 生存, 居住 vt. 过着, 度过, 经历 adv. 实…」
- **建议：`keep`**

## sighs → sigh
- rank：form 392 / lemma 4297 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叹气（sigh 的三单）」 / lemma「叹息；叹气」
- ECDICT：form「n. 叹息；手势；标记（sigh的复数）」 / lemma「n. 叹息 vi. 叹息, 渴望 vt. 叹息着说」
- **建议：`keep`**

## leaving → leave
- rank：form 394 / lemma 8109 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「离开；留下（leave 的现在分词）」 / lemma「离开；留下；出发」
- ECDICT：form「n. 离开；残余；渣滓」 / lemma「n. 许可, 告别, 请假, 休假 vt. 离开, 剩下, 遗忘, 委托, 丢弃 vi. 出发, 离开, 生叶」
- **建议：`keep`**

## running → run
- rank：form 396 / lemma 470 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跑；经营（run 的现在分词）」 / lemma「跑；运行」
- ECDICT：form「n. 赛跑, 流出, 运转 a. 流动的, 跑着的, 连续的」 / lemma「n. 跑, 赛跑, 奔跑, 奔跑的路程, 趋向, 流出, 运转时间, 连续 vi. 跑, 奔跑, 跑步, 赛跑, 竞赛,…」
- **建议：`keep`**

## taken → take
- rank：form 399 / lemma 1770 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿；取（take 的过去分词）」 / lemma「拿；带走；花费」
- ECDICT：form「take的过去分词」 / lemma「vt. 拿, 取, 抓, 带领, 获得, 就座, 接受, 吃, 吸引, 采取, 乘, 需要, 花费 vi. 吃掉对方棋子…」
- **建议：`keep`**

## sent → send
- rank：form 401 / lemma 8103 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发送；派遣（send 的过去式）」 / lemma「发送；派遣；传达」
- ECDICT：form「send的过去式和过去分词」 / lemma「vt. 发送, 使进入, 寄, 派遣, 发射, 使陷于 vi. 寄信, 派人, 播送 n. (船的)上升运动 [计] 发…」
- **建议：`keep`**

## lives → life
- rank：form 405 / lemma 1080 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生命（life 的复数）；居住」 / lemma「生命；生活」
- ECDICT：form「life的复数」 / lemma「n. 生活, 生命, 人生, 世事, 生物, 寿命, 一生, 生命力, 灵魂, 无期徒刑 [医] 生活, 生存, 生命,…」
- **建议：`keep`**

## lives → live
- rank：form 405 / lemma 1820 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生命（life 的复数）；居住」 / lemma「生活；居住；现场直播的」
- ECDICT：form「life的复数」 / lemma「a. 活的, 生动的, 精力充沛的, 实况转播的 vi. 活, 生存, 居住 vt. 过着, 度过, 经历 adv. 实…」
- **建议：`keep`**

## parents → parent
- rank：form 407 / lemma 2841 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「父母；双亲」 / lemma「父母；家长」
- ECDICT：form「n. 父母；双亲（parent的复数）」 / lemma「n. 父母, 父母亲, 根源 [法] 父亲, 母亲, 根源」
- **建议：`keep`**

## sounds → sound
- rank：form 411 / lemma 6234 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「听起来（sound 的三单）；声音」 / lemma「声音；响声」
- ECDICT：form「n. 音效, 声音（sound的复数）」 / lemma「n. 声音, 语音, 吵闹, 声调, 听力范围, 探条, 海峡 a. 健全的, 可靠的, 合理的, 健康的, 彻底的, …」
- **建议：`keep`**

## scared → scare
- rank：form 415 / lemma 1451 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「害怕的；恐惧的」 / lemma「使害怕；惊吓」
- ECDICT：form「a. 害怕的, 担惊受怕的, 惊慌的, 吓坏了的」 / lemma「n. 惊吓, 恐慌 vt. 惊吓, 使恐慌 vi. 受惊」
- **建议：`keep`**

## laughs → laugh
- rank：form 420 / lemma 1670 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「笑（laugh 的三单）」 / lemma「笑；笑声」
- ECDICT：form「n. 笑声( laugh的名词复数 ); 笑态; 笑料 v. 笑( laugh的第三人称单数 ); 发笑; 嘲笑; （特…」 / lemma「n. 笑, 笑声 vi. 笑, 大笑 vt. 以笑表示」
- **建议：`keep`**

## asking → ask
- rank：form 422 / lemma 1880 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「问；请求（ask 的现在分词）」 / lemma「问；请求」
- ECDICT：form「n. 请求」 / lemma「vi. 问, 要求 vt. 问, 要求, 邀请, 需要」
- **建议：`keep`**

## chuckles → chuckle
- rank：form 433 / lemma 4267 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轻声笑（chuckle 的三单）」 / lemma「轻声笑；暗笑」
- ECDICT：form「n. 轻声地笑( chuckle的名词复数 ) v. 轻声地笑( chuckle的第三人称单数 )」 / lemma「n. 咯咯的笑声, 轻笑 vi. 咯咯的笑, 咕咕叫」
- **建议：`keep`**

## laughing → laugh
- rank：form 435 / lemma 1670 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「笑（laugh 的现在分词）」 / lemma「笑；笑声」
- ECDICT：form「a. 一笑置之的, 高兴的 n. 笑」 / lemma「n. 笑, 笑声 vi. 笑, 大笑 vt. 以笑表示」
- **建议：`keep`**

## words → word
- rank：form 436 / lemma 5988 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「词；话语（word 的复数）」 / lemma「措辞；用言语表达」
- ECDICT：form「n. 言语；话语；字（word的复数）」 / lemma「n. 话, 消息, 词, 诺言, 命令 vt. 用言辞表达 [计] 字」
- **建议：`keep`**

## known → know
- rank：form 445 / lemma 520 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「已知的；著名的」 / lemma「知道；认识」
- ECDICT：form「a. 已知的, 有名的 know的过去分词」 / lemma「v. 知道, 了解, 认识, 确信」
- **建议：`keep`**

## longer → long
- rank：form 454 / lemma 1460 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更长的」 / lemma「长的；长时间的」
- ECDICT：form「adv. 比较久」 / lemma「a. 长的, 长久的, 冗长的, 做多头的 vi. 渴望, 热望, 极想 adv. 长久, 始终 n. 长时间, 长信号…」
- **建议：`keep`**

## calling → call
- rank：form 455 / lemma 5943 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呼唤；使命；职业」 / lemma「叫；称呼；打电话」
- ECDICT：form「n. 职业, 行业, 呼唤, 召集 [计] 呼叫」 / lemma「n. 呼叫, 访问, 打电话, 号召, 召集, 要求 vt. 呼叫, 召集, 打电话 vi. 叫喊, 访问, 叫牌 [计…」
- **建议：`keep`**

## worked → work
- rank：form 456 / lemma 2600 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工作（过去式）」 / lemma「工作；起作用」
- ECDICT：form「work的过去式和过去分词」 / lemma「n. 工作, 劳动, 职业, 行为, 功, 作品, 成果, 产品, 工程 vi. 工作, 劳动, 做, 运转, 起作用,…」
- **建议：`keep`**

## looked → look
- rank：form 457 / lemma 1730 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看（过去式）」 / lemma「看；外观」
- ECDICT：form「v. 看, 瞧( look的过去式和过去分词 ); 注意; 面向; 寻找」 / lemma「n. 一看, 神色, 样子, 面容 vi. 看, 注意, 朝着, 显得 vt. 打量, 看上去与...一样, 以眼色(或…」
- **建议：`keep`**

## weeks → week
- rank：form 460 / lemma 1040 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「周（复数）」 / lemma「星期；一周」
- ECDICT：form「n. 威克斯（姓氏）」 / lemma「n. 星期, 周」
- **建议：`keep`**

## seeing → see
- rank：form 463 / lemma 1720 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看见（现在分词）」 / lemma「看见；理解」
- ECDICT：form「n. 视觉, 视力, 观看 conj. 鉴于」 / lemma「vt. 看见, 查看, 参观, 游览, 理解, 知道, 同意 vi. 看, 观看, 注意, 知道, 考虑 n. 主教的职…」
- **建议：`keep`**

## given → give
- rank：form 464 / lemma 1760 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给予（过去分词）」 / lemma「给；给予」
- ECDICT：form「a. 赠予的, 沉溺的, 约定的 give的过去分词」 / lemma「n. 弹性, 适应性 vt. 给, 授予, 供给, 产生, 发表, 付出, 献出, 让出 vi. 捐赠, 支持不住, 让…」
- **建议：`keep`**

## takes → take
- rank：form 468 / lemma 1770 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿；花费（第三人称单数）」 / lemma「拿；带走；花费」
- ECDICT：form「vt. 取走, 预备动作（take第三人称单数）」 / lemma「vt. 拿, 取, 抓, 带领, 获得, 就座, 接受, 吃, 吸引, 采取, 乘, 需要, 花费 vi. 吃掉对方棋子…」
- **建议：`keep`**

## gentlemen → gentleman
- rank：form 471 / lemma 1249 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「先生们；绅士」 / lemma「绅士；先生」
- ECDICT：form「pl. 出身高贵的人, 有教养的人, 绅士, 有身分的人, 阁下, 先生, (雅)男人 n. 男厕所」 / lemma「n. 绅士, 先生」
- **建议：`keep`**

## turned → turn
- rank：form 475 / lemma 5904 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「转动；变成（过去式）」 / lemma「转；转向；翻转」
- ECDICT：form「a. 变质的；被转动的；[金属加工]车削的」 / lemma「n. 转弯, 转动, 旋转, 翻转, 一圈, 顺次, 改动, 变化, 性格, 特色, 形状, 转折 vt. 使旋转, 转…」
- **建议：`keep`**

## feet → foot
- rank：form 480 / lemma 1220 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚（复数）」 / lemma「脚；英尺」
- ECDICT：form「pl. 脚 n. 尺」 / lemma「n. 脚, 步调, 英尺, 底部, 末尾, 步兵 vt. 走在...上, 给...换底, 支付 vi. 跳舞, 步行, …」
- **建议：`keep`**

## speaking → speak
- rank：form 482 / lemma 1700 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说话（现在分词）」 / lemma「说话；发言」
- ECDICT：form「n. 谈话, 演说 a. 讲话的, 适于说的, 讲某种语言的」 / lemma「vi. 说, 说话, 演说, 发言 vt. 说, 讲, 说出」
- **建议：`keep`**

## giving → give
- rank：form 486 / lemma 1760 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给予（现在分词）」 / lemma「给；给予」
- ECDICT：form「n. 礼物, 给予物 [法] 给予物, 礼物」 / lemma「n. 弹性, 适应性 vt. 给, 授予, 供给, 产生, 发表, 付出, 献出, 让出 vi. 捐赠, 支持不住, 让…」
- **建议：`keep`**

## moving → move
- rank：form 487 / lemma 8091 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「感人的；移动的」 / lemma「移动；搬家；感动」
- ECDICT：form「a. 动人的, 令人感动的, 鼓动的, 原动的, [无比较级]活动的, 转动的」 / lemma「n. 移动, 迁居, 步骤 vt. 移动, 开动, 感动, 搬(家) vi. 移动, 离开, 运行, 迁移, 摇动, 搬…」
- **建议：`keep`**

## amazing → amaze
- rank：form 491 / lemma 13208 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人惊奇的；极好的」 / lemma「使惊奇；使惊叹」
- ECDICT：form「a. 令人惊异的」 / lemma「vt. 使吃惊」
- **建议：`keep`**

## works → work
- rank：form 493 / lemma 2600 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工作；运转（第三人称单数）」 / lemma「工作；起作用」
- ECDICT：form「n. 工程, 工厂, 工事, 活动部件, 机件, 著作, 作品, 善行, 德行 [机] 工厂, 工场」 / lemma「n. 工作, 劳动, 职业, 行为, 功, 作品, 成果, 产品, 工程 vi. 工作, 劳动, 做, 运转, 起作用,…」
- **建议：`keep`**

## worried → worry
- rank：form 497 / lemma 5586 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「担心的；忧虑的」 / lemma「担心；烦恼」
- ECDICT：form「a. 担心的, 闷闷不乐的」 / lemma「n. 担心, 烦恼, 忧虑, 苦恼, 撕咬 vt. 使烦恼, 使焦虑, 使苦恼, 困扰, 折磨, 撕咬 vi. 烦恼, …」
- **建议：`keep`**

## wedding → wed
- rank：form 503 / lemma 8625 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「婚礼」 / lemma「结婚；娶；嫁」
- ECDICT：form「n. 婚礼, 结婚, 结婚周年纪念日, 结合 [法] 结婚, 婚礼, 结婚纪念日」 / lemma「vt. 与...结婚, 使结合 vi. 结婚」
- **建议：`keep`**

## kidding → kid
- rank：form 505 / lemma 7479 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开玩笑（现在分词）」 / lemma「小山羊」
- ECDICT：form「n. 开玩笑；山羊产羔」 / lemma「n. 小山羊, 小山羊肉, 小孩, 欺骗 a. 小山羊皮制的 v. 哄骗, 嘲弄」
- **建议：`keep`**

## kept → keep
- rank：form 510 / lemma 6069 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「保持（过去式）」 / lemma「保持；保留；保存」
- ECDICT：form「keep的过去式和过去分词」 / lemma「n. 生计, 维持, 保持 vt. 保持, 保存, 遵守, 看守, 整理, 维持, 履行, 经营, 拘留, 记帐 vi.…」
- **建议：`keep`**

## worse → bad
- rank：form 511 / lemma 280 ｜ type `r` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更坏的；更差的」 / lemma「坏的；严重的」
- ECDICT：form「n. 更坏的事, 更恶劣的事, 败局 a. 更坏的, 更恶劣的 adv. 更坏地, 更恶劣地」 / lemma「a. 坏的 n. 坏 adv. 坏地」
- **建议：`keep`**

## caught → catch
- rank：form 517 / lemma 5364 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「抓住（过去式）」 / lemma「抓住；接住」
- ECDICT：form「catch的过去式和过去分词」 / lemma「n. 捕捉, 陷阱, 捕捉之物, 抓, 拉手 vt. 捕捉, 赶上, 感染, 听清楚 vi. 抓住, 燃着」
- **建议：`keep`**

## meant → mean
- rank：form 519 / lemma 5496 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「意味着（过去式）」 / lemma「刻薄的；小气的」
- ECDICT：form「mean的过去式和过去分词」 / lemma「a. 低劣的, 卑贱的, 简陋的, 吝啬的, 惭愧的, 平均的, 中间的, 普通的 vt. 意谓, 想要, 意欲, 预定…」
- **建议：`keep`**

## watching → watch
- rank：form 520 / lemma 5001 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「观看（现在分词）」 / lemma「手表；监视」
- ECDICT：form「vt. 观看, 守望；监视, 注意（watch现在分词）」 / lemma「n. 观察, 手表, 看守, 守护, 监视, 值班人 vt. 看, 注视, 照顾, 看守, 守护, 监视 vi. 观看,…」
- **建议：`keep`**

## born → bear
- rank：form 528 / lemma 4245 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「出生的；天生的」 / lemma「熊」
- ECDICT：form「a. 天生的 bear的过去分词」 / lemma「n. 熊 vt. 忍受, 支承, 产生, 怀有, 通过卖空使跌价 vi. 忍受, 结果实, 压挤, 行进, 转向」
- **建议：`keep`**

## lying → lie
- rank：form 535 / lemma 5328 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「躺；说谎（lie 的现在分词）」 / lemma「躺；平卧」
- ECDICT：form「n. 说谎 a. 横躺的, 说谎的」 / lemma「n. 谎言, 假象, 位置 vi. 躺着, 说谎, 位于, 展现, 存在, 停泊 vt. 谎骗」
- **建议：`keep`**

## talked → talk
- rank：form 556 / lemma 5916 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「谈话（talk 的过去式）」 / lemma「谈话；讨论」
- ECDICT：form「n. 讲话, 交谈 talk的过去式 v. 说( talk的过去式和过去分词 ); 讨论; 说话; （用以强调款额、情况…」 / lemma「n. 谈话, 交谈, 会谈, 讲话, 演讲, 空谈, 谣言, 方言, 语言 vi. 讲话, 演讲, 说话, 谈话, 交流…」
- **建议：`keep`**

## paid → pay
- rank：form 560 / lemma 6015 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「支付（pay 的过去式）」 / lemma「支付；付款；给予」
- ECDICT：form「a. 受雇的, 付清的 pay的过去式和过去分词」 / lemma「n. 薪资, 付款, 补偿 vt. 支付, 付清, 补偿, 偿还, 对...有利, 为...涂防水物 vi. 付款, 付…」
- **建议：`keep`**

## bought → buy
- rank：form 566 / lemma 1780 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「买（buy 的过去式）」 / lemma「买；购买」
- ECDICT：form「a. 买来的 buy的过去式和过去分词」 / lemma「vt. 买, 获得 vi. 买 n. 购买, 买得的东西」
- **建议：`keep`**

## interesting → interest
- rank：form 572 / lemma 899 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有趣的」 / lemma「兴趣；利益」
- ECDICT：form「a. 有趣的」 / lemma「n. 兴趣, 嗜好, 利息, 利益, 爱好, 趣味, 势力 vt. 使感兴趣, 与...有关系」
- **建议：`keep`**

## sitting → sit
- rank：form 576 / lemma 2616 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「坐（sit 的现在分词）」 / lemma「坐；位于」
- ECDICT：form「n. 入席, 就坐, 开庭, 孵卵 a. 坐着的, 就座的, 在职的, 在孵卵中的, 易被击中的」 / lemma「vi. 坐, 就座, 坐落 vt. 使就座, 骑 n. 坐, 衣服合身」
- **建议：`keep`**

## forgot → forget
- rank：form 579 / lemma 5931 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「忘记（forget 的过去式）」 / lemma「忘记；遗忘」
- ECDICT：form「forget的过去式和过去分词」 / lemma「vt. 忘记, 忽略, 忘 vi. 忘记」
- **建议：`keep`**

## miles → mile
- rank：form 591 / lemma 2335 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「英里（mile 的复数）」 / lemma「英里」
- ECDICT：form「n. 英里（1英里约合1609米, mile的复数形式）」 / lemma「n. 英里, 很大距离 [机] 英里, 哩」
- **建议：`keep`**

## wearing → wear
- rank：form 598 / lemma 5145 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「穿；戴（wear 的现在分词）」 / lemma「穿；戴；穿着」
- ECDICT：form「a. 穿用的, 使疲惫的, 磨损的」 / lemma「n. 穿着, 戴, 使用, 耗损, 服装, 耐久性 vt. 穿着, 戴, 留(须、发等), 呈现, 磨损, 磨成, 耗损…」
- **建议：`keep`**

## crying → cry
- rank：form 599 / lemma 1680 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「哭；喊叫（cry 的现在分词）」 / lemma「哭；呼喊」
- ECDICT：form「a. 叫喊的, 嚎哭的, 迫切的, 臭名昭著的」 / lemma「n. 叫声, 哭声, 大叫 vi. 哭, 叫, 喊 vt. 叫喊, 大声说, 哭出」
- **建议：`keep`**

## fell → fall
- rank：form 602 / lemma 5754 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跌倒（fall的过去式）」 / lemma「落下；跌倒；下降」
- ECDICT：form「vt. 击倒 n. 一季所伐的木材, 折缝 a. 凶猛的, 可怕的 fall的过去式」 / lemma「n. 落下, 瀑布, 采伐量, 下降, 落差, 降低, 堕落, 秋天 vi. 倒下, 落下, 来临, 失守, 阵亡, 下…」
- **建议：`keep`**

## interested → interest
- rank：form 605 / lemma 899 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「感兴趣的」 / lemma「兴趣；利益」
- ECDICT：form「a. 感兴趣的 [法] 有利害关系的, 有股份的, 偏私的」 / lemma「n. 兴趣, 嗜好, 利息, 利益, 爱好, 趣味, 势力 vt. 使感兴趣, 与...有关系」
- **建议：`keep`**

## screaming → scream
- rank：form 621 / lemma 1663 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫（scream的现在分词）」 / lemma「尖叫；呼喊」
- ECDICT：form「a. 发出尖叫声的, 极滑稽的, 惊人的」 / lemma「n. 尖叫声 vi. 尖叫, 大笑, 尖啸, 令人震惊 vt. 尖叫着说, 大叫大嚷着要求」
- **建议：`keep`**

## fighting → fight
- rank：form 625 / lemma 6318 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「战斗；打架（fight的现在分词）」 / lemma「打架；战斗」
- ECDICT：form「a. 战斗的, 容易引起争斗的, 适于格斗的, 好斗的, 好战的, 斗争的, 搏斗的 n. 战斗, 斗争, 搏斗」 / lemma「n. 打架, 争吵, 斗志 v. 对抗, 打架」
- **建议：`keep`**

## standing → stand
- rank：form 633 / lemma 2624 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「站立（stand的现在分词）」 / lemma「站立；立场」
- ECDICT：form「n. 起立, 持续, 身分 a. 立着的, 不动的, 经常的, 持续的」 / lemma「n. 站立, 站住, 停顿, 讲台, 看台, 立场, 法院证人席 vi. 站, 立, 坐落, 停滞, 位于, 坚持, 维…」
- **建议：`keep`**

## feels → feel
- rank：form 638 / lemma 5343 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感觉（feel的第三人称单数）」 / lemma「感觉；触摸」
- ECDICT：form「v. 觉得；体会；触摸（feel的第三人称单数）」 / lemma「vt. 感觉, 觉得, 触摸, 以为 vi. 有知觉, 摸索, 同情 n. 感觉, 觉得, 触摸」
- **建议：`keep`**

## feels → felt
- rank：form 638 / lemma 5199 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感觉（feel的第三人称单数）」 / lemma「毛毡；毡制品」
- ECDICT：form「v. 觉得；体会；触摸（feel的第三人称单数）」 / lemma「n. 毛毯, 毡 vt. 制毡, 使粘结 vi. 粘结 feel的过去式和过去分词」
- **建议：`keep`**

## drunk → drink
- rank：form 641 / lemma 4812 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「醉的；喝醉的」 / lemma「喝；饮酒；饮料」
- ECDICT：form「a. 喝醉了的 drink的过去式」 / lemma「n. 饮料, 酒 v. 喝, 喝酒」
- **建议：`keep`**

## calls → call
- rank：form 653 / lemma 5943 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「呼叫；打电话（call的第三人称单数）」 / lemma「叫；称呼；打电话」
- ECDICT：form「n. 调用；呼吁；电话（call的复数）」 / lemma「n. 呼叫, 访问, 打电话, 号召, 召集, 要求 vt. 呼叫, 召集, 打电话 vi. 叫喊, 访问, 叫牌 [计…」
- **建议：`keep`**

## spent → spend
- rank：form 654 / lemma 6012 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「花费（spend的过去式）」 / lemma「花费；度过；消耗」
- ECDICT：form「a. 用尽的, 精疲力竭的 spend的过去式和过去分词」 / lemma「vt. 花费, 浪费, 度过, 消耗, 消磨 vi. 花费, 用尽」
- **建议：`keep`**

## moved → move
- rank：form 662 / lemma 8091 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「移动；感动（move的过去式）」 / lemma「移动；搬家；感动」
- ECDICT：form「v. 移动, 移动到；感动（move的过去式, 过去分词）」 / lemma「n. 移动, 迁居, 步骤 vt. 移动, 开动, 感动, 搬(家) vi. 移动, 离开, 运行, 迁移, 摇动, 搬…」
- **建议：`keep`**

## involved → involve
- rank：form 676 / lemma 4616 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「涉及的；卷入的」 / lemma「涉及；使参与」
- ECDICT：form「a. 难懂的, 复杂的, 不易懂的, 卷入...之中的, 累及..., 与...有关, 被纠缠的 [计] 包含, 涉及」 / lemma「vt. 包括, 使陷于, 潜心于, 包围 [医] 累及, 牵涉, 包含」
- **建议：`keep`**

## lived → live
- rank：form 678 / lemma 1820 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「居住；生活（live的过去式）」 / lemma「生活；居住；现场直播的」
- ECDICT：form「a. 有生命的」 / lemma「a. 活的, 生动的, 精力充沛的, 实况转播的 vi. 活, 生存, 居住 vt. 过着, 度过, 经历 adv. 实…」
- **建议：`keep`**

## cops → cop
- rank：form 684 / lemma 695 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「警察（复数）」 / lemma「警察」
- ECDICT：form「[建] 堆, 顶, 绕丝轴」 / lemma「n. 警官 vt. 抓住」
- **建议：`keep`**

## driving → drive
- rank：form 703 / lemma 5742 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「驾驶（现在分词）」 / lemma「驾驶；开车；驱动」
- ECDICT：form「n. 赶, 操纵, 驾驶 a. 推进的, 强劲的, 精力旺盛的」 / lemma「n. 驾车, 快车道, 推进力, 驱动, 动力, 击球, 驱动器 vt. 开车, 驱使, 推动, 驾驶 vi. 开车, …」
- **建议：`keep`**

## wrote → write
- rank：form 705 / lemma 2656 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「写（过去式）」 / lemma「写；写作」
- ECDICT：form「write的过去式」 / lemma「vt. 书写, 著述, 写, 写满, 写信给 vi. 写, 写字, 写信, 写作, 作曲 [计] 书写器」
- **建议：`keep`**

## dying → die
- rank：form 715 / lemma 1830 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「死亡（现在分词）」 / lemma「死亡；消失」
- ECDICT：form「a. 垂死的 [法] 快要死的, 垂死的, 临终的」 / lemma「vi. 死亡, 消逝, 平息, 熄灭, 漠然, 渴望 vt. 死 n. 骰子, 冲模」
- **建议：`keep`**

## singing → sing
- rank：form 722 / lemma 2664 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「唱歌（现在分词）」 / lemma「唱歌」
- ECDICT：form「n. 歌唱, 歌声 [计] 振鸣; 蜂鸣」 / lemma「vi. 唱, 唱歌, 演唱, 鸣, 啼 vt. 唱, 歌颂 n. 嗖嗖声」
- **建议：`keep`**

## putting → put
- rank：form 729 / lemma 126 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置（现在分词）」 / lemma「放；放置」
- ECDICT：form「n. 投掷；（高尔夫球）打球入洞」 / lemma「vt. 放, 摆, 安置, 移动, 发射, 投掷, 写上, 表达, 使从事, 使受到, 驱使, 赋予 vi. 出发, 航…」
- **建议：`keep`**

## putting → putt
- rank：form 729 / lemma 20832 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置（现在分词）」 / lemma「轻击（高尔夫球）」
- ECDICT：form「n. 投掷；（高尔夫球）打球入洞」 / lemma「vt. 击球入洞 vi. 轻击高尔夫球 n. 轻轻一击(入洞)」
- **建议：`fix-target:put`**

## stuck → stick
- rank：form 730 / lemma 6264 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「卡住的；被困的」 / lemma「棍；棒」
- ECDICT：form「stick的过去式和过去分词」 / lemma「n. 棍, 棒, 刺, 枯枝, 茎, 条状物 vt. 插进, 刺入, 钉住, 伸出, 粘贴, 停止 vi. 粘住, 停留…」
- **建议：`keep`**

## rules → rule
- rank：form 732 / lemma 1016 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「规则（复数）」 / lemma「规则；统治」
- ECDICT：form「n. 规则；条例（rule的复数形式）」 / lemma「n. 规则, 统治, 控制, 支配, 规律, 标准, 章程, 破折号, 铅线 vt. 规定, 统治, 管理, 控制, 支…」
- **建议：`keep`**

## grunts → grunt
- rank：form 733 / lemma 7509 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咕哝声（复数）」 / lemma「咕哝；发出哼哼声」
- ECDICT：form「v. （猪等）作呼噜声( grunt的第三人称单数 ); （指人）发出类似的哼声; 咕哝着说; 石鲈」 / lemma「vi. 作呼噜声 vt. 咕哝 n. 呼噜声, 咕哝」
- **建议：`keep`**

## gives → give
- rank：form 740 / lemma 1760 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给（第三人称单数）」 / lemma「给；给予」
- ECDICT：form「n. 付出；弯曲；内幕消息（give的复数）」 / lemma「n. 弹性, 适应性 vt. 给, 授予, 供给, 产生, 发表, 付出, 献出, 让出 vi. 捐赠, 支持不住, 让…」
- **建议：`keep`**

## cheers → cheer
- rank：form 742 / lemma 8400 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「干杯；欢呼」 / lemma「欢呼；加油；使高兴」
- ECDICT：form「interj. 干杯, 再见」 / lemma「n. 愉快, 振奋, 欢呼 vi. 欢呼, 喝彩, 快活起来 vt. 使振奋, 欢呼」
- **建议：`keep`**

## holding → hold
- rank：form 754 / lemma 5349 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿着（现在分词）」 / lemma「拿；握住」
- ECDICT：form「n. 把持, 支持, 保持 [法] 租借地, 占有物, 拥有的财产」 / lemma「n. 把握, 把持力, 柄, 控制, 掌握, 监禁 vt. 保存, 握住, 拿住, 占据, 持有, 拥有 vi. 支持,…」
- **建议：`keep`**

## worst → bad
- rank：form 763 / lemma 280 ｜ type `t` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「最坏的；最差的」 / lemma「坏的；严重的」
- ECDICT：form「n. 最坏, 最坏的时候 a. 最坏的, 最恶劣的, 最不利的 adv. 最坏, 最糟」 / lemma「a. 坏的 n. 坏 adv. 坏地」
- **建议：`keep`**

## listening → listen
- rank：form 771 / lemma 5952 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「听；倾听（listen 现在分词）」 / lemma「听；倾听；听从」
- ECDICT：form「n. 听, 监听 a. 助听用的」 / lemma「vi. 听, 倾听, 听从 n. 听, 倾听」
- **建议：`keep`**

## arms → arm
- rank：form 774 / lemma 1240 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手臂；武器（复数）」 / lemma「手臂；武装」
- ECDICT：form「n. 武器, 军事行动 [机] 武器, 军械, 枪械」 / lemma「n. 手臂, 袖子, 狭长港湾, 武器 vt. 武装, 装备 vi. 武装起来 [计] 异步应答方式; 自动货品销路管理」
- **建议：`keep`**

## turns → turn
- rank：form 775 / lemma 5904 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「转动；转弯；轮流（turn 单三）」 / lemma「转；转向；翻转」
- ECDICT：form「n. 转弯；匝数；圈数（turn的复数形式）；手动车床」 / lemma「n. 转弯, 转动, 旋转, 翻转, 一圈, 顺次, 改动, 变化, 性格, 特色, 形状, 转折 vt. 使旋转, 转…」
- **建议：`keep`**

## gasps → gasp
- rank：form 779 / lemma 4567 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喘气；倒抽气（gasp 单三）」 / lemma「喘气；倒抽气」
- ECDICT：form「v. 喘气( gasp的第三人称单数 ); 喘息; 倒抽气; 很想要」 / lemma「n. 喘气 vi. 喘气, 喘息, 渴望 vt. 气喘吁吁地说」
- **建议：`keep`**

## drinking → drink
- rank：form 787 / lemma 4812 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喝；饮酒（drink 现在分词）」 / lemma「喝；饮酒；饮料」
- ECDICT：form「n. 喝, 喝酒」 / lemma「n. 饮料, 酒 v. 喝, 喝酒」
- **建议：`keep`**

## drugs → drug
- rank：form 793 / lemma 968 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「药物；毒品（复数）」 / lemma「药物；毒品」
- ECDICT：form「n. 毒品, 药物」 / lemma「n. 药, 麻药, 麻醉药 vi. 吸毒 vt. 使服麻醉药, 使麻木」
- **建议：`keep`**

## rings → ring
- rank：form 795 / lemma 5109 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「戒指；铃声；环（复数）」 / lemma「戒指；环状物」
- ECDICT：form「n. 吊环（ring的复数）」 / lemma「n. 环, 环形物, 拳击场, 戒指, 角逐, 小集团, 铃声, 钟声, 声调 vt. 包围, 套住, 按铃, 敲钟 v…」
- **建议：`keep`**

## named → name
- rank：form 796 / lemma 6198 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「命名；取名（name 过去式）」 / lemma「名字；名称」
- ECDICT：form「a. 被指名的, 指定的 [计] 命名的, 指定的, 有名的」 / lemma「n. 名字, 名称, 姓名, 名义, 名誉, 文件名 vt. 命名, 称呼, 任命, 提名, 列举 a. 姓名的, 据以…」
- **建议：`keep`**

## further → far
- rank：form 801 / lemma 1490 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更远；进一步；促进」 / lemma「远的（地）」
- ECDICT：form「a. 更远的, 此外的, 更多的 vt. 促进, 增进, 助长 adv. 更进一步地, 更远地, 此外」 / lemma「a. 远的, 久远的, 遥远的 adv. 甚远地, 很, 到很深的程度, 到很远的距离」
- **建议：`keep`**

## allowed → allow
- rank：form 804 / lemma 828 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「允许；准许（allow 过去式）」 / lemma「允许；准许；给予」
- ECDICT：form「a. 允许, 容许的」 / lemma「vt. 允许, 同意给予, 承认 vi. 容许, 猜想 [计] 允许命令」
- **建议：`keep`**

## learned → learn
- rank：form 806 / lemma 5937 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「学习；得知（learn 过去式）」 / lemma「学习；得知；学会」
- ECDICT：form「a. 有学问的, 学术上的 learn的过去式和过去分词」 / lemma「vt. 学习；认识到；得知」
- **建议：`keep`**

## arrived → arrive
- rank：form 807 / lemma 8112 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「到达；抵达（arrive 过去式）」 / lemma「到达；抵达；到来」
- ECDICT：form「v. 抵达；抵港（arrive的过去式） a. 已到达的」 / lemma「vi. 到达, 抵达」
- **建议：`keep`**

## pictures → picture
- rank：form 810 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「图片；照片；电影（复数）」 / lemma「图画，照片」
- ECDICT：form「n. 电影院」 / lemma「n. 图画, 照片, 景色, 美丽如画的人(或物), 化身, 生动的描述, 想像, 形象思维 vt. 画, 拍摄, 用图…」
- **建议：`keep`**

## played → play
- rank：form 814 / lemma 2608 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「玩；演奏（play 过去式）」 / lemma「玩；演奏；戏剧」
- ECDICT：form「v. 玩耍；演奏；播放；参加竞赛（play的过去分词）」 / lemma「n. 游戏, 游玩, 玩笑, 运动, 比赛, 赌博, 跳动, 表演, 剧本 v. 玩, 游戏, 假装, 开玩笑, 比赛,…」
- **建议：`keep`**

## feelings → feeling
- rank：form 822 / lemma 385 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感情；感觉（复数）」 / lemma「感觉；情感」
- ECDICT：form「n. 感情, 情绪, 心情, 情感」 / lemma「n. 摸, 触觉, 知觉, 感觉, 情绪, 同情 a. 有同情心的, 有感觉的, 仁慈的, 动人的」
- **建议：`keep`**

## dollars → dollar
- rank：form 827 / lemma 2112 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「美元（复数）」 / lemma「美元；元」
- ECDICT：form「n. 美元（dollar的复数）」 / lemma「n. 美元, 元(加、澳等国货币单位) [经] 纯经济的, 美元, 元」
- **建议：`keep`**

## earlier → early
- rank：form 832 / lemma 1500 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更早；先前」 / lemma「早的（地）」
- ECDICT：form「a. 早的；初期的」 / lemma「a. 早的, 早熟的 adv. 很早, 初」
- **建议：`keep`**

## legs → leg
- rank：form 837 / lemma 1230 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「腿（复数）」 / lemma「腿；支柱」
- ECDICT：form「n. 木头支架；腿（leg的复数）」 / lemma「n. 腿, 假腿, 路程 vi. 走, 跑」
- **建议：`keep`**

## according → accord
- rank：form 841 / lemma 11415 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「根据；按照」 / lemma「一致；协议」
- ECDICT：form「a. 相符的, 根据...而定的 adv. 相应地」 / lemma「n. 一致, 调和, 协定 vt. 给与, 使一致 vi. 相符合」
- **建议：`keep`**

## grunting → grunt
- rank：form 844 / lemma 7509 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出咕噜声」 / lemma「咕哝；发出哼哼声」
- ECDICT：form「a. 呼噜的, 咕哝的 [医] 嗯嗯声」 / lemma「vi. 作呼噜声 vt. 咕哝 n. 呼噜声, 咕哝」
- **建议：`keep`**

## names → name
- rank：form 846 / lemma 6198 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「名字（复数）」 / lemma「名字；名称」
- ECDICT：form「n. 名字；名望（name的复数形式）」 / lemma「n. 名字, 名称, 姓名, 名义, 名誉, 文件名 vt. 命名, 称呼, 任命, 提名, 列举 a. 姓名的, 据以…」
- **建议：`keep`**

## keeping → keep
- rank：form 857 / lemma 6069 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「保持；保存」 / lemma「保持；保留；保存」
- ECDICT：form「n. 保管, 供养, 一致 [法] 保管, 保护, 管理」 / lemma「n. 生计, 维持, 保持 vt. 保持, 保存, 遵守, 看守, 整理, 维持, 履行, 经营, 拘留, 记帐 vi.…」
- **建议：`keep`**

## locked → lock
- rank：form 864 / lemma 4899 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锁上（过去式）」 / lemma「锁；一绺头发」
- ECDICT：form「a. 上锁的；不灵活的；下定决心的」 / lemma「n. 锁, 刹车, 水闸, 一缕头发 vt. 锁, 锁上, 拘禁, 隐藏, (用锁等)拴住, 刹住 vi. 锁住, (齿…」
- **建议：`keep`**

## writing → write
- rank：form 866 / lemma 2656 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「写作；文字」 / lemma「写；写作」
- ECDICT：form「n. 书写, 著作, 笔迹, 作品 [医] 书写」 / lemma「vt. 书写, 著述, 写, 写满, 写信给 vi. 写, 写字, 写信, 写作, 作曲 [计] 书写器」
- **建议：`keep`**

## sold → sell
- rank：form 872 / lemma 1790 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「卖（过去式）」 / lemma「卖；销售」
- ECDICT：form「sell的过去式和过去分词」 / lemma「vt. 卖, 背叛, 销售, 出卖 vi. 卖, 销售 n. 卖, 推销术, 失望」
- **建议：`keep`**

## figured → figure
- rank：form 875 / lemma 12000 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「认为；计算（过去式）」 / lemma「形状，图形；数字；人物」
- ECDICT：form「a. 有形状的, 有图案的, 用图表表现的, 用图画表现的」 / lemma「n. 数字, 价格, 图形, 形状 vt. 描绘, 表示, 演算, 认为 vi. 计算, 出现, 估计」
- **建议：`keep`**

## ringing → ring
- rank：form 877 / lemma 5109 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「响铃；回响」 / lemma「戒指；环状物」
- ECDICT：form「a. 响亮的, 明白的, 清脆的, 干脆的 [电] 振铃」 / lemma「n. 环, 环形物, 拳击场, 戒指, 角逐, 小集团, 铃声, 钟声, 声调 vt. 包围, 套住, 按铃, 敲钟 v…」
- **建议：`keep`**

## hiding → hide
- rank：form 879 / lemma 5196 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「躲藏；隐藏」 / lemma「兽皮；皮革」
- ECDICT：form「n. 隐匿, 隐藏之事, 隐匿之所, 痛打 [法] 躲藏, 躲藏处」 / lemma「n. 兽皮, 迹象, 躲藏处 vt. 藏, 隐瞒, 遮避, 剥...的皮, 隐藏 vi. 躲藏 [计] 隐藏」
- **建议：`keep`**

## written → write
- rank：form 883 / lemma 2656 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「写（过去分词）」 / lemma「写；写作」
- ECDICT：form「a. 书面的, 写成文字的 write的过去分词」 / lemma「vt. 书写, 著述, 写, 写满, 写信给 vi. 写, 写字, 写信, 写作, 作曲 [计] 书写器」
- **建议：`keep`**

## reading → read
- rank：form 889 / lemma 2648 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「阅读；读物」 / lemma「阅读；读懂」
- ECDICT：form「n. 阅读, 知识, 读物 a. 阅读的」 / lemma「v. 读, 阅读, 理解 a. 有学问的 n. 读取, 阅读 [计] 读取」
- **建议：`keep`**

## following → follow
- rank：form 901 / lemma 5913 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「接下来的；下列的」 / lemma「跟随；沿着；遵循」
- ECDICT：form「n. 下列各项, 部下, 追随者 a. 下列的, 其次的」 / lemma「vt. 跟随, 沿行, 遵循, 追求 vi. 跟随, 接着 n. 跟随, 追随」
- **建议：`keep`**

## built → build
- rank：form 902 / lemma 6240 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「建造（过去式）」 / lemma「建造；建立」
- ECDICT：form「build的过去式和过去分词」 / lemma「v. 建立, 建筑 n. 构造, 体格」
- **建议：`keep`**

## closer → close
- rank：form 903 / lemma 2704 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「更近的」 / lemma「近的；关闭」
- ECDICT：form「n. 关闭者, 闭合器, 关闭器」 / lemma「n. 结束, 完结 a. 靠近的, 亲近的, 亲密的, 严密的, 关闭的, 狭窄的, 秘密的 vt. 关, 结束, 使靠…」
- **建议：`keep`**

## groans → groan
- rank：form 906 / lemma 7965 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呻吟；抱怨」 / lemma「呻吟；抱怨」
- ECDICT：form「n. 呻吟, 叹息( groan的名词复数 ); 呻吟般的声音 v. 呻吟( groan的第三人称单数 ); 发牢骚; …」 / lemma「n. 呻吟, 叹息 vi. 呻吟, 抱怨, 受压迫 vt. 呻吟地说」
- **建议：`keep`**

## excited → excite
- rank：form 908 / lemma 13752 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「兴奋的；激动的」 / lemma「使兴奋；激起」
- ECDICT：form「a. 兴奋的, 已励磁的, 已激发的, 激昂的, 激动的」 / lemma「vt. 刺激, 使兴奋, 激励」
- **建议：`keep`**

## losing → lose
- rank：form 910 / lemma 1750 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「失去；输掉」 / lemma「失去；输掉」
- ECDICT：form「a. 损失的, 输的 n. 失败, 损失」 / lemma「vt. 遗失, 损失, 丢失, 使失去, 错过, 浪费, 迷失, 使迷路, 输去, 使沉溺于 vi. 受损失, 失败」
- **建议：`keep`**

## animals → animal
- rank：form 911 / lemma 925 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「动物（复数）」 / lemma「动物」
- ECDICT：form「n. 动物, 动物世界；牲畜（animal的复数形式）」 / lemma「n. 动物 [医] 动物」
- **建议：`keep`**

## shooting → shoot
- rank：form 928 / lemma 4626 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「射击；拍摄」 / lemma「嫩芽；新枝」
- ECDICT：form「n. 发射, 猎场, 射击」 / lemma「n. 射击, 狩猎, 芽, 射伤, 发射, 发芽, 急流, 推力, 摄影, 急送, 滑运道, 浪费 vt. 射击, 射中…」
- **建议：`keep`**

## keeps → keep
- rank：form 929 / lemma 6069 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「保持；保存（三单）」 / lemma「保持；保留；保存」
- ECDICT：form「n. 罐笼座；盖子（keep的复数形式）」 / lemma「n. 生计, 维持, 保持 vt. 保持, 保存, 遵守, 看守, 整理, 维持, 履行, 经营, 拘留, 记帐 vi.…」
- **建议：`keep`**

## flowers → flower
- rank：form 935 / lemma 1701 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「花（复数）」 / lemma「花；花朵」
- ECDICT：form「[医] 花; 升华制成的药物; 月经」 / lemma「n. 花, 开花植物, 精华, 盛时 vi. 开花, 发育, 旺盛, 成熟 vt. 用花装饰, 使开花」
- **建议：`keep`**

## keys → key
- rank：form 939 / lemma 4902 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「钥匙（复数）」 / lemma「钥匙；关键」
- ECDICT：form「n. 关键帧；（钢琴等的）键；密钥（key的复数）」 / lemma「n. 钥匙, 键, 解答, 关键, 要害, 基调, 线索, 答案, 暗礁 vt. 调音, 锁上, 提供线索 vi. 使用…」
- **建议：`keep`**

## wondering → wonder
- rank：form 948 / lemma 5928 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「想知道（现在分词）」 / lemma「想知道；纳闷」
- ECDICT：form「a. 觉得奇怪的, 疑惑的」 / lemma「n. 奇迹, 惊奇, 惊愕 vt. 惊奇, 想知道 vi. 惊讶, 怀疑」
- **建议：`keep`**

## lay → lie
- rank：form 949 / lemma 5328 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置；躺（过去式）」 / lemma「躺；平卧」
- ECDICT：form「vt. 放置, 产, 铺设, 布置, 提出, 平息 vi. 下蛋, 打赌 n. 位置, 层, 隐藏处 a. 世俗的, 外…」 / lemma「n. 谎言, 假象, 位置 vi. 躺着, 说谎, 位于, 展现, 存在, 停泊 vt. 谎骗」
- **建议：`keep`**

## cheering → cheer
- rank：form 959 / lemma 8400 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「欢呼（现在分词）」 / lemma「欢呼；加油；使高兴」
- ECDICT：form「n. 欢呼, 喝彩 a. 令人振奋的, 令人高兴的」 / lemma「n. 愉快, 振奋, 欢呼 vi. 欢呼, 喝彩, 快活起来 vt. 使振奋, 欢呼」
- **建议：`keep`**

## papers → paper
- rank：form 966 / lemma 6186 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「文件；报纸（复数）」 / lemma「纸；论文」
- ECDICT：form「n. 文件, 官方文件 [法] 票证, 证券, 纸币」 / lemma「n. 纸, 文件, 文章, 报纸, 证券, 证件 vt. 用纸糊, 贴壁纸于, 用纸包装 vi. 贴壁纸 a. 纸做的,…」
- **建议：`keep`**

## lights → light
- rank：form 974 / lemma 1400 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灯（复数）」 / lemma「光；轻的；浅色的」
- ECDICT：form「n. （供食用的）家畜的肺脏；灯光（light的复数）」 / lemma「n. 光, 光亮, 灯, 日光, 发光体, 光源, 杰出人物, 火花, 眼光 a. 轻的, 少量的, 轻微的, 轻快的,…」
- **建议：`keep`**

## flying → fly
- rank：form 975 / lemma 5739 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「飞（现在分词）」 / lemma「飞；飞行；乘飞机」
- ECDICT：form「a. 飞的, 飘扬的, 飞速的 n. 飞行, 飞花」 / lemma「n. 苍蝇, 两翼昆虫, 飞行 vi. 飞, 飞翔, 飘扬, 逃走 vt. 飞, 飞越, 使飘扬, 逃出 a. 敏捷的」
- **建议：`keep`**

## folks → folk
- rank：form 990 / lemma 3760 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「人们；家人」 / lemma「人们；民谣」
- ECDICT：form「n. 人们, 父母, 亲人, 家属」 / lemma「n. 人们, 家人, 亲属, 民族 a. 民间的」
- **建议：`keep`**

## leaves → leaf
- rank：form 997 / lemma 4485 ｜ type `s` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叶子（复数）」 / lemma「叶子；一张（纸）」
- ECDICT：form「pl. 树叶, 花瓣」 / lemma「n. 叶, 树叶, 花瓣, 页 vi. 生叶, 翻书页 vt. 在...上长叶, 翻...的页」
- **建议：`keep`**

## leaves → leave
- rank：form 997 / lemma 8109 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叶子（复数）」 / lemma「离开；留下；出发」
- ECDICT：form「pl. 树叶, 花瓣」 / lemma「n. 许可, 告别, 请假, 休假 vt. 离开, 剩下, 遗忘, 委托, 丢弃 vi. 出发, 离开, 生叶」
- **建议：`keep`**

## shouting → shout
- rank：form 999 / lemma 5946 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喊叫（现在分词）」 / lemma「喊叫；大声说」
- ECDICT：form「n. 呼喊, 喊话」 / lemma「n. 呼喊, 喊声 vi. 呼喊, 喊叫, 嚷 vt. 高喊」
- **建议：`keep`**

## tells → tell
- rank：form 1005 / lemma 1870 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「告诉；讲述（第三人称单数）」 / lemma「告诉；辨别」
- ECDICT：form「v. 告诉；说（tell的第三人称单数）」 / lemma「vt. 告诉, 说, 吩咐, 断定, 知道 vi. 讲述, 泄密, 告发, 表明」
- **建议：`keep`**

## lies → lie
- rank：form 1006 / lemma 5328 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「躺；位于；说谎（第三人称单数）」 / lemma「躺；平卧」
- ECDICT：form「v. 躺卧（lie的第三人称单数形式）」 / lemma「n. 谎言, 假象, 位置 vi. 躺着, 说谎, 位于, 展现, 存在, 停泊 vt. 谎骗」
- **建议：`keep`**

## pulled → pull
- rank：form 1008 / lemma 2720 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拉；拖（过去式）」 / lemma「拉；牵引」
- ECDICT：form「a. 牵引的；扯下来的」 / lemma「vt. 拉, 拖, 拔, 牵, 撕开, 吸引 vi. 拉, 拖, 拔, 有吸引力 n. 拉, 拖, 拔, 拉力, 牵引力…」
- **建议：`keep`**

## held → hold
- rank：form 1012 / lemma 5349 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「握住；举行（过去式）」 / lemma「拿；握住」
- ECDICT：form「hold的过去式和过去分词」 / lemma「n. 把握, 把持力, 柄, 控制, 掌握, 监禁 vt. 保存, 握住, 拿住, 占据, 持有, 拥有 vi. 支持,…」
- **建议：`keep`**

## hearing → hear
- rank：form 1025 / lemma 1710 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「听力；听证会」 / lemma「听见；听说」
- ECDICT：form「n. 听, 听觉, 听讯 [医] 听, 听觉」 / lemma「vt. 听到, 倾听, 听说, 审理 vi. 听见, 听」
- **建议：`keep`**

## spoke → speak
- rank：form 1028 / lemma 1700 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说话（过去式）」 / lemma「说话；发言」
- ECDICT：form「n. 轮辐 vt. 装轮辐, 用刹车刹住 speak的过去式」 / lemma「vi. 说, 说话, 演说, 发言 vt. 说, 讲, 说出」
- **建议：`keep`**

## understood → understand
- rank：form 1029 / lemma 5922 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「理解（过去式）」 / lemma「理解；明白；懂」
- ECDICT：form「understand的过去式和过去分词」 / lemma「vt. 理解, 了解, 领会, 听说, 懂 vi. 懂得, 认为」
- **建议：`keep`**

## taught → teach
- rank：form 1042 / lemma 5940 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「教（过去式）」 / lemma「教；教授；教导」
- ECDICT：form「teach的过去式和过去分词」 / lemma「vt. 教, 讲授, 教导, 教育 vi. 教书, 教学, 可以教」
- **建议：`keep`**

## plays → play
- rank：form 1045 / lemma 2608 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「玩；演奏（第三人称单数）」 / lemma「玩；演奏；戏剧」
- ECDICT：form「n. 戏剧集；戏剧（play的复数）」 / lemma「n. 游戏, 游玩, 玩笑, 运动, 比赛, 赌博, 跳动, 表演, 剧本 v. 玩, 游戏, 假装, 开玩笑, 比赛,…」
- **建议：`keep`**

## dancing → dance
- rank：form 1047 / lemma 2672 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「跳舞（现在分词）」 / lemma「舞蹈；跳舞」
- ECDICT：form「n. 舞蹈 [建] 跳动的」 / lemma「n. 跳舞, 舞蹈, 舞会 v. 跳舞」
- **建议：`keep`**

## bringing → bring
- rank：form 1056 / lemma 6237 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「带来（现在分词）」 / lemma「带来；拿来」
- ECDICT：form「v. 带来( bring的现在分词 ); 促使; 提供; 使朝（某方向或按某方式）移动」 / lemma「vt. 带来, 产生, 促使, 提出 vi. 生产」
- **建议：`keep`**

## dropped → drop
- rank：form 1057 / lemma 5880 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「掉落；下降（过去式）」 / lemma「落下；掉下；下降」
- ECDICT：form「a. 抛踢球得分的」 / lemma「n. 滴, 微量, 落下, 空投 vi. 放下, 掉下, 下降 vt. 使滴下, 放下, 丢失, 遗漏 [计] 投入, …」
- **建议：`keep`**

## lied → lie
- rank：form 1058 / lemma 5328 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说谎（过去式）」 / lemma「躺；平卧」
- ECDICT：form「n. (德国)歌曲」 / lemma「n. 谎言, 假象, 位置 vi. 躺着, 说谎, 位于, 展现, 存在, 停泊 vt. 谎骗」
- **建议：`keep`**

## games → game
- rank：form 1066 / lemma 6246 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「游戏；比赛（复数）」 / lemma「游戏；比赛」
- ECDICT：form「n. (英)体操课, 体育课, [谓语用单数或复数]运动会, 比赛会, 竞技会」 / lemma「n. 比赛, 玩耍, 比分, 得胜, 比赛规则, 策略, 游戏, 野味 vi. 赌博 a. 勇敢的, 有胆量的, 关于野…」
- **建议：`keep`**

## dressed → dress
- rank：form 1068 / lemma 5148 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「穿着衣服的」 / lemma「穿衣；打扮」
- ECDICT：form「a. 穿好衣服的；打扮好的；去内脏及分割加工好的（特指动物, 如鱼, 禽类等）」 / lemma「n. 服装, 覆盖物 vi. 穿着 vt. 给...穿衣, 整理」
- **建议：`keep`**

## screams → scream
- rank：form 1076 / lemma 1663 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫（第三人称单数）」 / lemma「尖叫；呼喊」
- ECDICT：form「v. （因伤痛、害怕、激动等）尖叫 ~发出尖叫声( scream的第三人称单数 ); （向某人或为某事）高声喊; 发出大…」 / lemma「n. 尖叫声 vi. 尖叫, 大笑, 尖啸, 令人震惊 vt. 尖叫着说, 大叫大嚷着要求」
- **建议：`keep`**

## older → old
- rank：form 1081 / lemma 1320 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「较年长的；更旧的」 / lemma「老的；旧的」
- ECDICT：form「a. 年长的；较旧的」 / lemma「n. 以前, 往昔 a. 老的, 旧的, 古老的, 年长的, 老练的」
- **建议：`keep`**

## soldiers → soldier
- rank：form 1083 / lemma 1163 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「士兵（复数）」 / lemma「士兵；军人」
- ECDICT：form「n. 士兵；战士数量（soldier的复数）」 / lemma「n. 军人, 士兵, 兵蚁 vi. 从军, 尽职, 偷懒, 磨洋工」
- **建议：`keep`**

## training → train
- rank：form 1087 / lemma 970 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「训练；培训」 / lemma「火车；训练」
- ECDICT：form「n. 训练, 培养 [医] 训练」 / lemma「n. 火车, 列车, 行列, 长队, 一连串的后果, 顺序 vt. 训练, 教育, 对准 vi. 受训练, 锻炼」
- **建议：`?`**

## united → unite
- rank：form 1091 / lemma 6008 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「联合的；团结的」 / lemma「联合；团结」
- ECDICT：form「a. 联合的, 团结的, 一致的, 和睦的 [法] 联合的, 统一的, 一致的」 / lemma「vi. 联合, 接合, 混合 vt. 使联合, 统一, 使粘合, 使结合」
- **建议：`keep`**

## paying → pay
- rank：form 1094 / lemma 6015 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「支付；付款（现在分词）」 / lemma「支付；付款；给予」
- ECDICT：form「a. 支付的, 付款的, 有利的, 赢利的, 合算的 [经] 支付」 / lemma「n. 薪资, 付款, 补偿 vt. 支付, 付清, 补偿, 偿还, 对...有利, 为...涂防水物 vi. 付款, 付…」
- **建议：`keep`**

## teeth → tooth
- rank：form 1096 / lemma 1170 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「牙齿（复数）」 / lemma「牙齿」
- ECDICT：form「pl. 牙齿 [医] 牙」 / lemma「n. 牙齿, 齿状物, 爱好 vt. 装以齿, 将...切成齿状 vi. 啮合」
- **建议：`keep`**

## feed → fee
- rank：form 1105 / lemma 8193 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喂养；供给」 / lemma「费用；酬金；小费」
- ECDICT：form「n. 饲料, 一餐, 饲养 vt. 喂, 饲养, 放牧, 靠...为生 vi. 吃东西, 用餐, 流入 [计] 送纸」 / lemma「n. 费用, 小费, 封地, 所有权 vt. 付费给」
- **建议：`keep`**

## records → record
- rank：form 1108 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「记录；档案（复数）」 / lemma「记录，记载；录制」
- ECDICT：form「n. 记录, 录音；唱片, 档案（record的复数形式）」 / lemma「n. 记录, 履历, 档案, 审判记录, 最高纪录, 唱片 vt. 记录, 记载, 标明, 将...录音 vi. 记录,…」
- **建议：`keep`**

## breathing → breathe
- rank：form 1109 / lemma 5331 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呼吸（现在分词）」 / lemma「呼吸」
- ECDICT：form「n. 呼吸, 瞬间, 微风 a. 呼吸的, 逼真的」 / lemma「vi. 呼吸, 生存, 低语 vt. 呼吸, 使喘息, 发散, 低声说」
- **建议：`keep`**

## forgotten → forget
- rank：form 1118 / lemma 5931 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「忘记（过去分词）」 / lemma「忘记；遗忘」
- ECDICT：form「forget的过去分词」 / lemma「vt. 忘记, 忽略, 忘 vi. 忘记」
- **建议：`keep`**

## invited → invite
- rank：form 1124 / lemma 1433 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「邀请（过去式/过去分词）」 / lemma「邀请」
- ECDICT：form「v. 邀请；引起, 招致（invite的过去分词）」 / lemma「vt. 邀请, 请求, 引起, 招致 n. 邀请」
- **建议：`keep`**

## hurts → hurt
- rank：form 1129 / lemma 6411 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疼痛；伤害（第三人称单数）」 / lemma「疼痛；伤害」
- ECDICT：form「n. 痛痒」 / lemma「n. 伤害, 创伤, 损害 v. 伤害, (使)伤心, 危害, 刺痛」
- **建议：`keep`**

## turning → turn
- rank：form 1138 / lemma 5904 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「转动；转弯（现在分词）」 / lemma「转；转向；翻转」
- ECDICT：form「n. 旋转, 转弯处, 车削工作 [化] 车削」 / lemma「n. 转弯, 转动, 旋转, 翻转, 一圈, 顺次, 改动, 变化, 性格, 特色, 形状, 转折 vt. 使旋转, 转…」
- **建议：`keep`**

## finding → find
- rank：form 1143 / lemma 1740 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发现；调查结果」 / lemma「找到；发现」
- ECDICT：form「n. 发现, 发现物, 决定, 裁决 [法] 调查结果, 对事实的认定, 判定的要素」 / lemma「vt. 发现, 感到, 找到, 认为, 得到 vi. 裁决 n. 发现 [计] 查找; DOS外部命令:在指定的文件或从…」
- **建议：`keep`**

## meaning → mean
- rank：form 1144 / lemma 5496 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「意思；意义」 / lemma「刻薄的；小气的」
- ECDICT：form「n. 意义, 含义, 目的, 意图 a. 意味深长的」 / lemma「a. 低劣的, 卑贱的, 简陋的, 吝啬的, 惭愧的, 平均的, 中间的, 普通的 vt. 意谓, 想要, 意欲, 预定…」
- **建议：`keep`**

## balls → ball
- rank：form 1157 / lemma 6252 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「球（复数）；睾丸（俚）」 / lemma「球」
- ECDICT：form「n. 胡说八道」 / lemma「n. 球, 舞会, 球状物 v. 捏成球形」
- **建议：`keep`**

## believed → believe
- rank：form 1176 / lemma 5919 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「相信；认为（过去式）」 / lemma「相信；认为」
- ECDICT：form「v. 相信( believe的过去式和过去分词 ); 认为; 以为; 对…信以为真」 / lemma「v. 相信」
- **建议：`keep`**

## threw → throw
- rank：form 1181 / lemma 5361 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扔；投掷（过去式）」 / lemma「扔；投掷」
- ECDICT：form「throw的过去式」 / lemma「vt. 投, 掷, 抛, 发射, 摔下, 匆匆穿上(或脱下), 抛弃, 摆脱 vi. 丢, 掷, 抛 n. 投掷, 掷骰…」
- **建议：`keep`**

## nuts → nut
- rank：form 1187 / lemma 4599 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疯狂的；发疯的」 / lemma「坚果；螺母」
- ECDICT：form「a. 狂热的, 发狂的, 疯的 interj. 呸, 胡说」 / lemma「n. 坚果, 核心, 螺帽 [计] Novell NetWare服务器实用程序」
- **建议：`keep`**

## students → student
- rank：form 1188 / lemma 8253 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「学生（复数）」 / lemma「学生」
- ECDICT：form「n. （尤指大专院校的）学生（student的复数）」 / lemma「n. 学生, 研究者, 学者」
- **建议：`keep`**

## bodies → body
- rank：form 1192 / lemma 1210 ｜ type `s3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「身体；尸体（复数）」 / lemma「身体；主体」
- ECDICT：form「n. （文章、文件等的）正文；（人或动物的）身体；主体部分（body的复数）」 / lemma「n. 身体, 人, 尸体, 主要部分, 团体 vt. 赋以形体 [计] 体」
- **建议：`keep`**

## opened → open
- rank：form 1193 / lemma 2696 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打开；开启（过去式）」 / lemma「开放的；打开」
- ECDICT：form「v. 打开, 开启（open过去分词形式）」 / lemma「n. 公开, 户外, 空旷 a. 开着的, 开放的, 开阔的, 营业着的, 公开的, 悬而未决的 vt. 打开, 公开,…」
- **建议：`keep`**

## bucks → buck
- rank：form 1195 / lemma 2364 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「美元；雄鹿（复数）」 / lemma「雄鹿；美元」
- ECDICT：form「n. 雄鹿队（篮球队名）；巴克斯（英国伦敦附近的一个郡名）」 / lemma「n. 元, 雄鹿, 纨绔子弟, 鞍马, 培克(赌博时的庄家标志), 碱水, 自夸, 谈话 vi. 马背突然拱起, 反对,…」
- **建议：`keep`**

## opens → open
- rank：form 1202 / lemma 2696 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打开；开启（第三人称单数）」 / lemma「开放的；打开」
- ECDICT：form「n. 打开；公开赛事；旷野（open的复数形式）」 / lemma「n. 公开, 户外, 空旷 a. 开着的, 开放的, 开阔的, 营业着的, 公开的, 悬而未决的 vt. 打开, 公开,…」
- **建议：`keep`**

## followed → follow
- rank：form 1203 / lemma 5913 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跟随；遵循（过去式）」 / lemma「跟随；沿着；遵循」
- ECDICT：form「a. 跟随的；服从的」 / lemma「vt. 跟随, 沿行, 遵循, 追求 vi. 跟随, 接着 n. 跟随, 追随」
- **建议：`keep`**

## opening → open
- rank：form 1208 / lemma 2696 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开口；开幕；开始」 / lemma「开放的；打开」
- ECDICT：form「n. 开始, 口子, 穴, 揭幕 a. 开始的」 / lemma「n. 公开, 户外, 空旷 a. 开着的, 开放的, 开阔的, 营业着的, 公开的, 悬而未决的 vt. 打开, 公开,…」
- **建议：`keep`**

## falling → fall
- rank：form 1213 / lemma 5754 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「落下；跌倒（现在分词）」 / lemma「落下；跌倒；下降」
- ECDICT：form「a. 落下的, 坠落的, 下降的 [化] 消胀」 / lemma「n. 落下, 瀑布, 采伐量, 下降, 落差, 降低, 堕落, 秋天 vi. 倒下, 落下, 来临, 失守, 阵亡, 下…」
- **建议：`keep`**

## disappeared → disappear
- rank：form 1235 / lemma 1641 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「消失；不见（过去式）」 / lemma「消失；不见」
- ECDICT：form「a. 消失的；消失了的」 / lemma「vi. 消失, 不见」
- **建议：`keep`**

## brings → bring
- rank：form 1262 / lemma 6237 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「带来；拿来（第三人称单数）」 / lemma「带来；拿来」
- ECDICT：form「v. 带来；使发生（bring的三单形式）」 / lemma「vt. 带来, 产生, 促使, 提出 vi. 生产」
- **建议：`keep`**

## failed → fail
- rank：form 1265 / lemma 2688 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「失败；不及格（过去式）」 / lemma「失败；未能」
- ECDICT：form「a. 已失败的 [计] 失败的」 / lemma「vi. 失败, 缺乏, 中断, 衰退, 失灵 vt. 忘记, 使...失望, 缺乏, 不及格 n. 不及格」
- **建议：`keep`**

## discovered → discover
- rank：form 1268 / lemma 2687 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发现（过去式）」 / lemma「发现」
- ECDICT：form「v. 发现, 找到（discover的过去形式）」 / lemma「vt. 发现, 找到, 暴露 vi. 发现」
- **建议：`keep`**

## cares → care
- rank：form 1272 / lemma 5421 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「关心；在乎（第三人称单数）」 / lemma「关心；在乎」
- ECDICT：form「（等于Central Advisory Referral Service）中心咨询服务」 / lemma「n. 小心, 照料, 忧虑 vi. 关心, 介意 vt. 在意, 喜欢」
- **建议：`keep`**

## fingers → finger
- rank：form 1273 / lemma 5289 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手指（复数）」 / lemma「手指」
- ECDICT：form「n. 梳状剔除器；手指头, 指头（finger复数）」 / lemma「n. 手指, 指状物, (手套的)手指部分, 指针 v. 用手指拨弄, 伸出 [计] 网络命令」
- **建议：`keep`**

## sees → see
- rank：form 1279 / lemma 1720 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看见；明白（第三人称单数）」 / lemma「看见；理解」
- ECDICT：form「abbr. 扩展企业应用套件（Sage Extended Enterprise Suite）」 / lemma「vt. 看见, 查看, 参观, 游览, 理解, 知道, 同意 vi. 看, 观看, 注意, 知道, 考虑 n. 主教的职…」
- **建议：`keep`**

## sending → send
- rank：form 1290 / lemma 8103 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发送；寄（现在分词）」 / lemma「发送；派遣；传达」
- ECDICT：form「n. 发送, 派遣, 发射, 信件, 神赐, 天降 [计] 发送」 / lemma「vt. 发送, 使进入, 寄, 派遣, 发射, 使陷于 vi. 寄信, 派人, 播送 n. (船的)上升运动 [计] 发…」
- **建议：`keep`**

## drinks → drink
- rank：form 1315 / lemma 4812 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「饮料（复数）」 / lemma「喝；饮酒；饮料」
- ECDICT：form「n. 饮料, 饮品；喝酒（drink复数）」 / lemma「n. 饮料, 酒 v. 喝, 喝酒」
- **建议：`keep`**

## buried → bury
- rank：form 1317 / lemma 2066 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「埋葬；掩埋（过去式）」 / lemma「埋葬；掩埋」
- ECDICT：form「a. 埋葬的；[地]埋藏的」 / lemma「vt. 埋葬, 埋藏」
- **建议：`keep`**

## details → detail
- rank：form 1321 / lemma 1979 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「细节；详情」 / lemma「细节；详情」
- ECDICT：form「n. 详细资料；细节（detail的复数）」 / lemma「n. 细节, 详情 vt. 详述, 选派 vi. 画详图 [计] 详细数据」
- **建议：`keep`**

## thoughts → thought
- rank：form 1322 / lemma 5973 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「想法；思想」 / lemma「思想；想法；思考」
- ECDICT：form「n. 思想；思维；想法（thought的复数）」 / lemma「n. 想法, 思想, 思维, 关心, 挂念 think的过去式和过去分词」
- **建议：`keep`**

## ruined → ruin
- rank：form 1329 / lemma 1396 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「毁坏的；破产的」 / lemma「毁坏；破坏」
- ECDICT：form「a. 毁灭的, 没落的, 荒废的」 / lemma「n. 毁灭, 推翻, 废墟 vi. 毁灭, 衰败, 破坏, 破产, 堕落 vt. 使毁灭, 毁坏, 使破产」
- **建议：`keep`**

## hidden → hide
- rank：form 1342 / lemma 5196 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「隐藏的；秘密的」 / lemma「兽皮；皮革」
- ECDICT：form「a. 隐藏的 hide的过去分词 [计] 隐藏的」 / lemma「n. 兽皮, 迹象, 躲藏处 vt. 藏, 隐瞒, 遮避, 剥...的皮, 隐藏 vi. 躲藏 [计] 隐藏」
- **建议：`keep`**

## exciting → excite
- rank：form 1345 / lemma 13752 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人兴奋的」 / lemma「使兴奋；激起」
- ECDICT：form「a. 令人兴奋的, 刺激的 [电] 激磁」 / lemma「vt. 刺激, 使兴奋, 激励」
- **建议：`keep`**

## growing → grow
- rank：form 1355 / lemma 7542 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「增长的；生长的」 / lemma「生长；种植」
- ECDICT：form「a. 成长的」 / lemma「vt. 种植, 使长满 vi. 生长, 变成, 发展」
- **建议：`keep`**

## beeping → beep
- rank：form 1359 / lemma 2476 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出哔哔声」 / lemma「嘟嘟声」
- ECDICT：form「v. 嘟嘟响( beep的现在分词 )」 / lemma「n. 短而尖的声音, 嘟 v. 嘟嘟响」
- **建议：`keep`**

## yelling → yell
- rank：form 1370 / lemma 8403 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大叫；喊叫」 / lemma「叫喊；吼叫；嚎叫」
- ECDICT：form「v. 叫喊, 号叫, 叫着说( yell的现在分词 )」 / lemma「vi. 叫喊, 大叫, (齐声)呐喊欢呼 vt. 喊叫着说 n. 叫声, 喊声, 呐喊」
- **建议：`keep`**

## painting → paint
- rank：form 1371 / lemma 8301 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「绘画；油画」 / lemma「颜料；油漆」
- ECDICT：form「n. 画, 绘画, 油漆 [化] 涂漆」 / lemma「n. 油漆, 颜料, 绘画作品, 涂漆 vt. 油漆, 绘, 画, 描绘, 装饰, 点缀 vi. 绘画, 涂漆」
- **建议：`keep`**

## grew → grow
- rank：form 1385 / lemma 7542 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生长；变得（过去式）」 / lemma「生长；种植」
- ECDICT：form「grow的过去式」 / lemma「vt. 种植, 使长满 vi. 生长, 变成, 发展」
- **建议：`keep`**

## boring → bore
- rank：form 1414 / lemma 4271 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「无聊的」 / lemma「使厌烦；钻孔」
- ECDICT：form「a. 烦人的, 无聊的, 无趣的 [机] 成孔期, 搪孔」 / lemma「n. 令人讨厌的人, 激浪, 枪膛, 孔 vt. 使烦扰, 钻孔 vi. 钻孔 bear的过去式 [计] 内径; 孔径」
- **建议：`keep`**

## bones → bone
- rank：form 1417 / lemma 5295 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「骨头；骨骼」 / lemma「骨头；骨骼」
- ECDICT：form「n. 骨骼, 尸体」 / lemma「n. 骨头, 骨, 骨制品 vt. 剔骨 vi. 专心致志」
- **建议：`keep`**

## warning → warn
- rank：form 1420 / lemma 1727 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「警告；警报」 / lemma「警告；提醒」
- ECDICT：form「n. 警告, 预告, 预兆, 通知 [法] 警告, 警戒, 预告; 警告的, 注意的」 / lemma「vt. 警告, 提醒, 通知 vi. 发出警告」
- **建议：`keep`**

## groaning → groan
- rank：form 1424 / lemma 7965 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呻吟；抱怨」 / lemma「呻吟；抱怨」
- ECDICT：form「n. 呻吟；活塞在气缸内的不正常声；哼声」 / lemma「n. 呻吟, 叹息 vi. 呻吟, 抱怨, 受压迫 vt. 呻吟地说」
- **建议：`keep`**

## results → result
- rank：form 1425 / lemma 1648 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「结果；成绩」 / lemma「结果；成果」
- ECDICT：form「n. 结果；成绩（result的复数）」 / lemma「n. 结果, 成绩, 答案 vi. 产生, 结果, 致使 [计] 结果」
- **建议：`keep`**

## complicated → complicate
- rank：form 1427 / lemma 12800 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「复杂的」 / lemma「使复杂；使难以理解」
- ECDICT：form「a. 复杂的 [医] 并发的」 / lemma「vt. 弄复杂, 使错综, 使恶化 vi. 变复杂」
- **建议：`keep`**

## tears → tear
- rank：form 1435 / lemma 1734 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眼泪」 / lemma「眼泪；撕裂」
- ECDICT：form「n. 眼泪；泪水（tear复数形式）」 / lemma「n. 泪滴, 眼泪, 撕, 扯, 裂缝, 激怒, 飞奔 vi. 流泪, 撕破, 赶快, 飞奔, 被撕破 vt. 撕裂, …」
- **建议：`keep`**

## reached → reach
- rank：form 1437 / lemma 5847 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「到达；够到」 / lemma「到达；伸手；触及」
- ECDICT：form「v. 到达( reach的过去式和过去分词 ); 联络; 伸出手臂, 延伸」 / lemma「n. 伸出, 延伸, 区域, 范围, 流域, 岬 vt. 到达, 达到, 伸出, 延伸, 影响 vi. 达到, 延伸, …」
- **建议：`keep`**

## higher → high
- rank：form 1438 / lemma 1440 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更高的」 / lemma「高的（地）」
- ECDICT：form「[经] 上扬」 / lemma「n. 高度, 高处 a. 高的, 高级的, 主要的, 高尚的, 高原的, 高音的, 昂贵的, 傲慢的 adv. 高度地,…」
- **建议：`keep`**

## burning → burn
- rank：form 1439 / lemma 7638 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「燃烧的；炽热的」 / lemma「烧焦」
- ECDICT：form「a. 燃烧的, 象燃烧一样的 n. 烧, 燃烧」 / lemma「vt. 烧, 烧毁, 烧伤 vi. 燃烧, 发热, 烧毁 n. 烧伤, 烙印」
- **建议：`keep`**

## jobs → job
- rank：form 1444 / lemma 6000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工作；职位」 / lemma「工作；职业；活儿」
- ECDICT：form「n. 工作（job的复数形式）」 / lemma「n. 工作, 零活, 职业, 事情 vi. 做零工, 打杂, 做股票经纪, 假公济私 vt. 代客买卖, 批发, 承包,…」
- **建议：`keep`**

## grown → grow
- rank：form 1445 / lemma 7542 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「长大的；成年的」 / lemma「生长；种植」
- ECDICT：form「a. 长大的, 成年的, 长满某物的 grow的过去分词」 / lemma「vt. 种植, 使长满 vi. 生长, 变成, 发展」
- **建议：`keep`**

## woods → wood
- rank：form 1450 / lemma 4671 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「树林；森林」 / lemma「树林；木材」
- ECDICT：form「n. 森林, 树林」 / lemma「n. 木材, 木制品 vt. 植林于, 给...添加木柴 vi. 收集木材」
- **建议：`keep`**

## finds → find
- rank：form 1461 / lemma 1740 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发现；找到」 / lemma「找到；发现」
- ECDICT：form「v. 发现( find的第三人称单数 ); 找到; 到达; 发觉」 / lemma「vt. 发现, 感到, 找到, 认为, 得到 vi. 裁决 n. 发现 [计] 查找; DOS外部命令:在指定的文件或从…」
- **建议：`keep`**

## humans → human
- rank：form 1466 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「人类」 / lemma「人类的；人性的」
- ECDICT：form「n. 人类（human的复数形式）」 / lemma「n. 人, 人类 a. 人类的, 似人类的, 人性的, 有同情心的」
- **建议：`keep`**

## hired → hire
- rank：form 1472 / lemma 8244 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雇用；租用」 / lemma「雇用；租用；聘请」
- ECDICT：form「v. 租用；雇用（hire的过去式及过去分词形式）」 / lemma「n. 租金, 租用, 雇用 vt. 雇请, 出租 vi. 受雇」
- **建议：`keep`**

## led → lead
- rank：form 1474 / lemma 8100 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「带领；领导」 / lemma「带领；领导；通向」
- ECDICT：form「lead的过去式和过去分词 [计] 发光二极管」 / lemma「n. 铅, 铅条, 领导, 超前量, 领引, 榜样, 主角, 导线 vt. 引导, 带领, 领导, 指挥, 致使, 加铅…」
- **建议：`keep`**

## glasses → glass
- rank：form 1482 / lemma 4986 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眼镜」 / lemma「玻璃；杯子」
- ECDICT：form「n. 眼镜；双筒望远镜；玻璃（glass的复数形式）」 / lemma「n. 玻璃, 玻璃杯, 透镜 vt. 装玻璃于, 反射, 反映 vi. 成玻璃状」
- **建议：`keep`**

## pounds → pound
- rank：form 1486 / lemma 3088 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「英镑；磅（复数）」 / lemma「磅；英镑」
- ECDICT：form「n. 磅, 英镑；重击（pound复数形式）」 / lemma「n. 磅, 英镑, 重击, 鱼塘, 拘留所, 兽栏 vt. 强烈打击, 捣烂, 监禁, 关入栏内 vi. 连续重击, 苦…」
- **建议：`keep`**

## depends → depend
- rank：form 1490 / lemma 1500 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「取决于；依赖（三单）」 / lemma「依赖；取决于」
- ECDICT：form「v. 依赖；信赖（depend的三单形式）」 / lemma「vi. 靠, 视...而定, 信赖」
- **建议：`keep`**

## families → family
- rank：form 1495 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「家庭（复数）」 / lemma「家庭；家族」
- ECDICT：form「n. 家族；家庭（family的复数）」 / lemma「n. 家庭, 家人, 族 a. 家庭的」
- **建议：`keep`**

## walls → wall
- rank：form 1498 / lemma 4869 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「墙（复数）」 / lemma「墙；墙壁」
- ECDICT：form「n. 墙壁；墙体（wall的复数）」 / lemma「n. 墙, 墙壁, 垣, 内壁, 分界物, 屏障 a. 墙的 vt. 给...建墙, 禁闭, 用墙围住 [计] 背景墙」
- **建议：`keep`**

## speaks → speak
- rank：form 1501 / lemma 1700 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「说话；讲（三单）」 / lemma「说话；发言」
- ECDICT：form「v. 讲, 谈( speak的第三人称单数 ); 说; 演说; 从某种观点来说」 / lemma「vi. 说, 说话, 演说, 发言 vt. 说, 讲, 说出」
- **建议：`keep`**

## fought → fight
- rank：form 1502 / lemma 6318 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「战斗；打架（过去式）」 / lemma「打架；战斗」
- ECDICT：form「fight的过去式和过去分词」 / lemma「n. 打架, 争吵, 斗志 v. 对抗, 打架」
- **建议：`keep`**

## answers → answer
- rank：form 1504 / lemma 1890 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「答案；回答（复数）」 / lemma「回答；答案」
- ECDICT：form「n. 答案, 回答（answer的复数）」 / lemma「n. 答案, 回答, 回报, 答辩 vt. 回答, 反驳, 适应, 响应, 符合 vi. 回答, 答应, 负责, 符合,…」
- **建议：`keep`**

## carrying → carry
- rank：form 1511 / lemma 8106 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「携带；搬运（现在分词）」 / lemma「携带；搬运；承载」
- ECDICT：form「[法] 运载」 / lemma「n. 进位, 射程, 运载 vt. 携带, 运送, 支持, 传送, 包含 vi. 被携带, 能达到 [计] 进位; 进位…」
- **建议：`keep`**

## closes → close
- rank：form 1520 / lemma 2704 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「关闭（三单）」 / lemma「近的；关闭」
- ECDICT：form「v. （使）关, 关闭( close的第三人称单数 ); 终止; （使）缩小; 合上」 / lemma「n. 结束, 完结 a. 靠近的, 亲近的, 亲密的, 严密的, 关闭的, 狭窄的, 秘密的 vt. 关, 结束, 使靠…」
- **建议：`keep`**

## confused → confuse
- rank：form 1523 / lemma 6656 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「困惑的；糊涂的」 / lemma「使困惑；混淆」
- ECDICT：form「a. 困惑的, 混乱的」 / lemma「vt. 使混乱, 使狼狈, 使困惑 [法] 混淆」
- **建议：`keep`**

## raised → raise
- rank：form 1527 / lemma 5871 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「举起；提高（过去式）」 / lemma「举起；提高；抚养」
- ECDICT：form「a. 凸起的, 浮雕的, 发酵的 [医] 隆起的」 / lemma「n. 上升, 高地, 增高 vt. 升起, 举起, 唤起, 提高, 使出现, 使复活, 提出, 筹集, 饲养」
- **建议：`keep`**

## panting → pant
- rank：form 1528 / lemma 12658 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「喘气（现在分词）」 / lemma「喘气；气喘」
- ECDICT：form「[医] 气促, 呼吸困难」 / lemma「n. 喘息, 悸动 vi. 喘息, 渴望 vt. 气喘吁吁地说」
- **建议：`keep`**

## clears → clear
- rank：form 1530 / lemma 8070 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「清除；放晴（三单）」 / lemma「晴朗的；清晰的；透明的」
- ECDICT：form「v. 变明朗( clear的第三人称单数 ); 明白; 离去; （通过票据交换所）交换票据」 / lemma「a. 清楚的, 明确的, 澄清的 adv. 清晰地 vt. 澄清, 清除障碍 vi. 放晴, 变清澈 n. 空隙 [计]…」
- **建议：`keep`**

## patients → patient
- rank：form 1532 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「病人（复数）」 / lemma「有耐心的；能忍受的」
- ECDICT：form「n. 病人（patient的复数形式）」 / lemma「n. 病人, 承受者 a. 忍耐的, 容忍的, 有耐性的, 坚忍的」
- **建议：`keep`**

## watched → watch
- rank：form 1533 / lemma 5001 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「观看；注视（过去式）」 / lemma「手表；监视」
- ECDICT：form「vt. 注视, 注意（watch的过去式与过去分词形式）」 / lemma「n. 观察, 手表, 看守, 守护, 监视, 值班人 vt. 看, 注视, 照顾, 看守, 守护, 监视 vi. 观看,…」
- **建议：`keep`**

## committed → commit
- rank：form 1534 / lemma 2000 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「忠诚的；犯（罪）的」 / lemma「承诺；犯（罪）」
- ECDICT：form「a. 献身于某种事业的 [计] 委托的」 / lemma「vt. 委托(托付), 犯罪, 指派...作战, 使承担义务 [法] 犯, 做, 把...交托给」
- **建议：`keep`**

## dealing → deal
- rank：form 1543 / lemma 6036 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「处理；交易（现在分词）」 / lemma「交易；协议；待遇」
- ECDICT：form「n. 经营行为, 行为, 交易 [法] 待遇, 处置, 行为」 / lemma「n. 交易, 协定, 数量, 买卖, 松木板 vi. 处理, 应付, 做生意 vt. 分配, 发牌, 给予 [计] 发牌」
- **建议：`keep`**

## charges → charge
- rank：form 1545 / lemma 6753 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「指控；费用（复数）」 / lemma「冲锋；指控」
- ECDICT：form「n. 费用；手续费；运费」 / lemma「n. 指控, 费用, 冲锋, 电荷, 炸药, 主管, 被托管人, 命令 vt. 控诉, 加罪于, 使充满, 使充电, 使…」
- **建议：`keep`**

## drove → drive
- rank：form 1550 / lemma 5742 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「驾驶（过去式）」 / lemma「驾驶；开车；驱动」
- ECDICT：form「n. 畜群 drive的过去式」 / lemma「n. 驾车, 快车道, 推进力, 驱动, 动力, 击球, 驱动器 vt. 开车, 驱使, 推动, 驾驶 vi. 开车, …」
- **建议：`keep`**

## sat → sit
- rank：form 1557 / lemma 2616 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「坐（过去式）」 / lemma「坐；位于」
- ECDICT：form「n. 饱和度 sit的过去式和过去分词 [计] 饱和度」 / lemma「vi. 坐, 就座, 坐落 vt. 使就座, 骑 n. 坐, 衣服合身」
- **建议：`keep`**

## terms → term
- rank：form 1561 / lemma 2215 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「术语；条款；条件」 / lemma「学期；术语；期限」
- ECDICT：form「n. 条件, 条款, 费用, 价钱, 关系, 地位, 交谊 [经] 条件」 / lemma「n. 术语, 专有名词, 期限, 学期, 任期, 条件, 价钱, 关系, 地位, 项, 界石 vt. 称, 呼 [计] …」
- **建议：`keep`**

## stood → stand
- rank：form 1581 / lemma 2624 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「站立（stand的过去式）」 / lemma「站立；立场」
- ECDICT：form「stand的过去式和过去分词」 / lemma「n. 站立, 站住, 停顿, 讲台, 看台, 立场, 法院证人席 vi. 站, 立, 坐落, 停滞, 位于, 坚持, 维…」
- **建议：`keep`**

## kicked → kick
- rank：form 1582 / lemma 5358 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「踢（kick的过去式）」 / lemma「踢；踹」
- ECDICT：form「v. 踢( kick的过去式和过去分词 ); 踢蹬, 踢（腿）; （因干了蠢事、失去良机等）对（自己）生气; 体育运动」 / lemma「n. 踢, 反冲, 后座力, 凹底 vi. 踢, 反抗, 反冲 vt. 踢, 反冲」
- **建议：`keep`**

## lips → lip
- rank：form 1586 / lemma 5259 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘴唇（lip的复数）」 / lemma「嘴唇」
- ECDICT：form「n. 嘴唇（lip的复数）」 / lemma「n. 唇, 口缘, 唇状构造 vt. 以嘴唇碰, 轻轻说出 a. 口头上的 [计] 大型互连网信息包」
- **建议：`keep`**

## chuckling → chuckle
- rank：form 1600 / lemma 4267 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轻声笑（chuckle的现在分词）」 / lemma「轻声笑；暗笑」
- ECDICT：form「v. 轻声地笑( chuckle的现在分词 )」 / lemma「n. 咯咯的笑声, 轻笑 vi. 咯咯的笑, 咕咕叫」
- **建议：`keep`**

## touched → touch
- rank：form 1608 / lemma 5346 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「感动的；受触动的」 / lemma「触摸；接触」
- ECDICT：form「a. 精神不太正常的, 受感动的」 / lemma「n. 触觉, 碰, 触, 机灵, 轻触, 格调, 少许, 缺点, 弹力 vt. 接触, 触摸, 触及, 使接触, 达到,…」
- **建议：`keep`**

## cooking → cook
- rank：form 1612 / lemma 4866 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烹饪；做饭」 / lemma「烹调；煮；厨师」
- ECDICT：form「n. 烹饪 [化] 熬炼; 热炼; 蒸煮」 / lemma「n. 厨子, 厨师 vt. 烹调, 煮饭, 加热 vi. 在煮着」
- **建议：`keep`**

## moves → move
- rank：form 1614 / lemma 8091 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「行动；举措（move的复数）」 / lemma「移动；搬家；感动」
- ECDICT：form「v. 移动；搬家；感动（move的第三人称单数）」 / lemma「n. 移动, 迁居, 步骤 vt. 移动, 开动, 感动, 搬(家) vi. 移动, 离开, 运行, 迁移, 摇动, 搬…」
- **建议：`keep`**

## dies → die
- rank：form 1622 / lemma 1830 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「死亡（die的第三人称单数）」 / lemma「死亡；消失」
- ECDICT：form「v. 死亡；凋谢；消失（动词die的第三人称单数形式）」 / lemma「vi. 死亡, 消逝, 平息, 熄灭, 漠然, 渴望 vt. 死 n. 骰子, 冲模」
- **建议：`keep`**

## pills → pill
- rank：form 1631 / lemma 3102 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「药丸（pill的复数）」 / lemma「药丸」
- ECDICT：form「n. 丸剂；药丸（pill的复数）」 / lemma「n. 药丸, 弹丸, 屈辱, 胡说 v. 做成药丸, 形成丸状, 服药丸, 挫败, 抢劫」
- **建议：`keep`**

## burned → burn
- rank：form 1632 / lemma 7638 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「燃烧（burn的过去式）」 / lemma「烧焦」
- ECDICT：form「burn的过去式和过去分词 [机] 焦化」 / lemma「vt. 烧, 烧毁, 烧伤 vi. 燃烧, 发热, 烧毁 n. 烧伤, 烙印」
- **建议：`keep`**

## smells → smell
- rank：form 1633 / lemma 7677 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闻起来；发出气味」 / lemma「嗅；闻」
- ECDICT：form「n. 臭味；气味（smell的复数）」 / lemma「n. 味道, 气味, 嗅觉, 嗅, 臭味, 气息 vt. 闻, 探出, 察觉, 发出...的气味 vi. 嗅, 散发气味…」
- **建议：`keep`**

## bleeding → bleed
- rank：form 1636 / lemma 8406 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流血（bleed的现在分词）」 / lemma「流血；出血」
- ECDICT：form「n. 出血, 流血 [化] 渗色」 / lemma「vi. 流血, 悲痛, 渗出 vt. 使出血, 榨取」
- **建议：`keep`**

## beating → beat
- rank：form 1637 / lemma 6315 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「殴打；跳动；失败」 / lemma「击败；敲打」
- ECDICT：form「n. 打, 挫败, 搏动 [化] 打浆」 / lemma「n. 心跳(声), 打, 敲打声, 拍子 v. 打, 拍打, 打败 a. 疲乏的, 颓废的 beat的过去式 [计] 拍…」
- **建议：`keep`**

## laid → lay
- rank：form 1651 / lemma 949 ｜ type `dp` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置（lay 过去式）」 / lemma「放置；躺（过去式）」
- ECDICT：form「lay的过去式和过去分词」 / lemma「vt. 放置, 产, 铺设, 布置, 提出, 平息 vi. 下蛋, 打赌 n. 位置, 层, 隐藏处 a. 世俗的, 外…」
- **建议：`keep`**

## pulling → pull
- rank：form 1667 / lemma 2720 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拉；拖（现在分词）」 / lemma「拉；牵引」
- ECDICT：form「[计] 拉单晶的」 / lemma「vt. 拉, 拖, 拔, 牵, 撕开, 吸引 vi. 拉, 拖, 拔, 有吸引力 n. 拉, 拖, 拔, 拉力, 牵引力…」
- **建议：`keep`**

## throwing → throw
- rank：form 1668 / lemma 5361 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扔；抛（现在分词）」 / lemma「扔；投掷」
- ECDICT：form「n. 投掷」 / lemma「vt. 投, 掷, 抛, 发射, 摔下, 匆匆穿上(或脱下), 抛弃, 摆脱 vi. 丢, 掷, 抛 n. 投掷, 掷骰…」
- **建议：`keep`**

## tied → tie
- rank：form 1675 / lemma 5211 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「系；绑（tie 过去式）」 / lemma「系；捆绑」
- ECDICT：form「v. 系（tie的过去式和过去分词）」 / lemma「n. 带子, 线, 鞋带, 领带, 领结, 关系, 束缚, 平局, 不分胜负 vt. 系, 打结, 扎, 约束, 与..…」
- **建议：`keep`**

## riding → ride
- rank：form 1684 / lemma 5745 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「骑；乘（现在分词）」 / lemma「骑；乘坐」
- ECDICT：form「n. 骑, 乘车, 乘, 骑术, 骑马」 / lemma「n. 骑马, 乘坐, 乘车, 搭便车 vt. 骑, 乘坐, 压迫, 控制 vi. 骑马, 乘车, 漂游」
- **建议：`keep`**

## scoffs → scoff
- rank：form 1685 / lemma 24055 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘲笑；讥讽（第三人称单数）」 / lemma「嘲笑；讥讽」
- ECDICT：form「v. 嘲笑, 嘲弄( scoff的第三人称单数 )」 / lemma「n. 嘲笑, 愚弄, 笑柄, 食品 v. 嘲笑, 嘲弄, 贪吃, 狼吞虎咽地吃」
- **建议：`keep`**

## bags → bag
- rank：form 1689 / lemma 4950 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「袋子；包（复数）」 / lemma「包；袋子」
- ECDICT：form「n. 许多」 / lemma「n. 袋子, 袋状物 vt. 使膨大, 装袋, 猎获」
- **建议：`keep`**

## hunting → hunt
- rank：form 1714 / lemma 5997 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打猎；搜寻（现在分词）」 / lemma「搜寻；打猎；追捕」
- ECDICT：form「n. 狩猎, 猎狐, 探求 [计] 寻找平衡; 寻找」 / lemma「n. 狩猎, 追捕, 搜寻, 猎区 vt. 狩猎, 打猎, 搜索 vi. 打猎, 猎食, 搜寻」
- **建议：`keep`**

## woke → wake
- rank：form 1719 / lemma 6399 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「觉醒的；警觉的」 / lemma「醒来；唤醒」
- ECDICT：form「wake的过去式和过去分词」 / lemma「vt. 叫醒, 激发 vi. 醒来, 醒着, 觉醒, 活跃起来 n. 守侯, 守夜, 尾迹, 痕迹」
- **建议：`keep`**

## winning → win
- rank：form 1721 / lemma 2680 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「获胜的；迷人的」 / lemma「赢；获胜」
- ECDICT：form「n. 胜利, 获得, 成功, 赢得物 a. 得胜的, 胜利的」 / lemma「vt. 赢得, 打胜, 成功 vi. 获胜, 达到, 影响 n. 胜利, 赢, 收益」
- **建议：`keep`**

## falls → fall
- rank：form 1722 / lemma 5754 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「瀑布；跌落（fall的复数/三单）」 / lemma「落下；跌倒；下降」
- ECDICT：form「n. 瀑布；陨石」 / lemma「n. 落下, 瀑布, 采伐量, 下降, 落差, 降低, 堕落, 秋天 vi. 倒下, 落下, 来临, 失守, 阵亡, 下…」
- **建议：`keep`**

## falls → fell
- rank：form 1722 / lemma 602 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「瀑布；跌落（fall的复数/三单）」 / lemma「跌倒（fall的过去式）」
- ECDICT：form「n. 瀑布；陨石」 / lemma「vt. 击倒 n. 一季所伐的木材, 折缝 a. 凶猛的, 可怕的 fall的过去式」
- **建议：`keep`**

## convinced → convince
- rank：form 1726 / lemma 1757 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「确信的；被说服的」 / lemma「说服；使信服」
- ECDICT：form「a. 确信的, 深信的」 / lemma「vt. 说服, 使相信 [法] 使确信, 使信服, 使人认识错误」
- **建议：`keep`**

## fallen → fall
- rank：form 1731 / lemma 5754 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「倒下的；堕落的」 / lemma「落下；跌倒；下降」
- ECDICT：form「a. 堕落的, 落下来的, 陷落的 fall的过去分词」 / lemma「n. 落下, 瀑布, 采伐量, 下降, 落差, 降低, 堕落, 秋天 vi. 倒下, 落下, 来临, 失守, 阵亡, 下…」
- **建议：`keep`**

## tires → tire
- rank：form 1737 / lemma 3398 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轮胎（tire的复数）；使疲倦」 / lemma「使疲倦；疲劳」
- ECDICT：form「n. 轮胎（tire的复数）」 / lemma「n. 轮胎, 头饰 vt. 使疲倦, 使厌烦, 打扮 vi. 疲劳, 厌倦」
- **建议：`keep`**

## americans → american
- rank：form 1740 / lemma 587 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「美国人（American的复数）」 / lemma「美国的；美国人」
- ECDICT：form「n. 美国人（American的复数形式）」 / lemma「n. 美国人 a. 美国的, 美洲的」
- **建议：`keep`**

## notes → note
- rank：form 1741 / lemma 8319 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「笔记；便条（note的复数）」 / lemma「笔记；便条」
- ECDICT：form「n. 票据；注释, 说明（note复数）」 / lemma「n. 笔记, 记录, 注解, 票据, 符号, 显要, 注重, 便笺, 照会 vt. 记录, 注解, 注意」
- **建议：`keep`**

## steps → step
- rank：form 1755 / lemma 8124 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「台阶；步骤（step的复数）」 / lemma「踏；踩；迈步」
- ECDICT：form「n. （楼外的）台阶；步伐；步幅；步数」 / lemma「n. 步骤, 步, 步幅, 脚步声, 踏级, 步伐, 短距离, 步态, 手段, 等级 vt. 踏, 以步测量, 跨步, …」
- **建议：`keep`**

## files → file
- rank：form 1759 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「文件；档案（file的复数）」 / lemma「文件；档案；行列」
- ECDICT：form「n. 文件；文档（file的复数）」 / lemma「n. 档案, 公文箱, 文件夹, 文件, 卷宗, 锉刀 vi. 列队行进, 用锉刀做 vt. 归档, 申请, 锉, 琢磨…」
- **建议：`keep`**

## carried → carry
- rank：form 1763 / lemma 8106 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「携带；搬运（carry的过去式）」 / lemma「携带；搬运；承载」
- ECDICT：form「a. 入神的；被运的；忘我的」 / lemma「n. 进位, 射程, 运载 vt. 携带, 运送, 支持, 传送, 包含 vi. 被携带, 能达到 [计] 进位; 进位…」
- **建议：`keep`**

## brains → brain
- rank：form 1770 / lemma 5310 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大脑；智力（brain的复数）」 / lemma「大脑；头脑」
- ECDICT：form「n. 智力, 脑髓 [法] 智能, 智囊」 / lemma「n. 脑 vt. 打碎脑部」
- **建议：`keep`**

## marks → mark
- rank：form 1783 / lemma 5994 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「记号；分数（mark的复数）」 / lemma「注意；标记；打分」
- ECDICT：form「n. 标记, 记号；唛头, 分数；台面标志」 / lemma「n. 标志, 分数, 马克, 痕迹, 斑点, 靶子, 刻度, 记号, 符号, 戳记, 标准, 起跑线 vt. 做标记于,…」
- **建议：`keep`**

## blew → blow
- rank：form 1803 / lemma 8034 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「blow 的过去式；吹」 / lemma「吹；刮（风）」
- ECDICT：form「blow的过去式和过去分词」 / lemma「n. 吹, 打击, 殴打, 花开 v. 吹, 风吹, 吹响, 开花」
- **建议：`keep`**

## talks → talk
- rank：form 1804 / lemma 5916 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「会谈；谈话（复数）」 / lemma「谈话；讨论」
- ECDICT：form「n. 会谈」 / lemma「n. 谈话, 交谈, 会谈, 讲话, 演讲, 空谈, 谣言, 方言, 语言 vi. 讲话, 演讲, 说话, 谈话, 交流…」
- **建议：`keep`**

## knees → knee
- rank：form 1814 / lemma 5283 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「膝盖（复数）」 / lemma「膝盖；膝关节」
- ECDICT：form「n. 膝( knee的复数形式 ); 膝盖; （裤子的）膝部; 坐下时)大腿朝上的面」 / lemma「n. 膝, 膝盖 vt. 膝行, 用膝盖碰」
- **建议：`keep`**

## staring → stare
- rank：form 1817 / lemma 3564 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「凝视；盯着看」 / lemma「凝视；盯着看」
- ECDICT：form「a. 凝视的, 瞪着眼的, 显眼的」 / lemma「vi. 注视, 凝视, 瞪视, 显眼 vt. 盯 n. 凝视」
- **建议：`keep`**

## chances → chance
- rank：form 1818 / lemma 8397 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「机会；可能性（复数）」 / lemma「机会；可能性；偶然」
- ECDICT：form「n. 机会( chance的名词复数 ); 偶然; 风险; 某事发生的可能性」 / lemma「n. 机会, 意外, 可能性 vi. 偶然发生 vt. 冒险」
- **建议：`keep`**

## circumstances → circumstance
- rank：form 1819 / lemma 9569 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「情况；环境（复数）」 / lemma「情况；环境」
- ECDICT：form「[法] 事件, 事项, 详细情节」 / lemma「n. 环境, 状况, 事件」
- **建议：`keep`**

## tests → test
- rank：form 1837 / lemma 8322 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「测试；考试（复数）」 / lemma「测验；考试」
- ECDICT：form「n. 测验（test的复数）」 / lemma「n. 测试, 试验, 化验, 检验, 考验, 甲壳 vt. 测试, 试验, 化验 vi. 接受测验, 进行测试」
- **建议：`keep`**

## rocks → rock
- rank：form 1838 / lemma 5676 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「岩石（复数）；摇滚乐」 / lemma「岩石；石头」
- ECDICT：form「n. 岩石, 岩礁；岩石礁石（rock复数形式）」 / lemma「n. 岩石, 岩礁, 石头, 基石, 暗礁, 摇动, 摇滚乐 vt. 摇摆, 摇动, 使摇晃, 使动摇 vi. 摇, 摇…」
- **建议：`keep`**

## connected → connect
- rank：form 1842 / lemma 2947 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「连接的；有联系的」 / lemma「连接；联系」
- ECDICT：form「a. 连接的, 连贯的, 有联系的, 关联的, 连结的, 有关系的 [计] 连接的」 / lemma「v. 连接, 联合, 联系」
- **建议：`keep`**

## pushed → push
- rank：form 1844 / lemma 2712 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「推（过去式）；推动」 / lemma「推；推动」
- ECDICT：form「a. 拮据的, 紧张的, 没空的, 忙」 / lemma「n. 推, 推动, 奋斗, 攻击, 进取心 vt. 推, 推动, 使伸出, 推行, 逼迫, 增加 vi. 推, 推进, …」
- **建议：`keep`**

## closing → close
- rank：form 1846 / lemma 2704 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「结束的；关闭的」 / lemma「近的；关闭」
- ECDICT：form「n. 结束 a. 结束的」 / lemma「n. 结束, 完结 a. 靠近的, 亲近的, 亲密的, 严密的, 关闭的, 狭窄的, 秘密的 vt. 关, 结束, 使靠…」
- **建议：`keep`**

## leading → lead
- rank：form 1854 / lemma 8100 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「主要的；领先的」 / lemma「带领；领导；通向」
- ECDICT：form「n. 领导, 指挥, 神示, 铅板 a. 领导的, 主要的, 在前的」 / lemma「n. 铅, 铅条, 领导, 超前量, 领引, 榜样, 主角, 导线 vt. 引导, 带领, 领导, 指挥, 致使, 加铅…」
- **建议：`keep`**

## engaged → engage
- rank：form 1857 / lemma 4535 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已订婚的；忙于的」 / lemma「从事；吸引；订婚」
- ECDICT：form「a. 忙碌的, 使用中的」 / lemma「vi. 答应, 从事, 交战 vt. 使忙碌, 雇佣, 预定, 使从事于, 使参加」
- **建议：`keep`**

## charming → charm
- rank：form 1859 / lemma 2682 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「迷人的；有魅力的」 / lemma「魅力；咒语」
- ECDICT：form「a. 迷人的, 有吸引力的」 / lemma「n. 吸引力, 魔力, 符咒 vt. 迷住, 使陶醉, 行魔法 vi. 用符咒, 有魅力」
- **建议：`keep`**

## learning → learn
- rank：form 1861 / lemma 5937 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「学习；学问」 / lemma「学习；得知；学会」
- ECDICT：form「n. 学问, 学识, 学习 [计] 学习」 / lemma「vt. 学习；认识到；得知」
- **建议：`keep`**

## workers → worker
- rank：form 1876 / lemma 8235 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工人（复数）」 / lemma「工人；工作者；劳动者」
- ECDICT：form「n. 工人, 人员；角色（worker复数形式）」 / lemma「n. 工人, 劳动者 [经] 工人, 劳工, 劳动者」
- **建议：`keep`**

## bored → bore
- rank：form 1877 / lemma 4271 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「无聊的；厌烦的」 / lemma「使厌烦；钻孔」
- ECDICT：form「a. 无聊的；烦人的；无趣的」 / lemma「n. 令人讨厌的人, 激浪, 枪膛, 孔 vt. 使烦扰, 钻孔 vi. 钻孔 bear的过去式 [计] 内径; 孔径」
- **建议：`keep`**

## understanding → understand
- rank：form 1879 / lemma 5922 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「理解；谅解」 / lemma「理解；明白；懂」
- ECDICT：form「n. 理解, 谅解 [法] 协商, 协议, 谅解」 / lemma「vt. 理解, 了解, 领会, 听说, 懂 vi. 懂得, 认为」
- **建议：`keep`**

## beeps → beep
- rank：form 1880 / lemma 2476 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘟嘟声（复数）」 / lemma「嘟嘟声」
- ECDICT：form「n. 哔哔声( beep的名词复数 ) v. 嘟嘟响( beep的第三人称单数 )」 / lemma「n. 短而尖的声音, 嘟 v. 嘟嘟响」
- **建议：`keep`**

## gasping → gasp
- rank：form 1882 / lemma 4567 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喘气；急促呼吸」 / lemma「喘气；倒抽气」
- ECDICT：form「a. 痉挛的, 阵发性的」 / lemma「n. 喘气 vi. 喘气, 喘息, 渴望 vt. 气喘吁吁地说」
- **建议：`keep`**

## bastards → bastard
- rank：form 1891 / lemma 16600 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「私生子；混蛋（复数）」 / lemma「私生子；混蛋（贬义）」
- ECDICT：form「n. 私生子( bastard的复数形式 ); 坏蛋; 讨厌的事物; 麻烦事 （认为别人走运或不幸时说）家伙」 / lemma「n. 私生子, 劣货 a. 私生的, 杂种的, 不合标准的」
- **建议：`keep`**

## leads → lead
- rank：form 1893 / lemma 8100 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「领导；通向（第三人称单数）」 / lemma「带领；领导；通向」
- ECDICT：form「n. 领导者；引线；管道（lead的复数）」 / lemma「n. 铅, 铅条, 领导, 超前量, 领引, 榜样, 主角, 导线 vt. 引导, 带领, 领导, 指挥, 致使, 加铅…」
- **建议：`keep`**

## blows → blow
- rank：form 1895 / lemma 8034 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吹；打击（第三人称单数）」 / lemma「吹；刮（风）」
- ECDICT：form「n. 吹；管乐器声；疾风（blow的复数）」 / lemma「n. 吹, 打击, 殴打, 花开 v. 吹, 风吹, 吹响, 开花」
- **建议：`keep`**

## customers → customer
- rank：form 1898 / lemma 2167 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「顾客（复数）」 / lemma「顾客；客户」
- ECDICT：form「n. 客户；顾客（customer的复数）」 / lemma「n. 消费者 [化] 顾客」
- **建议：`keep`**

## troops → troop
- rank：form 1903 / lemma 6773 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「部队；军队（复数）」 / lemma「部队；一群」
- ECDICT：form「n. 军队, 装甲部队, 骑兵队, 部队」 / lemma「n. 军队, 一群, 一队 vi. 群集, 结队, 成群而行」
- **建议：`keep`**

## sobbing → sob
- rank：form 1908 / lemma 12186 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「啜泣；呜咽」 / lemma「啜泣；呜咽」
- ECDICT：form「[医] 呜咽」 / lemma「vi. 啜泣, 呜咽 vt. 哭诉, 哭得使 n. 啜泣, 呜咽」
- **建议：`keep`**

## sports → sport
- rank：form 1920 / lemma 6249 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「运动（复数）」 / lemma「运动；体育」
- ECDICT：form「n. (英)运动会, 运动的, 适用于运动的, 运动会的, 与运动会有关的」 / lemma「n. 运动, 游戏, 娱乐, 消遣, 玩笑 a. 运动的, 户外穿戴的 vi. 游戏, 参加体育运动, 戏弄, 产生变种…」
- **建议：`keep`**

## remembered → remember
- rank：form 1927 / lemma 5934 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「记得；想起（过去式）」 / lemma「记得；想起；记住」
- ECDICT：form「v. 记得, 牢记( remember的过去式和过去分词 ); 纪念; 记着; 回想起」 / lemma「vt. 记得, 回忆起, 记住, 铭记, 纪念 vi. 记得」
- **建议：`keep`**

## wings → wing
- rank：form 1932 / lemma 2253 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「翅膀（复数）」 / lemma「翅膀；侧翼」
- ECDICT：form「n. 舞台两侧, 侧景」 / lemma「n. 翅膀, 翼, 机翼, 派别 vt. 给...装上翼, 飞过, 使飞, 空运, 增加...速度 vi. 飞行」
- **建议：`keep`**

## growling → growl
- rank：form 1933 / lemma 10360 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「低吼；咆哮」 / lemma「咆哮；低吼」
- ECDICT：form「a. 咆哮的, 隆隆响的」 / lemma「n. 吠声, 咆哮声 v. 怒吠, 咆哮, 吼」
- **建议：`keep`**

## thrown → throw
- rank：form 1934 / lemma 5361 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扔；抛（过去分词）」 / lemma「扔；投掷」
- ECDICT：form「throw的过去分词」 / lemma「vt. 投, 掷, 抛, 发射, 摔下, 匆匆穿上(或脱下), 抛弃, 摆脱 vi. 丢, 掷, 抛 n. 投掷, 掷骰…」
- **建议：`keep`**

## exhales → exhale
- rank：form 1936 / lemma 16300 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「呼气；呼出（第三人称单数）」 / lemma「呼出，呼气」
- ECDICT：form「v. 呼出, 发散出( exhale的第三人称单数 ); 吐出（肺中的空气、烟等）, 呼气」 / lemma「v. 呼气, 发出, 散发」
- **建议：`keep`**

## hitting → hit
- rank：form 1941 / lemma 5355 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打；击中」 / lemma「打；击中」
- ECDICT：form「n. 压缩；拉伸；击中」 / lemma「n. 打击, 打, 冲撞, 讽刺 vt. 打, 打击, 碰撞, 打中, 袭击, 偶然碰上 vi. 打, 打中, 打击, …」
- **建议：`keep`**

## studying → study
- rank：form 1943 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「学习；研究」 / lemma「研究；学习；仔细察看」
- ECDICT：form「v. 学习；研究（study的ing形式）」 / lemma「n. 学习, 研究, 学科, 论文, 求学, 书房, 试作 vt. 学习, 读书, 研究, 考虑, 计划 vi. 学习,…」
- **建议：`keep`**

## skills → skill
- rank：form 1951 / lemma 3318 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「技能（复数）」 / lemma「技能；技巧」
- ECDICT：form「n. 技术；技能；技巧（skill的复数形式）」 / lemma「n. 技术, 技巧, 技能, 熟练, 熟练工人 [化] 技能」
- **建议：`keep`**

## setting → set
- rank：form 1959 / lemma 8376 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「环境；背景；设置」 / lemma「放置；规定；一套；一局」
- ECDICT：form「n. 环境, 背景, 布景, 镶嵌, 调整, 沉落, 一副餐具 [计] 设置」 / lemma「n. 日落, 同伙, 组合, 集合, 装置 vt. 放, 安置, 放置, 设定, 使凝结, 点燃, 确定, 点缀, 使就…」
- **建议：`keep`**

## stands → stand
- rank：form 1970 / lemma 2624 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「站立；忍受（第三人称单数）」 / lemma「站立；立场」
- ECDICT：form「n. 看台；架子；货摊（stand的复数）」 / lemma「n. 站立, 站住, 停顿, 讲台, 看台, 立场, 法院证人席 vi. 站, 立, 坐落, 停滞, 位于, 坚持, 维…」
- **建议：`keep`**

## disappointed → disappoint
- rank：form 1975 / lemma 4282 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「失望的；沮丧的」 / lemma「使失望」
- ECDICT：form「a. 失望的」 / lemma「vt. 使失望」
- **建议：`keep`**

## fellas → fella
- rank：form 1981 / lemma 2090 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小伙子们；伙伴们」 / lemma「家伙；小伙子」
- ECDICT：form「n. 伙计们, 小伙子们; <俚>伙伴, 伙计, 小伙子( fella的复数形式 )」 / lemma「n. 小伙子；[俚]伙伴, 伙计」
- **建议：`keep`**

## blowing → blow
- rank：form 1987 / lemma 8034 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吹；刮（现在分词）」 / lemma「吹；刮（风）」
- ECDICT：form「[机] 吹制」 / lemma「n. 吹, 打击, 殴打, 花开 v. 吹, 风吹, 吹响, 开花」
- **建议：`keep`**

## whispering → whisper
- rank：form 1991 / lemma 5949 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「低语；耳语（现在分词）」 / lemma「低语；耳语；私下说」
- ECDICT：form「n. 低语, 私语, 耳语, 流言, 谣言, 沙沙声, 飒飒声 a. 传播流言蜚语的」 / lemma「n. 耳语, 密谈, 谣传, 沙沙声 vi. 耳语, 密谈, 沙沙地响 vt. 低声说」
- **建议：`keep`**

## abandoned → abandon
- rank：form 2004 / lemma 3097 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被遗弃的；废弃的」 / lemma「抛弃；放弃」
- ECDICT：form「a. 被抛弃的, 无约束的, 恣意放荡的」 / lemma「vt. 放弃, 抛弃, 遗弃, 使屈从, 沉溺, 放纵 n. 放任, 无拘束, 狂热」
- **建议：`keep`**

## cutting → cut
- rank：form 2005 / lemma 6243 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「切；割（现在分词）」 / lemma「切；剪」
- ECDICT：form「n. 切断, 切下, 路堑 [化] 切屑」 / lemma「n. 切口, 割伤, 降低, 切, 割, 砍, 削, 伤口, 削减, 缩短, 删节, 通路 a. 经切割的, 缩减的 v…」
- **建议：`keep`**

## barking → bark
- rank：form 2008 / lemma 4479 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吠叫（现在分词）」 / lemma「树皮；吠声」
- ECDICT：form「[机] 去皮, 剥皮」 / lemma「n. 树皮, 吠声 vi. 吠, 叫骂 vt. 喊出, 剥树皮」
- **建议：`keep`**

## embarrassing → embarrass
- rank：form 2012 / lemma 4942 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人尴尬的」 / lemma「使尴尬；使窘迫」
- ECDICT：form「a. 令人为难的, 麻烦的」 / lemma「vt. 使困窘, 使局促不安, 阻碍」
- **建议：`keep`**

## teaching → teach
- rank：form 2034 / lemma 5940 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「教学；教导」 / lemma「教；教授；教导」
- ECDICT：form「n. 教学, 学说, 教导」 / lemma「vt. 教, 讲授, 教导, 教育 vi. 教书, 教学, 可以教」
- **建议：`keep`**

## hurting → hurt
- rank：form 2037 / lemma 6411 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「伤害；疼痛（现在分词）」 / lemma「疼痛；伤害」
- ECDICT：form「v. 弄痛( hurt的现在分词 ); 使受伤; 使伤心; 使受皮肉之苦」 / lemma「n. 伤害, 创伤, 损害 v. 伤害, (使)伤心, 危害, 刺痛」
- **建议：`keep`**

## counting → count
- rank：form 2038 / lemma 8328 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「数数；计算（现在分词）」 / lemma「数；计算」
- ECDICT：form「n. 计算 [医] 计数」 / lemma「vt. 计算, 视为 vi. 计数 n. 计算, 合计, 计数, 伯爵 [计] 计数」
- **建议：`keep`**

## drew → draw
- rank：form 2039 / lemma 5850 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「画；拉（draw的过去式）」 / lemma「拉；拖；吸引；画」
- ECDICT：form「draw的过去式」 / lemma「vi. 拉, 拖, 拔剑 vt. 拖拉, 挨近, 领取, 打成平局, 引导, 抽签决定, 画, 描写, 制订, 草拟, …」
- **建议：`keep`**

## hits → hit
- rank：form 2042 / lemma 5355 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「热门歌曲；点击量」 / lemma「打；击中」
- ECDICT：form「n. 击打；网页点击数；采样数（hit的复数）」 / lemma「n. 打击, 打, 冲撞, 讽刺 vt. 打, 打击, 碰撞, 打中, 袭击, 偶然碰上 vi. 打, 打中, 打击, …」
- **建议：`keep`**

## threatened → threaten
- rank：form 2046 / lemma 3547 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「受到威胁的；濒危的」 / lemma「威胁；恐吓」
- ECDICT：form「a. 受到威胁的 v. 威胁(threaten的过去分词)」 / lemma「vt. 恐吓, 威胁, 预示...的凶兆 vi. 威胁, 恫吓, 可能来临」
- **建议：`keep`**

## mixed → mix
- rank：form 2049 / lemma 2262 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「混合的；混杂的」 / lemma「混合；搅拌」
- ECDICT：form「a. 混合的, 形形色色的, 弄糊涂的 [计] 混合的」 / lemma「n. 混合物, 混乱, 糊涂 vt. 使混合, 弄混, 使结合, 混淆 vi. 相混合, 交往, 参与」
- **建议：`keep`**

## subtitles → subtitle
- rank：form 2052 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「字幕；副标题」 / lemma「副标题；字幕」
- ECDICT：form「n. 说明字幕, 印在外国影片上的对白翻译字幕, 译文对白字幕」 / lemma「n. 副标题」
- **建议：`keep`**

## wins → win
- rank：form 2054 / lemma 2680 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赢；获胜（第三人称单数）」 / lemma「赢；获胜」
- ECDICT：form「abbr. 视窗网际网路名称服务（Windows Internet Name Server）」 / lemma「vt. 赢得, 打胜, 成功 vi. 获胜, 达到, 影响 n. 胜利, 赢, 收益」
- **建议：`keep`**

## chasing → chase
- rank：form 2056 / lemma 6273 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「追逐；追求（现在分词）」 / lemma「追逐；追赶」
- ECDICT：form「[建] 周镂」 / lemma「n. 追求, 狩猎, 追逐 vt. 追捕, 追逐, 雕刻, 在...上镶嵌宝石 vi. 追赶, 奔跑」
- **建议：`keep`**

## approaching → approach
- rank：form 2069 / lemma 8115 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「接近；靠近（现在分词）」 / lemma「接近；靠近；着手处理」
- ECDICT：form「v. 进场；侵入；接近（approach的ing形式）」 / lemma「n. 接近, 入门 vt. 接近, 近似, 找...商量 vi. 靠近」
- **建议：`keep`**

## trusted → trust
- rank：form 2071 / lemma 5562 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「可信的；受信任的」 / lemma「信任；信赖」
- ECDICT：form「a. 可信的；受信任的」 / lemma「n. 信任, 信赖, 相信, 受托, 职责, 信心, 托拉斯 a. 信托的, 托拉斯的 vt. 信赖, 信任, 相信, …」
- **建议：`keep`**

## jumped → jump
- rank：form 2072 / lemma 2632 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跳；跳跃（过去式）」 / lemma「跳；跃升」
- ECDICT：form「v. 跳跃（jump的过去分词）」 / lemma「n. 跳跃, 跳动, 暴涨, 惊跳 vt. 跳跃, 跃过, 突升, 使跳跃 vi. 跳跃, 跳, 跳动, 暴涨 [计] …」
- **建议：`keep`**

## swimming → swim
- rank：form 2079 / lemma 2640 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「游泳（现在分词）」 / lemma「游泳」
- ECDICT：form「n. 游泳, 眩晕」 / lemma「n. 游泳, 漂浮, 潮流, 眩晕 vi. 游泳, 游, 漂浮, 浸, 覆盖, 充溢, 大量拥有, 旋转, 眩晕 vt.…」
- **建议：`keep`**

## bound → bind
- rank：form 2084 / lemma 5214 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「必定的；受约束的」 / lemma「捆绑；束」
- ECDICT：form「n. 跃, 回跳, 范围, 边界 a. 受约束的, 装有封面的, 有义务的, 关联的, 被束缚的, 准备去...的, 便…」 / lemma「vt. 绑, 约束, 装订, 包扎, 使结合 vi. 凝固, 有约束力 [计] 赋值, 绑定」
- **建议：`keep`**

## accused → accuse
- rank：form 2088 / lemma 4864 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「指控；指责（过去式）」 / lemma「指控；指责」
- ECDICT：form「n. 被告」 / lemma「vt. 指责, 控告, 归咎于 vi. 指责, 控告」
- **建议：`keep`**

## guts → gut
- rank：form 2089 / lemma 7863 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「内脏；勇气」 / lemma「肠子；内脏；勇气」
- ECDICT：form「n. 飞碟游戏（比赛双方每组5人, 相距15码, 互相掷接飞碟）；内脏；狭道；[口语]贪食者（gut的复数）」 / lemma「n. 剧情, 内容, 内脏, 肚子, 海峡, 勇气 vt. 取出内脏, 毁坏...的内部」
- **建议：`keep`**

## clicks → click
- rank：form 2097 / lemma 3338 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「点击；咔嗒声（复数）」 / lemma「点击；发出咔嗒声」
- ECDICT：form「n. 点击数；滴答声（click的复数）」 / lemma「n. 咔哒声, 啪嗒声 vi. 作咔哒声 vt. 使发咔哒声 [计] 单击」
- **建议：`keep`**

## impressed → impress
- rank：form 2102 / lemma 3000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「印象深刻的；钦佩的」 / lemma「使印象深刻；使铭记」
- ECDICT：form「a. 外加的；印象深刻的；了不起的；受感动的」 / lemma「n. 印象, 特征, 印记 vt. 使有印象, 印, 铭刻, 传送, 影响, 强征 vi. 给人印象」
- **建议：`keep`**

## rolling → roll
- rank：form 2110 / lemma 6306 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「滚动；翻滚（现在分词）」 / lemma「滚动；翻滚」
- ECDICT：form「a. 旋转的, 波动的, 起伏的 n. 旋转, 轰响, 动摇」 / lemma「n. 卷, 滚动, 名单, 案卷, 压路机 vi. 滚, 滚动, 飘流, 起伏, 卷, 绕 vt. 使滚动, 卷, 绕」
- **建议：`keep`**

## cheating → cheat
- rank：form 2115 / lemma 2285 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「作弊；欺骗（现在分词）」 / lemma「欺骗；作弊」
- ECDICT：form「[经] 行骗」 / lemma「n. 欺骗, 作弊, 骗子 v. 欺骗, 逃脱, 骗取」
- **建议：`keep`**

## frightened → frighten
- rank：form 2121 / lemma 5546 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「害怕的，受惊的」 / lemma「使害怕；吓唬」
- ECDICT：form「a. 受惊吓的, 受惊的, (非正式)害怕...的」 / lemma「vt. 使惊吓 vi. 惊恐」
- **建议：`keep`**

## boots → boot
- rank：form 2135 / lemma 5061 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「靴子（boot 复数）」 / lemma「靴子；长靴」
- ECDICT：form「n. （英）擦靴的仆役；靴子（boot的复数）」 / lemma「n. 长靴, 踢, 解雇, 效用 vt. 使穿靴, 踢, 解雇, 有用 [计] 引导, 自举」
- **建议：`keep`**

## germans → german
- rank：form 2140 / lemma 963 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「德国人（German 复数）」 / lemma「德国的；德国人」
- ECDICT：form「n. 德国人, 德语( German的名词复数 ); [医]德国人; [人名] 杰曼斯」 / lemma「n. 德国人, 德语 a. 德国的, 德国人的, 德国语的, 同父母的」
- **建议：`keep`**

## refused → refuse
- rank：form 2148 / lemma 12500 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拒绝（refuse 过去式）」 / lemma「拒绝」
- ECDICT：form「a. 遭拒绝的」 / lemma「vt. 拒绝, 谢绝 vi. 拒绝 n. 废物 a. 扔掉的, 无用的」
- **建议：`keep`**

## believes → believe
- rank：form 2163 / lemma 5919 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「相信；认为（believe 三单）」 / lemma「相信；认为」
- ECDICT：form「v. 信仰；相信；认为（believe的三单形式）」 / lemma「v. 相信」
- **建议：`keep`**

## embarrassed → embarrass
- rank：form 2165 / lemma 4942 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「尴尬的；难堪的」 / lemma「使尴尬；使窘迫」
- ECDICT：form「a. 尴尬的；窘迫的」 / lemma「vt. 使困窘, 使局促不安, 阻碍」
- **建议：`keep`**

## protecting → protect
- rank：form 2174 / lemma 12100 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「保护（protect 现在分词）」 / lemma「保护」
- ECDICT：form「v. 保护( protect的现在分词 ); 防护; 投保; 关税保护」 / lemma「vt. 防卫, 保护, 警戒 [法] 庇护, 保护, 警戒」
- **建议：`keep`**

## kidnapped → kidnap
- rank：form 2176 / lemma 4515 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「绑架（kidnap 过去式）」 / lemma「绑架」
- ECDICT：form「[电影]历劫孤星」 / lemma「vt. 绑架, 诱拐, 拐骗 [法] 拐带, 诱拐, 绑架」
- **建议：`keep`**

## entered → enter
- rank：form 2183 / lemma 8118 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「进入；输入（enter 过去式）」 / lemma「进入；参加；输入」
- ECDICT：form「a. 进入的」 / lemma「vt. 进入, 参加, 开始, 输入, 回车 vi. 进去, 参加 [计] 输入, 回车」
- **建议：`keep`**

## degrees → degree
- rank：form 2187 / lemma 2305 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「度；度数；学位（degree 复数）」 / lemma「程度；学位；度」
- ECDICT：form「n. 角度, 学历；度数（degree的复数）」 / lemma「n. 程度, 度数, 学位, 度 [医] 度, 程度」
- **建议：`keep`**

## wounded → wound
- rank：form 2201 / lemma 6390 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「受伤的」 / lemma「伤口；创伤」
- ECDICT：form「a. 受伤的 [法] 受伤者; 受伤的, 受了损害的」 / lemma「n. 创伤, 伤口, 伤疤, 伤害, 痛苦 vt. 伤害, 损害, 使受伤 vi. 打伤, 伤害 wind的过去式和过去…」
- **建议：`keep`**

## costs → cost
- rank：form 2232 / lemma 6039 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「费用；成本」 / lemma「成本；费用；代价」
- ECDICT：form「n. 费用；诉讼费；损失（cost的复数）」 / lemma「n. 代价, 价值, 费用 vi. 花费 vt. 使失去, 值, 使花费」
- **建议：`keep`**

## arranged → arrange
- rank：form 2248 / lemma 2255 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「安排；整理」 / lemma「安排；整理」
- ECDICT：form「a. 安排的」 / lemma「v. 安排, 排列, 达成协议 [计] 重排」
- **建议：`keep`**

## suits → suit
- rank：form 2249 / lemma 7770 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「西装；套装」 / lemma「套装；西服」
- ECDICT：form「n. 西服；套装；讼案（suit的复数）」 / lemma「n. 套装, 诉讼, 请求, 起诉, 套, 组 vt. 适合, 使适应 vi. 合适, 相称」
- **建议：`keep`**

## bills → bill
- rank：form 2275 / lemma 8226 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「账单；钞票；法案」 / lemma「账单；法案；钞票」
- ECDICT：form「n. 账单；议案（bill的复数）」 / lemma「n. 帐单, 清单, 钞票, 鸟嘴, 广告, 法案, 票据 vt. 开帐单, (用招贴)宣布」
- **建议：`keep`**

## betrayed → betray
- rank：form 2287 / lemma 3174 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「背叛；出卖」 / lemma「背叛；出卖」
- ECDICT：form「v. 对…不忠( betray的过去式和过去分词 ); 背叛; 出卖; 泄露」 / lemma「vt. 出卖, 背叛, 辜负, 暴露 [法] 出卖, 背叛, 泄漏」
- **建议：`keep`**

## burns → burn
- rank：form 2294 / lemma 7638 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「伯恩斯（姓氏）；烧伤」 / lemma「烧焦」
- ECDICT：form「n. 络腮胡子」 / lemma「vt. 烧, 烧毁, 烧伤 vi. 燃烧, 发热, 烧毁 n. 烧伤, 烙印」
- **建议：`keep`**

## beaten → beat
- rank：form 2300 / lemma 6315 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打败；敲打（beat 过去分词）」 / lemma「击败；敲打」
- ECDICT：form「a. 被打败了的, 筋疲力竭的, 敲平的, 踏平的 beat的过去分词」 / lemma「n. 心跳(声), 打, 敲打声, 拍子 v. 打, 拍打, 打败 a. 疲乏的, 颓废的 beat的过去式 [计] 拍…」
- **建议：`keep`**

## coughing → cough
- rank：form 2307 / lemma 5412 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咳嗽」 / lemma「咳嗽」
- ECDICT：form「v. 咳嗽( cough的现在分词 ); （从喉咙或肺中）咳出; （突然）发出刺耳的噪音」 / lemma「n. 咳嗽 vi. 咳嗽 vt. 咳出」
- **建议：`keep`**

## drawing → draw
- rank：form 2312 / lemma 5850 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「图画；绘画」 / lemma「拉；拖；吸引；画」
- ECDICT：form「n. 图画, 制图, 拉 [计] 绘图」 / lemma「vi. 拉, 拖, 拔剑 vt. 拖拉, 挨近, 领取, 打成平局, 引导, 抽签决定, 画, 描写, 制订, 草拟, …」
- **建议：`keep`**

## touching → touch
- rank：form 2317 / lemma 5346 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「感人的；动人的」 / lemma「触摸；接触」
- ECDICT：form「a. 动人的, 令人同情的」 / lemma「n. 触觉, 碰, 触, 机灵, 轻触, 格调, 少许, 缺点, 弹力 vt. 接触, 触摸, 触及, 使接触, 达到,…」
- **建议：`keep`**

## footsteps → footstep
- rank：form 2326 / lemma 39507 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚步声；足迹（复数）」 / lemma「脚步；足迹」
- ECDICT：form「n. 步距；脚步（footstep的复数形式）」 / lemma「n. 脚步, 脚步声, 足迹」
- **建议：`keep`**

## pretending → pretend
- rank：form 2329 / lemma 2500 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「假装；伪装」 / lemma「假装；自称」
- ECDICT：form「v. 假装；伪装（pretend的现在分词）」 / lemma「v. 假装, 伪称, 自命, 自称」
- **建议：`keep`**

## wore → wear
- rank：form 2352 / lemma 5145 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「穿；戴（wear 过去式）」 / lemma「穿；戴；穿着」
- ECDICT：form「wear的过去式和过去分词」 / lemma「n. 穿着, 戴, 使用, 耗损, 服装, 耐久性 vt. 穿着, 戴, 留(须、发等), 呈现, 磨损, 磨成, 耗损…」
- **建议：`keep`**

## surrounded → surround
- rank：form 2353 / lemma 7456 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「包围；环绕」 / lemma「包围；环绕」
- ECDICT：form「a. 被…环绕着的」 / lemma「vt. 包围, 环绕, 围绕 n. 围绕物」
- **建议：`keep`**

## charged → charge
- rank：form 2360 / lemma 6753 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「充电；指控；收费」 / lemma「冲锋；指控」
- ECDICT：form「a. 充满强烈感情的, 带电的, 气氛紧张的」 / lemma「n. 指控, 费用, 冲锋, 电荷, 炸药, 主管, 被托管人, 命令 vt. 控诉, 加罪于, 使充满, 使充电, 使…」
- **建议：`keep`**

## greetings → greeting
- rank：form 2377 / lemma 7159 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「问候；致意」 / lemma「问候；招呼」
- ECDICT：form「n. 问候; 招呼( greeting的复数形式 ); 问候; 祝贺; 祝词」 / lemma「n. 祝贺, 问候」
- **建议：`keep`**

## teams → team
- rank：form 2390 / lemma 6255 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「团队；队伍」 / lemma「队；团队」
- ECDICT：form「n. 团队, 参赛队伍（team的复数形式）」 / lemma「n. 队, 组 vt. 把马(牛)套在同一辆车上, 把...编成一组 vi. 驾驶卡车, 协作」
- **建议：`keep`**

## whispers → whisper
- rank：form 2392 / lemma 5949 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「低语；耳语」 / lemma「低语；耳语；私下说」
- ECDICT：form「v. 低声说( whisper的第三人称单数 ); 私语; 小声说; 私下说」 / lemma「n. 耳语, 密谈, 谣传, 沙沙声 vi. 耳语, 密谈, 沙沙地响 vt. 低声说」
- **建议：`keep`**

## carlos → carlo
- rank：form 2398 / lemma 5329 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, highfreq-before`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「卡洛斯（人名）」 / lemma「卡洛（男子名）」
- ECDICT：form「n. 卡洛斯（男子名）」 / lemma「n. 卡洛（男子名）」
- **建议：`keep`**

## waves → wave
- rank：form 2406 / lemma 5736 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「波浪；挥手」 / lemma「波浪；挥手」
- ECDICT：form「n. 波（wave的复数形式）」 / lemma「n. 波, 波浪, 波动, 起伏, 高潮, 潮涌, 挥手致意, (气压)突变 vi. 波动, 飘动, 挥手示意, 起伏 …」
- **建议：`keep`**

## related → relate
- rank：form 2415 / lemma 6290 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「相关的；有亲属关系的」 / lemma「关联；讲述」
- ECDICT：form「a. 讲述的, 叙述的；有关系的, 有关联的」 / lemma「vt. 讲, 叙述, 使互相关联 vi. 有关, 符合, 相处得好」
- **建议：`keep`**

## sounded → sound
- rank：form 2421 / lemma 6234 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「听起来；发出声音」 / lemma「声音；响声」
- ECDICT：form「vbl. 听起来」 / lemma「n. 声音, 语音, 吵闹, 声调, 听力范围, 探条, 海峡 a. 健全的, 可靠的, 合理的, 健康的, 彻底的, …」
- **建议：`keep`**

## worries → worry
- rank：form 2426 / lemma 5586 ｜ type `s3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「担心；烦恼」 / lemma「担心；烦恼」
- ECDICT：form「n. 忧虑, 担心；烦恼」 / lemma「n. 担心, 烦恼, 忧虑, 苦恼, 撕咬 vt. 使烦恼, 使焦虑, 使苦恼, 困扰, 折磨, 撕咬 vi. 烦恼, …」
- **建议：`keep`**

## landing → land
- rank：form 2431 / lemma 5661 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「着陆；楼梯平台」 / lemma「陆地；土地」
- ECDICT：form「n. 登陆, 码头, 降落 [经] 上岸, 登陆, 降落」 / lemma「n. 陆地, 地面, 地界, 地产, 国土, 土地 vi. 登陆, 登岸, 到达 vt. 使上岸, 使登陆, 使到达 […」
- **建议：`keep`**

## fields → field
- rank：form 2436 / lemma 5691 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「田野；领域」 / lemma「田地；领域」
- ECDICT：form「n. 域, 字段；场设置（field复数形式）」 / lemma「n. 领域, 田地, 场地, 战场, 场, 域 vt. 使...晒在场上, 使上场 a. 田间的, 野生的, 野外的, …」
- **建议：`keep`**

## recording → record
- rank：form 2437 / lemma 12300 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「录音；记录」 / lemma「记录，记载；录制」
- ECDICT：form「a. 记录的, 记录用的 n. 录音」 / lemma「n. 记录, 履历, 档案, 审判记录, 最高纪录, 唱片 vt. 记录, 记载, 标明, 将...录音 vi. 记录,…」
- **建议：`keep`**

## injured → injure
- rank：form 2443 / lemma 12400 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「受伤的」 / lemma「伤害，损害」
- ECDICT：form「a. 受伤的, 受损害的, 被触怒的 [法] 受害的, 被害的」 / lemma「vt. 伤害, 损害, 使受冤屈 [医] 损伤」
- **建议：`keep`**

## jews → jew
- rank：form 2456 / lemma 3674 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, highfreq-before`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「犹太人（复数）」 / lemma「犹太人」
- ECDICT：form「n. 犹太人, 犹太教（Jew的复数形式）」 / lemma「n. 犹太人, 守财奴, 犹太教信徒 vt. 欺骗, 杀价」
- **建议：`keep`**

## citizens → citizen
- rank：form 2460 / lemma 2701 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「公民（复数）」 / lemma「公民；市民」
- ECDICT：form「n. 市民；公民（citizen的复数）」 / lemma「n. 市民, 公民 [法] 公民, 国民, 市民」
- **建议：`keep`**

## raped → rape
- rank：form 2472 / lemma 15000 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「强奸（rape 的过去式）」 / lemma「掠夺，强夺；油菜」
- ECDICT：form「vbl. 强暴」 / lemma「n. 抢夺, 掠夺, 强奸, 葡萄渣, 芸苔 vt. 掠夺, 抢夺, 强奸」
- **建议：`keep`**

## satisfied → satisfy
- rank：form 2475 / lemma 5538 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「满意的」 / lemma「满足；使满意」
- ECDICT：form「a. 感到满意的」 / lemma「vt. 使满意, 满足, 符合, 使确信, 赔偿 vi. 令人满意, 替人赎罪」
- **建议：`keep`**

## starving → starve
- rank：form 2477 / lemma 4853 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「饥饿的；饿死的」 / lemma「挨饿；饿死」
- ECDICT：form「a. 挨饿的；饥饿的」 / lemma「v. (使)饿死, (使)挨饿」
- **建议：`keep`**

## documents → document
- rank：form 2478 / lemma 3555 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「文件（复数）」 / lemma「文件；文档」
- ECDICT：form「n. 文档（document的复数形式）」 / lemma「n. 文件, 公文, 文档 vt. 证明, 为...引证 [计] 文档」
- **建议：`keep`**

## banks → bank
- rank：form 2483 / lemma 8199 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「银行（复数）；河岸」 / lemma「银行；岸；库」
- ECDICT：form「n. 银行；斜床；岸, 堤（bank的复数形式）」 / lemma「n. 银行, 堤, 岸 [医] 库」
- **建议：`keep`**

## timing → time
- rank：form 2485 / lemma 1070 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「时机；计时」 / lemma「时间；次数；计时」
- ECDICT：form「n. 时间选择, 时间测定, 定时, 调速 [计] 定时器时钟」 / lemma「n. 时间, 时侯, 时机, 时期, 期限, 次数, 节拍, 暂停, 规定时间 vt. 测定...的时间, 记录...的…」
- **建议：`?`**

## stones → stone
- rank：form 2486 / lemma 4842 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「石头（复数）」 / lemma「石头；果核；宝石」
- ECDICT：form「n. 小石头；石子（stone的复数）」 / lemma「n. 石头, 宝石, 果核, 纪念碑, 结石 vt. 投扔石子, 铺石头 a. 石的, 石制的, 完全的」
- **建议：`keep`**

## frozen → freeze
- rank：form 2488 / lemma 8031 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「冰冻的；冻结的」 / lemma「结冰；冻住；冻结」
- ECDICT：form「a. 冻结的, 冰冷的, 严寒的, 冻伤的, 冷酷的 freeze的过去分词」 / lemma「vi. 冻结, 冷冻, 僵硬, 楞住 vt. 使结冰, 使冻住, 使呆住 n. 结冰, 凝固 [计] 冻结」
- **建议：`keep`**

## determined → determine
- rank：form 2501 / lemma 3592 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「坚定的；坚决的」 / lemma「决定；确定」
- ECDICT：form「a. 坚决的, 已下决心的」 / lemma「v. 决定, 决心」
- **建议：`keep`**

## blown → blow
- rank：form 2502 / lemma 8034 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吹（blow 的过去分词）」 / lemma「吹；刮（风）」
- ECDICT：form「a. 吹制的, 喘气的, 开着花的 blow的过去分词」 / lemma「n. 吹, 打击, 殴打, 花开 v. 吹, 风吹, 吹响, 开花」
- **建议：`keep`**

## cleared → clear
- rank：form 2505 / lemma 8070 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「清除（clear 的过去式）」 / lemma「晴朗的；清晰的；透明的」
- ECDICT：form「v. 使干净；清除（clear的过去分词）」 / lemma「a. 清楚的, 明确的, 澄清的 adv. 清晰地 vt. 澄清, 清除障碍 vi. 放晴, 变清澈 n. 空隙 [计]…」
- **建议：`keep`**

## cigarettes → cigarette
- rank：form 2512 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「香烟（复数）」 / lemma「香烟」
- ECDICT：form「n. 纸烟, 香烟( cigarette的复数形式 )」 / lemma「n. 香烟, 纸烟」
- **建议：`keep`**

## wounds → wound
- rank：form 2521 / lemma 6390 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「伤口；创伤」 / lemma「伤口；创伤」
- ECDICT：form「n. 枪伤, 伤处（wound复数）」 / lemma「n. 创伤, 伤口, 伤疤, 伤害, 痛苦 vt. 伤害, 损害, 使受伤 vi. 打伤, 伤害 wind的过去式和过去…」
- **建议：`keep`**

## drank → drink
- rank：form 2525 / lemma 4812 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喝（drink 过去式）」 / lemma「喝；饮酒；饮料」
- ECDICT：form「drink的过去式」 / lemma「n. 饮料, 酒 v. 喝, 喝酒」
- **建议：`keep`**

## owns → own
- rank：form 2533 / lemma 6063 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拥有（第三人称单数）」 / lemma「拥有；占有」
- ECDICT：form「n. 属于自己的东西（own的复数）」 / lemma「n. 自己的 a. 自己的, 嫡亲的, 同胞的 vt. 拥有, 支配, 自认, 承认, 顺从于 vi. 承认, 供认」
- **建议：`keep`**

## boxes → box
- rank：form 2534 / lemma 4947 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「盒子；箱子（复数）」 / lemma「盒子；箱」
- ECDICT：form「n. 小木箱, 盒子」 / lemma「n. 盒子, 箱, 方框, 一巴掌 vt. 装...入盒中, 装箱, 打耳光 vi. 拳击 [计] 方框」
- **建议：`keep`**

## developed → develop
- rank：form 2536 / lemma 3453 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发展；开发（过去式）」 / lemma「发展；开发」
- ECDICT：form「a. 发达的（国家或地区）；成熟的」 / lemma「vt. 发展, 使发达, 进步, 洗印, 显影 vi. 发展, 生长」
- **建议：`keep`**

## dropping → drop
- rank：form 2544 / lemma 5880 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「掉落；下降（现在分词）」 / lemma「落下；掉下；下降」
- ECDICT：form「n. 点滴, 滴下, 落下 [医] 跛行步态」 / lemma「n. 滴, 微量, 落下, 空投 vi. 放下, 掉下, 下降 vt. 使滴下, 放下, 丢失, 遗漏 [计] 投入, …」
- **建议：`keep`**

## testing → test
- rank：form 2563 / lemma 8322 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「测试；检验」 / lemma「测验；考试」
- ECDICT：form「n. 测试 a. 吃力的, 试验的」 / lemma「n. 测试, 试验, 化验, 检验, 考验, 甲壳 vt. 测试, 试验, 化验 vi. 接受测验, 进行测试」
- **建议：`keep`**

## figures → figure
- rank：form 2571 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「数字；人物（复数）」 / lemma「形状，图形；数字；人物」
- ECDICT：form「n. 图形, 图表；价格, 金额, 数字；规定动作；人物（figure的复数）」 / lemma「n. 数字, 价格, 图形, 形状 vt. 描绘, 表示, 演算, 认为 vi. 计算, 出现, 估计」
- **建议：`keep`**

## landed → land
- rank：form 2575 / lemma 5661 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「着陆；登陆（过去式）」 / lemma「陆地；土地」
- ECDICT：form「a. 拥有土地的, 有田地的 [法] 不动产的, 拥有土地的, 地皮的」 / lemma「n. 陆地, 地面, 地界, 地产, 国土, 土地 vi. 登陆, 登岸, 到达 vt. 使上岸, 使登陆, 使到达 […」
- **建议：`keep`**

## buzzing → buzz
- rank：form 2576 / lemma 3058 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗡嗡叫（现在分词）」 / lemma「嗡嗡声；嘈杂」
- ECDICT：form「a. 嗡嗡响的, 营营响的 [电] 发蜂音」 / lemma「n. 嗡嗡声, 流言 vi. 发出嗡嗡声, 说闲话 vt. 使嗡嗡叫, 散布」
- **建议：`keep`**

## annoying → annoy
- rank：form 2579 / lemma 8275 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「烦人的；讨厌的」 / lemma「使恼怒；打扰」
- ECDICT：form「a. 恼人的, 讨厌的」 / lemma「vt. 使恼怒, 骚扰」
- **建议：`keep`**

## earned → earn
- rank：form 2612 / lemma 6009 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赚得；赢得（过去式）」 / lemma「赚得；挣得；赢得」
- ECDICT：form「a. 挣得的」 / lemma「vt. 赚得, 获得, 博得 [计] 欧州科学研究网」
- **建议：`keep`**

## instructions → instruction
- rank：form 2622 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「指示；说明（复数）」 / lemma「指示；说明；教导」
- ECDICT：form「n. 指令；说明（instruction的复数形式）」 / lemma「n. 指令, 教导, 命令 [计] 指令」
- **建议：`keep`**

## worrying → worry
- rank：form 2624 / lemma 5586 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人担忧的」 / lemma「担心；烦恼」
- ECDICT：form「a. 使人烦恼的, 忧虑重重的」 / lemma「n. 担心, 烦恼, 忧虑, 苦恼, 撕咬 vt. 使烦恼, 使焦虑, 使苦恼, 困扰, 折磨, 撕咬 vi. 烦恼, …」
- **建议：`keep`**

## lessons → lesson
- rank：form 2638 / lemma 8256 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「课；教训（复数）」 / lemma「课；教训」
- ECDICT：form「n. 功课( lesson的名词复数 ); 课程; 教训; 一堂课」 / lemma「n. 课, 课业, 教训」
- **建议：`keep`**

## sets → set
- rank：form 2640 / lemma 8376 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「套；集合（复数）」 / lemma「放置；规定；一套；一局」
- ECDICT：form「n. 集合, 设置（set的复数）」 / lemma「n. 日落, 同伙, 组合, 集合, 装置 vt. 放, 安置, 放置, 设定, 使凝结, 点燃, 确定, 点缀, 使就…」
- **建议：`keep`**

## classes → class
- rank：form 2650 / lemma 6195 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「班级；课程（复数）」 / lemma「班级；课堂」
- ECDICT：form「n. 级别, 阶级（class复数形式）」 / lemma「n. 班级, 阶级, 种类, 课 vt. 分类 [计] 类别; 类; 种类; 类程」
- **建议：`keep`**

## flies → fly
- rank：form 2658 / lemma 5739 ｜ type `s3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「苍蝇（复数）」 / lemma「飞；飞行；乘飞机」
- ECDICT：form「n. 裤子前面的开口」 / lemma「n. 苍蝇, 两翼昆虫, 飞行 vi. 飞, 飞翔, 飘扬, 逃走 vt. 飞, 飞越, 使飘扬, 逃出 a. 敏捷的」
- **建议：`keep`**

## hid → hide
- rank：form 2661 / lemma 5196 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「隐藏（过去式）」 / lemma「兽皮；皮革」
- ECDICT：form「hide的过去式和过去分词」 / lemma「n. 兽皮, 迹象, 躲藏处 vt. 藏, 隐瞒, 遮避, 剥...的皮, 隐藏 vi. 躲藏 [计] 隐藏」
- **建议：`keep`**

## wailing → wail
- rank：form 2662 / lemma 13168 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「哀号；恸哭（现在分词）」 / lemma「哀号；恸哭」
- ECDICT：form「v. 哭叫, 哀号( wail的现在分词 ); 沱」 / lemma「n. 恸哭, 哀号, 嚎啕, 呼啸(声) vi. 恸哭, 呼啸, 悲叹, 哀号, 嚎啕」
- **建议：`keep`**

## listened → listen
- rank：form 2663 / lemma 5952 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「听（过去式）」 / lemma「听；倾听；听从」
- ECDICT：form「v. 倾听( listen的过去式和过去分词 ); 留心听; 听信; （让对方注意）听着」 / lemma「vi. 听, 倾听, 听从 n. 听, 倾听」
- **建议：`keep`**

## rats → rat
- rank：form 2666 / lemma 4242 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「老鼠（复数）」 / lemma「大鼠」
- ECDICT：form「int. [俚]胡说；瞎扯」 / lemma「n. 鼠, 卑鄙的人, 破坏者, 变节者 vi. 捕鼠, 变节 vt. 弄蓬松」
- **建议：`keep`**

## wondered → wonder
- rank：form 2667 / lemma 5928 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「想知道；惊奇（过去式）」 / lemma「想知道；纳闷」
- ECDICT：form「vt. 对…感到好奇（wonder的过去式与过去分词形式）」 / lemma「n. 奇迹, 惊奇, 惊愕 vt. 惊奇, 想知道 vi. 惊讶, 怀疑」
- **建议：`keep`**

## holds → hold
- rank：form 2676 / lemma 5349 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拿着；举行（三单）」 / lemma「拿；握住」
- ECDICT：form「v. 保存；把握（hold的第三人称单数）」 / lemma「n. 把握, 把持力, 柄, 控制, 掌握, 监禁 vt. 保存, 握住, 拿住, 占据, 持有, 拥有 vi. 支持,…」
- **建议：`keep`**

## flew → fly
- rank：form 2677 / lemma 5739 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「飞（过去式）」 / lemma「飞；飞行；乘飞机」
- ECDICT：form「fly的过去式」 / lemma「n. 苍蝇, 两翼昆虫, 飞行 vi. 飞, 飞翔, 飘扬, 逃走 vt. 飞, 飞越, 使飘扬, 逃出 a. 敏捷的」
- **建议：`keep`**

## dishes → dish
- rank：form 2681 / lemma 4854 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「菜肴；盘子」 / lemma「盘；菜肴；碟」
- ECDICT：form「n. 餐具」 / lemma「n. 盘子, 碟, 菜肴 [医] 皿, 碟」
- **建议：`keep`**

## screeching → screech
- rank：form 2686 / lemma 4256 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫；发出刺耳声」 / lemma「尖叫；发出刺耳声」
- ECDICT：form「v. 发出尖叫声( screech的现在分词 ); 发出粗而刺耳的声音; 高叫」 / lemma「n. 尖声喊叫, 尖叫声, 煞车声 vt. 尖声讲 vi. 发出尖声」
- **建议：`keep`**

## moaning → moan
- rank：form 2690 / lemma 9755 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呻吟；抱怨」 / lemma「呻吟；抱怨」
- ECDICT：form「v. 呻吟, 悲叹( moan的现在分词 ); 抱怨; 发出萧萧声」 / lemma「n. 呻吟, 悲叹 vi. 呻吟, 抱怨, 悲叹 vt. 呻吟着说」
- **建议：`keep`**

## clouds → cloud
- rank：form 2696 / lemma 5595 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「云（复数）」 / lemma「云；云状物」
- ECDICT：form「n. 云彩, 白云（cloud复数形式）」 / lemma「n. 云, 阴暗, 烟雾, 疑团 vt. 以云遮敝, 笼罩, 使黯然 vi. 乌云密布, 阴沉」
- **建议：`keep`**

## slipped → slip
- rank：form 2697 / lemma 5751 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滑倒；溜走（过去式）」 / lemma「滑倒；溜走；滑落」
- ECDICT：form「a. 打滑的」 / lemma「n. 滑, 滑行, 事故, 溜, 差错, 滑台, 下降, 插条, 后裔, 板条, 瘦长的年轻人 vi. 滑动, 滑倒, …」
- **建议：`keep`**

## pays → pay
- rank：form 2718 / lemma 6015 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「支付；值得」 / lemma「支付；付款；给予」
- ECDICT：form「n. 报酬（pay的复数）；（法）国家」 / lemma「n. 薪资, 付款, 补偿 vt. 支付, 付清, 补偿, 偿还, 对...有利, 为...涂防水物 vi. 付款, 付…」
- **建议：`keep`**

## gambling → gamble
- rank：form 2739 / lemma 4487 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赌博」 / lemma「赌博；冒险」
- ECDICT：form「n. 赌博」 / lemma「n. 赌博, 冒险 v. 赌博, 孤注一掷」
- **建议：`keep`**

## tastes → taste
- rank：form 2753 / lemma 7680 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「味道；品味」 / lemma「品尝」
- ECDICT：form「n. 体验( taste的名词复数 ); 滋味; 味觉; 风味 v. 尝, 品尝, 尝到( taste的第三人称单数 )…」 / lemma「n. 味道, 品味, 味觉, 感受, 体验, 爱好, 审美, 少量 vt. 尝, 察觉...的味道, 体会 vi. 品尝…」
- **建议：`keep`**

## cared → care
- rank：form 2754 / lemma 5421 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「关心；在乎（过去式）」 / lemma「关心；在乎」
- ECDICT：form「v. 关心( care的过去式和过去分词 ); 担心; 在乎; 介意」 / lemma「n. 小心, 照料, 忧虑 vi. 关心, 介意 vt. 在意, 喜欢」
- **建议：`keep`**

## whirring → whir
- rank：form 2757 / lemma 34212 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呼呼作响」 / lemma「呼呼声；嗡嗡声」
- ECDICT：form「v. 呼呼作声地飞（或转）, 作呼呼声( whir的现在分词 ); 使呼呼地飞（或转）, 呼地一声把…带走; 呼呼声( …」 / lemma「n. 呼呼声, 飕飕声 vi. 作呼呼声, 发飕飕声 vt. 使呼呼响」
- **建议：`keep`**

## grabbed → grab
- rank：form 2760 / lemma 5892 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抓住；抢夺（过去式）」 / lemma「抓住；抢夺；攫取」
- ECDICT：form「v. 攫取；捕获；强夺；匆忙地做（grab的过去分词形式）」 / lemma「n. 抓握, 掠夺, 强占, 东方沿岸帆船 vi. 抓取, 抢去 vt. 攫取, 捕获, 霸占」
- **建议：`keep`**

## wheels → wheel
- rank：form 2763 / lemma 8127 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轮子（复数）；车轮」 / lemma「转动；推动；盘旋」
- ECDICT：form「n. 旋转；车轮（wheel的复数）」 / lemma「n. 轮子, 车轮, 轮, 方向盘, 旋转, 机构, 重要人物 vt. 使旋转, 转动, 使转向 vi. 旋转, 转弯,…」
- **建议：`keep`**

## beats → beat
- rank：form 2770 / lemma 6315 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打；跳动（第三人称单数）」 / lemma「击败；敲打」
- ECDICT：form「n. 音乐节拍；差拍振动；心脏跳动（beat的复数）」 / lemma「n. 心跳(声), 打, 敲打声, 拍子 v. 打, 拍打, 打败 a. 疲乏的, 颓废的 beat的过去式 [计] 拍…」
- **建议：`keep`**

## threatening → threaten
- rank：form 2772 / lemma 3547 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「威胁的；危险的」 / lemma「威胁；恐吓」
- ECDICT：form「a. 胁迫的, 危险的 [法] 威胁的, 恐吓的, 危险的」 / lemma「vt. 恐吓, 威胁, 预示...的凶兆 vi. 威胁, 恫吓, 可能来临」
- **建议：`keep`**

## shared → share
- rank：form 2778 / lemma 6078 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「分享；共有（过去式）」 / lemma「股份；份额；一份」
- ECDICT：form「a. 共享的」 / lemma「n. 部分, 参与, 一份, 参股, 份额 vt. 均分, 分担, 分享, 分配, 共有 vi. 分享 [计] 共享; …」
- **建议：`keep`**

## consequences → consequence
- rank：form 2780 / lemma 3000 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「后果；结果（复数）」 / lemma「后果；重要性」
- ECDICT：form「n. 重要（性）( consequence的复数形式 ); 结果; 重要地位; 因果关系」 / lemma「n. 结果, 重要性 [法] 结果, 后果, 推断」
- **建议：`keep`**

## schools → school
- rank：form 2782 / lemma 6192 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「学校（复数）」 / lemma「学校」
- ECDICT：form「n. 学校（school的复数形式）」 / lemma「n. 学校, 鱼群, 门派, 学派 vt. 教育, 训练, 培养 vi. 成群地游」
- **建议：`keep`**

## studies → study
- rank：form 2788 / lemma 12000 ｜ type `s3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「学习；研究（第三人称单数）」 / lemma「研究；学习；仔细察看」
- ECDICT：form「n. 研究；学习；学业（study的复数）」 / lemma「n. 学习, 研究, 学科, 论文, 求学, 书房, 试作 vt. 学习, 读书, 研究, 考虑, 计划 vi. 学习,…」
- **建议：`keep`**

## protected → protect
- rank：form 2790 / lemma 12100 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「保护（过去式/过去分词）」 / lemma「保护」
- ECDICT：form「a. 受保护的」 / lemma「vt. 防卫, 保护, 警戒 [法] 庇护, 保护, 警戒」
- **建议：`keep`**

## punished → punish
- rank：form 2793 / lemma 2909 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「惩罚（过去式/过去分词）」 / lemma「惩罚；处罚」
- ECDICT：form「未受处罚的」 / lemma「vt. 处罚, 惩罚, 严厉对待 vi. 惩罚」
- **建议：`keep`**

## fascinating → fascinate
- rank：form 2795 / lemma 29412 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「迷人的；极有趣的」 / lemma「使着迷；吸引」
- ECDICT：form「a. 迷人的, 吸引人的, 使人神魂颠倒的」 / lemma「vt. 令人入神, 使着迷 vi. 入迷」
- **建议：`keep`**

## exhausted → exhaust
- rank：form 2802 / lemma 10115 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「精疲力竭的」 / lemma「使精疲力尽；耗尽」
- ECDICT：form「a. 耗尽的；疲惫的」 / lemma「n. 排气, 排气装置, 废气 vt. 抽完, 用尽, 耗尽, 使精疲力尽 vi. 排气」
- **建议：`keep`**

## emotions → emotion
- rank：form 2818 / lemma 3669 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「情感；情绪（复数）」 / lemma「情感；情绪」
- ECDICT：form「n. 情绪；情感（emotion的复数形式）」 / lemma「n. 情绪, 激动, 强烈的情感 [医] 情绪, 情感」
- **建议：`keep`**

## deeper → deep
- rank：form 2827 / lemma 6204 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更深的」 / lemma「深的；深刻的」
- ECDICT：form「a. 更深」 / lemma「a. 深的 adv. 深入地 n. 深渊, 深处」
- **建议：`keep`**

## kicking → kick
- rank：form 2829 / lemma 5358 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「踢（现在分词）」 / lemma「踢；踹」
- ECDICT：form「n. 踢腿；反撞」 / lemma「n. 踢, 反冲, 后座力, 凹底 vi. 踢, 反抗, 反冲 vt. 踢, 反冲」
- **建议：`keep`**

## teachers → teacher
- rank：form 2836 / lemma 8250 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「教师（复数）」 / lemma「老师；教师」
- ECDICT：form「n. 教师（teacher的复数形式）」 / lemma「n. 教师, 老师, 导师」
- **建议：`keep`**

## dragged → drag
- rank：form 2839 / lemma 5853 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拖；拉（过去式/过去分词）」 / lemma「拖；拉；拽」
- ECDICT：form「v. 制动；拖动；打滑；松懈」 / lemma「n. 拖, 拖累 v. 拖累, 拖拉, 沉重缓慢地走, 拖动 [计] 拖动」
- **建议：`keep`**

## compared → compare
- rank：form 2843 / lemma 3723 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「比较（compare的过去式）」 / lemma「比较；对比」
- ECDICT：form「a. 比较的, 对照的（compare的过去式和过去分词）」 / lemma「vt. 比较, 比喻, 对照 vi. 相比 n. 比较 [计] 比较」
- **建议：`keep`**

## suspects → suspect
- rank：form 2872 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「嫌疑人（suspect的复数）」 / lemma「怀疑，猜想」
- ECDICT：form「v. 猜疑（是）( suspect的第三人称单数 ); 怀疑; 不信任; 怀疑…有罪」 / lemma「n. 被怀疑者, 嫌疑犯 a. 令人怀疑的, 不可信的, 可疑的 v. 怀疑, 猜想」
- **建议：`keep`**

## tools → tool
- rank：form 2874 / lemma 8334 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工具（tool的复数）」 / lemma「工具」
- ECDICT：form「n. 工具, 工具菜单；工具箱（tool的复数形式）」 / lemma「n. 工具, 机床, 傀儡 vt. 用工具加工 vi. 使用工具」
- **建议：`keep`**

## driven → drive
- rank：form 2875 / lemma 5742 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有干劲的；被驱动的」 / lemma「驾驶；开车；驱动」
- ECDICT：form「a. 有紧迫感的 drive的过去分词」 / lemma「n. 驾车, 快车道, 推进力, 驱动, 动力, 击球, 驱动器 vt. 开车, 驱使, 推动, 驾驶 vi. 开车, …」
- **建议：`keep`**

## humming → hum
- rank：form 2887 / lemma 6535 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哼唱；嗡嗡作响」 / lemma「哼唱；发出嗡嗡声」
- ECDICT：form「a. 发嗡嗡声的, 哼着唱的, 精力旺盛的, 热气腾腾的, (酒)起泡的 [电] 交流声」 / lemma「n. 嗡嗡声, 哼声, 杂声 vi. 发低哼声 vt. 哼, 用哼声表示 interj. 哼, 嗯」
- **建议：`keep`**

## drives → drive
- rank：form 2889 / lemma 5742 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「驾驶（drive的第三人称单数）」 / lemma「驾驶；开车；驱动」
- ECDICT：form「n. 驱动器；驱动力；驱动程序（drive的复数形式）」 / lemma「n. 驾车, 快车道, 推进力, 驱动, 动力, 击球, 驱动器 vt. 开车, 驱使, 推动, 驾驶 vi. 开车, …」
- **建议：`keep`**

## painted → paint
- rank：form 2896 / lemma 8301 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「画；涂（paint的过去式）」 / lemma「颜料；油漆」
- ECDICT：form「a. 描画的, 着色的, 刷上油漆的, 涂脂抹粉的, 矫揉造作的」 / lemma「n. 油漆, 颜料, 绘画作品, 涂漆 vt. 油漆, 绘, 画, 描绘, 装饰, 点缀 vi. 绘画, 涂漆」
- **建议：`keep`**

## guessing → guess
- rank：form 2900 / lemma 5925 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「猜测；猜想」 / lemma「猜测；认为」
- ECDICT：form「v. 猜( guess的现在分词 ); （引出令人惊奇或激动的事）你猜; 猜对; 猜中」 / lemma「n. 猜测, 臆测 v. 猜测, 臆测」
- **建议：`keep`**

## dressing → dress
- rank：form 2905 / lemma 5148 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「调料；敷料；穿衣」 / lemma「穿衣；打扮」
- ECDICT：form「n. 调味品, 穿衣, 化妆 [化] 追肥」 / lemma「n. 服装, 覆盖物 vi. 穿着 vt. 给...穿衣, 整理」
- **建议：`keep`**

## attached → attach
- rank：form 2906 / lemma 8654 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「附加的；依恋的」 / lemma「附上；连接；重视」
- ECDICT：form「a. 附加的；依恋的, 充满爱心的」 / lemma「vt. 附上, 使依附, 使附属, 使喜爱, 系, 缚 vi. 附属, 归属, 联系在一起 [计] 挂接服务器命令, 关…」
- **建议：`keep`**

## required → require
- rank：form 2912 / lemma 3200 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「需要；要求（require的过去式）」 / lemma「需要；要求」
- ECDICT：form「a. 必需的」 / lemma「vt. 需要, 命令, 要求 [法] 需要, 要求, 命令」
- **建议：`keep`**

## twins → twin
- rank：form 2914 / lemma 3715 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「双胞胎（twin的复数）」 / lemma「双胞胎之一；孪生的」
- ECDICT：form「n. 双子座, 双子宫」 / lemma「n. 双胞胎中一人, 一对非常相像的人(或物)中的一个 a. 双胞胎的, 成对的, 孪生的 vi. 生双胞胎, 成对 v…」
- **建议：`keep`**

## cooked → cook
- rank：form 2916 / lemma 4866 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烹饪（cook的过去式）」 / lemma「烹调；煮；厨师」
- ECDICT：form「a. 精疲力竭的, 被揍得昏厥的, 未达到目的就完蛋的, 喝醉了的」 / lemma「n. 厨子, 厨师 vt. 烹调, 煮饭, 加热 vi. 在煮着」
- **建议：`keep`**

## stabbed → stab
- rank：form 2922 / lemma 3512 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刺；戳（stab的过去式）」 / lemma「刺；戳」
- ECDICT：form「v. 刺穿；刺伤（stab的过去式和过去分词）」 / lemma「n. 刺, 戳, 剧痛, 尝试, 努力 vt. 刺, 戳, 刺入, 刺痛, 直入, 使伤心 vi. 刺, 刺伤」
- **建议：`keep`**

## sharing → share
- rank：form 2928 / lemma 6078 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「分享；共享（share的现在分词）」 / lemma「股份；份额；一份」
- ECDICT：form「[计] 共享, 公用」 / lemma「n. 部分, 参与, 一份, 参股, 份额 vt. 均分, 分担, 分享, 分配, 共有 vi. 分享 [计] 共享; …」
- **建议：`keep`**

## nerves → nerve
- rank：form 2939 / lemma 7878 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「神经；紧张（nerve的复数）」 / lemma「神经；勇气；胆量」
- ECDICT：form「n. 神经质, 神经紧张」 / lemma「n. 精神, 勇气, 叶脉, 神经 vt. 鼓起勇气」
- **建议：`keep`**

## relatives → relative
- rank：form 2942 / lemma 3497 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「亲戚；亲属（relative的复数）」 / lemma「亲戚；相对的」
- ECDICT：form「n. 亲属；[语法学]关系词（relative的复数）」 / lemma「n. 亲戚, 关系词 a. 有关系的, 相对的, 比较的」
- **建议：`keep`**

## gloves → glove
- rank：form 2943 / lemma 5073 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手套（glove的复数）」 / lemma「手套；分指手套」
- ECDICT：form「n. 手套（glove的复数）」 / lemma「n. 手套 vt. 给...戴手套」
- **建议：`keep`**

## separated → separate
- rank：form 2948 / lemma 6200 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「分开；分离（separate的过去式）」 / lemma「分开，分离；隔开」
- ECDICT：form「a. 分居；分开的；不在一起生活的」 / lemma「n. 独立件, 抽印本 a. 分开的, 各别的, 单独的, 分隔的 vi. 分开, 隔开, 分居 vt. 使分离, 使分…」
- **建议：`keep`**

## plates → plate
- rank：form 2961 / lemma 4938 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「盘子；板（plate的复数）」 / lemma「盘子；板」
- ECDICT：form「n. 板材；平板；盘子（plate的复数）」 / lemma「n. 碟, 盘子, 盆中物, 金属板, 图版, 金银餐具, 印版, 金属牌(照) vt. 镀金, 电镀, 用金属板固定,…」
- **建议：`keep`**

## shoulders → shoulder
- rank：form 2962 / lemma 5274 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「肩膀（shoulder的复数）」 / lemma「肩膀」
- ECDICT：form「n. 肩部；肩膀（shoulder的复数）」 / lemma「n. 肩, 肩膀, 衣肩 vt. 肩负, 负担, 担任 vi. 用肩推挤」
- **建议：`keep`**

## burnt → burn
- rank：form 2963 / lemma 7638 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烧焦的；烧伤的」 / lemma「烧焦」
- ECDICT：form「burn的过去式和过去分词」 / lemma「vt. 烧, 烧毁, 烧伤 vi. 燃烧, 发热, 烧毁 n. 烧伤, 烙印」
- **建议：`keep`**

## recorded → record
- rank：form 2964 / lemma 12300 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「记录；录音（record的过去式）」 / lemma「记录，记载；录制」
- ECDICT：form「a. 记录的」 / lemma「n. 记录, 履历, 档案, 审判记录, 最高纪录, 唱片 vt. 记录, 记载, 标明, 将...录音 vi. 记录,…」
- **建议：`keep`**

## counts → count
- rank：form 2966 / lemma 8328 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「数；计算；重要（count的第三人称单数）」 / lemma「数；计算」
- ECDICT：form「n. 计数, 支数（count的复数形式）」 / lemma「vt. 计算, 视为 vi. 计数 n. 计算, 合计, 计数, 伯爵 [计] 计数」
- **建议：`keep`**

## visitors → visitor
- rank：form 2971 / lemma 3643 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「访客；游客（visitor的复数）」 / lemma「访问者；游客」
- ECDICT：form「n. 访问者, 游客（visitor 复数）」 / lemma「n. 参观者, 游客, 访客 [法] 视察人, 检视人, 检查员」
- **建议：`keep`**

## fights → fight
- rank：form 2986 / lemma 6318 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打架；战斗（fight的第三人称单数）」 / lemma「打架；战斗」
- ECDICT：form「v. 战斗( fight的第三人称单数 ); 斗争; 打架; 吵架」 / lemma「n. 打架, 争吵, 斗志 v. 对抗, 打架」
- **建议：`keep`**

## indians → indian
- rank：form 2987 / lemma 1560 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「印度人；印第安人（Indian的复数）」 / lemma「印度的；印第安人的」
- ECDICT：form「n. 印第安人；印度人（Indian的复数）」 / lemma「n. 印度人, 印第安人, 印第安语 a. 印度的, 印度群岛的, 印第安语的」
- **建议：`keep`**

## growls → growl
- rank：form 2989 / lemma 10360 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咆哮；低吼（growl的第三人称单数）」 / lemma「咆哮；低吼」
- ECDICT：form「v. （动物）发狺狺声, （雷）作隆隆声( growl的第三人称单数 ); 低声咆哮着说」 / lemma「n. 吠声, 咆哮声 v. 怒吠, 咆哮, 吼」
- **建议：`keep`**

## occurred → occur
- rank：form 2997 / lemma 4645 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发生（occur的过去式）」 / lemma「发生；出现」
- ECDICT：form「v. 发生（occur的过去分词）」 / lemma「vi. 发生, 被想到, 存在」
- **建议：`keep`**

## beans → bean
- rank：form 2998 / lemma 4314 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「豆；豆类（bean的复数）」 / lemma「豆；豆荚；豆类植物」
- ECDICT：form「n. 豆子；豆类；黄豆（bean的复数）」 / lemma「n. 豆子 [化] 油嘴; 豆」
- **建议：`keep`**

## pages → page
- rank：form 2999 / lemma 8247 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「页；页面（page的复数）」 / lemma「页；页面」
- ECDICT：form「n. 页数；青年侍从（page的复数）」 / lemma「n. 页, 记录, 事件, 专栏, 男侍 vt. 标明...的页数, 翻...的书页, 分页排版, 呼叫, 侍候 vi.…」
- **建议：`keep`**

## catching → catch
- rank：form 3004 / lemma 5364 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「传染性的；有感染力的」 / lemma「抓住；接住」
- ECDICT：form「a. 易传染的, 有魅力的, 吸引人的」 / lemma「n. 捕捉, 陷阱, 捕捉之物, 抓, 拉手 vt. 捕捉, 赶上, 感染, 听清楚 vi. 抓住, 燃着」
- **建议：`keep`**

## buildings → building
- rank：form 3013 / lemma 7704 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「建筑物（复数）」 / lemma「建筑物；楼房」
- ECDICT：form「n. 建筑物（building的复数）」 / lemma「n. 建筑物, 建筑 [法] 营造, 建筑, 建筑物」
- **建议：`keep`**

## shaking → shake
- rank：form 3014 / lemma 5382 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摇动；颤抖」 / lemma「摇动；抖动」
- ECDICT：form「n. 摇动, 挥动 [医] 震动法(一种按摩法); 摇动, 振荡」 / lemma「n. 摇动, 震动 vt. 摇动, 动摇, 使震动, 挥舞 vi. 震动, 发抖, 动摇」
- **建议：`keep`**

## drawn → draw
- rank：form 3019 / lemma 5850 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「画；拉（draw 过去分词）」 / lemma「拉；拖；吸引；画」
- ECDICT：form「a. 拔出的 draw的过去分词」 / lemma「vi. 拉, 拖, 拔剑 vt. 拖拉, 挨近, 领取, 打成平局, 引导, 抽签决定, 画, 描写, 制订, 草拟, …」
- **建议：`keep`**

## tits → tit
- rank：form 3020 / lemma 8973 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乳房（俚语）；山雀」 / lemma「山雀；奶头（俚）」
- ECDICT：form「n. 以牙还牙( tit的复数形式 ); <古>小马; 山雀; 奶头」 / lemma「n. 山雀, 打击, 轻佻女人, 奶头, 按钮 [医] 三碘甲状腺氨酸」
- **建议：`keep`**

## clicking → click
- rank：form 3021 / lemma 3338 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「点击；发出咔嗒声」 / lemma「点击；发出咔嗒声」
- ECDICT：form「n. 微小静电干扰声」 / lemma「n. 咔哒声, 啪嗒声 vi. 作咔哒声 vt. 使发咔哒声 [计] 单击」
- **建议：`keep`**

## employees → employee
- rank：form 3024 / lemma 3220 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「雇员（复数）」 / lemma「雇员；员工」
- ECDICT：form「n. 员工；雇员；从业人员（emploee的复数）」 / lemma「n. 职员, 员工, 受雇人员 [化] 职工; 雇员」
- **建议：`keep`**

## feeding → fee
- rank：form 3028 / lemma 8193 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喂养；进食」 / lemma「费用；酬金；小费」
- ECDICT：form「n. 饲养, 进料, 加料 a. 供给饲料的, 摄取食物的」 / lemma「n. 费用, 小费, 封地, 所有权 vt. 付费给」
- **建议：`keep`**

## feeding → feed
- rank：form 3028 / lemma 1105 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喂养；进食」 / lemma「喂养；供给」
- ECDICT：form「n. 饲养, 进料, 加料 a. 供给饲料的, 摄取食物的」 / lemma「n. 饲料, 一餐, 饲养 vt. 喂, 饲养, 放牧, 靠...为生 vi. 吃东西, 用餐, 流入 [计] 送纸」
- **建议：`keep`**

## bears → bear
- rank：form 3031 / lemma 4245 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「忍受；承担（bear 单三）」 / lemma「熊」
- ECDICT：form「n. 空头（卖空的证券交易投机）；熊（bear的复数）」 / lemma「n. 熊 vt. 忍受, 支承, 产生, 怀有, 通过卖空使跌价 vi. 忍受, 结果实, 压挤, 行进, 转向」
- **建议：`keep`**

## stepped → step
- rank：form 3035 / lemma 8124 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「踏；走（step 过去式）」 / lemma「踏；踩；迈步」
- ECDICT：form「v. 踏；行走（step的过去式和过去分词）」 / lemma「n. 步骤, 步, 步幅, 脚步声, 踏级, 步伐, 短距离, 步态, 手段, 等级 vt. 踏, 以步测量, 跨步, …」
- **建议：`keep`**

## depressed → depress
- rank：form 3048 / lemma 25427 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「沮丧的；萧条的」 / lemma「使沮丧；压低」
- ECDICT：form「a. 沮丧的, 降低的 [医] 抑郁的, 阻抑的, 压低的, 凹[陷]的, 扁平的」 / lemma「vt. 使沮丧, 压低, 降低, 使萧条 [化] 推下」
- **建议：`keep`**

## potatoes → potato
- rank：form 3049 / lemma 3176 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「土豆（复数）」 / lemma「马铃薯；土豆」
- ECDICT：form「n. 马铃薯；土豆（potato的复数形式）」 / lemma「n. 马铃薯」
- **建议：`keep`**

## resources → resource
- rank：form 3050 / lemma 10951 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「资源（复数）」 / lemma「资源；财力」
- ECDICT：form「n. 资源；物力（resource的复数）」 / lemma「n. 资源, 财力, 办法, 策略, 急智, 消遣 [计] 资源」
- **建议：`keep`**

## fingerprints → fingerprint
- rank：form 3059 / lemma 8237 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指纹（复数）」 / lemma「指纹」
- ECDICT：form「n. 指纹( fingerprint的名词复数 ) v. 指纹( fingerprint的第三人称单数 )」 / lemma「n. 指纹 vt. 采指纹」
- **建议：`keep`**

## sends → send
- rank：form 3067 / lemma 8103 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发送（send 单三）」 / lemma「发送；派遣；传达」
- ECDICT：form「vt. 发送（send第三人称单数）」 / lemma「vt. 发送, 使进入, 寄, 派遣, 发射, 使陷于 vi. 寄信, 派人, 播送 n. (船的)上升运动 [计] 发…」
- **建议：`keep`**

## obsessed → obsess
- rank：form 3073 / lemma 23769 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「着迷的；困扰的」 / lemma「使着迷；使困扰」
- ECDICT：form「a. 着迷的；无法摆脱的」 / lemma「vt. 迷住, 使困扰」
- **建议：`keep`**

## russians → russian
- rank：form 3074 / lemma 1288 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「俄罗斯人（复数）」 / lemma「俄罗斯的；俄语」
- ECDICT：form「n. 俄国人, 俄罗斯人, 俄语( Russian的复数形式 )」 / lemma「n. 俄国人, 俄语 a. 俄国的, 俄语的」
- **建议：`keep`**

## racing → race
- rank：form 3082 / lemma 5787 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赛马；赛车」 / lemma「赛跑；竞速；疾驰」
- ECDICT：form「n. 赛马, 赛车 [机] 空转, 急转」 / lemma「n. 种族, 人种, 赛跑, 比赛, 急流, 人类, 同道, 姜根 vi. 赛跑, 竞赛, 疾走 vt. 与...赛跑,…」
- **建议：`keep`**

## rumbling → rumble
- rank：form 3091 / lemma 11179 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「隆隆声」 / lemma「发出隆隆声」
- ECDICT：form「n. 隆隆声, 辘辘声」 / lemma「n. 隆隆声, 辘辘声 vi. 发隆隆声, 辘辘响 vt. 使隆隆响, 低沉地说」
- **建议：`keep`**

## ramen → raman
- rank：form 3104 / lemma 9195 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, highfreq-before`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「拉面」 / lemma「拉曼，印度物理学家」
- ECDICT：form「n. 拉面；面条」 / lemma「n. 拉曼（姓氏）；拉曼（印度物理学家）」
- **建议：`keep`**

## coughs → cough
- rank：form 3110 / lemma 5412 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咳嗽（第三人称单数）」 / lemma「咳嗽」
- ECDICT：form「v. 咳嗽( cough的第三人称单数 ); （从喉咙或肺中）咳出; （突然）发出刺耳的噪音」 / lemma「n. 咳嗽 vi. 咳嗽 vt. 咳出」
- **建议：`keep`**

## giggles → giggle
- rank：form 3122 / lemma 10444 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咯咯笑」 / lemma「咯咯笑」
- ECDICT：form「n. 咯咯的笑( giggle的名词复数 ); 傻笑; <英·非正>玩笑; the giggles 止不住的格格笑 v.…」 / lemma「v. 吃吃地笑, 咯咯地笑 n. 咯咯笑, 傻笑」
- **建议：`keep`**

## tons → ton
- rank：form 3127 / lemma 3685 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大量；吨（复数）」 / lemma「吨；大量」
- ECDICT：form「n. 吨；大量；许多（ton的复数形式）」 / lemma「n. 吨 [经] 吨」
- **建议：`keep`**

## entering → enter
- rank：form 3132 / lemma 8118 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「进入」 / lemma「进入；参加；输入」
- ECDICT：form「[计] 进入, 键入, 输入, 录入」 / lemma「vt. 进入, 参加, 开始, 输入, 回车 vi. 进去, 参加 [计] 输入, 回车」
- **建议：`keep`**

## sticks → stick
- rank：form 3141 / lemma 6264 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「棍子（复数）」 / lemma「棍；棒」
- ECDICT：form「n. 树枝；棍；麻骨（stick复数形式）」 / lemma「n. 棍, 棒, 刺, 枯枝, 茎, 条状物 vt. 插进, 刺入, 钉住, 伸出, 粘贴, 停止 vi. 粘住, 停留…」
- **建议：`keep`**

## sighing → sigh
- rank：form 3152 / lemma 4297 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叹气」 / lemma「叹息；叹气」
- ECDICT：form「v. 叹气, 叹息( sigh的现在分词 ); 悲鸣; 叹着气说; 叹息道」 / lemma「n. 叹息 vi. 叹息, 渴望 vt. 叹息着说」
- **建议：`keep`**

## retired → retire
- rank：form 3153 / lemma 3950 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「退休的」 / lemma「退休；撤退」
- ECDICT：form「a. 隐退的, 退休的, 退役的 [经] 退休的, 已收回的」 / lemma「n. 隐居 vi. 引退, 退役, 退休, 退去, 撤退, 退却 vt. 使...撤退, 辞退」
- **建议：`keep`**

## cents → cent
- rank：form 3156 / lemma 4742 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分（货币单位）」 / lemma「分（货币单位）」
- ECDICT：form「n. 分, 一分钱的硬币( cent的复数形式 )」 / lemma「n. 分 [经] 美分」
- **建议：`keep`**

## forbidden → forbid
- rank：form 3158 / lemma 3856 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「被禁止的」 / lemma「禁止；不许」
- ECDICT：form「a. 被禁止的, 严禁的 forbid的过去分词」 / lemma「vt. 禁止, 不准, 妨碍 [法] 不许, 禁止, 阻止」
- **建议：`keep`**

## drops → drop
- rank：form 3160 / lemma 5880 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「落下（第三人称单数）」 / lemma「落下；掉下；下降」
- ECDICT：form「n. 药水, 滴剂 [化] 滴剂」 / lemma「n. 滴, 微量, 落下, 空投 vi. 放下, 掉下, 下降 vt. 使滴下, 放下, 丢失, 遗漏 [计] 投入, …」
- **建议：`keep`**

## meters → meter
- rank：form 3163 / lemma 5482 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「米（复数）；仪表」 / lemma「米；仪表；韵律」
- ECDICT：form「n. 米；公尺（meter的复数形式）」 / lemma「n. 米, 公尺, 仪表, 计量器 vt. 以仪表计量」
- **建议：`keep`**

## suspected → suspect
- rank：form 3180 / lemma 12500 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「怀疑；猜想」 / lemma「怀疑，猜想」
- ECDICT：form「a. 有嫌疑的」 / lemma「n. 被怀疑者, 嫌疑犯 a. 令人怀疑的, 不可信的, 可疑的 v. 怀疑, 猜想」
- **建议：`keep`**

## delighted → delight
- rank：form 3182 / lemma 5857 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「高兴的；愉快的」 / lemma「高兴；愉快」
- ECDICT：form「a. 高兴的, 快乐的」 / lemma「n. 高兴, 愉快 vt. 使高兴, 乐于 vi. 感到高兴(或愉快、快乐)」
- **建议：`keep`**

## sticking → stick
- rank：form 3183 / lemma 6264 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「粘住；坚持」 / lemma「棍；棒」
- ECDICT：form「a. 粘的, 有粘性的 [计] 坚持性」 / lemma「n. 棍, 棒, 刺, 枯枝, 茎, 条状物 vt. 插进, 刺入, 钉住, 伸出, 粘贴, 停止 vi. 粘住, 停留…」
- **建议：`keep`**

## owned → own
- rank：form 3190 / lemma 6063 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拥有；占有」 / lemma「拥有；占有」
- ECDICT：form「v. 拥有；承认（own的过去分词）」 / lemma「n. 自己的 a. 自己的, 嫡亲的, 同胞的 vt. 拥有, 支配, 自认, 承认, 顺从于 vi. 承认, 供认」
- **建议：`keep`**

## rising → rise
- rank：form 3216 / lemma 5757 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上升的；新兴的」 / lemma「升起；上升；起身」
- ECDICT：form「n. 上升, 造反, 叛乱 a. 上升的, 高涨的, 新兴的」 / lemma「n. 上升, 增加, 上涨, 高地, 升高, 出现 vi. 升起, 起身, 起立, 上升, 上涨, 增长, 高耸, 起义…」
- **建议：`keep`**

## cuts → cut
- rank：form 3218 / lemma 6243 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「切；削减」 / lemma「切；剪」
- ECDICT：form「n. （分摊到的）份额；切口；近路（cut的复数）」 / lemma「n. 切口, 割伤, 降低, 切, 割, 砍, 削, 伤口, 削减, 缩短, 删节, 通路 a. 经切割的, 缩减的 v…」
- **建议：`keep`**

## yards → yard
- rank：form 3225 / lemma 7692 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「码（复数）；院子」 / lemma「院子；庭院」
- ECDICT：form「n. 码数（yard复数形式）」 / lemma「n. 码, 庭院, 工场 [化] 堆置场」
- **建议：`keep`**

## advanced → advance
- rank：form 3229 / lemma 8145 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「先进的；高级的」 / lemma「前进；推进；提前」
- ECDICT：form「a. 在前的, 高级的, 先进的, 年老的 [法] 预付的, 预支的, 垫付的」 / lemma「n. 前进, 进展, 行过的路程 vi. 前进, 进展, 提高, 上涨 vt. 使前进, 促进, 提出, 提高, 使提前…」
- **建议：`keep`**

## wears → wear
- rank：form 3230 / lemma 5145 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「穿着；磨损」 / lemma「穿；戴；穿着」
- ECDICT：form「v. 穿着( wear的第三人称单数 ); 磨成; 使疲乏; 同意」 / lemma「n. 穿着, 戴, 使用, 耗损, 服装, 耐久性 vt. 穿着, 戴, 留(须、发等), 呈现, 磨损, 磨成, 耗损…」
- **建议：`keep`**

## chirping → chirp
- rank：form 3231 / lemma 16221 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸟叫；唧唧叫」 / lemma「鸟叫；唧唧叫」
- ECDICT：form「n. 啁啾声；鸟叫声；鸣叫」 / lemma「n. 喳喳声, 唧唧声 v. 吱喳而鸣」
- **建议：`keep`**

## assumed → assume
- rank：form 3238 / lemma 12100 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「假定；承担」 / lemma「假定；承担；呈现」
- ECDICT：form「a. 假装的, 装的, 假定的 [法] 设想的, 假定的, 被承担的」 / lemma「vt. 假定, 承担, 呈现 vi. 装腔作势, 僭越」
- **建议：`keep`**

## tested → test
- rank：form 3249 / lemma 8322 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「测试（过去式）」 / lemma「测验；考试」
- ECDICT：form「a. 经过试验的, 经受过考验的, 经验定的, 检验无病的」 / lemma「n. 测试, 试验, 化验, 检验, 考验, 甲壳 vt. 测试, 试验, 化验 vi. 接受测验, 进行测试」
- **建议：`keep`**

## roses → rose
- rank：form 3252 / lemma 4659 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「玫瑰（复数）」 / lemma「玫瑰；蔷薇」
- ECDICT：form「n. 玫瑰（rose的复数）」 / lemma「n. 玫瑰, 蔷薇, 玫瑰色 a. 玫瑰色的, 玫瑰花的 vt. 使成玫瑰色 rise的过去式」
- **建议：`keep`**

## wrapped → wrap
- rank：form 3254 / lemma 5217 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「包裹（过去式）」 / lemma「包裹；缠绕」
- ECDICT：form「a. 有包装的」 / lemma「n. 外套, 围巾, 包裹物, 限制, 约束, 秘密, 换行 vt. 包装, 卷, 缠绕, 包, 裹, 覆盖, 遮蔽, …」
- **建议：`keep`**

## yells → yell
- rank：form 3269 / lemma 8403 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大叫（第三人称单数）」 / lemma「叫喊；吼叫；嚎叫」
- ECDICT：form「v. 叫喊, 号叫, 叫着说( yell的第三人称单数 )」 / lemma「vi. 叫喊, 大叫, (齐声)呐喊欢呼 vt. 喊叫着说 n. 叫声, 喊声, 呐喊」
- **建议：`keep`**

## pockets → pocket
- rank：form 3272 / lemma 5160 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「口袋（复数）」 / lemma「口袋；衣兜」
- ECDICT：form「n. 口袋（pocket的复数）」 / lemma「n. 口袋, 钱袋, 钱, 容器 vt. 装...在口袋里, 隐藏, 抑制, 私吞, 搁置, 击...入袋 a. 袖珍的…」
- **建议：`keep`**

## chicks → chick
- rank：form 3281 / lemma 7467 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小鸡；妞（复数）」 / lemma「小鸡」
- ECDICT：form「n. 雏鸡；小鸡（chick的复数形式）」 / lemma「n. 小鸡, 小鸟, 竹帘」
- **建议：`keep`**

## regarding → regard
- rank：form 3294 / lemma 4748 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「关于；至于」 / lemma「认为；注视；关于」
- ECDICT：form「prep. 关于」 / lemma「n. 关心, 注意, 尊敬, 关系, 问候 vt. 视为, 注意, 考虑, 和...有关, 看待 vi. 注视, 注意」
- **建议：`keep`**

## aliens → alien
- rank：form 3296 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「外星人；外国人（复数）」 / lemma「外国的；外星人」
- ECDICT：form「n. 外国人( alien的名词复数 ); 外侨; 局外人; 外星人」 / lemma「n. 外国人, 外侨 a. 外国的, 相异的」
- **建议：`keep`**

## demands → demand
- rank：form 3300 / lemma 12800 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「要求（复数）」 / lemma「要求；强烈请求」
- ECDICT：form「v. 要求( demand的第三人称单数 ); 需要; 想要知道; 查问」 / lemma「n. 要求, 需求, 需要 v. 要求, 查询」
- **建议：`keep`**

## rangers → ranger
- rank：form 3303 / lemma 4073 ｜ type `s` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「护林员；巡逻队员（复数）」 / lemma「护林员；巡逻员」
- ECDICT：form「n. 护林者( ranger的复数形式 ); <美>突击队员」 / lemma「n. 王室守林人, 骑警, 漫游者」
- **建议：`keep`**

## passengers → passenger
- rank：form 3307 / lemma 4292 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「乘客（复数）」 / lemma「乘客；旅客」
- ECDICT：form「n. 乘客( passenger的名词复数 ); 旅客; 白吃饭的人; 闲散人员」 / lemma「n. 乘客, 旅客 [经] 乘客, 旅客」
- **建议：`keep`**

## operations → operation
- rank：form 3312 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「操作；手术（复数）」 / lemma「操作，运行；手术」
- ECDICT：form「n. 运作；运营；业务操作（operation的复数）」 / lemma「n. 操作, 动作, 手术, 运算, 作用, 业务 [计] 运算」
- **建议：`keep`**

## shining → shine
- rank：form 3316 / lemma 8037 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发光；照耀（现在分词）」 / lemma「发光；照耀；擦亮」
- ECDICT：form「a. 光亮的, 华丽的」 / lemma「n. 光泽, 阳光 vt. 使发光 vi. 照耀, 发光, 发亮」
- **建议：`keep`**

## kidnapping → kidnap
- rank：form 3321 / lemma 4515 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「绑架；劫持」 / lemma「绑架」
- ECDICT：form「n. 绑架；诱拐」 / lemma「vt. 绑架, 诱拐, 拐骗 [法] 拐带, 诱拐, 绑架」
- **建议：`keep`**

## sealed → seal
- rank：form 3325 / lemma 4428 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「密封的；封闭的」 / lemma「海豹；印章」
- ECDICT：form「a. 未知的, 密封的 [法] 盖印的, 经盖章批准或证实的, 密封的」 / lemma「n. 印章, 封条, 海豹, 海豹皮, 火漆, 封蜡, 玺, 保证, 批准, 象征, 标志 vt. 封闭, 盖印, 盖章…」
- **建议：`keep`**

## raising → raise
- rank：form 3327 / lemma 5871 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抚养；提高」 / lemma「举起；提高；抚养」
- ECDICT：form「[机] 起油」 / lemma「n. 上升, 高地, 增高 vt. 升起, 举起, 唤起, 提高, 使出现, 使复活, 提出, 筹集, 饲养」
- **建议：`keep`**

## chanting → chant
- rank：form 3343 / lemma 9307 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「吟唱；诵经」 / lemma「吟唱；反复呼喊」
- ECDICT：form「念咒」 / lemma「n. 圣歌, 赞美诗 v. 吟唱, 诵扬」
- **建议：`keep`**

## registered → register
- rank：form 3347 / lemma 3430 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已登记的；注册的」 / lemma「登记；注册」
- ECDICT：form「a. 注册的, 登记过的, 记名的, 挂号的 [法] 已注册的, 已登记的, 挂号的」 / lemma「n. 寄存器, 记录, 登记簿, 注册 vt. 记录, 注册, 提示, 表达, 把...挂号 vi. 登记, 注册, 挂…」
- **建议：`keep`**

## ancestors → ancestor
- rank：form 3354 / lemma 9626 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「祖先；祖宗」 / lemma「祖先；祖宗」
- ECDICT：form「n. 祖先( ancestor的复数形式 ); 祖宗; 原型; （动物的）原种」 / lemma「n. 祖先, 祖宗」
- **建议：`keep`**

## fried → fry
- rank：form 3358 / lemma 3899 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「油炸的；煎的」 / lemma「油炸；煎」
- ECDICT：form「a. 油炸的」 / lemma「n. 油炸食物, 鱼苗 v. 油炸, 煎」
- **建议：`keep`**

## understands → understand
- rank：form 3367 / lemma 5922 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「理解；明白（第三人称单数）」 / lemma「理解；明白；懂」
- ECDICT：form「v. 懂, 理解( understand的第三人称单数 ); 了解; 默认; 听说」 / lemma「vt. 理解, 了解, 领会, 听说, 懂 vi. 懂得, 认为」
- **建议：`keep`**

## grows → grow
- rank：form 3368 / lemma 7542 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生长；增长（第三人称单数）」 / lemma「生长；种植」
- ECDICT：form「v. 种植( grow的第三人称单数 ); 扩大; 扩展; 增加」 / lemma「vt. 种植, 使长满 vi. 生长, 变成, 发展」
- **建议：`keep`**

## inspired → inspire
- rank：form 3369 / lemma 7050 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受启发的；有灵感的」 / lemma「激励；启发」
- ECDICT：form「a. 得到灵感的, 有灵感的, 官方授意的」 / lemma「vt. 使感动, 激发, 启示, 吸入, 鼓舞, 产生, 使生灵感 vi. 吸入, 赋予灵感」
- **建议：`keep`**

## bugs → bug
- rank：form 3374 / lemma 4392 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「虫子；漏洞（复数）」 / lemma「虫子；程序错误」
- ECDICT：form「a. 疯狂的, 发疯的」 / lemma「n. 错误, 虫, 病菌, 缺陷, 窃听器, 癖好, 防盗报警器, 双座小汽车, 要人 vt. 装防盗报警器, 装窃听器…」
- **建议：`keep`**

## hooked → hook
- rank：form 3377 / lemma 4959 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上瘾的；着迷的」 / lemma「钩子；挂钩」
- ECDICT：form「a. 钩状的, 有钩的, 用钩针编织的」 / lemma「n. 钩, 钩状, 镰刀, 陷阱 vt. 挂...于钩上, 钩住, 引上钩, 偷窃 vi. 弯成钩状, 钩紧 [计] 钩」
- **建议：`keep`**

## worn → wear
- rank：form 3381 / lemma 5145 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨损的；疲惫的」 / lemma「穿；戴；穿着」
- ECDICT：form「a. 用旧的, 穿旧的 wear的过去分词」 / lemma「n. 穿着, 戴, 使用, 耗损, 服装, 耐久性 vt. 穿着, 戴, 留(须、发等), 呈现, 磨损, 磨成, 耗损…」
- **建议：`keep`**

## lands → land
- rank：form 3383 / lemma 5661 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「土地；陆地（复数）」 / lemma「陆地；土地」
- ECDICT：form「n. 平原；平面；土地（land的复数形式）」 / lemma「n. 陆地, 地面, 地界, 地产, 国土, 土地 vi. 登陆, 登岸, 到达 vt. 使上岸, 使登陆, 使到达 […」
- **建议：`keep`**

## grounds → ground
- rank：form 3384 / lemma 5664 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「场地；理由（复数）」 / lemma「地面；土地」
- ECDICT：form「n. 场地, 庭院, 理由, 渣滓, 沉淀物」 / lemma「n. 土地, 战场, 场地, 地面, 范围 a. 土地的, 地面上的 vt. 放在地上, 使搁浅, 打基础, 给...以…」
- **建议：`keep`**

## assuming → assume
- rank：form 3385 / lemma 12100 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「假设；认为」 / lemma「假定；承担；呈现」
- ECDICT：form「a. 傲慢的, 僭越的, 不逊的」 / lemma「vt. 假定, 承担, 呈现 vi. 装腔作势, 僭越」
- **建议：`keep`**

## nails → nail
- rank：form 3386 / lemma 4962 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指甲；钉子（复数）」 / lemma「钉子；指甲」
- ECDICT：form「n. 钉子（nail的复数）」 / lemma「n. 钉子, 指甲 vt. 用钉钉牢, 使固定, 截住, 揭露」
- **建议：`keep`**

## rumors → rumor
- rank：form 3392 / lemma 3802 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「谣言；传闻（复数）」 / lemma「谣言；传闻」
- ECDICT：form「n. <美>传闻( rumor的名词复数 ); [古]名誉; 咕哝; [古]喧嚷 v. <美>传闻( rumor的第三人…」 / lemma「n. 谣言, 传闻 vt. 谣传」
- **建议：`keep`**

## ashes → ash
- rank：form 3395 / lemma 4458 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灰烬；骨灰（复数）」 / lemma「白蜡树；灰烬」
- ECDICT：form「n. 骨灰 [机] 灰」 / lemma「n. 灰, 灰烬 [化] 灰分」
- **建议：`keep`**

## misunderstanding → misunderstand
- rank：form 3397 / lemma 6000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「误解；误会」 / lemma「误解，误会」
- ECDICT：form「n. 误会, 误解 [法] 误解, 误会, 不和」 / lemma「vt. 误解, 误会」
- **建议：`keep`**

## shouts → shout
- rank：form 3408 / lemma 5946 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喊叫；呼喊」 / lemma「喊叫；大声说」
- ECDICT：form「n. 呼喊, 喊叫( shout的名词复数 ); 轮到请客 v. 呼, 喊, 叫( shout的第三人称单数 ); 大声…」 / lemma「n. 呼喊, 喊声 vi. 呼喊, 喊叫, 嚷 vt. 高喊」
- **建议：`keep`**

## struggling → struggle
- rank：form 3412 / lemma 6309 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「挣扎；奋斗」 / lemma「挣扎；奋力」
- ECDICT：form「a. 努力的, 奋斗的, 苦斗的」 / lemma「n. 斗争, 努力, 奋斗 vi. 努力, 奋斗, 挣扎」
- **建议：`keep`**

## honking → honk
- rank：form 3418 / lemma 9425 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸣笛；雁叫」 / lemma「按喇叭；鸣笛」
- ECDICT：form「v. （使）发出雁叫似的声音, 鸣（喇叭）, 按（喇叭）( honk的现在分词 )」 / lemma「n. 雁鸣, 汽车的喇叭声 vi. 雁鸣叫, 按汽车喇叭 vt. 揿(喇叭)」
- **建议：`keep`**

## concerns → concern
- rank：form 3419 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「担忧；关切」 / lemma「涉及；关心；忧虑」
- ECDICT：form「n. 关注；关注点；关注者（concern的复数形式）」 / lemma「n. 关心, 忧虑 vt. 与...有关, 使担心, 使挂念」
- **建议：`keep`**

## breasts → breast
- rank：form 3422 / lemma 5319 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乳房；胸部」 / lemma「乳房；胸部」
- ECDICT：form「n. 胸脯；乳房（breast的复数）」 / lemma「n. 胸部, 乳房, 胸怀 vt. 以胸对着, 面对」
- **建议：`keep`**

## forgetting → forget
- rank：form 3428 / lemma 5931 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「忘记」 / lemma「忘记；遗忘」
- ECDICT：form「v. 遗忘；忘记（forget的ing形式）」 / lemma「vt. 忘记, 忽略, 忘 vi. 忘记」
- **建议：`keep`**

## lungs → lung
- rank：form 3429 / lemma 5307 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「肺」 / lemma「肺；肺部」
- ECDICT：form「n. 肺( lung的复数形式 ); 肺脏」 / lemma「n. 肺, 肺脏, 空地 [医] 肺」
- **建议：`keep`**

## detectives → detective
- rank：form 3454 / lemma 13900 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「侦探」 / lemma「侦探」
- ECDICT：form「n. 侦探( detective的复数形式 )」 / lemma「n. 侦探 a. 侦探的」
- **建议：`keep`**

## dismissed → dismiss
- rank：form 3460 / lemma 6524 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「解雇；驳回」 / lemma「解雇；驳回；解散」
- ECDICT：form「v. 解雇( dismiss的过去式和过去分词 ); （使击球员或球队）退场; 使退去; 驳回」 / lemma「vt. 解散, 开除, 解职 vi. 解散 [计] 解散」
- **建议：`keep`**

## borrowed → borrow
- rank：form 3477 / lemma 6054 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「借；借用」 / lemma「借；借用；借贷」
- ECDICT：form「a. 借来的, 伪造的, 虚构的」 / lemma「vt. 借, 借入, 借用 vi. 借 [计] 借位; 借位数」
- **建议：`keep`**

## roaring → roar
- rank：form 3511 / lemma 5960 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咆哮的；轰响的」 / lemma「吼叫；咆哮」
- ECDICT：form「n. 吼声, 咆哮, 怒吼 a. 风哮雨嚎的, 咆哮的, 轰鸣的, 喧哗的, 狂暴的」 / lemma「n. 吼, 咆哮, 轰鸣 vi. 吼, 大声说出, 叫喊, 喧闹 vt. 呼喊, 使轰鸣」
- **建议：`keep`**

## whimpering → whimper
- rank：form 3518 / lemma 22799 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呜咽；抽泣」 / lemma「呜咽；抽泣」
- ECDICT：form「v. （微弱或惊恐地）啜泣, 呜咽( whimper的现在分词 ); 啜泣或呜咽着说; 幽咽」 / lemma「n. 抽泣, 呜咽, 啜泣, 哭诉 vi. 呜咽, 啜泣, 抽噎地哭 vt. 呜咽着说, 啜泣着说」
- **建议：`keep`**

## sheets → sheet
- rank：form 3519 / lemma 5013 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「床单（复数）；纸张」 / lemma「床单；一张」
- ECDICT：form「n. 被单；片材, 板片（sheet复数）」 / lemma「n. 床单, 张, 纸张, 印刷品, 裹尸布, 薄片 vt. 盖上被单, 遍布 vi. 大片落下 a. 片状的, 成薄片…」
- **建议：`keep`**

## toes → toe
- rank：form 3523 / lemma 5241 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚趾（复数）」 / lemma「脚趾；鞋头」
- ECDICT：form「n. 脚趾（toe的复数）」 / lemma「n. 足趾, 趾部, 脚趾 vt. 以趾踏触, 用脚尖走 vi. 动脚尖」
- **建议：`keep`**

## disturbing → disturb
- rank：form 3529 / lemma 12300 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人不安的」 / lemma「打扰，扰乱」
- ECDICT：form「a. 引起烦恼的, 令人不安的」 / lemma「vt. 扰乱, 妨碍, 使不安 [法] 滋扰, 扰乱」
- **建议：`keep`**

## directed → direct
- rank：form 3530 / lemma 12300 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「导演；指向（过去式）」 / lemma「指导，导演；指路」
- ECDICT：form「a. 定向的；经指导的；被控制的」 / lemma「a. 直接的, 坦白的 vt. 指示, 指挥, 命令, 导演 vi. 指导, 指挥 adv. 直接地」
- **建议：`keep`**

## elements → element
- rank：form 3566 / lemma 4014 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「元素；要素」 / lemma「元素；要素」
- ECDICT：form「n. 原理, 基础」 / lemma「n. 元件, 元素, 要素 [计] 部分; 成分; 单元; 码元; 元件; 元素; 单元」
- **建议：`keep`**

## laying → lay
- rank：form 3568 / lemma 949 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置；产（卵）」 / lemma「放置；躺（过去式）」
- ECDICT：form「[计] 布置, 敷设 [化] 敷设; 铺设(管道等)」 / lemma「vt. 放置, 产, 铺设, 布置, 提出, 平息 vi. 下蛋, 打赌 n. 位置, 层, 隐藏处 a. 世俗的, 外…」
- **建议：`keep`**

## handled → handle
- rank：form 3574 / lemma 7725 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「处理；应对」 / lemma「把手；柄」
- ECDICT：form「a. 有把手的；有把柄的」 / lemma「n. 柄, 把手, 把柄, 柄状物, 手感 vt. 触摸, 运用, 买卖, 处理, 操作 vi. 搬运, 易于操纵 n.…」
- **建议：`keep`**

## taxes → tax
- rank：form 3579 / lemma 8220 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「税；税款」 / lemma「税；税款；负担」
- ECDICT：form「n. 税务；税捐；税收, 税金」 / lemma「n. 税, 税款, 重负, 会费 vt. 课以税, 使负重荷, 斥责」
- **建议：`keep`**

## revealed → reveal
- rank：form 3588 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「揭示；透露」 / lemma「揭示；透露」
- ECDICT：form「v. 透露（reveal的过去式）；显示」 / lemma「vt. 露出, 显示, 透露, 揭露, 泄露, (神)启示 n. 窗侧, 门侧」
- **建议：`keep`**

## infected → infect
- rank：form 3589 / lemma 13277 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被感染的」 / lemma「感染；传染」
- ECDICT：form「a. 被感染的 [计] 被感染的」 / lemma「vt. 传染, 感染 [医] 传染, 感染」
- **建议：`keep`**

## relieved → relieve
- rank：form 3590 / lemma 12200 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「宽慰的；放心的」 / lemma「减轻，缓解」
- ECDICT：form「a. 宽慰的, 解除的, 减轻的」 / lemma「vt. 减轻, 救济, 解除, 使免除, 换...的班, 使得到调剂, 使不单调, 衬托, 使显著 vi. 救济, 当替…」
- **建议：`keep`**

## marked → mark
- rank：form 3596 / lemma 5994 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「显著的；有标记的」 / lemma「注意；标记；打分」
- ECDICT：form「a. 有记号的, 显著的, 醒目的 [化] 有记号的; 显著的」 / lemma「n. 标志, 分数, 马克, 痕迹, 斑点, 靶子, 刻度, 记号, 符号, 戳记, 标准, 起跑线 vt. 做标记于,…」
- **建议：`keep`**

## floating → float
- rank：form 3611 / lemma 8130 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「漂浮；浮动」 / lemma「漂浮；浮动；飘荡」
- ECDICT：form「a. 漂浮的, 浮动的, 移动的 [医] 浮动的」 / lemma「n. 漂流物, 浮舟, 漂浮, 浮萍, 彩车 vi. 浮动, 飘动, 散播, 摇摆, 动摇, 浮动 vt. 使漂浮, 容…」
- **建议：`keep`**

## located → locate
- rank：form 3613 / lemma 3987 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「位于；找到」 / lemma「定位；找到」
- ECDICT：form「a. 处于, 位于；坐落的」 / lemma「vt. 找出, 设于, 位于 vi. 定居」
- **建议：`keep`**

## insisted → insist
- rank：form 3614 / lemma 12500 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「坚持；坚决要求」 / lemma「坚持；坚决主张」
- ECDICT：form「v. 坚决宣称, 坚持认为( insist的过去式和过去分词 ); 坚决要求」 / lemma「v. 坚持, 坚决主张, 强调」
- **建议：`keep`**

## arrives → arrive
- rank：form 3618 / lemma 8112 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「到达；抵达」 / lemma「到达；抵达；到来」
- ECDICT：form「v. 到达, 来( arrive的第三人称单数 ); 发生」 / lemma「vi. 到达, 抵达」
- **建议：`keep`**

## giggling → giggle
- rank：form 3644 / lemma 10444 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咯咯地笑」 / lemma「咯咯笑」
- ECDICT：form「v. 咯咯地笑( giggle的现在分词 )」 / lemma「v. 吃吃地笑, 咯咯地笑 n. 咯咯笑, 傻笑」
- **建议：`keep`**

## hercules → hercule
- rank：form 3648 / lemma 22150 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, highfreq-before, suspect-target`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「大力神；海格力斯」 / lemma「埃尔屈勒（人名，大力士）」
- ECDICT：form「n. 赫拉克勒斯(希腊神话中大力士), 大力士, 武仙座」 / lemma「n. 赫居里士（希腊神话中大力神）」
- **建议：`keep`**

## mars → mar
- rank：form 3688 / lemma 13030 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「火星」 / lemma「损坏；毁坏；玷污」
- ECDICT：form「n. 火星, 战神 [医] 铁」 / lemma「vt. 损毁, 损伤, 糟蹋 n. 三月」
- **建议：`keep`**

## attracted → attract
- rank：form 3689 / lemma 12500 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「吸引；引起」 / lemma「吸引；引起」
- ECDICT：form「吸引 的兴趣 被吸引的」 / lemma「vt. 吸引, 诱惑 vi. 有吸引力」
- **建议：`keep`**

## symptoms → symptom
- rank：form 3694 / lemma 12283 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「症状（复数）」 / lemma「症状；征兆」
- ECDICT：form「n. 病徵；症状；症候」 / lemma「n. 症状, 征候, 征兆 [医] 症状」
- **建议：`keep`**

## wolves → wolf
- rank：form 3711 / lemma 4224 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「狼（复数）」 / lemma「狼」
- ECDICT：form「狼, 狼皮, 残暴成性的人, 贪婪的人, 阴险狡猾的人, (贬)追逐女性的人, 色狼, 色鬼」 / lemma「n. 狼, 残忍贪婪之人, 极度穷困 vt. 狼吞虎咽, 大吃」
- **建议：`keep`**

## honored → honor
- rank：form 3735 / lemma 589 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「尊敬；给…荣誉（honor 的过去式）」 / lemma「荣誉；尊敬」
- ECDICT：form「a. 已承兑或付款的；受尊敬的」 / lemma「n. 荣誉, 头衔, 信用, 尊敬, 名誉, 阁下, 勋章 vt. 尊敬, 授予荣誉, 承兑, 实践」
- **建议：`keep`**

## honored → honore
- rank：form 3735 / lemma 34938 ｜ type `pd` ｜ src `A` ｜ flags `lemma-proper, lemma-no-gloss, src-a-only, highfreq-before, homograph, suspect-target`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「尊敬；给…荣誉（honor 的过去式）」 / lemma「奥诺雷（人名）」
- ECDICT：form「a. 已承兑或付款的；受尊敬的」 / lemma「」
- **建议：`fix-target:honor`**

## believing → believe
- rank：form 3736 / lemma 5919 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「相信；认为（believe 的现在分词）」 / lemma「相信；认为」
- ECDICT：form「a. 信任他人的, 有信仰的」 / lemma「v. 相信」
- **建议：`keep`**

## assigned → assign
- rank：form 3738 / lemma 9966 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分配；指派（assign 的过去式）」 / lemma「分配；指派」
- ECDICT：form「a. 已分配的；指定的」 / lemma「vt. 分配, 指派, 赋值 [计] 赋值」
- **建议：`keep`**

## climbing → climb
- rank：form 3750 / lemma 5370 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「攀登；爬（climb 的现在分词）」 / lemma「爬；攀登」
- ECDICT：form「a. 攀缘而登的, 上升的 n. 攀登」 / lemma「v. 攀登, 上升, 爬 n. 攀登, 爬升」
- **建议：`keep`**

## fears → fear
- rank：form 3752 / lemma 5442 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「恐惧；担心（fear 的复数）」 / lemma「恐惧；害怕」
- ECDICT：form「n. 恐惧；担心」 / lemma「n. 恐怖, 害怕, 担心 v. 害怕, 恐惧, 为...担心, 敬畏」
- **建议：`keep`**

## dedicated → dedicate
- rank：form 3754 / lemma 4500 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「专注的；献身的」 / lemma「献身；把…献给」
- ECDICT：form「a. 专注的, 献身的」 / lemma「vt. 献出, 贡献」
- **建议：`keep`**

## dining → dine
- rank：form 3758 / lemma 7028 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用餐；进餐」 / lemma「进餐；用餐」
- ECDICT：form「n. 正餐, 宴会」 / lemma「vi. 用正餐, 进餐 vt. 宴请」
- **建议：`keep`**

## heels → heel
- rank：form 3765 / lemma 5238 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚后跟；高跟鞋（heel 的复数）」 / lemma「鞋跟；脚跟」
- ECDICT：form「[化] 残余料; 下脚料 [医] 跖沟状角皮病」 / lemma「n. 脚后跟, 踵, 后部, 倾侧 vt. 尾随, 装以鞋跟, 倾侧, 追赶 vi. 紧随, 用脚后跟传球」
- **建议：`keep`**

## models → model
- rank：form 3775 / lemma 8724 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「模型；模特（model 的复数）」 / lemma「模型；模特儿」
- ECDICT：form「n. 模型( model的名词复数 ); 模特儿; 模式; 典型」 / lemma「n. 模型, 模范, 模特儿 a. 模范的, 作模型用的 vi. 做模型, 做模特儿 vt. 使模仿, 塑造 [计] 模…」
- **建议：`keep`**

## adopted → adopt
- rank：form 3777 / lemma 5419 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「收养；采用（adopt 的过去式）」 / lemma「收养；采用」
- ECDICT：form「a. 被收养的, 被采用的」 / lemma「vt. 采用, 正式通过, 收养, 接受 [医] 采取」
- **建议：`keep`**

## dings → ding
- rank：form 3782 / lemma 4257 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「凹痕；叮当声（ding 的复数）」 / lemma「叮当响；发出叮声」
- ECDICT：form「板材的弯折」 / lemma「vi. 响, 连响, 反复告诫 vt. 反复告诉 n. 钟声」
- **建议：`keep`**

## arriving → arrive
- rank：form 3796 / lemma 8112 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「到达；抵达（arrive 的现在分词）」 / lemma「到达；抵达；到来」
- ECDICT：form「到达」 / lemma「vi. 到达, 抵达」
- **建议：`keep`**

## ties → tie
- rank：form 3798 / lemma 5211 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「领带；联系（tie 的复数）」 / lemma「系；捆绑」
- ECDICT：form「n. 结」 / lemma「n. 带子, 线, 鞋带, 领带, 领结, 关系, 束缚, 平局, 不分胜负 vt. 系, 打结, 扎, 约束, 与..…」
- **建议：`keep`**

## relations → relation
- rank：form 3801 / lemma 5374 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「关系；亲属」 / lemma「关系；亲属」
- ECDICT：form「n. 交往, 关系, 事务」 / lemma「n. 关系, 联系, 叙述, 故事, 家属, 亲戚 [计] 关系」
- **建议：`keep`**

## boarding → board
- rank：form 3819 / lemma 4980 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「登机；寄宿」 / lemma「木板；董事会」
- ECDICT：form「n. 木板 [机] 起纹」 / lemma「n. 木板, 甲板, 膳食, 会议桌 vt. 乘船, 供膳食, 用板覆盖 vi. 搭伙 [计] 板」
- **建议：`keep`**

## wiped → wipe
- rank：form 3825 / lemma 7893 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「擦拭；抹去」 / lemma「擦；抹；擦拭」
- ECDICT：form「v. 擦( wipe的过去式和过去分词 ); 拭; 擦去; 拭去」 / lemma「n. 擦拭, 用力打, 凸轮 vt. 擦, 揩, 消灭, 涂上, 拭去 vi. 擦, 打」
- **建议：`keep`**

## twisted → twist
- rank：form 3832 / lemma 8094 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扭曲的；变态的」 / lemma「扭；缠绕；歪曲」
- ECDICT：form「a. 扭曲的」 / lemma「n. 一扭, 扭曲, 曲折, 歪曲, 螺旋状, 新手法 vt. 拧, 扭, 捻, 编织, 使扭转, 缠绕, 盘绕, 歪曲…」
- **建议：`keep`**

## suspended → suspend
- rank：form 3833 / lemma 10288 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暂停；悬挂」 / lemma「暂停；悬挂；停职」
- ECDICT：form「a. 悬浮的；暂停的, 缓期的（宣判）」 / lemma「vt. 悬, 吊, 使悬浮, 暂停, 中止, 推迟 vi. 暂停, 中止, 悬浮, 停止偿付债务 [计] 暂停」
- **建议：`keep`**

## candles → candle
- rank：form 3848 / lemma 4908 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「蜡烛」 / lemma「蜡烛；烛光」
- ECDICT：form「n. 蜡烛, 烛台（candle复数形式）」 / lemma「n. 蜡烛 vt. 对着光检查」
- **建议：`keep`**

## handling → handle
- rank：form 3864 / lemma 7725 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「处理；操作」 / lemma「把手；柄」
- ECDICT：form「n. 处理 a. 操作的」 / lemma「n. 柄, 把手, 把柄, 柄状物, 手感 vt. 触摸, 运用, 买卖, 处理, 操作 vi. 搬运, 易于操纵 n.…」
- **建议：`keep`**

## francs → franc
- rank：form 3871 / lemma 21898 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「法郎（货币）」 / lemma「法郎（货币）」
- ECDICT：form「n. 法郎」 / lemma「n. 法郎」
- **建议：`keep`**

## filed → file
- rank：form 3876 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「提交；归档」 / lemma「文件；档案；行列」
- ECDICT：form「v. [专利]申请；存档（file的过去分词形式）」 / lemma「n. 档案, 公文箱, 文件夹, 文件, 卷宗, 锉刀 vi. 列队行进, 用锉刀做 vt. 归档, 申请, 锉, 琢磨…」
- **建议：`keep`**

## deals → deal
- rank：form 3879 / lemma 6036 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「交易；协议」 / lemma「交易；协议；待遇」
- ECDICT：form「n. 协约；份额；交易（deal的复数形式）」 / lemma「n. 交易, 协定, 数量, 买卖, 松木板 vi. 处理, 应付, 做生意 vt. 分配, 发牌, 给予 [计] 发牌」
- **建议：`keep`**

## pos → po
- rank：form 3880 / lemma 5927 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss, highfreq-before`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「肯定的；正面的」 / lemma「波河；邮政汇票缩写」
- ECDICT：form「[计] 销售点, 位置, 正, 主操作系统」 / lemma「邮局, 邮政汇票 [医] 口服, 经口」
- **建议：`keep`**

## executed → execute
- rank：form 3884 / lemma 5221 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「执行；处决」 / lemma「执行；处决」
- ECDICT：form「v. 执行（法令）( execute的过去式和过去分词 ); （按计划或设计）作成; 履行; 演（戏）」 / lemma「vt. 执行, 实行, 完成, 处死, 制成 [计] 执行」
- **建议：`keep`**

## brakes → brake
- rank：form 3885 / lemma 5019 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刹车；制动器」 / lemma「刹车；制动器」
- ECDICT：form「n. 刹车系统；制动；刹车（brake的复数）」 / lemma「n. 刹车, 阻碍, 丛林 v. 刹车」
- **建议：`keep`**

## doubts → doubt
- rank：form 3902 / lemma 5964 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「怀疑；疑虑」 / lemma「怀疑；不信」
- ECDICT：form「n. 怀疑, 疑虑( doubt的名词复数 ); 未确定 v. 怀疑, 疑惑( doubt的第三人称单数 )」 / lemma「n. 怀疑, 疑惑 v. 怀疑, 不信」
- **建议：`keep`**

## established → establish
- rank：form 3907 / lemma 4360 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已确立的；著名的」 / lemma「建立；确立」
- ECDICT：form「a. (被)建立的, 固定的, 既定的, 确定的, 确认的, 确立的, (被)制定的 [计] 确定的, 既定的」 / lemma「vt. 建立, 确立, 制定 vi. 移植生长」
- **建议：`keep`**

## sobs → sob
- rank：form 3915 / lemma 12186 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「啜泣；呜咽」 / lemma「啜泣；呜咽」
- ECDICT：form「n. 啜泣（声）, 呜咽（声）( sob的名词复数 ) v. 哭泣, 啜泣( sob的第三人称单数 ); 哭诉, 呜咽地…」 / lemma「vi. 啜泣, 呜咽 vt. 哭诉, 哭得使 n. 啜泣, 呜咽」
- **建议：`keep`**

## published → publish
- rank：form 3924 / lemma 5642 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「出版；发表」 / lemma「出版；发表」
- ECDICT：form「a. 已发布的」 / lemma「vt. 出版, 发行, 公开, 发表, 宣传, 公布 vi. 出版, 发行」
- **建议：`keep`**

## dresses → dress
- rank：form 3949 / lemma 5148 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「连衣裙；服装」 / lemma「穿衣；打扮」
- ECDICT：form「n. 衣服( dress的名词复数 ); 装饰; 连衣裙; 礼服」 / lemma「n. 服装, 覆盖物 vi. 穿着 vt. 给...穿衣, 整理」
- **建议：`keep`**

## thrilled → thrill
- rank：form 3955 / lemma 5332 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「非常兴奋的；激动的」 / lemma「兴奋；激动」
- ECDICT：form「a. 非常兴奋的; 极为激动的 vt. “thrill”的过去式和过去分词」 / lemma「n. 震颤, 激动, 刺激性, 一阵激动 vi. 震颤, 颤抖, 激动 vt. 使激动, 使颤动」
- **建议：`keep`**

## disturbed → disturb
- rank：form 3973 / lemma 12300 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「不安的；扰乱的」 / lemma「打扰，扰乱」
- ECDICT：form「a. 混乱的」 / lemma「vt. 扰乱, 妨碍, 使不安 [法] 滋扰, 扰乱」
- **建议：`keep`**

## wandering → wander
- rank：form 3975 / lemma 5820 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「漫游；徘徊」 / lemma「漫游；徘徊；走神」
- ECDICT：form「a. 漫游的, 徘徊的, 流浪的, 蜿蜒的 n. 闲逛, 流浪, 离题, 胡言乱语」 / lemma「vi. 游荡, 漫步, 徘徊, 迷路, 离题, 蜿蜒 vt. 在...漫游」
- **建议：`keep`**

## hans → han
- rank：form 3980 / lemma 3008 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「汉斯（男子名）」 / lemma「汉（中国朝代/民族）」
- ECDICT：form「n. 德国人或荷兰人的绰号；汉斯（男子名）」 / lemma「n. 汉朝；汉民族」
- **建议：`keep`**

## chased → chase
- rank：form 3983 / lemma 6273 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「追逐（过去式）」 / lemma「追逐；追赶」
- ECDICT：form「vt. 追捕（chase的过去式与过去分词形式）」 / lemma「n. 追求, 狩猎, 追逐 vt. 追捕, 追逐, 雕刻, 在...上镶嵌宝石 vi. 追赶, 奔跑」
- **建议：`keep`**

## boobs → boob
- rank：form 3986 / lemma 8912 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乳房（俚语）」 / lemma「乳房；蠢人」
- ECDICT：form「n. 乳房」 / lemma「n. 笨蛋, 蠢材」
- **建议：`keep`**

## reaching → reach
- rank：form 3996 / lemma 5847 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「到达；伸手」 / lemma「到达；伸手；触及」
- ECDICT：form「v. 到达( reach的现在分词 ); 联络; 伸出手臂, 延伸」 / lemma「n. 伸出, 延伸, 区域, 范围, 流域, 岬 vt. 到达, 达到, 伸出, 延伸, 影响 vi. 达到, 延伸, …」
- **建议：`keep`**

## funds → fund
- rank：form 4006 / lemma 8208 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「资金；基金」 / lemma「基金；储备；资金」
- ECDICT：form「n. 基金；资金, 现金（fund的复数）」 / lemma「n. 基金, 资金, 存款, 财源, 贮藏 vt. 提供资金, 积累」
- **建议：`keep`**

## strings → string
- rank：form 4007 / lemma 4974 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「弦；细绳（复数）」 / lemma「细绳；一串」
- ECDICT：form「n. 附带条件, 弦乐部分, 弦乐器」 / lemma「n. 线, 细绳, 一串, 字符串 vt. 串起, 成串, 收紧, 缚, 扎 vi. 成一串 [计] 字符串, 串」
- **建议：`keep`**

## engineering → engineer
- rank：form 4013 / lemma 2781 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「工程；工程学」 / lemma「工程师」
- ECDICT：form「n. 工程学, 工程, 操纵 [化] 机器; 机器学」 / lemma「n. 工程师, 工兵 vt. 设计, 监造, 精明地处理, 策划」
- **建议：`?`**

## vegetables → vegetable
- rank：form 4028 / lemma 6019 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「蔬菜（复数）」 / lemma「蔬菜」
- ECDICT：form「n. 菜类；蔬菜（vegetable的复数形式）」 / lemma「n. 蔬菜, 植物, 无精打采之人 a. 蔬菜的, 植物的」
- **建议：`keep`**

## euros → euro
- rank：form 4029 / lemma 9225 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「欧元（复数）」 / lemma「欧元」
- ECDICT：form「n. 欧元；欧洛斯风；带雨东南暴风（euro复数）」 / lemma「n. 欧元（欧盟的统一货币单位）」
- **建议：`keep`**

## spinning → spin
- rank：form 4031 / lemma 5385 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「旋转；纺纱」 / lemma「旋转；转动」
- ECDICT：form「n. 纺纱 [化] 纺丝」 / lemma「n. 旋转, 自旋, 疾驰, 情绪低落 vt. 纺织, 纺, 使旋转, 编造 vi. 纺纱, 吐丝, 作茧, 结网, 旋…」
- **建议：`keep`**

## rolls → roll
- rank：form 4032 / lemma 6306 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「卷；面包卷（复数）」 / lemma「滚动；翻滚」
- ECDICT：form「n. 面包卷；捆；卷轴；辊碎机；滚动（roll的复数）」 / lemma「n. 卷, 滚动, 名单, 案卷, 压路机 vi. 滚, 滚动, 飘流, 起伏, 卷, 绕 vt. 使滚动, 卷, 绕」
- **建议：`keep`**

## rejected → reject
- rank：form 4040 / lemma 5623 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「拒绝（过去式）」 / lemma「拒绝；否决」
- ECDICT：form「n. 被弃之物, 落选者 a. 拒绝的 v. 拒绝( reject的过去式和过去分词 ); （因质量差）不用; 排斥; …」 / lemma「n. 被拒之人, 被弃之物, 不合格品, 次品 vt. 拒绝, 抵制, 否决, 驳回, 丢弃, 呕出」
- **建议：`keep`**

## backs → back
- rank：form 4043 / lemma 5292 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「背部；后面（复数）」 / lemma「背部；后面」
- ECDICT：form「n. 后背, 脊背；后卫（back的复数形式）」 / lemma「a. 后面的 vt. 使后退, 支持 vi. 倒退, 背靠 adv. 向后地 n. 背部, 后面」
- **建议：`keep`**

## muscles → muscle
- rank：form 4044 / lemma 7875 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「肌肉（复数）」 / lemma「肌肉；力量」
- ECDICT：form「n. 肌肉（muscle的复数）」 / lemma「n. 肌肉, 臂力 [医] 肌」
- **建议：`keep`**

## waking → wake
- rank：form 4053 / lemma 6399 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「醒着的；醒来的」 / lemma「醒来；唤醒」
- ECDICT：form「a. 醒着的」 / lemma「vt. 叫醒, 激发 vi. 醒来, 醒着, 觉醒, 活跃起来 n. 守侯, 守夜, 尾迹, 痕迹」
- **建议：`keep`**

## swore → swear
- rank：form 4065 / lemma 6324 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发誓；咒骂（swear 过去式）」 / lemma「发誓；咒骂」
- ECDICT：form「swear的过去式 [法] 宣过誓的, 宣誓证明的, 决不改变的」 / lemma「vt. 发誓, 咒骂, 使宣誓 vi. 发誓, 诅咒 n. 诅咒, 誓言」
- **建议：`keep`**

## blaring → blare
- rank：form 4066 / lemma 26089 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刺耳的；响亮的」 / lemma「发出刺耳响声」
- ECDICT：form「v. （喇叭或其他高音器具）刺耳地大声鸣响( blare的现在分词 ); 嘟嘟地发出; 高声发出; （音乐）声音响亮」 / lemma「n. 巨响, 吼叫声, 光泽 vi. 高声鸣叫, 大叫 vt. 大声喊出」
- **建议：`keep`**

## vanished → vanish
- rank：form 4072 / lemma 6400 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「消失；不见了」 / lemma「消失；突然不见」
- ECDICT：form「n. 销声匿迹, 无影无踪（美国电视连续剧剧名）」 / lemma「vi. 消失, 不见, 成为零」
- **建议：`keep`**

## sniffles → sniffle
- rank：form 4075 / lemma 40848 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鼻塞；抽鼻子（复数）」 / lemma「抽鼻子；吸鼻子」
- ECDICT：form「n. 抽噎, 抽噎声( sniffle的名词复数 ) v. 抽鼻子( sniffle的第三人称单数 ); 抽噎」 / lemma「vi. 吸着鼻子说话, 抽鼻涕 n. 抽鼻子」
- **建议：`keep`**

## intentions → intention
- rank：form 4078 / lemma 11400 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「意图；目的（复数）」 / lemma「意图；打算」
- ECDICT：form「n. 意图( intention的复数形式 ); 意向; 目的; 打算」 / lemma「n. 意图, 目的, 含义 [医] 愈合, 意向」
- **建议：`keep`**

## entitled → entitle
- rank：form 4087 / lemma 13200 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「有资格的；自以为是的」 / lemma「给…权利；给…题名」
- ECDICT：form「a. 有资格的；给与名称的」 / lemma「vt. 给...权利, 取名为, 给予名称, 叫做 [法] 给...权利, 使有资格, 称呼」
- **建议：`keep`**

## coins → coin
- rank：form 4090 / lemma 8205 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「硬币（复数）」 / lemma「硬币；钱币；创造新词」
- ECDICT：form「n. 硬币（coin的复数）」 / lemma「n. 硬币, 金钱, 货币 vt. 铸币, 创造, 杜撰」
- **建议：`keep`**

## sniffs → sniff
- rank：form 4095 / lemma 7017 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗅；抽鼻子」 / lemma「嗅；抽鼻子」
- ECDICT：form「v. 以鼻吸气, 嗅, 闻( sniff的第三人称单数 ); 抽鼻子（尤指哭泣、患感冒等时出声地用鼻子吸气）; 抱怨, …」 / lemma「n. 以鼻吸气, 嗅, 气息 vi. 嗅, 蔑视, 嗤之以鼻 vt. 闻, 用力吸, 发觉」
- **建议：`keep`**

## offended → offend
- rank：form 4100 / lemma 12600 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「被冒犯的；生气的」 / lemma「触怒，冒犯」
- ECDICT：form「a. 不舒服, 生气」 / lemma「v. 犯罪, 冒犯, 违反, 进攻」
- **建议：`keep`**

## fled → flee
- rank：form 4103 / lemma 8097 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「逃跑（flee 过去式）」 / lemma「逃跑；逃离；迅速离开」
- ECDICT：form「v. 消逝；逃走（flee的过去分词）」 / lemma「vt. 逃避, 逃跑, 逃走 vi. 逃, 消失」
- **建议：`keep`**

## beers → beer
- rank：form 4104 / lemma 4803 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「啤酒（复数）」 / lemma「啤酒；一杯啤酒」
- ECDICT：form「n. 比尔斯（姓氏）」 / lemma「n. 啤酒 [化] 啤酒」
- **建议：`keep`**

## boxing → box
- rank：form 4105 / lemma 4947 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拳击；装箱」 / lemma「盒子；箱」
- ECDICT：form「n. 拳击 [医] 围模(牙科)」 / lemma「n. 盒子, 箱, 方框, 一巴掌 vt. 装...入盒中, 装箱, 打耳光 vi. 拳击 [计] 方框」
- **建议：`keep`**

## snakes → snake
- rank：form 4107 / lemma 4329 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蛇（复数）」 / lemma「蛇」
- ECDICT：form「n. 蛇( snake的名词复数 ); 奸险的人; 卑劣的人; 蛇形浮动汇率制」 / lemma「n. 蛇, 阴险的人 vi. 曲折行进 vt. 迂回, 拉, 急抽」
- **建议：`keep`**

## convicted → convict
- rank：form 4110 / lemma 6036 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被定罪的」 / lemma「定罪；宣判有罪」
- ECDICT：form「v. 宣判有罪( convict的过去式 )」 / lemma「n. 囚犯, 罪犯 vt. 宣告有罪, 使知罪」
- **建议：`keep`**

## roots → root
- rank：form 4111 / lemma 4482 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「根；根源（复数）」 / lemma「根；根源」
- ECDICT：form「n. 乡土感情, 归根之情」 / lemma「n. 根, 根本, 根源, 基础, 底部 vt. 使扎根, 使固定, 根除, 肃清, 搜出, 用鼻拱 vi. 生根, 固…」
- **建议：`keep`**

## shares → share
- rank：form 4112 / lemma 6078 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「股份；份额（复数）」 / lemma「股份；份额；一份」
- ECDICT：form「n. 股份（share的复数形式）」 / lemma「n. 部分, 参与, 一份, 参股, 份额 vt. 均分, 分担, 分享, 分配, 共有 vi. 分享 [计] 共享; …」
- **建议：`keep`**

## confusing → confuse
- rank：form 4118 / lemma 6656 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人困惑的」 / lemma「使困惑；混淆」
- ECDICT：form「a. 令人困惑的；混淆的；混乱的」 / lemma「vt. 使混乱, 使狼狈, 使困惑 [法] 混淆」
- **建议：`keep`**

## las → la
- rank：form 4121 / lemma 689 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「激光（laser的旧拼法）」 / lemma「洛杉矶；啦（音）」
- ECDICT：form「abbr. 阿拉伯国家联盟（League of Arab States）；大气科学实验室（Laboratory of A…」 / lemma「[医] 镧(57号元素)」
- **建议：`keep`**

## seeking → seek
- rank：form 4124 / lemma 5967 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「寻找；寻求（seek的现在分词）」 / lemma「寻找；寻求；探索」
- ECDICT：form「[计] 查找, 寻找, 故障检查」 / lemma「vt. 寻求, 寻找, 探索, 追求, 搜索, 请求 vi. 寻找, 搜索 [计] 查找」
- **建议：`keep`**

## contacts → contact
- rank：form 4132 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「联系人；人脉；隐形眼镜」 / lemma「接触；联系」
- ECDICT：form「n. 联系人；联络方式；触体（contact的复数形式）」 / lemma「n. 联系, 交际, 熟人, 接触 vi. 接触, 联系 vt. 使接触」
- **建议：`keep`**

## hostages → hostage
- rank：form 4137 / lemma 14200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「人质（复数）」 / lemma「人质；抵押品」
- ECDICT：form「n. 人质( hostage的复数形式 )」 / lemma「n. 人质, 抵押品 [经] 人质, 抵押品」
- **建议：`keep`**

## debts → debt
- rank：form 4142 / lemma 6048 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「债务；欠款（复数）」 / lemma「债务；欠款」
- ECDICT：form「n. 负债类, 债务（debt的复数形式）」 / lemma「n. 债务, 罪过 [经] 借款, 欠款, 债务」
- **建议：`keep`**

## expenses → expense
- rank：form 4157 / lemma 4955 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「费用；开支（复数）」 / lemma「费用；开支」
- ECDICT：form「n. 开支, 经费, 费用 [法] 开支, 支出, 经费」 / lemma「n. 费用, 代价, 开支, 损失 [经] 费用, 开支, 将支出转为费用」
- **建议：`keep`**

## meals → meal
- rank：form 4160 / lemma 4824 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「餐；饭（复数）」 / lemma「一餐；膳食；粗粉」
- ECDICT：form「n. 膳食；谷类（meal的复数）」 / lemma「n. 一餐, 膳食, 粗粉 vi. 进餐」
- **建议：`keep`**

## dealt → deal
- rank：form 4171 / lemma 6036 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「处理；分配（deal的过去式）」 / lemma「交易；协议；待遇」
- ECDICT：form「deal的过去式和过去分词」 / lemma「n. 交易, 协定, 数量, 买卖, 松木板 vi. 处理, 应付, 做生意 vt. 分配, 发牌, 给予 [计] 发牌」
- **建议：`keep`**

## rang → ring
- rank：form 4175 / lemma 5109 ｜ type `pd` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「响铃；打电话（ring的过去式）」 / lemma「戒指；环状物」
- ECDICT：form「ring的过去式」 / lemma「n. 环, 环形物, 拳击场, 戒指, 角逐, 小集团, 铃声, 钟声, 声调 vt. 包围, 套住, 按铃, 敲钟 v…」
- **建议：`keep`**

## owners → owner
- rank：form 4182 / lemma 6066 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「所有者；物主（复数）」 / lemma「所有者；物主；业主」
- ECDICT：form「n. 所有者；业主（owner的复数）」 / lemma「n. 拥有者, 物主, 所有人 [经] 所有者, 物主, 业主」
- **建议：`keep`**

## haunted → haunt
- rank：form 4203 / lemma 6973 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「闹鬼的；萦绕心头的」 / lemma「萦绕；常去；闹鬼」
- ECDICT：form「a. 常出现鬼的, 闹鬼的」 / lemma「n. 常到的地方, 生息地 vt. 常到, 出没于, 萦绕于 vi. 出没, 作祟」
- **建议：`keep`**

## distracted → distract
- rank：form 4204 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「心烦意乱的；分心的」 / lemma「分散注意力；使心烦」
- ECDICT：form「a. 心烦意乱的」 / lemma「vt. 转移, 分心, 使发狂」
- **建议：`keep`**

## owes → owe
- rank：form 4228 / lemma 6060 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「欠；归功于」 / lemma「欠；欠债；归功于」
- ECDICT：form「v. 感恩；亏欠；负债（owe的单三形式）」 / lemma「vt. 亏欠, 负...债, 归功于, 怀有, 应给予, 感恩 vi. 欠钱」
- **建议：`keep`**

## prices → price
- rank：form 4231 / lemma 6042 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「价格（复数）」 / lemma「价格；价钱；代价」
- ECDICT：form「n. 价格（price的复数）」 / lemma「n. 价格, 代价, 价值 vt. 定...的价格」
- **建议：`keep`**

## cured → cure
- rank：form 4244 / lemma 6396 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「治愈（过去式）」 / lemma「治愈；治疗」
- ECDICT：form「a. 治愈的；熟化的；熏制的」 / lemma「n. 治疗, 治愈, 治疗法 vt. 治疗, 治愈, 改正, 腌制, 加工处理, 使硫化 vi. 受治疗, 被加工处理,…」
- **建议：`keep`**

## dove → dive
- rank：form 4257 / lemma 5772 ｜ type `p` ｜ src `A` ｜ flags `src-a-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸽子；斑鸠」 / lemma「跳水；潜水；俯冲」
- ECDICT：form「n. 鸽子 dive的过去式」 / lemma「n. 潜水, 跳水 vi. 跳水, 俯冲, 猛冲 vt. 把...突然伸入」
- **建议：`keep`**

## jewels → jewel
- rank：form 4258 / lemma 5833 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「珠宝；宝石（复数）」 / lemma「宝石；珍品」
- ECDICT：form「n. 珠宝；宝石（jewel的复数形式）」 / lemma「n. 珠宝, 贵重物, 镶珠宝的饰物 vt. 饰以珠宝, 镶以宝石」
- **建议：`keep`**

## roars → roar
- rank：form 4263 / lemma 5960 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吼叫；咆哮」 / lemma「吼叫；咆哮」
- ECDICT：form「n. 怒吼」 / lemma「n. 吼, 咆哮, 轰鸣 vi. 吼, 大声说出, 叫喊, 喧闹 vt. 呼喊, 使轰鸣」
- **建议：`keep`**

## survivors → survivor
- rank：form 4280 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「幸存者（复数）」 / lemma「幸存者，生还者」
- ECDICT：form「n. 幸存者, 残存者, 生还者( survivor的复数形式 )」 / lemma「n. 生还者, 幸存者 [法] 生还者, 生存者, 辛存者」
- **建议：`keep`**

## slams → slam
- rank：form 4289 / lemma 5524 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「猛击；砰地关上」 / lemma「猛击；砰地关上」
- ECDICT：form「砰然声；批评, 猛击」 / lemma「n. 砰然声, 猛然, 猛烈的抨击 vt. 猛然关上, 砰地关上, 猛烈抨击 vi. 砰地关上, 猛攻」
- **建议：`keep`**

## hats → hat
- rank：form 4295 / lemma 5064 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「帽子（复数）」 / lemma「帽子；有边帽」
- ECDICT：form「abbr. 转换终端应用程序（Host Access Transformation Services）」 / lemma「n. 帽子 vt. 给...戴帽子」
- **建议：`keep`**

## follows → follow
- rank：form 4303 / lemma 5913 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跟随；遵循」 / lemma「跟随；沿着；遵循」
- ECDICT：form「n. 跟随；遵照（follow的复数）」 / lemma「vt. 跟随, 沿行, 遵循, 追求 vi. 跟随, 接着 n. 跟随, 追随」
- **建议：`keep`**

## chimes → chime
- rank：form 4310 / lemma 11804 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「钟声；风铃（复数）」 / lemma「鸣响；钟声；协调」
- ECDICT：form「v. 敲出和谐的乐声( chime的第三人称单数 ); 报（时）; 插嘴; （以…）打断谈话」 / lemma「n. 钟声, 钟, 和谐 vi. 鸣, 奏出谐和的乐声, 和谐 vt. 敲出和谐的声音, 打钟报时, 重复说」
- **建议：`keep`**

## decades → decade
- rank：form 4312 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「十年（复数）」 / lemma「十年」
- ECDICT：form「n. 十年, 十年间( decade的复数形式 )」 / lemma「n. 十年, 十」
- **建议：`keep`**

## bowling → bowl
- rank：form 4313 / lemma 4857 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「保龄球运动」 / lemma「碗；钵；投球」
- ECDICT：form「n. 保龄球戏」 / lemma「n. 碗, 木球, 大酒杯 v. 滚木球, 快而稳地行驶」
- **建议：`keep`**

## buttons → button
- rank：form 4314 / lemma 5172 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「纽扣；按钮（复数）」 / lemma「纽扣；按钮」
- ECDICT：form「n. 纽扣；按钮（button的复数形式）」 / lemma「n. 钮扣, 按钮 vi. 扣住 vt. 钉钮扣于, 扣紧 [计] 按钮」
- **建议：`keep`**

## ruining → ruin
- rank：form 4318 / lemma 1396 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「毁坏；破坏」 / lemma「毁坏；破坏」
- ECDICT：form「v. 破坏( ruin的现在分词 ); 毁掉; 使破产; 使沦落」 / lemma「n. 毁灭, 推翻, 废墟 vi. 毁灭, 衰败, 破坏, 破产, 堕落 vt. 使毁灭, 毁坏, 使破产」
- **建议：`?`**

## whimpers → whimper
- rank：form 4332 / lemma 22799 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呜咽；抽泣」 / lemma「呜咽；抽泣」
- ECDICT：form「n. 啜泣声, 呜咽声( whimper的名词复数 ); 啜泣者 v. （微弱或惊恐地）啜泣, 呜咽( whimper的…」 / lemma「n. 抽泣, 呜咽, 啜泣, 哭诉 vi. 呜咽, 啜泣, 抽噎地哭 vt. 呜咽着说, 啜泣着说」
- **建议：`keep`**

## sworn → swear
- rank：form 4333 / lemma 6324 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「宣誓过的；发过誓的」 / lemma「发誓；咒骂」
- ECDICT：form「swear的过去分词」 / lemma「vt. 发誓, 咒骂, 使宣誓 vi. 发誓, 诅咒 n. 诅咒, 誓言」
- **建议：`keep`**

## proven → prove
- rank：form 4335 / lemma 663 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被证实的；经过验证的」 / lemma「证明；证实」
- ECDICT：form「prove的过去分词」 / lemma「vt. 证明, 查验, 检验, 勘探, 显示 vi. 证明是」
- **建议：`?`**

## contacted → contact
- rank：form 4344 / lemma 12200 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「联系；接触」 / lemma「接触；联系」
- ECDICT：form「v. 联络（通过电话或信件）( contact的过去式和过去分词 ); 使接触; 与（某人）接触（或交往）, 与…联系;…」 / lemma「n. 联系, 交际, 熟人, 接触 vi. 接触, 联系 vt. 使接触」
- **建议：`keep`**

## elected → elect
- rank：form 4348 / lemma 12822 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「选举；推选」 / lemma「选举；选择」
- ECDICT：form「vt. 选举, 推选」 / lemma「n. 当选人, 被选的人 a. 被选的, 选出的 vt. 选举, 选择 vi. 作选择」
- **建议：`keep`**

## dearest → dear
- rank：form 4361 / lemma 5430 ｜ type `t` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「最亲爱的；昂贵的」 / lemma「亲爱的；珍贵的」
- ECDICT：form「n. 最亲爱的人」 / lemma「n. 亲爱的人 a. 亲爱的, 昂贵的, 严重的, 急迫的 interj. 啊 adv. 深爱地, 高价地」
- **建议：`keep`**

## contains → contain
- rank：form 4365 / lemma 4490 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「包含；容纳」 / lemma「包含；容纳」
- ECDICT：form「v. 包含；容纳；包含某字符串（contain的单三形式）」 / lemma「vt. 包含, 容纳, 控制 vi. 自制」
- **建议：`keep`**

## bets → bet
- rank：form 4368 / lemma 6330 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赌注；打赌（复数）」 / lemma「打赌；下注」
- ECDICT：form「abbr. 北京英语水平考试（Beijing English Testing System）」 / lemma「n. 打赌, 赌注 v. 打赌」
- **建议：`keep`**

## inhales → inhale
- rank：form 4369 / lemma 10197 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「吸入；吸气」 / lemma「吸入；吸气」
- ECDICT：form「v. 吸入( inhale的第三人称单数 )」 / lemma「vt. 吸入 vi. 吸气」
- **建议：`keep`**

## accomplished → accomplish
- rank：form 4376 / lemma 5386 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有造诣的；完成的」 / lemma「完成；实现」
- ECDICT：form「a. 完成的, 实现的, 有造诣的, 熟练的, 善社交的」 / lemma「vt. 完成, 达到, 实现, 使完美」
- **建议：`keep`**

## politicians → politician
- rank：form 4378 / lemma 5491 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「政治家；政客（复数）」 / lemma「政治家；政客」
- ECDICT：form「n. 政治家( politician的复数形式 ); 政客, 玩弄权术者」 / lemma「n. 政客, 政治家, 从事党派政治的人 [法] 政客, 政治家」
- **建议：`keep`**

## bent → bend
- rank：form 4385 / lemma 5379 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「弯曲的；决意的」 / lemma「弯曲；使弯曲」
- ECDICT：form「a. 弯曲的, 决心的 n. 爱好 bend的过去式和过去分词」 / lemma「vi. 变弯曲, 屈服 vt. 使弯曲, 使屈服 n. 弯曲」
- **建议：`keep`**

## murmuring → murmur
- rank：form 4400 / lemma 13959 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「低声说；喃喃（现在分词）」 / lemma「低语；喃喃」
- ECDICT：form「n. 抱怨的声音；喃喃的声音」 / lemma「n. 低语, 低声的怨言 vi. 低语, 低声而言 vt. 低声说」
- **建议：`keep`**

## healing → heal
- rank：form 4415 / lemma 6393 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「治愈；康复」 / lemma「愈合；治愈」
- ECDICT：form「a. 治愈的, 恢复健康的 [计] 修复, 恢复」 / lemma「vi. 痊愈 vt. 使复原, 使和解, 治愈」
- **建议：`keep`**

## declared → declare
- rank：form 4431 / lemma 12600 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「宣布；申报（过去式）」 / lemma「宣布，宣告；申报」
- ECDICT：form「a. 公告的, 公然的」 / lemma「v. 宣布, 声明, 申报, 断言」
- **建议：`keep`**

## creaking → creak
- rank：form 4438 / lemma 15584 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘎吱作响（现在分词）」 / lemma「嘎吱作响」
- ECDICT：form「v. （门）嘎吱作响( creak的现在分词 )」 / lemma「n. 辗轧声, 嘎吱嘎吱声 vi. 作辗轧声, 发出辗轧声」
- **建议：`keep`**

## customs → custom
- rank：form 4451 / lemma 5045 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「海关；习俗（复数）」 / lemma「习俗；惯例；海关」
- ECDICT：form「n. 海关, 关卡, 关税 [经] 关税, 海关」 / lemma「n. 习惯, 风俗, 海关, 自定义 a. 定制的 [计] 定制; 自定义」
- **建议：`keep`**

## remembers → remember
- rank：form 4453 / lemma 5934 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「记得；想起」 / lemma「记得；想起；记住」
- ECDICT：form「v. 记得, 牢记( remember的第三人称单数 ); 纪念; 记着; 回想起」 / lemma「vt. 记得, 回忆起, 记住, 铭记, 纪念 vi. 记得」
- **建议：`keep`**

## rolled → roll
- rank：form 4462 / lemma 6306 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「滚动；卷（过去式）」 / lemma「滚动；翻滚」
- ECDICT：form「a. 辗压的, 辊轧的, 轧制的」 / lemma「n. 卷, 滚动, 名单, 案卷, 压路机 vi. 滚, 滚动, 飘流, 起伏, 卷, 绕 vt. 使滚动, 卷, 绕」
- **建议：`keep`**

## possessed → possess
- rank：form 4468 / lemma 5048 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「拥有；着魔的」 / lemma「拥有；具有；支配」
- ECDICT：form「a. 中邪魔的, 被妖魔缠住的」 / lemma「vt. 持有, 占有, 拥有, 克制, 支配, 迷住 [法] 持有, 占有, 具有」
- **建议：`keep`**

## guessed → guess
- rank：form 4476 / lemma 5925 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「猜测；猜中」 / lemma「猜测；认为」
- ECDICT：form「v. 猜( guess的过去式和过去分词 ); （引出令人惊奇或激动的事）你猜; 猜对; 猜中」 / lemma「n. 猜测, 臆测 v. 猜测, 臆测」
- **建议：`keep`**

## ribs → rib
- rank：form 4502 / lemma 6369 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「肋骨（复数）」 / lemma「肋骨」
- ECDICT：form「n. 肋骨；排骨（rib的复数）」 / lemma「n. 肋骨, 肋状物, 笑话 vt. 装肋状物于, 戏弄」
- **建议：`keep`**

## regards → regard
- rank：form 4504 / lemma 4748 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「问候；致意」 / lemma「认为；注视；关于」
- ECDICT：form「n. 问候, 致意」 / lemma「n. 关心, 注意, 尊敬, 关系, 问候 vt. 视为, 注意, 考虑, 和...有关, 看待 vi. 注视, 注意」
- **建议：`keep`**

## snoring → snore
- rank：form 4508 / lemma 12497 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打鼾」 / lemma「打鼾；打呼噜」
- ECDICT：form「v. 打呼噜, 打鼾( snore的现在分词 )」 / lemma「n. 鼾声, 打鼾 vi. 打鼾 vt. 打鼾度过」
- **建议：`keep`**

## caring → care
- rank：form 4513 / lemma 5421 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「关心的；体贴的」 / lemma「关心；在乎」
- ECDICT：form「a. 有同情心的；表示或感到关怀或关心的」 / lemma「n. 小心, 照料, 忧虑 vi. 关心, 介意 vt. 在意, 喜欢」
- **建议：`keep`**

## carries → carry
- rank：form 4516 / lemma 8106 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「携带；搬运」 / lemma「携带；搬运；承载」
- ECDICT：form「v. 传递；携带；运载；怀孕（carry的第三人称单数形式）」 / lemma「n. 进位, 射程, 运载 vt. 携带, 运送, 支持, 传送, 包含 vi. 被携带, 能达到 [计] 进位; 进位…」
- **建议：`keep`**

## sweets → sweet
- rank：form 4530 / lemma 4776 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「糖果；甜食（复数）」 / lemma「甜的；可爱的；糖果」
- ECDICT：form「n. 糖果；甜食（sweet的复数）」 / lemma「n. 甜蜜, 糖果, 情人 a. 甜的, 芳香的, 悦耳的, 漂亮的, 和蔼的, 不咸的, 灵活的, 轻快的」
- **建议：`keep`**

## panties → panty
- rank：form 4531 / lemma 17402 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「女式内裤」 / lemma「女式内裤」
- ECDICT：form「n. 女式短裤」 / lemma「n. 女裤；童裤（等于panties）」
- **建议：`keep`**

## explosives → explosive
- rank：form 4536 / lemma 5121 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「炸药（复数）」 / lemma「爆炸性的；易爆的」
- ECDICT：form「n. 爆炸物, 炸药；爆炸品（explosive的复数）」 / lemma「n. 炸药, 爆破音 a. 易爆发的, 爆炸的, 暴躁的」
- **建议：`keep`**

## scores → score
- rank：form 4541 / lemma 6258 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「分数；许多（复数）」 / lemma「得分」
- ECDICT：form「n. 大量, 众多; 二十( score的名词复数 ); （游戏或比赛中的）得分; 大量; 百分数」 / lemma「n. 得分, 抓痕, 二十个, 刻痕, 帐目, 乐谱, 起跑线, 终点线, 大量 vt. 刻划, 划线, 获得, 评价,…」
- **建议：`keep`**

## doomed → doom
- rank：form 4548 / lemma 5934 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「注定失败的；劫数难逃的」 / lemma「厄运；毁灭」
- ECDICT：form「a. 注定的；命定的」 / lemma「n. 厄运, 不幸, 法律, 宣告, 判决, 死亡 vt. 命中注定, 判决」
- **建议：`keep`**

## qualified → qualify
- rank：form 4549 / lemma 8866 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「合格的；有资格的」 / lemma「取得资格；使合格」
- ECDICT：form「a. 有资格的 [经] 合格的, 有条件的, 有限制的」 / lemma「vi. 取得资格, 有资格 vt. 使有资格, 使合格, 限定, 限制, 准予」
- **建议：`keep`**

## fireworks → firework
- rank：form 4554 / lemma 25153 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烟花；烟火（复数）」 / lemma「烟花；烟火」
- ECDICT：form「n. 烟火, 激烈争论 [化] 焰火」 / lemma「n. 烟火具, 烟火, 烟火信号弹, 焰火, 激情的表现」
- **建议：`keep`**

## rode → ride
- rank：form 4558 / lemma 5745 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「骑（ride 的过去式）」 / lemma「骑；乘坐」
- ECDICT：form「ride的过去式」 / lemma「n. 骑马, 乘坐, 乘车, 搭便车 vt. 骑, 乘坐, 压迫, 控制 vi. 骑马, 乘车, 漂游」
- **建议：`keep`**

## cakes → cake
- rank：form 4560 / lemma 4698 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蛋糕（复数）」 / lemma「蛋糕；饼状物」
- ECDICT：form「n. 蛋糕（cake的复数）」 / lemma「n. 蛋糕, 块, 饼 vt. 使结块, 加块状物于 vi. 结块」
- **建议：`keep`**

## occupied → occupy
- rank：form 4563 / lemma 8537 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被占用的；忙碌的」 / lemma「占据；占领」
- ECDICT：form「a. 已占用的；使用中的；无空闲的」 / lemma「vt. 占领, 占(时间、空间等), 住进, 担任, 使从事, 使全神贯注 [法] 占领, 占据, 占有」
- **建议：`keep`**

## nicer → nice
- rank：form 4564 / lemma 5505 ｜ type `r` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「更好的；更友好的」 / lemma「友好的；令人愉快的」
- ECDICT：form「a. 良好的」 / lemma「a. 美好的, 和蔼的, 正派的, 做得好的, 精密的, 细微的, 挑剔的, 谨慎的」
- **建议：`keep`**

## learnt → learn
- rank：form 4579 / lemma 5937 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only, highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「学习（learn 的过去式/过去分词）」 / lemma「学习；得知；学会」
- ECDICT：form「learn的过去式和过去分词」 / lemma「vt. 学习；认识到；得知」
- **建议：`keep`**

## coordinates → coordinate
- rank：form 4580 / lemma 10481 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「坐标（复数）」 / lemma「协调；配合」
- ECDICT：form「n. 坐标；相配之衣物」 / lemma「n. 同等的人(或物), 坐标 a. 同等的, 并列的 v. (使)协调」
- **建议：`keep`**

## shirts → shirt
- rank：form 4583 / lemma 5049 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「衬衫（复数）」 / lemma「衬衫；上衣」
- ECDICT：form「n. 衬衫（shirt的复数形式）」 / lemma「n. 衬衫, 内衣, 汗衫」
- **建议：`keep`**

## crawling → crawl
- rank：form 4593 / lemma 5373 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「爬行（现在分词）」 / lemma「爬行；匍匐前进」
- ECDICT：form「[化] 收缩龟裂; 漆膜收缩龟裂; 表面涂布不匀」 / lemma「n. 爬行, 匍匐而行, 养鱼池 v. 爬行」
- **建议：`keep`**

## stepping → step
- rank：form 4594 / lemma 8124 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「迈步；踩（现在分词）」 / lemma「踏；踩；迈步」
- ECDICT：form「[计] 步进式, 改变」 / lemma「n. 步骤, 步, 步幅, 脚步声, 踏级, 步伐, 短距离, 步态, 手段, 等级 vt. 踏, 以步测量, 跨步, …」
- **建议：`keep`**

## watches → watch
- rank：form 4611 / lemma 5001 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「观看；注视」 / lemma「手表；监视」
- ECDICT：form「n. 手表（watch的复数）」 / lemma「n. 观察, 手表, 看守, 守护, 监视, 值班人 vt. 看, 注视, 照顾, 看守, 守护, 监视 vi. 观看,…」
- **建议：`keep`**

## sailing → sail
- rank：form 4615 / lemma 6288 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「航行；帆船运动」 / lemma「航行；驾帆船」
- ECDICT：form「n. 航行, 航海术, 启航 a. 航行的」 / lemma「n. 帆, 篷, 帆船, 航程, 帆状物 vi. 航行, 启航, 张帆而行 vt. 航行于, 驾船」
- **建议：`keep`**

## rattling → rattle
- rank：form 4628 / lemma 7950 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咔嗒响的；令人不安的」 / lemma「发出咔嗒声；使慌乱」
- ECDICT：form「a. 格格作响的, 轻快的, 很好的 adv. 很, 非常」 / lemma「vt. 使嘎嘎响, 喋喋不休地说 vi. 格格响, 喋喋不休 n. 格格声, 拨浪鼓, 喋喋不休的话」
- **建议：`keep`**

## dreamt → dream
- rank：form 4630 / lemma 446 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做梦（dream 过去式）」 / lemma「梦；梦想」
- ECDICT：form「dream的过去式和过去分词」 / lemma「n. 梦, 空想, 愿望 v. 做梦, 想象, 梦想」
- **建议：`?`**

## wakes → wake
- rank：form 4644 / lemma 6399 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「醒来；唤醒」 / lemma「醒来；唤醒」
- ECDICT：form「v. 醒( wake的第三人称单数 ); 唤醒; 唤起（记忆）; 使再次感觉到」 / lemma「vt. 叫醒, 激发 vi. 醒来, 醒着, 觉醒, 活跃起来 n. 守侯, 守夜, 尾迹, 痕迹」
- **建议：`keep`**

## resting → rest
- rank：form 4656 / lemma 6270 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「休息；静止」 / lemma「休息」
- ECDICT：form「a. 静止的；休眠的」 / lemma「n. 休息, 睡眠, 安息, 稍息, 静止, 支架, 休息处, 其余者, 剩余部分 vi. 休息, 睡, 长眠, 安心,…」
- **建议：`keep`**

## rose → rise
- rank：form 4659 / lemma 5757 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「玫瑰；蔷薇」 / lemma「升起；上升；起身」
- ECDICT：form「n. 玫瑰, 蔷薇, 玫瑰色 a. 玫瑰色的, 玫瑰花的 vt. 使成玫瑰色 rise的过去式」 / lemma「n. 上升, 增加, 上涨, 高地, 升高, 出现 vi. 升起, 起身, 起立, 上升, 上涨, 增长, 高耸, 起义…」
- **建议：`keep`**

## howling → howl
- rank：form 4661 / lemma 7506 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嚎叫；呼啸」 / lemma「嗥叫；嚎叫」
- ECDICT：form「a. 咆哮的, 极大的, 荒凉的 n. 啸声」 / lemma「n. 嗥叫, 吠声, 号叫 vi. 狂吠, 咆哮, 呼啸 vt. 对...吼叫, 狂喊着说」
- **建议：`keep`**

## shops → shop
- rank：form 4668 / lemma 6027 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「商店」 / lemma「商店；店铺」
- ECDICT：form「n. 商店；商店用包装纸（shop的复数）」 / lemma「n. 商店, 工厂, 车间 vi. 购物, 到处寻找 vt. 选购」
- **建议：`keep`**

## squealing → squeal
- rank：form 4672 / lemma 6178 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫；告密」 / lemma「尖叫；告密」
- ECDICT：form「n. 振鸣声, 啸声；号叫」 / lemma「n. 尖叫, 抱怨 vi. 发出尖叫声, 高声埋怨 vt. 用尖声说」
- **建议：`keep`**

## choking → choke
- rank：form 4688 / lemma 5338 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「噎住；窒息（choke 的现在分词）」 / lemma「窒息；噎住」
- ECDICT：form「a. 窒息的, 气闷的, 透不过气来的 [化] 壅塞; 噎塞」 / lemma「vt. 窒息, 阻塞, 噎, 抑制 vi. 窒息, 阻塞, 噎 n. 窒息, 噎, 阻气门」
- **建议：`keep`**

## locks → lock
- rank：form 4694 / lemma 4899 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锁（复数）；头发」 / lemma「锁；一绺头发」
- ECDICT：form「n. 锁；水闸；锁定器（lock的复数）」 / lemma「n. 锁, 刹车, 水闸, 一缕头发 vt. 锁, 锁上, 拘禁, 隐藏, (用锁等)拴住, 刹住 vi. 锁住, (齿…」
- **建议：`keep`**

## advertising → advertise
- rank：form 4696 / lemma 11876 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「广告；广告业」 / lemma「做广告；宣传」
- ECDICT：form「n. 广告业, 广告 a. 广告的 [计] 发广告」 / lemma「vt. 做广告, 通知, 公布 vi. 做广告」
- **建议：`keep`**

## devoted → devote
- rank：form 4699 / lemma 10585 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「忠诚的；献身的」 / lemma「奉献；致力于」
- ECDICT：form「a. 投入的, 深爱的」 / lemma「vt. 投入于, 献身」
- **建议：`keep`**

## principles → principle
- rank：form 4701 / lemma 12050 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「原则；准则（复数）」 / lemma「原则；原理」
- ECDICT：form「n. 原则, 原理, 道义, 节操」 / lemma「n. 原则, 原理, 主义 [化] 原理」
- **建议：`keep`**

## isolated → isolate
- rank：form 4707 / lemma 12300 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「孤立的；隔离的」 / lemma「隔离；孤立」
- ECDICT：form「a. 孤立的, 孤零零的 [计] 隔离的, 绝缘的」 / lemma「vt. 使隔离, 使孤立, 使绝缘 n. 隔离种群」
- **建议：`keep`**

## dolls → doll
- rank：form 4726 / lemma 1996 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「玩偶；洋娃娃（复数）」 / lemma「洋娃娃；玩偶」
- ECDICT：form「n. 玩偶（doll的复数）」 / lemma「n. 洋娃娃, 无头脑的美丽女人」
- **建议：`keep`**

## rupees → rupee
- rank：form 4730 / lemma 17652 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「卢比（复数）」 / lemma「卢比（货币）」
- ECDICT：form「n. （印度、巴基斯坦、斯里兰卡等国的货币单位）卢比( rupee的复数形式 )」 / lemma「n. 卢比(印、巴等国货币单位)」
- **建议：`keep`**

## owed → owe
- rank：form 4734 / lemma 6060 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「欠（owe 的过去式）」 / lemma「欠；欠债；归功于」
- ECDICT：form「vbl. 感恩；亏欠；负债]」 / lemma「vt. 亏欠, 负...债, 归功于, 怀有, 应给予, 感恩 vi. 欠钱」
- **建议：`keep`**

## miracles → miracle
- rank：form 4746 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「奇迹（复数）」 / lemma「奇迹」
- ECDICT：form「n. 奇迹( miracle的复数形式 ); 奇事; 令人惊奇的事; 非凡的事」 / lemma「n. 奇迹, 奇事」
- **建议：`keep`**

## movements → movement
- rank：form 4757 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「运动；动作（复数）」 / lemma「运动；移动；趋势」
- ECDICT：form「n. 运动, 运转；运动健身；动作（movement的复数形式）」 / lemma「n. 运动, 动作, 运转, 移动, 倾向, 变化, 活动, 乐章 [医] 运动」
- **建议：`keep`**

## trading → trade
- rank：form 4759 / lemma 6033 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「贸易；交易」 / lemma「贸易；交易；行业」
- ECDICT：form「[经] 交易」 / lemma「n. 贸易, 商业, 交易, 生意, 职业, 顾客, 信风 vi. 进行交易, 做买卖, 经商, 对换, 购物 vt. …」
- **建议：`keep`**

## moans → moan
- rank：form 4765 / lemma 9755 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呻吟；抱怨」 / lemma「呻吟；抱怨」
- ECDICT：form「n. 呻吟；抱怨声；牢骚；悲叹声（moan的复数形式）」 / lemma「n. 呻吟, 悲叹 vi. 呻吟, 抱怨, 悲叹 vt. 呻吟着说」
- **建议：`keep`**

## classified → classify
- rank：form 4778 / lemma 23411 ｜ type `dp` ｜ src `AB` ｜ flags `highfreq-before, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「机密的；分类的」 / lemma「分类；归类」
- ECDICT：form「a. 分类的, 被归入某类的, 被指定为机密的 [建] 分了类的, 分了级的」 / lemma「vt. 分类, 归类, 分等 [建] 分类, 分级, 分粒」
- **建议：`keep`**

## measures → measure
- rank：form 4780 / lemma 8343 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「措施；量度」 / lemma「测量；衡量」
- ECDICT：form「n. 措施；层组（measure的复数）」 / lemma「n. 尺寸, 量度器, 量度标准, 测量, 量具, 程度, 范围, 限度, 分寸, 措施, 方法 vt. 测量, 测度,…」
- **建议：`keep`**

## lifted → lift
- rank：form 4808 / lemma 5367 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「举起；抬起」 / lemma「举起；抬起」
- ECDICT：form「a. 提升的」 / lemma「n. 举起, 帮助, 昂扬, 电梯 vt. 升高, 提高, 鼓舞, 清偿, 空运, 举起, 剽窃 vi. 升起, 消散,…」
- **建议：`keep`**

## evans → evan
- rank：form 4825 / lemma 3213 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「埃文斯（姓氏）」 / lemma「埃文（男子名）」
- ECDICT：form「n. 埃文斯（姓氏）」 / lemma「n. 埃文（男子名）」
- **建议：`keep`**

## dragging → drag
- rank：form 4827 / lemma 5853 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拖；拉」 / lemma「拖；拉；拽」
- ECDICT：form「[计] 牵引, 慢移动」 / lemma「n. 拖, 拖累 v. 拖累, 拖拉, 沉重缓慢地走, 拖动 [计] 拖动」
- **建议：`keep`**

## knives → knife
- rank：form 4833 / lemma 4932 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刀（复数）」 / lemma「刀；小刀」
- ECDICT：form「pl. 刀子」 / lemma「n. 小刀, 匕首 vt. 切割, 伤害, 切, 戳 vi. 劈开, 穿过」
- **建议：`keep`**

## feathers → feather
- rank：form 4841 / lemma 5575 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「羽毛」 / lemma「羽毛」
- ECDICT：form「n. 羽状裂缝；翅膀；羽毛（feather的复数）」 / lemma「n. 羽毛 vi. 长羽毛 vt. 用羽毛装饰」
- **建议：`keep`**

## swords → sword
- rank：form 4850 / lemma 6294 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「剑；刀剑」 / lemma「剑；刀」
- ECDICT：form「n. 宝剑（sword的复数）」 / lemma「n. 刀, 剑, 战争, 武力, 剑状物」
- **建议：`keep`**

## floors → floor
- rank：form 4872 / lemma 4872 ｜ type `s` ｜ src `AB` ｜ flags `rank-tie`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地板；楼层」 / lemma「地板；楼层」
- ECDICT：form「n. 楼地面；地板；楼层；层数（floor的复数）」 / lemma「n. 地板, 楼层, 底部, 底价 vt. 铺地板, 打倒 n. 地面, 地板, 基底 [计] 基底」
- **建议：`?`**

## opposed → oppose
- rank：form 4879 / lemma 8000 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「反对的；对立的」 / lemma「反对；对抗」
- ECDICT：form「a. 反对的, 敌对的, 对抗的, 相对的 [机] 反对的, 相反的, 对立的」 / lemma「vt. 反对, 以...对抗, 抗争 vi. 反对」
- **建议：`keep`**

## tourists → tourist
- rank：form 4881 / lemma 5330 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「游客；旅游者」 / lemma「游客；旅游者」
- ECDICT：form「n. 旅行者, 观光客( tourist的名词复数 )」 / lemma「n. 观光客, 旅行者 a. 旅游的」
- **建议：`keep`**

## sneaking → sneak
- rank：form 4882 / lemma 5799 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「偷偷地走；潜行」 / lemma「偷偷地走；溜；偷带」
- ECDICT：form「a. 偷偷逃走的, 暗中的, 卑微的 [法] 隐密的, 鬼祟的, 卑怯的」 / lemma「vi. 鬼鬼祟祟做事 vt. 偷偷地做 n. 鬼鬼祟祟的人, 偷偷摸摸的行为, 帆布胶底运动鞋 a. 暗中进行的」
- **建议：`keep`**

## races → race
- rank：form 4896 / lemma 5787 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「比赛；种族」 / lemma「赛跑；竞速；疾驰」
- ECDICT：form「n. 赛马会」 / lemma「n. 种族, 人种, 赛跑, 比赛, 急流, 人类, 同道, 姜根 vi. 赛跑, 竞赛, 疾走 vt. 与...赛跑,…」
- **建议：`keep`**

## reaches → reach
- rank：form 4903 / lemma 5847 ｜ type `3` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「到达；伸手」 / lemma「到达；伸手；触及」
- ECDICT：form「n. 河段；流域；（上、中或下）游; （外）围；（远）处; （组织或机构中的）层级」 / lemma「n. 伸出, 延伸, 区域, 范围, 流域, 岬 vt. 到达, 达到, 伸出, 延伸, 影响 vi. 达到, 延伸, …」
- **建议：`keep`**

## springs → spring
- rank：form 4917 / lemma 5700 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「春天；泉水；弹簧」 / lemma「泉水；春天」
- ECDICT：form「n. 斯普林斯（南非东部城市名）」 / lemma「n. 春天, 弹簧, 跳跃, 弹性, 活力, 泉, 源泉 a. 春天的 vi. 跳, 弹跳, 涌出, 生长, 裂开, 高…」
- **建议：`keep`**

## kicks → kick
- rank：form 4920 / lemma 5358 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「踢；踹」 / lemma「踢；踹」
- ECDICT：form「n. 踢球；腿法；冲击力（kick的复数）」 / lemma「n. 踢, 反冲, 后座力, 凹底 vi. 踢, 反抗, 反冲 vt. 踢, 反冲」
- **建议：`keep`**

## neighbours → neighbour
- rank：form 4932 / lemma 4994 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「邻居（复数）」 / lemma「邻居」
- ECDICT：form「n. 邻居( neighbour的名词复数 ); 邻近的人[物]; 邻国; 世人」 / lemma「n. 邻居, 邻接的东西, 邻国, 邻座, 邻人, 世人 a. 邻接的, 邻近的 vi.vt. 邻近, 与...结邻, …」
- **建议：`keep`**

## nailed → nail
- rank：form 4933 / lemma 4962 ｜ type `d` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「钉住；搞定（过去式）」 / lemma「钉子；指甲」
- ECDICT：form「a. 用钉钉牢的」 / lemma「n. 钉子, 指甲 vt. 用钉钉牢, 使固定, 截住, 揭露」
- **建议：`keep`**

## betting → bet
- rank：form 4939 / lemma 6330 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打赌（现在分词）」 / lemma「打赌；下注」
- ECDICT：form「n. 打赌 [法] 打赌, 赌博」 / lemma「n. 打赌, 赌注 v. 打赌」
- **建议：`keep`**

## pancakes → pancake
- rank：form 4940 / lemma 9079 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「薄煎饼（复数）」 / lemma「薄煎饼；烙饼」
- ECDICT：form「n. 烙饼( pancake的复数形式 ); （尤指舞台化装用的）粉饼; 完全平的; 非常平的」 / lemma「n. 薄烤饼, 薄煎饼, 烙饼」
- **建议：`keep`**

## grades → grade
- rank：form 4949 / lemma 8325 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「成绩；等级（复数）」 / lemma「分数；年级」
- ECDICT：form「n. 分数；等级（grade的复数形式）」 / lemma「n. 等级, 年级, 阶段, 成绩, 程度, 坡度, 斜坡 vt. 分等, 分级, 评分 vi. 属于某等级, 逐渐变化」
- **建议：`keep`**

## noodles → noodle
- rank：form 4966 / lemma 7952 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「面条（复数）」 / lemma「面条」
- ECDICT：form「n. 面条, 挂面（noodle的复数形式）」 / lemma「n. 面条, 笨蛋」
- **建议：`keep`**

## insects → insect
- rank：form 4970 / lemma 6885 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「昆虫（复数）」 / lemma「昆虫」
- ECDICT：form「n. 昆虫；昆虫类, 昆虫纲（insect的复数形式）」 / lemma「n. 昆虫, 卑鄙的人 [医] 昆虫」
- **建议：`keep`**

## charging → charge
- rank：form 4973 / lemma 6753 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「充电；收费（现在分词）」 / lemma「冲锋；指控」
- ECDICT：form「[计] 计费的 [化] 充电; 装料」 / lemma「n. 指控, 费用, 冲锋, 电荷, 炸药, 主管, 被托管人, 命令 vt. 控诉, 加罪于, 使充满, 使充电, 使…」
- **建议：`keep`**

## marching → march
- rank：form 4987 / lemma 5805 ｜ type `i` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「行进；游行（现在分词）」 / lemma「行进；游行；迈步走」
- ECDICT：form「[计] 步进式的」 / lemma「n. 三月, 进行, 行军, 步伐, 长途跋涉, 进行曲, 边界 vi. 进军, 前进, 交界 vt. 使行军, 使行进」
- **建议：`keep`**

## touches → touch
- rank：form 4988 / lemma 5346 ｜ type `s` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「触摸；感动（第三人称单数）」 / lemma「触摸；接触」
- ECDICT：form「n. 高光；绝技；笔致」 / lemma「n. 触觉, 碰, 触, 机灵, 轻触, 格调, 少许, 缺点, 弹力 vt. 接触, 触摸, 触及, 使接触, 达到,…」
- **建议：`keep`**

## feared → fear
- rank：form 4990 / lemma 5442 ｜ type `p` ｜ src `AB` ｜ flags `highfreq-before`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「害怕；担心（过去式）」 / lemma「恐惧；害怕」
- ECDICT：form「v. 畏惧( fear的过去式和过去分词 ); 为…忧虑（或担心、焦虑）; 敬畏（神等）; 感到害怕」 / lemma「n. 恐怖, 害怕, 担心 v. 害怕, 恐惧, 为...担心, 敬畏」
- **建议：`keep`**

## cooler → cool
- rank：form 5003 / lemma 5427 ｜ type `r` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「冷却器；冷藏箱；牢房」 / lemma「冷静的；冷淡的」
- ECDICT：form「n. 冷却器 [化] 冷却器」 / lemma「n. 凉爽, 凉爽的空气 a. 凉爽的, 冷淡的, 冷静的 vi. 冷却, 平息 vt. 使冷却, 使平静」
- **建议：`keep`**

## metres → metre
- rank：form 5010 / lemma 15536 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「米（复数）；格律」 / lemma「米（长度单位）；韵律」
- ECDICT：form「n. 米( metre的复数形式 ); （诗的）格律; 用于竞赛名称 metres」 / lemma「n. 公尺, 格律, 韵律 [医] 米, 公尺」
- **建议：`keep`**

## bands → band
- rank：form 5013 / lemma 5106 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乐队；带子（复数）」 / lemma「带；箍；环」
- ECDICT：form「n. 法官；乐队」 / lemma「n. 带子, 队, 乐队 v. 联合, 结合 [计] 频带; 波段; 区」
- **建议：`keep`**

## dried → dry
- rank：form 5014 / lemma 5634 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「干燥的；干制的」 / lemma「干的；干旱的」
- ECDICT：form「a. 弄干了的」 / lemma「a. 干的, 无酒的, 枯燥无味的, 干燥的 vt. 把...弄干 vi. 变干 n. 干, 干涸」
- **建议：`keep`**

## features → feature
- rank：form 5021 / lemma 5052 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「特征；面貌（复数）」 / lemma「特征；特色；专题」
- ECDICT：form「n. 容貌；产品特点, 特征；嘴脸（feature的复数）」 / lemma「n. 面孔的一部分(如眼、口等), 特征, 容貌, 特色, 特写 vt. 是...的特色, 特写, 放映 vi. 起重要…」
- **建议：`keep`**

## throws → throw
- rank：form 5025 / lemma 5361 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「投掷；抛（第三人称单数）」 / lemma「扔；投掷」
- ECDICT：form「n. 曲拐（throw的复数形式）」 / lemma「vt. 投, 掷, 抛, 发射, 摔下, 匆匆穿上(或脱下), 抛弃, 摆脱 vi. 丢, 掷, 抛 n. 投掷, 掷骰…」
- **建议：`keep`**

## residents → resident
- rank：form 5027 / lemma 5176 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「居民；住户（复数）」 / lemma「居民；住户」
- ECDICT：form「n. 居民；房客；住院医生（resident的复数）」 / lemma「n. 居民, 常驻程序, 居住者, 留鸟 a. 居留的, 定居的」
- **建议：`keep`**

## whining → whine
- rank：form 5034 / lemma 11517 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抱怨；哀鸣（现在分词）」 / lemma「哀鸣；抱怨」
- ECDICT：form「v. 哀号( whine的现在分词 ); 哀诉, 诉怨」 / lemma「n. 哀叫声, 嘎嘎声, 哀鸣 vi. 哭诉, 嘎嘎响, 发呜呜声 vt. 哀诉」
- **建议：`keep`**

## clothes → clothe
- rank：form 5040 / lemma 24236 ｜ type `s` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「衣服；服装」 / lemma「给…穿衣；供给衣服」
- ECDICT：form「n. 衣服」 / lemma「vt. 给...穿衣, 盖上, 赋予」
- **建议：`keep`**

## rebels → rebel
- rank：form 5044 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「反叛者（复数）」 / lemma「反叛，起义」
- ECDICT：form「n. 反叛者（rebel的复数形式）」 / lemma「n. 叛徒, 反叛者 vi. 造反, 反抗, 抵抗, 反感 a. 造反的, 反抗的」
- **建议：`keep`**

## lords → lord
- rank：form 5054 / lemma 380 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「领主；贵族（复数）」 / lemma「领主；上帝；勋爵」
- ECDICT：form「n. 上议院；（前面与the连用）上院议员」 / lemma「n. 统治者, 阁下, 上帝 vi. 称王, 作威作福 vt. 使成贵族」
- **建议：`?`**

## wrestling → wrestle
- rank：form 5055 / lemma 6312 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摔跤；搏斗」 / lemma「摔跤；搏斗」
- ECDICT：form「n. 摔跤」 / lemma「n. 摔跤, 角力, 扭斗 vi. 摔跤, 搏斗, 斗争, 斟酌 vt. 与(对手)摔跤」
- **建议：`keep`**

## amusing → amuse
- rank：form 5068 / lemma 9944 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有趣的；逗人笑的」 / lemma「逗乐；使消遣」
- ECDICT：form「a. 有趣的, 引人发笑的」 / lemma「vt. 消遣, 娱乐, 使发笑」
- **建议：`keep`**

## stocking → stock
- rank：form 5085 / lemma 6075 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「长袜；丝袜」 / lemma「股票；存货；储备」
- ECDICT：form「n. 长袜 [医] 马足水肿; 长袜」 / lemma「n. 树干, 祖先, 血统, 原料, 备料, 库存, 牲畜, 股票, 股份, 保留剧目 a. 存货的, 常备的, 平凡的…」
- **建议：`keep`**

## wonders → wonder
- rank：form 5090 / lemma 5928 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「奇迹；奇观」 / lemma「想知道；纳闷」
- ECDICT：form「n. 奇观（wonder复数）」 / lemma「n. 奇迹, 惊奇, 惊愕 vt. 惊奇, 想知道 vi. 惊讶, 怀疑」
- **建议：`keep`**

## clattering → clatter
- rank：form 5091 / lemma 9037 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咔嗒作响的」 / lemma「咔嗒声；喧闹声」
- ECDICT：form「vt.& vi. 发出咔哒声（clatter的现在分词形式）」 / lemma「n. 咔嗒声, 哗啦声, 嘈杂的谈笑声 vi. 发出哗啦声, 喧闹的谈笑 vt. 使咔嗒咔嗒地响」
- **建议：`keep`**

## individuals → individual
- rank：form 5111 / lemma 12050 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「个人；个体」 / lemma「个别的；独特的；个人」
- ECDICT：form「n. 个人；个体（individual的复数）」 / lemma「n. 人, 个人, 个体 a. 个别的, 个人的, 独特的」
- **建议：`keep`**

## forensics → forensic
- rank：form 5135 / lemma 15500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「法医学；鉴识」 / lemma「法医的；法庭的」
- ECDICT：form「n. 辩论学, 辩论术」 / lemma「a. 辩论的, 法院的, 关于法庭的 n. 辩论练习」
- **建议：`keep`**

## civilians → civilian
- rank：form 5140 / lemma 14100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「平民；百姓」 / lemma「平民；文职人员」
- ECDICT：form「n. 平民, 百姓( civilian的复数形式 ); 老百姓」 / lemma「n. 平民, 民法专家 a. 平民的, 百姓的, 民用的」
- **建议：`keep`**

## refuses → refuse
- rank：form 5153 / lemma 12500 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拒绝」 / lemma「拒绝」
- ECDICT：form「v. 拒绝, 回绝( refuse的第三人称单数 ); 推却, 回绝; 拒绝给（所需之物）」 / lemma「vt. 拒绝, 谢绝 vi. 拒绝 n. 废物 a. 扔掉的, 无用的」
- **建议：`keep`**

## hanged → hang
- rank：form 5157 / lemma 438 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「绞死；上吊」 / lemma「悬挂；绞死；闲逛」
- ECDICT：form「hang的过去式和过去分词」 / lemma「n. 悬挂, 诀窍, 意义 vt. 悬挂, 附着, 装饰, 垂下, 踌躇, 绞死, 使悬而未决 vi. 悬着, 垂下, …」
- **建议：`?`**

## profits → profit
- rank：form 5162 / lemma 8211 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「利润；收益」 / lemma「利润；收益；盈利」
- ECDICT：form「n. 收益, 红利；盈利（profit的复数）」 / lemma「n. 利润, 赢利, 利益 vi. 有益, 获利, 赚钱 vt. 有益于」
- **建议：`keep`**

## humiliated → humiliate
- rank：form 5169 / lemma 14400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「受羞辱的；感到丢脸的」 / lemma「羞辱，使丢脸」
- ECDICT：form「a. 感到羞愧的 v. 使蒙羞, 羞辱, 使丢脸( humiliate的过去式和过去分词 )」 / lemma「vt. 使丢脸, 使蒙羞, 屈辱」
- **建议：`keep`**

## hissing → hiss
- rank：form 5170 / lemma 14476 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出嘶嘶声」 / lemma「发出嘶嘶声」
- ECDICT：form「[电] 嘶嘶声」 / lemma「n. 嘘声, 嘶嘶声 vi. 发出嘘声, 发嘶嘶声 vt. 发嘶嘶声表示」
- **建议：`keep`**

## sniffing → sniff
- rank：form 5175 / lemma 7017 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗅；抽鼻子」 / lemma「嗅；抽鼻子」
- ECDICT：form「[计] 测错」 / lemma「n. 以鼻吸气, 嗅, 气息 vi. 嗅, 蔑视, 嗤之以鼻 vt. 闻, 用力吸, 发觉」
- **建议：`keep`**

## obliged → oblige
- rank：form 5178 / lemma 11322 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「感激的；有义务的」 / lemma「迫使；施恩于」
- ECDICT：form「a. 感激的；有责任的；必须的」 / lemma「vt. 强制, 施恩惠于, 使感激 vi. 施恩惠, 帮忙」
- **建议：`keep`**

## counted → count
- rank：form 5183 / lemma 8328 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「数；计算；认为」 / lemma「数；计算」
- ECDICT：form「v. （按顺序）数( count的过去式和过去分词 ); 有价值; 数出总数; 算得上」 / lemma「vt. 计算, 视为 vi. 计数 n. 计算, 合计, 计数, 伯爵 [计] 计数」
- **建议：`keep`**

## instruments → instrument
- rank：form 5184 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「乐器；仪器；工具」 / lemma「工具；仪器；手段」
- ECDICT：form「n. 乐器；工具；仪器（instrument的复数）」 / lemma「n. 工具, 手段, 仪器 [化] 仪器」
- **建议：`keep`**

## marines → marine
- rank：form 5189 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「海军陆战队士兵」 / lemma「海洋的；海生的」
- ECDICT：form「[人名] 马林斯; [地名] [西班牙] 马里内斯; [地名] [法国] 马里讷; [电影]时空奇兵之海豹突击队」 / lemma「n. 舰队, 水兵, 海景画 a. 海的, 海产的, 海底的, 船舶的, 海运的」
- **建议：`keep`**

## felt → feel
- rank：form 5199 / lemma 5343 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「毛毡；毡制品」 / lemma「感觉；触摸」
- ECDICT：form「n. 毛毯, 毡 vt. 制毡, 使粘结 vi. 粘结 feel的过去式和过去分词」 / lemma「vt. 感觉, 觉得, 触摸, 以为 vi. 有知觉, 摸索, 同情 n. 感觉, 觉得, 触摸」
- **建议：`keep`**

## stunning → stun
- rank：form 5214 / lemma 11967 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「惊艳的；极美的」 / lemma「使震惊；使昏迷」
- ECDICT：form「a. 打昏迷的, 弄得人昏头昏脑的, 令人震惊的」 / lemma「vt. 使昏迷, 使震惊, 打昏 n. 昏迷, 猛击」
- **建议：`keep`**

## honks → honk
- rank：form 5224 / lemma 9425 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸣笛；发出雁叫声」 / lemma「按喇叭；鸣笛」
- ECDICT：form「n. 雁叫声( honk的名词复数 ); 汽车的喇叭声 v. （使）发出雁叫似的声音, 鸣（喇叭）, 按（喇叭）( ho…」 / lemma「n. 雁鸣, 汽车的喇叭声 vi. 雁鸣叫, 按汽车喇叭 vt. 揿(喇叭)」
- **建议：`keep`**

## villagers → villager
- rank：form 5235 / lemma 22929 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「村民；乡村居民」 / lemma「村民；乡村居民」
- ECDICT：form「n. 村民；乡下人（villager的复数）」 / lemma「n. 村民」
- **建议：`keep`**

## romans → roman
- rank：form 5243 / lemma 2091 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「罗马人；罗马书」 / lemma「罗马的；罗马人的」
- ECDICT：form「n. 《罗马书》（《圣经·新约》中的一卷）」 / lemma「n. 罗马人 a. 罗马人的, 罗马的」
- **建议：`keep`**

## assets → asset
- rank：form 5246 / lemma 5777 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「资产；优点」 / lemma「资产；优点」
- ECDICT：form「n. 资产 [经] 财产, 资产」 / lemma「n. 资产, 有益的东西」
- **建议：`keep`**

## flirting → flirt
- rank：form 5256 / lemma 6436 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「调情；打情骂俏」 / lemma「调情；打情骂俏」
- ECDICT：form「v. 调情, 打情骂俏( flirt的现在分词 )」 / lemma「n. 卖弄风骚的人, 急动, 急扔 vt. 忽然弹出, 轻快摆动, 挥动 vi. 调情, 玩弄, 摆动, 轻率地对待」
- **建议：`keep`**

## sweating → sweat
- rank：form 5262 / lemma 6267 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「出汗；流汗」 / lemma「汗水」
- ECDICT：form「[化] 发汗 [医] 出汗 [经] 汗损」 / lemma「n. 汗, 汗水, 水珠, 焦急 vi. 出汗, 渗出, 冒出水气, 结水珠, 烦恼, 懊恼 vt. 使出汗, 流出, …」
- **建议：`keep`**

## surrounding → surround
- rank：form 5266 / lemma 7456 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「周围的；环绕的」 / lemma「包围；环绕」
- ECDICT：form「n. 环境 a. 周围的」 / lemma「vt. 包围, 环绕, 围绕 n. 围绕物」
- **建议：`keep`**

## veins → vein
- rank：form 5275 / lemma 8178 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「静脉；纹理」 / lemma「静脉；纹理；风格」
- ECDICT：form「n. 纹理；静脉（vein的复数）」 / lemma「n. 血管, 静脉, 纹理, 气质, 情绪 vt. 使有脉络, 像脉络般分布于」
- **建议：`keep`**

## responsibilities → responsibility
- rank：form 5278 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「责任（复数）」 / lemma「责任；职责」
- ECDICT：form「n. 责任；职责（responsibility的复数）」 / lemma「n. 责任, 职责, 负担, 可靠性 [化] 职责」
- **建议：`keep`**

## missiles → missile
- rank：form 5280 / lemma 6000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「导弹（复数）」 / lemma「导弹；投射物」
- ECDICT：form「n. 导弹( missile的复数形式 ); 投射物」 / lemma「n. 发射物, 导弹, 飞弹, 火箭 a. 可发射的」
- **建议：`keep`**

## frightening → frighten
- rank：form 5283 / lemma 5546 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人恐惧的」 / lemma「使害怕；吓唬」
- ECDICT：form「a. 令人恐惧的；引起突然惊恐的」 / lemma「vt. 使惊吓 vi. 惊恐」
- **建议：`keep`**

## promoted → promote
- rank：form 5289 / lemma 6856 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「晋升了；促进了」 / lemma「促进；提升；宣传」
- ECDICT：form「a. 晋升的」 / lemma「vt. 促进, 晋升, 创办, 推销 [经] 促进, 推广, 推销」
- **建议：`keep`**

## expectations → expectation
- rank：form 5299 / lemma 11915 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「期望（复数）」 / lemma「期望；预期；期待」
- ECDICT：form「n. 希望( expectation的复数形式 ); 预料; （被）预期; [常作复数] 期望的事情」 / lemma「n. 期待, 指望, 展望 [化] 期望值」
- **建议：`keep`**

## appointed → appoint
- rank：form 5310 / lemma 9874 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「任命了；指定」 / lemma「任命；指定」
- ECDICT：form「[法] 派任的, 任命的, 指定的」 / lemma「vt. 任命, 指定, 下令 [法] 派, 派任, 任命」
- **建议：`keep`**

## pains → pain
- rank：form 5340 / lemma 8415 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「疼痛；辛劳」 / lemma「疼痛；痛苦」
- ECDICT：form「n. 麻烦, 辛苦」 / lemma「n. 痛苦, 疼痛, 辛苦 vt. 使痛苦, 痛苦 vi. 作痛, 疼」
- **建议：`keep`**

## demanding → demand
- rank：form 5349 / lemma 12800 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「要求高的；费力的」 / lemma「要求；强烈请求」
- ECDICT：form「a. 要求高的, 费力的」 / lemma「n. 要求, 需求, 需要 v. 要求, 查询」
- **建议：`keep`**

## tasted → taste
- rank：form 5355 / lemma 7680 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「品尝（过去式）」 / lemma「品尝」
- ECDICT：form「v. 尝, 品尝, 尝到( taste的过去式和过去分词 ); 吃; 喝; 浅尝」 / lemma「n. 味道, 品味, 味觉, 感受, 体验, 爱好, 审美, 少量 vt. 尝, 察觉...的味道, 体会 vi. 品尝…」
- **建议：`keep`**

## approached → approach
- rank：form 5367 / lemma 8115 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「接近；靠近（过去式）」 / lemma「接近；靠近；着手处理」
- ECDICT：form「接近」 / lemma「n. 接近, 入门 vt. 接近, 近似, 找...商量 vi. 靠近」
- **建议：`keep`**

## selected → select
- rank：form 5394 / lemma 6208 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「选择（过去式）；挑选的」 / lemma「选择；挑选」
- ECDICT：form「a. 挑选出来的, 精选的 [计] 被选的」 / lemma「a. 挑选出来的, 极好的 v. 选择, 挑选 n. 被挑选者, 精萃 [计] 选定」
- **建议：`keep`**

## dealers → dealer
- rank：form 5396 / lemma 8229 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「经销商（复数）；毒贩」 / lemma「经销商；商人；发牌者」
- ECDICT：form「n. 交易商；经销商；商人们（dealer的复数）」 / lemma「n. 经销商, 商人 [经] 交易员, 贩卖商」
- **建议：`keep`**

## cheaper → cheap
- rank：form 5402 / lemma 6096 ｜ type `r` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更便宜的」 / lemma「便宜的；廉价的」
- ECDICT：form「a. 成本更低, 比较便宜的」 / lemma「a. 便宜的, 不值钱的, 可鄙的 adv. 便宜地」
- **建议：`keep`**

## smelled → smell
- rank：form 5403 / lemma 7677 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闻；嗅（过去式）」 / lemma「嗅；闻」
- ECDICT：form「smell的过去式和过去分词」 / lemma「n. 味道, 气味, 嗅觉, 嗅, 臭味, 气息 vt. 闻, 探出, 察觉, 发出...的气味 vi. 嗅, 散发气味…」
- **建议：`keep`**

## contracts → contract
- rank：form 5412 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「合同（复数）」 / lemma「合同；收缩；感染」
- ECDICT：form「n. 契约( contract的名词复数 ); 婚约; [法律]契约法; 行贿」 / lemma「n. 合约, 婚约, 契约 vt. 使皱缩, 使缩短, 感染, 订约, 缔结 vi. 皱缩, 订约, 收缩」
- **建议：`keep`**

## scattered → scatter
- rank：form 5413 / lemma 9977 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「分散的；散乱的」 / lemma「散开；撒」
- ECDICT：form「a. 分散的, 散乱的 [计] 分散的」 / lemma「n. 消散, 分散, 散播, 散射, 散布, 酒馆 vi. 散布, 散播, 消散 vt. 使消散, 使分散, 撒, 散布…」
- **建议：`keep`**

## trusting → trust
- rank：form 5414 / lemma 5562 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轻信的；信任的」 / lemma「信任；信赖」
- ECDICT：form「a. 轻信的, 信任他人的, 深信不疑的」 / lemma「n. 信任, 信赖, 相信, 受托, 职责, 信心, 托拉斯 a. 信托的, 托拉斯的 vt. 信赖, 信任, 相信, …」
- **建议：`keep`**

## volunteers → volunteer
- rank：form 5417 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「志愿者（复数）」 / lemma「志愿者；自愿做」
- ECDICT：form「n. 义务工作者( volunteer的名词复数 ); 志愿者; 自告奋勇者; 主动做某事的人 v. 自动提供, 自愿效…」 / lemma「n. 志愿者 a. 志愿的 v. 自愿」
- **建议：`keep`**

## remembering → remember
- rank：form 5418 / lemma 5934 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「记得；想起」 / lemma「记得；想起；记住」
- ECDICT：form「n. 回忆, 记住」 / lemma「vt. 记得, 回忆起, 记住, 铭记, 纪念 vi. 记得」
- **建议：`keep`**

## bandits → bandit
- rank：form 5423 / lemma 8712 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「强盗；土匪（复数）」 / lemma「强盗」
- ECDICT：form「n. 盗贼；土匪（bandit的复数）」 / lemma「n. 强盗」
- **建议：`keep`**

## crackling → crackle
- rank：form 5429 / lemma 24613 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「噼啪声；脆皮」 / lemma「发出爆裂声」
- ECDICT：form「n. 脆皮, 猪油渣」 / lemma「n. 劈啪响, 裂纹 vi. (使)发劈啪声」
- **建议：`keep`**

## regulations → regulation
- rank：form 5443 / lemma 10470 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「规章；条例（复数）」 / lemma「规章；管理」
- ECDICT：form「n. 章则；条例；规程（regulation的复数）」 / lemma「n. 规则, 管理, 调整 [计] 调整; 规章; 规则; 调节」
- **建议：`keep`**

## rides → ride
- rank：form 5461 / lemma 5745 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「骑；乘坐（第三人称单数）」 / lemma「骑；乘坐」
- ECDICT：form「n. 座骑（ride的复数）」 / lemma「n. 骑马, 乘坐, 乘车, 搭便车 vt. 骑, 乘坐, 压迫, 控制 vi. 骑马, 乘车, 漂游」
- **建议：`keep`**

## handcuffs → handcuff
- rank：form 5465 / lemma 15141 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手铐」 / lemma「铐上手铐」
- ECDICT：form「n. 手铐 [法] 手铐」 / lemma「vt. 给...戴上手铐 n. 手铐」
- **建议：`keep`**

## healed → heal
- rank：form 5473 / lemma 6393 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「治愈（过去式）」 / lemma「愈合；治愈」
- ECDICT：form「v. （使）愈合( heal的过去式和过去分词 ); 治愈; （使）结束; 较容易忍受」 / lemma「vi. 痊愈 vt. 使复原, 使和解, 治愈」
- **建议：`keep`**

## recommended → recommend
- rank：form 5481 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「推荐；建议」 / lemma「推荐；建议；劝告」
- ECDICT：form「a. 被推荐的」 / lemma「vt. 推荐, 介绍, 劝告, 使受欢迎, 托付 [经] 建议, 推荐」
- **建议：`keep`**

## exploded → explode
- rank：form 5488 / lemma 13000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「爆炸；激增」 / lemma「爆炸；激增；破除（迷信等）」
- ECDICT：form「a. 爆炸了的, 分解的, 被破除的, 被戳穿的」 / lemma「vi. 爆炸, 爆发, 激增 vt. 使爆炸」
- **建议：`keep`**

## awaits → await
- rank：form 5493 / lemma 6589 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「等待；期待」 / lemma「等待；期待」
- ECDICT：form「v. 等候( await的第三人称单数 ); 等待; 期待; 将发生在」 / lemma「vt. 等候 vi. 等待着」
- **建议：`keep`**

## particles → particle
- rank：form 5496 / lemma 8005 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「粒子；微粒」 / lemma「微粒；粒子」
- ECDICT：form「n. 粒子系统；微粒, 粒子；碎木料（particle的复数形式）」 / lemma「n. 颗粒, 粒子, 质点, 极小量 [化] 粒子; 质点」
- **建议：`keep`**

## amazed → amaze
- rank：form 5498 / lemma 13208 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「惊奇的；大为惊讶的」 / lemma「使惊奇；使惊叹」
- ECDICT：form「a. 吃惊的, 惊奇的」 / lemma「vt. 使吃惊」
- **建议：`keep`**

## lyrics → lyric
- rank：form 5500 / lemma 15898 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「歌词；抒情诗」 / lemma「歌词；抒情诗」
- ECDICT：form「n. 歌词」 / lemma「n. 抒情诗, 歌词 a. 抒情的」
- **建议：`keep`**

## goals → goal
- rank：form 5508 / lemma 6261 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「目标；进球」 / lemma「球门；进球；目标」
- ECDICT：form「n. 目标, 目的；进球, 射中次数」 / lemma「n. 目标, 终点, 得分, 球门, 守门员 vi. 攻门, 射门得分」
- **建议：`keep`**

## grounded → ground
- rank：form 5514 / lemma 5664 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「禁足的；接地的」 / lemma「地面；土地」
- ECDICT：form「a. [物]接地的；有基础的」 / lemma「n. 土地, 战场, 场地, 地面, 范围 a. 土地的, 地面上的 vt. 放在地上, 使搁浅, 打基础, 给...以…」
- **建议：`keep`**

## shattered → shatter
- rank：form 5525 / lemma 11836 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「破碎的；极度震惊的」 / lemma「打碎；粉碎」
- ECDICT：form「a. 极度疲劳的；破碎的」 / lemma「n. 碎片, 粉碎, 落叶, 喷洒 vt. 打碎, 使散开, 粉碎, 破坏 vi. 粉碎, 损坏, 脱落」
- **建议：`keep`**

## sought → seek
- rank：form 5528 / lemma 5967 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「寻找；寻求（seek过去式）」 / lemma「寻找；寻求；探索」
- ECDICT：form「seek的过去式和过去分词」 / lemma「vt. 寻求, 寻找, 探索, 追求, 搜索, 请求 vi. 寻找, 搜索 [计] 查找」
- **建议：`keep`**

## kilometers → kilometer
- rank：form 5544 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「千米；公里」 / lemma「千米，公里」
- ECDICT：form「n. <美>千米, 公里( kilometer的复数形式 )」 / lemma「n. 千米, 公里 [医] 千米, 公里」
- **建议：`keep`**

## rises → rise
- rank：form 5545 / lemma 5757 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上升；升起」 / lemma「升起；上升；起身」
- ECDICT：form「v. 价格上涨；（日、月、星）升起；起身（rise第三人称单数）」 / lemma「n. 上升, 增加, 上涨, 高地, 升高, 出现 vi. 升起, 起身, 起立, 上升, 上涨, 增长, 高耸, 起义…」
- **建议：`keep`**

## bosses → boss
- rank：form 5554 / lemma 8238 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「老板；上司（复数）」 / lemma「老板；上司；领班」
- ECDICT：form「n. 老板( boss的名词复数 ); 经理; 上司; 工头」 / lemma「n. 老板, 上司, 岩瘤, 浮雕, 母牛 vt. 指挥, 控制, 浮雕」
- **建议：`keep`**

## snarling → snarl
- rank：form 5556 / lemma 30789 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咆哮；龇牙低吼」 / lemma「咆哮；缠结」
- ECDICT：form「v. （指狗）吠, 嗥叫, （人）咆哮( snarl的现在分词 ); 咆哮着说, 厉声地说」 / lemma「vi. 吼叫, 怒骂, 缠结 vt. 咆哮着说, 搞乱, 使缠结 n. 咆哮, 吼叫, 怒骂, 缠结, 混乱」
- **建议：`keep`**

## tired → tire
- rank：form 5559 / lemma 3398 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疲倦的；厌倦的」 / lemma「使疲倦；疲劳」
- ECDICT：form「a. 疲累的, 疲乏的, 厌倦的」 / lemma「n. 轮胎, 头饰 vt. 使疲倦, 使厌烦, 打扮 vi. 疲劳, 厌倦」
- **建议：`?`**

## sustained → sustain
- rank：form 5563 / lemma 8613 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「持续的；持久的」 / lemma「维持；支撑；遭受」
- ECDICT：form「a. 持续的, 持久不变的, 持久的, 不懈的 [计] 持续的」 / lemma「vt. 承受, 支持, 供养, 继续, 忍受, 蒙受, 证实, 准许 [电] 持续」
- **建议：`keep`**

## abducted → abduct
- rank：form 5564 / lemma 14300 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「绑架；劫持（过去式）」 / lemma「绑架，诱拐」
- ECDICT：form「[法] 诱拐」 / lemma「vt. 诱拐, 绑架, 使外展 [医] 外展, 展」
- **建议：`keep`**

## panicked → panic
- rank：form 5565 / lemma 1985 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「惊慌；恐慌（过去式）」 / lemma「恐慌；惊慌」
- ECDICT：form「vt. 使恐慌（panic的过去式与过去分词形式）」 / lemma「n. 恐慌, 惊慌 a. 惊慌的, 没有理由的, 恐慌的 vt. 使惊慌, 使狂热 vi. 惊慌」
- **建议：`?`**

## diving → dive
- rank：form 5567 / lemma 5772 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「潜水；跳水」 / lemma「跳水；潜水；俯冲」
- ECDICT：form「n. 潜水, 跳水」 / lemma「n. 潜水, 跳水 vi. 跳水, 俯冲, 猛冲 vt. 把...突然伸入」
- **建议：`keep`**

## techniques → technique
- rank：form 5574 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「技术；技巧（复数）」 / lemma「技术，技巧，方法」
- ECDICT：form「n. 方法；技巧；技术（technique的复数）」 / lemma「n. 技巧, 技术, 方法 [化] 工艺方法; 技巧」
- **建议：`keep`**

## willing → will
- rank：form 5580 / lemma 48 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「愿意的；乐意的」 / lemma「将；会（助动词）」
- ECDICT：form「a. 乐意的, 自愿的, 甘愿的」 / lemma「n. 意志, 决心, 意愿, 意向, 干劲, 遗嘱 vt. 用意志的力量驱使, 决意, 愿意, 立遗嘱 vi. 下决心,…」
- **建议：`?`**

## scored → score
- rank：form 5584 / lemma 6258 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「得分；刻痕（过去式）」 / lemma「得分」
- ECDICT：form「a. 折叠的；刮伤的」 / lemma「n. 得分, 抓痕, 二十个, 刻痕, 帐目, 乐谱, 起跑线, 终点线, 大量 vt. 刻划, 划线, 获得, 评价,…」
- **建议：`keep`**

## sensors → sensor
- rank：form 5586 / lemma 8577 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「传感器（复数）」 / lemma「传感器」
- ECDICT：form「n. 传感器, 感应器；感测器（sensor的复数）」 / lemma「n. 传感器 [计] 检测器」
- **建议：`keep`**

## casualties → casualty
- rank：form 5604 / lemma 10041 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「伤亡人员（复数）」 / lemma「伤亡人员；受害者」
- ECDICT：form「n. 伤亡；人员伤亡（casualty的复数）」 / lemma「n. 意外事故, 伤亡, 受害者 [化] 事故」
- **建议：`keep`**

## marketing → market
- rank：form 5607 / lemma 6030 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「营销；市场推广」 / lemma「市场；集市；行情」
- ECDICT：form「n. 行销, 买卖 [经] 推销, 在市场买卖, 销售」 / lemma「n. 市场, 交易, 集市, 推销地区, 行情, 市面, 销路 vt. 在市场上交易, 使上市, 销售 vi. 在市场上…」
- **建议：`keep`**

## compliments → compliment
- rank：form 5616 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「赞美；恭维（复数）」 / lemma「赞美；恭维」
- ECDICT：form「n. 问候, 道贺, 致意」 / lemma「n. 称赞, 恭维, 敬意 vt. 称赞, 褒扬, 恭维」
- **建议：`keep`**

## ingredients → ingredient
- rank：form 5628 / lemma 8633 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「成分；原料（复数）」 / lemma「成分；原料」
- ECDICT：form「材料；作料」 / lemma「n. 成分, 因素 [化] 配合剂; 拼料; 成分; 组分」
- **建议：`keep`**

## corpses → corpse
- rank：form 5640 / lemma 14500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「尸体（复数）」 / lemma「尸体，死尸」
- ECDICT：form「n. 死尸, 尸体( corpse的复数形式 )」 / lemma「n. 尸体 [医] 尸体」
- **建议：`keep`**

## banned → ban
- rank：form 5644 / lemma 6730 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「被禁止的」 / lemma「禁止；取缔」
- ECDICT：form「a. 被禁的」 / lemma「n. 禁令 vt. 禁止, 取缔」
- **建议：`keep`**

## mills → mill
- rank：form 5657 / lemma 7620 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨坊；工厂（复数）」 / lemma「碾磨」
- ECDICT：form「n. 米尔斯（人名）」 / lemma「n. 压榨机, 磨坊, 制造厂 vt. 碾磨, 磨细, 搅拌, 使乱转 vi. 乱转, 被碾磨」
- **建议：`keep`**

## farther → far
- rank：form 5658 / lemma 1490 ｜ type `r` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更远地」 / lemma「远的（地）」
- ECDICT：form「a. 更远的, 进一步的 adv. 更远的, 此外, far的比较级」 / lemma「a. 远的, 久远的, 遥远的 adv. 甚远地, 很, 到很深的程度, 到很远的距离」
- **建议：`?`**

## flattered → flatter
- rank：form 5661 / lemma 7826 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「感到荣幸的；受宠若惊的」 / lemma「奉承；使高兴」
- ECDICT：form「a. 高兴的, 感到荣幸的；过分夸赞」 / lemma「vt. 奉承, 阿谀, 使高兴 [机] 平面锤」
- **建议：`keep`**

## ground → grind
- rank：form 5664 / lemma 7617 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地面；土地」 / lemma「磨碎」
- ECDICT：form「n. 土地, 战场, 场地, 地面, 范围 a. 土地的, 地面上的 vt. 放在地上, 使搁浅, 打基础, 给...以…」 / lemma「n. 磨, 碾, 苦差, 摩擦声, 用功的学生 vt. 磨擦, 磨碎, 磨光, 折磨, 压榨 vi. 磨, 磨碎, 苦干」
- **建议：`keep`**

## hiring → hire
- rank：form 5672 / lemma 8244 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雇用（现在分词）」 / lemma「雇用；租用；聘请」
- ECDICT：form「[法] 租用, 雇用」 / lemma「n. 租金, 租用, 雇用 vt. 雇请, 出租 vi. 受雇」
- **建议：`keep`**

## fees → fee
- rank：form 5674 / lemma 8193 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「费用；酬金（复数）」 / lemma「费用；酬金；小费」
- ECDICT：form「n. 规费；费用（fee的复数）」 / lemma「n. 费用, 小费, 封地, 所有权 vt. 付费给」
- **建议：`keep`**

## spends → spend
- rank：form 5679 / lemma 6012 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「花费；度过（第三人称单数）」 / lemma「花费；度过；消耗」
- ECDICT：form「v. 用钱, 花钱( spend的第三人称单数 ); 花费; 消耗; 花（时间）」 / lemma「vt. 花费, 浪费, 度过, 消耗, 消磨 vi. 花费, 用尽」
- **建议：`keep`**

## christians → christian
- rank：form 5694 / lemma 1635 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「基督徒（复数）」 / lemma「基督徒；adj. 基督教的」
- ECDICT：form「n. 基督教徒( Christian的复数形式 )」 / lemma「n. 基督徒, 正派人 a. 基督的, 基督教的」
- **建议：`keep`**

## followers → follower
- rank：form 5708 / lemma 14742 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「追随者；粉丝（复数）」 / lemma「追随者；粉丝」
- ECDICT：form「n. 追随者；仿效者；契约附页；[机械]随动件（follower的复数）」 / lemma「n. 从者, 属下, 追补者 [电] 随动机」
- **建议：`keep`**

## whoops → whoop
- rank：form 5726 / lemma 9095 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哎哟；糟糕」 / lemma「大叫；欢呼声」
- ECDICT：form「interj. 哎哟」 / lemma「n. 大叫, 呐喊, 一点点 vi. 叫喊, 鸣叫 vt. 高声说, 唤起」
- **建议：`keep`**

## yelled → yell
- rank：form 5740 / lemma 8403 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大叫；喊叫」 / lemma「叫喊；吼叫；嚎叫」
- ECDICT：form「v. 叫喊, 号叫, 叫着说( yell的过去式和过去分词 )」 / lemma「vi. 叫喊, 大叫, (齐声)呐喊欢呼 vt. 喊叫着说 n. 叫声, 喊声, 呐喊」
- **建议：`keep`**

## gardens → garden
- rank：form 5745 / lemma 7560 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「花园（复数）」 / lemma「花园；菜园」
- ECDICT：form「n. 花园（garden的复数形式）」 / lemma「n. 花园, 果园, 菜园 vi. 栽培花木 vt. 造园 a. 花园的, 普通的」
- **建议：`keep`**

## dared → dare
- rank：form 5752 / lemma 8385 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「敢于；胆敢」 / lemma「敢；敢于；挑战」
- ECDICT：form「v. 敢于（竟敢）」 / lemma「n. 挑战, 挑动, 大胆 v. 敢, 胆敢」
- **建议：`keep`**

## appreciated → appreciate
- rank：form 5781 / lemma 12400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「感激；欣赏」 / lemma「欣赏；感激；增值」
- ECDICT：form「v. 感激( appreciate的过去式和过去分词 ); 欣赏; （充分）意识到; 对…作（正确）评价」 / lemma「vt. 赏识, 鉴别, 为...而感激, 领会, 欣赏 vi. 增值, 涨价」
- **建议：`keep`**

## condemned → condemn
- rank：form 5782 / lemma 8622 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「谴责；判刑」 / lemma「谴责；判刑」
- ECDICT：form「a. 已被定罪的, 定了罪的人用的」 / lemma「vt. 判刑, 责备, 谴责 [法] 定罪, 判刑, 宣告有罪」
- **建议：`keep`**

## muttering → mutter
- rank：form 5784 / lemma 26583 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咕哝；低声抱怨」 / lemma「咕哝；低声抱怨」
- ECDICT：form「[医] 嗫语」 / lemma「n. 喃喃低语 vi. 喃喃自语, 作低沉声 vt. 出怨言, 抱怨地说」
- **建议：`keep`**

## squeaking → squeak
- rank：form 5793 / lemma 10595 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吱吱叫；发出尖声」 / lemma「吱吱叫；发出尖声」
- ECDICT：form「n. 滑音测试；锐音」 / lemma「n. 吱吱声, 侥幸 vi. 吱吱叫, 告密, 侥幸成功 vt. 以短促尖声发出」
- **建议：`keep`**

## humiliating → humiliate
- rank：form 5804 / lemma 14400 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「令人羞辱的」 / lemma「羞辱，使丢脸」
- ECDICT：form「a. 丢脸的, 耻辱的, 羞愧的」 / lemma「vt. 使丢脸, 使蒙羞, 屈辱」
- **建议：`keep`**

## evolved → evolve
- rank：form 5817 / lemma 12200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「进化；演变」 / lemma「进化，演变」
- ECDICT：form「n. 进化了的」 / lemma「vi. 进展, 进化, 展开 vt. 使发展, 使推断出, 使进化」
- **建议：`keep`**

## shifts → shift
- rank：form 5818 / lemma 8373 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「转变；轮班」 / lemma「移动；转变；轮班」
- ECDICT：form「n. 转换( shift的名词复数 ); 切换键; （汽车等的）变速; 更换 v. 改变( shift的第三人称单数 )…」 / lemma「n. 变化, 移动, 轮班, 手段, 应急办法, 移位 vt. 替换, 转移, 改变, 推卸, 变速 vi. 转换, 移…」
- **建议：`keep`**

## foreigners → foreigner
- rank：form 5823 / lemma 6778 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「外国人」 / lemma「外国人」
- ECDICT：form「n. 外国人( foreigner的复数形式 ); 外来人, 外地人; 老外; 蕃」 / lemma「n. 外国人, 外地人 [法] 外国人, 进口货, 外国货」
- **建议：`keep`**

## bollocks → bollock
- rank：form 5834 / lemma 43392 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「胡说；睾丸」 / lemma「（俚）睾丸；斥责」
- ECDICT：form「胡说」 / lemma「vt. 臭骂」
- **建议：`keep`**

## swept → sweep
- rank：form 5836 / lemma 5901 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扫；席卷」 / lemma「扫；扫过；席卷」
- ECDICT：form「sweep的过去式和过去分词」 / lemma「n. 扫除, 打扫, 肃清, 视野, 范围, 全胜 vt. 扫除, 掸去, 猛拉, 扫荡, 肃清, 冲走, 刮起, 环视…」
- **建议：`keep`**

## misunderstood → misunderstand
- rank：form 5841 / lemma 6000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「被误解的」 / lemma「误解，误会」
- ECDICT：form「misunderstand的过去式和过去分词」 / lemma「vt. 误解, 误会」
- **建议：`keep`**

## bathing → bathe
- rank：form 5855 / lemma 7678 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洗澡；沐浴」 / lemma「洗澡；沐浴」
- ECDICT：form「n. 游泳, 洗海水澡」 / lemma「vt. 沐浴, 用水洗 vi. 洗澡」
- **建议：`keep`**

## boundaries → boundary
- rank：form 5860 / lemma 9789 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「边界；界限」 / lemma「边界；界限」
- ECDICT：form「n. 分界线( boundary的名词复数 ); 范围; 使球越过边界线的击球（得加分）; 疆界」 / lemma「n. 边界, 分界线 [计] 边界」
- **建议：`keep`**

## strangled → strangle
- rank：form 5863 / lemma 7187 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「勒死；扼杀」 / lemma「勒死；扼杀」
- ECDICT：form「v. 扼死( strangle的过去式和过去分词 ); 使窒息; 抑制; 压制」 / lemma「vt. 勒死, 扼死, 压制, 使窒息, 抑制 vi. 被扼死, 被绞死, 窒息而死」
- **建议：`keep`**

## reserved → reserve
- rank：form 5873 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「预订的；矜持的」 / lemma「预订；保留」
- ECDICT：form「a. 保留的, 预备的, 预定的, 腼腆的, 不露感情的, 含蓄的, 缄默的, 冷淡的 [法] 用作储备的, 保留的, …」 / lemma「n. 储备品, 贮量, 后备军, 自然保护区, 保留, 拘谨, 节制, 储备金 vt. 保留, 保存, 预订, 延期, …」
- **建议：`keep`**

## mushrooms → mushroom
- rank：form 5887 / lemma 8264 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「蘑菇（复数）」 / lemma「蘑菇；迅速增长」
- ECDICT：form「n. 蘑菇；蕈类（mushroom的复数形式）」 / lemma「n. 蘑菇形物, 蘑菇, 暴发户 vi. 迅速生长, 迅速增加, 采蘑菇 a. 蘑菇形的, 迅速生长的」
- **建议：`keep`**

## overwhelming → overwhelm
- rank：form 5909 / lemma 6500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「压倒性的；巨大的」 / lemma「压倒；使不知所措」
- ECDICT：form「a. 压倒性的, 无法抵抗的」 / lemma「vt. 淹没, 受打击, 制服, 压倒, 使不知所措 [法] 打翻, 倾覆, 覆盖」
- **建议：`keep`**

## inherited → inherit
- rank：form 5911 / lemma 7068 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「继承；遗传（过去式）」 / lemma「继承；遗传」
- ECDICT：form「a. 遗传的；继承权的；通过继承得到的」 / lemma「vt. 继承, 遗传 vi. 接受遗产」
- **建议：`keep`**

## whooping → whoop
- rank：form 5913 / lemma 9095 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呼啸的；大声的」 / lemma「大叫；欢呼声」
- ECDICT：form「a. 高喊声的」 / lemma「n. 大叫, 呐喊, 一点点 vi. 叫喊, 鸣叫 vt. 高声说, 唤起」
- **建议：`keep`**

## depressing → depress
- rank：form 5932 / lemma 25427 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人沮丧的」 / lemma「使沮丧；压低」
- ECDICT：form「a. 抑压的, 沉闷的, 阴沉的」 / lemma「vt. 使沮丧, 压低, 降低, 使萧条 [化] 推下」
- **建议：`keep`**

## losses → loss
- rank：form 5941 / lemma 8214 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「损失；失败（复数）」 / lemma「损失；亏损；丧失」
- ECDICT：form「n. 损失；损耗（loss的复数）」 / lemma「n. 损失, 遗失, 失败, 输, 错过, 伤亡 [化] 损失; 损耗」
- **建议：`keep`**

## programs → program
- rank：form 5974 / lemma 1165 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「程序；节目（复数）」 / lemma「节目；程序；计划」
- ECDICT：form「n. 程序, 程序集；所有程式（program的复数）」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序 [计] …」
- **建议：`?`**

## programs → programme
- rank：form 5974 / lemma 4341 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「程序；节目（复数）」 / lemma「节目；计划（英式）」
- ECDICT：form「n. 程序, 程序集；所有程式（program的复数）」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序」
- **建议：`?`**

## fainted → faint
- rank：form 5988 / lemma 6402 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「晕倒（过去式）」 / lemma「昏厥；晕倒」
- ECDICT：form「a. ??人事的, 昏厥的」 / lemma「n. 昏厥, 昏倒 a. 模糊的, 微弱的, 无力的 vi. 昏倒, 变得微弱」
- **建议：`keep`**

## mumbling → mumble
- rank：form 6009 / lemma 20430 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咕哝；含糊地说」 / lemma「含糊地说；咕哝」
- ECDICT：form「n. 喃喃；含糊话；晦涩词语」 / lemma「n. 喃喃而语, 咕哝 v. 喃喃而语, 咕哝」
- **建议：`keep`**

## hips → hip
- rank：form 6023 / lemma 6357 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「臀部（复数）」 / lemma「臀部；髋部」
- ECDICT：form「[化] 高抗冲聚苯乙烯」 / lemma「n. 臀部, 蔷薇果, 忧郁 a. 熟悉内情的 vt. 使忧郁, 给(屋顶)造屋脊 interj. 喝彩声」
- **建议：`keep`**

## expelled → expel
- rank：form 6025 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「开除；驱逐（过去式）」 / lemma「驱逐，开除；排出」
- ECDICT：form「v. 驱逐( expel的过去式和过去分词 ); 赶走; 把…除名; 排出」 / lemma「vt. 驱逐, 逐出, 排出, 开除 [医] 排除, 迫出」
- **建议：`keep`**

## premises → premise
- rank：form 6029 / lemma 8000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「房屋；经营场所」 / lemma「前提；假定」
- ECDICT：form「n. 房屋, 上述各点, 上述房屋 [经] 房屋, 店铺, 契约前言」 / lemma「n. 前提, 房屋连地基, 上述各项 vt. 预先提出, 引出, 作为...的前提 vi. 作出前提」
- **建议：`keep`**

## bruises → bruise
- rank：form 6035 / lemma 8726 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「瘀伤（复数）」 / lemma「瘀伤；擦伤」
- ECDICT：form「n. 瘀伤, 伤痕, 擦伤( bruise的名词复数 )」 / lemma「n. 青肿, 挫伤, 擦伤 vi. 受伤, 擦伤 vt. 使受伤, 研碎」
- **建议：`keep`**

## elections → election
- rank：form 6038 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「选举（复数）」 / lemma「选举，推选」
- ECDICT：form「n. 选举, 选举制；投票（election的复数形式）」 / lemma「n. 选举, 当选, 选择权 [法] 选举, 当选」
- **建议：`keep`**

## annoyed → annoy
- rank：form 6039 / lemma 8275 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恼怒的；烦恼的」 / lemma「使恼怒；打扰」
- ECDICT：form「a. 恼怒的；烦闷的」 / lemma「vt. 使恼怒, 骚扰」
- **建议：`keep`**

## earrings → earring
- rank：form 6041 / lemma 7857 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「耳环」 / lemma「耳环」
- ECDICT：form「n. 耳环；耳饰（earring的复数）」 / lemma「n. 耳环, 耳饰」
- **建议：`keep`**

## narrating → narrate
- rank：form 6045 / lemma 16000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「叙述；讲述」 / lemma「叙述，讲述」
- ECDICT：form「v. 故事( narrate的现在分词 )」 / lemma「v. 说故事, 说明, 叙述」
- **建议：`keep`**

## fulfilled → fulfil
- rank：form 6055 / lemma 12179 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「满足的；实现的」 / lemma「履行；实现」
- ECDICT：form「a. 满足的, 个人志向得以实现的 v. 满足( fulfil的过去式和过去分词 ); 执行; 尽到; 应验」 / lemma「vt. 实践, 履行, 实行, 完成, 结束, 满足 [经] 履行(契约), 满期」
- **建议：`keep`**

## fulfilled → fulfill
- rank：form 6055 / lemma 4654 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「满足的；实现的」 / lemma「履行；实现」
- ECDICT：form「a. 满足的, 个人志向得以实现的 v. 满足( fulfil的过去式和过去分词 ); 执行; 尽到; 应验」 / lemma「vt. 实践, 履行, 实行, 完成, 结束, 满足 [法] 履行, 完成, 达到」
- **建议：`?`**

## dinosaurs → dinosaur
- rank：form 6058 / lemma 6134 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恐龙」 / lemma「恐龙」
- ECDICT：form「n. <生>恐龙( dinosaur的复数形式 ); 守旧落伍的人, 过时落后的东西」 / lemma「n. 恐龙」
- **建议：`keep`**

## acres → acre
- rank：form 6063 / lemma 13701 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「英亩（复数）」 / lemma「英亩」
- ECDICT：form「n. 英亩( acre的复数形式 )」 / lemma「n. 英亩」
- **建议：`keep`**

## concerning → concern
- rank：form 6076 / lemma 12100 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「关于；就…而言」 / lemma「涉及；关心；忧虑」
- ECDICT：form「prep. 关于 [法] 关于」 / lemma「n. 关心, 忧虑 vt. 与...有关, 使担心, 使挂念」
- **建议：`keep`**

## noted → note
- rank：form 6080 / lemma 8319 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「著名的；知名的」 / lemma「笔记；便条」
- ECDICT：form「a. 著名的, 显著的, 扬名的」 / lemma「n. 笔记, 记录, 注解, 票据, 符号, 显要, 注重, 便笺, 照会 vt. 记录, 注解, 注意」
- **建议：`keep`**

## deepest → deep
- rank：form 6105 / lemma 6204 ｜ type `t` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「最深的」 / lemma「深的；深刻的」
- ECDICT：form「a. 深的（ deep的最高级 ）; 严重的; 深奥的; 有…深的」 / lemma「a. 深的 adv. 深入地 n. 深渊, 深处」
- **建议：`keep`**

## banking → bank
- rank：form 6126 / lemma 8199 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「银行业务；银行业」 / lemma「银行；岸；库」
- ECDICT：form「n. 银行业务 [经] 银行业, 银行事务」 / lemma「n. 银行, 堤, 岸 [医] 库」
- **建议：`keep`**

## funding → fund
- rank：form 6133 / lemma 8208 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「资金；拨款」 / lemma「基金；储备；资金」
- ECDICT：form「[经] 债务转期」 / lemma「n. 基金, 资金, 存款, 财源, 贮藏 vt. 提供资金, 积累」
- **建议：`keep`**

## wages → wage
- rank：form 6135 / lemma 6671 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「工资；薪水；报酬」 / lemma「工资；报酬」
- ECDICT：form「n. 工资, 报酬, 薪金, 工钱, 报应, 报答, 年产额 [化] 工资」 / lemma「n. 工资, 报应, 报偿 vt. 开展, 进行 vi. 进行」
- **建议：`keep`**

## cowards → coward
- rank：form 6139 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「胆小鬼；懦夫」 / lemma「胆小鬼，懦夫」
- ECDICT：form「n. 胆小鬼, 懦夫( coward的复数形式 )」 / lemma「n. 懦弱的人, 胆小的人」
- **建议：`keep`**

## clamoring → clamor
- rank：form 6148 / lemma 34951 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「大声要求；喧闹」 / lemma「喧闹；强烈要求」
- ECDICT：form「v. 喧哗, 吵闹( clamor的现在分词 ); 大声地要求或抗议」 / lemma「n. 喧闹, 叫嚷, 大声的要求 v. 喧嚷, 大声地要求」
- **建议：`keep`**

## bacteria → bacterium
- rank：form 6150 / lemma 32871 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「细菌」 / lemma「细菌（单数）」
- ECDICT：form「pl. 细菌 [医] 细菌, [无芽胞]杆菌」 / lemma「n. 细菌 [医] [无芽胞]杆菌属」
- **建议：`keep`**

## summoned → summon
- rank：form 6194 / lemma 6390 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「召唤；传唤」 / lemma「召唤；传唤」
- ECDICT：form「v. 传唤( summon的过去式和过去分词 ); 召唤; 传讯（出庭）; 鼓起（勇气）」 / lemma「vt. 召唤, 召集, 号召, 振奋, 唤起, 鼓起 [经] 传唤, 传讯」
- **建议：`keep`**

## summoned → summons
- rank：form 6194 / lemma 10983 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「召唤；传唤」 / lemma「传票；召唤」
- ECDICT：form「v. 传唤( summon的过去式和过去分词 ); 召唤; 传讯（出庭）; 鼓起（勇气）」 / lemma「n. 召唤, 传唤, 召集, 传票 vt. 传唤, 唤出, 传到」
- **建议：`keep`**

## payments → payment
- rank：form 6217 / lemma 8196 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「付款；款项（payment 复数）」 / lemma「支付；付款；报酬」
- ECDICT：form「n. 惩罚；薪资；支付；付款（payment的复数形式）」 / lemma「n. 付款, 支付的款项(或实物), 偿还, 报应, 惩罚 [经] 支付, 缴纳, 支付款额」
- **建议：`keep`**

## stakes → stake
- rank：form 6223 / lemma 6327 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赌注；利害关系」 / lemma「桩；赌注」
- ECDICT：form「n. 利益；赌注；风险（stake的复数）」 / lemma「n. 桩, 炮烙刑, 木柱, 赌注, 奖金 vt. 打桩, 用桩撑, 下赌注, 资助 vi. 打赌」
- **建议：`keep`**

## kilos → kilo
- rank：form 6224 / lemma 8436 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「千克；公斤（kilo 复数）」 / lemma「千克；公斤」
- ECDICT：form「n. 公斤；千克」 / lemma「n. 千 [计] 千」
- **建议：`keep`**

## mourning → mourn
- rank：form 6245 / lemma 8013 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哀悼；服丧」 / lemma「哀悼；悲伤」
- ECDICT：form「n. 哀痛, 居丧, 举哀, 哀悼, 丧服, 戴孝」 / lemma「v. 哀悼, 忧伤, 服丧」
- **建议：`keep`**

## figuring → figure
- rank：form 6262 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「认为；计算（figure 现在分词）」 / lemma「形状，图形；数字；人物」
- ECDICT：form「v. 用数字表示；计算；修琢（figure的ing形式）」 / lemma「n. 数字, 价格, 图形, 形状 vt. 描绘, 表示, 演算, 认为 vi. 计算, 出现, 估计」
- **建议：`keep`**

## attempts → attempt
- rank：form 6288 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「尝试；企图（复数）」 / lemma「尝试；企图」
- ECDICT：form「n. 企图, 试图；尝试（attempt的复数） v. 试图；努力去做（attempt的三单形式）」 / lemma「n. 尝试, 企图 vt. 尝试, 企图」
- **建议：`keep`**

## installed → install
- rank：form 6305 / lemma 8401 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「安装；任命（过去式）」 / lemma「安装；任命」
- ECDICT：form「a. 安装的；已装入的」 / lemma「vt. 安装, 安置, 使就职 [计] 安装, 安装程序; DOS内部命令:安装常驻程序」
- **建议：`keep`**

## devastated → devastate
- rank：form 6308 / lemma 31340 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「极度震惊的；毁坏的」 / lemma「摧毁；使震惊」
- ECDICT：form「v. 彻底破坏( devastate的过去式和过去分词); 摧毁; 毁灭; 在感情上（精神上、财务上等）压垮 a. 毁坏…」 / lemma「vt. 毁坏 [法] 使荒废, 毁灭, 掠夺」
- **建议：`keep`**

## attempting → attempt
- rank：form 6323 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「尝试；企图（现在分词）」 / lemma「尝试；企图」
- ECDICT：form「v. 试图( attempt的现在分词 ); 尝试; 试图夺取或攻克（堡垒、要塞等）; 试图征服（高山）」 / lemma「n. 尝试, 企图 vt. 尝试, 企图」
- **建议：`keep`**

## deceived → deceive
- rank：form 6324 / lemma 6804 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「欺骗（过去式）」 / lemma「欺骗；误导」
- ECDICT：form「v. 欺骗, 蒙骗( deceive的过去式和过去分词 )」 / lemma「v. 欺骗, 行骗」
- **建议：`keep`**

## mirrors → mirror
- rank：form 6327 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「镜子（复数）」 / lemma「反映，映照」
- ECDICT：form「n. 反光镜；写实；[罕]模范；镜子（mirror的复数）」 / lemma「n. 镜子, 写真, 典范 vt. 反映, 映出」
- **建议：`keep`**

## overwhelmed → overwhelm
- rank：form 6330 / lemma 6500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「不知所措的；压倒的」 / lemma「压倒；使不知所措」
- ECDICT：form「v. 淹没( overwhelm的过去式和过去分词 ); 压倒; 覆盖; 压垮」 / lemma「vt. 淹没, 受打击, 制服, 压倒, 使不知所措 [法] 打翻, 倾覆, 覆盖」
- **建议：`keep`**

## locations → location
- rank：form 6336 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「地点；位置（复数）」 / lemma「位置，地点；外景拍摄地」
- ECDICT：form「n. 位置；定位件；地点（location的复数）」 / lemma「n. 位置, 场所, 特定区域 [计] 位置」
- **建议：`keep`**

## robbers → robber
- rank：form 6338 / lemma 6500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「强盗（复数）」 / lemma「强盗；劫匪」
- ECDICT：form「n. 盗贼（robber的复数形式）」 / lemma「n. 强盗, 盗贼」
- **建议：`keep`**

## disabled → disable
- rank：form 6341 / lemma 12402 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「残疾的；禁用的」 / lemma「使失去能力；禁用」
- ECDICT：form「a. 残废的, 有缺陷的, 失效的 [计] 失效的」 / lemma「vt. 使失去能力, 使残废, (律)使无资格 [计] 使无效, 禁止, 关闭」
- **建议：`keep`**

## revving → rev
- rank：form 6350 / lemma 14599 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「轰油门；加速（现在分词）」 / lemma「发动机转速；牧师」
- ECDICT：form「v. <口>（使）加速( rev的现在分词 ); （数量、活动等）激增; （使发动机）快速旋转; （使）活跃起来」 / lemma「n. 一次回转 v. 加快转速 [计] 反转, 周, 转数」
- **建议：`keep`**

## creaks → creak
- rank：form 6362 / lemma 15584 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出吱嘎声；嘎吱作响」 / lemma「嘎吱作响」
- ECDICT：form「v. （门）嘎吱作响( creak的第三人称单数 )」 / lemma「n. 辗轧声, 嘎吱嘎吱声 vi. 作辗轧声, 发出辗轧声」
- **建议：`keep`**

## tactics → tactic
- rank：form 6407 / lemma 10447 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「战术；策略」 / lemma「策略；战术」
- ECDICT：form「n. 用兵学, 战术, 兵法 [经] 战术, 策略」 / lemma「n. 一项战术, 一条策略 a. 战术的, 顺序的, 排列的」
- **建议：`keep`**

## bushes → bush
- rank：form 6411 / lemma 7545 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灌木丛（复数）」 / lemma「灌木」
- ECDICT：form「n. 灌木（丛）( bush的名词复数 ); [机械学]（金属）衬套; [电学]（绝缘）套管; 类似灌木的东西（尤指浓密…」 / lemma「n. 矮树丛 [化] 管衬」
- **建议：`keep`**

## grandparents → grandparent
- rank：form 6412 / lemma 41542 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「祖父母；外祖父母」 / lemma「祖父母；外祖父母」
- ECDICT：form「n. 外祖父母；祖父母（grandparent的复数）」 / lemma「n. 祖父母」
- **建议：`keep`**

## smuggling → smuggle
- rank：form 6423 / lemma 10134 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「走私；偷运」 / lemma「走私；偷运」
- ECDICT：form「n. 走私 [经] 走私」 / lemma「vt. 偷运, 走私, 私运 vi. 走私」
- **建议：`keep`**

## biscuits → biscuit
- rank：form 6426 / lemma 7488 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「饼干（复数）」 / lemma「饼干；小圆面包」
- ECDICT：form「n. <英>饼干( biscuit的复数形式 ); <美>软烤饼; 松饼（食用时常佐以肉汁）; 淡黄褐色」 / lemma「n. 饼干 [化] 素坯; 饼干」
- **建议：`keep`**

## acquired → acquire
- rank：form 6429 / lemma 8526 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「获得；购得（过去式）」 / lemma「获得；习得」
- ECDICT：form「a. 获得的, 后天的 [医] 获得的, 后天的」 / lemma「vt. 获得, 学到 [电] 目标锁定」
- **建议：`keep`**

## barracks → barrack
- rank：form 6435 / lemma 28939 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「兵营；营房」 / lemma「起哄；喝倒彩；兵营」
- ECDICT：form「n. 兵营, 营房；简陋的房子；警察所（barrack的复数）」 / lemma「n. 兵舍, 军营 vt. 使驻兵营内」
- **建议：`keep`**

## distorted → distort
- rank：form 6438 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「扭曲的；失真的」 / lemma「扭曲；曲解」
- ECDICT：form「a. 歪曲的；受到曲解的」 / lemma「vt. 扭曲, 歪曲 [法] 歪区, 曲解, 纂改」
- **建议：`keep`**

## forests → forest
- rank：form 6442 / lemma 8076 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「森林（复数）」 / lemma「森林」
- ECDICT：form「n. 森林( forest的名词复数 ); 丛林; （森林似的）一丛; 一片」 / lemma「n. 森林, 林区 vt. 植树于」
- **建议：`keep`**

## exclaims → exclaim
- rank：form 6459 / lemma 8000 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「呼喊；惊叫」 / lemma「呼喊，惊叫」
- ECDICT：form「v. 呼喊, 惊叫, 大声说( exclaim的第三人称单数 )」 / lemma「v. 大叫, 呼喊, 大声叫」
- **建议：`keep`**

## volunteered → volunteer
- rank：form 6461 / lemma 14000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「自愿做；志愿服务」 / lemma「志愿者；自愿做」
- ECDICT：form「v. 自动提供, 自愿效劳( volunteer的过去式和过去分词 ); 主动建议（或告诉）; （未经当事人同意）举荐;…」 / lemma「n. 志愿者 a. 志愿的 v. 自愿」
- **建议：`keep`**

## refusing → refuse
- rank：form 6467 / lemma 12500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拒绝」 / lemma「拒绝」
- ECDICT：form「v. 拒绝, 回绝( refuse的现在分词 ); 推却, 回绝; 拒绝给（所需之物）」 / lemma「vt. 拒绝, 谢绝 vi. 拒绝 n. 废物 a. 扔掉的, 无用的」
- **建议：`keep`**

## enters → enter
- rank：form 6505 / lemma 8118 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「进入；输入」 / lemma「进入；参加；输入」
- ECDICT：form「v. 进入( enter的第三人称单数 ); 进去; 参加; 登记」 / lemma「vt. 进入, 参加, 开始, 输入, 回车 vi. 进去, 参加 [计] 输入, 回车」
- **建议：`keep`**

## maps → map
- rank：form 6506 / lemma 8310 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「地图（复数）」 / lemma「地图」
- ECDICT：form「abbr. 管理分析与规划系统（Management Analysis and Planning System）」 / lemma「n. 地图, 天体图, 映像 vt. 映射, 绘制...地图, 计划 [计] 实用程序, 映射, 制造自动化协议」
- **建议：`keep`**

## colored → color
- rank：form 6510 / lemma 1060 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有颜色的；彩色的」 / lemma「颜色」
- ECDICT：form「a. 染色的 [建] 有色的」 / lemma「n. 颜色, 面色, 颜料, 外貌 vt. 把...涂上颜色, 粉饰, 使脸红, 歪曲 vi. 变色」
- **建议：`?`**

## sessions → session
- rank：form 6517 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「会议；一段时间」 / lemma「会议；一场；学期」
- ECDICT：form「n. 会议；会期（session的复数）」 / lemma「n. 期间, 开庭期, 会议, 学期 [计] 会话, 对话, 会晤, 通用任务程序」
- **建议：`keep`**

## forged → forge
- rank：form 6520 / lemma 7232 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「锻造；伪造」 / lemma「锻造；伪造；努力争取」
- ECDICT：form「a. 锻的；锻造的」 / lemma「n. 熔炉, 铁工厂 vt. 打制, 锻造, 伪造 vi. 锻造, 伪造」
- **建议：`keep`**

## authorized → authorize
- rank：form 6525 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「经授权的；认可的」 / lemma「授权，批准」
- ECDICT：form「a. 经认可的, 经授权的 [法] 委任的, 核准的, 许可的」 / lemma「vt. 授权, 批准, 委托 [经] 授权, 委任, 认可」
- **建议：`keep`**

## employed → employ
- rank：form 6529 / lemma 7595 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受雇的；被使用的」 / lemma「雇用；使用」
- ECDICT：form「vt. 雇佣（employ的过去分词）」 / lemma「n. 雇用 vt. 雇用, 使用, 使从事于」
- **建议：`keep`**

## decorated → decorate
- rank：form 6530 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「装饰；授予勋章」 / lemma「装饰；装修；授予勋章」
- ECDICT：form「a. 装饰的, 修饰的」 / lemma「v. 装饰」
- **建议：`keep`**

## detected → detect
- rank：form 6532 / lemma 12200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「察觉；发现」 / lemma「察觉，探测」
- ECDICT：form「a. 检测到的」 / lemma「vt. 发现, 察觉, 探测 [法] 发现, 查明, 探测」
- **建议：`keep`**

## exclaiming → exclaim
- rank：form 6538 / lemma 8000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「呼喊；惊叫」 / lemma「呼喊，惊叫」
- ECDICT：form「v. 呼喊, 惊叫, 大声说( exclaim的现在分词 )」 / lemma「v. 大叫, 呼喊, 大声叫」
- **建议：`keep`**

## tougher → tough
- rank：form 6561 / lemma 8361 ｜ type `r` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更坚韧的；更艰难的」 / lemma「强硬的；坚韧的；艰难的」
- ECDICT：form「较坚强的 较艰苦的（tough的比较级）」 / lemma「n. 恶棍 a. 强硬的, 艰苦的, 坚固的, 坚韧的, 粗暴的, 咬不动的」
- **建议：`keep`**

## stammering → stammer
- rank：form 6586 / lemma 28920 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「结巴地说；口吃」 / lemma「结巴地说」
- ECDICT：form「a. 口吃的, 患口吃的 n. 口吃」 / lemma「v. 口吃, 结结巴巴地说 n. 口吃, 结巴」
- **建议：`keep`**

## e-mails → e-mail
- rank：form 6598 / lemma 3170 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电子邮件」 / lemma「电子邮件」
- ECDICT：form「n. 电子邮件( e-mail的名词复数 ) v. 电子邮件( e-mail的第三人称单数 )」 / lemma「[计] 电子邮件」
- **建议：`keep`**

## distinguished → distinguish
- rank：form 6602 / lemma 11164 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「杰出的；卓越的」 / lemma「区分；辨别」
- ECDICT：form「a. 卓著的, 著名的」 / lemma「v. 区别, 辨别」
- **建议：`keep`**

## programmed → program
- rank：form 6608 / lemma 1165 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「编程；设定（过去式）」 / lemma「节目；程序；计划」
- ECDICT：form「a. 程序化的, 程控的」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序 [计] …」
- **建议：`?`**

## programmed → programme
- rank：form 6608 / lemma 4341 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「编程；设定（过去式）」 / lemma「节目；计划（英式）」
- ECDICT：form「a. 程序化的, 程控的」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序」
- **建议：`?`**

## daring → dare
- rank：form 6635 / lemma 8385 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大胆的；勇敢的」 / lemma「敢；敢于；挑战」
- ECDICT：form「a. 大胆的」 / lemma「n. 挑战, 挑动, 大胆 v. 敢, 胆敢」
- **建议：`keep`**

## condolences → condolence
- rank：form 6640 / lemma 17900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「哀悼；慰问（复数）」 / lemma「吊唁；慰问」
- ECDICT：form「n. 同情, 吊唁( condolence的复数形式 )」 / lemma「n. 哀悼, 吊唁」
- **建议：`keep`**

## shines → shine
- rank：form 6672 / lemma 8037 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发光；照耀（第三人称单数）」 / lemma「发光；照耀；擦亮」
- ECDICT：form「v. 发光；使亮（shine的第三人称单数）」 / lemma「n. 光泽, 阳光 vt. 使发光 vi. 照耀, 发光, 发亮」
- **建议：`keep`**

## inmates → inmate
- rank：form 6675 / lemma 7944 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「囚犯；同住者（复数）」 / lemma「囚犯；被收容者」
- ECDICT：form「n. 囚犯( inmate的复数形式 )」 / lemma「n. 同住者, 被收容者 [法] 内部的, 接近中心的, 内在的」
- **建议：`keep`**

## viewers → viewer
- rank：form 6682 / lemma 14161 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「观众；观看者」 / lemma「观众；观看者」
- ECDICT：form「n. 电视观众( viewer的复数形式 ); 观看者; 勘查孔; 看片机（把幻灯片等放大观看的装置）」 / lemma「n. 观察者, 看电视者, 视察员, 观察器 [化] 指示器」
- **建议：`keep`**

## founded → found
- rank：form 6710 / lemma 178 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「创立；建立（found 的过去式）」 / lemma「找到（find 的过去式）」
- ECDICT：form「a. 有基础的 v. 创办, 成立(found的过去式和过去分词)」 / lemma「vt. 建立, 创立, 铸造 find的过去式和过去分词」
- **建议：`?`**

## civilized → civilize
- rank：form 6746 / lemma 14500 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「文明的；有教养的」 / lemma「使开化，教化」
- ECDICT：form「a. 文明的, 有礼的」 / lemma「vt. 使开化, 使文明 vi. 变文明」
- **建议：`keep`**

## melted → melt
- rank：form 6759 / lemma 7629 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「融化；熔化（melt 的过去式）」 / lemma「融化」
- ECDICT：form「melt的过去式和过去分词」 / lemma「n. 熔化, 熔化物, 溶解 v. (使)熔化, (使)溶解, (使)消散, (使)变软」
- **建议：`keep`**

## narcotics → narcotic
- rank：form 6765 / lemma 15200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「毒品；麻醉剂」 / lemma「麻醉剂；麻醉的」
- ECDICT：form「n. 麻醉毒品；麻醉剂（narcotic的复数）」 / lemma「n. 麻醉药, 镇静剂 a. 麻醉的, 催眠的」
- **建议：`keep`**

## slippers → slipper
- rank：form 6770 / lemma 13792 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拖鞋」 / lemma「拖鞋」
- ECDICT：form「n. 拖鞋（slipper的复数形式）」 / lemma「n. 拖鞋, 制轮器 vt. 用拖鞋打」
- **建议：`keep`**

## footprints → footprint
- rank：form 6774 / lemma 12107 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚印；足迹」 / lemma「脚印；足迹」
- ECDICT：form「n. 足迹；足印；脚印（footprint的复数）」 / lemma「n. 足迹 [计] 印迹」
- **建议：`keep`**

## retarded → retard
- rank：form 6792 / lemma 14200 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「迟钝的；智力迟缓的」 / lemma「延迟，妨碍」
- ECDICT：form「a. 智力上迟钝的」 / lemma「n. 阻止, 延迟 vt. 妨碍, 延迟, 使减速 vi. 减速, 延迟」
- **建议：`keep`**

## applauding → applaud
- rank：form 6834 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「鼓掌；称赞（现在分词）」 / lemma「鼓掌；称赞」
- ECDICT：form「vt. 赞同；称赞；向…喝采 vi. 喝彩；鼓掌欢迎」 / lemma「v. 拍手喝彩, 称赞, 赞同」
- **建议：`keep`**

## negotiations → negotiation
- rank：form 6867 / lemma 8717 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「谈判；协商」 / lemma「谈判；协商」
- ECDICT：form「n. 磋商；谈判（negotiation的复数）」 / lemma「n. 谈判, 磋商, 交涉 [经] 谈判, 协商」
- **建议：`keep`**

## overheard → overhear
- rank：form 6869 / lemma 16735 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「无意中听到；偷听」 / lemma「无意中听到；偷听」
- ECDICT：form「overhear的过去式和过去分词」 / lemma「vt. 无意中听到, 偷听」
- **建议：`keep`**

## refugees → refugee
- rank：form 6874 / lemma 8832 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「难民（复数）」 / lemma「难民」
- ECDICT：form「n. 避难者, 难民( refugee的复数形式 )」 / lemma「n. 难民, 流亡者 [法] 避难者, 流亡者, 难民」
- **建议：`keep`**

## disappointing → disappoint
- rank：form 6884 / lemma 4282 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人失望的」 / lemma「使失望」
- ECDICT：form「a. 使失望的, 期待落空的, 令人沮丧的」 / lemma「vt. 使失望」
- **建议：`?`**

## predators → predator
- rank：form 6903 / lemma 6944 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「捕食者；掠夺者」 / lemma「捕食者；掠夺者」
- ECDICT：form「n. 食肉动物( predator的复数形式 ); 奴役他人者（尤指在财务或性关系方面）」 / lemma「n. 食肉动物, 掠夺者 [医] 捕食者」
- **建议：`keep`**

## accusations → accusation
- rank：form 6904 / lemma 8166 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「指控；指责」 / lemma「指控；控告」
- ECDICT：form「n. 指责( accusation的复数形式 ); 指控; 控告; （被告发、控告的）罪名」 / lemma「n. 控告, 指控, 指责 [法] 控告, 起诉, 告发」
- **建议：`keep`**

## olympics → olympic
- rank：form 6905 / lemma 6397 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「奥运会」 / lemma「奥林匹克的」
- ECDICT：form「n. 奥林匹克运动会」 / lemma「a. 奥林匹亚的, 奥林匹斯山的, 强有力的, 巨大的」
- **建议：`keep`**

## approaches → approach
- rank：form 6912 / lemma 8115 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「方法；接近（复数）」 / lemma「接近；靠近；着手处理」
- ECDICT：form「处理」 / lemma「n. 接近, 入门 vt. 接近, 近似, 找...商量 vi. 靠近」
- **建议：`keep`**

## grapes → grape
- rank：form 6917 / lemma 8779 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「葡萄（复数）」 / lemma「葡萄」
- ECDICT：form「[医] 马体葡萄疮, 牛结核」 / lemma「n. 葡萄, 葡萄树 [医] 葡萄」
- **建议：`keep`**

## rustling → rustle
- rank：form 6923 / lemma 15659 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「沙沙声；偷牲畜」 / lemma「沙沙作响」
- ECDICT：form「n. 沙沙声, 瑟瑟声」 / lemma「n. 沙沙声, 瑟瑟声, 飒飒声, 急忙 vi. 发出沙沙声 vt. 使飒飒作响」
- **建议：`keep`**

## thugs → thug
- rank：form 6964 / lemma 7489 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暴徒（复数）」 / lemma「暴徒；恶棍」
- ECDICT：form「n. 暴徒, 恶棍, 流氓( thug的复数形式 )」 / lemma「n. 恶棍, 刺客, 凶手 [法] 凶手, 刺客, 暴徒」
- **建议：`keep`**

## grams → gram
- rank：form 6965 / lemma 10339 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「克（复数）」 / lemma「克（重量单位）」
- ECDICT：form「n. 克（gram的复数形式）」 / lemma「n. 克, 绿豆, 鹰嘴豆 [医] 克」
- **建议：`keep`**

## smelling → smell
- rank：form 6977 / lemma 7677 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闻；散发气味」 / lemma「嗅；闻」
- ECDICT：form「v. 嗅, 闻( smell的现在分词 ); 闻到; 嗅出; 觉察出」 / lemma「n. 味道, 气味, 嗅觉, 嗅, 臭味, 气息 vt. 闻, 探出, 察觉, 发出...的气味 vi. 嗅, 散发气味…」
- **建议：`keep`**

## filing → file
- rank：form 6992 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「归档；提交；锉」 / lemma「文件；档案；行列」
- ECDICT：form「n. 锉, 琢磨, 锉屑 [计] 编档; 文件编排」 / lemma「n. 档案, 公文箱, 文件夹, 文件, 卷宗, 锉刀 vi. 列队行进, 用锉刀做 vt. 归档, 申请, 锉, 琢磨…」
- **建议：`keep`**

## admired → admire
- rank：form 6995 / lemma 12600 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「钦佩（过去式/过去分词）」 / lemma「钦佩，赞赏；欣赏」
- ECDICT：form「v. 羡慕, 赞美；钦佩（admire的过去分词） a. 受人钦佩的；感到羡慕的」 / lemma「vt. 赞美, 钦佩, 爱慕 vi. 称赞, 惊奇」
- **建议：`keep`**

## imprisoned → imprison
- rank：form 7007 / lemma 19589 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被监禁的；关押的」 / lemma「监禁；关押」
- ECDICT：form「v. 下狱, 监禁( imprison的过去式和过去分词 )」 / lemma「vt. 使下狱, 关闭, 拘禁, 限制 [法] 关押, 监禁, 限制」
- **建议：`keep`**

## equipped → equip
- rank：form 7014 / lemma 32585 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「装备的；具备的」 / lemma「装备；配备」
- ECDICT：form「v. 装备；整装；预备（equip的过去分词）」 / lemma「vt. 装备, 配备 [机] 设备, 装置」
- **建议：`keep`**

## violated → violate
- rank：form 7019 / lemma 15000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「违反；侵犯（过去式）」 / lemma「违犯，侵犯，扰乱」
- ECDICT：form「v. 亵渎( violate的过去式和过去分词 ); 违反; 侵犯; 强奸」 / lemma「vt. 违犯, 亵渎, 违反, 侵犯, 妨碍 [经] 违犯, 违反」
- **建议：`keep`**

## commanding → command
- rank：form 7037 / lemma 12100 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「指挥的；威严的」 / lemma「命令；指挥；掌握」
- ECDICT：form「a. 指挥的, 威风凛凛的, 居高临下的」 / lemma「n. 命令, 指挥, 控制, 部队, 司令部 v. 命令, 指挥, 控制 [计] 命令; 指令; DOS外部命令:启动新…」
- **建议：`keep`**

## clatters → clatter
- rank：form 7039 / lemma 9037 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出咔嗒声（第三人称单数）」 / lemma「咔嗒声；喧闹声」
- ECDICT：form「n. 盘碟刀叉等相撞击时的声音( clatter的名词复数 )」 / lemma「n. 咔嗒声, 哗啦声, 嘈杂的谈笑声 vi. 发出哗啦声, 喧闹的谈笑 vt. 使咔嗒咔嗒地响」
- **建议：`keep`**

## pupils → pupil
- rank：form 7049 / lemma 7612 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「学生；瞳孔（复数）」 / lemma「学生；瞳孔」
- ECDICT：form「n. 学生( pupil的复数形式 ); 瞳孔; 弟子; 门生」 / lemma「n. 学生, 门生, 未成年人, 瞳孔 [医] 瞳孔」
- **建议：`keep`**

## tempted → tempt
- rank：form 7067 / lemma 9183 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被诱惑的；心动的」 / lemma「诱惑；引诱」
- ECDICT：form「v. 怂恿（某人）干不正当的事; 冒...的险（tempt的过去分词）」 / lemma「vt. 诱惑, 引诱, 引起...的兴趣, 吸引, 冒...风险」
- **建议：`keep`**

## overlapping → overlap
- rank：form 7081 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「重叠的；部分相同的」 / lemma「部分重叠；交叠」
- ECDICT：form「[计] 重叠, 覆盖 [医] 重迭」 / lemma「n. 重叠, 重复, 部分的同时发生 vt. 重叠, 重复, 与...同时发生 vi. 迭盖, 部分的同时发生 [计] …」
- **建议：`keep`**

## flipped → flip
- rank：form 7082 / lemma 8379 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「翻转；轻弹（flip的过去式）」 / lemma「轻掷；翻转；翻动」
- ECDICT：form「v. 轻弹( flip的过去式和过去分词 ); 按（开关）; 快速翻转; 急挥」 / lemma「vt. 掷, 弹, 轻击, 空翻 vi. 用指轻弹, 抽打, 蹦跳 n. 抛, 弹, 筋斗 a. 无礼的 [计] 翻转」
- **建议：`keep`**

## reinforcements → reinforcement
- rank：form 7109 / lemma 20013 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「增援；加固物」 / lemma「强化；增援」
- ECDICT：form「n. 增援部队, 援军, 加固物」 / lemma「n. 加强, 增援, 补充, 援军, 加固物 [化] 补强; 加强件」
- **建议：`keep`**

## investors → investor
- rank：form 7122 / lemma 10735 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「投资者（investor的复数）」 / lemma「投资者；投资人」
- ECDICT：form「n. 投资者, 出资者( investor的复数形式 )」 / lemma「n. 投资者 [经] 投资者」
- **建议：`keep`**

## melting → melt
- rank：form 7130 / lemma 7629 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「融化；熔化（melt的现在分词）」 / lemma「融化」
- ECDICT：form「a. 熔化的, 温柔的, 令人感动的, 甜美的 [化] 熔化」 / lemma「n. 熔化, 熔化物, 溶解 v. (使)熔化, (使)溶解, (使)消散, (使)变软」
- **建议：`keep`**

## commands → command
- rank：form 7152 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「命令；指令（command的复数）」 / lemma「命令；指挥；掌握」
- ECDICT：form「n. 命令, 指令（command复数形式）」 / lemma「n. 命令, 指挥, 控制, 部队, 司令部 v. 命令, 指挥, 控制 [计] 命令; 指令; DOS外部命令:启动新…」
- **建议：`keep`**

## demanded → demand
- rank：form 7153 / lemma 12800 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「要求；需要（demand的过去式）」 / lemma「要求；强烈请求」
- ECDICT：form「v. 要求( demand的过去式和过去分词 ); 需要; 想要知道; 查问」 / lemma「n. 要求, 需求, 需要 v. 要求, 查询」
- **建议：`keep`**

## fascinated → fascinate
- rank：form 7164 / lemma 29412 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「着迷的；极感兴趣的」 / lemma「使着迷；吸引」
- ECDICT：form「a. 着迷的；被深深吸引的」 / lemma「vt. 令人入神, 使着迷 vi. 入迷」
- **建议：`keep`**

## imitates → imitate
- rank：form 7174 / lemma 12500 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「模仿；仿效」 / lemma「模仿，仿效」
- ECDICT：form「v. 模仿( imitate的第三人称单数 ); 把…作为例子; 模仿（某人的讲话、举止）; 作滑稽模仿」 / lemma「vt. 模仿, 效法, 冒充, 仿造」
- **建议：`keep`**

## greeks → greek
- rank：form 7195 / lemma 2608 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「希腊人（复数）」 / lemma「希腊的；希腊人」
- ECDICT：form「n. 希腊人（Greek的复数）」 / lemma「n. 希腊人, 希腊语 a. 希腊的, 希腊人的 [计] 希腊」
- **建议：`keep`**

## stammers → stammer
- rank：form 7199 / lemma 28920 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「结巴地说」 / lemma「结巴地说」
- ECDICT：form「n. 口吃, 结巴( stammer的名词复数 ) v. 结巴地说出( stammer的第三人称单数 )」 / lemma「v. 口吃, 结结巴巴地说 n. 口吃, 结巴」
- **建议：`keep`**

## sanders → sander
- rank：form 7207 / lemma 20114 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「桑德斯（姓氏）」 / lemma「打磨机；桑德（人名）」
- ECDICT：form「[医] 檀香, 檀木」 / lemma「[电] 散沙」
- **建议：`keep`**

## soaked → soak
- rank：form 7216 / lemma 8589 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「湿透的」 / lemma「浸泡；湿透」
- ECDICT：form「a. 湿透的」 / lemma「n. 浸, 湿透, 大雨 vt. 使上下湿透, 浸, 吸入, 吸收, 浸洗掉 vi. 浸泡, 渗透」
- **建议：`keep`**

## logs → log
- rank：form 7223 / lemma 7596 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「原木；日志（复数）」 / lemma「原木；圆木」
- ECDICT：form「n. 日志；原木（log的复数）」 / lemma「n. 记录, 圆木, 日志, 计程仪 vt. 伐木, 切, 航行 vi. 伐木 [计] 日志」
- **建议：`keep`**

## insists → insist
- rank：form 7237 / lemma 12500 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「坚持；坚决要求」 / lemma「坚持；坚决主张」
- ECDICT：form「v. 坚决宣称, 坚持认为( insist的第三人称单数 ); 坚决要求」 / lemma「v. 坚持, 坚决主张, 强调」
- **建议：`keep`**

## gangsters → gangster
- rank：form 7257 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「歹徒；黑帮（复数）」 / lemma「歹徒，匪徒」
- ECDICT：form「n. 匪徒, 歹徒( gangster的复数形式 )」 / lemma「n. 流氓, 歹徒 [法] 暴徒, 恶棍, 打手」
- **建议：`keep`**

## shrieks → shriek
- rank：form 7265 / lemma 17886 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫；尖声喊」 / lemma「尖叫；尖声喊」
- ECDICT：form「n. 尖叫声( shriek的名词复数 ) v. 尖叫( shriek的第三人称单数 )」 / lemma「n. 尖锐的响声 vi. 尖叫, 发尖声 vt. 尖声发出」
- **建议：`keep`**

## crops → crop
- rank：form 7274 / lemma 7554 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「农作物；庄稼（复数）」 / lemma「作物；收成」
- ECDICT：form「[医] 分批出现(疹)」 / lemma「n. 农作物, 产量, 平头 vt. 收割, 修剪, 种植 vi. 收获 [计] 裁剪」
- **建议：`keep`**

## cultures → culture
- rank：form 7283 / lemma 12600 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「文化（复数）」 / lemma「文化；培养（物）」
- ECDICT：form「n. 文明, 文化（culture复数）」 / lemma「n. 文化, 修养, 耕种 vt. 耕种, 培养」
- **建议：`keep`**

## calculations → calculation
- rank：form 7289 / lemma 14569 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「计算；估算（复数）」 / lemma「计算；算计」
- ECDICT：form「n. 计算器；计算, 运算（calculation的复数形式）」 / lemma「n. 计算, 考虑, 计算的结果 [经] 计算」
- **建议：`keep`**

## devastating → devastate
- rank：form 7301 / lemma 31340 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「毁灭性的；令人震惊的」 / lemma「摧毁；使震惊」
- ECDICT：form「a. 毁灭性的, (非正式)很好的, 引人注目的」 / lemma「vt. 毁坏 [法] 使荒废, 毁灭, 掠夺」
- **建议：`keep`**

## dripping → drip
- rank：form 7304 / lemma 7801 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滴下；滴水」 / lemma「滴下；滴水」
- ECDICT：form「n. 滴, 滴下物, 水滴」 / lemma「n. 水滴 v. (使)滴下」
- **建议：`keep`**

## ops → op
- rank：form 7305 / lemma 7483 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「操作；行动（复数）」 / lemma「手术；军事行动」
- ECDICT：form「abbr. （美国）物价管制局（Office of Price Stabilization）；管道安全处（Office …」 / lemma「观测所 [计] 操作, 运算, 算符」
- **建议：`keep`**

## suited → suit
- rank：form 7308 / lemma 7770 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「适合的；相配的」 / lemma「套装；西服」
- ECDICT：form「a. 适合的」 / lemma「n. 套装, 诉讼, 请求, 起诉, 套, 组 vt. 适合, 使适应 vi. 合适, 相称」
- **建议：`keep`**

## italians → italian
- rank：form 7313 / lemma 1562 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「意大利人（复数）」 / lemma「意大利的；意大利人」
- ECDICT：form「n. 意大利人, 意大利国民, 意大利语( Italian的复数形式 )」 / lemma「n. 意大利人, 意大利语 a. 意大利的, 意大利语的」
- **建议：`keep`**

## diapers → diaper
- rank：form 7323 / lemma 7696 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尿布（复数）」 / lemma「尿布」
- ECDICT：form「n. 有菱形花格的麻或棉织物( diaper的复数形式 ); 尿布」 / lemma「n. 尿布 [医] 尿布, 兜布」
- **建议：`keep`**

## cubs → cub
- rank：form 7327 / lemma 8183 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「幼兽（复数）」 / lemma「幼兽；幼崽」
- ECDICT：form「n. 幼童军」 / lemma「n. 幼兽, 年轻人」
- **建议：`keep`**

## starters → starter
- rank：form 7337 / lemma 10087 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开胃菜；首发（复数）」 / lemma「开胃菜；启动器」
- ECDICT：form「n. 开胃菜（starter的复数形式）」 / lemma「n. 开端者, 在起跑线上的人, 参加赛跑的人, 调度员, 起动机, 酵母 [计] 启动程序, 启动器」
- **建议：`keep`**

## acquainted → acquaint
- rank：form 7339 / lemma 33747 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「熟悉的；相识的」 / lemma「使熟悉；使了解」
- ECDICT：form「a. 知晓的；有知识的；熟识的」 / lemma「vt. 使认识, 介绍」
- **建议：`keep`**

## dares → dare
- rank：form 7344 / lemma 8385 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「敢；胆敢（三单）」 / lemma「敢；敢于；挑战」
- ECDICT：form「v. 敢( dare的第三人称单数 ); 敢做; 激（某人做某事）; 问（某人）有没有胆量（做某事）」 / lemma「n. 挑战, 挑动, 大胆 v. 敢, 胆敢」
- **建议：`keep`**

## rumours → rumour
- rank：form 7381 / lemma 8693 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「谣言（复数）」 / lemma「谣言；传闻」
- ECDICT：form「n. 传闻( rumour的名词复数 ); 风闻; 谣言; 谣传」 / lemma「n. 谣言, 传闻 vt. 谣传」
- **建议：`keep`**

## invaded → invade
- rank：form 7388 / lemma 12100 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「入侵；侵略（过去式）」 / lemma「侵入，侵略」
- ECDICT：form「v. 侵入, 侵略( invade的过去式和过去分词 ); 涌入; 侵袭; 侵犯」 / lemma「vt. 侵入, 拥入, 侵略, 侵袭 [法] 强入, 侵犯, 侵略」
- **建议：`keep`**

## chores → chore
- rank：form 7398 / lemma 17056 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「家务；杂务（复数）」 / lemma「家务活，杂务」
- ECDICT：form「n. chore的复数; 零星工作（尤指家常杂务）( chore的复数形式 ); 零活儿」 / lemma「n. 零工, 家务 [经] 零工」
- **建议：`keep`**

## dicks → dick
- rank：form 7409 / lemma 976 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「家伙（俚）；迪克（人名）」 / lemma「阴茎（粗俗）；家伙」
- ECDICT：form「n. 迪克斯（男子名）」 / lemma「n. 家伙, 词典, 誓言(书) [医] 二氯乙胂(毒气)」
- **建议：`keep`**

## paralyzed → paralyze
- rank：form 7410 / lemma 25434 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「瘫痪的；麻痹的」 / lemma「使瘫痪；使麻痹」
- ECDICT：form「a. 瘫痪的；麻痹的」 / lemma「vt. 使瘫痪, 使麻痹 [医] 使麻痹, 使瘫痪」
- **建议：`keep`**

## headlines → headline
- rank：form 7411 / lemma 8074 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「头条新闻（复数）」 / lemma「标题；头条新闻」
- ECDICT：form「n. 大字标题( headline的名词复数 ); 新闻提要」 / lemma「n. 大标题, 新闻摘要 vt. 为...做标题, 写标题」
- **建议：`keep`**

## stripes → stripe
- rank：form 7412 / lemma 16857 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「条纹（复数）」 / lemma「条纹；条带」
- ECDICT：form「n. 条子布；条纹布（stripe复数形式）」 / lemma「n. 斑纹, 条纹 [医] 纹, 条纹」
- **建议：`keep`**

## protects → protect
- rank：form 7420 / lemma 12100 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「保护；防护」 / lemma「保护」
- ECDICT：form「v. 保护( protect的第三人称单数 ); 防护; 投保; 关税保护」 / lemma「vt. 防卫, 保护, 警戒 [法] 庇护, 保护, 警戒」
- **建议：`keep`**

## weeping → weep
- rank：form 7424 / lemma 7992 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哭泣；流泪」 / lemma「哭泣；流泪」
- ECDICT：form「n. 哭泣, 流泪 a. 哭泣的, 滴水的, 泪汪汪的, 下雨的, 多雨的, 垂枝的」 / lemma「n. 哭, 哭泣 vi. 哭泣, 流泪, 哀悼, 滴落 vt. 哭着使..., 悲叹, 滴下」
- **建议：`keep`**

## fragments → fragment
- rank：form 7425 / lemma 12900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「碎片（复数）」 / lemma「碎片；片段」
- ECDICT：form「n. 碎片( fragment的名词复数 ); 片段; （将文件内容）分段; （文艺作品等）未完成的部分」 / lemma「n. 碎片, 破片, 片段 [计] 段落; 片段; 分段」
- **建议：`keep`**

## pins → pin
- rank：form 7428 / lemma 7752 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「别针（复数）；钉住」 / lemma「别针；大头针」
- ECDICT：form「n. 插脚, 针；精确的综合导航系统」 / lemma「n. 大头针, 针, 别针, 栓, 销子, 图钉, 插头, 管脚, 品(液量单位) vt. 将...用针别住, 钉住, …」
- **建议：`keep`**

## lars → lar
- rank：form 7437 / lemma 23770 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「拉尔斯（人名）」 / lemma「家神；拉尔（罗马守护神）」
- ECDICT：form「n. 拉尔斯（男子名）」 / lemma「n. 家庭守护神」
- **建议：`keep`**

## astonishing → astonish
- rank：form 7462 / lemma 34240 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人惊讶的」 / lemma「使惊讶；使吃惊」
- ECDICT：form「a. 令人惊讶的」 / lemma「vt. 使惊讶」
- **建议：`keep`**

## siblings → sibling
- rank：form 7478 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「兄弟姐妹（复数）」 / lemma「兄弟姐妹」
- ECDICT：form「n. 兄弟, 姐妹( sibling的复数形式 )」 / lemma「n. 兄弟, 同胞 [医] 同胞(兄弟姐妹)」
- **建议：`keep`**

## dolphins → dolphin
- rank：form 7497 / lemma 7838 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「海豚」 / lemma「海豚」
- ECDICT：form「n. 海豚；系缆柱（dolphin的复数）」 / lemma「n. 海豚」
- **建议：`keep`**

## kidneys → kidney
- rank：form 7498 / lemma 7860 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「肾脏；腰子」 / lemma「肾脏；肾」
- ECDICT：form「n. 肾脏；转炉的附着物；肾形矿脉（kidney的复数）」 / lemma「n. 肾, 个性 [医] 肾」
- **建议：`keep`**

## weighs → weigh
- rank：form 7522 / lemma 7671 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「称重；重量为」 / lemma「称重」
- ECDICT：form「v. 称…的重量( weigh的第三人称单数 ); 重达; 权衡, 考虑; 有…重」 / lemma「vt. 称...重量, 衡量, 把...压弯, 考虑, 权衡, 起锚 vi. 称分量, 有意义, 重压, 起锚 n. 过…」
- **建议：`keep`**

## vibrating → vibrate
- rank：form 7524 / lemma 17467 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「振动；颤动」 / lemma「振动；颤动」
- ECDICT：form「[电] 振动; 振动的」 / lemma「vi. 振动, 颤动, 激动, 摇摆, 踌躇 vt. 使颤动, 使振动, 使摆动」
- **建议：`keep`**

## hormones → hormone
- rank：form 7533 / lemma 12254 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「激素；荷尔蒙」 / lemma「激素；荷尔蒙」
- ECDICT：form「n. 荷尔蒙；激素；性激素；荷尔蒙制剂（hormone的复数）」 / lemma「n. 荷尔蒙 [化] 激素(旧称荷尔蒙)」
- **建议：`keep`**

## handles → handle
- rank：form 7574 / lemma 7725 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「处理；把手（复数/三单）」 / lemma「把手；柄」
- ECDICT：form「n. 把；柄；控键（handle的复数形式）」 / lemma「n. 柄, 把手, 把柄, 柄状物, 手感 vt. 触摸, 运用, 买卖, 处理, 操作 vi. 搬运, 易于操纵 n.…」
- **建议：`keep`**

## consumed → consume
- rank：form 7586 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「消耗；消费（过去式）」 / lemma「消耗，消费；吃喝」
- ECDICT：form「a. 充满的；对…著迷的」 / lemma「vt. 消耗, 消费, 消灭 vi. 耗尽, 毁灭」
- **建议：`keep`**

## apologizing → apologize
- rank：form 7600 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「道歉（现在分词）」 / lemma「道歉，谢罪」
- ECDICT：form「v. 道歉（apologize的ing形式）；谢罪」 / lemma「vi. 道歉, 辩解」
- **建议：`keep`**

## suspicions → suspicion
- rank：form 7609 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「怀疑；猜疑（复数）」 / lemma「怀疑，猜疑」
- ECDICT：form「n. 怀疑( suspicion的复数形式 ); 疑心; 感觉; 一点儿」 / lemma「n. 怀疑, 觉察, 嫌疑 [法] 怀疑, 疑心, 嫌疑」
- **建议：`keep`**

## restricted → restrict
- rank：form 7610 / lemma 22373 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「受限制的；有限的」 / lemma「限制；约束」
- ECDICT：form「a. 受限制的, 有限的」 / lemma「vt. 限制, 限定, 约束 [医] 限制」
- **建议：`keep`**

## diagnosed → diagnose
- rank：form 7624 / lemma 12600 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「诊断（过去式）」 / lemma「诊断；判断」
- ECDICT：form「v. 诊断( diagnose的过去式和过去分词 )」 / lemma「v. 诊断」
- **建议：`keep`**

## crackers → cracker
- rank：form 7670 / lemma 8682 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「薄脆饼干；疯狂」 / lemma「薄脆饼干；爆竹」
- ECDICT：form「a. 精神错乱的, 癫狂的, 狂热的」 / lemma「n. 饼干, 爆竹 [计] 破袭者」
- **建议：`keep`**

## persuaded → persuade
- rank：form 7679 / lemma 12500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「说服；劝服」 / lemma「说服；劝服」
- ECDICT：form「v. 说服( persuade的过去式和过去分词 ); 劝告; 使信服; 使相信」 / lemma「vt. 劝, 使相信, 恳求, 敦促, 说服 vi. 劝服, 被说服」
- **建议：`keep`**

## lakhs → lakh
- rank：form 7685 / lemma 12385 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「十万（印度计数单位）」 / lemma「十万（印度英语）」
- ECDICT：form「n. （印）十万；十万卢比；多数 a. 十万的」 / lemma「n. 十万, 十万卢比, 多数 [化] 紫胶; 虫胶」
- **建议：`keep`**

## partying → party
- rank：form 7703 / lemma 306 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「参加聚会；狂欢」 / lemma「聚会；政党」
- ECDICT：form「v. 为…举行社交聚会（party的现在分词形式）」 / lemma「n. 宴会, 党, 政党, 团体, 当事人, 聚会 v. 举办聚会」
- **建议：`?`**

## complications → complication
- rank：form 7708 / lemma 14870 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「并发症；复杂情况」 / lemma「并发症；复杂化」
- ECDICT：form「n. 并病；并发症（complication的复数）」 / lemma「n. 复杂化, 复杂情况 [医] 并发症, 并发病」
- **建议：`keep`**

## motivated → motivate
- rank：form 7722 / lemma 16419 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有积极性的；有动机的」 / lemma「激励；激发」
- ECDICT：form「a. 有动机的, 目的明确的」 / lemma「vt. 给与动机, 刺激, 提高...的学习欲望, 促动 [经] 促动, 激发, 激励」
- **建议：`keep`**

## expanding → expand
- rank：form 7726 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「扩大；膨胀」 / lemma「扩张；展开」
- ECDICT：form「[机] 扩张工作」 / lemma「vt. 使膨胀, 详述, 扩张 vi. 张开, 发展 vt. 展开 vi. 展开 [计] 展开; DOS外部命令:将原始…」
- **建议：`keep`**

## stumbled → stumble
- rank：form 7730 / lemma 8154 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「绊倒；踉跄」 / lemma「绊倒；蹒跚；结巴」
- ECDICT：form「v. （不顺畅地）说( stumble的过去式和过去分词 ); 跌跌撞撞地走; 绊脚; （说话、演奏等）出错」 / lemma「n. 绊倒, 蹒跚而行, 失足 vt. 使绊倒, 使困惑 vi. 绊倒, 失足, 失策, 犯错, 蹒跚, 踌躇」
- **建议：`keep`**

## confronted → confront
- rank：form 7732 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「面对；对抗」 / lemma「面对，对抗」
- ECDICT：form「v. 面对( confront的过去式和过去分词 ); 使面对; 使对质; 处理」 / lemma「vt. 使面对, 对抗, 遭遇, 使对质, 比较 [法] 对证, 使对质, 比较」
- **建议：`keep`**

## exploding → explode
- rank：form 7741 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「爆炸；激增」 / lemma「爆炸；激增；破除（迷信等）」
- ECDICT：form「v. （使）爆炸( explode的现在分词 ); 突然（发出巨响, 活跃起来, 迸发感情）; 推翻; 驳倒」 / lemma「vi. 爆炸, 爆发, 激增 vt. 使爆炸」
- **建议：`keep`**

## severed → sever
- rank：form 7745 / lemma 14612 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「切断；割断」 / lemma「切断；割断」
- ECDICT：form「a. 隔断的；切断的」 / lemma「vt. 切断, 脱离, 分开, 使分离, 断绝, 中断 vi. 断, 裂开」
- **建议：`keep`**

## miners → miner
- rank：form 7750 / lemma 11657 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「矿工（复数）」 / lemma「矿工」
- ECDICT：form「n. 矿工( miner的复数形式 )」 / lemma「n. 矿工, 开矿机, 坑道工兵 [经] 矿工」
- **建议：`keep`**

## eyebrows → eyebrow
- rank：form 7759 / lemma 14431 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眉毛（复数）」 / lemma「眉毛」
- ECDICT：form「n. 眉毛（eyebrow的复数）」 / lemma「n. 眉毛 [医] 眉」
- **建议：`keep`**

## nipples → nipple
- rank：form 7762 / lemma 9664 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乳头（复数）」 / lemma「乳头；奶嘴」
- ECDICT：form「n. 乳头( nipple的复数形式 ); <美>（奶品的）橡皮奶头; （机器上的）乳头状注油口; 加油嘴」 / lemma「n. 乳头, 奶头, 奶嘴 [化] 螺纹接口; 螺纹接套」
- **建议：`keep`**

## refreshing → refresh
- rank：form 7766 / lemma 11551 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「清爽的；令人耳目一新的」 / lemma「使恢复精神；刷新」
- ECDICT：form「a. 使清爽的, 有精神的, 爽快的」 / lemma「vt. 使清新, 使恢复, 使生气蓬勃 vi. 提起精神, 恢复精神, 吃点心, 喝饮料 vt. 刷新, 重新整理 vi…」
- **建议：`keep`**

## confined → confine
- rank：form 7771 / lemma 13500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「受限的；狭窄的」 / lemma「限制；禁闭」
- ECDICT：form「a. 被限制的, 狭窄的, 在分娩中的, 坐月子的 [法] 有限的, 狭窄的」 / lemma「vt. 限制, 使不外出, 禁闭 vi. 邻接, 交界 n. 边缘, 范围, 区域」
- **建议：`keep`**

## shorts → short
- rank：form 7779 / lemma 1470 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「短裤」 / lemma「短的；不足的」
- ECDICT：form「n. 短裤, (美)男人的短衬裤 [经] 空头户, 空头, 短期债券」 / lemma「a. 短的, 近的, 矮的, 短期的, 简短的, 少量的 adv. 简短地, 突然 n. 扼要, 短片, 缺乏 vt. …」
- **建议：`?`**

## pants → pant
- rank：form 7782 / lemma 12658 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「裤子；短裤」 / lemma「喘气；气喘」
- ECDICT：form「n. 裤子, 长裤, 短衬裤, 女式运动短裤」 / lemma「n. 喘息, 悸动 vi. 喘息, 渴望 vt. 气喘吁吁地说」
- **建议：`keep`**

## blares → blare
- rank：form 7786 / lemma 26089 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出刺耳响声」 / lemma「发出刺耳响声」
- ECDICT：form「n. 嘟嘟声, 响而刺耳的声音( blare的名词复数 ); （颜色等的）光泽 v. （喇叭或其他高音器具）刺耳地大声鸣…」 / lemma「n. 巨响, 吼叫声, 光泽 vi. 高声鸣叫, 大叫 vt. 大声喊出」
- **建议：`keep`**

## editing → edit
- rank：form 7799 / lemma 9919 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编辑；剪辑」 / lemma「编辑；剪辑」
- ECDICT：form「a. 编辑的」 / lemma「vt. 编辑, 编校, 修订, 剪辑 [计] 编辑; DOS外部命令:该命令是一个用于编辑文本文件的全屏幕编辑程序」
- **建议：`keep`**

## manning → man
- rank：form 7807 / lemma 530 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「曼宁（姓氏）」 / lemma「男人；人」
- ECDICT：form「n. 人员配备」 / lemma「n. 男人, 人类, 人 vt. 为...配备人手, 操纵, 使振奋 [计] 城域网, 手册」
- **建议：`?`**

## organised → organise
- rank：form 7811 / lemma 10874 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「有组织的；有条理的」 / lemma「组织；安排」
- ECDICT：form「a. 有组织的, 组织起来的」 / lemma「vt. 组织, 有机化, 给予生机」
- **建议：`keep`**

## clanging → clang
- rank：form 7812 / lemma 13128 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出叮当声」 / lemma「叮当声；铿锵声」
- ECDICT：form「v. （使）叮当地响( clang的现在分词 )」 / lemma「n. 当当声, 铿锵声 vi. 发出当当声, 发铿锵声 vt. 使发铿锵声」
- **建议：`keep`**

## trafficking → traffic
- rank：form 7817 / lemma 1558 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「非法交易；贩运」 / lemma「交通；运输」
- ECDICT：form「n. 非法交易」 / lemma「n. 交通, 通行, 运输, 交通量, 贸易, 交易, 交往, 通信量 vi. 交易, 做买卖 vt. 用...作交换 …」
- **建议：`?`**

## whooshing → whoosh
- rank：form 7824 / lemma 8601 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗖嗖作响」 / lemma「嗖（快速移动声）」
- ECDICT：form「v. （使）飞快移动( whoosh的现在分词 )」 / lemma「n. 飞快移动 v. (使)嗖嗖地飞快移动」
- **建议：`keep`**

## shatters → shatter
- rank：form 7831 / lemma 11836 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打碎；粉碎」 / lemma「打碎；粉碎」
- ECDICT：form「v. 砸碎( shatter的第三人称单数 ); 大大扰乱; 毁坏; 使极为惊愕难过」 / lemma「n. 碎片, 粉碎, 落叶, 喷洒 vt. 打碎, 使散开, 粉碎, 破坏 vi. 粉碎, 损坏, 脱落」
- **建议：`keep`**

## drifting → drift
- rank：form 7836 / lemma 8133 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「漂流；漂移」 / lemma「漂流；漂移；漂泊」
- ECDICT：form「[计] 漂移的 [医] 倾斜, 漂移」 / lemma「n. 漂流物, 漂流, 动向 v. (使)漂流」
- **建议：`keep`**

## tyres → tyre
- rank：form 7841 / lemma 10764 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「轮胎（复数）」 / lemma「轮胎」
- ECDICT：form「n. 轮胎( tyre的复数形式 )」 / lemma「n. 轮胎 vt. 装轮胎于」
- **建议：`keep`**

## measured → measure
- rank：form 7867 / lemma 8343 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「慎重的；有分寸的」 / lemma「测量；衡量」
- ECDICT：form「a. 整齐的, 慎重的, 基于标准的」 / lemma「n. 尺寸, 量度器, 量度标准, 测量, 量具, 程度, 范围, 限度, 分寸, 措施, 方法 vt. 测量, 测度,…」
- **建议：`keep`**

## toughest → tough
- rank：form 7876 / lemma 8361 ｜ type `t` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「最艰难的；最强硬的」 / lemma「强硬的；坚韧的；艰难的」
- ECDICT：form「a. 最坚强的；最坚韧的；最粗暴的；最苛刻的（tough的最高级）」 / lemma「n. 恶棍 a. 强硬的, 艰苦的, 坚固的, 坚韧的, 粗暴的, 咬不动的」
- **建议：`keep`**

## implying → imply
- rank：form 7878 / lemma 12044 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暗示；意味着」 / lemma「暗示；意味着」
- ECDICT：form「v. 暗示, 暗指( imply的现在分词 ); 必然包含; 说明, 表明」 / lemma「vt. 暗示, 意味 [计] 隐含」
- **建议：`keep`**

## kilometres → kilometre
- rank：form 7881 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「千米，公里」 / lemma「千米，公里」
- ECDICT：form「n. 千米, 公里( kilometre的复数形式 )」 / lemma「n. 公里, 千米」
- **建议：`keep`**

## classmates → classmate
- rank：form 7888 / lemma 9313 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「同班同学」 / lemma「同班同学」
- ECDICT：form「n. （同班）同学( classmate的名词复数 ); 砚兄砚弟」 / lemma「n. 同班同学」
- **建议：`keep`**

## reveals → reveal
- rank：form 7896 / lemma 12000 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「揭示；透露」 / lemma「揭示；透露」
- ECDICT：form「v. 显示( reveal的第三人称单数 ); 揭示; 泄露; [神学]启示」 / lemma「vt. 露出, 显示, 透露, 揭露, 泄露, (神)启示 n. 窗侧, 门侧」
- **建议：`keep`**

## shrieking → shriek
- rank：form 7903 / lemma 17886 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「尖叫；发出刺耳声」 / lemma「尖叫；尖声喊」
- ECDICT：form「v. 尖叫( shriek的现在分词 )」 / lemma「n. 尖锐的响声 vi. 尖叫, 发尖声 vt. 尖声发出」
- **建议：`keep`**

## squawking → squawk
- rank：form 7904 / lemma 16493 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（鸟）呱呱叫；大声抱怨」 / lemma「发出刺耳叫声」
- ECDICT：form「v. 发出粗厉的叫声, 咯咯地叫( squawk的现在分词 )」 / lemma「n. 响而粗的叫声, 夜鹭 vi. 发出响而粗的叫声, 发牢骚, 诉苦」
- **建议：`keep`**

## statues → statue
- rank：form 7907 / lemma 12250 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「雕像；塑像」 / lemma「雕像，塑像」
- ECDICT：form「n. 雕像, 塑像( statue的复数形式 )」 / lemma「vt. 以雕像装饰 n. 雕像」
- **建议：`keep`**

## practiced → practice
- rank：form 7908 / lemma 1034 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「熟练的；有经验的」 / lemma「练习；实践」
- ECDICT：form「a. 有经验的, 熟练的, 精通的」 / lemma「n. 实践, 练习, 实行, 惯例, 习惯, 开业 v. 实践, 实行, 练习, 实习, 业务」
- **建议：`?`**

## trespassing → trespass
- rank：form 7916 / lemma 18000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「非法侵入；擅自进入」 / lemma「非法侵入；擅自进入」
- ECDICT：form「n. [法]非法入侵」 / lemma「n. 擅自进入, 非法侵入, 侵害 vi. 侵害, 侵入, 打扰, 冒犯」
- **建议：`keep`**

## exits → exit
- rank：form 7924 / lemma 8121 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「出口；退场」 / lemma「退出；离开；出去」
- ECDICT：form「n. 出口( exit的名词复数 ); 通道; 退出; 退场 v. 离开, 退场( exit的第三人称单数 )」 / lemma「n. 出口, 退场, 离去, 去世 vi. 退出, 脱离, 去世 [计] 退出; DOS内部命令:本命令用于退出当前的命…」
- **建议：`keep`**

## snorts → snort
- rank：form 7934 / lemma 14734 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哼鼻；喷鼻息」 / lemma「哼鼻；喷鼻息」
- ECDICT：form「n. 喷鼻息, 鼻息声( snort的名词复数 ); （潜水艇的）通气管 v. 喷鼻息（以表示不耐烦, 轻蔑等）( sn…」 / lemma「vi. 喷着气弄响鼻子, 轻蔑地哼, 嘶嘶响着排气 vt. 哼着鼻子说, 喷出, 吸入(毒品) n. 喷鼻息, (潜艇的…」
- **建议：`keep`**

## antibiotics → antibiotic
- rank：form 7953 / lemma 9000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「抗生素」 / lemma「抗生素；抗菌的」
- ECDICT：form「n. 抗生学；抗生素」 / lemma「n. 抗生素 a. 抗生的」
- **建议：`keep`**

## revs → rev
- rank：form 7956 / lemma 14599 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「（发动机）转速」 / lemma「发动机转速；牧师」
- ECDICT：form「abbr. revolutions （复数）旋转, 回转, 转数 n. <口>发动机的旋转( rev的名词复数 ) v.…」 / lemma「n. 一次回转 v. 加快转速 [计] 反转, 周, 转数」
- **建议：`keep`**

## references → reference
- rank：form 7984 / lemma 12400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「参考；推荐人（复数）」 / lemma「提及；参考；推荐信」
- ECDICT：form「n. 参考文献；参照；推荐信（reference的复数）」 / lemma「n. 参考, 索引, 参照 vt. 给...加上参考资料 vt. 引用 vi. 引用 [计] 引用」
- **建议：`keep`**

## plumbing → plumb
- rank：form 7992 / lemma 18985 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「管道系统；水管工作」 / lemma「探测；测深」
- ECDICT：form「n. 测深, 管子工行业, 管道设备」 / lemma「n. 铅锤, 垂直 a. 垂直的 vt. 使垂直, 探测 vi. 成垂直」
- **建议：`keep`**

## fingernails → fingernail
- rank：form 8000 / lemma 17140 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「手指甲（复数）」 / lemma「手指甲」
- ECDICT：form「n. 指甲( fingernail的复数形式 )」 / lemma「n. 手指甲」
- **建议：`keep`**

## misleading → mislead
- rank：form 8000 / lemma 17577 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「误导的，骗人的」 / lemma「误导；使误解」
- ECDICT：form「a. 引入歧途的, 使人误解的, 骗人的 [法] 误写姓名的, 误称的, 令人误解的」 / lemma「vt. 误导」
- **建议：`keep`**

## torres → torre
- rank：form 8007 / lemma 35479 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent, suspect-target`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「托雷斯（姓氏）」 / lemma「托雷（姓氏/地名）」
- ECDICT：form「n. 托雷斯（西班牙球星）」 / lemma「n. (Torre)人名；(英、法)托尔；(德、西、意、葡、塞)托雷 托尔 托雷」
- **建议：`keep`**

## stranded → strand
- rank：form 8017 / lemma 11702 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滞留的；搁浅的」 / lemma「股；缕；海滨」
- ECDICT：form「a. 处于困境的, 进退两难的」 / lemma「n. (绳索的)股, 绳, 串, 海滨, 河岸 vi. 搁浅 vt. 使搁浅, 使落后, 使陷于困境, 弄断, 搓」
- **建议：`keep`**

## tenants → tenant
- rank：form 8028 / lemma 8141 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「房客（复数）」 / lemma「房客；租户」
- ECDICT：form「n. 房客( tenant的名词复数 ); 佃户; <律>占用者; 占有者」 / lemma「n. 承租人, 房客, 居住者 vt. 租借 [计] 占据者」
- **建议：`keep`**

## revealing → reveal
- rank：form 8029 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「揭示性的；暴露的」 / lemma「揭示；透露」
- ECDICT：form「a. 暴露的, 显露的, 揭露的」 / lemma「vt. 露出, 显示, 透露, 揭露, 泄露, (神)启示 n. 窗侧, 门侧」
- **建议：`keep`**

## paramedics → paramedic
- rank：form 8033 / lemma 14900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「急救人员（复数）」 / lemma「急救员；辅助医务人员」
- ECDICT：form「n. <美>护理人员, 医务辅助人员( paramedic的名词复数 )」 / lemma「n. 伞兵军医, 伞降急救人员」
- **建议：`keep`**

## bled → bleed
- rank：form 8040 / lemma 8406 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流血（过去式）」 / lemma「流血；出血」
- ECDICT：form「bleed的过去式和过去分词 [机] 削弱的, 减轻的, 减薄的」 / lemma「vi. 流血, 悲痛, 渗出 vt. 使出血, 榨取」
- **建议：`keep`**

## studios → studio
- rank：form 8047 / lemma 12900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「工作室；制片厂（复数）」 / lemma「工作室；演播室；画室」
- ECDICT：form「n. 工作室（studio的复数）」 / lemma「n. 工作室, 画室, 演播室, 电影制片厂」
- **建议：`keep`**

## clearer → clear
- rank：form 8060 / lemma 8070 ｜ type `r` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「更清楚的；更明亮的」 / lemma「晴朗的；清晰的；透明的」
- ECDICT：form「[医] 澄清剂, 透明剂; 洗剂(牙) [经] (票据)交换员」 / lemma「a. 清楚的, 明确的, 澄清的 adv. 清晰地 vt. 澄清, 清除障碍 vi. 放晴, 变清澈 n. 空隙 [计]…」
- **建议：`keep`**

## allegations → allegation
- rank：form 8069 / lemma 17186 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「指控；断言（复数）」 / lemma「指控；断言」
- ECDICT：form「n. 陈述( allegation的复数形式 ); 宣称; 陈词; 指控」 / lemma「n. 断言, 主张, 申辩 [法] 声明, 事实陈述, 断言」
- **建议：`keep`**

## apologized → apologize
- rank：form 8085 / lemma 13000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「道歉（过去式）」 / lemma「道歉，谢罪」
- ECDICT：form「v. 道歉（apologize的过去分词）」 / lemma「vi. 道歉, 辩解」
- **建议：`keep`**

## neglected → neglect
- rank：form 8121 / lemma 9864 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被忽视的；疏于照顾的」 / lemma「忽视；疏忽」
- ECDICT：form「a. 被忽视的, 未被好好照管的 [法] 未被好好照管的, 被忽视的」 / lemma「n. 疏忽, 忽略, 漏做 vt. 疏忽, 忽视, 不顾」
- **建议：`keep`**

## babbling → babble
- rank：form 8138 / lemma 19285 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咿呀学语；胡言乱语」 / lemma「含糊不清地说；咿呀学语」
- ECDICT：form「n. 胡说；婴儿发出的咿哑声」 / lemma「vi. 牙牙学语, 喋喋不休 vt. 唠叨, 吐露 n. 儿语, 胡言乱语, 嘈杂声 [计] 串音」
- **建议：`keep`**

## ratings → rating
- rank：form 8150 / lemma 10469 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「评级；收视率」 / lemma「评级；评分」
- ECDICT：form「n. 评级；等级（rating的复数形式）」 / lemma「n. 等级, 额定功率, 责骂 [经] 等级评定」
- **建议：`keep`**

## notified → notify
- rank：form 8176 / lemma 12400 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「通知；告知」 / lemma「通知，告知」
- ECDICT：form「v. 通知, 告知, 报告( notify的过去式和过去分词 )」 / lemma「vt. 通知, 通告, 报告 [计] 通知」
- **建议：`keep`**

## squeaks → squeak
- rank：form 8179 / lemma 10595 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吱吱叫；发出尖声」 / lemma「吱吱叫；发出尖声」
- ECDICT：form「n. 短促的尖叫声, 吱吱声( squeak的名词复数 ) v. 短促地尖叫( squeak的第三人称单数 ); 吱吱叫…」 / lemma「n. 吱吱声, 侥幸 vi. 吱吱叫, 告密, 侥幸成功 vt. 以短促尖声发出」
- **建议：`keep`**

## grieving → grieve
- rank：form 8203 / lemma 9456 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「悲伤；哀悼」 / lemma「悲伤；哀悼」
- ECDICT：form「v. 感到悲痛, 伤心( grieve的现在分词 ); 使…伤心」 / lemma「vt. 使悲伤 vi. 悲痛, 伤心」
- **建议：`keep`**

## critics → critic
- rank：form 8216 / lemma 8558 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「批评家；评论家」 / lemma「批评家；评论家」
- ECDICT：form「n. 评论家；批评者；吹毛求疵的人（critic的复数）」 / lemma「n. 批评家, 鉴定家」
- **建议：`keep`**

## stunned → stun
- rank：form 8218 / lemma 11967 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「震惊的；目瞪口呆的」 / lemma「使震惊；使昏迷」
- ECDICT：form「a. 受惊的」 / lemma「vt. 使昏迷, 使震惊, 打昏 n. 昏迷, 猛击」
- **建议：`keep`**

## athletes → athlete
- rank：form 8229 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「运动员」 / lemma「运动员」
- ECDICT：form「n. 运动员( athlete的复数形式 ); 体育家; 擅长运动的人; 健儿」 / lemma「n. 运动员, 运动选手 [医] 运动员」
- **建议：`keep`**

## inclined → incline
- rank：form 8234 / lemma 12500 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「倾向于；倾斜的」 / lemma「倾向；倾斜」
- ECDICT：form「a. 倾向于...的, 想要...的, 可能的, 趋向于...的」 / lemma「n. 倾斜, 斜坡, 斜面 vt. 使倾向于, 使倾斜 vi. 倾向, 倾斜, 爱好, 易于」
- **建议：`keep`**

## aspects → aspect
- rank：form 8252 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「方面；外观」 / lemma「方面，层面」
- ECDICT：form「n. 方面( aspect的复数形式 ); 面貌; 方位; 样子」 / lemma「n. 外观, 方面, 面貌, 方向 [医] 方面, 局面; 外观」
- **建议：`keep`**

## rumbles → rumble
- rank：form 8253 / lemma 11179 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出隆隆声；打斗」 / lemma「发出隆隆声」
- ECDICT：form「n. 隆隆声, 辘辘声( rumble的名词复数 ) v. 发出隆隆声, 发出辘辘声( rumble的第三人称单数 );…」 / lemma「n. 隆隆声, 辘辘声 vi. 发隆隆声, 辘辘响 vt. 使隆隆响, 低沉地说」
- **建议：`keep`**

## possessions → possession
- rank：form 8267 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「财产；所有物」 / lemma「拥有；占有；财产」
- ECDICT：form「n. 所有物（possession的复数形式）；财产」 / lemma「n. 拥有, 占有, 所有, 财产, 领土, 领地, 自制, 着迷 [经] 占有, 持有」
- **建议：`keep`**

## commercials → commercial
- rank：form 8276 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「商业广告」 / lemma「商业的；营利的」
- ECDICT：form「n. （电台或电视播放的）广告 ( commercial的名词复数 ); 以大众欣赏为目的谱写的乐曲」 / lemma「a. 商业的, 商用的, 商品化的 n. 商业广告节目」
- **建议：`keep`**

## mutters → mutter
- rank：form 8295 / lemma 26583 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「低声抱怨；咕哝」 / lemma「咕哝；低声抱怨」
- ECDICT：form「v. 轻声低语, 咕哝地抱怨( mutter的第三人称单数 )」 / lemma「n. 喃喃低语 vi. 喃喃自语, 作低沉声 vt. 出怨言, 抱怨地说」
- **建议：`keep`**

## donated → donate
- rank：form 8300 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「捐赠（过去式）」 / lemma「捐赠，捐献」
- ECDICT：form「v. （尤指向慈善机构）捐赠( donate的过去式和过去分词 ); 献（血）; 捐（血）; 捐献（器官）」 / lemma「v. 捐赠」
- **建议：`keep`**

## privileges → privilege
- rank：form 8332 / lemma 12400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「特权（复数）」 / lemma「特权；优待」
- ECDICT：form「n. 特权( privilege的名词复数 ); （因财富和社会地位而仅有部分人享有的）权益; 免责特权; 特殊荣幸」 / lemma「n. 特权, 特别恩典, 基本权利, 特免 vt. 给与...特权, 特免」
- **建议：`keep`**

## saw → see
- rank：form 8337 / lemma 1720 ｜ type `p` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锯子」 / lemma「看见；理解」
- ECDICT：form「n. 锯子, 谚语 vt. 锯, 锯开, 来回移动 vi. 拉锯, 移动 see的过去式」 / lemma「vt. 看见, 查看, 参观, 游览, 理解, 知道, 同意 vi. 看, 观看, 注意, 知道, 考虑 n. 主教的职…」
- **建议：`?`**

## uncovered → uncover
- rank：form 8344 / lemma 9683 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「揭开（过去式）」 / lemma「揭开；发现」
- ECDICT：form「a. 无遮盖的, 未戴帽子的, 未保险的 [经] 无担保的, 未补进的(空头), 未保险的」 / lemma「vt. 揭露, 揭开, 暴露, 脱帽致敬 vi. 脱帽致敬, 揭去盖子」
- **建议：`keep`**

## sled → sle
- rank：form 8352 / lemma 45315 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雪橇；长橇；乘雪橇」 / lemma「系统性红斑狼疮（缩写）」
- ECDICT：form「n. 雪撬 vt. 用雪撬搬运 vi. 乘雪撬 [计] 单一大型贵重磁盘」 / lemma「abbr. systemic lupus erythematosus 系统性红斑狼疮, 全身性红疹狼斑」
- **建议：`keep`**

## shattering → shatter
- rank：form 8363 / lemma 11836 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人震惊的；粉碎的」 / lemma「打碎；粉碎」
- ECDICT：form「a. 令人震惊的；令人极度疲劳的；破碎的」 / lemma「n. 碎片, 粉碎, 落叶, 喷洒 vt. 打碎, 使散开, 粉碎, 破坏 vi. 粉碎, 损坏, 脱落」
- **建议：`keep`**

## exhausting → exhaust
- rank：form 8377 / lemma 10115 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人疲惫的」 / lemma「使精疲力尽；耗尽」
- ECDICT：form「a. 使耗尽的, 使人筋疲力尽的 [计] 经验, 技巧, 穷举, 耗尽, 排气」 / lemma「n. 排气, 排气装置, 废气 vt. 抽完, 用尽, 耗尽, 使精疲力尽 vi. 排气」
- **建议：`keep`**

## goons → goon
- rank：form 8412 / lemma 10235 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「暴徒；打手」 / lemma「暴徒；打手」
- ECDICT：form「n. 受雇暴徒, 呆子, 愚笨者( goon的复数形式 )」 / lemma「n. 受雇暴徒, 愚笨者, 呆子」
- **建议：`keep`**

## turks → turk
- rank：form 8422 / lemma 6752 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「土耳其人」 / lemma「土耳其人」
- ECDICT：form「n. 土耳其人；突厥人（Turk的复数形式）」 / lemma「n. 土耳其人, 土耳其马」
- **建议：`keep`**

## immigrants → immigrant
- rank：form 8437 / lemma 10673 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「移民；移居者」 / lemma「移民；移居者」
- ECDICT：form「n. 移民（immigrant的复数）」 / lemma「n. 移民 a. 移入的, 移民的」
- **建议：`keep`**

## scrambled → scramble
- rank：form 8447 / lemma 10979 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「炒的；混乱的」 / lemma「争抢；攀爬」
- ECDICT：form「n. 密码形式；扰频」 / lemma「n. 攀缘, 爬行, 抢夺, 混乱, 紧急起飞 vi. 攀缘, 杂乱蔓延, 争夺, 拼凑, 匆忙 vt. 攀登, 扰乱,…」
- **建议：`keep`**

## voters → voter
- rank：form 8459 / lemma 19002 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「选民（复数）」 / lemma「投票人；选民」
- ECDICT：form「n. 投票者列表；选民, 投票人（voter的复数）」 / lemma「n. 选民, 投票人 [法] 选民, 选举人, 投票人」
- **建议：`keep`**

## expired → expire
- rank：form 8476 / lemma 19034 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「过期的；到期的」 / lemma「到期；期满；去世」
- ECDICT：form「a. 失效的；过期的」 / lemma「vi. 期满, 呼气, 断气 vt. 呼出」
- **建议：`keep`**

## morals → moral
- rank：form 8488 / lemma 13500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「道德；品行」 / lemma「道德的；有道德的」
- ECDICT：form「n. 道德, 士气, 品德, 品行, 伦理」 / lemma「n. 道德, 品行, 寓意 a. 道德的, 品性端正的, 精神上的」
- **建议：`keep`**

## conceived → conceive
- rank：form 8497 / lemma 11729 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「构想；怀孕（过去式）」 / lemma「构想；怀孕；设想」
- ECDICT：form「v. 想出( conceive的过去式和过去分词 ); 构想; 设想; 怀孕」 / lemma「vt. 构思, 认为 vi. 怀孕」
- **建议：`keep`**

## intriguing → intrigue
- rank：form 8522 / lemma 14227 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「引人入胜的；有趣的」 / lemma「激起兴趣；密谋」
- ECDICT：form「a. 吸引人的, 有趣的」 / lemma「n. 阴谋, 复杂的事 vi. 密谋, 私通 vt. 激起...的兴趣, 用诡计取得」
- **建议：`keep`**

## gents → gent
- rank：form 8529 / lemma 16645 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「男士；男厕所」 / lemma「绅士；男士」
- ECDICT：form「n. 公共男厕」 / lemma「n. 绅士」
- **建议：`keep`**

## emerged → emerge
- rank：form 8539 / lemma 13000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「出现；浮现（过去式）」 / lemma「浮现，显露」
- ECDICT：form「vt. 出现（emerge的过去分词）；浮现, 暴露」 / lemma「vi. 浮现, 形成, 出现, (事实)显露」
- **建议：`keep`**

## restraining → restrain
- rank：form 8541 / lemma 11383 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「抑制；约束（进行时）」 / lemma「抑制；约束」
- ECDICT：form「a. 抑制的；遏制的；控制的」 / lemma「vt. 抑制, 阻止, 束缚 [法] 抑制, 遏制, 制止」
- **建议：`keep`**

## calculated → calculate
- rank：form 8544 / lemma 8721 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「精心策划的；计算的」 / lemma「计算；估计」
- ECDICT：form「a. 有计划的, 适当的, 适合的, 计算出的 [机] 算清了的」 / lemma「v. 计算, 预测, 计划, 打算」
- **建议：`keep`**

## pesos → peso
- rank：form 8550 / lemma 31182 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「比索（货币，复数）」 / lemma「比索（货币）」
- ECDICT：form「n. 比索（一种外国货币单位）( peso的复数形式 )」 / lemma「n. 比索 [经] 比索」
- **建议：`keep`**

## manipulated → manipulate
- rank：form 8554 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「操纵；摆布（过去式）」 / lemma「操纵，操作；篡改」
- ECDICT：form「v. 熟练控制[操作]( manipulate的过去式和过去分词 ); （暗中）控制, 操纵, 影响; 正骨; 治疗脱臼」 / lemma「vt. 操纵, 利用, 操作, 巧妙地处理, 假造」
- **建议：`keep`**

## bivouacked → bivouac
- rank：form 8589 / lemma 6741 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「露宿；露营」 / lemma「露营」
- ECDICT：form「bivouac的过去式和过去分词」 / lemma「n. 野营, 露营, 露营地 vi. 露宿」
- **建议：`?`**

## contestants → contestant
- rank：form 8590 / lemma 9357 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「参赛者（复数）」 / lemma「参赛者；竞争者」
- ECDICT：form「n. 竞争者, 参赛者( contestant的复数形式 )」 / lemma「n. 竞争者 [法] 争辩者, 竞争者」
- **建议：`keep`**

## banished → banish
- rank：form 8650 / lemma 13266 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「放逐；驱逐（过去式）」 / lemma「放逐；驱逐」
- ECDICT：form「v. 驱逐, 流放（banish的过去分词形式）」 / lemma「vt. 驱逐, 消除 [法] 驱逐, 流放」
- **建议：`keep`**

## competitors → competitor
- rank：form 8668 / lemma 10219 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「竞争者；对手（复数）」 / lemma「竞争者；对手」
- ECDICT：form「n. 竞争者( competitor的复数形式 ); 对手; 参赛者; 竞赛者」 / lemma「n. 竞争者 [经] 竞争者, 竞争对手」
- **建议：`keep`**

## overreacting → overreact
- rank：form 8670 / lemma 18094 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「反应过度（现在分词）」 / lemma「反应过度」
- ECDICT：form「v. 反应过火( overreact的现在分词 )」 / lemma「vi. 反应过度, 反作用过强」
- **建议：`keep`**

## scans → scan
- rank：form 8689 / lemma 12900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「扫描；浏览（第三人称单数）」 / lemma「扫描；浏览」
- ECDICT：form「abbr. 网络系统自动程序控制（scheduling control automation by network sy…」 / lemma「n. 审视, 浏览, 扫描, 细查 vt. 细看, 浏览, 扫描, 详细调查, 标出格律 vi. 押韵, 扫描 [计] …」
- **建议：`keep`**

## steroids → steroid
- rank：form 8703 / lemma 24546 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「类固醇；激素」 / lemma「类固醇；甾体」
- ECDICT：form「n. 类固醇( steroid的名词复数 )」 / lemma「n. 类固醇 [化] 甾族化合物」
- **建议：`keep`**

## archives → archive
- rank：form 8707 / lemma 10887 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「档案；档案馆」 / lemma「档案；档案馆」
- ECDICT：form「n. 档案, 档案室 [法] 公文档案, 案卷, 档案保管处」 / lemma「vt. 把...存档 n. 档案馆, 档案文件 [计] 挡案库, 存档」
- **建议：`keep`**

## directing → direct
- rank：form 8743 / lemma 12300 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「导演；指挥」 / lemma「指导，导演；指路」
- ECDICT：form「[经] 指示」 / lemma「a. 直接的, 坦白的 vt. 指示, 指挥, 命令, 导演 vi. 指导, 指挥 adv. 直接地」
- **建议：`keep`**

## knuckles → knuckle
- rank：form 8762 / lemma 15403 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指关节；指节」 / lemma「指关节」
- ECDICT：form「n. （指人）指关节( knuckle的名词复数 ); （指动物）膝关节, 踝 v. （指人）指关节( knuckle的…」 / lemma「n. 指节, 蹄爪, 膝关节 v. 以指节打, 以手指射」
- **建议：`keep`**

## disconnected → disconnect
- rank：form 8764 / lemma 11159 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「断开的；不连贯的」 / lemma「断开；切断联系」
- ECDICT：form「a. 分离的, 不连贯的」 / lemma「vt. 使分离, 使不相连, 拆开 vi. 断开 [计] 断开」
- **建议：`keep`**

## programming → program
- rank：form 8778 / lemma 1165 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编程；节目编排」 / lemma「节目；程序；计划」
- ECDICT：form「n. 节目的计划, 编制程序 [计] 程序设计; 程序编制」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序 [计] …」
- **建议：`?`**

## programming → programme
- rank：form 8778 / lemma 4341 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编程；节目编排」 / lemma「节目；计划（英式）」
- ECDICT：form「n. 节目的计划, 编制程序 [计] 程序设计; 程序编制」 / lemma「n. 节目, 节目单, 程序, 纲要, 大纲, 计划 vt. 规划, 拟...计划 vi. 安排节目, 编程序」
- **建议：`?`**

## contaminated → contaminate
- rank：form 8790 / lemma 21537 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受污染的」 / lemma「污染；弄脏」
- ECDICT：form「a. 受污染的；弄脏的」 / lemma「vt. 弄污, 弄脏, 污染, 毒害 [化] 污染」
- **建议：`keep`**

## grinding → grind
- rank：form 8795 / lemma 7617 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨的；刺耳的」 / lemma「磨碎」
- ECDICT：form「a. 刺耳的, 沉重的, 剧烈的 [化] 研磨; 磨碎」 / lemma「n. 磨, 碾, 苦差, 摩擦声, 用功的学生 vt. 磨擦, 磨碎, 磨光, 折磨, 压榨 vi. 磨, 磨碎, 苦干」
- **建议：`?`**

## grinding → ground
- rank：form 8795 / lemma 5664 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨的；刺耳的」 / lemma「地面；土地」
- ECDICT：form「a. 刺耳的, 沉重的, 剧烈的 [化] 研磨; 磨碎」 / lemma「n. 土地, 战场, 场地, 地面, 范围 a. 土地的, 地面上的 vt. 放在地上, 使搁浅, 打基础, 给...以…」
- **建议：`?`**

## adjourned → adjourn
- rank：form 8797 / lemma 18926 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「休会；延期」 / lemma「休会；延期」
- ECDICT：form「休会」 / lemma「vi. 休会, 换地方 vt. 使中止, 推迟」
- **建议：`keep`**

## concluded → conclude
- rank：form 8801 / lemma 9190 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「结束；得出结论」 / lemma「得出结论；结束」
- ECDICT：form「v. 结束( conclude的过去式和过去分词 ); 得出结论; 断定; 推断出」 / lemma「vt. 结束, 作结论, 推断 vi. 结束, 推断」
- **建议：`keep`**

## chiming → chime
- rank：form 8810 / lemma 11804 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸣响；敲钟」 / lemma「鸣响；钟声；协调」
- ECDICT：form「v. 敲出和谐的乐声( chime的现在分词 ); 报（时）; 插嘴; （以…）打断谈话」 / lemma「n. 钟声, 钟, 和谐 vi. 鸣, 奏出谐和的乐声, 和谐 vt. 敲出和谐的声音, 打钟报时, 重复说」
- **建议：`keep`**

## startled → startle
- rank：form 8816 / lemma 14898 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「受惊的；吃惊的」 / lemma「使惊吓；使吃惊」
- ECDICT：form「v. 震惊（startle的过去分词）」 / lemma「n. 惊愕, 惊恐 vt. 吃惊, 使惊愕 vi. 惊起」
- **建议：`keep`**

## detained → detain
- rank：form 8826 / lemma 13900 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拘留；耽搁」 / lemma「拘留；耽误」
- ECDICT：form「v. 留住( detain的过去式和过去分词 ); 耽搁; 拘留; 扣留」 / lemma「vt. 扣留, 扣押, 耽搁 [法] 拘留, 扣押, 留住」
- **建议：`keep`**

## youngsters → youngster
- rank：form 8830 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「年轻人；孩子」 / lemma「年轻人，少年」
- ECDICT：form「n. 孩子( youngster的复数形式 ); 少年; 青年; 年轻人」 / lemma「n. 小孩, 年轻人, 少年 [法] 儿童, 少年, 青年」
- **建议：`keep`**

## inhabitants → inhabitant
- rank：form 8835 / lemma 12700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「居民；栖居动物」 / lemma「居民，居住者」
- ECDICT：form「n. 居民, 住户, （栖息在某地区的）动物( inhabitant的复数形式 )」 / lemma「n. 居民, 居住者 [医] 居民」
- **建议：`keep`**

## harassing → harass
- rank：form 8838 / lemma 11801 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「骚扰；纠缠」 / lemma「骚扰；不断侵扰」
- ECDICT：form「v. 侵扰, 骚扰( harass的现在分词 ); 不断攻击（敌人）」 / lemma「vt. 使困扰, 使烦恼, 折磨」
- **建议：`keep`**

## mumbles → mumble
- rank：form 8874 / lemma 20430 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「芒布尔斯（地名）」 / lemma「含糊地说；咕哝」
- ECDICT：form「n. 含糊的话或声音, 咕哝( mumble的名词复数 ) v. 含糊地说某事, 叽咕, 咕哝( mumble的第三人称…」 / lemma「n. 喃喃而语, 咕哝 v. 喃喃而语, 咕哝」
- **建议：`keep`**

## doughnuts → doughnut
- rank：form 8879 / lemma 9426 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「甜甜圈（复数）」 / lemma「甜甜圈；炸面圈」
- ECDICT：form「n. 炸面圈( doughnut的复数形式 )」 / lemma「n. 油炸圈饼, 环状物 [计] 圆环图」
- **建议：`keep`**

## proceedings → proceeding
- rank：form 8886 / lemma 10518 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「诉讼；会议记录」 / lemma「诉讼；程序；进行」
- ECDICT：form「n. 诉讼, 事项, 行径, 事件, 活动, 项目, 会议录, 记录汇编, 活动记录」 / lemma「n. 进行, 程序, 行动, 诉讼程序, 事项 [化] 会议论文集」
- **建议：`keep`**

## amends → amend
- rank：form 8887 / lemma 21509 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「赔偿；补偿」 / lemma「修改；修正」
- ECDICT：form「n. 赔偿 [经] 赔偿」 / lemma「vt. 修改, 改善, 改良 vi. 改过自新」
- **建议：`keep`**

## armored → armor
- rank：form 8891 / lemma 4556 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「装甲的；武装的」 / lemma「盔甲；装甲」
- ECDICT：form「a. 装甲的」 / lemma「n. 盔甲, 潜水服, 装甲 vt. 为...装甲」
- **建议：`?`**

## colonies → colony
- rank：form 8892 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「殖民地（复数）」 / lemma「殖民地；（生物）群落」
- ECDICT：form「n. 殖民地( colony的名词复数 ); （侨民等）聚居区; （动植物的）群体; （来自同一地方, 职业或兴趣相同的…」 / lemma「n. 殖民地, 移民队 [医] 菌(集)落, 菌丛; 移民区」
- **建议：`keep`**

## confiscated → confiscate
- rank：form 8905 / lemma 14200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「没收；充公」 / lemma「没收，充公」
- ECDICT：form「v. 没收, 充公( confiscate的过去式和过去分词 )」 / lemma「vt. 没收, 把...充公, 查抄 a. 被没收的」
- **建议：`keep`**

## nagging → nag
- rank：form 8913 / lemma 9383 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「唠叨的；纠缠不休的」 / lemma「唠叨；不断抱怨」
- ECDICT：form「a. 唠叨的, 责备挑剔的」 / lemma「n. 老马, 驽马, 劣等竞赛马, 唠叨 v. 不断地唠叨, 恼人」
- **建议：`keep`**

## compelled → compel
- rank：form 8925 / lemma 15033 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「强迫；迫使」 / lemma「强迫；迫使」
- ECDICT：form「v. 强迫；迫使（compel的过去式及过去分词形式）」 / lemma「vt. 强迫, 迫使」
- **建议：`keep`**

## babysitting → babysit
- rank：form 8930 / lemma 9625 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「照看婴儿；临时保姆工作」 / lemma「照看婴儿；当保姆」
- ECDICT：form「n. 当临时保姆」 / lemma「vi. (代人临时)照看婴孩」
- **建议：`keep`**

## designated → designate
- rank：form 8949 / lemma 13400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「指定的；选定的」 / lemma「指定；命名；表明」
- ECDICT：form「a. 特指的；指定的」 / lemma「vt. 指定, 指明, 称呼 a. 已选出而未上任的」
- **建议：`keep`**

## corporations → corporation
- rank：form 8961 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「公司；法人（复数）」 / lemma「公司；社团；法人实体」
- ECDICT：form「n. 公司, 企业（corporation的复数形式）」 / lemma「n. 公司, 合作, 法人团体 [法] 法人团体, 社团, 法人」
- **建议：`keep`**

## irritating → irritate
- rank：form 8963 / lemma 16285 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恼人的；刺激的」 / lemma「激怒；刺激」
- ECDICT：form「a. 刺激的, 使愤怒的, 气人的」 / lemma「vt. 激怒, 使发怒, 使兴奋, 使发炎 vi. 引起不快」
- **建议：`keep`**

## snooping → snoop
- rank：form 8974 / lemma 9725 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「窥探；打探」 / lemma「窥探；打探」
- ECDICT：form「v. 探听, 窥探, 管闲事( snoop的现在分词 )」 / lemma「vi. 调查, 窥探 n. 窥视行为, 爱管闲事的人, 私家侦探」
- **建议：`keep`**

## prohibited → prohibit
- rank：form 8988 / lemma 25418 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被禁止的」 / lemma「禁止；阻止」
- ECDICT：form「v. 禁止, 被禁止的（prohibite的过去分词形式）」 / lemma「vt. 禁止, 阻止 [经] 禁止」
- **建议：`keep`**

## surgeons → surgeon
- rank：form 9000 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「外科医生（复数）」 / lemma「外科医生」
- ECDICT：form「n. 外科医生; 外科医生( surgeon的复数形式 )」 / lemma「n. 外科医生, 军医, 船医 [医] 外科医师」
- **建议：`keep`**

## amos → amo
- rank：form 9010 / lemma 28311 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「阿莫斯（人名）」 / lemma「（西语）我爱」
- ECDICT：form「n. 阿摩司(<<圣经>>人物)」 / lemma「abbr. 美国眼力健公司（Advanced Medical Optics）；编程对象模型（Analysis Manag…」
- **建议：`keep`**

## polls → poll
- rank：form 9012 / lemma 10716 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「民意调查；投票站」 / lemma「民意调查；投票」
- ECDICT：form「n. 投票；民意调查；投票模块（poll的复数形式）」 / lemma「n. 投票, 民意测验, 选举投票, 投票数, 一组人中的一个, 头颈和后脑部, 鹦鹉 vt. 对...进行民意测验, …」
- **建议：`keep`**

## thrilling → thrill
- rank：form 9028 / lemma 5332 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人兴奋的；惊险的」 / lemma「兴奋；激动」
- ECDICT：form「a. 毛骨悚然的, 令人兴奋的, 令人发抖的」 / lemma「n. 震颤, 激动, 刺激性, 一阵激动 vi. 震颤, 颤抖, 激动 vt. 使激动, 使颤动」
- **建议：`?`**

## stokes → stoke
- rank：form 9029 / lemma 20278 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「煽动；添燃料」 / lemma「拨旺（火）；煽动」
- ECDICT：form「n. 斯托克斯（姓氏）」 / lemma「v. 司炉, (使)大吃」
- **建议：`keep`**

## sneakers → sneaker
- rank：form 9030 / lemma 26338 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「运动鞋；胶底鞋」 / lemma「运动鞋；胶底鞋」
- ECDICT：form「n. 胶底运动鞋（sneaker的复数形式）」 / lemma「n. 鬼鬼祟祟做事的人, 卑鄙者, 帆布胶底运动鞋」
- **建议：`keep`**

## conditioning → condition
- rank：form 9031 / lemma 1133 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「训练；条件反射；护发素」 / lemma「条件；状况；疾病」
- ECDICT：form「n. 调节, 条件作用, 整修 [计] 调节; 调整」 / lemma「n. 情况, 条件 vt. 使健康, 以...为条件, 决定, 使适应 [计] 条件」
- **建议：`?`**

## supporters → supporter
- rank：form 9032 / lemma 13500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「支持者；拥护者」 / lemma「支持者，拥护者；支撑物」
- ECDICT：form「n. 支持者, 支持单位；支持单元」 / lemma「n. 支持者, 后盾, 迫随者, 护身织物 [法] 支持者, 赡养者, 抚养者」
- **建议：`keep`**

## davies → davy
- rank：form 9049 / lemma 10033 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「戴维斯（姓氏）」 / lemma「戴维（男子名）」
- ECDICT：form「n. 戴维斯（男子名）」 / lemma「n. 宣誓书」
- **建议：`keep`**

## yelps → yelp
- rank：form 9052 / lemma 18568 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（狗）吠叫；尖叫」 / lemma「尖叫；吠叫」
- ECDICT：form「n. （因痛苦、气愤、兴奋等的）短而尖的叫声( yelp的名词复数 ) v. 发出短而尖的叫声( yelp的第三人称单数…」 / lemma「n. 尖声急叫, 狺吠, 叫喊声 vi. 尖声急叫, 叫吠, 叫喊 vt. 叫喊着说」
- **建议：`keep`**

## peters → peter
- rank：form 9081 / lemma 626 ｜ type `3` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「逐渐减弱；消失」 / lemma「彼得（人名）」
- ECDICT：form「n. 彼得斯（姓氏, 男子名）」 / lemma「vi. 逐渐消失, 逐渐减少」
- **建议：`keep`**

## deported → deport
- rank：form 9082 / lemma 11000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「驱逐出境；遣返」 / lemma「驱逐出境；遣送」
- ECDICT：form「v. 将…驱逐出境( deport的过去式和过去分词 ); 举止」 / lemma「vt. 举止, 驱逐出境 [法] 放逐, 驱逐, 递解」
- **建议：`keep`**

## remarks → remark
- rank：form 9085 / lemma 9336 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「评论；言辞」 / lemma「评论；言辞」
- ECDICT：form「n. 摘要；附注；评论（remark的复数）」 / lemma「n. 评论, 注意 vt. 评论, 注意 vi. 评论, 谈论 [计] 注释」
- **建议：`keep`**

## convictions → conviction
- rank：form 9106 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「定罪；坚定信念」 / lemma「定罪；坚定信念」
- ECDICT：form「n. 确信( conviction的复数形式 ); 判罪; 定罪; 证明有罪」 / lemma「n. 定罪, 信服, 坚信 [法] 定罪, 证明有罪, 判罪」
- **建议：`keep`**

## suburbs → suburb
- rank：form 9110 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「郊区；近郊」 / lemma「郊区；近郊」
- ECDICT：form「n. 郊外（suburb的复数）」 / lemma「n. 市郊住宅区, 郊区, 边缘」
- **建议：`keep`**

## refined → refine
- rank：form 9124 / lemma 27599 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「精炼的；优雅的」 / lemma「提炼；改进」
- ECDICT：form「a. 精炼的, 优雅的, 精细的 [医] 精制过的, 精练过的」 / lemma「vt. 精炼, 净化, 使优雅, 使精炼 vi. 被精炼, 被净化」
- **建议：`keep`**

## lays → lay
- rank：form 9125 / lemma 949 ｜ type `3` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放置；产卵」 / lemma「放置；躺（过去式）」
- ECDICT：form「v. 打赌( lay的第三人称单数 ); 提出; 放置; 铺」 / lemma「vt. 放置, 产, 铺设, 布置, 提出, 平息 vi. 下蛋, 打赌 n. 位置, 层, 隐藏处 a. 世俗的, 外…」
- **建议：`?`**

## fractured → fracture
- rank：form 9134 / lemma 13800 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「断裂的；骨折的」 / lemma「骨折；裂缝」
- ECDICT：form「a. 断裂的；挫伤的；折裂的」 / lemma「n. 破碎, 骨折 v. (使)破碎, (使)破裂」
- **建议：`keep`**

## explodes → explode
- rank：form 9159 / lemma 13000 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「爆炸；爆发」 / lemma「爆炸；激增；破除（迷信等）」
- ECDICT：form「v. （使）爆炸( explode的第三人称单数 ); 突然（发出巨响, 活跃起来, 迸发感情）; 推翻; 驳倒」 / lemma「vi. 爆炸, 爆发, 激增 vt. 使爆炸」
- **建议：`keep`**

## gypsies → gypsy
- rank：form 9172 / lemma 5268 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「吉普赛人（复数）」 / lemma「吉普赛人；流浪者」
- ECDICT：form「n. 吉普赛人( gypsy的名词复数 ); 吉普赛人的生活方式[状况]」 / lemma「n. 吉卜赛人, 吉卜赛语 a. 象吉卜赛人的 vi. 流浪」
- **建议：`keep`**

## titles → title
- rank：form 9174 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「标题；头衔（复数）」 / lemma「标题；头衔」
- ECDICT：form「n. 标题；字幕；主题（title复数形式）」 / lemma「n. 头衔, 名称, 标题, 书名, 扉页, 权利, 资格, 冠军, 字幕 vt. 授予头衔, 加标题于 [计] 标题」
- **建议：`keep`**

## merchants → merchant
- rank：form 9196 / lemma 12400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「商人（复数）」 / lemma「商人；批发商」
- ECDICT：form「n. 商人( merchant的复数形式 ); （某活动的）爱好者, 热中于…的人」 / lemma「n. 商人, 店主 a. 商业的, 商人的」
- **建议：`keep`**

## hallucinations → hallucination
- rank：form 9240 / lemma 12622 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「幻觉（复数）」 / lemma「幻觉；错觉」
- ECDICT：form「n. 幻觉（因患病或吸毒而产生）( hallucination的复数形式 )」 / lemma「n. 幻觉, 幻想 [医] 幻觉」
- **建议：`keep`**

## entrusted → entrust
- rank：form 9247 / lemma 12276 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「委托；托付（过去式）」 / lemma「委托；托付」
- ECDICT：form「v. 委托, 托付( entrust的过去式和过去分词 )」 / lemma「vt. 信托, 交托, 委托 [经] 委托」
- **建议：`keep`**

## niggas → nigga
- rank：form 9283 / lemma 3840 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（俚语，冒犯）黑人」 / lemma「（俚语）黑人」
- ECDICT：form「（美国俚语）黑人」 / lemma「（美国俚语）黑人」
- **建议：`keep`**

## intimidated → intimidate
- rank：form 9292 / lemma 13500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「被吓住的；胆怯的」 / lemma「恐吓，威胁」
- ECDICT：form「v. 恐吓; 威胁 a. 害怕的; 受到威胁的」 / lemma「vt. 威胁, 恐吓 [法] 恐吓, 威胁, 使恐惧」
- **建议：`keep`**

## parsons → parson
- rank：form 9294 / lemma 16104 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「帕森斯（姓氏）」 / lemma「教区牧师」
- ECDICT：form「n. 帕森斯（姓氏）」 / lemma「n. 教区牧师」
- **建议：`keep`**

## whinnies → whinny
- rank：form 9300 / lemma 29894 ｜ type `s3` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（马）嘶鸣（三单）」 / lemma「（马）嘶鸣」
- ECDICT：form「n. （轻微的）嘶声( whinny的名词复数 ) v. 发出轻微的嘶声( whinny的第三人称单数 )」 / lemma「n. 马嘶声 vi. 嘶 vt. 带着嘶声说」
- **建议：`keep`**

## laden → load
- rank：form 9316 / lemma 1677 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「装满的；负载的」 / lemma「负载；货物」
- ECDICT：form「a. 装满的, 负载的, 苦恼的 lade的过去分词」 / lemma「n. 负荷, 担子, 重担, 装载量, 负载, 工作量, 加载 vt. 装载, 装填, 使担负 vi. 装货, 上客, …」
- **建议：`?`**

## robberies → robbery
- rank：form 9335 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「抢劫（复数）」 / lemma「抢劫（案）」
- ECDICT：form「n. 抢劫案( robbery的名词复数 ); 明抢; 敲竹杠; 明目张胆地索取高价」 / lemma「n. 抢掠, 抢夺 [法] 强盗, 抢劫, 劫掠」
- **建议：`keep`**

## basics → basic
- rank：form 9350 / lemma 11800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「基础；基本知识」 / lemma「基本的；基础的」
- ECDICT：form「n. 最简单但最重要的部分, 基本, 基础训练」 / lemma「n. 基本原理, 要素, 基本规律 a. 基本的, 碱性的 (计算机)BASIC语言」
- **建议：`keep`**

## leftovers → leftover
- rank：form 9351 / lemma 12633 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「剩饭；剩余物」 / lemma「剩饭；剩余物」
- ECDICT：form「n. 吃剩的食物」 / lemma「n. 剩货, 残留物, 剩饭 a. 残余的」
- **建议：`keep`**

## wails → wail
- rank：form 9361 / lemma 13168 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哀号；悲叹」 / lemma「哀号；恸哭」
- ECDICT：form「n. 痛哭, 哭声( wail的名词复数 ) v. 哭叫, 哀号( wail的第三人称单数 )」 / lemma「n. 恸哭, 哀号, 嚎啕, 呼啸(声) vi. 恸哭, 呼啸, 悲叹, 哀号, 嚎啕」
- **建议：`keep`**

## captioning → caption
- rank：form 9368 / lemma 12500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「字幕；加字幕」 / lemma「标题，说明文字」
- ECDICT：form「v. 给（图片、照片等）加说明文字( caption的现在分词 )」 / lemma「n. 说明, 字幕, 标题 vt. 加上标题, 加上说明 [计] 标题」
- **建议：`keep`**

## hicks → hick
- rank：form 9380 / lemma 15632 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「乡下人（贬义）」 / lemma「乡下人；土包子」
- ECDICT：form「n. 希克斯（姓氏）」 / lemma「n. 乡下人, 土头土脑的人, 反应迟钝的人」
- **建议：`keep`**

## circuits → circuit
- rank：form 9382 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「电路；巡回（复数）」 / lemma「电路；环行」
- ECDICT：form「n. 环路；巡回；电路（circuit的复数）」 / lemma「n. 电路, 环(行)道, 巡回 [计] 线路; 电路」
- **建议：`keep`**

## sparkling → sparkle
- rank：form 9406 / lemma 9848 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闪闪发光的；起泡的」 / lemma「闪耀；闪光」
- ECDICT：form「a. 闪闪发光的, 闪烁的, 闪烁着才华的」 / lemma「n. 闪耀, 火花, 活力, 发泡 vi. 闪耀, 冒火花 vt. 使闪耀」
- **建议：`keep`**

## germs → germ
- rank：form 9410 / lemma 16788 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「细菌；病菌」 / lemma「细菌；病菌；萌芽」
- ECDICT：form「n. 致病菌；细菌；病菌（germ的复数形式）」 / lemma「n. 细菌, 种子, 生殖细胞, 根源 [医] 芽胞, 胚, 胚芽, 病菌」
- **建议：`keep`**

## thumping → thump
- rank：form 9414 / lemma 10043 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「巨大的；沉重的」 / lemma「重击；砰地敲」
- ECDICT：form「a. 发出重击声的, 巨大的, 极大的」 / lemma「n. 重打, 重击声 v. 重打, 撞击, 痛打」
- **建议：`keep`**

## enchanted → enchant
- rank：form 9421 / lemma 33042 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被施魔法的；着迷的」 / lemma「使着迷；施魔法」
- ECDICT：form「a. 中魔法的; 着了魔的; 狂喜的; 极乐的 v. 使欣喜, 使心醉（ enchant的过去式和过去分词 ）; 用魔法…」 / lemma「vt. 施魔法, 使入迷」
- **建议：`keep`**

## clanking → clank
- rank：form 9440 / lemma 15216 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叮当作响的」 / lemma「叮当声」
- ECDICT：form「n. 发出丁当声」 / lemma「n. 叮当声 vi. 发叮当声, 发铿锵声 vt. 使铿然作响」
- **建议：`keep`**

## liberated → liberate
- rank：form 9450 / lemma 15500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「解放的；自由的」 / lemma「解放，释放」
- ECDICT：form「a. 解放的, 自由的」 / lemma「vt. 解放, 释放, 使自由 [机] 释出, 放出」
- **建议：`keep`**

## gallons → gallon
- rank：form 9458 / lemma 12605 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「加仑（容量单位）」 / lemma「加仑（容量单位）」
- ECDICT：form「n. 加仑；一加仑的容器；大量（gallon的复数）」 / lemma「n. 加仑 [医] 加仑」
- **建议：`keep`**

## disciples → disciple
- rank：form 9463 / lemma 15000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「门徒；追随者」 / lemma「门徒，弟子」
- ECDICT：form「n. 信徒( disciple的复数形式 ); 门徒; 耶稣的信徒; （尤指）耶稣十二门徒之一」 / lemma「n. 弟子, 门徒」
- **建议：`keep`**

## cackling → cackle
- rank：form 9486 / lemma 35188 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咯咯大笑；咯咯叫」 / lemma「咯咯叫；尖声笑」
- ECDICT：form「v. 发出咯咯声( cackle的现在分词 ); 饶舌, 叽叽呱呱地讲; 格格笑着表示」 / lemma「n. 咯咯声, 高笑声, 饶舌, 闲谈 vi. 咯咯地叫, 咯咯地笑, 喋喋不休」
- **建议：`keep`**

## donuts → donut
- rank：form 9493 / lemma 10940 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「甜甜圈」 / lemma「甜甜圈」
- ECDICT：form「n. 油炸圈饼, 圆环图( donut的复数形式 )」 / lemma「[医] 电子回旋加速器环状真空室, 同步加速器环状真空室」
- **建议：`keep`**

## sizes → size
- rank：form 9512 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「尺寸；大小」 / lemma「大小；尺寸；规模」
- ECDICT：form「n. 象素显示尺寸, 尺寸（size复数形式）」 / lemma「n. 大小, 尺寸, 规模, 尺码, 能力, 浆料 vt. 上浆, 依大小排列 vi. 可比拟 a. 一定大小的, 一定…」
- **建议：`keep`**

## hisses → hiss
- rank：form 9515 / lemma 14476 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出嘶嘶声」 / lemma「发出嘶嘶声」
- ECDICT：form「n. 嘶嘶声( hiss的名词复数 ) v. 发嘶嘶声( hiss的第三人称单数 ); 发嘘声表示反对」 / lemma「n. 嘘声, 嘶嘶声 vi. 发出嘘声, 发嘶嘶声 vt. 发嘶嘶声表示」
- **建议：`keep`**

## nominated → nominate
- rank：form 9526 / lemma 15752 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「提名；任命」 / lemma「提名；任命」
- ECDICT：form「a. 被任命的；被提名的」 / lemma「vt. 提名, 任命, 命名 [法] 提名...为候选人, 指定, 推荐」
- **建议：`keep`**

## modified → modify
- rank：form 9541 / lemma 15556 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「修改；调整」 / lemma「修改；调整」
- ECDICT：form「a. 改良的；改进的, 修改的」 / lemma「vt. 修正, 变更, 修饰, 缓和, 减轻 vi. 被修改 [计] 修改」
- **建议：`keep`**

## scanning → scan
- rank：form 9550 / lemma 12900 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「扫描；浏览」 / lemma「扫描；浏览」
- ECDICT：form「[计] 扫描 [医] 断续言语, 扫描」 / lemma「n. 审视, 浏览, 扫描, 细查 vt. 细看, 浏览, 扫描, 详细调查, 标出格律 vi. 押韵, 扫描 [计] …」
- **建议：`keep`**

## endangered → endanger
- rank：form 9555 / lemma 13340 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「濒危的；受威胁的」 / lemma「危及；使遭危险」
- ECDICT：form「a. 有生命危险的；濒临灭绝的」 / lemma「vt. 危及 [法] 使危险, 危及」
- **建议：`keep`**

## descended → descend
- rank：form 9592 / lemma 12800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「下降；下来（过去式）」 / lemma「下降；下倾」
- ECDICT：form「a. 下来, 下斜, 下倾, 落下, 下降, 传下, 遗传, 袭击, 屈尊, 由远而近, 由大而小」 / lemma「vi. 下降, 世代相传, 屈尊, 袭击 vt. 下降」
- **建议：`keep`**

## wedded → wed
- rank：form 9624 / lemma 8625 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「已婚的；结合的」 / lemma「结婚；娶；嫁」
- ECDICT：form「a. 已结婚的, 结婚的, 结合的, 热爱...的, 执著的 wed的过去式和过去分词」 / lemma「vt. 与...结婚, 使结合 vi. 结婚」
- **建议：`?`**

## reserves → reserve
- rank：form 9632 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「储备；保护区」 / lemma「预订；保留」
- ECDICT：form「n. 储量, 后备队 [经] 准备金」 / lemma「n. 储备品, 贮量, 后备军, 自然保护区, 保留, 拘谨, 节制, 储备金 vt. 保留, 保存, 预订, 延期, …」
- **建议：`keep`**

## handicapped → handicap
- rank：form 9640 / lemma 11717 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「残疾的；有障碍的」 / lemma「障碍；不利条件；让分」
- ECDICT：form「a. 残疾的 [法] 有生理缺陷的, 残废的」 / lemma「n. 障碍, 困难, 不利条件 vt. 加障碍于, 妨碍」
- **建议：`keep`**

## molecules → molecule
- rank：form 9644 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「分子」 / lemma「分子」
- ECDICT：form「n. 分子, 微粒；摩尔（molecule的复数）」 / lemma「n. 分子, 些微 [化] 分子」
- **建议：`keep`**

## egyptians → egyptian
- rank：form 9661 / lemma 5786 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「埃及人」 / lemma「埃及的；埃及人」
- ECDICT：form「n. 埃及人」 / lemma「n. 埃及人 a. 埃及的, 埃及人的」
- **建议：`keep`**

## mashed → mash
- rank：form 9668 / lemma 10359 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「捣碎的；糊状的」 / lemma「捣碎；压碎」
- ECDICT：form「a. 捣烂的；被捣成糊状的；捣碎的」 / lemma「n. 碎麦芽, 饲料, 糊状物 vt. 调情, 捣碎」
- **建议：`keep`**

## tiles → tile
- rank：form 9672 / lemma 10935 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「瓷砖；瓦片」 / lemma「瓷砖；瓦片」
- ECDICT：form「n. 瓷砖（tile的复数形式）」 / lemma「n. 砖瓦, 瓷砖, 瓦片 vt. 铺以瓦, 铺以瓷砖 [计] 平铺」
- **建议：`keep`**

## catering → cater
- rank：form 9677 / lemma 17222 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「餐饮服务；承办酒席」 / lemma「提供饮食；迎合」
- ECDICT：form「n. 给养；承办酒席；[医]提供饮食及服务」 / lemma「v. 提供饮食及服务, 投合, 迎合」
- **建议：`keep`**

## lurking → lurk
- rank：form 9679 / lemma 24171 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「潜伏；埋伏」 / lemma「潜伏；潜藏」
- ECDICT：form「n. （新用户的）“潜伏”（在USENET上作为旁观者, 不参加讨论）」 / lemma「n. 潜伏, 潜行 vi. 暗藏, 潜伏, 埋伏 [计] 隐匿阅读」
- **建议：`keep`**

## clacking → clack
- rank：form 9687 / lemma 21441 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出咔嗒声」 / lemma「发出咔嗒声」
- ECDICT：form「v. 噼啪响( clack的现在分词 )」 / lemma「v. 噼啪响 n. 噼啪响」
- **建议：`keep`**

## rubens → ruben
- rank：form 9690 / lemma 11127 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「鲁本斯；佛兰德斯画家」 / lemma「鲁本（男子名）」
- ECDICT：form「鲁宾斯(①姓氏 ②Peter Paul, 1577-1640, 荷兰画家)」 / lemma「n. 鲁本（男子名, 等于Reuben）」
- **建议：`keep`**

## waffles → waffle
- rank：form 9717 / lemma 12863 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「华夫饼」 / lemma「华夫饼；含糊其辞」
- ECDICT：form「n. 蛋奶烘饼( waffle的名词复数 ); 华夫饼; 无聊话; 含糊的话 v. 讲或写冗长而无意义的话, 唠叨( w…」 / lemma「vi. 胡扯, 闲聊 n. 华夫饼干, 胡扯 [计] Waffle程序」
- **建议：`keep`**

## spelled → spell
- rank：form 9727 / lemma 5985 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拼写（过去式）」 / lemma「拼写；意味着；招致」
- ECDICT：form「spell的过去式和过去分词」 / lemma「n. 符咒, 魅力, 轮值, 轮班, 工作时间, 一次发作 vt. 拼写, 拼成, 琢磨, 理解, 招致, 轮换, 迷住…」
- **建议：`?`**

## smuggled → smuggle
- rank：form 9732 / lemma 10134 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「走私（过去式）」 / lemma「走私；偷运」
- ECDICT：form「v. 偷运( smuggle的过去式和过去分词 ); 私运; 走私; 不按规章地偷带（人或物）」 / lemma「vt. 偷运, 走私, 私运 vi. 走私」
- **建议：`keep`**

## seniors → senior
- rank：form 9741 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「老年人；高年级学生」 / lemma「年长的；资深的」
- ECDICT：form「n. 年长者, 老年人；资历较深的人（senior的复数形式）」 / lemma「n. 年长者, 资深者, 毕业班学生 a. 年长的, 高级的, 资深的」
- **建议：`keep`**

## agitated → agitate
- rank：form 9746 / lemma 33602 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「焦躁的；激动的」 / lemma「搅动；煽动；使不安」
- ECDICT：form「a. (表现出)不安/焦虑的, (被)激烈辩论的, (被)热烈讨论的, 颤抖的 [医] 激越的」 / lemma「vt. 使摇动, 搅动, 使激动, 使不安 vi. 鼓动, 煽动」
- **建议：`keep`**

## firearms → firearm
- rank：form 9752 / lemma 12980 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「火器；枪械」 / lemma「火器；枪械」
- ECDICT：form「n. 火器, 枪炮；轻武器（firearm的复数）」 / lemma「n. 火器, 枪炮」
- **建议：`keep`**

## bounds → bound
- rank：form 9767 / lemma 2084 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「界限；范围」 / lemma「必定的；受约束的」
- ECDICT：form「n. 边界, 范围, 限度, 界限」 / lemma「n. 跃, 回跳, 范围, 边界 a. 受约束的, 装有封面的, 有义务的, 关联的, 被束缚的, 准备去...的, 便…」
- **建议：`?`**

## eyeballs → eyeball
- rank：form 9786 / lemma 11787 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眼球（复数）」 / lemma「眼球」
- ECDICT：form「n. 眼球( eyeball的名词复数 ); 眼珠子; （与某人）面对面; 对峙 v. 眼球( eyeball的第三人称…」 / lemma「n. 眼球 [医] 眼球」
- **建议：`keep`**

## limitations → limitation
- rank：form 9812 / lemma 26235 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「限制；局限性」 / lemma「限制；局限」
- ECDICT：form「n. 局限性；（限制）因素；边界（limitation的复数形式）」 / lemma「n. 限制, 缺陷, 限额 [医] 限界, 限制, 限度」
- **建议：`keep`**

## shelves → shelf
- rank：form 9813 / lemma 4893 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「架子（复数）；搁板」 / lemma「架子；搁板」
- ECDICT：form「pl. 架子」 / lemma「n. 架子, 搁板 [化] 架子」
- **建议：`?`**

## shelves → shelve
- rank：form 9813 / lemma 47466 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「架子（复数）；搁板」 / lemma「搁置；把…放架上」
- ECDICT：form「pl. 架子」 / lemma「vt. 放置架子上, 搁置 vi. 渐渐倾斜」
- **建议：`fix-target:shelf`**

## initiated → initiate
- rank：form 9840 / lemma 13400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「发起；开始；使入门」 / lemma「开始，发起；使入门」
- ECDICT：form「v. 开始( initiate的过去式和过去分词 ); 传授; 发起; 接纳新成员」 / lemma「n. 入会, 开始 a. 新加入的 vt. 开始, 传授基本知识给」
- **建议：`keep`**

## donations → donation
- rank：form 9851 / lemma 12050 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「捐赠；捐款（复数）」 / lemma「捐赠；捐款」
- ECDICT：form「n. 捐款；捐赠（donation的复数）」 / lemma「n. 捐赠物, 捐款, 捐赠 [经] 赠品, 捐款, 捐赠」
- **建议：`keep`**

## artifacts → artifact
- rank：form 9857 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「人工制品；文物（复数）」 / lemma「人工制品；文物」
- ECDICT：form「n. 史前古器物；人工产品」 / lemma「n. 人工制品 [医] 人为现象, 人工产物」
- **建议：`keep`**

## fractures → fracture
- rank：form 9862 / lemma 13800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「骨折；裂缝（复数）」 / lemma「骨折；裂缝」
- ECDICT：form「n. （指状态）骨折( fracture的名词复数 ); 断裂; （指事实）骨折 v. （使）折断, 破碎( fract…」 / lemma「n. 破碎, 骨折 v. (使)破碎, (使)破裂」
- **建议：`keep`**

## adapted → adapt
- rank：form 9865 / lemma 12200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「适应；改编」 / lemma「适应；改编」
- ECDICT：form「a. 适合的」 / lemma「vt. 使适应, 改编 vi. 适应」
- **建议：`keep`**

## protocols → protocol
- rank：form 9870 / lemma 13500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「协议；礼仪（复数）」 / lemma「协议；礼仪；规程」
- ECDICT：form「n. 协议；礼仪礼节；条款（protocol的复数）」 / lemma「n. 草案, 礼仪, 协议 v. 拟定 [计] 协议, 协议列表实用程序」
- **建议：`keep`**

## headphones → headphone
- rank：form 9872 / lemma 45180 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「耳机」 / lemma「耳机」
- ECDICT：form「n. 听筒；耳机；头戴式受话器（headphone的复数形式）」 / lemma「n. 戴在头上的收话器, 耳机 [电] 头载数话器」
- **建议：`keep`**

## researchers → researcher
- rank：form 9902 / lemma 12345 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「研究人员（复数）」 / lemma「研究员；调查者」
- ECDICT：form「n. 研究员, 调查者( researcher的复数形式 )」 / lemma「n. 研究人员」
- **建议：`keep`**

## disgusted → disgust
- rank：form 9909 / lemma 12700 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「厌恶的；恶心的」 / lemma「厌恶，反感」
- ECDICT：form「a. 厌恶的；厌烦的」 / lemma「n. 厌恶, 嫌恶 vi. 令人厌恶 vt. 使作呕」
- **建议：`keep`**

## allergies → allergy
- rank：form 9921 / lemma 10413 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「过敏（复数）」 / lemma「过敏；过敏症」
- ECDICT：form「n. [医]过敏症; [口]厌恶, 反感; （对食物、花粉、虫咬等的）过敏症( allergy的复数形式 ); 变态反应…」 / lemma「n. 变应性, 反感, 厌恶 [化] 变态反应; 变应性」
- **建议：`keep`**

## mexicans → mexican
- rank：form 9926 / lemma 3333 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「墨西哥人（复数）」 / lemma「墨西哥的；墨西哥人」
- ECDICT：form「n. 墨西哥人（Mexican的复数）」 / lemma「n. 墨西哥人, 墨西哥语 a. 墨西哥的」
- **建议：`keep`**

## commanded → command
- rank：form 9957 / lemma 12100 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「命令；指挥（过去式）」 / lemma「命令；指挥；掌握」
- ECDICT：form「v. 指挥, 控制, 命令( command的过去式和过去分词 ); 掌握; 俯瞰; 应得」 / lemma「n. 命令, 指挥, 控制, 部队, 司令部 v. 命令, 指挥, 控制 [计] 命令; 指令; DOS外部命令:启动新…」
- **建议：`keep`**

## testicles → testicle
- rank：form 9982 / lemma 18756 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「睾丸（复数）」 / lemma「睾丸」
- ECDICT：form「n. 睾丸（testicle的复数）」 / lemma「n. 睾丸 [医] 睾丸」
- **建议：`keep`**

## titties → titty
- rank：form 9994 / lemma 14752 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乳房（俚语，复数）」 / lemma「乳头（俚语）」
- ECDICT：form「n. 乳房, 乳头（等于teat）」 / lemma「n. 乳房, 乳头（等于teat）」
- **建议：`keep`**

## downloaded → download
- rank：form 9999 / lemma 7535 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「下载（过去式）」 / lemma「下载」
- ECDICT：form「v. 将（程序, 资料等）从大计算机系统输入小计算机系统, 下载( download的过去式和过去分词 )」 / lemma「[计] 卸载, 下栽」
- **建议：`keep`**

## sniffling → sniffle
- rank：form 10001 / lemma 40848 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抽鼻子（现在分词）」 / lemma「抽鼻子；吸鼻子」
- ECDICT：form「v. 抽鼻子( sniffle的现在分词 ); 抽噎」 / lemma「vi. 吸着鼻子说话, 抽鼻涕 n. 抽鼻子」
- **建议：`keep`**

## intrigued → intrigue
- rank：form 10019 / lemma 14227 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被迷住的；好奇的」 / lemma「激起兴趣；密谋」
- ECDICT：form「a. 好奇的, 被迷住了的 v. 搞阴谋诡计(intrigue的过去式); 激起…的兴趣或好奇心; “intrigue”…」 / lemma「n. 阴谋, 复杂的事 vi. 密谋, 私通 vt. 激起...的兴趣, 用诡计取得」
- **建议：`keep`**

## distracting → distract
- rank：form 10026 / lemma 12800 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人分心的」 / lemma「分散注意力；使心烦」
- ECDICT：form「v. 使（人）分心, 分散（注意力）( distract的现在分词 ); 打扰」 / lemma「vt. 转移, 分心, 使发狂」
- **建议：`keep`**

## dumplings → dumpling
- rank：form 10036 / lemma 15768 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「饺子；汤团（复数）」 / lemma「饺子；汤团」
- ECDICT：form「n. 汤团( dumpling的名词复数 ); 饺子; 水果布丁; 矮胖的人」 / lemma「n. 面团布丁, 团子」
- **建议：`keep`**

## jacks → jack
- rank：form 10039 / lemma 425 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「抓子游戏；千斤顶（复数）」 / lemma「杰克（人名）；千斤顶」
- ECDICT：form「n. 抓子游戏；家伙；小伙子（jack的复数）」 / lemma「n. 插座, 千斤顶, 男人 vt. 抬起, 提醒, 扛举, 增加, 提高, 放弃 a. 雄的 [计] 插座」
- **建议：`keep`**

## measurements → measurement
- rank：form 10057 / lemma 16409 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「测量；尺寸」 / lemma「测量；尺寸」
- ECDICT：form「n. 测量值, 尺寸（measurement的复数）」 / lemma「n. 尺寸, 度量, 度量单位 [计] 度量, 度量单位」
- **建议：`keep`**

## insisting → insist
- rank：form 10060 / lemma 12500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「坚持；坚决要求」 / lemma「坚持；坚决主张」
- ECDICT：form「v. 坚决宣称, 坚持认为( insist的现在分词 ); 坚决要求」 / lemma「v. 坚持, 坚决主张, 强调」
- **建议：`keep`**

## elevated → elevate
- rank：form 10080 / lemma 12100 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「升高的；高尚的」 / lemma「提升，抬高；提高」
- ECDICT：form「a. 提高的」 / lemma「vt. 举起, 提拔, 鼓舞」
- **建议：`keep`**

## components → component
- rank：form 10096 / lemma 10755 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「组成部分；零件」 / lemma「组成部分；零件」
- ECDICT：form「n. 部件；组件；成份（component复数）」 / lemma「n. 元件, 组件, 成分 a. 组成的, 构成的 [计] 组件」
- **建议：`keep`**

## vibrates → vibrate
- rank：form 10097 / lemma 17467 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「振动；颤动」 / lemma「振动；颤动」
- ECDICT：form「v. （使）振动[颤动]( vibrate的第三人称单数 )」 / lemma「vi. 振动, 颤动, 激动, 摇摆, 踌躇 vt. 使颤动, 使振动, 使摆动」
- **建议：`keep`**

## provisions → provision
- rank：form 10109 / lemma 18241 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「供应品；给养」 / lemma「供应；条款；给养」
- ECDICT：form「n. 存粮, 给养, 口粮, 食物, 粮食 [经] 食品, 粮食」 / lemma「n. (政府提供的)钱和设备, 准备, 供应品, 规定, 条款 vt. 供给...食物及必需品」
- **建议：`keep`**

## evacuated → evacuate
- rank：form 10122 / lemma 15000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「疏散；撤离」 / lemma「撤离；排空」
- ECDICT：form「a. 疏散；排空的, 撤退者的」 / lemma「v. 疏散, 撤出, 排泄」
- **建议：`keep`**

## enlisted → enlist
- rank：form 10130 / lemma 14182 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「入伍；征募；争取」 / lemma「入伍；征募；争取」
- ECDICT：form「a. 应募入伍的」 / lemma「vt. 征募, 参与, 谋取 vi. 从军, 应募, 赞助」
- **建议：`keep`**

## wheezing → wheeze
- rank：form 10136 / lemma 36092 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喘息；呼哧作响」 / lemma「喘息；喘鸣」
- ECDICT：form「[医] 喘鸣」 / lemma「vi. 喘气 vt. 喘息着说 n. 喘气声, 喘息」
- **建议：`keep`**

## craving → crave
- rank：form 10142 / lemma 11297 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「渴望；强烈欲望」 / lemma「渴望；恳求」
- ECDICT：form「n. 渴望, 热望 [医] 瘾, 癖, 嗜欲」 / lemma「v. 渴望, 热望, 恳求」
- **建议：`keep`**

## tattooed → tattoo
- rank：form 10160 / lemma 2593 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有纹身的」 / lemma「纹身；刺青」
- ECDICT：form「v. 刺青, 文身( tattoo的过去式和过去分词 ); 连续有节奏地敲击; 作连续有节奏的敲击」 / lemma「n. 归营号, 连续有节奏的敲击, 文身, 矮种马 vt. 连续有节奏地敲, 刺花纹于 vi. 作连续有节奏的敲击」
- **建议：`?`**

## emptied → empty
- rank：form 10172 / lemma 12200 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「倒空；清空」 / lemma「倒空，清空」
- ECDICT：form「a. 耗尽的；已清除的」 / lemma「a. 空的, 空虚的, 空腹的, 空洞的 n. 空的东西, 空车 vt. 倒空, 使变空, 使排出 vi. 流空 [计]…」
- **建议：`keep`**

## sponsored → sponsor
- rank：form 10173 / lemma 10800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「赞助；资助」 / lemma「发起人，赞助者」
- ECDICT：form「v. 赞助( sponsor的过去式和过去分词); 资助（某人的培训或教育）; 为慈善活动捐资; 发起, 倡议 a. 赞…」 / lemma「n. 保证人, 赞助者, 发起者, 倡议者, 教父 vt. 发起, 赞助, 倡议」
- **建议：`keep`**

## goggles → goggle
- rank：form 10182 / lemma 46930 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「护目镜；风镜」 / lemma「瞪大眼睛看」
- ECDICT：form「n. 护目镜, 风镜 [化] 防护镜; 防护眼镜; 护目镜; 眼罩」 / lemma「n. 眼睛瞪视, 护目镜 a. 突出的, 瞪眼的 vi. 瞪眼看, 眼珠转动 vt. 使瞪眼, 使眼珠转动」
- **建议：`keep`**

## shillings → shilling
- rank：form 10200 / lemma 14936 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「先令（旧英国货币）」 / lemma「先令（旧英币）」
- ECDICT：form「n. 先令（英国1971年以前的货币单位, 为一镑的二十分之一）( shilling的复数形式 )」 / lemma「n. 先令 [经] 先令」
- **建议：`keep`**

## snorting → snort
- rank：form 10204 / lemma 14734 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喷鼻息；哼着说」 / lemma「哼鼻；喷鼻息」
- ECDICT：form「v. 喷鼻息（以表示不耐烦, 轻蔑等）( snort的现在分词 ); （俚） 用鼻子吸（毒品）」 / lemma「vi. 喷着气弄响鼻子, 轻蔑地哼, 嘶嘶响着排气 vt. 哼着鼻子说, 喷出, 吸入(毒品) n. 喷鼻息, (潜艇的…」
- **建议：`keep`**

## meatballs → meatball
- rank：form 10208 / lemma 12594 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「肉丸（复数）」 / lemma「肉丸」
- ECDICT：form「n. 肉丸( meatball的复数形式 )」 / lemma「n. 肉团, 愚蠢, 飞机降落目标」
- **建议：`keep`**

## intercepted → intercept
- rank：form 10214 / lemma 14500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拦截；截获」 / lemma「拦截，截取」
- ECDICT：form「v. 拦截( intercept的过去式和过去分词 ); 截住; 截击; 拦阻」 / lemma「n. 截取, 妨碍, 截距 vt. 拦截, 阻止, 截取」
- **建议：`keep`**

## sizzling → sizzle
- rank：form 10222 / lemma 22258 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滋滋作响的；极热的」 / lemma「发出咝咝声；煎得吱吱响」
- ECDICT：form「v. 发咝咝声( sizzle的现在分词 ); 表现良好, 进行顺利; 把…烧得哧哧响, 烧焦; 恶言相骂」 / lemma「vi. 发出嘶嘶声 vt. 烧灼 n. 咝咝声」
- **建议：`keep`**

## characteristics → characteristic
- rank：form 10254 / lemma 13635 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「特征；特性（复数）」 / lemma「典型的；特有的」
- ECDICT：form「n. 特性, 特征；特质；特色（characteristic的复数）」 / lemma「n. 特性, 特征, 特色 a. 特性的, 特有的, 有特色的 [计] 阶; 指数」
- **建议：`keep`**

## rites → rite
- rank：form 10295 / lemma 10965 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「仪式；典礼」 / lemma「仪式；典礼」
- ECDICT：form「n. 仪式（rite的复数）」 / lemma「n. 仪式, 典礼, 惯例, 礼拜式」
- **建议：`keep`**

## raping → rape
- rank：form 10304 / lemma 15000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「强奸（rape 的现在分词）」 / lemma「掠夺，强夺；油菜」
- ECDICT：form「v. 以暴力夺取, 强夺( rape的现在分词 ); 强奸」 / lemma「n. 抢夺, 掠夺, 强奸, 葡萄渣, 芸苔 vt. 掠夺, 抢夺, 强奸」
- **建议：`keep`**

## defenses → defense
- rank：form 10331 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「防御；辩护（defense 的复数）」 / lemma「防御，辩护」
- ECDICT：form「vt. [军] 防御；辩护（defense的第三人称单数） n. [军] 防御（defense的复数）」 / lemma「n. 防卫, 防卫物 [医] 防御」
- **建议：`keep`**

## gardening → garden
- rank：form 10338 / lemma 7560 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「园艺；从事园艺」 / lemma「花园；菜园」
- ECDICT：form「n. 园艺(学)」 / lemma「n. 花园, 果园, 菜园 vi. 栽培花木 vt. 造园 a. 花园的, 普通的」
- **建议：`?`**

## tangled → tangle
- rank：form 10344 / lemma 18299 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「纠缠的；混乱的」 / lemma「缠结；纠缠」
- ECDICT：form「a. 纠缠的, 紊乱的 [法] 复杂的, 缠结的, 繁乱的」 / lemma「n. 缠结, 纠结的一团, 困惑, 纠纷, 混乱 vt. 使缠结, 缠住 vi. 缠结, 乱作一团」
- **建议：`keep`**

## vultures → vulture
- rank：form 10373 / lemma 10791 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「秃鹫（复数）；贪婪者」 / lemma「秃鹫；贪婪的人」
- ECDICT：form「n. 秃鹫( vulture的复数形式 ); 压榨别人的人, 贪心汉」 / lemma「n. 秃鹫, 贪婪的人 [法] 贪婪而残酷者, 劫掠成性者」
- **建议：`keep`**

## manufacturing → manufacture
- rank：form 10377 / lemma 11184 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「制造业；制造」 / lemma「制造；生产」
- ECDICT：form「n. 制造业 a. 制造业的」 / lemma「n. 产品, 制造 vt. 制造, 假造 vi. 制造」
- **建议：`keep`**

## crackles → crackle
- rank：form 10380 / lemma 24613 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出噼啪声（第三人称单数）」 / lemma「发出爆裂声」
- ECDICT：form「v. 发出轻微的爆裂声, 发出噼啪声( crackle的第三人称单数 )」 / lemma「n. 劈啪响, 裂纹 vi. (使)发劈啪声」
- **建议：`keep`**

## descendants → descendant
- rank：form 10395 / lemma 13800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「后代；子孙（复数）」 / lemma「后裔；子孙」
- ECDICT：form「n. 后代, 晚辈（descendant的复数）；子节点；衍生物」 / lemma「n. 后裔, 子孙 a. 传下的, 下降的」
- **建议：`keep`**

## democrats → democrat
- rank：form 10431 / lemma 12954 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「民主党人（复数）」 / lemma「民主党人；民主主义者」
- ECDICT：form「n. 民主主义者；民主党员（democrat的复数）」 / lemma「n. 民主人士, 民主主义者, 民主党党员 [经] 民主党」
- **建议：`keep`**

## terminated → terminate
- rank：form 10433 / lemma 14500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「终止；解雇（过去式）」 / lemma「终止，结束」
- ECDICT：form「vt.& vi. terminate的过去式 v. 结束( terminate的过去式和过去分词 ); 使终结; 解雇;…」 / lemma「a. 有结尾的, (可)结束的 vi. 结束, 终止, 满期 vt. 使停止, 使结束, 使终止 [计] 终止」
- **建议：`keep`**

## mammals → mammal
- rank：form 10441 / lemma 14738 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「哺乳动物」 / lemma「哺乳动物」
- ECDICT：form「n. 哺乳类；哺乳纲；哺乳类动物（mammal的复数）」 / lemma「n. 哺乳动物 [化] 哺乳动物」
- **建议：`keep`**

## raving → rave
- rank：form 10471 / lemma 11046 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「胡言乱语的；狂热的」 / lemma「狂热赞扬；胡言乱语」
- ECDICT：form「a. 胡说的, 疯狂的, 狂暴的 n. 胡说」 / lemma「n. 狂吼, 狂暴 v. 愤怒地说, 叫嚷, 咆哮」
- **建议：`keep`**

## rations → ration
- rank：form 10479 / lemma 11225 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「配给量；口粮」 / lemma「定量；配给量」
- ECDICT：form「n. 配给量；比例；给养（ration的复数）」 / lemma「n. 定额, 定量, 配给 vt. 配给, 定量供应」
- **建议：`keep`**

## reunited → reunite
- rank：form 10494 / lemma 15719 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重聚；团聚」 / lemma「重聚；使再联合」
- ECDICT：form「v. 重聚；使再结合（reunite的过去式和过去分词）」 / lemma「v. (使)再联合」
- **建议：`keep`**

## overruled → overrule
- rank：form 10496 / lemma 17200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「驳回；否决」 / lemma「否决；驳回；宣布无效」
- ECDICT：form「v. 批驳, 推翻, 拒绝( overrule的过去式和过去分词 )」 / lemma「vt. 统治, 威压, 打败, 驳回 [法] 否决, 驳回, 批驳」
- **建议：`keep`**

## presidents → president
- rank：form 10519 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「总统；校长（复数）」 / lemma「主席，总统；主任」
- ECDICT：form「n. 总统; （大学）校长( president的复数形式 ); 会长; [P-]总统; 银行行长」 / lemma「n. 总统, 总裁, 董事长, (学院)院长, (大学)校长, 主管人, 主持人 [经] 总经理, 董事长, 总裁」
- **建议：`keep`**

## requirements → requirement
- rank：form 10541 / lemma 13433 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「要求；必要条件」 / lemma「要求；必要条件」
- ECDICT：form「n. 调整需要量, 必需品；要求（requirement的复数）」 / lemma「n. 需求, 必要条件, 要求 [化] 要求; 合同要求」
- **建议：`keep`**

## titans → titan
- rank：form 10550 / lemma 13700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「巨人；泰坦（titan 的复数）」 / lemma「巨人，泰坦；巨擘」
- ECDICT：form「n. [希神]泰坦巨神；（美）大力神Ⅱ型洲际导弹（Titan的复数）」 / lemma「n. 提坦, 太阳神, 巨人」
- **建议：`keep`**

## intimidating → intimidate
- rank：form 10551 / lemma 13500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人畏惧的；吓人的」 / lemma「恐吓，威胁」
- ECDICT：form「vt. 恐吓, 威胁( intimidate的现在分词)」 / lemma「vt. 威胁, 恐吓 [法] 恐吓, 威胁, 使恐惧」
- **建议：`keep`**

## outnumbered → outnumber
- rank：form 10577 / lemma 22958 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「数量上超过（outnumber 过去式）」 / lemma「数量上超过」
- ECDICT：form「v. 数量多于, 比…多( outnumber的过去式和过去分词 )」 / lemma「vt. 数目超过, 比...多」
- **建议：`keep`**

## chirps → chirp
- rank：form 10582 / lemma 16221 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸟叫；唧唧叫（chirp 第三人称单数）」 / lemma「鸟叫；唧唧叫」
- ECDICT：form「n. 啾啾」 / lemma「n. 喳喳声, 唧唧声 v. 吱喳而鸣」
- **建议：`keep`**

## fumes → fume
- rank：form 10592 / lemma 43391 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「烟雾；废气（fume 的复数）」 / lemma「烟；气体；发怒」
- ECDICT：form「n. 烟, 汽, 气 [机] 烟」 / lemma「n. 臭气, 烟, 激怒 vt. 熏 vi. 冒烟」
- **建议：`keep`**

## cawing → caw
- rank：form 10593 / lemma 20605 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乌鸦叫（caw 的现在分词）」 / lemma「鸦叫声」
- ECDICT：form「v. Carbon-Arc Welding 碳弧焊( caw的现在分词 )」 / lemma「n. 乌鸦的叫声 vi. 发出鸦叫声 [计] 通道地址字」
- **建议：`keep`**

## snickers → snicker
- rank：form 10610 / lemma 37759 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「士力架（品牌）；窃笑」 / lemma「窃笑；暗笑」
- ECDICT：form「n. =sni^^er( snicker的名词复数 ) v. =sni^^er( snicker的第三人称单数 )」 / lemma「n. 窃笑 vi. 窃笑 vt. 窃笑着说」
- **建议：`keep`**

## peers → peer
- rank：form 10623 / lemma 11122 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「同龄人；同辈（复数）」 / lemma「同龄人；同辈；贵族」
- ECDICT：form「n. 平辈, 同事（peer的复数）」 / lemma「n. 同等的人, 匹敌, 贵族 vi. 凝视, 窥视, 费力地看, 隐现 vt. 与...同等, 封为贵族」
- **建议：`keep`**

## horrors → horror
- rank：form 10624 / lemma 12800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「恐怖；可怕的事（复数）」 / lemma「恐怖，恐惧」
- ECDICT：form「n. 恐怖( horror的复数形式 ); 憎恶; 令人感到恐怖的事; 讨厌鬼」 / lemma「n. 惊骇, 恐怖, 惨状 [医] 恐怖, 恐惧」
- **建议：`keep`**

## errors → error
- rank：form 10635 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「错误（复数）」 / lemma「错误，差错」
- ECDICT：form「n. 误差；错误；差错（error的复数）」 / lemma「n. 错误, 过失, 失误, 误差 [计] 错误」
- **建议：`keep`**

## tainted → taint
- rank：form 10641 / lemma 19806 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受污染的；腐坏的」 / lemma「污染；玷污」
- ECDICT：form「a. 腐坏的, 污染的, 沾污的, 感染的 [法] 有污点的, 污染的」 / lemma「n. 污点, 耻辱, 感染 vt. 污染, 使腐败, 沾染, 腐蚀」
- **建议：`keep`**

## insured → insure
- rank：form 10649 / lemma 18322 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已投保的」 / lemma「给…投保；确保」
- ECDICT：form「n. 被保险人」 / lemma「vt. 保险, 确保 vi. 投保」
- **建议：`keep`**

## hallowed → hallow
- rank：form 10663 / lemma 42372 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「神圣的；受尊崇的」 / lemma「使神圣；尊崇」
- ECDICT：form「a. 神圣化的, 神圣的」 / lemma「vt. 使...神圣, 视为神圣 n. 圣徒」
- **建议：`keep`**

## watts → watt
- rank：form 10670 / lemma 9234 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「瓦特（功率单位）」 / lemma「瓦特，英国发明家工程师」
- ECDICT：form「n. 瓦特（功率单位）」 / lemma「n. 瓦(特) [化] 瓦; 瓦特」
- **建议：`keep`**

## postponed → postpone
- rank：form 10678 / lemma 12400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「推迟；延期」 / lemma「推迟，延期」
- ECDICT：form「vt.& vi. 延期, 缓办, （使）延迟 vt. 把…放在次要地位; [语]把…放在后面（或句尾） vi. （疟疾等…」 / lemma「vt. 延迟, 使延期, 缓办, 搁延 vi. 延缓, 延缓发作」
- **建议：`keep`**

## stuttering → stutter
- rank：form 10680 / lemma 15867 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「口吃；结巴」 / lemma「口吃；结巴」
- ECDICT：form「n. 口吃, 结巴 [医] 口吃, 讷吃」 / lemma「n. 口吃, 结结巴巴 v. 结结巴巴地说」
- **建议：`keep`**

## divisions → division
- rank：form 10713 / lemma 12250 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「部门；分歧；除法」 / lemma「division划分；部门；分歧」
- ECDICT：form「n. 分开( division的复数形式 ); 分界线; 分歧; 分离」 / lemma「n. 分, 分开, 除法, 部门(如部、处、系等), 师 [计] 部分」
- **建议：`keep`**

## whines → whine
- rank：form 10728 / lemma 11517 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哀鸣；抱怨」 / lemma「哀鸣；抱怨」
- ECDICT：form「n. 悲嗥声( whine的名词复数 ); 哀鸣者 v. 哀号( whine的第三人称单数 ); 哀诉, 诉怨」 / lemma「n. 哀叫声, 嘎嘎声, 哀鸣 vi. 哭诉, 嘎嘎响, 发呜呜声 vt. 哀诉」
- **建议：`keep`**

## founding → found
- rank：form 10736 / lemma 178 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「创立；创建」 / lemma「找到（find 的过去式）」
- ECDICT：form「[计] 铸造」 / lemma「vt. 建立, 创立, 铸造 find的过去式和过去分词」
- **建议：`?`**

## pictured → picture
- rank：form 10795 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「描绘；想象」 / lemma「图画，照片」
- ECDICT：form「v. 绘画( picture的过去式和过去分词 ); 描绘; 想像; 设想」 / lemma「n. 图画, 照片, 景色, 美丽如画的人(或物), 化身, 生动的描述, 想像, 形象思维 vt. 画, 拍摄, 用图…」
- **建议：`keep`**

## delusions → delusion
- rank：form 10802 / lemma 11366 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「妄想；错觉」 / lemma「错觉；妄想」
- ECDICT：form「n. 欺骗( delusion的复数形式 ); 谬见; 错觉; 妄想」 / lemma「n. 迷惑, 欺瞒, 错觉 [医] 妄想」
- **建议：`keep`**

## attracts → attract
- rank：form 10823 / lemma 12500 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「吸引；招引」 / lemma「吸引；引起」
- ECDICT：form「v. 吸引( attract的第三人称单数 ); 使喜爱; 引起…的好感（或爱慕）; 具有吸引力」 / lemma「vt. 吸引, 诱惑 vi. 有吸引力」
- **建议：`keep`**

## invaders → invader
- rank：form 10825 / lemma 14700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「侵略者；入侵者」 / lemma「侵略者，侵入者」
- ECDICT：form「n. 侵入种；侵略者（invader的复数）」 / lemma「n. 侵略者 [化] 侵入物」
- **建议：`keep`**

## gras → gra
- rank：form 10829 / lemma 43630 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「油脂；肥肝」 / lemma「格雷（人名/缩写）」
- ECDICT：form「abbr. 一般认为安全（Generally Recognized as Safe）」 / lemma「abbr. （美）政府科学研究机构联合会（Governmental Research Association）」
- **建议：`keep`**

## suffocating → suffocate
- rank：form 10831 / lemma 12286 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人窒息的」 / lemma「窒息；使窒息」
- ECDICT：form「[医] 窒息性的」 / lemma「vt. 使窒息, 噎住, 闷熄 vi. 闷死, 窒息, 受阻」
- **建议：`keep`**

## admiring → admire
- rank：form 10864 / lemma 12600 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「赞赏的；钦佩的」 / lemma「钦佩，赞赏；欣赏」
- ECDICT：form「a. 赞赏的, 钦佩的, 羡慕的」 / lemma「vt. 赞美, 钦佩, 爱慕 vi. 称赞, 惊奇」
- **建议：`keep`**

## avengers → avenger
- rank：form 10870 / lemma 15893 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「复仇者」 / lemma「复仇者」
- ECDICT：form「复仇者(avenger的复数)」 / lemma「n. 复仇者」
- **建议：`keep`**

## casing → case
- rank：form 10901 / lemma 255 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「外壳；套管」 / lemma「情况；案件；箱子」
- ECDICT：form「n. 箱, 盒, 包装, 框, 套管 [化] 汽车外胎」 / lemma「n. 情形, 情况, 箱, 容器, 事实, 病例, 案例, 框子 vt. 装箱, 包盖」
- **建议：`?`**

## cooing → coo
- rank：form 10902 / lemma 16626 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咕咕叫；柔声说」 / lemma「（鸽子）咕咕叫；柔声说」
- ECDICT：form「n. 喔啊声；轻柔低语；鸽子咕咕叫」 / lemma「vi. 咕咕地叫 vi.vt. 谈情话, 轻轻地说, 温柔可爱地说, 温柔爱恋地说 n. 鸽子的叫声, 鸽子叫似的轻声」
- **建议：`keep`**

## violating → violate
- rank：form 10919 / lemma 15000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「违反；侵犯」 / lemma「违犯，侵犯，扰乱」
- ECDICT：form「v. 亵渎( violate的现在分词 ); 违反; 侵犯; 强奸」 / lemma「vt. 违犯, 亵渎, 违反, 侵犯, 妨碍 [经] 违犯, 违反」
- **建议：`keep`**

## hooting → hoot
- rank：form 10921 / lemma 12199 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出汽笛声；嘲笑」 / lemma「鸣叫；哄笑」
- ECDICT：form「v. 喊叫；鸣响；摄制（hoot的ing形式）」 / lemma「n. 叫嚣, 嘲骂声, 鸣响 vi. 大声叫嚣, 鸣响, 猫头鹰叫 vt. 呵斥, 轰赶」
- **建议：`keep`**

## parasites → parasite
- rank：form 10931 / lemma 13800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「寄生虫；寄生生物」 / lemma「寄生物；寄生虫；依赖他人者」
- ECDICT：form「n. 寄生虫；寄生生物（parasite的复数）」 / lemma「n. 寄生生物, 寄生虫, 食客 [医] 寄生物; 寄生胎」
- **建议：`keep`**

## neighing → neigh
- rank：form 10938 / lemma 29647 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（马）嘶鸣」 / lemma「（马）嘶鸣」
- ECDICT：form「v. （马）嘶( neigh的现在分词 )」 / lemma「n. 马嘶声 vi. 马嘶」
- **建议：`keep`**

## spoilt → spoil
- rank：form 10941 / lemma 3436 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被宠坏的；损坏的」 / lemma「破坏；宠坏」
- ECDICT：form「spoil的过去式和过去分词」 / lemma「n. 战利品, 赃物, 奖品, 变质, 次品 vt. 损坏, 破坏, 溺爱 vi. 腐坏, 掠夺」
- **建议：`?`**

## blueprints → blueprint
- rank：form 10948 / lemma 14544 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蓝图；设计图」 / lemma「蓝图；计划」
- ECDICT：form「n. 蓝图；模板（blueprint的复数）」 / lemma「n. 蓝图, 设计图, (周详的)计划 vt. 制成蓝图, 计划」
- **建议：`keep`**

## cons → con
- rank：form 10961 / lemma 3308 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「缺点；反对理由」 / lemma「骗局；反对」
- ECDICT：form「[计] 面向连接的网络服务」 / lemma「vt. 精读, 仔细研究, 默记 adv. 反面地, 从反面 a. 欺诈的 n. 反对者, 反对票, 肺结核 [计] 控…」
- **建议：`?`**

## cons → conn
- rank：form 10961 / lemma 23488 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「缺点；反对理由」 / lemma「指挥操舵；驾船」
- ECDICT：form「[计] 面向连接的网络服务」 / lemma「vt. 指挥操舵 n. 指挥操舵」
- **建议：`keep`**

## barbarians → barbarian
- rank：form 10963 / lemma 11882 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「野蛮人；未开化者」 / lemma「野蛮人；未开化的人」
- ECDICT：form「n. 野蛮人；蛮夷（barbarian的复数形式）」 / lemma「n. 野蛮人 a. 野蛮的」
- **建议：`keep`**

## pilgrims → pilgrim
- rank：form 10970 / lemma 11180 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「朝圣者；清教徒」 / lemma「朝圣者；香客」
- ECDICT：form「n. 香客, 朝圣者( pilgrim的复数形式 )」 / lemma「n. 旅行者, 朝圣者, 香客 vi. 朝圣」
- **建议：`keep`**

## parameters → parameter
- rank：form 10972 / lemma 26935 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「参数；界限」 / lemma「参数；界限」
- ECDICT：form「n. 参数；参量（parameter的复数）」 / lemma「n. 参变数, 参变量, 参数, 参量 [计] 参量; 参数」
- **建议：`keep`**

## automated → automate
- rank：form 10995 / lemma 45445 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「自动化的」 / lemma「使自动化」
- ECDICT：form「a. 自动化的；机械化的」 / lemma「vt.vi. (使)自动化 [计] 自动化」
- **建议：`keep`**

## amused → amuse
- rank：form 11000 / lemma 9944 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被逗乐的；愉快的」 / lemma「逗乐；使消遣」
- ECDICT：form「a. 愉快的, 被逗乐的」 / lemma「vt. 消遣, 娱乐, 使发笑」
- **建议：`?`**

## appreciates → appreciate
- rank：form 11005 / lemma 12400 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「欣赏；感激；增值」 / lemma「欣赏；感激；增值」
- ECDICT：form「v. 感激( appreciate的第三人称单数 ); 欣赏; （充分）意识到; 对…作（正确）评价」 / lemma「vt. 赏识, 鉴别, 为...而感激, 领会, 欣赏 vi. 增值, 涨价」
- **建议：`keep`**

## reassuring → reassure
- rank：form 11007 / lemma 11588 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「令人安心的；宽慰的」 / lemma「使安心；安慰」
- ECDICT：form「a. 安心的, 可靠的, 鼓励的」 / lemma「vt. 使...安心, 向...再保证 [法] 重新保证, 再保险, 使清除疑虑」
- **建议：`keep`**

## painkillers → painkiller
- rank：form 11045 / lemma 24309 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「止痛药（复数）」 / lemma「止痛药」
- ECDICT：form「n. 止痛药( painkiller的复数形式 )」 / lemma「n. 解痛药, 止痛片, 止痛药」
- **建议：`keep`**

## misplaced → misplace
- rank：form 11052 / lemma 36304 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「放错地方的；不合时宜的」 / lemma「放错地方；丢失」
- ECDICT：form「a. 错位的; 寄托错的 v. 错放(misplace的过去式)」 / lemma「vt. 放错地方」
- **建议：`keep`**

## japs → jap
- rank：form 11060 / lemma 13888 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「日本人（贬义，勿用）」 / lemma「日本人（贬称）」
- ECDICT：form「n. 小日本, 日本鬼子（等于Japanese, 是对日本人的蔑称）」 / lemma「abbr. 日本, 日本人（Japan, Japanese）」
- **建议：`keep`**

## guiding → guide
- rank：form 11076 / lemma 2087 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「指导的；引导的」 / lemma「指南；导游」
- ECDICT：form「[计] 引导的」 / lemma「n. 引导者, 导游, 指南, 路标 vt. 指导, 支配, 管理, 带领, 操纵 vi. 任向导 [计] 辅助线」
- **建议：`?`**

## wrinkles → wrinkle
- rank：form 11105 / lemma 15011 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「皱纹；褶皱」 / lemma「皱纹；褶皱」
- ECDICT：form「n. 皱纹；皱褶（wrinkle的复数形式）」 / lemma「n. 皱纹, 妙计, 方法, 技巧 vi. 起皱 vt. 使起皱纹」
- **建议：`keep`**

## subtitling → subtitle
- rank：form 11107 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「字幕制作；加字幕」 / lemma「副标题；字幕」
- ECDICT：form「n. 字幕」 / lemma「n. 副标题」
- **建议：`keep`**

## bygones → bygone
- rank：form 11117 / lemma 32160 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「往事；过去的事」 / lemma「过去的；往昔的」
- ECDICT：form「n. 过去的（不愉快的）事( bygone的复数形式 )」 / lemma「n. 过去的事, 往事 a. 过去的」
- **建议：`keep`**

## religions → religion
- rank：form 11124 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「宗教」 / lemma「宗教」
- ECDICT：form「n. 宗教, 宗教信仰（religion的复数）」 / lemma「n. 宗教, 信仰 [法] 宗教, 宗教信仰, 信仰」
- **建议：`keep`**

## teammates → teammate
- rank：form 11156 / lemma 15643 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「队友」 / lemma「队友」
- ECDICT：form「n. 队友, 同队队员」 / lemma「n. 队友」
- **建议：`keep`**

## reeves → reeve
- rank：form 11169 / lemma 27865 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「里夫斯（姓氏/人名）」 / lemma「地方官；雌流苏鹬」
- ECDICT：form「n. 里夫斯（姓氏）」 / lemma「n. 地方长官 v. 穿(绳索), 穿过」
- **建议：`keep`**

## prospects → prospect
- rank：form 11213 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「前景；可能性」 / lemma「前景，可能性」
- ECDICT：form「n. 预期；前景；潜在顾客；远景展望」 / lemma「n. 景色, 展望 vt. 勘探, 勘察 vi. 勘探, 有前途」
- **建议：`keep`**

## recycling → recycle
- rank：form 11230 / lemma 12200 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「回收利用；再循环」 / lemma「回收利用；再循环」
- ECDICT：form「[电] 再循环」 / lemma「vt. 使再循环, 重新利用, 再制 n. 再循环」
- **建议：`keep`**

## snarls → snarl
- rank：form 11232 / lemma 30789 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咆哮；缠结」 / lemma「咆哮；缠结」
- ECDICT：form「n. （动物的）龇牙低吼( snarl的名词复数 ); 愤怒叫嚷（声）; 咆哮（声）; 疼痛叫声 v. （指狗）吠, 嗥…」 / lemma「vi. 吼叫, 怒骂, 缠结 vt. 咆哮着说, 搞乱, 使缠结 n. 咆哮, 吼叫, 怒骂, 缠结, 混乱」
- **建议：`keep`**

## morales → morale
- rank：form 11240 / lemma 15200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `-`
- 词库 gloss：form「莫拉莱斯（姓氏/人名）」 / lemma「士气；斗志」
- ECDICT：form「[人名] 莫拉莱斯; [地名] [厄瓜多尔、哥伦比亚、美国、墨西哥、西班牙] 莫拉莱斯」 / lemma「n. 士气, 道德」
- **建议：`keep`**

## esteemed → esteem
- rank：form 11249 / lemma 13092 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「受尊敬的」 / lemma「尊重；敬重」
- ECDICT：form「a. 受人尊敬的」 / lemma「n. 尊敬, 尊重 vt. 尊敬, 尊重, 认为」
- **建议：`keep`**

## testifying → testify
- rank：form 11257 / lemma 12000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「作证；证明」 / lemma「作证；证明」
- ECDICT：form「v. 作证, 证明( testify的现在分词 ); 证明, 证实」 / lemma「v. 证明, 作证, 声明, 表明」
- **建议：`keep`**

## continents → continent
- rank：form 11279 / lemma 16000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「大洲（复数）」 / lemma「自制的，节欲的」
- ECDICT：form「n. 洲, 大陆( continent的复数形式 ); 欧洲大陆（不包括英国和爱尔兰）」 / lemma「n. 大陆, 洲 a. 自制的」
- **建议：`keep`**

## trans → tran
- rank：form 11290 / lemma 26153 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「跨性别的；反式的」 / lemma「（人名）陈/特兰」
- ECDICT：form「[电] transimitter的简写」 / lemma「n. (Tran)人名；(柬)德兰」
- **建议：`keep`**

## fulfilling → fulfil
- rank：form 11305 / lemma 12179 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人满足的；实现的」 / lemma「履行；实现」
- ECDICT：form「a. 能实现个人抱负的；令人高兴的；令人满意的」 / lemma「vt. 实践, 履行, 实行, 完成, 结束, 满足 [经] 履行(契约), 满期」
- **建议：`keep`**

## fulfilling → fulfill
- rank：form 11305 / lemma 4654 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人满足的；实现的」 / lemma「履行；实现」
- ECDICT：form「a. 能实现个人抱负的；令人高兴的；令人满意的」 / lemma「vt. 实践, 履行, 实行, 完成, 结束, 满足 [法] 履行, 完成, 达到」
- **建议：`?`**

## daleks → dalek
- rank：form 11324 / lemma 14539 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「戴立克（科幻剧外星生物）」 / lemma「戴立克（科幻角色）」
- ECDICT：form「(Dalek 的复数) n.& adj.(英国广播公司科学幻想电视节目中机器人)戴立克(的)」 / lemma「n. & adj.(英国广播公司科学幻想电视节目中机器人)戴立克(的)」
- **建议：`keep`**

## aroused → arouse
- rank：form 11325 / lemma 15373 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「唤起；激起；唤醒」 / lemma「唤起；激起；唤醒」
- ECDICT：form「唤醒」 / lemma「vt. 唤醒, 鼓励, 引起 vi. 醒来」
- **建议：`keep`**

## emergencies → emergency
- rank：form 11329 / lemma 13500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「紧急情况（复数）」 / lemma「紧急情况；突发事件」
- ECDICT：form「n. 紧急需要；紧急事件」 / lemma「n. 紧急状况, 紧急事件, 紧急需要 [化] 紧急情况」
- **建议：`keep`**

## neighs → neigh
- rank：form 11345 / lemma 29647 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（马）嘶鸣」 / lemma「（马）嘶鸣」
- ECDICT：form「n. 马嘶声( neigh的名词复数 )」 / lemma「n. 马嘶声 vi. 马嘶」
- **建议：`keep`**

## seagulls → seagull
- rank：form 11355 / lemma 14879 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「海鸥（复数）」 / lemma「海鸥」
- ECDICT：form「n. 海鸥( seagull的复数形式 )」 / lemma「n. 鸥」
- **建议：`keep`**

## foundations → foundation
- rank：form 11367 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「地基；基础（复数）」 / lemma「基础；地基；基金会」
- ECDICT：form「n. 地基」 / lemma「n. 基础, 根据, 建立 [化] 地基」
- **建议：`keep`**

## assassinated → assassinate
- rank：form 11404 / lemma 11678 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暗杀（assassinate的过去式）」 / lemma「暗杀；行刺」
- ECDICT：form「vt. 暗杀；行刺」 / lemma「vt. 暗杀, 行刺 [法] 暗杀, 行刺, 中伤」
- **建议：`keep`**

## volunteering → volunteer
- rank：form 11424 / lemma 14000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「自愿做；志愿服务」 / lemma「志愿者；自愿做」
- ECDICT：form「v. 自动提供, 自愿效劳( volunteer的现在分词 ); 主动建议（或告诉）; （未经当事人同意）举荐; 自愿参…」 / lemma「n. 志愿者 a. 志愿的 v. 自愿」
- **建议：`keep`**

## spooked → spook
- rank：form 11426 / lemma 12427 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「吓唬；受惊（过去式）」 / lemma「鬼；幽灵；使惊恐」
- ECDICT：form「v. 吓, 吓唬( spook的过去式和过去分词 )」 / lemma「n. 幽灵, 鬼 vt. 惊吓, 鬼怪般地出没 vi. 惊吓而逃窜, 受惊」
- **建议：`keep`**

## weakened → weaken
- rank：form 11429 / lemma 13420 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「削弱（weaken的过去式）」 / lemma「削弱；变弱」
- ECDICT：form「a. 虚弱的 v. （使）削弱, （使）变弱( weaken的过去式和过去分词 )」 / lemma「vt. 削弱, 减弱, 使虚弱 vi. 变弱, 变软弱」
- **建议：`keep`**

## conflicts → conflict
- rank：form 11454 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「冲突；矛盾（复数）」 / lemma「冲突；抵触」
- ECDICT：form「n. 冲突( conflict的名词复数 ); 战斗; 相互干扰; 矛盾」 / lemma「n. 战斗, 冲突, 矛盾, 争执 vi. 争执, 战斗, 冲突, 抵触 [计] 冲突」
- **建议：`keep`**

## interrogated → interrogate
- rank：form 11460 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「审问；盘问（过去式）」 / lemma「审问，盘问」
- ECDICT：form「v. 询问( interrogate的过去式和过去分词 ); 审问; （在计算机或其他机器上）查询」 / lemma「vt. 质问, 讯问, 审问 vi. 质问, 讯问」
- **建议：`keep`**

## jacked → jack
- rank：form 11468 / lemma 425 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「肌肉发达的；被劫持的」 / lemma「杰克（人名）；千斤顶」
- ECDICT：form「v. 抬高（价格等）；用千斤顶顶起（jack的过去分词）」 / lemma「n. 插座, 千斤顶, 男人 vt. 抬起, 提醒, 扛举, 增加, 提高, 放弃 a. 雄的 [计] 插座」
- **建议：`keep`**

## overrated → overrate
- rank：form 11506 / lemma 15100 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「评价过高的」 / lemma「高估，评价过高」
- ECDICT：form「v. 对（质量、能力等）估价过高( overrate的过去式和过去分词 )」 / lemma「vt. 评价过高, 高估, 估价过高 [经] 对...估价过高, 高估」
- **建议：`keep`**

## manipulating → manipulate
- rank：form 11527 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「操纵；控制」 / lemma「操纵，操作；篡改」
- ECDICT：form「[计] 手动」 / lemma「vt. 操纵, 利用, 操作, 巧妙地处理, 假造」
- **建议：`keep`**

## in-laws → in-law
- rank：form 11542 / lemma 20631 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「姻亲」 / lemma「姻亲」
- ECDICT：form「n. 姻亲」 / lemma「n. 姻亲」
- **建议：`keep`**

## catholics → catholic
- rank：form 11549 / lemma 13800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「天主教徒」 / lemma「普遍的，广泛的；天主教的」
- ECDICT：form「n. 天主教徒（Catholic的复数形式）」 / lemma「n. 天主教徒 a. 天主教的, 普遍的, 广泛的, 宽宏大量的」
- **建议：`keep`**

## sandals → sandal
- rank：form 11558 / lemma 23013 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「凉鞋」 / lemma「凉鞋；拖鞋」
- ECDICT：form「n. 凉鞋；便鞋；拖鞋（sandal的复数）」 / lemma「n. 凉鞋, 拖鞋, 檀香木 vt. 穿以便鞋」
- **建议：`keep`**

## dodgers → dodger
- rank：form 11586 / lemma 14048 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「道奇队；躲避者」 / lemma「躲避者；躲闪者」
- ECDICT：form「n. 躲闪者, 欺瞒者( dodger的复数形式 )」 / lemma「n. 躲闪者, 用诡计逃脱者, 蒙骗者, 推托者 [法] 推托者, 规避者, 用诡计蒙骗者」
- **建议：`keep`**

## meddling → meddle
- rank：form 11590 / lemma 11765 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「干涉；管闲事」 / lemma「干涉；管闲事」
- ECDICT：form「n. 干预；瞎管」 / lemma「vi. 干涉, 干预, 擅自摸弄 [法] 干预, 插手, 弄乱」
- **建议：`keep`**

## perks → perk
- rank：form 11609 / lemma 16216 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「额外待遇；福利」 / lemma「额外待遇；好处」
- ECDICT：form「n. 特权；额外津贴（perk的复数）；特别待遇 n. (Perks)人名；(英)珀克斯；(法)佩尔克 v. 打扮；使振…」 / lemma「vi. 昂首, 振作, 举止高傲, 神气活现, 滤煮 vt. 竖起, 打扮, 使振作, 滤煮 n. 小费」
- **建议：`keep`**

## toots → toot
- rank：form 11628 / lemma 12570 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘟嘟声；短促响声」 / lemma「（喇叭）嘟嘟响」
- ECDICT：form「n. 亲密的人」 / lemma「n. 嘟嘟声, 作乐 vi. 吹喇叭 vt. 吹奏出」
- **建议：`keep`**

## aches → ach
- rank：form 11644 / lemma 16111 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent, homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「疼痛（复数）」 / lemma「啊（表示懊恼）」
- ECDICT：form「n. 疼痛( ache的名词复数 ) v. 渴望( ache的第三人称单数 )」 / lemma「[计] 自动化票证交换所 [医] 肾上腺皮质激素」
- **建议：`keep`**

## aches → ache
- rank：form 11644 / lemma 6336 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疼痛（复数）」 / lemma「疼痛」
- ECDICT：form「n. 疼痛( ache的名词复数 ) v. 渴望( ache的第三人称单数 )」 / lemma「n. 疼痛 vi. 痛, 哀怜, 渴望」
- **建议：`?`**

## invading → invade
- rank：form 11653 / lemma 12100 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「入侵；侵犯」 / lemma「侵入，侵略」
- ECDICT：form「v. 侵入, 侵略( invade的现在分词 ); 涌入; 侵袭; 侵犯」 / lemma「vt. 侵入, 拥入, 侵略, 侵袭 [法] 强入, 侵犯, 侵略」
- **建议：`keep`**

## consists → consist
- rank：form 11674 / lemma 21786 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「由……组成」 / lemma「由…组成；在于」
- ECDICT：form「v. 由…组成( consist的第三人称单数 ); 包括; 存在于; 表现为（常与 in 连用）」 / lemma「vi. 组成, 存在于, 一致」
- **建议：`keep`**

## staggering → stagger
- rank：form 11681 / lemma 25030 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「惊人的；令人震惊的」 / lemma「蹒跚；摇晃；使震惊」
- ECDICT：form「a. 蹒跚的, 巨大的, 惊人的 [电] 参差」 / lemma「n. 蹒跚, 踌躇 vi. 蹒跚, 犹豫 vt. 使摇摆, 使踌躇, 交错, 错开 a. 交错的, 错开的」
- **建议：`keep`**

## murmurs → murmur
- rank：form 11683 / lemma 13959 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「低语；喃喃声（复数）」 / lemma「低语；喃喃」
- ECDICT：form「n. 低沉、连续而不清的声音( murmur的名词复数 ); 低语声; 怨言; 嘀咕」 / lemma「n. 低语, 低声的怨言 vi. 低语, 低声而言 vt. 低声说」
- **建议：`keep`**

## wronged → wrong
- rank：form 11708 / lemma 1360 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「冤枉；不公正对待」 / lemma「错误的；不合适的」
- ECDICT：form「a. 被委屈, 被伤害, 被错怪 v. 不公正（或不诚实）对待, 冤枉( wrong的过去式和过去分词 )」 / lemma「a. 错误的, 不正当的, 失常的 adv. 错误地」
- **建议：`?`**

## cremated → cremate
- rank：form 11711 / lemma 23854 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「火化（过去式）」 / lemma「火化；焚化」
- ECDICT：form「v. 火葬, 火化（尸体）( cremate的过去式和过去分词 )」 / lemma「vt. 烧成灰, 火葬」
- **建议：`keep`**

## inventions → invention
- rank：form 11720 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「发明；发明物（复数）」 / lemma「发明，创造」
- ECDICT：form「n. 发明( invention的复数形式 ); 捏造; 创造力; 发明物」 / lemma「n. 发明, 创作能力, 虚构的故事 [经] 发明」
- **建议：`keep`**

## kingdoms → kingdom
- rank：form 11724 / lemma 12100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「王国（复数）」 / lemma「王国；领域」
- ECDICT：form「n. 王国( kingdom的复数形式 ); 界; 领域」 / lemma「n. 王国, 领域 [医] 界(动物,植物,矿物)」
- **建议：`keep`**

## baptized → baptize
- rank：form 11736 / lemma 17290 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「给…施洗礼」 / lemma「给…施洗礼」
- ECDICT：form「a. 受洗礼的 v. 施洗礼；使经受考验；给…名称（baptize的过去分词）」 / lemma「vt. 施洗礼, 使经受考验, 命名」
- **建议：`keep`**

## hooves → hoof
- rank：form 11737 / lemma 14552 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蹄（复数）」 / lemma「蹄」
- ECDICT：form「n. 蹄脚；蹄（hoof的复数）」 / lemma「n. 蹄, (人的)脚 vt. 以蹄踢, 行走, 步行 vi. 走, 踢, 踏」
- **建议：`keep`**

## markings → marking
- rank：form 11748 / lemma 11782 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「标记；斑纹（复数）」 / lemma「标记；斑纹」
- ECDICT：form「n. 成交量和价格记录」 / lemma「n. 印记, 印, 分 [计] 标志」
- **建议：`keep`**

## dibs → dib
- rank：form 11752 / lemma 32730 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「优先权；认领」 / lemma「（口语）抢先；占」
- ECDICT：form「n. 筹码, (非正式)钱, (非正式)要求, 保留权, 权利」 / lemma「vi. 将饵在水面轻轻地上下拉动 [计] 数据输入总线」
- **建议：`keep`**

## acquitted → acquit
- rank：form 11763 / lemma 25757 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「宣判无罪；开释」 / lemma「宣判无罪；表现」
- ECDICT：form「v. 释放（acquit的过去分词） a. 无罪；无罪开释」 / lemma「vt. 无罪释放, 表现, 使履行 [法] 开释, 释放, 免」
- **建议：`keep`**

## frigging → frig
- rank：form 11773 / lemma 28271 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「该死的（委婉脏话）」 / lemma「（粗）胡搞；性交」
- ECDICT：form「a. 受诅咒的, 可恨的, 要命的」 / lemma「n. 冰箱 v. 与(女子)发生性行为」
- **建议：`keep`**

## scots → scot
- rank：form 11814 / lemma 19442 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「苏格兰的；苏格兰人」 / lemma「苏格兰人」
- ECDICT：form「a. 苏格兰的, 苏格兰式的」 / lemma「n. 摊派的款项, 税赋 [化] 涂载体空心柱」
- **建议：`keep`**

## phenomena → phenomenon
- rank：form 11844 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「现象（复数）」 / lemma「现象」
- ECDICT：form「pl. 现象」 / lemma「n. 现象, 迹象, 表现, 奇迹, 奇才 [化] 现象」
- **建议：`keep`**

## contributed → contribute
- rank：form 11848 / lemma 12000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「贡献；捐助（过去式）」 / lemma「贡献；捐赠；投稿」
- ECDICT：form「a. 已缴入的；贡献的, 分配的」 / lemma「vt. 有助于, 捐助, 投稿 vi. 出力, 捐献, 投稿」
- **建议：`keep`**

## dialed → dial
- rank：form 11860 / lemma 3836 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「拨号（过去式）」 / lemma「表盘；拨号」
- ECDICT：form「v. 打电话, 拨电话号码( dial的过去式和过去分词 )」 / lemma「n. 刻度盘, 钟面, 转盘 v. 拨」
- **建议：`?`**

## hallucinating → hallucinate
- rank：form 11863 / lemma 27858 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「产生幻觉」 / lemma「产生幻觉」
- ECDICT：form「v. 使产生幻觉( hallucinate的现在分词 )」 / lemma「vt. 使产生幻觉」
- **建议：`keep`**

## digits → digit
- rank：form 11870 / lemma 24198 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「数字；手指/脚趾」 / lemma「数字；手指」
- ECDICT：form「n. 数字；手指；足趾（digit的复数）」 / lemma「n. 数字, 位数, 指头 [计] 数位; 位」
- **建议：`keep`**

## myers → myer
- rank：form 11871 / lemma 43363 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent, suspect-target`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「迈尔斯（人名）」 / lemma「迈尔（人名/品牌）」
- ECDICT：form「n. 迈尔斯（姓氏）」 / lemma「n. 玛雅（澳大利亚一百货公司名）；迈尔（姓氏）」
- **建议：`keep`**

## implications → implication
- rank：form 11886 / lemma 12400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「影响；含义；牵连」 / lemma「含义，牵连；暗示」
- ECDICT：form「n. 蕴涵式；卷入（implication的复数）」 / lemma「n. 牵连, 含义, 暗示 [法] 推断, 含蓄之意, 暗示」
- **建议：`keep`**

## scallops → scallop
- rank：form 11889 / lemma 21773 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「扇贝；干贝」 / lemma「扇贝；扇贝肉」
- ECDICT：form「n. 扇贝( scallop的名词复数 ); 扇形皱褶; 扇形饰边; 扇贝壳」 / lemma「n. 扇贝 vt. 用扇贝状碟烘烤 vi. 拾扇贝」
- **建议：`keep`**

## vibrations → vibration
- rank：form 11890 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「振动；颤动；共鸣」 / lemma「振动，颤动；共鸣」
- ECDICT：form「n. 摆动( vibration的复数形式 ); 震动; 感受; （偏离平衡位置的）一次性往复振动」 / lemma「n. 振动, 颤动 [化] 振动」
- **建议：`keep`**

## scripts → script
- rank：form 11905 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「剧本；手稿；脚本」 / lemma「剧本；手迹；文字」
- ECDICT：form「n. 原稿, 手稿（script的复数形式）」 / lemma「n. 手迹, 手稿, 正本, 手写体 vt. 改编为演出本 [计] 手写体, 小型程序」
- **建议：`keep`**

## lukas → luka
- rank：form 11919 / lemma 13477 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「卢卡斯（男子名）」 / lemma「卢卡（人名）」
- ECDICT：form「(Luka 的复数) n. (Luka)人名；(法)吕卡；(德、俄、罗、匈、塞、捷、图瓦)卢卡」 / lemma「n. (Luka)人名；(法)吕卡；(德、俄、罗、匈、塞、捷、图瓦)卢卡」
- **建议：`keep`**

## perverted → pervert
- rank：form 11922 / lemma 15400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「变态的；歪曲的；反常的」 / lemma「使堕落；曲解，歪曲」
- ECDICT：form「a. 堕落的, 歪曲的, 行为反常的, 性变态的」 / lemma「vt. 使堕落, 使反常, 歪曲, 滥用, 使左右颠倒, 唆使...性变态 n. 堕落者, 行为反常者, 背教者, 性欲…」
- **建议：`keep`**

## dazzling → dazzle
- rank：form 11924 / lemma 16038 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「耀眼的；令人眼花缭乱的」 / lemma「使眼花；使赞叹」
- ECDICT：form「a. 眼花缭乱的, 耀眼的」 / lemma「v. (使)眼花, 炫耀 n. 耀眼」
- **建议：`keep`**

## capabilities → capability
- rank：form 11928 / lemma 12905 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「能力；才能；性能」 / lemma「能力；才能」
- ECDICT：form「n. 能力( capability的名词复数 ); 可能; 容量; [复数]潜在能力」 / lemma「n. 能力, 性能, 约束力 [化] 能力」
- **建议：`keep`**

## grumbling → grumble
- rank：form 11931 / lemma 23365 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抱怨；发牢骚；咕哝」 / lemma「抱怨；咕哝」
- ECDICT：form「a. 出怨言的；喃喃鸣不平的」 / lemma「n. 怨言, 满腹牢骚 vi. 抱怨, 发牢骚, 发隆隆声 vt. 抱怨」
- **建议：`keep`**

## specs → spec
- rank：form 11938 / lemma 18375 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「眼镜；规格；说明书（复数）」 / lemma「规格；说明书；投机」
- ECDICT：form「n. 眼镜, 规格, 说明书」 / lemma「n. 投机, 投机事业, 规格, 说明书, 专业人员 [化] 加工单」
- **建议：`keep`**

## petals → petal
- rank：form 11944 / lemma 14000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「花瓣（复数）」 / lemma「花瓣」
- ECDICT：form「n. 花瓣；翼瓣（petal的复数形式）」 / lemma「n. 花瓣 [医] 花瓣」
- **建议：`keep`**

## battered → batter
- rank：form 11947 / lemma 8156 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「破旧的；受虐待的； battered 面糊的」 / lemma「面糊；击球手」
- ECDICT：form「a. 磨损的；弄垮的；破旧的；受到虐待的」 / lemma「v. 连续猛打（尤其指妇女），猛击 n. 面糊（食物），击球员，打击手」
- **建议：`?`**

## withdrew → withdraw
- rank：form 11948 / lemma 12000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「撤回；退出；取款（withdraw 过去式）」 / lemma「撤回，提取，退出」
- ECDICT：form「withdraw的过去式」 / lemma「vt. 撤回, 取回, 撤消, 使撤退, 拉开, 移开 vi. 撤退, 离开」
- **建议：`keep`**

## senators → senator
- rank：form 11955 / lemma 12300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「参议员（复数）」 / lemma「参议员」
- ECDICT：form「n. 参议员( senator的复数形式 )」 / lemma「n. 参议员, (某些大学的)理事 [法] 参议员, 上议员」
- **建议：`keep`**

## saturdays → saturday
- rank：form 11956 / lemma 1245 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「星期六（复数）」 / lemma「星期六」
- ECDICT：form「adv. 每星期六, 在任何星期六」 / lemma「n. 星期六」
- **建议：`keep`**

## clucking → cluck
- rank：form 11966 / lemma 17337 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咯咯叫；咂嘴」 / lemma「咯咯叫；咂嘴」
- ECDICT：form「v. （母鸡）咯咯声( cluck的现在分词 ); <俚>傻瓜, 笨蛋」 / lemma「n. 咯咯的叫声 v. 咯咯叫」
- **建议：`keep`**

## slurping → slurp
- rank：form 11995 / lemma 26196 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「出声地喝；咕嘟地吃」 / lemma「出声地喝；咕噜」
- ECDICT：form「v. 啜食( slurp的现在分词 )」 / lemma「n. 吃的声音 v. 出声地吃(或喝)」
- **建议：`keep`**

## concerned → concern
- rank：form 12000 / lemma 12100 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「担忧的；有关的」 / lemma「涉及；关心；忧虑」
- ECDICT：form「a. 关心的, 有关的, 参与的, 担心的」 / lemma「n. 关心, 忧虑 vt. 与...有关, 使担心, 使挂念」
- **建议：`keep`**

## dormitories → dormitory
- rank：form 12000 / lemma 15800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「宿舍（复数）」 / lemma「宿舍，寄宿楼」
- ECDICT：form「n. 集体宿舍( dormitory的名词复数 )」 / lemma「n. 宿舍」
- **建议：`keep`**

## milligrams → milligram
- rank：form 12000 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「毫克」 / lemma「毫克（千分之一克）」
- ECDICT：form「n. 毫克（千分之一克）( milligram的复数形式 )」 / lemma「n. 毫克 [电] 毫克」
- **建议：`keep`**

## privileged → privilege
- rank：form 12000 / lemma 12400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「享有特权的」 / lemma「特权；优待」
- ECDICT：form「a. 有特权的, 有特别恩典的 [法] 特许的, 有特权的」 / lemma「n. 特权, 特别恩典, 基本权利, 特免 vt. 给与...特权, 特免」
- **建议：`keep`**

## irritated → irritate
- rank：form 12001 / lemma 16285 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恼怒的；发炎的」 / lemma「激怒；刺激」
- ECDICT：form「a. 被激怒的, 生了气的, 变粗的, 因刺激而发炎的, 发红的」 / lemma「vt. 激怒, 使发怒, 使兴奋, 使发炎 vi. 引起不快」
- **建议：`keep`**

## hijacked → hijack
- rank：form 12005 / lemma 16260 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「劫持；劫机」 / lemma「劫持；劫机」
- ECDICT：form「v. 劫持( hijack的过去式和过去分词 ); 绑架; 拦路抢劫; 操纵（会议等, 以推销自己的意图）」 / lemma「vt. 抢劫, 劫持, 敲诈 [法] 挡路抢劫, 抢劫, 绑架」
- **建议：`keep`**

## soothing → soothe
- rank：form 12011 / lemma 15839 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抚慰的；使人平静的」 / lemma「安慰；缓和」
- ECDICT：form「a. 抚慰的, 使人宽心的 [医] 缓解的, 安抚的」 / lemma「vt. 缓和, 使安静, 安慰, 奉承 vi. 起安慰作用」
- **建议：`keep`**

## achilles → achille
- rank：form 12015 / lemma 33029 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「阿喀琉斯（希腊神话英雄）」 / lemma「（人名）阿基尔」
- ECDICT：form「n. 阿喀琉斯(希腊神话人物)」 / lemma「n. 阿喀琉斯（荷马史诗《伊利亚特》中的英雄）」
- **建议：`keep`**

## coupons → coupon
- rank：form 12025 / lemma 12495 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「优惠券；赠券」 / lemma「优惠券；赠券」
- ECDICT：form「n. 优惠券；息票；[冶金]取样片（coupon的复数）」 / lemma「n. 息票, 赠券 [经] 息票, 利息单, 联票」
- **建议：`keep`**

## silenced → silence
- rank：form 12035 / lemma 12100 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「使沉默；压制」 / lemma「沉默，寂静」
- ECDICT：form「v. 使安静( silence的过去式和过去分词 ); 使沉默; 压制; （用以让人们安静）安静」 / lemma「n. 沉默, 无声, 静寂, 湮没, 无声息 vt. 使缄默 interj. 安静」
- **建议：`keep`**

## koreans → korean
- rank：form 12060 / lemma 3255 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「韩国人；朝鲜人（复数）」 / lemma「韩国的；朝鲜的」
- ECDICT：form「n. 朝鲜人, 朝鲜国民( Korean的复数形式 ); 朝鲜语」 / lemma「n. 朝鲜人, 朝鲜语 a. 朝鲜人的, 朝鲜语的」
- **建议：`keep`**

## hovering → hover
- rank：form 12069 / lemma 15438 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「盘旋；徘徊」 / lemma「盘旋；徘徊」
- ECDICT：form「n. 停悬；空中悬停」 / lemma「vi. 盘旋, 翱翔, 徘徊 vt. 孵 n. 翱翔」
- **建议：`keep`**

## emerging → emerge
- rank：form 12075 / lemma 13000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「出现；兴起」 / lemma「浮现，显露」
- ECDICT：form「[法] 出现的, 发生的, 形成的」 / lemma「vi. 浮现, 形成, 出现, (事实)显露」
- **建议：`keep`**

## hoops → hoop
- rank：form 12091 / lemma 12792 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「箍；篮圈（复数）」 / lemma「箍；环；篮圈」
- ECDICT：form「n. 箍( hoop的名词复数 ); （篮球）篮圈; （旧时儿童玩的）大环子; （两端埋在地里的）小铁弓」 / lemma「n. 箍, 铁环, 呼呼声 vt. 加箍于, 包围 vi. 发呼呼声」
- **建议：`keep`**

## proposals → proposal
- rank：form 12096 / lemma 12350 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「提议；求婚（复数）」 / lemma「提议；求婚」
- ECDICT：form「n. 提议( proposal的复数形式 ); 推荐; 求婚; 赞成提案」 / lemma「n. 提议, 计划, 求婚 [经] 提案, 申请, 投标」
- **建议：`keep`**

## scissors → scissor
- rank：form 12100 / lemma 22279 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「剪刀」 / lemma「剪；用剪刀剪」
- ECDICT：form「pl. 剪刀 [医] 剪」 / lemma「vt. 剪, 剪取, 删除, 削减 n. 剪刀」
- **建议：`keep`**

## revolting → revolt
- rank：form 12103 / lemma 13500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人反感的；恶心的」 / lemma「反抗，起义；使反感」
- ECDICT：form「a. 背叛的, 叛乱的, 厌恶的」 / lemma「n. 叛乱, 反抗, 反感 vi. 叛乱, 反抗, 起义, 厌恶, 反感 vt. 使反感, 使恶心」
- **建议：`keep`**

## displayed → display
- rank：form 12112 / lemma 13000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「展示；显示（过去式）」 / lemma「展示，显露出」
- ECDICT：form「a. 显示的」 / lemma「n. 显示, 陈列, 炫耀, 显示器 vt. 陈列, 显示, 表现, 夸示 [计] 显示器; 显示」
- **建议：`keep`**

## enlightened → enlighten
- rank：form 12117 / lemma 11084 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开明的；受启发的」 / lemma「启发；开导」
- ECDICT：form「a. 有知识的, 进步的, 文明的」 / lemma「vt. 教育, 启发, 启蒙, 开导, 教导」
- **建议：`?`**

## tampered → tamper
- rank：form 12124 / lemma 21268 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「篡改；干预」 / lemma「篡改；擅自改动」
- ECDICT：form「v. 窜改( tamper的过去式 ); 篡改; （用不正当手段）影响; 瞎摆弄」 / lemma「vi. 干预, 拨弄, 贿赂, 损害, 篡改 vt. 篡改 n. 捣棒, 打夯机, 填塞者」
- **建议：`keep`**

## drenched → drench
- rank：form 12141 / lemma 36010 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「湿透的」 / lemma「使湿透；浸透」
- ECDICT：form「a. 湿透的; 充满的 v. 使湿透( drench的过去式和过去分词 ); 在某人（某物）上大量使用（某液体）」 / lemma「vt. 使湿透, 使充满 n. 滂沱大雨, 弄湿」
- **建议：`keep`**

## sightings → sighting
- rank：form 12143 / lemma 12213 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「目击；发现」 / lemma「看见；目击」
- ECDICT：form「n. 照准, 观察, 视线( sighting的复数形式 )」 / lemma「n. 照准；瞄准；视线」
- **建议：`keep`**

## brethren → brother
- rank：form 12155 / lemma 213 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「弟兄们；教友」 / lemma「兄弟；哥哥；弟弟」
- ECDICT：form「n. 弟兄们, 教友们」 / lemma「n. 兄弟」
- **建议：`?`**

## contracted → contract
- rank：form 12157 / lemma 12200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「感染；订约」 / lemma「合同；收缩；感染」
- ECDICT：form「a. 收缩了的, 已定约的, 契约的」 / lemma「n. 合约, 婚约, 契约 vt. 使皱缩, 使缩短, 感染, 订约, 缔结 vi. 皱缩, 订约, 收缩」
- **建议：`keep`**

## painters → painter
- rank：form 12159 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「画家；油漆工」 / lemma「画家；油漆匠」
- ECDICT：form「n. 画家( painter的复数形式 ); 油漆匠; （系船的）缆绳」 / lemma「n. 画家, 油漆匠 [机] 油漆匠, 喷漆匠」
- **建议：`keep`**

## cosmetics → cosmetic
- rank：form 12162 / lemma 14537 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「化妆品」 / lemma「化妆的；表面的」
- ECDICT：form「n. 装饰品；化妆品（cosmetic的复数）」 / lemma「n. 化妆品 a. 化妆用的」
- **建议：`keep`**

## excluded → exclude
- rank：form 12183 / lemma 14780 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「排除；不包括」 / lemma「排除；不包括」
- ECDICT：form「v. 排除, 不包括在内( exclude的过去式和过去分词 )」 / lemma「vt. 除外, 排除, 排斥 [医] 除外(诊断)」
- **建议：`keep`**

## terrified → terrify
- rank：form 12200 / lemma 13800 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「极度恐惧的；受惊的」 / lemma「使恐惧，吓唬」
- ECDICT：form「a. 受惊吓的；感到恐惧的」 / lemma「vt. 使恐惧, 恐吓」
- **建议：`keep`**

## europeans → european
- rank：form 12238 / lemma 3298 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「欧洲人（复数）」 / lemma「欧洲的」
- ECDICT：form「n. 欧洲人( European的复数形式 )」 / lemma「n. 欧洲人 a. 欧洲的, 欧洲人的」
- **建议：`keep`**

## curves → curve
- rank：form 12256 / lemma 13400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「曲线；弯道（复数）」 / lemma「曲线」
- ECDICT：form「n. 曲线；弯曲状（curve的复数形式）」 / lemma「n. 曲线, 弯曲, 曲线球 vt. 弯, 使弯曲 vi. 成曲形」
- **建议：`keep`**

## outlaws → outlaw
- rank：form 12275 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「不法之徒（复数）」 / lemma「被剥夺法律保护者；逃犯」
- ECDICT：form「n. 歹徒, 亡命之徒( outlaw的名词复数 ); 逃犯」 / lemma「n. 被剥夺法律保护的人, 罪犯 vt. 使...失去法律保护, 将...逐出社会, 宣告非法, 取缔」
- **建议：`keep`**

## mercenaries → mercenary
- rank：form 12280 / lemma 14900 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「雇佣兵（复数）」 / lemma「唯利是图的；雇佣的」
- ECDICT：form「n. 雇用的, 为钱的, 唯利是图的( mercenary的名词复数 ); 雇用地, 唯利是图地」 / lemma「n. 唯利是图者, 雇佣兵 a. 为钱而工作的, 被雇的, 图利的」
- **建议：`keep`**

## certificates → certificate
- rank：form 12284 / lemma 13000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「证书；证明书」 / lemma「证书；证明书」
- ECDICT：form「n. 证明书, 执照( certificate的名词复数 )」 / lemma「n. 证书, 证明书 vt. 发给证明书, 用证书批准, 用证书证明」
- **建议：`keep`**

## qualifications → qualification
- rank：form 12288 / lemma 21069 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「资格；资历」 / lemma「资格；条件；限定」
- ECDICT：form「n. 职位要求；任职资格；资格证书；限定性条件（qualification的复数形式）」 / lemma「n. 资格, 条件, 限制 [计] 限定」
- **建议：`keep`**

## incorporated → incorporate
- rank：form 12293 / lemma 12500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「股份有限的；合并的」 / lemma「包含；合并，并入」
- ECDICT：form「a. 根据法律组成的公司, 公司 [法] 组成法人组织的, 法人的, 合并的」 / lemma「a. 合并的, 组成公司的, 一体化的 vt. 吸收, 合并, 使组成公司, 体现 vi. 合并, 混合, 组成公司」
- **建议：`keep`**

## prolonged → prolong
- rank：form 12300 / lemma 13000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「延长的，持久的」 / lemma「延长，拖延」
- ECDICT：form「a. 延续的, 长时间的」 / lemma「vt. 延长, 拖延, 拖长 [化] 冷凝管」
- **建议：`keep`**

## trembling → tremble
- rank：form 12300 / lemma 13500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「颤抖的，战栗的」 / lemma「颤抖；发抖」
- ECDICT：form「a. 发抖的, 战栗的 [医] 震颤, 震动」 / lemma「n. 战栗, 颤抖 vi. 战栗, 忧虑, 摇晃」
- **建议：`keep`**

## astronomers → astronomer
- rank：form 12301 / lemma 12500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「天文学家」 / lemma「天文学家」
- ECDICT：form「n. 天文学者, 天文学家( astronomer的复数形式 )」 / lemma「n. 天文学家」
- **建议：`keep`**

## jurors → juror
- rank：form 12316 / lemma 17800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「陪审员」 / lemma「陪审员」
- ECDICT：form「n. 陪审员, 陪审团成员( juror的复数形式 ); 审查委员」 / lemma「n. 陪审员, 审查委员 [法] 陪审员, 陪审官, 宣誓者」
- **建议：`keep`**

## operatives → operative
- rank：form 12334 / lemma 16000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「特工；操作人员」 / lemma「运作的；有效的」
- ECDICT：form「n. 工作人员( operative的复数形式 ); （尤指）体力劳动者; 密探; （尤指政府的）特工人员」 / lemma「a. 动作的, 运转的, 有效的, 关键的, 手术的 n. 技工, 侦探」
- **建议：`keep`**

## theorists → theorist
- rank：form 12341 / lemma 33886 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「理论家」 / lemma「理论家」
- ECDICT：form「n. 理论家( theorist的复数形式 )」 / lemma「n. 理论家, 理论工作者」
- **建议：`keep`**

## obligated → obligate
- rank：form 12361 / lemma 18000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「有义务的；感激的」 / lemma「使有义务，强迫」
- ECDICT：form「a. 有义务的; 必须的; 有责任的 v. 使负有责任或义务（ obligate的过去式和过去分词 ）」 / lemma「vt. 使负义务, 强使, 使感激, 施恩惠于 a. 有责任的, 必须的」
- **建议：`keep`**

## dispatched → dispatch
- rank：form 12365 / lemma 12900 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「派遣；发送；迅速处理」 / lemma「派遣；发送；迅速处理」
- ECDICT：form「v. （常指为了特殊原因或执行特殊任务而迅速地）派遣( dispatch的过去式和过去分词 ); 杀死; （迅速地）发出…」 / lemma「vt. 派遣 n. 派遣, 急件 [计] 调度」
- **建议：`keep`**

## devised → devise
- rank：form 12367 / lemma 18525 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「设计；发明；策划」 / lemma「设计；发明；策划」
- ECDICT：form「v. 想出( devise的过去式和过去分词 ); 计划; 设计; 发明」 / lemma「vt. 设计, 发明, 图谋, 遗赠给 n. 遗赠」
- **建议：`keep`**

## headlights → headlight
- rank：form 12368 / lemma 24305 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（汽车）前灯」 / lemma「前灯；车头灯」
- ECDICT：form「n. （汽车等）的前灯( headlight的复数形式 )」 / lemma「n. 前灯, 桅灯 [电] 车前灯」
- **建议：`keep`**

## donors → donor
- rank：form 12371 / lemma 14200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「捐赠者；捐献者」 / lemma「捐赠者，供者」
- ECDICT：form「n. 捐赠者( donor的复数形式 ); 献血者; 捐血者; 器官捐献者」 / lemma「n. 捐赠人 [化] 给体; 供体」
- **建议：`keep`**

## crucified → crucify
- rank：form 12372 / lemma 14672 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「钉死在十字架上；严惩」 / lemma「钉死在十字架；严惩」
- ECDICT：form「v. 把（某人）钉死在十字架上( crucify的过去式和过去分词 ); （尤指当众）折磨; 虐待; 迫害」 / lemma「vt. 十字架上钉死」
- **建议：`keep`**

## compelling → compel
- rank：form 12400 / lemma 15033 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「令人信服的；引人入胜的」 / lemma「强迫；迫使」
- ECDICT：form「a. 强制的, 强迫性的, 激发兴趣的」 / lemma「vt. 强迫, 迫使」
- **建议：`keep`**

## bleating → bleat
- rank：form 12423 / lemma 33395 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（羊）咩咩叫；哀声抱怨」 / lemma「咩咩叫；哀诉」
- ECDICT：form「v. （羊, 小牛）叫( bleat的现在分词 ); 哭诉; 发出羊叫似的声音; 轻声诉说」 / lemma「n. 羊的叫声 vi. 咩咩叫 vt. 以颤抖的声音说」
- **建议：`keep`**

## hinges → hinge
- rank：form 12430 / lemma 22620 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「铰链；关键；取决于」 / lemma「铰链；枢纽」
- ECDICT：form「n. 铰链( hinge的名词复数 )」 / lemma「n. 铰链, 关键, 枢纽 vt. 装铰链 vi. 靠铰链移动, 依...而转移」
- **建议：`keep`**

## restrictions → restriction
- rank：form 12435 / lemma 24106 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「限制；约束」 / lemma「限制；约束」
- ECDICT：form「n. 限制；限制条件（restriction的复数形式）」 / lemma「n. 限制, 限定, 约束 [计] 限定」
- **建议：`keep`**

## traits → trait
- rank：form 12438 / lemma 14635 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「特征；特性；品质」 / lemma「特征；特点」
- ECDICT：form「n. 特性, 特质, 性格（trait的复数）」 / lemma「n. 特征, 特性, 一笔, 少许」
- **建议：`keep`**

## drooling → drool
- rank：form 12443 / lemma 13346 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流口水；垂涎」 / lemma「流口水；垂涎」
- ECDICT：form「[医] 流涎」 / lemma「vi. 流口水, 淌, 胡说八道 vt. 从嘴淌下, 过分动感情地表示 n. 口水, 胡说」
- **建议：`keep`**

## grimes → grime
- rank：form 12454 / lemma 30671 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「格兰姆斯（姓氏）」 / lemma「污垢；灰尘」
- ECDICT：form「n. 格兰姆斯（广州电气公司名称）」 / lemma「n. 尘垢, 煤尘, 污点 vt. 使污秽, 使...弄脏」
- **建议：`keep`**

## mimics → mimic
- rank：form 12463 / lemma 14200 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「模仿；模仿者」 / lemma「模仿，模拟；n. 善于模仿的人」
- ECDICT：form「n. 模仿名人言行的娱乐演员, 滑稽剧演员( mimic的名词复数 ); 善于模仿的人或物 v. （尤指为了逗乐而）模仿…」 / lemma「a. 模仿的, 摹拟的 n. 效颦者, 模仿者, 小丑, 仿制品 vt. 模仿, 摹拟」
- **建议：`keep`**

## intestines → intestine
- rank：form 12478 / lemma 17391 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「肠；肠道」 / lemma「肠；肠道」
- ECDICT：form「n. 肠( intestine的名词复数 )」 / lemma「a. 内部的, 国内的 n. 肠」
- **建议：`keep`**

## curved → curve
- rank：form 12500 / lemma 13400 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「弯曲的」 / lemma「曲线」
- ECDICT：form「a. 弯曲的；弄弯的」 / lemma「n. 曲线, 弯曲, 曲线球 vt. 弯, 使弯曲 vi. 成曲形」
- **建议：`keep`**

## terrifying → terrify
- rank：form 12500 / lemma 13800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「可怕的；令人恐惧的」 / lemma「使恐惧，吓唬」
- ECDICT：form「a. 令人恐惧的；骇人的；极大的」 / lemma「vt. 使恐惧, 恐吓」
- **建议：`keep`**

## apprehended → apprehend
- rank：form 12502 / lemma 17100 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「逮捕；理解」 / lemma「逮捕；理解，领悟」
- ECDICT：form「vt. 理解；逮捕；忧虑 vi. 理解；担心」 / lemma「vt. 理解, 忧虑, 逮捕 vi. 担心, 理解」
- **建议：`keep`**

## fingertips → fingertip
- rank：form 12540 / lemma 43442 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指尖（fingertip的复数）」 / lemma「指尖」
- ECDICT：form「n. 指尖( fingertip的复数形式 ); 手头有某物随时可供应用」 / lemma「n. 指尖, 指套」
- **建议：`keep`**

## handcuffed → handcuff
- rank：form 12541 / lemma 15141 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给…戴上手铐」 / lemma「铐上手铐」
- ECDICT：form「v. 给…戴上手铐( handcuff的过去式和过去分词 ); 束缚…的手脚, 限制」 / lemma「vt. 给...戴上手铐 n. 手铐」
- **建议：`keep`**

## remarried → remarry
- rank：form 12555 / lemma 19916 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「再婚」 / lemma「再婚」
- ECDICT：form「v. 再婚( remarry的过去式和过去分词 ); 与某人复婚」 / lemma「v. (使)再婚」
- **建议：`keep`**

## buttocks → buttock
- rank：form 12572 / lemma 31777 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「臀部；屁股」 / lemma「臀部（一边）」
- ECDICT：form「n. 臀部」 / lemma「n. 半边臀部, 屁股, 船尾突出部 vt. 过背摔」
- **建议：`keep`**

## bellows → bellow
- rank：form 12579 / lemma 29788 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「风箱；怒吼声」 / lemma「怒吼；大声喊叫」
- ECDICT：form「n. 风箱 [化] 手风箱; 皮老虎; 波纹管」 / lemma「v. 怒吼」
- **建议：`keep`**

## archaeologists → archaeologist
- rank：form 12592 / lemma 14196 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「考古学家（复数）」 / lemma「考古学家」
- ECDICT：form「n. 考古学家( archaeologist的复数形式 )」 / lemma「n. 考古学家」
- **建议：`keep`**

## maggots → maggot
- rank：form 12595 / lemma 16273 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蛆（maggot的复数）」 / lemma「蛆；幼虫」
- ECDICT：form「n. 蛆虫（maggot的复数）」 / lemma「n. 狂想, 空想, 蛆 [医] 蛆」
- **建议：`keep`**

## discouraged → discourage
- rank：form 12610 / lemma 16112 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「气馁的；沮丧的」 / lemma「使气馁；劝阻」
- ECDICT：form「a. 气馁的」 / lemma「vt. 使气馁, 阻碍」
- **建议：`keep`**

## criteria → criterion
- rank：form 12614 / lemma 13200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「标准；准则（复数）」 / lemma「标准，准则」
- ECDICT：form「pl. 标准 [计] 条件」 / lemma「n. 标准, 准则, 规范 [化] 判据」
- **建议：`keep`**

## reptiles → reptile
- rank：form 12628 / lemma 14035 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「爬行动物（复数）」 / lemma「爬行动物」
- ECDICT：form「n. 爬行类；爬虫类；爬行动物（reptile的复数）」 / lemma「n. 爬行动物, 爬虫, 卑鄙的人 a. 爬行的, 爬虫类的, 卑鄙的」
- **建议：`keep`**

## uploaded → upload
- rank：form 12666 / lemma 11612 ｜ type `p` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上传」 / lemma「上传」
- ECDICT：form「v. 上传, 上载( upload的过去式和过去分词 )」 / lemma「[计] 上装, 加载, 储入」
- **建议：`keep`**

## scanned → scan
- rank：form 12685 / lemma 12900 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「扫描；浏览（过去式）」 / lemma「扫描；浏览」
- ECDICT：form「a. 已扫描的」 / lemma「n. 审视, 浏览, 扫描, 细查 vt. 细看, 浏览, 扫描, 详细调查, 标出格律 vi. 押韵, 扫描 [计] …」
- **建议：`keep`**

## whiskers → whisker
- rank：form 12686 / lemma 35842 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「胡须；腮须」 / lemma「胡须；一丝之差」
- ECDICT：form「n. 腮须, 胡须 [化] 晶须」 / lemma「n. 腮须, 胡须, 一丝儿 [化] 晶须」
- **建议：`keep`**

## extraterrestrials → extraterrestrial
- rank：form 12701 / lemma 13500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「外星人（复数）」 / lemma「地球外的，外星的」
- ECDICT：form「n. 外星人( extraterrestrial的复数形式 )」 / lemma「a. 地球外的, 地球大气圈外的」
- **建议：`keep`**

## junkies → junky
- rank：form 12726 / lemma 35262 ｜ type `s3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「瘾君子（复数）；狂热者」 / lemma「吸毒者；瘾君子」
- ECDICT：form「n. 吸海洛因的成瘾者( junkie的复数形式 ); 吸毒者( junky的复数形式 )」 / lemma「n. 吸海洛因成瘾者, 吸毒的人, 毒品贩子, 废旧品商人」
- **建议：`keep`**

## laundering → launder
- rank：form 12730 / lemma 22076 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「洗钱；洗涤」 / lemma「洗熨；洗钱」
- ECDICT：form「n. 洗烫」 / lemma「n. 流水槽 v. 洗衣, 烫衣」
- **建议：`keep`**

## extracted → extract
- rank：form 12740 / lemma 13800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「提取；拔出（过去式）」 / lemma「提取；摘录；提取物」
- ECDICT：form「a. 引出的；萃取的」 / lemma「n. 榨出物, 精汁, 摘录, 选段 vt. (费力地)取出, 采掘, 榨取, 摘录, 吸取 [计] 提取」
- **建议：`keep`**

## aggravating → aggravate
- rank：form 12800 / lemma 13500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「使恶化的；恼人的」 / lemma「加重，恶化；激怒」
- ECDICT：form「a. 使恶化的, 加重的, 恼人的」 / lemma「vt. 使恶化, 使更严重, 加重」
- **建议：`keep`**

## specialized → specialize
- rank：form 12808 / lemma 15066 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「专门的；专业化的」 / lemma「专门从事；专攻」
- ECDICT：form「a. 专门的, 特别的, 专科的, 特化的, 专化的 [计] 专业化的」 / lemma「vt. 使特殊化, 列举, 特别指明, 限定...的范围 vi. 成为专家, 专攻」
- **建议：`keep`**

## reins → rein
- rank：form 12814 / lemma 16198 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「缰绳；控制权（复数）」 / lemma「缰绳；控制」
- ECDICT：form「pl. 肾脏, 腰部, 肺腑」 / lemma「n. 缰绳, 统治, 支配 vt. 驾驭, 以缰绳控制, 控制 vi. 勒住马」
- **建议：`keep`**

## oppressed → oppress
- rank：form 12825 / lemma 28609 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受压迫的；被压制的」 / lemma「压迫；使压抑」
- ECDICT：form「a. 受压制的, 受压迫的」 / lemma「vt. 压迫, 压抑, 使烦恼」
- **建议：`keep`**

## intoxicated → intoxicate
- rank：form 12828 / lemma 15500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「醉的；陶醉的」 / lemma「使醉；使兴奋」
- ECDICT：form「喝醉的,极其兴奋的」 / lemma「vt. 使陶醉, 使喝醉」
- **建议：`keep`**

## sulking → sulk
- rank：form 12844 / lemma 17398 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生闷气；愠怒」 / lemma「生闷气；愠怒」
- ECDICT：form「v. 生闷气, 愠怒( sulk的现在分词 )」 / lemma「n. 闹情绪, 闷闷不乐 vi. 不高兴, 闷闷不乐, 不悦, 生气, 愠怒」
- **建议：`keep`**

## beheaded → behead
- rank：form 12862 / lemma 21575 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「斩首；砍头」 / lemma「斩首」
- ECDICT：form「a. 身首异处的 v. 砍头（behead的过去分词）」 / lemma「vt. 斩首, 砍头」
- **建议：`keep`**

## settlers → settler
- rank：form 12880 / lemma 37999 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「定居者；殖民者」 / lemma「定居者；殖民者」
- ECDICT：form「n. 移民, 侨民( settler的复数形式 )」 / lemma「n. 移民者, 解决者, 结算员 [化] 沉淀池; 沉降器; 澄清槽」
- **建议：`keep`**

## inflicted → inflict
- rank：form 12921 / lemma 14350 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使遭受；施加」 / lemma「施加；使遭受」
- ECDICT：form「v. 把…强加给, 使承受, 遭受( inflict的过去式和过去分词 )」 / lemma「vt. 施以, 加害, 使承受 [法] 处, 加, 予以」
- **建议：`keep`**

## seasoned → season
- rank：form 12929 / lemma 1214 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「经验丰富的；调过味的」 / lemma「季节；赛季」
- ECDICT：form「a. 经验丰富的, 老练的」 / lemma「n. 季节, 时节, 当令期, 时期 vt. 给...调味, 使成熟, 使老练, 缓和 vi. 变干燥」
- **建议：`?`**

## sprained → sprain
- rank：form 12952 / lemma 18929 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「扭伤」 / lemma「扭伤」
- ECDICT：form「v. 扭伤（关节）( sprain的过去式和过去分词 )」 / lemma「vt. 挫伤, 扭筋, 错筋 n. 扭伤, 扭筋」
- **建议：`keep`**

## stats → stat
- rank：form 12962 / lemma 10178 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「统计数据；统计资料」 / lemma「立刻；马上（口语）」
- ECDICT：form「abbr. [军]静止坦克自动目标系统（Stationary Tank Automatic Target System）」 / lemma「[电] 静」
- **建议：`keep`**

## squawks → squawk
- rank：form 12981 / lemma 16493 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出粗厉叫声；抱怨」 / lemma「发出刺耳叫声」
- ECDICT：form「n. （尤指鸟受惊时）粗厉的叫声( squawk的名词复数 ) v. 发出粗厉的叫声, 咯咯地叫( squawk的第三人…」 / lemma「n. 响而粗的叫声, 夜鹭 vi. 发出响而粗的叫声, 发牢骚, 诉苦」
- **建议：`keep`**

## brainwashed → brainwash
- rank：form 12990 / lemma 26554 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洗脑；强行灌输」 / lemma「洗脑；强行灌输」
- ECDICT：form「v. <贬>对…进行洗脑, 把某种思想强加于, 通过宣传灌输说服( brainwash的过去式和过去分词 )」 / lemma「n. 洗脑 vt. 对人洗脑」
- **建议：`keep`**

## sedated → sedate
- rank：form 12993 / lemma 18951 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使镇静；给…服镇静剂」 / lemma「镇静的；安详的」
- ECDICT：form「v. 使昏昏入睡, 使镇静( sedate的过去式和过去分词 )」 / lemma「a. 沉着的, 镇静的, 安静的 vt. 给...服镇静剂」
- **建议：`keep`**

## certified → certify
- rank：form 13000 / lemma 13800 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「经认证的，有证书的」 / lemma「证明；证实；发证书给」
- ECDICT：form「a. 证明合格的 [化] 检定的; 证明的; 书面证明的」 / lemma「v. 证明, 保证」
- **建议：`keep`**

## granulated → granulate
- rank：form 13000 / lemma 15800 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「颗粒状的；成粒的」 / lemma「使成颗粒；使表面粗糙成粒状」
- ECDICT：form「a. 成颗粒的, 细粒的」 / lemma「vi. 成粒状, 粗糙, 形成肉芽 vt. 使成粒状, 使表面粗糙」
- **建议：`keep`**

## rotating → rotate
- rank：form 13000 / lemma 14000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「旋转的」 / lemma「旋转；轮换」
- ECDICT：form「[医] 旋转的, 转动的」 / lemma「a. 辐状的 vt. 使旋转, 使转动, 使轮流 vi. 旋转, 循环 [计] 旋转」
- **建议：`keep`**

## surpassing → surpass
- rank：form 13000 / lemma 19148 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「非凡的；超群的」 / lemma「超过；胜过」
- ECDICT：form「a. 胜过的, 卓越的, 优秀的, 非凡的 adv. 非凡地, 卓越地」 / lemma「vt. 超越, 凌驾, 胜过」
- **建议：`keep`**

## bathed → bath
- rank：form 13010 / lemma 5025 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洗澡；沐浴」 / lemma「浴缸；洗澡」
- ECDICT：form「a. 淋漓的, 湿透的；沐浴的；沉溺的」 / lemma「n. 沐浴, 浴室 [医] 浴」
- **建议：`?`**

## bathed → bathe
- rank：form 13010 / lemma 7678 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洗澡；沐浴」 / lemma「洗澡；沐浴」
- ECDICT：form「a. 淋漓的, 湿透的；沐浴的；沉溺的」 / lemma「vt. 沐浴, 用水洗 vi. 洗澡」
- **建议：`?`**

## toxins → toxin
- rank：form 13022 / lemma 13625 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「毒素（复数）」 / lemma「毒素」
- ECDICT：form「n. 毒素( toxin的复数形式 )」 / lemma「n. 毒素 [化] 毒素」
- **建议：`keep`**

## originated → originate
- rank：form 13024 / lemma 27251 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「起源；发源」 / lemma「起源；发源」
- ECDICT：form「v. 起源于, 来自, 产生( originate的过去式和过去分词 ); 创造; 创始; 开创」 / lemma「vt. 创始, 发明, 发起 vi. 发源, 发生, 起航 [计] 发自」
- **建议：`keep`**

## aggravated → aggravate
- rank：form 13036 / lemma 13500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「加剧的；恼怒的」 / lemma「加重，恶化；激怒」
- ECDICT：form「a. 加重的；恶化的」 / lemma「vt. 使恶化, 使更严重, 加重」
- **建议：`keep`**

## raiders → raider
- rank：form 13087 / lemma 22193 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「袭击者；劫掠者」 / lemma「袭击者；劫掠者」
- ECDICT：form「n. 进行袭击、抢劫或搜查的人, 进行突袭的舰队、飞机等( raider的复数形式 )」 / lemma「n. 奇袭者, 侵入者 [法] 袭击者, 侵入者, 劫掠商船的武装快船」
- **建议：`keep`**

## dignified → dignify
- rank：form 13100 / lemma 17900 ｜ type `pd` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「有尊严的；庄严的」 / lemma「使有尊严；使高贵」
- ECDICT：form「a. 有尊严的, 高尚的」 / lemma「vt. 增威严, 使高贵, 故作显贵」
- **建议：`keep`**

## disseminated → disseminate
- rank：form 13100 / lemma 15600 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「播散的；散布的」 / lemma「散布，传播」
- ECDICT：form「v. 散布, 传播( disseminate的过去式和过去分词 )」 / lemma「vt. 散播, 传播, 宣传 vi. 广为传播」
- **建议：`keep`**

## hippies → hippy
- rank：form 13113 / lemma 18636 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嬉皮士（复数）」 / lemma「嬉皮士」
- ECDICT：form「n. （尤指20世纪60年代晚期的）嬉皮士（与社会现实格格不入的人, 常成群结伙实行与众不同的生活方式、着奇装异服等）(…」 / lemma「n. 嬉皮士」
- **建议：`keep`**

## engraved → engrave
- rank：form 13121 / lemma 42061 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「雕刻；铭刻（过去式）」 / lemma「雕刻；铭刻」
- ECDICT：form「v. 在（硬物）上雕刻（字, 画等）( engrave的过去式和过去分词 ); 将某事物深深印在（记忆或头脑中）」 / lemma「vt. 刻上, 雕刻, 铭记」
- **建议：`keep`**

## labeled → label
- rank：form 13123 / lemma 4351 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贴标签；标注（过去式）」 / lemma「标签；商标」
- ECDICT：form「a. 有标签的；示踪的」 / lemma「n. 标签, 称号, 商标, 标志 vt. 贴标签于, 标注 [计] 标志; 标注; DOS外部命令:用于建立改变或删除…」
- **建议：`?`**

## disqualified → disqualify
- rank：form 13130 / lemma 28942 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「取消资格（过去式）」 / lemma「取消资格；使不合格」
- ECDICT：form「v. 使无资格, 使不合格, 使不能( disqualify的过去式和过去分词 ); 不及格」 / lemma「vt. 使不适合, 取消...资格」
- **建议：`keep`**

## shareholders → shareholder
- rank：form 13143 / lemma 20600 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「股东（复数）」 / lemma「股东」
- ECDICT：form「n. 股东( shareholder的复数形式 )」 / lemma「n. 股东 [法] 股东, 股票持有人」
- **建议：`keep`**

## commandments → commandment
- rank：form 13145 / lemma 15000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「戒律；诫命（复数）」 / lemma「戒律；命令」
- ECDICT：form「n. 戒条( commandment的复数形式 )」 / lemma「n. 戒律」
- **建议：`keep`**

## countrymen → countryman
- rank：form 13158 / lemma 28491 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「同胞；同乡（复数）」 / lemma「同胞；乡下人」
- ECDICT：form「n. 同胞；乡下人；国民（countryman的复数形式）」 / lemma「n. 同胞, 乡下人, 国民」
- **建议：`keep`**

## genitals → genital
- rank：form 13182 / lemma 17800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「生殖器」 / lemma「生殖的；生殖器的」
- ECDICT：form「n. 生殖器, 外阴部 [医] 生殖器」 / lemma「a. 生殖的 [医] 生殖的, 生殖器的」
- **建议：`keep`**

## marshmallows → marshmallow
- rank：form 13197 / lemma 14521 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「棉花糖」 / lemma「棉花糖」
- ECDICT：form「n. 棉花糖（marshmallow的复数）；药属葵蜜饯」 / lemma「n. 药用蜀葵, 蜀葵糖剂」
- **建议：`keep`**

## enchanting → enchant
- rank：form 13201 / lemma 33042 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「迷人的；妩媚的」 / lemma「使着迷；施魔法」
- ECDICT：form「a. 迷人的, 妩媚的, 迷惑人的」 / lemma「vt. 施魔法, 使入迷」
- **建议：`keep`**

## dis → di
- rank：form 13206 / lemma 3447 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「（俚）侮辱；贬低」 / lemma「迪（人名，黛安娜昵称）」
- ECDICT：form「n. 狄斯(阴间的神), 阴间, 冥府」 / lemma「[计] 数据输入, 数据项, 设备独立性, 双整数」
- **建议：`keep`**

## discarded → discard
- rank：form 13223 / lemma 16257 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「丢弃；抛弃」 / lemma「丢弃；抛弃」
- ECDICT：form「v. 丢弃, 抛弃( discard的过去式和过去分词 ); 不再使用」 / lemma「vt. 丢弃, 抛弃 vi. 垫牌 n. 垫牌, 抛弃」
- **建议：`keep`**

## stimulating → stimulate
- rank：form 13280 / lemma 13886 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「刺激的；激发兴趣的」 / lemma「刺激；激发」
- ECDICT：form「a. 刺激的, 有刺激性的」 / lemma「vt. 刺激, 激励, 鼓舞 vi. 起刺激作用」
- **建议：`keep`**

## grandkids → grandkid
- rank：form 13297 / lemma 46940 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「孙辈；孙子孙女」 / lemma「（外）孙辈」
- ECDICT：form「(grandkid 的复数) n. （外）孙；（外）孙女」 / lemma「n. （外）孙；（外）孙女」
- **建议：`keep`**

## forsaken → forsake
- rank：form 13303 / lemma 15486 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「被遗弃的；孤苦的」 / lemma「抛弃；遗弃」
- ECDICT：form「a. 被抛弃的, 孤独的 forsake的过去分词」 / lemma「vt. 放弃, 断念, 抛弃 [法] 遗弃, 抛弃, 摒绝」
- **建议：`keep`**

## rubles → ruble
- rank：form 13304 / lemma 38105 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「卢布（俄罗斯货币）」 / lemma「卢布（俄罗斯货币）」
- ECDICT：form「n. 卢布（ruble的复数, 俄罗斯等国的货币单位）」 / lemma「n. 卢布(俄国货币)」
- **建议：`keep`**

## molested → molest
- rank：form 13327 / lemma 22069 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「骚扰；猥亵（过去式）」 / lemma「骚扰；猥亵」
- ECDICT：form「v. 骚扰( molest的过去式和过去分词 ); 干扰; 调戏; 猥亵」 / lemma「vt. 妨碍, 干扰, 调戏 [法] 调戏, 作弄, 恶意干涉」
- **建议：`keep`**

## perverts → pervert
- rank：form 13361 / lemma 15400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「变态者；堕落者（复数）」 / lemma「使堕落；曲解，歪曲」
- ECDICT：form「n. 性变态者( pervert的名词复数 ) v. 滥用( pervert的第三人称单数 ); 腐蚀; 败坏; 使堕落」 / lemma「vt. 使堕落, 使反常, 歪曲, 滥用, 使左右颠倒, 唆使...性变态 n. 堕落者, 行为反常者, 背教者, 性欲…」
- **建议：`keep`**

## technicians → technician
- rank：form 13379 / lemma 14100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「技术员（复数）」 / lemma「技术员，技师」
- ECDICT：form「n. 工作人员；技术员（technician的复数）」 / lemma「n. 技师 [化] 技师」
- **建议：`keep`**

## congested → congest
- rank：form 13400 / lemma 20000 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「拥挤的，堵塞的」 / lemma「使拥挤；使充血」
- ECDICT：form「a. 拥挤的, 堵塞的 [医] 充血的」 / lemma「vt. 使充满, 使拥塞, 使充血 vi. 充塞, 充血, 拥挤」
- **建议：`keep`**

## whirs → whir
- rank：form 13422 / lemma 34212 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呼呼作响」 / lemma「呼呼声；嗡嗡声」
- ECDICT：form「v. 呼呼作声地飞（或转）, 作呼呼声( whir的第三人称单数 ); 使呼呼地飞（或转）, 呼地一声把…带走」 / lemma「n. 呼呼声, 飕飕声 vi. 作呼呼声, 发飕飕声 vt. 使呼呼响」
- **建议：`keep`**

## kaos → kao
- rank：form 13429 / lemma 18657 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「混乱（品牌名）」 / lemma「考（人名/地名）」
- ECDICT：form「(kao 的复数) n. 花王（公司名）」 / lemma「n. 花王（公司名）」
- **建议：`keep`**

## shoplifting → shoplift
- rank：form 13458 / lemma 41428 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「入店行窃」 / lemma「入店行窃」
- ECDICT：form「n. 入店行窃 [法] 冒充顾客进入商店行窃」 / lemma「vi.vt. 入店偷窃商品」
- **建议：`keep`**

## discerning → discern
- rank：form 13500 / lemma 13500 ｜ type `i` ｜ src `AB` ｜ flags `rank-tie`
- kind：form `-` / lemma `-`
- 词库 gloss：form「有辨别力的，眼光敏锐的」 / lemma「辨别，分辨出」
- ECDICT：form「a. 有眼力的, 敏锐的, 有辨别能力的, 有洞察力的」 / lemma「v. 辨别, 看清楚, 了解」
- **建议：`?`**

## horrifying → horrify
- rank：form 13500 / lemma 12900 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「令人恐惧的」 / lemma「使恐惧，使震惊」
- ECDICT：form「a. 令人恐惧的；使人惊骇的」 / lemma「vt. 使恐惧, 使震惊」
- **建议：`?`**

## mortified → mortify
- rank：form 13500 / lemma 14000 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「感到羞辱的；使死的（医）」 / lemma「使难堪；克制（欲望）」
- ECDICT：form「v. 使受辱( mortify的过去式和过去分词 ); 伤害（人的感情）; 克制; 抑制（肉体、情感等）」 / lemma「vt. 抑制, 苦修, 使受辱 vi. 禁欲, 苦修」
- **建议：`keep`**

## ruptured → rupture
- rank：form 13500 / lemma 17500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「破裂的；断裂的」 / lemma「破裂；决裂」
- ECDICT：form「a. 破裂的」 / lemma「n. 破裂, 断裂, 裂开, 决裂, 不和 v. (使)破裂」
- **建议：`keep`**

## burrows → burrow
- rank：form 13539 / lemma 18128 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地洞；洞穴」 / lemma「洞穴；地洞；挖洞」
- ECDICT：form「n. 巴罗斯（姓氏）」 / lemma「n. 洞穴, 藏身处 vi. 掘洞穴, 躲藏 vt. 掘, 打洞」
- **建议：`keep`**

## trampled → trample
- rank：form 13581 / lemma 17512 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「踩踏；践踏」 / lemma「踩踏；践踏」
- ECDICT：form「v. 踩( trample的过去式和过去分词 ); 践踏; 无视; 侵犯」 / lemma「n. 践踏(声), 蹂躏 v. 践踏, 无视」
- **建议：`keep`**

## persecuted → persecute
- rank：form 13592 / lemma 24184 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「迫害；骚扰」 / lemma「迫害；骚扰」
- ECDICT：form「v. （尤指宗教或政治信仰的）迫害(~sb. for sth.)( persecute的过去式和过去分词 ); 烦扰, …」 / lemma「vt. 迫害, 虐待, 困扰, 同...捣乱 [法] 迫害, 虐待, 烦扰」
- **建议：`keep`**

## tuesdays → tuesday
- rank：form 13593 / lemma 2144 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「星期二（复数）」 / lemma「星期二」
- ECDICT：form「adv. 每星期二, 在任何星期二」 / lemma「n. 星期二」
- **建议：`keep`**

## evicted → evict
- rank：form 13611 / lemma 18378 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「驱逐；赶出」 / lemma「驱逐；赶出（房客）」
- ECDICT：form「v. （依法从房屋里或土地上）驱逐, 赶出( evict的过去式和过去分词 )」 / lemma「vt. 逐出, 赶出, 驱逐 [法] 逐出, 驱逐, 没收」
- **建议：`keep`**

## flakes → flake
- rank：form 13674 / lemma 15248 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「薄片；碎片」 / lemma「薄片；雪花；古怪的人」
- ECDICT：form「[化] 鳞片; 片状粉(粉末冶金); 白点; 发裂(钢缺陷); (纤维素塑料)干(片)坯料」 / lemma「n. 小薄片, 扁薄的一层, 火星, 晒鱼架子 vt. 使成薄片 vi. 剥落」
- **建议：`keep`**

## dwelling → dwell
- rank：form 13699 / lemma 8340 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「住所；住宅」 / lemma「居住；细想」
- ECDICT：form「n. 住处 [医] 住房」 / lemma「vi. 居住, 居住(于), 存在(于)」
- **建议：`?`**

## animated → animate
- rank：form 13702 / lemma 35901 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「活跃的；动画的」 / lemma「使有生气；制作动画」
- ECDICT：form「a. 活生生的, 能活动的, 活泼的, 欢快的」 / lemma「vt. 使有生气, 赋予生命 a. 有生命的, 有生气的」
- **建议：`keep`**

## tampering → tamper
- rank：form 13707 / lemma 21268 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「篡改；干预」 / lemma「篡改；擅自改动」
- ECDICT：form「[法] 贿赂, 收买」 / lemma「vi. 干预, 拨弄, 贿赂, 损害, 篡改 vt. 篡改 n. 捣棒, 打夯机, 填塞者」
- **建议：`keep`**

## conned → con
- rank：form 13710 / lemma 3308 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「欺骗；诈骗」 / lemma「骗局；反对」
- ECDICT：form「a. 被骗了 v. 指挥操舵( conn的过去式和过去分词 )」 / lemma「vt. 精读, 仔细研究, 默记 adv. 反面地, 从反面 a. 欺诈的 n. 反对者, 反对票, 肺结核 [计] 控…」
- **建议：`?`**

## conned → conn
- rank：form 13710 / lemma 23488 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「欺骗；诈骗」 / lemma「指挥操舵；驾船」
- ECDICT：form「a. 被骗了 v. 指挥操舵( conn的过去式和过去分词 )」 / lemma「vt. 指挥操舵 n. 指挥操舵」
- **建议：`keep`**

## contractions → contraction
- rank：form 13712 / lemma 18680 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「收缩；缩略形式」 / lemma「收缩；缩写；宫缩」
- ECDICT：form「n. 收缩( contraction的复数形式 ); 缩减; 缩略词; （分娩时）子宫收缩」 / lemma「n. 收缩, 缩写式, 害病 [医] 收缩; 挛缩; 牙弓内缩」
- **建议：`keep`**

## fugitives → fugitive
- rank：form 13731 / lemma 15600 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「逃犯；逃亡者（复数）」 / lemma「逃亡者；adj. 短暂的，漂泊的」
- ECDICT：form「n. 亡命者, 逃命者( fugitive的复数形式 )」 / lemma「a. 逃亡的, 短暂的, 难捉摸的 n. 逃亡者, 亡命者, 难捕捉之物」
- **建议：`keep`**

## channing → chan
- rank：form 13733 / lemma 3474 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「钱宁（人名）」 / lemma「陈（姓氏音译）」
- ECDICT：form「n. 钱宁（男子名）」 / lemma「n. 通道（槽, 沟）」
- **建议：`keep`**

## mutilated → mutilate
- rank：form 13751 / lemma 32400 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使残缺；毁伤」 / lemma「残害；毁坏」
- ECDICT：form「v. 严重残害…的身体, 使残缺不全, 肢解( mutilate的过去式和过去分词 )」 / lemma「vt. 切断, 使残废, 使不完整 [医] 致残毁」
- **建议：`keep`**

## co-workers → co-worker
- rank：form 13757 / lemma 17169 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「同事（复数）」 / lemma「同事」
- ECDICT：form「(co-worker 的复数) n. 同事」 / lemma「n. 同事」
- **建议：`keep`**

## spaniards → spaniard
- rank：form 13765 / lemma 16647 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「西班牙人（复数）」 / lemma「西班牙人」
- ECDICT：form「n. 西班牙人, 西班牙居民( Spaniard的复数形式 )」 / lemma「n. 西班牙人」
- **建议：`keep`**

## newlyweds → newlywed
- rank：form 13777 / lemma 27862 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「新婚夫妇」 / lemma「新婚者」
- ECDICT：form「n. 新婚夫妇；新婚的人（newlywed的复数）」 / lemma「n. 新(婚的)人, 新婚夫妇」
- **建议：`keep`**

## appetizers → appetizer
- rank：form 13795 / lemma 15393 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「开胃菜（复数）」 / lemma「开胃菜」
- ECDICT：form「n. 开胃品( appetizer的复数形式 ); 促进食欲的活动; 刺激欲望的东西; 吊胃口的东西」 / lemma「n. 开胃食品, 吊胃口的东西 [医] 开胃剂」
- **建议：`keep`**

## cackles → cackle
- rank：form 13800 / lemma 35188 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咯咯大笑；咯咯叫」 / lemma「咯咯叫；尖声笑」
- ECDICT：form「n. （母鸡的）咯咯声( cackle的名词复数 ); 咯咯的笑声; 刺耳的谈笑声; 停止闲谈开始做事 v. 发出咯咯声…」 / lemma「n. 咯咯声, 高笑声, 饶舌, 闲谈 vi. 咯咯地叫, 咯咯地笑, 喋喋不休」
- **建议：`keep`**

## kiddies → kiddy
- rank：form 13801 / lemma 29455 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小孩子们」 / lemma「小孩（昵称）」
- ECDICT：form「n. [口语]小家伙；小孩；小山羊」 / lemma「n. 小孩, 小家伙」
- **建议：`keep`**

## whinnying → whinny
- rank：form 13837 / lemma 29894 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（马）嘶鸣」 / lemma「（马）嘶鸣」
- ECDICT：form「v. 发出轻微的嘶声( whinny的现在分词 )」 / lemma「n. 马嘶声 vi. 嘶 vt. 带着嘶声说」
- **建议：`keep`**

## mags → mag
- rank：form 13843 / lemma 13923 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「杂志（口语）」 / lemma「杂志（口语）」
- ECDICT：form「n. [口]杂志（mag的复数, 等于magazines）」 / lemma「n. 杂志, 星期专刊, 期刊, 仓库, 军火库, 弹药, 库存物, 弹仓, 弹盘, 弹盒, 胶卷盒」
- **建议：`keep`**

## krauts → kraut
- rank：form 13858 / lemma 15984 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「德国人（贬称）」 / lemma「德国佬（贬称）」
- ECDICT：form「n. 酸泡菜；德国人」 / lemma「n. 德国佬」
- **建议：`keep`**

## crazed → craze
- rank：form 13871 / lemma 18501 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疯狂的；发狂的」 / lemma「狂热；时尚」
- ECDICT：form「a. 癫狂的；疯狂的」 / lemma「n. 狂热, 大流行 v. (使)发狂, (使)开裂」
- **建议：`keep`**

## atrocities → atrocity
- rank：form 13880 / lemma 20478 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暴行（复数）」 / lemma「暴行；残暴」
- ECDICT：form「n. 邪恶, 暴行( atrocity的名词复数 ); 滔天大罪」 / lemma「n. 残暴, 凶恶, 暴行 [法] 暴行, 残酷, 残忍」
- **建议：`keep`**

## incriminating → incriminate
- rank：form 13887 / lemma 16800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「显示有罪的」 / lemma「归罪于，连累」
- ECDICT：form「[法] 归罪的, 牵连的, 显示有罪的」 / lemma「vt. 连累, 暗示...有罪, 控告 [法] 控告, 使入罪, 连累」
- **建议：`keep`**

## exhaling → exhale
- rank：form 13904 / lemma 16300 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「呼气；呼出」 / lemma「呼出，呼气」
- ECDICT：form「v. 呼气；发散；排出（exhale的现在分词形式）」 / lemma「v. 呼气, 发出, 散发」
- **建议：`keep`**

## inexperienced → inexperience
- rank：form 13906 / lemma 34824 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「缺乏经验的」 / lemma「缺乏经验」
- ECDICT：form「a. 无经验的, 不熟练的」 / lemma「n. 无经验, 不熟练」
- **建议：`keep`**

## misjudged → misjudge
- rank：form 13907 / lemma 21200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「误判；判断错误」 / lemma「错误判断，估计错误」
- ECDICT：form「v. 错误地判断, 冤枉( misjudge的过去式和过去分词 )」 / lemma「v. 判断错」
- **建议：`keep`**

## burps → burp
- rank：form 13952 / lemma 14747 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打嗝」 / lemma「打嗝；使打嗝」
- ECDICT：form「n. 打嗝, 饱嗝( burp的名词复数 ) v. 打嗝( burp的第三人称单数 )」 / lemma「n. 饱嗝儿, 打嗝 v. 打饱嗝」
- **建议：`keep`**

## repressed → repress
- rank：form 13975 / lemma 28367 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「被压抑的；受抑制的」 / lemma「压制；抑制」
- ECDICT：form「a. 被镇压的, 受约束的, 被抑制的」 / lemma「vt. 镇压, 抑制, 压制 vi. 压制」
- **建议：`keep`**

## astonished → astonish
- rank：form 13980 / lemma 34240 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「惊讶的；震惊的」 / lemma「使惊讶；使吃惊」
- ECDICT：form「a. 吃惊的」 / lemma「vt. 使惊讶」
- **建议：`keep`**

## guineas → guinea
- rank：form 13987 / lemma 6227 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「几尼（旧英国金币）」 / lemma「几内亚（地名/旧币）」
- ECDICT：form「n. 几尼（英国的旧金币, 值一镑一先令）( guinea的复数形式 )」 / lemma「n. 几内亚」
- **建议：`keep`**

## playoffs → playoff
- rank：form 13992 / lemma 28790 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「季后赛；附加赛」 / lemma「附加赛；季后赛」
- ECDICT：form「n. NBA 季后赛」 / lemma「n. 双方得分相等时的最后决赛；复赛；季后赛」
- **建议：`keep`**

## horrified → horrify
- rank：form 14000 / lemma 12900 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「惊骇的；毛骨悚然的」 / lemma「使恐惧，使震惊」
- ECDICT：form「a. 惊骇的, 带有恐怖感的」 / lemma「vt. 使恐惧, 使震惊」
- **建议：`?`**

## maculated → maculate
- rank：form 14000 / lemma 21600 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「有斑点的；玷污的」 / lemma「使有斑点；玷污」
- ECDICT：form「有斑点的」 / lemma「a. 有斑点的, 有污点的 vt. 使有斑点, 使有污点」
- **建议：`keep`**

## astounding → astound
- rank：form 14003 / lemma 36471 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人震惊的」 / lemma「使震惊；使惊骇」
- ECDICT：form「a. 令人惊骇的」 / lemma「vt. 使惊骇, 使大惊」
- **建议：`keep`**

## highlands → highland
- rank：form 14004 / lemma 14180 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「高地；高原地区」 / lemma「高地；高原」
- ECDICT：form「n. 高原地区; 苏格兰高地」 / lemma「n. 高地, 苏格兰高地」
- **建议：`keep`**

## borne → bear
- rank：form 14009 / lemma 4245 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「承担；忍受（bear 过去分词）」 / lemma「熊」
- ECDICT：form「v. 忍受；负荷；结果实；生子女（bear的过去分词）」 / lemma「n. 熊 vt. 忍受, 支承, 产生, 怀有, 通过卖空使跌价 vi. 忍受, 结果实, 压挤, 行进, 转向」
- **建议：`?`**

## electrons → electron
- rank：form 14065 / lemma 14566 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电子（复数）」 / lemma「电子」
- ECDICT：form「n. 电子( electron的复数形式 )」 / lemma「n. 电子 [化] 电子」
- **建议：`keep`**

## inhabited → inhabit
- rank：form 14067 / lemma 14500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「有人居住的」 / lemma「居住于」
- ECDICT：form「a. 有人居住的」 / lemma「vt. 居住于, 占据, 栖息」
- **建议：`keep`**

## billing → bill
- rank：form 14074 / lemma 8226 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开账单；计费」 / lemma「账单；法案；钞票」
- ECDICT：form「n. 节目次序, 广告 [经] 开票(发票,帐单)」 / lemma「n. 帐单, 清单, 钞票, 鸟嘴, 广告, 法案, 票据 vt. 开帐单, (用招贴)宣布」
- **建议：`?`**

## checkers → checker
- rank：form 14096 / lemma 28570 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「跳棋（游戏）」 / lemma「检查员；方格图案」
- ECDICT：form「n. 国际跳棋」 / lemma「n. 制止者, 查对者, 阻止者 [计] 检查程序, 检验程序, 检验器, 西洋跳棋」
- **建议：`keep`**

## guidelines → guideline
- rank：form 14133 / lemma 44525 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指导方针；准则」 / lemma「指导方针；准则」
- ECDICT：form「n. 指导方针」 / lemma「n. 指导路线, 方针, 指标 [经] 指导路线, 方针, 准则」
- **建议：`keep`**

## eavesdropping → eavesdrop
- rank：form 14160 / lemma 20177 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「偷听；窃听」 / lemma「偷听；窃听」
- ECDICT：form「n. 偷听 [法] 窃听罪, 偷听」 / lemma「v. 偷听 n. 屋檐水, 偷听」
- **建议：`keep`**

## antiseptics → antiseptic
- rank：form 14200 / lemma 20700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「抗菌剂，防腐剂（复数）」 / lemma「抗菌的，防腐的」
- ECDICT：form「n. 防腐剂, 杀菌剂( antiseptic的复数形式 )」 / lemma「n. 抗菌剂, 防腐剂 a. 抗菌的, 防腐的」
- **建议：`keep`**

## nullifying → nullify
- rank：form 14200 / lemma 16400 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「使无效的；抵消的」 / lemma「使无效，废除」
- ECDICT：form「v. 使抵消( nullify的现在分词 ); 使无效」 / lemma「vt. 使无效, 废弃, 取消 [化] 使等于零; 作废」
- **建议：`keep`**

## verifications → verification
- rank：form 14200 / lemma 21003 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「验证（复数）」 / lemma「验证；核实」
- ECDICT：form「(verification 的复数) n. 证实, 查证, 证明属实 [计] 验证」 / lemma「n. 证实, 查证, 证明属实 [计] 验证」
- **建议：`keep`**

## electrocuted → electrocute
- rank：form 14216 / lemma 28936 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电击致死（过去式）」 / lemma「电死；触电致死」
- ECDICT：form「v. <美>处电刑, 触电致死( electrocute的过去式和过去分词 )」 / lemma「vt. 以电椅处死, 以电击杀死, 通电致死 [法] 施以电刑, 误触电致死」
- **建议：`keep`**

## raisins → raisin
- rank：form 14231 / lemma 16899 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「葡萄干（复数）」 / lemma「葡萄干」
- ECDICT：form「n. 葡萄干( raisin的复数形式 )」 / lemma「n. 葡萄干」
- **建议：`keep`**

## dwarves → dwarf
- rank：form 14243 / lemma 6453 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「矮人（复数）」 / lemma「矮人；侏儒」
- ECDICT：form「(dwarf 的复数) n. 矮子, 侏儒 v. (使)变矮小」 / lemma「n. 矮子, 侏儒 v. (使)变矮小」
- **建议：`?`**

## bloated → bloat
- rank：form 14247 / lemma 37956 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「膨胀的；臃肿的」 / lemma「使膨胀；肿胀」
- ECDICT：form「a. 发胀的, 浮肿的, 傲慢的」 / lemma「vt. 使膨胀, 腌制, 使自大 vi. 膨胀, 肿起 n. 肿胀病人」
- **建议：`keep`**

## detached → detach
- rank：form 14252 / lemma 22951 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分离的；超然的」 / lemma「分离；拆卸；派遣」
- ECDICT：form「a. 超然的, 分离的, 冷淡的 [法] 分遣的, 派遣的, 分离的」 / lemma「vt. 使分离, 分遣 [机] 摘下, 分离, 卸下」
- **建议：`keep`**

## chopsticks → chopstick
- rank：form 14266 / lemma 43033 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent, suspect-target`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「筷子（复数）」 / lemma「筷子」
- ECDICT：form「n. 筷子」 / lemma「n. 筷子」
- **建议：`keep`**

## thrusters → thruster
- rank：form 14272 / lemma 23353 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「推进器（复数）」 / lemma「推进器；助推器」
- ECDICT：form「n. 推进器」 / lemma「n. 向上钻营的人, 推进器」
- **建议：`keep`**

## indicted → indict
- rank：form 14281 / lemma 19816 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「起诉；控告」 / lemma「起诉；控告」
- ECDICT：form「v. 控告, 起诉( indict的过去式和过去分词 )」 / lemma「vt. 起诉, 控告, 指控 [法] 控告, 揭发, 对...起诉」
- **建议：`keep`**

## retching → retch
- rank：form 14323 / lemma 19000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「干呕；恶心」 / lemma「干呕」
- ECDICT：form「[医] 干呕」 / lemma「vi. 作呕, 反胃 vt. 呕吐 n. 反胃, 呕吐声」
- **建议：`keep`**

## israelis → israeli
- rank：form 14337 / lemma 7830 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「以色列人（复数）」 / lemma「以色列的；以色列人」
- ECDICT：form「n. 以色利人; 以色列人, 以色列国民( Israeli的复数形式 )」 / lemma「a. 以色列的, 以色列人(语)的 n. 以色列人」
- **建议：`keep`**

## thursdays → thursday
- rank：form 14338 / lemma 2134 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「星期四（复数）」 / lemma「星期四」
- ECDICT：form「adv. 每星期四, 在任何星期四」 / lemma「n. 星期四」
- **建议：`keep`**

## coworkers → coworker
- rank：form 14341 / lemma 19385 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「同事（复数）」 / lemma「同事」
- ECDICT：form「(coworker 的复数) n. 共同工作的人, 同事, 合作者」 / lemma「n. 共同工作的人, 同事, 合作者」
- **建议：`keep`**

## rapes → rape
- rank：form 14384 / lemma 15000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「强奸（复数）」 / lemma「掠夺，强夺；油菜」
- ECDICT：form「n. 芸苔( rape的名词复数 ); 强奸罪; 强奸案; 肆意损坏 v. 以暴力夺取, 强夺( rape的第三人称单数…」 / lemma「n. 抢夺, 掠夺, 强奸, 葡萄渣, 芸苔 vt. 掠夺, 抢夺, 强奸」
- **建议：`keep`**

## enrolled → enroll
- rank：form 14399 / lemma 19389 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「注册；入学」 / lemma「注册；登记」
- ECDICT：form「v. 登记（入会；卷）」 / lemma「vt. 登记, 使加入 vi. 参军, 注册」
- **建议：`keep`**

## turkeys → turkey
- rank：form 14403 / lemma 2374 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「火鸡（复数）」 / lemma「火鸡；土耳其」
- ECDICT：form「n. 火鸡, 火鸡肉( turkey的名词复数 ); 蠢货」 / lemma「n. 火鸡, 无用的家伙, 土耳其」
- **建议：`keep`**

## africans → african
- rank：form 14409 / lemma 3732 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「非洲人（复数）」 / lemma「非洲的；非洲人的」
- ECDICT：form「n. 非洲人（African的复数形式）」 / lemma「n. 非洲人 a. 非洲的, 非洲人的」
- **建议：`keep`**

## wrinkled → wrinkle
- rank：form 14424 / lemma 15011 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有皱纹的；起皱的」 / lemma「皱纹；褶皱」
- ECDICT：form「a. 具皱的, 有皱纹的」 / lemma「n. 皱纹, 妙计, 方法, 技巧 vi. 起皱 vt. 使起皱纹」
- **建议：`keep`**

## martians → martian
- rank：form 14463 / lemma 8900 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「火星人」 / lemma「火星的；火星人」
- ECDICT：form「n. 火星人（Martian的复数形式）」 / lemma「n. 火星人 a. 火星的」
- **建议：`keep`**

## winged → wing
- rank：form 14465 / lemma 2253 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有翅膀的」 / lemma「翅膀；侧翼」
- ECDICT：form「a. 有翼的, 高速的, 迅速的, 飞行的, 翼受伤的」 / lemma「n. 翅膀, 翼, 机翼, 派别 vt. 给...装上翼, 飞过, 使飞, 空运, 增加...速度 vi. 飞行」
- **建议：`?`**

## musketeers → musketeer
- rank：form 14470 / lemma 24879 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「火枪手」 / lemma「火枪手」
- ECDICT：form「n. 火枪手（musketeer的复数）」 / lemma「n. 火枪车, 步兵」
- **建议：`keep`**

## petrified → petrify
- rank：form 14473 / lemma 17000 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「吓呆的；石化的」 / lemma「使石化；使惊呆」
- ECDICT：form「a. 惊呆的; 目瞪口呆的 v. 使吓呆, 使惊呆; 变僵硬; 使石化(petrify的过去式和过去分词)」 / lemma「vt. (非正式)使惊呆, 使吓得要死, 使发呆 vt.vi. 使石化, 使成为化石, 使变僵, 变僵硬, 使消失活力,…」
- **建议：`keep`**

## bangles → bangle
- rank：form 14494 / lemma 31653 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「手镯」 / lemma「手镯；脚镯」
- ECDICT：form「n. 手镯, 脚镯( bangle的复数形式 )」 / lemma「n. 手镯, 脚镯」
- **建议：`keep`**

## startling → startle
- rank：form 14509 / lemma 14898 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人吃惊的」 / lemma「使惊吓；使吃惊」
- ECDICT：form「a. 令人吃惊的」 / lemma「n. 惊愕, 惊恐 vt. 吃惊, 使惊愕 vi. 惊起」
- **建议：`keep`**

## refreshments → refreshment
- rank：form 14525 / lemma 17374 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「茶点；饮料」 / lemma「茶点；恢复精神」
- ECDICT：form「n. 茶点；点心；小吃」 / lemma「n. 点心, 起提神作用的事物, 精神爽快」
- **建议：`keep`**

## dangling → dangle
- rank：form 14575 / lemma 18469 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「悬荡；悬挂」 / lemma「悬荡；吊着」
- ECDICT：form「[计] 悬挂的, 悬浮的, 悬摆的」 / lemma「vi. 摇晃地悬挂着, 追求 vt. 使摇晃地悬挂 n. 悬垂」
- **建议：`keep`**

## withholding → withhold
- rank：form 14579 / lemma 15000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「扣留；拒绝给予」 / lemma「拒绝给予，扣留」
- ECDICT：form「n. 扣缴税款」 / lemma「vt. 使停止, 扣留, 保留, 拒给 vi. 克制, 忍住」
- **建议：`keep`**

## minions → minion
- rank：form 14587 / lemma 22419 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「仆从；小黄人」 / lemma「仆从；走狗」
- ECDICT：form「n. <贬>奴颜婢膝的仆从( minion的复数形式 ); 走狗; 宠儿; 受人崇拜者」 / lemma「n. 奴才, 宠臣」
- **建议：`keep`**

## overreacted → overreact
- rank：form 14592 / lemma 18094 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「反应过度」 / lemma「反应过度」
- ECDICT：form「v. 反应过火( overreact的过去式和过去分词 )」 / lemma「vi. 反应过度, 反作用过强」
- **建议：`keep`**

## remnants → remnant
- rank：form 14610 / lemma 22124 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「残余；剩余部分」 / lemma「残余；剩余部分；遗迹」
- ECDICT：form「n. 剩余部分( remnant的复数形式 ); 残余; 零料; 零头布」 / lemma「n. 剩余, 零料, 遗迹 a. 剩余的, 残余的」
- **建议：`keep`**

## jens → jen
- rank：form 14615 / lemma 3581 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「（人名）延斯」 / lemma「珍（人名）」
- ECDICT：form「n. （接）物镜 n. (Jens)人名；(德、挪、丹、瑞典)延斯」 / lemma「n. 珍（女子名）」
- **建议：`keep`**

## hackers → hacker
- rank：form 14641 / lemma 8404 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「黑客；入侵者」 / lemma「黑客；入侵者」
- ECDICT：form「n. 黑客, 骇客；电脑黑客（hacker的复数）」 / lemma「[计] 计算机窃贼, 计算机新技术挑战者, 黑客」
- **建议：`keep`**

## revoked → revoke
- rank：form 14656 / lemma 20394 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「撤销；废除」 / lemma「撤销；废除」
- ECDICT：form「a. [法]取消的 v. 撤销, 取消, 废除( revoke的过去式和过去分词 )」 / lemma「vt. 撤回, 废除 vi. 藏牌 n. 藏牌 [计] 取消权限程序」
- **建议：`keep`**

## abode → abide
- rank：form 14667 / lemma 9631 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「住所；居所」 / lemma「遵守；忍受」
- ECDICT：form「n. 住所, 住处 abide的过去式和过去分词」 / lemma「vi. 停留, 遵守, 居留, 继续下去 vt. 忍受, 经受, 屈从于」
- **建议：`?`**

## nostrils → nostril
- rank：form 14680 / lemma 25988 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鼻孔」 / lemma「鼻孔」
- ECDICT：form「n. 鼻孔( nostril的复数形式 )」 / lemma「n. 鼻孔 [医] 鼻孔」
- **建议：`keep`**

## juggling → juggle
- rank：form 14692 / lemma 17924 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「玩杂耍；兼顾」 / lemma「玩杂耍；尽力应付」
- ECDICT：form「a. 欺诈的；变戏法的；欺骗的」 / lemma「vi. 玩戏法, 行骗, 篡改 vt. 耍弄, 歪曲, 篡改 n. 玩戏法, 魔术, 欺骗」
- **建议：`keep`**

## hypnotized → hypnotize
- rank：form 14694 / lemma 19984 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「催眠；使着迷」 / lemma「催眠；使着迷」
- ECDICT：form「v. 对…施催眠术( hypnotize的过去式和过去分词 ); 使着迷, 使精神恍惚」 / lemma「vt. 施催眠术, 使恍惚, 使着迷 [医] 催眠」
- **建议：`keep`**

## protesters → protester
- rank：form 14709 / lemma 40375 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「抗议者；示威者」 / lemma「抗议者；反对者」
- ECDICT：form「n. 抗议者( protester的复数形式 ); 反对者; 拒绝者; 断言者」 / lemma「n. 抗议者, 持异议者, 拒付者 [经] 反对者」
- **建议：`keep`**

## e-mailed → e-mail
- rank：form 14715 / lemma 3170 ｜ type `p` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发电子邮件」 / lemma「电子邮件」
- ECDICT：form「v. 电子邮件( e-mail的过去式和过去分词 )」 / lemma「[计] 电子邮件」
- **建议：`keep`**

## shackles → shackle
- rank：form 14728 / lemma 35170 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「镣铐；束缚」 / lemma「束缚；给…戴镣铐」
- ECDICT：form「n. 手铐, 脚镣；塞古」 / lemma「n. 桎梏, 束缚物 vt. 加枷锁, 束缚」
- **建议：`keep`**

## neighboring → neighbor
- rank：form 14749 / lemma 2227 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「邻近的；附近的」 / lemma「邻居」
- ECDICT：form「a. 附近的, 邻近的, 邻接的」 / lemma「n. 邻居 vt. 邻接 vi. 毗邻而居, 友好 a. 邻近的」
- **建议：`?`**

## snickering → snicker
- rank：form 14767 / lemma 37759 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「窃笑；暗笑」 / lemma「窃笑；暗笑」
- ECDICT：form「v. =sni^^er( snicker的现在分词 )」 / lemma「n. 窃笑 vi. 窃笑 vt. 窃笑着说」
- **建议：`keep`**

## partisans → partisan
- rank：form 14772 / lemma 15700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「游击队员；党羽（复数）」 / lemma「党徒；游击队员；adj.偏袒的」
- ECDICT：form「n. 游击队员( partisan的复数形式 ); 党人; 党羽; 帮伙」 / lemma「n. 党羽, 虔诚信徒, 同党, 游击队员 a. 党派的, 偏袒的, 效忠的, 献身的, 盲目推崇的」
- **建议：`keep`**

## hieroglyphics → hieroglyphic
- rank：form 14800 / lemma 16300 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「象形文字；难解的符号」 / lemma「象形文字（尤指古埃及文字）」
- ECDICT：form「n. 象形文字」 / lemma「n. 象形文字；象形文字写的文章」
- **建议：`keep`**

## reintegrated → reintegrate
- rank：form 14800 / lemma 16500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「重新整合的；恢复完整的」 / lemma「使重新融入；恢复完整」
- ECDICT：form「v. 再重新完整, 复兴( reintegrate的过去式和过去分词 )」 / lemma「vt. 使重新统一, 恢复, 重建, 复兴」
- **建议：`keep`**

## aligned → align
- rank：form 14829 / lemma 17571 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「对齐；结盟（过去式）」 / lemma「对齐；使一致」
- ECDICT：form「a. 对齐的；均衡的」 / lemma「vi. 排列, 排成一行, 结盟 vt. 使结盟, 使成一行, 校正」
- **建议：`keep`**

## memoirs → memoir
- rank：form 14849 / lemma 22289 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「回忆录；自传」 / lemma「回忆录；传记」
- ECDICT：form「n. 自传, 回忆录」 / lemma「n. 传记, 实录, 追思录, 回忆录, 自传 [化] 研究报告」
- **建议：`keep`**

## simpsons → simpson
- rank：form 14887 / lemma 4492 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「辛普森一家（动画）」 / lemma「辛普森（姓氏）」
- ECDICT：form「n. 辛普森一家（电影名）」 / lemma「n. 辛普森（姓氏）」
- **建议：`keep`**

## overslept → oversleep
- rank：form 14938 / lemma 41501 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「睡过头（过去式）」 / lemma「睡过头」
- ECDICT：form「oversleep的过去式和过去分词」 / lemma「v. (使)睡过头」
- **建议：`keep`**

## mps → mp
- rank：form 14962 / lemma 9773 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「下院议员（复数缩写）」 / lemma「议员；宪兵」
- ECDICT：form「[计] 微处理机系统」 / lemma「国会议员, 下院议员 [计] 宏处理程序, 维护程序, 线性规划, 微程序, 多处理器」
- **建议：`keep`**

## glands → gland
- rank：form 14969 / lemma 16607 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「腺体（复数）」 / lemma「腺」
- ECDICT：form「n. 腺体（gland的复数）；气封」 / lemma「n. 腺, 密封套 [化] 衬片; 密封垫」
- **建议：`keep`**

## sleepwalking → sleepwalk
- rank：form 14977 / lemma 37882 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「梦游；梦游症」 / lemma「梦游；梦游般行事」
- ECDICT：form「n. 梦游病」 / lemma「vi. 梦游」
- **建议：`keep`**

## intensifies → intensify
- rank：form 14990 / lemma 32476 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「加强；加剧（第三人称单数）」 / lemma「加强；加剧」
- ECDICT：form「n. （使）增强, （使）加剧( intensify的名词复数 ) v. （使）增强, （使）加剧( intensify…」 / lemma「vt. 加强 vi. 强化」
- **建议：`keep`**

## unified → unify
- rank：form 14994 / lemma 13500 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「统一的；一致的」 / lemma「统一，使合一」
- ECDICT：form「a. 统一的；一致标准的」 / lemma「v. 统一, 使成一体」
- **建议：`?`**

## gibbons → gibbon
- rank：form 15042 / lemma 34406 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「长臂猿（复数）；吉本斯（姓氏）」 / lemma「长臂猿」
- ECDICT：form「n. (Gibbons)人名；(英)吉本斯 [脊椎] 长臂猿( gibbon的名词复数 ) 吉本斯（Gibbons姓氏）」 / lemma「n. 长臂猿 [医] 长臂猿」
- **建议：`keep`**

## pretzels → pretzel
- rank：form 15049 / lemma 15263 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「椒盐卷饼（复数）」 / lemma「椒盐卷饼」
- ECDICT：form「n. 椒盐卷饼, <美俚>法国号( pretzel的复数形式 )」 / lemma「n. 椒盐卷饼, (美)(非正式)法国号」
- **建议：`keep`**

## stutters → stutter
- rank：form 15060 / lemma 15867 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「口吃；结巴（第三人称单数）」 / lemma「口吃；结巴」
- ECDICT：form「v. 结结巴巴地说( stutter的第三人称单数 ); 不顺畅的工作, 时断时续地移动」 / lemma「n. 口吃, 结结巴巴 v. 结结巴巴地说」
- **建议：`keep`**

## civilised → civilise
- rank：form 15068 / lemma 18200 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「文明的；开化的」 / lemma「使文明；教化」
- ECDICT：form「a. 文明的」 / lemma「vt. 开化, 使文明, (非正式)教化, 使文雅, 教育, 教导 vi. 变成文明社会」
- **建议：`keep`**

## finalists → finalist
- rank：form 15096 / lemma 24484 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「决赛选手」 / lemma「决赛选手」
- ECDICT：form「n. 参加决赛的选手」 / lemma「n. 决赛选手, 决赛队」
- **建议：`keep`**

## depraved → deprave
- rank：form 15098 / lemma 19800 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「堕落的；邪恶的」 / lemma「使腐化，使堕落」
- ECDICT：form「a. 堕落的, 腐化的, 道德败坏的 [医] 恶化的, 变坏的」 / lemma「vt. 使堕落, 使腐败 [法] 堕落, 腐化, 败坏」
- **建议：`keep`**

## mimicking → mimic
- rank：form 15099 / lemma 14200 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「模仿」 / lemma「模仿，模拟；n. 善于模仿的人」
- ECDICT：form「n. 仿制, 模仿」 / lemma「a. 模仿的, 摹拟的 n. 效颦者, 模仿者, 小丑, 仿制品 vt. 模仿, 摹拟」
- **建议：`?`**

## rambling → ramble
- rank：form 15112 / lemma 5826 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「漫无边际的；闲逛的」 / lemma「漫步；闲逛；漫谈」
- ECDICT：form「a. 漫步的, 布局零乱的, 散漫的」 / lemma「n. 漫步, 随笔 vi. 漫步, 漫谈, 漫游, 蔓延 vt. 闲逛于」
- **建议：`?`**

## diminished → diminish
- rank：form 15125 / lemma 19388 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「减少的；降低的」 / lemma「减少；削弱」
- ECDICT：form「a. 减退了的；减弱的」 / lemma「v. (使)减少, (使)变小」
- **建议：`keep`**

## stoked → stoke
- rank：form 15127 / lemma 20278 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「兴奋的；激动的」 / lemma「拨旺（火）；煽动」
- ECDICT：form「a. <俚>热烈的, 振奋的 v. 煽动( stoke的过去式和过去分词 ); 预先吃饱; 拨旺火; 往（火里等）加燃料」 / lemma「v. 司炉, (使)大吃」
- **建议：`keep`**

## appliances → appliance
- rank：form 15133 / lemma 19799 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「家用电器；器具」 / lemma「家用电器；器具」
- ECDICT：form「电气用具」 / lemma「n. 器械, 用具, 应用 [医] 矫正器; 器」
- **建议：`keep`**

## crusaders → crusader
- rank：form 15143 / lemma 16727 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「十字军；改革者」 / lemma「十字军战士；改革者」
- ECDICT：form「n. 十字军；十字军战士（crusader的复数）」 / lemma「n. 十字军战士, 改革者」
- **建议：`keep`**

## tonnes → tonne
- rank：form 15157 / lemma 29276 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「公吨（复数）」 / lemma「公吨」
- ECDICT：form「n. 吨, 公吨( tonne的复数形式 )」 / lemma「n. 吨, 公吨 [经] 吨」
- **建议：`keep`**

## impersonating → impersonate
- rank：form 15161 / lemma 22311 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「冒充；扮演」 / lemma「冒充；扮演」
- ECDICT：form「vt. 扮演（impersonate的现在分词形式）」 / lemma「vt. 模仿, 扮演, 体现, 使人格化 [法] 体现, 模仿, 拟人」
- **建议：`keep`**

## taxpayers → taxpayer
- rank：form 15162 / lemma 18227 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「纳税人」 / lemma「纳税人」
- ECDICT：form「n. 纳税人, 纳税的机构( taxpayer的复数形式 )」 / lemma「n. 纳税人 [法] 纳税人, 纳税义务人」
- **建议：`keep`**

## premeditated → premeditate
- rank：form 15169 / lemma 16800 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「预谋的」 / lemma「预谋，预先策划」
- ECDICT：form「a. 预先考虑的, 预谋的 [法] 经预先计划的, 预谋的」 / lemma「v. 预谋, 预先考虑」
- **建议：`keep`**

## misled → mislead
- rank：form 15212 / lemma 17577 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「误导（过去式）」 / lemma「误导；使误解」
- ECDICT：form「mislead的过去式和过去分词」 / lemma「vt. 误导」
- **建议：`keep`**

## clogged → clog
- rank：form 15214 / lemma 21059 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「堵塞的」 / lemma「堵塞；木屐」
- ECDICT：form「a. 阻塞的；堵住的」 / lemma「n. 障碍, 脚坠 v. 障碍, 阻塞」
- **建议：`keep`**

## degrading → degrade
- rank：form 15226 / lemma 24497 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有辱人格的」 / lemma「降低；使丢脸」
- ECDICT：form「a. 丧失体面的, 降低身份的, 有辱人格的 [法] 品质低劣的, 卑劣的, 退化的」 / lemma「v. (使)降级, (使)退化」
- **建议：`keep`**

## homing → home
- rank：form 15232 / lemma 650 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「归巢的；导航的」 / lemma「家；在家」
- ECDICT：form「n. 归航, 动物的返回性 a. 有返回性的, 回家的」 / lemma「n. 家, 避难所, 故乡 a. 家庭的, 国内的, 打中目标的 adv. 在家, 在本国, 打中目标地 [计] 返回始…」
- **建议：`?`**

## implicated → implicate
- rank：form 15239 / lemma 17094 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「牵连；涉及」 / lemma「牵连；涉及」
- ECDICT：form「a. 密切关联的；牵涉其中的」 / lemma「vt. 涉及, 含意, 暗示, 牵连 n. 包含的东西」
- **建议：`keep`**

## wednesdays → wednesday
- rank：form 15255 / lemma 2602 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「星期三（复数）」 / lemma「星期三」
- ECDICT：form「adv. 每星期三, 在任何星期三」 / lemma「n. 星期三」
- **建议：`keep`**

## bickering → bicker
- rank：form 15256 / lemma 27833 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「争吵；口角」 / lemma「争吵；口角」
- ECDICT：form「v. 争吵( bicker的现在分词 ); 口角; （水等）作潺潺声; 闪烁」 / lemma「vi. 斗嘴, 潺潺而流, 闪动 n. 口角, 流水声」
- **建议：`keep`**

## conspired → conspire
- rank：form 15265 / lemma 21610 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「密谋；共谋（conspire 的过去式）」 / lemma「密谋；共谋」
- ECDICT：form「v. 密谋( conspire的过去式和过去分词 ); 搞阴谋; （事件等）巧合; 共同导致」 / lemma「vi. 阴谋, 协力, 共谋 vt. 图谋」
- **建议：`keep`**

## crutches → crutch
- rank：form 15300 / lemma 17495 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拐杖；支撑物（复数）」 / lemma「拐杖；支撑物」
- ECDICT：form「n. 拐杖( crutch的名词复数 ); 支持物; 精神上的寄托; 胯部」 / lemma「n. 拐杖, 支撑, 依靠 vt. 支撑」
- **建议：`keep`**

## masturbating → masturbate
- rank：form 15321 / lemma 18600 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「手淫」 / lemma「手淫（医学生理用语）」
- ECDICT：form「v. （对…）进行手淫( masturbate的现在分词 )」 / lemma「v. 手淫」
- **建议：`keep`**

## exceeded → exceed
- rank：form 15329 / lemma 15560 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「超过；超越」 / lemma「超过；超越」
- ECDICT：form「a. 非常的；过度的；溢出的」 / lemma「vt. 超过, 超越, 胜过 vi. 超过其他」
- **建议：`keep`**

## diverted → divert
- rank：form 15341 / lemma 17000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「转移；使改道」 / lemma「转移；使转向」
- ECDICT：form「v. 呼叫转移, 释放（divert的过去分词形式）」 / lemma「vt. 转移, 使欢娱 vi. 转移」
- **建议：`keep`**

## aspirations → aspiration
- rank：form 15355 / lemma 25993 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「志向；渴望」 / lemma「志向；渴望」
- ECDICT：form「n. 愿望」 / lemma「n. 热望, 志向, 渴望 [医] 吸入; 吸[引], 吸引术」
- **建议：`keep`**

## furnished → furnish
- rank：form 15356 / lemma 20601 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「配备家具的」 / lemma「提供；布置家具」
- ECDICT：form「a. 家具, 有家具的」 / lemma「vt. 供给, 提供, 装设 [化] 供应; 供给; 配料」
- **建议：`keep`**

## trilling → trill
- rank：form 15386 / lemma 35637 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发颤音；鸟鸣」 / lemma「颤音」
- ECDICT：form「n. 三连晶, 三胞胎中的一个孩子」 / lemma「n. 颤声, 颤音, 啭鸣 vt. 用颤声说, 用颤音唱 vi. 发出颤音」
- **建议：`keep`**

## paved → pave
- rank：form 15391 / lemma 22623 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「铺（路）；铺砌」 / lemma「铺路；铺设」
- ECDICT：form「v. 铺( pave的过去式和过去分词 ); 为…铺平道路」 / lemma「vt. 铺设, 安排, 铺满, 为...铺路 [化] 铺设」
- **建议：`keep`**

## geriatrics → geriatric
- rank：form 15400 / lemma 27405 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「老年病学」 / lemma「老年的；老年医学的」
- ECDICT：form「n. 老年人, 老年病人 [医] 老年医学, 老年病学, 老人学」 / lemma「a. 老年病学的, 衰老的, 老年的 [医] 老年医学的, 老年病学的, 老人学的」
- **建议：`keep`**

## molten → melt
- rank：form 15400 / lemma 7629 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「熔化的，炽热的」 / lemma「融化」
- ECDICT：form「a. 熔化的, 炽热的, 铸造的 melt的过去分词」 / lemma「n. 熔化, 熔化物, 溶解 v. (使)熔化, (使)溶解, (使)消散, (使)变软」
- **建议：`?`**

## knicks → knick
- rank：form 15408 / lemma 33391 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「尼克斯队（纽约球队）」 / lemma「小玩意儿；小刻痕」
- ECDICT：form「(knick 的第三人称 -s形式) n. 科尼克（德国公司名）」 / lemma「n. 科尼克（德国公司名）」
- **建议：`keep`**

## populated → populate
- rank：form 15420 / lemma 16000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「有人居住的」 / lemma「居住于；殖民于；使 populate」
- ECDICT：form「a. 粒子数增加的」 / lemma「vt. 使人口聚居在...中, 殖民于, 移民于, 居住于, 定居于」
- **建议：`keep`**

## shucks → shuck
- rank：form 15433 / lemma 37524 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哎呀（表失望）」 / lemma「剥壳；脱去」
- ECDICT：form「interj. 呸(表示不满或失望), 那有这回事」 / lemma「n. 壳, 外皮, 牡蛎壳 v. 剥去, 脱去」
- **建议：`keep`**

## tinkling → tinkle
- rank：form 15441 / lemma 16928 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「叮当声」 / lemma「叮当作响；小便」
- ECDICT：form「n. 叮叮声」 / lemma「n. 叮当声 vt. 使发丁当的声, 叮当地发出 vi. 叮当作响」
- **建议：`keep`**

## babs → bab
- rank：form 15466 / lemma 40139 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「芭布斯（人名昵称）」 / lemma「巴布（人名/称谓）」
- ECDICT：form「n. 芭布斯(Barbara,Babette的昵称)(f.)」 / lemma「n. 巴布（女子名, 等于Barbara）」
- **建议：`keep`**

## railing → rail
- rank：form 15468 / lemma 6137 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「栏杆；扶手」 / lemma「铁轨；栏杆」
- ECDICT：form「n. 扶手, 栏杆, 抱怨 [电] 高重回率的雷达脉冲排挤」 / lemma「n. 横杆, 围栏, 栏杆, 铁轨, 扶手, 秧鸡 vt. 以横木围栏, 给...铺铁轨 vi. 责骂, 抱怨」
- **建议：`?`**

## throbbing → throb
- rank：form 15497 / lemma 37580 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抽痛的；跳动的」 / lemma「搏动；抽痛」
- ECDICT：form「a. 跳动的, 悸动的, 抽动的, 震动的, 颤动的 [医] 搏动的」 / lemma「n. 跳动, 搏动 vi. 博动, 抽动, 颤动」
- **建议：`keep`**

## querying → query
- rank：form 15500 / lemma 23590 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「疑问的；探询的」 / lemma「疑问；查询」
- ECDICT：form「[计] 询问」 / lemma「n. 疑问, 疑问号, 质问, 查询 v. 询问, 质问 [计] 查询」
- **建议：`keep`**

## reeks → reek
- rank：form 15501 / lemma 17053 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「散发臭味；冒烟」 / lemma「散发恶臭；充满」
- ECDICT：form「n. 恶臭( reek的名词复数 ) v. 发出浓烈的臭气( reek的第三人称单数 ); 散发臭气; 发出难闻的气味 …」 / lemma「n. 烟, 水蒸气, 臭气散发 vi. 冒烟, 发臭气, 散发 vt. 用烟熏, 散发」
- **建议：`keep`**

## dunes → dune
- rank：form 15505 / lemma 17921 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「沙丘」 / lemma「沙丘」
- ECDICT：form「n. 沙丘( dune的复数形式 )」 / lemma「n. 沙丘」
- **建议：`keep`**

## christening → christen
- rank：form 15510 / lemma 24324 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「洗礼；命名仪式」 / lemma「为…施洗礼；命名」
- ECDICT：form「n. 洗礼仪式」 / lemma「vt. 为...施洗礼, 命名」
- **建议：`keep`**

## emissions → emission
- rank：form 15529 / lemma 26819 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「排放；排放物」 / lemma「排放；散发」
- ECDICT：form「n. 排放物( emission的复数形式 ); 散发物（尤指气体）」 / lemma「n. 发射, 射出, 发行 [医] 发射, 遗精」
- **建议：`keep`**

## overturned → overturn
- rank：form 15544 / lemma 15800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「推翻；翻转」 / lemma「推翻；颠覆；使翻倒」
- ECDICT：form「v. （使）翻倒( overturn的过去式和过去分词 ); 使垮台, 推翻; 撤销（判决等）」 / lemma「n. 倾覆, 破灭, 革命 vt. 推翻, 颠倒 vi. 翻倒」
- **建议：`keep`**

## coloring → color
- rank：form 15599 / lemma 1060 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「着色；色彩」 / lemma「颜色」
- ECDICT：form「n. 着色, 色彩, 色调, 面色, 气色, 外貌, 伪装, 色素, 颜料, 染料, 着色剂, 特质 [建] 着色, 染…」 / lemma「n. 颜色, 面色, 颜料, 外貌 vt. 把...涂上颜色, 粉饰, 使脸红, 歪曲 vi. 变色」
- **建议：`?`**

## mnemonics → mnemonic
- rank：form 15600 / lemma 20000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「记忆术；助记法」 / lemma「助记的；记忆口诀」
- ECDICT：form「n. 记忆术 [医] 记忆术」 / lemma「a. 记忆的, 助记的 n. 助记符 [计] 助记的, 助记符」
- **建议：`keep`**

## pestering → pester
- rank：form 15617 / lemma 21073 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「纠缠；烦扰」 / lemma「纠缠；烦扰」
- ECDICT：form「v. 使烦恼, 纠缠( pester的现在分词 )」 / lemma「vt. 不断打扰, 纠缠」
- **建议：`keep`**

## incarcerated → incarcerate
- rank：form 15648 / lemma 16300 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「被监禁的」 / lemma「监禁，关押」
- ECDICT：form「[医] 箝闭的」 / lemma「vt. 下狱, 监禁, 禁闭 [法] 监禁, 使下狱, 禁闭」
- **建议：`keep`**

## hemorrhaging → hemorrhage
- rank：form 15662 / lemma 18600 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「大出血；大量流失」 / lemma「出血；大出血」
- ECDICT：form「n. 出血, 溢血 v. 大出血; 损失(hemorrhage的ing形式)」 / lemma「n. 出血 [医] 出血」
- **建议：`keep`**

## grazing → graze
- rank：form 15676 / lemma 16721 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放牧；吃草」 / lemma「吃草；擦伤」
- ECDICT：form「n. 放牧, 牧草, 草场, 放牧法」 / lemma「n. 吃草, 放牧, 擦伤, 轻擦 v. (使)吃草, 放牧, 轻擦, 擦伤」
- **建议：`keep`**

## paging → page
- rank：form 15677 / lemma 8247 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「呼叫；翻页」 / lemma「页；页面」
- ECDICT：form「[计] 页式调度」 / lemma「n. 页, 记录, 事件, 专栏, 男侍 vt. 标明...的页数, 翻...的书页, 分页排版, 呼叫, 侍候 vi.…」
- **建议：`?`**

## polluted → pollute
- rank：form 15681 / lemma 25145 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受污染的」 / lemma「污染；玷污」
- ECDICT：form「a. 被污染的, 被玷污的, (美)(非正式)喝得烂醉的」 / lemma「vt. 污染, 弄脏, 玷污 [化] 污染」
- **建议：`keep`**

## revered → revere
- rank：form 15689 / lemma 17232 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受尊敬的；崇敬的」 / lemma「尊敬；崇敬」
- ECDICT：form「v. 崇敬, 尊崇, 敬畏（ revere的过去式和过去分词 ） a. 可敬的, 尊敬的」 / lemma「vt. 崇敬, 敬畏, 尊敬」
- **建议：`keep`**

## famished → famish
- rank：form 15715 / lemma 17000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「饿极了的」 / lemma「使饥饿；挨饿」
- ECDICT：form「a. 饥馑的」 / lemma「vt. 使挨饿 vi. 饥饿, 挨饿」
- **建议：`keep`**

## conspiring → conspire
- rank：form 15740 / lemma 21610 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「密谋；共谋（现在分词）」 / lemma「密谋；共谋」
- ECDICT：form「v. 密谋( conspire的现在分词 ); 搞阴谋; （事件等）巧合; 共同导致」 / lemma「vi. 阴谋, 协力, 共谋 vt. 图谋」
- **建议：`keep`**

## condescending → condescend
- rank：form 15745 / lemma 14800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「居高临下的；屈尊的」 / lemma「屈尊，居高临下」
- ECDICT：form「a. 谦逊的, 故意屈尊的, 有优越感的」 / lemma「vi. 谦逊, 屈就, 堕落」
- **建议：`?`**

## termites → termite
- rank：form 15754 / lemma 23771 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「白蚁（复数）」 / lemma「白蚁」
- ECDICT：form「n. 白蚁( termite的名词复数 )」 / lemma「n. 白蚁」
- **建议：`keep`**

## belches → belch
- rank：form 15784 / lemma 23517 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打嗝；喷出（第三人称单数）」 / lemma「打嗝；喷出」
- ECDICT：form「n. 嗳气( belch的名词复数 ); 喷吐; 喷出物 v. 打嗝( belch的第三人称单数 ); 喷出, 吐出; …」 / lemma「vi. 打嗝, 喷吐 vt. 打嗝, 吼叫着发出(命令), 喷吐 n. 打嗝, 喷吐」
- **建议：`keep`**

## hooligans → hooligan
- rank：form 15785 / lemma 18280 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「流氓；小混混（复数）」 / lemma「流氓；小混混」
- ECDICT：form「n. 小流氓, 街头恶棍( hooligan的复数形式 )」 / lemma「n. 小流氓 [法] 阿飞, 流氓, 街头恶棍」
- **建议：`keep`**

## hardened → harden
- rank：form 15800 / lemma 20852 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「变硬的；老练的」 / lemma「使变硬；使坚强」
- ECDICT：form「a. 变硬的；坚定的」 / lemma「vt. 使变硬, 使坚强, 使冷酷 vi. 变硬, 变冷酷」
- **建议：`keep`**

## militarized → militarize
- rank：form 15800 / lemma 17800 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「军事化的；武装起来的」 / lemma「使军事化」
- ECDICT：form「v. 军事化( militarize的过去式和过去分词 )」 / lemma「vt. 使军事化, 使军国化, 鼓吹军国主义」
- **建议：`keep`**

## sidelines → sideline
- rank：form 15806 / lemma 22440 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「边线；旁观立场」 / lemma「边线；副业」
- ECDICT：form「n. 副业( sideline的名词复数 ); 兼职; （球场等的）边线; 两侧场外区域 v. 使退出比赛( sidel…」 / lemma「n. 副业, 旁线, 界线, 兼职, 旁观者看法 vt. 使退出比赛场地」
- **建议：`keep`**

## packaging → package
- rank：form 15844 / lemma 2132 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「包装；包装材料」 / lemma「包裹；套餐」
- ECDICT：form「n. 包装, 包装业, 包装术 [计] 组装; 封装」 / lemma「n. 包裹, 套装软件, 包, 包装用物, 程序包 vt. 包装, 打包 a. 一揽子的 [计] 包, 软件包, 包装」
- **建议：`?`**

## palestinians → palestinian
- rank：form 15865 / lemma 13520 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「巴勒斯坦人（复数）」 / lemma「巴勒斯坦的」
- ECDICT：form「n. 巴勒斯坦人（palestinian的复数）」 / lemma「[经] 巴勒斯坦的」
- **建议：`keep`**

## vertebrae → vertebra
- rank：form 15878 / lemma 27490 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「脊椎（复数）」 / lemma「椎骨」
- ECDICT：form「椎骨, 脊椎骨, 脊椎 [医] 椎骨, 脊椎」 / lemma「n. 脊椎, 椎骨 [医] 椎骨, 脊髓」
- **建议：`keep`**

## downloading → download
- rank：form 15977 / lemma 7535 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「下载（现在分词）」 / lemma「下载」
- ECDICT：form「n. 下装, 下载；下传」 / lemma「[计] 卸载, 下栽」
- **建议：`keep`**

## nauseating → nauseate
- rank：form 16000 / lemma 22400 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「令人作呕的」 / lemma「使恶心，使厌恶」
- ECDICT：form「a. 作呕的, 恶心的, 厌恶的」 / lemma「vi. 作呕, 产生恶感, 厌恶 vt. 使厌恶, 使恶心」
- **建议：`keep`**

## transposed → transpose
- rank：form 16000 / lemma 17800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「转调的；被调换位置的」 / lemma「调换位置；变调」
- ECDICT：form「转置的」 / lemma「vt. 调换, 颠倒顺序, 移项 vi. 互换位置 [计] 转置」
- **建议：`keep`**

## synced → sync
- rank：form 16003 / lemma 2847 ｜ type `p` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「同步（过去式/过去分词）」 / lemma「同步；同步更新」
- ECDICT：form「n. synchronization 的缩略词 v. synchronize 的缩略词 [网络] 同步」 / lemma「[计] 同步的」
- **建议：`keep`**

## insinuating → insinuate
- rank：form 16009 / lemma 30225 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「含沙射影的；暗示的」 / lemma「暗示；含沙射影」
- ECDICT：form「a. 曲意巴结的, 暗示的」 / lemma「vt. 巴结, 暗示, 使滋长 vi. 旁敲侧击」
- **建议：`keep`**

## enslaved → enslave
- rank：form 16011 / lemma 16200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「被奴役的；受奴役的」 / lemma「奴役；使成为奴隶」
- ECDICT：form「v. 使成为奴隶( enslave的过去式和过去分词 ); 奴役; <正>使受控制; 征服」 / lemma「vt. 奴役, 束缚, 使受控制, 征服」
- **建议：`keep`**

## cloning → clone
- rank：form 16036 / lemma 7823 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「克隆；无性繁殖」 / lemma「克隆；无性繁殖」
- ECDICT：form「[计] 研制兼容产品 [化] 克隆」 / lemma「n. 无性系 [计] 代用件」
- **建议：`?`**

## poaching → poach
- rank：form 16047 / lemma 24743 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「偷猎；水煮（蛋）」 / lemma「偷猎；水煮」
- ECDICT：form「[经] 猎取, 盗取」 / lemma「vt. 水煮(蛋), 偷猎, 侵入, 窃取 vi. 偷猎, 陷入泥中」
- **建议：`keep`**

## cummings → cumming
- rank：form 16075 / lemma 45364 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「卡明斯（姓氏）」 / lemma「（cum的现在分词）射精；达到高潮」
- ECDICT：form「n. 卡明斯（人名）」 / lemma「n. (Cumming)人名；(英)卡明 卡明」
- **建议：`keep`**

## danes → dane
- rank：form 16093 / lemma 9331 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「丹麦人（复数）」 / lemma「丹麦人」
- ECDICT：form「n. 丹麦人（Dane的复数）；丹族」 / lemma「n. 丹麦人」
- **建议：`keep`**

## tentacles → tentacle
- rank：form 16126 / lemma 16500 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「触手；触角(复数)」 / lemma「触手，触须」
- ECDICT：form「n. <动>触手( tentacle的复数形式 ); 触角; 触须; <植>触毛」 / lemma「n. 触须, 触手, 触角 [医] 触角, 触须」
- **建议：`keep`**

## intoxicating → intoxicate
- rank：form 16132 / lemma 15500 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人陶醉的；醉人的」 / lemma「使醉；使兴奋」
- ECDICT：form「a. 醉人的,使人兴奋的」 / lemma「vt. 使陶醉, 使喝醉」
- **建议：`?`**

## sharper → sharpe
- rank：form 16143 / lemma 10943 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「更锋利的；更敏锐的」 / lemma「夏普（姓氏）」
- ECDICT：form「n. 骗子, 欺诈者, 赌棍 [法] 欺骗者, 欺诈犯」 / lemma「n. 夏普指数；夏普指标；夏普（人名）」
- **建议：`keep`**

## resurrected → resurrect
- rank：form 16148 / lemma 17582 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使复活；复兴(过去式)」 / lemma「使复活；恢复」
- ECDICT：form「v. 使复活( resurrect的过去式和过去分词 ); 使复苏; 使再活跃; 使再流行」 / lemma「vi. 复活 vt. 使复活, 复兴, 恢复, 盗掘」
- **建议：`keep`**

## dilated → dilate
- rank：form 16159 / lemma 42816 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「扩张的；放大的」 / lemma「扩张；详述」
- ECDICT：form「a. 扩大的；加宽的；膨胀的」 / lemma「vi. 扩大, 详述, 膨胀 vt. 使膨胀」
- **建议：`keep`**

## tingling → tingle
- rank：form 16209 / lemma 19793 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刺痛的；发麻的」 / lemma「感到刺痛；发麻」
- ECDICT：form「[医] 麻刺感」 / lemma「vi. 激动, 感到刺痛, 抖动 vt. 使感刺痛 n. 刺痛, 震颤, 耳鸣」
- **建议：`keep`**

## brits → brit
- rank：form 16211 / lemma 17457 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「英国人（口语）」 / lemma「英国人（口语）」
- ECDICT：form「n. 布里茨（男子名）；英国人（Brit的复数）」 / lemma「n. 小海生动物, 小鲱鱼」
- **建议：`keep`**

## neanderthals → neanderthal
- rank：form 16215 / lemma 16406 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「尼安德特人；粗人」 / lemma「尼安德特人；粗野的人」
- ECDICT：form「n. 尼安德塔人；穴居人（Neanderthal的复数）」 / lemma「a. 穴居人的」
- **建议：`keep`**

## variables → variable
- rank：form 16224 / lemma 17164 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「变量；可变因素」 / lemma「可变的；多变的」
- ECDICT：form「n. 变量」 / lemma「n. 易变的事物, 变数, 可变物, 变量 a. 可变的, 不定的, 易变的, 变量的 [计] 变量」
- **建议：`keep`**

## moping → mope
- rank：form 16226 / lemma 22729 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闷闷不乐；闲荡」 / lemma「闷闷不乐；无精打采」
- ECDICT：form「v. <贬>忧郁地闲荡( mope的现在分词 )」 / lemma「vi. 忧郁, 闲荡 vt. 使忧郁 n. 忧郁的人」
- **建议：`keep`**

## yapping → yap
- rank：form 16235 / lemma 17217 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「狂吠；喋喋不休」 / lemma「(狗)狂吠；喋喋不休」
- ECDICT：form「v. <贬> （尤指小狗）尖叫, 狂吠( yap的现在分词 ); <非正>（对一些无关紧要的事）哇啦哇啦地说个不停」 / lemma「vi. 狂吠, 瞎扯, 责骂 n. 狂吠, 狂吠声, 废话, 乖戾的人」
- **建议：`keep`**

## smitten → smite
- rank：form 16239 / lemma 24423 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「迷恋的；被打动的」 / lemma「重击；打击」
- ECDICT：form「smite的过去分词」 / lemma「vt. 重击, 打, 击败, 毁灭, 侵袭, 打动 vi. 重击, 打 n. 重击, 打」
- **建议：`keep`**

## taunting → taunt
- rank：form 16286 / lemma 20019 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「嘲弄；讥讽」 / lemma「嘲笑；讥讽」
- ECDICT：form「v. 嘲讽( taunt的现在分词 ); 嘲弄; 辱骂; 奚落」 / lemma「n. 辱骂, 嘲弄 vt. 嘲弄, 奚落 a. 很高的」
- **建议：`keep`**

## overflowing → overflow
- rank：form 16300 / lemma 18548 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「溢出的；充满的」 / lemma「溢出；泛滥」
- ECDICT：form「a. 溢出的, 充沛的, 过剩的 n. 溢出, 溢出物, 剩余, 洋溢, 充沛」 / lemma「n. 溢值, 超值, 泛滥 v. (使)泛滥, (使)溢出, (使)充溢 [计] 上溢; 溢出」
- **建议：`keep`**

## obsessing → obsess
- rank：form 16309 / lemma 23769 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使着迷；困扰」 / lemma「使着迷；使困扰」
- ECDICT：form「v. 时刻困扰( obsess的现在分词 ); 缠住; 使痴迷; 使迷恋」 / lemma「vt. 迷住, 使困扰」
- **建议：`keep`**

## slurps → slurp
- rank：form 16319 / lemma 26196 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「出声地吃喝」 / lemma「出声地喝；咕噜」
- ECDICT：form「n. 啧啧吃的声音( slurp的名词复数 ) v. 啜食( slurp的第三人称单数 )」 / lemma「n. 吃的声音 v. 出声地吃(或喝)」
- **建议：`keep`**

## ravishing → ravish
- rank：form 16325 / lemma 43040 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「迷人的；令人陶醉的」 / lemma「使狂喜；强夺」
- ECDICT：form「a. 引人入胜的」 / lemma「vt. 强夺, 夺走, 使出神, 强奸 [法] 强夺, 抢去, 强奸」
- **建议：`keep`**

## superpowers → superpower
- rank：form 16334 / lemma 16744 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「超级大国；超能力」 / lemma「超级大国；超能力」
- ECDICT：form「n. 超级大国( superpower的复数形式 )」 / lemma「n. 超级强权, 超级大国 [经] 超级大国」
- **建议：`keep`**

## poached → poach
- rank：form 16339 / lemma 24743 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「水煮；偷猎」 / lemma「偷猎；水煮」
- ECDICT：form「v. 水煮（荷包蛋）( poach的过去式和过去分词 ); 侵入他人地界偷猎」 / lemma「vt. 水煮(蛋), 偷猎, 侵入, 窃取 vi. 偷猎, 陷入泥中」
- **建议：`keep`**

## clothed → clothe
- rank：form 16362 / lemma 24236 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「穿着衣服的」 / lemma「给…穿衣；供给衣服」
- ECDICT：form「clothe的过去式和过去分词」 / lemma「vt. 给...穿衣, 盖上, 赋予」
- **建议：`keep`**

## striped → stripe
- rank：form 16389 / lemma 16857 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有条纹的」 / lemma「条纹；条带」
- ECDICT：form「a. 有斑纹的」 / lemma「n. 斑纹, 条纹 [医] 纹, 条纹」
- **建议：`keep`**

## blisters → blister
- rank：form 16391 / lemma 20960 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「水疱（复数）」 / lemma「水疱；气泡」
- ECDICT：form「n. 水疱( blister的名词复数 ); 水肿; 气泡」 / lemma「n. 水疱 [化] 砂眼」
- **建议：`keep`**

## fortified → fortify
- rank：form 16400 / lemma 12400 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「加强的；设防的」 / lemma「加强，增强；设防」
- ECDICT：form「a. 加强的」 / lemma「vt. 设要塞于, 加强, 使坚强, 增加 vi. 筑防御工事」
- **建议：`?`**

## ingratiating → ingratiate
- rank：form 16400 / lemma 19500 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「讨好的；迎合的」 / lemma「讨好；巴结」
- ECDICT：form「a. 逢迎的, 迎合的」 / lemma「vt. 使迎合, 使讨好」
- **建议：`keep`**

## overpopulated → overpopulate
- rank：form 16400 / lemma 23500 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「人口过剩的」 / lemma「使人口过密」
- ECDICT：form「a. 人口过多的」 / lemma「vt.使(一地区)人口过剩,使人口过密」
- **建议：`keep`**

## huntsmen → huntsman
- rank：form 16457 / lemma 30224 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「猎人（复数）」 / lemma「猎人」
- ECDICT：form「n. 猎人( huntsman的名词复数 ); 管猎犬的人」 / lemma「n. 猎人, 管猎犬者」
- **建议：`keep`**

## toenails → toenail
- rank：form 16488 / lemma 26114 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚趾甲」 / lemma「脚趾甲」
- ECDICT：form「n. 脚趾甲( toenail的名词复数 ); （木匠用的）斜钉」 / lemma「n. 脚趾甲, 斜钉 [医] 趾甲」
- **建议：`keep`**

## imploring → implore
- rank：form 16500 / lemma 19000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「恳求的；哀求的」 / lemma「恳求，哀求」
- ECDICT：form「a. 恳求的, 哀求的」 / lemma「vt. 恳求, 哀求」
- **建议：`keep`**

## labored → labor
- rank：form 16500 / lemma 3115 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「吃力的；矫揉造作的」 / lemma「劳动；劳工」
- ECDICT：form「a. 吃力的, 缓慢的, 不自然的, 矫揉造作的」 / lemma「n. 劳动, 努力, 工作, 劳工, 分娩 vi. 劳动, 努力, 苦干 vt. 详细分析, 使厌烦」
- **建议：`?`**

## mongering → monger
- rank：form 16500 / lemma 40796 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「贩卖行为，（不良事物的）散布」 / lemma「商人；贩子」
- ECDICT：form「v. 买卖 a. 买卖的」 / lemma「n. 商人, ...商, ...贩 vt. 贩卖, 传播」
- **建议：`keep`**

## massacred → massacre
- rank：form 16531 / lemma 6219 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「屠杀；大量杀害」 / lemma「大屠杀；惨败」
- ECDICT：form「vt. 残杀；彻底击败 n. 大屠杀；惨败 n. (Massacre)人名；(法)马萨克尔」 / lemma「n. 大屠杀 vt. 大屠杀, 残杀」
- **建议：`?`**

## portrayed → portray
- rank：form 16543 / lemma 19479 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「描绘；扮演」 / lemma「描绘；扮演」
- ECDICT：form「v. 画像( portray的过去式和过去分词 ); 描述; 描绘; 描画」 / lemma「vt. 描绘, 描写, 描绘...的肖像」
- **建议：`keep`**

## lyons → lyon
- rank：form 16560 / lemma 10223 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「里昂（地名）」 / lemma「里昂（法国城市）」
- ECDICT：form「n. 里昂」 / lemma「n. 里昂」
- **建议：`keep`**

## reinstated → reinstate
- rank：form 16606 / lemma 21578 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恢复；复职」 / lemma「恢复职位；使复职」
- ECDICT：form「v. 使恢复原职, 使恢复原有权利( reinstate的过去式和过去分词 ); 把…放回原处」 / lemma「vt. 使复原, 使恢复, 使复立」
- **建议：`keep`**

## blabbering → blabber
- rank：form 16623 / lemma 28323 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喋喋不休；胡说」 / lemma「喋喋不休；泄密」
- ECDICT：form「n. 多嘴的人；泄密者；胡言乱语 vi. 胡扯；喋喋不休」 / lemma「n. 多嘴的人」
- **建议：`keep`**

## siding → side
- rank：form 16632 / lemma 324 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「壁板；侧线」 / lemma「边；侧面」
- ECDICT：form「n. 侧线, 旁轨, 边宽」 / lemma「n. 旁边, 侧, 方面, 胁, 侧边, 血统 a. 旁的, 侧的, 次要的 vt. 同意, 支持 vi. 支持, 赞助」
- **建议：`?`**

## compressed → compress
- rank：form 16659 / lemma 20824 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「压缩的；压紧的」 / lemma「压缩；压紧」
- ECDICT：form「a. 被压缩的, 扁平的」 / lemma「vt. 压缩, 压紧 vi. 受压缩小 [计] 压缩程序」
- **建议：`keep`**

## aspiring → aspire
- rank：form 16663 / lemma 17026 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「有抱负的；有志的」 / lemma「渴望，立志」
- ECDICT：form「a. 有抱负的, 有志气的」 / lemma「vi. 渴望, 立志于」
- **建议：`keep`**

## moped → mope
- rank：form 16672 / lemma 22729 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轻便摩托车」 / lemma「闷闷不乐；无精打采」
- ECDICT：form「n. 助动车」 / lemma「vi. 忧郁, 闲荡 vt. 使忧郁 n. 忧郁的人」
- **建议：`keep`**

## daydreaming → daydream
- rank：form 16712 / lemma 20349 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「做白日梦；空想」 / lemma「白日梦；幻想」
- ECDICT：form「v. 空想；做白日梦（daydream的ing形式）」 / lemma「n. 白日梦 vi. 做白日梦」
- **建议：`keep`**

## sickening → sicken
- rank：form 16732 / lemma 37105 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人作呕的；令人厌恶的」 / lemma「使恶心；生病」
- ECDICT：form「a. 引起疾病的, 引起呕吐的, 令人厌恶的, 使人作呕的」 / lemma「vt. 患病, 使厌倦, 使恶心 vi. 生病, 作呕」
- **建议：`keep`**

## freckles → freckle
- rank：form 16738 / lemma 32821 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雀斑（复数）」 / lemma「雀斑」
- ECDICT：form「n. 雀斑（freckle的复数）」 / lemma「n. 雀斑, 斑点 [医] 非曝露部雀斑」
- **建议：`keep`**

## enraged → enrage
- rank：form 16745 / lemma 46804 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「暴怒的；激怒的」 / lemma「激怒；使暴怒」
- ECDICT：form「v. 使暴怒( enrage的过去式和过去分词 ); 歜; 激愤」 / lemma「vt. 激怒, 使暴怒」
- **建议：`keep`**

## oscars → oscar
- rank：form 16772 / lemma 2419 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「奥斯卡奖（复数）」 / lemma「奥斯卡（人名/奖）」
- ECDICT：form「abbr. one-way synchronous collision avoidance and ranging sy…」 / lemma「n. 奥斯卡金像奖, 钱, 现金」
- **建议：`keep`**

## klingons → klingon
- rank：form 16778 / lemma 9730 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「克林贡人（虚构种族）」 / lemma「克林贡语（星际迷航）」
- ECDICT：form「(Klingon 的复数) n. 克林贡语」 / lemma「n. 克林贡语」
- **建议：`keep`**

## interwoven → interweave
- rank：form 16800 / lemma 15500 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「交织的，紧密相连的」 / lemma「交织，交错」
- ECDICT：form「v. 互相编织」 / lemma「v. (使)交织, 织进, (使)混杂」
- **建议：`?`**

## minutiae → minutia
- rank：form 16800 / lemma 18600 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「细枝末节；琐碎细节」 / lemma「细枝末节，细节」
- ECDICT：form「n. 微小；不重要的细节（minutia的复数）」 / lemma「n. 细节, 琐事」
- **建议：`keep`**

## misreporting → misreport
- rank：form 16800 / lemma 19200 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「虚报；误报」 / lemma「误报，错误报道」
- ECDICT：form「(misreport 的现在分词) [法] 谎报, 误报, 报导不实」 / lemma「[法] 谎报, 误报, 报导不实」
- **建议：`keep`**

## serbs → serb
- rank：form 16813 / lemma 24151 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「塞尔维亚人（复数）」 / lemma「塞尔维亚人」
- ECDICT：form「n. 塞尔维亚人（Serb的复数形式）」 / lemma「n. 塞尔维亚人[语] a. 塞尔维亚的, 塞尔维亚人[语]的」
- **建议：`keep`**

## derived → derive
- rank：form 16814 / lemma 26733 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「源自；获得（过去式）」 / lemma「源自；获得；推导」
- ECDICT：form「a. 导出的；衍生的, 派生的」 / lemma「vt. 得自 vi. 起源」
- **建议：`keep`**

## pointers → pointer
- rank：form 16827 / lemma 21276 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「指针；提示（复数）」 / lemma「指针；提示；指示犬」
- ECDICT：form「n. 指极星；指针；指标（pointer的复数）」 / lemma「n. 指示物, 教鞭, 暗示, 指针 [计] 指针」
- **建议：`keep`**

## abbreviated → abbreviate
- rank：form 16900 / lemma 15500 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「缩写形式的；缩短的」 / lemma「缩写；缩短」
- ECDICT：form「[计] 缩写的, 短缩的, 简写的, 简略的, 缩略的 [医] 减短的, 缩减的, 省略的」 / lemma「vt. 缩写, 使...简略, 缩短 vi. 使用缩写词」
- **建议：`?`**

## holling → holl
- rank：form 16907 / lemma 41659 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「霍林（人名）」 / lemma「（专名）霍尔」
- ECDICT：form「(holl 的现在分词) 穴」 / lemma「穴」
- **建议：`keep`**

## rumored → rumor
- rank：form 16914 / lemma 3802 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「传闻的；据传的」 / lemma「谣言；传闻」
- ECDICT：form「a. 传闻的, 谣传的」 / lemma「n. 谣言, 传闻 vt. 谣传」
- **建议：`?`**

## botched → botch
- rank：form 16924 / lemma 37627 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「搞砸的；拙劣的」 / lemma「搞砸；弄糟」
- ECDICT：form「v. 修补( botch的过去式和过去分词 ); 搞坏, 搞砸, 笨拙地做」 / lemma「v. 拙笨地修补, 糟蹋 n. 拙笨的修补, 难看的补缀」
- **建议：`keep`**

## floorboards → floorboard
- rank：form 16942 / lemma 27142 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地板条」 / lemma「地板（一块）」
- ECDICT：form「v. 将汽车油门踏到底」 / lemma「n. 一块地板, 汽车底部板」
- **建议：`keep`**

## poachers → poacher
- rank：form 16952 / lemma 20836 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「偷猎者」 / lemma「偷猎者；盗捕者」
- ECDICT：form「n. 偷猎者；侵入者（poacher的复数）」 / lemma「n. 偷猎者, 侵入者, 炖蛋锅」
- **建议：`keep`**

## flunked → flunk
- rank：form 16971 / lemma 19568 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「考试不及格」 / lemma「不及格；考试失败」
- ECDICT：form「v. <美><口>( flunk的过去式和过去分词 ); （使）（考试、某学科的成绩等）不及格; 评定（某人）不及格; …」 / lemma「n. 失败, 不及格 vi. 失败, 考试不及格, 放弃 vt. 使不及格」
- **建议：`keep`**

## sparring → spar
- rank：form 16972 / lemma 20990 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「对练；争论」 / lemma「拳击；争论」
- ECDICT：form「n. 对打；夹条板, 保护条」 / lemma「n. 晶石, 圆材, 拳斗, 争论 vt. 装圆材于 vi. 拳斗, 争论」
- **建议：`keep`**

## larvae → larva
- rank：form 16990 / lemma 25752 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「幼虫（复数）」 / lemma「幼虫」
- ECDICT：form「幼虫(昆虫), 幼体, 蚴(蠕虫) [医] 幼虫(昆虫), 蚴(蠕虫)」 / lemma「n. 幼虫 [医] 幼虫(昆虫), 蚴(蠕虫)」
- **建议：`keep`**

## dignitaries → dignitary
- rank：form 17000 / lemma 19800 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「显要人物，名流」 / lemma「显贵，高官」
- ECDICT：form「n. 显要人物, 权贵( dignitary的名词复数 )」 / lemma「n. 高贵的人, 高官, 高僧, 要人」
- **建议：`keep`**

## riled → rile
- rank：form 17002 / lemma 30983 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「恼火的，被激怒的」 / lemma「激怒；惹恼」
- ECDICT：form「v. 惹恼, 激怒( rile的过去式和过去分词 )」 / lemma「vt. 搅浑, 惹怒, 使焦急」
- **建议：`keep`**

## presiding → preside
- rank：form 17004 / lemma 29426 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「主持的，主管的」 / lemma「主持；主管」
- ECDICT：form「a. 主持会议的, 主持的, 首席的 [法] 主持的, 执行的」 / lemma「vi. 统辖, 当主人, 主持 [法] 主持, 负责, 指挥」
- **建议：`keep`**

## lacerations → laceration
- rank：form 17030 / lemma 18700 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「撕裂伤，割伤（复数）」 / lemma「撕裂，裂伤」
- ECDICT：form「n. 撕裂( laceration的复数形式 ); 割破; 裂痕; 苦恼」 / lemma「n. 划破, 割破, 裂伤撕碎 [医] 撕裂, 裂伤」
- **建议：`keep`**

## yelping → yelp
- rank：form 17038 / lemma 18568 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（狗）吠叫（现在分词）」 / lemma「尖叫；吠叫」
- ECDICT：form「v. 发出短而尖的叫声( yelp的现在分词 )」 / lemma「n. 尖声急叫, 狺吠, 叫喊声 vi. 尖声急叫, 叫吠, 叫喊 vt. 叫喊着说」
- **建议：`keep`**

## overworked → overwork
- rank：form 17077 / lemma 15000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「工作过度的，劳累的」 / lemma「使工作过度；过度使用」
- ECDICT：form「a. 工作过度的；劳累过度的」 / lemma「n. 过度操劳的工作, 额外工作 v. (使)工作过度, 使过分劳累」
- **建议：`?`**

## enlarged → enlarge
- rank：form 17114 / lemma 19756 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「放大的；扩大的」 / lemma「扩大；放大」
- ECDICT：form「v. 扩大( enlarge的过去式和过去分词 ); 扩展; 扩充; 放大」 / lemma「vt. 扩大, 增大 vi. 扩大, 详述」
- **建议：`keep`**

## hindus → hindu
- rank：form 17134 / lemma 9301 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「印度教徒（复数）」 / lemma「印度教徒；印度教的」
- ECDICT：form「n. 印度人, （尤指印度北部的）印度斯坦人（信奉印度教）( Hindu的名词复数 ); [人名] 欣德斯」 / lemma「a. 印度教教徒的 n. 印度教教徒」
- **建议：`keep`**

## clippings → clipping
- rank：form 17158 / lemma 19359 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「剪报；剪下的碎屑」 / lemma「剪报；修剪」
- ECDICT：form「n. 剪下的碎边；剪报（clipping的复数形式）」 / lemma「n. 剪断, 剪裁, 剪下物, 剪报 a. 第一流的, 头等的, 极好的, 快速的 [计] 剪取; 削波」
- **建议：`keep`**

## poised → poise
- rank：form 17168 / lemma 23714 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「镇定的；准备就绪的」 / lemma「沉着；平衡」
- ECDICT：form「a. 平衡的, 均衡的, [表]作好准备的, (褒)沉着的, 泰然自若的, 自信的」 / lemma「n. 平衡, 均衡, 姿势, 镇静, 安静, 砝码 vt. 使平衡, 使悬着, 保持...姿势 vi. 平衡, 悬着, …」
- **建议：`keep`**

## duped → dupe
- rank：form 17192 / lemma 24612 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「欺骗；愚弄(过去式)」 / lemma「欺骗；愚弄」
- ECDICT：form「v. 欺骗或哄骗某人（做某事）( dupe的过去式和过去分词 )」 / lemma「n. 傻瓜, 易受骗的人 vt. 欺骗, 愚弄」
- **建议：`keep`**

## hydrated → hydrate
- rank：form 17200 / lemma 27716 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「含水的，水合的」 / lemma「补水；水合」
- ECDICT：form「a. [化]含水的,与水结合的」 / lemma「n. 水合物, 水化合物, 氢氧化物 vt. 使成水化合物」
- **建议：`keep`**

## posited → posit
- rank：form 17200 / lemma 20600 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「被假定设定的；放置的」 / lemma「假定；认定」
- ECDICT：form「v. 假定, 设想, 假设( posit的过去式和过去分词 )」 / lemma「vt. 假设, 安置, 布置」
- **建议：`keep`**

## disoriented → disorientate
- rank：form 17219 / lemma 14800 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「迷失方向的；困惑的」 / lemma「使迷失方向，使失去判断力」
- ECDICT：form「a. 无判断力的；分不清方向或目标的」 / lemma「vt. 使失去方向, 使迷惑」
- **建议：`?`**

## circulating → circulate
- rank：form 17326 / lemma 17982 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「循环；流通；传播」 / lemma「循环；传播」
- ECDICT：form「a. 循环的, 流通的 [经] 流动」 / lemma「v. (使)流通, (使)循环, (使)传播」
- **建议：`keep`**

## apostles → apostle
- rank：form 17367 / lemma 19771 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使徒；倡导者（复数）」 / lemma「使徒；倡导者」
- ECDICT：form「n. (A-)（基督教的）使徒( apostle的复数形式 ); 早期基督教的传教士; 摩门教教会的十二个行政执事之一;…」 / lemma「n. 基督十二使徒之一, 早期基督教传士」
- **建议：`keep`**

## push-ups → push-up
- rank：form 17393 / lemma 31488 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「俯卧撑（复数）」 / lemma「俯卧撑」
- ECDICT：form「n. 俯卧撑( push-up的复数形式 )」 / lemma「n. 俯伏撑 [机] 模面挤凹」
- **建议：`keep`**

## besotted → besot
- rank：form 17400 / lemma 28000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「痴迷的，沉醉的」 / lemma「使痴迷；使陶醉」
- ECDICT：form「a. 愚蠢的, 糊涂的」 / lemma「vt. 使糊涂, 使痴迷, 使沉醉」
- **建议：`keep`**

## dilapidated → dilapidate
- rank：form 17400 / lemma 25200 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「破旧的，坍塌的」 / lemma「使倒塌；使荒废」
- ECDICT：form「a. 破坏的；荒废的, 要塌似的」 / lemma「v. (使)荒废, (使)毁坏」
- **建议：`keep`**

## iterated → iterate
- rank：form 17400 / lemma 16000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「重复的，迭代的」 / lemma「反复说，重复」
- ECDICT：form「v. 重复( iterate的过去式和过去分词 ); 反复申明」 / lemma「vt. 反复说, 重复 [计] 迭代」
- **建议：`?`**

## scoffing → scoff
- rank：form 17406 / lemma 24055 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘲笑；讥讽」 / lemma「嘲笑；讥讽」
- ECDICT：form「v. 嘲笑, 嘲弄( scoff的现在分词 )」 / lemma「n. 嘲笑, 愚弄, 笑柄, 食品 v. 嘲笑, 嘲弄, 贪吃, 狼吞虎咽地吃」
- **建议：`keep`**

## reassigned → reassign
- rank：form 17419 / lemma 38807 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「重新分配；调任」 / lemma「重新分配；改派」
- ECDICT：form「再指定」 / lemma「vt. 再分配, 再指定 [经] 转交, 转让」
- **建议：`keep`**

## mutated → mutate
- rank：form 17442 / lemma 29291 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「突变；变异」 / lemma「变异；突变」
- ECDICT：form「v. （使某物）变化( mutate的过去式和过去分词 ); 转变; 突变; 变异」 / lemma「vi. 变化, 产生变异, 变化元音 vt. 使变异」
- **建议：`keep`**

## heightened → heighten
- rank：form 17445 / lemma 37663 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「加强的；提高的」 / lemma「提高；增强」
- ECDICT：form「v. （使）变高, （使）增大( heighten的过去式和过去分词 ); （使）提高; （使）加强[重]」 / lemma「vt. 增高, 提高, 加强 vi. 升高, 变大」
- **建议：`keep`**

## gaping → gape
- rank：form 17451 / lemma 43038 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「张开的；裂开的」 / lemma「目瞪口呆地看；张开」
- ECDICT：form「a. 多洞穴的」 / lemma「n. 裂口, 张嘴, 打哈欠 vi. 裂开, 张嘴, 打哈欠」
- **建议：`keep`**

## oars → oar
- rank：form 17453 / lemma 18575 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「船桨（复数）」 / lemma「桨；橹」
- ECDICT：form「n. 桨；桨手（oar的复数）」 / lemma「n. 桨, 桨手, 搅棒 vi. 划桨 vt. 划动」
- **建议：`keep`**

## surpassed → surpass
- rank：form 17461 / lemma 19148 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「超越；胜过」 / lemma「超过；胜过」
- ECDICT：form「v. 超过( surpass的过去式和过去分词 ); 优于; 多于; 非…所能办到」 / lemma「vt. 超越, 凌驾, 胜过」
- **建议：`keep`**

## illustrated → illustrate
- rank：form 17475 / lemma 20072 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「说明；配插图」 / lemma「说明；举例；插图」
- ECDICT：form「n. 有插画的报章杂志」 / lemma「vt. 举例说明, 作图解, 阐明 vi. 举例说明」
- **建议：`keep`**

## ems → em
- rank：form 17487 / lemma 378 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「紧急医疗服务（缩写）」 / lemma「他们（口语 them）」
- ECDICT：form「扩展内存规范 [计] 电子邮件系统, 电子报文系统, 特快专递, 扩展内存规范」 / lemma「[计] 媒体用毕符 [化] 射气」
- **建议：`keep`**

## displaced → displace
- rank：form 17490 / lemma 41324 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「流离失所的；被取代的」 / lemma「取代；使离开家园」
- ECDICT：form「a. 位移的；无家可归的；被取代的」 / lemma「vt. 移置, 替换, 转移」
- **建议：`keep`**

## indisposed → indispose
- rank：form 17500 / lemma 20000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「不愿意的；身体不适的」 / lemma「使不愿；使不适」
- ECDICT：form「a. 厌恶的, 不舒服的, 不能的」 / lemma「vt. 使厌恶, 使不适当, 使不能」
- **建议：`keep`**

## lacerating → lacerate
- rank：form 17500 / lemma 20100 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「撕裂般的；尖刻的」 / lemma「撕裂，割裂；伤害感情」
- ECDICT：form「v. 撕伤, 刮伤( lacerate的现在分词 ); 伤害（感情等）」 / lemma「vt. 划破, 割破, 使痛心, 撕碎 a. 撕碎的, 受折磨的」
- **建议：`keep`**

## erupted → erupt
- rank：form 17525 / lemma 18917 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「爆发；喷发（过去式）」 / lemma「爆发；喷发」
- ECDICT：form「v. 爆发( erupt的过去式和过去分词 ); 喷发; 突然发生; 出疹」 / lemma「vi. 爆发 vt. 喷出」
- **建议：`keep`**

## swirling → swirl
- rank：form 17556 / lemma 19790 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「旋转的；打旋的」 / lemma「旋转；打旋」
- ECDICT：form「n. 漩涡；涡流」 / lemma「n. 漩涡, 涡动 vt. 使成漩涡 vi. 打漩, 盘绕, 眩晕」
- **建议：`keep`**

## spilt → spill
- rank：form 17573 / lemma 4243 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洒出；溢出（过去式）」 / lemma「洒出；溢出」
- ECDICT：form「spill的过去式和过去分词」 / lemma「n. 溢出, 溅出, 摔下, 溢出量, 木片, 小塞子 vt. 使溢出, 使散落, 洒, 使流出, 倒出, 使摔下 vi…」
- **建议：`?`**

## tampons → tampon
- rank：form 17589 / lemma 18297 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「卫生棉条（复数）」 / lemma「卫生棉条」
- ECDICT：form「n. （妇女月经时用的）卫生棉塞( tampon的名词复数 ) v. （妇女月经时用的）卫生棉塞( tampon的第三人…」 / lemma「n. 塞子, 棉塞, 止血棉塞 vt. 用棉塞塞」
- **建议：`keep`**

## authorised → authorise
- rank：form 17613 / lemma 35024 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「经授权的；认可的」 / lemma「授权；批准（英式拼写）」
- ECDICT：form「a. 授权的 v. 授权（authorise的过去式）」 / lemma「vt. 授权；批准；允许；委任（等于authorize）」
- **建议：`keep`**

## urinating → urinate
- rank：form 17618 / lemma 19651 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「排尿；小便」 / lemma「排尿；小便」
- ECDICT：form「v. 排尿, 撒尿( urinate的现在分词 )」 / lemma「vi. 小便, 撒尿 [医] 排尿」
- **建议：`keep`**

## seasoning → season
- rank：form 17626 / lemma 1214 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「调味品；佐料」 / lemma「季节；赛季」
- ECDICT：form「n. 调味品, 作料, 佐料, 锻练 [化] 天然时效」 / lemma「n. 季节, 时节, 当令期, 时期 vt. 给...调味, 使成熟, 使老练, 缓和 vi. 变干燥」
- **建议：`?`**

## encoded → encode
- rank：form 17663 / lemma 45509 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编码；加密」 / lemma「编码；加密」
- ECDICT：form「a. 编码的」 / lemma「vt. 把(电文、情报等)译成密码 [计] 编码」
- **建议：`keep`**

## abrasions → abrasion
- rank：form 17741 / lemma 34053 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「擦伤，磨损处」 / lemma「磨损；擦伤」
- ECDICT：form「n. 磨损( abrasion的复数形式 ); 擦伤处; <喻>摩擦; <地质>磨蚀（作用）」 / lemma「n. 磨擦, 磨损, 磨损处 [化] 磨耗; 磨蚀」
- **建议：`keep`**

## loitering → loiter
- rank：form 17768 / lemma 36407 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「闲荡，徘徊」 / lemma「闲逛；徘徊」
- ECDICT：form「[法] 游荡」 / lemma「v. 闲荡, 虚度, 徘徊」
- **建议：`keep`**

## fireflies → firefly
- rank：form 17794 / lemma 18099 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「萤火虫」 / lemma「萤火虫」
- ECDICT：form「n. 萤火虫( firefly的名词复数 )」 / lemma「n. 萤火虫」
- **建议：`keep`**

## movers → mover
- rank：form 17797 / lemma 21907 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「搬家工人；推动者」 / lemma「搬运工；提议者」
- ECDICT：form「n. （会议上的）提议人( mover的复数形式 ); 搬家工人; …走动的人; 兴旺发达的事物」 / lemma「n. 移动的人, 原动力, 鼓动者」
- **建议：`keep`**

## plating → plate
- rank：form 17799 / lemma 4938 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「镀层；电镀」 / lemma「盘子；板」
- ECDICT：form「n. 电镀, 镀层, 金属外表的镀层, 装甲 [化] 喷镀」 / lemma「n. 碟, 盘子, 盆中物, 金属板, 图版, 金银餐具, 印版, 金属牌(照) vt. 镀金, 电镀, 用金属板固定,…」
- **建议：`?`**

## festooned → festoon
- rank：form 17800 / lemma 19200 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「饰以花彩的」 / lemma「给…饰以花彩」
- ECDICT：form「v. 花彩（装饰）( festoon的过去式和过去分词 )」 / lemma「n. 花彩 vt. 结彩于」
- **建议：`keep`**

## pyrotechnics → pyrotechnic
- rank：form 17800 / lemma 22600 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「烟火制造术；烟火表演」 / lemma「烟火的；炫技的」
- ECDICT：form「n. 烟火制造术, 烟火使用」 / lemma「a. 烟火的, 令人眼花缭乱的, 夸大炫耀的」
- **建议：`keep`**

## favored → favor
- rank：form 17816 / lemma 813 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受青睐的；有利的」 / lemma「恩惠；帮助；赞成」
- ECDICT：form「a. 有利的, 受惠的, 幸运的」 / lemma「n. 好意, 喜爱 vt. 赐予, 支持, 喜欢, 证实」
- **建议：`?`**

## hoodlums → hoodlum
- rank：form 17824 / lemma 20023 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流氓；小混混（复数）」 / lemma「流氓；恶棍」
- ECDICT：form「n. 流氓, 暴徒( hoodlum的复数形式 )」 / lemma「n. 暴徒, 年轻无赖」
- **建议：`keep`**

## slurring → slur
- rank：form 17845 / lemma 29408 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「含糊地说； slur 的现在分词」 / lemma「污辱；含糊发音」
- ECDICT：form「n. 型芯粘合法」 / lemma「n. 连音符, 诽谤, 玷污, 印刷模糊 vt. 草率地看过, 忽略, 含糊地念 vi. 模糊不清」
- **建议：`keep`**

## orphaned → orphan
- rank：form 17935 / lemma 4693 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「成为孤儿的」 / lemma「孤儿」
- ECDICT：form「[计][修]孤立」 / lemma「n. 孤儿 a. 无双亲的, 孤儿的 vt. 使成孤儿 [计] 弧体」
- **建议：`?`**

## axes → ax
- rank：form 17944 / lemma 8231 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「斧头（复数）；轴（复数）」 / lemma「斧头；解雇」
- ECDICT：form「pl. 斧头, 轴, 轴线 [计] 坐标轴」 / lemma「n. 斧头 vt. 用斧削或砍, 削减」
- **建议：`?`**

## axes → axe
- rank：form 17944 / lemma 5279 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「斧头（复数）；轴（复数）」 / lemma「斧头；削减」
- ECDICT：form「pl. 斧头, 轴, 轴线 [计] 坐标轴」 / lemma「n. 斧, 斧头 vt. 削减(人员、经费、计划、机构等)」
- **建议：`?`**

## henchmen → henchman
- rank：form 17951 / lemma 22067 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「亲信；帮凶」 / lemma「亲信；帮凶」
- ECDICT：form「n. 追随者（henchman复数）；亲信；心腹」 / lemma「n. 忠实追随者, 党羽, 跟踪者 [法] 亲信, 心腹, 顺从者」
- **建议：`keep`**

## fabricated → fabricate
- rank：form 17975 / lemma 25371 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「捏造；制造」 / lemma「捏造；制造」
- ECDICT：form「a. 焊接的；组合的, 装配式的」 / lemma「vt. 制造, 建造, 装配, 伪造」
- **建议：`keep`**

## grumbles → grumble
- rank：form 17976 / lemma 23365 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「抱怨；咕哝」 / lemma「抱怨；咕哝」
- ECDICT：form「v. 抱怨( grumble的第三人称单数 ); 发牢骚; 咕哝; 发哼声」 / lemma「n. 怨言, 满腹牢骚 vi. 抱怨, 发牢骚, 发隆隆声 vt. 抱怨」
- **建议：`keep`**

## fliers → flier
- rank：form 17992 / lemma 19085 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「传单；飞行者」 / lemma「传单；飞行者」
- ECDICT：form「n. 飞行器驾驶员( flier的复数形式 ); 动作敏捷的人或动物; 速度很快的车辆; （产品的）宣传单」 / lemma「n. 飞行者, 快船, 快车 [经] 投机买卖, 孤注一掷, 传单」
- **建议：`keep`**

## apps → app
- rank：form 18020 / lemma 6836 ｜ type `3` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「应用程序」 / lemma「应用程序」
- ECDICT：form「n. 应用程序, 应用软件；应用服务」 / lemma「[计] 应用, 应用程序; 相联并行处理器」
- **建议：`keep`**

## straits → strait
- rank：form 18038 / lemma 21637 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「海峡；困境」 / lemma「海峡；困境」
- ECDICT：form「n. [谓语用单数]海峡, 困难, 窘迫」 / lemma「n. 海峡, 困境 a. 困难的, 窘迫的, 狭窄的」
- **建议：`keep`**

## shoelaces → shoelace
- rank：form 18050 / lemma 24434 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鞋带（复数）」 / lemma「鞋带」
- ECDICT：form「n. 鞋带( shoelace的复数形式 )」 / lemma「n. 鞋带」
- **建议：`keep`**

## phasers → phaser
- rank：form 18083 / lemma 17440 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「相位器；激光枪（科幻）」 / lemma「相位器；激光枪」
- ECDICT：form「(phaser 的复数) [电] 相位器」 / lemma「[电] 相位器」
- **建议：`keep`**

## hanks → hank
- rank：form 18096 / lemma 1743 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「汉克斯（姓氏）；一束（复数）」 / lemma「汉克（人名）；一束」
- ECDICT：form「n. 把数（hank的复数形式）；纵帆前缘帆环」 / lemma「n. 一束, 一圈 vt. 用帆眼圈(将帆)系牢」
- **建议：`keep`**

## grownups → grownup
- rank：form 18194 / lemma 19996 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「成年人（复数）」 / lemma「成年人」
- ECDICT：form「n. 成年人 a. 已长成的」 / lemma「n. 成年人」
- **建议：`keep`**

## warts → wart
- rank：form 18197 / lemma 19524 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「疣；瑕疵（复数）」 / lemma「疣；肉赘」
- ECDICT：form「n. 疣( wart的复数形式 ); 肉赘; <植>树瘤; 缺点」 / lemma「n. 疣, 瘤 [医] 疣, 肉赘」
- **建议：`keep`**

## shards → shard
- rank：form 18205 / lemma 19370 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「碎片（复数）」 / lemma「碎片；破片」
- ECDICT：form「n. （玻璃、金属或其他硬物的）尖利的碎片( shard的复数形式 )」 / lemma「n. 陶瓷碎片, 鞘翅, 薄硬壳」
- **建议：`keep`**

## clippers → clipper
- rank：form 18230 / lemma 21372 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「剪刀；快船队」 / lemma「快船；剪刀；修剪器」
- ECDICT：form「n. 大剪刀, 修剪工具, 钳子, 轧刀」 / lemma「n. 大剪刀 [电] 截割器」
- **建议：`keep`**

## anchovies → anchovy
- rank：form 18246 / lemma 31062 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「凤尾鱼（复数）」 / lemma「鳀鱼；凤尾鱼」
- ECDICT：form「n. 凤尾鱼( anchovy的复数形式 )」 / lemma「n. 凤尾鱼；鳀鱼」
- **建议：`keep`**

## warbling → warble
- rank：form 18249 / lemma 42998 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「鸟鸣；颤声歌唱」 / lemma「鸟鸣；颤声唱」
- ECDICT：form「v. 鸟鸣, 用柔和的颤声唱( warble的现在分词 )」 / lemma「n. 用颤音唱的歌, 鸟啭, 颤声 v. 鸟鸣, 用柔和的颤声唱」
- **建议：`keep`**

## ghouls → ghoul
- rank：form 18252 / lemma 18853 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「食尸鬼（复数）」 / lemma「食尸鬼；恶鬼」
- ECDICT：form「n. 盗尸者( ghoul的复数形式 )」 / lemma「n. 食尸鬼, 饿鬼, 盗墓者」
- **建议：`keep`**

## applicants → applicant
- rank：form 18253 / lemma 23792 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「申请人（复数）」 / lemma「申请人；求职者」
- ECDICT：form「n. 申请人, 求职人( applicant的复数形式 )」 / lemma「n. 申请者 [经] 申请人, 请求人, 谋事人」
- **建议：`keep`**

## critters → critter
- rank：form 18256 / lemma 19450 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小动物；家伙（复数）」 / lemma「（口）生物；小动物」
- ECDICT：form「n. 动物( critter的复数形式 ); 人, （尤指）可怜的人」 / lemma「n. [方][谑]家畜；马；牛；[贬]人」
- **建议：`keep`**

## canadians → canadian
- rank：form 18260 / lemma 5699 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「加拿大人（复数）」 / lemma「加拿大的；加拿大人」
- ECDICT：form「n. 加拿大人（Canadian的复数）」 / lemma「a. 加拿大的」
- **建议：`keep`**

## ranting → rant
- rank：form 18360 / lemma 19628 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咆哮；大声抱怨」 / lemma「咆哮；抱怨」
- ECDICT：form「v. 夸夸其谈( rant的现在分词 ); 大叫大嚷地以…说教; 气愤地)大叫大嚷; 不停地大声抱怨」 / lemma「v. 咆哮, 痛骂 n. 咆哮, 大话」
- **建议：`keep`**

## litres → litre
- rank：form 18370 / lemma 20305 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「升（容量单位，复数）」 / lemma「升（容量单位）」
- ECDICT：form「n. 升( litre的复数形式 )」 / lemma「n. 升, 公升 [计] 升」
- **建议：`keep`**

## abolished → abolish
- rank：form 18376 / lemma 20135 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「废除；取消（过去式）」 / lemma「废除；取消」
- ECDICT：form「v. 彻底废除；摧毁（abolish的过去分词） a. 废除的」 / lemma「vt. 废止, 革除, 消灭 [经] 废除, 取消, 裁撤」
- **建议：`keep`**

## stupefied → stupefy
- rank：form 18400 / lemma 21600 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「惊呆的，麻木的」 / lemma「使惊呆，使麻木」
- ECDICT：form「v. 使发呆, 使昏昏沉沉( stupefy的过去式和过去分词 ); 使惊讶; 木然」 / lemma「vt. 使麻醉, 使失去知觉, 使惊呆 [法] 使昏迷, 使失知觉, 使保若木鸡」
- **建议：`keep`**

## stupefying → stupefy
- rank：form 18400 / lemma 21600 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「令人惊愕的，使人昏沉麻木的」 / lemma「使惊呆，使麻木」
- ECDICT：form「v. 使发呆, 使昏昏沉沉( stupefy的现在分词 ); 使惊讶」 / lemma「vt. 使麻醉, 使失去知觉, 使惊呆 [法] 使昏迷, 使失知觉, 使保若木鸡」
- **建议：`keep`**

## untied → untie
- rank：form 18420 / lemma 5577 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「解开（过去式）」 / lemma「解开；松开」
- ECDICT：form「v. 松开, 解开( untie的过去式和过去分词 ); 解除, 使自由; 解决」 / lemma「vt. 解开 vi. 松开」
- **建议：`?`**

## tonsils → tonsil
- rank：form 18451 / lemma 47609 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「扁桃体（复数）」 / lemma「扁桃体」
- ECDICT：form「n. 扁桃体( tonsil的复数形式 )」 / lemma「n. 扁桃体 [医] 扁桃体」
- **建议：`keep`**

## utensils → utensil
- rank：form 18480 / lemma 36157 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「器皿；用具（复数）」 / lemma「用具；器皿」
- ECDICT：form「n. 器具, 用具, 器皿( utensil的名词复数 ); 器物」 / lemma「n. 器皿, 用具」
- **建议：`keep`**

## coerced → coerce
- rank：form 18495 / lemma 32262 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「强迫；胁迫（过去式）」 / lemma「强迫；胁迫」
- ECDICT：form「v. 迫使做( coerce的过去式和过去分词 ); 强迫; （以武力、惩罚、威胁等手段）控制; 支配」 / lemma「vt. 强制, 强迫」
- **建议：`keep`**

## depleted → deplete
- rank：form 18508 / lemma 46709 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「耗尽的；枯竭的」 / lemma「耗尽；使枯竭」
- ECDICT：form「a. 废弃的；贫化的；耗尽的」 / lemma「vt. 耗尽, 使衰竭 [医] 排除, 减少」
- **建议：`keep`**

## asians → asian
- rank：form 18531 / lemma 4602 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「亚洲人」 / lemma「亚洲的；亚洲人的」
- ECDICT：form「n. 亚洲人（Asian的复数）」 / lemma「n. 亚洲人 a. 亚洲的, 亚洲人的」
- **建议：`keep`**

## spores → spore
- rank：form 18551 / lemma 41528 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「孢子」 / lemma「孢子」
- ECDICT：form「n. （细菌、苔藓、蕨类植物）孢子( spore的复数形式 ) v. （细菌、苔藓、蕨类植物）孢子( spore的第三人…」 / lemma「n. 孢子 vi. 长孢子」
- **建议：`keep`**

## orchestrated → orchestrate
- rank：form 18552 / lemma 35927 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「精心安排；配管弦乐」 / lemma「精心安排；编配管弦乐」
- ECDICT：form「v. 把（乐曲）编成管弦乐( orchestrate的过去式和过去分词 ); 和谐地安排, 精心策划」 / lemma「v. 编管弦乐曲」
- **建议：`keep`**

## purring → purr
- rank：form 18579 / lemma 26098 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出呼噜声；低声说」 / lemma「发出呼噜声」
- ECDICT：form「[医] 猫喘音样的」 / lemma「v. 呼噜呼噜叫, 发出喉音 n. 呼噜呼噜声」
- **建议：`keep`**

## loins → loin
- rank：form 18585 / lemma 22205 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「腰部；下身」 / lemma「腰肉；腰部」
- ECDICT：form「n. 耻骨区, 生殖器官, 腰与腿之间的部分」 / lemma「n. 腰部, 腰肉 [医] 腰[部]」
- **建议：`keep`**

## mispronounced → mispronounce
- rank：form 18600 / lemma 19400 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「发音错误的；读错的」 / lemma「发音错误，读错音」
- ECDICT：form「v. 发错（词等的）音( mispronounce的过去式和过去分词 )」 / lemma「v. 发错音」
- **建议：`keep`**

## stooges → stooge
- rank：form 18628 / lemma 21436 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「捧场者；滑稽配角」 / lemma「捧哏；傀儡；跟班」
- ECDICT：form「n. 喜剧里的配角或丑角, 助手, 伙伴( stooge的名词复数 )」 / lemma「n. 喜剧配角(或丑角), 下手, 助手 vi. 充当配角」
- **建议：`keep`**

## conversing → converse
- rank：form 18631 / lemma 19121 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「交谈；谈话」 / lemma「交谈；谈话」
- ECDICT：form「v. 交谈, 谈话( converse的现在分词 )」 / lemma「n. 相反的事物, 倒, 逆向 a. 相反的, 逆向的, 颠倒的 vi. 交谈, 谈话」
- **建议：`keep`**

## takers → taker
- rank：form 18633 / lemma 19010 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「接受者；索取者」 / lemma「接受者；拿取者」
- ECDICT：form「n. 接受者；购买者（taker的复数）」 / lemma「n. 取者, 捕者, 接受者, 收取者 [法] 受者, 收票人, 接受打赌的人」
- **建议：`keep`**

## harboring → harbor
- rank：form 18643 / lemma 4195 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「窝藏；心怀」 / lemma「港口；避难所」
- ECDICT：form「vbl. 怀著」 / lemma「n. 港, 避难所 v. 庇护, 藏匿, (使)入港停泊」
- **建议：`?`**

## extremists → extremist
- rank：form 18686 / lemma 21165 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「极端主义者」 / lemma「极端主义者」
- ECDICT：form「n. 极端主义者, 偏激的人( extremist的复数形式 )」 / lemma「[经] 偏激份子」
- **建议：`keep`**

## golfing → golf
- rank：form 18689 / lemma 2263 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「打高尔夫球」 / lemma「高尔夫球」
- ECDICT：form「n. 打高尔夫球 vi. 打高尔夫球(golf的ing形式)」 / lemma「n. 高尔夫球 vi. 打高尔夫球」
- **建议：`?`**

## debs → deb
- rank：form 18696 / lemma 5896 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「初入社交界的少女」 / lemma「黛布（女子名）」
- ECDICT：form「德布斯(姓氏, 男子名)」 / lemma「n. 初上舞台的人, 初进社交界的女孩 [计] 数据扩充块」
- **建议：`keep`**

## ros → ro
- rank：form 18707 / lemma 8839 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「罗斯（人名）」 / lemma「罗（人名/音译）」
- ECDICT：form「abbr. 只读存储器（Read-Only-Storage）；活性氧（Reactive oxygen species）」 / lemma「[计] 只接收」
- **建议：`keep`**

## cubans → cuban
- rank：form 18723 / lemma 6926 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「古巴人」 / lemma「古巴的；古巴人」
- ECDICT：form「n. 古巴人（Cuban的复数）」 / lemma「a. 古巴的, 古巴人的 n. 古巴人」
- **建议：`keep`**

## contusions → contusion
- rank：form 18744 / lemma 25083 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「挫伤；瘀伤」 / lemma「挫伤；瘀伤」
- ECDICT：form「n. 挫伤, 擦伤, 撞伤( contusion的复数形式 )」 / lemma「n. 捣碎, 碾碎, 挫伤 [医] 挫伤」
- **建议：`keep`**

## carbs → carb
- rank：form 18766 / lemma 36696 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「碳水化合物」 / lemma「碳水化合物（口语）」
- ECDICT：form「(carb 的复数) n. [汽车]汽化器」 / lemma「n. [汽车]汽化器」
- **建议：`keep`**

## bellowing → bellow
- rank：form 18792 / lemma 29788 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「怒吼；大声咆哮」 / lemma「怒吼；大声喊叫」
- ECDICT：form「v. 发出吼叫声, 咆哮（尤指因痛苦）( bellow的现在分词 ); （愤怒地）说出（某事）, 大叫」 / lemma「v. 怒吼」
- **建议：`keep`**

## circumcised → circumcise
- rank：form 18836 / lemma 20800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「受过割礼的」 / lemma「环切；行割礼」
- ECDICT：form「v. <医>割除…包皮（由于宗教或健康理由）( circumcise的过去式和过去分词 )」 / lemma「vt. 割除...的包皮, 对...进行环切术, 割除...的阴蒂, 净(心)」
- **建议：`keep`**

## pellets → pellet
- rank：form 18843 / lemma 23498 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「小球；弹丸」 / lemma「小球；丸；弹丸」
- ECDICT：form「n. 小球( pellet的复数形式 ); 小弹丸; 坚硬小球或小丸; 珠形炸弹」 / lemma「n. 颗粒状物, 小子弹, 小药丸 vt. 使成颗粒, 使成团, 用子弹打」
- **建议：`keep`**

## antidepressants → antidepressant
- rank：form 18849 / lemma 37255 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「抗抑郁药」 / lemma「抗抑郁药」
- ECDICT：form「抗抑郁药」 / lemma「a. 抗抑郁的 n. 抗抑制(药), 抗抑郁剂」
- **建议：`keep`**

## pampered → pamper
- rank：form 18862 / lemma 24014 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「娇生惯养的」 / lemma「纵容；娇惯」
- ECDICT：form「a. 饮食过量的, 饮食奢侈的 v. 纵容, 宠, 娇养( pamper的过去式和过去分词 )」 / lemma「vt. 放纵, 使吃饱, 使过量」
- **建议：`keep`**

## psychopaths → psychopath
- rank：form 18892 / lemma 20100 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「精神病患者」 / lemma「精神变态者」
- ECDICT：form「n. 精神变态者, 精神病患者( psychopath的复数形式 )」 / lemma「n. 精神病患者, 精神变态者 [医] 精神变态者, 变态人格者」
- **建议：`keep`**

## convening → convene
- rank：form 18900 / lemma 15200 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「召集；召开」 / lemma「召集，召开」
- ECDICT：form「v. 召开( convene的现在分词 ); 召集; （为正式会议而）聚集; 集合」 / lemma「vt. 集合, 召集, 召唤 vi. 聚集, 集合」
- **建议：`?`**

## sunken → sink
- rank：form 18928 / lemma 5028 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「沉没的；凹陷的」 / lemma「水槽；下沉」
- ECDICT：form「a. 沉没的, 下凹的 sink的过去分词」 / lemma「n. 藏垢的场所, 沟渠, 污水槽 vi. 下沉, 沉没, 下陷, 减弱, 衰退, 消沉, 堕落, 渗透 vt. 使低落…」
- **建议：`?`**

## costas → costa
- rank：form 18949 / lemma 7592 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「科斯塔斯（男子名/姓氏）」 / lemma「科斯塔（人名/地名）」
- ECDICT：form「[人名] 科斯塔斯」 / lemma「n. 肋骨, 肋脉, 叶的中脉 [医] 肋」
- **建议：`keep`**

## subdued → subdue
- rank：form 18979 / lemma 18100 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被制服的；柔和的」 / lemma「制服；征服」
- ECDICT：form「a. 屈服的, 被抑制的, 减弱的, 柔和的」 / lemma「vt. 使服从, 压制, 减弱, 抑制, 克制」
- **建议：`?`**

## constitutes → constitute
- rank：form 18993 / lemma 19716 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「构成；组成（第三人称单数）」 / lemma「构成；组成」
- ECDICT：form「v. 组成；构成（constitute的单三形式）」 / lemma「vt. 构成, 组成, 任命 [建] 构造, 组成」
- **建议：`keep`**

## installments → installment
- rank：form 18994 / lemma 19139 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分期付款；连载（复数）」 / lemma「分期付款；一期」
- ECDICT：form「n. 部分( installment的复数形式 )」 / lemma「n. 就职, 装设, 分期付款 [经] 分期付款」
- **建议：`keep`**

## contravening → contravene
- rank：form 19000 / lemma 20100 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「违反，抵触（现在分词）」 / lemma「违反，抵触」
- ECDICT：form「v. 取消, 违反( contravene的现在分词 )」 / lemma「vt. 违反, 触犯, 否认, 反驳, 抵触, 与...冲突 [法] 触法, 违反, 否定」
- **建议：`keep`**

## leaflets → leaflet
- rank：form 19019 / lemma 27609 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「传单；小叶」 / lemma「传单；小册子」
- ECDICT：form「n. 传单, 散页印刷品( leaflet的复数形式 )」 / lemma「n. 小叶, 传单 [医] 小叶」
- **建议：`keep`**

## sas → sa
- rank：form 19039 / lemma 6941 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「SAS（英国特种空勤团）」 / lemma「萨（人名/缩写）」
- ECDICT：form「[计] 单一连接站」 / lemma「救世军, 南非, 南美, 南澳大利亚, 性的魅力, 性感 [计] 源地址, 结构分析, 系统分析」
- **建议：`keep`**

## entrees → entree
- rank：form 19043 / lemma 20476 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「主菜；入场权」 / lemma「主菜；入场权」
- ECDICT：form「n. <法>入场权( entree的复数形式 ); <美>主菜」 / lemma「n. 入场许可, 主菜」
- **建议：`keep`**

## dozed → doze
- rank：form 19059 / lemma 25321 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「打瞌睡；小睡」 / lemma「打盹；小睡」
- ECDICT：form「v. 打盹儿, 打瞌睡( doze的过去式和过去分词 )」 / lemma「vi. 打瞌睡, 假寐 vt. 打瞌睡度过 n. 瞌睡」
- **建议：`keep`**

## bikinis → bikini
- rank：form 19077 / lemma 7660 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「比基尼泳装」 / lemma「比基尼泳装」
- ECDICT：form「n. 比基尼（bikini的复数）」 / lemma「n. 大爆炸, 比基尼泳装」
- **建议：`keep`**

## scorching → scorch
- rank：form 19086 / lemma 23211 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灼热的；酷热的」 / lemma「烧焦；烤焦」
- ECDICT：form「a. 灼热的, 激烈的 [化] 焦烧; 过早硫化」 / lemma「n. 烧焦, 枯萎 v. 烧焦, 拷焦, (使)枯萎, 讽刺」
- **建议：`keep`**

## graders → grader
- rank：form 19123 / lemma 21548 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「评分者；某年级学生」 / lemma「评分者；年级生」
- ECDICT：form「分级机 分类机 …年级学生 [建] 平地机（grader的复数）」 / lemma「n. 把东西分类别的人/机器, 平路机, 推土机」
- **建议：`keep`**

## scorched → scorch
- rank：form 19142 / lemma 23211 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烧焦；烤焦」 / lemma「烧焦；烤焦」
- ECDICT：form「n. 焦头烂额；烧焦, 烤焦」 / lemma「n. 烧焦, 枯萎 v. 烧焦, 拷焦, (使)枯萎, 讽刺」
- **建议：`keep`**

## helpers → helper
- rank：form 19164 / lemma 32000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「帮手；助手（复数）」 / lemma「助手；帮手」
- ECDICT：form「n. 辅助物体；助理工人（helper的复数）」 / lemma「n. 帮忙者, 有益的东西 [机] 助手」
- **建议：`keep`**

## sawing → saw
- rank：form 19181 / lemma 8337 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锯；拉锯（saw的现在分词）」 / lemma「锯子」
- ECDICT：form「[机] 锯解」 / lemma「n. 锯子, 谚语 vt. 锯, 锯开, 来回移动 vi. 拉锯, 移动 see的过去式」
- **建议：`?`**

## groping → grope
- rank：form 19186 / lemma 23871 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摸索；猥亵（grope的现在分词）」 / lemma「摸索；猥亵」
- ECDICT：form「a. 暗中摸索的；探索的」 / lemma「v. 摸索 n. 摸索」
- **建议：`keep`**

## gassed → gas
- rank：form 19311 / lemma 856 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「用毒气攻击；加油（过去式）」 / lemma「气体；汽油」
- ECDICT：form「a. 中毒气毒的, 喝醉酒的 [医] 气体中毒的, 中毒气的」 / lemma「n. 气体, 汽油, 瓦斯 [化] 气体; 煤气; 瓦斯; 毒气」
- **建议：`?`**

## tryouts → tryout
- rank：form 19340 / lemma 25349 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「选拔赛；试演（复数）」 / lemma「选拔赛；试演」
- ECDICT：form「n. 试验( tryout的复数形式 ); 试用; 选拔赛; 试演」 / lemma「n. 试验, 试用, 选拔赛」
- **建议：`keep`**

## ravaged → ravage
- rank：form 19341 / lemma 31628 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「毁坏；蹂躏（过去式）」 / lemma「毁坏；蹂躏」
- ECDICT：form「v. 毁坏( ravage的过去式和过去分词 ); 蹂躏; 劫掠; 抢劫」 / lemma「n. 破坏, 蹂躏 v. 毁坏, 破坏, 掠夺」
- **建议：`keep`**

## englishmen → englishman
- rank：form 19349 / lemma 8934 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「英格兰人（复数）」 / lemma「英格兰人；英国男人」
- ECDICT：form「n. 英国人（Englishman的复数）」 / lemma「n. 英国人」
- **建议：`keep`**

## prawns → prawn
- rank：form 19353 / lemma 19708 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「对虾；明虾（复数）」 / lemma「对虾；明虾」
- ECDICT：form「n. 对虾, 明虾( prawn的复数形式 )」 / lemma「n. 明虾, 对虾 vi. 捕虾」
- **建议：`keep`**

## bowers → bower
- rank：form 19363 / lemma 23737 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「凉亭；树荫处（复数）」 / lemma「凉亭；树荫处」
- ECDICT：form「n. 英国宝禾（一家生产测试测量仪器和材料性能检测设备的跨国集团公司）；鲍尔斯（姓氏）」 / lemma「n. 凉亭, 树阴处」
- **建议：`keep`**

## anointed → anoint
- rank：form 19380 / lemma 29626 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「涂油；任命（过去式）」 / lemma「涂油；施膏」
- ECDICT：form「基督, 救世主」 / lemma「vt. 涂油, 施以涂油礼 [医] 涂油膏」
- **建议：`keep`**

## suckling → suckle
- rank：form 19400 / lemma 35921 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「乳儿；哺乳中的幼兽」 / lemma「哺乳；吮吸」
- ECDICT：form「n. 乳儿, 乳臭未干的小子」 / lemma「vt. 哺乳, 养育, 吮吸 [医] 哺乳」
- **建议：`keep`**

## pores → pore
- rank：form 19411 / lemma 29709 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「毛孔；气孔」 / lemma「毛孔；气孔」
- ECDICT：form「n. 气孔；毛穴（pore的复数）」 / lemma「n. 毛孔, 小孔, 气孔 vi. 专心阅读, 细想, 钻研, 沉思, 注视 vt. 使注视得」
- **建议：`keep`**

## shears → shear
- rank：form 19451 / lemma 28592 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大剪刀」 / lemma「剪（羊毛）；剪切」
- ECDICT：form「n. 大剪刀 [化] 剪床; 剪切机」 / lemma「n. 修剪, 剪下的东西, 大剪刀, 切变, 剪切机, 切 vt. 修剪, 割, 剥夺, 横越, 削剪 vi. 剪, 修…」
- **建议：`keep`**

## mistreated → mistreat
- rank：form 19455 / lemma 29050 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「虐待；苛待」 / lemma「虐待；苛待」
- ECDICT：form「v. 虐待( mistreat的过去式和过去分词 )」 / lemma「vt. 虐待 [法] 虐待, 苛待」
- **建议：`keep`**

## lesions → lesion
- rank：form 19459 / lemma 26652 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「损伤；病变」 / lemma「损伤；病变」
- ECDICT：form「n. 损害, 损伤( lesion的复数形式 ); 身体器官组织的损伤」 / lemma「n. 损害, 身体上的伤害 [医] 损害」
- **建议：`keep`**

## uplifting → uplift
- rank：form 19463 / lemma 37176 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人振奋的」 / lemma「提升；鼓舞」
- ECDICT：form「a. 令人振奋的; 使人开心的 v. 举起(uplift的现在分词)」 / lemma「n. 抬起, 道德的向上, 精神的高涨 vt. 提高, 抬起 vi. 上升」
- **建议：`keep`**

## bureaucrats → bureaucrat
- rank：form 19472 / lemma 20835 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「官僚；官僚主义者」 / lemma「官僚；官员」
- ECDICT：form「n. 官僚( bureaucrat的复数形式 ); 官僚主义; 官僚主义者; 官僚语言」 / lemma「n. 官僚作风的人, 官僚, 官僚主义者 [法] 官僚, 官僚作风的人」
- **建议：`keep`**

## bawling → bawl
- rank：form 19482 / lemma 35040 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大声哭喊；叫嚷」 / lemma「大声哭；喊叫」
- ECDICT：form「vi. 大叫；放声痛哭 vt. 大声叫出；大声宣布；叫卖 n. 叫骂声」 / lemma「n. 大叫声 v. 大叫」
- **建议：`keep`**

## anchored → anchor
- rank：form 19488 / lemma 5263 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「抛锚；固定；使稳定」 / lemma「锚；主播」
- ECDICT：form「a. 固定的；抛锚的」 / lemma「n. 锚 vt. 抛锚停泊, 使固定 [计] 锚」
- **建议：`?`**

## antlers → antler
- rank：form 19491 / lemma 37681 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「鹿角（复数）」 / lemma「鹿角」
- ECDICT：form「n. 鹿角( antler的复数形式 ); 角枝」 / lemma「n. 鹿角」
- **建议：`keep`**

## foreboding → forebode
- rank：form 19500 / lemma 20000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「预感，凶兆」 / lemma「预示，预感到（不祥之事）」
- ECDICT：form「n. 预感, 先兆, 预兆」 / lemma「v. 预示, 预兆, 预感」
- **建议：`keep`**

## lakers → laker
- rank：form 19542 / lemma 32781 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「湖人队（洛杉矶篮球队）」 / lemma「湖人队球员；湖鱼」
- ECDICT：form「n. 湖人队（美国篮球队名）」 / lemma「n. 湖畔派诗人；习惯于在湖上居住（或工作, 航行）的人；湖鱼（尤指鲑鱼）；湖船（尤指北美洲五大湖上的船）」
- **建议：`keep`**

## backfired → backfire
- rank：form 19551 / lemma 20977 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「适得其反；逆火」 / lemma「适得其反；逆火」
- ECDICT：form「v. （内燃机等）发生逆火( backfire的过去式和过去分词 ); 发生回火; （枪炮）向后爆发; 发生意外」 / lemma「n. 逆火, 回火, 放火 vi. 放逆火, 预先放火, 发生意外」
- **建议：`keep`**

## coveted → covet
- rank：form 19556 / lemma 22103 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「垂涎；渴望得到」 / lemma「贪求；垂涎」
- ECDICT：form「a. 令人垂涎的; 垂涎的, 梦寐以求的 v. 贪求, 觊觎(covet的过去分词); 垂涎; 贪图」 / lemma「v. 妄想, 垂涎」
- **建议：`keep`**

## workmen → workman
- rank：form 19585 / lemma 24366 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工人（复数）」 / lemma「工人；工匠」
- ECDICT：form「工人, 工匠, 工作者, 体力劳动者」 / lemma「n. 工人, 工匠, 男工」
- **建议：`keep`**

## yorkers → yorker
- rank：form 19591 / lemma 15188 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「约克人；约克郡人」 / lemma「约克郡人；投球」
- ECDICT：form「n. (板球中投手投出的球恰好落在击球员前面的)脚前球, 球板前球」 / lemma「n. 贴板球」
- **建议：`keep`**

## jenner → jen
- rank：form 19592 / lemma 3581 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「詹纳（姓氏）」 / lemma「珍（人名）」
- ECDICT：form「詹纳(①姓氏 ②Edward, 1749-1823, 英国医生, 种痘法的首创者 ③William, 1815-1898…」 / lemma「n. 珍（女子名）」
- **建议：`keep`**

## jacking → jack
- rank：form 19606 / lemma 425 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「用千斤顶顶起；劫持（现在分词）」 / lemma「杰克（人名）；千斤顶」
- ECDICT：form「v. 顶托；提高；用篝灯猎捕；训斥（jack的现在分词）」 / lemma「n. 插座, 千斤顶, 男人 vt. 抬起, 提醒, 扛举, 增加, 提高, 放弃 a. 雄的 [计] 插座」
- **建议：`keep`**

## inhibitions → inhibition
- rank：form 19626 / lemma 42897 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「抑制；拘谨（复数）」 / lemma「抑制；拘谨」
- ECDICT：form「n. 抑制( inhibition的复数形式 ); 顾虑; 抑制力; [生]（酶的）抑制作用」 / lemma「n. 禁止, 抑制, 压抑 [计] 禁止」
- **建议：`keep`**

## dinars → dinar
- rank：form 19653 / lemma 35455 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「第纳尔（货币，复数）」 / lemma「第纳尔（货币）」
- ECDICT：form「n. 第纳尔（南斯拉夫、伊拉克及阿尔及利亚等国的货币单位）( dinar的复数形式 )」 / lemma「n. 第纳尔(南斯拉夫、伊拉克的货币单位)」
- **建议：`keep`**

## degraded → degrade
- rank：form 19683 / lemma 24497 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「退化的；降级的」 / lemma「降低；使丢脸」
- ECDICT：form「a. 被降级的, 落泊的, 退化的」 / lemma「v. (使)降级, (使)退化」
- **建议：`keep`**

## dazed → daze
- rank：form 19694 / lemma 21510 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「茫然的；头昏眼花的」 / lemma「恍惚；眩晕」
- ECDICT：form「a. 头昏的, 眼花的 [医] 茫然的, 迷乱的」 / lemma「vt. 使茫然, 使发昏, 使眼花缭乱 n. 迷乱, 眼花缭乱」
- **建议：`keep`**

## displeased → displease
- rank：form 19720 / lemma 33283 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「不悦的；不满的」 / lemma「使不快；惹恼」
- ECDICT：form「a. 不快的；生气的」 / lemma「v. 使不愉快, 使(人)生气」
- **建议：`keep`**

## cossacks → cossack
- rank：form 19725 / lemma 19957 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「哥萨克人」 / lemma「哥萨克人」
- ECDICT：form「n. 哥萨克人；哥萨克骑手(或骑兵) a. 哥萨克的；哥萨克人的」 / lemma「n. 哥萨克, 武装镇压队队员, 哥萨克轻骑兵, 哥萨克人 a. 哥萨克的, 哥萨克人的」
- **建议：`keep`**

## canvassing → canvas
- rank：form 19732 / lemma 6794 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「拉票；游说」 / lemma「帆布；画布」
- ECDICT：form「v. （在政治方面）游说( canvass的现在分词 ); 调查（如选举前选民的）意见; 为讨论而提出（意见等）; 详细…」 / lemma「n. 帆布, 画布, 油画 [化] 帆布」
- **建议：`?`**

## canvassing → canvass
- rank：form 19732 / lemma 16210 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拉票；游说」 / lemma「拉票；游说；调查」
- ECDICT：form「v. （在政治方面）游说( canvass的现在分词 ); 调查（如选举前选民的）意见; 为讨论而提出（意见等）; 详细…」 / lemma「n. 细查, 讨论, 游说 vt. 彻底检查, 向...拉票或拉生意, 讨论 vi. 游说」
- **建议：`?`**

## shimmering → shimmer
- rank：form 19753 / lemma 24810 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闪烁的；微微发光的」 / lemma「闪烁；微微发亮」
- ECDICT：form「v. 闪闪发光, 发微光( shimmer的现在分词 )」 / lemma「n. 微光, 闪光 vi. 闪烁 vt. 使闪烁」
- **建议：`keep`**

## mangled → mangle
- rank：form 19758 / lemma 41019 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「被压碎的；损坏的」 / lemma「撕裂；压碎」
- ECDICT：form「vt. 乱砍（mangle的过去式与过去分词形式）」 / lemma「vt. 乱砍, 损坏, 轧布 n. 轧布机」
- **建议：`keep`**

## pesticides → pesticide
- rank：form 19766 / lemma 21320 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「杀虫剂；农药」 / lemma「杀虫剂；农药」
- ECDICT：form「n. 杀虫剂( pesticide的复数形式 ); 除害药物」 / lemma「n. 杀虫剂 [化] 农药」
- **建议：`keep`**

## scones → scone
- rank：form 19789 / lemma 24582 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「司康饼」 / lemma「司康饼」
- ECDICT：form「n. 烤饼, 烤小圆面包( scone的复数形式 )」 / lemma「n. 烤饼」
- **建议：`keep`**

## annals → annal
- rank：form 19800 / lemma 27000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「编年史；年鉴」 / lemma「（按年记录的）年鉴条目；编年记载」
- ECDICT：form「n. 编年史, 活动年报, 历史」 / lemma「n. 记录；编年史」
- **建议：`keep`**

## foregoing → forego
- rank：form 19800 / lemma 29555 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「前述的，上述的」 / lemma「放弃；先行」
- ECDICT：form「a. 前面的, 先前的, 前述的」 / lemma「vt. 放弃, 在...之前, 居先」
- **建议：`keep`**

## buzzed → buzz
- rank：form 19805 / lemma 3058 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗡嗡叫；按门铃（过去式）」 / lemma「嗡嗡声；嘈杂」
- ECDICT：form「v. 发出嗡嗡声( buzz的过去式和过去分词 ); （发出）充满兴奋的谈话声[闲话, 谣言]; 忙乱, 急行; 用蜂鸣…」 / lemma「n. 嗡嗡声, 流言 vi. 发出嗡嗡声, 说闲话 vt. 使嗡嗡叫, 散布」
- **建议：`?`**

## empowered → empower
- rank：form 19823 / lemma 30686 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「授权；使有能力（过去式）」 / lemma「授权；使强大」
- ECDICT：form「v. 授权( empower的过去式和过去分词 ); 准许; 增加（某人的）自主权; 使控制局势」 / lemma「vt. 授予权力, 允许, 使能够 [法] 授权, 准许, 转委」
- **建议：`keep`**

## australians → australian
- rank：form 19826 / lemma 6380 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「澳大利亚人（复数）」 / lemma「澳大利亚的；澳洲人」
- ECDICT：form「n. 澳大利亚人( Australian的复数形式 )」 / lemma「n. 澳大利亚人 a. 澳大利亚的, 澳洲的, 澳洲人的」
- **建议：`keep`**

## foretold → foretell
- rank：form 19831 / lemma 32998 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「预言；预示（过去式）」 / lemma「预言；预示」
- ECDICT：form「foretell的过去式和过去分词」 / lemma「vt. 预言, 预告, 预示」
- **建议：`keep`**

## dimples → dimple
- rank：form 19835 / lemma 22757 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「酒窝（复数）」 / lemma「酒窝；凹痕」
- ECDICT：form「n. 酒窝, 笑窝( dimple的名词复数 )」 / lemma「n. 酒窝, 涟漪 vt. 使起涟漪」
- **建议：`keep`**

## constituents → constituent
- rank：form 19849 / lemma 36395 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「选民；成分（复数）」 / lemma「成分；选民」
- ECDICT：form「n. 成分（constituent的复数）」 / lemma「n. 成分, 选民, 构成物 a. 构成的, 组织的, 选举的」
- **建议：`keep`**

## bagpipes → bagpipe
- rank：form 19854 / lemma 34292 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「风笛」 / lemma「风笛」
- ECDICT：form「n. 风笛」 / lemma「n. 风笛」
- **建议：`keep`**

## antiquities → antiquity
- rank：form 19871 / lemma 21348 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「古物；古董（复数）」 / lemma「古代；古物」
- ECDICT：form「n. 古代史（书名）；古文明之战（游戏名）」 / lemma「n. 古老, 古代, 古代人, 古物」
- **建议：`keep`**

## stifling → stifle
- rank：form 19909 / lemma 25245 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「令人窒息的；闷热的」 / lemma「抑制；扼制；使窒息」
- ECDICT：form「a. 令人窒息的, 发闷的」 / lemma「vt. 使窒息, 抑止, 扼杀 vi. 窒息, 被扼杀」
- **建议：`keep`**

## haters → hater
- rank：form 19913 / lemma 21911 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「怀恨者；黑粉」 / lemma「憎恨者；黑粉」
- ECDICT：form「n. 怀恨在心者( hater的复数形式 )」 / lemma「n. 怀恨者」
- **建议：`keep`**

## laborers → laborer
- rank：form 19930 / lemma 21834 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「劳动者；工人」 / lemma「劳工；体力劳动者」
- ECDICT：form「n. 体力劳动者, 工人( laborer的复数形式 ); （熟练工人的）辅助工」 / lemma「n. 体力劳动者, 辅助工 [机] 劳动者」
- **建议：`keep`**

## peddling → peddle
- rank：form 19935 / lemma 24558 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「兜售；叫卖」 / lemma「兜售；叫卖」
- ECDICT：form「a. 做小买卖的, 叫卖的, 琐碎的, 无关紧要的 n. 做小买卖」 / lemma「vi. 挑卖, 沿街叫卖, 游荡, 闲混 vt. 叫卖, 兜售, 散播」
- **建议：`keep`**

## shoppers → shopper
- rank：form 19936 / lemma 24714 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「购物者；顾客」 / lemma「购物者」
- ECDICT：form「n. 购物者（shopper复数）」 / lemma「n. 购物者 [经] 顾客, 购物的人」
- **建议：`keep`**

## gushing → gush
- rank：form 19953 / lemma 30543 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「涌出的；滔滔不绝的」 / lemma「涌出；滔滔不绝」
- ECDICT：form「a. 迸出的, 涌出的」 / lemma「n. 涌出, 滔滔不绝地讲话 v. 涌出, 迸出, 滔滔不绝的讲话」
- **建议：`keep`**

## biometrics → biometric
- rank：form 20000 / lemma 18500 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `-` / lemma `-`
- 词库 gloss：form「生物识别技术；生物统计学」 / lemma「生物测量的，生物识别的」
- ECDICT：form「n. 生物统计学 [医] 生物统计学, 寿命预测(平均余命算定)」 / lemma「计量生物学」
- **建议：`keep`**

## congest → cong
- rank：form 20000 / lemma 23497 ｜ type `t` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `-` / lemma `proper`
- 词库 gloss：form「使拥挤；使充血」 / lemma「孔（人名/地名）」
- ECDICT：form「vt. 使充满, 使拥塞, 使充血 vi. 充塞, 充血, 拥挤」 / lemma「abbr. 会众的, 集会的（congregational）；代表大会, 国会（congress）；议会的, 国会的（c…」
- **建议：`keep`**

## lacerated → lacerate
- rank：form 20000 / lemma 20100 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「撕裂的，割破的」 / lemma「撕裂，割裂；伤害感情」
- ECDICT：form「a. 撕裂的, 割碎的,受伤的」 / lemma「vt. 划破, 割破, 使痛心, 撕碎 a. 撕碎的, 受折磨的」
- **建议：`keep`**

## orthodontics → orthodontic
- rank：form 20000 / lemma 17900 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `-` / lemma `-`
- 词库 gloss：form「口腔正畸学」 / lemma「牙齿矫正的」
- ECDICT：form「[医] 正牙学」 / lemma「[医] 牙正常的」
- **建议：`keep`**

## schemata → schema
- rank：form 20000 / lemma 25000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「图式（schema 的复数）」 / lemma「图式，纲要，概要」
- ECDICT：form「计划, 纲要, 图解, 修辞手段, (三段论法的)格」 / lemma「n. 概要, 图解, 略图 [计] 模式」
- **建议：`keep`**

## abrams → abram
- rank：form 20026 / lemma 39236 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「艾布拉姆斯（姓氏）」 / lemma「艾布拉姆（男子名）」
- ECDICT：form「n. 艾布拉姆斯（公司名称）」 / lemma「n. 艾布拉姆（男子名, 等于Abraham）」
- **建议：`keep`**

## cloned → clone
- rank：form 20067 / lemma 7823 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「克隆；复制」 / lemma「克隆；无性繁殖」
- ECDICT：form「v. （使某物）无性繁殖( clone的过去式和过去分词 )」 / lemma「n. 无性系 [计] 代用件」
- **建议：`?`**

## fatalities → fatality
- rank：form 20141 / lemma 22368 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「死亡人数；致命事故」 / lemma「死亡；致命性」
- ECDICT：form「n. 恶性事故( fatality的名词复数 ); 死亡; 致命性; 命运」 / lemma「n. 不幸, 厄运, 致命性, 死亡者, 厄运, 天命」
- **建议：`keep`**

## jagged → jag
- rank：form 20199 / lemma 11285 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锯齿状的；参差不齐的」 / lemma「尖刺；一阵；狂欢」
- ECDICT：form「a. 锯齿状的 [电] 锯齿形的」 / lemma「n. 缺口, 突出端, 小伙子 vt. 使成缺口, 使成锯齿状 vi. 刺, 戳」
- **建议：`?`**

## protons → proton
- rank：form 20203 / lemma 20457 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「质子（复数）」 / lemma「质子」
- ECDICT：form「n. 质子( proton的复数形式 )」 / lemma「n. 质子 [化] 质子」
- **建议：`keep`**

## ovaries → ovary
- rank：form 20205 / lemma 34611 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「卵巢（复数）」 / lemma「卵巢」
- ECDICT：form「n. （妇女或雌性动物的）卵巢( ovary的名词复数 ); （植物的）子房」 / lemma「n. 卵巢, 子房, 果核 [医] 卵巢, 子房」
- **建议：`keep`**

## clogs → clog
- rank：form 20220 / lemma 21059 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「木屐；堵塞（复数或动词）」 / lemma「堵塞；木屐」
- ECDICT：form「n. 木屐; 木底鞋, 木屐( clog的名词复数 ) v. （使）阻碍( clog的第三人称单数 )」 / lemma「n. 障碍, 脚坠 v. 障碍, 阻塞」
- **建议：`keep`**

## partied → party
- rank：form 20233 / lemma 306 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「参加聚会（过去式）」 / lemma「聚会；政党」
- ECDICT：form「v. 为…举行社交聚会（party的过去式与过去分词形式）」 / lemma「n. 宴会, 党, 政党, 团体, 当事人, 聚会 v. 举办聚会」
- **建议：`?`**

## compiled → compile
- rank：form 20269 / lemma 26908 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编译；汇编（过去式）」 / lemma「编译；汇编」
- ECDICT：form「a. 编译的」 / lemma「vt. 编译, 编辑, 编纂, 收集 [计] 编译」
- **建议：`keep`**

## unearthed → unearth
- rank：form 20281 / lemma 29138 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发掘；发现」 / lemma「发掘；发现」
- ECDICT：form「a. 出土的（考古） v. 发掘或挖出某物( unearth的过去式和过去分词 ); 搜寻到某事物, 发现并披露」 / lemma「vt. 发掘, 掘出, 从洞中赶出, 揭露, 发现」
- **建议：`keep`**

## bolsheviks → bolshevik
- rank：form 20298 / lemma 21757 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「布尔什维克」 / lemma「布尔什维克」
- ECDICT：form「n. 布尔什维克( Bolshevik的复数形式 )」 / lemma「n. 布尔什维克, 激进分子」
- **建议：`keep`**

## gleaming → gleam
- rank：form 20316 / lemma 24021 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闪闪发光的」 / lemma「微光；闪光」
- ECDICT：form「a. 闪闪发光的 v. （使）闪烁, （使）闪亮( gleam的现在分词 )」 / lemma「n. 光束, 微光, 反光 vi. 闪烁, 隐约地闪现 vt. 使发微光, 使闪烁」
- **建议：`keep`**

## kudos → kudo
- rank：form 20336 / lemma 25075 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「赞扬；荣誉」 / lemma「赞扬；荣誉」
- ECDICT：form「n. 称赞, 光荣, 荣誉」 / lemma「n. 奖赏, 光荣, 荣誉」
- **建议：`keep`**

## terrorizing → terrorize
- rank：form 20338 / lemma 21451 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恐吓；使恐惧」 / lemma「恐吓；使恐惧」
- ECDICT：form「v. 使恐怖( terrorize的现在分词 ); 使畏惧; 使用胁迫或暴力手段恐吓; 胁迫（某人做某事）」 / lemma「vt. 使惊恐, 恐吓 vi. 实施恐怖统治」
- **建议：`keep`**

## styling → style
- rank：form 20355 / lemma 1277 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「造型；款式设计」 / lemma「风格；样式」
- ECDICT：form「n. 款式, 式样」 / lemma「n. 风格, 时尚, 文体, 风度, 字体, 类型 vt. 称呼, (根据新款式)设计, 使合潮流 n. 风格, 样式 …」
- **建议：`?`**

## terrorized → terrorize
- rank：form 20377 / lemma 21451 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恐吓；使恐惧」 / lemma「恐吓；使恐惧」
- ECDICT：form「v. 使恐怖( terrorize的过去式和过去分词 ); 使畏惧; 使用胁迫或暴力手段恐吓; 胁迫（某人做某事）」 / lemma「vt. 使惊恐, 恐吓 vi. 实施恐怖统治」
- **建议：`keep`**

## engulfed → engulf
- rank：form 20380 / lemma 31400 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吞没；淹没」 / lemma「吞没；淹没」
- ECDICT：form「v. 吞没, 包住( engulf的过去式和过去分词 )」 / lemma「vt. 卷入, 吸进, 吞没, 使全神贯注」
- **建议：`keep`**

## scaffolding → scaffold
- rank：form 20407 / lemma 21204 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「脚手架；支架」 / lemma「脚手架；绞刑台」
- ECDICT：form「n. 脚手架, 台架, (搭脚手架用的)支杆和木板, (喻)(论点等的)支柱 [化] 搭脚手架」 / lemma「n. 脚手架, 绞刑台 [化] 脚手架」
- **建议：`keep`**

## bots → bot
- rank：form 20409 / lemma 15474 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「机器人程序；机器人」 / lemma「机器人程序」
- ECDICT：form「[医] 肤蝇[类]蛆病」 / lemma「[计] 磁带开始标志, 计算机角色 [医] 肤蝇[类]幼虫」
- **建议：`keep`**

## blossoming → blossom
- rank：form 20421 / lemma 4611 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「开花；绽放」 / lemma「花；开花期」
- ECDICT：form「v. （植物）开花( blossom的现在分词 ); 发展; 长成; 变得更加健康（或自信、成功）」 / lemma「n. 花, 花开的状态, 兴旺期 vi. 开花, 兴旺, 发展」
- **建议：`?`**

## cobwebs → cobweb
- rank：form 20432 / lemma 40706 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蜘蛛网」 / lemma「蜘蛛网」
- ECDICT：form「n. 蜘蛛网( cobweb的复数形式 )」 / lemma「n. 蜘蛛网, 蛛丝, 混乱 vt. 使布满蛛网」
- **建议：`keep`**

## airmen → airman
- rank：form 20436 / lemma 24849 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「飞行员；空军士兵」 / lemma「飞行员；空军士兵」
- ECDICT：form「n. 航空从业员；飞行员（airman的复数）」 / lemma「n. 飞行员, 空军士兵」
- **建议：`keep`**

## stockholders → stockholder
- rank：form 20456 / lemma 35578 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「股东」 / lemma「股东」
- ECDICT：form「n. 股东（stockholder的复数）」 / lemma「n. 股东 [法] 股东, 股票持有者, 股票所有人」
- **建议：`keep`**

## trumpeting → trumpet
- rank：form 20464 / lemma 6543 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「吹号；大声宣告」 / lemma「小号；喇叭」
- ECDICT：form「vt. 大声说出或宣告（trumpet的现在分词形式）」 / lemma「n. 喇叭, 小号, 喇叭声 vi. 吹喇叭 vt. 用喇叭吹出, 吹嘘」
- **建议：`?`**

## mongols → mongol
- rank：form 20512 / lemma 19408 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「蒙古人」 / lemma「蒙古人；蒙古族」
- ECDICT：form「n. 蒙古人( Mongol的名词复数 )」 / lemma「n. 先天愚型病患者」
- **建议：`keep`**

## anklets → anklet
- rank：form 20523 / lemma 22222 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「脚镯；短袜」 / lemma「脚链；短袜」
- ECDICT：form「n. 短袜；脚镣（anklet的复数）」 / lemma「n. 短袜, 脚镯, 脚镣」
- **建议：`keep`**

## trinkets → trinket
- rank：form 20552 / lemma 23525 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小饰物；小玩意儿」 / lemma「小装饰品；小玩意儿」
- ECDICT：form「n. 小装饰品( trinket的复数形式 ); 小件饰物; 无价值的琐细杂物; 小玩意儿」 / lemma「n. 小件饰物, 无价值的琐碎东西, 小玩意儿」
- **建议：`keep`**

## endearing → endear
- rank：form 20570 / lemma 46800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「讨人喜欢的」 / lemma「使受喜爱」
- ECDICT：form「a. 引起爱情的, 令人钟爱的, 可爱的」 / lemma「vt. 使受喜爱, 使受钟爱」
- **建议：`keep`**

## pheromones → pheromone
- rank：form 20598 / lemma 34361 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「信息素；外激素」 / lemma「信息素；外激素」
- ECDICT：form「n. 信息素( pheromone的复数形式 )」 / lemma「[化] 性外激素; 信息激素」
- **建议：`keep`**

## kinks → kink
- rank：form 20602 / lemma 26920 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扭结；怪癖」 / lemma「扭结；怪癖」
- ECDICT：form「n. 奇想乐队（乐队名）」 / lemma「n. 扭结, 蜷缩 v. (使)扭结, (使)绞缠」
- **建议：`keep`**

## remanded → remand
- rank：form 20619 / lemma 23800 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「还押；发回重审」 / lemma「还押候审；发回重审」
- ECDICT：form「v. <律>将…还押候审( remand的过去式和过去分词 ); 将…发回重审」 / lemma「n. 遣回, 还押 vt. 遣回, 还押候审」
- **建议：`keep`**

## loafers → loafer
- rank：form 20623 / lemma 22592 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乐福鞋；懒人（复数）」 / lemma「懒人；乐福鞋」
- ECDICT：form「n. 虚度光阴者( loafer的复数形式 ); 游手好闲者; 无业游民; 平底便鞋」 / lemma「n. 游手好闲的人, 懒人, 懒汉鞋 [法] 无业游民, 不务正业者, 二流子」
- **建议：`keep`**

## oozing → ooze
- rank：form 20638 / lemma 22086 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「渗出；洋溢」 / lemma「渗出；慢慢流出」
- ECDICT：form「v. （浓液等）慢慢地冒出, 渗出( ooze的现在分词 ); 使（液体）缓缓流出; （浓液）渗出, 慢慢流出」 / lemma「n. 渗流, 分泌物 v. 渗出, 泄漏」
- **建议：`keep`**

## avenging → avenge
- rank：form 20640 / lemma 5516 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「报仇；复仇」 / lemma「报仇；复仇」
- ECDICT：form「a. 复仇的」 / lemma「vt. 为...报复, 报仇」
- **建议：`?`**

## etched → etch
- rank：form 20641 / lemma 39055 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蚀刻；铭刻」 / lemma「蚀刻；铭刻」
- ECDICT：form「被侵蚀的, 被蚀刻的, 风化的」 / lemma「vt. 蚀刻, 蚀镂 vi. 施行蚀刻法 n. 腐蚀剂 [计] 刻蚀; 侵蚀」
- **建议：`keep`**

## consolidated → consolidate
- rank：form 20735 / lemma 25840 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「合并的；巩固的」 / lemma「巩固；合并」
- ECDICT：form「a. 整理过的；巩固的；统一的」 / lemma「vt. 巩固, 使联合, 统一 vi. 巩固 [计] 合并计算」
- **建议：`keep`**

## traffickers → trafficker
- rank：form 20761 / lemma 26352 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贩运者；非法交易者」 / lemma「贩子；非法交易者」
- ECDICT：form「n. 商人, 贩子( trafficker的复数形式 ); 做（非法）买卖的人」 / lemma「n. 商人, 贩子 [法] 贩卖者, 买卖者, 商人」
- **建议：`keep`**

## encamped → encamp
- rank：form 20800 / lemma 22000 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「扎营的；露宿的」 / lemma「扎营，露营」
- ECDICT：form「v. 扎营( encamp的过去式和过去分词 )」 / lemma「vi. 扎营, 露营 vt. 使宿营」
- **建议：`keep`**

## formulas → formula
- rank：form 20839 / lemma 3971 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「公式；配方（复数）」 / lemma「公式；配方」
- ECDICT：form「pl. (专业术语)公式, 方案, 准则, 程式, 处方, 制造法, 配方, 惯用语句, 俗套话」 / lemma「n. 客套语, 公式, 准则 [计] 公式」
- **建议：`?`**

## gratifying → gratify
- rank：form 20842 / lemma 14300 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「令人满意的；使人高兴的」 / lemma「使满足，使高兴」
- ECDICT：form「a. 悦人的, 令人满足的」 / lemma「vt. 使满足」
- **建议：`?`**

## symbolizes → symbolize
- rank：form 20860 / lemma 25414 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「象征；代表（第三人称单数）」 / lemma「象征；代表」
- ECDICT：form「v. 象征, 作为…的象征( symbolize的第三人称单数 )」 / lemma「vt. 符号化, 用符号表现 vi. 采用象征, 使用符号」
- **建议：`keep`**

## brainwashing → brainwash
- rank：form 20861 / lemma 26554 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洗脑」 / lemma「洗脑；强行灌输」
- ECDICT：form「n. 洗脑」 / lemma「n. 洗脑 vt. 对人洗脑」
- **建议：`keep`**

## flickering → flicker
- rank：form 20887 / lemma 21127 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「闪烁的；摇曳的」 / lemma「闪烁；颤动」
- ECDICT：form「a. 闪烁的, 摇曳的, 微弱的 [计] 闪烁」 / lemma「n. 闪烁, 闪光, 颤动 vi. 闪动, 闪烁, 摇动, 扑动翅膀 vt. 使摇曳, 使闪烁」
- **建议：`keep`**

## inflamed → inflame
- rank：form 20910 / lemma 36762 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发炎的；激动的」 / lemma「使发炎；激怒」
- ECDICT：form「a. 红肿的, 发炎的」 / lemma「vt. 激怒, 点火, 激起 vi. 着火, 激动, 发炎」
- **建议：`keep`**

## inverted → invert
- rank：form 20911 / lemma 12800 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「倒转的；反向的」 / lemma「倒置，颠倒；反转」
- ECDICT：form「a. 倒转的, 反向的」 / lemma「a. 转化的 vt. 使反转, 使颠倒, 使转化 n. 颠倒的事物 [计] 倒置; 反转」
- **建议：`?`**

## inflated → inflate
- rank：form 20937 / lemma 22895 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「膨胀的；夸大的」 / lemma「充气；膨胀；抬高」
- ECDICT：form「a. 膨胀的, 充了气的, 夸张的, 通货膨胀的」 / lemma「vt. 使膨胀, 使得意, 使通货膨胀, 使充气 vi. 充气, 膨胀」
- **建议：`keep`**

## muted → mute
- rank：form 20944 / lemma 7004 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「柔和的；无声的」 / lemma「沉默的；哑的」
- ECDICT：form「a. 变弱了的, 变柔和了的」 / lemma「n. 哑子, 哑音字母, 弱音器 a. 哑的, 无声的, 沉默的 vt. 减弱...的声音 vi. 排泄」
- **建议：`?`**

## islanders → islander
- rank：form 20965 / lemma 45141 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「岛民（复数）」 / lemma「岛民；岛上居民」
- ECDICT：form「n. 岛民( islander的复数形式 )」 / lemma「n. 岛民」
- **建议：`keep`**

## deteriorating → deteriorate
- rank：form 20969 / lemma 25755 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恶化；退化」 / lemma「恶化；退化」
- ECDICT：form「v. 恶化, 变坏( deteriorate的现在分词 )」 / lemma「v. (使)恶化」
- **建议：`keep`**

## sprinklers → sprinkler
- rank：form 20971 / lemma 21308 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「洒水器；喷水装置」 / lemma「洒水器；喷水装置」
- ECDICT：form「n. 洒水器, 喷洒器( sprinkler的复数形式 ); （建筑物内的）自动喷水灭火装置」 / lemma「n. 洒水车, 洒水器」
- **建议：`keep`**

## stinging → sting
- rank：form 20999 / lemma 4981 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刺痛的；尖锐的」 / lemma「刺；蜇」
- ECDICT：form「a. 刺人的, 刺一般的, 激烈的」 / lemma「n. 叮, 刺痛, 刺激, 讽刺 vt. 叮, 刺痛, 刺激, 使苦恼 vi. 叮, 刺痛」
- **建议：`?`**

## assaying → assay
- rank：form 21000 / lemma 44693 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「定量分析，化验」 / lemma「化验；测定；试验」
- ECDICT：form「[化] 试金; 分析矿物; 测定; 分析; 鉴定」 / lemma「n. 试验, 化验, 分析 vt. 化验, 分析, 评价, 尝试 vi. 被验明内含成分」
- **建议：`keep`**

## innervated → innervate
- rank：form 21000 / lemma 22300 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「受神经支配的；有神经分布的」 / lemma「使受神经支配；刺激」
- ECDICT：form「a. [医]神经支配的 v. 使受神经支配, 促使（器官、肌肉等的）活动( innervate的过去式和过去分词 )」 / lemma「vt. 使受神经支配, 使神经分布于」
- **建议：`keep`**

## prattling → prattle
- rank：form 21000 / lemma 38037 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「唠叨的；唠叨」 / lemma「唠叨；闲聊」
- ECDICT：form「v. （小孩般）天真无邪地说话( prattle的现在分词 ); 发出连续而无意义的声音; 闲扯; 东拉西扯」 / lemma「vi. 小孩般说话, 闲聊, 胡说 vt. 天真地说 n. 闲扯, (小孩般)咿咿呀呀的话」
- **建议：`keep`**

## ailing → ail
- rank：form 21011 / lemma 46390 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生病的；不景气的」 / lemma「使苦恼；生病」
- ECDICT：form「a. 生病的 [医] 患病的, 病痛的」 / lemma「vt. 使苦恼 vi. 生病, 处境困难 [计] 数组互联逻辑」
- **建议：`keep`**

## specifications → specification
- rank：form 21016 / lemma 43908 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「规格；详细说明」 / lemma「规格；说明书」
- ECDICT：form「n. 规格, 规范, 明细单, 说明书, 详细的计划书」 / lemma「n. 规格, 详述, 详细说明书 [计] 规范; 形式说明; 说明; 说明书; 规格」
- **建议：`keep`**

## zoning → zone
- rank：form 21036 / lemma 1845 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分区规划；地带划分」 / lemma「地带；区域」
- ECDICT：form「n. 分区制 [医] 带现象(补体结合)」 / lemma「n. 地带, 带, 地区 vt. 环绕, 使分成地带 vi. 分成区 [计] 卡片顶部的三行区; 区; 区域」
- **建议：`?`**

## stifled → stifle
- rank：form 21041 / lemma 25245 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「扼制；使窒息」 / lemma「抑制；扼制；使窒息」
- ECDICT：form「堵」 / lemma「vt. 使窒息, 抑止, 扼杀 vi. 窒息, 被扼杀」
- **建议：`keep`**

## raindrops → raindrop
- rank：form 21049 / lemma 41645 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雨滴」 / lemma「雨滴」
- ECDICT：form「n. 雨点, 雨滴( raindrop的复数形式 )」 / lemma「n. 雨滴, 雨点」
- **建议：`keep`**

## wrought → work
- rank：form 21050 / lemma 2600 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锻造的；制成的」 / lemma「工作；起作用」
- ECDICT：form「a. 制成的, 精细的 work的过去式和过去分词」 / lemma「n. 工作, 劳动, 职业, 行为, 功, 作品, 成果, 产品, 工程 vi. 工作, 劳动, 做, 运转, 起作用,…」
- **建议：`?`**

## summoning → summon
- rank：form 21105 / lemma 6390 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「召唤；传唤（现在分词）」 / lemma「召唤；传唤」
- ECDICT：form「v. 传唤( summon的现在分词 ); 召唤; 传讯（出庭）; 鼓起（勇气）」 / lemma「vt. 召唤, 召集, 号召, 振奋, 唤起, 鼓起 [经] 传唤, 传讯」
- **建议：`?`**

## summoning → summons
- rank：form 21105 / lemma 10983 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「召唤；传唤（现在分词）」 / lemma「传票；召唤」
- ECDICT：form「v. 传唤( summon的现在分词 ); 召唤; 传讯（出庭）; 鼓起（勇气）」 / lemma「n. 召唤, 传唤, 召集, 传票 vt. 传唤, 唤出, 传到」
- **建议：`?`**

## downed → down
- rank：form 21130 / lemma 86 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「击落；喝下（过去式）」 / lemma「向下；下来」
- ECDICT：form「vbl. 击落」 / lemma「a. 向下的 adv. 下, 下去, 降下 prep. 往下, 沿着 n. 丘陵, 软毛, 开阔的高地 [计] 向下, …」
- **建议：`?`**

## ransacked → ransack
- rank：form 21137 / lemma 37028 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「洗劫；翻遍（过去式）」 / lemma「洗劫；彻底搜查」
- ECDICT：form「v. 彻底搜查( ransack的过去式和过去分词 ); 抢劫, 掠夺」 / lemma「vt. 到处搜索, 遍寻, 掠夺, 洗劫 [法] 洗劫, 抢劫, 掠夺」
- **建议：`keep`**

## skyscrapers → skyscraper
- rank：form 21141 / lemma 21292 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摩天大楼（复数）」 / lemma「摩天大楼」
- ECDICT：form「n. 摩天大楼( skyscraper的复数形式 ); 层楼高耸; 广厦高楼」 / lemma「n. 摩天楼, 三角形天帆」
- **建议：`keep`**

## nodes → node
- rank：form 21174 / lemma 23346 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「节点；结；淋巴结」 / lemma「节点；结」
- ECDICT：form「n. 节点（node的复数形式）」 / lemma「n. 节, 结节, 瘤 [计] 节点; 结点」
- **建议：`keep`**

## tarnished → tarnish
- rank：form 21220 / lemma 25228 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「失去光泽的；受损的」 / lemma「使失去光泽；败坏（名声）」
- ECDICT：form「v. 使生锈；沾污」 / lemma「n. 失泽, 失泽膜, 污点 vt. 使失去光泽, 玷污 vi. 失去光泽, 被玷污」
- **建议：`keep`**

## conspirators → conspirator
- rank：form 21231 / lemma 35450 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「阴谋者；共谋者」 / lemma「阴谋者；共谋者」
- ECDICT：form「n. 共谋者, 阴谋家( conspirator的复数形式 )」 / lemma「n. 同谋者, 阴谋者, 反叛者 [法] 共谋者, 阴谋家」
- **建议：`keep`**

## quivering → quiver
- rank：form 21241 / lemma 23170 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「颤抖的；微微震动的」 / lemma「颤抖；抖动」
- ECDICT：form「a. 颤动的, 抖动的」 / lemma「n. 震动, 颤抖, 箭袋 vi. 颤抖, 振动 vt. 使颤动 a. 敏捷的」
- **建议：`keep`**

## cheekbones → cheekbone
- rank：form 21244 / lemma 38553 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「颧骨（复数）」 / lemma「颧骨」
- ECDICT：form「n. 面颊骨, 颧骨( cheekbone的复数形式 )」 / lemma「n. 颧骨」
- **建议：`keep`**

## saturated → saturate
- rank：form 21282 / lemma 15400 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「饱和的；浸透的」 / lemma「使饱和；浸透」
- ECDICT：form「a. 饱和的, 渗透的 [医] 饱和的」 / lemma「vt. 使渗透, 浸透, 使充满, 使饱和 a. 浸透的, 饱和度高的, 深颜色的 n. 饱和化合物, 饱和脂肪酸」
- **建议：`?`**

## smooches → smooch
- rank：form 21286 / lemma 24919 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「亲吻（复数，口语）」 / lemma「接吻；拥吻」
- ECDICT：form「n. 接吻( smooch的名词复数 ) v. 接吻( smooch的第三人称单数 )」 / lemma「n. 搂抱接吻, 污迹 vi. 搂抱着接吻 vt. 与...搂抱接吻, 弄脏」
- **建议：`keep`**

## boning → bon
- rank：form 21298 / lemma 4655 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper, homograph`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「去骨；剔骨（现在分词）」 / lemma「邦（人名/地名）」
- ECDICT：form「n. 去(鱼)骨 [化] 测平法; 去骨; 施骨肥」 / lemma「a. （法）好的」
- **建议：`keep`**

## boning → bone
- rank：form 21298 / lemma 5295 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「去骨；剔骨（现在分词）」 / lemma「骨头；骨骼」
- ECDICT：form「n. 去(鱼)骨 [化] 测平法; 去骨; 施骨肥」 / lemma「n. 骨头, 骨, 骨制品 vt. 剔骨 vi. 专心致志」
- **建议：`?`**

## computing → compute
- rank：form 21305 / lemma 13000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「计算；计算机技术」 / lemma「计算，估算」
- ECDICT：form「[计] 计算」 / lemma「v. 计算, 估算 n. 计算, 估算」
- **建议：`?`**

## chomping → chomp
- rank：form 21343 / lemma 29599 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「大声咀嚼（现在分词）」 / lemma「大声咀嚼」
- ECDICT：form「v. 切齿, 格格地咬牙, 咬响牙齿( chomp的现在分词 )」 / lemma「vi. 使劲地嚼, 格格地咬」
- **建议：`keep`**

## constables → constable
- rank：form 21356 / lemma 9699 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「警察；巡官（复数）」 / lemma「康斯特布尔；英国风景画家」
- ECDICT：form「n. <英>警察( constable的复数形式 )」 / lemma「n. 治安官, 警官, 总管 [法] 警察, 警官, 巡警」
- **建议：`keep`**

## hooters → hooter
- rank：form 21388 / lemma 28060 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「汽笛；猫头鹰（复数）」 / lemma「汽笛；喇叭；猫头鹰」
- ECDICT：form「n. 汽笛( hooter的复数形式 )」 / lemma「n. 呼喊的人, 汽笛, 号笛, 警笛」
- **建议：`keep`**

## browsing → browse
- rank：form 21390 / lemma 25229 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「浏览；随意翻阅（现在分词）」 / lemma「浏览；随便翻阅」
- ECDICT：form「[计] 浏览, 翻阅, 监视」 / lemma「v. 浏览, 吃草 n. 浏览, 吃草 [计] 浏览」
- **建议：`keep`**

## alluring → allure
- rank：form 21395 / lemma 23186 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「诱人的；迷人的」 / lemma「魅力；诱惑力」
- ECDICT：form「a. 吸引人的, 诱人的, 迷人的」 / lemma「vt. 引诱, 吸引 n. 魅力, 诱惑力」
- **建议：`keep`**

## occupants → occupant
- rank：form 21409 / lemma 26509 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「居住者；占用者」 / lemma「居住者；占用者」
- ECDICT：form「n. 居住者；购买者；租赁人（occupant的复数）」 / lemma「n. 占有者, 居住者, 占用者」
- **建议：`keep`**

## adjoining → adjoin
- rank：form 21423 / lemma 15800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「毗邻的；隔壁的」 / lemma「毗连，紧挨」
- ECDICT：form「a. 邻接的, 毗连的 [机] 联接」 / lemma「v. 邻接, 毗连」
- **建议：`?`**

## disbanded → disband
- rank：form 21494 / lemma 24699 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「解散；遣散」 / lemma「解散；遣散」
- ECDICT：form「v. （使）解散, 散伙, 解体( disband的过去式和过去分词 )」 / lemma「vt. 解散, 遣散 vi. 被解散」
- **建议：`keep`**

## signposted → signpost
- rank：form 21500 / lemma 36863 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「有路标指示的；标记清楚的」 / lemma「路标；指示牌」
- ECDICT：form「v. 指示牌, 标志杆( signpost的过去式和过去分词 ); 路标」 / lemma「n. 招牌柱, 广告柱, 路标」
- **建议：`keep`**

## salutations → salutation
- rank：form 21527 / lemma 32889 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「问候；致意」 / lemma「招呼；问候语」
- ECDICT：form「n. 招呼( salutation的复数形式 ); 致意; 致敬; 信函中的称呼语」 / lemma「n. 招呼, 寒喧, 问候」
- **建议：`keep`**

## docs → doc
- rank：form 21557 / lemma 1085 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「文档；文件（口语）」 / lemma「医生；文档（口语）」
- ECDICT：form「n. 说明文件；文献」 / lemma「[计] 通信部, 数字输出控制, 文档 [医] 脱氧皮质酮」
- **建议：`keep`**

## incinerated → incinerate
- rank：form 21625 / lemma 30509 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「焚化；烧成灰」 / lemma「焚化；烧成灰」
- ECDICT：form「v. 把（废物）烧成灰烬( incinerate的过去式和过去分词 )」 / lemma「vi. 烧成灰, 灰化 vt. 焚化」
- **建议：`keep`**

## twittering → twitter
- rank：form 21732 / lemma 6987 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「鸟鸣声；叽叽喳喳」 / lemma「推特（社交平台）；鸟鸣」
- ECDICT：form「n. 呢喃」 / lemma「n. 啁啾, 唧唧喳喳声 vi. 啭, 啁啾, 颤抖 vt. 嘁嘁喳喳地讲, 抖动」
- **建议：`keep`**

## disowned → disown
- rank：form 21762 / lemma 23831 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「否认；与…断绝关系」 / lemma「否认；与…断绝关系」
- ECDICT：form「v. 否认, 否认与…有关系, 断绝与…的关系( disown的过去式和过去分词 )」 / lemma「vt. 否认 [计] 不认, 驱逐」
- **建议：`keep`**

## hoarding → hoard
- rank：form 21788 / lemma 23220 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「囤积；广告牌」 / lemma「囤积；贮藏」
- ECDICT：form「n. 贮藏, 积蓄, 囤积, 临时围墙 [经] 囤积」 / lemma「n. 贮藏物, 密藏的金钱 v. 囤积, 贮藏」
- **建议：`keep`**

## droning → drone
- rank：form 21836 / lemma 6318 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗡嗡作响；单调地说」 / lemma「无人机；雄蜂」
- ECDICT：form「a. 发嗡嗡声的, 声音低沉单调的」 / lemma「n. 雄蜂, 懒惰者, 嗡嗡的声音, 无人驾驶飞机(或船) vi. 嗡嗡作声, 混日子 vt. 低沉地说」
- **建议：`?`**

## prancing → prance
- rank：form 21856 / lemma 30011 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「腾跃；欢跃地走」 / lemma「腾跃；欢跃」
- ECDICT：form「v. （马）腾跃( prance的现在分词 )」 / lemma「n. (马)腾跃, 昂首阔步 vi. 腾跃, 昂首阔步 vt. 使腾跃」
- **建议：`keep`**

## electrodes → electrode
- rank：form 21875 / lemma 36560 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电极（复数）」 / lemma「电极」
- ECDICT：form「n. 电极( electrode的复数形式 )」 / lemma「n. 电极 [化] 电极; 焊条; 电焊条」
- **建议：`keep`**

## grappling → grapple
- rank：form 21904 / lemma 32440 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「搏斗；努力应对」 / lemma「搏斗；努力应对」
- ECDICT：form「=grapnel grappling iron (打捞用的)抓机, 爪钩」 / lemma「v. 抓住, 掌握 n. 抓住, 系紧, 掌握, 与...扭打」
- **建议：`keep`**

## misfits → misfit
- rank：form 21906 / lemma 25846 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「不合群的人」 / lemma「不适应环境的人」
- ECDICT：form「n. 不适应生活环境的人, 不善和别人共事的人( misfit的复数形式 )」 / lemma「n. 不适合, 不适合的东西, 不适应环境的人 vt. (衣着)对...不合身 vi. 不适合」
- **建议：`keep`**

## molesting → molest
- rank：form 21908 / lemma 22069 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「骚扰；猥亵」 / lemma「骚扰；猥亵」
- ECDICT：form「v. 骚扰( molest的现在分词 ); 干扰; 调戏; 猥亵」 / lemma「vt. 妨碍, 干扰, 调戏 [法] 调戏, 作弄, 恶意干涉」
- **建议：`keep`**

## strumming → strum
- rank：form 21910 / lemma 34806 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「弹拨（琴弦）」 / lemma「弹拨（弦乐器）」
- ECDICT：form「v. （漫不经心地）弹（弦乐器）( strum的现在分词 ); （漫不经心地）弹拨」 / lemma「n. 弹拨(声) v. 漫不经心地弹, 漫不经心地奏」
- **建议：`keep`**

## hitchhiking → hitchhike
- rank：form 21969 / lemma 24872 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「搭便车旅行」 / lemma「搭便车旅行」
- ECDICT：form「v. 搭乘; <美><口>作搭便车式的旅行( hitchhike的现在分词 )」 / lemma「vi. 搭便车 vt. 要求(搭便车)」
- **建议：`keep`**

## liven → lve
- rank：form 22000 / lemma 41099 ｜ type `d` ｜ src `B` ｜ flags `lemma-proper, src-b-only, form-more-frequent`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「使活跃；使有生气」 / lemma「缩写/专名」
- ECDICT：form「vt. 使高兴, 使快活 vi. 快活起来」 / lemma「[医][=left ventricular ejection]左心室射血」
- **建议：`keep`**

## outdone → outdo
- rank：form 22003 / lemma 31763 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「胜过；超越（过去分词）」 / lemma「胜过；超越」
- ECDICT：form「outdo的过去分词」 / lemma「vt. 超越, 胜过, 战胜」
- **建议：`keep`**

## perpetrated → perpetrate
- rank：form 22020 / lemma 47269 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「犯（罪）；实施（过去式）」 / lemma「犯（罪）；施行」
- ECDICT：form「v. 犯（罪）, 作（恶）, 做（坏事）( perpetrate的过去式和过去分词 )」 / lemma「vt. 做(恶), 犯(罪), 胡说, 恶劣地做 [法] 犯, 作, 行」
- **建议：`keep`**

## mathews → mathew
- rank：form 22095 / lemma 27225 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「马修斯（姓氏）」 / lemma「马修（男子名）」
- ECDICT：form「n. (Mathews)人名；(英)马修斯」 / lemma「n. 马修（男子名）」
- **建议：`keep`**

## amazons → amazon
- rank：form 22114 / lemma 3400 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「亚马逊人；女战士」 / lemma「亚马孙；亚马逊」
- ECDICT：form「n. 奴役现象；亚马逊人；亚马逊鹦鹉；亚马逊女战士（Amazon的复数）」 / lemma「n. 亚马孙河 [医] 无乳腺者」
- **建议：`keep`**

## routed → rout
- rank：form 22127 / lemma 6786 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「击溃；按路线发送」 / lemma「溃败」
- ECDICT：form「n. 已选择路径」 / lemma「n. 溃败, 大败, 乌合之众, 盛大晚会 vt. 使溃败, 使败逃, 打垮, 用鼻拱, 挖起, 搜, 唤起 vi. 用…」
- **建议：`?`**

## routed → route
- rank：form 22127 / lemma 1833 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「击溃；按路线发送」 / lemma「路线；途径」
- ECDICT：form「n. 已选择路径」 / lemma「n. 路径, 途径, 路线 vt. 确定路线, 按规定路线发送 [计] 传递, 路由设定程序」
- **建议：`?`**

## haas → haa
- rank：form 22129 / lemma 28582 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「哈斯（姓氏/品牌名）」 / lemma「哈（笑声/惊讶）」
- ECDICT：form「(HAA 的复数) abbr. 重型防空武器（Heavy Anti-Aircraft）」 / lemma「abbr. 重型防空武器（Heavy Anti-Aircraft）」
- **建议：`keep`**

## affiliated → affiliate
- rank：form 22130 / lemma 35344 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「隶属的；有关联的」 / lemma「使隶属；加入」
- ECDICT：form「a. 有关连的；附属的」 / lemma「vt. 使紧密联系, 使附属, 接纳, 收养 vi. 发生联系, 参加」
- **建议：`keep`**

## mayans → mayan
- rank：form 22142 / lemma 15543 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「玛雅人」 / lemma「玛雅的；玛雅人」
- ECDICT：form「n. 玛雅语; 玛雅人（Mayan的复数形式, 现在墨西哥及哥伦比亚等地的原住民）」 / lemma「a. 马雅人的, 马雅语的 n. 马雅人, 马雅语」
- **建议：`keep`**

## christened → christen
- rank：form 22171 / lemma 24324 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「为…施洗礼；命名」 / lemma「为…施洗礼；命名」
- ECDICT：form「v. 在洗礼时为（某人）命名( christen的过去式和过去分词 )」 / lemma「vt. 为...施洗礼, 命名」
- **建议：`keep`**

## tranquilizers → tranquilizer
- rank：form 22182 / lemma 16434 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「镇静剂；安定药」 / lemma「镇静剂」
- ECDICT：form「n. 镇定剂；使镇定的人或物」 / lemma「[医] 安定药, 镇定药」
- **建议：`keep`**

## demeaning → demean
- rank：form 22192 / lemma 36233 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贬低的；有辱人格的」 / lemma「贬低；使失尊严」
- ECDICT：form「a. 降低身份的；有损人格的」 / lemma「vt. 贬低身分, 贬损」
- **建议：`keep`**

## jangling → jangle
- rank：form 22194 / lemma 22556 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发出刺耳声；使烦躁」 / lemma「发出刺耳声；使烦躁」
- ECDICT：form「v. 铁器相碰发出刺耳的声音( jangle的现在分词 ); 烦扰, 刺激神经」 / lemma「v. 吵架, (使)发出刺耳声 n. 吵嚷, 刺耳声, 空谈」
- **建议：`keep`**

## flogged → flog
- rank：form 22238 / lemma 22596 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鞭打；抽打」 / lemma「鞭打；出售（俚语）」
- ECDICT：form「v. 滥用( flog的过去式和过去分词 ); <非正>出售; 多次重打; 鞭策死马」 / lemma「vt. 鞭打, 鞭策, 严厉的批评, 迫使」
- **建议：`keep`**

## embroidered → embroider
- rank：form 22250 / lemma 36784 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「刺绣；渲染」 / lemma「刺绣；添枝加叶」
- ECDICT：form「a. 绣花的；刺绣的」 / lemma「vt. 刺绣, 镶边, 装饰 vi. 绣花」
- **建议：`keep`**

## carnations → carnation
- rank：form 22278 / lemma 25805 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「康乃馨；肉色」 / lemma「康乃馨；淡红色」
- ECDICT：form「n. 麝香石竹, 康乃馨( carnation的复数形式 )」 / lemma「n. 康乃馨, 粉红色 [医] 肉色, 天然肉色」
- **建议：`keep`**

## iranians → iranian
- rank：form 22296 / lemma 12777 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「伊朗人（复数）」 / lemma「伊朗的；伊朗人」
- ECDICT：form「n. 伊朗人（Iranian的复数形式）」 / lemma「a. 伊朗的, 伊朗语系的 n. 伊朗人, 伊朗语」
- **建议：`keep`**

## tanked → tank
- rank：form 22303 / lemma 1935 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「惨败；暴跌」 / lemma「坦克；水箱」
- ECDICT：form「a. 放在槽/箱/柜内的, (非正式)喝醉的」 / lemma「n. 槽, 箱, 柜, 罐, 池塘, 储水池, 坦克 vt. 储于箱中」
- **建议：`?`**

## alterations → alteration
- rank：form 22323 / lemma 28171 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「改动；修改（复数）」 / lemma「改变；修改」
- ECDICT：form「n. 改变；变更；服装修改（alteration的复数）」 / lemma「n. 变更, 改动 [医] 变更」
- **建议：`keep`**

## shined → shine
- rank：form 22354 / lemma 8037 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发光；擦亮（过去式）」 / lemma「发光；照耀；擦亮」
- ECDICT：form「shine的过去式和过去分词」 / lemma「n. 光泽, 阳光 vt. 使发光 vi. 照耀, 发光, 发亮」
- **建议：`?`**

## uploading → upload
- rank：form 22435 / lemma 11612 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上传」 / lemma「上传」
- ECDICT：form「v. 上传；上载（upload的ing形式）」 / lemma「[计] 上装, 加载, 储入」
- **建议：`keep`**

## waltzing → waltz
- rank：form 22444 / lemma 2880 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「跳华尔兹；轻快旋转」 / lemma「华尔兹；跳华尔兹」
- ECDICT：form「v. 与…跳华尔兹舞( waltz的现在分词 ); 强拉, 硬拖; 轻快地走动; 旋转」 / lemma「n. 华尔兹舞, 圆舞曲 a. 华尔兹舞的, 圆舞曲的 vi. 跳华尔兹舞, 轻快地走动 vt. 与...跳华尔兹舞, …」
- **建议：`?`**

## wheezes → wheeze
- rank：form 22460 / lemma 36092 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喘息；呼哧作响」 / lemma「喘息；喘鸣」
- ECDICT：form「n. 喘息声( wheeze的名词复数 ) v. 喘息, 发出呼哧呼哧的喘息声( wheeze的第三人称单数 )」 / lemma「vi. 喘气 vt. 喘息着说 n. 喘气声, 喘息」
- **建议：`keep`**

## willed → will
- rank：form 22462 / lemma 48 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「立遗嘱赠与；意志驱使」 / lemma「将；会（助动词）」
- ECDICT：form「a. 有...意志的」 / lemma「n. 意志, 决心, 意愿, 意向, 干劲, 遗嘱 vt. 用意志的力量驱使, 决意, 愿意, 立遗嘱 vi. 下决心,…」
- **建议：`?`**

## warring → war
- rank：form 22467 / lemma 450 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「交战的；敌对的」 / lemma「战争」
- ECDICT：form「a. 交战的, 敌对的, 冲突的 [法] 战争, 敌对行为」 / lemma「n. 战争, 战争状态, 战术, 军事, 冲突, 斗争, 竞争 vi. 进行战争, 作战, 打仗, 战斗 a. 战争的,…」
- **建议：`?`**

## conning → con
- rank：form 22514 / lemma 3308 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「欺骗；诈骗」 / lemma「骗局；反对」
- ECDICT：form「v. 诈骗, 哄骗( con的现在分词 ); 指挥操舵( conn的现在分词 )」 / lemma「vt. 精读, 仔细研究, 默记 adv. 反面地, 从反面 a. 欺诈的 n. 反对者, 反对票, 肺结核 [计] 控…」
- **建议：`?`**

## conning → conn
- rank：form 22514 / lemma 23488 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「欺骗；诈骗」 / lemma「指挥操舵；驾船」
- ECDICT：form「v. 诈骗, 哄骗( con的现在分词 ); 指挥操舵( conn的现在分词 )」 / lemma「vt. 指挥操舵 n. 指挥操舵」
- **建议：`keep`**

## tater → tate
- rank：form 22540 / lemma 5869 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「土豆（口语）」 / lemma「泰特（姓氏）」
- ECDICT：form「[口]=potato」 / lemma「n. 塔特（姓氏）」
- **建议：`keep`**

## kes → ke
- rank：form 22564 / lemma 11973 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「凯斯（人名/缩写）」 / lemma「柯（音译名/姓氏）」
- ECDICT：form「(ke 的复数) abbr. 动能（kinetic energy）；键入错误（Key Error）」 / lemma「abbr. 动能（kinetic energy）；键入错误（Key Error）」
- **建议：`keep`**

## castrated → castrate
- rank：form 22579 / lemma 24089 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「被阉割的」 / lemma「阉割」
- ECDICT：form「a. [医]去势的, 阉割的, 去雄的 v. 阉割（动物、人）( castrate的过去式 )」 / lemma「vt. 阉割, 删除, 使丧失力量(或效果) [医] 去生殖腺者, 阉者, 阉, 阉割」
- **建议：`keep`**

## opted → opt
- rank：form 22588 / lemma 24786 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「选择；决定」 / lemma「选择；决定」
- ECDICT：form「v. 选择, 挑选( opt的过去式和过去分词 )」 / lemma「vi. 选择」
- **建议：`keep`**

## austrians → austrian
- rank：form 22597 / lemma 10453 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「奥地利人（复数）」 / lemma「奥地利的；奥地利人」
- ECDICT：form「n. 奥地利人( Austrian的复数形式 )」 / lemma「n. 奥地利人 a. 奥地利的, 奥地利人的」
- **建议：`keep`**

## vaccinated → vaccinate
- rank：form 22617 / lemma 42920 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「已接种疫苗的」 / lemma「接种疫苗」
- ECDICT：form「a. [医]已接种的, 种痘的, 接种过疫菌的 v. 给…接种疫苗( vaccinate的过去式和过去分词 ); 注射疫…」 / lemma「v. 预防接种」
- **建议：`keep`**

## ramses → ramse
- rank：form 22641 / lemma 35370 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「拉美西斯（古埃及法老名）」 / lemma「拉姆斯（人名/专名）」
- ECDICT：form「(ramse 的复数) 拉姆齐（人名）」 / lemma「拉姆齐（人名）」
- **建议：`keep`**

## iraqis → iraqi
- rank：form 22644 / lemma 11259 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「伊拉克人（复数）」 / lemma「伊拉克的；伊拉克人」
- ECDICT：form「伊拉克人( Iraqi的名词复数 )」 / lemma「n. 伊拉克人, 伊拉克阿拉伯语 a. 伊拉克的, 伊拉克人的」
- **建议：`keep`**

## illustrations → illustration
- rank：form 22659 / lemma 26015 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「插图；说明；例证」 / lemma「插图；说明」
- ECDICT：form「n. 插图；插画（illustration的复数）」 / lemma「n. 例证, 插图 [化] 插图」
- **建议：`keep`**

## dismembered → dismember
- rank：form 22660 / lemma 37349 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「肢解；分割」 / lemma「肢解；分割」
- ECDICT：form「v. 分割…的肢体, 肢解( dismember的过去式和过去分词); 身首异处」 / lemma「vt. 割断手足, 支解, 分割」
- **建议：`keep`**

## extremities → extremity
- rank：form 22699 / lemma 37904 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「四肢；末端」 / lemma「末端；极端；肢体」
- ECDICT：form「n. 端点( extremity的名词复数 ); 尽头; 手和足; 极窘迫的境地」 / lemma「n. 极端, 极点, 困境, 绝境 [医] 肢, 端」
- **建议：`keep`**

## mormons → mormon
- rank：form 22741 / lemma 14162 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「摩门教徒」 / lemma「摩门教徒」
- ECDICT：form「n. 摩门教徒( Mormon的复数形式 )」 / lemma「n. 摩门教徒」
- **建议：`keep`**

## molding → mold
- rank：form 22772 / lemma 6278 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「模制；装饰线条」 / lemma「霉菌；模具」
- ECDICT：form「n. 模制, 铸造物, 模制件, 浇铸 [化] 模塑; 模压」 / lemma「n. 模子, 模型, 霉 v. 形成, 塑造, 发霉」
- **建议：`?`**

## parishioners → parishioner
- rank：form 22800 / lemma 42018 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「教区居民」 / lemma「教区居民」
- ECDICT：form「n. 教区居民( parishioner的复数形式 )」 / lemma「n. 教民」
- **建议：`keep`**

## hungarians → hungarian
- rank：form 22802 / lemma 8025 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「匈牙利人」 / lemma「匈牙利的；匈牙利语」
- ECDICT：form「n. 匈牙利人（Hungarian的复数）」 / lemma「a. 匈牙利的, 匈牙利人的, 匈牙利语的 n. 匈牙利人, 匈牙利语」
- **建议：`keep`**

## defiled → defile
- rank：form 22822 / lemma 25424 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「玷污；亵渎」 / lemma「污损；亵渎」
- ECDICT：form「v. 玷污( defile的过去式和过去分词 ); 污染; 弄脏; 纵列行进」 / lemma「vt. 弄脏, 污损, 败坏 vi. 以纵队前进 n. 隘路, 狭道」
- **建议：`keep`**

## remodeling → remodel
- rank：form 22849 / lemma 23685 ｜ type `i` ｜ src `A` ｜ flags `src-a-only, form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「翻新；改建」 / lemma「改建；重塑」
- ECDICT：form「n. 重塑；改建；重构（remodel进行式）」 / lemma「vt. 改造, 改型, 改变」
- **建议：`keep`**

## blogs → blog
- rank：form 22859 / lemma 6838 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「博客（复数）」 / lemma「博客；写博客」
- ECDICT：form「n. 博客, 网志（网站上记有活动、意见等的个人记录）( blog的名词复数 )」 / lemma「n. 博客；部落格；网络日志」
- **建议：`?`**

## dwellers → dweller
- rank：form 22870 / lemma 39357 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「居民；居住者（复数）」 / lemma「居民；居住者」
- ECDICT：form「n. 居民, 居住者( dweller的复数形式 )」 / lemma「n. 居民」
- **建议：`keep`**

## ails → ail
- rank：form 22913 / lemma 46390 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使苦恼；生病」 / lemma「使苦恼；生病」
- ECDICT：form「abbr. 自动仪表着陆系统（Automatic Instrument Landing System）」 / lemma「vt. 使苦恼 vi. 生病, 处境困难 [计] 数组互联逻辑」
- **建议：`keep`**

## ester → est
- rank：form 22915 / lemma 7479 ｜ type `r` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「酯（化学）」 / lemma「（法语）是；东部时间」
- ECDICT：form「n. 酯 [化] 酯」 / lemma「(美国)东部时间」
- **建议：`keep`**

## bedbugs → bedbug
- rank：form 22961 / lemma 46450 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「臭虫；床虱」 / lemma「臭虫」
- ECDICT：form「n. 臭虫, 木虱, 床虱( bedbug的复数形式 )」 / lemma「n. 臭虫 [医] 臭虫」
- **建议：`keep`**

## disillusioned → disillusion
- rank：form 23020 / lemma 40161 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「大失所望的；不再抱幻想的」 / lemma「使醒悟；使失望」
- ECDICT：form「a. 幻想破灭了的, 大失所望的, 醒悟了的」 / lemma「n. 觉醒, 幻灭 vt. 使醒悟, 使幻想破灭」
- **建议：`keep`**

## halted → halt
- rank：form 23042 / lemma 8163 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「停止；暂停（halt过去式）」 / lemma「停止；中止；暂停」
- ECDICT：form「v. （使）停下来( halt的过去式和过去分词 )」 / lemma「n. 停止, 立定, 休息 vt. 使停止, 使立定 vi. 立定, 停止, 蹒跚, 踌躇, 有缺点 [计] 停止」
- **建议：`?`**

## halted → halter
- rank：form 23042 / lemma 31732 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「停止；暂停（halt过去式）」 / lemma「笼头；吊带衫」
- ECDICT：form「v. （使）停下来( halt的过去式和过去分词 )」 / lemma「n. 缰绳, 笼头 [法] 绞刑, 绞索」
- **建议：`keep`**

## blackened → blacken
- rank：form 23061 / lemma 37471 ｜ type `d` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「变黑的；烧焦的」 / lemma「使变黑；抹黑」
- ECDICT：form「a. （食品）涂上辣椒粉和调味品后油炸的, 熏制的 v. （使）变黑, 把…弄黑( blacken的过去式和过去分词 )…」 / lemma「vt. 使变黑, 诽谤 vi. 变黑」
- **建议：`keep`**

## replicators → replicator
- rank：form 23092 / lemma 23591 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「复制器；复制者（复数）」 / lemma「复制器；复制者」
- ECDICT：form「(replicator 的复数) [计] 重复符 [化] 复制基因」 / lemma「[计] 重复符 [化] 复制基因」
- **建议：`keep`**

## scandalmongering → scandalmonger
- rank：form 23100 / lemma 24500 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「散布丑闻；传播诽谤」 / lemma「散布丑闻者，造谣生事者」
- ECDICT：form「n. 散布流言蜚语的人；散布丑闻者」 / lemma「n. 专事诽谤的人, 传播丑闻的人」
- **建议：`keep`**

## guilders → guilder
- rank：form 23126 / lemma 46954 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「盾（荷兰旧货币，复数）」 / lemma「荷兰盾（旧货币）」
- ECDICT：form「n. 盾（荷兰货币单位）( guilder的复数形式 )」 / lemma「n. 荷兰盾(荷兰货币单位) [经] 质」
- **建议：`keep`**

## gnawing → gnaw
- rank：form 23143 / lemma 27401 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「啃；咬（现在分词）」 / lemma「啃；咬；折磨」
- ECDICT：form「n. 咬, 不断的苦痛 a. 咬的, 令人苦恼的」 / lemma「v. 咬, 啃, 侵蚀, 消耗, 折磨」
- **建议：`keep`**

## doctored → doctor
- rank：form 23210 / lemma 265 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「篡改的；伪造的；医治过的」 / lemma「医生；博士」
- ECDICT：form「vt.& vi. 医疗, 行医（doctor的过去式与过去分词形式）」 / lemma「n. 医生, 博士 vt. 授以博士学位, 诊断, 修改 vi. 行医」
- **建议：`?`**

## vandals → vandal
- rank：form 23250 / lemma 24132 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「破坏者；汪达尔人」 / lemma「破坏者；汪达尔人」
- ECDICT：form「n. 故意毁坏文物者, 破坏他人财产者( vandal的复数形式 )」 / lemma「n. 蓄意破坏者」
- **建议：`keep`**

## aced → ace
- rank：form 23259 / lemma 3471 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「轻松通过；得A」 / lemma「王牌；高手」
- ECDICT：form「vt. 发球得分（ace的过去式与过去分词形式）」 / lemma「n. 幺点, 好手, 少许, 发球得分 a. 一流的, 杰出的 [计] 应答允许, 自适应计算机试验, 自动呼叫设备, …」
- **建议：`?`**

## bleats → bleat
- rank：form 23281 / lemma 33395 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「咩咩叫；羊叫声」 / lemma「咩咩叫；哀诉」
- ECDICT：form「v. （羊, 小牛）叫( bleat的第三人称单数 ); 哭诉; 发出羊叫似的声音; 轻声诉说」 / lemma「n. 羊的叫声 vi. 咩咩叫 vt. 以颤抖的声音说」
- **建议：`keep`**

## bombarded → bombard
- rank：form 23294 / lemma 30812 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「轰炸；连续攻击」 / lemma「轰炸；炮击」
- ECDICT：form「v. 炮击( bombard的过去式和过去分词 ); 轰炸; 连珠炮般地提问; <核>以高能量粒子或放射能冲击」 / lemma「vt. 炮击, 攻击, 轰击 n. 射石炮」
- **建议：`keep`**

## thwarted → thwart
- rank：form 23302 / lemma 25631 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「阻挠；挫败」 / lemma「阻挠；挫败」
- ECDICT：form「v. 阻挠( thwart的过去式和过去分词 ); 使受挫折; 挫败; <旧>横过」 / lemma「a. 横放的 vt. 反对, 阻挠, 横过 prep. 横过 adv. 横过」
- **建议：`keep`**

## infuriating → infuriate
- rank：form 23357 / lemma 47061 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「令人愤怒的」 / lemma「激怒；使大怒」
- ECDICT：form「a. 令人大怒的 v. 使大怒, 激怒( infuriate的现在分词)」 / lemma「a. 狂怒的 vt. 激怒」
- **建议：`keep`**

## biceps → bicep
- rank：form 23402 / lemma 32209 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「肱二头肌」 / lemma「二头肌」
- ECDICT：form「n. 二头肌, 臂部肌肉 [医] 二头的, 二头肌」 / lemma「[体]二头肌训练机」
- **建议：`keep`**

## aztecs → aztec
- rank：form 23412 / lemma 18002 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「阿兹特克人」 / lemma「阿兹特克人；阿兹特克语」
- ECDICT：form「n. 阿芝特克人 a. 阿芝特克人的」 / lemma「n. 阿兹特克人, 阿兹特克语 a. 阿兹特克人的」
- **建议：`keep`**

## zeroes → zero
- rank：form 23448 / lemma 3240 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「零（复数）；无足轻重的人」 / lemma「零；零点」
- ECDICT：form「零号, 零, 零点, 最低点, 零度, 零位, 无, 乌有, 无足轻重的人, 没价值的东西」 / lemma「n. 零, 零点, 零度, 无, 乌有, 最低点 a. 零的, 没有的 vt. 调零, 对(炮火等)作协调校正 [计] …」
- **建议：`?`**

## impaled → impale
- rank：form 23449 / lemma 40484 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「刺穿；钉住」 / lemma「刺穿；钉住」
- ECDICT：form「v. 钉在尖桩上( impale的过去式和过去分词 )」 / lemma「vt. 刺穿, 使绝望, 钉住」
- **建议：`keep`**

## glades → glade
- rank：form 23457 / lemma 28385 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「林间空地」 / lemma「林间空地」
- ECDICT：form「n. 林中空地( glade的复数形式 )」 / lemma「n. 林间空地, 沼泽地」
- **建议：`keep`**

## maimed → maim
- rank：form 23492 / lemma 28822 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「残废的；受重伤的」 / lemma「使残废；伤害」
- ECDICT：form「a. 受伤的, 残废的」 / lemma「vt. 使残废, 使不能工作, 使伤残 [医] 伤残, 残废」
- **建议：`keep`**

## incurred → incur
- rank：form 23493 / lemma 27520 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「招致；蒙受（incur 过去式）」 / lemma「招致；遭受」
- ECDICT：form「v. 遭受；招致（incur的过去分词）」 / lemma「vt. 招致, 蒙受, 遭遇 [经] 招致, 蒙受, 担负」
- **建议：`keep`**

## mauled → maul
- rank：form 23559 / lemma 28409 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「撕咬；袭击（maul 过去式）」 / lemma「撕裂；伤害」
- ECDICT：form「v. （尤指动物）撕裂…的皮肉( maul的过去式和过去分词 ); 伤害; 虐待; 粗手粗脚地摆弄」 / lemma「n. 大槌 vt. 打伤, 粗手粗脚地摆弄, 抨击」
- **建议：`keep`**

## rhyming → rhyme
- rank：form 23568 / lemma 7387 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「押韵的」 / lemma「韵；押韵诗」
- ECDICT：form「n. 押韵」 / lemma「n. 韵, 押韵, 韵文 vi. 押韵 vt. 使押韵, 用韵诗表达」
- **建议：`?`**

## riveting → rivet
- rank：form 23601 / lemma 38324 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「引人入胜的」 / lemma「铆钉；吸引」
- ECDICT：form「a. 非常有趣的, 引人注目的 [机] 铆接」 / lemma「n. 铆钉 vt. 用铆钉固定, 敲进去, 注目, 吸引住」
- **建议：`keep`**

## irregularities → irregularity
- rank：form 23609 / lemma 40587 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「不规则；违规（复数）」 / lemma「不规则；异常」
- ECDICT：form「n. 不规则( irregularity的名词复数 ); 不平整; 不整齐; 不规则的事物」 / lemma「n. 不规则, 例外, 违反规则的行为 [化] 不匀度」
- **建议：`keep`**

## thingies → thingy
- rank：form 23629 / lemma 9629 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小玩意儿（复数）」 / lemma「那玩意儿；东西」
- ECDICT：form「n. 物（体）的, 物质的, 实际的( thingy的复数形式 )」 / lemma「物(体)的, 物质的, 实际的」
- **建议：`keep`**

## tinted → tint
- rank：form 23673 / lemma 35528 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「着色的；带色的」 / lemma「色调；淡色」
- ECDICT：form「a. 着色的, 带色彩的」 / lemma「n. 色彩, 浅色 vt. 染色于」
- **建议：`keep`**

## muddled → muddle
- rank：form 23684 / lemma 24385 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「混乱的；糊涂的」 / lemma「混乱；糊涂状态」
- ECDICT：form「a. 混乱的；糊涂的；头脑昏昏然的」 / lemma「vt. 混合, 使微醉, 使咬字不清晰 vi. 胡乱对付 n. 困惑, 混浊状态」
- **建议：`keep`**

## enriched → enrich
- rank：form 23703 / lemma 24445 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「浓缩的；强化的」 / lemma「使丰富；使富裕」
- ECDICT：form「a. 浓缩的；强化的」 / lemma「vt. 使富足, 使肥沃」
- **建议：`keep`**

## deteriorated → deteriorate
- rank：form 23710 / lemma 25755 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「恶化；退化（过去式）」 / lemma「恶化；退化」
- ECDICT：form「v. 恶化, 变坏( deteriorate的过去式和过去分词 )」 / lemma「v. (使)恶化」
- **建议：`keep`**

## rewriting → rewrite
- rank：form 23712 / lemma 9363 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「重写（现在分词）」 / lemma「重写；改写」
- ECDICT：form「n. 改写；重写」 / lemma「vt. 重写, 改写, 改写新闻, 书面答复 vi. 修改旧作 n. 改写的作品 [计] 重写」
- **建议：`?`**

## lentils → lentil
- rank：form 23739 / lemma 32840 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「小扁豆」 / lemma「小扁豆」
- ECDICT：form「n. 小扁豆( lentil的名词复数 ); 小扁豆植株」 / lemma「n. 兵豆」
- **建议：`keep`**

## lurks → lurk
- rank：form 23768 / lemma 24171 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「潜伏；埋伏」 / lemma「潜伏；潜藏」
- ECDICT：form「n. 潜在, 潜伏; （lurk的复数形式） vi. 潜伏, 埋伏（lurk的第三人称单数形式）」 / lemma「n. 潜伏, 潜行 vi. 暗藏, 潜伏, 埋伏 [计] 隐匿阅读」
- **建议：`keep`**

## fattening → fatten
- rank：form 23827 / lemma 25447 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「易使人发胖的」 / lemma「使变胖；养肥」
- ECDICT：form「a. 正被养肥的；用于养肥禽畜的」 / lemma「vi. 养肥 vt. 使肥胖」
- **建议：`keep`**

## looser → loos
- rank：form 23852 / lemma 40565 ｜ type `r` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更松的；更宽松的」 / lemma「厕所（英俚语，复数）」
- ECDICT：form「[经] 放宽」 / lemma「n. 损耗, 洗手间（loo复数形式）」
- **建议：`keep`**

## lbs → lb
- rank：form 23890 / lemma 38854 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「磅（重量单位，复数缩写）」 / lemma「磅（重量单位缩写）」
- ECDICT：form「磅」 / lemma「磅, 文学士 [经] 磅」
- **建议：`keep`**

## radioed → radio
- rank：form 23892 / lemma 592 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用无线电发送（过去式）」 / lemma「收音机；无线电」
- ECDICT：form「无线电传送的」 / lemma「n. 无线电, 收音机, 无线电报, 无线电广播, 无线电台 v. 用无线电发送」
- **建议：`?`**

## squatters → squatter
- rank：form 23981 / lemma 30301 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「擅自占住者」 / lemma「擅自占地者；蹲坐者」
- ECDICT：form「n. 蹲着的人( squatter的复数形式 ); 擅自占用房屋或土地的人」 / lemma「n. 蹲着的人, 擅自占用土地或房屋者 vi. 涉水而过」
- **建议：`keep`**

## peacekeepers → peacekeeper
- rank：form 23995 / lemma 24765 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「维和人员」 / lemma「维和人员；和平维护者」
- ECDICT：form「n. 维和士兵( peacekeeper的复数形式 )」 / lemma「n. (交战国间的)停火执行者(或小组)」
- **建议：`keep`**

## decurved → decurve
- rank：form 24000 / lemma 31500 ｜ type `p` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「向下弯曲的」 / lemma「向下弯曲；使下曲」
- ECDICT：form「a. 向下弯的」 / lemma「使朝下弯曲」
- **建议：`keep`**

## staggered → stagger
- rank：form 24004 / lemma 25030 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蹒跚的；错开的」 / lemma「蹒跚；摇晃；使震惊」
- ECDICT：form「a. 吃惊的；错列的」 / lemma「n. 蹒跚, 踌躇 vi. 蹒跚, 犹豫 vt. 使摇摆, 使踌躇, 交错, 错开 a. 交错的, 错开的」
- **建议：`keep`**

## searing → sear
- rank：form 24078 / lemma 7635 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灼热的；严厉的」 / lemma「煎焦表面」
- ECDICT：form「a. 灼热的」 / lemma「a. 枯萎的, 凋谢的 vt. 烤焦, 使枯萎 vi. 凋谢, 干枯」
- **建议：`?`**

## spewing → spew
- rank：form 24112 / lemma 25409 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喷出；呕吐」 / lemma「喷出；呕吐」
- ECDICT：form「v. 呕吐( spew的现在分词 ); （使某事物）喷出; 射出; （使）喷涌出」 / lemma「vi. 呕吐, 喷涌 vt. 呕出, 喷 n. 呕吐物, 喷涌物」
- **建议：`keep`**

## blubbering → blubber
- rank：form 24120 / lemma 24336 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「哭诉；抽泣」 / lemma「鲸脂；哭诉」
- ECDICT：form「[机] 提取鲸脂」 / lemma「n. 鲸脂, 哭泣 v. 又哭又闹」
- **建议：`keep`**

## grinds → grind
- rank：form 24133 / lemma 7617 ｜ type `3` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨碎；碾」 / lemma「磨碎」
- ECDICT：form「v. 磨碎, 嚼碎( grind的第三人称单数 ); 旋转开动; 压迫, 折磨」 / lemma「n. 磨, 碾, 苦差, 摩擦声, 用功的学生 vt. 磨擦, 磨碎, 磨光, 折磨, 压榨 vi. 磨, 磨碎, 苦干」
- **建议：`?`**

## grinds → ground
- rank：form 24133 / lemma 5664 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨碎；碾」 / lemma「地面；土地」
- ECDICT：form「v. 磨碎, 嚼碎( grind的第三人称单数 ); 旋转开动; 压迫, 折磨」 / lemma「n. 土地, 战场, 场地, 地面, 范围 a. 土地的, 地面上的 vt. 放在地上, 使搁浅, 打基础, 给...以…」
- **建议：`?`**

## medicated → medicate
- rank：form 24137 / lemma 41983 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用药治疗的」 / lemma「用药治疗；给…服药」
- ECDICT：form「a. 加入药品/药物的, 药制的, 食药的 [医] 含药[物]的, 药制的」 / lemma「vt. 用药治疗 [医] 用药治疗, 投药, 加药, 使含药」
- **建议：`keep`**

## embers → ember
- rank：form 24178 / lemma 24464 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「余烬；余火」 / lemma「余烬」
- ECDICT：form「n. 余烬；余火；小火苗（ember的复数形式）」 / lemma「n. 灰烬, 余烬」
- **建议：`keep`**

## narcotized → narcotize
- rank：form 24200 / lemma 26000 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「被麻醉的，麻醉状态的」 / lemma「使麻醉；使昏睡」
- ECDICT：form「v. 麻醉, 使昏迷, 起麻醉作用( narcotize的过去式和过去分词 )」 / lemma「vt. 麻醉, 使昏迷 vi. 起麻醉作用」
- **建议：`keep`**

## willies → willy
- rank：form 24205 / lemma 4569 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「（the willies）紧张不安」 / lemma「威利（人名）」
- ECDICT：form「n. 焦虑不安；心惊肉跳；小鸡鸡（儿童用语, willy的复数）」 / lemma「n. 阴茎；阳物；柳树（等于willow）」
- **建议：`keep`**

## blabbing → blab
- rank：form 24211 / lemma 26175 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「泄露秘密；喋喋不休」 / lemma「泄露；瞎说」
- ECDICT：form「v. 瞎说乱讲, 泄露秘密( blab的现在分词 ); 泄漏（秘密）」 / lemma「v. 泄漏, 胡扯」
- **建议：`keep`**

## romulans → romulan
- rank：form 24221 / lemma 18973 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「罗穆兰人（科幻种族）」 / lemma「罗慕伦人（星际迷航）」
- ECDICT：form「(Romulan 的复数) n. 罗慕伦」 / lemma「n. 罗慕伦」
- **建议：`keep`**

## specialised → specialise
- rank：form 24246 / lemma 32598 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「专门的；专业化的（英式）」 / lemma「专门研究；专攻（英式）」
- ECDICT：form「a. 专门的, 特别的, 专科的, 特化的, 专化的」 / lemma「vt. 特加指明, 列举, 使专门化, 限定...的范围 vt.vi. (使)特化, (使)专化 vi. 成为专家, 专…」
- **建议：`keep`**

## homos → homo
- rank：form 24256 / lemma 7613 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「（贬）同性恋者（复数）」 / lemma「人属；同性恋（俚）」
- ECDICT：form「n. (Homos)人名；(阿拉伯)哈穆斯 同性恋者（homo的复数） 人」 / lemma「[化] 最高占据轨道; 最高占据分子轨道; 最高已占分子轨道 [医] 人属」
- **建议：`keep`**

## bering → ber
- rank：form 24282 / lemma 43559 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「白令（海峡/海）」 / lemma「BER（缩写）」
- ECDICT：form「白令(Vitus, 1680-1741, 丹麦航海家, 白令海及白令海峡的发现者)」 / lemma「[计] 基本编码规则」
- **建议：`keep`**

## wipers → wiper
- rank：form 24297 / lemma 27328 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雨刷；擦拭者」 / lemma「雨刷；擦拭者」
- ECDICT：form「n. 擦拭者( wiper的复数形式 ); 手帕; 雨刷; 接帚」 / lemma「n. 揩擦的人, 刮水器, 接触电刷 [电] 接帚」
- **建议：`keep`**

## flip-flops → flip-flop
- rank：form 24300 / lemma 36535 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「人字拖；夹趾拖鞋」 / lemma「人字拖；突然改变立场」
- ECDICT：form「n. （非正式） 政策突然转向; 政策突变 Informal. a sudden or unexpected rever…」 / lemma「n. 啪嗒啪嗒的响声, 向后翻的筋斗, 突然改变, 双稳态多谐振荡器, 触发器 [计] 触发器, 劈拍」
- **建议：`keep`**

## sharpest → sharpe
- rank：form 24311 / lemma 10943 ｜ type `t` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「最锋利的；最敏锐的」 / lemma「夏普（姓氏）」
- ECDICT：form「灵敏的 尖锐的（ sharp的最高级 ）」 / lemma「n. 夏普指数；夏普指标；夏普（人名）」
- **建议：`keep`**

## fora → forum
- rank：form 24315 / lemma 10617 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「论坛（forum复数）」 / lemma「论坛；讨论会」
- ECDICT：form「pl. 论坛, 讨论会, 座谈会, 广播专题讲话节目, 电视专题讲话节目, 法庭」 / lemma「n. 论坛, 公开讨论的广场, 法庭, 讨论会 [法] 讨论会, 专题讨论, 公共论坛」
- **建议：`?`**

## mikes → mike
- rank：form 24341 / lemma 585 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「麦克风（复数）」 / lemma「迈克（人名）」
- ECDICT：form「n. (=microphone)<口>话筒, 送话器, 微音器( mike的复数形式 )」 / lemma「vi. 偷懒, 游手好闲 n. 休息, 游手好闲, 扩音器, 话筒」
- **建议：`keep`**

## fascinates → fascinate
- rank：form 24365 / lemma 29412 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使着迷；吸引」 / lemma「使着迷；吸引」
- ECDICT：form「v. 使着迷, 使极感兴趣( fascinate的第三人称单数 ); 慑住…使动弹不得」 / lemma「vt. 令人入神, 使着迷 vi. 入迷」
- **建议：`keep`**

## criminating → criminate
- rank：form 24400 / lemma 28000 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `-`
- 词库 gloss：form「定罪的；归罪的」 / lemma「指控，定罪；使负罪」
- ECDICT：form「vt. 定罪；使负罪；责备」 / lemma「vt. 控告, 定罪, 非难(谋事物) [法] 告发, 控告, 归罪」
- **建议：`keep`**

## roving → rove
- rank：form 24408 / lemma 36579 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流浪的；漫游的」 / lemma「漫游；漂泊」
- ECDICT：form「a. 徘徊的, 流动的 n. 流浪, 漫游, 粗纱」 / lemma「n. 徘徊, 粗纺, 流浪 vt. 漂泊于, 漫游于 vi. 流浪, 飘忽不定 reeve的过去式和过去分词」
- **建议：`keep`**

## vaporized → vaporize
- rank：form 24435 / lemma 30837 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「蒸发；汽化」 / lemma「蒸发；汽化」
- ECDICT：form「v. （使）蒸发, （使）汽化( vaporize的过去式和过去分词 ); 说大话, 自吹自擂」 / lemma「v. (使)蒸发」
- **建议：`keep`**

## crumpled → crumple
- rank：form 24487 / lemma 42673 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「皱的；揉皱的」 / lemma「弄皱；压垮」
- ECDICT：form「a. 弄皱了的, 被扭弯的, 弯曲的 [建] 皱的, 起皱纹的, 盘曲的」 / lemma「vt. 弄皱, 压皱 vi. 崩溃, 变皱」
- **建议：`keep`**

## signposting → signpost
- rank：form 24500 / lemma 36863 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `mono`
- 词库 gloss：form「设置路标；指示性引导」 / lemma「路标；指示牌」
- ECDICT：form「v. 指示牌, 标志杆( signpost的现在分词 ); 路标」 / lemma「n. 招牌柱, 广告柱, 路标」
- **建议：`keep`**

## hyperventilating → hyperventilate
- rank：form 24501 / lemma 47038 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「过度换气」 / lemma「过度换气；呼吸急促」
- ECDICT：form「(hyperventilate 的现在分词) [医]过度呼吸」 / lemma「[医]过度呼吸」
- **建议：`keep`**

## czechs → czech
- rank：form 24505 / lemma 9323 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「捷克人」 / lemma「捷克的；捷克人」
- ECDICT：form「n. 捷克人[语]( Czech的名词复数 )」 / lemma「n. 捷克人, 捷克语 a. 捷克的, 捷克语的, 捷克人的」
- **建议：`keep`**

## bunting → bunt
- rank：form 24519 / lemma 30420 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「彩旗；鹀（鸟）」 / lemma「轻打；触击（棒球）」
- ECDICT：form「n. 触击；旗布；白颊鸟」 / lemma「n. 顶撞, 推, 轻打 vt. 顶撞, 轻打」
- **建议：`keep`**

## eskimos → eskimo
- rank：form 24526 / lemma 15988 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「爱斯基摩人（旧称）」 / lemma「爱斯基摩人」
- ECDICT：form「n. 爱斯基摩人( Eskimo的名词复数 )」 / lemma「n. 爱斯基摩人」
- **建议：`keep`**

## shackled → shackle
- rank：form 24626 / lemma 35170 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「束缚；戴镣铐（过去式）」 / lemma「束缚；给…戴镣铐」
- ECDICT：form「v. 给（某人）带上手铐或脚镣( shackle的过去式和过去分词 )」 / lemma「n. 桎梏, 束缚物 vt. 加枷锁, 束缚」
- **建议：`keep`**

## semifinals → semifinal
- rank：form 24630 / lemma 37411 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「半决赛（复数）」 / lemma「半决赛」
- ECDICT：form「半决赛」 / lemma「n. 半决赛」
- **建议：`keep`**

## cocksuckers → cocksucker
- rank：form 24645 / lemma 9071 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「混蛋（粗俗语，复数）」 / lemma「混蛋（粗俗骂语）」
- ECDICT：form「n. 混蛋；与男子进行口交者」 / lemma「狗杂种, 浑蛋（通常指男人）」
- **建议：`keep`**

## impregnated → impregnate
- rank：form 24655 / lemma 33532 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使怀孕；浸透（过去式）」 / lemma「使怀孕；使浸透」
- ECDICT：form「v. 灌注, 使饱和( impregnate的过去式和过去分词 ); 使怀孕」 / lemma「vt. 使怀孕, 使肥沃, 使充满, 灌输 a. 怀孕的, 充满的」
- **建议：`keep`**

## bloodstains → bloodstain
- rank：form 24666 / lemma 34540 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「血迹（复数）」 / lemma「血迹；血污」
- ECDICT：form「n. 血迹( bloodstain的复数形式 )」 / lemma「n. 血迹」
- **建议：`keep`**

## constraints → constraint
- rank：form 24677 / lemma 41431 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「限制；约束（复数）」 / lemma「限制；约束」
- ECDICT：form「n. 强制( constraint的复数形式 ); 限制; 约束」 / lemma「n. 强制, 约束 [计] 约束」
- **建议：`keep`**

## hijackers → hijacker
- rank：form 24684 / lemma 35940 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「劫持者；劫机者」 / lemma「劫持者；劫机者」
- ECDICT：form「n. 抢劫者, 劫持者( hijacker的复数形式 )」 / lemma「n. 强盗, 劫盗, 劫持犯 [法] 劫持者, 绑架者, 抢劫者」
- **建议：`keep`**

## artefacts → artefact
- rank：form 24691 / lemma 34627 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「人工制品；文物」 / lemma「人工制品；文物」
- ECDICT：form「n. 人工制品（尤指有考古价值的工具或武器）( artefact的复数形式 )」 / lemma「n. 人工制品, 制造物, 人为现象, 膺象, 矫作物, 古代文物 [医] 人为现象, 人工产物」
- **建议：`keep`**

## postponing → postpone
- rank：form 24707 / lemma 12400 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「推迟；延期」 / lemma「推迟，延期」
- ECDICT：form「v. 延期, 推迟( postpone的现在分词 )」 / lemma「vt. 延迟, 使延期, 缓办, 搁延 vi. 延缓, 延缓发作」
- **建议：`?`**

## nikos → niko
- rank：form 24721 / lemma 12029 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「尼科斯（人名）」 / lemma「尼科（人名）」
- ECDICT：form「n. (Nikos)人名；(希)尼科斯」 / lemma「n. 尼克森（公司名）」
- **建议：`keep`**

## receptors → receptor
- rank：form 24745 / lemma 35212 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受体；感受器」 / lemma「受体；感受器」
- ECDICT：form「n. <生>感受器, 受体( receptor的复数形式 )」 / lemma「n. 受体, 感觉器官 [化] 接受器; 受体」
- **建议：`keep`**

## punters → punter
- rank：form 24748 / lemma 29764 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「顾客；赌客」 / lemma「顾客；赌客（英俚）」
- ECDICT：form「n. （赛马, 足球赛时）下赌注者( punter的复数形式 )」 / lemma「n. 用篙撑船的人, 船夫, 赌博者」
- **建议：`keep`**

## amphetamines → amphetamine
- rank：form 24763 / lemma 32746 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「安非他明；兴奋剂」 / lemma「安非他明；苯丙胺」
- ECDICT：form「n. 安非他明( amphetamine的复数形式 )」 / lemma「n. 苯丙胺, 安非他明 [化] 苯丙胺; 苯异丙胺; 安非他民; 1-苯基-2-丙胺」
- **建议：`keep`**

## clenched → clench
- rank：form 24775 / lemma 25739 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「紧握；咬紧」 / lemma「紧握；咬紧」
- ECDICT：form「v. 紧握, 抓紧, 咬紧( clench的过去式和过去分词 )」 / lemma「n. 牢牢抓住, 钉紧, 敲弯钉尖 vt. 紧握, 牢牢地抓住, 确定, 敲弯 vi. 握紧, 钉牢」
- **建议：`keep`**

## deafening → deafen
- rank：form 24782 / lemma 20400 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「震耳欲聋的」 / lemma「使聋；震耳欲聋」
- ECDICT：form「a. 震耳欲聋的」 / lemma「vt. 使聋 vi. 变聋」
- **建议：`?`**

## court-martialed → court-martial
- rank：form 24783 / lemma 13212 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「受军事法庭审判」 / lemma「军事法庭；军法审判」
- ECDICT：form「v. 以军法审判( court-martial的过去式和过去分词 )」 / lemma「n. 军事法庭 vt. 交军事法庭审判」
- **建议：`?`**

## westerners → westerner
- rank：form 24800 / lemma 43390 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「西方人」 / lemma「西方人」
- ECDICT：form「n. 西部人( westerner的复数形式 ); 西方人, 欧美人」 / lemma「n. 西方人, 西洋人」
- **建议：`keep`**

## laptops → laptop
- rank：form 24823 / lemma 4150 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「笔记本电脑」 / lemma「笔记本电脑」
- ECDICT：form「n. 便携式电脑( laptop的复数形式 )」 / lemma「[计] 膝上型的」
- **建议：`keep`**

## racketeering → racketeer
- rank：form 24835 / lemma 47347 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「敲诈勒索；诈骗」 / lemma「诈骗者；敲诈勒索者」
- ECDICT：form「n. 诈骗, 敲诈勒索」 / lemma「n. 敲诈者, 骗子 v. 诈骗钱财」
- **建议：`keep`**

## rehabilitated → rehabilitate
- rank：form 24839 / lemma 29033 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使康复；改造」 / lemma「使康复；改造」
- ECDICT：form「v. 改造（罪犯等）( rehabilitate的过去式和过去分词 ); 使恢复正常生活; 使恢复原状; 修复」 / lemma「vt. 恢复原状, 修复, 使康复 [法] 恢复, 使恢复心理健康, 修复」
- **建议：`keep`**

## muppets → muppet
- rank：form 24900 / lemma 16937 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「布偶（品牌）」 / lemma「布偶；傻瓜」
- ECDICT：form「(muppet 的复数) n.提线木偶」 / lemma「n. 提线木偶」
- **建议：`keep`**

## whizzing → whiz
- rank：form 24922 / lemma 11410 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗖嗖作响；飞驰」 / lemma「嗖嗖飞过；能手」
- ECDICT：form「n. 旋离；离心分离」 / lemma「n. 飕飕声, 精明的人, 专家 v. (使)飕飕作声」
- **建议：`?`**

## whizzing → whizz
- rank：form 24922 / lemma 36902 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嗖嗖作响；飞驰」 / lemma「嗖嗖飞过；快速移动」
- ECDICT：form「n. 旋离；离心分离」 / lemma「n. 飕飕声, 精明的人, 专家 v. (使)飕飕作声」
- **建议：`keep`**

## engraving → engrave
- rank：form 24956 / lemma 42061 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「雕刻；版画」 / lemma「雕刻；铭刻」
- ECDICT：form「n. 雕刻, 镌版术, 雕版」 / lemma「vt. 刻上, 雕刻, 铭记」
- **建议：`keep`**

## annualized → annualize
- rank：form 25000 / lemma 24500 ｜ type `p` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「年化的；按年折算的」 / lemma「按年计算；将（数据）年化」
- ECDICT：form「a. [税收] 按年计算的（利率等）, 年度化」 / lemma「[经] 年度基础换算」
- **建议：`keep`**

## cybernetics → cybernetic
- rank：form 25000 / lemma 31794 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「控制论」 / lemma「控制论的」
- ECDICT：form「n. 控制论 [计] 控制论」 / lemma「a. 控制论的 [计] 控制论的」
- **建议：`keep`**

## mins → min
- rank：form 25046 / lemma 3979 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「分钟（复数缩写）」 / lemma「敏（人名）」
- ECDICT：form「abbr. 需监护的未成年人（Minors In Need of Supervision）；分钟（minutes）；微惯…」 / lemma「abbr. 部长（Minister）；部（Ministry）」
- **建议：`keep`**

## allotted → allot
- rank：form 25069 / lemma 41470 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「分配；拨给（过去式）」 / lemma「分配；分派」
- ECDICT：form「a. 专款的；拨出的」 / lemma「vt. 分配, 分摊指定 [经] (按股或按规定)分配, 配(拨)给, 规(派)定」
- **建议：`keep`**

## checkered → checker
- rank：form 25080 / lemma 28570 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有格子图案的；盛衰多变的」 / lemma「检查员；方格图案」
- ECDICT：form「a. 盛衰无常的, 多波折的, 有格子花的, 有...交错着的, 变化多端的 [机] 网纹板[钢板]」 / lemma「n. 制止者, 查对者, 阻止者 [计] 检查程序, 检验程序, 检验器, 西洋跳棋」
- **建议：`keep`**

## sunbathing → sunbathe
- rank：form 25114 / lemma 34932 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「日光浴」 / lemma「日光浴」
- ECDICT：form「n. 日光浴」 / lemma「n. 日光浴」
- **建议：`keep`**

## fixtures → fixture
- rank：form 25115 / lemma 26020 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「固定装置；赛事」 / lemma「固定装置；赛事」
- ECDICT：form「n. 固定附物, 固定附着物；固定财产；卡具；固定装置（fixture的复数形式）」 / lemma「n. 固定(状态), 固定物, 设备 [计] 夹具」
- **建议：`keep`**

## sawed → saw
- rank：form 25119 / lemma 8337 ｜ type `p` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锯；锯开」 / lemma「锯子」
- ECDICT：form「saw的过去式和过去分词」 / lemma「n. 锯子, 谚语 vt. 锯, 锯开, 来回移动 vi. 拉锯, 移动 see的过去式」
- **建议：`?`**

## overstepped → overstep
- rank：form 25152 / lemma 31630 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「越界；超越权限」 / lemma「逾越；越权」
- ECDICT：form「v. 踏过, 逾越, 超出…的限度( overstep的过去式和过去分词 )」 / lemma「vt. 踏过, 逾越, 超出...的限度 [法] 违犯, 逾越」
- **建议：`keep`**

## entails → entail
- rank：form 25173 / lemma 26706 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「需要；牵涉；使必要」 / lemma「需要；使必要；牵涉」
- ECDICT：form「v. 使…成为必要( entail的第三人称单数 ); 需要; 限定继承; 使必需」 / lemma「vt. 使成为必需, 需要, 使承担, 遗传给 n. 限定继承」
- **建议：`keep`**

## infused → infuse
- rank：form 25220 / lemma 37413 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「注入；浸泡（过去式）」 / lemma「注入；泡制（茶等）」
- ECDICT：form「v. 灌输, 加入（一种特性）( infuse的过去式和过去分词 ); 沏（茶）, 泡（草药）」 / lemma「vt. 注入, 使充满, 泡制, 鼓舞 vi. 泡」
- **建议：`keep`**

## acclaimed → acclaim
- rank：form 25231 / lemma 32112 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「广受赞誉的；备受推崇的」 / lemma「称赞；欢呼」
- ECDICT：form「v. 欢呼（acclaim的过去式及过去分词） a. 受到赞扬的」 / lemma「n. 喝彩, 欢呼, 赞同 v. 欢呼, 喝彩, 称赞」
- **建议：`keep`**

## embezzling → embezzle
- rank：form 25258 / lemma 46794 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「挪用；贪污」 / lemma「挪用；贪污」
- ECDICT：form「v. 贪污, 盗用（公款）( embezzle的现在分词 )」 / lemma「vt. 盗用, 挪用 [经] 贪污(公款), 盗用」
- **建议：`keep`**

## skulking → skulk
- rank：form 25276 / lemma 47485 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「潜行；鬼鬼祟祟地走动」 / lemma「潜行；鬼鬼祟祟地躲藏」
- ECDICT：form「v. <贬>潜伏, 偷偷摸摸地走动, 鬼鬼祟祟地活动( skulk的现在分词 )」 / lemma「vi. 偷偷隐躲, 偷懒」
- **建议：`keep`**

## reputed → repute
- rank：form 25287 / lemma 31559 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「据称的；有名的」 / lemma「名声；声望」
- ECDICT：form「a. 名誉好的, 被称为...的, 有...名气的 [法] 好名誉的, 驰名的, 号称的」 / lemma「n. 名望, 名气, 声望 vt. 认为, 以为」
- **建议：`keep`**

## jabbering → jabber
- rank：form 25302 / lemma 33261 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「急促不清地说；叽里咕噜」 / lemma「急促不清地说」
- ECDICT：form「v. 急切而含混不清地说( jabber的现在分词 ); 急促兴奋地说话; 结结巴巴」 / lemma「v. 快而含糊地说, 吱吱喳喳地叫 n. 快而含糊不清的话」
- **建议：`keep`**

## tories → tory
- rank：form 25306 / lemma 8241 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「托利党人；保守党人」 / lemma「英国保守党人」
- ECDICT：form「英国托利派；王党保守党」 / lemma「n. 托利党党员, 保守党员, 亲英分子 a. 保守分子的」
- **建议：`keep`**

## gawking → gawk
- rank：form 25314 / lemma 41331 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呆呆地看；瞪眼看」 / lemma「呆呆地看；瞪眼看」
- ECDICT：form「v. 呆呆地看着( gawk的现在分词 )」 / lemma「n. 笨人, 呆子, 笨拙的人 vi. 痴呆着看」
- **建议：`keep`**

## rescheduled → reschedule
- rank：form 25391 / lemma 10487 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重新安排；改期」 / lemma「重新安排；改期」
- ECDICT：form「v. 重订时间表( reschedule的过去式和过去分词 )」 / lemma「[计] 重安排, 重调度 [化] 修订计划」
- **建议：`keep`**

## albanians → albanian
- rank：form 25399 / lemma 14705 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「阿尔巴尼亚人（复数）」 / lemma「阿尔巴尼亚的；阿尔巴尼亚人」
- ECDICT：form「n. 阿尔巴尼亚人」 / lemma「n. 阿尔巴尼亚人」
- **建议：`keep`**

## beckons → beckon
- rank：form 25458 / lemma 37985 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「招手示意；吸引（第三人称单数）」 / lemma「招手；示意」
- ECDICT：form「v. （用头或手的动作）示意, 召唤( beckon的第三人称单数 )」 / lemma「v. 招手示意, 召唤, 吸引 n. 表召唤的点头(或手势)」
- **建议：`keep`**

## discontinued → discontinue
- rank：form 25493 / lemma 30279 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「已停产的；中止的」 / lemma「停止；中断」
- ECDICT：form「v. （使）终止, 中断, 中止( discontinue的过去式和过去分词 )」 / lemma「vi. 中断, 终止, 停止 vt. 使中止」
- **建议：`keep`**

## christos → christo
- rank：form 25556 / lemma 32970 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「克里斯托斯（人名）」 / lemma「克里斯托（人名）」
- ECDICT：form「(christo 的复数) n. (Christo)人名；(保)赫里斯托；(英、法、葡)克里斯托」 / lemma「n. (Christo)人名；(保)赫里斯托；(英、法、葡)克里斯托」
- **建议：`keep`**

## flavored → flavor
- rank：form 25561 / lemma 5136 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「有…风味的」 / lemma「味道；风味」
- ECDICT：form「v. 给…调味( flavor的过去式和过去分词 ); 给…增添风趣」 / lemma「n. 滋味, 调味品 vt. 加味于」
- **建议：`?`**

## boned → bon
- rank：form 25571 / lemma 4655 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper, homograph`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「去骨的；有…骨的」 / lemma「邦（人名/地名）」
- ECDICT：form「a. 骨骼的；去掉骨头的；用骨架撑起的；施过骨粉料的；去骨的」 / lemma「a. （法）好的」
- **建议：`keep`**

## boned → bone
- rank：form 25571 / lemma 5295 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「去骨的；有…骨的」 / lemma「骨头；骨骼」
- ECDICT：form「a. 骨骼的；去掉骨头的；用骨架撑起的；施过骨粉料的；去骨的」 / lemma「n. 骨头, 骨, 骨制品 vt. 剔骨 vi. 专心致志」
- **建议：`?`**

## distilled → distill
- rank：form 25602 / lemma 12400 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「蒸馏的；提炼的」 / lemma「蒸馏；提炼」
- ECDICT：form「a. 由蒸馏得来的；净化的」 / lemma「vt. 蒸馏 vi. 滴下」
- **建议：`?`**

## cicadas → cicada
- rank：form 25604 / lemma 37703 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「蝉（复数）」 / lemma「蝉」
- ECDICT：form「n. 蝉( cicada的名词复数 )」 / lemma「n. 蝉」
- **建议：`keep`**

## instigated → instigate
- rank：form 25646 / lemma 32021 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「煽动；唆使（过去式）」 / lemma「煽动；挑起」
- ECDICT：form「v. 使（某事物）开始或发生, 鼓动( instigate的过去式和过去分词 )」 / lemma「vt. 教唆, 怂恿, 煽动 [法] 教唆, 煽动, 怂恿」
- **建议：`keep`**

## kms → km
- rank：form 25649 / lemma 6676 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「千米（复数缩写）」 / lemma「千米；公里（缩写）」
- ECDICT：form「abbr. 知识管理系统（Knowledgebase Management System）」 / lemma「[医] 千米, 公里」
- **建议：`keep`**

## overheating → overheat
- rank：form 25700 / lemma 15600 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「过热；过度加热」 / lemma「过热，使过热」
- ECDICT：form「[经] 过分的经济活动」 / lemma「vt. 使过热 vi. 变得过热」
- **建议：`?`**

## potholes → pothole
- rank：form 25722 / lemma 28374 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「坑洼；路面凹坑」 / lemma「路面坑洞」
- ECDICT：form「n. 壶穴( pothole的复数形式 )」 / lemma「n. 壶穴」
- **建议：`keep`**

## buddhists → buddhist
- rank：form 25732 / lemma 9151 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「佛教徒」 / lemma「佛教徒」
- ECDICT：form「n. 佛教徒（Buddhist的复数）」 / lemma「n. 佛教徒 a. 佛教的」
- **建议：`keep`**

## colombians → colombian
- rank：form 25793 / lemma 13427 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「哥伦比亚人」 / lemma「哥伦比亚的」
- ECDICT：form「n. 哥伦比亚人( Colombian的复数形式 )」 / lemma「n. 哥伦比亚人 a. 哥伦比亚的」
- **建议：`keep`**

## piloting → pilot
- rank：form 25800 / lemma 1787 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「驾驶；引导」 / lemma「飞行员；领航员」
- ECDICT：form「n. 领港」 / lemma「n. 飞行员, 领航员, 航船者, 导向器, 驾驶仪, 向导, 领导人 vt. 领航, 驾驶, 引导, 试用 a. 引导…」
- **建议：`?`**

## majored → major
- rank：form 25818 / lemma 12100 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「主修」 / lemma「主要的；重大的」
- ECDICT：form「a. 主要的；重要的；主修的；较多的 n. [人类] 成年人；主修科目；陆军少校 vi. 主修 n. (Major)人名…」 / lemma「n. 主修课, 成年人, 陆军少校 a. 主要的, 较多的, 大部分的, 成年的, 严重的 vi. 主修 [计] 主要,…」
- **建议：`?`**

## tooting → toot
- rank：form 25832 / lemma 12570 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「鸣笛；吹奏」 / lemma「（喇叭）嘟嘟响」
- ECDICT：form「n. 图庭（位于伦敦南部）」 / lemma「n. 嘟嘟声, 作乐 vi. 吹喇叭 vt. 吹奏出」
- **建议：`?`**

## breastfeeding → breastfeed
- rank：form 25842 / lemma 33290 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「母乳喂养」 / lemma「母乳喂养」
- ECDICT：form「v. 用母乳喂养, 哺乳( breastfeed的现在分词 )」 / lemma「vt.& vi. 用母乳喂养, 哺乳」
- **建议：`keep`**

## persians → persian
- rank：form 25902 / lemma 10446 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「波斯人；波斯猫（复数）」 / lemma「波斯的；波斯人」
- ECDICT：form「n. 波斯（现称伊朗）的, 波斯人的, 波斯语的( Persian的复数形式 )」 / lemma「n. 波斯人, 波斯语」
- **建议：`keep`**

## abnormalities → abnormality
- rank：form 25913 / lemma 27698 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「异常；畸形（复数）」 / lemma「异常；畸形」
- ECDICT：form「n. 畸形；异常情况（abnormality的复数形式）」 / lemma「n. 反常, 畸形, 变态 [化] 反常; 非正态性」
- **建议：`keep`**

## quirks → quirk
- rank：form 25929 / lemma 29334 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「怪癖；奇特的习惯（复数）」 / lemma「怪癖；奇特的巧合」
- ECDICT：form「n. 奇事, 巧合( quirk的复数形式 ); 怪癖」 / lemma「n. 古怪举动, 俏皮话, 急转」
- **建议：`keep`**

## imperfections → imperfection
- rank：form 25937 / lemma 30722 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「瑕疵；缺点（复数）」 / lemma「不完美；缺点」
- ECDICT：form「n. 不合格折贴（imperfection的复数）」 / lemma「n. 不完美, 缺点 [化] 缺陷; 疵点; 毛病」
- **建议：`keep`**

## martins → martin
- rank：form 26024 / lemma 1050 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「马丁（姓氏复数）」 / lemma「马丁（人名）」
- ECDICT：form「n. 马丁斯（男子名）」 / lemma「n. 马丁, 圣马丁鸟」
- **建议：`keep`**

## embezzled → embezzle
- rank：form 26048 / lemma 46794 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「挪用；贪污（过去式）」 / lemma「挪用；贪污」
- ECDICT：form「v. 贪污, 盗用（公款）( embezzle的过去式和过去分词 )」 / lemma「vt. 盗用, 挪用 [经] 贪污(公款), 盗用」
- **建议：`keep`**

## concocted → concoct
- rank：form 26066 / lemma 37315 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「调制；编造（过去式）」 / lemma「编造；调制」
- ECDICT：form「v. 将（尤指通常不相配合的）成分混合成某物( concoct的过去式和过去分词 ); 调制; 编造; 捏造」 / lemma「vt. 调合, 捏造, 编造 [建] 调制, 混合」
- **建议：`keep`**

## normans → norman
- rank：form 26100 / lemma 3085 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「诺曼人（复数）」 / lemma「诺曼人」
- ECDICT：form「n. 诺曼人 a. 诺曼第的；诺曼第人的；诺曼第语的」 / lemma「a. 诺曼第语的；诺曼第人的」
- **建议：`keep`**

## coupling → couple
- rank：form 26134 / lemma 353 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「联结；联轴器」 / lemma「一对；夫妇；几个」
- ECDICT：form「n. 联结, 结合, 耦合 [计] 耦合」 / lemma「n. 对, 夫妇, 数个 vt. 使成双, 连接, 使成婚, 把...联系起来 vi. 结合, 成婚」
- **建议：`?`**

## snowboarding → snowboard
- rank：form 26160 / lemma 35810 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「单板滑雪」 / lemma「滑雪板；单板滑雪」
- ECDICT：form「v. 测雪板(snowboard的现在分词 ) n. 单板滑雪; 滑板滑雪; 滑雪板」 / lemma「n. 滑雪板」
- **建议：`keep`**

## brazilians → brazilian
- rank：form 26185 / lemma 7300 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「巴西人」 / lemma「巴西的；巴西人」
- ECDICT：form「(Brazilian 的复数) n. 巴西人 a. 巴西的, 巴西人的」 / lemma「n. 巴西人 a. 巴西的, 巴西人的」
- **建议：`keep`**

## saws → saw
- rank：form 26186 / lemma 8337 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「锯子（复数）」 / lemma「锯子」
- ECDICT：form「n. 锯( saw的复数形式 ); 谚语, 格言 v. 往复移动( saw的第三人称单数 ); 浸( soak的过去式和…」 / lemma「n. 锯子, 谚语 vt. 锯, 锯开, 来回移动 vi. 拉锯, 移动 see的过去式」
- **建议：`?`**

## collared → collar
- rank：form 26195 / lemma 5184 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有领的；被抓住的」 / lemma「衣领；领子」
- ECDICT：form「a. 有领圈的, 上了轭/颈圈的, (肉)成卷的」 / lemma「n. 衣领, 颈圈 vt. 控制, 扭住衣领, 给...装上领子」
- **建议：`?`**

## southerners → southerner
- rank：form 26198 / lemma 36113 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「南方人」 / lemma「南方人」
- ECDICT：form「n. 南方人, 居住在南方的人( southerner的复数形式 )」 / lemma「n. 南方人」
- **建议：`keep`**

## inconsistencies → inconsistency
- rank：form 26249 / lemma 42593 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「不一致；矛盾（复数）」 / lemma「不一致；矛盾」
- ECDICT：form「n. 矛盾( inconsistency的名词复数 )」 / lemma「n. 不一致, 易变, 前后矛盾的事物 [法] 前后矛盾, 不一致」
- **建议：`keep`**

## labourers → labourer
- rank：form 26253 / lemma 28608 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「劳工；工人（复数）」 / lemma「体力劳动者」
- ECDICT：form「n. （尤指户外的）体力劳动者, 劳工, 工人( labourer的复数形式 )」 / lemma「n. 劳动者, 干体力工作的工人, 劳工 [机] 劳动者」
- **建议：`keep`**

## enacted → enact
- rank：form 26260 / lemma 27727 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「颁布；制定（法律）」 / lemma「颁布；实施；扮演」
- ECDICT：form「v. 制定（法律）, 通过（法案）( enact的过去式和过去分词 )」 / lemma「vt. 制定法律, 扮演, 颁布 [法] 法令, 法规, 条例」
- **建议：`keep`**

## unnerving → unnerve
- rank：form 26290 / lemma 47656 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人不安的；使人紧张的」 / lemma「使失去勇气；使不安」
- ECDICT：form「[医] 除神经法」 / lemma「vt. 使失去勇气, 使胆怯, 使不能自制 [医] 除神经」
- **建议：`keep`**

## dumas → duma
- rank：form 26323 / lemma 29108 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「大仲马/小仲马（法国姓氏）」 / lemma「杜马（俄罗斯议会）」
- ECDICT：form「[医] 足雅司病」 / lemma「n. 杜马(俄国会)」
- **建议：`keep`**

## advertisers → advertiser
- rank：form 26334 / lemma 44072 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「广告商（复数）」 / lemma「广告商；登广告者」
- ECDICT：form「n. 登广告的人( advertiser的复数形式 ); 报幕员」 / lemma「n. 做广告者, 广告客户 [经] 广告商, 广告者」
- **建议：`keep`**

## mews → mew
- rank：form 26365 / lemma 22842 ｜ type `s` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「马厩改建的住宅；小巷」 / lemma「喵喵叫；猫叫声」
- ECDICT：form「n. 小街, 街道, 小巷, 马厩」 / lemma「n. 猫叫声, 海鸥 vi. 咪咪叫 n. 鹰笼, 巢, 隐匿处 vt. 关进笼子」
- **建议：`?`**

## smurfs → smurf
- rank：form 26392 / lemma 12085 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「蓝精灵（复数）」 / lemma「蓝精灵」
- ECDICT：form「(smurf 的复数) n. 拆分洗钱（者）」 / lemma「n. 拆分洗钱（者）」
- **建议：`keep`**

## shoals → shoal
- rank：form 26412 / lemma 29746 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「浅滩；鱼群（复数）」 / lemma「鱼群；浅滩」
- ECDICT：form「n. 浅滩( shoal的名词复数 ); 沙洲; 鱼群; 大量」 / lemma「n. 浅水, 浅滩, 沙洲, 鱼群, 暗礁, 潜在危险 a. 浅的 vi. 鱼成群而游, 变浅 vt. 使变浅」
- **建议：`keep`**

## bas → ba
- rank：form 26418 / lemma 4741 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「巴斯（姓氏/缩写）」 / lemma「巴（人名/学位缩写）」
- ECDICT：form「n. BASIC程序的扩展名」 / lemma「文学士 [计] 基本汇编程序, 布尔代数, 总线可用」
- **建议：`keep`**

## ogling → ogle
- rank：form 26432 / lemma 28971 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「色迷迷地看；盯视（现在分词）」 / lemma「色迷迷地看；盯着看」
- ECDICT：form「v. （向…）抛媚眼, 送秋波( ogle的现在分词 )」 / lemma「n. 眉目传情 vt. 挑逗地注视 vi. 做媚眼」
- **建议：`keep`**

## jakes → jake
- rank：form 26453 / lemma 1037 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「厕所；茅房」 / lemma「杰克（人名）」
- ECDICT：form「n. 厕所」 / lemma「a. 满意的, 上等的 n. 乡下佬, 家伙」
- **建议：`keep`**

## blacklisted → blacklist
- rank：form 26473 / lemma 31541 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「列入黑名单」 / lemma「黑名单」
- ECDICT：form「v. 把（某人）列入黑名单( blacklist的过去式 )」 / lemma「n. 黑名单」
- **建议：`keep`**

## band-aids → band-aid
- rank：form 26499 / lemma 13587 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「创可贴；临时补救」 / lemma「创可贴；权宜之计」
- ECDICT：form「n. 创可贴；护创膏布（Band-Aid的复数）」 / lemma「a. 补缀的, 权宜的」
- **建议：`keep`**

## overwriting → overwrite
- rank：form 26500 / lemma 12800 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `-` / lemma `-`
- 词库 gloss：form「覆盖写入；覆写」 / lemma「覆盖写入；改写（原有内容）」
- ECDICT：form「n. 盖写法, 重写法 v. 写在…上面, 写得过多( overwrite的现在分词 )」 / lemma「vi. 写得过多(或长) vt. 写得过多, 用华丽文体写, 写在...上面 [计] 改写」
- **建议：`?`**

## midlands → midland
- rank：form 26568 / lemma 27332 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「中部地区；内陆」 / lemma「中部地区；内陆」
- ECDICT：form「n. 英国中部」 / lemma「n. 中部地方, 内地」
- **建议：`keep`**

## poppers → popper
- rank：form 26597 / lemma 27228 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「亚硝酸酯吸入剂；爆米花」 / lemma「爆米花机；罂粟（俚）」
- ECDICT：form「n. 发出砰的响声的人（或物）, 服药成瘾者( popper的复数形式 )」 / lemma「n. 发出砰的响声的人」
- **建议：`keep`**

## bludgeoned → bludgeon
- rank：form 26618 / lemma 40798 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「用重物猛击」 / lemma「用棍棒猛击；胁迫」
- ECDICT：form「v. 用大头棒打, 重击( bludgeon的过去式和过去分词 )」 / lemma「n. 大头棒 [法] 棍, 棍打」
- **建议：`keep`**

## subsidies → subsidy
- rank：form 26641 / lemma 30422 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「补贴；津贴（复数）」 / lemma「补贴；津贴」
- ECDICT：form「n. 补贴, 津贴, 补助金( subsidy的名词复数 )」 / lemma「n. 补助金, 津贴 [经] 补助金, 津贴, 补贴」
- **建议：`keep`**

## perforated → perforate
- rank：form 26647 / lemma 14000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「穿孔的；有孔的」 / lemma「穿孔，打洞；刺穿」
- ECDICT：form「v. 穿孔于, 在…上打眼( perforate的过去式和过去分词 ); （在纸张等上）打齿孔[孔眼线]」 / lemma「vt. 穿孔于, 刺穿, 打孔穿透 vi. 穿孔, 穿过 a. 有孔的, 穿孔的」
- **建议：`?`**

## armenians → armenian
- rank：form 26649 / lemma 13389 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「亚美尼亚人（复数）」 / lemma「亚美尼亚的；亚美尼亚人」
- ECDICT：form「[医]亚美尼亚人」 / lemma「a. 亚美尼亚的, 亚美尼亚人的 n. 亚美尼亚人, 亚美尼亚语」
- **建议：`keep`**

## carats → carat
- rank：form 26665 / lemma 29373 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「克拉（宝石重量单位，复数）」 / lemma「克拉；开（金纯度）」
- ECDICT：form「n. （宝石的重量单位）克拉( carat的复数形式 )」 / lemma「n. 克拉 [化] 开; 克拉(宝石、金刚石重量单位,等于0.2克)」
- **建议：`keep`**

## underlined → underline
- rank：form 26743 / lemma 33002 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「在…下划线；强调（过去式）」 / lemma「在……下画线；强调」
- ECDICT：form「a. 下划线的」 / lemma「vt. 在...下面划线, 作...的衬里, 强调 n. 下划线, 图下说明文字 [计] 加下划线; 下划线」
- **建议：`keep`**

## incas → inca
- rank：form 26770 / lemma 14496 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「印加人（复数）」 / lemma「印加人；印加帝国」
- ECDICT：form「(inca 的复数) n. 印加；印加人」 / lemma「n. 印加；印加人」
- **建议：`keep`**

## offed → off
- rank：form 26856 / lemma 97 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「杀死了；干掉了」 / lemma「离开；关闭」
- ECDICT：form「vi. [用于祈使句]走开, 滚开, 站开（off的过去式与过去分词形式）」 / lemma「a. 关着的, 不再生效的, 处于...境况的, 休假的, 空闲的 adv. 走开, ...掉, ...下, 休息, 出…」
- **建议：`?`**

## leaped → leap
- rank：form 26926 / lemma 5760 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跳跃（leap 过去式）」 / lemma「跳跃；跃过；猛增」
- ECDICT：form「leap的过去式和过去分词」 / lemma「n. 跳跃, 剧增, 急变, 被越过之物 vi. 跳跃, 突然经过 vt. 跃过, 使跃过」
- **建议：`?`**

## rooming → room
- rank：form 26954 / lemma 670 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「住宿；合租」 / lemma「房间；空间」
- ECDICT：form「n. 房间出租」 / lemma「n. 房间, 空位, 场所 vi. 住宿, 居住 vt. 留宿」
- **建议：`?`**

## recreated → re-create
- rank：form 26965 / lemma 25852 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「再创造；重现」 / lemma「重新创造；再现」
- ECDICT：form「v. 再创造( recreate的过去式和过去分词 ); 再现; 消遣; 娱乐」 / lemma「vt. 重新创作」
- **建议：`?`**

## recreated → recreate
- rank：form 26965 / lemma 11243 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「再创造；重现」 / lemma「重现；再创造；消遣」
- ECDICT：form「v. 再创造( recreate的过去式和过去分词 ); 再现; 消遣; 娱乐」 / lemma「v. (使)得到休养, (使)得到娱乐, 再创造」
- **建议：`?`**

## elongated → elongate
- rank：form 26969 / lemma 19600 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「拉长的；细长的」 / lemma「拉长，伸长」
- ECDICT：form「v. 延长, 加长( elongate的过去式和过去分词 )」 / lemma「v. 延长, (使)伸延 a. 伸长的」
- **建议：`?`**

## mics → mic
- rank：form 26977 / lemma 7468 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「麦克风（复数，口语）」 / lemma「麦克风（口语）」
- ECDICT：form「(MIC 的复数) [计] 介质接口, 连接器」 / lemma「[计] 介质接口, 连接器」
- **建议：`keep`**

## fertilized → fertilize
- rank：form 26980 / lemma 30020 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「受精的；施肥的」 / lemma「施肥；使受精」
- ECDICT：form「n. 已受精的」 / lemma「vt. 施肥, 使丰饶, 使受精」
- **建议：`keep`**

## intensified → intensify
- rank：form 26995 / lemma 32476 ｜ type `dp` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「加强；加剧（过去式）」 / lemma「加强；加剧」
- ECDICT：form「v. （使）增强, （使）加剧( intensify的过去式和过去分词 )」 / lemma「vt. 加强 vi. 强化」
- **建议：`keep`**

## pled → ple
- rank：form 27023 / lemma 36386 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「恳求（plead 过去式）」 / lemma「Ple（缩写/人名）」
- ECDICT：form「为...辩护, 以...作为答辩, 以...为借口, 以...为理由, 辩护, 申明, 抗辩, 恳求」 / lemma「abbr. 个性化学习环境（Personal Learning Environment）」
- **建议：`keep`**

## comprised → comprise
- rank：form 27030 / lemma 42012 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「由……组成；包含」 / lemma「包括；由…组成」
- ECDICT：form「v. 由…组成；包含（comprise的过去分词）」 / lemma「vt. 包含, 构成」
- **建议：`keep`**

## belgians → belgian
- rank：form 27032 / lemma 10093 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「比利时人」 / lemma「比利时的；比利时人」
- ECDICT：form「n. 比利时人( Belgian的复数形式 )」 / lemma「n. 比利时人 a. 比利时的」
- **建议：`keep`**

## scamming → scam
- rank：form 27062 / lemma 5204 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「诈骗；行骗」 / lemma「骗局；诈骗」
- ECDICT：form「v. 欺诈, 诓骗(scam的变形)」 / lemma「n. 骗局, 诡计；故事」
- **建议：`?`**

## jerseys → jersey
- rank：form 27069 / lemma 3129 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「运动衫；泽西岛」 / lemma「运动衫；泽西岛」
- ECDICT：form「n. 毛线衫, 毛织运动衫；上衣（jersey的复数形式）」 / lemma「n. 运动衫」
- **建议：`keep`**

## writhing → writhe
- rank：form 27087 / lemma 43171 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「扭动挣扎的」 / lemma「扭动；翻滚；痛苦挣扎」
- ECDICT：form「v. （因极度痛苦而）扭动或翻滚( writhe的现在分词 )」 / lemma「n. 扭动, 盘绕, 苦恼 vt. 扭曲, 缠绕 vi. 蠕动, 扭动身体, 盘绕, 遭受苦难」
- **建议：`keep`**

## reprisals → reprisal
- rank：form 27100 / lemma 33429 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「报复，报复行动」 / lemma「报复；报复行动」
- ECDICT：form「n. 报复（行为）( reprisal的复数形式 )」 / lemma「n. 报复, 报仇, 报复性劫掠 [法] 复仇, 报复, 报复性暴力为」
- **建议：`keep`**

## dividends → dividend
- rank：form 27102 / lemma 34473 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「红利，股息；好处」 / lemma「股息；红利」
- ECDICT：form「n. 红利( dividend的复数形式 ); 股息; 被除数; （足球彩票的）彩金」 / lemma「n. 被除数, 股利 [计] 被除数」
- **建议：`keep`**

## pattering → patter
- rank：form 27124 / lemma 27241 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出嗒嗒声；喋喋不休」 / lemma「轻快的敲击声；急速说话」
- ECDICT：form「v. 发出急速轻的拍声, 嗒嗒地跑( patter的现在分词 )」 / lemma「n. 急速拍打声, 轻快脚步声, 行话, 快板, 饶舌 vi. 急速地说, 滴答地响, 祷告, 念经, 念顺口溜 vt.…」
- **建议：`keep`**

## het → heat
- rank：form 27153 / lemma 5622 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「兴奋的，激动的（俚语）」 / lemma「热；高温」
- ECDICT：form「abbr. 重型设备运输车（Heavy Equipment Transporter）；高爆曳光弹（High-Explos…」 / lemma「n. 热, 热度, 体温, 高潮 vi. 加热, 激昂, 加剧 vt. 把...加热, 使激动」
- **建议：`?`**

## diluted → dilute
- rank：form 27173 / lemma 33079 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「稀释的；淡化的」 / lemma「稀释；削弱」
- ECDICT：form「a. 稀释的；无力的」 / lemma「vt. 冲淡, 稀释 a. 淡的, 稀释的」
- **建议：`keep`**

## fides → fide
- rank：form 27200 / lemma 19926 ｜ type `3` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `-` / lemma `loan`
- 词库 gloss：form「信任，诚信（拉丁语借词）」 / lemma「善意的（bona fide）」
- ECDICT：form「[法] 诚实, 信用, 忠实」 / lemma「[体]国际棋联」
- **建议：`keep`**

## pensioners → pensioner
- rank：form 27232 / lemma 28762 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「领养老金者（pensioner 复数）」 / lemma「领养老金者」
- ECDICT：form「n. 领取退休、养老金或抚恤金的人( pensioner的复数形式 )」 / lemma「n. 领取抚恤金者, (英国剑桥大学的)自费生, 为金钱所收买的人, 帮佣 [法] 领取退休金者, 领取抚恤金者」
- **建议：`keep`**

## gauls → gaul
- rank：form 27316 / lemma 18524 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「高卢人（复数）」 / lemma「高卢；高卢人」
- ECDICT：form「n. 高卢人；高卢族」 / lemma「n. 高卢（位于欧洲西部）；高卢人」
- **建议：`keep`**

## harrowing → harrow
- rank：form 27336 / lemma 23691 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「令人痛苦的；揪心的」 / lemma「耙；哈罗（地名/学校）」
- ECDICT：form「a. 痛心的, 悲惨的 [医] 神经纤维松解法」 / lemma「n. 哈罗公学, 耙 vt. 耙掘, 伤害, 使苦恼 vi. 被耙松」
- **建议：`keep`**

## shamans → shaman
- rank：form 27430 / lemma 9663 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「萨满；巫师」 / lemma「萨满；巫师」
- ECDICT：form「(shaman 的复数) n. 萨满教巫医 [法] 巫师」 / lemma「n. 萨满教巫医 [法] 巫师」
- **建议：`?`**

## listings → listing
- rank：form 27456 / lemma 12938 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「列表；清单；挂牌信息」 / lemma「列表；清单」
- ECDICT：form「表」 / lemma「[计] 列表, 清单, 编目 [经] 挂牌, 上市, 编表」
- **建议：`keep`**

## swingers → swinger
- rank：form 27485 / lemma 31955 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摇摆者；交换伴侣者」 / lemma「摇摆者；换偶者」
- ECDICT：form「n. 摆动（或挥动）的人, 赶时髦的人( swinger的复数形式 )」 / lemma「n. 赶时髦的人, 摆动的人, 摆动的物, 有力的事物, 轰动的事物, 责打者」
- **建议：`keep`**

## paratroopers → paratrooper
- rank：form 27547 / lemma 34591 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「伞兵」 / lemma「伞兵」
- ECDICT：form「n. 伞兵( paratrooper的复数形式 )」 / lemma「n. 伞兵」
- **建议：`keep`**

## saxons → saxon
- rank：form 27564 / lemma 13200 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「撒克逊人」 / lemma「撒克逊人」
- ECDICT：form「n. 撒克逊人（Saxon的复数）」 / lemma「n. 撒克逊人」
- **建议：`keep`**

## kindling → kindle
- rank：form 27566 / lemma 32477 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「引火物；点火柴」 / lemma「点燃；激起」
- ECDICT：form「n. 点火, 发火, 兴奋」 / lemma「vt. 点燃, 使着火, 引起, 照亮 vi. 着火, 激动, 发亮」
- **建议：`keep`**

## seething → seethe
- rank：form 27586 / lemma 7605 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「沸腾的；怒火中烧的」 / lemma「沸腾；翻滚」
- ECDICT：form「a. 沸腾的, 火热的」 / lemma「vi. 冒泡, 沸腾 vt. 使煮沸, 使浸透 n. 翻腾」
- **建议：`?`**

## recreating → recreate
- rank：form 27622 / lemma 11243 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「再创造；消遣（现在分词）」 / lemma「重现；再创造；消遣」
- ECDICT：form「v. 再创造( recreate的现在分词 ); 再现; 消遣; 娱乐」 / lemma「v. (使)得到休养, (使)得到娱乐, 再创造」
- **建议：`?`**

## vacuuming → vacuum
- rank：form 27624 / lemma 5024 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用吸尘器打扫（现在分词）」 / lemma「真空；吸尘器」
- ECDICT：form「n. 真空处理；资料移除」 / lemma「n. 真空, 空间, 真空吸尘器 a. 真空的, 产生真空的, 利用真空的 vt. 用吸尘器打扫」
- **建议：`?`**

## hysterics → hysteric
- rank：form 27646 / lemma 47040 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「歇斯底里发作；狂笑」 / lemma「歇斯底里的；情绪失控的」
- ECDICT：form「n. 歇斯底里的发作 [医] 癔病爆发, 歇斯底里爆发」 / lemma「a. 癔病的, 歇斯底里的 n. 癔病患者」
- **建议：`keep`**

## amassed → amass
- rank：form 27650 / lemma 40838 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「积聚；积累」 / lemma「积累；积聚」
- ECDICT：form「vt. 积聚, 积累」 / lemma「vt. 积聚, 堆积」
- **建议：`keep`**

## eroded → erode
- rank：form 27657 / lemma 42015 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「侵蚀；逐渐削弱」 / lemma「侵蚀；逐渐削弱」
- ECDICT：form「a. 被侵蚀的, 损坏了」 / lemma「vt. 腐蚀, 侵蚀 vi. 受腐蚀」
- **建议：`keep`**

## localized → localize
- rank：form 27689 / lemma 19000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「局部的；局限的」 / lemma「使本地化；定位」
- ECDICT：form「a. 小范围的；局部的；地区的」 / lemma「vt.vi. 使地方化, 使具有地方性, 使限制于局部, 确定起源, 集中, 局限 [计] 局部化, 定位, 定域」
- **建议：`?`**

## grasslands → grassland
- rank：form 27732 / lemma 31501 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「草原（复数）」 / lemma「草原；草地」
- ECDICT：form「n. 草原, 牧场( grassland的复数形式 )」 / lemma「n. 牧草地, 草原」
- **建议：`keep`**

## resounding → resound
- rank：form 27775 / lemma 41721 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「响亮的；巨大的」 / lemma「回响；回荡」
- ECDICT：form「a. 响亮的, 轰动的」 / lemma「vi. 回响, 鸣响, 反响, 驰名, 被传遍 vt. 使回响, 传颂」
- **建议：`keep`**

## cymbals → cymbal
- rank：form 27776 / lemma 36821 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「钹（复数）」 / lemma「铙钹」
- ECDICT：form「圆盘式张力装置」 / lemma「n. 铙钹」
- **建议：`keep`**

## carpeting → carpet
- rank：form 27787 / lemma 3607 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「地毯；铺地毯」 / lemma「地毯」
- ECDICT：form「n. 地毯料, 地毯」 / lemma「n. 地毯, 地毯状物 vt. 铺以地毯, 铺盖」
- **建议：`?`**

## coursing → course
- rank：form 27793 / lemma 159 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「奔流；追踪（现在分词）」 / lemma「课程；过程」
- ECDICT：form「n. 追赶；奔驰；携带猎犬狩猎」 / lemma「n. 课程, 路线, 过程, 一道菜, 道路 v. 追, (使)跑」
- **建议：`?`**

## upheld → uphold
- rank：form 27798 / lemma 13000 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「支持；维持（过去式）」 / lemma「支持，维护， uphold（维持原判）」
- ECDICT：form「uphold的过去式和过去分词」 / lemma「vt. 支撑, 赞成, 鼓励, 举起, 坚持 [法] 确认, 赞成, 支持」
- **建议：`?`**

## empowering → empower
- rank：form 27816 / lemma 30686 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「赋权的；增强自信的」 / lemma「授权；使强大」
- ECDICT：form「v. 授权( empower的现在分词 ); 准许; 增加（某人的）自主权; 使控制局势」 / lemma「vt. 授予权力, 允许, 使能够 [法] 授权, 准许, 转委」
- **建议：`keep`**

## wiles → wile
- rank：form 27841 / lemma 33980 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「诡计；花招」 / lemma「诡计；花招」
- ECDICT：form「n. 诡计, 骗人的把戏, 圈套, 奸计, 欺骗, 欺诈」 / lemma「n. 诡计, 狡猾 vt. 引诱, 诱骗, 消遣」
- **建议：`keep`**

## orcs → orc
- rank：form 27889 / lemma 34442 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「兽人（奇幻生物）」 / lemma「兽人；半兽人」
- ECDICT：form「n. 奥克斯（半兽人）」 / lemma「n. 虎鲸；乐队；妖魔（等于orca）」
- **建议：`keep`**

## linds → lind
- rank：form 27894 / lemma 38119 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「林兹（人名/简称）」 / lemma「林德（姓氏）」
- ECDICT：form「n. 【植物】欧椴」 / lemma「n. 利德（姓氏）」
- **建议：`keep`**

## e-mailing → e-mail
- rank：form 27954 / lemma 3170 ｜ type `i` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发电子邮件」 / lemma「电子邮件」
- ECDICT：form「v. 电子邮件( e-mail的现在分词 )」 / lemma「[计] 电子邮件」
- **建议：`keep`**

## routing → rout
- rank：form 27956 / lemma 6786 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「路由；路线安排」 / lemma「溃败」
- ECDICT：form「[计] 路由选择; 布线」 / lemma「n. 溃败, 大败, 乌合之众, 盛大晚会 vt. 使溃败, 使败逃, 打垮, 用鼻拱, 挖起, 搜, 唤起 vi. 用…」
- **建议：`?`**

## routing → route
- rank：form 27956 / lemma 1833 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「路由；路线安排」 / lemma「路线；途径」
- ECDICT：form「[计] 路由选择; 布线」 / lemma「n. 路径, 途径, 路线 vt. 确定路线, 按规定路线发送 [计] 传递, 路由设定程序」
- **建议：`?`**

## restructuring → restructure
- rank：form 28000 / lemma 40290 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重组；结构调整」 / lemma「重组；调整结构」
- ECDICT：form「[计] 重构的」 / lemma「vt. 更改结构, 重建, 调整」
- **建议：`keep`**

## baptised → baptise
- rank：form 28011 / lemma 37457 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「施洗；洗礼（过去式）」 / lemma「给…施洗礼（英式拼写）」
- ECDICT：form「vt., vi. baptise的变形」 / lemma「vt. 给...施洗礼, 命名, 使纯化, 洗炼」
- **建议：`keep`**

## flailing → flail
- rank：form 28103 / lemma 34714 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乱挥；挣扎」 / lemma「胡乱摆动；挥舞」
- ECDICT：form「v. 鞭打( flail的现在分词 ); 用连枷脱粒; （臂或腿）无法控制地乱动; 扫雷坦克」 / lemma「n. 连枷 v. 用连枷打, 打」
- **建议：`keep`**

## renamed → rename
- rank：form 28112 / lemma 34654 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「重新命名；改名」 / lemma「重新命名；改名」
- ECDICT：form「v. 给…重新取名, 改名( rename的过去式和过去分词 )」 / lemma「vt. 重新命名, 再命名, 给...改名 [计] 重命名; DOS内部命令:更改文件名」
- **建议：`keep`**

## oppressors → oppressor
- rank：form 28116 / lemma 32614 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「压迫者（复数）」 / lemma「压迫者」
- ECDICT：form「n. 压迫者, 暴君( oppressor的复数形式 )」 / lemma「n. 压迫者, 压制者 [法] 压迫者, 压制者, 强迫者」
- **建议：`keep`**

## astounded → astound
- rank：form 28155 / lemma 36471 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「震惊的；大吃一惊的」 / lemma「使震惊；使惊骇」
- ECDICT：form「v. 使惊愕（astound的过去式和过去分词） a. 受惊骇的；被震惊的」 / lemma「vt. 使惊骇, 使大惊」
- **建议：`keep`**

## retailers → retailer
- rank：form 28176 / lemma 34720 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「零售商」 / lemma「零售商」
- ECDICT：form「n. 零售商, 零售店( retailer的复数形式 )」 / lemma「n. 零售商人, 传播的人 [经] 零售商」
- **建议：`keep`**

## waning → wane
- rank：form 28206 / lemma 39793 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「渐弱的；衰退的」 / lemma「减弱；衰退」
- ECDICT：form「n. 减弱；月亏」 / lemma「n. 减少, 衰微, 败落, 亏缺, 月亏 vi. 变小, 亏缺, 衰落, 消逝, 退潮」
- **建议：`keep`**

## singed → singe
- rank：form 28259 / lemma 41171 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烧焦；烫焦（过去式）」 / lemma「烧焦；燎毛」
- ECDICT：form「v. 浅表烧焦( singe的过去式和过去分词 ); （毛发）燎, 烧焦尖端[边儿]」 / lemma「v. 烧焦, 烤焦」
- **建议：`keep`**

## knockers → knocker
- rank：form 28315 / lemma 38945 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「门环；（俚）乳房」 / lemma「门环；吹毛求疵者」
- ECDICT：form「n. <俚>（女人的）一对乳房（用此词会冒犯女性）; 门环( knocker的复数形式 ); 吹毛求疵的人」 / lemma「n. 敲击者(或物), 敲门者, 门环 [电] 开锤」
- **建议：`keep`**

## seeping → seep
- rank：form 28316 / lemma 30316 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「渗漏；渗出」 / lemma「渗漏；渗透」
- ECDICT：form「v. （液体）渗( seep的现在分词 ); 渗透; 渗出; 漏出」 / lemma「vi. 渗出, 渗流, 漏 n. 小泉, 水陆两用吉普车」
- **建议：`keep`**

## barnacles → barnacle
- rank：form 28348 / lemma 31487 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「藤壶（复数）」 / lemma「藤壶；附着物」
- ECDICT：form「n. 眼镜」 / lemma「n. 北极雁, 藤壶」
- **建议：`keep`**

## fidgeting → fidget
- rank：form 28377 / lemma 41204 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「坐立不安；摆弄」 / lemma「坐立不安；摆弄」
- ECDICT：form「v. 坐立不安, 烦躁( fidget的现在分词 )」 / lemma「vi. 坐卧不安, 摆弄 vt. 使烦乱, 使不安 n. 烦躁不安, 坐立不安的人」
- **建议：`keep`**

## breast-feeding → breast-feed
- rank：form 28408 / lemma 37367 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「母乳喂养」 / lemma「母乳喂养」
- ECDICT：form「n. (用)母奶喂养 [医] 人乳哺育」 / lemma「vt. (用)母奶喂养(婴孩), 给...喂奶」
- **建议：`keep`**

## calibrated → calibrate
- rank：form 28420 / lemma 36346 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「校准的；标定的」 / lemma「校准；标定」
- ECDICT：form「v. 校准使...标准化；校准（calibrate的过去分词）」 / lemma「vt. 测定口径, 校准, 使标准化, 调整 [化] 校准」
- **建议：`keep`**

## endorphins → endorphin
- rank：form 28438 / lemma 16200 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「内啡肽（复数）」 / lemma「内啡肽」
- ECDICT：form「n. 脑内啡; 安多芬; 内啡肽。是一种内成性（脑下垂体分泌）的类吗啡生物化学合成物激素。它是由脑下垂体和脊椎动物的丘脑…」 / lemma「[化] 内啡肽」
- **建议：`keep`**

## trappings → trapping
- rank：form 28465 / lemma 17916 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「装饰；标志性服饰」 / lemma「诱捕；困住」
- ECDICT：form「n. 马饰, 服饰, 礼服, 装饰品, 外部标志」 / lemma「[计] 设陷, 陷入, 俘获 [化] 截留; 捕俘」
- **建议：`keep`**

## african-americans → african-american
- rank：form 28493 / lemma 13185 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「非裔美国人」 / lemma「非裔美国人」
- ECDICT：form「(african-american 的复数) n. 非裔美国人；美国黑人」 / lemma「n. 非裔美国人；美国黑人」
- **建议：`keep`**

## winded → wind
- rank：form 28515 / lemma 830 ｜ type `p` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喘不过气的」 / lemma「风」
- ECDICT：form「a. 呼吸...的, 风化的, 气急的 wind的过去式和过去分词」 / lemma「n. 风, 气息, 气味, 呼吸, 风声, 趋势, 空谈, 卷绕, 弯曲 vt. 使通风, 嗅出, 使喘气, 吹号角, …」
- **建议：`?`**

## shingles → shingle
- rank：form 28556 / lemma 33073 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「带状疱疹」 / lemma「木瓦；鹅卵石滩」
- ECDICT：form「n. 带状疱疹 [医] 带状疱疹」 / lemma「n. 墙面板, 小招牌」
- **建议：`keep`**

## subscribers → subscriber
- rank：form 28563 / lemma 28946 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「订阅者；用户（复数）」 / lemma「订阅者；用户」
- ECDICT：form「n. 订阅者, 认股人；捐款人（subscriber复数形式）」 / lemma「n. 签署者, 捐献者, 订户 [经] 定户」
- **建议：`keep`**

## courtiers → courtier
- rank：form 28589 / lemma 39575 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「朝臣（复数）」 / lemma「朝臣；廷臣」
- ECDICT：form「n. 侍臣, 廷臣( courtier的复数形式 )」 / lemma「n. 侍臣, 奉承者」
- **建议：`keep`**

## marinated → marinate
- rank：form 28602 / lemma 34636 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「腌制的」 / lemma「腌制；浸泡」
- ECDICT：form「vt. 把…浸泡于腌泡汁中（marinate的过去式与过去分词形式）」 / lemma「vt. 用腌泡汁腌/泡(肉/鱼)」
- **建议：`keep`**

## dolled → doll
- rank：form 28614 / lemma 1996 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「打扮（doll up 过去式）」 / lemma「洋娃娃；玩偶」
- ECDICT：form「v. 把…打扮漂亮( doll的过去式和过去分词 )」 / lemma「n. 洋娃娃, 无头脑的美丽女人」
- **建议：`keep`**

## norwegians → norwegian
- rank：form 28674 / lemma 8859 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「挪威人」 / lemma「挪威的；挪威人」
- ECDICT：form「n. 挪威人（Norwegian的复数）」 / lemma「n. 挪威人, 挪威语 a. 挪威的, 挪威人的, 挪威语的」
- **建议：`keep`**

## clamouring → clamour
- rank：form 28678 / lemma 35466 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「大声要求；喧嚷」 / lemma「喧闹；大声要求」
- ECDICT：form「v. 喧哗, 吵闹( clamour的现在分词 ); 大声地要求或抗议」 / lemma「n. 喧闹 v. 大声地要求」
- **建议：`keep`**

## brainstorming → brainstorm
- rank：form 28745 / lemma 21021 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「头脑风暴；集思广益」 / lemma「头脑风暴；集思广益」
- ECDICT：form「自由讨论, 发表独创[创造]性意见, 智力爆发」 / lemma「n. 灵机一动 v. 集体讨论」
- **建议：`?`**

## blasters → blaster
- rank：form 28755 / lemma 16545 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「爆破者；冲击波」 / lemma「爆破者；冲击波」
- ECDICT：form「(blaster 的复数) [计] 熔固器, 装置」 / lemma「[计] 熔固器, 装置」
- **建议：`keep`**

## jeeps → jeep
- rank：form 28825 / lemma 5076 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「吉普车（复数）」 / lemma「吉普车」
- ECDICT：form「n. 吉普车（Jeep的复数形式）」 / lemma「n. 吉普车 vi. 乘吉普车 vt. 用吉普车运」
- **建议：`keep`**

## afghans → afghan
- rank：form 28878 / lemma 11556 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「阿富汗人；阿富汗毯」 / lemma「阿富汗人；阿富汗毛毯」
- ECDICT：form「n. 阿富汗人, 阿富汗语, 阿富汗毛毯( Afghan的复数形式 )」 / lemma「a. 阿富汗的, 阿富汗人的 n. 阿富汗人, 阿富汗语, 阿富汗毛毯」
- **建议：`keep`**

## cutlets → cutlet
- rank：form 28917 / lemma 29348 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「肉片；肉排（复数）」 / lemma「肉片；炸肉饼」
- ECDICT：form「n. （供烧烤、煎、炸用的）肉片, 肉饼, 炸肉排( cutlet的复数形式 )」 / lemma「n. 肉片, 炸肉片, 炸肉排」
- **建议：`keep`**

## undergarments → undergarment
- rank：form 28944 / lemma 47639 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「内衣；衬衣」 / lemma「内衣；衬衣」
- ECDICT：form「n. 内衣, 贴身衣( undergarment的复数形式 )」 / lemma「n. 内衣, 衬衣」
- **建议：`keep`**

## limos → limo
- rank：form 28972 / lemma 5635 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「豪华轿车(复数)」 / lemma「豪华轿车」
- ECDICT：form「(limo 的复数) [医] 柠檬」 / lemma「[医] 柠檬」
- **建议：`keep`**

## birdies → birdie
- rank：form 28999 / lemma 8894 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小鸟(昵称)；小鸟球」 / lemma「小鸟；小鸟球」
- ECDICT：form「n. 小鸟儿( birdie的名词复数 ) v. 小鸟儿( birdie的第三人称单数 )」 / lemma「n. 小鸟」
- **建议：`?`**

## birdies → birdy
- rank：form 28999 / lemma 19688 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小鸟(昵称)；小鸟球」 / lemma「小鸟（儿语）」
- ECDICT：form「n. 小鸟儿( birdie的名词复数 ) v. 小鸟儿( birdie的第三人称单数 )」 / lemma「a. 如鸟的, 多鸟的」
- **建议：`?`**

## hikers → hiker
- rank：form 29016 / lemma 36694 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「徒步旅行者」 / lemma「徒步旅行者」
- ECDICT：form「n. 远足者, 长途旅行者( hiker的复数形式 )」 / lemma「n. 徒步旅行者」
- **建议：`keep`**

## vas → va
- rank：form 29034 / lemma 9556 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「血管；导管（缩写）」 / lemma「弗吉尼亚州（缩写）」
- ECDICT：form「[医] 管, 脉管」 / lemma「[医] 视敏度」
- **建议：`keep`**

## presided → preside
- rank：form 29037 / lemma 29426 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「主持；主管」 / lemma「主持；主管」
- ECDICT：form「v. 主持, 主管( preside的过去式和过去分词 )」 / lemma「vi. 统辖, 当主人, 主持 [法] 主持, 负责, 指挥」
- **建议：`keep`**

## neutrinos → neutrino
- rank：form 29046 / lemma 34657 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「中微子」 / lemma「中微子」
- ECDICT：form「n. 中微子( neutrino的名词复数 )」 / lemma「n. 中微子 [化] 中微子; 微中子」
- **建议：`keep`**

## kovacs → kovac
- rank：form 29057 / lemma 16662 ｜ type `s` ｜ src `A` ｜ flags `lemma-proper, lemma-no-gloss, src-a-only`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「科瓦奇（姓氏）」 / lemma「科瓦奇（姓氏）」
- ECDICT：form「[人名] 科瓦奇」 / lemma「」
- **建议：`keep`**

## motoring → motor
- rank：form 29121 / lemma 3023 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「驾车；汽车运动」 / lemma「发动机；马达」
- ECDICT：form「n. 驾车, 乘汽车」 / lemma「n. 马达, 发动机, 原动力, 汽车 a. 马达的, 发动机的, 汽车的, 发动的 vt. 推动, 以汽车载运 vi.…」
- **建议：`?`**

## slurred → slur
- rank：form 29135 / lemma 29408 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「含糊地说； slur 的过去式」 / lemma「污辱；含糊发音」
- ECDICT：form「v. 含糊地说出( slur的过去式和过去分词 ); 含糊地发…的声; 侮辱; 连唱」 / lemma「n. 连音符, 诽谤, 玷污, 印刷模糊 vt. 草率地看过, 忽略, 含糊地念 vi. 模糊不清」
- **建议：`keep`**

## furnishings → furnishing
- rank：form 29168 / lemma 42134 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「家具；陈设」 / lemma「家具；陈设」
- ECDICT：form「n. 家具；供应；穿戴用品（furnishing的复数）」 / lemma「n. 家具, 服饰品, 陈设品, 设备」
- **建议：`keep`**

## foraging → forage
- rank：form 29170 / lemma 29508 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「觅食；搜寻」 / lemma「觅食；搜寻」
- ECDICT：form「v. 搜寻（食物）, 尤指动物觅（食）( forage的现在分词 ); （尤指用手）搜寻（东西）」 / lemma「n. 粮草, 饲料, 搜寻粮草 vt. 喂, 掠夺, 搜寻粮秣 vi. 搜寻粮草, 掠夺」
- **建议：`keep`**

## mentoring → mentor
- rank：form 29188 / lemma 14000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「指导；辅导」 / lemma「导师，良师益友」
- ECDICT：form「n. mentoring是一种工作关系。mentor通常是处在比mentee更高工作职位上的有影响力的人。他/她有比‘m…」 / lemma「n. 指导者, 良师益友」
- **建议：`?`**

## rearranging → rearrange
- rank：form 29196 / lemma 16002 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「重新安排；整理」 / lemma「重新安排；整理」
- ECDICT：form「v. 重新安排( rearrange的现在分词 ); 重新布置; 改变既定的（计划等）; 做无用功」 / lemma「vt. 再排列, 重新整理 [计] 重新排列; 重新整理」
- **建议：`?`**

## byrnes → byrne
- rank：form 29207 / lemma 20663 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「伯恩斯（姓氏）」 / lemma「伯恩（人名）」
- ECDICT：form「伯恩斯(①姓氏 ②James francis, 1879-1972, 美国政治家及法学家)」 / lemma「n. 伯恩（姓氏）」
- **建议：`keep`**

## debtors → debtor
- rank：form 29216 / lemma 32823 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「债务人（复数）」 / lemma「债务人；借方」
- ECDICT：form「n. 债务人, 借方( debtor的复数形式 )」 / lemma「n. 债务人, 借主, 借方 [法] 负债者, 债务人, 借方」
- **建议：`keep`**

## personalized → personalize
- rank：form 29281 / lemma 45313 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「个性化的；定制的」 / lemma「个性化；使个人化」
- ECDICT：form「a. 个人化的；个性化的」 / lemma「vt. (贬)使个人化, 体现, 使人格化, 在(物品)上标明姓名/标出地址/标出记号」
- **建议：`keep`**

## wording → word
- rank：form 29301 / lemma 5988 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「措辞；用词」 / lemma「措辞；用言语表达」
- ECDICT：form「n. 用词, 措词」 / lemma「n. 话, 消息, 词, 诺言, 命令 vt. 用言辞表达 [计] 字」
- **建议：`?`**

## radiating → radiate
- rank：form 29315 / lemma 29642 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「辐射；散发」 / lemma「辐射；散发；流露」
- ECDICT：form「a. 辐射的」 / lemma「vt. 放射, 散发, 辐射, 传播, 广播 vi. 发光, 辐射, 流露 a. 有射线的, 辐射状的」
- **建议：`keep`**

## reprogrammed → reprogram
- rank：form 29376 / lemma 24378 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重新编程；改写」 / lemma「重新编程；改写程序」
- ECDICT：form「v. 改编, 程序重调( reprogram的过去式和过去分词 )」 / lemma「[计] 可改编程序, 重编程序」
- **建议：`keep`**

## trills → trill
- rank：form 29384 / lemma 35637 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「颤音；抖动声」 / lemma「颤音」
- ECDICT：form「n. 颤声, 抖音, 啭声( trill的名词复数 ) v. 用抖动的声音说, 用卷舌发音, 发出抖动的声音( tril…」 / lemma「n. 颤声, 颤音, 啭鸣 vt. 用颤声说, 用颤音唱 vi. 发出颤音」
- **建议：`keep`**

## popsicles → popsicle
- rank：form 29424 / lemma 16852 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「冰棒（复数）」 / lemma「冰棒；棒冰」
- ECDICT：form「冰棍；棒冰」 / lemma「n. 冰棍」
- **建议：`keep`**

## traipsing → traipse
- rank：form 29467 / lemma 47616 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「无精打采地走」 / lemma「疲惫地走；闲荡」
- ECDICT：form「v. 漫步( traipse的现在分词 ); 拖曳; 在…游荡; 走过」 / lemma「vi. 闲荡, 疲惫地走 n. 闲荡」
- **建议：`keep`**

## toms → tom
- rank：form 29475 / lemma 597 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「汤姆（人名复数）」 / lemma「汤姆（人名）」
- ECDICT：form「abbr. 臭氧总量绘图系统（Total Ozone Mapping Spectrometer）」 / lemma「n. 雄性动物, 雄猫」
- **建议：`keep`**

## countermeasures → countermeasure
- rank：form 29517 / lemma 43077 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「对策；反制措施」 / lemma「对策；反制措施」
- ECDICT：form「n. 对策；[军] 对抗措施（countermeasure的复数）」 / lemma「n. 对策, 反抗手段, 反措施 [法] 对策, 反对手段, 抵制措施」
- **建议：`keep`**

## hamas → hama
- rank：form 29527 / lemma 38170 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「哈马斯（组织）」 / lemma「哈马（叙利亚城市）」
- ECDICT：form「n. 伊斯兰抵抗运动」 / lemma「哈马[叙利亚西部城市]」
- **建议：`keep`**

## nylons → nylon
- rank：form 29589 / lemma 16357 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「尼龙长袜」 / lemma「尼龙」
- ECDICT：form「n. 尼龙长袜」 / lemma「n. 尼龙 [化] 尼龙; 聚酰胺纤维」
- **建议：`keep`**

## interconnected → interconnect
- rank：form 29602 / lemma 46028 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「相互关联的」 / lemma「互连」
- ECDICT：form「v. 互相连接, 互相联系( interconnect的过去式和过去分词)」 / lemma「vt. 使互相连接」
- **建议：`keep`**

## particulates → particulate
- rank：form 29632 / lemma 46009 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「颗粒物（复数）」 / lemma「微粒的」
- ECDICT：form「n. 微粒, 粒子( particulate的复数形式 )」 / lemma「n. 微粒 a. 微粒的」
- **建议：`keep`**

## omitted → omit
- rank：form 29655 / lemma 31726 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「省略；遗漏；忽略」 / lemma「省略；遗漏」
- ECDICT：form「a. 省略了的；省去的」 / lemma「vt. 省略, 删除, 疏忽, 遗漏 [化] 省略」
- **建议：`keep`**

## flooring → floor
- rank：form 29713 / lemma 4872 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地板材料；地板」 / lemma「地板；楼层」
- ECDICT：form「n. 地板, 地板材料, 铺地板」 / lemma「n. 地板, 楼层, 底部, 底价 vt. 铺地板, 打倒 n. 地面, 地板, 基底 [计] 基底」
- **建议：`?`**

## pms → pm
- rank：form 29869 / lemma 3461 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「经前综合征（缩写）」 / lemma「首相；下午」
- ECDICT：form「[计] 过程监控系统, 计划管理系统 [医] 孕马血清激素」 / lemma「出纳员, 军需官 [计] 调相, 性能管理, 处理模块, 程序存储器」
- **建议：`keep`**

## foreclosed → foreclose
- rank：form 29911 / lemma 33683 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「取消赎回权（过去式）」 / lemma「取消抵押品赎回权」
- ECDICT：form「v. 取消（抵押品）赎回权( foreclose的过去式和过去分词 ); 取消（抵押人的）赎回抵押品的权利; 排除; 阻…」 / lemma「vt. 阻止, 排除, 预先处理, 取消抵押品赎回权 vi. 取消抵押品赎回权」
- **建议：`keep`**

## plummeting → plummet
- rank：form 29956 / lemma 16000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「骤降；暴跌（现在分词）」 / lemma「垂直落下，暴跌」
- ECDICT：form「v. 垂直落下, 骤然跌落( plummet的现在分词 )」 / lemma「n. 测深锤, 铅坠 vi. 垂直落下」
- **建议：`?`**

## vos → vo
- rank：form 29983 / lemma 19896 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「沃斯（人名/缩写）」 / lemma「沃（人名/缩写）」
- ECDICT：form「abbr. 虚拟操作系统（Virtual Operating System）；声控录制系统（Voice Operatio…」 / lemma「abbr. 口头命令（Verbal Order）」
- **建议：`keep`**

## sanctified → sanctify
- rank：form 30012 / lemma 38867 ｜ type `pd` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「神圣化的；圣洁的」 / lemma「使神圣；赐福于」
- ECDICT：form「a. 神圣化的, 认可的, 批准的」 / lemma「vt. 使神圣, 奉献给神, 使成为神圣之物」
- **建议：`keep`**

## loathing → loathe
- rank：form 30089 / lemma 8007 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「厌恶；憎恨」 / lemma「厌恶；憎恨」
- ECDICT：form「n. 非常讨厌, 嫌恶, 极不情愿」 / lemma「vt. 厌恶, 憎恶」
- **建议：`?`**

## squelching → squelch
- rank：form 30090 / lemma 41626 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出咕叽声；压制」 / lemma「压制；发出咕叽声」
- ECDICT：form「v. 发吧唧声, 发扑哧声( squelch的现在分词 ); <美>制止; 压制; 遏制」 / lemma「n. 嘎吱声, 压碎的一堆, 使对手哑口无言的话 vt. 压碎, 镇压, 使咯吱咯吱响 vi. 咯吱咯吱响, 涉水而过 …」
- **建议：`keep`**

## fras → fra
- rank：form 30175 / lemma 37650 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「弗拉斯（人名）」 / lemma「弗拉（人名/缩写）」
- ECDICT：form「(fra 的复数) abbr. 联邦铁路局（Federal Railroad Administration）；联邦储备法…」 / lemma「abbr. 联邦铁路局（Federal Railroad Administration）；联邦储备法（Federal R…」
- **建议：`keep`**

## plummeted → plummet
- rank：form 30176 / lemma 16000 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「骤降；暴跌（过去式）」 / lemma「垂直落下，暴跌」
- ECDICT：form「v. 垂直落下, 骤然跌落( plummet的过去式和过去分词 )」 / lemma「n. 测深锤, 铅坠 vi. 垂直落下」
- **建议：`?`**

## streamlined → streamline
- rank：form 30177 / lemma 40503 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流线型的；精简的」 / lemma「精简；使简化」
- ECDICT：form「a. 流线的, 流线型的, 集成一个整体的, 现代化了的, 精简了的, 合理化了的」 / lemma「n. 流线, 流线型 vt. 使成流线型, 使合理化」
- **建议：`keep`**

## predetermined → predetermine
- rank：form 30181 / lemma 17200 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「预先决定的；注定的」 / lemma「预先决定，注定」
- ECDICT：form「a. 业已决定的；先已决定的」 / lemma「vt. 预先决定, 预先查明 [经] 预定的, 先定的」
- **建议：`?`**

## scavenging → scavenge
- rank：form 30199 / lemma 36018 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「拾荒；搜寻（现在分词）」 / lemma「（在废弃物中）搜寻；食腐」
- ECDICT：form「[化] 除气; 除气法; 清除的 [医] 清除」 / lemma「vt. 打扫, 排除废气, 在...中找有用之物, 以...为食, 清除 vi. 清扫」
- **建议：`keep`**

## minos → mino
- rank：form 30203 / lemma 30817 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「米诺斯（希腊神话王）」 / lemma「美浓（日本地名）」
- ECDICT：form「[计] 米诺斯」 / lemma「n. 日本劳工阶级所穿的草制外衣」
- **建议：`keep`**

## remodeled → remodel
- rank：form 30232 / lemma 23685 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「改建；重塑（过去式）」 / lemma「改建；重塑」
- ECDICT：form「a. 改造的；改制的 v. 改造（remodel的过去式及过去分词）；重建」 / lemma「vt. 改造, 改型, 改变」
- **建议：`?`**

## slobbering → slobber
- rank：form 30251 / lemma 35923 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「流口水；垂涎（现在分词）」 / lemma「流口水；垂涎」
- ECDICT：form「[医] 垂涎」 / lemma「vi. 垂涎, 流口水, 情不自禁地说 vt. 流口水弄湿, 口齿不清地说, 处事马虎 n. 口水, 涎, 过分动情的话…」
- **建议：`keep`**

## descendents → descendent
- rank：form 30322 / lemma 36814 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「后裔；子孙（复数）」 / lemma「下降的；后代的」
- ECDICT：form「n. 后裔（descendent的复数）」 / lemma「a. 下降的, 降落的, 世袭的 [医] 下行的, 降的」
- **建议：`keep`**

## mementos → memento
- rank：form 30372 / lemma 17900 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「纪念品」 / lemma「纪念物，引起回忆的东西」
- ECDICT：form「n. 纪念品, 令人回忆的东西( memento的名词复数 )」 / lemma「n. 纪念物, 令人回忆的东西」
- **建议：`?`**

## felled → fell
- rank：form 30377 / lemma 602 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「砍倒；击倒」 / lemma「跌倒（fall的过去式）」
- ECDICT：form「v. 砍倒, 打倒( fell的过去式 ); 砍倒, 打倒( fell的过去式和过去分词 ); 来临; 成为」 / lemma「vt. 击倒 n. 一季所伐的木材, 折缝 a. 凶猛的, 可怕的 fall的过去式」
- **建议：`?`**

## florins → florin
- rank：form 30455 / lemma 46856 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「弗罗林（金币名）」 / lemma「弗罗林（旧币）」
- ECDICT：form「n. 弗罗林, 一种货币( florin的复数形式 )」 / lemma「n. 弗罗林(货币)」
- **建议：`keep`**

## rescuers → rescuer
- rank：form 30463 / lemma 39754 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「救援者；营救人员」 / lemma「救援者」
- ECDICT：form「n. 救援者（rescuer的复数）」 / lemma「n. 救助者」
- **建议：`keep`**

## diggs → digg
- rank：form 30511 / lemma 44531 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「迪格斯（人名）」 / lemma「掘客（新闻聚合网站）」
- ECDICT：form「(digg 的复数) abbr. 户推荐」 / lemma「abbr. 户推荐」
- **建议：`keep`**

## spurned → spurn
- rank：form 30515 / lemma 38272 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拒绝；摒弃（过去式）」 / lemma「拒绝；摒弃」
- ECDICT：form「v. 一脚踢开, 拒绝接受( spurn的过去式和过去分词 )」 / lemma「n. 踢开, 拒斥 vt. 踢开, 冷落, 践踏, 唾弃 vi. 藐视, 摒弃」
- **建议：`keep`**

## growers → grower
- rank：form 30622 / lemma 36000 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「种植者；栽培者（复数）」 / lemma「种植者；栽培者」
- ECDICT：form「雏」 / lemma「n. 栽培者, 生长物」
- **建议：`keep`**

## peepers → peeper
- rank：form 30640 / lemma 36854 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「眼睛（俚语，复数）」 / lemma「偷窥者；窥视者」
- ECDICT：form「n. 窥视者；私家侦探」 / lemma「n. 窥视者, 嘀咕的人, (非正式)眼睛, (美)(非正式)私家侦探」
- **建议：`keep`**

## seashells → seashell
- rank：form 30644 / lemma 41405 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「海贝壳（复数）」 / lemma「海贝壳」
- ECDICT：form「n. 贝壳, 海洋贝类(seashell的复数形式); 海中软体动物的壳, 贝壳( seashell的复数形式 )」 / lemma「n. 海贝壳」
- **建议：`keep`**

## eggshells → eggshell
- rank：form 30733 / lemma 32455 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「蛋壳」 / lemma「蛋壳；蛋壳色」
- ECDICT：form「n. 蛋壳, 易碎的东西( eggshell的复数形式 )」 / lemma「n. 蛋壳」
- **建议：`keep`**

## kickbacks → kickback
- rank：form 30760 / lemma 31588 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「回扣；佣金」 / lemma「回扣；佣金」
- ECDICT：form「n. 激烈反应( kickback的复数形式 ); 佣金, 回扣」 / lemma「n. 回答, 反扑, 退还 [电] 蹴后」
- **建议：`keep`**

## ex-girlfriends → ex-girlfriend
- rank：form 30774 / lemma 8021 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「前女友」 / lemma「前女友」
- ECDICT：form「(ex-girlfriend 的复数) 前女友」 / lemma「前女友」
- **建议：`keep`**

## fuming → fume
- rank：form 30776 / lemma 43391 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「愤怒的；冒烟的」 / lemma「烟；气体；发怒」
- ECDICT：form「[医] 熏的, 熏蒸的」 / lemma「n. 臭气, 烟, 激怒 vt. 熏 vi. 冒烟」
- **建议：`keep`**

## trojans → trojan
- rank：form 30809 / lemma 13483 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「特洛伊人；木马程序」 / lemma「特洛伊人；木马程序」
- ECDICT：form「n. 特洛伊木马, 木马程式；脱罗央群」 / lemma「a. 特洛伊的, 特洛伊人的 n. 特洛伊人, 勤勉的人, 勇士」
- **建议：`keep`**

## weekdays → weekday
- rank：form 30818 / lemma 31246 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「在工作日；平日」 / lemma「工作日（周一至周五）」
- ECDICT：form「adv. 在每个周日, 在平时每天」 / lemma「n. 周日, 平日 [计] 工作日」
- **建议：`keep`**

## mothering → mother
- rank：form 30827 / lemma 167 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「母亲般的照料」 / lemma「母亲」
- ECDICT：form「n. 省亲, 育儿」 / lemma「n. 母亲, 修女院长 vt. 产生, 照看, 收养」
- **建议：`?`**

## blockers → blocker
- rank：form 30832 / lemma 29530 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「阻碍物；阻断剂」 / lemma「阻挡者；阻断剂」
- ECDICT：form「n. 阻断剂; 护航者; 雏形锻模(blocker的复数形式)」 / lemma「[医] 阻滞物, 阻滞剂, 阻滞抗体」
- **建议：`keep`**

## pakistanis → pakistani
- rank：form 30836 / lemma 11993 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「巴基斯坦人」 / lemma「巴基斯坦的；巴基斯坦人」
- ECDICT：form「n. 巴基斯坦人（Pakistani的复数）」 / lemma「a. 巴基斯坦的 n. 巴基斯坦人」
- **建议：`keep`**

## waterways → waterway
- rank：form 30846 / lemma 35750 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「水道；航道」 / lemma「水路；航道」
- ECDICT：form「n. 水路, 航道( waterway的复数形式 ); 河渠」 / lemma「n. 航道, 水路 [法] 水道, 水路航道」
- **建议：`keep`**

## macaroons → macaroon
- rank：form 30873 / lemma 42754 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「蛋白杏仁饼」 / lemma「蛋白杏仁饼；马卡龙」
- ECDICT：form「n. 蛋白杏仁饼干」 / lemma「n. 蛋白杏仁饼干」
- **建议：`keep`**

## sandbags → sandbag
- rank：form 30874 / lemma 34730 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「沙袋」 / lemma「用沙袋堵；胁迫」
- ECDICT：form「n. 沙袋( sandbag的名词复数 ) v. 堆沙袋, 用沙袋打( sandbag的第三人称单数 )」 / lemma「n. 沙袋 vt. 堆沙袋于, 用沙袋打」
- **建议：`keep`**

## denser → dens
- rank：form 30942 / lemma 25590 ｜ type `r` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「更密集的」 / lemma「兽穴；书房（复数）」
- ECDICT：form「a. 密集的；浓厚的（dense的比较级） n. (Denser)人名；(英)登泽」 / lemma「[医] 牙, 齿」
- **建议：`keep`**

## insinuations → insinuation
- rank：form 31013 / lemma 38298 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「暗示；含沙射影」 / lemma「暗示；含沙射影」
- ECDICT：form「n. 暗示；暗讽；间接的讽刺」 / lemma「n. 暗示, 暗讽 [法] 暗指, 暗示, 暗讽」
- **建议：`keep`**

## cataracts → cataract
- rank：form 31063 / lemma 38793 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「白内障；大瀑布（cataract 复数）」 / lemma「白内障；大瀑布」
- ECDICT：form「n. 大瀑布( cataract的复数形式 ); <医>白内障」 / lemma「n. 大瀑布, 奔流, 暴雨, 白内障 [医] 内障, 白内障」
- **建议：`keep`**

## prussians → prussian
- rank：form 31088 / lemma 19493 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「普鲁士人」 / lemma「普鲁士的；普鲁士人」
- ECDICT：form「a. ☉普鲁士的；普鲁士人的 n. 普鲁士人；＝Old Prussian」 / lemma「a. 普鲁士的, 普鲁士语的, 普鲁士式的 n. 普鲁士人, 普鲁士语」
- **建议：`keep`**

## polaroids → polaroid
- rank：form 31117 / lemma 21150 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「宝丽来照片」 / lemma「宝丽来（品牌）」
- ECDICT：form「[光] 偏振片」 / lemma「n. 人造偏振片 [化] 偏振片」
- **建议：`keep`**

## zlotys → zloty
- rank：form 31121 / lemma 40643 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「兹罗提（波兰货币）」 / lemma「兹罗提（波兰货币）」
- ECDICT：form「(zloty 的复数) n. 兹罗提(波兰货币单位)」 / lemma「n. 兹罗提(波兰货币单位)」
- **建议：`keep`**

## schoolmates → schoolmate
- rank：form 31149 / lemma 34543 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「同学」 / lemma「同学；校友」
- ECDICT：form「n. 同学, 校友( schoolmate的复数形式 )」 / lemma「n. 同窗, 同学」
- **建议：`keep`**

## migs → mig
- rank：form 31155 / lemma 31925 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「米格战机」 / lemma「米格（战机/人名）」
- ECDICT：form「(Mig 的复数) n. 米格飞机」 / lemma「n. 米格飞机」
- **建议：`keep`**

## daffodils → daffodil
- rank：form 31197 / lemma 35986 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「水仙花」 / lemma「水仙花」
- ECDICT：form「n. 黄水仙, （黄）水仙花( daffodil的复数形式 )」 / lemma「n. 水仙花 a. 水仙花色的」
- **建议：`keep`**

## stds → std
- rank：form 31221 / lemma 18207 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「性传播疾病（缩写）」 / lemma「性传播疾病（缩写）」
- ECDICT：form「(STD 的复数) [计] 标准」 / lemma「[计] 标准」
- **建议：`keep`**

## strums → strum
- rank：form 31253 / lemma 34806 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「弹拨（吉他等）」 / lemma「弹拨（弦乐器）」
- ECDICT：form「v. （漫不经心地）弹（弦乐器）( strum的第三人称单数 ); （漫不经心地）弹拨」 / lemma「n. 弹拨(声) v. 漫不经心地弹, 漫不经心地奏」
- **建议：`keep`**

## sliders → slider
- rank：form 31280 / lemma 26311 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滑块；小汉堡」 / lemma「滑块；滑动器；小汉堡」
- ECDICT：form「(slider 的复数) [电] 滑动器」 / lemma「[电] 滑动器」
- **建议：`keep`**

## jesuits → jesuit
- rank：form 31307 / lemma 26466 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「耶稣会士」 / lemma「耶稣会士」
- ECDICT：form「n. 耶稣会；耶稣会士（Jesuit的复数）」 / lemma「n. 耶稣会信徒, 阴险的人, 阴谋家」
- **建议：`keep`**

## doctoring → doctor
- rank：form 31315 / lemma 265 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「篡改；行医」 / lemma「医生；博士」
- ECDICT：form「n. 刮除；医治」 / lemma「n. 医生, 博士 vt. 授以博士学位, 诊断, 修改 vi. 行医」
- **建议：`?`**

## instilled → instill
- rank：form 31356 / lemma 16100 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「逐渐灌输；徐徐培养」 / lemma「逐渐灌输；滴注」
- ECDICT：form「v. <美>逐渐使某人获得（某种可取的品质）, 逐步灌输( instill的过去式和过去分词 )」 / lemma「vt. 滴注, 慢慢地灌输」
- **建议：`?`**

## stadiums → stadium
- rank：form 31361 / lemma 5073 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「体育场（复数）」 / lemma「体育场；运动场」
- ECDICT：form「n. 体育馆；露天大型运动场（stadium的复数）」 / lemma「n. 露天大型运动场 [医] 期, 病期」
- **建议：`?`**

## ras → ra
- rank：form 31420 / lemma 5629 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「（缩写）拉斯；埃塞俄比亚王子」 / lemma「拉（埃及太阳神）」
- ECDICT：form「[计] 行地址选通」 / lemma「正规陆军(美国), (英国)皇家艺术学会, 常备军, 正规军 [计] 重复地址」
- **建议：`keep`**

## stipulated → stipulate
- rank：form 31427 / lemma 35011 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「规定；约定（过去式）」 / lemma「规定；约定」
- ECDICT：form「vt.& vi. 规定; 约定 a. [法]合同规定的」 / lemma「v. 规定, 保证」
- **建议：`keep`**

## wetlands → wetland
- rank：form 31459 / lemma 44985 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「湿地（复数）」 / lemma「湿地」
- ECDICT：form「n. 潮湿的土壤, 沼泽地( wetland的复数形式 )」 / lemma「n. 湿地, 沼泽地 [经] 湿地」
- **建议：`keep`**

## incited → incite
- rank：form 31481 / lemma 15000 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「煽动；激起」 / lemma「煽动；鼓动」
- ECDICT：form「v. 刺激, 激励, 煽动( incite的过去式和过去分词 )」 / lemma「vt. 刺激, 激励, 引诱 [法] 鼓动, 煽动」
- **建议：`?`**

## unger → ung
- rank：form 31536 / lemma 39512 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「昂格尔（姓氏）」 / lemma「翁（姓氏/音译）」
- ECDICT：form「n. 昂格尔（姓名）」 / lemma「n. (Ung)人名；(柬)黄(用于名字第一节), 翁；(瑞典、匈)翁格 abbr. （拉）软膏（unguentum, …」
- **建议：`keep`**

## blowed → blow
- rank：form 31579 / lemma 8034 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「吹（blow 的方言过去式）」 / lemma「吹；刮（风）」
- ECDICT：form「blow的过去式或过去分词」 / lemma「n. 吹, 打击, 殴打, 花开 v. 吹, 风吹, 吹响, 开花」
- **建议：`?`**

## grouping → group
- rank：form 31611 / lemma 574 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分组；归类」 / lemma「组；群体」
- ECDICT：form「n. 分组 [计] 组」 / lemma「n. 团体, 组, 团, 群 v. 聚合, 成群 [计] 创建组; 组, 用户组」
- **建议：`?`**

## pinged → ping
- rank：form 31632 / lemma 6576 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出砰声；发送信息」 / lemma「砰声；网络延迟信号」
- ECDICT：form「v. <非正>发出砰的声响( ping的过去式和过去分词 )」 / lemma「n. 砰(子弹击中时的声音), 报时的最后一声, 声脉冲 vi. 砰(铛)地发声 [计] internet网络包测程序,…」
- **建议：`?`**

## usted → ust
- rank：form 31786 / lemma 15491 ｜ type `d` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「您（西班牙语）」 / lemma「乌斯特（人名/缩写）」
- ECDICT：form「(ust 的过去分词) abbr. 圣托马斯大学（University of Santo Tomas的缩写）；台湾联合大…」 / lemma「abbr. 圣托马斯大学（University of Santo Tomas的缩写）；台湾联合大学系统；无烟烟草生产商」
- **建议：`keep`**

## electrolytes → electrolyte
- rank：form 31820 / lemma 46790 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电解质」 / lemma「电解质；电解液」
- ECDICT：form「n. <化>电解液, 电解质( electrolyte的复数形式 )」 / lemma「n. 电解物, 电解质, 电解液 [化] 电解质」
- **建议：`keep`**

## ips → ip
- rank：form 31883 / lemma 10900 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「知识产权（缩写）」 / lemma「知识产权；网际协议」
- ECDICT：form「[计] 英寸/秒」 / lemma「[计] 初始排列, 指令指示器, 互连网协议」
- **建议：`keep`**

## downloads → download
- rank：form 31885 / lemma 7535 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「下载」 / lemma「下载」
- ECDICT：form「n. 下载（download的复数）」 / lemma「[计] 卸载, 下栽」
- **建议：`keep`**

## serfs → serf
- rank：form 31889 / lemma 33489 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「农奴」 / lemma「农奴」
- ECDICT：form「n. 农奴, 奴隶( serf的复数形式 ); 像农奴般遭受奴役的人」 / lemma「n. 农奴, 奴隶, 服苦役的人」
- **建议：`keep`**

## appropriations → appropriation
- rank：form 31909 / lemma 42722 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「拨款；挪用」 / lemma「挪用；拨款；占用」
- ECDICT：form「n. 挪用（appropriation的复数形式）」 / lemma「n. 拨用, 挪用, 拨款 [经] 拨款, 挪用」
- **建议：`keep`**

## jefferies → jeffery
- rank：form 31922 / lemma 32197 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「杰弗里斯（人名）」 / lemma「杰弗里（人名）」
- ECDICT：form「杰弗里斯（男子名）」 / lemma「n. 杰弗里（人名）」
- **建议：`keep`**

## gillies → gilly
- rank：form 31987 / lemma 20200 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「（姓氏）吉利斯」 / lemma「吉利（人名/昵称）」
- ECDICT：form「(Gilly 的第三人称 -s形式) n.侍从, 男仆」 / lemma「n. 侍从, 男仆」
- **建议：`keep`**

## rinds → rind
- rank：form 31999 / lemma 33776 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「外皮；果皮」 / lemma「外皮；果皮」
- ECDICT：form「n. （瓜、果等的）皮( rind的复数形式 ); 外皮; （干酪等）外皮; 硬皮」 / lemma「n. 树皮, 壳, 外表 vt. 削皮, 剥壳」
- **建议：`keep`**

## syrians → syrian
- rank：form 32069 / lemma 15666 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「叙利亚人」 / lemma「叙利亚的；叙利亚人」
- ECDICT：form「n. 叙利亚人（Syrian的复数）」 / lemma「n. 叙利亚人, 叙利亚语 a. 叙利亚语的, 叙利亚人的」
- **建议：`keep`**

## beheld → behold
- rank：form 32082 / lemma 4886 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「看见；注视（behold 过去式）」 / lemma「看；注视」
- ECDICT：form「behold的过去式和过去分词」 / lemma「vt. 看到, 注视 vi. 看」
- **建议：`?`**

## skitters → skitter
- rank：form 32162 / lemma 42520 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「轻快地跑动（第三人称单数）」 / lemma「轻快地跑动；掠过」
- ECDICT：form「v. 掠过水面, 沿水面拉动鱼钩钓鱼, 使掠过水面( skitter的第三人称单数 )」 / lemma「vi. 飞掠而过, 蹦跳 vt. 使掠过水面」
- **建议：`keep`**

## amphibians → amphibian
- rank：form 32171 / lemma 34732 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「两栖动物（复数）」 / lemma「两栖动物」
- ECDICT：form「n. 两栖动物( amphibian的复数形式 ); 水陆两用车; 水旱两生植物; 水陆两用飞行器」 / lemma「a. 两栖类的, 水陆两用的 n. 两栖动物, 水旱两生植物, 水陆两用飞机」
- **建议：`keep`**

## scalding → scald
- rank：form 32204 / lemma 47437 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「滚烫的；灼热的」 / lemma「烫伤；烫洗」
- ECDICT：form「a. 滚烫的, 将近沸腾的, 沸腾的, 灼人的, 尖锐辛辣的 [化] 烫伤」 / lemma「n. 烫伤, 烫洗 v. 烫伤, 烫洗」
- **建议：`keep`**

## cloves → clove
- rank：form 32225 / lemma 33558 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「丁香（香料）」 / lemma「丁香；蒜瓣」
- ECDICT：form「n. [植物]丁香, 公丁香（clove的复数）」 / lemma「n. 丁香 cleave的过去式」
- **建议：`keep`**

## pandering → pander
- rank：form 32227 / lemma 38791 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「迎合；纵容」 / lemma「迎合；纵容」
- ECDICT：form「v. 迎合（他人的低级趣味或淫欲）( pander的现在分词 ); 纵容某人; 迁就某事物」 / lemma「vi. 勾引, 怂恿, 卑劣地迎合 n. 拉皮条者, 怂恿者, 助恶者」
- **建议：`keep`**

## coles → cole
- rank：form 32233 / lemma 2812 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「科尔斯（姓氏/品牌）」 / lemma「科尔（姓氏/男子名）」
- ECDICT：form「[医] 阴茎」 / lemma「n. 芸苔属植物, 海甘蓝」
- **建议：`keep`**

## neutered → neuter
- rank：form 32264 / lemma 41650 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「阉割；使无效」 / lemma「中性的；无性的」
- ECDICT：form「n. 无性动物；中性名词；阉割动物 a. 中性的；不及物的；无性的」 / lemma「a. 中性的, 不及物的, 生殖器不完全的 n. 中性词, 无性动物, 阉割动物」
- **建议：`keep`**

## razed → raze
- rank：form 32275 / lemma 34663 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「夷平；摧毁」 / lemma「夷平；彻底摧毁」
- ECDICT：form「v. 彻底摧毁, 将…夷为平地( raze的过去式和过去分词 )」 / lemma「vt. 毁灭, 刮去, 把...夷为平地, 消除, 抹去, 破坏」
- **建议：`keep`**

## romanians → romanian
- rank：form 32315 / lemma 12229 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「罗马尼亚人」 / lemma「罗马尼亚的；罗马尼亚人」
- ECDICT：form「a. 罗马尼亚的；罗马尼亚人的 n. 罗马尼亚人；罗马尼亚语」 / lemma「n. 罗马尼亚人, 罗马尼亚语 a. 罗马尼亚的」
- **建议：`keep`**

## roofing → roof
- rank：form 32333 / lemma 4875 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「屋顶材料；盖屋顶」 / lemma「屋顶；车顶」
- ECDICT：form「n. 盖屋顶」 / lemma「n. 屋顶, 室顶 vt. 给...盖屋顶, 遮蔽」
- **建议：`?`**

## extradited → extradite
- rank：form 32337 / lemma 15200 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「引渡」 / lemma「引渡（逃犯等）」
- ECDICT：form「v. 引渡( extradite的过去式和过去分词 )」 / lemma「vt. 引渡, 获取(逃犯等)的引渡 [法] 引渡, 使被引渡」
- **建议：`?`**

## patronising → patronise
- rank：form 32379 / lemma 35978 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「居高临下的；屈尊的」 / lemma「以高人一等的态度对待；光顾」
- ECDICT：form「vt. （英）保护（等于patronize）」 / lemma「vt. 庇护, 资助, 赞助, 保护, 光顾, 惠顾, 对...以恩人自居」
- **建议：`keep`**

## contours → contour
- rank：form 32380 / lemma 33845 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「轮廓；等高线」 / lemma「轮廓；等高线」
- ECDICT：form「n. 外形, 轮廓( contour的名词复数 ); 地图上表示相同海拔各点的)等高线」 / lemma「n. 轮廓 vt. 画轮廓 a. 显示轮廓的 [计] 轮廓」
- **建议：`keep`**

## conked → conk
- rank：form 32412 / lemma 41630 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（口）昏睡；敲击头部」 / lemma「敲击头部；昏倒」
- ECDICT：form「a. 出故障的, 停止的」 / lemma「n. 鼻, 头 vi. 坏掉, 出毛病, 昏迷 vt. 敲...的头」
- **建议：`keep`**

## telecommunications → telecommunication
- rank：form 32431 / lemma 44824 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「电信」 / lemma「电信」
- ECDICT：form「n. 电信, 通讯, 电信学 [电] 电通信」 / lemma「n. 电讯, 远距离通讯, 无线电通讯 [计] 远程通信, 电信」
- **建议：`keep`**

## idolized → idolize
- rank：form 32466 / lemma 43243 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「崇拜；极度喜爱（过去式）」 / lemma「崇拜；偶像化」
- ECDICT：form「v. 将（某人）当作偶像崇拜( idolize的过去式和过去分词 )」 / lemma「vt. 把...当偶像崇拜, 极端崇拜, 醉心于 vi. 崇拜偶像」
- **建议：`keep`**

## tailoring → tailor
- rank：form 32474 / lemma 7373 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「裁缝业；定制」 / lemma「裁缝」
- ECDICT：form「n. 裁缝业, 做衣服, 成衣, 剪裁, 制作」 / lemma「n. 裁缝, 成衣匠 vt. 缝制, 制作, 使适应 vi. 做裁缝」
- **建议：`?`**

## balling → ball
- rank：form 32557 / lemma 6252 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「成球；狂欢（俚语）」 / lemma「球」
- ECDICT：form「[化] 成球」 / lemma「n. 球, 舞会, 球状物 v. 捏成球形」
- **建议：`?`**

## downsizing → downsize
- rank：form 32561 / lemma 46762 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「裁员；缩小规模」 / lemma「裁员；缩小规模」
- ECDICT：form「[计] 小型化」 / lemma「vt. 以较小尺寸设计；缩小尺寸；裁减人数」
- **建议：`keep`**

## hibernating → hibernate
- rank：form 32562 / lemma 35403 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「冬眠；蛰伏」 / lemma「冬眠」
- ECDICT：form「v. （某些动物）冬眠, 蛰伏( hibernate的现在分词 )」 / lemma「vi. 过冬, 冬眠, 避寒」
- **建议：`keep`**

## enthralled → enthrall
- rank：form 32567 / lemma 16800 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「着迷的；被吸引的」 / lemma「迷住，使着迷」
- ECDICT：form「v. 迷住, 吸引住( enthrall的过去式和过去分词 ); 使感到非常愉快」 / lemma「vt. 迷惑, 奴役, 迷住」
- **建议：`?`**

## begets → beget
- rank：form 32577 / lemma 35432 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「产生；引起；生育」 / lemma「产生；生育」
- ECDICT：form「v. <文>为…之生父( beget的第三人称单数 ); 产生, 引起」 / lemma「vt. 为某人之生父, 招致, 产生, 引起」
- **建议：`keep`**

## caesars → caesar
- rank：form 32583 / lemma 3424 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「凯撒（人名/酒店品牌）」 / lemma「凯撒」
- ECDICT：form「n. 凯撒大帝；独裁者」 / lemma「n. 恺撒, 暴君」
- **建议：`keep`**

## ccs → cc
- rank：form 32600 / lemma 10798 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「碳捕集与封存（缩写）」 / lemma「抄送；毫升」
- ECDICT：form「[化] 中国化学会」 / lemma「复写本 [计] 中央计算机, 中央控制台, 通道命令, 通信中心, 条件码, 循环检验, 抄送」
- **建议：`keep`**

## welling → well
- rank：form 32629 / lemma 1640 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「涌出；涌起（现在分词）」 / lemma「好地；健康的」
- ECDICT：form「n. 威林（姓氏）；威灵电机（商品名称）」 / lemma「n. 井, 泉水, 源泉, 好 v. 涌出 a. 健康的, 良好的, 适宜的, 恰当的 adv. 很好地, 适当地, 好…」
- **建议：`?`**

## mos → mo
- rank：form 32637 / lemma 3205 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「月份（缩写）；巨量」 / lemma「莫（人名缩写）；瞬间」
- ECDICT：form「[计] 管理操作系统, 金属氧化物半导体」 / lemma「n. 顷刻, 瞬间, 函购, 邮购, 军医, 军医主任, 汇票, 邮政汇票 [化] 分子轨道」
- **建议：`keep`**

## lowing → low
- rank：form 32667 / lemma 1450 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「牛哞哞叫（现在分词）」 / lemma「低的（地）」
- ECDICT：form「n. 牛鸣」 / lemma「n. 低点, 低价, 低, 牛叫声 a. 低的, 消沉的, 低等的, 浅的, 卑贱的 adv. 低下地, 谦卑地, 低 …」
- **建议：`?`**

## comming → com
- rank：form 32751 / lemma 6612 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「来（come 的变体拼写）」 / lemma「网站域名后缀；公司」
- ECDICT：form「(COM 的现在分词) [计] 计算机输出缩微胶片; 计算机输出胶片缩微机」 / lemma「[计] 计算机输出缩微胶片; 计算机输出胶片缩微机」
- **建议：`keep`**

## zoned → zone
- rank：form 32757 / lemma 1845 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「（口语）走神的；分区的」 / lemma「地带；区域」
- ECDICT：form「a. 佩带象征处女的环带的, 划成区带的, 处女(般)的」 / lemma「n. 地带, 带, 地区 vt. 环绕, 使分成地带 vi. 分成区 [计] 卡片顶部的三行区; 区; 区域」
- **建议：`?`**

## offing → off
- rank：form 32770 / lemma 97 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「附近；即将发生」 / lemma「离开；关闭」
- ECDICT：form「n. 海面, 离岸距离」 / lemma「a. 关着的, 不再生效的, 处于...境况的, 休假的, 空闲的 adv. 走开, ...掉, ...下, 休息, 出…」
- **建议：`?`**

## harbors → harbor
- rank：form 32806 / lemma 4195 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「港口；避难所」 / lemma「港口；避难所」
- ECDICT：form「n. 海港( harbor的名词复数 ); 海湾; 避难所; 躲藏处」 / lemma「n. 港, 避难所 v. 庇护, 藏匿, (使)入港停泊」
- **建议：`?`**

## toros → toro
- rank：form 32874 / lemma 14588 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「公牛（西班牙语复数）」 / lemma「托罗（姓氏/公牛）」
- ECDICT：form「(toro 的复数) n. （斗牛用的）公牛」 / lemma「n. （斗牛用的）公牛」
- **建议：`keep`**

## transitioning → transition
- rank：form 32975 / lemma 5000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「过渡；转变」 / lemma「过渡，转变」
- ECDICT：form「转向（transition的现在分词） 过渡（transition的现在分词）」 / lemma「n. 转变, 转换, 变迁, 过渡时期, 临时转调 [化] 跃迁」
- **建议：`?`**

## dissed → diss
- rank：form 33037 / lemma 31538 ｜ type `p` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「侮辱；轻视」 / lemma「侮辱；贬低（俚语）」
- ECDICT：form「v. 羞辱（diss的过去分词）」 / lemma「迪丝草纤维」
- **建议：`keep`**

## ensuing → ensue
- rank：form 33060 / lemma 41370 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「随后的；接着的」 / lemma「接着发生；随之而来」
- ECDICT：form「a. 接著发生的」 / lemma「vi. 跟着发生, 继起 vt. 追求」
- **建议：`keep`**

## glitches → glitch
- rank：form 33109 / lemma 12551 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小故障；小毛病」 / lemma「小故障；小毛病」
- ECDICT：form「n. 小过失, 差错( glitch的复数形式 )」 / lemma「[计] 假信号」
- **建议：`keep`**

## pocketed → pocket
- rank：form 33115 / lemma 5160 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「把…据为己有；装入口袋」 / lemma「口袋；衣兜」
- ECDICT：form「[体]运动员被挤在人群里」 / lemma「n. 口袋, 钱袋, 钱, 容器 vt. 装...在口袋里, 隐藏, 抑制, 私吞, 搁置, 击...入袋 a. 袖珍的…」
- **建议：`?`**

## pixels → pixel
- rank：form 33141 / lemma 34670 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「像素（复数）」 / lemma「像素」
- ECDICT：form「n. 像素；像素点（pixel的复数）」 / lemma「n. 像素 [计] 象素」
- **建议：`keep`**

## x-rayed → x-ray
- rank：form 33152 / lemma 5125 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「用 X 光检查」 / lemma「X射线；X光片」
- ECDICT：form「v. 照X光( x-ray的过去式 )」 / lemma「a. X射线的 vt. 用X光检查, 照X光 vi. 使用X光」
- **建议：`?`**

## texans → texan
- rank：form 33195 / lemma 25540 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「得克萨斯人」 / lemma「得克萨斯人」
- ECDICT：form「n. 德克萨斯人（Texan的复数形式）；德州人队（足球队名）」 / lemma「a. 得克萨斯州的 n. 得克萨斯州的人, 得克萨斯人」
- **建议：`keep`**

## bungled → bungle
- rank：form 33218 / lemma 43490 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「搞砸；弄糟」 / lemma「搞砸；笨手笨脚地做」
- ECDICT：form「v. 搞糟, 完不成( bungle的过去式和过去分词 ); 笨手笨脚地做; 失败; 完不成」 / lemma「v. 拙劣地工作, 粗制滥造, 把...搞糟 n. 粗劣, 失误, 笨拙」
- **建议：`keep`**

## customized → customize
- rank：form 33304 / lemma 43962 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「定制的；个性化的」 / lemma「定制；按需修改」
- ECDICT：form「n. 自定义；客制化；自定义级别」 / lemma「vt. 定制, 按规格改制, 定做 [计] 定制」
- **建议：`keep`**

## doting → dote
- rank：form 33310 / lemma 39220 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「溺爱的；偏爱的」 / lemma「溺爱；昏聩」
- ECDICT：form「a. 偏爱的, 溺爱的」 / lemma「vi. 昏聩, 溺爱」
- **建议：`keep`**

## rainforests → rainforest
- rank：form 33321 / lemma 13558 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「热带雨林」 / lemma「雨林」
- ECDICT：form「n. （热带）雨林( rainforest的复数形式 )」 / lemma「[生态]雨林」
- **建议：`keep`**

## opiates → opiate
- rank：form 33387 / lemma 33426 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「鸦片制剂；麻醉剂」 / lemma「鸦片制剂；麻醉剂」
- ECDICT：form「n. 鸦片制剂（通常用于镇痛或催眠）( opiate的复数形式 ); 缓和, 减轻」 / lemma「n. 鸦片制剂, 镇静剂 a. 含鸦片的, 催眠的 vt. 使麻醉, 使缓和」
- **建议：`keep`**

## teleported → teleport
- rank：form 33396 / lemma 14426 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「瞬间移动；远距传送」 / lemma「瞬间移动；传送」
- ECDICT：form「v. （心灵学用语）心灵运输（物体、人）( teleport的过去式和过去分词 )」 / lemma「vt.(心灵学用语)心灵运输(物体、人)」
- **建议：`?`**

## inhibited → inhibit
- rank：form 33403 / lemma 35189 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「拘谨的；受抑制的」 / lemma「抑制；阻止」
- ECDICT：form「a. 抑制情感的, 约束行动的 [计] 禁止的, 抑制的」 / lemma「vt. 禁止, 抑制 vi. 起抑制作用」
- **建议：`keep`**

## lemmings → lemming
- rank：form 33406 / lemma 41245 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「旅鼠；盲从者」 / lemma「旅鼠；盲从者」
- ECDICT：form「n. 旅鼠( lemming的复数形式 )」 / lemma「n. 旅鼠」
- **建议：`keep`**

## shrunken → shrink
- rank：form 33420 / lemma 4330 ｜ type `d` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「皱缩的；缩小的」 / lemma「收缩；退缩」
- ECDICT：form「a. 缩小的 shrink的过去分词」 / lemma「n. 收缩, 萎缩, 回避 vi. 收缩, 退缩, 萎缩, 缩小, 回避 vt. 使收缩, 使缩小」
- **建议：`?`**

## yammering → yammer
- rank：form 33421 / lemma 47715 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「不停抱怨；喋喋不休」 / lemma「抱怨；喋喋不休」
- ECDICT：form「v. 叹息, 哭泣, 抱怨( yammer的现在分词 )」 / lemma「vi. 哀号, 哭泣, 嗥叫 vt. 抱怨 n. 哭诉, 废话」
- **建议：`keep`**

## booed → boo
- rank：form 33443 / lemma 3209 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「发出嘘声；喝倒彩」 / lemma「嘘（表示不满）」
- ECDICT：form「v. 发出嘘声( boo的过去式和过去分词 )」 / lemma「v. 嘘(某人), 喝倒彩 interj. 嘘」
- **建议：`?`**

## overlay → overlie
- rank：form 33447 / lemma 16900 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「覆盖；叠加」 / lemma「躺在……上面，覆盖在……之上」
- ECDICT：form「n. 覆盖, 覆盖图, 使负担过重 overlie的过去式 [计] 覆盖, 覆盖图」 / lemma「vt. 躺在...上面, 压在...上面, 盖得使窒息, 压得...闷死」
- **建议：`?`**

## thunderbirds → thunderbird
- rank：form 33464 / lemma 15755 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「雷鸟；雷霆鸟（神话/剧名）」 / lemma「雷鸟（神话/品牌）」
- ECDICT：form「[电影]雷鸟惊航」 / lemma「interj. 妙哇!」
- **建议：`keep`**

## strolled → stroll
- rank：form 33476 / lemma 5829 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「漫步；闲逛」 / lemma「散步；闲逛」
- ECDICT：form「vi. 散步（stroll的过去式形式）」 / lemma「n. 闲逛, 漫步 v. 闲逛, 漫步」
- **建议：`?`**

## stirrups → stirrup
- rank：form 33504 / lemma 40012 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「马镫」 / lemma「马镫；镫骨」
- ECDICT：form「n. 马蹬( stirrup的复数形式 )」 / lemma「n. 马镫, 镫具, U形物 [化] 钢箍」
- **建议：`keep`**

## athenians → athenian
- rank：form 33505 / lemma 28041 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「雅典人」 / lemma「雅典人；雅典的」
- ECDICT：form「n. 雅典人」 / lemma「n. 雅典人 a. 雅典的, 雅典人的」
- **建议：`keep`**

## canvassed → canvas
- rank：form 33512 / lemma 6794 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「游说；拉票；调查」 / lemma「帆布；画布」
- ECDICT：form「v. （在政治方面）游说( canvass的过去式和过去分词 ); 调查（如选举前选民的）意见; 为讨论而提出（意见等）…」 / lemma「n. 帆布, 画布, 油画 [化] 帆布」
- **建议：`?`**

## canvassed → canvass
- rank：form 33512 / lemma 16210 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「游说；拉票；调查」 / lemma「拉票；游说；调查」
- ECDICT：form「v. （在政治方面）游说( canvass的过去式和过去分词 ); 调查（如选举前选民的）意见; 为讨论而提出（意见等）…」 / lemma「n. 细查, 讨论, 游说 vt. 彻底检查, 向...拉票或拉生意, 讨论 vi. 游说」
- **建议：`?`**

## resurfaced → resurface
- rank：form 33550 / lemma 38727 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「重新出现；重铺路面」 / lemma「重新出现；重铺路面」
- ECDICT：form「v. 给（路等）铺设新路面( resurface的过去式和过去分词 ); 重新升至表面, 重新露面」 / lemma「vi. 重铺路面 vi. 重新露面」
- **建议：`keep`**

## brigands → brigand
- rank：form 33596 / lemma 39107 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「强盗；土匪（复数）」 / lemma「强盗；土匪」
- ECDICT：form「n. 土匪, 强盗( brigand的复数形式 )」 / lemma「n. 土匪, 强盗 [法] 土匪, 盗贼」
- **建议：`keep`**

## cruelest → cruel
- rank：form 33613 / lemma 1560 ｜ type `t` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「最残忍的」 / lemma「残酷的；残忍的」
- ECDICT：form「a. 残酷的；残忍的；残暴的；故意使别人遭受痛苦的；以他人的痛苦为乐的；令人痛苦的」 / lemma「a. 残酷的, 令人极痛苦的 [法] 残忍的, 残酷的」
- **建议：`?`**

## zealots → zealot
- rank：form 33718 / lemma 38188 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「狂热者；极端分子」 / lemma「狂热者；极端分子」
- ECDICT：form「n. 热心者, 狂热者( zealot的复数形式 )」 / lemma「n. 热心者, 狂热者, 犹太教狂热信徒 [法] 狂热分子, 激烈分子」
- **建议：`keep`**

## saudis → saudi
- rank：form 33736 / lemma 10756 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「沙特阿拉伯人（复数）」 / lemma「沙特阿拉伯的」
- ECDICT：form「沙特阿拉伯人的（Saudi的名词复数） 沙特阿拉伯国家的（Saudi的名词复数）」 / lemma「a. 沙乌地阿拉伯（人或语）的」
- **建议：`keep`**

## cartwheels → cartwheel
- rank：form 33757 / lemma 39578 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「侧手翻（复数）」 / lemma「侧手翻；车轮」
- ECDICT：form「n. （大车）车轮( cartwheel的名词复数 ); 侧手翻, 侧身筋斗」 / lemma「n. 车轮(货车的车轮), 侧手翻」
- **建议：`keep`**

## waltzes → waltz
- rank：form 33784 / lemma 2880 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「华尔兹舞曲（复数）」 / lemma「华尔兹；跳华尔兹」
- ECDICT：form「n. 华尔兹舞( waltz的名词复数 ); 华尔兹舞曲 v. 与…跳华尔兹舞( waltz的第三人称单数 ); 强拉,…」 / lemma「n. 华尔兹舞, 圆舞曲 a. 华尔兹舞的, 圆舞曲的 vi. 跳华尔兹舞, 轻快地走动 vt. 与...跳华尔兹舞, …」
- **建议：`?`**

## sickened → sicken
- rank：form 33789 / lemma 37105 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使厌恶；生病（过去式）」 / lemma「使恶心；生病」
- ECDICT：form「v. （使）生病( sicken的过去式和过去分词 ); 使厌恶, 使恶心」 / lemma「vt. 患病, 使厌倦, 使恶心 vi. 生病, 作呕」
- **建议：`keep`**

## jazzed → jaz
- rank：form 33866 / lemma 33800 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper, homograph`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「兴奋的；热情的」 / lemma「爵士（人名/音乐简称）」
- ECDICT：form「vt. 把…奏成爵士音乐（jazz的过去式与过去分词形式）」 / lemma「n. (Jaz)人名；(苏丹)贾兹」
- **建议：`keep`**

## jazzed → jazz
- rank：form 33866 / lemma 2824 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「兴奋的；热情的」 / lemma「爵士乐」
- ECDICT：form「vt. 把…奏成爵士音乐（jazz的过去式与过去分词形式）」 / lemma「n. 爵士乐, 喧闹 a. 爵士乐的, 喧吵的 vi. 演奏爵士乐, 跳爵士舞, 游荡 vt. 奏爵士乐, 使活泼」
- **建议：`?`**

## dissing → diss
- rank：form 33867 / lemma 31538 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「侮辱；贬低（俚语）」 / lemma「侮辱；贬低（俚语）」
- ECDICT：form「v. 迪丝草纤维( diss的现在分词 )」 / lemma「迪丝草纤维」
- **建议：`keep`**

## treetops → treetop
- rank：form 33895 / lemma 42158 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「树梢」 / lemma「树梢」
- ECDICT：form「n. 树稍( treetop的复数形式 )」 / lemma「n. 树稍」
- **建议：`keep`**

## yrs → yr
- rank：form 33900 / lemma 42162 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「年（years 缩写）」 / lemma「年（year 缩写）」
- ECDICT：form「abbr. 年（years）；你们的（yours）」 / lemma「[计] 年 [经] 年」
- **建议：`keep`**

## frolicking → frolic
- rank：form 33919 / lemma 23254 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嬉戏」 / lemma「嬉戏；欢闹」
- ECDICT：form「v. 嬉戏( frolic的现在分词 )」 / lemma「n. 嬉戏 vi. 嬉戏 a. 嬉戏的, 欢乐的」
- **建议：`?`**

## majoring → major
- rank：form 33943 / lemma 12100 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「主修」 / lemma「主要的；重大的」
- ECDICT：form「major（以…为专业）的现在分词形式」 / lemma「n. 主修课, 成年人, 陆军少校 a. 主要的, 较多的, 大部分的, 成年的, 严重的 vi. 主修 [计] 主要,…」
- **建议：`?`**

## alles → alle
- rank：form 34039 / lemma 39620 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「一切（德语）」 / lemma「（德语）林荫道」
- ECDICT：form「(alle 的复数) n. 政府彩票组织国际协会；阿莱（电影名称）」 / lemma「n. 政府彩票组织国际协会；阿莱（电影名称）」
- **建议：`keep`**

## firewalls → firewall
- rank：form 34105 / lemma 16559 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「防火墙（复数）」 / lemma「防火墙」
- ECDICT：form「(firewall 的复数) [计] 放火墙, 隔离」 / lemma「[计] 放火墙, 隔离」
- **建议：`keep`**

## pedaling → pedal
- rank：form 34109 / lemma 12200 ｜ type `i` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「踩踏板；骑车」 / lemma「足的；脚踏的」
- ECDICT：form「vt.& vi. 踩自行车的踏板（pedal的现在分词形式）」 / lemma「n. 踏板, 脚蹬子 a. 脚的, 脚踏的 vt. 用脚踏动 vi. 踩踏板, 骑车」
- **建议：`?`**

## rivets → rivet
- rank：form 34175 / lemma 38324 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「铆钉」 / lemma「铆钉；吸引」
- ECDICT：form「n. 铆钉( rivet的名词复数 ) v. 铆接( rivet的第三人称单数 ); 把…固定住; 吸引; 引起某人的注…」 / lemma「n. 铆钉 vt. 用铆钉固定, 敲进去, 注目, 吸引住」
- **建议：`keep`**

## ensued → ensue
- rank：form 34214 / lemma 41370 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「接着发生；随之而来」 / lemma「接着发生；随之而来」
- ECDICT：form「v. 接着发生, 因而产生( ensue的过去式和过去分词 )」 / lemma「vi. 跟着发生, 继起 vt. 追求」
- **建议：`keep`**

## analyses → analyse
- rank：form 34303 / lemma 18398 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分析（analysis的复数）」 / lemma「分析」
- ECDICT：form「pl. 分析, 检验, 解析, 分解」 / lemma「vt. 分析, 细察, 分解 [经] 分析」
- **建议：`?`**

## analyses → analysis
- rank：form 34303 / lemma 3217 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分析（analysis的复数）」 / lemma「分析；解析」
- ECDICT：form「pl. 分析, 检验, 解析, 分解」 / lemma「n. 分析 [计] 分析机; 分析员; 分析; 分析程序」
- **建议：`?`**

## tutored → tutor
- rank：form 34320 / lemma 6627 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「辅导；指导（过去式）」 / lemma「导师；家庭教师」
- ECDICT：form「v. 当家庭教师( tutor的过去式和过去分词 ); 任大学导师; 任课」 / lemma「n. 家庭教师, 导师, 助教, 监护人 vt. 当...的教师, 教, 指导, 约束, 克制 vi. 当家庭教师, 受…」
- **建议：`?`**

## semi-finals → semi-final
- rank：form 34326 / lemma 36460 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「半决赛」 / lemma「半决赛」
- ECDICT：form「n. 半决赛( semi-final的复数形式 )」 / lemma「n. 半决赛; 准决赛; 复赛」
- **建议：`keep`**

## hrs → hr
- rank：form 34329 / lemma 12837 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「小时（hours缩写）」 / lemma「小时（hour 缩写）」
- ECDICT：form「abbr. 高分辨率光谱仪（High Resolution Spectrometer）」 / lemma「[经] 小时」
- **建议：`keep`**

## cohorts → cohort
- rank：form 34400 / lemma 45007 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「一群同伴；同伙」 / lemma「一群；同批人」
- ECDICT：form「n. 军团; （古罗马军队的）步兵大队( cohort的复数形式 ); 一群人; 同伙; 支持者」 / lemma「n. 一群；步兵大队；支持者；共同特点的一群人」
- **建议：`keep`**

## outdid → outdo
- rank：form 34500 / lemma 31763 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「胜过；超越（过去式）」 / lemma「胜过；超越」
- ECDICT：form「outdo的过去式」 / lemma「vt. 超越, 胜过, 战胜」
- **建议：`?`**

## tassels → tassel
- rank：form 34531 / lemma 40830 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「流苏；穗」 / lemma「流苏；穗」
- ECDICT：form「n. 流苏（tassel的复数形式）」 / lemma「n. 流苏, 缨, 穗 vt. 装缨于, 摘下...穗 vi. 抽穗」
- **建议：`keep`**

## bulgarians → bulgarian
- rank：form 34609 / lemma 16168 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「保加利亚人（复数）」 / lemma「保加利亚的；保加利亚人」
- ECDICT：form「n. 保加利亚人[语]( Bulgarian的复数形式 )」 / lemma「n. 保加利亚人；保加利亚语」
- **建议：`keep`**

## instalments → instalment
- rank：form 34616 / lemma 36626 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分期付款；分期刊载」 / lemma「分期付款；连载的一期」
- ECDICT：form「n. 一部分( instalment的复数形式 ); 一集; 每一期摊付的款项; 分期付款」 / lemma「n. 就职, 装设, 分期付款」
- **建议：`keep`**

## ukrainians → ukrainian
- rank：form 34641 / lemma 12983 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「乌克兰人（复数）」 / lemma「乌克兰的；乌克兰人」
- ECDICT：form「乌克兰人」 / lemma「a. 乌克兰的；乌克兰人的」
- **建议：`keep`**

## sparklers → sparkler
- rank：form 34651 / lemma 40923 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「烟花棒；闪光物」 / lemma「烟花棒；闪耀之物」
- ECDICT：form「n. 闪烁发光物（尤指烟火）, <口>宝石( sparkler的复数形式 )」 / lemma「n. 钻石, 花炮, 烟火, 才华焕发的人」
- **建议：`keep`**

## whupped → whup
- rank：form 34742 / lemma 23753 ｜ type `p` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「痛打；击败（过去式）」 / lemma「痛打；击败」
- ECDICT：form「(whup 的过去时) [美俚]大胜」 / lemma「[美俚]大胜」
- **建议：`keep`**

## eyeballing → eyeball
- rank：form 34748 / lemma 11787 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「注视；打量」 / lemma「眼球」
- ECDICT：form「[计] 目视检查, 目测」 / lemma「n. 眼球 [医] 眼球」
- **建议：`?`**

## acs → ac
- rank：form 34765 / lemma 9974 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「急性冠脉综合征（缩写）」 / lemma「交流电；空调（缩写）」
- ECDICT：form「[计] 高级通信服务, 先进密码系统, 汇编管理系统, 自动控制系统 [医] 阳极通电声」 / lemma「公元前 [计] 存取周期, 累加器, 声耦合器, 交流, 应用控制, 自动检查, 自动计算机」
- **建议：`keep`**

## infuriated → infuriate
- rank：form 34779 / lemma 47061 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「激怒的；狂怒的」 / lemma「激怒；使大怒」
- ECDICT：form「v. 使大怒, 激怒( infuriate的过去式和过去分词 )」 / lemma「a. 狂怒的 vt. 激怒」
- **建议：`keep`**

## environmentalists → environmentalist
- rank：form 34820 / lemma 34976 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「环保主义者（复数）」 / lemma「环保主义者」
- ECDICT：form「n. 环境保护论者, 人类生态学者( environmentalist的复数形式 )」 / lemma「n. 环保人士」
- **建议：`keep`**

## flecks → fleck
- rank：form 34826 / lemma 35025 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「斑点；微粒（复数）」 / lemma「斑点；微粒」
- ECDICT：form「n. 斑点, 小点( fleck的名词复数 ); 癍」 / lemma「n. 斑点, 雀斑, 斑纹 vt. 使起斑点, 使有斑纹, 使有斑驳」
- **建议：`keep`**

## airbags → airbag
- rank：form 34915 / lemma 30156 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「安全气囊（复数）」 / lemma「安全气囊」
- ECDICT：form「(airbag 的复数) [机] 空气囊」 / lemma「[机] 空气囊」
- **建议：`keep`**

## laminated → laminate
- rank：form 34925 / lemma 43695 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「层压的；覆膜的」 / lemma「层压；覆膜」
- ECDICT：form「a. 用薄片层压制成, 切成薄片, 把...分成薄片, 由薄片迭成/覆盖的, 层压板 [计] 层压的, 叠层的」 / lemma「vt. 制成薄板, 制成箔 vi. 分成薄片 a. 薄板状的 n. 层积塑胶板, 薄片制品 [计] 层压」
- **建议：`keep`**

## facets → facet
- rank：form 34939 / lemma 35931 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「方面；刻面」 / lemma「方面；刻面」
- ECDICT：form「n. （宝石或首饰的）小平面( facet的复数形式 ); （事物的）面; 方面」 / lemma「n. (多面体的)面, 方面, 琢面 [医] 小平面, 小面」
- **建议：`keep`**

## ches → ch
- rank：form 34965 / lemma 10810 ｜ type `s` ｜ src `A` ｜ flags `lemma-no-gloss, src-a-only`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「切斯（人名）」 / lemma「章；频道」
- ECDICT：form「abbr. 中国水利协会（Chinese Hydraulic Engineering Society）；套管井勘探服务」 / lemma「[计] 改变, 通道, 信道, 字符, 检验」
- **建议：`keep`**

## joules → joule
- rank：form 35021 / lemma 9231 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「焦耳（能量单位，复数）」 / lemma「焦耳，英国物理学家」
- ECDICT：form「n. 焦耳( joule的复数形式 )」 / lemma「n. 焦耳 [化] 焦耳」
- **建议：`keep`**

## blathering → blather
- rank：form 35086 / lemma 46468 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「喋喋不休；胡扯」 / lemma「胡扯；喋喋不休」
- ECDICT：form「v. 说蠢话, 胡说( blather的现在分词 )」 / lemma「vi. 说废话 n. 废话, 胡说」
- **建议：`keep`**

## capsized → capsize
- rank：form 35092 / lemma 42547 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「（船）倾覆（过去式）」 / lemma「（船）倾覆」
- ECDICT：form「v. （使船）翻, 倾覆( capsize的过去式和过去分词 )」 / lemma「v. 翻覆, 倾覆」
- **建议：`keep`**

## sickens → sicken
- rank：form 35181 / lemma 37105 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使厌恶；使生病」 / lemma「使恶心；生病」
- ECDICT：form「v. （使）生病( sicken的第三人称单数 ); 使厌恶, 使恶心」 / lemma「vt. 患病, 使厌倦, 使恶心 vi. 生病, 作呕」
- **建议：`keep`**

## animators → animator
- rank：form 35231 / lemma 42848 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「动画师；动画制作者」 / lemma「动画师；动画制作者」
- ECDICT：form「n. 动画片绘制者( animator的复数形式 )」 / lemma「n. 赋与生气者, 鼓舞者, 漫画制作者」
- **建议：`keep`**

## grammys → grammy
- rank：form 35233 / lemma 15024 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「格莱美奖」 / lemma「格莱美奖」
- ECDICT：form「(Grammy 的复数) n. 格兰密唱片奖」 / lemma「n. 格兰密唱片奖」
- **建议：`keep`**

## starships → starship
- rank：form 35264 / lemma 10590 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「星际飞船」 / lemma「星际飞船」
- ECDICT：form「(starship 的复数) 恒星飞船」 / lemma「恒星飞船」
- **建议：`keep`**

## deviled → devil
- rank：form 35276 / lemma 970 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「加辣调味的」 / lemma「魔鬼；恶魔」
- ECDICT：form「a. 蘸了很多芥末的」 / lemma「n. 魔鬼 vt. 折磨, 戏弄」
- **建议：`?`**

## pent → pen
- rank：form 35296 / lemma 6180 ｜ type `p` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「被关押的；压抑的」 / lemma「钢笔；笔」
- ECDICT：form「a. 被关禁的, 被关起来的 n. 单斜顶棚」 / lemma「n. 钢笔, 笔, 笔调, 笔杆子, 作家, 围栏, 栅栏, 禽畜 vt. 写, 关入栏中, 囚禁 vi. 动笔, 写作」
- **建议：`?`**

## bloomers → bloomer
- rank：form 35340 / lemma 34000 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「灯笼裤；女式短裤」 / lemma「失误；开花植物」
- ECDICT：form「n. 灯笼裤」 / lemma「布卢默(姓氏)」
- **建议：`keep`**

## baubles → bauble
- rank：form 35348 / lemma 36230 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「小装饰品；华而不实之物」 / lemma「小玩意儿；华而不实之物」
- ECDICT：form「n. 小玩意( bauble的复数形式 ); 华而不实的小件装饰品; 无价值的东西; 丑角的手杖」 / lemma「n. 美观而无价值的东西, 玩具, 小玩意」
- **建议：`keep`**

## victorians → victorian
- rank：form 35353 / lemma 10846 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「维多利亚时代的人」 / lemma「维多利亚时代的」
- ECDICT：form「n. 维多利亚时代」 / lemma「a. 英国维多利亚女王时代的, 笃信宗教的, 讲究体面的 n. 维多利亚女王时代的英国人」
- **建议：`keep`**

## miscarried → miscarry
- rank：form 35396 / lemma 47169 ｜ type `pd` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「流产；失败（过去式）」 / lemma「流产；失败」
- ECDICT：form「v. （指妇女）流产( miscarry的过去式和过去分词 ); （指计划等）失败」 / lemma「vi. 失败, 被误送, 流产 [医] 流产」
- **建议：`keep`**

## torpedoed → torpedo
- rank：form 35511 / lemma 8582 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用鱼雷击沉；彻底破坏」 / lemma「鱼雷」
- ECDICT：form「vt. 用鱼雷袭击（torpedo的过去式与过去分词形式）」 / lemma「n. 鱼雷, 水雷, 地雷 vt. 用鱼雷袭击, 破坏」
- **建议：`?`**

## expedited → expedite
- rank：form 35530 / lemma 20400 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「加快；加速处理」 / lemma「加速；促进；迅速完成」
- ECDICT：form「v. 加快进展( expedite的过去式和过去分词 ); 迅速完成」 / lemma「vt. 加快, 促进, 发出 a. 畅通的, 无阻碍的, 迅速的, 方便的」
- **建议：`?`**

## dislodged → dislodge
- rank：form 35566 / lemma 36597 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「移开；驱逐」 / lemma「移开；逐出」
- ECDICT：form「v. 把…赶出, 从…逐出, 把…移去( dislodge的过去式和过去分词 )」 / lemma「vt. 逐出, 使移动, 驱逐 vi. 离开原位」
- **建议：`keep`**

## pixies → pixy
- rank：form 35600 / lemma 41586 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小精灵」 / lemma「小精灵；淘气鬼」
- ECDICT：form「n. 小精灵, 小仙子( pixie的名词复数 )」 / lemma「n. 小精灵, 小鬼, 小淘气 a. 淘气的, 恶作剧的」
- **建议：`keep`**

## finns → finn
- rank：form 35674 / lemma 4099 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「芬兰人（复数）」 / lemma「芬兰人；芬恩（人名）」
- ECDICT：form「n. 芬兰人( Finn的名词复数 )」 / lemma「n. 芬兰人」
- **建议：`keep`**

## conquistadors → conquistador
- rank：form 35714 / lemma 21000 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「西班牙征服者（复数）」 / lemma「征服者（尤指16世纪西班牙征服美洲者）」
- ECDICT：form「(conquistador 的复数) n. 西班牙征服者, 征服者」 / lemma「n. 西班牙征服者, 征服者」
- **建议：`?`**

## rivas → riva
- rank：form 35822 / lemma 33691 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「里瓦斯（姓氏/地名）」 / lemma「里瓦（人名/品牌）」
- ECDICT：form「(riva 的复数) n. 莉娃（女子名）」 / lemma「n. 莉娃（女子名）」
- **建议：`keep`**

## carbohydrates → carbohydrate
- rank：form 35833 / lemma 45373 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「碳水化合物（复数）」 / lemma「碳水化合物」
- ECDICT：form「n. 碳水化合物, 糖类( carbohydrate的复数形式 ); 淀粉质或糖类食物」 / lemma「n. 碳水化合物, 糖类 [化] 糖类; 碳水化合物」
- **建议：`keep`**

## chaperoning → chaperon
- rank：form 35856 / lemma 42462 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「陪伴；护送（chaperone 现在分词）」 / lemma「陪护人；监护人」
- ECDICT：form「v. 陪伴, 伴随（未婚少女）( chaperon的现在分词 ); 作女子陪伴人, 作监护人( chaperone的现在…」 / lemma「n. 年长女伴 vt. 伴护」
- **建议：`keep`**

## chaperoning → chaperone
- rank：form 35856 / lemma 13713 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「陪伴；护送（chaperone 现在分词）」 / lemma「陪护人；监护人」
- ECDICT：form「v. 陪伴, 伴随（未婚少女）( chaperon的现在分词 ); 作女子陪伴人, 作监护人( chaperone的现在…」 / lemma「n. 年长女伴 vt. 伴护」
- **建议：`?`**

## immobilized → immobilize
- rank：form 35866 / lemma 43343 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「使不动；固定（immobilize 过去式）」 / lemma「使不能动；固定」
- ECDICT：form「v. 使不动, 使固定( immobilize的过去式和过去分词 )」 / lemma「vt. 使不动, 使固定, 使不能移动 [医] 制动, 固定」
- **建议：`keep`**

## screenings → screening
- rank：form 35886 / lemma 9155 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「放映；筛查（复数）」 / lemma「筛查；放映」
- ECDICT：form「n. 筛后残余的物；筛屑；残渣」 / lemma「[医] 筛选, 筛分(如普查癌、结核等病), 萤光屏检查」
- **建议：`keep`**

## borgias → borgia
- rank：form 35925 / lemma 12188 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「波吉亚家族」 / lemma「波吉亚（家族名）」
- ECDICT：form「n. (Borgias)人名；(希)博尔亚斯」 / lemma「n. 博尔吉亚（意大利15、16世纪权门家族）」
- **建议：`keep`**

## sayers → sayer
- rank：form 35954 / lemma 38063 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「塞耶斯（姓氏）」 / lemma「说话者；预言者」
- ECDICT：form「n. 塞耶斯（姓氏）」 / lemma「n. 说话的人」
- **建议：`keep`**

## munchkins → munchkin
- rank：form 36022 / lemma 24049 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「小矮人；小甜甜圈（复数）」 / lemma「芒奇金人；小矮人」
- ECDICT：form「(munchkin 的复数) n. 小巧玲珑的人, 忙个不停的人」 / lemma「n. 小巧玲珑的人, 忙个不停的人」
- **建议：`keep`**

## atms → atm
- rank：form 36026 / lemma 8525 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「自动取款机（复数）」 / lemma「自动取款机」
- ECDICT：form「先进的交通管理系统」 / lemma「[计] 自动出纳机; 异步传输方式」
- **建议：`keep`**

## hobbits → hobbit
- rank：form 36027 / lemma 19920 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「霍比特人（复数）」 / lemma「霍比特人（虚构种族）」
- ECDICT：form「哈比人」 / lemma「n. （英国作家J R R Tolkien笔下的）」
- **建议：`keep`**

## legos → lego
- rank：form 36158 / lemma 24517 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「乐高积木（复数）」 / lemma「乐高（积木品牌）」
- ECDICT：form「(lego 的复数) n. 乐高积木（商标名）」 / lemma「n. 乐高积木（商标名）」
- **建议：`keep`**

## slavs → slav
- rank：form 36162 / lemma 37460 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「斯拉夫人（复数）」 / lemma「斯拉夫人」
- ECDICT：form「n. 斯拉夫人( Slav的名词复数 )」 / lemma「a. 斯拉夫人的；斯拉夫语的」
- **建议：`keep`**

## quizzes → quiz
- rank：form 36201 / lemma 7085 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「测验；小考」 / lemma「测验；知识竞赛」
- ECDICT：form「n. 智力比赛；小测验（quiz复数形式）」 / lemma「n. 考查, 课堂测验, 恶作剧, 智力测验 vt. 戏弄, 考查, 恶作剧」
- **建议：`?`**

## hebrews → hebrew
- rank：form 36225 / lemma 8014 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「希伯来人；希伯来书」 / lemma「希伯来语；希伯来人」
- ECDICT：form「n. [圣经]希伯来书（新约之一卷）」 / lemma「n. 希伯来人, 希伯来语, 犹太人 a. 希伯来人的, 希伯来语的」
- **建议：`keep`**

## secretions → secretion
- rank：form 36290 / lemma 41425 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分泌物；分泌（复数）」 / lemma「分泌物；分泌」
- ECDICT：form「n. 分泌（物）( secretion的复数形式 )」 / lemma「n. 分泌, 分泌物, 分泌液, 隐蔽 [医] 分泌; 分泌物」
- **建议：`keep`**

## favoring → favor
- rank：form 36306 / lemma 813 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「偏爱；支持（现在分词）」 / lemma「恩惠；帮助；赞成」
- ECDICT：form「a. 顺利的, 有利的」 / lemma「n. 好意, 喜爱 vt. 赐予, 支持, 喜欢, 证实」
- **建议：`?`**

## geraniums → geranium
- rank：form 36338 / lemma 41233 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「天竺葵（复数）」 / lemma「天竺葵」
- ECDICT：form「n. 天竺葵( geranium的复数形式 )」 / lemma「n. 老鹳草属植物, 天竺葵 [化] 老鹳草」
- **建议：`keep`**

## betters → better
- rank：form 36478 / lemma 130 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「更优秀者；上司」 / lemma「更好的」
- ECDICT：form「n. 长辈；胜于己者」 / lemma「a. 较好的 adv. 比较好」
- **建议：`?`**

## castaways → castaway
- rank：form 36492 / lemma 36582 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「（船难）漂流者；被遗弃者」 / lemma「漂流者；被抛弃的人」
- ECDICT：form「n. 被抛弃的人, 坐船遇难者, 漂流者( castaway的复数形式 )」 / lemma「n. 被抛弃的人, 坐船遇难者 a. 被抛弃的, 遭难的」
- **建议：`keep`**

## beckoning → beckon
- rank：form 36576 / lemma 37985 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「招手示意；吸引」 / lemma「招手；示意」
- ECDICT：form「a. 引诱人的；令人心动的」 / lemma「v. 招手示意, 召唤, 吸引 n. 表召唤的点头(或手势)」
- **建议：`keep`**

## ricks → rick
- rank：form 36617 / lemma 1580 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「干草堆（rick 的复数）」 / lemma「里克（男子名）」
- ECDICT：form「n. 干草堆( rick的名词复数 ) v. 堆成垛( rick的第三人称单数 )」 / lemma「n. 草堆 vt. 把...堆成垛」
- **建议：`keep`**

## dollies → dolly
- rank：form 36734 / lemma 5258 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「洋娃娃（复数）；手推车」 / lemma「洋娃娃；手推车」
- ECDICT：form「abbr. dolophine pills 盐酸美沙酮药片 n. 玩具娃娃( dolly的名词复数 ); 台车, 摄影机…」 / lemma「n. 洋娃娃, (洗衣用)捣棒 vi. 移动车 vt. 用移动车移动」
- **建议：`keep`**

## honing → hon
- rank：form 36763 / lemma 3699 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨练；磨刀」 / lemma「亲爱的（称呼）」
- ECDICT：form「[化] 珩磨」 / lemma「[化] δ-羟基-γ-氧代正缬氨酸 [医] 羟氧基正缬氨酸」
- **建议：`keep`**

## honing → hone
- rank：form 36763 / lemma 23189 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「磨练；磨刀」 / lemma「磨炼；磨快」
- ECDICT：form「[化] 珩磨」 / lemma「n. 磨刀石, 抱怨, 想念 vt. 用磨刀石磨, 磨练」
- **建议：`?`**

## engels → engel
- rank：form 36766 / lemma 32802 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「恩格斯（姓氏）」 / lemma「恩格尔（姓氏）」
- ECDICT：form「n. 恩格斯（德国社会主义哲学家）」 / lemma「n. 恩格尔（恩格尔 德国的统计学家）；英杰尔（日本品牌）」
- **建议：`keep`**

## axed → ax
- rank：form 36785 / lemma 8231 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「砍；削减（axe 过去式）」 / lemma「斧头；解雇」
- ECDICT：form「v. （用斧）砍( axe的过去式和过去分词 ); 精简（机构等）; 大量削减（经费等）」 / lemma「n. 斧头 vt. 用斧削或砍, 削减」
- **建议：`?`**

## axed → axe
- rank：form 36785 / lemma 5279 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「砍；削减（axe 过去式）」 / lemma「斧头；削减」
- ECDICT：form「v. （用斧）砍( axe的过去式和过去分词 ); 精简（机构等）; 大量削减（经费等）」 / lemma「n. 斧, 斧头 vt. 削减(人员、经费、计划、机构等)」
- **建议：`?`**

## sicilians → sicilian
- rank：form 36802 / lemma 15799 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「西西里人（复数）」 / lemma「西西里的；西西里人」
- ECDICT：form「n. 西西里岛人( Sicilian的复数形式 )」 / lemma「a. 西西里岛的」
- **建议：`keep`**

## patterned → pattern
- rank：form 36804 / lemma 2453 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有图案的；有规律的」 / lemma「图案；模式」
- ECDICT：form「a. 被组成图案的」 / lemma「n. 模范, 典型, 式样, 样品, 图案, 格调, 模式 vt. 模仿, 仿造, 以图案装饰 vi. 形成图案 [计]…」
- **建议：`?`**

## yahoos → yahoo
- rank：form 36806 / lemma 12987 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「粗人；野人（复数）」 / lemma「雅虎（品牌）」
- ECDICT：form「n. 雅虎( yahoo的复数形式 ); （英国作家Swift小说中<<格列佛游记>>中的）人行兽; yahoo此字可追…」 / lemma「n. 人面兽心的人, 乡愚, 粗汉」
- **建议：`keep`**

## acrobatics → acrobatic
- rank：form 36826 / lemma 39316 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「杂技；特技飞行」 / lemma「杂技的；技艺高超的」
- ECDICT：form「n. 杂技, 杂技表演」 / lemma「a. 杂技演员的, 杂技的」
- **建议：`keep`**

## regs → reg
- rank：form 36869 / lemma 8095 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「规章；条例（复数）」 / lemma「雷格（男子名）；登记」
- ECDICT：form「n. 海军学校规则」 / lemma「abbr. [计]注册表文件；寄存器（register ）」
- **建议：`keep`**

## gophers → gopher
- rank：form 36885 / lemma 19801 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「地鼠；囊地鼠（复数）」 / lemma「地鼠；黄鼠」
- ECDICT：form「n. 非常热心的人；勤杂工；骗子新手；打地鼠（gopher的复数） v. 打地洞；盲目地开掘矿藏（gopher的三单形式…」 / lemma「[计] 信息检索工具」
- **建议：`keep`**

## samaritans → samaritan
- rank：form 37042 / lemma 12255 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「撒玛利亚人；善心人组织」 / lemma「乐善好施者；撒玛利亚人」
- ECDICT：form「n. <宗>撒马利坦会; 撒马利亚人, 撒马利亚人的( Samaritan的复数形式 ); 见义勇为者」 / lemma「n. 乐善好施者」
- **建议：`keep`**

## scrounging → scrounge
- rank：form 37089 / lemma 30060 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「乞讨；搜寻，蹭取」 / lemma「乞讨；搜寻」
- ECDICT：form「v. 乞讨, 骗取( scrounge的现在分词 )」 / lemma「vt. 乞讨, 搜寻 vi. 东张西望, 搜寻, 乞讨」
- **建议：`?`**

## slavers → slaver
- rank：form 37135 / lemma 38086 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「奴隶贩子；垂涎者」 / lemma「流口水；垂涎」
- ECDICT：form「n. 口水( slaver的名词复数 ); 奉承; <史>贩运奴隶的船; 胡言 v. 流口水( slaver的第三人称单…」 / lemma「n. 奴隶商人, 奴隶贩卖船, 口水 vi. 垂涎, 淌口水, 奉承 vt. 淌口水弄脏」
- **建议：`keep`**

## gayest → gaye
- rank：form 37145 / lemma 24821 ｜ type `t` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「最快乐的；最花哨的」 / lemma「盖伊（人名）」
- ECDICT：form「a. 快乐的；华美的」 / lemma「盖伊（Gay的变体, 人名）」
- **建议：`keep`**

## felling → fell
- rank：form 37197 / lemma 602 ｜ type `i` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「砍伐；击倒」 / lemma「跌倒（fall的过去式）」
- ECDICT：form「n. 二重接缝, 咬口折缝；伐木」 / lemma「vt. 击倒 n. 一季所伐的木材, 折缝 a. 凶猛的, 可怕的 fall的过去式」
- **建议：`?`**

## scalded → scald
- rank：form 37243 / lemma 47437 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「烫伤的；被烫的」 / lemma「烫伤；烫洗」
- ECDICT：form「v. （沸水等）烫伤（皮肤）( scald的过去式和过去分词 ); 把（尤指牛奶）加热到接近沸腾」 / lemma「n. 烫伤, 烫洗 v. 烫伤, 烫洗」
- **建议：`keep`**

## talkies → talky
- rank：form 37250 / lemma 38962 ｜ type `s3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有声电影」 / lemma「多话的；对白多的」
- ECDICT：form「n. <口>有声电影( talkie的复数形式 )」 / lemma「a. 对话过多的」
- **建议：`keep`**

## piloted → pilot
- rank：form 37352 / lemma 1787 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「驾驶；引导」 / lemma「飞行员；领航员」
- ECDICT：form「先导控制的, 带先导阀的, 有人驾驶的」 / lemma「n. 飞行员, 领航员, 航船者, 导向器, 驾驶仪, 向导, 领导人 vt. 领航, 驾驶, 引导, 试用 a. 引导…」
- **建议：`?`**

## vacuumed → vacuum
- rank：form 37353 / lemma 5024 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用吸尘器打扫」 / lemma「真空；吸尘器」
- ECDICT：form「vt. 用真空吸尘器清扫（vacuum的过去式形式）」 / lemma「n. 真空, 空间, 真空吸尘器 a. 真空的, 产生真空的, 利用真空的 vt. 用吸尘器打扫」
- **建议：`?`**

## blogging → blog
- rank：form 37369 / lemma 6838 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「写博客」 / lemma「博客；写博客」
- ECDICT：form「n. 写网志；博客」 / lemma「n. 博客；部落格；网络日志」
- **建议：`?`**

## sufferers → sufferer
- rank：form 37427 / lemma 40483 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「患者；受苦者（复数）」 / lemma「患者；受苦者」
- ECDICT：form「n. 受害者, 受难者( sufferer的复数形式 ); 患病者」 / lemma「n. 受难者, 被害者, 患者 [法] 受害者, 受难者」
- **建议：`keep`**

## salas → sala
- rank：form 37517 / lemma 40584 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「萨拉斯（姓氏）」 / lemma「厅；房间（西语借词）」
- ECDICT：form「(sala 的复数) n. 大厅」 / lemma「n. 大厅」
- **建议：`keep`**

## dinged → ding
- rank：form 37551 / lemma 4257 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使凹陷；发出叮声」 / lemma「叮当响；发出叮声」
- ECDICT：form「vi. 响；执拗地讲 vt. 反复地说给人家听 n. 钟声 n. (Ding)人名；(英、德、缅)丁」 / lemma「vi. 响, 连响, 反复告诫 vt. 反复告诉 n. 钟声」
- **建议：`?`**

## laboring → labor
- rank：form 37594 / lemma 3115 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「劳作；苦干」 / lemma「劳动；劳工」
- ECDICT：form「a. 劳动的」 / lemma「n. 劳动, 努力, 工作, 劳工, 分娩 vi. 劳动, 努力, 苦干 vt. 详细分析, 使厌烦」
- **建议：`?`**

## wellingtons → wellington
- rank：form 37617 / lemma 9630 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「威灵顿长靴」 / lemma「惠灵顿（地名）；长筒靴」
- ECDICT：form「n. 威灵顿防水长筒靴」 / lemma「n. 惠灵顿长靴」
- **建议：`keep`**

## ousted → oust
- rank：form 37652 / lemma 39235 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「驱逐；罢免」 / lemma「驱逐；罢免」
- ECDICT：form「v. 驱逐( oust的过去式和过去分词 ); 革职; 罢黜; 剥夺」 / lemma「vt. 逐出, 罢黜, 剥夺, 驱逐 [法] 驱逐, 剥夺, 免职」
- **建议：`keep`**

## tanking → tank
- rank：form 37785 / lemma 1935 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「惨败；急剧下跌」 / lemma「坦克；水箱」
- ECDICT：form「地下室防水层」 / lemma「n. 槽, 箱, 柜, 罐, 池塘, 储水池, 坦克 vt. 储于箱中」
- **建议：`?`**

## reuniting → reunite
- rank：form 37810 / lemma 15719 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重聚；使再统一」 / lemma「重聚；使再联合」
- ECDICT：form「v. （使某人或某物）再次联合, 重聚( reunite的现在分词 )」 / lemma「v. (使)再联合」
- **建议：`?`**

## fraid → fray
- rank：form 37829 / lemma 20581 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「害怕的（afraid 口语缩略）」 / lemma「打斗；争吵」
- ECDICT：form「n. 胆小鬼」 / lemma「n. 磨损, 打架, 争论 vt. 使磨损 vi. 被磨损」
- **建议：`?`**

## landmines → landmine
- rank：form 37843 / lemma 39577 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「地雷（复数）」 / lemma「地雷；隐患」
- ECDICT：form「n. 潜在的冲突; 地雷, 投伞水雷( landmine的复数形式 )」 / lemma「n. 地雷, 投伞水雷」
- **建议：`keep`**

## loggers → logger
- rank：form 37902 / lemma 46056 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「伐木工；记录器」 / lemma「伐木工；记录器」
- ECDICT：form「n. 伐木工人（logger的复数形式）」 / lemma「n. 樵夫, 圆木装车机 [计] 记录器; 注册器; 登记器」
- **建议：`keep`**

## gmos → gmo
- rank：form 37960 / lemma 43257 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「转基因生物（缩写）」 / lemma「转基因生物」
- ECDICT：form「(gmo 的复数) n. [医][=garamycin ointment]庆大霉素油膏」 / lemma「n. [医][=garamycin ointment]庆大霉素油膏」
- **建议：`keep`**

## zeroed → zero
- rank：form 37964 / lemma 3240 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「归零；瞄准」 / lemma「零；零点」
- ECDICT：form「[医]调了零点的」 / lemma「n. 零, 零点, 零度, 无, 乌有, 最低点 a. 零的, 没有的 vt. 调零, 对(炮火等)作协调校正 [计] …」
- **建议：`?`**

## snorkeling → snorkel
- rank：form 37975 / lemma 31317 ｜ type `i` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「浮潜」 / lemma「潜水呼吸管」
- ECDICT：form「v. 用通气管潜泳」 / lemma「n. 通气管」
- **建议：`?`**

## waltzed → waltz
- rank：form 38067 / lemma 2880 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「跳华尔兹；轻快走动」 / lemma「华尔兹；跳华尔兹」
- ECDICT：form「v. 与…跳华尔兹舞( waltz的过去式和过去分词 ); 强拉, 硬拖; 轻快地走动; 旋转」 / lemma「n. 华尔兹舞, 圆舞曲 a. 华尔兹舞的, 圆舞曲的 vi. 跳华尔兹舞, 轻快地走动 vt. 与...跳华尔兹舞, …」
- **建议：`?`**

## staffers → staffer
- rank：form 38161 / lemma 39585 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「职员（复数）」 / lemma「职员；员工」
- ECDICT：form「n. 编辑, 职员( staffer的复数形式 )」 / lemma「n. (一名)职员(尤指编辑或记者)」
- **建议：`keep`**

## secreted → secrete
- rank：form 38200 / lemma 43764 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「分泌；藏匿」 / lemma「分泌；隐藏」
- ECDICT：form「v. （尤指动物或植物器官）分泌( secrete的过去式和过去分词 ); 隐匿, 隐藏」 / lemma「vt. 隐秘, 隐藏, 隐匿, 分泌 [医] 分泌」
- **建议：`keep`**

## filipinos → filipino
- rank：form 38205 / lemma 16553 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「菲律宾人（复数）」 / lemma「菲律宾人；菲律宾语」
- ECDICT：form「n. 菲律宾人（Filipino的复数）」 / lemma「n. 菲律宾人」
- **建议：`keep`**

## loyalists → loyalist
- rank：form 38209 / lemma 38453 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「忠诚者；保皇派」 / lemma「忠诚者；保皇派」
- ECDICT：form「n. （持现政权忠诚的人, (对统治者）效忠者, 反对独立者（loyalist的复数形式）」 / lemma「n. 忠诚的人, 反对独立者, 反佛朗哥派的人」
- **建议：`keep`**

## gasses → gas
- rank：form 38350 / lemma 856 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「气体（复数）；毒气」 / lemma「气体；汽油」
- ECDICT：form「n. 气( gas的名词复数 ); 毒气; （用于照明、加热、烧饭等的）可燃气体; 麻醉气 v. [美国俚语]使激动( …」 / lemma「n. 气体, 汽油, 瓦斯 [化] 气体; 煤气; 瓦斯; 毒气」
- **建议：`?`**

## satanists → satanist
- rank：form 38373 / lemma 41036 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「撒旦教徒」 / lemma「撒旦崇拜者」
- ECDICT：form「(satanist 的复数) n. 撒旦崇拜者, 撒旦崇拜主义者; [亦作 s-]邪恶的人；穷凶极恶的人」 / lemma「n. 撒旦崇拜者, 撒旦崇拜主义者; [亦作 s-]邪恶的人；穷凶极恶的人」
- **建议：`keep`**

## disinherited → disinherit
- rank：form 38380 / lemma 46745 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「剥夺继承权」 / lemma「剥夺继承权」
- ECDICT：form「v. 剥夺继承权, 剥夺特权( disinherit的过去式和过去分词 )」 / lemma「vt. 剥夺...的继承权 [法] 剥夺继承权」
- **建议：`keep`**

## marathons → marathon
- rank：form 38425 / lemma 7261 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「马拉松；持久活动」 / lemma「马拉松」
- ECDICT：form「n. 马拉松赛跑；耐力的考验 a. 马拉松式的；有耐力的 vi. 参加马拉松赛跑」 / lemma「n. 马拉松, 耐力的考验」
- **建议：`keep`**

## barfed → barf
- rank：form 38429 / lemma 14027 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「呕吐」 / lemma「呕吐（俚语）」
- ECDICT：form「v. 呕吐( barf的过去式和过去分词 )」 / lemma「v. 呕吐」
- **建议：`?`**

## straddling → straddle
- rank：form 38494 / lemma 41078 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「跨坐；横跨（现在分词）」 / lemma「跨坐；骑跨」
- ECDICT：form「v. 叉开腿( straddle的现在分词 ); 跨坐; 横跨…的两边; 跨越…的两边」 / lemma「n. 跨坐, 观望 v. 跨坐, 两腿叉开坐, 观望」
- **建议：`keep`**

## begotten → beget
- rank：form 38515 / lemma 35432 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「生育；产生（过去分词）」 / lemma「产生；生育」
- ECDICT：form「beget的过去分词」 / lemma「vt. 为某人之生父, 招致, 产生, 引起」
- **建议：`?`**

## minas → mina
- rank：form 38545 / lemma 7707 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「米纳斯（地名/人名）」 / lemma「米娜（女子名）」
- ECDICT：form「[地名] [厄瓜多尔、古巴、乌拉圭、印度尼西亚] 米纳斯」 / lemma「n. 迈纳(古希腊单位)」
- **建议：`keep`**

## harbored → harbor
- rank：form 38576 / lemma 4195 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「怀有；藏匿（过去式）」 / lemma「港口；避难所」
- ECDICT：form「v. 心怀( harbor的过去式和过去分词 ); 庇护; 避入安全地; （船）入港停泊」 / lemma「n. 港, 避难所 v. 庇护, 藏匿, (使)入港停泊」
- **建议：`?`**

## bluer → blu
- rank：form 38580 / lemma 32199 ｜ type `r` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「更蓝的（blue 比较级）」 / lemma「蓝色的（变体）」
- ECDICT：form「染蓝检验工」 / lemma「[计] 基本连接单元」
- **建议：`keep`**

## picketing → picket
- rank：form 38691 / lemma 12930 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「罢工纠察；示威」 / lemma「纠察员；尖桩」
- ECDICT：form「[经] 罢工工人劝阻工人上班, 工人纠察线」 / lemma「n. 桩, 尖桩, 警戒哨, 巡逻艇, 纠察队 vt. 围住, 警戒, 派...担任纠察 vi. 担任纠察」
- **建议：`?`**

## rasping → rasp
- rank：form 38764 / lemma 42371 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「刺耳的；锉磨般的」 / lemma「锉；发出刺耳声」
- ECDICT：form「a. 锉磨声的, 令人焦躁的」 / lemma「n. 粗锉刀, 刺耳声 vt. 用粗锉刀锉, 粗声粗气地说 vi. 粗锉, 锉磨, 发刺耳声」
- **建议：`keep`**

## hittites → hittite
- rank：form 38862 / lemma 42583 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, form-more-frequent`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「赫梯人（古代民族）」 / lemma「赫梯人；赫梯语」
- ECDICT：form「(Hittite 的复数) n. 赫梯人, 赫梯人语 a. 赫梯人的」 / lemma「n. 赫梯人, 赫梯人语 a. 赫梯人的」
- **建议：`keep`**

## theologians → theologian
- rank：form 38884 / lemma 43470 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「神学家」 / lemma「神学家」
- ECDICT：form「n. 神学家, 宗教研究家( theologian的复数形式 )」 / lemma「n. 神学者」
- **建议：`keep`**

## avalanches → avalanche
- rank：form 38915 / lemma 11781 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「雪崩；大量涌至」 / lemma「雪崩；大量涌至」
- ECDICT：form「n. 雪崩( avalanche的名词复数 )」 / lemma「n. 雪崩, 山崩, 大量 vi. 崩塌 vt. 大量涌至」
- **建议：`?`**

## reprogramming → reprogram
- rank：form 38993 / lemma 24378 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重新编程；改造」 / lemma「重新编程；改写程序」
- ECDICT：form「[计] 改编程序, 重编程序」 / lemma「[计] 可改编程序, 重编程序」
- **建议：`keep`**

## spas → spa
- rank：form 39021 / lemma 5636 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「温泉浴场（复数）」 / lemma「温泉；水疗中心」
- ECDICT：form「n. 矿泉( spa的复数形式 ); 矿泉疗养地; （矿泉）旅游胜地」 / lemma「n. 矿泉, 温泉浴场, 矿泉治疗地 [计] 软件出版者协会」
- **建议：`keep`**

## nibs → nib
- rank：form 39025 / lemma 45192 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「笔尖（复数）；大人物」 / lemma「钢笔尖；笔尖」
- ECDICT：form「n. 上司, 大人物」 / lemma「n. 嘴, 笔尖 vt. 装尖头, 削尖, 修换(笔)尖」
- **建议：`keep`**

## bourbons → bourbon
- rank：form 39042 / lemma 7182 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「波旁威士忌（复数）」 / lemma「波旁威士忌」
- ECDICT：form「n. (曾于16～19世纪在法国、西班牙、那不勒斯建立王朝的)波旁家族的成员；【植物】波旁蔷薇」 / lemma「[机] 波旁」
- **建议：`keep`**

## expended → expend
- rank：form 39074 / lemma 42531 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「花费；耗尽（过去式）」 / lemma「花费；消耗」
- ECDICT：form「v. 花费( expend的过去式和过去分词 ); 使用（钱等）做某事; 用光; 耗尽」 / lemma「vt. 花费, 消耗, 用光」
- **建议：`keep`**

## secs → sec
- rank：form 39123 / lemma 2169 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「秒（复数，口语）」 / lemma「秒（second 缩写）；片刻」
- ECDICT：form「abbr. 半导体设备通信标准（SEMI Equipment Communication Standard）」 / lemma「[计] 秒, 辅助 [化] 尺寸排阻色谱法」
- **建议：`keep`**

## pagers → pager
- rank：form 39276 / lemma 11150 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「寻呼机（复数）」 / lemma「寻呼机；传呼机」
- ECDICT：form「n. 寻呼机( pager的复数形式 )」 / lemma「[计] 页调度程序」
- **建议：`keep`**

## manicured → manicure
- rank：form 39281 / lemma 13500 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「修剪整齐的；精心修饰的」 / lemma「修指甲；美甲」
- ECDICT：form「a. （草坪、花园）修剪整齐的」 / lemma「n. 修指甲术, 修指甲, 修指甲师 vt. 修指甲, 修剪」
- **建议：`?`**

## collectibles → collectible
- rank：form 39282 / lemma 40564 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「收藏品（复数）」 / lemma「可收藏的；值得收藏的」
- ECDICT：form「n. 可收集的, 可代收的( collectible的名词复数 )」 / lemma「a. 可收集的, 可搜集的, 可征收的 [经] 可收回的」
- **建议：`keep`**

## tuckered → tucker
- rank：form 39409 / lemma 4613 ｜ type `p` ｜ src `B` ｜ flags `lemma-proper, src-b-only`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「筋疲力尽的」 / lemma「塔克（姓氏）；食物」
- ECDICT：form「v. 使疲倦, 使衰弱( tucker的过去式和过去分词 )」 / lemma「n. 打横褶的人, 打褶装置 vt. 使疲倦, 使筋疲力尽」
- **建议：`keep`**

## buccaneers → buccaneer
- rank：form 39423 / lemma 39950 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「海盗（复数）」 / lemma「海盗；冒险家」
- ECDICT：form「n. 海盗( buccaneer的复数形式 ); 掠夺者」 / lemma「n. 海盗 vi. 做海盗」
- **建议：`keep`**

## warbles → warble
- rank：form 39552 / lemma 42998 ｜ type `3` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「鸟鸣；颤声唱」 / lemma「鸟鸣；颤声唱」
- ECDICT：form「n. 鸟啭, 颤声( warble的名词复数 ) v. 鸟鸣, 用柔和的颤声唱( warble的第三人称单数 )」 / lemma「n. 用颤音唱的歌, 鸟啭, 颤声 v. 鸟鸣, 用柔和的颤声唱」
- **建议：`keep`**

## trafficked → traffic
- rank：form 39715 / lemma 1558 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贩卖；非法交易」 / lemma「交通；运输」
- ECDICT：form「vt. 用…作交换（traffic的过去式与过去分词形式）」 / lemma「n. 交通, 通行, 运输, 交通量, 贸易, 交易, 交往, 通信量 vi. 交易, 做买卖 vt. 用...作交换 …」
- **建议：`?`**

## messaged → message
- rank：form 39825 / lemma 553 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「发消息；通知」 / lemma「消息；信息」
- ECDICT：form「vt. 通知（message的过去式与过去分词形式）」 / lemma「n. 消息, 通讯, 讯息, 教训, 预言, 广告词 vt. 通知 vi. 通报, 报告, 报信 [计] 报文; 消息;…」
- **建议：`?`**

## cased → case
- rank：form 39925 / lemma 255 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「装箱的；踩点的」 / lemma「情况；案件；箱子」
- ECDICT：form「v. 包装；装入（case的过去式和过去分词形式）」 / lemma「n. 情形, 情况, 箱, 容器, 事实, 病例, 案例, 框子 vt. 装箱, 包盖」
- **建议：`?`**

## dockers → docker
- rank：form 39977 / lemma 42737 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「码头工人；多克斯（品牌）」 / lemma「码头工人」
- ECDICT：form「n. 码头工人( docker的复数形式 )」 / lemma「n. 码头工人」
- **建议：`keep`**

## offs → off
- rank：form 39989 / lemma 97 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「起跑；出发（口语）」 / lemma「离开；关闭」
- ECDICT：form「n. 偏移；关闭状态；低价股票（off的复数）」 / lemma「a. 关着的, 不再生效的, 处于...境况的, 休假的, 空闲的 adv. 走开, ...掉, ...下, 休息, 出…」
- **建议：`?`**

## unsealed → unseal
- rank：form 40122 / lemma 47660 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「未密封的」 / lemma「开启；拆封」
- ECDICT：form「未密封的, 打开的」 / lemma「vt. 开封, 开启, 使解除束缚」
- **建议：`keep`**

## carthaginians → carthaginian
- rank：form 40151 / lemma 39122 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「迦太基人」 / lemma「迦太基的；迦太基人」
- ECDICT：form「(Carthaginian 的复数) a. 迦太基的 n. 迦太基人」 / lemma「a. 迦太基的 n. 迦太基人」
- **建议：`keep`**

## pcs → pc
- rank：form 40157 / lemma 9026 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「个人电脑（复数）」 / lemma「个人电脑；政治正确」
- ECDICT：form「[计] 个人通信业务 [化] 青霉素类抗生素」 / lemma「个人计算机 [计] 外部控制, 个人计算机, 光电导体, 伪码」
- **建议：`keep`**

## cadillacs → cadillac
- rank：form 40255 / lemma 9365 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「凯迪拉克（豪车品牌）」 / lemma「凯迪拉克（品牌）」
- ECDICT：form「(Cadillac 的复数) n. 卡迪拉克牌轿车」 / lemma「n. 卡迪拉克牌轿车」
- **建议：`keep`**

## twiddling → twiddle
- rank：form 40273 / lemma 41142 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「摆弄；无所事事」 / lemma「摆弄；捻弄」
- ECDICT：form「v. （心不在焉地）捻弄( twiddle的现在分词 )」 / lemma「vt. 捻弄, 玩弄, 旋弄 vi. 旋弄 n. 捻弄」
- **建议：`keep`**

## gayer → gaye
- rank：form 40322 / lemma 24821 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「更快乐的；更同性恋的」 / lemma「盖伊（人名）」
- ECDICT：form「a. 华美的, 快乐的」 / lemma「盖伊（Gay的变体, 人名）」
- **建议：`keep`**

## cis → ci
- rank：form 40365 / lemma 14088 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「顺式的；顺性别的」 / lemma「居里（单位符号）；词素变体」
- ECDICT：form「[计] 中央信息系统, 字符指令系统, 计算机信息服务, 用户信息系统」 / lemma「[计] 输入, 通信接口, 计算机工业, 配置项 [化] 化学电离」
- **建议：`keep`**

## overstayed → overstay
- rank：form 40387 / lemma 47243 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「逗留过久；逾期滞留」 / lemma「停留过久；逾期逗留」
- ECDICT：form「v. 逗留过久, 停留超过（时间）( overstay的过去式和过去分词 )」 / lemma「vt. 呆得超过...的限度 vi. 在(市场)上耽误过久而坐失良机」
- **建议：`keep`**

## ides → ide
- rank：form 40434 / lemma 40098 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「（古罗马历）月中日」 / lemma「圆腹雅罗鱼；IDE缩写」
- ECDICT：form「n. 古罗马历中3、5、7、10月的第15日或者其余各月份的第13日」 / lemma「集成电路设备 [计] 集成电路设备, 集成式驱动器电子设备接口」
- **建议：`keep`**

## additives → additive
- rank：form 40454 / lemma 41133 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「添加剂」 / lemma「添加剂；附加物」
- ECDICT：form「n. 添加剂, 食物添加剂；附加剂」 / lemma「a. 添加的, 附加的, 加法的, 累积的 n. 添加物」
- **建议：`keep`**

## soldering → solder
- rank：form 40486 / lemma 46183 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「焊接」 / lemma「焊接；焊料」
- ECDICT：form「[计] 锡焊 [化] 钎焊; 软钎焊」 / lemma「n. 焊接剂, 接合物 v. 施以焊接, 焊合, 联结」
- **建议：`keep`**

## staffing → staff
- rank：form 40604 / lemma 8241 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「人员配备；员工安排」 / lemma「员工；职员；全体人员」
- ECDICT：form「[计] 人员指挥 [经] 配备职工」 / lemma「n. 全体人员, 工作班子, 棍棒, 杆, 拐杖, 支柱, 权杖 a. 职员的, 雇员的, 参谋的 vt. 为...配备…」
- **建议：`?`**

## brest → br
- rank：form 40618 / lemma 8639 ｜ type `t` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「布列斯特（地名）」 / lemma「BR（缩写；巴西/英国）」
- ECDICT：form「n. 布雷斯特（法国一座军港城市）」 / lemma「[计] 总线请求 [化] 生物试剂」
- **建议：`keep`**

## preconceived → preconceive
- rank：form 40709 / lemma 15800 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「预想的；先入为主的」 / lemma「预先构想，事先形成看法」
- ECDICT：form「a. 预想的, 先入为主的」 / lemma「vt. 事先认为」
- **建议：`?`**

## busses → bus
- rank：form 40729 / lemma 960 ｜ type `3` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「公共汽车（复数）」 / lemma「公共汽车」
- ECDICT：form「n. 汽车（bus的复数）」 / lemma「n. 公共汽车 [计] 总线; 汇流条; 母线」
- **建议：`?`**

## sponging → sponge
- rank：form 40761 / lemma 7225 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「白吃白拿；寄生于他人」 / lemma「海绵」
- ECDICT：form「[医] 海绵擦法」 / lemma「n. 海绵, 海绵状的东西 vt. 用海绵擦拭, 吸收掉, 抹掉 vi. 采集海绵, 海绵般吸收」
- **建议：`?`**

## fizzing → fizz
- rank：form 40800 / lemma 22877 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「嘶嘶冒泡」 / lemma「起泡；发出嘶嘶声」
- ECDICT：form「v. （液体, 通常指饮料）起泡, 发嘶嘶声( fizz的现在分词 )」 / lemma「vi. 嘶嘶响, 显示兴奋 n. 嘶嘶声, 兴奋, 活力」
- **建议：`?`**

## microns → micron
- rank：form 40864 / lemma 45747 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「微米（复数）」 / lemma「微米」
- ECDICT：form「n. 微米( micron的复数形式 )」 / lemma「n. 微米 [计] 微米」
- **建议：`keep`**

## eroding → erode
- rank：form 40914 / lemma 42015 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「侵蚀；腐蚀」 / lemma「侵蚀；逐渐削弱」
- ECDICT：form「v. 侵蚀, 腐蚀( erode的现在分词 ); 逐渐毁坏, 削弱, 损害」 / lemma「vt. 腐蚀, 侵蚀 vi. 受腐蚀」
- **建议：`keep`**

## stonewalling → stonewall
- rank：form 40936 / lemma 28024 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拖延阻挠；拒绝合作」 / lemma「拖延；阻挠」
- ECDICT：form「n. 防守挡击, 妨碍议事, 石墙」 / lemma「vi. 防守挡击, 围以石墙, 妨碍或阻碍」
- **建议：`?`**

## estes → este
- rank：form 41003 / lemma 24999 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「埃斯蒂斯（姓氏/地名）」 / lemma「埃斯特（人名）」
- ECDICT：form「(este 的复数) abbr. 工程的特殊试验设备（Engineering Special Test Equipmen…」 / lemma「abbr. 工程的特殊试验设备（Engineering Special Test Equipment）」
- **建议：`keep`**

## bounded → bound
- rank：form 41025 / lemma 2084 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有界的；受限制的」 / lemma「必定的；受约束的」
- ECDICT：form「a. 有界限的」 / lemma「n. 跃, 回跳, 范围, 边界 a. 受约束的, 装有封面的, 有义务的, 关联的, 被束缚的, 准备去...的, 便…」
- **建议：`?`**

## stoning → stone
- rank：form 41079 / lemma 4842 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「石刑；投石」 / lemma「石头；果核；宝石」
- ECDICT：form「n. 河床铺石」 / lemma「n. 石头, 宝石, 果核, 纪念碑, 结石 vt. 投扔石子, 铺石头 a. 石的, 石制的, 完全的」
- **建议：`?`**

## weenies → weeny
- rank：form 41102 / lemma 43520 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「小香肠；小人物」 / lemma「极小的；微小的」
- ECDICT：form「n. 微小的, 细小的( weenie的复数形式 )」 / lemma「a. 微小的, 细小的」
- **建议：`keep`**

## rhymed → rhyme
- rank：form 41153 / lemma 7387 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「押韵；作韵诗」 / lemma「韵；押韵诗」
- ECDICT：form「a. 押韵的」 / lemma「n. 韵, 押韵, 韵文 vi. 押韵 vt. 使押韵, 用韵诗表达」
- **建议：`?`**

## tibetans → tibetan
- rank：form 41167 / lemma 16190 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「藏族人；西藏人」 / lemma「西藏的；藏语」
- ECDICT：form「n. 藏族 a. 藏族的」 / lemma「a. 西藏的 n. 藏语, 西藏人」
- **建议：`keep`**

## diagnoses → diagnose
- rank：form 41172 / lemma 12600 ｜ type `3` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「诊断（复数）」 / lemma「诊断；判断」
- ECDICT：form「pl. 诊断, 判断, 调查分析」 / lemma「v. 诊断」
- **建议：`?`**

## diagnoses → diagnosis
- rank：form 41172 / lemma 12000 ｜ type `s` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「诊断（复数）」 / lemma「诊断；识别疾病」
- ECDICT：form「pl. 诊断, 判断, 调查分析」 / lemma「n. 诊断 [计] 诊断」
- **建议：`?`**

## frenchies → frenchy
- rank：form 41254 / lemma 19061 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「法国人（昵称）；法斗」 / lemma「法国式的；法国味」
- ECDICT：form「(Frenchy 的复数) a. 法国式的, 法国风味的 n. 法国人」 / lemma「a. 法国式的, 法国风味的 n. 法国人」
- **建议：`keep`**

## venetians → venetian
- rank：form 41306 / lemma 17257 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「威尼斯人；百叶窗」 / lemma「威尼斯的」
- ECDICT：form「(Venetian 的复数) a. 威尼斯的 n. 威尼斯人」 / lemma「a. 威尼斯的 n. 威尼斯人」
- **建议：`keep`**

## reacquainted → reacquaint
- rank：form 41361 / lemma 47357 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「重新熟悉；再次结识」 / lemma「重新熟悉；使再认识」
- ECDICT：form「(reacquaint 的过去分词) vt. 重新认识, 重新熟悉」 / lemma「vt. 重新认识, 重新熟悉」
- **建议：`keep`**

## condoning → condon
- rank：form 41423 / lemma 40844 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper, homograph`
- kind：form `loan` / lemma `proper`
- 词库 gloss：form「宽恕；纵容」 / lemma「康登（人名）」
- ECDICT：form「v. 容忍, 宽恕, 原谅( condone的现在分词 )」 / lemma「n. 康登（姓氏）」
- **建议：`keep`**

## condoning → condone
- rank：form 41423 / lemma 17000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「宽恕；纵容」 / lemma「宽恕，容忍」
- ECDICT：form「v. 容忍, 宽恕, 原谅( condone的现在分词 )」 / lemma「vt. 赦, 宽恕 [法] 宽恕, 不咎, 抵销」
- **建议：`?`**

## manhandled → manhandle
- rank：form 41557 / lemma 47149 ｜ type `p` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「粗暴对待（过去式）」 / lemma「粗暴对待；用力搬动」
- ECDICT：form「[电影]狼溪」 / lemma「vt. 人工推动, 粗暴地对付」
- **建议：`keep`**

## bungling → bungle
- rank：form 41628 / lemma 43490 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「笨手笨脚的」 / lemma「搞砸；笨手笨脚地做」
- ECDICT：form「a. 笨拙的, 粗劣的」 / lemma「v. 拙劣地工作, 粗制滥造, 把...搞糟 n. 粗劣, 失误, 笨拙」
- **建议：`keep`**

## swatches → swatch
- rank：form 41685 / lemma 47568 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「样品布；色卡」 / lemma「样品；色卡；布样」
- ECDICT：form「(swatch 的复数) n. 样品, 样本」 / lemma「n. 样品, 样本」
- **建议：`keep`**

## interlocking → interlock
- rank：form 41720 / lemma 13000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「互锁的；联锁的」 / lemma「互锁，连结」
- ECDICT：form「a. 连锁的 [化] 咬合; 咬合作用」 / lemma「v. (使)连结, (使)连锁 n. 连锁, 连结 [计] 相关; 互锁」
- **建议：`?`**

## overthrew → overthrow
- rank：form 41785 / lemma 11591 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「推翻；打倒」 / lemma「推翻；打倒」
- ECDICT：form「overthrow的过去式」 / lemma「n. 推翻, 瓦解, 倾覆 vt. 打倒, 推翻, 倾覆」
- **建议：`?`**

## leant → lean
- rank：form 41793 / lemma 5910 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「倚靠；倾斜（英式过去式）」 / lemma「倾斜；倚靠；倾向」
- ECDICT：form「lean的过去式和过去分词」 / lemma「n. 瘦肉, 倾斜, 倾斜度 a. 瘦的, 贫乏的, 歉收的 vi. 倚靠, 倾斜, 依赖 vt. 使倾斜」
- **建议：`?`**

## jellybeans → jellybean
- rank：form 41827 / lemma 41890 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「软心豆粒糖」 / lemma「软心豆粒糖」
- ECDICT：form「(jellybean 的复数) n.豆形软糖的一种」 / lemma「n. 豆形软糖的一种」
- **建议：`keep`**

## redesigned → redesign
- rank：form 41833 / lemma 31761 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「重新设计（过去式）」 / lemma「重新设计」
- ECDICT：form「a. 修订的, 重建的, 重新设计的 v. 重新设计( redesign的过去式和过去分词 )」 / lemma「[化] 重新设计」
- **建议：`keep`**

## morphing → morph
- rank：form 41958 / lemma 22960 ｜ type `i` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「变形；变体（现在分词）」 / lemma「变形；变体」
- ECDICT：form「n. 变形」 / lemma「[计] 形态, 词态」
- **建议：`keep`**

## egging → eg
- rank：form 41992 / lemma 43825 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent, homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「怂恿；鼓励」 / lemma「例如（缩写）」
- ECDICT：form「vt. 煽动, 怂恿（egg的现在分词形式） n. 在烹调中将蛋混入或敷在食品表面」 / lemma「abbr. [拉]例如（exempli gratia）；[网络用语]邪恶的笑（Evil Grin）」
- **建议：`keep`**

## egging → egg
- rank：form 41992 / lemma 780 ｜ type `i` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「怂恿；鼓励」 / lemma「蛋；卵」
- ECDICT：form「vt. 煽动, 怂恿（egg的现在分词形式） n. 在烹调中将蛋混入或敷在食品表面」 / lemma「n. 蛋, 卵 vt. 挑唆, 煽动, 调蛋黄」
- **建议：`?`**

## skyrocketed → skyrocket
- rank：form 42050 / lemma 36566 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「猛涨；飙升（过去式）」 / lemma「暴涨；猛增」
- ECDICT：form「v. 突升, 猛涨( skyrocket的过去式和过去分词 )」 / lemma「vi. 飞涨, 突升 n. 焰火」
- **建议：`?`**

## blitzed → blitz
- rank：form 42203 / lemma 14837 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「烂醉的；被闪电战袭击的」 / lemma「闪电战；突袭」
- ECDICT：form「a. 极累的, 烂醉如泥的 v. 用闪电战攻击( blitz的过去式 )」 / lemma「n. 闪电战 vt. 以闪电战攻击」
- **建议：`?`**

## dcs → dc
- rank：form 42239 / lemma 5510 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「DCS 系统（缩写）」 / lemma「直流电；华盛顿特区」
- ECDICT：form「[计] 分布式计算机系统」 / lemma「直流电 [计] 数据单元, 数据中心, 数据代码, 数据通信, 数据控制, 数字控制, 直流」
- **建议：`keep`**

## babylonians → babylonian
- rank：form 42272 / lemma 31927 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「巴比伦人（复数）」 / lemma「巴比伦的；巴比伦人」
- ECDICT：form「(Babylonian 的复数) a. 巴比伦的, 罪恶的」 / lemma「a. 巴比伦的, 罪恶的」
- **建议：`keep`**

## mentored → mentor
- rank：form 42283 / lemma 14000 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「指导；辅导（过去式）」 / lemma「导师，良师益友」
- ECDICT：form「v. （无经验之人的）有经验可信赖的顾问( mentor的过去式和过去分词 )」 / lemma「n. 指导者, 良师益友」
- **建议：`?`**

## cairns → cairn
- rank：form 42285 / lemma 43111 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「石堆；凯恩斯（地名）」 / lemma「石堆；石冢」
- ECDICT：form「n. 凯恩斯（澳大利亚港口）」 / lemma「n. 石堆纪念碑, 石冢, 堆石界标」
- **建议：`keep`**

## celebs → celeb
- rank：form 42354 / lemma 43284 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「名人（复数，口语）」 / lemma「名人（celebrity 的缩略）」
- ECDICT：form「n. [俚]名人；名流（celeb的复数）」 / lemma「n. 著明人士」
- **建议：`keep`**

## rhinestones → rhinestone
- rank：form 42421 / lemma 47400 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「莱茵石；人造钻石」 / lemma「人造钻石；莱茵石」
- ECDICT：form「n. 莱茵石, 人造钻石( rhinestone的复数形式 )」 / lemma「n. 莱茵石」
- **建议：`keep`**

## dominos → domino
- rank：form 42433 / lemma 15347 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「多米诺骨牌」 / lemma「多米诺骨牌」
- ECDICT：form「n. 多米诺骨牌（domino的复数形式）」 / lemma「n. 化装外衣, 面具, 骨牌, 多米诺骨牌」
- **建议：`?`**

## skied → ski
- rank：form 42753 / lemma 5134 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「滑雪（过去式）」 / lemma「滑雪板；滑雪」
- ECDICT：form「v. 滑雪( ski的过去式和过去分词 )」 / lemma「n. 滑雪橇 vi. 滑雪」
- **建议：`?`**

## skied → sky
- rank：form 42753 / lemma 390 ｜ type `pd` ｜ src `AB` ｜ flags `homograph`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滑雪（过去式）」 / lemma「天空」
- ECDICT：form「v. 滑雪( ski的过去式和过去分词 )」 / lemma「n. 天空, 天色, 天堂 vt. 击向空中, 挂在高处 vi. 高涨」
- **建议：`?`**

## scrolling → scroll
- rank：form 42798 / lemma 8945 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「滚动（屏幕）」 / lemma「滚动（屏幕）；卷轴」
- ECDICT：form「n. 卷动」 / lemma「n. 卷轴, 画卷, 名册, 条幅, 滚动 v. (使)成卷形 [计] 滚动」
- **建议：`?`**

## semis → semi
- rank：form 42834 / lemma 17494 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「半决赛；半挂车」 / lemma「半挂卡车；半（前缀）」
- ECDICT：form「n. 半制成品」 / lemma「[计] 半」
- **建议：`keep`**

## rechecked → recheck
- rank：form 42877 / lemma 30308 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「重新检查（过去式）」 / lemma「重新检查；复核」
- ECDICT：form「(recheck 的过去分词) [计] 复查 [化] 复验」 / lemma「[计] 复查 [化] 复验」
- **建议：`keep`**

## untying → untie
- rank：form 42891 / lemma 5577 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「解开；松开」 / lemma「解开；松开」
- ECDICT：form「untie的现在分词」 / lemma「vt. 解开 vi. 松开」
- **建议：`?`**

## reformers → reformer
- rank：form 42917 / lemma 43093 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「改革者（复数）」 / lemma「改革者；改良者」
- ECDICT：form「n. 社会改革者( reformer的复数形式 )」 / lemma「n. 改革家, 改革运动者 [化] 转化炉; 转化器; 重整器; 重整炉」
- **建议：`keep`**

## joyriding → joyride
- rank：form 42949 / lemma 26210 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「偷车兜风」 / lemma「偷车兜风；飙车」
- ECDICT：form「[法] 疯狂驱车, 偷车者」 / lemma「n. 驾车兜风, 偷车乱开, 乘汽车兜风, 追求享受的行动, 胡作非为」
- **建议：`?`**

## humoring → humor
- rank：form 42952 / lemma 3168 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「迁就；纵容」 / lemma「幽默；心情」
- ECDICT：form「v. 迎合, 牵就, 顺应( humor的现在分词 )」 / lemma「n. 幽默, 诙谐, 心情 vt. 迎合, 牵就, 顺应」
- **建议：`?`**

## chinamen → chinaman
- rank：form 43150 / lemma 15721 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「（旧，贬）中国人」 / lemma「中国佬（贬义）；中国人」
- ECDICT：form「n. 中国佬」 / lemma「n. 中国佬」
- **建议：`keep`**

## unnerved → unnerve
- rank：form 43235 / lemma 47656 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「使紧张；使失去勇气」 / lemma「使失去勇气；使不安」
- ECDICT：form「a. 气馁的, 丧失勇气的, 失常的, 烦恼不安的」 / lemma「vt. 使失去勇气, 使胆怯, 使不能自制 [医] 除神经」
- **建议：`keep`**

## phoenicians → phoenician
- rank：form 43344 / lemma 41703 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「腓尼基人」 / lemma「腓尼基的；腓尼基人」
- ECDICT：form「(Phoenician 的复数) a. 腓尼基的, 腓尼基人的 n. 腓尼基人」 / lemma「a. 腓尼基的, 腓尼基人的 n. 腓尼基人」
- **建议：`keep`**

## desiccated → desiccate
- rank：form 43382 / lemma 20500 ｜ type `d` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「干燥的；脱水的」 / lemma「使干燥，脱水；使（食物）干缩保存」
- ECDICT：form「a. 干的, 粉状的 v. 使干燥(desiccate的过去式); 变干」 / lemma「vt. 使干, 干贮 vi. 变干」
- **建议：`?`**

## crustaceans → crustacean
- rank：form 43466 / lemma 43632 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「甲壳类动物」 / lemma「甲壳类动物」
- ECDICT：form「n. 甲壳纲动物（如蟹、龙虾）( crustacean的复数形式 )」 / lemma「a. 甲壳纲的 n. 甲壳纲动物」
- **建议：`keep`**

## shelved → shelve
- rank：form 43494 / lemma 47466 ｜ type `d` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「搁置；置于架上」 / lemma「搁置；把…放架上」
- ECDICT：form「a. 搁置的；废置不用的」 / lemma「vt. 放置架子上, 搁置 vi. 渐渐倾斜」
- **建议：`keep`**

## teleporting → teleport
- rank：form 43524 / lemma 14426 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「瞬移；远距传送」 / lemma「瞬间移动；传送」
- ECDICT：form「v. （心灵学用语）心灵运输（物体、人）( teleport的现在分词 )」 / lemma「vt.(心灵学用语)心灵运输(物体、人)」
- **建议：`?`**

## pasting → paste
- rank：form 43578 / lemma 8331 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「粘贴；痛打」 / lemma「粘贴；涂抹」
- ECDICT：form「n. 裱糊, 涂；粘合」 / lemma「n. 面团, 面食, 浆糊, 糊状物, 粘贴, 用拳重击 vt. 用浆糊粘, 张贴, 狠狠地打 [计] 粘贴」
- **建议：`?`**

## brer → br
- rank：form 43616 / lemma 8639 ｜ type `r` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「兄弟（方言称呼）」 / lemma「BR（缩写；巴西/英国）」
- ECDICT：form「n. 兄弟」 / lemma「[计] 总线请求 [化] 生物试剂」
- **建议：`keep`**

## tacs → tac
- rank：form 43638 / lemma 17076 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「战术（缩写）」 / lemma「战术（tactical 缩写）」
- ECDICT：form「(TAC 的复数) [计] 东京大学自动计算机」 / lemma「[计] 东京大学自动计算机」
- **建议：`keep`**

## shanghaied → shanghai
- rank：form 43727 / lemma 3464 ｜ type `p` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「诱骗胁迫；被拐骗」 / lemma「上海」
- ECDICT：form「[电影]拐骗」 / lemma「n. 上海, 浦东鸡 a. 上海的, 上海时行的, 上海风格的 vt. 拐骗, 胁迫」
- **建议：`keep`**

## outpouring → outpour
- rank：form 43728 / lemma 21000 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「倾泻；情感流露」 / lemma「倾泻；流露」
- ECDICT：form「n. 注出, 流出, 流露」 / lemma「v. (使)注出, (使)流出 n. 注出, 流出, 流出物」
- **建议：`?`**

## quitted → quit
- rank：form 43750 / lemma 707 ｜ type `pd` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「离开；停止（quit 过去式）」 / lemma「停止；辞职」
- ECDICT：form「quit的过去式和过去分词」 / lemma「vi. 离开, 辞职, 停止 vt. 离开, 放弃, 使解除, 停止 n. 离开 [计] 结束, 退出」
- **建议：`?`**

## tus → tu
- rank：form 43798 / lemma 6620 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「图斯（缩写/地名）」 / lemma「你（法语借词）」
- ECDICT：form「[医] 咳」 / lemma「工会, 训练单位」
- **建议：`keep`**

## keywords → keyword
- rank：form 43837 / lemma 36687 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「关键词（复数）」 / lemma「关键词；关键字」
- ECDICT：form「n. 关键字 [计] 关键字」 / lemma「[计] 关键字」
- **建议：`keep`**

## bytes → byte
- rank：form 43856 / lemma 44032 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「字节（复数）」 / lemma「字节」
- ECDICT：form「n. 位元组, 字节数（byte的复数）；字节」 / lemma「n. 字节, 位组 [计] 字节」
- **建议：`keep`**

## collectables → collectable
- rank：form 43922 / lemma 46288 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「收藏品（复数）」 / lemma「可收集的；值得收藏的」
- ECDICT：form「(collectable 的复数) a. 可收集的, 可搜集的, 可征收的」 / lemma「a. 可收集的, 可搜集的, 可征收的」
- **建议：`keep`**

## pdas → pda
- rank：form 43952 / lemma 23699 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「个人数字助理（复数）」 / lemma「个人数字助理；公开亲昵」
- ECDICT：form「(PDA 的复数) [计] 个人数字助手」 / lemma「[计] 个人数字助手」
- **建议：`keep`**

## cached → cache
- rank：form 43977 / lemma 6915 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「缓存的；已缓存的」 / lemma「隐藏处；高速缓存」
- ECDICT：form「v. 贮藏起来；隐藏起来（cache 的过去分词形式）」 / lemma「n. 隐藏所, 隐藏的粮食或物资, 贮藏物, 高速缓冲存储器 vt. 隐藏, 窖藏 [计] 高速缓冲存储器, 高速缓冲」
- **建议：`?`**

## encoding → encode
- rank：form 44025 / lemma 45509 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「编码」 / lemma「编码；加密」
- ECDICT：form「[计] 编码」 / lemma「vt. 把(电文、情报等)译成密码 [计] 编码」
- **建议：`keep`**

## screenshots → screenshot
- rank：form 44045 / lemma 44163 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「屏幕截图（复数）」 / lemma「屏幕截图」
- ECDICT：form「(screenshot 的复数) 屏幕截图」 / lemma「屏幕截图」
- **建议：`keep`**

## sys → sy
- rank：form 44070 / lemma 15571 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「系统（缩写）」 / lemma「锡（化学符号Sy）」
- ECDICT：form「[计] DOS外部命令:将系统文件加入指定的磁盘」 / lemma「abbr. 平方码（square yard）；石油天然气行业标准；叙利亚（Syria）；苏丹黄（Sudan yellow…」
- **建议：`keep`**

## dns → dn
- rank：form 44075 / lemma 25804 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「域名系统（缩写）」 / lemma「DN（缩写）」
- ECDICT：form「[计] 分布式网络系统, 域名服务」 / lemma「[医] 分能母, 十分之一能母 [经] 下跌」
- **建议：`keep`**

## routers → router
- rank：form 44097 / lemma 26937 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「路由器（复数）」 / lemma「路由器；刨槽机」
- ECDICT：form「n. 路由器（router的复数）」 / lemma「[计] 路由器」
- **建议：`keep`**

## mls → ml
- rank：form 44116 / lemma 27099 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「多重上市服务（缩写）」 / lemma「毫升（millilitre 缩写）」
- ECDICT：form「abbr. 复式造表服务处（Multiple Listing Service）」 / lemma「法学硕士, 摩托艇, 汽艇 [医] 毫升」
- **建议：`keep`**

## reprints → reprint
- rank：form 44175 / lemma 44314 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「重印本（复数）」 / lemma「重印；再版」
- ECDICT：form「n. 重印书, 再版书( reprint的名词复数 ) v. 转载( reprint的第三人称单数 ); （书籍）重印,…」 / lemma「n. 再版, 翻版, 重印 vt. 再版, 翻版」
- **建议：`keep`**

## eds → ed
- rank：form 44243 / lemma 1300 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「EDS（电子数据系统）」 / lemma「埃德（人名）」
- ECDICT：form「abbr. 英语方言学会（English Dialect Society）；电子数据转换（Electronic Data…」 / lemma「[计] 电子设备, 密码设备, 数据结束, 工程设计, 错误检测, 外部设备」
- **建议：`keep`**

## postings → posting
- rank：form 44253 / lemma 10216 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「帖子；公告（复数）」 / lemma「帖子；邮寄」
- ECDICT：form「n. 任命, 委派( posting的复数形式 )」 / lemma「[计] 记入, 记录, 稿件, 邮件 [经] 过帐, 誊入总帐」
- **建议：`keep`**

## eos → eo
- rank：form 44275 / lemma 45309 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss, form-more-frequent`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「EOS（佳能相机系列）」 / lemma「环氧乙烷；执行命令（缩写）」
- ECDICT：form「n. 黎明女神 [计] 屏幕结束, 段结束, 步结束, 序列结束, 可扩充的操作系统」 / lemma「[计] 基本操作, 允许输出, 操作结束, 执行命令」
- **建议：`keep`**

## ies → ie
- rank：form 44441 / lemma 17127 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「后缀-ies；复数形式」 / lemma「即；也就是」
- ECDICT：form「[计]= Illuminating Engineering Society,照明工程协会」 / lemma「[计] 中断启动」
- **建议：`keep`**

## periodicals → periodical
- rank：form 44493 / lemma 45880 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「期刊；杂志（复数）」 / lemma「期刊」
- ECDICT：form「n. 期刊（periodical的名词复数形式）」 / lemma「n. 期刊 a. 定期出版的, (有关)期刊的, 间歇(性的), 周期的, 定期的」
- **建议：`keep`**

## refinancing → refinance
- rank：form 44518 / lemma 44002 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「重新融资；再融资」 / lemma「再融资；重新贷款」
- ECDICT：form「[经] 重新集资金」 / lemma「vt. 再为...筹钱, 再供...资金」
- **建议：`?`**

## exporters → exporter
- rank：form 44551 / lemma 44989 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「出口商」 / lemma「出口商」
- ECDICT：form「n. 出口商, 输出国( exporter的复数形式 )」 / lemma「n. 出口商, 输出者, 出口公司 [经] 出口商, 输出者」
- **建议：`keep`**

## authoring → author
- rank：form 44552 / lemma 4139 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「创作；编写」 / lemma「作者；作家」
- ECDICT：form「[计] 写作」 / lemma「n. 作家, 作家的著作, 创始人 [法] 作者, 著作人, 本人」
- **建议：`?`**

## analytics → analytic
- rank：form 44692 / lemma 45233 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「分析学；数据分析」 / lemma「分析的；解析的」
- ECDICT：form「n. 分析方法」 / lemma「a. 分析的, 善于分析的, 解析的 [医] 分析的」
- **建议：`keep`**

## ars → ar
- rank：form 44705 / lemma 7551 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「艺术（拉丁语复数）」 / lemma「啊（表示犹豫）」
- ECDICT：form「[计] 先进记录系统」 / lemma「[计] 应收款, 自动再启动, 辅助程式 [医] 紧急反应」
- **建议：`keep`**

## roms → rom
- rank：form 44788 / lemma 14279 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「只读存储器」 / lemma「罗姆（族群/缩写）」
- ECDICT：form「n. 吉卜赛男人（Rom的复数形式）」 / lemma「只读存储器 [计] 只读存储器」
- **建议：`keep`**

## benchmarks → benchmark
- rank：form 44791 / lemma 39044 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「基准；基准测试」 / lemma「基准；标准」
- ECDICT：form「n. 基准( benchmark的复数形式 )」 / lemma「[计] 基准程序; 基准」
- **建议：`keep`**

## ios → io
- rank：form 44797 / lemma 12200 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「苹果iOS操作系统」 / lemma「木卫一；输入输出」
- ECDICT：form「abbr. 网间网操作系统（Internet work 0perating System）；国际标准化组织（Intern…」 / lemma「[计] 输入输出」
- **建议：`keep`**

## yds → yd
- rank：form 44798 / lemma 45360 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「码（复数缩写）」 / lemma「码（长度单位缩写）」
- ECDICT：form「abbr. yards 码数」 / lemma「abbr. 码（yard）」
- **建议：`keep`**

## musings → musing
- rank：form 44895 / lemma 47200 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「沉思；冥想；随想」 / lemma「沉思；冥想」
- ECDICT：form「n. 沉思；冥思；冥想（musing的复数形式）」 / lemma「a. 沉思的, 冥想的」
- **建议：`keep`**

## aps → ap
- rank：form 44907 / lemma 13716 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「APS（缩写/代号）」 / lemma「美联社（缩略）」
- ECDICT：form「[计] 应付款系统, 应用程序支撑系统, 数组处理器软件, 汇编程序设计系统 [化] 腺苷酰硫酸」 / lemma「[计] 应付款, 美国专利, 应用程序, 运算处理器, 阵列处理器, 汇编程序 自动程序设计」
- **建议：`keep`**

## motorsports → motorsport
- rank：form 44929 / lemma 45696 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「赛车运动」 / lemma「赛车运动」
- ECDICT：form「(motorsport 的复数) n. 赛车运动; 摩托车运动」 / lemma「n. 赛车运动; 摩托车运动」
- **建议：`keep`**

## pollutants → pollutant
- rank：form 44959 / lemma 46059 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「污染物」 / lemma「污染物」
- ECDICT：form「n. 污染物质（尤指工业废物）( pollutant的复数形式 )」 / lemma「n. 污染物质 [法] 污染物」
- **建议：`keep`**

## uploads → upload
- rank：form 44960 / lemma 11612 ｜ type `3` ｜ src `B` ｜ flags `lemma-no-gloss, src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「上传」 / lemma「上传」
- ECDICT：form「v. 上传, 上载( upload的第三人称单数 )」 / lemma「[计] 上装, 加载, 储入」
- **建议：`keep`**

## nfs → nf
- rank：form 44964 / lemma 44583 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「网络文件系统」 / lemma「国家联盟；无氟缩写」
- ECDICT：form「[计] 网络的文件系统」 / lemma「[电] 千亿分之一法」
- **建议：`keep`**

## cpus → cpu
- rank：form 44979 / lemma 34918 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「中央处理器（复数）」 / lemma「中央处理器」
- ECDICT：form「(CPU 的复数) 中央处理器 [计] 中央处理器」 / lemma「中央处理器 [计] 中央处理器」
- **建议：`keep`**

## decals → decal
- rank：form 45003 / lemma 45437 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贴花；转印贴纸」 / lemma「贴花；贴纸」
- ECDICT：form「n. （陶器、玻璃器皿的）贴花釉法, 贴花纸( decal的复数形式 )」 / lemma「n. 贴花纸；贴花釉法」
- **建议：`keep`**

## macs → mac
- rank：form 45004 / lemma 2021 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「麦金塔电脑；雨衣」 / lemma「麦克（人名）；雨衣」
- ECDICT：form「abbr. 多元自控系统（Multiproject Automated Control System）；中高度通信卫星（…」 / lemma「n. 防水胶布, (英)雨衣, 老兄, 老弟 [计] 宏, 多路存取计算机, 苹果公司的微机」
- **建议：`keep`**

## budgeting → budget
- rank：form 45043 / lemma 8223 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `mono`
- 词库 gloss：form「编制预算」 / lemma「预算；编制预算」
- ECDICT：form「[计] 预定, 预算 [经] 预算编制」 / lemma「n. 预算 vi. 编预算 vt. 编入预算, 安排 a. 廉价的」
- **建议：`?`**

## phs → ph
- rank：form 45054 / lemma 19825 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「缩写（公共卫生等）」 / lemma「pH值；酸碱度」
- ECDICT：form「(pH 的复数) 氢离子指数 [医] 药典; 苯基」 / lemma「氢离子指数 [医] 药典; 苯基」
- **建议：`keep`**

## authored → author
- rank：form 45118 / lemma 4139 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「创作；撰写」 / lemma「作者；作家」
- ECDICT：form「vt. 编写, 创作(author的过去式, 过去分词)」 / lemma「n. 作家, 作家的著作, 创始人 [法] 作者, 著作人, 本人」
- **建议：`?`**

## ics → ic
- rank：form 45123 / lemma 38470 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「ICS（缩写，如互联网连接共享）」 / lemma「（后缀）…的；IC 缩写」
- ECDICT：form「abbr. 国际外科医生协会（International College of Surgeons）；因特网连接共享（In…」 / lemma「集成电路 [计] 识别码, 指令单元, 互连, 内部通信, 集成电路」
- **建议：`keep`**

## synonyms → synonym
- rank：form 45459 / lemma 46214 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「同义词」 / lemma「同义词」
- ECDICT：form「n. 同义词( synonym的名词复数 )」 / lemma「n. 同义词」
- **建议：`keep`**

## admins → admin
- rank：form 45510 / lemma 19844 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「管理员（复数）」 / lemma「管理；管理员」
- ECDICT：form「abbr. 管理员（administrators）」 / lemma「[计] 行政管理程序」
- **建议：`keep`**

## benchmarking → benchmark
- rank：form 45516 / lemma 39044 ｜ type `i` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「基准测试；标杆管理」 / lemma「基准；标准」
- ECDICT：form「[计] 确定基准点, 标记」 / lemma「[计] 基准程序; 基准」
- **建议：`keep`**

## seahawks → seahawk
- rank：form 45556 / lemma 42664 ｜ type `s` ｜ src `A` ｜ flags `lemma-no-gloss, src-a-only`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「海鹰队（西雅图球队）」 / lemma「海鹰（球队名/鸟）」
- ECDICT：form「海鹰队」 / lemma「」
- **建议：`keep`**

## cts → ct
- rank：form 45691 / lemma 8260 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「腕管综合征」 / lemma「（缩写）法院；康涅狄格州」
- ECDICT：form「[计] 清除发送, 同步通信终端, 用户事务处理系统, 对话式终端服务 [经] 美分」 / lemma「计算机断层扫描 [计] 通信终端, 计算机终端, 计算机断层造影, 计数器」
- **建议：`keep`**

## cfs → cf
- rank：form 45703 / lemma 34931 ｜ type `3` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「慢性疲劳综合征」 / lemma「参见；比较」
- ECDICT：form「abbr. 立方尺/秒（cubic feet per second）」 / lemma「[医] 克里斯马斯因子, 补体结合」
- **建议：`keep`**

## dems → dem
- rank：form 45769 / lemma 16597 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「民主党人（缩写）」 / lemma「他们（口语/方言）」
- ECDICT：form「(DEM 的复数) [计] 解调器」 / lemma「[计] 解调器」
- **建议：`keep`**

## jays → jay
- rank：form 45813 / lemma 2186 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「松鸦（复数）」 / lemma「杰伊（男子名）；松鸦」
- ECDICT：form「n. 鸟, 松鸡；橿鸟（jay的复数形式）」 / lemma「n. 鸟, 喋喋不休的人, 傻瓜」
- **建议：`keep`**

## pps → pp
- rank：form 45844 / lemma 24379 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「每秒脉冲数」 / lemma「页（pages缩写）；钢琴弱奏」
- ECDICT：form「[计] 脉冲/秒」 / lemma「包裹邮递, 包裹邮件, 邮包, 包裹邮务处, 过去分词 [计] 并行打印, 并行处理器, 打印位置」
- **建议：`keep`**

## shelving → shelve
- rank：form 45877 / lemma 47466 ｜ type `i` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「架子；搁置」 / lemma「搁置；把…放架上」
- ECDICT：form「n. 一组搁板, 搁板材料, 倾斜, 倾斜度, 斜坡」 / lemma「vt. 放置架子上, 搁置 vi. 渐渐倾斜」
- **建议：`keep`**

## factoring → factor
- rank：form 45925 / lemma 4572 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「保理；因式分解」 / lemma「因素；要素」
- ECDICT：form「[计] 因子分解, 提取公因子, 配置, 排列 [经] 贷款保收, 应收帐款让售」 / lemma「n. 因素, 因数, 系数, 基因, 代理人 [计] 因式」
- **建议：`?`**

## eas → ea
- rank：form 45972 / lemma 27506 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「电子商品防盗系统」 / lemma「每个（缩写）」
- ECDICT：form「abbr. 电子防窃系统（Electronic Article Surveillance）；企业应用套件（Enterpr…」 / lemma「[计] 有效地址, 单元动作, 外部访问 [医] 卵白蛋白, 红细胞抗体」
- **建议：`keep`**

## tablespoons → tablespoon
- rank：form 46031 / lemma 47578 ｜ type `s` ｜ src `AB` ｜ flags `form-more-frequent`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「汤匙（量）」 / lemma「汤匙；大勺」
- ECDICT：form「n. 大汤匙, 大调羹( tablespoon的复数形式 ); 一大汤匙的量」 / lemma「n. 大汤匙 [医] 汤匙, 大匙(15毫升)」
- **建议：`keep`**

## birding → bird
- rank：form 46057 / lemma 590 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「观鸟」 / lemma「鸟」
- ECDICT：form「捕鸟, 玩鸟」 / lemma「n. 鸟, 羽毛球 vi. 打鸟」
- **建议：`?`**

## worksheets → worksheet
- rank：form 46248 / lemma 6174 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「工作表；练习页」 / lemma「工作表；工作单」
- ECDICT：form「(worksheet 的复数) [计] 工作表 [化] 工作单; 加工单」 / lemma「[计] 工作表 [化] 工作单; 加工单」
- **建议：`keep`**

## underwriting → underwrite
- rank：form 46284 / lemma 18600 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「承保；包销」 / lemma「承保；签署担保」
- ECDICT：form「n. 保险业 [经] (海上)保险业, 证券包销」 / lemma「vt. 签名于下, 给...保险 vi. 经营保险业」
- **建议：`?`**

## avs → av
- rank：form 46307 / lemma 20223 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `mono`
- 词库 gloss：form「AVS（视频编码标准）」 / lemma「视听设备；音频视频」
- ECDICT：form「abbr. 数字音视频编解码技术标准（Audio Video Standard）」 / lemma「[计] 数组/向量, 属性值, 有效, 平均值」
- **建议：`keep`**

## gifs → gif
- rank：form 46309 / lemma 44112 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「GIF 图片（复数）」 / lemma「GIF（图像格式）」
- ECDICT：form「(GIF 的复数) [计] 图象交换格式」 / lemma「[计] 图象交换格式」
- **建议：`keep`**

## tds → td
- rank：form 46344 / lemma 43575 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「TDS（总溶解固体缩写）」 / lemma「达阵（橄榄球）；TD缩写」
- ECDICT：form「[化] 热脱附谱」 / lemma「abbr. （美）财政部（Treasury Department）；任务说明书（Task Description）；反坦…」
- **建议：`keep`**

## provisioning → provision
- rank：form 46348 / lemma 18241 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「供给；配置；储备」 / lemma「供应；条款；给养」
- ECDICT：form「[经] 物质供应」 / lemma「n. (政府提供的)钱和设备, 准备, 供应品, 规定, 条款 vt. 供给...食物及必需品」
- **建议：`?`**

## fas → fa
- rank：form 46351 / lemma 6795 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `proper` / lemma `loan`
- 词库 gloss：form「胎儿酒精综合征（缩写）」 / lemma「（音阶）fa；全音阶第四音」
- ECDICT：form「船边交货(价格)」 / lemma「(英国)足球协会, 战地救护车, 野战救护队, 野战炮, 野战炮兵, 美术, 急救 [医] 脂肪酸」
- **建议：`keep`**

## acing → ace
- rank：form 46376 / lemma 3471 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「轻松通过；得A（现在分词）」 / lemma「王牌；高手」
- ECDICT：form「vt. 发球得分（ace的现在分词形式）」 / lemma「n. 幺点, 好手, 少许, 发球得分 a. 一流的, 杰出的 [计] 应答允许, 自适应计算机试验, 自动呼叫设备, …」
- **建议：`?`**

## antiquing → antique
- rank：form 46414 / lemma 5998 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「做旧；淘古董（现在分词）」 / lemma「古董的；古老的」
- ECDICT：form「打光」 / lemma「n. 古董, 古物 a. 古老的, 古风的, 旧式的, 过时的」
- **建议：`?`**

## bankrolled → bankroll
- rank：form 46441 / lemma 23451 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「为…提供资金」 / lemma「资助；提供资金」
- ECDICT：form「v. 提供资金( bankroll的过去式和过去分词 )」 / lemma「n. 一卷钞票, 资金 vt. 提供资金」
- **建议：`?`**

## benching → bench
- rank：form 46456 / lemma 4884 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「让…坐冷板凳」 / lemma「长凳；工作台」
- ECDICT：form「n. 钳工加工；阶梯式开采；台阶式挖土法 v. 形成阶地；为…设置条凳（bench的ing形式）」 / lemma「n. 长椅子 [机] 台」
- **建议：`?`**

## bluest → blu
- rank：form 46476 / lemma 32199 ｜ type `t` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「最蓝的；最忧郁的」 / lemma「蓝色的（变体）」
- ECDICT：form「a. 蓝色的, 天蓝色的, 海蓝色的, 蔚蓝(色)的；(皮肤)青黑色的, 青灰色的, 青紫色的；(脸色)发青的, 发灰的…」 / lemma「[计] 基本连接单元」
- **建议：`keep`**

## bottomed → bottom
- rank：form 46487 / lemma 962 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「有底的；触底的」 / lemma「底部；臀部」
- ECDICT：form「...底的, 底是...的」 / lemma「n. 底部 a. 底部的 vt. 给...装底, 查明真相 vi. 到达底部, 建立基础」
- **建议：`?`**

## bussing → bus
- rank：form 46524 / lemma 960 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「当餐厅杂工；用巴士运送」 / lemma「公共汽车」
- ECDICT：form「n. 公共汽车接送, 用校车接送学生 [计] 连接」 / lemma「n. 公共汽车 [计] 总线; 汇流条; 母线」
- **建议：`?`**

## cataloging → catalog
- rank：form 46555 / lemma 12047 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「编目；分类」 / lemma「目录；商品目录」
- ECDICT：form「[计] 编目」 / lemma「n. 目录, 大学概况手册 vt. 编目录 [计] 目录; 编目」
- **建议：`?`**

## chaperoned → chaperon
- rank：form 46567 / lemma 42462 ｜ type `d` ｜ src `AB` ｜ flags `homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「陪伴；护送」 / lemma「陪护人；监护人」
- ECDICT：form「v. 作女子陪伴人, 作监护人( chaperone的过去式 )」 / lemma「n. 年长女伴 vt. 伴护」
- **建议：`?`**

## chaperoned → chaperone
- rank：form 46567 / lemma 13713 ｜ type `p` ｜ src `B` ｜ flags `src-b-only, homograph`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「陪伴；护送」 / lemma「陪护人；监护人」
- ECDICT：form「v. 作女子陪伴人, 作监护人( chaperone的过去式 )」 / lemma「n. 年长女伴 vt. 伴护」
- **建议：`?`**

## charlies → charly
- rank：form 46569 / lemma 15783 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `proper` / lemma `proper`
- 词库 gloss：form「查理（人名复数；越共俚语）」 / lemma「查理（人名）」
- ECDICT：form「n. ＝Charley」 / lemma「n. 情事不可挡（电影名）；查理（男子名）」
- **建议：`keep`**

## chloroformed → chloroform
- rank：form 46581 / lemma 17166 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「用氯仿麻醉」 / lemma「氯仿；三氯甲烷」
- ECDICT：form「v. （用作麻醉剂的）氯仿, 三氯甲烷( chloroform的过去式和过去分词 )」 / lemma「n. 氯仿 vt. 用氯仿麻醉」
- **建议：`?`**

## combusted → combust
- rank：form 46612 / lemma 46611 ｜ type `d` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「燃烧了；烧毁（过去式）」 / lemma「燃烧；烧毁」
- ECDICT：form「vt. 燃烧；消耗 n. 燃料」 / lemma「[建] 燃料」
- **建议：`keep`**

## coopers → cooper
- rank：form 46632 / lemma 2570 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「制桶工人（复数）」 / lemma「库珀（姓氏/男子名）」
- ECDICT：form「n. 桶匠, 制桶工人, 修桶工 vt. 制造(桶)；修理(桶) vi. 干桶匠的活, 箍桶；修桶」 / lemma「n. 制桶工人 v. 制桶」
- **建议：`keep`**

## coveting → covet
- rank：form 46645 / lemma 22103 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「贪求；垂涎」 / lemma「贪求；垂涎」
- ECDICT：form「v. 贪求, 觊觎( covet的现在分词 )」 / lemma「v. 妄想, 垂涎」
- **建议：`?`**

## eking → ek
- rank：form 46789 / lemma 31633 ｜ type `i` ｜ src `AB` ｜ flags `lemma-proper, lemma-no-gloss`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「勉强维持；竭力获得」 / lemma「埃克（人名/字母）」
- ECDICT：form「v. 增加；延长（eke的ing 形式）」 / lemma「柯达公司」
- **建议：`keep`**

## enrolling → enroll
- rank：form 46805 / lemma 19389 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「注册；招收」 / lemma「注册；登记」
- ECDICT：form「n. 入学；登记」 / lemma「vt. 登记, 使加入 vi. 参军, 注册」
- **建议：`?`**

## focussed → focus
- rank：form 46863 / lemma 1200 ｜ type `dp` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「专注的；集中的」 / lemma「集中；聚焦」
- ECDICT：form「n. [物理学]焦点；[光学](镜头的)焦点, 焦距 vt. 使聚焦, 使集中于焦点：；调节(眼睛、透镜等的)焦距；定……」 / lemma「n. 焦点, 焦距 vi. 聚焦, 注视 vt. 使聚焦, 调焦, 集中 [计] 焦点」
- **建议：`?`**

## focussing → focus
- rank：form 46864 / lemma 1200 ｜ type `i` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「集中；聚焦」 / lemma「集中；聚焦」
- ECDICT：form「[计] 聚焦」 / lemma「n. 焦点, 焦距 vi. 聚焦, 注视 vt. 使聚焦, 调焦, 集中 [计] 焦点」
- **建议：`?`**

## galling → gall
- rank：form 46894 / lemma 12258 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「令人恼怒的；可恨的」 / lemma「胆汁；厚颜无耻」
- ECDICT：form「a. 擦伤人的, 擦痛人的, 使烦恼的, 使焦躁的, 难堪的 [机] 擦伤」 / lemma「n. 胆汁, 五倍子, 苦味, 肿痛, 恼怒, 磨损处 vt. 烦恼, 屈辱, 磨伤 vi. 被磨伤」
- **建议：`?`**

## gerbils → gerbil
- rank：form 46908 / lemma 24416 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「沙鼠」 / lemma「沙鼠（宠物鼠）」
- ECDICT：form「n. 沙鼠( gerbil的复数形式 )」 / lemma「[医] 沙土鼠(南非传播鼠疫的啮齿动物)」
- **建议：`keep`**

## homers → homer
- rank：form 47013 / lemma 3592 ｜ type `s` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「本垒打；信鸽」 / lemma「荷马」
- ECDICT：form「(homer 的复数) n. 本垒打, 传信鸽」 / lemma「n. 本垒打, 传信鸽」
- **建议：`keep`**

## huggers → hugger
- rank：form 47026 / lemma 29172 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「紧身衣物；拥抱者」 / lemma「拥抱者；紧抱者」
- ECDICT：form「n. 劈理；极端派；拥抱者」 / lemma「极端派; 割理」
- **建议：`keep`**

## humored → humor
- rank：form 47032 / lemma 3168 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「迁就；纵容」 / lemma「幽默；心情」
- ECDICT：form「v. 迎合, 牵就, 顺应( humor的过去式和过去分词 )」 / lemma「n. 幽默, 诙谐, 心情 vt. 迎合, 牵就, 顺应」
- **建议：`?`**

## jimmies → jimmy
- rank：form 47085 / lemma 850 ｜ type `3` ｜ src `AB` ｜ flags `lemma-proper`
- kind：form `mono` / lemma `proper`
- 词库 gloss：form「（撒在冰淇淋上的）彩色糖粒」 / lemma「吉米（人名）」
- ECDICT：form「n. 铁撬( jimmy的名词复数 )」 / lemma「n. 铁撬 vt. 撬」
- **建议：`keep`**

## mangos → mango
- rank：form 47148 / lemma 9882 ｜ type `s` ｜ src `A` ｜ flags `src-a-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「芒果」 / lemma「芒果」
- ECDICT：form「n. 芒果（mango的复数形式）」 / lemma「n. 芒果 [化] 芒果Mangifera indica」
- **建议：`?`**

## misinterpreting → misinterpret
- rank：form 47171 / lemma 15200 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `-`
- 词库 gloss：form「误解（现在分词）」 / lemma「曲解，误解」
- ECDICT：form「v. 误解, 曲解( misinterpret的现在分词 )」 / lemma「vt. 曲解」
- **建议：`?`**

## quoth → quote
- rank：form 47346 / lemma 12000 ｜ type `p` ｜ src `A` ｜ flags `src-a-only`
- kind：form `mono` / lemma `-`
- 词库 gloss：form「（古）说；云」 / lemma「引用；报价」
- ECDICT：form「vt. [古]说」 / lemma「n. 引用 vt. 引述, 举证, 报(价) vi. 引用」
- **建议：`?`**

## rayed → ray
- rank：form 47356 / lemma 904 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「有射线的；放射状的」 / lemma「光线；射线」
- ECDICT：form「有射线的, 有边花的」 / lemma「n. 光线, 射线, 闪烁, 光辉 vi. 射出光线, 浮现, 放射光线 vt. 放射, 显出」
- **建议：`?`**

## rethought → rethink
- rank：form 47393 / lemma 11508 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「重新考虑（过去式）」 / lemma「重新考虑」
- ECDICT：form「v. 重新考虑或再想( rethink的过去式和过去分词 )」 / lemma「v. 再想, 重想」
- **建议：`?`**

## savored → savor
- rank：form 47434 / lemma 17708 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「品味；享受（过去式）」 / lemma「品味；细细体会」
- ECDICT：form「v. 意味, 带有…的性质( savor的过去式和过去分词 ); 给…加调味品; 使有风味; 品尝」 / lemma「n. 滋味, 气味, 食欲 vi. 有...的滋味 vt. 加调味品于, 使有风味, 尝到」
- **建议：`?`**

## savoring → savor
- rank：form 47435 / lemma 17708 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `loan` / lemma `loan`
- 词库 gloss：form「品味；细细体会」 / lemma「品味；细细体会」
- ECDICT：form「v. 意味, 带有…的性质( savor的现在分词 ); 给…加调味品; 使有风味; 品尝」 / lemma「n. 滋味, 气味, 食欲 vi. 有...的滋味 vt. 加调味品于, 使有风味, 尝到」
- **建议：`?`**

## snowballed → snowball
- rank：form 47497 / lemma 13388 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滚雪球般扩大」 / lemma「雪球；滚雪球式增长」
- ECDICT：form「v. （计划、问题等）滚雪球似地迅速增大( snowball的过去式和过去分词 ); 根本不可能（做某事）, 机会渺茫」 / lemma「n. 雪球, 果味冰霜卷, 滚雪球式的募捐法 vt. 向...丢雪球, 使滚雪球般增长 vi. 打雪仗, 滚雪球般增长」
- **建议：`?`**

## snowballing → snowball
- rank：form 47498 / lemma 13388 ｜ type `i` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「滚雪球般增长」 / lemma「雪球；滚雪球式增长」
- ECDICT：form「v. （计划、问题等）滚雪球似地迅速增大( snowball的现在分词 ); 根本不可能（做某事）, 机会渺茫」 / lemma「n. 雪球, 果味冰霜卷, 滚雪球式的募捐法 vt. 向...丢雪球, 使滚雪球般增长 vi. 打雪仗, 滚雪球般增长」
- **建议：`?`**

## stonewalled → stonewall
- rank：form 47541 / lemma 28024 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「拖延；拒绝合作」 / lemma「拖延；阻挠」
- ECDICT：form「v. （用冗长发言或拒绝回答问题等）拖延[阻碍]议事, 设置障碍( stonewall的过去式和过去分词 ); 拒绝执行…」 / lemma「vi. 防守挡击, 围以石墙, 妨碍或阻碍」
- **建议：`?`**

## ticketed → ticket
- rank：form 47599 / lemma 1167 ｜ type `p` ｜ src `B` ｜ flags `src-b-only`
- kind：form `mono` / lemma `loan`
- 词库 gloss：form「已购票的；被开罚单的」 / lemma「票；入场券」
- ECDICT：form「vt. 售票（ticket的过去式与过去分词形式）」 / lemma「n. 票, 券, 车票, 标签, 入场券, 证明书 vt. 加标签于, 为...购票」
- **建议：`?`**

## tippers → tipper
- rank：form 47604 / lemma 26374 ｜ type `s` ｜ src `AB` ｜ flags `lemma-no-gloss`
- kind：form `mono` / lemma `mono`
- 词库 gloss：form「给小费者；倾倒者（复数）」 / lemma「给小费的人；翻斗车」
- ECDICT：form「(tipper 的复数) [化] 翻斗车」 / lemma「[化] 翻斗车」
- **建议：`keep`**

