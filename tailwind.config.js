/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema escuro roxo personalizado
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#8A2BE2',
          foreground: '#ffffff',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8A2BE2',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        secondary: {
          DEFAULT: '#2a2a2a',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#2a2a2a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#2a2a2a',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: '#3a3a3a',
        input: '#2a2a2a',
        ring: '#8A2BE2',
        chart: {
          '1': '#8A2BE2',
          '2': '#22c55e',
          '3': '#ef4444',
          '4': '#f59e0b',
          '5': '#3b82f6',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #8A2BE2, #9932CC)',
        'gradient-success': 'linear-gradient(135deg, #22c55e, #16a34a)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
      },
      boxShadow: {
        'purple': '0 4px 14px 0 rgba(138, 43, 226, 0.25)',
        'purple-lg': '0 10px 25px -3px rgba(138, 43, 226, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-purple': 'pulsePurple 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulsePurple: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(138, 43, 226, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(138, 43, 226, 0)' },
        },
      },
    },
  },
  plugins: [],
}
