/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          500: '#4b5563'
        },
        brand: {
          apple: '#fa233b',
          aws: '#ff9900',
          netflix: '#e50914',
          spotify: '#1ed760',
          accent: '#6366f1',
          teal: '#14b8a6',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-apple': '0 0 25px -5px rgba(250, 35, 59, 0.4)',
        'glow-aws': '0 0 25px -5px rgba(255, 153, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
