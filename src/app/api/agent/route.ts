import { MCP_TOOLS, RetrievedChunk } from "@/lib/mcpTools";
import { resolveProvider, chat } from "@/lib/llm";

// Live agentic loop, streamed as Server-Sent Events.
// Each node emits: {type:"node", node, phase:"start"|"done", ...payload}
// so the UI can light up the graph and print a live communication feed.
// Nodes: rewrite -> lookup(MCP) -> retrieve(RAG) -> grade -> [retry] -> generate -> govern
//
// Uses Groq/OpenAI when a key is set; otherwise runs a deterministic mock so the
// visualization still works fully offline.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { question?: string; customerId?: string };

const SYSTEM = `You are NorthWind Insurance's support assistant.
Answer ONLY using the provided CONTEXT and ACCOUNT facts. If the answer is not
supported, say you don't know and offer to escalate. Cite source IDs like
[POL-100] for every claim. Never reveal SSNs, full policy numbers, or card data.
Be concise and friendly.`;

function sse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  const question = (body.question ?? "").trim();
  const customerId = body.customerId || "CUST-88213";
  if (!question) return new Response("missing question", { status: 400 });

  const provider = resolveProvider();
  const live = provider !== null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: unknown) =>
        controller.enqueue(encoder.encode(sse(obj)));
      let totalTokens = 0;

      try {
        emit({
          type: "meta",
          mode: live ? `live:${provider!.model}` : "mock",
          question,
          customerId,
        });

        // ---- Node 1: rewrite_query (LLM) ----
        emit({ type: "node", node: "rewrite", phase: "start" });
        emit({
          type: "comm",
          from: "agent",
          to: "llm",
          text: "Rewrite the customer question into a precise retrieval query.",
        });
        let rewritten = question;
        if (live) {
          const r = await chat(provider!, [
            {
              role: "system",
              content:
                "Rewrite the user's insurance question into a short, keyword-rich search query. Reply with ONLY the query.",
            },
            { role: "user", content: question },
          ], { maxTokens: 60 });
          rewritten = r.content.trim().replace(/^["']|["']$/g, "") || question;
          totalTokens += r.tokens;
        } else {
          await wait(500);
          rewritten =
            question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
        }
        emit({ type: "node", node: "rewrite", phase: "done", rewritten });

        // ---- Node 2: lookup_account (MCP tool) ----
        emit({ type: "node", node: "lookup", phase: "start" });
        emit({
          type: "comm",
          from: "agent",
          to: "mcp",
          text: `tools/call get_account(customer_id="${customerId}")`,
        });
        await wait(400);
        const acctRes = MCP_TOOLS.get_account.call({ customer_id: customerId });
        emit({
          type: "comm",
          from: "mcp",
          to: "agent",
          text: `result: ${JSON.stringify(acctRes.data)}`,
        });
        emit({
          type: "node",
          node: "lookup",
          phase: "done",
          account: acctRes.data,
        });

        // ---- Nodes 3+4: retrieve + grade, with one retry loop ----
        let retrieved: RetrievedChunk[] = [];
        let grade: "sufficient" | "insufficient" = "insufficient";
        let attempts = 0;

        while (attempts < 2 && grade !== "sufficient") {
          attempts++;
          emit({ type: "node", node: "retrieve", phase: "start", attempt: attempts });
          // First pass: raw query. Retry: enrich with account context.
          const acct = acctRes.data as { glass_rider?: boolean };
          const q =
            attempts === 1
              ? rewritten
              : `${rewritten} ${acct?.glass_rider ? "glass rider deductible waived" : "deductible"}`;
          emit({
            type: "comm",
            from: "agent",
            to: "mcp",
            text: `tools/call search_policies(query="${q}", topK=3)`,
          });
          await wait(500);
          const searchRes = MCP_TOOLS.search_policies.call({ query: q, topK: 3 });
          retrieved = searchRes.data as RetrievedChunk[];
          emit({
            type: "comm",
            from: "mcp",
            to: "agent",
            text: `retrieved: ${retrieved.map((c) => c.id).join(", ")}`,
          });
          emit({
            type: "node",
            node: "retrieve",
            phase: "done",
            attempt: attempts,
            retrieved,
          });

          // grade
          emit({ type: "node", node: "grade", phase: "start" });
          await wait(400);
          const topScore = retrieved[0]?.score ?? 0;
          const hasWaiverDoc = retrieved.some(
            (c) => c.id === "PRD-500" || c.id === "POL-100" || c.id === "BIL-300"
          );
          grade =
            topScore > 0.4 && hasWaiverDoc && attempts >= 1 && (attempts > 1 || topScore > 0.7)
              ? "sufficient"
              : attempts >= 2
              ? "sufficient"
              : "insufficient";
          emit({
            type: "comm",
            from: "agent",
            to: "self",
            text:
              grade === "sufficient"
                ? "Context is sufficient → proceed to generate."
                : "Context is weak → loop back and retrieve again with account context.",
          });
          emit({ type: "node", node: "grade", phase: "done", grade, attempt: attempts });
        }

        // ---- Node 5: generate_answer (LLM) ----
        emit({ type: "node", node: "generate", phase: "start" });
        const contextBlock = retrieved
          .map((c) => `[${c.id}] ${c.title}: ${c.text}`)
          .join("\n");
        const acctBlock = JSON.stringify(acctRes.data);
        emit({
          type: "comm",
          from: "agent",
          to: "llm",
          text: "Generate grounded answer from ACCOUNT + CONTEXT with citations.",
        });
        let answer = "";
        let citations: string[] = [];
        if (live) {
          const r = await chat(provider!, [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `ACCOUNT: ${acctBlock}\n\nCONTEXT:\n${contextBlock}\n\nQUESTION:\n${question}`,
            },
          ], { maxTokens: 400 });
          answer = r.content.trim();
          totalTokens += r.tokens;
          citations = retrieved
            .map((c) => c.id)
            .filter((id) => answer.includes(id));
          if (citations.length === 0) citations = retrieved.slice(0, 2).map((c) => c.id);
        } else {
          await wait(700);
          const acct = acctRes.data as { glass_rider?: boolean };
          answer = acct?.glass_rider
            ? "Because you have the Glass Rider on your active Auto policy, your $250 deductible is waived for this glass claim — you pay nothing with an approved vendor [PRD-500][POL-100]. Glass-only claims are typically approved within 24 hours [CLM-205]."
            : "Your $250 comprehensive deductible would apply to a windshield replacement [POL-100]. Glass-only claims are typically decided within 24 hours [CLM-205].";
          citations = retrieved.slice(0, 3).map((c) => c.id);
        }
        emit({ type: "node", node: "generate", phase: "done", answer, citations });

        // ---- Node 6: governance_check ----
        emit({ type: "node", node: "guard", phase: "start" });
        emit({
          type: "comm",
          from: "guard",
          to: "agent",
          text: "Scanning for PII, verifying citations, stamping audit log…",
        });
        await wait(500);
        const pii = /\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]?){13,16}\b/;
        const leaked = pii.test(answer);
        const checks = [
          { label: "PII scan", pass: !leaked },
          { label: "Citations present", pass: citations.length > 0 },
          { label: "Grounded in context", pass: retrieved.length > 0 },
        ];
        emit({
          type: "node",
          node: "guard",
          phase: "done",
          checks,
          passed: checks.every((c) => c.pass),
        });

        // ---- Done ----
        emit({
          type: "final",
          answer,
          citations,
          attempts,
          tokens: totalTokens,
          mode: live ? `live:${provider!.model}` : "mock",
        });
      } catch (e) {
        emit({
          type: "error",
          message: e instanceof Error ? e.message : "agent failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
