import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Gemini API key not configured' },
            { status: 500 }
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const { clientName, riskType, riskReason, daysSinceLastVisit } = await request.json();

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let context = '';
        switch (riskType) {
            case 'interval_stretch':
                context = `このクライアントは${daysSinceLastVisit}日間来店していません。忙しいのかもしれません。`;
                break;
            case 'cancellation':
                context = `このクライアントは最近キャンセルが増えています。モチベーションが下がっているかもしれません。`;
                break;
            case 'ticket_depletion':
                context = `このクライアントはチケットが残り少なく、次回予約がありません。継続を促す必要があります。`;
                break;
        }

        const prompt = `あなたはパーソナルトレーナーです。以下のクライアントに送るLINEメッセージを作成してください。

【クライアント】
- 名前: ${clientName}さん
- 状況: ${riskReason}
- 背景: ${context}

【メッセージのポイント】
- フレンドリーで押しつけがましくない
- 相手を気遣う言葉から始める
- 軽く?戻ってくるきっかけを提示する
- 絵文字は控えめに（1-2個まで）
- 100文字以内

メッセージ本文のみを出力してください。`;

        const result = await model.generateContent(prompt);
        const message = result.response.text().trim();

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error generating followup message:', error);
        return NextResponse.json(
            { error: 'Failed to generate message' },
            { status: 500 }
        );
    }
}
