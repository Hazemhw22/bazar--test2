import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  extend: {
  fontSize: {
    base: "18px",   // الحجم الافتراضي للنصوص
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
  },
  spacing: {
    18: "4.5rem",   // مسافات أكبر متناسقة
    22: "5.5rem",
  },
  container: {
    center: true,
    padding: "2rem",
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
  },
},

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
