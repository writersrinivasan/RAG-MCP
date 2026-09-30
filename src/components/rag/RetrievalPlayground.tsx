"use client";

import { useMemo, useState } from "react";
import { search, SearchOpts } from "@/lib/retrieval";
import { SCENARIO } from "@/lib/corpus";
import { Pill } from "@/components/ui";

const PRESETS = [
  SCENARIO.customerQuestion,
  "Is the deductible waived for glass?",
  "How long until my claim is approved?",
  "car window broke what now", // deliberately messy → shows vector wins
];

function bar(v: number, color: string) {
  const pct = Math.max(2, Math.min(100, Math.round(v * 100)));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RetrievalPlayground() {
  const [query, setQuery] = useState(SCENARIO.customerQuestion);
  const [mode, setMode] = useState<SearchOpts["mode"]>("hybrid");
  const [alpha, setAlpha] = useState(0.5);
  const [rerank, setRerank] = useState(true);

  const results = useMemo(
    () => search(query, { mode, alpha, rerank, topK: 5 }),
    [query, mode, alpha, rerank]
  );

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Controls */}
      <div className="card lg:col-span-2">
        <div className="section-title">Query</div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-lg border border-ink-600 bg-ink-950/70 p-3 text-sm text-white outline-none focus:border-brand-500"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className="rounded-md border border-ink-600 bg-ink-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-brand-500/60 hover:text-white"
            >
              {p.length > 34 ? p.slice(0, 34) + "…" : p}
            </button>
          ))}
        </div>

        <div className="mt-5 section-title">Retrieval strategy</div>
        <div className="mt-2 inline-flex rounded-lg border border-ink-600 bg-ink-900/60 p-1">
          {(["keyword", "vector", "hybrid"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                mode === m
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "hybrid" && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Keyword</span>
              <span className="text-white">
                α = {alpha.toFixed(2)} (vector weight)
              </span>
              <span>Vector</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="mt-1 w-full accent-brand-500"
            />
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={rerank}
            onChange={(e) => setRerank(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Apply cross-encoder reranking
        </label>

        <div className="mt-5 rounded-lg border border-ink-600 bg-ink-950/50 p-3 text-xs text-slate-400">
          <b className="text-slate-200">Try this:</b> switch to the messy query
          “car window broke what now”. Watch <b>keyword</b> struggle (no shared
          words) while <b>vector</b> still finds the glass docs. That gap is why
          production RAG uses <b className="text-brand-300">hybrid + rerank</b>.
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="section-title">
            Retrieved context (top {results.length})
          </div>
          <div className="text-xs text-slate-500">
            ranked by {rerank ? "rerank score" : mode + " score"}
          </div>
        </div>
        <div className="space-y-3">
          {results.map((r, i) => (
            <div
              key={r.doc.id}
              className={`card !p-4 ${
                i === 0 ? "ring-1 ring-brand-500/50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-700 text-xs font-bold text-slate-300">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-white">
                    {r.doc.title}
                  </span>
                </div>
                <Pill color="slate">{r.doc.id}</Pill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {r.doc.text}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>keyword</span>
                    <span className="text-slate-300">
                      {r.keyword.toFixed(3)}
                    </span>
                  </div>
                  {bar(r.keyword, "bg-emerald-500")}
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>vector</span>
                    <span className="text-slate-300">
                      {r.vector.toFixed(3)}
                    </span>
                  </div>
                  {bar(r.vector, "bg-brand-500")}
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>{rerank ? "rerank" : "hybrid"}</span>
                    <span className="text-slate-300">
                      {(r.rerank ?? r.hybrid).toFixed(3)}
                    </span>
                  </div>
                  {bar(r.rerank ?? r.hybrid, "bg-accent-500")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
