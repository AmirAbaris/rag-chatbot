"use client"

import { useMutation } from "@tanstack/react-query"

import type {
  ChatErrorResponse,
  ChatRequest,
  ChatResponse,
} from "@/components/chat/types"

export function useChatMutation() {
  return useMutation({
    mutationFn: postChatQuestion,
  })
}

async function postChatQuestion(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
  const data = (await response.json()) as ChatResponse | ChatErrorResponse

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Chat request failed.")
  }

  return data
}
