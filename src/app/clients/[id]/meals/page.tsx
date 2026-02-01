"use client"

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import MealAnalyzer from '@/components/MealAnalyzer';

export default function MealsPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">食事管理</h1>
            </div>

            <MealAnalyzer />
        </div>
    );
}
