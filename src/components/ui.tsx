"use client";

import { useState, ReactNode } from "react";

export function ModuleHeader({
  eyebrow,
  title,
  minutes,
  children,
}: {
  eyebrow: string;
  title: string;
  minutes?: number;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <span className="section-title">{eyebrow}</span>
        {minutes ? <span className="chip">⏱ {minutes} min</span> : null}
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
        {title}
      </h1>
      {children ? (
        <p className="mt-3 max-w-3xl text-slate-300">{children}</p>
      ) : null}
    </header>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "success" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "border-brand-500/60 bg-brand-500/5",
    warn: "border-amber-500/60 bg-amber-500/5",
    success: "border-emerald-500/60 bg-emerald-500/5",
    danger: "border-rose-500/60 bg-rose-500/5",
  };
  const icons: Record<string, string> = {
    info: "💡",
    warn: "⚠️",
    success: "✅",
    danger: "🚨",
  };
  return (
    <div className={`rounded-lg border-l-4 px-4 py-3 text-sm ${tones[tone]}`}>
      <div className="flex gap-2 leading-relaxed text-slate-200">
        <span>{icons[tone]}</span>
        <div>
          {title ? <div className="font-semibold text-white">{title}</div> : null}
          <div className="text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Theory vs Hands-on toggle used in every module. */
export function TrackTabs({
  theory,
  handsOn,
}: {
  theory: ReactNode;
  handsOn: ReactNode;
}) {
  const [tab, setTab] = useState<"handsOn" | "theory">("handsOn");
  return (
    <div>
      <div className="mb-5 inline-flex rounded-lg border border-ink-600 bg-ink-900/60 p-1">
        <button
          onClick={() => setTab("handsOn")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
            tab === "handsOn"
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          🧪 Hands-on
        </button>
        <button
          onClick={() => setTab("theory")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
            tab === "theory"
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          📖 Theory
        </button>
      </div>
      <div>{tab === "handsOn" ? handsOn : theory}</div>
    </div>
  );
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-sm font-bold text-brand-300 ring-1 ring-brand-500/40">
        {n}
      </div>
      <div className="pb-6">
        <div className="font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-600 bg-[#05070f]">
      {lang ? (
        <div className="border-b border-ink-700 px-4 py-1.5 text-[11px] uppercase tracking-widest text-slate-500">
          {lang}
        </div>
      ) : null}
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Pill({
  children,
  color = "slate",
}: {
  children: ReactNode;
  color?: "slate" | "green" | "blue" | "amber" | "rose" | "violet";
}) {
  const map: Record<string, string> = {
    slate: "bg-ink-800 text-slate-300 border-ink-600",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    blue: "bg-brand-500/10 text-brand-300 border-brand-500/40",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/40",
    violet: "bg-accent-500/10 text-accent-400 border-accent-500/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}
