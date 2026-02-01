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
        const { imageBase64 } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Extract base64 data and mime type
        const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        const mimeType = matches[1];
        const base64Data = matches[2];

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `あなたはパーソナルトレーナーの食事指導をサポートするAIアシスタントです。
食事の画像を分析し、以下の情報をJSON形式で返してください。JSON以外のテキストは含めないでください。

{
  "calories": 推定カロリー（kcal、数値のみ）,
  "protein": タンパク質量（g、数値のみ）,
  "carbs": 炭水化物量（g、数値のみ）,
  "fat": 脂質量（g、数値のみ）,
  "foods": ["検出した料理名1", "検出した料理名2"],
  "evaluation": "良い" または "普通" または "改善が必要",
  "advice": "トレーナーへの簡潔なアドバイス（50文字以内）",
  "clientMessage": "生徒へ送るメッセージの下書き（100文字以内、励ましを含む）"
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
        ]);

        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse response');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Meal analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze meal' },
            { status: 500 }
        );
    }
}
