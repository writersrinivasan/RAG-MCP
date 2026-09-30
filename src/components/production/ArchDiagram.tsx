"use client";

import ReactFlow, { Background, Edge, Node, MarkerType } from "reactflow";

const box = (border: string, w = 150) => ({
  background: "#111830",
  border: `2px solid ${border}`,
  borderRadius: 10,
  color: "#e8ecf6",
  fontSize: 11,
  padding: 9,
  width: w,
});

const nodes: Node[] = [
  { id: "user", position: { x: 0, y: 140 }, data: { label: "👤 Customer\nweb / chat" }, style: box("#60a5fa") },
  { id: "gw", position: { x: 190, y: 140 }, data: { label: "API gateway\nauth · rate limit" }, style: box("#60a5fa") },
  { id: "guard-in", position: { x: 380, y: 140 }, data: { label: "🛡️ Input guardrails" }, style: box("#22d3ee") },
  { id: "agent", position: { x: 570, y: 140 }, data: { label: "🕸️ LangGraph agent\norchestrator" }, style: box("#8b5cf6") },
  { id: "llm", position: { x: 790, y: 30 }, data: { label: "🧠 LLM\n(hosted / self-host)" }, style: box("#8b5cf6") },
  { id: "vector", position: { x: 790, y: 130 }, data: { label: "🧭 Vector DB\n+ embeddings" }, style: box("#34d399") },
  { id: "mcp", position: { x: 790, y: 230 }, data: { label: "🔌 MCP servers\ntools · data" }, style: box("#f59e0b") },
  { id: "guard-out", position: { x: 570, y: 300 }, data: { label: "🛡️ Output guardrails" }, style: box("#22d3ee") },
  { id: "obs", position: { x: 340, y: 300 }, data: { label: "📊 Observability\ntraces · metrics · cost" }, style: box("#f472b6", 170) },
];

const mk = (s: string, t: string, label?: string): Edge => ({
  id: `${s}-${t}`,
  source: s,
  target: t,
  label,
  labelStyle: { fill: "#94a3b8", fontSize: 9 },
  style: { stroke: "#3a4570" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3a4570" },
});

const edges: Edge[] = [
  mk("user", "gw"),
  mk("gw", "guard-in"),
  mk("guard-in", "agent"),
  mk("agent", "llm"),
  mk("agent", "vector", "RAG"),
  mk("agent", "mcp", "tools"),
  mk("agent", "guard-out"),
  mk("guard-out", "obs"),
];

export function ArchDiagram() {
  return (
    <div className="card !p-0">
      <div className="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
        Reference architecture · everything from the last 4 modules, assembled
      </div>
      <div style={{ height: 380 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
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
  );
}
