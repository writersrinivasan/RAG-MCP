"use client";

import { useState } from "react";
import { SCENARIO } from "@/lib/corpus";
import { Pill } from "@/components/ui";

type ApiResult = {
  mode: string;
  answer: string;
  citations?: string[];
  sources?: { id: string; title: string; score: number }[];
  note?: string;
};

export function AssistantWidget() {
  const [q, setQ] = useState(SCENARIO.customerQuestion);
  const [res, setRes] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ask = async () => {
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Request failed");
      setRes(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="section-title">🤖 Ask the grounded assistant</span>
        {res && (
          <Pill color={res.mode === "live" ? "green" : "blue"}>
            {res.mode} mode
          </Pill>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        This hits the real <code>/api/chat</code> endpoint. It retrieves from the
        corpus and answers with citations. Offline by default; add an API key for
        a live model.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          className="flex-1 rounded-lg border border-ink-600 bg-ink-950/70 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
          placeholder="Ask about coverage, deductibles, claims…"
        />
        <button onClick={ask} disabled={loading} className="btn-primary text-sm">
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/5 p-3 text-sm text-rose-200">
          {err}
        </div>
      )}

      {res && (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-slate-200">
            {res.answer}
          </div>
          {res.sources && res.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Retrieved:</span>
              {res.sources.map((s) => (
                <Pill key={s.id} color="slate">
                  {s.id} · {s.score}
                </Pill>
              ))}
            </div>
          )}
          {res.note && (
            <div className="text-xs text-amber-300">Note: {res.note}</div>
          )}
        </div>
      )}
    </div>
  );
}
