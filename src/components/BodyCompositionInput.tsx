"use client"

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Plus, Camera } from 'lucide-react';

interface BodyCompositionInputProps {
    clientId: string;
    onAdded: () => void;
}

export default function BodyCompositionInput({ clientId, onAdded }: BodyCompositionInputProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [analyzing, setAnalyzing] = useState(false);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/analyze-body-composition', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();

            if (data.weight) setWeight(data.weight.toString());
            if (data.bodyFatPercentage) setBodyFat(data.bodyFatPercentage.toString());
            if (data.muscleMass) setMuscleMass(data.muscleMass.toString());

            toast.success('画像を読み取りました');
        } catch (error) {
            console.error(error);
            toast.error('解析に失敗しました');
        } finally {
            setAnalyzing(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('body_composition_logs').insert({
                client_id: clientId,
                date,
                weight: parseFloat(weight),
                body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
                muscle_mass: muscleMass ? parseFloat(muscleMass) : null,
            });

            if (error) throw error;

            toast.success('記録を追加しました');
            setWeight('');
            setBodyFat('');
            setMuscleMass('');
            onAdded();
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-end mb-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleImageSelect}
                                disabled={analyzing}
                            />
                            <div className="flex items-center gap-2 text-sm text-[#2563eb] font-bold bg-[#eff6ff] px-3 py-2 rounded-lg hover:bg-[#dbeafe] transition-colors">
                                {analyzing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                                {analyzing ? '解析中...' : '写真から読取'}
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">日付</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">体重 (kg)</Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                placeholder="60.0"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bodyFat">体脂肪率 (%)</Label>
                            <Input
                                id="bodyFat"
                                type="number"
                                step="0.1"
                                placeholder="20.0"
                                value={bodyFat}
                                onChange={(e) => setBodyFat(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="muscleMass">筋肉量 (kg)</Label>
                            <Input
                                id="muscleMass"
                                type="number"
                                step="0.1"
                                placeholder="40.0"
                                value={muscleMass}
                                onChange={(e) => setMuscleMass(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2563eb]">
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        記録を追加
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
