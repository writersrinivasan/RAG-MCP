"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/components/ui";

// Rough, editable planning model. Numbers are illustrative teaching defaults,
// not a quote — the point is to show which levers move cost and latency.
export function CostEstimator() {
  const [reqPerDay, setReqPerDay] = useState(50000);
  const [inTokens, setInTokens] = useState(1200); // prompt + retrieved context
  const [outTokens, setOutTokens] = useState(250);
  const [inPrice, setInPrice] = useState(0.15); // $ per 1M input tokens
  const [outPrice, setOutPrice] = useState(0.6); // $ per 1M output tokens
  const [cacheHit, setCacheHit] = useState(30); // % served from cache

  const calc = useMemo(() => {
    const effReq = reqPerDay * (1 - cacheHit / 100);
    const dailyIn = (effReq * inTokens * inPrice) / 1_000_000;
    const dailyOut = (effReq * outTokens * outPrice) / 1_000_000;
    const daily = dailyIn + dailyOut;
    return {
      daily,
      monthly: daily * 30,
      perReq: daily / Math.max(1, reqPerDay),
    };
  }, [reqPerDay, inTokens, outTokens, inPrice, outPrice, cacheHit]);

  const Slider = ({
    label,
    value,
    set,
    min,
    max,
    step = 1,
    suffix = "",
  }: {
    label: string;
    value: number;
    set: (n: number) => void;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
  }) => (
    <div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="text-white">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        className="mt-1 w-full accent-brand-500"
      />
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="card lg:col-span-3">
        <div className="section-title">Cost levers</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Slider label="Requests / day" value={reqPerDay} set={setReqPerDay} min={1000} max={500000} step={1000} />
          <Slider label="Cache hit rate" value={cacheHit} set={setCacheHit} min={0} max={80} suffix="%" />
          <Slider label="Input tokens / req" value={inTokens} set={setInTokens} min={200} max={8000} step={100} />
          <Slider label="Output tokens / req" value={outTokens} set={setOutTokens} min={50} max={2000} step={50} />
          <Slider label="Input $ / 1M tok" value={inPrice} set={setInPrice} min={0.05} max={10} step={0.05} />
          <Slider label="Output $ / 1M tok" value={outPrice} set={setOutPrice} min={0.1} max={30} step={0.1} />
        </div>
        <div className="mt-4 rounded-lg border border-ink-600 bg-ink-950/50 p-3 text-xs text-slate-400">
          <b className="text-slate-200">Levers that matter most:</b> shrink
          retrieved context (fewer input tokens), cache repeat questions, and
          route easy queries to a smaller model. Watch the monthly number swing.
        </div>
      </div>

      <div className="card lg:col-span-2">
        <div className="section-title">Estimated spend</div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-slate-400">Per request</div>
            <div className="text-2xl font-bold text-white">
              ${calc.perReq.toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Per day</div>
            <div className="text-2xl font-bold text-brand-300">
              ${calc.daily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Per month (~30d)</div>
            <div className="text-3xl font-bold text-emerald-300">
              ${calc.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill color="green">{cacheHit}% cached</Pill>
          <Pill color="blue">{(inTokens + outTokens).toLocaleString()} tok/req</Pill>
        </div>
      </div>
    </div>
  );
}
