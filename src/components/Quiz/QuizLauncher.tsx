/**
 * QuizLauncher — 右下角浮动按钮 + Quiz 面板（管理和测试入口）
 * 复用 useAIStore 的 apiKey 判断是否可以 AI 出题
 * 浮动按钮：📝，与 AI 🤖 按钮并排显示
 */
import { useState } from 'react'
import QuizSession from './QuizSession'
import QuizManager from './QuizManager'
import { useQuizStore } from '@/store/useQuizStore'

export default function QuizLauncher() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const questions = useQuizStore(s => s.questions)
  const pending = useQuizStore(s => s.pending)

  const togglePanel = () => setPanelOpen(o => !o)
  const closePanel = () => setPanelOpen(false)
  const openManager = () => setManagerOpen(true)
  const closeManager = () => setManagerOpen(false)

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={togglePanel}
        className="fixed bottom-20 right-4 z-[60] w-14 h-14 rounded-full bg-bronze-600 hover:bg-bronze-500 shadow-2xl flex items-center justify-center text-2xl transition-all"
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