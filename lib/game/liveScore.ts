// Scoring for the interactive map. The child is at `you` (the scene center) and
// names real nearby places. The more, and the closer, the places they name, the
// surer the helper is and the closer the pin lands on the child.

export interface LatLng {
  lat: number
  lng: number
}

export function metersBetween(a: LatLng, b: LatLng): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export interface LiveResult {
  clarity: number // 0–100
  pin: LatLng | null
}

export function scoreLive(you: LatLng, places: LatLng[], saidThreeWords = false): LiveResult {
  if (saidThreeWords) return { clarity: 100, pin: { ...you } }
  if (places.length === 0) return { clarity: 0, pin: null }

  // A place within ~220m of the child is a strong clue; farther is weaker.
  const closeness = places.map((p) => Math.max(0, 1 - metersBetween(you, p) / 220))
  const best = Math.max(...closeness)
  const confidence = Math.min(1, best + 0.12 * (places.length - 1))

  // The pin starts at the middle of the named places and slides toward the child
  // as confidence rises. High confidence → pin lands right on the child.
  const centroid = {
    lat: places.reduce((s, p) => s + p.lat, 0) / places.length,
    lng: places.reduce((s, p) => s + p.lng, 0) / places.length,
  }
  const pin = {
    lat: centroid.lat + (you.lat - centroid.lat) * confidence,
    lng: centroid.lng + (you.lng - centroid.lng) * confidence,
  }

  return { clarity: Math.round(confidence * 100), pin }
}
