/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080808', coal: '#111111', card: '#171717',
        gold: '#C9A45C', champagne: '#E8D5A5', mute: '#A1A1A1',
      },
      fontFamily: { serif: ['"Playfair Display"', 'serif'], sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'] },
      letterSpacing: { wider2: '0.22em' },
    },
  },
  plugins: [],
};
