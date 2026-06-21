"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Mic, Send, Wind } from "lucide-react"
import type { Scenario } from "@/lib/game/types"
import { metersBetween, type LatLng } from "@/lib/game/liveScore"
import LiveMap, { type Place } from "@/components/game/LiveMap"
import ThreeWordsCard from "@/components/game/ThreeWordsCard"

// How close a square must be to the child to count as theirs.
const FOUND_METERS = 45

// Put the child at a random spot near the scene centre, so every round you have
// to actually find your own square.
function randomNearby(c: LatLng): LatLng {
  const ang = Math.random() * 2 * Math.PI
  const dist = 45 + Math.random() * 90 // 45–135 m from the centre
  const dLat = (dist * Math.cos(ang)) / 111320
  const dLng = (dist * Math.sin(ang)) / (111320 * Math.cos((c.lat * Math.PI) / 180))
  return { lat: c.lat + dLat, lng: c.lng + dLng }
}

async function recordClip(ms = 4000): Promise<Blob | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    return await new Promise((resolve) => {
      const mr = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        resolve(new Blob(chunks, { type: mr.mimeType || "audio/webm" }))
      }
      mr.start()
      setTimeout(() => mr.state !== "inactive" && mr.stop(), ms)
    })
  } catch {
    return null
  }
}

export default function Round({
  scenario,
  onComplete,
}: {
  scenario: Scenario
  onComplete: (clarity: number) => void
}) {
  const center = useMemo<LatLng>(
    () => ({ lat: scenario.location.lat, lng: scenario.location.lng }),
    [scenario],
  )
  const [you] = useState<LatLng>(() => randomNearby({ lat: scenario.location.lat, lng: scenario.location.lng }))

  const [step, setStep] = useState<"scene" | "breathe" | "find">("scene")
  const greeted = useRef(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [tapped, setTapped] = useState<LatLng | null>(null)
  const [words, setWords] = useState<[string, string, string] | null>(null)
  const [loadingWords, setLoadingWords] = useState(false)
  const [line, setLine] = useState("")
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [awaitingEnter, setAwaitingEnter] = useState(false)
  const [found, setFound] = useState(false)

  // After the breathing beat, move into the live call.
  useEffect(() => {
    if (step !== "breathe") return
    const t = setTimeout(() => setStep("find"), 6500)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    let alive = true
    fetch(`/api/places?scenario=${scenario.id}`)
      .then((r) => r.json())
      .then((d) => alive && Array.isArray(d.places) && setPlaces(d.places as Place[]))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [scenario])

  const say = useCallback(
    async (note: string, clarity: number) => {
      setBusy(true)
      try {
        const res = await fetch("/api/helper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: scenario.id, note, clarity }),
        })
        setLine((await res.json()).line)
      } catch {
        setLine("I'm right here with you. Tap the square you are standing on.")
      } finally {
        setBusy(false)
      }
    },
    [scenario],
  )

  // The helper picks up as soon as the call (find step) begins.
  useEffect(() => {
    if (step === "find" && !greeted.current) {
      greeted.current = true
      say("A scared child has just reached you in an emergency. Reassure them fast, then ask them to read you the three words for the exact square they are standing on so you can find them.", 0)
    }
  }, [step, say])

  // Tap a square → fetch THAT square's real three words.
  function handleMapClick(p: LatLng) {
    if (found || recording) return
    setTapped(p)
    setWords(null)
    setTranscript(null)
    setAwaitingEnter(false)
    setLoadingWords(true)
    fetch(`/api/threewords?lat=${p.lat}&lng=${p.lng}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d.words) && setWords(d.words as [string, string, string]))
      .catch(() => {})
      .finally(() => setLoadingWords(false))
  }

  // Check the words point to where the child is, and let Claude respond uniquely
  // to exactly what the child said.
  const verify = useCallback(
    async (w: [string, string, string], said: string) => {
      const heardLine = said ? `The child said out loud: "${said}".` : "The child read their three words."
      try {
        const res = await fetch(`/api/locate?words=${encodeURIComponent(w.join("."))}`)
        const d = await res.json()
        if (typeof d.lat === "number" && metersBetween({ lat: d.lat, lng: d.lng }, you) <= FOUND_METERS) {
          setFound(true)
          say(`${heardLine} Those are the correct three words for their exact location. React to what they said, confirm you have their spot, and tell them help is on the way right now and to stay exactly where they are.`, 100)
          setTimeout(() => onComplete(100), 1600)
          return
        }
      } catch {
        /* fall through to the hint */
      }
      say(`${heardLine} But those three words point to a different place than where they are. React to what they said, stay calm, and ask them to read the words for the square they are actually standing on.`, 25)
    },
    [you, say, onComplete],
  )

  // Step 1: record the child saying their three words (Deepgram transcribes).
  async function speakWords() {
    if (found || !words || recording) return
    setRecording(true)
    setTranscript(null)
    setAwaitingEnter(false)
    setLine("Listening… say your three words now.")
    const clip = await recordClip()
    setRecording(false)

    let heard = ""
    if (clip) {
      setBusy(true)
      try {
        const res = await fetch("/api/stt", { method: "POST", headers: { "Content-Type": clip.type || "audio/webm" }, body: clip })
        heard = (await res.json()).transcript ?? ""
      } catch {
        /* ignore */
      }
      setBusy(false)
    }
    setTranscript(heard)
    setAwaitingEnter(true) // the Enter button now appears
    setLine(heard ? "Got it. Press Enter to send your words to the helper." : "Press Enter to send your words to the helper.")
  }

  // Step 2: child presses Enter → Claude always responds, reacting to what they
  // said and checking whether the words point to where they are.
  function submit() {
    if (!words || !awaitingEnter) return
    setAwaitingEnter(false)
    verify(words, transcript ?? "")
  }

  return (
    <>
      <div className="mt-6 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-xl">🐻</span>
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 backdrop-blur">
          {step === "scene"
            ? scenario.intro
            : step === "breathe"
              ? "First, let's get calm. A clear voice gets help faster."
              : "Find the 🐻 on the map, tap the square it is standing on, then say those three words out loud."}
        </div>
      </div>

      {step === "scene" && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <p className="text-7xl">{scenario.sceneEmoji}</p>
          <h1 className="mt-4 text-2xl font-bold md:text-3xl">{scenario.title}</h1>
          <button
            onClick={() => setStep("breathe")}
            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
          >
            I&apos;m ready
          </button>
        </div>
      )}

      {step === "breathe" && (
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="relative grid h-44 w-44 place-items-center">
            <span className="breathe-circle absolute inset-0 rounded-full bg-emerald-400/15 ring-2 ring-emerald-300/40" />
            <Wind size={34} className="text-emerald-200" />
          </div>
          <p className="mt-8 text-lg font-semibold">Take a slow breath.</p>
          <p className="mt-1 text-sm text-white/60">Breathe in as the circle grows, out as it shrinks.</p>
          <button
            onClick={() => setStep("find")}
            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-400 px-7 py-3 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
          >
            I&apos;m calm, call for help
          </button>
        </div>
      )}

      {step === "find" && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <LiveMap
              center={center}
              zoom={scenario.location.zoom}
              places={places}
              you={you}
              tapped={tapped}
              pin={found ? you : null}
              onMapClick={handleMapClick}
            />
            <p className="mt-2 text-center text-xs text-white/45">
              Drag and zoom the map. Find the 🐻, then tap the square it is standing on.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-lg ${
                  found ? "" : "call-live"
                }`}
              >
                {scenario.helperRole === "dispatcher" ? "📞" : scenario.helperRole === "ranger" ? "🧑‍🌾" : "🦺"}
              </span>
              <div className="min-h-[44px] flex-1 rounded-2xl rounded-tl-sm border border-emerald-300/20 bg-emerald-300/5 px-4 py-3 text-sm text-white/85">
                {!found && (
                  <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 call-live" /> on the line
                  </span>
                )}
                {busy ? (
                  <span className="inline-flex items-center gap-2 text-white/50">
                    <Loader2 size={14} className="animate-spin" /> thinking…
                  </span>
                ) : (
                  line || `Hi there! Find the 🐻 on the map and tap its square to see your three words.`
                )}
              </div>
            </div>

            {loadingWords ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50">
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> finding this square&apos;s words…
                </span>
              </div>
            ) : words ? (
              <ThreeWordsCard words={words} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-center text-sm text-white/55">
                Tap a square on the map to see its three words.
              </div>
            )}

            {/* Step 1: record */}
            {words && !found && !awaitingEnter && (
              <button
                onClick={speakWords}
                disabled={recording || busy}
                className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold transition active:scale-95 disabled:cursor-not-allowed ${
                  recording ? "bg-red-400 text-[#1a0606]" : "bg-amber-400 text-[#1a1206] hover:bg-amber-300"
                }`}
              >
                <Mic size={18} /> {recording ? "Listening…" : "Say your three words"}
              </button>
            )}

            {/* Step 2: review what was heard, then Enter */}
            {words && !found && awaitingEnter && (
              <div className="space-y-2">
                {transcript ? (
                  <p className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/70">
                    You said: <span className="font-semibold text-white">&ldquo;{transcript}&rdquo;</span>
                  </p>
                ) : (
                  <p className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50">
                    No words heard. You can press Enter to send anyway, or say them again.
                  </p>
                )}
                <button
                  onClick={submit}
                  disabled={busy}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={17} /> Enter
                </button>
                <button
                  onClick={speakWords}
                  disabled={recording || busy}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
                >
                  <Mic size={12} /> Say it again
                </button>
              </div>
            )}

            {found && (
              <div className="rounded-xl bg-emerald-400/10 px-4 py-3 text-center text-sm font-medium text-emerald-200">
                Found you! Help is on the way…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
