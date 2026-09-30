// Shared LLM provider resolution + a small chat helper.
// Supports any OpenAI-compatible chat completions API (Groq or OpenAI),
// selected purely from environment variables. Never hardcode keys.

export type Provider = { apiKey: string; baseUrl: string; model: string };

export function resolveProvider(): Provider | null {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (groqKey) {
    return {
      apiKey: groqKey,
      baseUrl: process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1",
      model:
        process.env.LLM_MODEL ||
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-120b",
    };
  }
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
      model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

export function isLive(): boolean {
  return resolveProvider() !== null;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatResult = { content: string; tokens: number };

export async function chat(
  provider: Provider,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<ChatResult> {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 512,
      messages,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM ${res.status}: ${detail.slice(0, 180)}`);
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    tokens: data.usage?.total_tokens ?? 0,
  };
}
