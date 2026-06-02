export type RetrievedChunk = {
  id: string
  score: number
  text: string
}

export type KnowledgeChunk = {
  id: string
  text: string
}

export type RetrievalOptions = {
  knowledgeBasePath?: string
  topK?: number
}
