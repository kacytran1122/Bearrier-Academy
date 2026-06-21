import { NextResponse } from "next/server"

export const runtime = "nodejs"

// what3words convert-to-coordinates: turn three words back into a lat/lng. This
// is what lets us check that the words a child read actually point to where they
// are. The other direction (coords → words) lives in /api/threewords.
export async function GET(req: Request) {
  const words = new URL(req.url).searchParams.get("words") ?? ""
  const key = process.env.WHAT3WORDS_API_KEY
  if (!words || !key) return NextResponse.json({ error: "Need words and a key" }, { status: 400 })

  const url = `https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${key}`
  try {
    const res = await fetch(url, { cache: "force-cache" })
    const data = await res.json()
    if (data?.coordinates) {
      return NextResponse.json({ lat: data.coordinates.lat, lng: data.coordinates.lng })
    }
    return NextResponse.json({ error: "Not a real three-word address" }, { status: 404 })
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
  }
}
