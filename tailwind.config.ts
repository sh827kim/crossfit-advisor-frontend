import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["selector", "[data-theme='dark']"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 라이트 테마 - 파란색 포인트 (검은 텍스트)
        background: "#FFFFFF",
        foreground: "#000000",
        card: "#FFFFFF",
        "card-foreground": "#000000",
        popover: "#FFFFFF",
        "popover-foreground": "#000000",
        muted: "#F3F4F6",
        "muted-foreground": "#4B5563",
        accent: "#3B82F6",
        "accent-foreground": "#FFFFFF",
        destructive: "#EF4444",
        "destructive-foreground": "#FFFFFF",
        border: "#E5E7EB",
        input: "#F9FAFB",
        ring: "#3B82F6",
        primary: "#3B82F6",
        "primary-foreground": "#FFFFFF",
        secondary: "#E5E7EB",
        "secondary-foreground": "#000000",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
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
    },
  },
  plugins: [],
} satisfies Config

export default config
