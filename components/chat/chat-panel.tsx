"use client"

import { FormEvent, useState } from "react"
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MessageSquareText,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChatMutation } from "@/hooks/use-chat-mutation"
import { cn } from "@/lib/utils"

import { RetrievedContext } from "./retrieved-context"

export function ChatPanel() {
  const [apiKey, setApiKey] = useState("")
  const [question, setQuestion] = useState("")
  const [isKeyVisible, setIsKeyVisible] = useState(false)
  const chatMutation = useChatMutation()

  const canSubmit = apiKey.trim().length > 0 && question.trim().length > 0
  const answer = chatMutation.data?.answer ?? ""
  const chunks = chatMutation.isPending ? [] : (chatMutation.data?.chunks ?? [])
  const error = chatMutation.error?.message ?? ""
  const isLoading = chatMutation.isPending
  const model = chatMutation.data?.model ?? ""

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || isLoading) {
      return
    }

    chatMutation.reset()
    chatMutation.mutate({
      apiKey,
      question,
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
      <section className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <MessageSquareText className="size-4" aria-hidden="true" />
            Grounded answer
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Ask the local RAG knowledge base
          </h2>
        </div>

        <form className="grid gap-5 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="openrouter-key"
            >
              OpenRouter API key
            </label>
            <div className="flex rounded-lg border border-input bg-background transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="flex size-10 shrink-0 items-center justify-center text-muted-foreground">
                <KeyRound className="size-4" aria-hidden="true" />
              </span>
              <input
                id="openrouter-key"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="sk-or-v1..."
                type={isKeyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <Button
              className="flex items-center justify-center h-full mr-2"
                aria-label={isKeyVisible ? "Hide API key" : "Show API key"}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => setIsKeyVisible((visible) => !visible)}
              >
                {isKeyVisible ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="question"
            >
              Question
            </label>
            <textarea
              id="question"
              className="min-h-36 resize-y rounded-lg border border-input bg-background p-3 text-sm leading-7 text-foreground transition outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
              dir="auto"
              placeholder="RAGAS چیست؟"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button disabled={!canSubmit || isLoading} type="submit">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {isLoading ? "Asking" : "Ask"}
            </Button>
          </div>
        </form>

        <div className="border-t border-border p-5">
          {error ? (
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>{error}</p>
            </div>
          ) : (
            <AnswerPanel answer={answer} isLoading={isLoading} model={model} />
          )}
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-muted/50 p-5 text-foreground">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Retrieved context
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {chunks.length
                ? "Similarity scores shown per chunk."
                : "Awaiting retrieval."}
            </p>
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
            {chunks.length}/3
          </span>
        </div>
        <RetrievedContext chunks={chunks} />
      </aside>
    </div>
  )
}

type AnswerPanelProps = {
  answer: string
  isLoading: boolean
  model: string
}

function AnswerPanel({ answer, isLoading, model }: AnswerPanelProps) {
  return (
    <div
      className={cn(
        "min-h-48 rounded-lg border border-border bg-muted/50 p-4",
        !answer && !isLoading && "flex items-center"
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Retrieving chunks and generating an answer...
        </div>
      ) : answer ? (
        <div className="grid gap-3">
          <p
            dir="auto"
            className="text-sm leading-7 whitespace-pre-wrap text-foreground"
          >
            {answer}
          </p>
          {model ? (
            <p className="border-t border-border pt-3 font-mono text-xs text-muted-foreground">
              {model}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          The latest answer will appear here.
        </p>
      )}
    </div>
  )
}
