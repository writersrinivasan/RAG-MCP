"use client";

import { useState } from "react";
import { Pill } from "@/components/ui";
import { search } from "@/lib/retrieval";

type ToolDef = {
  name: string;
  desc: string;
  params: { name: string; example: string }[];
  run: (args: Record<string, string>) => unknown;
};

// The MCP server's tool catalog for the NorthWind scenario.
const TOOLS: ToolDef[] = [
  {
    name: "get_account",
    desc: "Fetch a policyholder's account & coverage (private data).",
    params: [{ name: "customer_id", example: "CUST-88213" }],
    run: (a) =>
      a.customer_id === "CUST-88213"
        ? {
            customer_id: "CUST-88213",
            policy: "Auto",
            glass_rider: true,
            deductible: 250,
            status: "active",
          }
        : { error: "not_found" },
  },
  {
    name: "search_policies",
    desc: "Semantic search over the policy knowledge base (RAG retrieval).",
    params: [{ name: "query", example: "glass deductible waived" }],
    run: (a) =>
      search(a.query ?? "", { mode: "hybrid", rerank: true, topK: 3 }).map(
        (r) => ({ id: r.doc.id, title: r.doc.title, score: +(r.rerank ?? r.hybrid).toFixed(3) })
      ),
  },
  {
    name: "file_claim",
    desc: "Open a claim. Write action — requires human approval (see Governance).",
    params: [
      { name: "customer_id", example: "CUST-88213" },
      { name: "type", example: "glass" },
    ],
    run: (a) => ({
      claim_id: "CLM-" + Math.floor(1000 + Math.random() * 9000),
      status: "pending_human_approval",
      customer_id: a.customer_id,
      type: a.type,
    }),
  },
];

export function McpConsole() {
  const [active, setActive] = useState(0);
  const [args, setArgs] = useState<Record<string, string>>({
    customer_id: "CUST-88213",
  });
  const [log, setLog] = useState<
    { dir: "req" | "res"; body: unknown }[]
  >([]);
  const [busy, setBusy] = useState(false);

  const tool = TOOLS[active];

  const call = async () => {
    const request = {
      jsonrpc: "2.0",
      id: log.length + 1,
      method: "tools/call",
      params: { name: tool.name, arguments: args },
    };
    setBusy(true);
    setLog((l) => [...l, { dir: "req", body: request }]);
    await new Promise((r) => setTimeout(r, 550));
    const result = tool.run(args);
    const response = {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        content: [{ type: "text", text: JSON.stringify(result) }],
        isError: false,
      },
    };
    setLog((l) => [...l, { dir: "res", body: response }]);
    setBusy(false);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Server tool catalog */}
      <div className="card lg:col-span-2">
        <div className="flex items-center justify-between">
          <span className="section-title">MCP Server</span>
          <Pill color="green">northwind-tools</Pill>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          The server advertises a list of tools. The agent (client) discovers
          them and calls them over a standard protocol.
        </p>
        <div className="mt-3 space-y-2">
          {TOOLS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => {
                setActive(i);
                const seed: Record<string, string> = {};
                t.params.forEach((p) => (seed[p.name] = p.example));
                setArgs(seed);
              }}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active === i
                  ? "border-brand-500 bg-brand-600/10"
                  : "border-ink-600 bg-ink-800/40 hover:border-brand-500/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-brand-300">
                  {t.name}()
                </span>
                {t.name === "file_claim" && (
                  <Pill color="amber">write</Pill>
                )}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Client caller + transcript */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="section-title">Client (the agent) calls the tool</span>
            <Pill color="blue">langgraph-agent</Pill>
          </div>
          <div className="mt-3 space-y-2">
            {tool.params.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <label className="w-28 shrink-0 font-mono text-xs text-slate-400">
                  {p.name}
                </label>
                <input
                  value={args[p.name] ?? ""}
                  onChange={(e) =>
                    setArgs((a) => ({ ...a, [p.name]: e.target.value }))
                  }
                  className="flex-1 rounded-md border border-ink-600 bg-ink-950/70 px-3 py-1.5 text-sm text-white outline-none focus:border-brand-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={call} disabled={busy} className="btn-primary text-sm">
              {busy ? "Calling…" : `Call ${tool.name}() →`}
            </button>
            <button
              onClick={() => setLog([])}
              className="btn-ghost text-sm"
            >
              Clear transcript
            </button>
          </div>
        </div>

        <div className="card">
          <span className="section-title">Protocol transcript (JSON-RPC 2.0)</span>
          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
            {log.length === 0 && (
              <div className="rounded-lg border border-dashed border-ink-600 p-4 text-center text-sm text-slate-500">
                Call a tool to see the request/response messages that flow over
                the MCP transport.
              </div>
            )}
            {log.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg border p-2 ${
                  m.dir === "req"
                    ? "border-brand-500/40 bg-brand-500/5"
                    : "border-emerald-500/40 bg-emerald-500/5"
                }`}
              >
                <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-400">
                  {m.dir === "req" ? "→ client → server" : "← server → client"}
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-200">
                  <code>{JSON.stringify(m.body, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
