"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Loader2, Dumbbell, Utensils, Target, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface PlanResult {
    summary: string;
    weeklyCalorieDeficit: number;
    trainingPlan: {
        frequency: string;
        duration: string;
        menu: { name: string; weight: string; sets: string; reps: string; purpose: string }[];
    };
    mealPlan: {
        dailyCalories: number;
        protein: number;
        meals: { timing: string; example: string; points: string }[];
    };
    weeklyMilestones: { week: number; targetWeight: number; focus: string }[];
    adviceForTrainer: string;
}

export default function PlanGeneratorPage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState<PlanResult | null>(null);

    // Form state
    const [currentWeight, setCurrentWeight] = useState(65);
    const [targetWeight, setTargetWeight] = useState(58);
    const [bodyFatPercentage, setBodyFatPercentage] = useState(25);
    const [muscleMass, setMuscleMass] = useState(45);
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState<'男性' | '女性'>('女性');
    const [exerciseFrequency, setExerciseFrequency] = useState(2);
    const [dietStyle, setDietStyle] = useState('自炊メイン');
    const [deadline, setDeadline] = useState('3ヶ月');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setPlan(null);

        try {
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentWeight,
                    targetWeight,
                    bodyFatPercentage,
                    muscleMass,
                    age,
                    gender,
                    exerciseFrequency,
                    dietStyle,
                    deadline,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            const data = await response.json();
            setPlan(data);
            toast.success('プランを生成しました');
        } catch (error: any) {
            console.error(error);
            toast.error(`エラー: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#f59e0b]" />
                    AIパーソナルプラン
                </h1>
                <p className="text-sm text-[#64748b]">InBody情報から最適なプランを生成</p>
            </div>

            {!plan ? (
                <div className="space-y-4">
                    {/* InBody Data */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">📊 InBody情報</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>現在体重 (kg)</Label>
                                    <Input
                                        type="number"
                                        value={currentWeight}
                                        onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>目標体重 (kg)</Label>
                                    <Input
                                        type="number"
                                        value={targetWeight}
                                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                                        className="border-[#2563eb] text-[#2563eb]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>体脂肪率 (%)</Label>
                                    <Input
                                        type="number"
                                        value={bodyFatPercentage}
                                        onChange={(e) => setBodyFatPercentage(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>筋肉量 (kg)</Label>
                                    <Input
                                        type="number"
                                        value={muscleMass}
                                        onChange={(e) => setMuscleMass(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">👤 基本情報</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>年齢</Label>
                                    <Input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>性別</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={gender === '男性' ? 'default' : 'outline'}
                                            onClick={() => setGender('男性')}
                                            className="flex-1"
                                        >
                                            男性
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={gender === '女性' ? 'default' : 'outline'}
                                            onClick={() => setGender('女性')}
                                            className="flex-1"
                                        >
                                            女性
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lifestyle */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">🏃 生活習慣</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label>運動可能頻度</Label>
                                    <span className="font-bold">週{exerciseFrequency}回</span>
                                </div>
                                <Slider
                                    value={[exerciseFrequency]}
                                    min={1}
                                    max={7}
                                    step={1}
                                    onValueChange={(val) => setExerciseFrequency(val[0])}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>食事スタイル</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['自炊メイン', '外食メイン', 'コンビニ'].map((style) => (
                                        <Button
                                            key={style}
                                            type="button"
                                            variant={dietStyle === style ? 'default' : 'outline'}
                                            onClick={() => setDietStyle(style)}
                                            size="sm"
                                        >
                                            {style}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>目標期限</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['2ヶ月', '3ヶ月', '6ヶ月'].map((d) => (
                                        <Button
                                            key={d}
                                            type="button"
                                            variant={deadline === d ? 'default' : 'outline'}
                                            onClick={() => setDeadline(d)}
                                            size="sm"
                                        >
                                            {d}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-bold"
                        size="lg"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                AIがプランを生成中...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                パーソナルプランを生成
                            </span>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Summary */}
                    <Card className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white border-none">
                        <CardContent className="p-6 text-center">
                            <Target className="w-10 h-10 mx-auto mb-3 opacity-90" />
                            <p className="text-lg font-bold">{plan.summary}</p>
                            <p className="text-sm opacity-80 mt-2">
                                {currentWeight}kg → {targetWeight}kg（{deadline}）
                            </p>
                        </CardContent>
                    </Card>

                    {/* Training Plan */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-[#2563eb]" />
                                トレーニングプラン
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#64748b] mb-3">
                                {plan.trainingPlan.frequency} / {plan.trainingPlan.duration}
                            </p>
                            <div className="space-y-2">
                                {plan.trainingPlan.menu.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-[#f8fafc] rounded-lg">
                                        <div className="flex-1 mr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold">{item.name}</p>
                                                {item.weight && (
                                                    <span className="text-xs bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded-full font-medium border border-[#bae6fd]">
                                                        {item.weight}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#64748b]">{item.purpose}</p>
                                        </div>
                                        <span className="text-sm text-[#0f172a] font-bold whitespace-nowrap">
                                            {item.sets} × {item.reps}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-[#10b981]" />
                                食事プラン
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 text-center p-3 bg-[#fef3c7] rounded-lg">
                                    <p className="text-xs text-[#92400e]">目標カロリー</p>
                                    <p className="font-bold text-[#b45309]">{plan.mealPlan.dailyCalories} kcal</p>
                                </div>
                                <div className="flex-1 text-center p-3 bg-[#dbeafe] rounded-lg">
                                    <p className="text-xs text-[#1e40af]">タンパク質</p>
                                    <p className="font-bold text-[#1e40af]">{plan.mealPlan.protein}g</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {plan.mealPlan.meals.map((meal, i) => (
                                    <div key={i} className="p-3 bg-[#f8fafc] rounded-lg">
                                        <p className="font-medium text-sm">{meal.timing}</p>
                                        <p className="text-[#4b5563]">{meal.example}</p>
                                        <p className="text-xs text-[#10b981] mt-1">💡 {meal.points}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#f59e0b]" />
                                週別マイルストーン
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {plan.weeklyMilestones.slice(0, 4).map((milestone, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-sm font-bold">
                                            {milestone.week}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{milestone.targetWeight}kg目標</p>
                                            <p className="text-xs text-[#64748b]">{milestone.focus}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trainer Advice */}
                    <Card className="border-[#f59e0b] bg-[#fffbeb]">
                        <CardContent className="p-4">
                            <p className="text-sm font-medium text-[#92400e] mb-1">💡 トレーナーへのアドバイス</p>
                            <p className="text-[#78350f]">{plan.adviceForTrainer}</p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setPlan(null)}
                            size="lg"
                        >
                            再入力
                        </Button>
                        <Button
                            onClick={() => {
                                if (plan) {
                                    sessionStorage.setItem('pending_plan', JSON.stringify(plan));
                                    router.push(`/clients/new?currentWeight=${currentWeight}&targetWeight=${targetWeight}`);
                                }
                            }}
                            className="bg-[#2563eb]"
                            size="lg"
                        >
                            このプランで始める
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
