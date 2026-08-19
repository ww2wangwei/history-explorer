/**
 * QuizLauncher — 右下角浮动按钮 + Quiz 面板（管理和测试入口）
 * 复用 useAIStore 的 apiKey 判断是否可以 AI 出题
 * 浮动按钮：📝，与 AI 🤖 按钮并排显示
 * 按钮可拖拽：位置持久化到 localStorage
 */
import { useState } from 'react'
import QuizSession from './QuizSession'
import QuizManager from './QuizManager'
import { useQuizStore } from '@/store/useQuizStore'
import { useDraggableFab } from '@/hooks/useDraggableFab'

export default function QuizLauncher() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const questions = useQuizStore(s => s.questions)
  const pending = useQuizStore(s => s.pending)

  const togglePanel = () => setPanelOpen(o => !o)
  const closePanel = () => setPanelOpen(false)
  const openManager = () => setManagerOpen(true)
  const closeManager = () => setManagerOpen(false)

  const fabPos = useDraggableFab({
    storageKey: 'quiz-fab-pos',
    initial: { right: 16, bottom: 70 },  // 默认位于 AI 按钮上方
  })

  return (
    <>
      {/* 浮动按钮（可拖拽） */}
      <button
        onPointerDown={fabPos.onPointerDown}
        onClickCapture={fabPos.suppressClickIfDragged}
        onClick={togglePanel}
        className="fixed z-50 w-10 h-10 rounded-full bg-vermilion-500 hover:bg-vermilion-600 shadow-2xl flex items-center justify-center text-lg transition-all cursor-grab active:cursor-grabbing select-none touch-none"
        style={{
          right: fabPos.pos.right,
          bottom: fabPos.pos.bottom,
        }}
        title="历史测试 (📝)"
      >
        {panelOpen ? '×' : '📝'}
      </button>

      {/* 测试问答面板 */}
      {panelOpen && (
        <QuizSession open={panelOpen} onClose={closePanel} onManage={openManager} />
      )}

      {/* 管理面板 */}
      <QuizManager open={managerOpen} onClose={closeManager} />
    </>
  )
}