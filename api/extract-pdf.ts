import { VercelRequest, VercelResponse } from '@vercel/node';
import Multer from 'multer';
import { getAI, mapError, logStructured } from '../services/ai/googleClient.ts';
import crypto from 'crypto';

const upload = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // Disables standard body parsing so multer can handle multipart stream
  },
};

export default async function handler(req: any, res: any) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    logStructured('info', `PDF received. File size: ${req.file.size} bytes`, {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
    });

    const base64Data = req.file.buffer.toString('base64');
    const ai = getAI();

    logStructured('info', 'Sending PDF buffer to Gemini for extraction...', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: 'gemini-2.5-flash',
    });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf'
          }
        },
        'Please extract all text content from this Form 16 PDF document. Return ONLY the plain text characters from the document, preserving labels and values. Do not summarize or format as JSON.'
      ]
    });

    const latencyMs = Date.now() - startTime;
    logStructured('info', 'Successfully extracted PDF text content using Gemini', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: 'gemini-2.5-flash',
      latencyMs,
    });

    res.status(200).json({ text: response.text || '' });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const appErr = mapError(error);
    
    logStructured('error', 'Error during PDF parsing / extraction', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: 'gemini-2.5-flash',
      latencyMs,
      errorCategory: appErr.category,
      errorMessage: error.message || String(error),
      stackTrace: error.stack,
    });

    res.status(appErr.status).json({ error: appErr.message });
  }
}
