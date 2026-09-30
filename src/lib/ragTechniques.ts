export type Technique = {
  name: string;
  stage: "Indexing" | "Query" | "Retrieval" | "Post-retrieval" | "Generation" | "Advanced";
  simple: string; // plain-English one-liner
  how: string; // slightly deeper
  when: string; // when to reach for it
  icon: string;
};

export const RAG_TECHNIQUES: Technique[] = [
  {
    name: "Chunking",
    stage: "Indexing",
    icon: "✂️",
    simple: "Cut big documents into bite-sized pieces before indexing.",
    how: "Fixed-size, sentence, or recursive splitting with overlap so ideas aren't cut in half. Chunk size trades recall vs. noise.",
    when: "Always. It's the foundation — tune size/overlap per document type.",
  },
  {
    name: "Embeddings",
    stage: "Indexing",
    icon: "🧮",
    simple: "Turn text into numbers that capture meaning.",
    how: "An embedding model maps each chunk to a vector so that similar meanings sit close together in space.",
    when: "Always, for semantic search. Pick a model matching your domain/language.",
  },
  {
    name: "Metadata & filtering",
    stage: "Indexing",
    icon: "🏷️",
    simple: "Tag each chunk (policy type, date, source) so you can pre-filter.",
    how: "Store structured metadata alongside vectors; filter before or during search (e.g. only 'Auto' + 'current version').",
    when: "Multi-tenant, versioned, or permission-scoped corpora.",
  },
  {
    name: "Query rewriting",
    stage: "Query",
    icon: "✏️",
    simple: "Clean up or expand the user's question before searching.",
    how: "An LLM rephrases vague/misspelled queries and resolves pronouns using chat history ('it' → 'the windshield').",
    when: "Conversational apps and messy human input.",
  },
  {
    name: "Multi-query",
    stage: "Query",
    icon: "🔀",
    simple: "Ask the same thing several ways, then merge results.",
    how: "Generate N paraphrases, retrieve for each, and fuse (e.g. Reciprocal Rank Fusion) to cover more angles.",
    when: "Ambiguous questions where one phrasing misses relevant docs.",
  },
  {
    name: "HyDE",
    stage: "Query",
    icon: "🔮",
    simple: "Imagine a fake ideal answer, then search with that.",
    how: "Hypothetical Document Embeddings: the LLM drafts a plausible answer; you embed it and retrieve real docs similar to it.",
    when: "Short queries where the answer looks more like the docs than the question does.",
  },
  {
    name: "Keyword / BM25",
    stage: "Retrieval",
    icon: "🔤",
    simple: "Classic exact-word matching.",
    how: "Sparse lexical search scoring rare-but-matching terms highly. Great for codes, numbers, exact names.",
    when: "Always as one half of hybrid — catches things vectors blur.",
  },
  {
    name: "Vector search",
    stage: "Retrieval",
    icon: "🧭",
    simple: "Find chunks whose meaning is closest to the query.",
    how: "Approximate nearest-neighbour over embeddings (HNSW/IVF). Robust to wording differences and synonyms.",
    when: "Semantic questions where users don't use the doc's exact words.",
  },
  {
    name: "Hybrid search",
    stage: "Retrieval",
    icon: "⚖️",
    simple: "Combine keyword + vector for the best of both.",
    how: "Blend sparse and dense scores (weighted or via RRF). Keyword nails exact terms; vectors nail meaning.",
    when: "Almost every production system. It's the safe default.",
  },
  {
    name: "Reranking",
    stage: "Post-retrieval",
    icon: "🎯",
    simple: "Re-score the shortlist with a smarter, slower model.",
    how: "A cross-encoder reads query+chunk together and reorders top-k. Much higher precision than the first-pass retriever.",
    when: "When precision of the top 3–5 chunks matters (it usually does).",
  },
  {
    name: "Contextual / parent-doc",
    stage: "Post-retrieval",
    icon: "🪆",
    simple: "Search small chunks, but hand the model the bigger surrounding section.",
    how: "Index small precise chunks; on hit, expand to the parent chunk/section so the LLM has full context.",
    when: "When tiny chunks retrieve well but lack enough context to answer.",
  },
  {
    name: "Compression / filtering",
    stage: "Post-retrieval",
    icon: "🗜️",
    simple: "Trim retrieved text down to only the relevant sentences.",
    how: "An extractor/LLM removes irrelevant passages before generation, cutting tokens and distraction.",
    when: "Long contexts, tight token budgets, or noisy retrieval.",
  },
  {
    name: "Grounded generation + citations",
    stage: "Generation",
    icon: "📎",
    simple: "Answer only from retrieved text and show the sources.",
    how: "Prompt the model to cite chunk IDs and refuse when context is missing; enables verification and trust.",
    when: "Always in enterprise — traceability is non-negotiable.",
  },
  {
    name: "GraphRAG",
    stage: "Advanced",
    icon: "🕸️",
    simple: "Build a knowledge graph of entities and reason over relationships.",
    how: "Extract entities/relations into a graph; retrieve connected subgraphs for multi-hop, 'connect the dots' questions.",
    when: "Questions spanning many documents or requiring relationship reasoning.",
  },
  {
    name: "Agentic RAG",
    stage: "Advanced",
    icon: "🤖",
    simple: "Let an agent decide when and what to retrieve, in a loop.",
    how: "The agent chooses tools, retrieves, reflects on whether the answer is sufficient, and retrieves again if not.",
    when: "Complex tasks needing planning, multiple sources, or self-correction. (This is what our LangGraph agent does.)",
  },
  {
    name: "Evaluation (RAGAS)",
    stage: "Advanced",
    icon: "📏",
    simple: "Measure faithfulness, relevance and recall — don't guess.",
    how: "Metrics like context precision/recall, answer faithfulness, and groundedness, run on a labelled test set in CI.",
    when: "Before shipping and continuously after — RAG quality drifts.",
  },
];

export const STAGES = [
  "Indexing",
  "Query",
  "Retrieval",
  "Post-retrieval",
  "Generation",
  "Advanced",
] as const;
