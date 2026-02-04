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
        const {
            clientName,
            riskType,
            riskReason,
            daysSinceLastVisit,
            notes,           // トレーナーメモ
            bodyTags,        // 身体の悩み・既往歴
            lastTraining     // 前回のトレーニング内容
        } = await request.json();

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // 状況別のターゲット心理
        let targetPsychology = '';
        switch (riskType) {
            case 'interval_stretch':
                targetPsychology = `${daysSinceLastVisit}日間来店がなく、忙しさや生活リズムの変化で運動から遠ざかっている可能性があります。`;
                break;
            case 'cancellation':
                targetPsychology = `最近キャンセルが増えており、モチベーション低下や体調・スケジュールの問題を抱えているかもしれません。`;
                break;
            case 'ticket_depletion':
                targetPsychology = `チケットが残り少なく次回予約もないため、継続への迷いや金銭的な不安がある可能性があります。`;
                break;
        }

        const prompt = `あなたは「顧客一人ひとりの背景を記憶している、ホスピタリティ溢れるパーソナルトレーナー」です。
以下の顧客情報と【共有コンテキスト】を巧みに使い、再来店を促すLINEメッセージを作成してください。

【基本情報】
- 名前: ${clientName} さん
- リスク状態: ${riskReason}
- ターゲット心理: ${targetPsychology}

【共有コンテキスト（最重要：ここから話題を拾ってください）】
- 前回の会話/メモ: "${notes || '特になし'}"
- 身体の悩み: "${bodyTags || '特になし'}"
- 前回のメニュー: "${lastTraining || '記録なし'}"

【メッセージ作成ルール】
1. **「記憶」への言及**:
   - 共有コンテキストの内容（「腰の調子」や「お仕事の話」など）をさりげなく文中に混ぜてください。
   - ※「メモに書いてあったのですが」とは言わず、自然に会話の一部として出してください。

2. **「逃げ道」と「提案」**:
   - 相手の状況（忙しい、怪我など）に合わせて、「ストレッチメインで」「30分だけ」などハードルを下げて提案してください。

3. **トーン＆マナー**:
   - 親しみやすく、短く（120文字以内）、返信不要の気遣いを入れる。

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
