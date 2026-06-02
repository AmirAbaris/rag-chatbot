import { readFileSync } from "node:fs"
import path from "node:path"

import { createKnowledgeChunks } from "./chunk"
import {
  calculateInverseDocumentFrequency,
  cosineSimilarity,
  tokenize,
  vectorize,
} from "./scoring"
import type { KnowledgeChunk, RetrievedChunk, RetrievalOptions } from "./types"

const DEFAULT_TOP_K = 3
const DEFAULT_KNOWLEDGE_BASE_PATH = path.join(
  process.cwd(),
  "data",
  "knowledge-base.txt",
)
const NEAR_SCORE_DELTA = 0.06

/**
 *
 * @param question user question to search for
 * @param options retrieval options
 * @returns most relevant chunks from the local knowledge base
 */
export function retrieveRelevantChunks(
  question: string,
  options: RetrievalOptions = {},
): RetrievedChunk[] {
  const knowledgeBase = readKnowledgeBase(options.knowledgeBasePath)

  return retrieveFromText(question, knowledgeBase, {
    topK: options.topK,
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
  options: Pick<RetrievalOptions, "topK"> = {},
): RetrievedChunk[] {
  const topK = options.topK ?? DEFAULT_TOP_K
  const chunks = createKnowledgeChunks(knowledgeBase)

  if (topK <= 0 || chunks.length === 0 || tokenize(question).length === 0) {
    return []
  }

  return rankChunks(question, chunks)
    .filter((chunk) => chunk.score > 0)
    .slice(0, topK)
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
 * @param question user question to compare against chunks
 * @param chunks knowledge chunks to rank
 * @returns chunks sorted by retrieval relevance
 */
function rankChunks(
  question: string,
  chunks: KnowledgeChunk[],
): RetrievedChunk[] {
  const chunkTokens = chunks.map((chunk) => tokenize(chunk.text))
  const questionTokens = tokenize(question)
  const idf = calculateInverseDocumentFrequency([
    ...chunkTokens,
    questionTokens,
  ])
  const questionVector = vectorize(questionTokens, idf)

  return chunks
    .map((chunk, index) => ({
      chunk: {
        id: chunk.id,
        score: cosineSimilarity(
          questionVector,
          vectorize(chunkTokens[index], idf),
        ),
        text: chunk.text,
      },
      index,
    }))
    .sort((left, right) => {
      const scoreDifference = right.chunk.score - left.chunk.score

      if (Math.abs(scoreDifference) <= NEAR_SCORE_DELTA) {
        return left.index - right.index
      }

      return scoreDifference
    })
    .map(({ chunk }) => chunk)
}
