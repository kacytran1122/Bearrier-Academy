import type { Clue, Scenario } from "./types"

export interface PinResult {
  /** Where the helper's pin lands on the 0–100 map grid. */
  pin: { x: number; y: number }
  /** 0–100 — how clearly the clues point at the real spot. */
  clarity: number
  /** Pixel-ish distance from the real spot (0 = bullseye). */
  drift: number
}

/**
 * The clue engine. Each clue pulls the helper's pin toward the real spot in
 * proportion to its strength; the leftover uncertainty becomes drift in a
 * deterministic direction (so the same clues always land the same way — no
 * randomness, which keeps the lesson fair and replayable).
 *
 * - Two clear, backed-up clues drop the pin on the right roof.
 * - One fuzzy clue leaves it drifting in the wrong yard.
 * - Reading the three words pins it exactly.
 */
export function scoreClues(
  scenario: Scenario,
  selectedClueIds: string[],
  opts: { saidThreeWords?: boolean; saidTwice?: boolean } = {},
): PinResult {
  const selected: Clue[] = scenario.clues.filter((c) => selectedClueIds.includes(c.id))

  // Reading the three words is a pinpoint — it overrides everything.
  if (opts.saidThreeWords) {
    return { pin: { ...scenario.target }, clarity: 100, drift: 0 }
  }

  if (selected.length === 0) {
    // No clues: the helper has nothing to go on — pin sits at map center, lost.
    return { pin: { x: 50, y: 50 }, clarity: 0, drift: distance({ x: 50, y: 50 }, scenario.target) }
  }

  // Combined confidence: backup clues compound, but with diminishing returns so
  // one perfect clue still beats three vague ones only modestly.
  const best = Math.max(...selected.map((c) => c.strength))
  const backupBoost = selected.length > 1 ? 0.12 * (selected.length - 1) : 0
  const sayTwiceBoost = opts.saidTwice ? 0.08 : 0
  const confidence = clamp(best + backupBoost + sayTwiceBoost, 0, 1)

  // The pin lerps from a drifted guess toward the true spot by `confidence`.
  // Drift direction is fixed per scenario (down-right) so weak clues read as a
  // consistent "wrong yard," not random noise.
  const driftMax = 28
  const offset = driftMax * (1 - confidence)
  const pin = {
    x: clamp(scenario.target.x + offset * 0.8, 0, 100),
    y: clamp(scenario.target.y + offset, 0, 100),
  }

  return {
    pin,
    clarity: Math.round(confidence * 100),
    drift: distance(pin, scenario.target),
  }
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y))
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}
