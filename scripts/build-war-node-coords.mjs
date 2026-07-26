#!/usr/bin/env node
// 批量用 Nominatim (OpenStreetMap) 解析 WarsOverview.tsx 中所有 MAJOR_WARS 节点的 location → 经纬度
// 输出: src/data/war-node-coords.json (以 location 原文为 key，天然去重)
// Nominatim 使用规约: 1 req/s, 必须带 User-Agent
// 用法: node scripts/build-war-node-coords.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC = resolve(ROOT, 'src/components/Wars/WarsOverview.tsx')
const OUT = resolve(ROOT, 'src/data/war-node-coords.json')

const text = await readFile(SRC, 'utf8')

const matches = [...text.matchAll(/location:\s*'([^']+)'/g)]
const locations = [...new Set(matches.map(m => m[1].trim()).filter(Boolean))]
console.log(`[nominatim] 共 ${locations.length} 个去重地名`)

let existing = {}
try { existing = JSON.parse(await readFile(OUT, 'utf8')) } catch {}

const result = { ...existing }
let success = 0, skipped = 0, failed = 0

for (const name of locations) {
  if (result[name]) { skipped++; continue }
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&accept-language=zh`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'history-app/1.0 (dev build script)' } })
    if (!res.ok) { console.warn(`  [${res.status}] ${name}`); failed++; await sleep(1100); continue }
    const arr = await res.json()
    if (arr.length > 0) {
      const { lat, lon } = arr[0]
      result[name] = [Number(lon), Number(lat)]
      success++
      console.log(`  ok ${name} -> [${lon}, ${lat}]  (${arr[0].display_name})`)
    } else { console.warn(`  - ${name} -> no result`); failed++ }
  } catch (e) { console.warn(`  ! ${name} -> ${e.message}`); failed++ }
  await sleep(1100)
}

await writeFile(OUT, JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(`\n[nominatim] 写入 ${Object.keys(result).length} 条 -> ${OUT}`)
console.log(`  新增 ${success}, 跳过已存在 ${skipped}, 失败 ${failed}`)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }