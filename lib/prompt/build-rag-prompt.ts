import type { BuildRagPromptInput } from "./types"

/**
 *
 * @param input question and retrieved context
 * @returns grounded RAG prompt for the model
 */
export function buildRagPrompt(input: BuildRagPromptInput) {
  const context = formatRetrievedContext(input.chunks)

  return [
    "You are a RAG chatbot answering from a fixed knowledge base.",
    "Use only the retrieved context below.",
    "If the retrieved context is insufficient, say that the provided context is not enough to answer.",
    "Answer in the same language as the question when possible.",
    "Do not add facts that are not supported by the retrieved context.",
    "",
    "Retrieved context:",
    context || "No retrieved context.",
    "",
    "Question:",
    input.question,
    "",
    "Answer:",
  ].join("\n")
}

/**
 *
 * @param chunks retrieved chunks to include in the prompt
 * @returns formatted context block
 */
function formatRetrievedContext(chunks: BuildRagPromptInput["chunks"]) {
  return chunks
    .map((chunk) =>
      [`[${chunk.id}]`, `Score: ${chunk.score.toFixed(3)}`, chunk.text].join(
        "\n"
      )
    )
    .join("\n\n")
}
