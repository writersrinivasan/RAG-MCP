"use client";

import { useState } from "react";

const GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Quality & evaluation",
    items: [
      "Golden test set of real questions with expected answers",
      "RAG metrics tracked in CI (faithfulness, context recall, answer relevance)",
      "Regression gate: block deploy if scores drop",
      "Human review sample of production traffic",
    ],
  },
  {
    title: "Reliability",
    items: [
      "Timeouts + retries on every LLM and tool call",
      "Loop caps on agent cycles (no runaway)",
      "Graceful fallback answer when retrieval or model fails",
      "Fallback / secondary model provider configured",
    ],
  },
  {
    title: "Observability",
    items: [
      "Distributed tracing per request (LangSmith / OpenTelemetry)",
      "Token, latency and cost dashboards with alerts",
      "Structured logs for every node, tool call and decision",
    ],
  },
  {
    title: "Security & governance",
    items: [
      "Secrets in a vault, never in code",
      "Scoped, least-privilege credentials for each MCP tool",
      "Input + output guardrails enabled",
      "Immutable audit log retained per policy",
      "Human-in-the-loop on write / irreversible actions",
    ],
  },
  {
    title: "Cost & scale",
    items: [
      "Semantic + exact caching for repeat queries",
      "Model routing: small model for easy, large for hard",
      "Rate limiting and per-tenant quotas",
      "Load tested at expected peak",
    ],
  },
];

export function ShipChecklist() {
  const all = GROUPS.flatMap((g) => g.items);
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (item: string) =>
    setDone((s) => {
      const n = new Set(s);
      n.has(item) ? n.delete(item) : n.add(item);
      return n;
    });

  const pct = Math.round((done.size / all.length) * 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="section-title">Production readiness checklist</span>
        <span className="text-sm font-semibold text-white">{pct}% ready</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="mb-2 text-sm font-semibold text-white">
              {g.title}
            </div>
            <div className="space-y-1.5">
              {g.items.map((item) => {
                const checked = done.has(item);
                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-start gap-2 text-sm text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item)}
                      className="mt-0.5 h-4 w-4 accent-emerald-500"
                    />
                    <span className={checked ? "text-slate-500 line-through" : ""}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
