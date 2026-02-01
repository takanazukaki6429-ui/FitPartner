const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ API Key not found in .env.local");
        return;
    }
    console.log("🔑 API Key found:", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-1.5-flash';

    console.log(`🤖 Testing model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("✅ Success! Response:", text);
    } catch (error) {
        console.error("❌ Error details:");
        console.error(error);
    }
}

run();
