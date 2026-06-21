import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Speech to text via Deepgram. The browser records the child saying their three
// words and posts the audio here; we return the transcript. The audio is used
// once and not stored (the spec's "safe voice" rule). Returns an empty
// transcript if no Deepgram key is set, so the game can fall back to no-mic.
export async function POST(req: Request) {
  const key = process.env.DEEPGRAM_API_KEY
  if (!key) return NextResponse.json({ transcript: "", source: "none" })

  const audio = await req.arrayBuffer()
  const contentType = req.headers.get("content-type") || "audio/webm"

  try {
    const res = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=false&punctuate=false",
      {
        method: "POST",
        headers: { Authorization: `Token ${key}`, "Content-Type": contentType },
        body: audio,
      },
    )
    const data = await res.json()
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""
    return NextResponse.json({ transcript, source: "deepgram" })
  } catch {
    return NextResponse.json({ transcript: "", source: "error" })
  }
}
