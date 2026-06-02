import type { RetrievedChunk } from "@/lib/retrieval"

export type BuildRagPromptInput = {
  question: string
  chunks: RetrievedChunk[]
}
