export interface RawStats {
  // Claude Code
  totalTokensIn: number
  totalTokensOut: number
  totalCacheTokens: number
  totalConversations: number
  totalCost: number

  // Git
  totalCommits: number
  totalLinesAdded: number
  totalLinesRemoved: number
  totalFilesChanged: number
  totalFilesCreated: number
  totalRepos: number
  activeDays: number
  streakDays: number
  languages: string[]

  // Period
  periodDays: number
}

export interface ScoreBreakdown {
  velocityScore: number
  efficiencyScore: number
  impactScore: number
  consistencyScore: number
  overallScore: number
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const normalize = (v: number, max: number) => clamp(Math.round((v / max) * 1000), 0, 1000)

/**
 * VELOCITY — How fast do you ship?
 * Measures: commits per active day, adjusted for period length
 * Max benchmark: 20 commits/day = 1000
 */
function calcVelocity(s: RawStats): number {
  if (s.activeDays === 0) return 0
  const commitsPerDay = s.totalCommits / s.activeDays
  return normalize(commitsPerDay, 20)
}

/**
 * EFFICIENCY — How much output per token?
 * Measures: (lines of code produced) / (tokens consumed) × normalizer
 * This is what makes ccrank unique — it rewards people who get MORE done with LESS tokens
 * Max benchmark: 0.05 lines per token = 1000
 */
function calcEfficiency(s: RawStats): number {
  const totalTokens = s.totalTokensIn + s.totalTokensOut
  if (totalTokens === 0) {
    // No Claude data — score based on raw output only
    return normalize(s.totalLinesAdded / Math.max(s.periodDays, 1), 500)
  }
  const linesPerToken = s.totalLinesAdded / totalTokens
  return normalize(linesPerToken, 0.05)
}

/**
 * IMPACT — How significant are your changes?
 * Measures: weighted combination of files created, files changed, lines
 * New files are worth 3x modified files (creating > modifying)
 * Max benchmark: 1000 impact points/day = 1000
 */
function calcImpact(s: RawStats): number {
  const impactPoints =
    s.totalFilesCreated * 50 +
    s.totalFilesChanged * 10 +
    s.totalLinesAdded * 0.5 +
    s.totalLinesRemoved * 0.2 +
    s.totalRepos * 100 +
    s.languages.length * 30

  const dailyImpact = impactPoints / Math.max(s.periodDays, 1)
  return normalize(dailyImpact, 1000)
}

/**
 * CONSISTENCY — How regular are your sessions?
 * Measures: active days / total days × streak bonus
 * Max: coding every day with a long streak = 1000
 */
function calcConsistency(s: RawStats): number {
  if (s.periodDays === 0) return 0
  const ratio = s.activeDays / s.periodDays
  const streakBonus = Math.min(s.streakDays / s.periodDays, 1)
  const raw = ratio * 700 + streakBonus * 300
  return clamp(Math.round(raw), 0, 1000)
}

export function calculateScore(stats: RawStats): ScoreBreakdown {
  const velocityScore = calcVelocity(stats)
  const efficiencyScore = calcEfficiency(stats)
  const impactScore = calcImpact(stats)
  const consistencyScore = calcConsistency(stats)

  // Weighted average
  const overallScore = Math.round(
    velocityScore * 0.25 +
    efficiencyScore * 0.30 +
    impactScore * 0.25 +
    consistencyScore * 0.20
  )

  return {
    velocityScore,
    efficiencyScore,
    impactScore,
    consistencyScore,
    overallScore,
  }
}

export type TierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGENDARY'

export function getTier(percentile: number): TierName {
  if (percentile >= 99) return 'LEGENDARY'
  if (percentile >= 95) return 'DIAMOND'
  if (percentile >= 85) return 'PLATINUM'
  if (percentile >= 70) return 'GOLD'
  if (percentile >= 40) return 'SILVER'
  return 'BRONZE'
}

export const TIER_CONFIG: Record<TierName, { label: string; color: string; gradient: string; emoji: string }> = {
  LEGENDARY: { label: 'Legendary', color: '#ff4500', gradient: 'from-red-500 via-orange-500 to-yellow-500', emoji: '🏆' },
  DIAMOND:   { label: 'Diamond',   color: '#00d4ff', gradient: 'from-cyan-400 via-blue-400 to-purple-400', emoji: '💎' },
  PLATINUM:  { label: 'Platinum',  color: '#a8d8ea', gradient: 'from-slate-300 via-blue-200 to-slate-300',  emoji: '⚡' },
  GOLD:      { label: 'Gold',      color: '#ffd700', gradient: 'from-yellow-400 via-amber-400 to-yellow-500', emoji: '🥇' },
  SILVER:    { label: 'Silver',    color: '#c0c0c0', gradient: 'from-gray-300 via-gray-400 to-gray-300',    emoji: '🥈' },
  BRONZE:    { label: 'Bronze',    color: '#cd7f32', gradient: 'from-orange-700 via-amber-700 to-orange-800', emoji: '🥉' },
}
