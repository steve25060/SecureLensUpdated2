/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        accent: {
          DEFAULT: '#7c3aed',
          light: '#8b5cf6',
        },
        gray: {
          850: '#1a1a2e',
        },
      },
    },
  },
  plugins: [],
};
