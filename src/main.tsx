// 暂时禁用 StrictMode 验证 T.Map 重复问题
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
// 🔧 强制注册 GSAP CSSPlugin（vite tree-shaking 可能剥离）
// 否则 transform/opacity/autoAlpha 等 CSS 动画不生效
import gsap from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
gsap.registerPlugin(CSSPlugin)

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
)
