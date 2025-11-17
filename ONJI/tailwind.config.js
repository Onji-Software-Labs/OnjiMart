/** @type {import('tailwindcss').Config} */


const staticTheme=require("./tailwind-theme-static")

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      ...staticTheme,
    },
  },
  plugins: [],
};
