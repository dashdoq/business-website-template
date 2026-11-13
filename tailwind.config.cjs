/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js,jsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      canary: "#ffec80",
      pink: "#f8c4d0",
      carbon: "#25298a",
      stamp: "#d8283a",
    },
    fontFamily: {
      display: ['"League Gothic Variable"', '"Arial Narrow"', "Impact", "sans-serif"],
      body: ['"Libre Franklin Variable"', '"Helvetica Neue"', "Arial", "sans-serif"],
    },
    fontSize: {
      sm: ["0.875rem", "1.45"],
      base: ["1rem", "1.55"],
      md: ["1.125rem", "1.6"],
      lg: ["1.3125rem", "1.5"],
      xl: ["1.5rem", "1.3"],
      "2xl": ["2.25rem", "1"],
      "3xl": ["3rem", "0.95"],
      "4xl": ["4rem", "0.92"],
    },
    extend: {
      borderRadius: {
        sheet: "2px",
        card: "4.2cqw",
      },
    },
  },
  plugins: [],
};
