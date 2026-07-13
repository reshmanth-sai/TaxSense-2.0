import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;
let isValidated = false;

export function validateEnvironment(): void {
  if (isValidated) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('CRITICAL: GEMINI_API_KEY environment variable is missing or empty.');
  }

  const isVercel = !!process.env.VERCEL;
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`[GoogleGenAI] Environment verified. Environment: ${isVercel ? 'Vercel Serverless' : 'Local Node'} (${nodeEnv})`);
  isValidated = true;
}

/**
 * Returns the lazily-initialized GoogleGenAI singleton client.
 * Strictly requires standard Google AI Studio API keys (AIzaSy).
 */
export function getAI(): GoogleGenAI {
  if (!aiClient) {
    validateEnvironment();
    
    const apiKey = process.env.GEMINI_API_KEY!;
    
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface StructuredLogPayload {
  requestId?: string;
  correlationId?: string;
  endpoint: string;
  model?: string;
  latencyMs?: number;
  tokenUsage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
  retryCount?: number;
  errorCategory?: string;
  errorMessage?: string;
  stackTrace?: string;
}

/**
 * Structured logger for production-ready backend observability.
 */
export function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  payload: StructuredLogPayload
): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: payload.requestId || 'system',
      correlationId: payload.correlationId || 'system',
      endpoint: payload.endpoint,
      model: payload.model,
      latencyMs: payload.latencyMs,
      tokenUsage: payload.tokenUsage,
      retryCount: payload.retryCount,
      errorCategory: payload.errorCategory,
      errorMessage: payload.errorMessage,
      stackTrace: payload.stackTrace,
    })
  );
}

export interface AppError {
  status: number;
  message: string;
  category: string;
}

/**
 * Maps raw Google API errors to client-safe HTTP error formats.
 */
export function mapError(error: any): AppError {
  const errorObject = error?.error || error;
  const statusStr = String(error?.status || error?.statusCode || errorObject?.code || errorObject?.status || '');
  const message = error?.message || errorObject?.message || String(error);

  let status = 500;
  let category = 'INTERNAL_ERROR';
  let userMessage = 'An unexpected error occurred while communicating with the AI service. Please try again.';

  if (statusStr === 'UNAUTHENTICATED' || statusStr === '401' || message.includes('401') || message.includes('UNAUTHENTICATED') || message.includes('API key')) {
    status = 401;
    category = 'UNAUTHENTICATED';
    userMessage = 'Authentication failed. Please verify your API settings and try again.';
  } else if (statusStr === 'PERMISSION_DENIED' || statusStr === '403' || message.includes('403') || message.includes('PERMISSION_DENIED')) {
    status = 403;
    category = 'PERMISSION_DENIED';
    userMessage = 'You do not have permission to access this AI resource.';
  } else if (statusStr === 'NOT_FOUND' || statusStr === '404' || message.includes('404')) {
    status = 404;
    category = 'NOT_FOUND';
    userMessage = 'The requested AI model or resource could not be found.';
  } else if (statusStr === 'REQUEST_TIMEOUT' || statusStr === '408' || message.includes('408')) {
    status = 408;
    category = 'TIMEOUT';
    userMessage = 'The AI request timed out. Please try again.';
  } else if (statusStr === 'RESOURCE_EXHAUSTED' || statusStr === '429' || message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('Quota exceeded') || message.includes('rate limit')) {
    status = 429;
    category = 'RATE_LIMIT';
    userMessage = 'AI service is experiencing high traffic. Please wait a moment and try again.';
  } else if (statusStr === 'UNAVAILABLE' || statusStr === '503' || message.includes('503') || message.includes('UNAVAILABLE') || message.includes('overloaded')) {
    status = 503;
    category = 'SERVICE_UNAVAILABLE';
    userMessage = 'AI service is temporarily unavailable. We are automatically retrying, but please try again if it fails.';
  }

  return { status, message: userMessage, category };
}

/**
 * Robust wrapper around generateContent that handles transient errors with exponential backoff and fallbacks.
 */
export async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
  requestId?: string;
  correlationId?: string;
}) {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash'];
  let lastError: any = null;
  let retryCount = 0;
  
  const reqId = params.requestId || crypto.randomUUID();
  const corrId = params.correlationId || crypto.randomUUID();

  for (const modelName of modelsToTry) {
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    while (attempts < maxAttempts) {
      const startTime = Date.now();
      try {
        logStructured('info', `Attempting content generation with model: ${modelName}`, {
          requestId: reqId,
          correlationId: corrId,
          endpoint: 'generateContent',
          model: modelName,
          retryCount,
        });

        const aiInstance = getAI();
        const response = await aiInstance.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        const latencyMs = Date.now() - startTime;
        const tokenUsage = response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          candidatesTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        } : undefined;

        logStructured('info', `Successfully generated content with model: ${modelName}`, {
          requestId: reqId,
          correlationId: corrId,
          endpoint: 'generateContent',
          model: modelName,
          latencyMs,
          tokenUsage,
          retryCount,
        });

        return response;
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        lastError = error;
        attempts++;
        retryCount++;

        const errorDetails = mapError(error);

        logStructured('warn', `Generation failed for model: ${modelName} on attempt ${attempts}/${maxAttempts}`, {
          requestId: reqId,
          correlationId: corrId,
          endpoint: 'generateContent',
          model: modelName,
          latencyMs,
          retryCount,
          errorCategory: errorDetails.category,
          errorMessage: error.message || String(error),
          stackTrace: error.stack,
        });

        const isTransient = errorDetails.status === 429 || errorDetails.status === 503 || errorDetails.status === 408 || errorDetails.status === 500;
        if (isTransient && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2.5;
        } else {
          break; // Try next model in the fallback list
        }
      }
    }
  }

  const errorDetails = mapError(lastError);
  throw errorDetails;
}

/**
 * Unified stream helper for streaming conversational endpoints.
 */
export async function generateContentStreamWithLogging(params: {
  model?: string;
  contents: any;
  config?: any;
  requestId?: string;
  correlationId?: string;
}) {
  const modelName = params.model || 'gemini-2.5-flash';
  const reqId = params.requestId || crypto.randomUUID();
  const corrId = params.correlationId || crypto.randomUUID();
  const startTime = Date.now();

  try {
    logStructured('info', `Attempting content stream generation with model: ${modelName}`, {
      requestId: reqId,
      correlationId: corrId,
      endpoint: 'generateContentStream',
      model: modelName,
    });

    const aiInstance = getAI();
    const stream = await aiInstance.models.generateContentStream({
      model: modelName,
      contents: params.contents,
      config: params.config,
    });

    const latencyMs = Date.now() - startTime;
    logStructured('info', `Successfully initialized stream with model: ${modelName}`, {
      requestId: reqId,
      correlationId: corrId,
      endpoint: 'generateContentStream',
      model: modelName,
      latencyMs,
    });

    return stream;
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const errorDetails = mapError(error);

    logStructured('error', `Stream generation failed for model: ${modelName}`, {
      requestId: reqId,
      correlationId: corrId,
      endpoint: 'generateContentStream',
      model: modelName,
      latencyMs,
      errorCategory: errorDetails.category,
      errorMessage: error.message || String(error),
      stackTrace: error.stack,
    });

    throw errorDetails;
  }
}
