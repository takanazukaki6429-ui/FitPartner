import { NextResponse } from 'next/server';
import { getChurnRiskClients } from '@/lib/churnDetection';

export async function GET() {
    try {
        const riskClients = await getChurnRiskClients();
        return NextResponse.json({ clients: riskClients });
    } catch (error) {
        console.error('Error fetching churn alerts:', error);
        return NextResponse.json({ error: 'Failed to fetch churn alerts' }, { status: 500 });
    }
}
