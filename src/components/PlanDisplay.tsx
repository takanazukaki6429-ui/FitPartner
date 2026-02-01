import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Calendar, Target } from 'lucide-react';
import type { PlanResult } from '@/app/plan/page';

interface PlanDisplayProps {
    plan: PlanResult;
}

export default function PlanDisplay({ plan }: PlanDisplayProps) {
    return (
        <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white border-none">
                <CardContent className="p-6 text-center">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-90" />
                    <p className="text-lg font-bold">{plan.summary}</p>
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
        </div>
    );
}
