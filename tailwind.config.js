/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        gen: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          accent: '#00e5a0',
          accent2: '#00b8d4',
          text: '#e4e4ed',
          muted: '#6b6b80',
          danger: '#ff4d6a',
          warn: '#ffb84d',
        },
      },
    },
  },
  plugins: [],
};
