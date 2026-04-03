"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, MessageCircle, Clock, Zap } from "lucide-react"

export function PaaSWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {isOpen ? (
        <Card className="w-80 border-2 border-primary/20 shadow-xl">
          <div className="flex items-center justify-between border-b bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">PaaS Bot</p>
                <p className="text-xs text-muted-foreground">
                  Procrastination as a Service
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg rounded-tl-none bg-muted p-3 text-sm">
                <p>Hey there! 👋</p>
                <p className="mt-1">
                  You look like you could use some{" "}
                  <span className="font-semibold text-primary">
                    productive procrastination
                  </span>
                  .
                </p>
                <p className="mt-1">
                  <span className="font-bold">
                    PaaS (Procrastination as a Service)
                  </span>{" "}
                  is coming soon!
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg rounded-tl-none bg-muted p-3 text-sm">
                <p>Get ready for:</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• AI-powered excuse generation</li>
                  <li>• Guilt-free break scheduling</li>
                  <li>• Task avoidance optimization</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-primary/10 p-3 text-center text-sm">
              <p className="font-medium">Coming 2026™</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Or maybe 2027. No rush.
              </p>
            </div>

            <Button className="w-full" disabled>
              Join the Waitlist (Later)
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
