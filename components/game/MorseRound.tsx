"use client"

import { useEffect, useState } from "react"
import { Loader2, Radio } from "lucide-react"
import { MORSE, toMorse } from "@/lib/game/morse"
import { GRID_CELLS, cellCenter, cellOf, gridImageSrc } from "@/lib/game/grid"
import GridMap from "@/components/game/GridMap"

// Round 2 — Morse Map Rescue, backed by the LIVE grid: each cell is a real
// place on the map, landmarks come from Google Places, and the found cell's
// real three-word address is shown. Falls back to a canned puzzle with no keys.
type PlaceC = { name: string; cell: string }

// A short virtual walkthrough shown before Round 2 begins.
const MORSE_GUIDE = [
  { emoji: "🔦", title: "Read the signal", text: "The flashlight blinks in Morse code. Short blinks are dots, long blinks are dashes." },
  { emoji: "🔡", title: "Decode to a square", text: "Every letter and number has a code. Use the Morse key to turn the signal into a grid square, like B2." },
  { emoji: "🗺️", title: "Tap it on the map", text: "Tap that square on the satellite map to point the rescue team to your zone." },
  { emoji: "📍", title: "Landmark, then message", text: "Name the landmark in your zone, then send one short message so they find you fast." },
] as const

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

export default function MorseRound({ onComplete }: { onComplete: (clarity: number) => void }) {
  const [step, setStep] = useState<"scene" | "guide" | "zone" | "landmark" | "message">("scene")
  const [walk, setWalk] = useState(0)
  const [target, setTarget] = useState("B2")
  const [landmark, setLandmark] = useState("River")
  const [landmarkOpts, setLandmarkOpts] = useState<string[]>(["River", "Bridge", "Parking lot", "Forest trail"])
  const [words, setWords] = useState<[string, string, string] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [solved, setSolved] = useState<string | null>(null)
  const [hint, setHint] = useState("")
  const [showKey, setShowKey] = useState(false)

  // Load real cells + landmarks once.
  useEffect(() => {
    let alive = true
    fetch(`/api/places?lat=${cellCenter("B2").lat}&lng=${cellCenter("B2").lng}&radius=600`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !Array.isArray(d.places) || d.places.length === 0) return
        const placed: PlaceC[] = d.places
          .map((p: { name: string; lat: number; lng: number }) => ({ name: p.name, cell: cellOf(p.lat, p.lng) }))
          .filter((p: { cell: string | null }) => p.cell)
        if (placed.length === 0) return
        const cellsWithPlaces = GRID_CELLS.filter((c) => placed.some((p) => p.cell === c))
        const tcell = cellsWithPlaces[Math.floor(Math.random() * cellsWithPlaces.length)]
        const inCell = placed.filter((p) => p.cell === tcell).map((p) => p.name)
        const others = [...new Set(placed.filter((p) => p.cell !== tcell).map((p) => p.name))]
        setTarget(tcell)
        setLandmark(inCell[0])
        setLandmarkOpts(shuffle([inCell[0], ...shuffle(others).slice(0, 3)]))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  function pickCell(cell: string) {
    setSelected(cell)
    if (cell === target) {
      setSolved(target)
      setHint(`Correct! Zooming into zone ${target}.`)
      const c = cellCenter(target)
      fetch(`/api/threewords?lat=${c.lat}&lng=${c.lng}`)
        .then((r) => r.json())
        .then((d) => Array.isArray(d.words) && setWords(d.words as [string, string, string]))
        .catch(() => {})
      setTimeout(() => setStep("landmark"), 1200)
    } else {
      setHint("Not quite. Decode the dots and dashes with the Morse key, then try again.")
    }
  }

  function pickLandmark(value: string) {
    if (value === landmark) {
      setHint(`Yes! The satellite can spot ${landmark} in zone ${target}.`)
      setTimeout(() => setStep("message"), 1200)
    } else {
      setHint("That one is in a different zone. Pick the landmark in your zone.")
    }
  }

  const correctMsg = `SOS ${target} ${landmark.toUpperCase()}`
  const messageOpts = [
    "I got lost and walked around for a while near some buildings.",
    correctMsg,
    "I was with my class but I stopped to look at something.",
  ]

  function pickMessage(m: string) {
    if (m === correctMsg) {
      setHint("Perfect. Short but complete: who needs help, the zone, and the landmark.")
      setTimeout(() => onComplete(100), 1600)
    } else {
      setHint("That message is long and leaves out the important facts. Pick the short, clear one.")
    }
  }

  const bear =
    step === "scene"
      ? "The satellite can see the land, but it does not know where to look. Send a short Morse message so the rescue team can find the right area."
      : step === "guide"
        ? "Here is how the rescue works. Take a quick look, then we begin."
        : step === "zone"
          ? "Flash the search zone. Decode the Morse into a grid square, then tap it on the map."
          : step === "landmark"
            ? `Good. Now tell them the landmark in zone ${target} so they know exactly where to look.`
            : "Your flashlight battery is almost dead. Choose the one best message to send."

  return (
    <>
      <div className="mt-6 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-xl">🐻</span>
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 backdrop-blur">
          {bear}
        </div>
      </div>

      {step === "scene" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <p className="text-7xl">🔦</p>
          <h1 className="mt-4 text-2xl font-bold md:text-3xl">Morse Map Rescue</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">
            A storm knocked out the cell towers. You can&apos;t call, but you can flash Morse code with your flashlight.
            The rescue satellite is watching. Send a short signal to point them to the right place.
          </p>
          <button
            onClick={() => setStep("guide")}
            className="mt-7 cursor-pointer rounded-full bg-amber-400 px-7 py-3.5 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
          >
            Start the rescue
          </button>
        </div>
      )}

      {step === "guide" && (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            How to play · {walk + 1} of {MORSE_GUIDE.length}
          </p>
          <p className="mb-3 text-6xl">{MORSE_GUIDE[walk].emoji}</p>
          <h2 className="text-xl font-bold">{MORSE_GUIDE[walk].title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">{MORSE_GUIDE[walk].text}</p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {MORSE_GUIDE.map((_, i) => (
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
            <button
              onClick={() => (walk < MORSE_GUIDE.length - 1 ? setWalk((w) => w + 1) : setStep("zone"))}
              className="flex-1 cursor-pointer rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
            >
              {walk < MORSE_GUIDE.length - 1 ? "Next" : "Start flashing"}
            </button>
          </div>
        </div>
      )}

      {(step === "zone" || step === "landmark" || step === "message") && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <GridMap
            src={gridImageSrc()}
            onCellClick={step === "zone" ? pickCell : undefined}
            selected={selected}
            correct={solved}
            personCell={solved ?? undefined}
            personEmoji="🔦"
            showLabels
            disabled={step !== "zone"}
          />

          <div className="space-y-4">
            {step === "zone" && (
              <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/5 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  <Radio size={13} /> Flashlight signal (the search zone)
                </p>
                <p className="font-mono text-2xl tracking-widest text-white">{toMorse(target)}</p>
                <button onClick={() => setShowKey((s) => !s)} className="mt-3 cursor-pointer text-xs text-emerald-300/80 underline">
                  {showKey ? "Hide" : "Show"} the Morse key
                </button>
                {showKey && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-white/55 sm:grid-cols-3">
                    {Object.entries(MORSE).map(([ch, code]) => (
                      <span key={ch}>
                        <span className="text-white/80">{ch}</span> {code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "zone" && (
              <p className="text-sm text-white/60">Decode the signal into a grid square, then tap that square on the map.</p>
            )}

            {step === "landmark" && (
              <div className="space-y-2">
                {words && (
                  <p className="rounded-xl bg-emerald-300/10 px-4 py-2 text-xs text-emerald-200">
                    Zone {target} address: <span className="font-mono font-semibold">{words.join(".")}</span>
                  </p>
                )}
                <p className="text-sm text-white/60">Which landmark is really in zone {target}?</p>
                {landmarkOpts.map((v) => (
                  <button
                    key={v}
                    onClick={() => pickLandmark(v)}
                    className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white/80 transition hover:border-amber-300/40"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {step === "message" && (
              <div className="space-y-2">
                <p className="text-sm text-white/60">One message left. Pick the best one to send:</p>
                {messageOpts.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => pickMessage(m)}
                    className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition hover:border-amber-300/40"
                  >
                    {m === correctMsg ? <span className="font-mono">{m}</span> : m}
                  </button>
                ))}
              </div>
            )}

            {hint && (
              <div className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/75">
                {hint.startsWith("Correct") || hint.startsWith("Yes") || hint.startsWith("Perfect") ? (
                  <span className="inline-flex items-center gap-2 text-emerald-200">
                    <Loader2 size={13} className="animate-spin" /> {hint}
                  </span>
                ) : (
                  hint
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
