// Maps each skill id to its plain-language, real-life lesson (from the spec's
// "What Kids Learn" section).

export interface Skill {
  id: string
  name: string
  lesson: string
}

export const SKILLS: Record<string, Skill> = {
  address: {
    id: "address",
    name: "Your address and phone number",
    lesson: "The first clue you'll ever need. Learn it by heart.",
  },
  landmarks: {
    id: "landmarks",
    name: "Landmark clues",
    lesson: "Describe what's around you so a helper can picture your spot.",
  },
  threeWords: {
    id: "threeWords",
    name: "Your three words",
    lesson: "Read your three-word address from the map. It points to an exact square.",
  },
  backup: {
    id: "backup",
    name: "Backup clues",
    lesson: "Give two or three clues, not just one, so help still works if one is wrong.",
  },
  sayTwice: {
    id: "sayTwice",
    name: "Say it twice",
    lesson: "Repeat the important parts. Make sure the helper heard them right.",
  },
  calm: {
    id: "calm",
    name: "Stay calm and speak clearly",
    lesson: "A slow, clear voice gets help faster than a rushed one.",
  },
  safeHelper: {
    id: "safeHelper",
    name: "Find a safe helper",
    lesson: "Look for police, a worker in uniform, or a parent with kids.",
  },
  callForHelp: {
    id: "callForHelp",
    name: "Call for help",
    lesson: "Learn when and how to call 911, what to say, and why to stay on the line.",
  },
}
