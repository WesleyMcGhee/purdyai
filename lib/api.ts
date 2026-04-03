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
    return "Tell me about your procrastination style. Are we talking 'I'll do it tomorrow' or 'I'll do it at 11:59 PM'?"
  }

  const responses = [
    "Very relatable. What are you procrastinating on right now? Be honest.",
    "We get it. Tell me more about how you like to avoid your responsibilities.",
    "No judgment here. What's your go-to distraction method?",
    "Classic. How do you feel about turning your procrastination into a feature?",
    "The most productive thing you'll do today is tell us what you should be doing instead.",
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
    executiveSummary: `ProcrastiDo is the world's first "productive procrastination" platform. While you meant to work on your actual tasks, you'll be organizing your procrastination into beautifully optimized avoidance strategies. Features include task decoration, guilt-free distraction sessions, and AI-powered excuse generation. Remember: the best time to start was yesterday. The second best time is... never. That's the feature.`,
    userStories: [
      {
        id: "1",
        asA: "chronic procrastinator",
        iWant: "to organize my avoidance activities",
        soThat:
          "I can procrastinate with a clear conscience and beautiful structure",
        acceptanceCriteria: [
          "I can create and categorize 'Things I'm Avoiding'",
          "I receive satisfying notifications about what I should be doing instead",
          "The app makes me feel guilty in a aesthetically pleasing way",
        ],
      },
      {
        id: "2",
        asA: "perfectionist",
        iWant: "to delay starting anything until conditions are perfect",
        soThat: "I can blame external factors when nothing gets done",
        acceptanceCriteria: [
          "The app waits for me to be 'ready' before logging any progress",
          "I can create elaborate setup rituals that count as productivity",
          "There's always a valid reason not to start",
        ],
      },
      {
        id: "3",
        asA: "remote worker",
        iWant: "to look busy while actually watching YouTube",
        soThat: "I can maintain plausible deniability during meetings",
        acceptanceCriteria: [
          "The app has a 'Deep Work' mode that just shows a fake timer",
          "I can customize my 'away' status to show 'In a Meeting' when I'm actually napping",
          "Keyboard sounds play automatically to sound productive",
        ],
      },
    ],
    functionalRequirements: [
      {
        id: "1",
        category: "Core Features",
        description:
          "Task decoration: Make your to-do list so pretty you forget it's empty",
        priority: "must-have",
      },
      {
        id: "2",
        category: "Core Features",
        description:
          "Guilt-free break timer: Set it for 5 minutes, automatically extends to 2 hours",
        priority: "must-have",
      },
      {
        id: "3",
        category: "Core Features",
        description:
          "AI Excuse Generator: Automatically generate plausible reasons for missed deadlines",
        priority: "must-have",
      },
      {
        id: "4",
        category: "Core Features",
        description:
          "'I'll start Monday' scheduling with automatic Monday-to-Monday rollover",
        priority: "should-have",
      },
      {
        id: "5",
        category: "Analytics",
        description:
          "Productivity theater metrics: Show how busy you look, not what you've done",
        priority: "could-have",
      },
    ],
    nonFunctionalRequirements: [
      {
        id: "1",
        category: "Performance",
        description:
          "App must load instantly so you can open it instead of doing real work",
        priority: "must-have",
      },
      {
        id: "2",
        category: "Availability",
        description:
          "System must be down exactly when you need to submit something",
        priority: "won't-have",
      },
      {
        id: "3",
        category: "Security",
        description:
          "All your avoided tasks are encrypted so no one knows you're behind",
        priority: "should-have",
      },
      {
        id: "4",
        category: "Scalability",
        description:
          "Must support unlimited tabs of 'research' that isn't research",
        priority: "must-have",
      },
    ],
    successMetrics: [
      {
        id: "1",
        name: "Tasks Procrastinated",
        target: "Track every task you've moved to 'next week' at least 5 times",
        measurement: "Count of tasks with status = 'Ehh, maybe later'",
      },
      {
        id: "2",
        name: "Productivity Theater Score",
        target:
          "Higher score for more time spent looking at the app without doing anything",
        measurement: "Ratio of app-open time to actual task completion",
      },
      {
        id: "3",
        name: "Monday Starts Avoided",
        target:
          "Track how many times you've said 'I'll start Monday' without doing it",
        measurement: "Self-reported survey with optional emoji responses",
      },
      {
        id: "4",
        name: "Guilt Conversion Rate",
        target: "100% of users feel slightly bad but continue using anyway",
        measurement: "Retention rate",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
