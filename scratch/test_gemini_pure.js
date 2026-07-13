import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey);
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`);
      const res = await ai.models.generateContent({
        model,
        contents: 'Say Hello'
      });
      console.log(`Success with ${model}:`, res.text);
    } catch (err) {
      console.log(`Failed with ${model}:`, err.message || err);
    }
  }
}

test();
