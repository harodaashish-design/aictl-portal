/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: '#0B2C6F',
          darkNavy: '#071F52',
          blue: '#16469E',
          lightBlue: '#E8F3FC',
          sky: '#9BD2F6',
          orange: '#F37021',
          orangeHover: '#D85B0F',
          saffron: '#FF7A00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
