import { ModuleHeader, TrackTabs, Callout, CodeBlock, Pill } from "@/components/ui";
import { AgentGraphRunner } from "@/components/agents/AgentGraphRunner";

const GRAPH_CODE = `from langgraph.graph import StateGraph, START, END

g = StateGraph(AgentState)
g.add_node("rewrite", rewrite_query)
g.add_node("lookup", lookup_account)      # <- MCP tool call
g.add_node("retrieve", retrieve_policies) # <- RAG
g.add_node("grade", grade_documents)      # <- self-reflection
g.add_node("generate", generate_answer)
g.add_node("guard", governance_check)     # <- governance

g.add_edge(START, "rewrite")
g.add_edge("rewrite", "lookup")
g.add_edge("lookup", "retrieve")
g.add_edge("retrieve", "grade")

# conditional edge = the loop: retry retrieval until context is good
g.add_conditional_edges("grade", route_after_grade, {
    "retrieve": "retrieve",
    "generate": "generate",
})
g.add_edge("generate", "guard")
g.add_edge("guard", END)

app = g.compile()
answer = app.invoke({"question": q, "customer_id": "CUST-88213"})`;

export default function AgentsPage() {
  return (
    <div>
      <ModuleHeader eyebrow="Step 2 · Agentic orchestration with LangGraph" title="LangGraph Agents" minutes={30}>
        RAG alone is a single lookup. An <b>agent</b> can plan, use tools, check
        its own work, and loop until the answer is good enough. LangGraph models
        this as a <b>graph of nodes</b> that share state — and here you can watch
        one run, node by node.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-8">
            <Callout tone="info" title="What you're about to watch">
              The agent will handle the NorthWind windshield request. Notice it
              calls a <b>tool</b> to discover the Glass Rider, does a first
              retrieval that&apos;s <b>not good enough</b>, and{" "}
              <b className="text-amber-300">loops back to retrieve again</b>{" "}
              before answering. That loop is the whole point of agentic RAG.
            </Callout>

            <AgentGraphRunner />

            <Callout tone="success" title="Want to drive it yourself with a live LLM?">
              This run is a scripted trace so it&apos;s identical every time.
              Head to the{" "}
              <a href="/assistant" className="font-semibold text-brand-300 underline">
                Live Assistant
              </a>{" "}
              to ask your own questions and watch the same graph run for real,
              powered by Groq.
            </Callout>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">
                The same graph, in real LangGraph code
              </h2>
              <p className="mb-3 max-w-3xl text-sm text-slate-400">
                This is the actual structure of the runnable script in{" "}
                <code className="rounded bg-ink-800 px-1.5 py-0.5 text-brand-300">
                  /langgraph/agent.py
                </code>
                . It runs offline in demo mode — no API key needed.
              </p>
              <CodeBlock lang="python" code={GRAPH_CODE} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill color="violet">StateGraph</Pill>
                <Pill color="amber">tools</Pill>
                <Pill color="green">conditional edges</Pill>
                <Pill color="blue">shared state</Pill>
              </div>
            </section>
          </div>
        }
        theory={
          <div className="space-y-6">
            <div className="card">
              <div className="section-title">Why a graph, not a chain?</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                A simple chain runs A → B → C once. Real work needs{" "}
                <b>branches</b> (if context is weak, retry) and <b>loops</b>{" "}
                (keep reasoning until done). LangGraph makes the control flow an
                explicit, inspectable graph, so you can see, debug, and govern
                exactly how the agent decides.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="card">
                <div className="text-lg font-semibold text-white">🧩 Nodes</div>
                <p className="mt-1 text-sm text-slate-300">
                  Plain functions that take the state and return an update. A
                  node can call an LLM, a tool, a retriever, or just compute.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">🔗 Edges</div>
                <p className="mt-1 text-sm text-slate-300">
                  Fixed edges always go A→B. <b>Conditional edges</b> pick the
                  next node based on state — this is how you get branching and
                  loops.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">📦 State</div>
                <p className="mt-1 text-sm text-slate-300">
                  A shared, typed object every node reads and writes. It is the
                  agent&apos;s working memory for the request.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">
                  🔁 Cycles & control
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Loops with a safety cap, checkpoints for durability, and
                  human-in-the-loop interrupts before risky actions.
                </p>
              </div>
            </div>

            <Callout tone="success" title="Common agent patterns you can build on this">
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <b>ReAct</b> — reason, act with a tool, observe, repeat.
                </li>
                <li>
                  <b>Reflection</b> — a grader/critic node judges output and
                  sends it back for another pass (what we do here).
                </li>
                <li>
                  <b>Plan-and-execute</b> — one node drafts a plan, others carry
                  out each step.
                </li>
                <li>
                  <b>Multi-agent</b> — a supervisor routes work to specialist
                  sub-graphs.
                </li>
              </ul>
            </Callout>

            <Callout tone="warn" title="Production guardrails for loops">
              Always cap iterations (our router stops at 3 attempts), add
              timeouts, and checkpoint state so a long run can resume. An
              un-capped agent loop is a runaway cost bill.
            </Callout>
          </div>
        }
      />
    </div>
  );
}
