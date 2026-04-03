import { Message, InterviewPhase } from "./types"

export interface LLMProvider {
  chat(messages: Message[]): Promise<string>
  generatePRD(answers: Record<string, string>): Promise<string>
}

const SYSTEM_PROMPTS: Record<InterviewPhase, string> = {
  intro: `You are a product discovery assistant helping users define their product idea. Start by asking them a simple question to understand what kind of product they want to build. Be conversational and friendly.`,

  overview: `The user has shared their initial product idea. Ask questions to understand the core value proposition, target market, and primary use case. Focus on one thing at a time.`,

  users: `Now dig into who the users are. Ask about demographics, their current alternatives, and what problems they face. Try to identify 2-3 distinct user personas.`,

  goals: `Understand the business goals and success metrics. Ask about primary KPIs, revenue model if applicable, and what would make this product a success.`,

  features: `Explore the core features needed. Start with the MVP - what's the smallest thing we can build that delivers value? Follow up on any mentioned features with specific questions about requirements.`,

  constraints: `Ask about technical constraints, budget, timeline, team size, and any must-have integrations or compliance requirements.`,

  timeline: `Finally, understand their timeline expectations and launch strategy. Ask about phases, milestones, and go-to-market plans.`,

  complete: `Thank the user and let them know their PRD is being generated.`,
}

export function getSystemPrompt(
  phase: InterviewPhase,
  answers: Record<string, string>
): string {
  let prompt = SYSTEM_PROMPTS[phase]

  if (Object.keys(answers).length > 0) {
    prompt += "\n\nPrevious answers:\n"
    for (const [key, value] of Object.entries(answers)) {
      prompt += `- ${key}: ${value}\n`
    }
  }

  return prompt
}

export const INTERVIEW_QUESTIONS: Record<InterviewPhase, string> = {
  intro: "What product or feature are you thinking about building?",
  overview: "What's the core problem this product solves, and who's it for?",
  users:
    "Tell me about the users who will use this product. What are their main pain points?",
  goals:
    "What does success look like for this product? What metrics matter most?",
  features: "What are the must-have features in the initial version?",
  constraints:
    "Are there any technical constraints, deadlines, or budget limitations I should know about?",
  timeline:
    "What's your ideal timeline for launch, and how are you planning to roll this out?",
  complete:
    "I've gathered enough information to create your PRD. Generating it now...",
}
