/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        surface: '#111726',
        surfaceBorder: '#1E293B',
        accentPrimary: '#38BDF8', // Cyan/Sky
        accentSecondary: '#6366F1', // Indigo
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.08) 0%, rgba(17, 23, 38, 0) 70%)',
        'card-glow': 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.12) 0%, transparent 80%)',
      },
    },
  },
  plugins: [],
}