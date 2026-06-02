import type { KnowledgeChunk } from "./types"

const SHORT_HEADING_CHARS = 60
const MAX_CHUNK_CHARS = 1600

/**
 *
 * @param knowledgeBase raw knowledge base text
 * @returns deterministic knowledge chunks sized for focused retrieval
 */
export function createKnowledgeChunks(knowledgeBase: string): KnowledgeChunk[] {
  const units = knowledgeBase
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap(splitLongText)

  const chunks: string[] = []
  let pendingHeading = ""
  let currentChunk = ""

  for (const unit of units) {
    if (unit.length < SHORT_HEADING_CHARS && !currentChunk) {
      pendingHeading = pendingHeading ? `${pendingHeading}\n\n${unit}` : unit
      continue
    }

    const nextUnit = pendingHeading ? `${pendingHeading}\n\n${unit}` : unit
    pendingHeading = ""

    if (
      currentChunk &&
      `${currentChunk}\n\n${nextUnit}`.length > MAX_CHUNK_CHARS
    ) {
      chunks.push(currentChunk)
      currentChunk = nextUnit
      continue
    }

    currentChunk = currentChunk ? `${currentChunk}\n\n${nextUnit}` : nextUnit
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  if (pendingHeading) {
    chunks.push(pendingHeading)
  }

  return chunks.map((text, index) => ({
    id: `chunk-${index + 1}`,
    text,
  }))
}

/**
 *
 * @param text source text block
 * @returns smaller retrieval units split on natural boundaries
 */
function splitLongText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) {
    return [text]
  }

  const pieces = text
    .split(/(?<=\.)\s+(?=[A-Z(•])|\n(?=•)|\n(?=[A-Z][A-Za-z ]{3,}$)/)
    .map((piece) => piece.trim())
    .filter(Boolean)

  const units: string[] = []
  let currentUnit = ""

  for (const piece of pieces) {
    if (piece.length > MAX_CHUNK_CHARS) {
      if (currentUnit) {
        units.push(currentUnit)
        currentUnit = ""
      }

      units.push(...splitByWords(piece))
      continue
    }

    if (currentUnit && `${currentUnit} ${piece}`.length > MAX_CHUNK_CHARS) {
      units.push(currentUnit)
      currentUnit = piece
      continue
    }

    currentUnit = currentUnit ? `${currentUnit} ${piece}` : piece
  }

  if (currentUnit) {
    units.push(currentUnit)
  }

  return units
}

/**
 *
 * @param text text that has no smaller natural boundary
 * @returns word-based chunks
 */
function splitByWords(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let currentChunk = ""

  for (const word of words) {
    if (currentChunk && `${currentChunk} ${word}`.length > MAX_CHUNK_CHARS) {
      chunks.push(currentChunk)
      currentChunk = word
      continue
    }

    currentChunk = currentChunk ? `${currentChunk} ${word}` : word
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}
