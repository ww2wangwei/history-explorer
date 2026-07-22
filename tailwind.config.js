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
          800: '#1a1814',
          700: '#26221c',
          600: '#3a342a',
          500: '#5a5142',
          400: '#7a705c',
        },
        // 主强调色（CTA / 重要标记）
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
    },
  },
  plugins: [],
}
