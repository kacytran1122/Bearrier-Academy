"use client"

import LazyImage from "@/components/LazyImage"

// A satellite image split into a 3x3 grid (A1..C3) that kids can click. Used by
// the Morse and Sign rescue rounds to pick a search zone on the map.
const ROWS = ["A", "B", "C"] as const
const COLS = ["1", "2", "3"] as const
export const CELLS = ROWS.flatMap((r) => COLS.map((c) => `${r}${c}`))

export default function GridMap({
  scenarioId = "trail",
  src,
  onCellClick,
  selected,
  correct,
  personCell,
  personEmoji = "🧒",
  showLabels = true,
  disabled = false,
  landmarks,
  showLandmarks = false,
}: {
  scenarioId?: string
  /** Full image URL (e.g. the real grid centre). Overrides scenarioId. */
  src?: string
  onCellClick?: (cell: string) => void
  selected?: string | null
  correct?: string | null
  personCell?: string | null
  personEmoji?: string
  showLabels?: boolean
  disabled?: boolean
  /** Real places already projected to a cell, so each one can be pinned on the map. */
  landmarks?: { name: string; cell: string }[]
  /** Reveal the landmark pins (e.g. once the search zone is found). */
  showLandmarks?: boolean
}) {
  // One representative landmark per cell — the first one, which is the answer the
  // round accepts — so the player can read which landmark sits in which square.
  const landmarkByCell = new Map<string, string>()
  for (const lm of landmarks ?? []) {
    if (!landmarkByCell.has(lm.cell)) landmarkByCell.set(lm.cell, lm.name)
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1a14]">
      <div className="absolute inset-0 opacity-90">
        <LazyImage
          src={src ?? `/api/staticmap?scenario=${scenarioId}`}
          alt="Satellite view"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {CELLS.map((cell) => {
          const isSel = selected === cell
          const isRight = correct === cell
          return (
            <button
              key={cell}
              type="button"
              disabled={disabled || !onCellClick}
              onClick={() => onCellClick?.(cell)}
              className={`relative border border-white/15 transition ${
                onCellClick && !disabled ? "cursor-pointer hover:bg-white/10" : ""
              } ${isRight ? "bg-emerald-400/40" : isSel ? "bg-amber-400/30" : ""}`}
            >
              {showLabels && (
                <span className="absolute left-1.5 top-1 text-[10px] font-semibold text-white/55">{cell}</span>
              )}
              {showLandmarks && landmarkByCell.get(cell) && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 flex max-w-[92%] -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">
                  <span aria-hidden>📍</span>
                  <span className="truncate">{landmarkByCell.get(cell)}</span>
                </span>
              )}
              {personCell === cell && <span className="text-2xl drop-shadow">{personEmoji}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
