"use server"

import { supabase } from './supabaseClient';

export interface ChurnRiskClient {
    id: string;
    name: string;
    riskType: 'interval_stretch' | 'cancellation' | 'ticket_depletion';
    riskLevel: 'high' | 'medium';
    riskReason: string;
    lastVisit: string | null;
    ticketsRemaining: number;
    daysSinceLastVisit: number | null;
}

/**
 * Calculate average visit interval for a client based on session history
 */
async function calculateAverageInterval(clientId: string): Promise<number | null> {
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('scheduled_at')
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: true });

    if (error || !sessions || sessions.length < 2) {
        return null; // Not enough data
    }

    let totalIntervalDays = 0;
    for (let i = 1; i < sessions.length; i++) {
        const prev = new Date(sessions[i - 1].scheduled_at);
        const curr = new Date(sessions[i].scheduled_at);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        totalIntervalDays += diffDays;
    }

    return totalIntervalDays / (sessions.length - 1);
}

/**
 * Check if client has future bookings
 */
async function hasFutureBooking(clientId: string): Promise<boolean> {
    const today = new Date().toISOString();
    const { data, error } = await supabase
        .from('sessions')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', today)
        .limit(1);

    return !error && data && data.length > 0;
}

/**
 * Count recent cancellations (last 3 bookings)
 */
async function getRecentCancellationCount(clientId: string): Promise<number> {
    const { data, error } = await supabase
        .from('sessions')
        .select('status')
        .eq('client_id', clientId)
        .order('scheduled_at', { ascending: false })
        .limit(3);

    if (error || !data) return 0;

    return data.filter(s => s.status === 'cancelled').length;
}

/**
 * Get all clients at risk of churning
 */
export async function getChurnRiskClients(): Promise<ChurnRiskClient[]> {
    const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, last_visit, tickets_remaining');

    if (error || !clients) {
        console.error('Error fetching clients:', error);
        return [];
    }

    const riskClients: ChurnRiskClient[] = [];
    const today = new Date();

    for (const client of clients) {
        const daysSinceLastVisit = client.last_visit
            ? Math.floor((today.getTime() - new Date(client.last_visit).getTime()) / (1000 * 60 * 60 * 24))
            : null;

        // Logic A: Visit Interval Stretch
        if (client.last_visit) {
            const avgInterval = await calculateAverageInterval(client.id);
            const threshold = avgInterval ? avgInterval * 1.5 : 14; // Default 14 days if no history

            if (daysSinceLastVisit && daysSinceLastVisit > threshold) {
                riskClients.push({
                    id: client.id,
                    name: client.name,
                    riskType: 'interval_stretch',
                    riskLevel: daysSinceLastVisit > threshold * 2 ? 'high' : 'medium',
                    riskReason: `最終来店から${daysSinceLastVisit}日経過`,
                    lastVisit: client.last_visit,
                    ticketsRemaining: client.tickets_remaining,
                    daysSinceLastVisit,
                });
                continue; // Skip other checks if already flagged
            }
        }

        // Logic B: Cancellation Frequency
        const cancellationCount = await getRecentCancellationCount(client.id);
        if (cancellationCount >= 2) {
            riskClients.push({
                id: client.id,
                name: client.name,
                riskType: 'cancellation',
                riskLevel: 'medium',
                riskReason: `直近3回中${cancellationCount}回キャンセル`,
                lastVisit: client.last_visit,
                ticketsRemaining: client.tickets_remaining,
                daysSinceLastVisit,
            });
            continue;
        }

        // Logic C: Ticket Depletion
        if (client.tickets_remaining <= 1) {
            const hasFuture = await hasFutureBooking(client.id);
            if (!hasFuture) {
                riskClients.push({
                    id: client.id,
                    name: client.name,
                    riskType: 'ticket_depletion',
                    riskLevel: client.tickets_remaining === 0 ? 'high' : 'medium',
                    riskReason: `残りチケット${client.tickets_remaining}回 / 次回予約なし`,
                    lastVisit: client.last_visit,
                    ticketsRemaining: client.tickets_remaining,
                    daysSinceLastVisit,
                });
            }
        }
    }

    // Sort by risk level (high first)
    return riskClients.sort((a, b) => {
        if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
        if (a.riskLevel !== 'high' && b.riskLevel === 'high') return 1;
        return 0;
    });
}
