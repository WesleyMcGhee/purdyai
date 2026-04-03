"use client"

import { useState, useRef, useEffect } from "react"
import { Message, InterviewPhase } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { sendChatMessage } from "@/lib/api"
import { INTERVIEW_QUESTIONS } from "@/lib/llm"

interface InterviewChatProps {
  onComplete: (answers: Record<string, string>) => void
  llmConfig: { apiKey?: string; provider?: "openai" | "anthropic" | "local" }
}

const PHASE_ORDER: InterviewPhase[] = [
  "intro",
  "overview",
  "users",
  "goals",
  "features",
  "constraints",
  "timeline",
  "complete",
]

export function InterviewChat({ onComplete, llmConfig }: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hi! I'm your product discovery assistant. I'll help you create a comprehensive PRD through a series of questions.\n\n" +
        INTERVIEW_QUESTIONS["intro"],
      timestamp: new Date(),
    }
    return [welcomeMessage]
  })
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>("overview")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isLoading && !isComplete) {
      inputRef.current?.focus()
    }
  }, [messages, isLoading, isComplete])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    const newAnswers = { ...answers, [currentPhase]: input.trim() }
    setAnswers(newAnswers)
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const phaseIndex = PHASE_ORDER.indexOf(currentPhase)

    if (phaseIndex < PHASE_ORDER.length - 2) {
      const response = await sendChatMessage([...messages, userMessage], {
        provider: "openai",
        ...llmConfig,
      })

      const nextPhase = PHASE_ORDER[phaseIndex + 1]
      const nextQuestion = INTERVIEW_QUESTIONS[nextPhase]

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `${response}\n\n${nextQuestion}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentPhase(nextPhase)
    } else {
      const finalMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I've gathered all the information I need. Generating your PRD...",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, finalMessage])
      setIsComplete(true)
      setTimeout(() => onComplete(newAnswers), 1500)
    }

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2 border-b pb-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Product Discovery Interview</h2>
          <p className="text-sm text-muted-foreground">
            Phase {PHASE_ORDER.indexOf(currentPhase)} of{" "}
            {PHASE_ORDER.length - 1}
          </p>
        </div>
      </div>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <Card
              className={`flex-1 p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <Card className="flex-1 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isComplete && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
