/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 历史主题：暖色 + 深色
        parchment: {
          50: '#fdf8f0',
          100: '#f7eed8',
          200: '#ecd9a8',
        },
        ink: {
          900: '#0f0e0c',
          800: '#1a1814',
          700: '#26221c',
          600: '#3a342a',
          500: '#5a5142',
        },
        bronze: {
          400: '#c89a5b',
          500: '#a87a3e',
          600: '#7e5a2a',
        }
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Noto Serif CJK SC"', 'Georgia', 'serif'],
        sans: ['"Source Han Sans SC"', '"Noto Sans CJK SC"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}