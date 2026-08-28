/**
 * MapGlobeView — 地球仪视图（react-globe.gl）
 *
 * 显示朝代都城点 + 事件点 + 自然地理要素：
 *  - 朝代点：按 era.color 上色，按当前 currentYear 高亮当前朝代（脉冲）
 *  - 事件点：当前年份 ±100 年范围内的事件以浅色小点显示
 *  - 自然地理要素：叠加层（河流/山脉/海洋/...）按 store.visible 渲染到球面
 *  - 不自动旋转（用户拖拽/缩放控制视角）
 *  - 鼠标悬停图钉/要素 → InfoCardView 出现在该图钉屏幕位置（与 2D/3D 一致）
 *  - 点击 → 锁定 InfoCardView 不消失
 *  - 联动 EraRail：选中朝代时地球旋转到该点上空
 *
 * 信息显示完全对齐 2D/3D 地图：
 *  - 左上角：当前年份 / 当前朝代 / 都城 / 起止年 / 事件数
 *  - 弹卡：InfoCardView（封面 + 简介 + 朝下小三角，定位在图钉屏幕位置）
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { flyToGlobe } from '@/utils/mapAnimation'
import type { Era, HistoricalEvent } from '@/types'
import { useMapStyleStore } from '@/store/useMapStyleStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useMapLayersStore } from '@/store/useMapLayersStore'
import { useAIStore, MAX_TOKENS } from '@/store/useAIStore'
import { bingImage, fallbackKeyword } from '@/utils/geoImage'
import { summarizeEra, summarizeEvent } from '@/utils/summarize'
import { streamAI } from '@/utils/aiStream'
import {
  RIVERS, MOUNTAINS, STRAITS,
  SEAS, LAKES, DESERTS, PLAINS, PENINSULAS,
  type GeoFeature, type GeoFeatureType,
} from '@/data/geographic-features'
import type { GeoLayerKey } from '@/store/useMapLayersStore'
import { HISTORIC_PLACES, type HistoricPlace } from '@/data/historic-places'
import { COUNTRY_LABELS, type CountryLabel } from '@/data/country-labels'
import InfoCardView, { type InfoCardData } from '@/components/Map/InfoCardView'

interface Props {
  eras: Era[]
  events: HistoricalEvent[]
  onSelectEra?: (eraId: string) => void
}

type GlobePoint =
  | {
      kind: 'era'
      id: string
      name: string
      lat: number
      lng: number
      color: string
      startYear: number
      endYear: number
      isCurrent: boolean
    }
  | {
      kind: 'event'
      id: string
      lat: number
      lng: number
      year: number
      title: string
      category: string
      region: string
      relatedEraId?: string
      description: string
    }
  | {
      kind: 'osmPoi'
      id: string | number
      lat: number
      lng: number
      name: string
      category: string
      subtag?: string
    }

type EraPoint = Extract<GlobePoint, { kind: 'era' }>

type GeoArcDatum = {
  id: string
  name: string
  type: GeoFeatureType
  points: { lat: number; lng: number }[]
  labelPos: { lat: number; lng: number }
  description?: string
  imageUrl?: string
  imageCredit?: string
}

type GeoPolyDatum = {
  id: string
  name: string
  type: GeoFeatureType
  // react-globe.gl 的 GeoJsonGeometry 类型定义较松（coordinates: number[]），实际 Polygon 需要嵌套数组
  geometry: { type: string; coordinates: any }
  labelPos: { lat: number; lng: number }
  description?: string
  imageUrl?: string
  imageCredit?: string
}

type GeoLabelDatum = {
  id: string
  text: string
  lat: number
  lng: number
  color: string
  size: number
  feature: GeoFeature
}

const GEO_STYLE: Record<GeoFeatureType, {
  stroke?: string
  strokeWidth?: number
  fill?: string
  fillOpacity?: number
  strokeOpacity?: number
  labelColor?: string
  isPolygon?: boolean
}> = {
  river:      { stroke: '#3ddcff', strokeWidth: 1.0, strokeOpacity: 1.0,  labelColor: '#ffe9a8' },
  mountain:   { stroke: '#ffb27a', strokeWidth: 1.0, strokeOpacity: 1.0,  labelColor: '#ffd9a8' },
  sea:        { fill: '#2a78c8', fillOpacity: 0.45,   stroke: '#3ddcff', strokeWidth: 0.4, strokeOpacity: 1.0,  isPolygon: true, labelColor: '#bce8ff' },
  lake:       { fill: '#1a6db8', fillOpacity: 0.65,   stroke: '#3ddcff', strokeWidth: 0.4, strokeOpacity: 1.0,  isPolygon: true, labelColor: '#bce8ff' },
  desert:     { fill: '#d4a85b', fillOpacity: 0.4,    stroke: '#ffb27a', strokeWidth: 0.4, strokeOpacity: 1.0,  isPolygon: true, labelColor: '#ffd9a8' },
  plain:      { fill: '#7bbf5a', fillOpacity: 0.4,    stroke: '#a3d885', strokeWidth: 0.4, strokeOpacity: 1.0,  isPolygon: true, labelColor: '#c8ffa3' },
  peninsula:  { fill: '#a08555', fillOpacity: 0.35,   stroke: '#e8c39a', strokeWidth: 0.4, strokeOpacity: 1.0,  isPolygon: true, labelColor: '#ffd9a8' },
  strait:     { stroke: '#3ddcff', strokeWidth: 1.0, strokeOpacity: 1.0,  labelColor: '#bce8ff' },
}

const POLY_LAYERS: GeoLayerKey[] = ['seas', 'lakes', 'deserts', 'plains', 'peninsulas']
const ARC_LAYERS: GeoLayerKey[] = ['rivers', 'mountains', 'straits']

const POLY_COLLECTION: Record<string, GeoFeature[]> = {
  seas: SEAS, lakes: LAKES, deserts: DESERTS, plains: PLAINS, peninsulas: PENINSULAS,
}
const ARC_COLLECTION: Record<string, GeoFeature[]> = {
  rivers: RIVERS, mountains: MOUNTAINS, straits: STRAITS,
}

export default function MapGlobeView({ eras, events, onSelectEra }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const globeEl = useRef<any>(null)
  const globeMeshRef = useRef<THREE.Mesh | null>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const userInteractAtRef = useRef<number>(0)
  const currentYear = useHistoryStore(s => s.currentYear)
  const setYear = useHistoryStore(s => s.setYear)
  const filters = useHistoryStore(s => s.filters)
  const globePOV = useHistoryStore(s => s.globePOV)
  const syncGlobePOVToURL = useHistoryStore(s => s.syncGlobePOVToURL)
  const setGlobePointOfView = useMapStyleStore(s => s.setGlobePointOfView)
  const globePointOfView = useMapStyleStore(s => s.globePointOfView)
  const showDayNight = useMapLayersStore(s => s.showDayNight)

  // 首次打开地球仪：优先 URL 参数，其次 localStorage，最后默认中國上空
  useEffect(() => {
    if (globePointOfView === null) {
      if (globePOV) {
        setGlobePointOfView(globePOV)
      } else {
        setGlobePointOfView({ lat: 35, lng: 104, altitude: 1.8 })
      }
    }
  }, [])

  // 视角变化时同步到 URL（可分享）
  useEffect(() => {
    if (globePointOfView) {
      syncGlobePOVToURL(globePointOfView)
    }
  }, [globePointOfView, syncGlobePOVToURL])

  // 叠加层可见性（来自 store）
  const layersVisible = useMapLayersStore(s => s.visible)
  const showLabels = useMapLayersStore(s => s.showLabels)
  const showCloud = useMapLayersStore(s => s.showCloud)

  // 弹卡：source 区分 hover（移开就消失）和 click（锁定直到点 ×）
  const [infoCard, setInfoCard] = useState<InfoCardData | null>(null)
  const [pinnedCard, setPinnedCard] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  // 地球仪当前高度（用于标签 LOD）
  const [globeAltitude, setGlobeAltitude] = useState(2.5)

  // 内置精选 POI 数据集（替代 OSM，公共实例不稳定）— 开关来自 store
  const osmPoisEnabled = useMapLayersStore(s => s.showOsmPois)
  const historicPlaces = useMemo<HistoricPlace[]>(
    () => osmPoisEnabled ? [...HISTORIC_PLACES] : [],
    [osmPoisEnabled]
  )

  // 容器尺寸自适应
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ w: Math.max(320, Math.floor(width)), h: Math.max(320, Math.floor(height)) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // OrbitControls 初始化：启用拖拽/缩放/平移 + 确保 DOM 事件绑定
  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined

    const setup = (): void => {
      if (cancelled) return
      const g = globeEl.current
      if (!g) {
        requestAnimationFrame(setup)
        return
      }
      const controls = g.controls?.()
      const renderer = g.renderer?.()
      if (!controls || !renderer) {
        requestAnimationFrame(setup)
        return
      }
      // 启用所有交互（拖动旋转 / 滚轮缩放 / 右键平移）
      controls.enableRotate = true
      controls.enableZoom = true
      controls.enablePan = true
      // 关闭阻尼：避免拖拽/缩放后镜头继续滑动，HUD 才不会一直显示 MOVING
      controls.enableDamping = false
      // 确保 DOM 事件已绑定（three.js r155+ 新 API 需要显式 connect）
      if (renderer.domElement) {
        controls.connect(renderer.domElement)
      }
      controls.update()
    }

    setup()

    return () => {
      cancelled = true
      if (cleanup) cleanup()
    }
  }, [])

  // 朝代点（带 capital 坐标的）
  const eraPoints = useMemo<GlobePoint[]>(() => {
    return eras
      .filter(e => e.capital && e.capital.length === 2)
      .map(e => ({
        kind: 'era',
        id: e.id,
        name: e.name,
        lat: e.capital![1],
        lng: e.capital![0],
        color: e.color || '#c89a5b',
        startYear: e.startYear,
        endYear: e.endYear,
        isCurrent: currentYear >= e.startYear && currentYear <= e.endYear,
      }))
  }, [eras, currentYear])

  // 事件点（当前年份 ± 时间窗口，受筛选器影响）
  const MAX_EVENT_POINTS = 200
  const [eventPoints, eventPointsTruncated] = useMemo(() => {
    const timeWindow = 100
    const { categories, regions, minImportance } = filters
    const filtered = events
      .filter(e => {
        if (!e.coordinates) return false
        if (Math.abs(e.year - currentYear) > timeWindow) return false
        if (categories.length > 0 && !categories.includes(e.category)) return false
        if (regions.length > 0 && !regions.includes(e.region)) return false
        if (e.importance < minImportance) return false
        return true
      })
    const display = filtered.slice(0, MAX_EVENT_POINTS).map(e => ({
      kind: 'event' as const,
      id: e.id,
      lat: e.coordinates![1],
      lng: e.coordinates![0],
      year: e.year,
      title: e.title,
      category: e.category,
      region: e.region,
      relatedEraId: e.relatedEraId,
      description: e.description,
    }))
    return [display, filtered.length > MAX_EVENT_POINTS] as const
  }, [events, currentYear, filters])

  const osmPoiPoints = useMemo<GlobePoint[]>(() => {
    return historicPlaces.map(p => ({
      kind: 'osmPoi' as const,
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      name: p.name,
      category: p.category,
      subtag: p.subtag,
    }))
  }, [historicPlaces])

  // 城市/首都名 + 国家名 作为 HTML 标签（DOM 覆盖层，不走 3D mesh）
  type HtmlEl = {
    id: string
    lat: number
    lng: number
    name: string
    kind: 'place' | 'country'
    subKind?: string
    importance?: number
  }
  const osmHtmlElements = useMemo<HtmlEl[]>(() => {
    const places: HtmlEl[] = historicPlaces.map(p => ({
      id: `osm-html-${p.id}`,
      lat: p.lat,
      lng: p.lng,
      name: p.name,
      kind: 'place' as const,
      subKind: p.category,
    }))
    const countries: HtmlEl[] = COUNTRY_LABELS.map(c => ({
      id: `cn-${c.id}`,
      lat: c.lat,
      lng: c.lng,
      name: c.name,
      kind: 'country' as const,
      importance: c.importance,
    }))
    // 地理要素（河流/山脉/海/湖/半岛/海峡）的 HTML 标签
    const showMinor = globeAltitude <= 2.5
    const geoLabels: HtmlEl[] = []
    for (const k of [...ARC_LAYERS, ...POLY_LAYERS]) {
      if (!layersVisible[k]) continue
      const collection = ARC_COLLECTION[k] || POLY_COLLECTION[k]
      if (!collection) continue
      for (const f of collection) {
        const imp = f.importance ?? 1
        if (!showMinor && imp < 3) continue
        const st = GEO_STYLE[f.type]
        geoLabels.push({
          id: `geo-${f.id}`,
          lat: f.labelPos[1],
          lng: f.labelPos[0],
          name: f.name,
          kind: 'country' as const,  // 复用 country 样式（亮色加粗）
          importance: imp,
          // 携带颜色信息通过自定义字段
          _color: st?.labelColor || '#e8c39a',
        } as any)
      }
    }
    return [...places, ...countries, ...geoLabels]
  }, [historicPlaces, layersVisible, globeAltitude])

  const allPoints = useMemo<GlobePoint[]>(
    () => [...eraPoints, ...eventPoints, ...osmPoiPoints],
    [eraPoints, eventPoints, osmPoiPoints]
  )

  const currentEraPoints = useMemo<EraPoint[]>(
    () => eraPoints.filter((p): p is EraPoint => p.kind === 'era' && p.isCurrent),
    [eraPoints]
  )

  // 当前朝代脉冲环（自定义 objectsData：单面渲染 + 视锥剔除，解决背面也显示的问题）
  const ringObjectsRef = useRef<THREE.Mesh[]>([])
  const ringAnimRef = useRef<number>(0)
  const [ringObjects, setRingObjects] = useState<THREE.Mesh[]>([])

  function buildRingObjects(points: EraPoint[]): THREE.Mesh[] {
    // 清理旧对象
    ringObjectsRef.current.forEach(m => {
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    })
    ringObjectsRef.current = []

    if (!points.length) return []

    const g = globeEl.current
    if (!g) return []

    const globeRadius = g.getGlobeRadius()
    const meshes: THREE.Mesh[] = []

    for (const p of points) {
      // 球面坐标 → 3D 向量
      const phi = (90 - p.lat) * Math.PI / 180
      const theta = (180 - p.lng) * Math.PI / 180
      const r = globeRadius + 0.025 * globeRadius // 与原 ringAltitude 对应
      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      )

      // RingGeometry 面向外（法线指向球心），只渲染正面
      const ringGeom = new THREE.RingGeometry(0.015 * globeRadius, 0.04 * globeRadius, 64)
      ringGeom.rotateX(-Math.PI / 2) // 默认在 XZ 平面，旋转到水平

      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color),
        transparent: true,
        opacity: 0.6,
        side: THREE.FrontSide,
        depthWrite: false,
      })

      const mesh = new THREE.Mesh(ringGeom, ringMat)
      mesh.position.copy(pos)
      // 朝向球心（法线指向球心），这样 FrontSide 只在外侧可见
      mesh.lookAt(0, 0, 0)

      // 存储动画参数
      ;(mesh as any).userData = {
        startRadius: 0.015 * globeRadius,
        endRadius: 0.04 * globeRadius,
        speed: 2, // ringPropagationSpeed
        period: 1500, // ringRepeatPeriod
        phase: Math.random() * Math.PI * 2,
      }

      meshes.push(mesh)
      ringObjectsRef.current.push(mesh)
    }
    return meshes
  }

  // 初始化 + 当 currentEraPoints 变化时重建
  useEffect(() => {
    const meshes = buildRingObjects(currentEraPoints)
    setRingObjects(meshes)

    const g = globeEl.current
    if (!g) return

    // 将新建的环添加到地球仪网格（使其随地球旋转）
    const globeMesh = globeMeshRef.current
    if (globeMesh) {
      meshes.forEach(ring => {
        if (ring.parent !== globeMesh) {
          globeMesh.add(ring)
        }
      })
    }

    // 动画循环
    const animate = () => {
      const now = performance.now()
      ringObjectsRef.current.forEach(m => {
        const u = m.userData
        // 环动画
        if (u.period) {
          const t = ((now + u.phase) % u.period) / u.period
          const radius = THREE.MathUtils.lerp(u.startRadius, u.endRadius, t)
          const opacity = 1 - t
          ;(m.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6
          m.scale.setScalar(radius / u.startRadius)
        }
        // 大气层光晕：cameraPosition 是 Three.js 自动注入的内置 uniform，无需手动更新
      })
      ringAnimRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(ringAnimRef.current)
      ringObjectsRef.current.forEach(m => {
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
      ringObjectsRef.current = []
    }
  }, [currentEraPoints])

  // 大气层边缘光晕（自定义对象：菲涅尔边缘发光，只在大气层外侧可见）
  const atmosphereGlowRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    const g = globeEl.current
    if (!g) return

    const globeRadius = g.getGlobeRadius()

    // 大气层外侧发光球壳（略大于大气层高度）
    const glowRadius = globeRadius * (1 + 0.15) * 1.02
    const glowGeom = new THREE.SphereGeometry(glowRadius, 64, 64)
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x3a82c9) },
        glowIntensity: { value: 0.45 },
      },
      vertexShader: `
        varying float vViewDepth;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
          vViewDepth = 1.0 - max(dot(vNormal, viewDir), 0.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowIntensity;
        varying float vViewDepth;
        void main() {
          float rim = pow(vViewDepth, 3.0) * glowIntensity;
          gl_FragColor = vec4(glowColor, rim);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    })

    const glowMesh = new THREE.Mesh(glowGeom, glowMat)
    glowMesh.name = 'atmosphere-glow'

    g.scene().add(glowMesh)
    atmosphereGlowRef.current = glowMesh

    // 合并到 ringObjects 用于渲染
    setRingObjects(prev => [...prev, glowMesh])

    return () => {
      g.scene().remove(glowMesh)
      glowGeom.dispose()
      glowMat.dispose()
      atmosphereGlowRef.current = null
    }
  }, [])

  // ============ 自然地理要素 → 球面层 ============
  // 折线层（河流/山脉/海峡/瀑布）→ arcsData
  // three-globe 的 arc 只能从 start 到 end 画一条直线（丢失中间点）。
  // 这里用一段直线代表整条路径，配细描边（strokeWidth 0.4–0.6）就不会出现"巨型色块"。
  const arcData = useMemo<GeoArcDatum[]>(() => {
    const out: GeoArcDatum[] = []
    for (const k of ARC_LAYERS) {
      if (!layersVisible[k]) continue
      const feats = ARC_COLLECTION[k]
      if (!feats) continue
      for (const f of feats) {
        if (!f.geometry || f.geometry.length < 2) continue
        const pts = f.geometry.map(([lng, lat]) => ({ lat, lng }))
        // 用首尾点定义一段直线弧（细线情况下看起来像一道线，不会有 blob 感）
        out.push({
          id: f.id,
          name: f.name,
          type: f.type,
          points: [pts[0], pts[pts.length - 1]],
          labelPos: { lat: f.labelPos[1], lng: f.labelPos[0] },
          description: f.description,
          imageUrl: f.imageUrl,
          imageCredit: f.imageCredit,
        })
      }
    }
    return out
  }, [layersVisible])

  // 面状层（海洋/湖泊/沙漠/平原/半岛/区域）→ polygonsData（GeoJSON Polygon）
  const polyData = useMemo<GeoPolyDatum[]>(() => {
    const out: GeoPolyDatum[] = []
    for (const k of POLY_LAYERS) {
      if (!layersVisible[k]) continue
      const feats = POLY_COLLECTION[k]
      if (!feats) continue
      for (const f of feats) {
        if (!f.geometry || f.geometry.length < 3) continue
        // GeoJSON Polygon 第一个 ring 是外环；闭合需要首尾相同
        const ring = f.geometry.map(([lng, lat]) => [lng, lat] as [number, number])
        const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
          ? ring
          : [...ring, ring[0]]
        out.push({
          id: f.id,
          name: f.name,
          type: f.type,
          geometry: { type: 'Polygon', coordinates: [closed] },
          labelPos: { lat: f.labelPos[1], lng: f.labelPos[0] },
          description: f.description,
          imageUrl: f.imageUrl,
          imageCredit: f.imageCredit,
        })
      }
    }
    return out
  }, [layersVisible])

  // 标签层（地理要素的名称）— 现在通过 htmlElementsData 渲染（OSM 同款路径）
  const labelData = useMemo<GeoLabelDatum[]>(() => {
    // 保留空数组，因为 labelsData 已移除
    void showLabels; void layersVisible; void globeAltitude
    return []
  }, [showLabels, layersVisible, globeAltitude])

  // 视角同步（从 store 拉）：直接设置 POV（无动画，避免镜头移动触发 HUD 抖动）
  useEffect(() => {
    const g = globeEl.current
    if (!g || !globePointOfView) return
    g.pointOfView({
      lng: globePointOfView.lng,
      lat: globePointOfView.lat,
      altitude: globePointOfView.altitude,
    })
  }, [globePointOfView])

  // 视角高度追踪（用于标签 LOD）
  useEffect(() => {
    const g = globeEl.current
    if (!g) return
    const controls = g.controls?.()
    if (!controls) return

    const onChange = () => {
      const pov = g.pointOfView()
      setGlobeAltitude(pov.altitude)
    }
    controls.addEventListener('change', onChange)
    return () => controls.removeEventListener('change', onChange)
  }, [])

  // 弹卡跟随地球旋转/拖拽：监听 OrbitControls change 事件，实时刷新 screenX/Y
  useEffect(() => {
    if (!infoCard) return
    const g = globeEl.current
    if (!g) return
    const controls = g.controls?.()
    if (!controls) return

    const onChange = () => {
      setInfoCard(prev => {
        if (!prev) return prev
        const c = g.getScreenCoords(prev.lat, prev.lng)
        const x = Math.round(c.x)
        const y = Math.round(c.y)
        if (prev.screenX === x && prev.screenY === y) return prev
        return { ...prev, screenX: x, screenY: y }
      })
    }
    controls.addEventListener('change', onChange)
    return () => controls.removeEventListener('change', onChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoCard?.lat, infoCard?.lng])

  // 云层（双层：基础云图 + 动态噪声流场，更真实）
  useEffect(() => {
    if (!showCloud) return
    const g = globeEl.current
    if (!g) return
    const scene = g.scene()
    if (!scene) return

    const globeRadius = g.getGlobeRadius()
    const loader = new THREE.TextureLoader()
    const cloudTex = loader.load('//unpkg.com/three-globe/example/img/earth-clouds.png')
    cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping

    // 第 1 层：基础云图
    const cloudGeom1 = new THREE.SphereGeometry(globeRadius * 1.012, 64, 64)
    const cloudMat1 = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const cloudMesh1 = new THREE.Mesh(cloudGeom1, cloudMat1)
    cloudMesh1.name = 'cloud-layer-1'
    scene.add(cloudMesh1)

    // 第 2 层：噪声流场（自定义 Shader，模拟风向）
    const noiseUrl = '//unpkg.com/three@0.160.0/examples/textures/perlin-512.png'
    const noiseTex = loader.load(noiseUrl)
    noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping

    const cloudGeom2 = new THREE.SphereGeometry(globeRadius * 1.018, 64, 64)
    const cloudMat2 = new THREE.ShaderMaterial({
      uniforms: {
        uCloudTex: { value: cloudTex },
        uNoiseTex: { value: noiseTex },
        uTime: { value: 0 },
        uOpacity: { value: 0.18 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uCloudTex;
        uniform sampler2D uNoiseTex;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec2 uv1 = vUv + vec2(uTime * 0.0003, uTime * 0.0001);
          vec2 uv2 = vUv * 2.0 - vec2(uTime * 0.0005, 0.0);
          float noise = texture2D(uNoiseTex, uv2).r;
          float cloud = texture2D(uCloudTex, uv1).r;
          // 组合：基础云图 + 噪声扰动
          float alpha = (cloud * 0.7 + noise * 0.3) * uOpacity;
          vec3 color = mix(vec3(0.6, 0.65, 0.75), vec3(1.0), cloud);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const cloudMesh2 = new THREE.Mesh(cloudGeom2, cloudMat2)
    cloudMesh2.name = 'cloud-layer-2'
    scene.add(cloudMesh2)

    // 静态云层（移除自转，满足“不要自动旋转”要求）
    cloudMesh1.rotation.y = 0
    cloudMesh2.rotation.y = 0
    if (cloudMat2.uniforms) cloudMat2.uniforms.uTime.value = 0
    let animationFrame = 0

    return () => {
      cancelAnimationFrame(animationFrame)
      scene.remove(cloudMesh1)
      scene.remove(cloudMesh2)
      cloudGeom1.dispose()
      cloudGeom2.dispose()
      cloudMat1.dispose()
      cloudMat2.dispose()
      cloudTex.dispose()
      noiseTex.dispose()
    }
  }, [showCloud])

  // 昼夜光照（方向光旋转模拟太阳）
  useEffect(() => {
    if (!showDayNight) return
    const g = globeEl.current
    if (!g) return
    const scene = g.scene()
    if (!scene) return

    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2)
    sunLight.name = 'sun-light'
    sunLight.position.set(0, 0, 1) // 初始位置（正午）
    scene.add(sunLight)

    // 环境光补全阴影面
    const ambientLight = new THREE.AmbientLight(0x333344, 0.4)
    ambientLight.name = 'ambient-light'
    scene.add(ambientLight)

    // 固定光照角度（移除昼夜自转，满足“不要自动旋转”要求）
    sunLight.position.set(0, 3, 5)
    sunLight.target.position.set(0, 0, 0)
    let animationFrame = 0

    return () => {
      cancelAnimationFrame(animationFrame)
      scene.remove(sunLight)
      scene.remove(ambientLight)
      sunLight.dispose()
      ambientLight.dispose()
    }
  }, [showDayNight])

  // ============ POI 数据：来自内置 historic-places.ts（同步可用，无需网络） ============
  // （不再需要 globe.change 监听 + fetch — 数据在模块加载时就绪）

  // ============ 弹卡定位（hover/click 走同一套：球面经纬度 → 屏幕坐标） ============
  // react-globe.gl 提供 globe.getScreenCoords(lat, lng, alt?) → {x, y}（相对 globe 画布）
  // 我们的容器和画布尺寸一致，所以坐标可以直接当屏幕位置用
  function getScreenXY(lat: number, lng: number): { x: number; y: number } {
    const g = globeEl.current
    if (!g) return { x: Math.floor(size.w / 2), y: Math.floor(size.h / 2) }
    try {
      const c = g.getScreenCoords(lat, lng)
      return { x: Math.round(c.x), y: Math.round(c.y) }
    } catch {
      return { x: Math.floor(size.w / 2), y: Math.floor(size.h / 2) }
    }
  }

  function clearHideTimer() {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  // 显示弹卡；pinned=true 表示点击锁定，false 表示 hover 临时显示
  const showCard = useCallback((card: Omit<InfoCardData, 'screenX' | 'screenY'>, lat: number, lng: number, pinned: boolean) => {
    clearHideTimer()
    const { x, y } = getScreenXY(lat, lng)
    setInfoCard({ ...card, screenX: x, screenY: y })
    setPinnedCard(pinned)
  }, [size.w, size.h])

  // hover-out：延时关闭（pinned 不关）
  const scheduleHideCard = useCallback(() => {
    if (pinnedCard) return
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setInfoCard(null)
      hideTimerRef.current = null
    }, 150)
  }, [pinnedCard])

  // 关闭弹卡（用户点 ×）
  const closeCard = useCallback(() => {
    clearHideTimer()
    setInfoCard(null)
    setPinnedCard(false)
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 输入框/编辑器聚焦时不拦截
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'Escape':
          if (infoCard) closeCard()
          break
        case 'ArrowLeft':
          e.preventDefault()
          setYear(Math.max(-3000, currentYear - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setYear(Math.min(2025, currentYear + 1))
          break
        case '=':
        case '+':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const g = globeEl.current
            if (g) {
              const pov = g.pointOfView()
              flyToGlobe(g, { lng: pov.lng, lat: pov.lat, altitude: Math.max(1.1, pov.altitude * 0.85), duration: 300, ease: 'power2.out' })
            }
          }
          break
        case '-':
        case '_':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const g = globeEl.current
            if (g) {
              const pov = g.pointOfView()
              flyToGlobe(g, { lng: pov.lng, lat: pov.lat, altitude: Math.min(5, pov.altitude / 0.85), duration: 300, ease: 'power2.out' })
            }
          }
          break
        case ' ':
          // 自动旋转已移除，保留空格的 preventDefault 以免页面意外滚动
          e.preventDefault()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [infoCard, closeCard, currentYear])

  // 朝代点 hover / click
  const buildEraCard = (point: GlobePoint & { kind: 'era' }): Omit<InfoCardData, 'screenX' | 'screenY'> | null => {
    const era = eras.find(e => e.id === point.id)
    if (!era) return null
    return {
      label: era.name + (era.capital ? ' 都城' : ''),
      snippet: summarizeEra(era),
      coverImageUrl: bingImage(fallbackKeyword(era.name, era.region), 400, 240),
      lng: point.lng,
      lat: point.lat,
      source: 'click',
    }
  }

  const buildEventCard = (point: GlobePoint & { kind: 'event' }): Omit<InfoCardData, 'screenX' | 'screenY'> | null => {
    const ev = events.find(e => e.id === point.id)
    if (!ev) return null
    return {
      label: ev.title,
      snippet: summarizeEvent(ev),
      coverImageUrl: bingImage(fallbackKeyword(ev.title, ev.category), 400, 240),
      lng: point.lng,
      lat: point.lat,
      source: 'click',
    }
  }

  const buildGeoCard = (name: string, description: string | undefined, imageUrl: string | undefined, lat: number, lng: number): Omit<InfoCardData, 'screenX' | 'screenY'> => {
    return {
      label: name,
      snippet: description || `（暂无简介）`,
      coverImageUrl: imageUrl || '',
      lng,
      lat,
      source: 'click',
    }
  }

  const buildOsmPoiCard = (point: GlobePoint & { kind: 'osmPoi' }): Omit<InfoCardData, 'screenX' | 'screenY'> => {
    return {
      label: point.name,
      snippet: `OSM · ${point.category}${point.subtag ? ` · ${point.subtag}` : ''}`,
      coverImageUrl: bingImage(fallbackKeyword(point.name, point.subtag || point.category), 400, 240),
      lng: point.lng,
      lat: point.lat,
      source: 'click',
    }
  }

  const handlePointHover = useCallback((p: object | null) => {
    if (!p) { scheduleHideCard(); return }
    const point = p as GlobePoint
    if (point.kind === 'era') {
      const c = buildEraCard(point)
      if (c) showCard(c, point.lat, point.lng, false)
    } else if (point.kind === 'event') {
      const c = buildEventCard(point)
      if (c) showCard(c, point.lat, point.lng, false)
    } else {
      const c = buildOsmPoiCard(point)
      showCard(c, point.lat, point.lng, false)
    }
  }, [eras, events, showCard, scheduleHideCard])

  const handlePointClick = useCallback((p: object) => {
    const point = p as GlobePoint
    if (point.kind === 'era') {
      const c = buildEraCard(point)
      if (c) {
        showCard(c, point.lat, point.lng, true)
        onSelectEra?.(point.id)
        const g = globeEl.current
        if (g) flyToGlobe(g, { lng: point.lng, lat: point.lat, altitude: 1.5, duration: 800, ease: 'power2.out' })
      }
    } else if (point.kind === 'event') {
      const c = buildEventCard(point)
      if (c) showCard(c, point.lat, point.lng, true)
    } else {
      const c = buildOsmPoiCard(point)
      showCard(c, point.lat, point.lng, true)
    }
  }, [eras, events, showCard, onSelectEra])

  const handleArcHover = useCallback((a: object | null) => {
    if (!a) { scheduleHideCard(); return }
    const arc = a as GeoArcDatum
    showCard(buildGeoCard(arc.name, arc.description, arc.imageUrl, arc.labelPos.lat, arc.labelPos.lng), arc.labelPos.lat, arc.labelPos.lng, false)
  }, [showCard, scheduleHideCard])

  const handleArcClick = useCallback((a: object) => {
    const arc = a as GeoArcDatum
    showCard(buildGeoCard(arc.name, arc.description, arc.imageUrl, arc.labelPos.lat, arc.labelPos.lng), arc.labelPos.lat, arc.labelPos.lng, true)
  }, [showCard])

  const handlePolyHover = useCallback((p: object | null) => {
    if (!p) { scheduleHideCard(); return }
    const poly = p as GeoPolyDatum
    showCard(buildGeoCard(poly.name, poly.description, poly.imageUrl, poly.labelPos.lat, poly.labelPos.lng), poly.labelPos.lat, poly.labelPos.lng, false)
  }, [showCard, scheduleHideCard])

  const handlePolyClick = useCallback((p: object) => {
    const poly = p as GeoPolyDatum
    showCard(buildGeoCard(poly.name, poly.description, poly.imageUrl, poly.labelPos.lat, poly.labelPos.lng), poly.labelPos.lat, poly.labelPos.lng, true)
  }, [showCard])

  // AI 生成状态（用于显示加载遮罩 + 禁用 globe 交互）
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const aiGeneratingRef = useRef(false)

  // 处理地球仪点击（左键 / 右键）：获取经纬度并调用 AI 生成位置问答
  // 抽成共享函数，左键与右键共用，避免重复逻辑
  const askAIAboutLocation = useCallback(async (lat: number, lng: number) => {
    // 避免重复点击（用 ref 而非 state，确保提取为独立回调后仍是实时值）
    if (aiGeneratingRef.current) return
    aiGeneratingRef.current = true
    setIsAiGenerating(true)

    // 创建新的 AI 会话线程
    const { newThread, addMessage, openPanel, setActiveThread, setPendingError } = useAIStore.getState()
    const { apiKey } = useAIStore.getState()

    if (!apiKey) {
      // 在 AI 窗口里显示友好错误提示（而不是只在 console.warn）
      setPendingError('请先在右上"设置"中输入你的 API key')
      openPanel()
      aiGeneratingRef.current = false
      setIsAiGenerating(false)
      return
    }

    // 暂停 globe 交互（防止重复点击 + 拖拽误触）
    const g = globeEl.current
    if (g) {
      const c = g.controls?.()
      if (c) {
        c.enableRotate = false
        c.enableZoom = false
        c.enablePan = false
      }
    }

    // 延迟一帧，确保 React 先渲染「AI 正在分析」遮罩，再开始 AI 请求
    // （避免 AI 响应太快导致状态 true→false 在同一次 batch 中，遮罩不显示）
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      // 每次点击都开新会话，避免一个会话越来越长
      const threadId = await newThread(`位置信息 ${lat.toFixed(2)}, ${lng.toFixed(2)}`)
      setActiveThread(threadId)
      openPanel()

      const systemPrompt = `你是一位专业的地理历史学家。用户点击了地图上的一个位置（经度 ${lng.toFixed(2)}°，纬度 ${lat.toFixed(2)}°）。请介绍这个地区的地理与历史背景：它属于哪个朝代/文明？这里曾经发生过哪些重要历史事件？相关的著名人物？不要使用 markdown 表格。`

      // 添加用户消息
      addMessage(threadId, {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: `我点击了地图上的一个位置（经度 ${lng.toFixed(2)}°，纬度 ${lat.toFixed(2)}°）。请介绍这个地区的地理与历史背景：它属于哪个朝代/文明？这里曾经发生过哪些重要历史事件？相关的著名人物？不要使用 markdown 表格。`,
        timestamp: Date.now(),
        contextEras: [],
        contextEvents: [],
      })

      // 创建 AI 回复消息占位
      const aiMessageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      addMessage(threadId, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        loading: true,
      })

      let fullContent = ''
      const handle = streamAI({
        protocol: useAIStore.getState().apiConfig.protocol,
        apiKey: useAIStore.getState().apiKey!,
        baseUrl: useAIStore.getState().apiConfig.baseUrl,
        model: useAIStore.getState().apiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `我点击了地图上的一个位置（经度 ${lng.toFixed(2)}°，纬度 ${lat.toFixed(2)}°）。请介绍这个地区的地理与历史背景：它属于哪个朝代/文明？这里曾经发生过哪些重要历史事件？相关的著名人物？不要使用 markdown 表格。` }
        ],
        maxTokens: MAX_TOKENS,
        disableThinking: useAIStore.getState().apiConfig.disableThinking,
        onDelta: (delta) => {
          fullContent += delta
          // 实时更新 AI 消息
          const { updateMessage } = useAIStore.getState()
          updateMessage(threadId, aiMessageId, { content: fullContent, loading: true })
        }
      })

      await handle.promise

      // 完成后更新消息状态
      const { updateMessage } = useAIStore.getState()
      updateMessage(threadId, aiMessageId, { loading: false })

    } catch (error) {
      console.error('[globe] AI 生成失败:', error)
    } finally {
      aiGeneratingRef.current = false
      // 恢复 globe 交互
      const g2 = globeEl.current
      if (g2) {
        const c2 = g2.controls?.()
        if (c2) {
          c2.enableRotate = true
          c2.enableZoom = true
          c2.enablePan = true
        }
      }
      setIsAiGenerating(false)
    }
  }, [])

  // 左键点击：拖拽误触防护已由 OrbitControls 的 click 事件处理
  const handleGlobeClick = useCallback((coords: { lat: number; lng: number }) => {
    askAIAboutLocation(coords.lat, coords.lng)
  }, [askAIAboutLocation])

  // 右键点击：与左键共用同一逻辑（默认右键为 pan，快速右键不拖拽即触发 AI）
  const handleGlobeRightClick = useCallback((coords: { lat: number; lng: number }) => {
    askAIAboutLocation(coords.lat, coords.lng)
  }, [askAIAboutLocation])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-ink-900"
      style={{ pointerEvents: 'auto', touchAction: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Globe
        ref={globeEl}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        // 地球纹理：默认2K（保证首屏快）；运行时探测8K并自动切换
        globeImageUrl="/history/globe/earth-color-2k.jpg"
        bumpImageUrl="/history/globe/earth-bump-2k.png"
        onGlobeReady={() => {
          const g = globeEl.current
          if (!g) return
          const scene = g.scene()
          if (!scene) return

          // 探测8K高清版本；存在则自动升级纹理
          const getMat = () => {
            // three-globe 暴露 globeMaterial()，内部指向 state.globeObj.material
            if (typeof (g as any).globeMaterial === 'function') return (g as any).globeMaterial()
            if ((g as any).material) return (g as any).material
            // 兜底：从 scene 里找第一个 Mesh 的材质
            const mesh = scene.getObjectByProperty?.('isMesh', true)
            return mesh?.material
          }

          const probe8k = new Image()
          probe8k.onload = () => {
            console.info('[globe] 8K probe loaded, size:', probe8k.naturalWidth, 'x', probe8k.naturalHeight)
            const mat = getMat()
            if (mat) {
              mat.map?.dispose?.()
              mat.map = probe8k
              mat.needsUpdate = true
              // 强制上传到 GPU（next render 会用）
              const texSize = mat.map?.image?.width || mat.map?.image?.naturalWidth || probe8k.naturalWidth
              const texH    = mat.map?.image?.height || mat.map?.image?.naturalHeight || probe8k.naturalHeight
              console.info('[globe] switched to 8K color texture; current map:', texSize + 'x' + texH)
            } else {
              console.warn('[globe] no material found on globe instance')
            }
          }
          probe8k.onerror = (e) => {
            console.warn('[globe] 8K color texture NOT FOUND at /history/globe/earth-color-8k.jpg, falling back to 2K', e)
          }
          probe8k.src = '/history/globe/earth-color-8k.jpg'

          const probe8kBump = new Image()
          probe8kBump.onload = () => {
            console.info('[globe] 8K bump probe loaded, size:', probe8kBump.naturalWidth, 'x', probe8kBump.naturalHeight)
            const mat = getMat()
            if (mat) {
              mat.bumpMap?.dispose?.()
              mat.bumpMap = probe8kBump
              mat.needsUpdate = true
              console.info('[globe] switched to 8K bump texture')
            }
          }
          probe8kBump.onerror = (e) => {
            console.info('[globe] 8K bump not available (ok), keeping 2K bump')
          }
          probe8kBump.src = '/history/globe/earth-bump-8k.png'

          // 找到地球仪网格（通常是场景中的第一个 Mesh 或名为 'globe' 的对象）
          const globeMesh = scene.getObjectByName('globe') || scene.children.find((obj: any) => obj.isMesh && obj.geometry?.type === 'SphereGeometry')
          if (globeMesh) {
            globeMeshRef.current = globeMesh
            // 将现有的环对象作为地球仪的子对象添加，使其随地球旋转
            ringObjectsRef.current.forEach(ring => {
              if (ring.parent !== globeMesh) {
                globeMesh.add(ring)
              }
            })
          }
          // 确保 OrbitControls 正确初始化并允许指针交互
          // three.js r155+ 中 OrbitControls 需要显式 connect() 才能绑定 DOM 事件
          const setupControls = () => {
            const controls = g.controls?.()
            const renderer = g.renderer?.()
            if (controls && renderer) {
              controls.enableRotate = true
              controls.enableZoom = true
              controls.enablePan = true
              controls.enableDamping = false
              // 确保 DOM 事件已绑定（兼容 three.js r155+ 的新 API）
              if (renderer.domElement) {
                controls.connect(renderer.domElement)
              }
              controls.update()
            } else {
              requestAnimationFrame(setupControls)
            }
          }
          setupControls()
        }}

        // 朝代点 + 事件点
        pointsData={allPoints}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointAltitude={(d: any) =>
          d.kind === 'era' ? (d.isCurrent ? 0.025 : 0.015)
          : d.kind === 'osmPoi' ? 0.004
          : 0.008
        }
        pointRadius={(d: any) =>
          d.kind === 'era' ? (d.isCurrent ? 0.32 : 0.22)
          : d.kind === 'osmPoi' ? (
            d.category === 'capital' ? 0.15 :
            d.category === 'city' ? 0.10 :
            d.category === 'site' ? 0.08 :
            0.06
          )
          : 0.10
        }
        pointColor={(d: any) =>
          d.kind === 'era' ? d.color
          : d.kind === 'osmPoi' ? (
            d.category === 'capital' ? '#f5efdf' :
            d.category === 'city' ? '#d8c79a' :
            d.category === 'site' ? '#c8553d' :
            '#9aa5b1'
          )
          : '#9aa5b1'
        }
        pointLabel={(d: any) => {
          if (d.kind === 'era') {
            return `
              <div style="
                background:rgba(15,14,12,0.92);
                color:#f5efdf;
                padding:6px 10px;
                border-radius:6px;
                font-size:12px;
                border:1px solid ${d.color};
                box-shadow:0 2px 8px rgba(0,0,0,0.4);
              ">
                <b>${d.name}</b><br/>
                <span style="opacity:0.7;font-size:10px">${d.startYear} ~ ${d.endYear}</span>
              </div>
            `
          }
          if (d.kind === 'osmPoi') {
            return `
              <div style="
                background:rgba(15,14,12,0.92);
                color:#f5efdf;
                padding:4px 8px;
                border-radius:4px;
                font-size:11px;
                border:1px solid rgba(200,154,91,0.6);
              ">
                <b>${d.name}</b><br/>
                <span style="opacity:0.7;font-size:10px">${d.category}${d.subtag ? ` · ${d.subtag}` : ''}</span>
              </div>
            `
          }
          return `
            <div style="
              background:rgba(15,14,12,0.92);
              color:#f5efdf;
              padding:4px 8px;
              border-radius:4px;
              font-size:11px;
              border:1px solid rgba(154,165,177,0.5);
            ">
              ${d.year < 0 ? `公元前${-d.year}` : d.year} · ${d.title}
            </div>
          `
        }}
        onPointHover={handlePointHover}
        onPointClick={handlePointClick}

        // 折线层（河流/山脉/海峡）
        arcsData={arcData}
        arcStartLat={(d: object) => (d as GeoArcDatum).points[0]?.lat ?? (d as GeoArcDatum).labelPos.lat}
        arcStartLng={(d: object) => (d as GeoArcDatum).points[0]?.lng ?? (d as GeoArcDatum).labelPos.lng}
        arcEndLat={(d: object) => {
          const p = (d as GeoArcDatum).points
          return p[p.length - 1]?.lat ?? (d as GeoArcDatum).labelPos.lat
        }}
        arcEndLng={(d: object) => {
          const p = (d as GeoArcDatum).points
          return p[p.length - 1]?.lng ?? (d as GeoArcDatum).labelPos.lng
        }}
        arcColor={(d: object) => GEO_STYLE[(d as GeoArcDatum).type]?.stroke || '#5fb0d8'}
        arcStroke={(d: object) => GEO_STYLE[(d as GeoArcDatum).type]?.strokeWidth ?? 1}
        arcAltitude={0.04}
        arcCurveResolution={64}
        arcLabel={(d: any) => {
          const name = (d as GeoArcDatum).name
          if (!name) return ''
          const st = GEO_STYLE[(d as GeoArcDatum).type]
          return `
            <div style="
              background:rgba(15,14,12,0.88);
              color:${st?.labelColor || '#e8c39a'};
              padding:2px 6px;
              border-radius:3px;
              font-size:10px;
              border:1px solid ${st?.stroke || 'rgba(200,154,91,0.6)'};
              white-space:nowrap;
              text-shadow:0 0 3px rgba(0,0,0,0.95);
              pointer-events:none;
              transform:translate(-50%, -50%);
            ">${name}</div>
          `
        }}
        onArcHover={handleArcHover}
        onArcClick={handleArcClick}

        // 面状层（海洋/湖泊/沙漠/平原/半岛/区域）
        polygonsData={polyData}
        polygonGeoJsonGeometry={(d: object) => (d as GeoPolyDatum).geometry}
        polygonCapColor={(d: object) => GEO_STYLE[(d as GeoPolyDatum).type]?.fill || 'rgba(0,0,0,0)'}
        polygonSideColor={(d: object) => GEO_STYLE[(d as GeoPolyDatum).type]?.stroke || 'rgba(0,0,0,0)'}
        polygonStrokeColor={(d: object) => GEO_STYLE[(d as GeoPolyDatum).type]?.stroke || 'rgba(0,0,0,0)'}
        polygonAltitude={(d: object) => 0.006}
        polygonLabel={(d: object) => {
          const p = d as GeoPolyDatum
          const st = GEO_STYLE[p.type]
          return `
            <div style="
              background:rgba(15,14,12,0.92);
              color:${st?.labelColor || '#e8c39a'};
              padding:4px 8px;
              border-radius:4px;
              font-size:11px;
              border:1px solid ${st?.stroke || 'rgba(200,154,91,0.6)'};
            ">${p.name}</div>
          `
        }}
        onPolygonHover={handlePolyHover}
        onPolygonClick={handlePolyClick}

        // 标签层（地名）— 3D mesh 文字，用于地理要素（默认全关）
        labelsData={labelData}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.text}
        labelColor={(d: any) => d.color}
        labelSize={(d: any) => d.size}
        labelAltitude={0.03}
        labelIncludeDot={false}

        // OSM 城市/首都常驻文字标签 — DOM 覆盖层（htmlElementsData），
        //   走 2D HTML 而不是 3D mesh，不会变成圆柱体
        htmlElementsData={osmHtmlElements}
        htmlLat={(d: any) => d.lat}
        htmlLng={(d: any) => d.lng}
        htmlAltitude={() => 0.01}
        htmlElement={(d: any) => {
          const el = document.createElement('div')
          const isGeo = typeof d.id === 'string' && d.id.startsWith('geo-')
          if (d.kind === 'country' && !isGeo) {
            const imp = d.importance ?? 1
            const fontSize = imp === 3 ? '13px' : imp === 2 ? '11px' : '9px'
            const fontWeight = imp === 3 ? '600' : '400'
            const color = imp === 3 ? '#fff5e0' : imp === 2 ? '#ffe9b8' : '#d4c79a'
            const opacity = imp === 3 ? '1' : imp === 2 ? '0.95' : '0.85'
            el.textContent = d.name
            el.style.cssText = [
              'font-family: "Noto Serif SC", serif',
              `font-size: ${fontSize}`,
              `font-weight: ${fontWeight}`,
              `color: ${color}`,
              `opacity: ${opacity}`,
              'text-shadow: 0 0 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)',
              'white-space: nowrap',
              'pointer-events: none',
              'user-select: none',
              'text-align: center',
              'transform: translate(-50%, -50%)',
            ].join(';')
          } else if (isGeo) {
            // 地理要素（河流/山脉/海洋等）— 用专属颜色
            const c = (d as any)._color || '#e8c39a'
            el.textContent = d.name
            el.style.cssText = [
              'font-family: "Noto Serif SC", serif',
              'font-size: 11px',
              'font-weight: 500',
              `color: ${c}`,
              'background: rgba(15,14,12,0.55)',
              'padding: 1px 5px',
              'border-radius: 3px',
              'white-space: nowrap',
              'pointer-events: none',
              'user-select: none',
              'text-shadow: 0 0 3px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,0.9)',
              'transform: translate(-50%, -50%)',
            ].join(';')
          } else {
            // place (历史地点)
            const cat = (d.subKind ?? 'city') as string
            const isCapital = cat === 'capital'
            const isCity = cat === 'city'
            el.textContent = d.name
            el.style.cssText = [
              'font-family: "Noto Serif SC", serif',
              `font-size: ${isCapital ? '13px' : isCity ? '11px' : '10px'}`,
              `font-weight: ${isCapital ? '600' : '400'}`,
              `color: ${isCapital ? '#fff8e8' : isCity ? '#ffe9b8' : '#c8d4e0'}`,
              'text-shadow: 0 0 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)',
              'white-space: nowrap',
              'pointer-events: none',
              'user-select: none',
              'transform: translate(8px, -50%)',
            ].join(';')
          }
          return el
        }}

        objectRotation={() => null}
        onGlobeClick={handleGlobeClick}
        onGlobeRightClick={handleGlobeRightClick}
      />

      {/* AI 加载中遮罩：点击地球后显示在屏幕中央 */}
      {isAiGenerating && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl"
            style={{ background: 'rgba(20,18,15,0.92)', border: '1px solid rgba(200,154,91,0.5)' }}
          >
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{
                background: '#c89a5b',
                animation: 'globePulse 1s ease-in-out infinite',
              }}
            />
            <span style={{ color: '#f5efdf', fontFamily: 'serif' }}>AI 正在分析位置…</span>
          </div>
        </div>
      )}

      {/* 事件点截断提示 */}
      {eventPointsTruncated && (
        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 rounded bg-vermilion-500/90 backdrop-blur text-[10px] text-parchment-50 font-serif shadow-lg">
          事件点过多，仅显示前 {MAX_EVENT_POINTS} 条
        </div>
      )}
      {/* 弹卡：复用 InfoCardView（与 2D/3D 地图同一张卡，含 Bing 封面图） */}
      {infoCard && (
        <InfoCardView card={infoCard} onClose={closeCard} />
      )}
    </div>
  )
}