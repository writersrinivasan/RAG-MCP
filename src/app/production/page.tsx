import { ModuleHeader, TrackTabs, Callout } from "@/components/ui";
import { ArchDiagram } from "@/components/production/ArchDiagram";
import { CostEstimator } from "@/components/production/CostEstimator";
import { ShipChecklist } from "@/components/production/ShipChecklist";

export default function ProductionPage() {
  return (
    <div>
      <ModuleHeader eyebrow="Step 5 · From demo to dependable" title="Production" minutes={15}>
        A notebook that works once is not a product. Production is about the
        boring, vital things: does it stay up, stay fast, stay cheap, and can you
        see what it&apos;s doing? Here&apos;s the whole system, assembled.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🏗️ The full reference architecture
              </h2>
              <p className="mb-3 max-w-3xl text-sm text-slate-400">
                Everything from the previous four modules, wired into one
                serving path — gateway, guardrails, the LangGraph agent, the
                LLM, the vector DB, MCP tools, and observability.
              </p>
              <ArchDiagram />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                💰 Cost & latency estimator
              </h2>
              <p className="mb-3 max-w-3xl text-sm text-slate-400">
                Drag the levers to feel how token count, caching and model
                pricing drive your monthly bill at NorthWind&apos;s volume.
              </p>
              <CostEstimator />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                ✅ Ship-it checklist
              </h2>
              <ShipChecklist />
            </section>
          </div>
        }
        theory={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card">
                <div className="text-lg font-semibold text-white">
                  📊 Observability
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  You can&apos;t operate what you can&apos;t see. Trace every
                  request end to end (each node, tool call, token), watch latency
                  and cost, and alert on drift. Tools: LangSmith,
                  OpenTelemetry, Langfuse.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">
                  ⚡ Latency
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Stream tokens for perceived speed, run retrieval and tool calls
                  in parallel where possible, and keep prompts tight. Every extra
                  retrieved chunk is latency and cost.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">
                  💰 Cost control
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Cache repeat questions, route easy queries to cheaper models,
                  and cap context size. Cost scales with tokens × traffic —
                  small per-request savings compound fast.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">
                  🔁 Lifecycle
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Version prompts, models and the index. Evaluate on a golden set
                  in CI, roll out behind flags, and monitor for quality drift as
                  documents and behavior change.
                </p>
              </div>
            </div>

            <Callout tone="warn" title="The failure modes that bite in production">
              <ul className="ml-4 list-disc space-y-1">
                <li><b>Silent quality drift</b> — answers degrade as docs change and no one notices without eval.</li>
                <li><b>Runaway loops</b> — an un-capped agent burns budget on one request.</li>
                <li><b>Cost surprise</b> — a prompt tweak doubles token usage across millions of calls.</li>
                <li><b>Stale index</b> — a policy updated but never re-embedded, so the agent cites the old rule.</li>
              </ul>
            </Callout>

            <Callout tone="success" title="You've now built the whole stack">
              RAG for knowledge · LangGraph for reasoning · MCP for tools ·
              Governance for trust · Production for scale. That is enterprise
              agentic AI, end to end.
            </Callout>
          </div>
        }
      />
    </div>
  );
}
