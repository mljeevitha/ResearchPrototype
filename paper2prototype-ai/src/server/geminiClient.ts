import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini Client] Warning: GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
}

// Order prioritizes active free-tier quota models with seamless failover
const MODEL_FAILOVER_LIST = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

export function isQuotaExceededError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || err.code || (err.error && err.error.code);
  return (
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('exceeded your current quota')
  );
}

export async function generateContentWithFailover(
  params: Omit<GenerateContentParameters, 'model'> & { preferredModel?: string }
): Promise<GenerateContentResponse> {
  const ai = getGeminiClient();
  const preferred = params.preferredModel;
  const modelsToTry = preferred
    ? [preferred, ...MODEL_FAILOVER_LIST.filter((m) => m !== preferred)]
    : MODEL_FAILOVER_LIST;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      if (isQuotaExceededError(err)) {
        console.warn(`[Gemini Failover] Model '${model}' quota exhausted (429 RESOURCE_EXHAUSTED). Trying next available model...`);
        // Small backoff before failover attempt
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }
      // If it's another non-quota error, throw immediately
      throw err;
    }
  }

  // All failover models exhausted
  console.error('[Gemini Failover] All candidate models exhausted free-tier quota:', lastError?.message);
  const quotaErr: any = new Error(
    `Gemini API Rate Limit Exceeded (429 RESOURCE_EXHAUSTED): Free-tier daily request quota reached across all available models. Switched to local analytical engine.`
  );
  quotaErr.status = 429;
  quotaErr.code = 'RESOURCE_EXHAUSTED';
  throw quotaErr;
}
