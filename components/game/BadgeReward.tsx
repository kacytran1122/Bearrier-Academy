"use client"

import type { ReactNode } from "react"

// The calm celebration when help arrives. The parent supplies the buttons
// (e.g. "Next round" in the campaign, or "Play again" in single play).
export default function BadgeReward({
  scenarioTitle,
  clarity,
  headline = "You earned a Safety Badge!",
  children,
}: {
  scenarioTitle: string
  clarity: number
  headline?: string
  children?: ReactNode
}) {
  const stars = clarity >= 90 ? 3 : clarity >= 60 ? 2 : 1
  return (
    <div className="rounded-2xl border border-amber-300/30 bg-amber-300/5 p-8 text-center">
      <p className="mb-3 text-6xl">🛡️</p>
      <h2 className="text-2xl font-bold">{headline}</h2>
      <p className="mt-2 text-white/70">
        You finished <span className="font-semibold text-white">{scenarioTitle}</span>. Help found you because your
        clues were so clear.
      </p>
      <p className="mt-4 text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
      <p className="mt-1 text-sm text-white/50">Clue clarity: {clarity}%</p>
      <div className="mt-7 flex flex-col items-center gap-3">{children}</div>
    </div>
  )
}
