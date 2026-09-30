"use client";

import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  MarkerType,
} from "reactflow";

const nodeStyle = {
  background: "#111830",
  border: "1px solid #26304f",
  borderRadius: 10,
  color: "#e8ecf6",
  fontSize: 12,
  padding: 10,
  width: 150,
};

const nodes: Node[] = [
  { id: "q", position: { x: 0, y: 120 }, data: { label: "① Query\ncustomer question" }, style: { ...nodeStyle, borderColor: "#60a5fa" } },
  { id: "rw", position: { x: 190, y: 120 }, data: { label: "② Query rewrite\nexpand / clarify" }, style: nodeStyle },
  { id: "emb", position: { x: 380, y: 40 }, data: { label: "③ Embed query\n→ vector" }, style: nodeStyle },
  { id: "idx", position: { x: 380, y: 200 }, data: { label: "Vector index\n(chunks)" }, style: { ...nodeStyle, borderColor: "#8b5cf6" } },
  { id: "ret", position: { x: 580, y: 120 }, data: { label: "④ Retrieve\nhybrid top-k" }, style: nodeStyle },
  { id: "rr", position: { x: 770, y: 120 }, data: { label: "⑤ Rerank\ncross-encoder" }, style: nodeStyle },
  { id: "gen", position: { x: 960, y: 120 }, data: { label: "⑥ Generate\nLLM + context" }, style: { ...nodeStyle, borderColor: "#34d399" } },
  { id: "cite", position: { x: 960, y: 250 }, data: { label: "⑦ Cite + verify\ngrounded answer" }, style: { ...nodeStyle, borderColor: "#34d399" } },
];

const e = (id: string, s: string, t: string, label?: string): Edge => ({
  id,
  source: s,
  target: t,
  label,
  labelStyle: { fill: "#94a3b8", fontSize: 10 },
  style: { stroke: "#3a4570" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3a4570" },
});

const edges: Edge[] = [
  e("e1", "q", "rw"),
  e("e2", "rw", "emb"),
  e("e3", "emb", "ret"),
  e("e4", "idx", "ret", "match"),
  e("e5", "ret", "rr"),
  e("e6", "rr", "gen"),
  e("e7", "gen", "cite"),
];

export function RagPipeline() {
  return (
    <div className="card !p-0">
      <div className="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
        The RAG pipeline · retrieve → augment → generate
      </div>
      <div style={{ height: 340 }}>
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
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
