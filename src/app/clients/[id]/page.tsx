"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { uploadClientPhoto } from '@/lib/supabaseStorage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Camera, Utensils, Upload, Sparkles, LineChart, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import PhotoCompareSlider from '@/components/PhotoCompareSlider';
import PlanDisplay from '@/components/PlanDisplay';
import ProgressChart from '@/components/ProgressChart';
import BodyCompositionInput from '@/components/BodyCompositionInput';
import TrainingLogInput from '@/components/TrainingLogInput';
import TrainingLogList from '@/components/TrainingLogList';
import type { PlanResult } from '@/app/plan/page';

interface Client {
    id: string;
    name: string;
    current_weight: number;
    target_weight: number;
    tickets_remaining: number;
    notes: string;
    before_photo_url?: string;
    after_photo_url?: string;
}

type Tab = 'info' | 'photos' | 'meals' | 'plans' | 'progress' | 'logs';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [uploading, setUploading] = useState(false);
    const [plan, setPlan] = useState<PlanResult | null>(null);
    const [trainingLogs, setTrainingLogs] = useState<any[]>([]);
    const [bodyCompLogs, setBodyCompLogs] = useState<any[]>([]);

    const fetchClientAndData = async () => {
        // Fetch Client
        const { data: clientData, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (error) {
            console.error(error);
            toast.error('生徒情報の取得に失敗しました');
        } else {
            setClient(clientData);
        }

        // Fetch Plan
        const { data: planData } = await supabase
            .from('plans')
            .select('data')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (planData) {
            setPlan(planData.data);
        }

        // Fetch Training Logs
        const { data: tLogs } = await supabase
            .from('training_logs')
            .select('*')
            .eq('client_id', clientId)
            .order('date', { ascending: false });
        if (tLogs) setTrainingLogs(tLogs);

        // Fetch Body Composition Logs
        const { data: bLogs } = await supabase
            .from('body_composition_logs')
            .select('*')
            .eq('client_id', clientId)
            .order('date', { ascending: true });
        if (bLogs) setBodyCompLogs(bLogs);

        setLoading(false);
    };

    useEffect(() => {
        fetchClientAndData();
    }, [clientId]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (!file || !client) return;

        setUploading(true);
        const url = await uploadClientPhoto(client.id, file, type);

        if (url) {
            const column = type === 'before' ? 'before_photo_url' : 'after_photo_url';
            const { error } = await supabase
                .from('clients')
                .update({ [column]: url })
                .eq('id', client.id);

            if (error) {
                toast.error('写真の保存に失敗しました');
            } else {
                setClient({ ...client, [column]: url });
                toast.success(`${type === 'before' ? '入会時' : '現在'}の写真を登録しました`);
            }
        } else {
            toast.error('アップロードに失敗しました');
        }
        setUploading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-4 text-center">
                <p>生徒が見つかりません</p>
                <Button onClick={() => router.back()} className="mt-4">戻る</Button>
            </div>
        );
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'info', label: '基本', icon: <User className="w-4 h-4" /> },
        { id: 'progress', label: '推移', icon: <LineChart className="w-4 h-4" /> },
        { id: 'logs', label: '実績', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'plans', label: 'プラン', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'photos', label: '写真', icon: <Camera className="w-4 h-4" /> },
        { id: 'meals', label: '食事', icon: <Utensils className="w-4 h-4" /> },
    ];

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">{client.name}</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        {tab.icon}
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#64748b]">現在体重</p>
                                <p className="text-lg font-bold">{client.current_weight} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#64748b]">目標体重</p>
                                <p className="text-lg font-bold text-[#2563eb]">{client.target_weight} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#64748b]">残りチケット</p>
                                <p className="text-lg font-bold">{client.tickets_remaining} 枚</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#64748b]">あと</p>
                                <p className="text-lg font-bold text-[#10b981]">
                                    -{(client.current_weight - client.target_weight).toFixed(1)} kg
                                </p>
                            </div>
                        </div>
                        {client.notes && (
                            <div>
                                <p className="text-sm text-[#64748b]">メモ</p>
                                <p className="mt-1">{client.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'progress' && (
                <div className="space-y-6">
                    <ProgressChart data={bodyCompLogs} />
                    <BodyCompositionInput clientId={clientId} onAdded={fetchClientAndData} />
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <TrainingLogInput clientId={clientId} onAdded={fetchClientAndData} />
                    <TrainingLogList logs={trainingLogs} />
                </div>
            )}

            {activeTab === 'plans' && (
                plan ? (
                    <PlanDisplay plan={plan} />
                ) : (
                    <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 mx-auto text-[#9ca3af] mb-4" />
                        <p className="text-[#64748b] mb-4">保存されたプランはありません</p>
                        <Button
                            onClick={() => router.push(`/plan`)}
                            variant="outline"
                        >
                            新しく作成する
                        </Button>
                    </div>
                )
            )}

            {activeTab === 'photos' && (
                <div className="space-y-4">
                    {client.before_photo_url && client.after_photo_url ? (
                        <PhotoCompareSlider
                            beforeImage={client.before_photo_url}
                            afterImage={client.after_photo_url}
                        />
                    ) : (
                        <Card className="p-6 text-center">
                            <Camera className="w-12 h-12 mx-auto text-[#9ca3af] mb-4" />
                            <p className="text-[#64748b] mb-4">
                                入会時と現在の写真を登録すると<br />比較スライダーが表示されます
                            </p>
                        </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block">
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-4 text-center cursor-pointer hover:border-[#2563eb] transition-colors">
                                    {client.before_photo_url ? (
                                        <img
                                            src={client.before_photo_url}
                                            alt="入会時"
                                            className="w-full h-32 object-cover rounded mb-2"
                                        />
                                    ) : (
                                        <Upload className="w-8 h-8 mx-auto text-[#9ca3af] mb-2" />
                                    )}
                                    <p className="text-sm font-medium">入会時の写真</p>
                                    <p className="text-xs text-[#9ca3af]">タップして登録</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(e, 'before')}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block">
                                <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-4 text-center cursor-pointer hover:border-[#2563eb] transition-colors">
                                    {client.after_photo_url ? (
                                        <img
                                            src={client.after_photo_url}
                                            alt="現在"
                                            className="w-full h-32 object-cover rounded mb-2"
                                        />
                                    ) : (
                                        <Upload className="w-8 h-8 mx-auto text-[#9ca3af] mb-2" />
                                    )}
                                    <p className="text-sm font-medium">現在の写真</p>
                                    <p className="text-xs text-[#9ca3af]">タップして登録</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(e, 'after')}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'meals' && (
                <div className="text-center py-8">
                    <Utensils className="w-12 h-12 mx-auto text-[#9ca3af] mb-4" />
                    <p className="text-[#64748b] mb-4">食事管理機能</p>
                    <Button
                        onClick={() => router.push(`/clients/${clientId}/meals`)}
                        className="bg-[#2563eb]"
                    >
                        食事を登録する
                    </Button>
                </div>
            )}
        </div>
    );
}
