import { getScenario } from "@/lib/game/scenarios"

export const runtime = "nodejs"

// Proxies a Google Maps Static satellite image for a scenario's sample location.
// The server key stays on the server (never sent to the browser). If the key is
// missing or Google errors, we return 404 so the map falls back to the preview.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return new Response(null, { status: 404 })

  // Accept explicit lat/lng/zoom (grid rounds) or a scenario id.
  const latP = sp.get("lat")
  const lngP = sp.get("lng")
  const zoomP = sp.get("zoom")
  let lat: number, lng: number, zoom: number
  if (latP && lngP) {
    lat = Number(latP)
    lng = Number(lngP)
    zoom = zoomP ? Number(zoomP) : 16
  } else {
    const scenario = getScenario(sp.get("scenario") ?? "")
    if (!scenario) return new Response(null, { status: 404 })
    ;({ lat, lng, zoom } = scenario.location)
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) return new Response(null, { status: 404 })
  const url =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}&zoom=${zoom}&size=640x640&scale=2&maptype=satellite&key=${key}`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return new Response(null, { status: 404 })
    const buf = await res.arrayBuffer()
    return new Response(buf, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/png",
        // sample images are static; cache them for a day
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
