# Map Back Full Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the map information-card Back button return to the exact originating section and restore the previously open detail/dialog selection.

**Architecture:** Keep `pendingReopen` as the single source-of-truth payload. `useJumpToMap` records the minimal restoration payload, `TMapTest` dispatches the mapped section event without consuming it, and the destination section consumes its own payload after mounting. Add missing Geography restoration and centralize route resolution so unknown origins safely return home.

**Tech Stack:** React 18, TypeScript, Zustand, Vite, Playwright/Chrome smoke scripts.

---

## File Structure

- Modify `src/hooks/useJumpToMap.ts`: export typed reopen metadata helpers and guarantee every supported map jump stores the matching payload.
- Modify `src/lib/reopenRoutes.ts`: make origin-to-section routing exhaustive and testable.
- Modify `src/components/TMapTest.tsx`: perform Back atomically and prevent duplicate clicks.
- Modify `src/components/Geography/GeographyOverview.tsx`: use `useJumpToMap` and restore feature/territory dialogs from `pendingReopen`.
- Modify `src/components/Dashboard.tsx`: consume dashboard payload only after successful restoration.
- Modify `src/components/Wars/WarsOverview.tsx`: consume war payload only after successful restoration.
- Modify `src/components/Cultures/CulturesOverview.tsx`: consume culture payload only after successful restoration.
- Create `tests/playwright-scratch/test-map-back-restore.cjs`: browser smoke test for supported Back flows.

### Task 1: Make reopen routing and payload creation explicit

**Files:**
- Modify: `src/hooks/useJumpToMap.ts`
- Modify: `src/lib/reopenRoutes.ts`
- Test: `tests/playwright-scratch/test-map-back-restore.cjs`

- [ ] **Step 1: Write the failing route contract test**

Create `tests/playwright-scratch/test-map-back-restore.cjs` with a route-contract preflight that asserts each supported kind maps to the expected section:

```js
const assert = require('node:assert/strict')

const expectedRoutes = {
  quickEvent: 'history:go-dashboard',
  event: 'history:go-dashboard',
  cultureEvent: 'history:go-cultures',
  geoFeature: 'history:go-geography',
  territory: 'history:go-geography',
  war: 'history:go-wars',
  majorWar: 'history:go-wars',
  majorWarNode: 'history:go-wars',
}

assert.equal(Object.keys(expectedRoutes).length, 8)
console.log('route contract kinds:', Object.keys(expectedRoutes).join(','))
```

The browser portion added in Task 3 will verify the runtime mapping.

- [ ] **Step 2: Export the supported reopen type and use it in route mapping**

In `src/lib/reopenRoutes.ts`, define and use one union:

```ts
export type ReopenKind =
  | 'quickEvent'
  | 'event'
  | 'cultureEvent'
  | 'geoFeature'
  | 'territory'
  | 'war'
  | 'majorWar'
  | 'majorWarNode'

export const REOPEN_EVENT_MAP: Record<ReopenKind, string> = {
  quickEvent: 'history:go-dashboard',
  event: 'history:go-dashboard',
  cultureEvent: 'history:go-cultures',
  geoFeature: 'history:go-geography',
  territory: 'history:go-geography',
  war: 'history:go-wars',
  majorWar: 'history:go-wars',
  majorWarNode: 'history:go-wars',
}

export function getReopenEvent(kind: ReopenKind | undefined): string {
  return kind ? REOPEN_EVENT_MAP[kind] : 'history:go-dashboard'
}
```

- [ ] **Step 3: Align `useJumpToMap` with the shared kind type**

Import `ReopenKind`, type `resolveReopen` as:

```ts
function resolveReopen(extras: JumpToMapExtras): {
  kind: ReopenKind
  payload: ReopenPayload
} | null
```

Extract the existing inline extras shape into `JumpToMapExtras`, retaining all IDs used by the eight payload variants. Do not store a payload unless the required IDs are present.

- [ ] **Step 4: Verify type safety**

Run:

```bash
npm run lint
```

Expected: `tsc --noEmit` exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useJumpToMap.ts src/lib/reopenRoutes.ts tests/playwright-scratch/test-map-back-restore.cjs
git commit -m "refactor: type map reopen routes"
```

### Task 2: Restore every destination dialog from `pendingReopen`

**Files:**
- Modify: `src/components/Dashboard.tsx`
- Modify: `src/components/Wars/WarsOverview.tsx`
- Modify: `src/components/Cultures/CulturesOverview.tsx`
- Modify: `src/components/Geography/GeographyOverview.tsx`

- [ ] **Step 1: Add a shared consumption rule to each existing destination**

For Dashboard, Wars, and Cultures, change the restoration effect so it clears `pendingReopen` only after a matching entity is found and restored. If an entity is missing, clear the stale payload and leave the destination on its default state.

Dashboard example:

```ts
if (current?.kind === 'event') {
  const eventExists = events.some(event => event.id === current.eventId)
  if (eventExists) selectEvent(current.eventId)
  useHistoryStore.getState().setPendingReopen(null)
}
```

Apply the same lookup-before-restore rule to wars, major wars, major-war nodes, and culture events.

- [ ] **Step 2: Add Geography mount-time restoration**

In `GeographyOverview`, add an effect keyed by `isActive`:

```ts
useEffect(() => {
  if (!isActive) return
  const pending = useHistoryStore.getState().pendingReopen
  if (!pending) return

  if (pending.kind === 'geoFeature') {
    const feature = ALL_FEATURES.find(item => item.id === pending.featureId)
    if (feature) {
      setTab('nature')
      setSelectedFeature(feature)
    }
    useHistoryStore.getState().setPendingReopen(null)
    return
  }

  if (pending.kind === 'territory') {
    const territory = TERRITORY_FILES.find(
      item => item.id === pending.territoryId && item.region === pending.region,
    )
    if (territory) {
      setTab('territory')
      setTerritoryRegion(territory.region)
      setSelectedTerritory({
        id: territory.id,
        region: territory.region,
        era: eras.find(era => era.id === territory.id),
      })
    }
    useHistoryStore.getState().setPendingReopen(null)
  }
}, [isActive])
```

- [ ] **Step 3: Route Geography jumps through `useJumpToMap`**

Import and instantiate `useJumpToMap`. Replace the natural-feature direct call:

```ts
setMapFocus({ center: selectedFeature.labelPos, zoom: 4, label: selectedFeature.name })
```

with:

```ts
jumpToMap(selectedFeature.labelPos, selectedFeature.name, 4, {
  reopenLabel: selectedFeature.name,
  featureId: selectedFeature.id,
})
```

Replace the territory direct call with:

```ts
jumpToMap(center, title, 4, {
  reopenLabel: title,
  territoryId: selectedTerritory.id,
  territoryRegion: selectedTerritory.region,
})
```

Remove the now-unused `setMapFocus` selector. Preserve existing `setYear` behavior before jumping.

- [ ] **Step 4: Verify all supported payload consumers exist**

Run:

```bash
rg -n "pending\.kind === '(quickEvent|event|cultureEvent|geoFeature|territory|war|majorWar|majorWarNode)'" src/components
npm run lint
```

Expected: all eight kinds appear in destination consumers; TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/Dashboard.tsx src/components/Wars/WarsOverview.tsx src/components/Cultures/CulturesOverview.tsx src/components/Geography/GeographyOverview.tsx
git commit -m "fix: restore source dialogs after map back"
```

### Task 3: Make Back atomic and validate browser flows

**Files:**
- Modify: `src/components/TMapTest.tsx`
- Test: `tests/playwright-scratch/test-map-back-restore.cjs`

- [ ] **Step 1: Prevent duplicate Back dispatches**

Add a ref near the map refs:

```ts
const backInProgressRef = useRef(false)
```

Change `onBack` to:

```ts
onBack={() => {
  if (backInProgressRef.current) return
  backInProgressRef.current = true

  const reopenEvent = getReopenEvent(infoCard.reopenKind)
  setInfoCard(null)
  setMapFocus(null)
  window.dispatchEvent(new CustomEvent(reopenEvent))

  window.setTimeout(() => {
    backInProgressRef.current = false
  }, 0)
}}
```

The payload remains in `pendingReopen`; only the destination component clears it after restoration.

- [ ] **Step 2: Add browser smoke-test helpers**

Complete `tests/playwright-scratch/test-map-back-restore.cjs` using installed Chrome:

```js
const { chromium } = require('playwright')

async function openBrowser() {
  return chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  })
}

async function clickBack(page) {
  await page.getByRole('button', { name: '返回' }).click()
  await page.waitForTimeout(250)
}
```

For each available fixture/entry point, navigate Dashboard/Wars/Cultures/Geography → open detail → map → Back, then assert the originating heading and detail title are visible again. At minimum include one Dashboard event, one War, one Culture event, and one Geography feature.

- [ ] **Step 3: Run the browser test**

Run:

```bash
node tests/playwright-scratch/test-map-back-restore.cjs
```

Expected: prints PASS for Dashboard, Wars, Cultures, and Geography; exits 0.

- [ ] **Step 4: Run project verification**

Run:

```bash
npm run check
npm run build
```

Expected: data validation passes, TypeScript exits 0, and Vite production build completes.

- [ ] **Step 5: Commit**

```bash
git add src/components/TMapTest.tsx tests/playwright-scratch/test-map-back-restore.cjs
git commit -m "fix: make map back restore origin atomically"
```

## Plan Self-Review

- Spec coverage: all eight origin kinds, fallback behavior, payload consumption, duplicate-click safety, and browser verification are covered.
- Placeholder scan: no TBD/TODO placeholders; each code change and command is explicit.
- Type consistency: `ReopenKind`, `ReopenPayload`, `pendingReopen`, and `reopenKind` names match existing store and map-card concepts.
