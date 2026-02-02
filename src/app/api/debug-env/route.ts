import { NextResponse } from 'next/server';

export async function GET() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json({
        geminiKeyExists: !!geminiKey,
        geminiKeyLength: geminiKey ? geminiKey.length : 0,
        geminiKeyPrefix: geminiKey ? geminiKey.substring(0, 8) + '...' : null,
        supabaseUrlExists: !!supabaseUrl,
        supabaseAnonKeyExists: !!supabaseAnonKey,
        nodeEnv: process.env.NODE_ENV,
    });
}
