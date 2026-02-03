import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthISO = startOfMonth.toISOString();

        // Get all clients created this month (体験申込数)
        const { data: allClients, error: allError } = await supabase
            .from('clients')
            .select('id, status, lost_reason, created_at, joined_at')
            .gte('created_at', startOfMonthISO);

        if (allError) throw allError;

        const clients = allClients || [];

        // Calculate metrics
        const trialCount = clients.filter(c => c.status === 'trial').length;
        const memberCount = clients.filter(c => c.status === 'member').length;
        const lostCount = clients.filter(c => c.status === 'lost').length;
        const totalLeads = clients.length;

        // CVR = (Members / Total Leads) * 100
        const cvr = totalLeads > 0 ? Math.round((memberCount / totalLeads) * 100) : 0;

        // Lost reasons breakdown
        const lostClients = clients.filter(c => c.status === 'lost' && c.lost_reason);
        const lostReasons = {
            price: lostClients.filter(c => c.lost_reason === 'price').length,
            schedule: lostClients.filter(c => c.lost_reason === 'schedule').length,
            competitor: lostClients.filter(c => c.lost_reason === 'competitor').length,
            considering: lostClients.filter(c => c.lost_reason === 'considering').length,
            other: lostClients.filter(c => c.lost_reason === 'other').length,
        };

        // Rule-based advice (no API cost)
        const advice: string[] = [];

        if (totalLeads < 3) {
            advice.push('体験申込が少なめです。SNS発信やWeb広告を検討しましょう');
        }

        if (cvr < 30 && totalLeads >= 3) {
            advice.push('入会率が低めです。体験後のフォローを強化しましょう');
        }

        if (lostReasons.price > lostReasons.schedule && lostReasons.price > 0) {
            advice.push('「料金」が失注理由の上位です。短期プランや分割払いを検討しましょう');
        }

        if (lostReasons.considering > 0) {
            advice.push('「検討中」の方がいます。フォローLINEを送りましょう');
        }

        if (cvr >= 70 && totalLeads >= 3) {
            advice.push('入会率は好調です！集客を増やせばさらに成長できます');
        }

        return NextResponse.json({
            metrics: {
                trialCount,
                memberCount,
                lostCount,
                totalLeads,
                cvr,
            },
            lostReasons,
            advice,
            period: {
                start: startOfMonthISO,
                end: now.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching funnel data:', error);
        return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
    }
}
