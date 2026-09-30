// A scripted LangGraph-style execution trace over the NorthWind scenario.
// Each step mirrors a node in the graph and mutates a shared "state" object,
// exactly like LangGraph's StateGraph does. This drives the animated graph
// and the live state inspector on the /agents page.

import { search } from "./retrieval";
import { SCENARIO } from "./corpus";

export type AgentState = {
  question: string;
  customerId: string;
  rewritten?: string;
  account?: Record<string, unknown>;
  retrieved?: { id: string; title: string; score: number }[];
  grade?: "sufficient" | "insufficient";
  attempts: number;
  answer?: string;
  citations?: string[];
  escalated?: boolean;
};

export type TraceStep = {
  node: string; // matches a graph node id
  label: string;
  kind: "start" | "llm" | "tool" | "retrieve" | "decision" | "guard" | "end";
  log: string; // human-readable what-happened
  statePatch: Partial<AgentState>;
  edgeTo?: string; // which node we go to next (for conditional edges)
};

export const GRAPH_NODES = [
  { id: "start", label: "START", kind: "start" as const },
  { id: "rewrite", label: "rewrite_query", kind: "llm" as const },
  { id: "lookup", label: "lookup_account (MCP)", kind: "tool" as const },
  { id: "retrieve", label: "retrieve_policies", kind: "retrieve" as const },
  { id: "grade", label: "grade_documents", kind: "decision" as const },
  { id: "generate", label: "generate_answer", kind: "llm" as const },
  { id: "guard", label: "governance_check", kind: "guard" as const },
  { id: "end", label: "END", kind: "end" as const },
];

// Build the deterministic trace. It intentionally shows the "insufficient →
// retry" loop once, to demonstrate LangGraph's conditional edges/cycles.
export function buildTrace(): TraceStep[] {
  const q = SCENARIO.customerQuestion;

  const firstPass = search("windshield crack fix time", {
    mode: "vector",
    topK: 2,
  }).map((r) => ({
    id: r.doc.id,
    title: r.doc.title,
    score: +(r.vector).toFixed(3),
  }));

  const secondPass = search(
    "windshield glass deductible waived Glass Rider claim 24 hours",
    { mode: "hybrid", alpha: 0.5, rerank: true, topK: 3 }
  ).map((r) => ({
    id: r.doc.id,
    title: r.doc.title,
    score: +(r.rerank ?? r.hybrid).toFixed(3),
  }));

  return [
    {
      node: "start",
      label: "START",
      kind: "start",
      log: `New request received for ${SCENARIO.customerId}.`,
      statePatch: { question: q, customerId: SCENARIO.customerId, attempts: 0 },
      edgeTo: "rewrite",
    },
    {
      node: "rewrite",
      label: "rewrite_query",
      kind: "llm",
      log: "LLM rewrites the messy question into a clean retrieval query and notes the intent (coverage + deductible + SLA).",
      statePatch: {
        rewritten:
          "windshield glass damage: is deductible waived, and claim turnaround time?",
      },
      edgeTo: "lookup",
    },
    {
      node: "lookup",
      label: "lookup_account (MCP tool)",
      kind: "tool",
      log: "Agent calls the get_account MCP tool. This is the private fact naive GPT could never know.",
      statePatch: {
        account: {
          policy: "Auto",
          glassRider: true,
          deductible: 250,
          status: "active",
        },
      },
      edgeTo: "retrieve",
    },
    {
      node: "retrieve",
      label: "retrieve_policies",
      kind: "retrieve",
      log: "First retrieval pass (vector only, top-2). Broad but thin — misses the Glass Rider clause.",
      statePatch: { retrieved: firstPass, attempts: 1 },
      edgeTo: "grade",
    },
    {
      node: "grade",
      label: "grade_documents → insufficient",
      kind: "decision",
      log: "Grader node checks if context can answer the question. It cannot confirm the deductible waiver → returns INSUFFICIENT → conditional edge loops back to retrieve.",
      statePatch: { grade: "insufficient" },
      edgeTo: "retrieve",
    },
    {
      node: "retrieve",
      label: "retrieve_policies (retry)",
      kind: "retrieve",
      log: "Second pass uses hybrid search + reranking with account context (Glass Rider). Now it pulls the exact clauses.",
      statePatch: { retrieved: secondPass, attempts: 2 },
      edgeTo: "grade",
    },
    {
      node: "grade",
      label: "grade_documents → sufficient",
      kind: "decision",
      log: "Context now contains the Glass Rider waiver (POL-500/POL-100) and 24-hour SLA (CLM-205) → SUFFICIENT → proceed to generate.",
      statePatch: { grade: "sufficient" },
      edgeTo: "generate",
    },
    {
      node: "generate",
      label: "generate_answer",
      kind: "llm",
      log: "LLM writes a grounded answer using ONLY retrieved context + account facts, attaching citations.",
      statePatch: {
        answer:
          "Because you have the Glass Rider on your active Auto policy, your $250 comprehensive deductible is waived for this windshield glass claim — you pay nothing out of pocket when you use an approved vendor. Glass-only claims are typically approved within 24 hours.",
        citations: ["POL-500", "POL-100", "CLM-205"],
      },
      edgeTo: "guard",
    },
    {
      node: "guard",
      label: "governance_check",
      kind: "guard",
      log: "Governance node scans the draft for PII leaks and policy violations, confirms every claim is cited, and stamps the audit log. Passes.",
      statePatch: {},
      edgeTo: "end",
    },
    {
      node: "end",
      label: "END",
      kind: "end",
      log: "Final grounded, safe, audited answer returned to the customer.",
      statePatch: {},
    },
  ];
}
