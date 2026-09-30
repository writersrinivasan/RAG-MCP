"use client";

import ReactFlow, { Background, Edge, Node, MarkerType } from "reactflow";

const box = (border: string) => ({
  background: "#111830",
  border: `2px solid ${border}`,
  borderRadius: 10,
  color: "#e8ecf6",
  fontSize: 12,
  padding: 10,
  width: 160,
});

const nodes: Node[] = [
  { id: "host", position: { x: 0, y: 120 }, data: { label: "Host app\n(NorthWind agent)" }, style: box("#60a5fa") },
  { id: "client", position: { x: 210, y: 120 }, data: { label: "MCP Client\n(1 per server)" }, style: box("#60a5fa") },
  { id: "server", position: { x: 430, y: 120 }, data: { label: "MCP Server\nnorthwind-tools" }, style: box("#34d399") },
  { id: "tools", position: { x: 660, y: 20 }, data: { label: "🔧 Tools\nget_account, file_claim" }, style: box("#f59e0b") },
  { id: "res", position: { x: 660, y: 120 }, data: { label: "📄 Resources\npolicy docs" }, style: box("#8b5cf6") },
  { id: "prompts", position: { x: 660, y: 220 }, data: { label: "💬 Prompts\ntemplates" }, style: box("#22d3ee") },
];

const mk = (s: string, t: string, label?: string): Edge => ({
  id: `${s}-${t}`,
  source: s,
  target: t,
  label,
  labelStyle: { fill: "#94a3b8", fontSize: 10 },
  style: { stroke: "#3a4570" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3a4570" },
});

const edges: Edge[] = [
  mk("host", "client"),
  mk("client", "server", "JSON-RPC"),
  mk("server", "tools"),
  mk("server", "res"),
  mk("server", "prompts"),
];

export function McpDiagram() {
  return (
    <div className="card !p-0">
      <div className="border-b border-ink-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
        MCP architecture · host → client → server → capabilities
      </div>
      <div style={{ height: 300 }}>
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
