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
        accent: {
          light: '#7ecbdb',
          DEFAULT: '#55b5cb',
          dark: '#3a9ab0',
        },
        mid: {
          DEFAULT: '#777777',
          light: '#a0a0a0',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          light: '#141414',
          card: '#111111',
          border: '#1e1e1e',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(85, 181, 203, 0.35)',
        'glow-sm': '0 0 12px rgba(85, 181, 203, 0.22)',
        'glow-lg': '0 0 48px rgba(85, 181, 203, 0.42)',
        'glow-border': '0 0 0 1px rgba(85,181,203,0.4), 0 0 16px rgba(85,181,203,0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
