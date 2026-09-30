"use client";

import { useState } from "react";
import { RAG_TECHNIQUES, STAGES } from "@/lib/ragTechniques";
import { Pill } from "@/components/ui";

const stageColor: Record<string, "blue" | "green" | "amber" | "violet" | "rose" | "slate"> = {
  Indexing: "blue",
  Query: "green",
  Retrieval: "amber",
  "Post-retrieval": "violet",
  Generation: "rose",
  Advanced: "slate",
};

export function TechniqueCatalog() {
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(RAG_TECHNIQUES[0].name);

  const list =
    filter === "All"
      ? RAG_TECHNIQUES
      : RAG_TECHNIQUES.filter((t) => t.stage === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...STAGES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === s
                ? "border-brand-500 bg-brand-600/20 text-white"
                : "border-ink-600 bg-ink-800/50 text-slate-300 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((t) => {
          const isOpen = open === t.name;
          return (
            <button
              key={t.name}
              onClick={() => setOpen(isOpen ? null : t.name)}
              className={`card cursor-pointer text-left transition ${
                isOpen ? "ring-1 ring-brand-500/50" : "hover:border-brand-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.icon}</span>
                  <span className="font-semibold text-white">{t.name}</span>
                </div>
                <Pill color={stageColor[t.stage]}>{t.stage}</Pill>
              </div>
              <p className="mt-2 text-sm text-slate-300">{t.simple}</p>
              {isOpen && (
                <div className="mt-3 space-y-2 border-t border-ink-700 pt-3 text-sm">
                  <p className="text-slate-300">
                    <span className="font-semibold text-brand-300">
                      How:{" "}
                    </span>
                    {t.how}
                  </p>
                  <p className="text-slate-300">
                    <span className="font-semibold text-emerald-300">
                      When:{" "}
                    </span>
                    {t.when}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
