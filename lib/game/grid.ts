// Maps the 3x3 rescue grid (A1..C3) onto real coordinates, so each cell has a
// real what3words address and real nearby Places landmarks. The grid is centred
// on a landmark-rich public park (sample location, never a real home).

export const GRID_CENTER = { lat: 40.7466, lng: -73.8446 } // Flushing Meadows park
export const GRID_ZOOM = 16
export const GRID_ROWS = ["A", "B", "C"] as const
export const GRID_COLS = ["1", "2", "3"] as const
export const GRID_CELLS = GRID_ROWS.flatMap((r) => GRID_COLS.map((c) => `${r}${c}`))

// Static Maps image is 640 logical px; each cell is one third of it.
function metersPerPixel(): number {
  return (156543.03392 * Math.cos((GRID_CENTER.lat * Math.PI) / 180)) / Math.pow(2, GRID_ZOOM)
}
function cellMeters(): number {
  return (640 / 3) * metersPerPixel()
}

/** Real centre coordinate of a grid cell like "B2". */
export function cellCenter(cell: string): { lat: number; lng: number } {
  const i = GRID_ROWS.indexOf(cell[0] as (typeof GRID_ROWS)[number]) // row: A=0 (north)
  const j = GRID_COLS.indexOf(cell[1] as (typeof GRID_COLS)[number]) // col: 1=0 (west)
  const cm = cellMeters()
  return {
    lat: GRID_CENTER.lat + ((1 - i) * cm) / 111320,
    lng: GRID_CENTER.lng + ((j - 1) * cm) / (111320 * Math.cos((GRID_CENTER.lat * Math.PI) / 180)),
  }
}

/** Which cell a real coordinate falls into, or null if outside the grid. */
export function cellOf(lat: number, lng: number): string | null {
  const cm = cellMeters()
  const north = (lat - GRID_CENTER.lat) * 111320
  const east = (lng - GRID_CENTER.lng) * 111320 * Math.cos((GRID_CENTER.lat * Math.PI) / 180)
  const i = 1 - Math.round(north / cm)
  const j = 1 + Math.round(east / cm)
  if (i < 0 || i > 2 || j < 0 || j > 2) return null
  return `${GRID_ROWS[i]}${GRID_COLS[j]}`
}

export function gridImageSrc(): string {
  return `/api/staticmap?lat=${GRID_CENTER.lat}&lng=${GRID_CENTER.lng}&zoom=${GRID_ZOOM}`
}
