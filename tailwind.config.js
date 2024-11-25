/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // or 'class' if you prefer using a class for dark mode
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss"),
    require('autoprefixer'),
    // other plugins as needed
  ],
}

