import type {
  OpenRouterChatRequest,
  OpenRouterChatResponse,
  OpenRouterCompletionResponse,
} from "./types"

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free"

/**
 *
 * @param request OpenRouter chat request
 * @returns generated answer and model id
 */
export async function generateOpenRouterAnswer(
  request: OpenRouterChatRequest,
): Promise<OpenRouterChatResponse> {
  const model = request.model ?? DEFAULT_MODEL
  const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: request.prompt,
        },
      ],
      temperature: 0.2,
    }),
  })
  const data = (await response.json().catch(() => null)) as
    | OpenRouterCompletionResponse
    | null

  if (!response.ok) {
    throw new Error(getOpenRouterErrorMessage(data, response.status, model))
  }

  const answer = extractAnswerText(data)

  if (!answer) {
    throw new Error(`OpenRouter returned an empty answer for model "${model}".`)
  }

  return {
    answer,
    model: data?.model ?? model,
  }
}

/**
 *
 * @param data OpenRouter response payload
 * @returns generated answer text
 */
function extractAnswerText(data: OpenRouterCompletionResponse | null) {
  const content = data?.choices?.[0]?.message?.content

  if (typeof content === "string") {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? "")
      .join("")
      .trim()
  }

  return ""
}

/**
 *
 * @param data OpenRouter response payload
 * @param status HTTP status code
 * @param model selected model id
 * @returns normalized provider error message
 */
function getOpenRouterErrorMessage(
  data: OpenRouterCompletionResponse | null,
  status: number,
  model: string,
) {
  const providerMessage = data?.error?.message?.trim()

  if (providerMessage) {
    return `OpenRouter error for model "${model}": ${providerMessage}`
  }

  return `OpenRouter request failed for model "${model}" with status ${status}.`
}
