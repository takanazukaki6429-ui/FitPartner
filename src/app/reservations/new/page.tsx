"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Clock, User, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
    id: string;
    name: string;
}

export default function NewReservationPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('10:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase
                .from('clients')
                .select('id, name')
                .order('name');
            if (data) setClients(data);
        };
        fetchClients();

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    useEffect(() => {
        const client = clients.find(c => c.id === selectedClientId);
        setSelectedClient(client || null);
    }, [selectedClientId, clients]);

    const generateGoogleCalendarUrl = (clientName: string, dateTime: Date) => {
        const startTime = dateTime.toISOString().replace(/-|:|\.\d{3}/g, '');
        const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000) // 1 hour session
            .toISOString().replace(/-|:|\.\d{3}/g, '');

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `【FitPartner】${clientName} セッション`,
            dates: `${startTime}/${endTime}`,
            details: `${clientName}様とのパーソナルトレーニングセッション`,
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId || !date || !time) {
            toast.error('すべての項目を入力してください');
            return;
        }

        setIsSubmitting(true);

        try {
            const scheduledAt = new Date(`${date}T${time}:00`);

            const { error } = await supabase.from('sessions').insert({
                client_id: selectedClientId,
                scheduled_at: scheduledAt.toISOString(),
                status: 'scheduled',
            });

            if (error) throw error;

            // Generate Google Calendar URL
            const url = generateGoogleCalendarUrl(selectedClient!.name, scheduledAt);
            setCalendarUrl(url);

            toast.success('予約を登録しました');
        } catch (error) {
            console.error(error);
            toast.error('登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">予約登録</h1>
            </div>

            {calendarUrl ? (
                <Card>
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-[#10b981] rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">予約を登録しました！</h2>
                        <p className="text-[#64748b]">
                            {selectedClient?.name}様 - {date} {time}
                        </p>
                        <Button
                            onClick={() => window.open(calendarUrl, '_blank')}
                            className="w-full bg-[#4285f4] hover:bg-[#3367d6]"
                            size="lg"
                        >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Googleカレンダーに追加
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/')}
                        >
                            ホームに戻る
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                予約情報
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>生徒を選択</Label>
                                <select
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-[#e2e8f0] bg-white"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        日付
                                    </Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        時間
                                    </Label>
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#2563eb]"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '登録中...' : '予約を登録'}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            )}
        </div>
    );
}
