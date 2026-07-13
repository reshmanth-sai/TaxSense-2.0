import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateContentStreamWithLogging, mapError } from '../services/ai/googleClient.ts';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { messages, systemPrompt } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.write(`data: ${JSON.stringify({ error: 'Conversation messages array is required.' })}\n\n`);
      res.end();
      return;
    }

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    try {
      const responseStream = await generateContentStreamWithLogging({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt || 'You are an AI assistant.',
          temperature: 0.7,
        },
        requestId,
        correlationId,
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (modelError: any) {
      // mapError is applied inside the helper, but if there's any other error we handle it
      const appErr = mapError(modelError);
      res.write(`data: ${JSON.stringify({ error: appErr.message })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }

  } catch (error: any) {
    const appErr = mapError(error);
    res.write(`data: ${JSON.stringify({ error: appErr.message })}\n\n`);
    res.end();
  }
}
