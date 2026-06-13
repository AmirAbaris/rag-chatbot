import type { KnowledgeChunk } from "./types"

/**
 *
 * @param knowledgeBase raw knowledge base text
 * @returns array of knowledge chunks
 */
export function createKnowledgeChunks(knowledgeBase: string): KnowledgeChunk[] {
  // split by paragraphs
  return knowledgeBase
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `chunk-${index + 1}`,
      text,
    }))
}
