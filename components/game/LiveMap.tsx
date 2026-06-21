"use client"

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps"
import type { LatLng } from "@/lib/game/liveScore"

export interface Place extends LatLng {
  name: string
}

// Interactive Google satellite map. Kids drag, pinch, and zoom, then TAP the
// square they're standing on. Real nearby places show as small context dots.
// The 🐻 marks the child; the helper's pin shows where the words point.
export default function LiveMap({
  center,
  zoom,
  places,
  you,
  tapped,
  pin,
  onMapClick,
}: {
  center: LatLng
  zoom: number
  places: Place[]
  you: LatLng
  tapped?: LatLng | null
  pin?: LatLng | null
  onMapClick?: (p: LatLng) => void
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY

  if (!apiKey) {
    return (
      <div className="grid aspect-square w-full place-items-center rounded-2xl border border-white/10 bg-[#0c1a14] p-6 text-center text-sm text-white/50">
        Add a Google Maps browser key to see the live satellite map.
      </div>
    )
  }

  return (
    <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={zoom}
          mapTypeId="satellite"
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
          onClick={(e) => {
            const ll = e.detail?.latLng
            if (ll) onMapClick?.({ lat: ll.lat, lng: ll.lng })
          }}
        >
          {/* real nearby places — context only, not tappable */}
          {places.map((p, i) => (
            <AdvancedMarker key={`${p.name}-${i}`} position={p} title={p.name}>
              <span className="block h-2.5 w-2.5 rounded-full bg-emerald-300/80 shadow ring-1 ring-black/40" />
            </AdvancedMarker>
          ))}

          {/* the square the child tapped */}
          {tapped && (
            <AdvancedMarker position={tapped} title="The square you tapped">
              <span className="block h-7 w-7 rounded-md border-2 border-amber-300 bg-amber-300/20" />
            </AdvancedMarker>
          )}

          {/* the child's own spot */}
          <AdvancedMarker position={you} title="You are here">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-lg ring-2 ring-amber-400">
              🐻
            </span>
          </AdvancedMarker>

          {/* the helper's pin (shown once they read the right square) */}
          {pin && (
            <AdvancedMarker position={pin} title="Help is coming here">
              <span className="block text-3xl drop-shadow-lg">📍</span>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  )
}
