"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Copy, Dumbbell } from 'lucide-react';

interface TrainingLogInputProps {
    clientId: string;
    onAdded: () => void;
}

interface LastLog {
    menu_name: string;
    weight?: number;
    reps?: number;
    sets?: number;
}

export default function TrainingLogInput({ clientId, onAdded }: TrainingLogInputProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [menuName, setMenuName] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [notes, setNotes] = useState('');
    const [lastLog, setLastLog] = useState<LastLog | null>(null);

    // Fetch last session for copy feature
    useEffect(() => {
        const fetchLastLog = async () => {
            const { data } = await supabase
                .from('training_logs')
                .select('menu_name, weight, reps, sets')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setLastLog(data);
            }
        };
        fetchLastLog();
    }, [clientId]);

    const handleCopyLast = () => {
        if (lastLog) {
            setMenuName(lastLog.menu_name || '');
            setWeight(lastLog.weight?.toString() || '');
            setReps(lastLog.reps?.toString() || '');
            setSets(lastLog.sets?.toString() || '');
            toast.success('前回のメニューをコピーしました');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menuName.trim()) {
            toast.error('種目を入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('training_logs').insert({
                client_id: clientId,
                date,
                menu_name: menuName.trim(),
                weight: weight ? parseFloat(weight) : null,
                reps: reps ? parseInt(reps) : null,
                sets: sets ? parseInt(sets) : null,
                notes: notes.trim() || null,
            });

            if (error) throw error;

            toast.success('ログを保存しました');
            // Update last log for next copy
            setLastLog({
                menu_name: menuName.trim(),
                weight: weight ? parseFloat(weight) : undefined,
                reps: reps ? parseInt(reps) : undefined,
                sets: sets ? parseInt(sets) : undefined,
            });
            // Clear form except date
            setMenuName('');
            setWeight('');
            setReps('');
            setSets('');
            setNotes('');
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
                    {/* Date & Copy Button */}
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Label htmlFor="t_date">日付</Label>
                            <Input
                                id="t_date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        {lastLog && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopyLast}
                                className="h-9 whitespace-nowrap"
                            >
                                <Copy className="w-4 h-4 mr-1" />
                                前回コピー
                            </Button>
                        )}
                    </div>

                    {/* Exercise Row: Name + Weight + Reps + Sets */}
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                            <Label htmlFor="menuName" className="text-xs">種目</Label>
                            <Input
                                id="menuName"
                                placeholder="プルダウン"
                                value={menuName}
                                onChange={(e) => setMenuName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Label htmlFor="weight_val" className="text-xs">重量(kg)</Label>
                            <Input
                                id="weight_val"
                                type="number"
                                step="0.5"
                                placeholder="40"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="reps_val" className="text-xs">回数</Label>
                            <Input
                                id="reps_val"
                                type="number"
                                placeholder="10"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                            />
                        </div>
                        <div className="col-span-3">
                            <Label htmlFor="sets_val" className="text-xs">セット</Label>
                            <Input
                                id="sets_val"
                                type="number"
                                placeholder="3"
                                value={sets}
                                onChange={(e) => setSets(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-xs">メモ</Label>
                        <Textarea
                            id="notes"
                            placeholder="特記事項があれば..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2563eb]">
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Dumbbell className="w-4 h-4 mr-2" />
                        )}
                        ログを追加
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
