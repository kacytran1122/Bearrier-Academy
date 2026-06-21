"use client"

// Child progress lives on the device only (the spec's privacy-first rule).
// We use localStorage here for the front-end shell; the production app swaps in
// IndexedDB without changing this interface. No child data ever leaves the browser.

import type { BadgeRecord } from "./game/types"

const KEY = "bearrier-badges"

export function loadBadges(): BadgeRecord[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as BadgeRecord[]
  } catch {
    return []
  }
}

export function saveBadge(badge: BadgeRecord): BadgeRecord[] {
  const all = loadBadges()
  all.push(badge)
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // storage full / blocked — progress just won't persist; the game still plays
  }
  return all
}

export function clearBadges() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY)
}
