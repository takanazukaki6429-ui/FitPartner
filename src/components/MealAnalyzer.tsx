"use client"

import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Copy, Check, Flame, Beef } from 'lucide-react';
import { toast } from 'sonner';

interface MealAnalysis {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: string[];
    evaluation: '良い' | '普通' | '改善が必要';
    advice: string;
    clientMessage: string;
}

interface MealAnalyzerProps {
    onAnalysisComplete?: (analysis: MealAnalysis) => void;
}

export default function MealAnalyzer({ onAnalysisComplete }: MealAnalyzerProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setPreviewUrl(base64);
            await analyzeImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const analyzeImage = async (imageBase64: string) => {
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const response = await fetch('/api/analyze-meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setAnalysis(data);
            onAnalysisComplete?.(data);
            toast.success('食事を分析しました');
        } catch (error) {
            console.error(error);
            toast.error('分析に失敗しました');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyMessage = () => {
        if (analysis?.clientMessage) {
            navigator.clipboard.writeText(analysis.clientMessage);
            setCopied(true);
            toast.success('メッセージをコピーしました');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const evaluationColor = {
        '良い': 'bg-[#10b981] text-white',
        '普通': 'bg-[#f59e0b] text-white',
        '改善が必要': 'bg-[#ef4444] text-white',
    };

    return (
        <div className="space-y-4">
            {/* Camera Input */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-8 text-center cursor-pointer hover:border-[#2563eb] transition-colors"
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="食事"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                ) : (
                    <Camera className="w-16 h-16 mx-auto text-[#9ca3af] mb-4" />
                )}
                <p className="font-medium text-[#4b5563]">
                    {previewUrl ? '別の写真を撮影' : '食事を撮影'}
                </p>
                <p className="text-sm text-[#9ca3af]">タップしてカメラを起動</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Loading */}
            {isAnalyzing && (
                <Card className="p-6 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#2563eb] mb-4" />
                    <p className="text-[#64748b]">AIが食事を分析中...</p>
                </Card>
            )}

            {/* Analysis Result */}
            {analysis && (
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {/* Evaluation Badge */}
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${evaluationColor[analysis.evaluation]}`}>
                                {analysis.evaluation}
                            </span>
                            <div className="text-right">
                                <p className="text-sm text-[#64748b]">推定カロリー</p>
                                <p className="text-2xl font-bold flex items-center gap-1">
                                    <Flame className="w-5 h-5 text-[#f59e0b]" />
                                    {analysis.calories} kcal
                                </p>
                            </div>
                        </div>

                        {/* Detected Foods */}
                        <div>
                            <p className="text-sm text-[#64748b] mb-2">検出した料理</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.foods.map((food, i) => (
                                    <span
                                        key={i}
                                        className="bg-[#f1f5f9] text-[#4b5563] px-3 py-1 rounded-full text-sm"
                                    >
                                        {food}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Nutrients */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-[#fef3c7] rounded-lg">
                                <Beef className="w-5 h-5 mx-auto mb-1 text-[#b45309]" />
                                <p className="text-xs text-[#92400e]">タンパク質</p>
                                <p className="font-bold text-[#b45309]">{analysis.protein}g</p>
                            </div>
                            <div className="text-center p-3 bg-[#dbeafe] rounded-lg">
                                <p className="text-xs text-[#1e40af]">炭水化物</p>
                                <p className="font-bold text-[#1e40af]">{analysis.carbs}g</p>
                            </div>
                            <div className="text-center p-3 bg-[#fce7f3] rounded-lg">
                                <p className="text-xs text-[#9d174d]">脂質</p>
                                <p className="font-bold text-[#9d174d]">{analysis.fat}g</p>
                            </div>
                        </div>

                        {/* Trainer Advice */}
                        <div className="bg-[#f8fafc] p-4 rounded-lg">
                            <p className="text-sm text-[#64748b] mb-1">トレーナーへのアドバイス</p>
                            <p className="font-medium">{analysis.advice}</p>
                        </div>

                        {/* Client Message */}
                        <div className="border border-[#e2e8f0] p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-[#64748b]">生徒への返信メッセージ（下書き）</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyMessage}
                                    className="h-8"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-[#020817]">{analysis.clientMessage}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
