export type OpenRouterChatRequest = {
  apiKey: string
  model?: string
  prompt: string
}

export type OpenRouterChatResponse = {
  answer: string
  model: string
}

export type OpenRouterCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>
    }
  }>
  model?: string
  error?: {
    message?: string
  }
}
