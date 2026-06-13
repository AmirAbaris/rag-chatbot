import { readFileSync } from "node:fs"
import path from "node:path"

import MiniSearch from "minisearch"

import { createKnowledgeChunks } from "./chunk"
import type { KnowledgeChunk, RetrievedChunk, RetrievalOptions } from "./types"

const DEFAULT_MAX_CHUNKS = 3
const DEFAULT_KNOWLEDGE_BASE_PATH = path.join(
  process.cwd(),
  "data",
  "knowledge-base.txt"
)

type SearchDocument = KnowledgeChunk

/**
 *
 * @param question user question to search for
 * @param options retrieval options
 * @returns most relevant chunks from the local knowledge base
 */
export function retrieveRelevantChunks(
  question: string,
  options: RetrievalOptions = {}
): RetrievedChunk[] {
  const knowledgeBase = readKnowledgeBase(options.knowledgeBasePath)

  return retrieveFromText(question, knowledgeBase, {
    maxChunks: options.maxChunks,
  })
}

/**
 *
 * @param question user question to search for
 * @param knowledgeBase raw knowledge base text
 * @param options retrieval options
 * @returns most relevant chunks from the provided text
 */
export function retrieveFromText(
  question: string,
  knowledgeBase: string,
  options: Pick<RetrievalOptions, "maxChunks"> = {}
): RetrievedChunk[] {
  const maxChunks = options.maxChunks ?? DEFAULT_MAX_CHUNKS
  const chunks = createKnowledgeChunks(knowledgeBase)

  if (maxChunks <= 0 || chunks.length === 0 || question.trim().length === 0) {
    return []
  }

  const search = createSearchIndex(chunks)
  const results = search.search(question, {
    prefix: true,
  })
  const topScore = results[0]?.score ?? 0

  return results.slice(0, maxChunks).map((result) => ({
    id: String(result.id),
    score: topScore > 0 ? result.score / topScore : 0,
    text: String(result.text ?? ""),
  }))
}

/**
 *
 * @param knowledgeBasePath filesystem path to the knowledge base
 * @returns knowledge base contents
 */
function readKnowledgeBase(knowledgeBasePath = DEFAULT_KNOWLEDGE_BASE_PATH) {
  return readFileSync(knowledgeBasePath, "utf8")
}

/**
 *
 * @param chunks knowledge chunks to rank
 * @returns MiniSearch index for the provided chunks
 */
function createSearchIndex(chunks: SearchDocument[]) {
  const search = new MiniSearch<SearchDocument>({
    fields: ["text"],
    idField: "id",
    storeFields: ["text"],
  })

  search.addAll(chunks)

  return search
}
