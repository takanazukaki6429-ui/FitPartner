"use client"

import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BodyCompositionLog {
    date: string;
    weight: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
}

interface ProgressChartProps {
    data: BodyCompositionLog[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
    // Sort data by date ascending for the chart
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">体重・体脂肪率・筋肉量の推移</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(date) => new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                            />
                            <YAxis yAxisId="left" orientation="left" stroke="#2563eb" domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="kg" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString('ja-JP')}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="weight" name="体重(kg)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="left" type="monotone" dataKey="muscle_mass" name="筋肉量(kg)" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
                            <Bar yAxisId="right" dataKey="body_fat_percentage" name="体脂肪率(%)" fill="#10b981" barSize={20} opacity={0.3} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
