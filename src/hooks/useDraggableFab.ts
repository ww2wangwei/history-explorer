/**
 * useDraggableFab — 让 fixed 定位的浮动按钮可拖拽
 *
 *  - pointer down 后跟着指针移动
 *  - 释放后保存位置到 localStorage
 *  - 拖拽时不触发 click（区分 click 和 drag）
 *  - 边界约束：不能拖到屏幕外
 *  - 鼠标悬停时光标变 grab
 */
import { useEffect, useRef, useState, useCallback } from 'react'

export interface FabPosition {
  /** 距屏幕右边的距离（px） */
  right: number
  /** 距屏幕底部的距离（px） */
  bottom: number
}

interface UseDraggableFabOptions {
  storageKey: string
  /** 初始位置（未保存时使用） */
  initial?: FabPosition
}

export function useDraggableFab({ storageKey, initial = { right: 16, bottom: 16 } }: UseDraggableFabOptions) {
  const [pos, setPos] = useState<FabPosition>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const j = JSON.parse(raw)
        if (typeof j.right === 'number' && typeof j.bottom === 'number') return j
      }
    } catch { /* ignore */ }
    return initial
  })

  const dragRef = useRef<{
    active: boolean
    moved: boolean  // true = 拖拽过程中（用于区分 click 与 drag）
    startX: number
    startY: number
    originRight: number
    originBottom: number
    pointerId: number
  }>({
    active: false, moved: false, startX: 0, startY: 0,
    originRight: 0, originBottom: 0, pointerId: 0,
  })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // 仅主指针（左键 / 主触摸）
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originRight: pos.right,
      originBottom: pos.bottom,
      pointerId: e.pointerId,
    }
  }, [pos])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d.active || e.pointerId !== d.pointerId) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      // 超过 4px 阈值才算"在拖拽"
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return
      d.moved = true

      // 屏幕宽高
      const w = window.innerWidth
      const h = window.innerHeight
      // 按钮大约 48×48
      const btn = 48
      const padding = 8

      // newRight = originRight - dx（向右拖 → right 变小）
      // newBottom = originBottom - dy（向上拖 → bottom 变大）
      let newRight = d.originRight - dx
      let newBottom = d.originBottom - dy

      // 边界约束
      newRight = Math.max(padding, Math.min(w - btn - padding, newRight))
      newBottom = Math.max(padding, Math.min(h - btn - padding, newBottom))

      setPos({ right: newRight, bottom: newBottom })
    }
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d.active || e.pointerId !== d.pointerId) return
      d.active = false
      if (d.moved) {
        // 拖拽结束后保存位置
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ right: pos.right, bottom: pos.bottom }),
          )
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [pos, storageKey])

  /** 阻止 click 事件如果发生过拖拽 */
  const suppressClickIfDragged = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return { pos, onPointerDown, suppressClickIfDragged }
}
