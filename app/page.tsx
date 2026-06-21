"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  MapPin,
  Radio,
  Hand,
  Sparkles,
  ShieldCheck,
  Volume2,
  Users,
} from "lucide-react"

const tabs = ["home", "scenarios", "skills", "grown-ups"] as const

// Kid-safety lessons that rotate in the hero, both lines animated.
const headlines = [
  { top: "Know where you are.", bottom: "Get help fast." },
  { top: "Stay calm.", bottom: "Speak clearly." },
  { top: "Find a safe grown-up.", bottom: "Tell them your spot." },
  { top: "Say your three words.", bottom: "Help is on the way." },
] as const

const scenarios = [
  {
    icon: MapPin,
    title: "Round 1 · Find Your Square",
    desc: "Look at a real map from the sky and find your spot. Tap your square to get its three words, then say them out loud so help can find you.",
  },
  {
    icon: Radio,
    title: "Round 2 · Morse Map Rescue",
    desc: "The phones are down. Flash a short code with a flashlight to show the rescue satellite which part of the map you are in.",
  },
]

const skills = [
  { icon: Sparkles, title: "Your three words", desc: "Every little spot on the map has three special words. Read yours to say where you are." },
  { icon: MapPin, title: "Look from the sky", desc: "See your spot from above, the way a rescuer would, and find what is near you." },
  { icon: Volume2, title: "Stay calm and speak clearly", desc: "A slow, clear voice gets help faster than a fast, scared one." },
  { icon: Users, title: "Find a safe helper", desc: "Look for police, a worker in a uniform, or a parent with kids." },
  { icon: Radio, title: "Keep your message short", desc: "Tell them who needs help, where you are, and what is near you. That is all they need." },
  { icon: Hand, title: "Ask for help without talking", desc: "When you cannot talk, a code like Morse can still call for help." },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("home")
  const [hero, setHero] = useState(0)
  const [intro, setIntro] = useState(true)

  // Cycle the hero lessons.
  useEffect(() => {
    const t = setInterval(() => setHero((i) => (i + 1) % headlines.length), 3800)
    return () => clearInterval(t)
  }, [])

  // Brief satellite zoom-in intro, then reveal the page.
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2600)
    return () => clearTimeout(t)
  }, [])

  const homeRef = useRef<HTMLDivElement>(null)
  const scenariosRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const grownupsRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const refMap = {
    home: homeRef,
    scenarios: scenariosRef,
    skills: skillsRef,
    "grown-ups": grownupsRef,
  } as const

  const syncActiveTab = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const sections = [
      { id: "home", ref: homeRef },
      { id: "scenarios", ref: scenariosRef },
      { id: "skills", ref: skillsRef },
      { id: "grown-ups", ref: grownupsRef },
    ] as const
    const rect = scroller.getBoundingClientRect()
    const center = rect.top + rect.height / 2
    let best: { id: (typeof tabs)[number]; d: number } | null = null
    for (const s of sections) {
      const el = s.ref.current
      if (!el) continue
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - center)
      if (!best || d < best.d) best = { id: s.id, d }
    }
    if (best) setActiveTab(best.id)
  }, [])

  useEffect(() => {
    syncActiveTab()
  }, [syncActiveTab])

  return (
    <div className="scene-backdrop relative h-screen w-screen overflow-hidden text-white">
      {/* Video background (falls back to the CSS scene behind it if missing) */}
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src="/bear.mp4" type="video/mp4" />
      </video>

      {/* Intro: satellite zooms in, then fades to reveal the page */}
      {intro && (
        <div className="intro-overlay fixed inset-0 z-50 overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/staticmap?scenario=trail" alt="" className="intro-img h-full w-full object-cover" />
          <div className="absolute inset-0 grid place-items-center bg-black/45">
            <div className="text-center">
              <p className="text-4xl">🐻🛰️</p>
              <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                B<span className="text-amber-300">(e)</span>arrier Academy
              </p>
              <p className="mt-1 text-sm text-white/60">Building Tools for a Borderless World</p>
            </div>
          </div>
        </div>
      )}

      <div className="aurora" />
      <div className="fireflies" />
      <div className="absolute inset-0 bg-black/35" />

      {/* Nav */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/20 text-lg">🐻</span>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            B<span className="text-amber-300">(e)</span>arrier Academy
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden gap-8 text-sm md:flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  refMap[tab].current?.scrollIntoView({ behavior: "smooth" })
                }}
                className={`cursor-pointer border-b-2 pb-1 capitalize transition ${
                  activeTab === tab
                    ? "border-amber-400 text-amber-200"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Snap scroller */}
      <div
        ref={scrollerRef}
        onScroll={syncActiveTab}
        className="no-scrollbar relative z-10 h-full snap-y snap-mandatory overflow-y-scroll"
      >
        {/* Home */}
        <section ref={homeRef} className="flex h-screen snap-start items-center px-6 md:px-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1.5 text-xs font-medium text-amber-200">
              <ShieldCheck size={14} /> A safety game for kids ages 6 to 12
            </div>
            <h1 className="mb-6 min-h-[2.4em] text-4xl font-bold leading-tight md:min-h-[2.2em] md:text-6xl lg:text-7xl">
              <span key={`a-${hero}`} className="hero-rise block">
                {headlines[hero].top}
              </span>
              <span key={`b-${hero}`} className="hero-rise-2 block text-amber-300">
                {headlines[hero].bottom}
              </span>
            </h1>
            <p className="mb-8 max-w-xl text-base text-white/75 md:text-lg">
              Ranger Bear teaches kids the most important thing in an emergency: how to say{" "}
              <span className="font-semibold text-white">exactly where you are</span>. You find your spot on a real map,
              then send a clear signal so help can come fast.
            </p>
            <div className="flex flex-col items-start gap-3">
              <Link
                href="/play/campaign"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-base font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
              >
                <Sparkles size={18} /> Start the Bearventure
              </Link>
              <p className="pl-1 text-xs text-white/40">Two rounds. Find your spot on a real map and bring help.</p>
            </div>
          </div>
        </section>

        {/* Scenarios */}
        <section ref={scenariosRef} className="flex min-h-screen snap-start items-center px-6 py-24 md:px-16">
          <div className="w-full max-w-6xl">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">Two rescue rounds</h1>
            <p className="mb-14 max-w-2xl text-white/70">
              You play both, one after the other, on a real map from the sky. Each round shows a different way to tell
              rescuers where you are.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {scenarios.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                      <Icon size={22} />
                    </div>
                    <span className="text-sm font-semibold text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="mb-2 text-xl font-semibold">{title}</h2>
                  <p className="text-sm leading-6 text-white/65">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section ref={skillsRef} className="flex min-h-screen snap-start items-center px-6 py-24 md:px-16">
          <div className="w-full max-w-6xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-300">What kids learn</p>
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">Skills, in plain words</h1>
            <p className="mb-14 max-w-2xl text-white/70">
              The game teaches real safety skills with simple names, so kids and grown-ups can talk about them after they
              play.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl bg-white/[0.06] p-6 backdrop-blur">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300">
                    <Icon size={18} />
                  </div>
                  <h2 className="mb-1.5 text-base font-semibold">{title}</h2>
                  <p className="text-sm leading-6 text-white/65">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grown-ups / About */}
        <section ref={grownupsRef} className="flex min-h-screen snap-start items-center px-6 py-24 md:px-16">
          <div className="grid w-full max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-300">For parents and teachers</p>
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">We kept it safe for kids</h1>
              <p className="max-w-xl text-base leading-7 text-white/75 md:text-lg">
                The art is friendly and never turns scary. Big buttons and voice mean no typing. And kids always practice
                with pretend addresses and sample places, never their own home.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute bottom-2 left-3 top-2 w-px bg-white/20" />
              {[
                ["It stays on their device", "Progress saves right on the device. There are no child accounts, and nothing about your child leaves the browser."],
                ["Their voice stays private", "When a child speaks, the sound becomes text once and isn't saved. The mic only turns on when a grown-up says it's okay."],
                ["It works in any country", "The emergency number changes to match where you live: 911, 999, 112, 000, or 111."],
              ].map(([title, desc]) => (
                <div key={title} className="relative pb-9 last:pb-0">
                  <div className="absolute -left-10 top-1 h-6 w-6 rounded-full border border-amber-300/70 bg-black shadow-[0_0_22px_rgba(245,177,75,0.35)]" />
                  <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
                  <p className="max-w-2xl text-sm leading-6 text-white/65 md:text-base">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
