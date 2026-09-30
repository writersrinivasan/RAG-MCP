import { ModuleHeader, TrackTabs, Callout } from "@/components/ui";
import { CommandCenter } from "@/components/assistant/CommandCenter";

export default function AssistantPage() {
  return (
    <div>
      <ModuleHeader
        eyebrow="Capstone · Live agentic assistant (Groq-powered)"
        title="Agent Command Center"
        minutes={20}
      >
        This is the whole workshop, alive. Ask any question and watch the real
        agent loop run — rewriting your query, calling MCP tools, retrieving with
        RAG, grading its own context, looping if it&apos;s not confident,
        generating a grounded answer, and passing governance — with every message
        between components streamed live.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-6">
            <Callout tone="info" title="How to demo this live">
              Type a real question and hit <b>Run agent</b>. Watch the graph
              light up node by node and the communication feed fill with the
              actual <b>LLM</b>, <b>MCP</b> and <b>governance</b> messages. Try
              switching the customer to <b>CUST-10001 (no rider)</b> and ask the
              same question — the answer changes because the MCP account data
              changes.
            </Callout>

            <CommandCenter />
          </div>
        }
        theory={
          <div className="space-y-6">
            <Callout tone="success" title="What makes this 'agentic'">
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <b>Tool use</b> — it decides to call MCP tools for private
                  account data and policy search.
                </li>
                <li>
                  <b>Self-reflection</b> — the grade node judges whether the
                  retrieved context is good enough.
                </li>
                <li>
                  <b>Looping</b> — if not, it retries retrieval with better
                  context instead of answering blindly.
                </li>
                <li>
                  <b>Grounding + governance</b> — it answers only from evidence,
                  cites sources, and passes a safety check before responding.
                </li>
              </ul>
            </Callout>

            <div className="card">
              <div className="section-title">Powered by Groq</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                When a Groq API key is configured, the <code>rewrite</code> and{" "}
                <code>generate</code> nodes call a real model over Groq&apos;s
                OpenAI-compatible API. Groq&apos;s low latency is what makes the
                step-by-step stream feel instant in a live room. With no key set,
                the same graph runs in deterministic mock mode so the
                visualization always works offline.
              </p>
            </div>

            <Callout tone="warn" title="This mirrors the LangGraph agent">
              The nodes and control flow here are the same as the{" "}
              <b>LangGraph Agents</b> module and the runnable{" "}
              <code>langgraph/agent.py</code>. The difference: this one is driven
              by <i>your</i> live question and a real LLM, streamed as it happens.
            </Callout>
          </div>
        }
      />
    </div>
  );
}
