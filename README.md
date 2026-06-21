# B(e)arrier Academy

**Know where you are. Get help fast.** · _A HackBerkeley project_

B(e)arrier Academy is a calm safety game for kids (ages 6–12). It teaches the one
thing that matters most in an emergency: **telling a rescuer exactly where you
are.** Kids play two short rounds on a **real satellite map**, guided by **Ranger
Bear**. Each round ends with a Safety Badge, and nothing in the game is scary.

---

## What you do in the game

**Round 1 · Find Your Square.** You look at a real map from the sky and find your
spot. You tap your square to get its three special words, then say them out loud
so the helper can find you.

**Round 2 · Morse Map Rescue.** The phones are down after a storm. You flash a
short code with a flashlight to show the rescue satellite which part of the map
you are in, then point to the right landmark.

The same big idea runs through both: **a good emergency message is short but
complete** — who needs help, where you are, and what is near you.

---

## How to play

1. Open the home page and click **Start the Bearventure**.
2. Say **yes** to use the microphone (a grown-up should help). Your voice is only
   turned into text once and is never saved.
3. Watch the quick how-to-play pictures.
4. Play **Round 1**, then **Round 2**.
5. Earn your **Safety Badges** at the end.

---

## How to run it on your computer

You need **Node.js version 18 or newer** (this comes with `npm`). The game runs
the same way on every system once Node is installed.

### 1) Install Node.js (one time)

- **Windows:** download the installer from <https://nodejs.org> and run it.
  (Or, in PowerShell: `winget install OpenJS.NodeJS.LTS`)
- **macOS:** download from <https://nodejs.org>. (Or, with Homebrew: `brew install node`)
- **Linux:** use your package manager, e.g. Ubuntu/Debian:
  `sudo apt update && sudo apt install nodejs npm`
  (Or use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`)

To check it worked, open a terminal and run: `node -v` (you should see a version like `v20.x`).

### 2) Get the code and start it (all systems)

Open a terminal (on Windows use **PowerShell** or **Command Prompt**), then:

```bash
git clone https://github.com/kacytran1122/Bearrier-Academy.git
cd Bearrier-Academy
npm install
npm run dev
```

Then open **http://localhost:3000** in your web browser. To stop it, press
**Ctrl + C** in the terminal.

> Already have the folder? Just `cd` into it and run `npm install` then `npm run dev`.

The game works right away with no extra setup. To turn on the real AI voice,
maps, and three-words, add API keys (see **Setup with API keys** below).

### Other commands (same on every system)

```bash
npm run dev      # play the game (reloads as you edit)
npm run build    # build the production version
npm start        # run the production build
npm test         # run the tests
```

---

## Languages and tools used

- **TypeScript** — the main programming language (`.ts` and `.tsx` files).
- **React (TSX/JSX)** — builds the screens and game components.
- **CSS** — styling with **Tailwind CSS v4** (plus a little custom CSS for animations).
- **JSON / Markdown** — configuration and docs.

Framework and platform: **Next.js 16** (App Router) on **React 19**, tested with
**Vitest**.

---

## Setup with API keys (optional)

The app **runs with no keys** (the AI uses friendly built-in lines and the maps
show a preview). To turn on the real services, copy the example file and fill it
in:

```bash
cp .env.example .env.local
```

```
ANTHROPIC_API_KEY=...                      # Claude — the dispatcher's voice (server-only)
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=...     # the live map (restrict it to your website)
GOOGLE_MAPS_SERVER_KEY=...                  # map images + nearby places (server-only)
WHAT3WORDS_API_KEY=...                      # three words <-> location (server-only)
DEEPGRAM_API_KEY=...                        # turns the child's voice into text (server-only)
```

For Google, turn on these in the same Cloud project and enable billing:
**Maps JavaScript, Maps Static, Places (New)**.

`.env.local` is private and never uploaded to GitHub.

---

## Tests

The important game logic has tests (run `npm test`):

- `morse.test.ts` — Morse encode/decode (e.g. `B2`, `RIVER`, `SOS B2 RIVER`).
- `liveScore.test.ts` — distance math and how sure the helper is.
- `scoring.test.ts` — the clue-clarity engine.
- `grid.test.ts` — the map grid math (every cell maps back to itself).
- `scenarios.test.ts` — the scenario data is well-formed.

---

## Privacy and safety

- **No child accounts, and no child data leaves the device.** Badges are saved in
  the browser only.
- **Voice is used once and not stored.** It is turned into text behind a
  microphone consent screen; saying no returns to the home page.
- **Sample places only.** The maps and three-words always use public sample spots
  (a park, a library block), never a child's real home.
- **Friendly AI.** The helper speaks in short, calm, kid-safe sentences.

---

## How it's organized (quick map)

```
app/            pages (home, play intro, the two-round game) and the API routes
components/game/ the game screens (Round, MorseRound, the maps, the badge)
lib/game/       the rules and math (scenarios, scoring, morse, grid)
lib/claude/     the kind, kid-safe character prompts + Claude client
tests/          Vitest tests
public/         static files (bear.mp4 background)
```

---

## Future ideas

- Read the dispatcher's reply out loud (Deepgram text-to-speech).
- A 3D flyover when help arrives (Google Aerial View).
- An optional "hand-signs to a rescue drone" round.
- A parent/teacher dashboard showing which skills a child practiced.
- More languages and the right emergency number per country (911 / 999 / 112 / 000 / 111).

---

## Inspiration and references

This game is built on one well-studied idea: a message gets through faster when it
is **clear and compact**. That idea, and the two signaling methods in the game,
come from real history and research:

1. **Shannon, C. E. (1948). "A Mathematical Theory of Communication."** _Bell
   System Technical Journal, 27_(3), 379–423; 27(4), 623–656. The foundation of
   information theory — how to encode a message efficiently. It inspired the
   game's "short but complete" message lesson (context compression).

2. **Morse code & the SOS distress signal.** Morse code was developed by Samuel
   F. B. Morse and Alfred Vail in the 1830s–1840s. The **SOS** signal
   (· · · — — — · · ·) was adopted internationally at the **International
   Radiotelegraph Convention, Berlin (1906)** and came into force in 1908,
   precisely because a short, unmistakable signal works when voice and text do
   not. This inspired Round 2 (Morse Map Rescue).

3. **what3words three-word addressing.** what3words (what3words Ltd.) divides the
   world into 3-metre squares, each with a fixed three-word name, so a precise
   location can be spoken easily by voice. It has been adopted by emergency
   services in several countries to locate callers. This inspired Round 1 (Find
   Your Square). See the what3words "for emergencies" resources.

> These references are real and verifiable. For a formal write-up, confirm the
> exact editions, page numbers, and current what3words emergency-service sources
> before citing.

---

## Credits

Built at **HackBerkeley**. Ranger Bear 🐻, our guide, is a nod to the HackBerkeley
bear mascot. Design spec: `../Bearrier-Academy.docx`.

Built with Claude, Google Maps Platform, what3words, and Deepgram. The home page
plays `public/bear.mp4` as its background.
