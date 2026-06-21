// Core types and contracts for B(e)arrier Academy.

export type AgeLevel = "cub" | "scout" | "ranger"
export type ScenarioId = "fair" | "home" | "trail"

/** The five gentle steps every scenario plays through. */
export type GameStep = "scene" | "explore" | "tell" | "pin" | "arrive"

/** A landmark a child can name as a clue. Positioned on the 0–100 map grid. */
export interface Landmark {
  id: string
  label: string
  emoji: string
  x: number // 0–100, left→right on the satellite map
  y: number // 0–100, top→bottom
}

/** A clue the child can pick from the tray. Strong clues pull the helper's pin
 *  onto the real spot; weak ones leave it drifting. */
export interface Clue {
  id: string
  label: string
  /** 0 = vague ("near the food"), 1 = pinpoint ("by the blue ticket booth"). */
  strength: number
  /** Optional landmark this clue points at, for the Sky Match mini-game. */
  landmarkId?: string
}

export interface Scenario {
  id: ScenarioId
  title: string
  /** Who the child talks to — a 911 dispatcher or a park ranger. */
  helperRole: "dispatcher" | "ranger" | "worker"
  helperName: string
  sceneEmoji: string
  /** A real, public SAMPLE location for the satellite map — never a real home.
   *  Used for the Google satellite image and the what3words conversion. */
  location: { lat: number; lng: number; zoom: number }
  /** One calm sentence describing what's happening. */
  intro: string
  /** The real spot the child is at, on the 0–100 grid. */
  target: { x: number; y: number }
  /** The three-word address for the exact square (what3words style). */
  threeWords: [string, string, string]
  landmarks: Landmark[]
  clues: Clue[]
  /** Skills this scenario practices, by id (see skills.ts). */
  skills: string[]
}

export interface BadgeRecord {
  scenarioId: ScenarioId
  age: AgeLevel
  /** 0–100 score for how clear the child's clues were. */
  clarity: number
  earnedAt: string // ISO date
}
