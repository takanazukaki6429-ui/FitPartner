import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        この画像は「InBodyの結果用紙」または「体重計の画面」です。
        画像から以下の数値を読み取り、JSON形式で返してください。
        読み取れない項目は null にしてください。
        
        単位（kg, %など）は除外して数値のみにしてください。

        ### 出力フォーマット (JSONのみ)
        {
          "weight": 数値またはnull,
          "bodyFatPercentage": 数値またはnull,
          "muscleMass": 数値またはnull
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || 'image/jpeg',
                },
            },
        ]);

        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Gemini response:', responseText);
            throw new Error('Failed to parse JSON response');
        }

        const data = JSON.parse(jsonMatch[0]);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in analyze-body-composition:', error);
        return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }
}
