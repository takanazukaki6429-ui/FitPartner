"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, UserX, Sparkles, Loader2, Lightbulb, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface FunnelMetrics {
    trialCount: number;
    memberCount: number;
    lostCount: number;
    totalLeads: number;
    cvr: number;
}

interface LostReasons {
    price: number;
    schedule: number;
    competitor: number;
    considering: number;
    other: number;
}

interface FunnelData {
    metrics: FunnelMetrics;
    lostReasons: LostReasons;
    advice: string[];
}

interface AIAdvice {
    overall: string;
    advices: { title: string; action: string }[];
}

const LOST_REASON_LABELS: Record<string, string> = {
    price: '料金',
    schedule: '時間',
    competitor: '他社',
    considering: '検討中',
    other: 'その他',
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FunnelData | null>(null);
    const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        fetchFunnelData();
    }, []);

    const fetchFunnelData = async () => {
        try {
            const res = await fetch('/api/analytics/funnel');
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
            toast.error('データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const fetchAIAdvice = async () => {
        if (!data) return;
        setLoadingAI(true);
        try {
            const res = await fetch('/api/analytics/ai-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metrics: data.metrics,
                    lostReasons: data.lostReasons,
                }),
            });
            if (!res.ok) throw new Error('Failed to fetch AI advice');
            const json = await res.json();
            setAiAdvice(json);
            toast.success('AIアドバイスを生成しました');
        } catch (error) {
            console.error(error);
            toast.error('AIアドバイスの生成に失敗しました');
        } finally {
            setLoadingAI(false);
        }
    };

    const getCVRColor = (cvr: number) => {
        if (cvr >= 70) return 'text-[#10b981]';
        if (cvr >= 40) return 'text-[#f59e0b]';
        return 'text-[#ef4444]';
    };

    const getCVRLabel = (cvr: number) => {
        if (cvr >= 70) return '好調';
        if (cvr >= 40) return '平均';
        return '要改善';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20 text-[#64748b]">
                データが取得できませんでした
            </div>
        );
    }

    const { metrics, lostReasons, advice } = data;

    return (
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#2563eb]" />
                    経営分析
                </h1>
                <p className="text-sm text-[#64748b]">今月のセールスパフォーマンス</p>
            </div>

            {/* Funnel Metrics */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="text-center">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-[#64748b] mb-1">体験</p>
                        <p className="text-2xl font-bold text-[#fbbf24]">{metrics.totalLeads}</p>
                        <p className="text-xs text-[#64748b]">件</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-[#64748b] mb-1">入会</p>
                        <p className="text-2xl font-bold text-[#10b981]">{metrics.memberCount}</p>
                        <p className="text-xs text-[#64748b]">件</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-[#64748b] mb-1">失注</p>
                        <p className="text-2xl font-bold text-[#ef4444]">{metrics.lostCount}</p>
                        <p className="text-xs text-[#64748b]">件</p>
                    </CardContent>
                </Card>
            </div>

            {/* CVR Card */}
            <Card className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white">
                <CardContent className="py-6 text-center">
                    <p className="text-sm opacity-80 mb-2">入会率（CVR）</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl font-bold">{metrics.cvr}%</span>
                        <Badge className={`${metrics.cvr >= 70 ? 'bg-[#10b981]' : metrics.cvr >= 40 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`}>
                            {getCVRLabel(metrics.cvr)}
                        </Badge>
                    </div>
                    <p className="text-xs opacity-70 mt-2">目標: 50-70%</p>
                </CardContent>
            </Card>

            {/* Lost Reasons */}
            {metrics.lostCount > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserX className="w-5 h-5 text-[#ef4444]" />
                            失注理由の内訳
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(lostReasons)
                                .filter(([_, count]) => count > 0)
                                .sort(([, a], [, b]) => b - a)
                                .map(([reason, count]) => (
                                    <div key={reason} className="flex items-center justify-between p-2 bg-[#f8fafc] rounded-lg">
                                        <span>{LOST_REASON_LABELS[reason]}</span>
                                        <Badge variant="secondary">{count}件</Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rule-Based Advice */}
            {advice.length > 0 && (
                <Card className="border-[#fbbf24] bg-[#fffbeb]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-[#92400e]">
                            <Lightbulb className="w-5 h-5" />
                            改善ポイント
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {advice.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-[#78350f]">
                                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* AI Advice Section */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#7c3aed]" />
                        AIコンサルタント
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {aiAdvice ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]">
                                <p className="font-bold text-[#166534]">{aiAdvice.overall}</p>
                            </div>
                            {aiAdvice.advices.map((item, i) => (
                                <div key={i} className="p-3 bg-[#f8fafc] rounded-lg">
                                    <p className="font-medium text-sm mb-1">{item.title}</p>
                                    <p className="text-sm text-[#64748b]">{item.action}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Button
                            onClick={fetchAIAdvice}
                            disabled={loadingAI}
                            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]"
                        >
                            {loadingAI ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />分析中...</>
                            ) : (
                                <><Sparkles className="w-4 h-4 mr-2" />AIに詳しく相談する</>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
