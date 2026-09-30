"use client";

import { useRef, useState } from "react";
import { SCENARIO } from "@/lib/corpus";
import { Pill } from "@/components/ui";
import { LiveGraph, NodeState } from "./LiveGraph";

type Comm = { from: string; to: string; text: string; t: number };
type Chunk = { id: string; title: string; text: string; score: number };
type Check = { label: string; pass: boolean };

const NODE_IDS = ["rewrite", "lookup", "retrieve", "grade", "generate", "guard"];

const PRESETS = [
  { q: SCENARIO.customerQuestion, cid: "CUST-88213" },
  { q: "Is my windshield deductible waived?", cid: "CUST-88213" },
  { q: "Do I have to pay a deductible for glass?", cid: "CUST-10001" },
  { q: "How long does a glass claim take to approve?", cid: "CUST-88213" },
];

const fromLabel: Record<string, { label: string; color: string }> = {
  agent: { label: "AGENT", color: "text-brand-300" },
  llm: { label: "LLM (Groq)", color: "text-accent-400" },
  mcp: { label: "MCP", color: "text-amber-300" },
  guard: { label: "GUARD", color: "text-cyan-300" },
  self: { label: "AGENT·self", color: "text-slate-400" },
};

export function CommandCenter() {
  const [question, setQuestion] = useState(SCENARIO.customerQuestion);
  const [customerId, setCustomerId] = useState("CUST-88213");
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<string>("");

  const [states, setStates] = useState<Record<string, NodeState>>({});
  const [comms, setComms] = useState<Comm[]>([]);
  const [rewritten, setRewritten] = useState<string>("");
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [retrieved, setRetrieved] = useState<Chunk[]>([]);
  const [grade, setGrade] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const [checks, setChecks] = useState<Check[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [citations, setCitations] = useState<string[]>([]);
  const [tokens, setTokens] = useState(0);
  const [error, setError] = useState<string>("");

  const feedRef = useRef<HTMLDivElement | null>(null);

  const reset = () => {
    setStates({});
    setComms([]);
    setRewritten("");
    setAccount(null);
    setRetrieved([]);
    setGrade("");
    setAttempts(0);
    setChecks([]);
    setAnswer("");
    setCitations([]);
    setTokens(0);
    setError("");
  };

  const setNode = (id: string, st: NodeState) =>
    setStates((s) => ({ ...s, [id]: st }));

  const pushComm = (c: Omit<Comm, "t">) =>
    setComms((cs) => {
      const next = [...cs, { ...c, t: Date.now() }];
      queueMicrotask(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
      });
      return next;
    });

  const run = async () => {
    if (!question.trim() || running) return;
    reset();
    setRunning(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, customerId }),
      });
      if (!res.body) throw new Error("No stream returned");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());
          handleEvent(evt);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "stream failed");
    } finally {
      setRunning(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEvent = (evt: any) => {
    switch (evt.type) {
      case "meta":
        setMode(evt.mode);
        break;
      case "comm":
        pushComm({ from: evt.from, to: evt.to, text: evt.text });
        break;
      case "node": {
        const id = evt.node as string;
        if (evt.phase === "start") {
          setNode(id, "active");
        } else {
          setNode(id, "done");
          if (id === "rewrite" && evt.rewritten) setRewritten(evt.rewritten);
          if (id === "lookup" && evt.account) setAccount(evt.account);
          if (id === "retrieve" && evt.retrieved) {
            setRetrieved(evt.retrieved);
            if (evt.attempt) setAttempts(evt.attempt);
          }
          if (id === "grade" && evt.grade) setGrade(evt.grade);
          if (id === "generate") {
            if (evt.answer) setAnswer(evt.answer);
            if (evt.citations) setCitations(evt.citations);
          }
          if (id === "guard" && evt.checks) setChecks(evt.checks);
        }
        break;
      }
      case "final":
        setAnswer(evt.answer);
        setCitations(evt.citations ?? []);
        setAttempts(evt.attempts ?? 0);
        setTokens(evt.tokens ?? 0);
        setMode(evt.mode);
        break;
      case "error":
        setError(evt.message);
        break;
    }
  };

  const isLive = mode.startsWith("live");

  return (
    <div className="space-y-5">
      {/* Ask bar */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="section-title">🎙️ Live Q&amp;A — ask the agent anything</span>
          <div className="flex items-center gap-2">
            {mode && (
              <Pill color={isLive ? "green" : "blue"}>{mode}</Pill>
            )}
            <span className="text-xs text-slate-500">
              acting as{" "}
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="rounded border border-ink-600 bg-ink-950 px-1.5 py-0.5 text-slate-200"
              >
                <option value="CUST-88213">CUST-88213 (has Glass Rider)</option>
                <option value="CUST-10001">CUST-10001 (no rider)</option>
              </select>
            </span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. My windshield cracked — do I owe the deductible?"
            className="flex-1 rounded-lg border border-ink-600 bg-ink-950/70 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
          />
          <button onClick={run} disabled={running} className="btn-primary text-sm">
            {running ? "Running…" : "Run agent ▶"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(p.q);
                setCustomerId(p.cid);
              }}
              className="rounded-md border border-ink-600 bg-ink-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-brand-500/60 hover:text-white"
            >
              {p.q.length > 40 ? p.q.slice(0, 40) + "…" : p.q}
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/5 p-2 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LiveGraph states={states} />

        {/* Communication feed */}
        <div className="card !p-0">
          <div className="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
            Live communication feed · every message between components
          </div>
          <div ref={feedRef} className="max-h-[340px] space-y-2 overflow-y-auto p-3">
            {comms.length === 0 && (
              <div className="rounded-lg border border-dashed border-ink-600 p-6 text-center text-sm text-slate-500">
                Ask a question and watch the agent talk to the LLM, MCP tools and
                itself in real time.
              </div>
            )}
            {comms.map((c, i) => {
              const f = fromLabel[c.from] ?? { label: c.from, color: "text-slate-300" };
              const to = fromLabel[c.to]?.label ?? c.to;
              return (
                <div
                  key={i}
                  className="rounded-lg border border-ink-600 bg-ink-800/40 p-2 text-xs"
                >
                  <div className="mb-0.5 flex items-center gap-1 font-mono">
                    <span className={f.color}>{f.label}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-slate-400">{to}</span>
                  </div>
                  <div className="font-mono leading-relaxed text-slate-300">
                    {c.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* State details */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card">
          <span className="section-title">Query understanding</span>
          <div className="mt-2 text-sm">
            <div className="text-xs text-slate-500">rewritten query</div>
            <div className="font-mono text-slate-200">{rewritten || "—"}</div>
          </div>
          <div className="mt-3 text-sm">
            <div className="text-xs text-slate-500">account (via MCP)</div>
            {account ? (
              <div className="mt-1 space-y-0.5 font-mono text-xs text-slate-300">
                {Object.entries(account).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-slate-500">{k}</span>
                    <span
                      className={
                        k === "glass_rider"
                          ? v
                            ? "text-emerald-300"
                            : "text-amber-300"
                          : "text-slate-200"
                      }
                    >
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">—</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <span className="section-title">RAG retrieval</span>
            {grade && (
              <Pill color={grade === "sufficient" ? "green" : "amber"}>
                {grade} · {attempts} pass{attempts === 1 ? "" : "es"}
              </Pill>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {retrieved.length === 0 && (
              <div className="text-sm text-slate-500">—</div>
            )}
            {retrieved.map((c) => (
              <div
                key={c.id}
                className="rounded-md border border-ink-600 bg-ink-800/40 p-1.5 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-brand-300">{c.id}</span>
                  <span className="text-slate-400">{c.score}</span>
                </div>
                <div className="truncate text-slate-400">{c.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <span className="section-title">Governance</span>
          <div className="mt-2 space-y-1.5">
            {checks.length === 0 && (
              <div className="text-sm text-slate-500">—</div>
            )}
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <span>{c.pass ? "✅" : "🛑"}</span>
                <span className="text-slate-300">{c.label}</span>
              </div>
            ))}
          </div>
          {tokens > 0 && (
            <div className="mt-3 text-xs text-slate-500">
              LLM tokens used: <span className="text-slate-300">{tokens}</span>
            </div>
          )}
        </div>
      </div>

      {/* Final answer */}
      {answer && (
        <div className="card border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="section-title">✅ Grounded answer to the customer</span>
            <div className="flex gap-1.5">
              {citations.map((c) => (
                <Pill key={c} color="green">
                  {c}
                </Pill>
              ))}
            </div>
          </div>
          <p className="mt-2 leading-relaxed text-slate-100">{answer}</p>
        </div>
      )}
    </div>
  );
}
