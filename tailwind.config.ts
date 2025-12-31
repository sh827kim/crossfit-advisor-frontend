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
        // 다크톤 테마 - 오렌지 포인트
        background: "#0f0f0f",        // 거의 검정색 배경
        foreground: "#f5f5f5",        // 밝은 흰색 텍스트
        card: "#1a1a1a",              // 진한 회색 카드
        "card-foreground": "#f5f5f5", // 밝은 텍스트
        popover: "#1a1a1a",           // 진한 회색 팝오버
        "popover-foreground": "#f5f5f5",
        muted: "#2a2a2a",             // 중간 회색 (비활성 배경)
        "muted-foreground": "#a0a0a0", // 회색 텍스트
        accent: "#d97706",            // amber-600 (차분한 오렌지)
        "accent-foreground": "#ffffff",
        destructive: "#ef4444",       // 빨간색 (에러)
        "destructive-foreground": "#ffffff",
        border: "#2a2a2a",            // 진한 회색 테두리
        input: "#1a1a1a",             // 진한 회색 입력 필드
        ring: "#d97706",              // amber-600 포커스 링
        primary: "#d97706",           // amber-600 주색
        "primary-foreground": "#ffffff",
        secondary: "#b45309",         // amber-700 (진한 오렌지)
        "secondary-foreground": "#ffffff",
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
