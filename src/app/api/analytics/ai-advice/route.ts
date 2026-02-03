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
        const { metrics, lostReasons } = await request.json();

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `あなたはパーソナルジム経営のコンサルタントです。以下のデータを分析し、具体的な改善アドバイスを3つ提案してください。

【今月の実績】
- 体験申込数: ${metrics.totalLeads}件
- 入会数: ${metrics.memberCount}件
- 失注数: ${metrics.lostCount}件
- 入会率(CVR): ${metrics.cvr}%

【失注理由の内訳】
- 料金が高い: ${lostReasons.price}件
- 時間が合わない: ${lostReasons.schedule}件
- 他ジムに決めた: ${lostReasons.competitor}件
- 検討中: ${lostReasons.considering}件
- その他: ${lostReasons.other}件

【回答ルール】
- 経営知識のない個人トレーナー向けに、分かりやすく具体的に
- 今すぐ実行できるアクションを提案
- 業界のベンチマーク（CVR目標50-70%、月体験10件など）と比較
- 各アドバイスは50文字以内で簡潔に

JSON形式で回答してください：
{
  "overall": "全体評価（20文字以内）",
  "advices": [
    {"title": "タイトル", "action": "具体的なアクション"},
    {"title": "タイトル", "action": "具体的なアクション"},
    {"title": "タイトル", "action": "具体的なアクション"}
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const advice = JSON.parse(jsonMatch[0]);
        return NextResponse.json(advice);
    } catch (error) {
        console.error('Error generating AI advice:', error);
        return NextResponse.json(
            { error: 'Failed to generate advice' },
            { status: 500 }
        );
    }
}
