"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, Users, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    {
        label: 'Home',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        label: '分析',
        href: '/analytics',
        icon: TrendingUp,
    },
    {
        label: 'Closing',
        href: '/simulation',
        icon: LineChart,
    },
    {
        label: 'Clients',
        href: '/clients',
        icon: Users,
    },
];

export function MobileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            {/* Simple Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
                <h1 className="text-xl font-bold tracking-tight text-primary">FitPartner</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-md mx-auto p-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
