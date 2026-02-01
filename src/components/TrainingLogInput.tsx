"use client"

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Plus, Dumbbell } from 'lucide-react';

interface TrainingLogInputProps {
    clientId: string;
    onAdded: () => void;
}

export default function TrainingLogInput({ clientId, onAdded }: TrainingLogInputProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [menuName, setMenuName] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menuName) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('training_logs').insert({
                client_id: clientId,
                date,
                menu_name: menuName,
                weight: weight ? parseFloat(weight) : null,
                reps: reps ? parseInt(reps) : null,
                sets: sets ? parseInt(sets) : null,
            });

            if (error) throw error;

            toast.success('ログを追加しました');
            setMenuName('');
            setWeight('');
            setReps('');
            setSets('');
            onAdded();
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-6 border-l-4 border-l-[#2563eb]">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="t_date">日付</Label>
                        <Input
                            id="t_date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="menuName">種目名</Label>
                        <Input
                            id="menuName"
                            placeholder="ベンチプレス"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight_val">重量(kg)</Label>
                            <Input
                                id="weight_val"
                                type="number"
                                step="0.5"
                                placeholder="40"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sets_val">セット数</Label>
                            <Input
                                id="sets_val"
                                type="number"
                                placeholder="3"
                                value={sets}
                                onChange={(e) => setSets(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reps_val">回数</Label>
                            <Input
                                id="reps_val"
                                type="number"
                                placeholder="10"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2563eb]">
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Dumbbell className="w-4 h-4 mr-2" />
                        )}
                        実績を追加
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
