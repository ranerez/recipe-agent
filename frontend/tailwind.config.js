/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#c0392b',
          dark: '#a93226',
          light: '#e0a09a',
          bg: '#fdf0ee',
          border: '#f0c4be',
        },
        warm: {
          bg: '#fdf6ee',
          divider: '#f0ece7',
        },
      },
      keyframes: {
        blink: { '50%': { opacity: '0' } },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-5px)' },
          '40%': { transform: 'translateX(5px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pulseChip: {
          '0%, 100%': { backgroundColor: '#fdf0ee', borderColor: '#f0c4be' },
          '40%': { backgroundColor: '#f5b7b1', borderColor: '#c0392b' },
        },
      },
      animation: {
        blink: 'blink 0.9s step-end infinite',
        shake: 'shake 0.35s ease',
        'pulse-chip': 'pulseChip 0.5s ease',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
