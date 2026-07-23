/**
 * Toast 系统 —— 全局轻量通知
 *
 * 架构：
 *   - useToast()    hook，在任意组件调 toast.success / .error / .warn
 *   - ToastHost     组件，放在 Layout 中渲染所有活动 toast
 *   - 自动 3 秒消失，hover 暂停计时，进场 GSAP 动画
 */
import { create } from 'zustand'
import { useEffect } from 'react'
import gsap from 'gsap'

export type ToastVariant = 'success' | 'error' | 'warn' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  /** 显示时长 (ms)，默认 3000 */
  duration?: number
  /** 创建时间，用于排序 */
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'createdAt'>) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set(s => ({
      toasts: [...s.toasts, { ...t, id, createdAt: Date.now() }],
    }))
    // 自动消失
    const dur = t.duration ?? 3000
    setTimeout(() => {
      if (get().toasts.find(x => x.id === id)) get().dismiss(id)
    }, dur)
    return id
  },
  dismiss: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
  },
}))

/** 便捷 hook —— 在任意组件中使用 */
export function useToast() {
  const push = useToastStore(s => s.push)
  return {
    success: (message: string, duration?: number) => push({ message, variant: 'success', duration }),
    error:   (message: string, duration?: number) => push({ message, variant: 'error', duration }),
    warn:    (message: string, duration?: number) => push({ message, variant: 'warn', duration }),
    info:    (message: string, duration?: number) => push({ message, variant: 'info', duration }),
  }
}
