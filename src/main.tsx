import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
// 🔧 强制注册 GSAP CSSPlugin（vite tree-shaking 可能剥离）
// 否则 transform/opacity/autoAlpha 等 CSS 动画不生效
import gsap from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
gsap.registerPlugin(CSSPlugin)
// 🎨 主题：模块加载时立即初始化 <html data-theme>，避免 FOUC
import './store/useThemeStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
