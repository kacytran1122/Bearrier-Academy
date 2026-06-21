"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getScenario } from "@/lib/game/scenarios"
import type { AgeLevel } from "@/lib/game/types"
import { saveBadge } from "@/lib/progress"
import Round from "@/components/game/Round"
import BadgeReward from "@/components/game/BadgeReward"

// Single-scenario play (direct link). The main game is the campaign at
// /play/campaign, which plays all three rounds in a row.
export default function ScenarioPage() {
  const params = useParams<{ scenario: string }>()
  const search = useSearchParams()
  const age = (search.get("age") as AgeLevel) || "cub"
  const scenario = getScenario(params.scenario)

  const [done, setDone] = useState<number | null>(null)
  const [runKey, setRunKey] = useState(0)

  if (!scenario) {
    return (
      <div className="scene-backdrop grid min-h-screen place-items-center text-white">
        <div className="text-center">
          <p className="text-lg">That adventure isn&apos;t here.</p>
          <Link href="/play" className="mt-4 inline-block rounded-full bg-amber-400 px-6 py-2.5 font-semibold text-[#1a1206]">
            Pick an adventure
          </Link>
        </div>
      </div>
    )
  }

  function complete(clarity: number) {
    saveBadge({ scenarioId: scenario!.id, age, clarity, earnedAt: new Date().toISOString() })
    setDone(clarity)
  }

  function replay() {
    setDone(null)
    setRunKey((k) => k + 1)
  }

  return (
    <div className="scene-backdrop relative min-h-screen w-full overflow-hidden text-white">
      <div className="aurora" />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8 md:px-10">
        <div className="flex items-center justify-between">
          <Link href="/play" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
            <ArrowLeft size={16} /> Leave
          </Link>
          <div className="text-xs text-white/50">
            <span className="capitalize">{age} level</span> · {scenario.sceneEmoji} {scenario.title}
          </div>
        </div>

        {done === null ? (
          <Round key={runKey} scenario={scenario} onComplete={complete} />
        ) : (
          <div className="mt-8">
            <BadgeReward scenarioTitle={scenario.title} clarity={done}>
              <button
                onClick={replay}
                className="w-full max-w-xs cursor-pointer rounded-full bg-amber-400 py-3 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
              >
                Play again
              </button>
              <Link
                href="/play"
                className="w-full max-w-xs rounded-full border border-white/25 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Back to rounds
              </Link>
            </BadgeReward>
          </div>
        )}
      </div>
    </div>
  )
}
