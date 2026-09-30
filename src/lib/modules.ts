export type ModuleDef = {
  slug: string;
  href: string;
  title: string;
  short: string;
  minutes: number;
  blurb: string;
  icon: string; // emoji for zero-dependency icons
};

export const MODULES: ModuleDef[] = [
  {
    slug: "overview",
    href: "/",
    title: "The Problem",
    short: "Overview",
    minutes: 15,
    blurb:
      "Meet NorthWind Insurance and the support & compliance problem we will solve with an agentic system.",
    icon: "🎯",
  },
  {
    slug: "rag",
    href: "/rag",
    title: "RAG Deep Dive",
    short: "RAG",
    minutes: 35,
    blurb:
      "How retrieval-augmented generation works, every major technique, and an interactive retrieval playground.",
    icon: "📚",
  },
  {
    slug: "agents",
    href: "/agents",
    title: "LangGraph Agents",
    short: "Agents",
    minutes: 30,
    blurb:
      "Watch a LangGraph agent graph execute step by step over the NorthWind scenario, with runnable Python.",
    icon: "🕸️",
  },
  {
    slug: "assistant",
    href: "/assistant",
    title: "Live Assistant",
    short: "Assistant",
    minutes: 20,
    blurb:
      "The capstone: a live Groq-powered agent you ask questions, visualizing every RAG + MCP message as it happens.",
    icon: "🎙️",
  },
  {
    slug: "mcp",
    href: "/mcp",
    title: "MCP",
    short: "MCP",
    minutes: 20,
    blurb:
      "Model Context Protocol: how agents connect to tools and data through a standard client/server contract.",
    icon: "🔌",
  },
  {
    slug: "governance",
    href: "/governance",
    title: "Governance",
    short: "Governance",
    minutes: 15,
    blurb:
      "Guardrails, PII handling, access control, human-in-the-loop and audit trails you can trigger live.",
    icon: "🛡️",
  },
  {
    slug: "production",
    href: "/production",
    title: "Production",
    short: "Production",
    minutes: 15,
    blurb:
      "Reference architecture, observability, cost & latency, evaluation gates and a ship-it checklist.",
    icon: "🚀",
  },
];

export const TOTAL_MINUTES = MODULES.reduce((a, m) => a + m.minutes, 0);
