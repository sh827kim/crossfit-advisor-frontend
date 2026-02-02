import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS 변수 기반의 시맨틱 색상 (Figma 적용 용이)
        primary: "hsl(var(--color-primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--color-primary-foreground) / <alpha-value>)",
        secondary: "hsl(var(--color-secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--color-secondary-foreground) / <alpha-value>)",
        accent: "hsl(var(--color-accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--color-accent-foreground) / <alpha-value>)",
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        destructive: "hsl(var(--color-destructive) / <alpha-value>)",
        "destructive-foreground": "hsl(var(--color-destructive-foreground) / <alpha-value>)",
        muted: "hsl(var(--color-muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--color-muted-foreground) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
        barlow: ["var(--font-barlow)", ...defaultTheme.fontFamily.sans, "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
