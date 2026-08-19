/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === 主题色阶 ===
        // 暖色（背景/卡片）
        parchment: {
          50: '#fdf8f0',
          100: '#f7eed8',
          200: '#ecd9a8',
        },
        // 深色层次（最常用于背景/文字/边框）
        ink: {
          900: '#100e0b',
          800: '#1a1714',
          700: '#26221d',
          600: '#332c25',
          500: '#4a3f33',
          400: '#6e6557',
          300: '#9a8f7e',
          200: '#b8ad97',
        },
        // === 墨·朱砂 v2 主题色（新增）===
        // 暖白主文字（不是 #fff 冷白）
        bone: '#e6dcc7',
        // 次要文字
        muted: '#9a8f7e',
        // 极淡墨（飞白/水印）
        faint: '#6e6557',
        // 朱砂红（主强调色，取代 bronze-400 作为主 CTA）
        vermilion: {
          DEFAULT: '#b8433a',
          50:  '#fbe9e7',
          100: '#f6ccc7',
          200: '#ec9b94',
          300: '#df6c61',
          400: '#c85044',
          500: '#b8433a',
          600: '#9a332c',
          700: '#7a2621',
          800: '#5a1b18',
          soft: 'rgba(184, 67, 58, 0.18)',
          deep: '#8b2f28',
        },
        // 暗金（次强调色，计数、高亮）
        gold: {
          DEFAULT: '#c9a557',
          50: '#f4ead0',
          100: '#e8d59e',
          200: '#d8be75',
          300: '#cdac60',
          400: '#c9a557',
          500: '#b08d3e',
          600: '#8e6f2a',
          soft: 'rgba(201, 165, 87, 0.15)',
        },
        // 墨色（保留 bronze 别名作 alias，避免破坏现存代码）
        bronze: {
          200: '#f0dcbf',
          300: '#e8c997',
          400: '#c89a5b',
          500: '#a87a3e',
          600: '#7e5a2a',
          700: '#5e4320',
          800: '#42301a',
        },
        // 语义色
        success: '#5bc89a',  // 已完成、掌握
        successDark: '#2a6e54',
        danger: '#b85450',    // 删除、警告
        dangerDark: '#5e2826',
        warning: '#e8a23c',   // 警告、关键
        info: '#5b9bc8',      // 信息、链接
        // 语义表面（方案3：卡片/凹陷/极细线）
        'surface-raised': '#221f19',
        'surface-sunken': '#141210',
        hairline: '#2f2a22',
        // 角色类别色（人物）
        politician: '#c89a5b',   // 政治家（bronze）
        military:   '#b85450',   // 军事家（danger）
        thinker:    '#9b7eb6',   // 思想家
        literati:   '#5b9bc8',   // 文人（info）
        scientist:  '#5bc89a',   // 科学家（success）
        reformer:    '#c8a85b',   // 改革家（warn）
        explorer:   '#5b8fc8',   // 探险家
        religious:  '#c89a8a',   // 宗教人物
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Noto Serif CJK SC"', 'Georgia', 'serif'],
        sans: ['"Source Han Sans SC"', '"Noto Sans CJK SC"', 'system-ui', 'sans-serif'],
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
