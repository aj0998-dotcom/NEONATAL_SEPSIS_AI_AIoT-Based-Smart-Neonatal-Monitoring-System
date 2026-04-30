/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        ink: "#3b2441",
        muted: "#7c6270",
        blush: {
          50: "#fff6fa",
          100: "#ffeaf3",
          200: "#ffd1e3",
          300: "#ffb2d0",
          400: "#ff86b4",
          500: "#de6f97",
          600: "#c85a86"
        },
        sky: {
          50: "#f3f8ff",
          100: "#e9f1ff",
          200: "#cfe3ff",
          400: "#7fb0ff",
          500: "#4e8cff"
        },
        success: "#2f9c68",
        danger: "#c84c6c",
        warning: "#d18b1d"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(180, 102, 132, 0.14)"
      }
    }
  },
  plugins: []
};

