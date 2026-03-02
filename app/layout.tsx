import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";
import { Header } from "@/app/components/Header";
import { PWAInitializer } from "@/app/components/PWAInitializer";
import { BackButtonHandler } from "@/app/components/BackButtonHandler";

export const metadata: Metadata = {
  title: "애프터와드 - 보강운동 추천",
  description: "Crossfit WOD 후 맞춤형 보강운동을 추천하는 앱",
  applicationName: "애프터와드",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "애프터와드",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { Barlow_Condensed } from "next/font/google";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

import { GlobalPageTracker } from "@/app/components/GlobalPageTracker";
import { ErrorProvider } from "@/app/context/ErrorContext";
import { GlobalErrorModal } from "@/app/components/shared/GlobalErrorModal";
import { WindowScaler } from "@/app/components/WindowScaler";

import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`bg-black font-sans ${barlowCondensed.variable} overflow-hidden w-full h-full flex justify-center items-start`}>
        <AppProvider>
          <ErrorProvider>
            <WindowScaler />
            <GlobalPageTracker />
            <PWAInitializer />
            <BackButtonHandler />
            <div className="flex flex-col bg-[#010101] app-container shadow-lg">
              <Header />
              <main className="flex-1 flex flex-col overflow-y-auto overscroll-none hide-scrollbar">
                {children}
              </main>
            </div>
          </ErrorProvider>
        </AppProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
