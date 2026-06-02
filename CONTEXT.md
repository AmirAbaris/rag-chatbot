# RAG Chatbot

This context defines the product language for a minimal RAG chatbot that answers questions from a fixed knowledge base.

## Language

**RAG Chatbot**:
The product: a question-answering chatbot that grounds responses in retrieved knowledge base content.
_Avoid_: Generic chatbot, AI assistant

**Knowledge Base**:
The fixed source material the chatbot is allowed to use when grounding answers.
_Avoid_: Corpus, documents, dataset

The current Knowledge Base source is `data/knowledge-base.txt`.

**Question**:
The user's input that asks the chatbot for an answer.
_Avoid_: Query, prompt, message

**Retrieved Chunk**:
A specific piece of knowledge base text selected as relevant to a question.
_Avoid_: Document, source, passage

Retrieved chunks are ranked with MiniSearch over paragraph-based Knowledge Base
chunks.

**Retrieved Context**:
The set of retrieved chunks provided to the model for answer generation.
_Avoid_: Context window, source bundle

**Grounded Answer**:
An answer that is based on the retrieved context and avoids unsupported claims.
_Avoid_: AI response, completion

**Insufficient Context**:
The state where the retrieved context does not contain enough information to answer the question.
_Avoid_: No results, failed retrieval

**Retrieval Quality**:
How useful the retrieved chunks are for answering the user's question.
_Avoid_: Search quality, relevance score
