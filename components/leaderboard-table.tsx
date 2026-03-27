'use client'

import { useState, useEffect } from 'react'
import { Trophy, ArrowUpRight, Crown, Gem, Sparkles, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const TIER_STYLES: Record<string, { color: string; bg: string; glow: string }> = {
  LEGENDARY: { color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
  DIAMOND:   { color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   glow: 'shadow-cyan-500/20' },
  PLATINUM:  { color: 'text-blue-300',    bg: 'bg-blue-400/10',   glow: 'shadow-blue-400/20' },
  GOLD:      { color: 'text-yellow-400',  bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/20' },
  SILVER:    { color: 'text-zinc-300',    bg: 'bg-zinc-400/10',   glow: 'shadow-zinc-400/20' },
  BRONZE:    { color: 'text-orange-700',  bg: 'bg-orange-800/10', glow: '' },
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  LEGENDARY: <Crown className="h-4 w-4 text-orange-400" />,
  DIAMOND:   <Gem className="h-4 w-4 text-cyan-400" />,
  PLATINUM:  <Sparkles className="h-4 w-4 text-blue-300" />,
}

interface LeaderboardEntry {
  rank: number
  username: string
  name: string | null
  avatarUrl: string | null
  overallScore: number
  velocityScore: number
  efficiencyScore: number
  impactScore: number
  consistencyScore: number
  percentile: number
  tier: string
}

interface Props {
  initialData?: LeaderboardEntry[]
  showTitle?: boolean
  limit?: number
}

export function LeaderboardTable({ initialData, showTitle = true, limit = 50 }: Props) {
  const { data: session } = useSession()
  const currentUsername = (session?.user as Record<string, unknown> | undefined)?.username as string | undefined

  const [period, setPeriod] = useState<'DAYS_7' | 'DAYS_30' | 'ALL_TIME'>('DAYS_30')
  const [data, setData] = useState<LeaderboardEntry[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?period=${period}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        setData(d.leaderboard || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period, limit])

  const filteredData = search
    ? data.filter(e =>
        e.username.toLowerCase().includes(search.toLowerCase()) ||
        (e.name && e.name.toLowerCase().includes(search.toLowerCase()))
      )
    : data

  const myEntry = currentUsername ? data.find(e => e.username === currentUsername) : null

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-lg">🥇</span>
    if (rank === 2) return <span className="text-lg">🥈</span>
    if (rank === 3) return <span className="text-lg">🥉</span>
    return <span className="text-sm text-zinc-500 font-mono">#{rank}</span>
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      {showTitle && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-violet-400" />
            <h2 className="text-2xl font-bold">Global Leaderboard</h2>
            {total > 0 && <span className="text-sm text-zinc-500">{total} developers</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
              {[
                { value: 'DAYS_7' as const, label: '7d' },
                { value: 'DAYS_30' as const, label: '30d' },
                { value: 'ALL_TIME' as const, label: 'All' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    period === p.value
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Your Rank card — shows when logged in and you have a score */}
      {myEntry && (
        <Link href={`/u/${myEntry.username}`} className="mb-6 block">
          <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 transition-all hover:border-violet-500/50">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-violet-500/10 blur-[40px]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-violet-400">#{myEntry.rank}</div>
                <div>
                  <div className="flex items-center gap-2">
                    {myEntry.avatarUrl && <img src={myEntry.avatarUrl} alt="" className="h-6 w-6 rounded-full" />}
                    <span className="font-semibold">{myEntry.username}</span>
                    <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">You</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Top {(100 - myEntry.percentile).toFixed(1)}% · Score {myEntry.overallScore}/1000
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {TIER_ICONS[myEntry.tier]}
                <span className={`text-sm font-medium ${TIER_STYLES[myEntry.tier]?.color || 'text-zinc-400'}`}>
                  {myEntry.tier.charAt(0) + myEntry.tier.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search developer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_100px_100px_120px_80px] gap-2 border-b border-zinc-800/50 px-4 py-3 text-xs font-medium text-zinc-500">
          <div>Rank</div>
          <div>Developer</div>
          <div className="text-center">Overall</div>
          <div className="text-center">Velocity</div>
          <div className="text-center">Efficiency</div>
          <div className="text-center">Impact</div>
          <div className="text-center">Consistency</div>
          <div className="text-center">Tier</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center">
            {search ? (
              <p className="text-zinc-500">No results for &quot;{search}&quot;</p>
            ) : (
              <>
                <p className="text-zinc-500">No entries yet. Be the first!</p>
                <code className="mt-3 inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm text-violet-300">
                  npx ccrank
                </code>
              </>
            )}
          </div>
        ) : (
          filteredData.map((entry, i) => {
            const tierStyle = TIER_STYLES[entry.tier] || TIER_STYLES.BRONZE
            const isTop3 = entry.rank <= 3
            const isMe = entry.username === currentUsername

            return (
              <Link
                key={entry.username}
                href={`/u/${entry.username}`}
                className={`group grid grid-cols-[60px_1fr_100px_100px_100px_100px_120px_80px] gap-2 px-4 py-3 transition-all hover:bg-zinc-800/30 ${
                  isTop3 ? 'bg-zinc-800/10' : ''
                } ${isMe ? 'bg-violet-500/5 border-l-2 border-l-violet-500' : ''} ${
                  i > 0 ? 'border-t border-zinc-800/30' : ''
                }`}
              >
                <div className="flex items-center">{getRankDisplay(entry.rank)}</div>

                <div className="flex items-center gap-3">
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400">
                      {entry.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      {entry.username}
                      {isMe && <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full">You</span>}
                      <ArrowUpRight className="h-3 w-3 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {entry.name && (
                      <div className="text-xs text-zinc-500">{entry.name}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <span className={`text-sm font-bold ${isTop3 ? 'text-violet-400' : ''}`}>
                    {entry.overallScore}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <ScoreBar value={entry.velocityScore} color="bg-green-500" />
                </div>
                <div className="flex items-center justify-center">
                  <ScoreBar value={entry.efficiencyScore} color="bg-blue-500" />
                </div>
                <div className="flex items-center justify-center">
                  <ScoreBar value={entry.impactScore} color="bg-purple-500" />
                </div>
                <div className="flex items-center justify-center">
                  <ScoreBar value={entry.consistencyScore} color="bg-orange-500" />
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  {TIER_ICONS[entry.tier]}
                  <span className={`text-xs font-medium ${tierStyle.color}`}>
                    {entry.tier.charAt(0) + entry.tier.slice(1).toLowerCase()}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  const width = Math.max((value / 1000) * 100, 2)
  return (
    <div className="flex items-center gap-2 w-full max-w-[80px]">
      <div className="relative h-1.5 flex-1 rounded-full bg-zinc-800">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 font-mono w-8 text-right">{value}</span>
    </div>
  )
}
