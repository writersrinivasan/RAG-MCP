"use client";

import ReactFlow, { Background, Edge, Node, MarkerType } from "reactflow";

export type NodeState = "idle" | "active" | "done";

const NODES = [
  { id: "rewrite", label: "① rewrite_query", kind: "llm" },
  { id: "lookup", label: "② lookup_account\n(MCP)", kind: "tool" },
  { id: "retrieve", label: "③ retrieve_policies\n(RAG)", kind: "rag" },
  { id: "grade", label: "④ grade_documents", kind: "decision" },
  { id: "generate", label: "⑤ generate_answer", kind: "llm" },
  { id: "guard", label: "⑥ governance_check", kind: "guard" },
];

const POS: Record<string, { x: number; y: number }> = {
  rewrite: { x: 20, y: 20 },
  lookup: { x: 20, y: 120 },
  retrieve: { x: 20, y: 230 },
  grade: { x: 290, y: 230 },
  generate: { x: 290, y: 120 },
  guard: { x: 290, y: 20 },
};

const kindColor: Record<string, string> = {
  llm: "#8b5cf6",
  tool: "#f59e0b",
  rag: "#34d399",
  decision: "#f472b6",
  guard: "#22d3ee",
};

const mk = (s: string, t: string, label?: string, dashed?: boolean): Edge => ({
  id: `${s}-${t}`,
  source: s,
  target: t,
  label,
  labelStyle: { fill: "#94a3b8", fontSize: 10 },
  style: { stroke: "#3a4570", strokeDasharray: dashed ? "4 4" : undefined },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3a4570" },
});

const EDGES: Edge[] = [
  mk("rewrite", "lookup"),
  mk("lookup", "retrieve"),
  mk("retrieve", "grade"),
  mk("grade", "retrieve", "retry ↺", true),
  mk("grade", "generate", "ok"),
  mk("generate", "guard"),
];

export function LiveGraph({ states }: { states: Record<string, NodeState> }) {
  const nodes: Node[] = NODES.map((n) => {
    const st = states[n.id] ?? "idle";
    const active = st === "active";
    const done = st === "done";
    return {
      id: n.id,
      position: POS[n.id],
      data: { label: n.label },
      className: active ? "node-active" : "",
      style: {
        width: 180,
        padding: 10,
        borderRadius: 10,
        fontSize: 12,
        whiteSpace: "pre-line" as const,
        color: "#e8ecf6",
        background: active ? "#1a2340" : "#111830",
        border: `2px solid ${
          active ? kindColor[n.kind] : done ? kindColor[n.kind] : "#26304f"
        }`,
        opacity: st === "idle" ? 0.55 : 1,
      },
    };
  });

  return (
    <div className="card !p-0">
      <div className="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
        Agent graph · lights up as each node runs
      </div>
      <div style={{ height: 360 }}>
        <ReactFlow
          nodes={nodes}
          edges={EDGES}
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
