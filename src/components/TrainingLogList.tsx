"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, MessageSquare } from 'lucide-react';

interface TrainingLog {
    id: string;
    date: string;
    menu_name: string;
    notes?: string;
}

interface TrainingLogListProps {
    logs: TrainingLog[];
}

export default function TrainingLogList({ logs }: TrainingLogListProps) {
    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-[#9ca3af]">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>まだ記録がありません</p>
            </div>
        );
    }

    // Group logs by date
    const groupedLogs = logs.reduce((acc, log) => {
        const date = log.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, TrainingLog[]>);

    // Sort dates descending
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="space-y-6">
            {sortedDates.map(date => (
                <div key={date}>
                    <div className="flex items-center gap-2 mb-2 text-[#64748b] bg-[#f1f5f9] px-3 py-1 rounded-full w-fit">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{new Date(date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="space-y-3 pl-2">
                        {groupedLogs[date].map(log => (
                            <Card key={log.id} className="border-l-4 border-l-[#2563eb]">
                                <CardContent className="p-4">
                                    {/* Menu */}
                                    <div className="flex items-start gap-2">
                                        <Dumbbell className="w-4 h-4 mt-1 text-[#2563eb] flex-shrink-0" />
                                        <p className="whitespace-pre-wrap text-[#0f172a]">{log.menu_name}</p>
                                    </div>

                                    {/* Notes */}
                                    {log.notes && (
                                        <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                                            <div className="flex items-start gap-2 text-sm text-[#64748b]">
                                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <p className="whitespace-pre-wrap">{log.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
