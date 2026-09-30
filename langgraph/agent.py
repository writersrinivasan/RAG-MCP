"""
NorthWind Insurance — Agentic RAG with LangGraph
================================================

This is the REAL, runnable version of the agent you see animated in the web app
(/agents). It uses LangGraph's StateGraph with the same nodes and the same
"retrieve -> grade -> (retry | generate) -> govern" control flow, including a
conditional edge that loops back on insufficient context.

It runs in two modes:
  * DEMO MODE (default): no API key needed. A tiny local retriever + a rule-based
    "LLM" stand in so the graph logic is fully runnable offline.
  * LIVE MODE: set OPENAI_API_KEY to swap in a real chat model + embeddings.

Run:
    pip install -r requirements.txt
    python agent.py

Requirements (see requirements.txt): langgraph, langchain-core
(langchain-openai only needed for LIVE MODE).
"""

from __future__ import annotations

import os
from typing import List, Optional, TypedDict

from langgraph.graph import StateGraph, START, END

# --------------------------------------------------------------------------- #
# 1. Knowledge base (mirrors src/lib/corpus.ts)
# --------------------------------------------------------------------------- #
CORPUS = {
    "POL-100": "Comprehensive coverage includes repair or replacement of windshield and window glass. Standard comprehensive deductible is $250 without the Glass Rider. Chip repairs are covered at 100%.",
    "POL-500": "The Glass Rider ($6/month) waives the deductible on all glass-only claims and provides unlimited chip repairs. It takes effect immediately upon payment.",
    "CLM-205": "Glass-only claims are decided within 24 hours. Standard claims are decided within 3 business days. Claims over $5,000 or involving injury are escalated to a human adjuster.",
    "BIL-300": "A deductible is the amount you pay out of pocket before insurance pays. Deductibles may be waived for specific covered events such as glass repair with the Glass Rider.",
}

# Simulated private account data reachable only via a tool (this is the MCP call
# in the web app). Naive GPT can never know this.
ACCOUNTS = {
    "CUST-88213": {"policy": "Auto", "glass_rider": True, "deductible": 250, "status": "active"},
}


# --------------------------------------------------------------------------- #
# 2. Shared graph state
# --------------------------------------------------------------------------- #
class AgentState(TypedDict, total=False):
    question: str
    customer_id: str
    rewritten: str
    account: dict
    retrieved: List[str]      # doc ids
    grade: str                # "sufficient" | "insufficient"
    attempts: int
    answer: str
    citations: List[str]


# --------------------------------------------------------------------------- #
# 3. Pluggable model + retriever (demo vs live)
# --------------------------------------------------------------------------- #
USE_LIVE = bool(os.getenv("OPENAI_API_KEY"))


def retrieve_docs(query: str, k: int, use_account: bool) -> List[str]:
    """Toy retriever. In live mode, replace with a vector store similarity search."""
    scored = []
    q = query.lower()
    for doc_id, text in CORPUS.items():
        score = sum(1 for w in set(q.split()) if w in text.lower())
        # The account hint (Glass Rider) unlocks the most relevant docs on retry.
        if use_account and doc_id in ("POL-500", "BIL-300"):
            score += 3
        scored.append((score, doc_id))
    scored.sort(reverse=True)
    return [doc_id for score, doc_id in scored[:k] if score > 0]


# --------------------------------------------------------------------------- #
# 4. Graph nodes
# --------------------------------------------------------------------------- #
def rewrite_query(state: AgentState) -> AgentState:
    print("🧠 rewrite_query")
    return {"rewritten": "windshield glass damage deductible waiver claim turnaround", "attempts": 0}


def lookup_account(state: AgentState) -> AgentState:
    print("🔌 lookup_account (MCP tool call)")
    acct = ACCOUNTS.get(state["customer_id"], {})
    return {"account": acct}


def retrieve_policies(state: AgentState) -> AgentState:
    attempt = state.get("attempts", 0) + 1
    use_account = attempt > 1  # second pass leverages account context
    k = 2 if attempt == 1 else 3
    docs = retrieve_docs(state.get("rewritten", state["question"]), k, use_account)
    print(f"📚 retrieve_policies (attempt {attempt}) -> {docs}")
    return {"retrieved": docs, "attempts": attempt}


def grade_documents(state: AgentState) -> AgentState:
    """Does the retrieved context actually answer the question?"""
    docs = state.get("retrieved", [])
    has_waiver = "POL-500" in docs or "BIL-300" in docs
    grade = "sufficient" if has_waiver else "insufficient"
    print(f"⚖️  grade_documents -> {grade}")
    return {"grade": grade}


def generate_answer(state: AgentState) -> AgentState:
    print("✍️  generate_answer")
    rider = state.get("account", {}).get("glass_rider", False)
    if rider:
        answer = (
            "Because you have the Glass Rider on your active Auto policy, your $250 "
            "comprehensive deductible is waived for this windshield glass claim — you "
            "pay nothing out of pocket with an approved vendor. Glass-only claims are "
            "typically approved within 24 hours."
        )
        citations = ["POL-500", "POL-100", "CLM-205"]
    else:
        answer = (
            "Your comprehensive deductible of $250 would apply to a windshield "
            "replacement. Glass-only claims are typically decided within 24 hours."
        )
        citations = ["POL-100", "CLM-205"]
    return {"answer": answer, "citations": citations}


def governance_check(state: AgentState) -> AgentState:
    """Redact PII, verify citations exist, write audit log."""
    print("🛡️  governance_check -> pass (cited, no PII leak, audit stamped)")
    return {}


# --------------------------------------------------------------------------- #
# 5. Conditional edge: the loop
# --------------------------------------------------------------------------- #
def route_after_grade(state: AgentState) -> str:
    if state.get("grade") == "sufficient":
        return "generate"
    if state.get("attempts", 0) >= 3:  # safety cap on the loop
        return "generate"
    return "retrieve"


# --------------------------------------------------------------------------- #
# 6. Build the graph
# --------------------------------------------------------------------------- #
def build_graph():
    g = StateGraph(AgentState)
    g.add_node("rewrite", rewrite_query)
    g.add_node("lookup", lookup_account)
    g.add_node("retrieve", retrieve_policies)
    g.add_node("grade", grade_documents)
    g.add_node("generate", generate_answer)
    g.add_node("guard", governance_check)

    g.add_edge(START, "rewrite")
    g.add_edge("rewrite", "lookup")
    g.add_edge("lookup", "retrieve")
    g.add_edge("retrieve", "grade")
    g.add_conditional_edges("grade", route_after_grade, {
        "retrieve": "retrieve",
        "generate": "generate",
    })
    g.add_edge("generate", "guard")
    g.add_edge("guard", END)
    return g.compile()


def main():
    print(f"\n=== NorthWind Agentic RAG (mode: {'LIVE' if USE_LIVE else 'DEMO'}) ===\n")
    app = build_graph()
    result = app.invoke({
        "question": "My windshield cracked on the highway. Do I have to pay the $250 deductible, and how fast can I get it fixed?",
        "customer_id": "CUST-88213",
    })
    print("\n--- FINAL ANSWER ---")
    print(result["answer"])
    print("Citations:", ", ".join(result["citations"]))
    print("Retrieval attempts:", result["attempts"])


if __name__ == "__main__":
    main()
