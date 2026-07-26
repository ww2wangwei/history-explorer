const fs = require('fs')
const gf = fs.readFileSync('./src/data/geographic-features.ts', 'utf8')

function parseArr(text, start) {
  const items = []
  let i = start + 1
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++
    if (text[i] === ']') return { items, endIdx: i }
    if (text[i] !== '{') { i++; continue }
    let depth = 1, j = i + 1
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth++
      else if (text[j] === '}') depth--
      j++
    }
    const obj = text.slice(i, j)
    const id = (obj.match(/id:\s*'([^']+)'/) || [])[1]
    const name = (obj.match(/name:\s*'([^']+)'/) || [])[1]
    const type = (obj.match(/type:\s*'([^']+)'/) || [])[1]
    const lpMatch = obj.match(/labelPos:\s*\[([^\]]+)\]/)
    const labelPos = lpMatch ? lpMatch[1].split(',').map(s => parseFloat(s.trim())) : null
    if (id && labelPos && labelPos.length === 2) {
      items.push({ id, name, type, lng: labelPos[0], lat: labelPos[1] })
    }
    i = j
  }
  return { items, endIdx: i }
}

const keys = ['CONTINENTS','SEAS','LAKES','RIVERS','MOUNTAINS','DESERTS','PLAINS','PENINSULAS','STRAITS','WATERFALLS','REGIONS','ROUTES']
const all = []
keys.forEach(key => {
  // 找 export const KEY: GeoFeature[] = [
  const marker = 'export const ' + key + ': GeoFeature[] = ['
  const idx = gf.indexOf(marker)
  if (idx < 0) { console.error('NOT FOUND:', key); return }
  const arrStart = idx + marker.length - 1
  const { items } = parseArr(gf, arrStart)
  items.forEach(x => all.push({ ...x, group: key.toLowerCase() }))
})
console.log('TOTAL:', all.length)
console.log(JSON.stringify(all))