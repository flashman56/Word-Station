/**
 * 用户私有词库 CRUD
 * ------------------------------------------------------------------
 * 红线：
 *   - phonetic_br 只来自查表（服务端 dict_cache / 本地音标库），前端不写入音标；
 *   - 编辑后必须带 edited_by_user = true（R-10）。
 */
import { supabase } from '../supabase.js'
import { TABLES, userWordFromRow } from './schema.js'

function guard() {
  if (!supabase) {
    return { code: 'NO_SUPABASE', message: '未配置 Supabase，云端功能不可用' }
  }
  return null
}

/**
 * 我的全部私有词。
 * @param {string} ownerId
 * @returns {Promise<{data: object[]|null, error: object|null}>}
 */
export async function listMine(ownerId) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { data, error } = await supabase
    .from(TABLES.userWords)
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: (data || []).map(userWordFromRow), error: null }
}

/**
 * 按 word_key 批量取私有词。
 * @param {string} ownerId
 * @param {string[]} wordKeys ['u.xxx', ...]
 * @returns {Promise<{data: object[]|null, error: object|null}>}
 */
export async function listByKeys(ownerId, wordKeys) {
  const g = guard()
  if (g) return { data: null, error: g }
  const keys = (wordKeys || []).filter((k) => typeof k === 'string' && k.startsWith('u.'))
  if (keys.length === 0) return { data: [], error: null }
  const { data, error } = await supabase
    .from(TABLES.userWords)
    .select('*')
    .eq('owner_id', ownerId)
    .in('word_key', keys)
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: (data || []).map(userWordFromRow), error: null }
}

/**
 * 新建 / 覆盖一条私有词（upsert on (owner_id, form_key)）。
 * @param {object} word 前端 UserWord（camelCase）
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function upsert(word) {
  const g = guard()
  if (g) return { data: null, error: g }
  const { data, error } = await supabase
    .from(TABLES.userWords)
    .upsert(
      {
        owner_id: word.ownerId,
        form: word.form,
        form_key: word.formKey,
        word_key: word.wordKey,
        pos: word.pos ?? null,
        gloss: word.gloss ?? null,
        // 音标由服务端查表写入；前端手工新建时一律留空（pending）
        phonetic_br: word.phoneticBr ?? null,
        phonetic_status: word.phoneticStatus ?? 'pending',
        example: word.example ?? null,
        usage: word.usage ?? null,
        cefr: word.cefr ?? null,
        freq_rank: word.freqRank ?? null,
        morphs: Array.isArray(word.morphs) ? word.morphs : ['x.unk'],
        chain: Array.isArray(word.chain) ? word.chain : [],
        source: word.source ?? 'manual',
        edited_by_user: Boolean(word.editedByUser),
        generation_status: word.generationStatus ?? 'ready',
        gen_error: word.genError ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'owner_id,form_key' },
    )
    .select()
    .single()
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: userWordFromRow(data), error: null }
}

/**
 * 局部更新（编辑后自动标 edited_by_user）。
 * @param {string} id
 * @param {object} patch camelCase 字段
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function patch(id, patch = {}) {
  const g = guard()
  if (g) return { data: null, error: g }
  const row = { updated_at: new Date().toISOString(), edited_by_user: true }
  const map = {
    form: 'form',
    formKey: 'form_key',
    wordKey: 'word_key',
    pos: 'pos',
    gloss: 'gloss',
    example: 'example',
    usage: 'usage',
    cefr: 'cefr',
    freqRank: 'freq_rank',
    morphs: 'morphs',
    chain: 'chain',
    generationStatus: 'generation_status',
    genError: 'gen_error',
    phoneticBr: 'phonetic_br',
    phoneticStatus: 'phonetic_status',
  }
  Object.keys(map).forEach((k) => {
    if (patch[k] !== undefined) row[map[k]] = patch[k]
  })
  const { data, error } = await supabase.from(TABLES.userWords).update(row).eq('id', id).select().single()
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: userWordFromRow(data), error: null }
}

/**
 * 删除私有词（同时清掉各小站里的引用行）。
 * @param {string} ownerId
 * @param {string} id
 * @param {string} wordKey
 * @returns {Promise<{data: null, error: object|null}>}
 */
export async function remove(ownerId, id, wordKey) {
  const g = guard()
  if (g) return { data: null, error: g }
  if (wordKey) {
    await supabase.from(TABLES.stationWords).delete().match({ owner_id: ownerId, word_key: wordKey })
  }
  const { error } = await supabase.from(TABLES.userWords).delete().eq('id', id)
  if (error) return { data: null, error: { code: error.code || 'INTERNAL', message: error.message } }
  return { data: null, error: null }
}
