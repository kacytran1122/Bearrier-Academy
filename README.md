# B(e)arrier Academy

**Know where you are. Get help fast.** · _A HackBerkeley project_

A calm, kid-driven safety game (ages 6–12) that teaches the single most useful
skill in an emergency: telling a rescuer **exactly where you are**. Kids play
two connected rounds on a **real satellite map**, each teaching a different way
to send a clear location signal — spoken words and Morse code.

The guide is **Ranger Bear**. Every round is short, never scary, and ends with a
**Safety Badge**.

---

## The game: one continuous Bearventure

Start → microphone safety check → guided walkthrough → **Round 1 → Round 2 →
Round 2** → results. No menus to choose from; you just follow the flow.

### Round 1 · Find Your Square (what3words + voice)
You are dropped at a **random spot** on a real satellite map. Find yourself
(the 🐻), tap the square you are on to reveal its **real three-word address**
(every 3m square has its own), then **say those three words out loud**. Deepgram
turns your voice into text; what3words turns the words back into a location; if it
matches where you are, a 911 dispatcher (Claude) confirms and help arrives.

### Round 2 · Morse Map Rescue (signal compression)
A storm knocks out the cell towers. You can't call, but you can flash **Morse
code** with a flashlight. A rescue satellite scans from above. You decode a Morse
signal into a **grid zone** (e.g. `-... ..---` → `B2`), tap it on the map, then
the **landmark** (`RIVER`), then pick the single **best short message**:
`SOS B2 RIVER`. Lesson: short emergency codes narrow a huge search area. Each
3×3 grid cell is a real coordinate, so the landmarks come from live Google Places
and the found cell shows its real what3words address.

**The thread through both rounds:** the best emergency message is **short but
complete** — who needs help, where, and what's nearby. (See _Research notes_.)

---

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4**
- **Claude** (`claude-haiku-4-5`) via `@anthropic-ai/sdk` — the dispatcher / ranger dialogue
- **Google Maps Platform** — Maps JavaScript (interactive satellite), Maps Static (grid backdrops), Places (real landmarks)
- **what3words** — coordinates → three words **and** three words → coordinates
- **Deepgram** — speech-to-text for the spoken three words
- **Vitest** — unit tests for the game logic

## APIs and how each is used

| API | Where | What it does |
|---|---|---|
| Claude | `app/api/helper` + `lib/claude/*` | Generates the responder's unique, in-character lines (server-only key) |
| Google Maps JavaScript | `components/game/LiveMap.tsx` | The draggable/zoomable satellite map kids explore |
| Google Maps Static | `app/api/staticmap` → `GridMap` / `SatelliteMap` | Satellite backdrops for the grid rounds (server-key proxy) |
| Google Places | `app/api/places` | Real nearby landmarks pinned on the map |
| what3words (convert-to-3wa) | `app/api/threewords` | A tapped square → its real three words |
| what3words (convert-to-coordinates) | `app/api/locate` | Spoken three words → a location to verify |
| Deepgram | `app/api/stt` | The child's recorded voice → text |

Every third-party key is used **server-side only** (proxied through Route
Handlers); the one exception is the website-restricted Google Maps **browser**
key, which is designed to be public when restricted.

---

## Project structure

```
app/
  page.tsx                  Landing (intro zoom, rotating safety lessons)
  play/page.tsx             Intro to the two rounds → Start
  play/campaign/page.tsx    Voice consent → walkthrough → Round 1→2→3 → results
  play/[scenario]/page.tsx  Single-round play (direct link, for testing)
  api/
    helper/route.ts         Claude dispatcher line
    threewords/route.ts     coords → words (what3words)
    locate/route.ts         words → coords (what3words)
    stt/route.ts            audio → text (Deepgram)
    places/route.ts         nearby landmarks (Places)
    staticmap/route.ts      satellite image proxy (Maps Static)
components/game/
  Round.tsx                 Round 1: find-your-square + voice
  MorseRound.tsx            Round 2: Morse Map Rescue (live grid)
  LiveMap.tsx               interactive satellite map
  GridMap.tsx               3×3 satellite grid (A1..C3), real coordinates
  ThreeWordsCard.tsx · BadgeReward.tsx
lib/game/
  scenarios.ts · types.ts · liveScore.ts · scoring.ts · morse.ts · grid.ts · skills.ts
lib/claude/                 kid-safe character prompts + client
lib/progress.ts             Safety Badges on-device
tests/                      Vitest unit tests
```

---

## Setup

```bash
npm install
cp .env.example .env.local   # add your keys (all optional — see below)
npm run dev                  # http://localhost:3000
```

The app **runs with no keys** (AI uses friendly fallback lines, maps fall back to
a preview). Add keys to turn on the real services:

```
ANTHROPIC_API_KEY=...                      # Claude dialogue (server-only)
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=...     # interactive map (website-restricted)
GOOGLE_MAPS_SERVER_KEY=...                  # static maps / places (server-only)
WHAT3WORDS_API_KEY=...                      # three words ↔ coordinates (server-only)
DEEPGRAM_API_KEY=...                        # voice to text (server-only)
```

For Google, enable these APIs in the same Cloud project and turn on billing:
**Maps JavaScript, Maps Static, Places (New), Geocoding** (Map Tiles / Aerial
View are for future features).

## Scripts

```bash
npm run dev      # local dev
npm run build    # production build
npm start        # run the production build
npm test         # Vitest unit tests
```

## Testing

Unit tests cover the pure game logic in `tests/`:

- **`morse.test.ts`** — Morse encode/decode round-trips (`B2`, `RIVER`, `SOS B2 RIVER`).
- **`liveScore.test.ts`** — distance math and live confidence scoring.
- **`scoring.test.ts`** — the clue-clarity engine (three words = pinpoint, vague vs. backed-up clues).
- **`grid.test.ts`** — grid math: every cell's centre maps back to that cell; centre is B2.
- **`scenarios.test.ts`** — scenario data integrity (locations, three words, clue/landmark links).

```bash
npm test
```

Manual / integration checks worth running with keys set: tap two squares and
confirm they return **different** three words; record the right three words and
confirm "Found you!"; decode `-... ..---` → `B2` in Round 2.

---

## Privacy & safety (COPPA-minded)

- **No child accounts, no child data leaves the device.** Badges are stored in
  the browser only.
- **Voice is used once and not stored.** Audio goes to Deepgram only to become
  text, behind a microphone consent screen; declining returns to the landing page.
- **Sample places only.** Maps and three-words always use public sample locations
  (a park, a library block), never a child's real home.
- **AI guardrails.** Character prompts are kid-safe: short sentences, never
  graphic, calm and reassuring even in an "emergency."

---

## Future directions

- **Aerial View flyover** as the arrival reward (Google Aerial View API).
- **Deepgram text-to-speech** so the dispatcher's reply is read aloud for early readers.
- **A visual-signals round** (a rescue drone reading hand signs) — an earlier
  prototype used webcam motion detection; could return as an optional round.
- **Parent/teacher dashboard** (Render Postgres + Auth.js): which safety skills a
  child practiced, printable family tip sheet, per-round debrief.
- **Localization** of the emergency number and language (911 / 999 / 112 / 000 / 111).
- **Accessibility pass**: full keyboard control, screen-reader labels, read-aloud
  everywhere, and a low-stimulation mode.
- **Offline PWA** so a weak connection never blocks a lesson.

---

## Research notes & publication direction

This game is built on one evidence-based idea from real emergency communication:
**rescuers can only act on what you tell them, so the message must be both clear
and compact.** Each round is a different encoding of the same payload —
_location + need_ — at decreasing bandwidth (full speech → three words → a short
Morse code). We call this the **context-compression** thread.

**Why what3words.** Three simple words are far easier for a child to say than a
string of latitude/longitude digits, and they resolve to a fixed 3m square.
Three-word addressing has been adopted by emergency services in several countries
as a way to communicate precise locations by voice over the phone. (Verify current
adoption and guidance at the what3words "what3words for emergencies" resources and
the relevant national emergency-service publications before citing specifics.)

**Why SOS / Morse.** `· · · — — — · · ·` (SOS) is an internationally recognized
distress signal precisely *because* it is short, unambiguous, and sendable across
many channels — sound, light, or radio — when voice and text are impossible. Its
history and standardization (ITU / maritime distress conventions) make it a clean,
real-world example of compressing "I need help" into the smallest reliable signal.

**Suggested study, if developed into a publication.** A small classroom study
could test whether playing the two rounds improves children's ability to (a)
recall and state a precise location, and (b) produce a short, complete emergency
message under mild time pressure, versus a text-only safety lesson. Pre/post
measures: location-statement completeness, message length vs. information retained,
and time-to-first-useful-clue. The compression framing (information retained per
token sent) gives a clean quantitative metric.

> The references above point to **real, verifiable bodies of work** (what3words
> emergency-services documentation, ITU/maritime SOS standards, SAR ground-to-air
> signaling guides). This README intentionally does not fabricate specific
> citations — confirm exact sources and dates before any formal write-up.

---

## Credits

Built at **HackBerkeley** — Ranger Bear 🐻, our guide, is a nod to the HackBerkeley
bear mascot. Design spec: `../Bearrier-Academy.docx`.

Built with Claude, Google Maps Platform, what3words, and Deepgram. The landing
page plays `public/bear.mp4` as its background (add your own clip there).
