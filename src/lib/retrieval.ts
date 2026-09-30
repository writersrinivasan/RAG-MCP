// Deterministic, dependency-free retrieval so the RAG playground runs in the
// browser with real (if simplified) math. Not production-grade — it is a
// teaching model that mirrors the shape of real keyword + vector + hybrid search.

import { CORPUS, Doc, tokenize } from "./corpus";

export type Scored = {
  doc: Doc;
  keyword: number;
  vector: number;
  hybrid: number;
  rerank?: number;
};

// ---- Keyword score: simple TF-IDF cosine over tokens (stand-in for BM25) ----
function termFreqs(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

const DOC_TOKENS = CORPUS.map((d) => tokenize(d.title + " " + d.text));
const DF = (() => {
  const df = new Map<string, number>();
  for (const toks of DOC_TOKENS) {
    for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return df;
})();
const N = CORPUS.length;

function idf(term: string): number {
  const df = DF.get(term) ?? 0;
  return Math.log((N + 1) / (df + 0.5));
}

function keywordScore(queryTokens: string[], docIdx: number): number {
  const q = termFreqs(queryTokens);
  const d = termFreqs(DOC_TOKENS[docIdx]);
  let dot = 0;
  let qn = 0;
  let dn = 0;
  const terms = new Set([...q.keys(), ...d.keys()]);
  for (const t of terms) {
    const w = idf(t);
    const qv = (q.get(t) ?? 0) * w;
    const dv = (d.get(t) ?? 0) * w;
    dot += qv * dv;
    qn += qv * qv;
    dn += dv * dv;
  }
  if (qn === 0 || dn === 0) return 0;
  return dot / (Math.sqrt(qn) * Math.sqrt(dn));
}

// ---- "Embedding" score: character trigram cosine (semantic-ish, robust to
// wording differences the keyword scorer misses) ----
function trigrams(s: string): Map<string, number> {
  const clean = " " + s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
  const m = new Map<string, number>();
  for (let i = 0; i < clean.length - 2; i++) {
    const g = clean.slice(i, i + 3);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}
const DOC_TRIGRAMS = CORPUS.map((d) => trigrams(d.title + " " + d.text));

function cosineMaps(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let an = 0;
  let bn = 0;
  for (const v of a.values()) an += v * v;
  for (const v of b.values()) bn += v * v;
  for (const [k, v] of a) dot += v * (b.get(k) ?? 0);
  if (an === 0 || bn === 0) return 0;
  return dot / (Math.sqrt(an) * Math.sqrt(bn));
}

function vectorScore(query: string, docIdx: number): number {
  return cosineMaps(trigrams(query), DOC_TRIGRAMS[docIdx]);
}

export type SearchOpts = {
  mode: "keyword" | "vector" | "hybrid";
  alpha?: number; // hybrid weight toward vector (0..1)
  rerank?: boolean;
  topK?: number;
};

// Cross-encoder-style reranker (simulated): rewards exact phrase & number
// overlap that bi-encoders often miss.
function rerankScore(query: string, doc: Doc): number {
  const q = query.toLowerCase();
  const text = (doc.title + " " + doc.text).toLowerCase();
  let bonus = 0;
  const nums = q.match(/\$?\d+/g) ?? [];
  for (const n of nums) if (text.includes(n.replace("$", ""))) bonus += 0.25;
  const phrases = ["glass", "windshield", "deductible", "rental", "premium"];
  for (const p of phrases) if (q.includes(p) && text.includes(p)) bonus += 0.15;
  return bonus;
}

export function search(query: string, opts: SearchOpts): Scored[] {
  const qTokens = tokenize(query);
  const alpha = opts.alpha ?? 0.5;

  let scored: Scored[] = CORPUS.map((doc, i) => {
    const keyword = keywordScore(qTokens, i);
    const vector = vectorScore(query, i);
    let hybrid = keyword;
    if (opts.mode === "vector") hybrid = vector;
    else if (opts.mode === "hybrid")
      hybrid = alpha * vector + (1 - alpha) * keyword;
    return { doc, keyword, vector, hybrid };
  });

  scored.sort((a, b) => b.hybrid - a.hybrid);

  if (opts.rerank) {
    scored = scored.map((s) => ({
      ...s,
      rerank: s.hybrid + rerankScore(query, s.doc),
    }));
    scored.sort((a, b) => (b.rerank ?? 0) - (a.rerank ?? 0));
  }

  return scored.slice(0, opts.topK ?? 4);
}

// Chunking demo helper: split text into overlapping windows.
export function chunk(
  text: string,
  size: number,
  overlap: number
): { idx: number; text: string }[] {
  const words = text.split(/\s+/);
  const out: { idx: number; text: string }[] = [];
  let start = 0;
  let idx = 0;
  const step = Math.max(1, size - overlap);
  while (start < words.length) {
    out.push({ idx: idx++, text: words.slice(start, start + size).join(" ") });
    start += step;
  }
  return out;
}
