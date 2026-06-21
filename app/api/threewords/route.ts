import { NextResponse } from "next/server"
import { getScenario } from "@/lib/game/scenarios"

export const runtime = "nodejs"

// Converts a single map square (lat/lng) into its real three-word address via
// what3words. Every 3m square has its own words, so tapping different blocks
// returns different words. Pass ?lat=&lng= for a specific square, or ?scenario=
// to use that scene's centre. Falls back to the scene's sample words.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const latParam = sp.get("lat")
  const lngParam = sp.get("lng")
  const scenario = getScenario(sp.get("scenario") ?? "")

  let lat: number | undefined = latParam ? Number(latParam) : scenario?.location.lat
  let lng: number | undefined = lngParam ? Number(lngParam) : scenario?.location.lng
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Need lat/lng or scenario" }, { status: 400 })
  }

  const key = process.env.WHAT3WORDS_API_KEY
  const fallback = { words: scenario?.threeWords ?? ["near", "this", "spot"], source: "sample" as const }
  if (!key) return NextResponse.json(fallback)

  const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${key}`
  try {
    const res = await fetch(url, { cache: "force-cache" })
    const data = await res.json()
    if (typeof data?.words === "string") {
      const parts = data.words.split(".")
      if (parts.length === 3) return NextResponse.json({ words: parts, source: "what3words" })
    }
    return NextResponse.json(fallback)
  } catch {
    return NextResponse.json(fallback)
  }
}
