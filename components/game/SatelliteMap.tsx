"use client"

import { useState } from "react"
import type { Landmark } from "@/lib/game/types"
import LazyImage from "@/components/LazyImage"

// A self-contained "bird's-eye" map. In production this is the Google Maps
// satellite/hybrid view (@vis.gl/react-google-maps); here it's a styled grid so
// the game runs with no Maps key. Landmarks and the helper's pin sit on the
// same 0–100 coordinate space the clue engine uses.
export default function SatelliteMap({
  landmarks,
  pin,
  target,
  onLandmarkTap,
  highlightLandmarkId,
  scenarioId,
  realPlaces,
}: {
  landmarks: Landmark[]
  pin?: { x: number; y: number } | null
  target?: { x: number; y: number } | null
  onLandmarkTap?: (id: string) => void
  highlightLandmarkId?: string | null
  /** When set, loads the real Google satellite image for this scenario. */
  scenarioId?: string
  /** Real nearby places (from the Places API), already projected to x/y %. */
  realPlaces?: { name: string; x: number; y: number }[]
}) {
  const [imgOk, setImgOk] = useState(true)
  const [picked, setPicked] = useState<string | null>(null)
  const showSatellite = Boolean(scenarioId) && imgOk

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1a14]">
      {/* faux terrain wash (shown when there's no real satellite image) */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 30%, rgba(52,211,153,0.18), transparent 60%)," +
            "radial-gradient(50% 50% at 75% 70%, rgba(245,177,75,0.14), transparent 60%)," +
            "linear-gradient(160deg,#10271d,#0a1813)",
        }}
      />

      {/* real Google satellite image — lazily loaded; covers the wash when it loads */}
      {scenarioId && imgOk && (
        <LazyImage
          src={`/api/staticmap?scenario=${scenarioId}`}
          alt="Satellite view of a sample place"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgOk(false)}
        />
      )}
      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "12.5% 12.5%",
        }}
      />

      {/* the real spot, shown faintly so kids can compare where the pin lands */}
      {target && (
        <div
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/40"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
          aria-hidden
        />
      )}

      {/* landmarks */}
      {landmarks.map((lm) => {
        const active = highlightLandmarkId === lm.id
        return (
          <button
            key={lm.id}
            type="button"
            onClick={() => onLandmarkTap?.(lm.id)}
            disabled={!onLandmarkTap}
            title={lm.label}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${
              onLandmarkTap ? "cursor-pointer hover:scale-110" : ""
            }`}
            style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-full text-lg shadow-md ${
                active ? "bg-amber-400 ring-2 ring-amber-200" : "bg-black/55 ring-1 ring-white/15"
              }`}
            >
              {lm.emoji}
            </span>
          </button>
        )
      })}

      {/* real nearby places from the Places API, pinned on the photo */}
      {showSatellite &&
        realPlaces
          ?.filter((p) => p.x > 1 && p.x < 99 && p.y > 1 && p.y < 99)
          .map((p, i) => (
            <button
              key={`${p.name}-${i}`}
              type="button"
              onClick={() => setPicked(p.name)}
              title={p.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span className="block h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-black/40 transition hover:scale-150" />
            </button>
          ))}

      {/* name of the tapped real place */}
      {showSatellite && picked && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          📍 {picked}
        </div>
      )}

      {/* the helper's pin */}
      {pin && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-all duration-700"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span className="block text-2xl drop-shadow-lg">📍</span>
        </div>
      )}

      {/* attribution, like the real maps require */}
      <span className="absolute bottom-1.5 right-2 text-[10px] text-white/35">Sample location · map preview</span>
    </div>
  )
}
