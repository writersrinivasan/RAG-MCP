"use client";

import { useMemo, useState } from "react";
import { chunk } from "@/lib/retrieval";

const SAMPLE =
  "Comprehensive coverage includes repair or replacement of windshield and window glass. For policies with the Glass Rider, the deductible for glass-only claims is waived. Standard comprehensive deductible is $250 and applies if the entire windshield is replaced without the rider. Chip repairs are covered at 100% with no deductible.";

const COLORS = [
  "bg-brand-500/20 border-brand-500/50",
  "bg-emerald-500/20 border-emerald-500/50",
  "bg-accent-500/20 border-accent-500/50",
  "bg-amber-500/20 border-amber-500/50",
  "bg-rose-500/20 border-rose-500/50",
];

export function ChunkingDemo() {
  const [size, setSize] = useState(18);
  const [overlap, setOverlap] = useState(4);

  const chunks = useMemo(
    () => chunk(SAMPLE, size, Math.min(overlap, size - 1)),
    [size, overlap]
  );

  return (
    <div className="card">
      <div className="section-title">Interactive: chunking a policy document</div>
      <p className="mt-1 text-sm text-slate-400">
        Documents are too big to embed whole. We split them into chunks. Too
        big and retrieval gets noisy; too small and meaning is lost. Overlap
        keeps sentences from being cut in half.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Chunk size</span>
            <span className="text-white">{size} words</span>
          </div>
          <input
            type="range"
            min={6}
            max={40}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="mt-1 w-full accent-brand-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Overlap</span>
            <span className="text-white">{overlap} words</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            value={overlap}
            onChange={(e) => setOverlap(parseInt(e.target.value))}
            className="mt-1 w-full accent-brand-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chunks.map((c, i) => (
          <span
            key={c.idx}
            className={`rounded-md border px-2 py-1 text-xs leading-relaxed text-slate-200 ${
              COLORS[i % COLORS.length]
            }`}
          >
            <b className="mr-1 opacity-60">#{c.idx + 1}</b>
            {c.text}
          </span>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {chunks.length} chunks generated · each becomes one vector in the index.
      </div>
    </div>
  );
}
