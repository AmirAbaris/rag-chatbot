import { FileText } from "lucide-react"

import type { RetrievedChunk } from "./types"

type RetrievedContextProps = {
  chunks: RetrievedChunk[]
}

export function RetrievedContext({ chunks }: RetrievedContextProps) {
  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
        No retrieved chunks yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {chunks.map((chunk) => (
        <article
          key={chunk.id}
          className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <FileText className="size-3.5" aria-hidden="true" />
              </span>
              <h3 className="truncate text-sm font-medium text-foreground">
                {chunk.id}
              </h3>
            </div>
            <span className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              {chunk.score.toFixed(3)}
            </span>
          </div>
          <p
            dir="auto"
            className="text-sm leading-7 whitespace-pre-wrap text-foreground"
          >
            {chunk.text}
          </p>
        </article>
      ))}
    </div>
  )
}
