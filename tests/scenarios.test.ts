import { describe, it, expect } from "vitest"
import { SCENARIOS, SCENARIO_IDS, getScenario } from "@/lib/game/scenarios"
import { SKILLS } from "@/lib/game/skills"

describe("scenario data integrity", () => {
  it("getScenario returns a known scenario and undefined otherwise", () => {
    expect(getScenario("trail")?.id).toBe("trail")
    expect(getScenario("nope")).toBeUndefined()
  })

  it("every scenario is well-formed", () => {
    for (const id of SCENARIO_IDS) {
      const s = SCENARIOS[id]
      expect(s.id).toBe(id)
      expect(s.threeWords).toHaveLength(3)
      expect(s.landmarks.length).toBeGreaterThanOrEqual(3)
      expect(s.clues.length).toBeGreaterThanOrEqual(1)
      // a real sample location
      expect(Math.abs(s.location.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(s.location.lng)).toBeLessThanOrEqual(180)
      expect(s.location.zoom).toBeGreaterThan(0)
      // every skill referenced exists
      for (const skill of s.skills) expect(SKILLS[skill]).toBeDefined()
      // every clue's landmarkId (if set) points to a real landmark
      const ids = new Set(s.landmarks.map((l) => l.id))
      for (const c of s.clues) if (c.landmarkId) expect(ids.has(c.landmarkId)).toBe(true)
    }
  })
})
