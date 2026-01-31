"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SimulationPage() {
    const [currentWeight, setCurrentWeight] = useState(60);
    const [targetWeight, setTargetWeight] = useState(52);
    const [periodMonths, setPeriodMonths] = useState(3);

    // Generate graph data based on inputs
    const data = useMemo(() => {
        const points = [];
        const weightDiff = currentWeight - targetWeight;

        for (let i = 0; i <= periodMonths; i++) {
            // Simple linear projection for MVP, maybe slight curve for realism later
            const progress = i / periodMonths;
            // Curve easing: fast start, slower end (easeOutQuad)
            const easedProgress = 1 - (1 - progress) * (1 - progress);

            const projectedWeight = currentWeight - (weightDiff * progress); // Linear for now to correspond with logic simply

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
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">未来予測シミュレーション</h2>
                <p className="text-sm text-muted-foreground">3ヶ月で理想のあなたへ</p>
            </div>

            {/* Inputs - Minimized Typing */}
            <Card className="bg-white/80 backdrop-blur">
                <CardContent className="p-6 space-y-6">

                    {/* Current Weight */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-600">現在体重</label>
                            <div className="flex items-end gap-1">
                                <Input
                                    type="number"
                                    value={currentWeight}
                                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                    className="w-20 text-right font-bold text-lg h-9"
                                />
                                <span className="text-sm text-gray-400 mb-1">kg</span>
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

                    {/* Target Weight */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-600">目標体重</label>
                            <div className="flex items-end gap-1">
                                <Input
                                    type="number"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                                    className="w-20 text-right font-bold text-lg h-9 text-primary border-primary"
                                />
                                <span className="text-sm text-gray-400 mb-1">kg</span>
                            </div>
                        </div>
                        <Slider
                            value={[targetWeight]}
                            min={40}
                            max={100}
                            step={0.5}
                            onValueChange={(val) => setTargetWeight(val[0])}
                            className="[&>.bg-primary]:bg-emerald-500"
                        />
                    </div>

                    {/* Period */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-600">期間</label>
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

            {/* Graph Area */}
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
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine y={targetWeight} stroke="#10B981" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Result & Proposal */}
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
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
                    <Button variant="secondary" size="lg" className="w-full font-bold shadow-lg">
                        このプランで始める
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
