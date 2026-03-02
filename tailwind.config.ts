import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        moto: {
          dark: '#0a0a0a',
          darker: '#1a1a1a',
          gray: '#2a2a2a',
          'gray-light': '#3f3f3f',
          accent: '#e63946',
          'accent-dark': '#b91c1c',
          'accent-orange': '#f97316',
          'accent-neon': '#00ff9d',
          light: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Poppins', 'system-ui', 'sans-serif'],
        mono: ['Courier Prime', 'monospace'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, rgba(10,10,10,0.8), rgba(26,26,26,0.9))',
        'gradient-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
        'gradient-accent': 'linear-gradient(135deg, #e63946 0%, #f97316 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.7s ease-out',
        'pulse-accent': 'pulse-accent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config
