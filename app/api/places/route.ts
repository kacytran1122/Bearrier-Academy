import { NextResponse } from "next/server"
import { getScenario } from "@/lib/game/scenarios"

export const runtime = "nodejs"

// Real nearby landmarks from the Google Places API (New). Returns up to 20
// places around a scenario's sample location, each with a name and coordinates,
// so the game can pin them on the satellite photo. Falls back to an empty list
// if the key is missing or the call fails — the map still works without it.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return NextResponse.json({ places: [], source: "none" })

  // Accept explicit lat/lng (+radius) for the grid rounds, or a scenario id.
  const latP = sp.get("lat")
  const lngP = sp.get("lng")
  let lat: number, lng: number, radius: number
  if (latP && lngP) {
    lat = Number(latP)
    lng = Number(lngP)
    radius = sp.get("radius") ? Number(sp.get("radius")) : 600
  } else {
    const scenario = getScenario(sp.get("scenario") ?? "")
    if (!scenario) return NextResponse.json({ error: "Unknown scenario" }, { status: 400 })
    lat = scenario.location.lat
    lng = scenario.location.lng
    radius = scenario.location.zoom >= 18 ? 180 : scenario.location.zoom >= 17 ? 260 : 450
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: "Bad coordinates" }, { status: 400 })

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.location,places.primaryType",
      },
      body: JSON.stringify({
        maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
      cache: "force-cache",
    })
    const data = await res.json()
    const places = (data?.places ?? [])
      .map((p: { displayName?: { text?: string }; location?: { latitude: number; longitude: number }; primaryType?: string }) => ({
        name: p.displayName?.text ?? "Place",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        type: p.primaryType ?? "",
      }))
      .filter((p: { lat?: number; lng?: number }) => typeof p.lat === "number" && typeof p.lng === "number")

    return NextResponse.json({ places, source: places.length ? "places" : "empty" })
  } catch {
    return NextResponse.json({ places: [], source: "error" })
  }
}
