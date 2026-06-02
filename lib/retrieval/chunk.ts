import type { KnowledgeChunk } from "./types"

const SHORT_HEADING_CHARS = 60

/**
 *
 * @param knowledgeBase raw knowledge base text
 * @returns deterministic paragraph-based knowledge chunks
 */
export function createKnowledgeChunks(knowledgeBase: string): KnowledgeChunk[] {
  const paragraphs = knowledgeBase
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let pendingHeading = ""

  for (const paragraph of paragraphs) {
    if (paragraph.length < SHORT_HEADING_CHARS) {
      pendingHeading = pendingHeading
        ? `${pendingHeading}\n\n${paragraph}`
        : paragraph
      continue
    }

    chunks.push(
      pendingHeading ? `${pendingHeading}\n\n${paragraph}` : paragraph,
    )
    pendingHeading = ""
  }

  if (pendingHeading) {
    chunks.push(pendingHeading)
  }

  return chunks.map((text, index) => ({
    id: `chunk-${index + 1}`,
    text,
  }))
}
