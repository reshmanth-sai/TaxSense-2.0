import { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { generateContentWithRetryAndFallback, mapError, logStructured } from '../services/ai/googleClient.ts';
import crypto from 'crypto';

// In-memory cache for news (warm lambdas will share this cache)
let cachedNews: any[] | null = null;
let lastNewsFetchTime = 0;
const CACHE_DURATION_MS = 3600000; // 1 hour

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  const startTime = Date.now();

  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const now = Date.now();
    if (cachedNews && (now - lastNewsFetchTime < CACHE_DURATION_MS)) {
      logStructured('info', 'Serving finance news from in-memory cache', {
        requestId,
        correlationId,
        endpoint: 'finance-news',
        latencyMs: Date.now() - startTime,
      });
      res.status(200).json({ success: true, news: cachedNews });
      return;
    }

    logStructured('info', 'Generating latest finance news using Gemini...', {
      requestId,
      correlationId,
      endpoint: 'finance-news',
    });

    const response = await generateContentWithRetryAndFallback({
      contents: `Generate 6 current, accurate Indian income tax and personal finance news items for FY 2025-26 / AY 2026-27. Each must be a single factual sentence under 120 characters. Topics should rotate between: tax saving tips, ITR deadlines, budget updates, deduction limits, capital gains rules, and TDS rules. Return ONLY a JSON array: [{ id: '1', category: 'TAX SAVING', text: '...', topic: '...' }]. Categories must be one of: TAX SAVING, BUDGET, MARKETS, HRA, SENIORS, SYSTEM, DEADLINE.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, description: 'Must be one of: TAX SAVING, BUDGET, MARKETS, HRA, SENIORS, SYSTEM, DEADLINE' },
              text: { type: Type.STRING, description: 'A single factual sentence under 120 characters' },
              topic: { type: Type.STRING, description: 'Short keyword/topic suitable for searching' }
            },
            required: ['id', 'category', 'text', 'topic']
          }
        }
      },
      requestId,
      correlationId,
    });

    const responseText = response.text?.trim() || '[]';
    const newsArray = JSON.parse(responseText);

    if (Array.isArray(newsArray) && newsArray.length > 0) {
      cachedNews = newsArray;
      lastNewsFetchTime = now;
      
      logStructured('info', 'Successfully generated and cached finance news', {
        requestId,
        correlationId,
        endpoint: 'finance-news',
        latencyMs: Date.now() - startTime,
      });

      res.status(200).json({ success: true, news: newsArray });
    } else {
      throw new Error('Gemini returned an empty or invalid array.');
    }
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const appErr = mapError(error);
    
    logStructured('error', 'Error generating finance news, returning empty list fallback', {
      requestId,
      correlationId,
      endpoint: 'finance-news',
      latencyMs,
      errorCategory: appErr.category,
      errorMessage: error.message || String(error),
      stackTrace: error.stack,
    });

    // We return a graceful success response with empty array so UI does not break
    res.status(200).json({
      success: false,
      news: []
    });
  }
}
