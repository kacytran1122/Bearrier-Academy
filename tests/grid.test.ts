import { describe, it, expect } from "vitest"
import { GRID_CELLS, GRID_CENTER, cellCenter, cellOf } from "@/lib/game/grid"

describe("grid math", () => {
  it("the centre is cell B2", () => {
    expect(cellOf(GRID_CENTER.lat, GRID_CENTER.lng)).toBe("B2")
  })

  it("every cell's centre maps back to that cell", () => {
    for (const cell of GRID_CELLS) {
      const c = cellCenter(cell)
      expect(cellOf(c.lat, c.lng)).toBe(cell)
    }
  })

  it("has 9 cells", () => {
    expect(GRID_CELLS).toHaveLength(9)
  })
})
