"use client";

import { Pill } from "@/components/ui";

const EVENTS = [
  { t: "10:42:01.104", actor: "agent", event: "request.received", detail: "CUST-88213 · glass claim question", tag: "info" },
  { t: "10:42:01.221", actor: "mcp", event: "tool.call", detail: "get_account(CUST-88213)", tag: "tool" },
  { t: "10:42:01.244", actor: "guard", event: "authz.check", detail: "agent scope=read:account → allow", tag: "guard" },
  { t: "10:42:01.902", actor: "agent", event: "rag.retrieve", detail: "hybrid+rerank → POL-500, POL-100, CLM-205", tag: "rag" },
  { t: "10:42:02.510", actor: "llm", event: "generate", detail: "model=demo · tokens=180 · cost=$0.0004", tag: "llm" },
  { t: "10:42:02.640", actor: "guard", event: "pii.scan", detail: "0 PII findings → pass", tag: "guard" },
  { t: "10:42:02.651", actor: "guard", event: "citations.verify", detail: "3/3 claims grounded → pass", tag: "guard" },
  { t: "10:42:02.658", actor: "agent", event: "response.sent", detail: "grounded answer + citations", tag: "info" },
];

const color: Record<string, "blue" | "amber" | "green" | "violet" | "slate"> = {
  info: "blue",
  tool: "amber",
  guard: "green",
  rag: "violet",
  llm: "slate",
};

export function AuditTrail() {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="section-title">Immutable audit trail · one request</span>
        <Pill color="green">exportable · tamper-evident</Pill>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Every decision the agent made is logged with who, what, when, and why.
        This is what turns &quot;the AI said so&quot; into a defensible record.
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-ink-600">
        <table className="w-full text-left text-xs">
          <thead className="bg-ink-800/70 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">time</th>
              <th className="px-3 py-2 font-medium">actor</th>
              <th className="px-3 py-2 font-medium">event</th>
              <th className="px-3 py-2 font-medium">detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700/60">
            {EVENTS.map((e, i) => (
              <tr key={i} className="hover:bg-ink-800/40">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-500">
                  {e.t}
                </td>
                <td className="px-3 py-2">
                  <Pill color={color[e.tag]}>{e.actor}</Pill>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-200">
                  {e.event}
                </td>
                <td className="px-3 py-2 text-slate-400">{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
