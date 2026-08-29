// 用 world-atlas（Natural Earth）里的现代国家边界，按鼎盛期归属近似拼出各帝国的疆域。
// 这样无需联网即可获得真实海岸线（避免手绘多边形的"方块感"）。
// 用法：node scripts/gen-territory.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { feature } from 'topojson-client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const topo = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'))
const world = feature(topo, topo.objects.countries)
const byName = new Map(world.features.map(f => [f.properties.name, f]))

// 各帝国鼎盛期大致对应的现代国家（Natural Earth 名称）。近似，非学术精确边界。
const EMPIRES = {
  'rome-republic': ['Italy','Spain','Portugal','France','Belgium','Luxembourg','Switzerland','Austria','Slovenia','Croatia','Bosnia and Herz.','Serbia','Montenegro','Albania','North Macedonia','Macedonia','Greece','Bulgaria','Romania','Turkey','Cyprus','Syria','Lebanon','Israel','Palestine','Jordan','Iraq','Kuwait','Egypt','Libya','Tunisia','Algeria','Morocco','Malta','Andorra','United Kingdom'],
  'rome-empire': ['Italy','Spain','Portugal','France','Belgium','Luxembourg','Switzerland','Austria','Slovenia','Croatia','Bosnia and Herz.','Serbia','Montenegro','Albania','North Macedonia','Macedonia','Greece','Bulgaria','Romania','Hungary','Turkey','Cyprus','Syria','Lebanon','Israel','Palestine','Jordan','Iraq','Kuwait','Egypt','Libya','Tunisia','Algeria','Morocco','Malta','Andorra','United Kingdom'],
  'byzantine': ['Turkey','Greece','Bulgaria','Albania','North Macedonia','Macedonia','Serbia','Montenegro','Romania','Italy','Cyprus','Syria','Lebanon','Israel','Palestine','Jordan','Egypt','Libya','Tunisia','Spain'],
  'arab-caliphate': ['Saudi Arabia','Yemen','Oman','United Arab Emirates','Qatar','Bahrain','Kuwait','Iraq','Syria','Lebanon','Jordan','Israel','Palestine','Egypt','Libya','Tunisia','Algeria','Morocco','Spain','Portugal','Iran','Turkey','Afghanistan','Pakistan','Turkmenistan','Azerbaijan','Armenia'],
  'persia-safavid': ['Iran','Azerbaijan','Armenia','Iraq','Turkey','Afghanistan','Pakistan','Turkmenistan','Kuwait','Bahrain'],
  'ottoman': ['Turkey','Greece','Bulgaria','Romania','Serbia','Bosnia and Herz.','Croatia','Albania','North Macedonia','Macedonia','Montenegro','Kosovo','Cyprus','Syria','Lebanon','Israel','Palestine','Jordan','Iraq','Kuwait','Yemen','Egypt','Libya','Tunisia','Georgia','Armenia'],
  'mongol-empire': ['Mongolia','China','South Korea','North Korea','Kazakhstan','Uzbekistan','Turkmenistan','Tajikistan','Kyrgyzstan','Afghanistan','Pakistan','Iran','Iraq','Turkey','Armenia','Azerbaijan','Georgia','Ukraine','Belarus','Poland','Moldova','Romania','Bulgaria','Hungary','Slovakia','Czechia'],
  'british-empire': ['United Kingdom','Ireland','India','Pakistan','Bangladesh','Myanmar','Sri Lanka','Maldives','Canada','Australia','New Zealand','South Africa','Botswana','Zimbabwe','Zambia','Malawi','Tanzania','Kenya','Uganda','Sudan','Egypt','Nigeria','Ghana','Sierra Leone','Gambia','Cyprus','Malaysia','Singapore'],
}

function polysOf(geom) {
  if (!geom) return []
  if (geom.type === 'Polygon') return geom.coordinates
  if (geom.type === 'MultiPolygon') return geom.coordinates
  return []
}

const outDir = path.join(root, 'public/geo/world/eras')
for (const [id, names] of Object.entries(EMPIRES)) {
  const polys = []
  const missing = []
  for (const n of names) {
    const f = byName.get(n)
    if (!f) { missing.push(n); continue }
    for (const poly of polysOf(f.geometry)) polys.push(poly)
  }
  const fc = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: id, source: 'Natural Earth (modern countries union, approximate)' },
      geometry: { type: 'MultiPolygon', coordinates: polys },
    }],
  }
  fs.writeFileSync(path.join(outDir, `${id}.geojson`), JSON.stringify(fc))
  console.log(`${id}: ${polys.length} polygons` + (missing.length ? `  MISSING: ${missing.join(', ')}` : ''))
}

// 中国朝代由 scripts/gen-china-dynasty.mjs 单独生成（手绘历史边境），
// 因为用现代国家 union 得到的"中国"会把秦/宋/明等都画成现代中国，错误。
