"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface StatusChangeDialogProps {
    clientId: string;
    clientName: string;
    currentStatus: string;
    onStatusChanged: () => void;
    onClose: () => void;
}

const LOST_REASONS = [
    { value: 'price', label: '料金が高い' },
    { value: 'schedule', label: '時間が合わない' },
    { value: 'competitor', label: '他ジムに決めた' },
    { value: 'considering', label: '検討中' },
    { value: 'other', label: 'その他' },
];

export default function StatusChangeDialog({
    clientId,
    clientName,
    currentStatus,
    onStatusChanged,
    onClose,
}: StatusChangeDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<'member' | 'lost' | null>(null);
    const [lostReason, setLostReason] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedStatus) return;
        if (selectedStatus === 'lost' && !lostReason) {
            toast.error('失注理由を選択してください');
            return;
        }

        setLoading(true);
        try {
            const updateData: Record<string, any> = { status: selectedStatus };

            if (selectedStatus === 'member') {
                updateData.joined_at = new Date().toISOString();
                updateData.lost_reason = null;
            } else if (selectedStatus === 'lost') {
                updateData.lost_reason = lostReason;
            }

            const { error } = await supabase
                .from('clients')
                .update(updateData)
                .eq('id', clientId);

            if (error) throw error;

            toast.success(
                selectedStatus === 'member'
                    ? `${clientName}さんが入会しました！🎉`
                    : `${clientName}さんを失注に変更しました`
            );
            onStatusChanged();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('ステータスの変更に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus !== 'trial') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                    <p className="text-center text-[#64748b]">
                        ステータス変更は「体験」状態の方のみ可能です
                    </p>
                    <Button onClick={onClose} className="w-full mt-4">
                        閉じる
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
                <h2 className="text-lg font-bold text-center">
                    {clientName}さんのステータス変更
                </h2>

                {!selectedStatus ? (
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="h-24 flex-col gap-2 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white"
                            onClick={() => setSelectedStatus('member')}
                        >
                            <UserCheck className="w-8 h-8" />
                            入会
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex-col gap-2 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
                            onClick={() => setSelectedStatus('lost')}
                        >
                            <UserX className="w-8 h-8" />
                            失注
                        </Button>
                    </div>
                ) : selectedStatus === 'lost' ? (
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">失注理由を選択</Label>
                        <RadioGroup value={lostReason} onValueChange={setLostReason}>
                            {LOST_REASONS.map((reason) => (
                                <div key={reason.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f1f5f9]">
                                    <RadioGroupItem value={reason.value} id={reason.value} />
                                    <Label htmlFor={reason.value} className="flex-1 cursor-pointer">
                                        {reason.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => setSelectedStatus(null)}>
                                戻る
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !lostReason}
                                className="bg-[#ef4444]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '確定'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-[#64748b]">
                            {clientName}さんを入会に変更しますか？
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => setSelectedStatus(null)}>
                                戻る
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-[#10b981]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '入会確定'}
                            </Button>
                        </div>
                    </div>
                )}

                <Button variant="ghost" onClick={onClose} className="w-full">
                    キャンセル
                </Button>
            </div>
        </div>
    );
}
