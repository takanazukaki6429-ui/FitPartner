"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface ClientEditDialogProps {
    client: {
        id: string;
        name: string;
        current_weight: number;
        target_weight: number;
        tickets_remaining: number;
        notes: string;
    };
    onSaved: () => void;
    onClose: () => void;
}

export default function ClientEditDialog({ client, onSaved, onClose }: ClientEditDialogProps) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: client.name || '',
        current_weight: client.current_weight || 0,
        target_weight: client.target_weight || 0,
        tickets_remaining: client.tickets_remaining || 0,
        notes: client.notes || '',
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('名前を入力してください');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('clients')
                .update({
                    name: formData.name.trim(),
                    current_weight: Number(formData.current_weight),
                    target_weight: Number(formData.target_weight),
                    tickets_remaining: Number(formData.tickets_remaining),
                    notes: formData.notes.trim(),
                })
                .eq('id', client.id);

            if (error) throw error;

            toast.success('保存しました');
            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">クライアント編集</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-4">
                    <div>
                        <Label htmlFor="name">名前</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="田中 太郎"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="current_weight">現在体重 (kg)</Label>
                            <Input
                                id="current_weight"
                                type="number"
                                step="0.1"
                                value={formData.current_weight}
                                onChange={(e) => handleChange('current_weight', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="target_weight">目標体重 (kg)</Label>
                            <Input
                                id="target_weight"
                                type="number"
                                step="0.1"
                                value={formData.target_weight}
                                onChange={(e) => handleChange('target_weight', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="tickets_remaining">残りチケット</Label>
                        <Input
                            id="tickets_remaining"
                            type="number"
                            value={formData.tickets_remaining}
                            onChange={(e) => handleChange('tickets_remaining', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">メモ</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="クライアントに関するメモ..."
                            rows={4}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button
                        className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8]"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />保存中...</>
                        ) : (
                            '保存'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
