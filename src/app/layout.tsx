import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for professional look
import "./globals.css";
import { MobileLayout } from "@/components/layout/MobileLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitPartner",
  description: "Personal Trainer Support App",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Prevent zoom on mobile inputs
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
      </body>
    </html>
  );
}
