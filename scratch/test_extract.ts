import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No API key');
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Extract details from Form 16 text. Gross Salary: Rs. 15,00,000, Employee: Rajesh Kumar, PAN: ABCDE1234F',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: { type: Type.STRING },
            pan: { type: Type.STRING },
            grossSalary: { type: Type.INTEGER }
          },
          required: ['grossSalary']
        }
      }
    });
    console.log('Response:', response.text);
  } catch (err: any) {
    console.log('Error:', err.message || err);
  }
}

test();
