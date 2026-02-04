import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { MobileLayout } from "@/components/layout/MobileLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitPartner",
  description: "パーソナルトレーナー向け顧客管理アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitPartner",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
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
    <html lang="ja">
      <body className={inter.className}>
        <MobileLayout>
          {children}
        </MobileLayout>
        <Toaster />
      </body>
    </html>
  );
}
