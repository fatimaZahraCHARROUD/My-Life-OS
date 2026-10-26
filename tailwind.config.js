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
        // Brand palette — pink & burgundy "girly" theme
        burgundy: {
          50:  '#FBF0F3',
          100: '#F6DCE3',
          200: '#EDB9C7',
          300: '#E08FA5',
          400: '#C96583',
          500: '#A84465',
          600: '#7B2D3F', // primary
          700: '#63253A',
          800: '#4A1B2C',
          900: '#2F101D',
        },
        rose: {
          50:  '#FFF5F8',
          100: '#FDE8EE',
          200: '#FBD0DC',
          300: '#F5A8BE',
          400: '#E8A5B8', // accent
          500: '#D97E9B',
          600: '#B85C7C',
          700: '#8E3F5B',
          800: '#5E2940',
          900: '#3A1828',
        },
        blush: {
          50:  '#FFF9FA', // light bg
          100: '#FDF2F5',
          200: '#FAE6EC',
          300: '#F5D2DB',
        },
        plum: {
          900: '#1A0E14',
          800: '#2A1820', // dark bg
          700: '#3A2230',
          600: '#4A2C3D',
        },
        cream: '#FFF9FA',
        gold:  '#D4A574',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(123, 45, 63, 0.08)',
        'soft-lg': '0 8px 24px rgba(123, 45, 63, 0.12)',
      },
      borderRadius: {
        'xl2': '0.875rem',
      },
    },
  },
  plugins: [],
};