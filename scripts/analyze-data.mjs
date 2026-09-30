import fs from 'fs'

const files = ['words-latin', 'words-greek', 'words-affix']
for (const f of files) {
  const path = `src/data/${f}.js`
  const text = fs.readFileSync(path, 'utf8')
  const lines = text.split('\n')
  const entries = []
  for (const line of lines) {
    const m = line.match(/^\s*\{\s*id:\s*'w\.([^']+)'/)
    if (!m) continue
    const id = 'w.' + m[1]
    const hasPhon = /phoneticBr:/.test(line)
    const hasEx = /example:/.test(line)
    const frMatch = line.match(/freqRank:\s*(\d+)/)
    const freqRank = frMatch ? Number(frMatch[1]) : 999999
    entries.push({ id, hasPhon, hasEx, freqRank, line })
  }
  const missingPhon = entries.filter((e) => !e.hasPhon)
  const missingEx = entries.filter((e) => !e.hasEx)
  const missingEither = entries.filter((e) => !e.hasPhon || !e.hasEx)
  const missingMidLow = entries.filter((e) => e.freqRank > 2500 && (!e.hasPhon || !e.hasEx))
  console.log(`\n===== ${f} =====`)
  console.log(`total entries: ${entries.length}`)
  console.log(`with phoneticBr: ${entries.length - missingPhon.length}`)
  console.log(`with example: ${entries.length - missingEx.length}`)
  console.log(`missing BOTH/éITHER (phon or ex): ${missingEither.length}`)
  console.log(`mid-low freqRank>2500 missing either: ${missingMidLow.length}`)
  console.log('--- mid-low missing list ---')
  for (const e of missingMidLow) {
    console.log(`  ${e.id}  fr=${e.freqRank}  phon=${e.hasPhon} ex=${e.hasEx}`)
  }
}
