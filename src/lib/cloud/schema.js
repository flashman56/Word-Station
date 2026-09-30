/**
 * 云端数据访问层的唯一「列名转换点」
 * ------------------------------------------------------------------
 * 约定：数据库 snake_case ↔ 前端 camelCase，转换只在本文件发生，
 * 其他任何文件都不得出现 next_due_at 之类的裸列名。
 *
 * 同时提供：
 *   - TABLES：表名常量
 *   - 各表的行转换器（toRow / fromRow）
 *   - 写入口断言 assertNoSrsFields()：DB 里禁止出现 ease/interval/lapses/reps
 */

export const TABLES = {
  profiles: 'profiles',
  stations: 'stations',
  stationWords: 'station_words',
  userWords: 'user_words',
  learnRecords: 'learn_records',
  dictCache: 'dict_cache',
  generationUsage: 'generation_usage',
}

/** 调度红线：这四个字段一旦出现就是引入了 SRS 参数，写入前直接抛错 */
const FORBIDDEN_SRS_FIELDS = ['ease', 'interval', 'lapses', 'reps']

/**
 * 断言对象（含嵌套）不含任何 SRS 字段。
 * @param {object} obj
 * @param {string} [where]
 * @throws {Error} 命中禁止字段
 */
export function assertNoSrsFields(obj, where = 'payload') {
  if (!obj || typeof obj !== 'object') return
  Object.keys(obj).forEach((k) => {
    if (FORBIDDEN_SRS_FIELDS.includes(k)) {
      throw new Error(`[schema] ${where} 出现禁止的 SRS 字段「${k}」：本项目只有 nextDueAt = 答错 +24h 一条调度规则`)
    }
  })
}

/** ISO 时间字符串；null 原样返回（Postgres 可空列） */
export function isoOrNull(v) {
  if (v == null || v === '') return null
  if (v instanceof Date) return v.toISOString()
  return typeof v === 'string' ? v : null
}

/** 数字或 null */
export function intOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

// ---------------------------------------------------------------- stations

/** @param {object} s 前端 Station */
export function stationToRow(s) {
  return {
    id: s.id,
    owner_id: s.ownerId,
    name: s.name,
    pinned: Boolean(s.pinned),
    created_at: isoOrNull(s.createdAt),
    updated_at: isoOrNull(s.updatedAt),
  }
}

/** @param {object} r 数据库行 */
export function stationFromRow(r) {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    pinned: Boolean(r.pinned),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ---------------------------------------------------------------- station_words

export function stationWordToRow(w) {
  return {
    id: w.id,
    station_id: w.stationId,
    owner_id: w.ownerId,
    word_key: w.wordKey,
    source: w.source,
    note: w.note ?? null,
    added_at: isoOrNull(w.addedAt),
    updated_at: isoOrNull(w.updatedAt),
  }
}

export function stationWordFromRow(r) {
  return {
    id: r.id,
    stationId: r.station_id,
    ownerId: r.owner_id,
    wordKey: r.word_key,
    source: r.source,
    note: r.note ?? null,
    addedAt: r.added_at,
    updatedAt: r.updated_at,
  }
}

// ---------------------------------------------------------------- user_words

export function userWordToRow(w) {
  const row = {
    id: w.id,
    owner_id: w.ownerId,
    form: w.form,
    form_key: w.formKey,
    word_key: w.wordKey,
    pos: w.pos ?? null,
    gloss: w.gloss ?? null,
    phonetic_br: w.phoneticBr ?? null,
    phonetic_status: w.phoneticStatus ?? 'pending',
    example: w.example ?? null,
    usage: w.usage ?? null,
    cefr: w.cefr ?? null,
    freq_rank: intOrNull(w.freqRank),
    morphs: Array.isArray(w.morphs) ? w.morphs : [],
    chain: Array.isArray(w.chain) ? w.chain : [],
    source: w.source ?? 'ai',
    edited_by_user: Boolean(w.editedByUser),
    generation_status: w.generationStatus ?? 'ready',
    gen_error: w.genError ?? null,
    created_at: isoOrNull(w.createdAt),
    updated_at: isoOrNull(w.updatedAt),
  }
  assertNoSrsFields(row, 'user_words')
  return row
}

export function userWordFromRow(r) {
  return {
    id: r.id,
    ownerId: r.owner_id,
    form: r.form,
    formKey: r.form_key,
    wordKey: r.word_key,
    pos: r.pos ?? null,
    gloss: r.gloss ?? null,
    // 红线：phonetic_br 只来自查表（dict_cache / 本地音标库），模型产出永不写入
    phoneticBr: r.phonetic_br ?? null,
    phoneticStatus: r.phonetic_status ?? 'pending',
    example: r.example ?? null,
    usage: r.usage ?? null,
    cefr: r.cefr ?? null,
    freqRank: r.freq_rank ?? null,
    morphs: Array.isArray(r.morphs) ? r.morphs : [],
    chain: Array.isArray(r.chain) ? r.chain : [],
    source: r.source ?? 'ai',
    editedByUser: Boolean(r.edited_by_user),
    generationStatus: r.generation_status ?? 'ready',
    genError: r.gen_error ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ---------------------------------------------------------------- learn_records

export function learnRecordToRow(rec, ownerId, wordKey) {
  const row = {
    owner_id: ownerId,
    word_key: wordKey,
    status: rec.status ?? 'unknown',
    correct_count: rec.correctCount ?? 0,
    consecutive_correct: rec.consecutiveCorrect ?? 0,
    incorrect_count: rec.incorrectCount ?? 0,
    last_studied_at: isoOrNull(rec.lastStudiedAt),
    last_result: rec.lastResult ?? null,
    last_incorrect_at: isoOrNull(rec.lastIncorrectAt),
    next_due_at: isoOrNull(rec.nextDueAt),
    status_changed_at: isoOrNull(rec.statusChangedAt),
    status_source: rec.statusSource ?? null,
    updated_at: isoOrNull(rec.updatedAt) ?? new Date().toISOString(),
  }
  assertNoSrsFields(row, 'learn_records')
  return row
}

export function learnRecordFromRow(r) {
  return {
    status: r.status,
    correctCount: r.correct_count ?? 0,
    consecutiveCorrect: r.consecutive_correct ?? 0,
    incorrectCount: r.incorrect_count ?? 0,
    lastStudiedAt: r.last_studied_at ?? null,
    lastResult: r.last_result ?? null,
    lastIncorrectAt: r.last_incorrect_at ?? null,
    nextDueAt: r.next_due_at ?? null,
    statusChangedAt: r.status_changed_at ?? null,
    statusSource: r.status_source ?? null,
    updatedAt: r.updated_at ?? null,
  }
}
