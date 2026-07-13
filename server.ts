import express from 'express';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { Type } from '@google/genai';
import { 
  getAI, 
  generateContentWithRetryAndFallback, 
  generateContentStreamWithLogging, 
  validateEnvironment, 
  mapError, 
  logStructured 
} from './services/ai/googleClient.ts';

const app = express();
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// In-memory cache for news (local server cache)
let cachedNews: any[] | null = null;
let lastNewsFetchTime = 0;
const CACHE_DURATION_MS = 3600000; // 1 hour

async function financeNewsHandler(req: any, res: any) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  const startTime = Date.now();

  try {
    const now = Date.now();
    if (cachedNews && (now - lastNewsFetchTime < CACHE_DURATION_MS)) {
      logStructured('info', 'Serving finance news from cache (local server)', {
        requestId,
        correlationId,
        endpoint: 'finance-news',
        latencyMs: Date.now() - startTime,
      });
      res.json({ success: true, news: cachedNews });
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
      res.json({ success: true, news: newsArray });
    } else {
      throw new Error('Gemini returned an empty or invalid array.');
    }
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const appErr = mapError(error);
    
    logStructured('error', 'Error generating finance news (local server fallback)', {
      requestId,
      correlationId,
      endpoint: 'finance-news',
      latencyMs,
      errorCategory: appErr.category,
      errorMessage: error.message || String(error),
      stackTrace: error.stack,
    });

    res.json({
      success: false,
      news: []
    });
  }
}

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // API: Health Check
  app.get('/api/health', (req, res) => {
    try {
      validateEnvironment();
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: 'Local Node Server'
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // API: Generate Indian Finance and Tax News Ticker items
  app.get('/api/finance-news', financeNewsHandler);

  // API: Extract PDF Text (refactored to use Gemini for dev/prod parity)
  app.post('/api/extract-pdf', upload.single('file'), async (req: any, res: any) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
    const startTime = Date.now();

    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      logStructured('info', `PDF received. File size: ${req.file.size} bytes (local server)`, {
        requestId,
        correlationId,
        endpoint: 'extract-pdf',
      });

      const base64Data = req.file.buffer.toString('base64');
      const ai = getAI();

      logStructured('info', 'Sending PDF buffer to Gemini for extraction... (local server)', {
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
      logStructured('info', 'Successfully extracted PDF text content using Gemini (local server)', {
        requestId,
        correlationId,
        endpoint: 'extract-pdf',
        model: 'gemini-2.5-flash',
        latencyMs,
      });

      res.json({ text: response.text || '' });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      const appErr = mapError(error);

      logStructured('error', 'Error during PDF parsing / extraction (local server)', {
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
  });

  // API: Extract Form 16 Information
  app.post('/api/extract', async (req, res) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text content from Form 16 is required.' });
        return;
      }

      const response = await generateContentWithRetryAndFallback({
        contents: `Please extract standard tax parameters from the following Form 16 text and return it strictly as JSON according to the schema.
        Extract ALL deduction fields visible in Part B of the Form 16. For any field not explicitly present in the document, return null — do not guess or assume values.
        Look for standard terms:
        - "Gross Salary" or "Section 17(1)" or "Salary as per provisions contained in section 17(1)" for gross salary.
        - "HRA" or "House Rent Allowance" or "10(13A)" for HRA exemption.
        - "Standard Deduction" or "Section 16(ia)" for standard deduction (usually 50,000 in old regimes).
        - "80C" or "Provident Fund" or "PPF" or "ELSS" or "Life Insurance" or "Section 80C" for 80C.
        - "80D" or "Health Insurance" or "Section 80D" for 80D.
        - "80CCD(1B)" or "NPS" for standalone NPS.
        - "80E" or "Education Loan" for education loan interest.
        - "80G" or "Donation" or "Charitable" for charitable donations.
        - "80TTA" or "Savings Bank Interest" for 80TTA.
        - "Section 24" or "24(b)" or "Interest on Borrowed Capital" or "Home Loan Interest" for section 24b.
        - "Basic" or "Basic Salary" or "Basic Pay" for basicSalary.
        - "Other Income" or "Income from Other Sources" or "Section 56" for otherIncome.
        - "TDS" or "Tax Deducted at Source" or "Total tax deducted" or "Section 192" for TDS.

        Here is the Form 16 text:
        ${text}
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assessmentYear: { type: Type.STRING, description: 'The assessment year e.g. "2025-26"' },
              employeeName: { type: Type.STRING, description: 'Full name of the employee/taxpayer', nullable: true },
              pan: { type: Type.STRING, description: 'PAN of the employee/taxpayer', nullable: true },
              grossSalary: { type: Type.INTEGER, description: 'Gross Salary amount in INR' },
              hraExemption: { type: Type.INTEGER, description: 'HRA exemption amount computed and shown in Form 16 Part B.', nullable: true },
              ltaExemption: { type: Type.INTEGER, description: 'LTA exemption in INR', nullable: true },
              otherIncome: { type: Type.INTEGER, description: 'Any other income declared.', nullable: true },
              deduction80C: { type: Type.INTEGER, description: 'Total 80C deductions (EPF+PPF+ELSS+LIC+home loan principal). Cap ₹1,50,000.', nullable: true },
              deduction80D: { type: Type.INTEGER, description: 'Health insurance premium paid. Cap ₹25,000 self / ₹50,000 parents.', nullable: true },
              deduction80CCD1B: { type: Type.INTEGER, description: 'Standalone NPS contribution under 80CCD(1B). Cap ₹50,000.', nullable: true },
              deduction80E: { type: Type.INTEGER, description: 'Education loan interest paid under Section 80E.', nullable: true },
              deduction80G: { type: Type.INTEGER, description: 'Charitable donations under Section 80G.', nullable: true },
              deduction80TTA: { type: Type.INTEGER, description: 'Savings bank interest under 80TTA. Cap ₹10,000.', nullable: true },
              section24b: { type: Type.INTEGER, description: 'Home loan interest under Section 24(b). Cap ₹2,00,000.', nullable: true },
              basicSalary: { type: Type.INTEGER, description: 'Basic salary component.', nullable: true },
              tdsDeducted: { type: Type.INTEGER, description: 'Tax Deducted at Source (TDS) in INR', nullable: true },
              employerName: { type: Type.STRING, description: 'Name of the employer company', nullable: true },
              pfContribution: { type: Type.INTEGER, description: 'Provident Fund (PF) contribution amount', nullable: true }
            },
            required: ['grossSalary'],
          },
        },
        requestId,
        correlationId,
      });

      const jsonStr = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonStr);

      // Sanitize numerical inputs to ensure no negatives or NaN
      const safeData: any = { ...parsedData };
      for (const key in safeData) {
        if (typeof safeData[key] === 'number') {
          safeData[key] = Math.max(0, safeData[key] || 0);
        }
      }
      
      // Apply statutory caps on deductions
      if (safeData.deduction80C != null) safeData.deduction80C = Math.min(safeData.deduction80C, 150000);
      if (safeData.deduction80D != null) safeData.deduction80D = Math.min(safeData.deduction80D, 75000);
      if (safeData.deduction80CCD1B != null) safeData.deduction80CCD1B = Math.min(safeData.deduction80CCD1B, 50000);
      if (safeData.deduction80TTA != null) safeData.deduction80TTA = Math.min(safeData.deduction80TTA, 10000);
      if (safeData.section24b != null) safeData.section24b = Math.min(safeData.section24b, 200000);

      res.json({ success: true, data: safeData });
    } catch (error: any) {
      const appErr = mapError(error);
      res.status(appErr.status).json({ error: appErr.message });
    }
  });

  // API: Conversational Agent Turns (SSE Streaming refactored)
  app.post('/api/chat', async (req, res) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

    try {
      const { messages, systemPrompt } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Conversation messages array is required.' });
        return;
      }

      // Set streaming headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const contents = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

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
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      const appErr = mapError(error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: appErr.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(appErr.status).json({ error: appErr.message });
      }
    }
  });

  // Vite static middleware serving or production fallback
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TaxSense server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
