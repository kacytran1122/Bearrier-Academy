"use client"

// Shows the three-word address for the child's square. The child reads it out
// loud themselves (the mic button handles the voice), so there's no play button.
export default function ThreeWordsCard({ words }: { words: [string, string, string] }) {
  return (
    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">This square is</p>
      <p className="font-mono text-2xl font-bold tracking-tight text-white md:text-3xl">
        {words[0]}<span className="text-emerald-300">.</span>
        {words[1]}<span className="text-emerald-300">.</span>
        {words[2]}
      </p>
      <p className="mt-3 text-sm text-white/55">Read these three words out loud to the helper.</p>
    </div>
  )
}
