import Anthropic from "@anthropic-ai/sdk"

// Server-only Claude client. The key never reaches the browser — every call to
// Claude goes through our Route Handlers. Per the spec we default to the fast,
// low-cost model for in-game dialogue.
export const DIALOGUE_MODEL = "claude-haiku-4-5"

let client: Anthropic | null = null

export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export function getClaude(): Anthropic {
  if (!client) {
    client = new Anthropic() // reads ANTHROPIC_API_KEY from the environment
  }
  return client
}

/**
 * Ask a kid-safe character for one short line. Falls back to a caller-supplied
 * canned line if no API key is configured, so the game runs out of the box.
 */
export async function speak(args: {
  system: string
  user: string
  fallback: string
}): Promise<string> {
  if (!hasClaude()) return args.fallback
  try {
    const res = await getClaude().messages.create({
      model: DIALOGUE_MODEL,
      max_tokens: 200,
      // Short, kid-safe character lines don't need extended thinking; Haiku 4.5
      // also doesn't take the adaptive thinking param (that's Opus/Sonnet 4.6+).
      system: args.system,
      messages: [{ role: "user", content: args.user }],
    })
    const text = res.content.find((b) => b.type === "text")
    return text && "text" in text ? text.text.trim() : args.fallback
  } catch {
    // Any API/network error degrades gracefully to the canned line.
    return args.fallback
  }
}
