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
}) {
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
              {personCell === cell && <span className="text-2xl drop-shadow">{personEmoji}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
