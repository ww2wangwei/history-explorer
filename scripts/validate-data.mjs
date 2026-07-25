#!/usr/bin/env node
// 校验剧本数据完整性:
//  1. 每个剧本 scene.next 都能解析到一个存在的 scene / 结局
//  2. 结局必须在场景中被引用或在场景的 ending 字段里出现
//  3. 双值剧本(power/heart/law/people/...必须有 quadrant 字段),每个分支都覆盖四个象限
//  4. 人物 eraIds / 事件 relatedEraId 必须引用存在的朝代
// 用法: node scripts/validate-data.mjs
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const files = {
  scenarios: resolve(ROOT, 'src/data/scenarios.json'),
  eras: resolve(ROOT, 'src/data/eras.json'),
  events: resolve(ROOT, 'src/data/events.json'),
  figures: resolve(ROOT, 'src/data/people.json'),
}

const scenarios = JSON.parse(await readFile(files.scenarios, 'utf8'))
const eras = JSON.parse(await readFile(files.eras, 'utf8'))
const events = JSON.parse(await readFile(files.events, 'utf8'))
const figures = JSON.parse(await readFile(files.figures, 'utf8'))

const eraIds = new Set(eras.map(e => e.id))

let errors = 0
let warnings = 0
const log = (kind, msg) => {
  const tag = kind === 'error' ? '✗' : '⚠'
  console[kind === 'error' ? 'error' : 'warn'](`  ${tag} ${msg}`)
  if (kind === 'error') errors++
  else warnings++
}

// ---------- 1. 剧本图 / 结局可达性 ----------
console.log(`\n[scenarios] checking ${scenarios.length} scripts ...`)
for (const sc of scenarios) {
  const scenes = sc.scenes ?? []
  const sceneIds = new Set(scenes.map(s => s.id))
  const endingIds = new Set((sc.endings ?? []).map(e => e.id))
  const root = scenes.find(s => s.id === 'root' || s.id === 's0') ?? scenes[0]

  if (scenes.length === 0) { log('error', `${sc.id}: no scenes`); continue }
  if (!root) { log('error', `${sc.id}: no root scene`); continue }

  for (const s of scenes) {
    if (s.ending && !endingIds.has(s.ending)) {
      log('error', `${sc.id}: scene "${s.id}.ending = ${s.ending}" missing in sc.endings`)
    }
  }

  const visited = new Set()
  const stack = [root.id]
  while (stack.length) {
    const cur = stack.pop()
    if (visited.has(cur)) continue
    visited.add(cur)
    const node = scenes.find(s => s.id === cur)
    if (!node) { log('error', `${sc.id}: scene "${cur}" missing`); continue }
    for (const ch of node.choices ?? []) {
      if (sceneIds.has(ch.next)) {
        stack.push(ch.next)
      } else if (endingIds.has(ch.next)) {
        // 直跳结局
      } else {
        log('error', `${sc.id}: choice "${ch.id}" → "${ch.next}" (not found)`)
      }
    }
  }
  for (const s of scenes) {
    if (!visited.has(s.id) && !s.ending) {
      log('warn', `${sc.id}: unreachable scene "${s.id}"`)
    }
  }
  for (const eid of endingIds) {
    let referenced = false
    for (const s of scenes) {
      for (const ch of s.choices ?? []) {
        if (ch.next === eid) { referenced = true; break }
      }
      if (s.ending === eid) { referenced = true; break }
      if (referenced) break
    }
    if (!referenced) log('warn', `${sc.id}: ending "${eid}" never reached`)
  }
  if (endingIds.size === 0) {
    log('error', `${sc.id}: no endings defined`)
  }
  // 双值剧本 quadrant (在 stats 中)
  if (sc.stats) {
    const byQuad = { HH: 0, HL: 0, LH: 0, LL: 0 }
    for (const e of sc.endings ?? []) {
      if (e.quadrant && byQuad[e.quadrant] !== undefined) byQuad[e.quadrant]++
    }
    const have = Object.entries(byQuad).filter(([, n]) => n > 0).map(([q]) => q)
    const want = ['HH', 'HL', 'LH', 'LL']
    const missing = want.filter(q => byQuad[q] === 0)
    if (missing.length) log('warn', `${sc.id}: missing quadrant(s) ${missing.join(',')} (have ${have.join(',') || 'none'})`)
  }
}

// ---------- 2. 人物 eraIds ----------
console.log(`\n[figures] checking ${figures.length} figures ...`)
let badEras = 0
for (const f of figures) {
  for (const eid of f.eraIds ?? []) {
    if (!eraIds.has(eid)) {
      badEras++
      log('error', `${f.id}: eraIds "${eid}" not in eras.json`)
    }
  }
}

// ---------- 3. 事件 relatedEraId ----------
console.log(`\n[events] checking ${events.length} events ...`)
let badRelatedEra = 0
for (const e of events) {
  if (e.relatedEraId && !eraIds.has(e.relatedEraId)) {
    badRelatedEra++
    log('error', `${e.id}: relatedEraId "${e.relatedEraId}" not found`)
  }
}

console.log(`\n  → ${errors} errors, ${warnings} warnings` +
  (badEras ? ` (${badEras} bad figure·eraIds, ${badRelatedEra} bad event·relatedEraId)` : ''))
process.exit(errors ? 1 : 0)
