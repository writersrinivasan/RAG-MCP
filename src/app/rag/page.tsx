import { ModuleHeader, TrackTabs, Callout, Step, CodeBlock } from "@/components/ui";
import { RetrievalPlayground } from "@/components/rag/RetrievalPlayground";
import { ChunkingDemo } from "@/components/rag/ChunkingDemo";
import { RagPipeline } from "@/components/rag/RagPipeline";
import { TechniqueCatalog } from "@/components/rag/TechniqueCatalog";
import { AssistantWidget } from "@/components/AssistantWidget";

export default function RagPage() {
  return (
    <div>
      <ModuleHeader eyebrow="Step 1 · Retrieval-Augmented Generation" title="RAG Deep Dive" minutes={35}>
        The model doesn&apos;t know NorthWind&apos;s policies. RAG fixes that by
        retrieving the right documents and handing them to the model at answer
        time — so responses are grounded in real, current text instead of the
        model&apos;s memory.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-8">
            <Callout tone="info" title="What is RAG, in one sentence?">
              Instead of asking the model to <i>remember</i> the answer, we{" "}
              <b className="text-white">look it up first</b> and paste the
              relevant text into the prompt. Retrieve → Augment → Generate.
            </Callout>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🧪 Lab 1 — Retrieval playground
              </h2>
              <p className="mb-4 max-w-3xl text-sm text-slate-400">
                This is a real (simplified) retriever running in your browser
                over the NorthWind corpus. Change the query and strategy and
                watch the scores and ranking change live.
              </p>
              <RetrievalPlayground />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🧪 Lab 1b — Full RAG answer (live endpoint)
              </h2>
              <p className="mb-4 max-w-3xl text-sm text-slate-400">
                Now put retrieval + generation together. This calls the real{" "}
                <code className="rounded bg-ink-800 px-1.5 py-0.5 text-brand-300">
                  /api/chat
                </code>{" "}
                route, which retrieves context and answers with citations.
              </p>
              <AssistantWidget />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🧪 Lab 2 — Chunking
              </h2>
              <ChunkingDemo />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🗺️ The full pipeline
              </h2>
              <RagPipeline />
            </section>

            <section>
              <h2 className="mb-1 text-xl font-bold text-white">
                📚 Every technique, explained simply
              </h2>
              <p className="mb-4 max-w-3xl text-sm text-slate-400">
                Filter by pipeline stage. Click any card to see how it works and
                when to use it.
              </p>
              <TechniqueCatalog />
            </section>
          </div>
        }
        theory={
          <div className="space-y-6">
            <Callout tone="warn" title="The core problem RAG solves">
              LLMs are frozen at training time and have no access to your private
              or current data. Fine-tuning is slow and expensive to keep fresh.
              RAG injects knowledge <b>at query time</b>, so updating the
              knowledge base is as simple as re-indexing a document.
            </Callout>

            <div className="card">
              <div className="section-title">How RAG works — the 7 steps</div>
              <div className="mt-4">
                <Step n={1} title="Ingest & chunk">
                  Split source documents into overlapping chunks small enough to
                  embed but large enough to carry meaning.
                </Step>
                <Step n={2} title="Embed & index">
                  Convert each chunk into a vector with an embedding model and
                  store it in a vector database with metadata.
                </Step>
                <Step n={3} title="Understand the query">
                  Optionally rewrite, expand, or generate multiple versions of
                  the user&apos;s question (query rewriting, multi-query, HyDE).
                </Step>
                <Step n={4} title="Retrieve">
                  Run hybrid search (keyword + vector) to pull the top-k most
                  relevant chunks.
                </Step>
                <Step n={5} title="Rerank & compress">
                  Reorder the shortlist with a cross-encoder and trim it to the
                  most relevant sentences.
                </Step>
                <Step n={6} title="Augment & generate">
                  Insert the retrieved context into the prompt and let the LLM
                  compose an answer grounded in it.
                </Step>
                <Step n={7} title="Cite & verify">
                  Return citations to the source chunks and check the answer is
                  actually supported by them.
                </Step>
              </div>
            </div>

            <div className="card">
              <div className="section-title">The prompt that makes it &quot;grounded&quot;</div>
              <p className="mt-2 text-sm text-slate-400">
                RAG is mostly a retrieval + prompting pattern. The generation
                prompt is what forces the model to stay honest:
              </p>
              <div className="mt-3">
                <CodeBlock
                  lang="text"
                  code={`You are NorthWind's support assistant.
Answer ONLY using the CONTEXT below.
If the answer is not in the context, say you don't know
and offer to escalate. Cite the source ID for each claim.

CONTEXT:
[POL-100] Comprehensive coverage includes ... Glass Rider ... deductible waived ...
[CLM-205] Glass-only claims are decided within 24 hours ...

QUESTION:
My windshield cracked. Do I pay the $250 deductible and how fast is the fix?`}
                />
              </div>
            </div>

            <Callout tone="success" title="Key takeaways">
              <ul className="ml-4 list-disc space-y-1">
                <li>Hybrid search (keyword + vector) is the safe default.</li>
                <li>Reranking gives the biggest precision win for the effort.</li>
                <li>Grounding + citations is what makes RAG enterprise-ready.</li>
                <li>You cannot improve what you don&apos;t measure — evaluate.</li>
              </ul>
            </Callout>
          </div>
        }
      />
    </div>
  );
}
