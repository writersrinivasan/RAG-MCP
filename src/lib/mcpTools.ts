// The MCP tool layer for the NorthWind agent. Each tool mimics an MCP server
// capability: it takes structured args and returns structured data. The agent
// calls these by name, exactly like a real MCP tools/call.

import { search } from "./retrieval";

export type ToolResult = { ok: boolean; data: unknown };

// Simulated private account store — only reachable via a tool call (this is the
// data a bare LLM can never see).
const ACCOUNTS: Record<string, Record<string, unknown>> = {
  "CUST-88213": {
    customer_id: "CUST-88213",
    name: "J. Rivera",
    policy: "Auto",
    glass_rider: true,
    deductible: 250,
    status: "active",
  },
  "CUST-10001": {
    customer_id: "CUST-10001",
    name: "M. Chen",
    policy: "Auto",
    glass_rider: false,
    deductible: 500,
    status: "active",
  },
};

export const MCP_TOOLS = {
  get_account: {
    name: "get_account",
    description: "Fetch a policyholder's coverage details (private data).",
    call: (args: { customer_id?: string }): ToolResult => {
      const acct = ACCOUNTS[args.customer_id ?? ""];
      return acct
        ? { ok: true, data: acct }
        : { ok: false, data: { error: "not_found" } };
    },
  },
  search_policies: {
    name: "search_policies",
    description: "Semantic + keyword search over the policy knowledge base (RAG).",
    call: (args: { query?: string; topK?: number }): ToolResult => {
      const hits = search(args.query ?? "", {
        mode: "hybrid",
        alpha: 0.5,
        rerank: true,
        topK: args.topK ?? 3,
      });
      return {
        ok: true,
        data: hits.map((h) => ({
          id: h.doc.id,
          title: h.doc.title,
          text: h.doc.text,
          score: +(h.rerank ?? h.hybrid).toFixed(3),
        })),
      };
    },
  },
} as const;

export type RetrievedChunk = {
  id: string;
  title: string;
  text: string;
  score: number;
};
