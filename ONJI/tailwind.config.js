/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins_400Regular', 'sans-serif'],
        'poppins-semibold': ['Poppins_600SemiBold', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
