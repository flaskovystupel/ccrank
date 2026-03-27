'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Terminal, LogOut, User } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            cc<span className="text-violet-400">rank</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
            How it works
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${(session.user as Record<string, unknown>).username}`}
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>{(session.user as Record<string, unknown>).username as string}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('github')}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
