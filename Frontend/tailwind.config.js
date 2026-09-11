/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        washi: "#f7f1ef",
        mist: "#efe6e3",
        sakura: {
          soft: "#f8d5da",
          mid: "#e8a8b2",
          deep: "#c97886",
        },
        ink: "#2f2826",
        taupe: "#6e5656",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Outfit"', "system-ui", "sans-serif"],
        "alex-brush": ['"Alex Brush"', "cursive"],
      },
    },
  },
  plugins: [],
};
