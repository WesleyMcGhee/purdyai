"use client"

import { useState } from "react"
import { LLMConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Key, Globe, Cpu } from "lucide-react"

interface SettingsModalProps {
  config: LLMConfig
  onSave: (config: LLMConfig) => void
}

export function SettingsModal({ config, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState<"openai" | "anthropic" | "local">(
    config.provider || "openai"
  )
  const [apiKey, setApiKey] = useState(config.apiKey || "")
  const [model, setModel] = useState(config.model || "")
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || "")

  const handleSave = () => {
    onSave({ provider, apiKey, model, baseUrl })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            LLM Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "openai" | "anthropic" | "local")
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Local / Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              {provider === "local"
                ? "Leave empty to use mock responses for testing."
                : "Your API key is stored locally and never sent to our servers."}
            </p>
          </div>

          {provider !== "local" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={
                  provider === "openai"
                    ? "gpt-4o-mini"
                    : "claude-sonnet-4-20250514"
                }
              />
            </div>
          )}

          {provider === "local" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Base URL</label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434/v1"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
