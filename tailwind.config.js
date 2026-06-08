/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // આ લાઈન બધી જ લક્ઝરી ડિઝાઇન ચાલુ કરી દેશે
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}