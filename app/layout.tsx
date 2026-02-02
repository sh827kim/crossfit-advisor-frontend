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
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Barlow_Condensed } from "next/font/google";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={barlowCondensed.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="애프터와드" />
      </head>
      <body className="bg-gray-100 font-sans">
        <AppProvider>
          <PWAInitializer />
          <BackButtonHandler />
          <div className="flex flex-col bg-white max-w-md mx-auto min-h-screen shadow-lg">
            <Header />
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
