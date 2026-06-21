"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Mic, RotateCcw, ShieldCheck } from "lucide-react"
import { SCENARIOS } from "@/lib/game/scenarios"
import type { AgeLevel, ScenarioId } from "@/lib/game/types"
import { saveBadge } from "@/lib/progress"
import Round from "@/components/game/Round"
import MorseRound from "@/components/game/MorseRound"
import BadgeReward from "@/components/game/BadgeReward"

// The how-to-play slides shown after voice safety is accepted.
const GUIDE = [
  { emoji: "🗺️", title: "Look around the map", text: "Drag and pinch the satellite map to look around, just like a real map." },
  { emoji: "🐻", title: "Find the bear", text: "The 🐻 shows where you are. Find it on the map." },
  { emoji: "🎤", title: "Say or signal", text: "Each round, send a clear signal: your three words, or a short Morse code." },
  { emoji: "🛰️", title: "The satellite watches", text: "A rescue satellite scans from above. Your signal tells it where to look." },
  { emoji: "🛡️", title: "Help finds you", text: "Clear signals bring help and earn you a Safety Badge." },
] as const

// The rounds, played in order: what3words, then Morse.
type RoundDef =
  | { type: "words"; scenarioId: ScenarioId; title: string }
  | { type: "morse"; title: string }

const ROUNDS: RoundDef[] = [
  { type: "words", scenarioId: "trail", title: "Find Your Square" },
  { type: "morse", title: "Morse Map Rescue" },
]

// Plays the three scenarios in order as Round 1 → 2 → 3, then a final summary.
export default function CampaignPage() {
  return (
    <Suspense fallback={<div className="scene-backdrop min-h-screen" />}>
      <Campaign />
    </Suspense>
  )
}

function Campaign() {
  const router = useRouter()
  const search = useSearchParams()
  const age = (search.get("age") as AgeLevel) || "cub"

  const [round, setRound] = useState(0) // 0-based index into SCENARIO_IDS
  const [phase, setPhase] = useState<"consent" | "walkthrough" | "playing" | "cleared" | "done">("consent")
  const [scores, setScores] = useState<number[]>([])
  const [walk, setWalk] = useState(0)

  const total = ROUNDS.length
  const current = ROUNDS[round]
  const isLast = round === total - 1

  // Ask for microphone permission, then move on to the walkthrough either way
  // (the game still works without a mic, using the Enter button).
  async function allowVoice() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch {
      /* denied or unavailable — the no-mic flow still works */
    }
    setPhase("walkthrough")
  }

  function completeRound(clarity: number) {
    if (current.type === "words") {
      saveBadge({ scenarioId: current.scenarioId, age, clarity, earnedAt: new Date().toISOString() })
    }
    setScores((s) => [...s, clarity])
    setPhase("cleared")
  }

  function nextRound() {
    if (isLast) {
      setPhase("done")
    } else {
      setRound((r) => r + 1)
      setPhase("playing")
    }
  }

  function restart() {
    setRound(0)
    setScores([])
    setPhase("playing")
  }

  const totalStars = scores.reduce((sum, c) => sum + (c >= 90 ? 3 : c >= 60 ? 2 : 1), 0)

  return (
    <div className="scene-backdrop relative min-h-screen w-full overflow-hidden text-white">
      <div className="aurora" />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8 md:px-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <Link href="/play" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
            <ArrowLeft size={16} /> Leave
          </Link>
          <div className="text-xs text-white/50">
            {phase === "playing" || phase === "cleared" ? <>Round {round + 1} of {total}</> : phase === "done" ? "All rounds done" : "Getting ready"}
          </div>
        </div>

        {/* ── VOICE SAFETY ─────────────────────────────────────────── */}
        {phase === "consent" && (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <p className="mb-4 text-5xl">🎤</p>
            <h1 className="text-xl font-bold">Can we use the microphone?</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">
              In this game you say your three words out loud. We turn your voice into words one time to find you, and we
              do not save it. Please ask a grown-up before you say yes.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200">
              <ShieldCheck size={14} /> Your voice stays private and is never stored.
            </div>
            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={allowVoice}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 py-3 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
              >
                <Mic size={16} /> Yes, use my voice
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full cursor-pointer rounded-full border border-white/25 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* ── WALKTHROUGH ──────────────────────────────────────────── */}
        {phase === "walkthrough" && (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              How to play · {walk + 1} of {GUIDE.length}
            </p>
            <p className="mb-3 text-6xl">{GUIDE[walk].emoji}</p>
            <h1 className="text-xl font-bold">{GUIDE[walk].title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">{GUIDE[walk].text}</p>

            <div className="mt-6 flex items-center justify-center gap-1.5">
              {GUIDE.map((_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full ${i <= walk ? "bg-amber-400" : "bg-white/15"}`} />
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                onClick={() => setWalk((w) => Math.max(0, w - 1))}
                disabled={walk === 0}
                className="cursor-pointer rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Back
              </button>
              {walk < GUIDE.length - 1 ? (
                <button
                  onClick={() => setWalk((w) => w + 1)}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setPhase("playing")}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
                >
                  <Check size={16} /> Start Round 1
                </button>
              )}
            </div>
          </div>
        )}

        {/* round progress dots */}
        {(phase === "playing" || phase === "cleared") && (
          <div className="mt-5 flex gap-2">
            {ROUNDS.map((r, i) => (
              <div
                key={r.title}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i < round ? "bg-emerald-400" : i === round ? "bg-amber-400" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && (
          <>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-300">
              Round {round + 1}: {current.title}
            </p>
            {/* key remounts each round fresh */}
            {current.type === "words" && (
              <Round key={current.scenarioId} scenario={SCENARIOS[current.scenarioId]} onComplete={completeRound} />
            )}
            {current.type === "morse" && <MorseRound key="morse" onComplete={completeRound} />}
          </>
        )}

        {/* ROUND CLEARED */}
        {phase === "cleared" && (
          <div className="mt-8">
            <BadgeReward
              scenarioTitle={current.title}
              clarity={scores[scores.length - 1] ?? 0}
              headline={isLast ? "Last round cleared!" : `Round ${round + 1} cleared!`}
            >
              <button
                onClick={nextRound}
                className="inline-flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 py-3 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
              >
                {isLast ? "See your results" : `Start Round ${round + 2}`}
              </button>
            </BadgeReward>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-8 text-center">
            <p className="mb-3 text-6xl">🏅</p>
            <h1 className="text-2xl font-bold md:text-3xl">You finished all {total} rounds!</h1>
            <p className="mt-2 text-white/70">You know how to stay calm and say exactly where you are. Great job!</p>
            <p className="mt-5 text-3xl">{"⭐".repeat(totalStars)}</p>
            <p className="mt-1 text-sm text-white/50">{totalStars} stars out of {total * 3}</p>

            <div className="mt-6 grid gap-2 text-left text-sm">
              {ROUNDS.map((r, i) => {
                const c = scores[i] ?? 0
                const stars = c >= 90 ? 3 : c >= 60 ? 2 : 1
                return (
                  <div key={r.title} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
                    <span>Round {i + 1}: {r.title}</span>
                    <span className="text-amber-300">{"⭐".repeat(stars)}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                onClick={restart}
                className="inline-flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 py-3 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
              >
                <RotateCcw size={16} /> Play all rounds again
              </button>
              <Link
                href="/"
                className="w-full max-w-xs rounded-full border border-white/25 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Back home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
