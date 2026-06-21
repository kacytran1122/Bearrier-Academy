import type { Scenario, ScenarioId } from "./types"

// The three real situations from the spec. Sample places only — never a real
// child's home. Three-word examples are taken straight from the design doc.

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  fair: {
    id: "fair",
    title: "Lost at the Fair",
    helperRole: "worker",
    helperName: "the fair worker",
    sceneEmoji: "🎡",
    location: { lat: 40.7466, lng: -73.8446, zoom: 17 }, // Flushing Meadows park (sample)
    intro: "You can't find your family anywhere. The fair is loud and crowded and you feel scared. Take a breath. You need to get help and say exactly where you are.",
    target: { x: 64, y: 42 },
    threeWords: ["lake", "brave", "song"],
    skills: ["safeHelper", "landmarks", "threeWords", "backup", "calm"],
    landmarks: [
      { id: "ferris", label: "the big Ferris wheel", emoji: "🎡", x: 66, y: 30 },
      { id: "carousel", label: "the carousel", emoji: "🎠", x: 60, y: 48 },
      { id: "ticket", label: "the red ticket booth", emoji: "🎟️", x: 72, y: 46 },
      { id: "popcorn", label: "the popcorn cart", emoji: "🍿", x: 58, y: 38 },
      { id: "trucks", label: "the food trucks", emoji: "🚚", x: 30, y: 70 },
    ],
    clues: [
      { id: "near-food", label: "By the food trucks", strength: 0.3, landmarkId: "trucks" },
      { id: "carousel", label: "Near the carousel", strength: 0.7, landmarkId: "carousel" },
      { id: "ticket", label: "By the red ticket booth", strength: 0.9, landmarkId: "ticket" },
      { id: "ferris", label: "Next to the big Ferris wheel", strength: 0.85, landmarkId: "ferris" },
      { id: "popcorn", label: "Beside the popcorn cart", strength: 0.8, landmarkId: "popcorn" },
    ],
  },

  home: {
    id: "home",
    title: "Help at Home",
    helperRole: "dispatcher",
    helperName: "the 911 dispatcher",
    sceneEmoji: "🏠",
    location: { lat: 40.7532, lng: -73.9822, zoom: 18 }, // a public library block (sample)
    intro: "Grandpa fell and can't get up. He needs help right now. You have to call 911 and tell them exactly where you live.",
    target: { x: 50, y: 50 },
    threeWords: ["maple", "house", "three"],
    skills: ["address", "callForHelp", "calm", "sayTwice", "backup"],
    landmarks: [
      { id: "house", label: "42 Maple Street, apartment 3", emoji: "🏠", x: 50, y: 50 },
      { id: "park", label: "the little park next door", emoji: "🛝", x: 34, y: 40 },
      { id: "store", label: "the corner store", emoji: "🏪", x: 70, y: 58 },
      { id: "school", label: "the school down the block", emoji: "🏫", x: 40, y: 72 },
    ],
    clues: [
      { id: "street", label: "I live on Maple Street", strength: 0.5 },
      { id: "address", label: "42 Maple Street, apartment 3", strength: 1.0, landmarkId: "house" },
      { id: "park", label: "Next to the little park", strength: 0.7, landmarkId: "park" },
      { id: "store", label: "Across from the corner store", strength: 0.75, landmarkId: "store" },
    ],
  },

  trail: {
    id: "trail",
    title: "Turned Around on the Trail",
    helperRole: "ranger",
    helperName: "the park ranger",
    sceneEmoji: "🌲",
    location: { lat: 37.8912, lng: -122.5719, zoom: 16 }, // Muir Woods trail area (sample)
    intro: "You took a wrong turn and lost your group. It's getting cold and you don't know the way back. Stop walking. Help can find you if you say where you are.",
    target: { x: 40, y: 36 },
    threeWords: ["pine", "cabin", "flute"],
    skills: ["landmarks", "threeWords", "backup", "calm", "safeHelper"],
    landmarks: [
      { id: "log", label: "a big fallen log", emoji: "🪵", x: 38, y: 34 },
      { id: "bridge", label: "a small wooden bridge over a stream", emoji: "🌉", x: 46, y: 40 },
      { id: "stream", label: "the stream", emoji: "💧", x: 52, y: 50 },
      { id: "fork", label: "where the path splits", emoji: "🥾", x: 26, y: 24 },
      { id: "rock", label: "the tall grey rock", emoji: "🪨", x: 60, y: 30 },
    ],
    clues: [
      { id: "woods", label: "I'm somewhere in the woods", strength: 0.2 },
      { id: "log", label: "Next to a big fallen log", strength: 0.85, landmarkId: "log" },
      { id: "bridge", label: "Near a small wooden bridge", strength: 0.9, landmarkId: "bridge" },
      { id: "stream", label: "Beside a stream", strength: 0.6, landmarkId: "stream" },
      { id: "fork", label: "Where the path splits", strength: 0.7, landmarkId: "fork" },
    ],
  },
}

export function getScenario(id: string): Scenario | undefined {
  return (SCENARIOS as Record<string, Scenario>)[id]
}

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[]
