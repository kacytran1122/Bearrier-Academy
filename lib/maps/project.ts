// Web Mercator projection: turn a real lat/lng into a percentage position on a
// Google Static Maps image of a known center + zoom. Lets us drop real places
// onto the exact pixel of the satellite photo (no interactive map needed).

export function latLngToPercent(
  center: { lat: number; lng: number },
  zoom: number,
  lat: number,
  lng: number,
  sizePx = 640, // the logical size we request from the Static Maps API
): { x: number; y: number } {
  const scale = Math.pow(2, zoom)
  const world = (la: number, ln: number) => {
    const siny = Math.min(Math.max(Math.sin((la * Math.PI) / 180), -0.9999), 0.9999)
    return {
      x: 256 * (0.5 + ln / 360),
      y: 256 * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
    }
  }
  const c = world(center.lat, center.lng)
  const p = world(lat, lng)
  return {
    x: 50 + (((p.x - c.x) * scale) / sizePx) * 100,
    y: 50 + (((p.y - c.y) * scale) / sizePx) * 100,
  }
}
