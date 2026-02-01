"use client"

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { domToBlob } from 'modern-screenshot';
import { Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SimulationPage() {
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const [currentWeight, setCurrentWeight] = useState(60);
    const [targetWeight, setTargetWeight] = useState(52);
    const [periodMonths, setPeriodMonths] = useState(3);

    const handleShare = async () => {
        if (!contentRef.current) return;

        setIsSharing(true);
        try {
            const blob = await domToBlob(contentRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });

            if (!blob) {
                toast.error("画像の生成に失敗しました");
                setIsSharing(false);
                return;
            }

            const file = new File([blob], "simulation_result.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'FitPartner シミュレーション結果',
                        text: `3ヶ月で${(currentWeight - targetWeight).toFixed(1)}kgの減量を目指します！ #FitPartner`,
                    });
                    toast.success("シェアメニューを開きました");
                } catch (err) {
                    console.error("Share failed", err);
                }
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'simulation_result.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                toast.success("画像をダウンロードしました");
            }
        } catch (error) {
            console.error("Capture failed", error);
            toast.error("エラーが発生しました: " + (error instanceof Error ? error.message : ""));
        } finally {
            setIsSharing(false);
        }
    };

    const data = useMemo(() => {
        const points = [];
        const weightDiff = currentWeight - targetWeight;

        for (let i = 0; i <= periodMonths; i++) {
            const progress = i / periodMonths;
            const projectedWeight = currentWeight - (weightDiff * progress);
            points.push({
                month: `${i}ヶ月後`,
                weight: parseFloat(projectedWeight.toFixed(1)),
                target: targetWeight,
            });
        }
        return points;
    }, [currentWeight, targetWeight, periodMonths]);

    const monthlyLoss = ((currentWeight - targetWeight) / periodMonths).toFixed(1);

    return (
        <div ref={contentRef} className="space-y-6 pb-20 bg-white p-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-[#020817]">未来予測シミュレーション</h2>
                <p className="text-sm text-[#64748b]">3ヶ月で理想のあなたへ</p>
            </div>

            <Card className="bg-white">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-[#4b5563]">現在体重</label>
                            <div className="flex items-end gap-1">
                                <Input
                                    type="number"
                                    value={currentWeight}
                                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                    className="w-20 text-right font-bold text-lg h-9"
                                />
                                <span className="text-sm text-[#9ca3af] mb-1">kg</span>
                            </div>
                        </div>
                        <Slider
                            value={[currentWeight]}
                            min={40}
                            max={120}
                            step={0.5}
                            onValueChange={(val) => setCurrentWeight(val[0])}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-[#4b5563]">目標体重</label>
                            <div className="flex items-end gap-1">
                                <Input
                                    type="number"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                                    className="w-20 text-right font-bold text-lg h-9 text-[#2563eb] border-[#2563eb]"
                                />
                                <span className="text-sm text-[#9ca3af] mb-1">kg</span>
                            </div>
                        </div>
                        <Slider
                            value={[targetWeight]}
                            min={40}
                            max={100}
                            step={0.5}
                            onValueChange={(val) => setTargetWeight(val[0])}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-[#4b5563]">期間</label>
                            <span className="font-bold text-lg">{periodMonths}ヶ月</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[2, 3, 6].map((m) => (
                                <Button
                                    key={m}
                                    variant={periodMonths === m ? "default" : "outline"}
                                    onClick={() => setPeriodMonths(m)}
                                    className="h-9"
                                >
                                    {m}ヶ月
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                dy={10}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <ReferenceLine y={targetWeight} stroke="#10B981" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card
                className="text-white border-none"
                style={{ backgroundColor: '#2563eb', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
                <CardContent className="p-6 text-center space-y-4">
                    <div>
                        <p className="text-sm opacity-90 mb-1">あなたの目標プラン</p>
                        <p className="text-3xl font-bold tracking-tight">
                            -{data[data.length - 1].weight < currentWeight ? (currentWeight - targetWeight).toFixed(1) : 0}kg
                            <span className="text-base font-normal ml-2">達成へ</span>
                        </p>
                        <p className="text-sm mt-2 opacity-80">
                            月々平均 {monthlyLoss}kg の減量ペース
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full font-bold mb-3 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white"
                        style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        onClick={() => router.push(`/plan?currentWeight=${currentWeight}&targetWeight=${targetWeight}`)}
                    >
                        ✨ 詳細プランをAI生成
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full font-bold mb-3"
                        style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        onClick={() => router.push(`/clients/new?currentWeight=${currentWeight}&targetWeight=${targetWeight}`)}
                    >
                        このプランで始める
                    </Button>

                    <Button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="w-full text-white font-bold"
                        style={{ backgroundColor: '#06C755', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        size="lg"
                    >
                        {isSharing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                生成中...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                LINEで送る
                            </span>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
