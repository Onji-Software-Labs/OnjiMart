/** @type {import('tailwindcss').Config} */

const tailwindTheme = require("./tailwind-tokens-parser");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      ...tailwindTheme,
      fontFamily: {
        ...tailwindTheme.fontFamily,
      },
    },
  },
  plugins: [],
};
