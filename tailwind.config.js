import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f2fcf5',
          100: '#e1f8e8',
          200: '#c3eed0',
          300: '#95deb0',
          400: '#5dc68b',
          500: '#36a869',
          600: '#268751',
          700: '#206c43',
          800: '#1d5638',
          900: '#194730',
          950: '#0b281a',
        },
        stone: {
          850: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    }
  },
  plugins: [
    typography,
  ],
}