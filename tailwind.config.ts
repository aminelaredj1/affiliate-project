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
        navy: "#0B2545",
        gold: "#C79854",
        sky: "#85A8C7",
      },
      boxShadow: {
        // Neumorphism shadows
        'neu-flat': '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'neu-pressed': 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff',
        'neu-navy': '8px 8px 16px #061527, -8px -8px 16px #103563',
        'neu-navy-pressed': 'inset 8px 8px 16px #061527, inset -8px -8px 16px #103563',
      }
    },
  },
  plugins: [],
};
export default config;
