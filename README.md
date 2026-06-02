# RGB Knowledge Base Chat

This is a Next.js RAG chatbot grounded in a fixed knowledge base about
benchmarking large language models in retrieval-augmented generation.

## Knowledge base

The canonical Knowledge Base source is:

```text
data/knowledge-base.txt
```

Edit this file directly when the source material changes. The chat API reads it
at runtime and retrieves chunks from its contents.

The deployed chat API reads this file at runtime, so updates to the knowledge
base are normal text edits.
