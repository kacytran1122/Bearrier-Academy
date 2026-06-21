import { describe, it, expect } from "vitest"
import { scoreClues } from "@/lib/game/scoring"
import { SCENARIOS } from "@/lib/game/scenarios"

const fair = SCENARIOS.fair

describe("scoreClues (clue clarity engine)", () => {
  it("reading the three words is a pinpoint", () => {
    const r = scoreClues(fair, [], { saidThreeWords: true })
    expect(r.clarity).toBe(100)
    expect(r.drift).toBe(0)
  })

  it("no clues leaves the helper lost", () => {
    expect(scoreClues(fair, []).clarity).toBe(0)
  })

  it("one vague clue drifts; two strong clues land it", () => {
    const vague = scoreClues(fair, ["near-food"]).clarity
    const strong = scoreClues(fair, ["ticket", "ferris"]).clarity
    expect(vague).toBeLessThan(60)
    expect(strong).toBeGreaterThanOrEqual(90)
    expect(strong).toBeGreaterThan(vague)
  })
})
