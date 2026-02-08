import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "日本語学習ロードマップ | Japanese Learning Roadmap",
    description: "あなた専用の日本語学習プランを作成します。JLPT N5〜N1対応。",
    icons: {
        icon: "/icon.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {children}
        </div>
    );
}
