import { describe, it, expect } from "vitest"
import { toMorse, fromMorse, MORSE } from "@/lib/game/morse"

describe("morse", () => {
  it("encodes the search zone B2", () => {
    expect(toMorse("B2")).toBe("-... ..---")
  })

  it("decodes B2 back from Morse", () => {
    expect(fromMorse("-... ..---")).toBe("B2")
  })

  it("round-trips a landmark word", () => {
    expect(fromMorse(toMorse("RIVER"))).toBe("RIVER")
  })

  it("decodes the level-3 message SOS B2 RIVER", () => {
    expect(fromMorse(toMorse("SOS B2 RIVER"))).toBe("SOS B2 RIVER")
  })

  it("has a code for every letter and digit", () => {
    expect(MORSE.A).toBe(".-")
    expect(MORSE["2"]).toBe("..---")
    expect(Object.keys(MORSE)).toHaveLength(36)
  })
})
