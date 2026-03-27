import { Terminal, Github } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600">
              <Terminal className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">
              cc<span className="text-violet-400">rank</span>
            </span>
            <span className="text-xs text-zinc-600 ml-2">Ranked by output, not spend.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <a
              href="https://github.com/flaskovystupel/ccrank"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
