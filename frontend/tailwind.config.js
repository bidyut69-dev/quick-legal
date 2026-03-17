/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black:  "#08080f",
          dark:   "#0d0d1a",
          border: "#1a1a2e",
          cyan:   "#00f5d4",
          purple: "#b14aed",
          pink:   "#ff2d78",
          yellow: "#ffd60a",
          muted:  "#4a4a6a",
          text:   "#c0c0d0",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}