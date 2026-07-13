import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        hntr: {
          orange: "#F25623",
          black: "#0c0c0e"
        }
      }
    }
  },
  plugins: []
};

export default config;
