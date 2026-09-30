"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Edge,
  Node,
  MarkerType,
} from "reactflow";
import {
  buildTrace,
  GRAPH_NODES,
  AgentState,
  TraceStep,
} from "@/lib/agentRun";
import { Pill } from "@/components/ui";

const POS: Record<string, { x: number; y: number }> = {
  start: { x: 40, y: 20 },
  rewrite: { x: 40, y: 110 },
  lookup: { x: 40, y: 200 },
  retrieve: { x: 40, y: 290 },
  grade: { x: 300, y: 290 },
  generate: { x: 300, y: 200 },
  guard: { x: 300, y: 110 },
  end: { x: 300, y: 20 },
};

const kindColor: Record<string, string> = {
  start: "#60a5fa",
  llm: "#8b5cf6",
  tool: "#f59e0b",
  retrieve: "#34d399",
  decision: "#f472b6",
  guard: "#22d3ee",
  end: "#60a5fa",
};

function baseEdges(): Edge[] {
  const mk = (s: string, t: string, label?: string, dashed?: boolean): Edge => ({
    id: `${s}-${t}`,
    source: s,
    target: t,
    label,
    labelStyle: { fill: "#94a3b8", fontSize: 10 },
    style: { stroke: "#3a4570", strokeDasharray: dashed ? "4 4" : undefined },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3a4570" },
  });
  return [
    mk("start", "rewrite"),
    mk("rewrite", "lookup"),
    mk("lookup", "retrieve"),
    mk("retrieve", "grade"),
    mk("grade", "retrieve", "insufficient ↺", true),
    mk("grade", "generate", "sufficient"),
    mk("generate", "guard"),
    mk("guard", "end"),
  ];
}

export function AgentGraphRunner() {
  const trace = useMemo(() => buildTrace(), []);
  const [i, setI] = useState(-1); // current step index; -1 = not started
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state after applying steps 0..i
  const state: AgentState = useMemo(() => {
    const s: AgentState = {
      question: "",
      customerId: "",
      attempts: 0,
    };
    for (let k = 0; k <= i && k < trace.length; k++) {
      Object.assign(s, trace[k].statePatch);
    }
    return s;
  }, [i, trace]);

  const current: TraceStep | null = i >= 0 && i < trace.length ? trace[i] : null;
  const activeNode = current?.node;

  useEffect(() => {
    if (!playing) return;
    if (i >= trace.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setI((x) => x + 1), 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, i, trace.length]);

  const nodes: Node[] = GRAPH_NODES.map((n) => {
    const active = n.id === activeNode;
    const visited =
      i >= 0 && trace.slice(0, i + 1).some((t) => t.node === n.id);
    return {
      id: n.id,
      position: POS[n.id],
      data: { label: n.label },
      className: active ? "node-active" : "",
      style: {
        width: 190,
        padding: 10,
        borderRadius: 10,
        fontSize: 12,
        color: "#e8ecf6",
        background: active ? "#1a2340" : "#111830",
        border: `2px solid ${
          active ? kindColor[n.kind] : visited ? "#3a4570" : "#26304f"
        }`,
        opacity: i < 0 || visited || active ? 1 : 0.5,
      },
    };
  });

  const reset = () => {
    setPlaying(false);
    setI(-1);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Graph */}
      <div className="card !p-0 lg:col-span-3">
        <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2">
          <span className="text-xs uppercase tracking-widest text-slate-500">
            StateGraph · live execution
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (i >= trace.length - 1) return;
                setPlaying(false);
                setI((x) => x + 1);
              }}
              className="btn-ghost !px-3 !py-1 text-xs"
              disabled={i >= trace.length - 1}
            >
              Step ▶
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="btn-primary !px-3 !py-1 text-xs"
              disabled={i >= trace.length - 1}
            >
              {playing ? "Pause ⏸" : "Run ▶▶"}
            </button>
            <button onClick={reset} className="btn-ghost !px-3 !py-1 text-xs">
              Reset ↺
            </button>
          </div>
        </div>
        <div style={{ height: 400 }}>
          <ReactFlow
            nodes={nodes}
            edges={baseEdges()}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1a2340" gap={20} />
          </ReactFlow>
        </div>
      </div>

      {/* State + trace */}
      <div className="space-y-4 lg:col-span-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="section-title">Current step</span>
            <span className="text-xs text-slate-500">
              {i < 0 ? "idle" : `${i + 1} / ${trace.length}`}
            </span>
          </div>
          {current ? (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: kindColor[current.kind] }}
                />
                <span className="font-semibold text-white">
                  {current.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {current.log}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Press <b className="text-white">Run</b> to watch the agent reason
              through the NorthWind request — including a retrieval retry loop.
            </p>
          )}
        </div>

        <div className="card">
          <span className="section-title">Agent state (shared)</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <Row k="attempts" v={String(state.attempts)} />
            <Row k="rewritten" v={state.rewritten ?? "—"} />
            <Row
              k="account.glassRider"
              v={
                state.account
                  ? String((state.account as { glassRider?: boolean }).glassRider)
                  : "—"
              }
            />
            <Row
              k="retrieved"
              v={
                state.retrieved
                  ? state.retrieved.map((r) => r.id).join(", ")
                  : "—"
              }
            />
            <Row
              k="grade"
              v={state.grade ?? "—"}
              highlight={state.grade === "insufficient" ? "amber" : "green"}
            />
            <Row
              k="citations"
              v={state.citations ? state.citations.join(", ") : "—"}
            />
          </div>
          {state.answer && (
            <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-slate-200">
              <div className="mb-1 flex items-center gap-2">
                <Pill color="green">final answer</Pill>
              </div>
              {state.answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: "amber" | "green";
}) {
  const color =
    highlight === "amber"
      ? "text-amber-300"
      : highlight === "green"
      ? "text-emerald-300"
      : "text-slate-200";
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-700/60 pb-1.5">
      <span className="font-mono text-slate-500">{k}</span>
      <span className={`text-right font-mono ${color}`}>{v}</span>
    </div>
  );
}
