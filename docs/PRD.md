# RAG Chatbot MVP PRD

## Product Name

RAG Chatbot

## Overview

RAG Chatbot is a minimal AI chatbot web app powered by Retrieval-Augmented Generation (RAG). The app answers user questions using a fixed internal Persian knowledge base instead of relying only on the language model's internal memory.

The system retrieves relevant text chunks from the local knowledge base, includes those chunks in a grounded prompt, sends the prompt to OpenRouter, and displays both the generated answer and the retrieved context.

## Problem

Users need a simple way to understand how a RAG chatbot works end to end without introducing production infrastructure such as authentication, databases, vector stores, document upload, embeddings APIs, or chat history.

The MVP should make the RAG flow visible and inspectable. A user should be able to ask a question, see the grounded answer, and inspect which retrieved chunks were used to produce it.

## Why Now

RAG is a common pattern for reducing hallucination and grounding AI answers in source material. This project is intentionally small so the first version can validate the core architecture and user experience before adding heavier retrieval, storage, evaluation, or operational features.

## MVP Goal

Build a simple working RAG chatbot using:

- Next.js
- OpenRouter API
- Static local knowledge base
- Local TF-IDF retrieval

The focus is:

- Working RAG flow
- Clean architecture
- Simple UX
- Minimal implementation

The MVP should optimize for learning and debuggability over production sophistication.

## Target User

The MVP is for learners, developers, and AI builders who want to test a basic RAG chatbot against a known local knowledge base.

Primary scenario:

- A developer wants to verify that retrieval, prompt construction, and answer generation work together before adding more advanced RAG infrastructure.

## Knowledge Base Context

The local knowledge base is a Persian text file about RAG and RAGAS. It covers:

- RAG as a system with Retriever and Generator components
- How retrieval helps reduce hallucination and ground answers in sources
- RAGAS as an automatic evaluation framework for RAG systems
- RAGAS metrics: Faithfulness, Answer Relevance, and Context Relevance
- WikiEval as the dataset mentioned in the RAGAS paper
- RAGAS limitations, especially dependence on an LLM evaluator
- Example applications and roles related to RAG and RAGAS

## Non-Goals

The MVP will not include:

- Authentication
- Databases
- Document upload
- Vector databases
- Streaming responses
- Multi-user support
- Chat history
- RAG evaluation metrics
- Admin dashboard
- PDF support
- Embeddings APIs
- Automated model benchmarking
- Production secrets management

## Core User Flow

1. User opens the app.
2. User pastes an OpenRouter API key.
3. User asks a question.
4. System retrieves relevant chunks from the local knowledge base.
5. System sends retrieved context and the question to OpenRouter.
6. AI generates a grounded answer.
7. UI displays the generated answer and retrieved chunks.

## MVP Defaults

Use these defaults for the first implementation unless a later decision explicitly changes them:

- Retrieve the top 3 chunks.
- Chunk the knowledge base by paragraph groups rather than token windows.
- Use no chunk overlap for the MVP.
- Keep model selection simple: use the default model first, and expose fallback model ids as configuration rather than trying all fallbacks automatically.
- Answer in Persian by default when the question or retrieved context is Persian.
- Display similarity scores rounded to 3 decimal places.
- Treat a very low or zero top similarity score as insufficient context.

## Functional Requirements

### 1. API Key Input

Requirements:

- Provide a password input for the OpenRouter API key.
- Provide a show/hide toggle.
- Require the key before a user can submit a question.
- Store the key only in frontend state for the active session.
- Send the key with the API request.
- Never save the key in a database, local storage, or server-side file.

### 2. Question Input

Requirements:

- Provide a textarea for the user's question.
- Provide a submit button.
- Disable submission when the API key or question is empty.
- Show a loading state while retrieval and generation are running.
- Surface clear error states for missing key, provider failure, and empty answer.

### 3. Retrieval System

Purpose:

Find the most relevant chunks from the local knowledge base.

Technology:

- TF-IDF
- Cosine similarity

Input:

- User question
- Static local text chunks

Output for each retrieved chunk:

- Chunk id
- Similarity score
- Chunk text

Expected behavior:

- Load `/data/knowledge-base.txt`.
- Split the file into paragraph-based chunks.
- Rank chunks by cosine similarity against the user question.
- Return the top 3 chunks to the prompt builder and UI.
- Return an insufficient context result when no chunk has meaningful similarity.

Chunking guidance:

- Preserve paragraph boundaries where possible.
- Merge very short adjacent paragraphs into one chunk.
- Keep chunking deterministic so retrieval behavior is easy to debug.
- Do not add overlap for the MVP.

### 4. RAG Generation

Flow:

```text
Question
  -> Retrieve chunks
  -> Build prompt
  -> Send prompt to OpenRouter
  -> Return grounded answer
```

Requirements:

- Use retrieved chunks as the only provided source context.
- Instruct the model to answer using the provided context.
- Instruct the model to say when the context is insufficient.
- Keep the prompt simple and deterministic enough for debugging.
- Prefer Persian answers when the question or retrieved context is Persian.
- Do not ask the model to evaluate Faithfulness, Answer Relevance, or Context Relevance in the MVP.

### 5. Retrieved Context Viewer

Requirements:

- Display retrieved chunks below or beside the answer.
- Show each chunk's id and similarity score.
- Show the full chunk text.

Purpose:

- Help users inspect retrieval quality.
- Make the RAG process transparent.

## AI Provider

Provider:

- OpenRouter

Default model:

- `openrouter/free`

Fallback models:

- `deepseek/deepseek-chat-v3-0324:free`
- `z-ai/glm-4.5-air:free`

API key strategy:

- BYOK: Bring Your Own Key
- User provides their own OpenRouter API key
- Key is held temporarily in frontend state
- Key is sent with the generation request
- Key is never persisted

Provider behavior:

- The server route receives the API key from the client request.
- The server route uses the key only for the current OpenRouter request.
- The server route must not log the key.
- If the default model fails, show an error that makes the selected model visible to the user. Automatic fallback can be added later.

## Technical Stack

Frontend:

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:

- Next.js Route Handlers

AI:

- OpenRouter API

Retrieval:

- Local TF-IDF retrieval

## Architecture

```text
User Question
  -> API Route
  -> Retriever
  -> Relevant Chunks
  -> Prompt Builder
  -> OpenRouter API
  -> Generated Answer
  -> UI Answer + Context Viewer
```

Suggested module boundaries:

- `data/knowledge-base.txt`: fixed local source text
- `lib/retrieval`: chunking, TF-IDF, cosine similarity
- `lib/prompt`: prompt construction
- `app/api/chat/route.ts`: request validation, retrieval, OpenRouter call
- `app/page.tsx`: API key input, question input, answer display, context viewer

Recommended MVP request/response shape:

```ts
type ChatRequest = {
  apiKey: string
  question: string
  model?: string
}

type RetrievedChunk = {
  id: string
  score: number
  text: string
}

type ChatResponse = {
  answer: string
  chunks: RetrievedChunk[]
  model: string
}
```

## UX Requirements

- First screen should be the usable chatbot experience, not a landing page.
- Keep the interface simple and focused.
- Make the API key field visually distinct from the question field.
- Show retrieved context in a scan-friendly format.
- Preserve readability for Persian text.
- Ensure loading and error states are obvious.
- Use a two-zone layout: input and answer as the primary zone, retrieved context as the inspection zone.
- Avoid chat history UI for the MVP; show only the latest question, answer, and retrieved context.
- Keep the visual design calm and utilitarian rather than marketing-oriented.

Recommended first-screen layout:

- Header with product name and short purpose statement.
- API key input row with show/hide control.
- Question textarea with submit button.
- Answer panel.
- Retrieved context panel with chunk cards.

## Success Criteria

The MVP is successful when:

- A user can paste an OpenRouter API key and ask a question.
- The app retrieves relevant chunks from the local Persian knowledge base.
- The app sends the question and retrieved chunks to OpenRouter.
- The app displays a grounded answer.
- The app displays retrieved chunks with similarity scores.
- No user API key is persisted.
- The implementation does not require a database, vector database, upload flow, embeddings API, or authentication.

## Acceptance Criteria

- Given no API key, the user cannot submit a question.
- Given no question, the user cannot submit.
- Given a valid key and a RAG/RAGAS question, the app returns an answer and retrieved chunks.
- Given a provider error, the UI shows a clear error message.
- Given a question unrelated to the knowledge base, the answer should indicate that the provided context is insufficient.
- Retrieved context displays chunk id, score, and text.
- API key is not written to local storage, cookies, database, logs, or files.
- Retrieved context contains at most 3 chunks.
- Similarity scores are displayed rounded to 3 decimal places.
- The UI does not display previous questions after a new question is submitted.

## Example Questions

- RAGAS چیست؟
- معیار Faithfulness چه چیزی را بررسی می‌کند؟
- تفاوت Answer Relevance و Context Relevance چیست؟
- چرا RAG می‌تواند hallucination را کاهش دهد؟
- محدودیت‌های RAGAS چیست؟

## Implementation Notes

- Before implementing Next.js code, read the relevant local Next.js guide in `node_modules/next/dist/docs/` because this project's Next.js version may differ from familiar conventions.
- Keep retrieval local and dependency-light.
- Avoid embeddings APIs for this MVP.
- Prefer a small number of well-named modules over a broad abstraction layer.
- Keep provider/model configuration easy to change.
- Keep the API route responsible for retrieval and generation so OpenRouter calls do not happen directly from the browser.
- Avoid adding state management libraries.
- Avoid adding an ADR for TF-IDF unless this decision becomes hard to reverse or surprising in the implementation.

## Resolved MVP Decisions

- Retrieve 3 chunks by default.
- Use paragraph-based chunking with no overlap.
- Do not automatically try fallback models in the MVP.
- Prefer Persian answers when the question or retrieved context is Persian.
- Round retrieval scores to 3 decimal places in the UI.

## Open Decisions

- What exact similarity threshold should count as insufficient context?
- Should the model selector be visible in the first UI or kept as internal configuration?
- Should the retrieved context panel be always visible, collapsed by default, or hidden until after the first answer?
