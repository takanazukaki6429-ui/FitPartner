"use client"

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_CLIENTS } from "@/lib/mockData";
import { Search, UserCircle2, ChevronRight } from "lucide-react";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = MOCK_CLIENTS.filter(client =>
        client.name.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="名前で検索..."
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {filteredClients.map((client) => {
                    const isZeroTickets = client.ticketsRemaining === 0;

                    return (
                        <Card key={client.id} className="active:scale-[0.99] transition-transform">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <UserCircle2 className="w-8 h-8" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base truncate">{client.name}</h3>
                                        {isZeroTickets && (
                                            <Badge variant="destructive" className="text-[10px]">要更新</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            残: <span className={isZeroTickets ? "text-destructive font-bold" : "text-foreground font-medium"}>{client.ticketsRemaining}</span>
                                        </span>
                                        <span>•</span>
                                        <span>{client.lastVisit ? `${client.lastVisit} 来店` : '来店なし'}</span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredClients.length === 0 && (
                    <p className="text-center text-gray-400 py-10">該当する生徒はいません</p>
                )}
            </div>
        </div>
    );
}
