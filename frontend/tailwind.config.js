/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        // tailwindcss-animate trae varias animaciones listas
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}