/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Deep emerald green
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Accent - Warm gold/amber (the "yellow")
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Neutral surface tones
        cream: {
          50: '#fdfdf7',
          100: '#faf9f0',
          200: '#f5f3e3',
        },
        ink: {
          50: '#f6f7f6',
          100: '#e2e8e4',
          200: '#cbd5d0',
          300: '#9aa89f',
          400: '#6b7a70',
          500: '#4a5a50',
          600: '#364539',
          700: '#2a3a2c',
          800: '#1c2a1e',
          900: '#14201a',
          950: '#0a1510',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', 'Amiri', 'Scheherazade New', 'serif'],
        amiri: ['Amiri', 'serif'],
        quran: ['"Scheherazade New"', 'Amiri', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(6, 78, 59, 0.08), 0 1px 2px -1px rgba(6, 78, 59, 0.08)',
        'card-lg': '0 10px 30px -12px rgba(6, 78, 59, 0.25), 0 4px 12px -4px rgba(6, 78, 59, 0.12)',
        glow: '0 0 0 1px rgba(16, 185, 129, 0.1), 0 8px 24px -8px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
