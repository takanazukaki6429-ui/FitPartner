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

export default function TrainingLogInput({ clientId, onAdded }: TrainingLogInputProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [menu, setMenu] = useState('');
    const [notes, setNotes] = useState('');
    const [lastMenu, setLastMenu] = useState<string | null>(null);

    // Fetch last session's menu for copy feature
    useEffect(() => {
        const fetchLastMenu = async () => {
            const { data } = await supabase
                .from('training_logs')
                .select('menu_name')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (data?.menu_name) {
                setLastMenu(data.menu_name);
            }
        };
        fetchLastMenu();
    }, [clientId]);

    const handleCopyLastMenu = () => {
        if (lastMenu) {
            setMenu(lastMenu);
            toast.success('前回のメニューをコピーしました');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!menu.trim()) {
            toast.error('メニューを入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('training_logs').insert({
                client_id: clientId,
                date,
                menu_name: menu.trim(),
                notes: notes.trim() || null,
            });

            if (error) throw error;

            toast.success('ログを保存しました');
            setMenu('');
            setNotes('');
            setLastMenu(menu.trim()); // Update last menu for next copy
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
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="t_date">日付</Label>
                            <Input
                                id="t_date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        {lastMenu && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopyLastMenu}
                                className="h-10 whitespace-nowrap"
                            >
                                <Copy className="w-4 h-4 mr-1" />
                                前回コピー
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="menu">今日のメニュー</Label>
                        <Textarea
                            id="menu"
                            placeholder="スクワット 60kg×10×3
ベンチプレス 40kg×10×3
ラットプルダウン 35kg×12×3"
                            value={menu}
                            onChange={(e) => setMenu(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">メモ（任意）</Label>
                        <Textarea
                            id="notes"
                            placeholder="腰が重いとのこと。ストレッチ多め..."
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
