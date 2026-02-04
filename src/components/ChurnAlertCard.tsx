"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, MessageCircle, Loader2, Copy, Check, ChevronRight, RefreshCw, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChurnRiskClient {
    id: string;
    name: string;
    riskType: 'interval_stretch' | 'cancellation' | 'ticket_depletion';
    riskLevel: 'high' | 'medium';
    riskReason: string;
    lastVisit: string | null;
    ticketsRemaining: number;
    daysSinceLastVisit: number | null;
    notes: string | null;
}

export default function ChurnAlertCard() {
    const router = useRouter();
    const [clients, setClients] = useState<ChurnRiskClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);
    const [generatedMessage, setGeneratedMessage] = useState<{ [key: string]: string }>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchChurnAlerts();
    }, []);

    const fetchChurnAlerts = async () => {
        try {
            const res = await fetch('/api/churn-alerts');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setClients(data.clients || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMessage = async (client: ChurnRiskClient) => {
        setGeneratingMessage(client.id);
        try {
            const res = await fetch('/api/generate-followup-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: client.name,
                    riskType: client.riskType,
                    riskReason: client.riskReason,
                    daysSinceLastVisit: client.daysSinceLastVisit,
                    notes: client.notes,  // トレーナーメモを追加
                }),
            });

            if (!res.ok) throw new Error('Failed to generate');
            const data = await res.json();
            setGeneratedMessage(prev => ({ ...prev, [client.id]: data.message }));
            toast.success('メッセージを生成しました');
        } catch (error) {
            console.error(error);
            toast.error('メッセージの生成に失敗しました');
        } finally {
            setGeneratingMessage(null);
        }
    };

    const handleMessageChange = (clientId: string, newMessage: string) => {
        setGeneratedMessage(prev => ({ ...prev, [clientId]: newMessage }));
    };

    const handleCopyMessage = async (clientId: string, message: string) => {
        try {
            await navigator.clipboard.writeText(message);
            setCopiedId(clientId);
            toast.success('コピーしました');
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error('コピーに失敗しました');
        }
    };

    const getRiskIcon = (riskType: string) => {
        switch (riskType) {
            case 'interval_stretch': return '⏰';
            case 'cancellation': return '❌';
            case 'ticket_depletion': return '🎟️';
            default: return '⚠️';
        }
    };

    if (loading) {
        return (
            <Card className="border-[#fbbf24] bg-[#fffbeb]">
                <CardContent className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-[#f59e0b]" />
                </CardContent>
            </Card>
        );
    }

    if (clients.length === 0) {
        return null;
    }

    return (
        <Card className="border-[#fbbf24] bg-[#fffbeb]">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-[#92400e]">
                    <AlertTriangle className="w-5 h-5" />
                    要フォロー
                    <Badge variant="destructive" className="ml-2">{clients.length}名</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {clients.slice(0, 3).map((client) => (
                    <div key={client.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span>{getRiskIcon(client.riskType)}</span>
                                <span className="font-bold">{client.name}</span>
                                {client.riskLevel === 'high' && (
                                    <Badge variant="destructive" className="text-[10px]">緊急</Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => router.push(`/clients/${client.id}`)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-[#64748b] mb-2">{client.riskReason}</p>

                        {generatedMessage[client.id] ? (
                            <div className="bg-[#f1f5f9] rounded-lg p-3 space-y-2">
                                {editingId === client.id ? (
                                    <Textarea
                                        value={generatedMessage[client.id]}
                                        onChange={(e) => handleMessageChange(client.id, e.target.value)}
                                        className="min-h-[100px] text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap">{generatedMessage[client.id]}</p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setEditingId(editingId === client.id ? null : client.id)}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" />
                                        {editingId === client.id ? '完了' : '編集'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleCopyMessage(client.id, generatedMessage[client.id])}
                                    >
                                        {copiedId === client.id ? (
                                            <><Check className="w-4 h-4 mr-1" />コピー済み</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-1" />コピー</>
                                        )}
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-[#64748b]"
                                    onClick={() => handleGenerateMessage(client)}
                                    disabled={generatingMessage === client.id}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${generatingMessage === client.id ? 'animate-spin' : ''}`} />
                                    再生成
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-[#2563eb] text-[#2563eb]"
                                onClick={() => handleGenerateMessage(client)}
                                disabled={generatingMessage === client.id}
                            >
                                {generatingMessage === client.id ? (
                                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" />生成中...</>
                                ) : (
                                    <><MessageCircle className="w-4 h-4 mr-1" />LINEメッセージを作成</>
                                )}
                            </Button>
                        )}
                    </div>
                ))}

                {clients.length > 3 && (
                    <p className="text-center text-sm text-[#64748b]">
                        他 {clients.length - 3}名...
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
