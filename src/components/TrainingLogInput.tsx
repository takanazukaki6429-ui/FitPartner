"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Copy, Dumbbell, Plus, Trash2 } from 'lucide-react';

interface TrainingLogInputProps {
    clientId: string;
    onAdded: () => void;
}

interface ExerciseRow {
    id: number;
    menuName: string;
    weight: string;
    reps: string;
    sets: string;
}

export default function TrainingLogInput({ clientId, onAdded }: TrainingLogInputProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [exercises, setExercises] = useState<ExerciseRow[]>([
        { id: 1, menuName: '', weight: '', reps: '', sets: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [lastExercises, setLastExercises] = useState<ExerciseRow[]>([]);

    // Fetch last session for copy feature
    useEffect(() => {
        const fetchLastLogs = async () => {
            const { data } = await supabase
                .from('training_logs')
                .select('menu_name, weight, reps, sets, date')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(10);

            if (data && data.length > 0) {
                // Get the most recent date
                const lastDate = data[0].date;
                // Filter to only that date's exercises
                const lastDayLogs = data.filter(d => d.date === lastDate);
                setLastExercises(lastDayLogs.map((log, i) => ({
                    id: i + 1,
                    menuName: log.menu_name || '',
                    weight: log.weight?.toString() || '',
                    reps: log.reps?.toString() || '',
                    sets: log.sets?.toString() || '',
                })));
            }
        };
        fetchLastLogs();
    }, [clientId]);

    const handleCopyLast = () => {
        if (lastExercises.length > 0) {
            setExercises(lastExercises.map((ex, i) => ({ ...ex, id: i + 1 })));
            toast.success('前回のメニューをコピーしました');
        }
    };

    const addRow = () => {
        const newId = Math.max(...exercises.map(e => e.id)) + 1;
        setExercises([...exercises, { id: newId, menuName: '', weight: '', reps: '', sets: '' }]);
    };

    const removeRow = (id: number) => {
        if (exercises.length > 1) {
            setExercises(exercises.filter(e => e.id !== id));
        }
    };

    const updateRow = (id: number, field: keyof ExerciseRow, value: string) => {
        setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validExercises = exercises.filter(ex => ex.menuName.trim());
        if (validExercises.length === 0) {
            toast.error('種目を1つ以上入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            const inserts = validExercises.map(ex => ({
                client_id: clientId,
                date,
                menu_name: ex.menuName.trim(),
                weight: ex.weight ? parseFloat(ex.weight) : null,
                reps: ex.reps ? parseInt(ex.reps) : null,
                sets: ex.sets ? parseInt(ex.sets) : null,
                notes: notes.trim() || null,
            }));

            const { error } = await supabase.from('training_logs').insert(inserts);

            if (error) throw error;

            toast.success(`${validExercises.length}件のログを保存しました`);
            // Update last exercises for next copy
            setLastExercises(validExercises);
            // Reset form
            setExercises([{ id: 1, menuName: '', weight: '', reps: '', sets: '' }]);
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
                        {lastExercises.length > 0 && (
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

                    {/* Exercise Rows */}
                    <div className="space-y-2">
                        {exercises.map((row, index) => (
                            <div key={row.id} className="grid grid-cols-12 gap-1 items-end">
                                <div className="col-span-4">
                                    {index === 0 && <Label className="text-xs">種目</Label>}
                                    <Input
                                        placeholder="プルダウン"
                                        value={row.menuName}
                                        onChange={(e) => updateRow(row.id, 'menuName', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    {index === 0 && <Label className="text-xs">重量</Label>}
                                    <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="kg"
                                        value={row.weight}
                                        onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    {index === 0 && <Label className="text-xs">回数</Label>}
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        value={row.reps}
                                        onChange={(e) => updateRow(row.id, 'reps', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    {index === 0 && <Label className="text-xs">セット</Label>}
                                    <Input
                                        type="number"
                                        placeholder="3"
                                        value={row.sets}
                                        onChange={(e) => updateRow(row.id, 'sets', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    {exercises.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-[#ef4444]"
                                            onClick={() => removeRow(row.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addRow}
                            className="w-full text-[#2563eb] hover:text-[#1d4ed8]"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            行を追加
                        </Button>
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
                        ログを保存
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
