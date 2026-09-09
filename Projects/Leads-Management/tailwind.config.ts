import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#c1442d",
          dark: "#9a3423",
          light: "#d97256",
        },
        accent: {
          DEFAULT: "#e3a53a",
          dark: "#c1861f",
          light: "#f0c168",
        },
      },
      boxShadow: {
        nav: "0 -2px 16px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
