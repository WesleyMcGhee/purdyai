import { Message, LLMConfig, PRD, Interview } from "./types"

export async function sendChatMessage(
  messages: Message[],
  config: LLMConfig
): Promise<string> {
  if (!config.apiKey) {
    return getMockResponse(messages)
  }

  const baseUrl = config.baseUrl || "https://api.openai.com/v1"
  const model = config.model || "gpt-4o-mini"

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("LLM API error:", error)
    return getMockResponse(messages)
  }
}

export async function generatePRD(
  projectId: string,
  prdName: string,
  interview: Interview,
  config: LLMConfig
): Promise<PRD> {
  const answers = interview.answers

  if (!config.apiKey) {
    return generateMockPRD(projectId, prdName, interview)
  }

  const prompt = buildPRDGenerationPrompt(answers)

  try {
    const baseUrl = config.baseUrl || "https://api.openai.com/v1"
    const model = config.model || "gpt-4o-mini"

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a senior product manager creating a detailed Product Requirements Document. Generate a comprehensive PRD in the following JSON format. Return ONLY the JSON, no markdown or explanation.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const prdData = JSON.parse(content) as PRD

    return {
      ...prdData,
      id: crypto.randomUUID(),
      projectId,
      name: prdName,
      interview,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("PRD generation error:", error)
    return generateMockPRD(projectId, prdName, interview)
  }
}

function buildPRDGenerationPrompt(answers: Record<string, string>): string {
  return `Based on the following product discovery answers, generate a complete PRD:

${Object.entries(answers)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Generate a PRD with this structure (exclude projectId, name, and interview - they will be added separately):
{
  "executiveSummary": "2-3 paragraph summary",
  "userStories": [
    {
      "id": "story-1",
      "asA": "user type",
      "iWant": "feature",
      "soThat": "benefit",
      "acceptanceCriteria": ["criteria1", "criteria2"]
    }
  ],
  "functionalRequirements": [
    {
      "id": "req-1",
      "category": "category name",
      "description": "requirement description",
      "priority": "must-have|should-have|could-have|won't-have"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "nfr-1",
      "category": "category name", 
      "description": "requirement description",
      "priority": "must-have|should-have|could-have|won't-have"
    }
  ],
  "successMetrics": [
    {
      "id": "metric-1",
      "name": "metric name",
      "target": "target value",
      "measurement": "how to measure"
    }
  ]
}`
}

function getMockResponse(messages: Message[]): string {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

  if (!lastUserMessage) {
    return "Tell me more about what you're building."
  }

  const responses = [
    "That's interesting! Can you tell me more about who would be using this?",
    "Great detail! What timeline are you working with?",
    "I see. Are there any specific technical requirements we should consider?",
    "Thanks for sharing that. Let's talk about your target users.",
    "That's helpful context. What does success look like for this project?",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateMockPRD(
  projectId: string,
  prdName: string,
  interview: Interview
): PRD {
  return {
    id: crypto.randomUUID(),
    projectId,
    name: prdName,
    interview,
    executiveSummary: `This document outlines the requirements for "${prdName}". Based on our discovery interview, the solution addresses key user needs while maintaining high standards for performance and reliability.`,
    userStories: [
      {
        id: "1",
        asA: "new user",
        iWant: "to quickly understand and use the product",
        soThat: "I can accomplish my goals without friction",
        acceptanceCriteria: [
          "Onboarding completes in under 5 minutes",
          "Core features are discoverable",
          "Error messages are helpful and actionable",
        ],
      },
      {
        id: "2",
        asA: "returning user",
        iWant: "to efficiently complete my regular tasks",
        soThat: "I can save time and be productive",
        acceptanceCriteria: [
          "Common actions require minimal clicks",
          "Data persists across sessions",
          "Shortcuts are available for power users",
        ],
      },
    ],
    functionalRequirements: [
      {
        id: "1",
        category: "Core Features",
        description:
          "User authentication with email/password and social login options",
        priority: "must-have",
      },
      {
        id: "2",
        category: "Core Features",
        description: "Dashboard with key metrics and quick actions",
        priority: "must-have",
      },
      {
        id: "3",
        category: "Data Management",
        description: "CRUD operations for primary entities",
        priority: "must-have",
      },
    ],
    nonFunctionalRequirements: [
      {
        id: "1",
        category: "Performance",
        description: "Page load time under 2 seconds on 3G networks",
        priority: "must-have",
      },
      {
        id: "2",
        category: "Security",
        description: "All data encrypted in transit and at rest",
        priority: "must-have",
      },
      {
        id: "3",
        category: "Accessibility",
        description: "WCAG 2.1 AA compliance",
        priority: "should-have",
      },
    ],
    successMetrics: [
      {
        id: "1",
        name: "User Activation Rate",
        target: "40% of signups complete key action within first session",
        measurement: "Ratio of users who complete onboarding vs total signups",
      },
      {
        id: "2",
        name: "Session Duration",
        target: "Average session increases 25% after feature discovery",
        measurement: "Google Analytics session duration metric",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
