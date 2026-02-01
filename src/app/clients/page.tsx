"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Search, UserCircle2, ChevronRight, Plus } from "lucide-react";

interface Client {
    id: string;
    name: string;
    tickets_remaining: number;
    last_visit: string | null;
}

export default function ClientsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name, tickets_remaining, last_visit')
                .order('name', { ascending: true });

            if (error) {
                console.error(error);
            } else if (data) {
                setClients(data);
            }
            setLoading(false);
        };

        fetchClients();
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#9ca3af]" />
                    <Input
                        placeholder="名前で検索..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="icon" className="shrink-0" onClick={() => router.push('/clients/new')}>
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="space-y-3 pb-20">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
                    </div>
                ) : (
                    filteredClients.map((client) => {
                        const isZeroTickets = client.tickets_remaining === 0;

                        return (
                            <Card
                                key={client.id}
                                className="active:scale-[0.99] transition-transform cursor-pointer"
                                onClick={() => router.push(`/clients/${client.id}`)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#9ca3af]">
                                        <UserCircle2 className="w-8 h-8" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-base truncate">{client.name}</h3>
                                            {isZeroTickets && (
                                                <Badge variant="destructive" className="text-[10px]">要更新</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[#64748b] mt-1">
                                            <span className="flex items-center gap-1">
                                                残: <span className={isZeroTickets ? "text-[#ef4444] font-bold" : "font-medium"}>{client.tickets_remaining}</span>
                                            </span>
                                            <span>•</span>
                                            <span>{client.last_visit ? `${client.last_visit} 来店` : '来店なし'}</span>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-[#d1d5db]" />
                                </CardContent>
                            </Card>
                        );
                    })
                )}

                {!loading && filteredClients.length === 0 && (
                    <p className="text-center text-[#9ca3af] py-10">該当する生徒はいません</p>
                )}
            </div>
        </div>
    );
}
