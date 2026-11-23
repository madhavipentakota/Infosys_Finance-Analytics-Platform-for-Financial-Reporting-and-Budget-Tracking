/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === DEEP NAVY — primary backgrounds ===
        navy: {
          50:  '#e8f0f8',
          100: '#c5d5ec',
          200: '#9db8dc',
          300: '#749bcc',
          400: '#5585bf',
          500: '#3570b2',
          600: '#2558a0',
          700: '#1a3f7a',
          800: '#112b56',
          900: '#0d1b2a',  // ← main app background
          950: '#080f18',  // ← darkest surface
        },
        // === BRIGHT CYAN / AQUA — primary accent ===
        brand: {
          50:  '#e0faff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#00d4ff',  // ← bright aqua glow
          500: '#00bcd4',  // ← main accent
          600: '#0097a7',
          700: '#007c8a',
          800: '#005f6e',
          900: '#003d47',
          950: '#001f25',
        },
        // === SURFACE CARDS ===
        surface: {
          50:  '#f0f8ff',
          100: '#d6eaf8',
          200: '#aed4f1',
          300: '#7ab8e8',
          400: '#4a9cdc',
          500: '#2582ce',
          card:   '#0f2240',  // card background
          panel:  '#112a50',  // panel background
          border: '#1e3a5f',  // border color
          hover:  '#1a3158',  // hover state
        },
        // === ACCENT COLORS for charts ===
        aqua:    { DEFAULT: '#00d4ff', light: '#80ebff', dark: '#0097a7' },
        teal:    { DEFAULT: '#14b8a6', light: '#5eead4', dark: '#0f766e' },
        violet:  { DEFAULT: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9' },
        amber:   { DEFAULT: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
        rose:    { DEFAULT: '#f43f5e', light: '#fda4af', dark: '#be123c' },
        emerald: { DEFAULT: '#10b981', light: '#6ee7b7', dark: '#059669' },
        // === TEXT ===
        text: {
          primary:   '#f0f9ff',   // bright white
          secondary: '#94afc8',   // muted blue-grey
          muted:     '#4e6a85',   // very muted
          accent:    '#00d4ff',   // aqua accent text
        },
        // Keep slate for compatibility
        slate: {
          50:  '#f0f8ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#94afc8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e3a5f',
          850: '#162f4e',
          900: '#0f2240',
          950: '#080f18',
        },
        // Keep harvest for compat
        harvest: {
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        },
        meadow: {
          400: '#4ade80',
          500: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'slide-up':   'slideUp 0.7s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'shimmer':    'shimmer 3s linear infinite',
        'orb':        'orbFloat 12s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        floatSlow:{ '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-22px) rotate(3deg)' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(40px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        orbFloat: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(20px,-30px) scale(1.05)' },
          '66%':     { transform: 'translate(-15px,15px) scale(0.97)' },
        },
      },
    },
  },
  plugins: [],
}
