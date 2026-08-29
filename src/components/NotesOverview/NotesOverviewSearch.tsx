/**
 * 笔记总览搜索框：受控 input + ✕ 清空按钮
 */
import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function NotesOverviewSearch({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  // 抽屉打开时自动 focus（仅在父级控制 isOpen 后 mount 时）
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 text-sm pointer-events-none">
        🔍
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="搜索笔记标题或内容…"
        className="w-full pl-9 pr-9 py-2 bg-ink-700/60 border border-ink-600 rounded-lg text-sm text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-vermilion-500/40"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-300 hover:text-parchment-50 w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
          title="清空搜索"
          aria-label="清空搜索"
        >
          ✕
        </button>
      )}
    </div>
  )
}