import Link from "next/link";
import { MODULES, TOTAL_MINUTES } from "@/lib/modules";
import { SCENARIO } from "@/lib/corpus";
import { Callout, Pill } from "@/components/ui";

export default function OverviewPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-ink-600 bg-gradient-to-br from-brand-600/15 via-ink-900 to-accent-500/10 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Pill color="blue">Enterprise Agentic AI</Pill>
          <Pill color="violet">LangGraph</Pill>
          <Pill color="green">Hands-on</Pill>
          <span className="chip">⏱ ~{TOTAL_MINUTES} min</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white">
          Build an agent that answers insurance questions —
          <span className="text-brand-300"> safely, accurately, in production.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          This is not a slide deck. It is a working system. You will follow one
          real problem end to end: how a{" "}
          <span className="font-semibold text-white">LangGraph agent</span> uses{" "}
          <span className="font-semibold text-white">RAG</span> to find answers,
          reaches tools over <span className="font-semibold text-white">MCP</span>
          , stays inside <span className="font-semibold text-white">governance</span>{" "}
          guardrails, and runs in{" "}
          <span className="font-semibold text-white">production</span>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/rag" className="btn-primary">
            Start the build →
          </Link>
          <Link href="/agents" className="btn-ghost">
            Jump to the live agent graph
          </Link>
        </div>
      </section>

      {/* The problem statement */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="section-title">The industry problem</div>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {SCENARIO.company}: the support queue is drowning
          </h2>
          <div className="mt-3 space-y-3 text-slate-300">
            <p>
              {SCENARIO.company} handles thousands of auto-policy questions a
              day. Human agents spend most of their time re-reading the same
              policy PDFs to answer the same questions — while customers wait,
              and while a single wrong answer about a{" "}
              <span className="text-white">deductible</span> or{" "}
              <span className="text-white">coverage</span> can become a
              compliance incident.
            </p>
            <p>
              Leadership wants an AI assistant. But it must be{" "}
              <span className="text-white">accurate</span> (no hallucinated
              policy terms), <span className="text-white">safe</span> (never leak
              personal data), <span className="text-white">auditable</span>
              (every answer traceable), and{" "}
              <span className="text-white">cheap and fast</span> enough to run at
              scale.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-ink-600 bg-ink-950/60 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              The customer message we must answer
            </div>
            <p className="mt-2 text-lg font-medium text-white">
              “{SCENARIO.customerQuestion}”
            </p>
            <div className="mt-2 text-xs text-slate-400">
              Customer {SCENARIO.customerId} ·{" "}
              <span className="text-amber-300">
                Hidden fact the agent must discover: {SCENARIO.hiddenContext}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Why naive GPT fails here</div>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <span>❌</span>
              <span>
                It <b className="text-white">doesn&apos;t know</b> this
                customer has the Glass Rider — the answer depends on private
                account data.
              </span>
            </li>
            <li className="flex gap-2">
              <span>❌</span>
              <span>
                It will <b className="text-white">confidently invent</b>{" "}
                deductible numbers that aren&apos;t in the current policy.
              </span>
            </li>
            <li className="flex gap-2">
              <span>❌</span>
              <span>
                It has <b className="text-white">no audit trail</b> and no way
                to prove why it said what it said.
              </span>
            </li>
          </ul>
          <Callout tone="success" title="The fix">
            Ground the model in real documents (RAG), give it tools (MCP), wrap
            it in policy (governance), and instrument it (production).
          </Callout>
        </div>
      </section>

      {/* The 4 pillars = the agenda */}
      <section>
        <div className="section-title">Your path — one system, four capabilities</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.filter((m) => m.slug !== "overview").map((m, i) => (
            <Link
              key={m.slug}
              href={m.href}
              className="card group transition hover:border-brand-500/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{m.icon}</span>
                <span className="chip">Step {i + 1} · {m.minutes} min</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white group-hover:text-brand-300">
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{m.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="card">
        <div className="section-title">How this session works</div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-2xl">🧪</div>
            <div className="mt-1 font-semibold text-white">Hands-on first</div>
            <p className="text-sm text-slate-400">
              Every module opens on an interactive panel. Click, drag sliders,
              run the graph. Learn by doing.
            </p>
          </div>
          <div>
            <div className="text-2xl">📖</div>
            <div className="mt-1 font-semibold text-white">Theory on tap</div>
            <p className="text-sm text-slate-400">
              Flip the toggle for the concepts, definitions and diagrams behind
              what you just did.
            </p>
          </div>
          <div>
            <div className="text-2xl">🔌</div>
            <div className="mt-1 font-semibold text-white">Zero setup</div>
            <p className="text-sm text-slate-400">
              Runs fully offline in demo mode. Add an API key later for live LLM
              calls — same UI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
