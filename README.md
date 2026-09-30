# Enterprise Agentic AI — Interactive Workshop

**RAG · LangGraph Agents · MCP · Governance · Production** — a single Next.js app
for a ~2 hour hands-on training session.

This is not a slide deck. It is a working system framed around one real industry
problem: **NorthWind Insurance** needs a support assistant that answers policy
questions accurately, safely, and at scale. You follow that one problem end to
end through five interactive modules, each with a **🧪 Hands-on** track and a
**📖 Theory** track.

---

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Runs **fully offline in demo mode** — no API key, no database, no external
services. Perfect for a live room where Wi-Fi is unreliable.

### Optional: live LLM mode

Copy `.env.example` to `.env.local` and set **one** provider. Any
OpenAI-compatible API works (Groq or OpenAI):

```bash
# Groq (fast, recommended for a live demo)
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-120b     # pick any model your key can access

# — or — OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

The `/api/chat` endpoint (used by the "Ask the assistant" widget in the RAG
module) then calls a real model with the retrieved context and returns
`mode: "live:<model>"`. If no key is set, or the call fails, it automatically
falls back to the offline extractive answer, so the demo never breaks.

> **Security:** put keys only in `.env.local` (gitignored). Never commit a real
> key or paste it into chat/logs. If a key is ever exposed, rotate it.

---

## Deploy to Vercel

This is a **standard single Next.js app** — Vercel auto-detects the framework, so
no `vercel.json` is needed.

1. Push the repo to GitHub (already done).
2. In Vercel, **New Project → Import** this repository.
3. Framework preset: **Next.js** (auto-detected). Build command `next build` and
   output are the defaults — leave them as-is.
4. Add environment variables in **Project → Settings → Environment Variables**
   (do **not** commit them):
   - `GROQ_API_KEY` = your Groq key
   - `GROQ_MODEL` = `openai/gpt-oss-120b` (optional)
   - Leaving these unset simply runs the app in offline demo/mock mode.
5. Deploy. The `/api/chat` and `/api/agent` routes run as serverless functions on
   the same domain — no separate services or extra routing required.

> The `langgraph/agent.py` script is a **local reference** you run manually
> (`python agent.py`) to see the real framework. The web app does not call it at
> runtime, so it is not part of the Vercel deployment.

---

## What's inside

| Route          | Module      | Interactive hands-on                                             |
| -------------- | ----------- | ---------------------------------------------------------------- |
| `/`            | The Problem | The NorthWind scenario and why naive GPT fails                   |
| `/rag`         | RAG         | Live retrieval playground (keyword/vector/hybrid + rerank), chunking slider, pipeline diagram, all 15 techniques, grounded-answer widget |
| `/agents`      | LangGraph   | Animated StateGraph that executes node-by-node with a retry loop and live shared-state inspector |
| `/mcp`         | MCP         | JSON-RPC tool-call console (get_account, search_policies, file_claim) + architecture diagram |
| `/governance`  | Governance  | Guardrail sandbox (PII redaction, prompt-injection block, citation check) + audit trail |
| `/production`  | Production  | Reference architecture, cost/latency estimator, ship-it checklist |

### Runnable LangGraph (Python)

`/langgraph/agent.py` is the **real, runnable twin** of the animated graph. Same
nodes, same retrieve → grade → retry → generate → govern control flow. Runs
offline in demo mode:

```bash
cd langgraph
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python agent.py
```

---

## Tech stack

- **Next.js (App Router) + TypeScript** — the single app
- **Tailwind CSS** — styling
- **React Flow** — every graph/architecture visualization
- **In-browser retrieval** (`src/lib/retrieval.ts`) — real TF-IDF + trigram
  cosine + hybrid + rerank math, so the RAG playground computes live with zero
  backend
- **LangGraph** (Python, `/langgraph`) — the real agent framework

Everything is deterministic and offline by default. The "simulations" run
genuine (simplified) algorithms — they are teaching models, not smoke and
mirrors.

---

## Suggested 2-hour run-of-show

| Time      | Segment                        | What to do                                                                 |
| --------- | ------------------------------ | -------------------------------------------------------------------------- |
| 0:00–0:15 | **The Problem** (`/`)          | Frame NorthWind. Ask the room: why can't we just paste this into ChatGPT? Land the four failure modes. |
| 0:15–0:50 | **RAG** (`/rag`)               | Drive the retrieval playground. Switch to the messy query and show keyword failing vs. vector winning. Play the chunking slider. Walk the technique catalog by stage. End on the grounded-answer widget. |
| 0:50–1:20 | **LangGraph** (`/agents`)      | Run the graph live. Pause on the `grade → insufficient → retrieve` loop — that's the "aha". Show the same graph in real Python; optionally run `agent.py` in a terminal. |
| 1:20–1:40 | **MCP** (`/mcp`)               | Call `get_account` in the console; show the JSON-RPC messages. Connect it back to the `lookup` node from the agent run. Discuss the write-action risk on `file_claim`. |
| 1:40–1:55 | **Governance** (`/governance`) | Trigger the PII-leak and prompt-injection examples live. Walk the audit trail. Tie to EU AI Act / NIST framing. |
| 1:55–2:00 | **Production** (`/production`) | Show the full assembled architecture. Drag the cost estimator. Close on the readiness checklist and the "you built the whole stack" recap. |

**Facilitator tips**
- Every module opens on Hands-on. Flip to Theory only when the room wants the "why".
- The messy query `car window broke what now` in the RAG playground is the best single demo of why hybrid + rerank matters.
- Keep `python agent.py` open in a terminal beside the `/agents` page for the "the animation is real code" moment.

---

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build (verified passing)
npm run start   # serve the production build
npm run lint    # eslint
```

## Project layout

```
src/
  app/
    page.tsx              # Overview / problem statement
    rag/ agents/ mcp/ governance/ production/   # the five modules
    api/chat/route.ts     # grounded-answer endpoint (mock + live)
  components/              # per-module interactive components + shared ui
  lib/
    corpus.ts             # NorthWind knowledge base + scenario
    retrieval.ts          # keyword/vector/hybrid/rerank engine
    ragTechniques.ts      # the technique catalog
    agentRun.ts           # scripted LangGraph execution trace
    modules.ts            # nav registry
langgraph/
  agent.py                # real runnable LangGraph agent
  requirements.txt
```
