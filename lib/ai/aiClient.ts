/**
 * Minimal client for the Pursue AI chat API. Reads config from env and streams the response.
 */

import { trace } from "console";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const getBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_PURSUE_AI_BASE_URL ?? process.env.NEXT_PUBLIC_PURSUEAI_API_URL ?? "").replace(/\/+$/, "");

const getApiKey = (): string | undefined =>
  process.env.NEXT_PUBLIC_PURSUE_AI_API_KEY ?? process.env.NEXT_PUBLIC_PURSUEAI_API_KEY;

/**
 * Validates response status and throws user-facing error if not ok.
 */
async function validateResponse(res: Response): Promise<void> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Something went wrong (${res.status}).`);
  }
}

const getRequestHeaders = () => {
  const config = getPursueAIConfig();
  if (!config) return {};
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers["X-API-Key"] = config.apiKey;
  return headers;
}

/** Returns config from env, or null if not configured. */
export function getPursueAIConfig(): { baseUrl: string; apiKey?: string } | null {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;
  return { baseUrl, apiKey: getApiKey() };
}

export interface StreamChatOptions {
  signal?: AbortSignal;
  onChunk: (accumulated: string) => void;
}

export interface FeedbackData {
  trace_id: string;
  question: string;
  response: string;
  rating: "positive" | "negative";
  comment: null;
}

/**
 * POST to /api/chat and stream the response. Calls onChunk with the accumulated text on each chunk.
 * Throws on connection error or non-ok response (message is user-facing).
 * Returns the trace ID from the response headers.
 */
export async function streamChat(
  message: string,
  history: Message[],
  options: StreamChatOptions
): Promise<string | null> {
  const config = getPursueAIConfig();
  if (!config) throw new Error("Set NEXT_PUBLIC_PURSUE_AI_BASE_URL (or NEXT_PUBLIC_PURSUEAI_API_URL) to enable AI.");

  const headers = getRequestHeaders();

  const res = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, history }),
    signal: options.signal,
  });

  await validateResponse(res);
  const traceId = res.headers.get("X-Trace-ID");

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response from the AI service.");

  const decoder = new TextDecoder();
  let accumulated = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      options.onChunk(accumulated);
    }
  } finally {
    reader.releaseLock();
  }

  return traceId;
}

/**
 * Submit feedback for an AI response.
 * Throws on connection error or non-ok response (message is user-facing).
 */
export async function submitFeedback(feedback: FeedbackData): Promise<void> {
  const config = getPursueAIConfig();
  if (!config) throw new Error("Cannot give AI feedback. Not configured.");

  const headers = getRequestHeaders();

  const res = await fetch(`${config.baseUrl}/api/feedback`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(feedback),
  });

  await validateResponse(res);
}
