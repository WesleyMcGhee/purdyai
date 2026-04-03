export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  prds: PRD[]
  sharedWith: SharedUser[]
}

export interface SharedUser {
  id: string
  email: string
  name?: string
  role: "viewer" | "editor"
  addedAt: Date
}

export interface PRD {
  id: string
  projectId: string
  name: string
  interview: Interview
  executiveSummary: string
  userStories: UserStory[]
  functionalRequirements: Requirement[]
  nonFunctionalRequirements: Requirement[]
  successMetrics: SuccessMetric[]
  createdAt: Date
  updatedAt: Date
}

export interface Interview {
  conversation: Message[]
  currentPhase: InterviewPhase
  answers: Record<string, string>
  isComplete: boolean
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type InterviewPhase =
  | "intro"
  | "overview"
  | "users"
  | "goals"
  | "features"
  | "constraints"
  | "timeline"
  | "complete"

export interface UserStory {
  id: string
  asA: string
  iWant: string
  soThat: string
  acceptanceCriteria: string[]
}

export interface Requirement {
  id: string
  category: string
  description: string
  priority: "must-have" | "should-have" | "could-have" | "won't-have"
}

export interface SuccessMetric {
  id: string
  name: string
  target: string
  measurement: string
}

export interface LLMConfig {
  provider: "openai" | "anthropic" | "local"
  model?: string
  apiKey?: string
  baseUrl?: string
}

export type View = "projects" | "project-detail" | "prd"

export interface AppState {
  projects: Project[]
  llmConfig: LLMConfig
}
