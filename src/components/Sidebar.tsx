"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES, TOTAL_MINUTES } from "@/lib/modules";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-ink-700 bg-ink-900/70 backdrop-blur md:flex">
      <div className="border-b border-ink-700 px-5 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
          Live Workshop
        </div>
        <h1 className="mt-1 text-lg font-bold leading-tight text-white">
          Enterprise Agentic AI
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          RAG · MCP · Governance · Production
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="chip">⏱ ~{TOTAL_MINUTES} min</span>
          <span className="chip">LangGraph</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {MODULES.map((m, i) => {
          const active =
            m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
          return (
            <Link
              key={m.slug}
              href={m.href}
              className={`group flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                active
                  ? "bg-brand-600/15 ring-1 ring-brand-500/40"
                  : "hover:bg-ink-800/70"
              }`}
            >
              <span className="mt-0.5 text-lg">{m.icon}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      active ? "text-white" : "text-slate-200"
                    }`}
                  >
                    {i}. {m.title}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">
                  {m.minutes} min · {m.short}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-700 px-5 py-4 text-[11px] text-slate-500">
        Runs fully offline in demo mode. Optional: add an API key for live LLM
        calls.
      </div>
    </aside>
  );
}
