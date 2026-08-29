// 将 15 个朝代/帝国的"手绘粗边界" ∩ Natural Earth 精细海岸线 → 精细多边形
// （每个朝代数百到数千顶点，紧贴真实海岸线/山脉）
//
// 步骤：0.5° 网格 → 陆地遮罩 → 朝代陆地掩码 → Marching Squares → 连环 → Douglas-Peucker 简化
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { feature as tFeature } from 'topojson-client'
import { geoContains } from 'd3-geo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// === 自然地球国家 ===
const topo = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'))
const world = tFeature(topo, topo.objects.countries)

// 给每个国家加 bbox + 预计算 polygons（弧度，去尾点）
const RADIANS = Math.PI / 180
function computeBBox(geom) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity
  function walk(coords) {
    if (typeof coords[0] === 'number') {
      if (coords[0] < minLon) minLon = coords[0]
      if (coords[0] > maxLon) maxLon = coords[0]
      if (coords[1] < minLat) minLat = coords[1]
      if (coords[1] > maxLat) maxLat = coords[1]
    } else {
      for (const c of coords) walk(c)
    }
  }
  walk(geom.coordinates)
  return [minLon, minLat, maxLon, maxLat]
}
for (const f of world.features) {
  f.bbox = computeBBox(f.geometry)
  f._polygons = []
  const coords = f.geometry.coordinates
  if (f.geometry.type === 'Polygon') {
    f._polygons.push(coords.map(r => r.slice(0, -1).map(([lon, lat]) => [lon * RADIANS, lat * RADIANS])))
  } else if (f.geometry.type === 'MultiPolygon') {
    for (const poly of coords) {
      f._polygons.push(poly.map(r => r.slice(0, -1).map(([lon, lat]) => [lon * RADIANS, lat * RADIANS])))
    }
  }
}

// 射线法 PIP（弧度）
function pipRing(px, py, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}
function pipPolygon(px, py, polygon) {
  let inside = false
  for (const ring of polygon) {
    if (pipRing(px, py, ring)) inside = !inside
  }
  return inside
}
function pointInFeat(f, lonRad, latRad) {
  for (const poly of f._polygons) if (pipPolygon(lonRad, latRad, poly)) return true
  return false
}

// ============================================================
// 朝代粗边界（来自 gen-china-dynasty.mjs + gen-world-empire.mjs）
// ============================================================
const TERRITORIES = {}
TERRITORIES['china/qin'] = [[[104,36],[108,38],[112,40],[117,41],[121,41],[121,38],[121,35],[120,32],[120,28],[116,24],[112,22],[108,22],[105,24],[102,28],[100,30],[102,33],[104,36]]]
TERRITORIES['china/han'] = [[[75,39],[80,40],[86,42],[94,43],[100,42],[108,41],[112,40],[116,41],[120,41],[121,39],[124,40],[126,39],[127,37],[125,34],[121,30],[118,26],[114,22],[110,21],[107,22],[104,24],[102,27],[101,30],[99,33],[96,36],[94,40],[88,40],[82,39],[75,39]]]
TERRITORIES['china/tang'] = [[[74,40],[78,43],[84,46],[90,48],[96,48],[102,42],[108,44],[114,42],[120,41],[121,39],[121,36],[120,32],[118,28],[114,24],[110,21],[106,20],[102,22],[100,24],[97,28],[96,31],[94,35],[94,38],[90,40],[84,40],[78,40],[74,40]]]
TERRITORIES['china/song'] = [[[104,36],[108,38],[112,36],[115,36],[118,35],[120,34],[121,33],[120,30],[118,26],[114,22],[110,20],[106,20],[102,22],[100,25],[97,28],[95,30],[94,33],[96,35],[100,36],[104,36]]]
TERRITORIES['china/yuan'] = [[[74,40],[80,42],[86,48],[92,52],[100,52],[108,50],[114,48],[120,46],[124,48],[128,52],[134,53],[136,50],[134,46],[128,44],[124,42],[121,40],[121,36],[120,32],[118,28],[114,22],[110,20],[106,20],[102,22],[100,25],[97,28],[95,30],[94,33],[96,36],[94,39],[88,40],[80,40],[74,40]]]
TERRITORIES['china/ming'] = [[[98,40],[104,40],[110,41],[115,42],[118,42],[121,41],[121,38],[121,35],[120,32],[118,28],[114,24],[110,21],[107,20],[104,22],[101,24],[98,27],[95,30],[94,33],[95,36],[97,38],[98,40]]]
TERRITORIES['china/qing'] = [
  [[74,40],[80,40],[88,42],[94,43],[100,42],[108,41],[112,40],[117,41],[121,40],[121,38],[121,35],[120,32],[120,28],[116,24],[112,22],[108,21],[104,22],[100,25],[97,28],[95,30],[94,33],[96,36],[94,39],[88,40],[80,40],[74,40]],
  [[121,42],[121,45],[124,48],[130,49],[135,48],[134,45],[130,43],[126,43],[122,44],[121,42]],
  [[120.1,22],[121.5,22],[121.6,25.3],[120.1,25.3],[120.1,22]]
]
TERRITORIES['world/eras/rome-republic'] = [
  [[-9.5,43.7],[-9.5,36],[-2,36],[0,38],[3,40.5],[1.5,42.5],[3,43.5],[7,43.3],[7.5,44],[8,44.5],[12.5,45.5],[14,42],[16.5,40],[18.5,40.5],[17,37],[15.5,38],[13,38],[11,41],[8,44.5],[8,47],[4,48],[1,50],[-2,52],[-3,51],[-5,48.5],[-9.5,43.7]],
  [[28,45.5],[22,44],[20,43],[19.5,41.5],[20,40],[22,38],[22.5,36],[23,38],[24,39],[26,40.5],[28,41.5],[28,43],[28,45.5]],
  [[26,41],[29,41.5],[32,41.5],[36,41.5],[40,40],[44,40],[44,37],[40,36],[36,36],[33,36.5],[30,36.5],[26,38],[26,41]],
  [[36,36],[40,36],[42,34],[40,33],[36.5,33],[35,31],[34,31.5],[33,31.5],[32,31],[31,30],[25,31.5],[20,32],[15,31.5],[10,33],[3,35],[-2,35.5],[-5,35.5],[-9,35],[-9.5,32],[-7,31],[-2,30.5],[5,30],[15,28],[20,25],[25,22],[30,22],[32,25],[33,28],[34,29],[35,30],[36,31],[36.5,33],[36,36]]
]
TERRITORIES['world/eras/rome-empire'] = [
  [[-9.5,58.5],[-3,58.5],[-2,53],[-5,50],[-2.5,49],[-9.5,43.7],[-9.5,36],[-2,36],[0,38],[3,40.5],[1.5,42.5],[3,43.5],[7,43.3],[7.5,44],[8,44.5],[12.5,45.5],[14,42],[16.5,40],[18.5,40.5],[17,37],[15.5,38],[13,38],[11,41],[8,44.5],[8,47],[4,48],[1,50],[0,51.5],[-1,52],[-2,53],[-3,54],[-2,56],[-5,58],[-3,58.5]],
  [[28,47],[25,46.5],[22,46],[20,45],[18,45.5],[16,45.5],[14.5,45.5],[14,44],[16,43],[19,42.5],[19.5,41.5],[20,40],[22,38],[22.5,36],[23,38],[24,39],[26,40.5],[28,41.5],[28,43],[28,45.5],[29,46.5],[28,47]],
  [[26,41],[29,41.5],[32,41.5],[36,41.5],[40,40],[44,40],[44,37],[40,36],[36,36],[33,36.5],[30,36.5],[26,38],[26,41]],
  [[36,41],[40,41],[44,40],[46,40],[48,38],[48,35],[46,33],[44,33],[42,34],[40,36],[36,36],[35,31],[34,31.5],[33,31.5],[32,31],[31,30],[25,31.5],[20,32],[15,31.5],[10,33],[3,35],[-2,35.5],[-5,35.5],[-9,35],[-9.5,32],[-7,31],[-2,30.5],[5,30],[15,28],[20,25],[25,22],[30,22],[32,25],[33,28],[34,29],[35,30],[36,31],[36.5,33],[36,36]]
]
TERRITORIES['world/eras/byzantine'] = [
  [[7,46],[8,44.5],[12.5,45.5],[14,42],[16.5,40],[18.5,40.5],[17,37],[15.5,38],[13,38],[11,41],[8,44.5],[7,46]],
  [[28,45.5],[22,44],[20,43],[19.5,41.5],[20,40],[22,38],[22.5,36],[23,38],[24,39],[26,40.5],[28,41.5],[28,43],[28,45.5]],
  [[26,41.5],[30,41.5],[36,41.5],[42,41],[44,40],[44,37],[40,36],[36,36],[33,36.5],[30,36.5],[26,38],[26,41.5]],
  [[36,41.5],[40,41.5],[44,41.5],[48,40],[50,40],[48,37],[46,35],[44,33],[42,34],[40,36],[36,36],[35,31],[34,31.5],[33,31.5],[32,31],[31,30],[30,22],[25,22],[30,22],[32,25],[33,28],[34,29],[35,30],[36,31],[36.5,33],[36,36]],
  [[10,36],[3,35],[-2,35.5],[-5,35.5],[-9,35],[-9.5,32],[-7,31],[-2,30.5],[5,30],[10,33],[10,36]],
  [[-6,36],[-6,38],[-2,38],[-1,36.5],[-6,36]]
]
TERRITORIES['world/eras/arab-caliphate'] = [
  [[-9.5,43.7],[-9.5,36],[-2,36],[0,38],[1,42.5],[-1,43.5],[-3,43.5],[-9.5,43.7]],
  [[-9.5,36],[-9.5,32],[-7,31],[-2,30.5],[5,30],[15,28],[20,25],[25,22],[30,22],[32,25],[34,29],[35,30],[36,31],[38,33],[42,34],[46,33],[50,32],[54,32],[58,38],[62,38],[66,36],[70,34],[74,32],[76,30],[72,28],[68,28],[64,30],[60,32],[56,32],[52,30],[48,30],[44,33],[42,34],[40,36],[36,36],[33,35],[30,32],[25,32],[20,33],[15,33.5],[10,35],[3,35],[-2,35.5],[-5,35.5],[-9,35],[-9.5,36]]
]
TERRITORIES['world/eras/persia-safavid'] = [[[44,41.5],[48,40],[54,40],[58,38],[62,38],[66,36],[70,34],[74,33],[76,32],[72,30],[68,28],[64,28],[60,29],[56,30],[52,31],[48,32],[45,33],[44,35],[46,37],[48,38],[46,40],[44,41.5]]]
TERRITORIES['world/eras/ottoman'] = [
  [[26,42],[30,41.5],[36,41.5],[42,41],[44,40],[44,37],[40,36],[36,36],[33,36.5],[30,36.5],[26,38],[26,42]],
  [[28,47.5],[26,47],[22,46],[19,46],[17,47],[16,47.5],[16,46],[18,45],[20,44.5],[22,44],[20,43],[19.5,41.5],[20,40],[22,38],[22.5,36],[23,38],[24,39],[26,40.5],[28,41.5],[28,43],[29,46],[28,47.5]],
  [[36,42],[40,42],[44,42],[48,41],[50,40],[54,38],[50,35],[46,33],[44,33],[42,34],[40,36],[36,36],[35,33],[36,31],[36,29],[40,28],[42,25],[45,22],[48,18],[44,16],[40,17],[36,20],[34,25],[34,29],[35,30],[36,31],[36.5,33],[36,36]],
  [[32,31.5],[33,30],[34,29],[35,30],[32,31.5],[30,31],[30,22],[25,22],[30,22],[32,25],[33,28],[32,31.5]],
  [[10,36],[3,35],[-2,35.5],[-5,35.5],[-9,35],[-9.5,32],[-7,31],[-2,30.5],[3,33],[6,35],[10,36]]
]
TERRITORIES['world/eras/mongol-empire'] = [[
  [130,42],[130,35],[128,34],[125,33],[122,32],[120,28],[118,26],[115,22],[112,20],[108,20],[105,18],[102,20],[100,22],[98,25],[96,28],[94,30],[92,32],[90,33],[86,32],[82,30],[78,28],[74,28],[70,30],[66,32],[62,34],[58,36],[56,38],[54,40],[50,40],[48,38],[50,36],[52,34],[56,32],[60,30],[62,30],[64,32],[66,34],[70,36],[74,38],[78,40],[82,44],[86,48],[92,52],[100,52],[108,50],[116,50],[122,48],[126,46],[128,44],[126,42],[128,42],[130,42]
]]
TERRITORIES['world/eras/british-empire'] = [
  [[-10,58],[-2,58],[-1,52],[-5,50],[-10,54],[-10,58]],
  [[-10,55],[-6,55],[-6,52],[-10,52],[-10,55]],
  [[68,8],[78,8],[88,22],[92,28],[82,35],[72,32],[68,28],[68,8]],
  [[-140,70],[-95,49],[-55,50],[-60,70],[-140,70]],
  [[113,-22],[129,-12],[142,-11],[146,-39],[115,-34],[113,-22]],
  [[166,-41],[174,-34],[178,-41],[173,-47],[166,-41]],
  [[16,-22],[33,-26],[33,-19],[24,-17],[16,-22]],
  [[33,-1],[40,-1],[42,4],[35,5],[33,-1]],
  [[-3,4],[9,4],[14,12],[10,13],[-3,4]],
  [[25,22],[36,22],[36,32],[30,32],[25,22]],
  [[25,-18],[35,-18],[36,-8],[28,-8],[25,-18]],
  [[100,1.5],[105,1.5],[105,6],[100,6],[100,1.5]],
  [[80,6],[82,6],[82,10],[80,10],[80,6]],
  [[93,10],[100,10],[100,28],[96,28],[93,10]]
]

// 朝代预包装成 GeoJSON Polygon Feature + bbox + 预计算 polygons（弧度）
function ringFeature(ring) {
  const poly = { type: 'Polygon', coordinates: [ring] }
  const feat = { type: 'Feature', geometry: poly, properties: {} }
  feat.bbox = computeBBox(poly)
  feat._polygons = [[ ring.slice(0, -1).map(([lo, la]) => [lo * RADIANS, la * RADIANS]) ]]
  return feat
}
function multiRingFeature(rings) {
  const polys = rings.map(r => [r])
  const geom = { type: 'MultiPolygon', coordinates: polys }
  const feat = { type: 'Feature', geometry: geom, properties: {} }
  feat.bbox = computeBBox(geom)
  feat._polygons = rings.map(ring => [ ring.slice(0, -1).map(([lo, la]) => [lo * RADIANS, la * RADIANS]) ])
  return feat
}

const TER_FEATS = {}
for (const [k, rings] of Object.entries(TERRITORIES)) {
  TER_FEATS[k] = rings.length === 1 ? ringFeature(rings[0]) : multiRingFeature(rings)
}

// ============================================================
// 栅格化
// ============================================================
const RES = 0.25
const LON_MIN = -180, LON_MAX = 180
const LAT_MIN = -60, LAT_MAX = 85
const W = Math.round((LON_MAX - LON_MIN) / RES) + 1
const H = Math.round((LAT_MAX - LAT_MIN) / RES) + 1
console.log(`grid: ${W} x ${H} = ${W * H} cells, res=${RES}°`)

// 空间索引：10°×10° 桶，把每个国家分桶
console.log('生成陆地遮罩 (world-atlas + 桶索引 + 手写 PIP)...')
const BUCK_SIZE = 10
const BUCK_LON = Math.ceil(360 / BUCK_SIZE)
const BUCK_LAT = Math.ceil(180 / BUCK_SIZE)
const buckets = Array.from({ length: BUCK_LAT }, () => Array.from({ length: BUCK_LON }, () => []))
for (let fi = 0; fi < world.features.length; fi++) {
  const f = world.features[fi]
  const [minLon, minLat, maxLon, maxLat] = f.bbox
  const x0 = Math.max(0, Math.floor((minLon + 180) / BUCK_SIZE))
  const x1 = Math.min(BUCK_LON - 1, Math.floor((maxLon + 180) / BUCK_SIZE))
  const y0 = Math.max(0, Math.floor((minLat + 90) / BUCK_SIZE))
  const y1 = Math.min(BUCK_LAT - 1, Math.floor((maxLat + 90) / BUCK_SIZE))
  for (let by = y0; by <= y1; by++) for (let bx = x0; bx <= x1; bx++) buckets[by][bx].push(fi)
}
const t0 = Date.now()
const landMask = new Uint8Array(W * H)
let landCount = 0
for (let j = 0; j < H; j++) {
  const lat = LAT_MIN + j * RES
  const radLat = lat * RADIANS
  for (let i = 0; i < W; i++) {
    const lon = LON_MIN + i * RES
    const radLon = lon * RADIANS
    let inLand = false
    const bx = Math.max(0, Math.min(BUCK_LON - 1, Math.floor((lon + 180) / BUCK_SIZE)))
    const by = Math.max(0, Math.min(BUCK_LAT - 1, Math.floor((lat + 90) / BUCK_SIZE)))
    for (const fi of buckets[by][bx]) {
      const f = world.features[fi]
      if (lon < f.bbox[0] || lat < f.bbox[1] || lon > f.bbox[2] || lat > f.bbox[3]) continue
      if (pointInFeat(f, radLon, radLat)) { inLand = true; break }
    }
    if (inLand) { landMask[j * W + i] = 1; landCount++ }
  }
}
console.log(`陆地 ${landCount} 格点, 耗时 ${Date.now() - t0}ms`)

function marchingSquares(mask) {
  const segs = []
  for (let j = 0; j < H - 1; j++) {
    for (let i = 0; i < W - 1; i++) {
      const bl = mask[j * W + i]
      const br = mask[j * W + i + 1]
      const tl = mask[(j + 1) * W + i]
      const tr = mask[(j + 1) * W + i + 1]
      const code = (tl << 3) | (tr << 2) | (br << 1) | bl
      if (code === 0 || code === 15) continue
      const x0 = LON_MIN + i * RES
      const y0 = LAT_MIN + j * RES
      const B = [x0 + RES / 2, y0]
      const R = [x0 + RES, y0 + RES / 2]
      const T = [x0 + RES / 2, y0 + RES]
      const L = [x0, y0 + RES / 2]
      switch (code) {
        case 1: case 14: segs.push([B, L]); break
        case 2: case 13: segs.push([B, R]); break
        case 3: case 12: segs.push([L, R]); break
        case 4: case 11: segs.push([R, T]); break
        case 5:  segs.push([B, L], [R, T]); break
        case 6: case 9:  segs.push([B, T]); break
        case 7: case 8:  segs.push([L, T]); break
        case 10: segs.push([L, T], [B, R]); break
      }
    }
  }
  return segs
}

function segsToRings(segs) {
  if (segs.length === 0) return []
  const eps = 1e-6
  const key = p => Math.round(p[0] / eps) + ',' + Math.round(p[1] / eps)
  const adj = new Map()
  for (let i = 0; i < segs.length; i++) {
    const [a, p] = segs[i]
    const ka = key(a), kp = key(p)
    if (!adj.has(ka)) adj.set(ka, [])
    if (!adj.has(kp)) adj.set(kp, [])
    adj.get(ka).push({ nextKey: kp, segIdx: i })
    adj.get(kp).push({ nextKey: ka, segIdx: i })
  }
  const used = new Set()
  const rings = []
  for (let startIdx = 0; startIdx < segs.length; startIdx++) {
    if (used.has(startIdx)) continue
    const [a, p] = segs[startIdx]
    const ring = [[a[0], a[1]], [p[0], p[1]]]
    used.add(startIdx)
    let curKey = key(p)
    const startKey = key(a)
    let guard = 0
    while (guard++ < 100000) {
      const edges = (adj.get(curKey) || []).filter(e => !used.has(e.segIdx))
      if (edges.length === 0) break
      const e = edges[0]
      used.add(e.segIdx)
      const ns = segs[e.segIdx]
      const pt = (key(ns[0]) === curKey) ? ns[1] : ns[0]
      if (key(pt) === startKey) break
      ring.push([pt[0], pt[1]])
      curKey = key(pt)
    }
    if (ring.length >= 4) rings.push(ring)
  }
  return rings
}

function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function douglasPeucker(pts, eps) {
  if (pts.length < 3) return pts
  let maxD = 0, maxI = 0
  const a = pts[0], b = pts[pts.length - 1]
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], a, b)
    if (d > maxD) { maxD = d; maxI = i }
  }
  if (maxD > eps) {
    return [...douglasPeucker(pts.slice(0, maxI + 1), eps).slice(0, -1),
            ...douglasPeucker(pts.slice(maxI), eps)]
  }
  return [a, b]
}

function rasterize(relKey) {
  const feat = TER_FEATS[relKey]
  const mask = new Uint8Array(W * H)
  let maskCount = 0
  for (let j = 0; j < H; j++) {
    const lat = LAT_MIN + j * RES
    for (let i = 0; i < W; i++) {
      const idx = j * W + i
      if (landMask[idx] === 0) continue
      const lon = LON_MIN + i * RES
      if (pointInFeat(feat, lon * RADIANS, lat * RADIANS)) mask[idx] = 1, maskCount++
    }
  }
  const segs = marchingSquares(mask)
  const rings = segsToRings(segs)
  return rings.map(r => douglasPeucker(r, 0.1)).filter(r => r.length >= 4)
}

let totalMs = 0
for (const relPath of Object.keys(TERRITORIES)) {
  const t1 = Date.now()
  const rings = rasterize(relPath)
  for (const r of rings) {
    if (r.length > 0 && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])) {
      r.push([r[0][0], r[0][1]])
    }
  }
  const fc = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: relPath.split('/').pop(), source: 'rasterized: Natural Earth coast (world-atlas 50m) ∩ hand-drawn historical frontier, marching squares + Douglas-Peucker ε=0.3°' },
      geometry: rings.length === 1
        ? { type: 'Polygon', coordinates: rings }
        : { type: 'MultiPolygon', coordinates: rings.map(r => [r]) }
    }]
  }
  const absPath = path.join(root, 'public/geo', relPath + '.geojson')
  fs.writeFileSync(absPath, JSON.stringify(fc))
  const dt = Date.now() - t1
  totalMs += dt
  const pts = rings.reduce((s, r) => s + r.length, 0)
  console.log(`${relPath}: ${rings.length} ring(s), ${pts} pts, ${dt}ms`)
}
console.log(`total rasterize ${totalMs}ms`)