import { ModuleHeader, TrackTabs, Callout, CodeBlock, Pill } from "@/components/ui";
import { McpConsole } from "@/components/mcp/McpConsole";
import { McpDiagram } from "@/components/mcp/McpDiagram";

const SERVER_CODE = `# A minimal MCP server exposing NorthWind tools (Python SDK)
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("northwind-tools")

@mcp.tool()
def get_account(customer_id: str) -> dict:
    """Fetch a policyholder's coverage details."""
    return ACCOUNTS.get(customer_id, {"error": "not_found"})

@mcp.tool()
def search_policies(query: str) -> list[dict]:
    """Semantic search over the policy knowledge base."""
    return retriever.search(query, k=3)

if __name__ == "__main__":
    mcp.run()  # speaks JSON-RPC over stdio / HTTP`;

export default function McpPage() {
  return (
    <div>
      <ModuleHeader eyebrow="Step 3 · Model Context Protocol" title="MCP" minutes={20}>
        Our agent needs the customer&apos;s account data and the policy search —
        things that live outside the model. <b>MCP</b> is the USB-C for AI: one
        standard way to plug any agent into any tool or data source, instead of
        writing a bespoke integration every time.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-8">
            <Callout tone="info" title="Try the tool calls">
              Below is a live MCP client/server console. Pick a tool, edit the
              arguments, and call it. Watch the exact JSON-RPC messages that
              travel between the agent and the server — this is the same{" "}
              <code>get_account</code> call the LangGraph agent made in Step 2.
            </Callout>

            <McpConsole />

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">
                How it&apos;s wired
              </h2>
              <McpDiagram />
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">
                The server, in ~15 lines
              </h2>
              <p className="mb-3 max-w-3xl text-sm text-slate-400">
                Exposing a tool over MCP is mostly a decorator. Any MCP-aware
                client (Claude Desktop, your LangGraph agent, an IDE) can then
                discover and call it — no custom glue.
              </p>
              <CodeBlock lang="python" code={SERVER_CODE} />
            </section>
          </div>
        }
        theory={
          <div className="space-y-6">
            <Callout tone="warn" title="The problem MCP solves">
              Before MCP, every agent needed a custom integration for every tool
              and data source — an N×M explosion. MCP standardizes the contract
              so any compliant client works with any compliant server.
            </Callout>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="card">
                <div className="text-lg font-semibold text-white">🖥️ Host & Client</div>
                <p className="mt-1 text-sm text-slate-300">
                  The host is your app (the agent). It spins up one MCP{" "}
                  <b>client</b> per server it connects to.
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">🧰 Server</div>
                <p className="mt-1 text-sm text-slate-300">
                  A process that exposes capabilities. It can be local (stdio) or
                  remote (HTTP/SSE).
                </p>
              </div>
              <div className="card">
                <div className="text-lg font-semibold text-white">📡 Transport</div>
                <p className="mt-1 text-sm text-slate-300">
                  Messages are <b>JSON-RPC 2.0</b> over stdio or HTTP. Same
                  message shape everywhere.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="section-title">The three things a server can expose</div>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="flex gap-3">
                  <Pill color="amber">Tools</Pill>
                  <span>
                    Functions the model can <b>call</b> to take action or fetch
                    live data (<code>get_account</code>, <code>file_claim</code>).
                    Model-controlled.
                  </span>
                </div>
                <div className="flex gap-3">
                  <Pill color="violet">Resources</Pill>
                  <span>
                    Read-only <b>data</b> the app can load into context (a policy
                    PDF, a database row). App-controlled.
                  </span>
                </div>
                <div className="flex gap-3">
                  <Pill color="blue">Prompts</Pill>
                  <span>
                    Reusable <b>prompt templates</b> the server offers (e.g. a
                    &quot;file a claim&quot; workflow). User-controlled.
                  </span>
                </div>
              </div>
            </div>

            <Callout tone="success" title="Why enterprises care">
              <ul className="ml-4 list-disc space-y-1">
                <li>Write a tool once, reuse it across every agent and IDE.</li>
                <li>Servers enforce their own auth and access scope.</li>
                <li>Swap models or frameworks without rewriting integrations.</li>
                <li>Clear boundary to audit and govern (next module).</li>
              </ul>
            </Callout>

            <Callout tone="danger" title="Security note">
              MCP servers run real code and can reach real systems. Treat tool
              inputs as untrusted, scope credentials tightly, and require
              approval for write actions like <code>file_claim</code>. That
              gate is exactly what the Governance module adds.
            </Callout>
          </div>
        }
      />
    </div>
  );
}
