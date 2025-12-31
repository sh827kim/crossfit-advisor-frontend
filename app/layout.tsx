import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "또와드 - AI 기반 Crossfit 보강운동 추천",
  description: "WOD 분석 후 맞춤형 보강운동을 추천하는 AI 서비스. 당신의 약점을 파악하고 최적의 운동을 제안합니다.",
  applicationName: "또와드",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "또와드",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "또와드",
    title: "또와드 - AI 기반 Crossfit 보강운동 추천",
    description: "WOD 분석 후 맞춤형 보강운동을 추천하는 AI 서비스",
  },
  twitter: {
    card: "summary",
    title: "또와드 - AI 기반 Crossfit 보강운동 추천",
    description: "WOD 분석 후 맞춤형 보강운동을 추천하는 AI 서비스",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
