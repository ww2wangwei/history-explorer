/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === 主题色阶（绑定 CSS 变量，<alpha-value> 支持透明度）===
        // 暖色（背景/卡片）— 主题感知
        parchment: {
          50: 'rgb(var(--text-parchment-rgb) / <alpha-value>)',
          100: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
          200: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        },
        // 深色层次（背景/文字/边框）— 主题感知
        ink: {
          900: 'rgb(var(--bg-page-rgb) / <alpha-value>)',
          800: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          700: 'rgb(var(--bg-card-rgb) / <alpha-value>)',
          600: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
          500: 'rgb(var(--border-rgb) / <alpha-value>)',
          400: 'rgb(var(--border-strong-rgb) / <alpha-value>)',
          300: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          200: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        },
        // === 墨·朱砂 v2 主题色（新增，主题感知）===
        // 暖白主文字
        bone: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        // 次要文字
        muted: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        // 极淡墨（飞白/水印）
        faint: 'rgb(var(--text-faint-rgb) / <alpha-value>)',
        // 朱砂红（主强调色）
        vermilion: {
          DEFAULT: 'rgb(var(--vermilion-rgb) / <alpha-value>)',
          50:  'rgb(var(--vermilion-tint-rgb) / <alpha-value>)',
          100: 'rgb(var(--vermilion-tint-rgb) / <alpha-value>)',
          200: 'rgb(var(--vermilion-2-rgb) / <alpha-value>)',
          300: 'rgb(var(--vermilion-2-rgb) / <alpha-value>)',
          400: 'rgb(var(--vermilion-2-rgb) / <alpha-value>)',
          500: 'rgb(var(--vermilion-rgb) / <alpha-value>)',
          600: 'rgb(var(--vermilion-3-rgb) / <alpha-value>)',
          700: 'rgb(var(--vermilion-3-rgb) / <alpha-value>)',
          800: 'rgb(var(--vermilion-3-rgb) / <alpha-value>)',
          soft: 'rgb(var(--vermilion-rgb) / 0.18)',
          deep: 'rgb(var(--vermilion-3-rgb) / <alpha-value>)',
        },
        // 暗金（次强调色，主题感知）
        gold: {
          DEFAULT: 'rgb(var(--gold-rgb) / <alpha-value>)',
          50: 'rgb(var(--gold-rgb) / <alpha-value>)',
          100: 'rgb(var(--gold-rgb) / <alpha-value>)',
          200: 'rgb(var(--gold-rgb) / <alpha-value>)',
          300: 'rgb(var(--gold-rgb) / <alpha-value>)',
          400: 'rgb(var(--gold-rgb) / <alpha-value>)',
          500: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
          600: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
          soft: 'rgb(var(--gold-rgb) / 0.15)',
        },
        // 墨色（保留 bronze 别名 — 主题感知，颜色取自 gold）
        bronze: {
          200: 'rgb(var(--gold-rgb) / <alpha-value>)',
          300: 'rgb(var(--gold-rgb) / <alpha-value>)',
          400: 'rgb(var(--gold-rgb) / <alpha-value>)',
          500: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
          600: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
          700: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
          800: 'rgb(var(--gold-deep-rgb) / <alpha-value>)',
        },
        // 语义色（主题感知）
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        successDark: 'rgb(var(--success-rgb) / <alpha-value>)',
        danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
        dangerDark: 'rgb(var(--danger-rgb) / <alpha-value>)',
        warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
        info: 'rgb(var(--info-rgb) / <alpha-value>)',
        // 语义表面（主题感知）
        'surface-raised': 'rgb(var(--bg-raised-rgb) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--bg-page-rgb) / <alpha-value>)',
        hairline: 'rgb(var(--hairline-rgb) / <alpha-value>)',
        // 角色类别色（人物）
        politician: 'rgb(var(--politician-rgb) / <alpha-value>)',
        military:   'rgb(var(--military-rgb) / <alpha-value>)',
        thinker:    'rgb(var(--thinker-rgb) / <alpha-value>)',
        literati:   'rgb(var(--literati-rgb) / <alpha-value>)',
        scientist:  'rgb(var(--scientist-rgb) / <alpha-value>)',
        reformer:   'rgb(var(--reformer-rgb) / <alpha-value>)',
        explorer:   'rgb(var(--explorer-rgb) / <alpha-value>)',
        religious:  'rgb(var(--religious-rgb) / <alpha-value>)',
      },
fontFamily: {
        // === 墨·朱砂 v2 字体栈 ===
        // Serif —— 宋体（正文/标题主体）
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Noto Serif CJK SC"', 'Georgia', 'serif'],
        // Sans —— 黑体（UI/按钮/标签）
        sans: ['"Noto Sans SC"',  '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        // Brush —— 毛笔（题款/朝代名/装饰）
        brush: ['"Ma Shan Zheng"', '"KaiTi"', '楷体', 'STKaiti', 'serif'],
        // Classic —— 仿宋（古籍风，朝代名/品牌/章节标题）
        classic: ['"ZCOOL XiaoWei"', '"Noto Serif SC"', '"KaiTi"', '楷体', 'STKaiti', 'serif'],
        // Cursive —— 行书（叙事/装饰）
        cursive: ['"Long Cang"', '"ZCOOL XiaoWei"', '"Noto Serif SC"', 'serif'],
        // Mono —— 等宽（年份/经纬度/数据）
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      // 间距 token（卡片/章节常用档位）
      spacing: {
        'card': '20px',      // 卡片内 padding 中位
        'card-lg': '24px',   // 卡片内 padding 大
        'card-sm': '14px',   // 卡片内 padding 小
      },
      // 字号梯度（已有 Tailwind 预设，这里加 detail）
      fontSize: {
        'label': ['11px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        // 标题层级（配 font-serif 使用）：字距疏朗 + 行高收紧显庄重
        'display': ['30px', { lineHeight: '1.15', letterSpacing: '0.02em', fontWeight: '600' }],
        'heading': ['22px', { lineHeight: '1.2', letterSpacing: '0.015em', fontWeight: '600' }],
        'subheading': ['15px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      // 圆角梯度（统一）
      borderRadius: {
        'card': '8px',    // 默认卡片/弹窗
        'card-lg': '10px', // 大卡片
        'chip': '4px',    // chip/徽章
      },
      // Box shadow 设计层次（4 级 depth）
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.2)',
        'DEFAULT': '0 2px 8px rgba(0,0,0,0.25)',
        'md': '0 4px 16px rgba(0,0,0,0.3)',
        'lg': '0 8px 32px rgba(0,0,0,0.4)',
        'glow': '0 0 16px rgba(200,154,91,0.3)',
      },
      // 动效时长
      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '250': '250ms',
        '400': '400ms',
      },
      // 动效曲线（墨·朱砂 easings：偏ease-out快入慢出）
      transitionTimingFunction: {
        'ink': 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        'stamp': 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      },
      // 背景图（墨·朱砂 utilities）
      backgroundImage: {
        // 宣纸纹理（极淡 SVG 噪点 + 暖色）
        'paper-noise': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.85  0 0 0 0 0.78  0 0 0 0 0.65  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        // 笔触状边线 mask（让直线带毛笔毛糙感）
        'brush-edge': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='4'><filter id='b'><feTurbulence baseFrequency='0.4' numOctaves='2'/><feDisplacementMap in='SourceGraphic' scale='2'/></filter><rect width='100%' height='100%' filter='url(%23b)'/></svg>\")",
        // 朱砂印章残缺 mask
        'stamp-rough': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='r'><feTurbulence baseFrequency='0.3' numOctaves='2'/><feDisplacementMap in='SourceGraphic' scale='3'/></filter><rect width='100%' height='100%' filter='url(%23r)'/></svg>\")",
      },
      // 自定义动画（墨·朱砂 印章盖章、墨晕涟漪）
      animation: {
        'stamp-drop': 'stamp-drop 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) both',
        'ink-ripple': 'ink-ripple 2.4s ease-out infinite',
      },
      keyframes: {
        'stamp-drop': {
          '0%':   { transform: 'rotate(-12deg) scale(2.4)', opacity: '0', filter: 'blur(8px)' },
          '55%':  { transform: 'rotate(-12deg) scale(0.92)', opacity: '1', filter: 'blur(0)' },
          '72%':  { transform: 'rotate(-12deg) scale(1.04)' },
          '100%': { transform: 'rotate(-12deg) scale(1)' },
        },
        'ink-ripple': {
          '0%':   { transform: 'scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
