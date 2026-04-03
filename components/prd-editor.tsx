"use client"

import { useState } from "react"
import { PRD, UserStory, Requirement, SuccessMetric } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Download,
  Copy,
  Check,
  ChevronRight,
  Target,
  ListChecks,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  ExternalLink,
} from "lucide-react"

interface PRDEditorProps {
  prd: PRD
  onUpdate?: (prd: PRD) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PRDEditor({ prd, onUpdate: _onUpdate }: PRDEditorProps) {
  const [copied, setCopied] = useState(false)
  const [exportingTo, setExportingTo] = useState<string | null>(null)

  const copyToClipboard = () => {
    const text = generateMarkdown(prd)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadMarkdown = () => {
    const text = generateMarkdown(prd)
    const blob = new Blob([text], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `PRD-${prd.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToLinear = async () => {
    setExportingTo("linear")
    const data = generateLinearFormat(prd)
    downloadJSON(data, `Linear-${prd.name.replace(/\s+/g, "-")}.json`)
    setTimeout(() => setExportingTo(null), 1000)
  }

  const exportToAsana = async () => {
    setExportingTo("asana")
    const data = generateAsanaFormat(prd)
    downloadJSON(data, `Asana-${prd.name.replace(/\s+/g, "-")}.json`)
    setTimeout(() => setExportingTo(null), 1000)
  }

  const exportToJira = async () => {
    setExportingTo("jira")
    const data = generateJiraFormat(prd)
    downloadJSON(data, `Jira-${prd.name.replace(/\s+/g, "-")}.json`)
    setTimeout(() => setExportingTo(null), 1000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Product Requirements Document
            </h2>
            <p className="text-sm text-muted-foreground">
              Generated on {prd.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadMarkdown}>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Markdown</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToLinear}
                disabled={exportingTo === "linear"}
              >
                <div className="flex items-center gap-2">
                  <LinearIcon className="h-4 w-4" />
                  <span>Linear</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToAsana}
                disabled={exportingTo === "asana"}
              >
                <div className="flex items-center gap-2">
                  <AsanaIcon className="h-4 w-4" />
                  <span>Asana</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToJira}
                disabled={exportingTo === "jira"}
              >
                <div className="flex items-center gap-2">
                  <JiraIcon className="h-4 w-4" />
                  <span>Jira</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {prd.executiveSummary}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prd.userStories.map((story) => (
            <UserStoryCard key={story.id} story={story} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Functional Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Requirement
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {prd.functionalRequirements.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs">
                        {req.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{req.description}</td>
                    <td className="px-3 py-2">
                      <PriorityBadge priority={req.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Non-Functional Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Requirement
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {prd.nonFunctionalRequirements.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs">
                        {req.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{req.description}</td>
                    <td className="px-3 py-2">
                      <PriorityBadge priority={req.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prd.successMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-start gap-2">
        <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm">
          <span className="font-medium text-muted-foreground">As a</span>{" "}
          <span className="font-semibold">{story.asA}</span>
          <span className="font-medium text-muted-foreground">
            , I want to
          </span>{" "}
          <span className="font-semibold">{story.iWant}</span>
          <span className="font-medium text-muted-foreground">
            , so that
          </span>{" "}
          <span className="font-semibold">{story.soThat}</span>
        </div>
      </div>
      <div className="ml-7 space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Acceptance Criteria
        </p>
        <ul className="space-y-1">
          {story.acceptanceCriteria.map((criteria, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span>
              {criteria}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Requirement["priority"] }) {
  const styles = {
    "must-have": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "should-have":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "could-have":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "won't-have":
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  }
  const labels = {
    "must-have": "Must Have",
    "should-have": "Should Have",
    "could-have": "Could Have",
    "won't-have": "Won't Have",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  )
}

function MetricCard({ metric }: { metric: SuccessMetric }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-start justify-between">
        <h4 className="font-medium">{metric.name}</h4>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mb-2 text-sm text-muted-foreground">
        <span className="font-medium">Target:</span> {metric.target}
      </p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Measurement:</span> {metric.measurement}
      </p>
    </div>
  )
}

function generateMarkdown(prd: PRD): string {
  return `# Product Requirements Document

## Executive Summary
${prd.executiveSummary}

## User Stories

${prd.userStories
  .map(
    (story) => `
### ${story.asA}
**As a** ${story.asA}  
**I want** ${story.iWant}  
**So that** ${story.soThat}

#### Acceptance Criteria
${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}
`
  )
  .join("\n")}

## Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
${prd.functionalRequirements
  .map((req) => `| ${req.category} | ${req.description} | ${req.priority} |`)
  .join("\n")}

## Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
${prd.nonFunctionalRequirements
  .map((req) => `| ${req.category} | ${req.description} | ${req.priority} |`)
  .join("\n")}

## Success Metrics

${prd.successMetrics
  .map(
    (metric) => `
### ${metric.name}
- **Target:** ${metric.target}
- **Measurement:** ${metric.measurement}
`
  )
  .join("\n")}

---
*Generated by purdy.ai on ${prd.createdAt.toLocaleDateString()}*
`
}

function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function generateLinearFormat(prd: PRD) {
  return {
    name: prd.name,
    issues: [
      ...prd.userStories.map((story) => ({
        title: `${story.asA} - ${story.iWant}`,
        description: `**So that:** ${story.soThat}\n\n**Acceptance Criteria:**\n${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`,
        priority: 2,
        labels: ["user-story"],
      })),
      ...prd.functionalRequirements.map((req) => ({
        title: req.description,
        description: `**Category:** ${req.category}\n**Priority:** ${req.priority}`,
        priority:
          req.priority === "must-have"
            ? 3
            : req.priority === "should-have"
              ? 2
              : 1,
        labels: [
          "requirement",
          req.category.toLowerCase().replace(/\s+/g, "-"),
        ],
      })),
    ],
  }
}

function generateAsanaFormat(prd: PRD) {
  return {
    name: prd.name,
    tasks: [
      ...prd.userStories.map((story) => ({
        name: `${story.asA} - ${story.iWant}`,
        notes: `**So that:** ${story.soThat}\n\n**Acceptance Criteria:**\n${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`,
        custom_fields: [{ name: "Type", value: "User Story" }],
      })),
      ...prd.functionalRequirements.map((req) => ({
        name: req.description,
        notes: `**Category:** ${req.category}\n**Priority:** ${req.priority}`,
        custom_fields: [{ name: "Type", value: "Requirement" }],
      })),
    ],
  }
}

function generateJiraFormat(prd: PRD) {
  return {
    projects: [
      {
        key: prd.name.replace(/\s+/g, "").substring(0, 3).toUpperCase(),
        name: prd.name,
        issues: [
          ...prd.userStories.map((story) => ({
            summary: `${story.asA} - ${story.iWant}`,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: `*So that:* ${story.soThat}` },
                  ],
                },
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Acceptance Criteria" }],
                },
                ...story.acceptanceCriteria.map((c) => ({
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: c }],
                        },
                      ],
                    },
                  ],
                })),
              ],
            },
            issuetype: { name: "Story" },
          })),
          ...prd.functionalRequirements.map((req) => ({
            summary: req.description,
            description: `**Category:** ${req.category}`,
            issuetype: { name: "Requirement" },
            priority: {
              name:
                req.priority === "must-have"
                  ? "Highest"
                  : req.priority === "should-have"
                    ? "High"
                    : "Medium",
            },
          })),
        ],
      },
    ],
  }
}

function LinearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.654 10.6a.6.6 0 0 1-.177-.48V5.845a.6.6 0 0 1 .6-.6h2.275a.6.6 0 0 1 .6.6v4.155a.6.6 0 0 1-.6.6H2.654zm.6 1.8a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V12.4a.6.6 0 0 0-.6-.6H3.254zm0 6.075a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V18.4a.6.6 0 0 0-.6-.6H3.254zm6.075-1.8a.6.6 0 0 0-.6.6v4.155a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6v-4.155a.6.6 0 0 0-.6-.6H9.329zm.6 1.8a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V12.4a.6.6 0 0 0-.6-.6H9.929zm0 6.075a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V18.4a.6.6 0 0 0-.6-.6H9.929zm6.075-7.875a.6.6 0 0 0-.6.6v4.155a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6v-4.155a.6.6 0 0 0-.6-.6H16.004zm.6 1.8a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V12.4a.6.6 0 0 0-.6-.6H16.604zm0 6.075a.6.6 0 0 0-.6.6v2.275a.6.6 0 0 0 .6.6h2.275a.6.6 0 0 0 .6-.6V18.4a.6.6 0 0 0-.6-.6H16.604z" />
    </svg>
  )
}

function AsanaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.094 11.784c-.094.01-.19.02-.29.029C14.5 12.12 12.174 12.5 12 12.5s-2.5-.38-4.804-.687c-.1-.01-.196-.02-.29-.03a.6.6 0 0 0-.612.55l-.43 2.74a.6.6 0 0 0 .598.67c.11-.02.224-.04.34-.058C9.41 15.39 11.07 15.5 12 15.5s2.59-.11 4.198-.588c.116.018.23.038.34.058a.6.6 0 0 0 .598-.67l-.43-2.74a.6.6 0 0 0-.606-.55zM12 6.5c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  )
}

function JiraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24.018 12.5V1.005A1.001 1.001 0 0 0 23.013 0z" />
    </svg>
  )
}
