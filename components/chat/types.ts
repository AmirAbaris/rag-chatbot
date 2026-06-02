export type RetrievedChunk = {
  id: string
  score: number
  text: string
}

export type ChatRequest = {
  apiKey: string
  question: string
}

export type ChatResponse = {
  answer: string
  chunks: RetrievedChunk[]
  model: string
}

export type ChatErrorResponse = {
  error: string
}
