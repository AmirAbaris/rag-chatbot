import { NextResponse } from "next/server"

import { generateOpenRouterAnswer } from "@/lib/openrouter"
import { buildRagPrompt } from "@/lib/prompt"
import { retrieveRelevantChunks, type RetrievedChunk } from "@/lib/retrieval"

const INSUFFICIENT_CONTEXT_ANSWER =
  "اطلاعات بازیابی‌شده برای پاسخ‌دهی به این سوال کافی نیست."

type ChatRequest = {
  apiKey?: unknown
  question?: unknown
  model?: unknown
}

type ChatResponse = {
  answer: string
  chunks: RetrievedChunk[]
  model: string
}

type ChatErrorResponse = {
  error: string
}

/**
 *
 * @param request incoming chat request
 * @returns generated answer with retrieved chunks
 */
export async function POST(
  request: Request,
): Promise<NextResponse<ChatResponse | ChatErrorResponse>> {
  try {
    const body = validateChatRequest(await request.json())
    const chunks = retrieveRelevantChunks(body.question)

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: INSUFFICIENT_CONTEXT_ANSWER,
        chunks,
        model: "local-retrieval",
      })
    }

    const prompt = buildRagPrompt({
      question: body.question,
      chunks,
    })
    const completion = await generateOpenRouterAnswer({
      apiKey: body.apiKey,
      model: body.model,
      prompt,
    })

    return NextResponse.json({
      answer: completion.answer,
      chunks: chunks.map((chunk) => ({
        ...chunk,
        score: roundScore(chunk.score),
      })),
      model: completion.model,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      {
        status: getErrorStatus(error),
      },
    )
  }
}

/**
 *
 * @param body untrusted request body
 * @returns validated chat request body
 */
function validateChatRequest(body: ChatRequest) {
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : ""
  const question = typeof body.question === "string" ? body.question.trim() : ""
  const model = typeof body.model === "string" ? body.model.trim() : undefined

  if (!apiKey) {
    throw new ChatRouteError("OpenRouter API key is required.", 400)
  }

  if (!question) {
    throw new ChatRouteError("Question is required.", 400)
  }

  return {
    apiKey,
    question,
    model: model || undefined,
  }
}

/**
 *
 * @param score raw retrieval score
 * @returns score rounded to three decimals
 */
function roundScore(score: number) {
  return Math.round(score * 1000) / 1000
}

/**
 *
 * @param error caught route error
 * @returns user-facing error message
 */
function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Unexpected chat error."
}

/**
 *
 * @param error caught route error
 * @returns HTTP response status
 */
function getErrorStatus(error: unknown) {
  if (error instanceof ChatRouteError) {
    return error.status
  }

  return 500
}

class ChatRouteError extends Error {
  /**
   *
   * @param message error message
   * @param status HTTP response status
   * @returns chat route error instance
   */
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}
