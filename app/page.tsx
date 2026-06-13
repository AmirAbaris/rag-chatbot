import { ChatPanel } from "@/components/chat/chat-panel"

export default function Page() {
  return (
    <main className="min-h-svh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="border-b border-border pb-5">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Benchmarking LLMs in Retrieval-Augmented Generation
            </h1>
          </div>
        </header>

        <ChatPanel />
      </div>
    </main>
  )
}
