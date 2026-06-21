import { describe, it, expect } from "vitest"
import { metersBetween, scoreLive } from "@/lib/game/liveScore"

const you = { lat: 40.7466, lng: -73.8446 }

describe("metersBetween", () => {
  it("is ~0 for the same point", () => {
    expect(metersBetween(you, you)).toBeLessThan(1)
  })

  it("is roughly right for a known offset (~111m per 0.001 lat)", () => {
    const d = metersBetween(you, { lat: you.lat + 0.001, lng: you.lng })
    expect(d).toBeGreaterThan(100)
    expect(d).toBeLessThan(120)
  })
})

describe("scoreLive", () => {
  it("reading the three words pins exactly (100)", () => {
    const r = scoreLive(you, [], true)
    expect(r.clarity).toBe(100)
    expect(r.pin).toEqual(you)
  })

  it("no places named means the helper is lost (0)", () => {
    const r = scoreLive(you, [], false)
    expect(r.clarity).toBe(0)
    expect(r.pin).toBeNull()
  })

  it("a place right next to you gives high confidence", () => {
    const near = { lat: you.lat + 0.0001, lng: you.lng } // ~11m
    expect(scoreLive(you, [near], false).clarity).toBeGreaterThan(50)
  })

  it("a far-away place gives low confidence", () => {
    const far = { lat: you.lat + 0.01, lng: you.lng } // ~1.1km
    expect(scoreLive(you, [far], false).clarity).toBeLessThan(50)
  })
})
