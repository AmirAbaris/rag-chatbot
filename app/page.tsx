import { ChatPanel } from "@/components/chat/chat-panel"

export default function Page() {
  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">RAG Chatbot MVP</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Grounded Persian Q&A.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Retrieval context stays visible beside every answer.
          </p>
        </header>

        <ChatPanel />
      </div>
    </main>
  )
}
