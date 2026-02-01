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
    const data = await request.json();
    const {
      currentWeight,
      targetWeight,
      bodyFatPercentage,
      muscleMass,
      age,
      gender,
      exerciseFrequency,
      dietStyle,
      deadline,
    } = data;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `あなたは経験豊富なパーソナルトレーナーです。以下のクライアント情報をもとに、目標達成のための具体的なプランを作成してください。特に「推奨重量/強度」は、クライアントの筋肉量（${muscleMass}kg）と性別（${gender}）を考慮して、具体的かつ無理のない範囲で提案してください（例：「20kgダンベル」「自重」「マシン30kg」など）。

【クライアント情報】
- 現在体重: ${currentWeight}kg
- 目標体重: ${targetWeight}kg
- 体脂肪率: ${bodyFatPercentage}%
- 筋肉量: ${muscleMass}kg
- 年齢: ${age}歳
- 性別: ${gender}
- 運動頻度: 週${exerciseFrequency}回可能
- 食事スタイル: ${dietStyle}
- 目標期限: ${deadline}

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

{
  "summary": "目標達成の見込み（50文字以内）",
  "weeklyCalorieDeficit": 目標達成に必要な週あたりのカロリー収支（数値、マイナスなら赤字）,
  "trainingPlan": {
    "frequency": "週○回",
    "duration": "1回○分",
    "menu": [
      {"name": "種目名", "weight": "推奨重量/強度（筋肉量を考慮）", "sets": "○セット", "reps": "○回", "purpose": "目的"}
    ]
  },
  "mealPlan": {
    "dailyCalories": 目標摂取カロリー（数値）,
    "protein": タンパク質目標g（数値）,
    "meals": [
      {"timing": "朝食", "example": "具体的なメニュー例", "points": "ポイント"}
    ]
  },
  "weeklyMilestones": [
    {"week": 1, "targetWeight": 目標体重, "focus": "この週の重点"}
  ],
  "adviceForTrainer": "トレーナーへのアドバイス（100文字以内）"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const plan = JSON.parse(jsonMatch[0]);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate plan', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
