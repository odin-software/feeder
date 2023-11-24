import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "rss": "#f26522"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
} satisfies Config;
