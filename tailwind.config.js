/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f0c84a',
          DEFAULT: '#e4ac29',
          dark: '#c4911a',
        },
        charcoal: {
          DEFAULT: '#1a1a1a',
          light: '#242424',
          card: '#1e1e1e',
          border: '#2e2e2e',
        },
        offwhite: '#f5f4f0',
        muted: '#888888',
      },
      fontFamily: {
        heading: ['"Anton"', '"Black Han Sans"', 'Impact', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 24px rgba(228, 172, 41, 0.25)',
        'gold-lg': '0 8px 48px rgba(228, 172, 41, 0.35)',
        card: '0 2px 12px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
