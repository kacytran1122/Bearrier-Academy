"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Radio } from "lucide-react"

// The rounds, played in order. (No menus to choose from — just the flow.)
const rounds = [
  { icon: MapPin, title: "Find Your Square", tag: "Three words" },
  { icon: Radio, title: "Morse Map Rescue", tag: "Flash a signal" },
] as const

export default function PlayPage() {
  return (
    <div className="scene-backdrop relative min-h-screen w-full overflow-hidden text-white">
      <div className="aurora" />
      <div className="fireflies" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 md:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
          <ArrowLeft size={16} /> Back home
        </Link>

        <div className="mt-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/20 text-xl">🐻</span>
          <div>
            <p className="text-sm text-white/60">Ranger Bear says</p>
            <h1 className="text-2xl font-bold md:text-3xl">We&apos;ll play three rounds together</h1>
          </div>
        </div>

        <p className="mt-4 max-w-xl text-white/70">
          In each round you find the square you are standing on and read its three words. Every square has its own
          words, and reading the right one brings help. Let&apos;s go in order.
        </p>

        {/* Rounds preview (just so you know what's coming) */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {rounds.map(({ icon: Icon, title, tag }, i) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Icon size={22} />
                </div>
                <span className="text-sm font-semibold text-white/30">Round {i + 1}</span>
              </div>
              <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
              <p className="text-xs uppercase tracking-wide text-white/40">{tag}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/play/campaign"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-base font-semibold text-[#1a1206] transition hover:bg-amber-300 active:scale-95"
          >
            Start Round 1
          </Link>
        </div>
      </div>
    </div>
  )
}
