/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: '#f1f5f9',
        ink: '#0f172a',
      },
    },
  },
  plugins: [],
};
