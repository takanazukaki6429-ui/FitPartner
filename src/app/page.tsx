"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, AlertCircle, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ChurnAlertCard from "@/components/ChurnAlertCard";
import { supabase } from "@/lib/supabaseClient";

type SessionWithClient = {
  id: string;
  time: string;
  status: string;
  client: {
    id: string;
    name: string;
    tickets_remaining: number;
    target_weight: number;
    current_weight: number;
  }
};

export default function Home() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<SessionWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch today's appointments
  const fetchData = async () => {
    try {
      setLoading(true);
      // For MVP demo, we fetch ALL sessions for now or filter by date if real usage
      // Here simply fetching all 'scheduled' or 'completed' to show list
      // In production, filtered by today: .gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd)

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          status,
          client:clients (
            id,
            name,
            tickets_remaining,
            target_weight,
            current_weight
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted = data.map((item: any) => {
          const date = new Date(item.scheduled_at);
          const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
          return {
            id: item.id,
            time: timeStr,
            status: item.status,
            client: item.client
          };
        });
        setAppointments(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDigestTicket = async (sessionId: string, clientId: string, currentTickets: number) => {
    if (currentTickets <= 0) return;

    // Optimistic UI Update
    setAppointments(prev => prev.map(apt => {
      if (apt.id === sessionId) {
        return {
          ...apt,
          status: 'completed',
          client: { ...apt.client, tickets_remaining: currentTickets - 1 }
        };
      }
      return apt;
    }));

    try {
      // 1. Update Ticket Count
      const { error: clientError } = await supabase
        .from('clients')
        .update({ tickets_remaining: currentTickets - 1 })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // 2. Mark Session as Completed
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

    } catch (err) {
      console.error("Error updating ticket:", err);
      // Revert optimistic update (simplified: just refetch)
      fetchData();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }


  return (
    <div className="space-y-6">
      {/* Churn Alert Section */}
      <ChurnAlertCard />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            今日の予約
            <Badge variant="secondary" className="rounded-full">{appointments.filter(a => a.status === 'scheduled').length}</Badge>
          </h2>
          <Button size="sm" onClick={() => router.push('/reservations/new')}>
            <Plus className="w-4 h-4 mr-1" />
            予約追加
          </Button>
        </div>

        <div className="space-y-3">
          {appointments.map((apt) => {
            const client = apt.client;
            if (!client) return null;

            const isCompleted = apt.status === 'completed';
            const isZeroTickets = client.tickets_remaining === 0;

            return (
              <Card key={apt.id} className={cn("overflow-hidden transition-all", isCompleted ? "opacity-60 bg-gray-50" : "bg-white border-l-4 border-l-[#2563eb]")}>
                <CardContent className="p-4 flex items-center justify-between">
                  {/* Left: Time & Client Info */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{apt.time}</p>
                    <div className="flex items-center gap-2">
                      <p
                        className="font-bold text-lg text-[#2563eb] cursor-pointer hover:underline"
                        onClick={() => router.push(`/clients/${client.id}`)}
                      >
                        {client.name}
                      </p>
                      {isZeroTickets && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 flex gap-1">
                          <AlertCircle className="w-3 h-3" />
                          更新提案
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      残りチケット: <span className={cn("font-bold", isZeroTickets ? "text-destructive" : "text-primary")}>{client.tickets_remaining}回</span>
                    </p>
                  </div>

                  {/* Right: Action Button (Thumb Zone Friendly) */}
                  <div className="ml-4">
                    {isCompleted ? (
                      <Button variant="ghost" size="icon" disabled className="text-green-600">
                        <CheckCheck className="w-6 h-6" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDigestTicket(apt.id, client.id, client.tickets_remaining)}
                        size="lg"
                        className={cn(
                          "h-14 w-16 shadow-md transition-transform active:scale-95 flex flex-col gap-0 rounded-xl",
                          isZeroTickets ? "bg-[#ef4444] hover:bg-[#dc2626]" : "bg-[#2563eb] hover:bg-[#1d4ed8]"
                        )}
                      >
                        <span className="text-xs font-light opacity-90">消化</span>
                        <span className="text-lg font-bold">-1</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>今日の予約はありません</p>
          </div>
        )}
      </section>

      {/* Quick Stats or Messages could go here */}
      <section className="mt-8 p-4 bg-muted/50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">お知らせ</h3>
        <p className="text-sm text-gray-400">システムメンテナンス予定 (2/15)</p>
      </section>
    </div >
  );
}
