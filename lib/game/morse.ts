// Morse code reference + helpers for the "Morse Map Rescue" round.

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
}

// Reverse lookup: morse pattern → character.
const FROM_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
)

/** Encode plain text into Morse. Letters split by space, words by " / ". */
export function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch) => MORSE[ch] ?? "")
        .filter(Boolean)
        .join(" "),
    )
    .join(" / ")
}

/** Decode Morse (letters split by space, words by "/") back to text. */
export function fromMorse(code: string): string {
  return code
    .trim()
    .split("/")
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((sym) => FROM_MORSE[sym] ?? "")
        .join(""),
    )
    .join(" ")
    .trim()
}
