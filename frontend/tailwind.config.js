/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#000000',
          darker: '#0a0a0a',
          accent: '#00f0ff',
          violet: '#7c3aed',
          muted: '#666666',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
