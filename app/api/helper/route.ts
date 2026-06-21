import { NextResponse } from "next/server"
import { getScenario } from "@/lib/game/scenarios"
import { helperPrompt } from "@/lib/claude/characters"
import { speak } from "@/lib/claude/client"

export const runtime = "nodejs"

interface HelperRequest {
  scenarioId?: string
  clueLabels?: string[]
  clarity?: number
  saidThreeWords?: boolean
  /** Optional situation for the AI to phrase warmly (used by the rounds). */
  note?: string
}

// Deterministic fallback line so the helper speaks even with no Claude key.
function fallbackLine(clarity: number): string {
  if (clarity >= 90) return `Got it! I know just where you are. Help is on the way. Stay right there!`
  if (clarity >= 60) return `Good clues! I think I found your spot. Can you tell me one more thing you see?`
  if (clarity > 0) return `Thanks! I'm not sure yet. What else can you see near you?`
  return `I'm right here with you. Look around slowly and tell me one thing you can see.`
}

export async function POST(req: Request) {
  let body: HelperRequest
  try {
    body = (await req.json()) as HelperRequest
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const scenario = getScenario(body.scenarioId ?? "")
  const clarity = Math.max(0, Math.min(100, body.clarity ?? 0))
  const labels = (body.clueLabels ?? []).map((l) => `"${l}"`).join(", ")

  const user = body.note
    ? `${body.note} Reply with one short, kind line for a young child.`
    : `A child is telling me where they are by naming places they can see. Places so far: ${
        labels || "none yet"
      }.${
        body.saidThreeWords ? " They also read their three-word address aloud." : ""
      } My confidence I can find them is ${clarity} out of 100. Reply with one short, kind line.`

  const line = await speak({
    system: helperPrompt(scenario?.helperRole ?? "worker"),
    user,
    fallback: fallbackLine(clarity),
  })

  return NextResponse.json({ line })
}
