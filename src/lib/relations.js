export const RELATION_META = {
  synonym: { key: 'synonym', label: '近义', color: '#16a34a', dash: '7 5', width: [2.6, 2, 1.5] },
  antonym: { key: 'antonym', label: '反义', color: '#dc2626', dash: '2 4', width: [2.6, 2, 1.5] },
}

/** 无向关系键：端点按字典序排列。 */
export function pairKey(a, b) {
  return String(a) <= String(b) ? `${a}|${b}` : `${b}|${a}`
}

function emptyRelationIndex() {
  return {
    syn: new Map(),
    ant: new Map(),
    conflicts: [],
    unresolved: [],
    duplicates: 0,
    stats: {
      synonymPairs: 0,
      antonymPairs: 0,
      duplicates: 0,
      unresolved: 0,
      conflicts: 0,
      wordsWithSyn: 0,
      wordsWithAnt: 0,
    },
    pairs: [],
  }
}

function normalizeGrade(grade) {
  const number = Number(grade)
  return Number.isInteger(number) && number >= 1 && number <= 3 ? number : 2
}

function appendNote(current, incoming) {
  const notes = [current, incoming]
    .flatMap((value) => String(value || '').split('；'))
    .map((value) => value.trim())
    .filter(Boolean)
  return [...new Set(notes)].join('；')
}

function addNeighbor(map, source, target, pair) {
  if (!map.has(source.id)) map.set(source.id, [])
  map.get(source.id).push({
    id: target.id,
    form: target.form,
    grade: pair.grade,
    ...(pair.note ? { note: pair.note } : {}),
  })
}

/**
 * 构建无向近义 / 反义索引。
 * 端点先按 id 命中，再按不区分大小写的完整词形命中。
 */
export function buildRelations(words = [], raw = {}, opts = {}) {
  const list = Array.isArray(words) ? words : []
  const source = raw && typeof raw === 'object' ? raw : {}
  const byId = new Map()
  const byForm = new Map()
  list.forEach((word) => {
    if (!word || !word.id) return
    byId.set(word.id, word)
    if (typeof word.form === 'string') {
      const key = word.form.toLowerCase()
      if (!byForm.has(key)) byForm.set(key, word)
    }
  })

  const resolve = (value) => {
    if (value == null) return null
    const key = String(value)
    return byId.get(key) || byForm.get(key.toLowerCase()) || null
  }

  const unresolved = []
  let duplicates = 0
  const normalizeType = (items, type) => {
    const unique = new Map()
    const rawItems = Array.isArray(items) ? items : []
    rawItems.forEach((item, rawIndex) => {
      const aWord = resolve(item?.a)
      const bWord = resolve(item?.b)
      if (!aWord || !bWord || aWord.id === bWord.id) {
        unresolved.push({
          type,
          index: rawIndex,
          a: item?.a ?? null,
          b: item?.b ?? null,
          reason: !aWord || !bWord ? '端点无法解析' : '关系端点相同',
        })
        return
      }
      const key = pairKey(aWord.id, bWord.id)
      const ordered = aWord.id <= bWord.id ? [aWord, bWord] : [bWord, aWord]
      const next = {
        pairKey: key,
        a: ordered[0].id,
        b: ordered[1].id,
        aForm: ordered[0].form,
        bForm: ordered[1].form,
        grade: normalizeGrade(item?.grade),
        ...(item?.note ? { note: String(item.note) } : {}),
      }
      const previous = unique.get(key)
      if (!previous) {
        unique.set(key, next)
        return
      }
      duplicates += 1
      previous.grade = Math.min(previous.grade, next.grade)
      const note = appendNote(previous.note, next.note)
      if (note) previous.note = note
      else delete previous.note
    })
    return unique
  }

  const synonymPairs = normalizeType(source.synonyms, 'synonym')
  const antonymPairs = normalizeType(source.antonyms, 'antonym')
  const conflicts = []
  synonymPairs.forEach((synonym, key) => {
    const antonym = antonymPairs.get(key)
    if (!antonym) return
    conflicts.push({
      pairKey: key,
      a: synonym.a,
      b: synonym.b,
      aForm: synonym.aForm,
      bForm: synonym.bForm,
      synGrade: synonym.grade,
      antGrade: antonym.grade,
    })
  })
  conflicts.sort((a, b) => a.pairKey.localeCompare(b.pairKey))

  const syn = new Map()
  const ant = new Map()
  const populate = (pairMap, adjacency) => {
    pairMap.forEach((pair) => {
      const aWord = byId.get(pair.a)
      const bWord = byId.get(pair.b)
      if (!aWord || !bWord) return
      addNeighbor(adjacency, aWord, bWord, pair)
      addNeighbor(adjacency, bWord, aWord, pair)
    })
    adjacency.forEach((neighbors) => {
      neighbors.sort((a, b) => a.grade - b.grade || a.form.localeCompare(b.form) || a.id.localeCompare(b.id))
    })
  }
  populate(synonymPairs, syn)
  populate(antonymPairs, ant)

  const synonymList = [...synonymPairs.values()].sort((a, b) => a.pairKey.localeCompare(b.pairKey))
  const antonymList = [...antonymPairs.values()].sort((a, b) => a.pairKey.localeCompare(b.pairKey))
  const stats = {
    synonymPairs: synonymList.length,
    antonymPairs: antonymList.length,
    duplicates,
    unresolved: unresolved.length,
    conflicts: conflicts.length,
    wordsWithSyn: syn.size,
    wordsWithAnt: ant.size,
  }
  const pairs = [
    ...synonymList.map((pair) => ({ ...pair, type: 'synonym' })),
    ...antonymList.map((pair) => ({ ...pair, type: 'antonym' })),
  ]
  const index = {
    syn,
    ant,
    conflicts,
    unresolved,
    duplicates,
    stats,
    pairs,
  }
  if (opts && opts.freeze === true) Object.freeze(index.stats)
  return index
}

/** 返回单词的双向近义 / 反义邻接表。 */
export function relationsOf(index, wordId) {
  if (!index || !wordId) return { synonyms: [], antonyms: [] }
  return {
    synonyms: index.syn instanceof Map ? index.syn.get(wordId) || [] : [],
    antonyms: index.ant instanceof Map ? index.ant.get(wordId) || [] : [],
  }
}

/** 生成可直接打印或序列化的关系汇总。 */
export function relationReport(index, words = []) {
  const safeIndex = index && index.stats ? index : emptyRelationIndex()
  const list = Array.isArray(words) ? words : []
  return {
    wordTotal: list.length,
    morphlessTotal: list.filter((word) => word?.morphless === true).length,
    ...safeIndex.stats,
    conflicts: Array.isArray(safeIndex.conflicts) ? safeIndex.conflicts.map((item) => ({ ...item })) : [],
  }
}
