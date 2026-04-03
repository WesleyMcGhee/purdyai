import { Project, PRD, Message, SharedUser } from "./types"

export function parseStoredState(data: { projects?: unknown[] }): {
  projects: Project[]
} {
  return {
    projects: (data.projects || []).map((p: unknown) =>
      parseProject(p as Record<string, unknown>)
    ),
  }
}

function parseProject(data: Record<string, unknown>): Project {
  return {
    id: String(data.id),
    name: String(data.name),
    description: data.description ? String(data.description) : undefined,
    createdAt: parseDate(data.createdAt),
    updatedAt: parseDate(data.updatedAt),
    prds: ((data.prds as unknown[]) || []).map((prd: unknown) =>
      parsePRD(prd as Record<string, unknown>)
    ),
    sharedWith: ((data.sharedWith as unknown[]) || []).map((u: unknown) =>
      parseSharedUser(u as Record<string, unknown>)
    ),
  }
}

function parsePRD(data: Record<string, unknown>): PRD {
  return {
    id: String(data.id),
    projectId: String(data.projectId),
    name: String(data.name),
    executiveSummary: String(data.executiveSummary || ""),
    userStories: ((data.userStories as unknown[]) || []).map(
      (s: unknown) => s as PRD["userStories"][0]
    ),
    functionalRequirements: (
      (data.functionalRequirements as unknown[]) || []
    ).map((r: unknown) => r as PRD["functionalRequirements"][0]),
    nonFunctionalRequirements: (
      (data.nonFunctionalRequirements as unknown[]) || []
    ).map((r: unknown) => r as PRD["nonFunctionalRequirements"][0]),
    successMetrics: ((data.successMetrics as unknown[]) || []).map(
      (m: unknown) => m as PRD["successMetrics"][0]
    ),
    interview: parseInterview(
      data.interview as Record<string, unknown> | undefined
    ),
    createdAt: parseDate(data.createdAt),
    updatedAt: parseDate(data.updatedAt),
  }
}

function parseInterview(
  data: Record<string, unknown> | undefined
): PRD["interview"] {
  if (!data) {
    return {
      conversation: [],
      currentPhase: "intro",
      answers: {},
      isComplete: false,
    }
  }
  return {
    conversation: ((data.conversation as unknown[]) || []).map((m: unknown) =>
      parseMessage(m as Record<string, unknown>)
    ),
    currentPhase:
      (data.currentPhase as PRD["interview"]["currentPhase"]) || "intro",
    answers: (data.answers as Record<string, string>) || {},
    isComplete: Boolean(data.isComplete),
  }
}

function parseMessage(data: Record<string, unknown>): Message {
  return {
    id: String(data.id),
    role: (data.role as Message["role"]) || "assistant",
    content: String(data.content),
    timestamp: parseDate(data.timestamp),
  }
}

function parseSharedUser(data: Record<string, unknown>): SharedUser {
  return {
    id: String(data.id),
    email: String(data.email),
    name: data.name ? String(data.name) : undefined,
    role: (data.role as SharedUser["role"]) || "viewer",
    addedAt: parseDate(data.addedAt),
  }
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value)
  }
  return new Date()
}
