# Runnable LangGraph agent (Python)

This is the real, runnable twin of the animated graph in the web app (`/agents`).
Same nodes, same control flow, same retrieve → grade → retry → generate → govern loop.

## Run it (demo mode, no API key)

```bash
cd langgraph
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python agent.py
```

You'll see each node print as it executes, the retrieval retry loop fire once,
and the final grounded answer with citations.

## Live mode (optional)

Uncomment `langchain-openai` in `requirements.txt`, install it, and set:

```bash
export OPENAI_API_KEY=sk-...
python agent.py
```

Then swap the toy `retrieve_docs` and rule-based generation for a real vector
store and chat model — the graph structure stays identical.

## How it maps to the web app

| Graph node          | Web app node          | What it teaches                     |
| ------------------- | --------------------- | ----------------------------------- |
| `rewrite`           | rewrite_query         | Query understanding                 |
| `lookup`            | lookup_account (MCP)  | Tool use / private data via MCP     |
| `retrieve`          | retrieve_policies     | RAG retrieval                       |
| `grade`             | grade_documents       | Self-reflection / conditional edges |
| `generate`          | generate_answer       | Grounded generation + citations     |
| `guard`             | governance_check      | Governance / audit                  |
```
