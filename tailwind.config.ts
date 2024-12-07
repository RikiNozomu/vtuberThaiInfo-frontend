import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["LINE Seed Sans TH", "sans-serif"],
      },
      screens: {
        ss: "425px",
      },
      colors: {
        primary: "#1f4056",
        secondary: "#EF4444",
        error: "#d32f2f",
        warning: "#ed6c02",
        info: "#0288d1",
        success: "#2e7d32",
        youtube: "#ff0300",
        twitch: "#9147ff",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
