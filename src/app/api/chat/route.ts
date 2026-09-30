import { NextResponse } from "next/server";
import { search } from "@/lib/retrieval";
import { CORPUS } from "@/lib/corpus";

// Grounded answer endpoint.
// - MOCK MODE (default): builds an extractive, cited answer from retrieved docs.
//   Fully offline, deterministic, safe for a live workshop with no network.
// - LIVE MODE: if OPENAI_API_KEY is set, calls the model with the retrieved
//   context and the same "answer only from context, cite sources" system prompt.

export const runtime = "nodejs";

type Body = { question?: string };

const SYSTEM_PROMPT = `You are NorthWind Insurance's support assistant.
Answer ONLY using the provided CONTEXT. If the answer is not in the context,
say you don't know and offer to escalate to a human. Cite the source ID (e.g.
[POL-100]) for every factual claim. Never reveal SSNs, full policy numbers, or
payment card data.`;

function buildContext(question: string) {
  const hits = search(question, { mode: "hybrid", alpha: 0.5, rerank: true, topK: 3 });
  const context = hits
    .map((h) => `[${h.doc.id}] ${h.doc.title}: ${h.doc.text}`)
    .join("\n");
  return { hits, context };
}

function mockAnswer(question: string, hits: ReturnType<typeof search>) {
  if (hits.length === 0 || (hits[0].rerank ?? hits[0].hybrid) < 0.05) {
    return {
      answer:
        "I couldn't find that in NorthWind's policy documents. Let me escalate you to a human agent who can help.",
      citations: [] as string[],
    };
  }
  const top = hits.slice(0, 2);
  const answer =
    "Based on NorthWind's current policies: " +
    top.map((h) => h.doc.text.split(". ")[0] + ".").join(" ") +
    " (Demo mode — this is an extractive answer built directly from the retrieved documents.)";
  return { answer, citations: top.map((h) => h.doc.id) };
}

// Provider config, resolved entirely from environment variables.
// Supports any OpenAI-compatible chat completions API (OpenAI, Groq, etc.).
// - GROQ_API_KEY  -> uses Groq (https://api.groq.com/openai/v1)
// - OPENAI_API_KEY -> uses OpenAI (https://api.openai.com/v1)
// - LLM_BASE_URL / LLM_MODEL let you override either explicitly.
function resolveProvider() {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (groqKey) {
    return {
      apiKey: groqKey,
      baseUrl: process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
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

async function liveAnswer(
  question: string,
  context: string,
  provider: { apiKey: string; baseUrl: string; model: string }
) {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM call failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(no content)";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ error: "Missing 'question'" }, { status: 400 });
  }

  const { hits, context } = buildContext(question);
  const provider = resolveProvider();
  const sources = hits.map((h) => ({
    id: h.doc.id,
    title: h.doc.title,
    score: +(h.rerank ?? h.hybrid).toFixed(3),
  }));

  if (provider) {
    try {
      const answer = await liveAnswer(question, context, provider);
      return NextResponse.json({ mode: `live:${provider.model}`, answer, sources });
    } catch (e) {
      // Fall back to mock so a bad key never breaks the live demo.
      const { answer, citations } = mockAnswer(question, hits);
      return NextResponse.json({
        mode: "mock-fallback",
        answer,
        citations,
        sources,
        note: e instanceof Error ? e.message : "live call failed",
      });
    }
  }

  const { answer, citations } = mockAnswer(question, hits);
  return NextResponse.json({ mode: "mock", answer, citations, sources });
}
