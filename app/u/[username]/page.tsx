'use client'

import { useEffect, useState, use } from 'react'
import { SessionProvider } from '@/components/session-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Crown, Gem, Sparkles, GitCommit, Zap, Target, Flame, Calendar, Code, Layers } from 'lucide-react'

const TIER_CONFIG: Record<string, { label: string; color: string; gradient: string; icon: typeof Crown }> = {
  LEGENDARY: { label: 'Legendary', color: 'text-orange-400', gradient: 'from-red-500 via-orange-500 to-yellow-500', icon: Crown },
  DIAMOND:   { label: 'Diamond',   color: 'text-cyan-400',   gradient: 'from-cyan-400 via-blue-400 to-purple-400', icon: Gem },
  PLATINUM:  { label: 'Platinum',  color: 'text-blue-300',   gradient: 'from-slate-300 via-blue-200 to-slate-300',  icon: Sparkles },
  GOLD:      { label: 'Gold',      color: 'text-yellow-400', gradient: 'from-yellow-400 via-amber-400 to-yellow-500', icon: Crown },
  SILVER:    { label: 'Silver',    color: 'text-zinc-300',   gradient: 'from-gray-300 via-gray-400 to-gray-300',    icon: Crown },
  BRONZE:    { label: 'Bronze',    color: 'text-orange-700', gradient: 'from-orange-700 via-amber-700 to-orange-800', icon: Crown },
}

interface UserProfile {
  username: string
  name: string | null
  avatarUrl: string | null
  bio: string | null
  scores: Array<{
    period: string
    overallScore: number
    velocityScore: number
    efficiencyScore: number
    impactScore: number
    consistencyScore: number
    rank: number
    percentile: number
    tier: string
  }>
  recentSubmissions: Array<{
    totalCommits: number
    totalLinesAdded: number
    totalFilesCreated: number
    totalRepos: number
    activeDays: number
    streakDays: number
    languages: string[]
    period: string
    submittedAt: string
  }>
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState('DAYS_30')

  useEffect(() => {
    fetch(`/api/user/${username}`)
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [username])

  const activeScore = user?.scores.find(s => s.period === activePeriod) || user?.scores[0]
  const latestSubmission = user?.recentSubmissions[0]
  const tierConfig = activeScore ? TIER_CONFIG[activeScore.tier] || TIER_CONFIG.BRONZE : TIER_CONFIG.BRONZE

  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-24 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : !user ? (
          <div className="py-32 text-center">
            <h2 className="text-2xl font-bold">User not found</h2>
            <p className="mt-2 text-zinc-400">@{username} hasn&apos;t submitted yet.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl px-6">
            {/* Profile header */}
            <div className="flex items-start gap-6 mb-10">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-2xl" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800 text-2xl font-bold text-zinc-400">
                  {username[0].toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{user.name || username}</h1>
                <p className="text-zinc-400">@{username}</p>
                {user.bio && <p className="mt-2 text-sm text-zinc-500">{user.bio}</p>}
              </div>
            </div>

            {/* Period selector */}
            <div className="mb-8 flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1 w-fit">
              {[
                { value: 'DAYS_7', label: '7 days' },
                { value: 'DAYS_30', label: '30 days' },
                { value: 'ALL_TIME', label: 'All time' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => setActivePeriod(p.value)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activePeriod === p.value
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {activeScore ? (
              <>
                {/* Score card */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 mb-8">
                  <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-500/5 blur-[60px]" />

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Overall Score</div>
                      <div className="text-5xl font-extrabold">{activeScore.overallScore}</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 text-2xl font-bold ${tierConfig.color}`}>
                        <tierConfig.icon className="h-7 w-7" />
                        {tierConfig.label}
                      </div>
                      <div className="text-sm text-zinc-500 mt-1">
                        Top {(100 - activeScore.percentile).toFixed(1)}% &middot; Rank #{activeScore.rank}
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Velocity', value: activeScore.velocityScore, icon: GitCommit, color: 'text-green-400', bg: 'bg-green-500' },
                      { label: 'Efficiency', value: activeScore.efficiencyScore, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500' },
                      { label: 'Impact', value: activeScore.impactScore, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500' },
                      { label: 'Consistency', value: activeScore.consistencyScore, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500' },
                    ].map(metric => (
                      <div key={metric.label} className="rounded-xl border border-zinc-800/50 bg-black/30 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <metric.icon className={`h-4 w-4 ${metric.color}`} />
                          <span className="text-xs text-zinc-400">{metric.label}</span>
                        </div>
                        <div className="text-2xl font-bold mb-2">{metric.value}</div>
                        <div className="h-1.5 rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${metric.bg} transition-all duration-700`}
                            style={{ width: `${(metric.value / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats from latest submission */}
                {latestSubmission && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Commits', value: latestSubmission.totalCommits, icon: GitCommit },
                      { label: 'Lines added', value: latestSubmission.totalLinesAdded.toLocaleString(), icon: Code },
                      { label: 'Files created', value: latestSubmission.totalFilesCreated, icon: Layers },
                      { label: 'Repos', value: latestSubmission.totalRepos, icon: Layers },
                      { label: 'Active days', value: latestSubmission.activeDays, icon: Calendar },
                      { label: 'Streak', value: `${latestSubmission.streakDays}d`, icon: Flame },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
                        <stat.icon className="mx-auto h-4 w-4 text-zinc-500 mb-2" />
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-zinc-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Languages */}
                {latestSubmission?.languages && latestSubmission.languages.length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs text-zinc-500 mb-2">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {latestSubmission.languages.map(lang => (
                        <span key={lang} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center rounded-xl border border-zinc-800/50 bg-zinc-900/30">
                <p className="text-zinc-500">No scores for this period yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </SessionProvider>
  )
}
