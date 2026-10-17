// src/lib/ai/geminiMultiKey.ts
/**
 * Multi-Key Rotation & Resilient Quota Manager for Google Gemini API
 * Pools multiple API keys (e.g. from SIH 2026 hackathon) and rotates across them
 * to avoid rate limits (HTTP 429) and provide seamless failover.
 */

// Model preference priority: gemini-3.8-flash -> gemini-2.5-flash -> gemini-flash-latest
const PREFERRED_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

let currentKeyIndex = 0;

export function getGeminiKeyPool(): string[] {
  const keysSet = new Set<string>();

  // Check GEMINI_API_KEYS (comma, newline, or semicolon delimited)
  const envKeys = process.env.GEMINI_API_KEYS;
  if (envKeys) {
    envKeys
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter((k) => k.startsWith('AIzaSy') && k.length >= 30)
      .forEach((k) => keysSet.add(k));
  }

  // Check GEMINI_API_KEY
  const singleKey = process.env.GEMINI_API_KEY?.trim();
  if (singleKey && singleKey.startsWith('AIzaSy') && singleKey.length >= 30) {
    keysSet.add(singleKey);
  }

  return Array.from(keysSet);
}

export interface GeminiCallResult {
  text: string;
  keyUsed: string;
  modelUsed: string;
}

/**
 * Execute a Gemini request with automatic multi-key rotation and model fallback
 */
export async function executeGeminiWithRotation(
  payload: any,
  options?: {
    timeoutMs?: number;
    preferredModel?: string;
  }
): Promise<GeminiCallResult | null> {
  const keys = getGeminiKeyPool();
  if (keys.length === 0) {
    console.warn('[GeminiPool] No valid Gemini API keys found in environment variables.');
    return null;
  }

  const models = options?.preferredModel
    ? [options.preferredModel, ...PREFERRED_MODELS.filter((m) => m !== options.preferredModel)]
    : PREFERRED_MODELS;

  const totalKeys = keys.length;
  const timeoutMs = options?.timeoutMs || 15000;

  // Attempt across keys starting from the current round-robin index
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % totalKeys;
    const apiKey = keys[keyIdx];
    const maskedKey = `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`;

    // Try models for this key
    for (const model of models) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText && candidateText.trim().length > 0) {
            // Update next round-robin key
            currentKeyIndex = (keyIdx + 1) % totalKeys;
            console.log(
              `[GeminiPool] Success using key #${keyIdx + 1} (${maskedKey}) with model ${model}`
            );
            return {
              text: candidateText,
              keyUsed: maskedKey,
              modelUsed: model,
            };
          }
        }

        // Handle specific error codes
        if (res.status === 429) {
          console.warn(
            `[GeminiPool] Key #${keyIdx + 1} (${maskedKey}) hit RATE LIMIT (429). Rotating to next key.`
          );
          break; // Break model loop, advance to next key
        }

        if (res.status === 403 || res.status === 400) {
          const errData = await res.json().catch(() => ({}));
          console.warn(
            `[GeminiPool] Key #${keyIdx + 1} (${maskedKey}) failed (${res.status}): ${
              errData.error?.message?.slice(0, 100) || 'Forbidden/Bad request'
            }. Trying next key.`
          );
          break; // Advance to next key
        }

        if (res.status === 404) {
          // Model might not be enabled for this specific key, try next model
          continue;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn(`[GeminiPool] Request timed out on key #${keyIdx + 1} with ${model}`);
        } else {
          console.warn(`[GeminiPool] Error on key #${keyIdx + 1}: ${err.message}`);
        }
      }
    }
  }

  console.warn('[GeminiPool] All pooled keys exhausted or unavailable. Triggering fallback.');
  return null;
}
