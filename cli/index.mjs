#!/usr/bin/env node

/**
 * ccrank CLI — Analyze your Claude Code + git output and submit to the leaderboard
 *
 * Usage:
 *   npx ccrank                    # Analyze & submit (30 days)
 *   npx ccrank --period 7         # Last 7 days
 *   npx ccrank --period all       # All time
 *   npx ccrank --dry-run          # Analyze only, don't submit
 *   npx ccrank --repos ~/projects # Scan specific directory for repos
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve, basename } from 'path'
import { homedir } from 'os'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const API_URL = process.env.CCRANK_API_URL || 'https://ccrank-five.vercel.app'
const CLAUDE_DIR = join(homedir(), '.claude')
const args = process.argv.slice(2)

const periodArg = getArg('--period') || '30'
const periodDays = periodArg === 'all' ? 365 * 5 : parseInt(periodArg) || 30
const dryRun = args.includes('--dry-run')
const reposDir = getArg('--repos') || null
const verbose = args.includes('--verbose') || args.includes('-v')

// ─── COLORS ───────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  bgPurple: '\x1b[45m',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getArg(name) {
  const idx = args.indexOf(name)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null
}

function exec(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  } catch {
    return ''
  }
}

function log(msg) { console.log(msg) }
function logSection(title) { log(`\n${c.purple}${c.bold}  ${title}${c.reset}`) }

// ─── BANNER ───────────────────────────────────────────────────────────────────

function printBanner() {
  log('')
  log(`${c.purple}${c.bold}   ██████╗ ██████╗██████╗  █████╗ ███╗   ██╗██╗  ██╗${c.reset}`)
  log(`${c.purple}   ██╔════╝██╔════╝██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝${c.reset}`)
  log(`${c.purple}   ██║     ██║     ██████╔╝███████║██╔██╗ ██║█████╔╝ ${c.reset}`)
  log(`${c.purple}   ██║     ██║     ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ ${c.reset}`)
  log(`${c.purple}   ╚██████╗╚██████╗██║  ██║██║  ██║██║ ╚████║██║  ██╗${c.reset}`)
  log(`${c.purple}    ╚═════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝${c.reset}`)
  log(`${c.gray}   Ranked by output, not by spend.${c.reset}`)
  log('')
}

// ─── GIT ANALYSIS ─────────────────────────────────────────────────────────────

function findGitRepos(dir) {
  const repos = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue
      const full = join(dir, entry)
      try {
        if (statSync(full).isDirectory()) {
          if (existsSync(join(full, '.git'))) {
            repos.push(full)
          }
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return repos
}

function analyzeGitRepo(repoPath, since) {
  const sinceStr = since.toISOString().split('T')[0]
  const authorEmail = exec('git config user.email', repoPath) || exec('git config --global user.email')

  // If no email, try to get it from the most recent commit
  const fallbackEmail = !authorEmail ? exec('git log -1 --format="%ae"', repoPath) : ''
  const email = authorEmail || fallbackEmail

  // If still no email, skip author filter (count all commits)
  const authorFilter = email ? `--author=${email}` : ''
  const sinceFilter = `--since=${sinceStr}`

  // Commit count
  const commitLog = exec(`git log ${authorFilter} ${sinceFilter} --oneline`, repoPath)
  const commits = commitLog ? commitLog.split('\n').filter(Boolean).length : 0
  if (commits === 0) return null

  // Lines added/removed
  const diffStat = exec(`git log ${authorFilter} ${sinceFilter} --numstat --format=""`, repoPath)
  let linesAdded = 0
  let linesRemoved = 0
  let filesChanged = new Set()

  for (const line of diffStat.split('\n').filter(Boolean)) {
    const [added, removed, file] = line.split('\t')
    if (added === '-' || !file) continue // binary
    linesAdded += parseInt(added) || 0
    linesRemoved += parseInt(removed) || 0
    filesChanged.add(file)
  }

  // Files created (new files in this period)
  const newFiles = exec(`git log ${authorFilter} ${sinceFilter} --diff-filter=A --name-only --format=""`, repoPath)
  const filesCreated = newFiles ? new Set(newFiles.split('\n').filter(Boolean)).size : 0

  // Active days
  const dates = exec(`git log ${authorFilter} ${sinceFilter} --format="%ad" --date=short`, repoPath)
  const uniqueDays = new Set(dates.split('\n').filter(Boolean))

  // Languages (from file extensions)
  const extMap = { '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript',
    '.py': 'Python', '.rs': 'Rust', '.go': 'Go', '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP',
    '.c': 'C', '.cpp': 'C++', '.cs': 'C#', '.swift': 'Swift', '.kt': 'Kotlin', '.dart': 'Dart',
    '.vue': 'Vue', '.svelte': 'Svelte', '.css': 'CSS', '.scss': 'SCSS', '.html': 'HTML',
    '.sql': 'SQL', '.sh': 'Shell', '.lua': 'Lua', '.zig': 'Zig', '.ex': 'Elixir', '.prisma': 'Prisma' }

  const languages = new Set()
  for (const file of filesChanged) {
    const ext = '.' + file.split('.').pop()
    if (extMap[ext]) languages.add(extMap[ext])
  }

  return {
    name: basename(repoPath),
    commits,
    linesAdded,
    linesRemoved,
    filesChanged: filesChanged.size,
    filesCreated,
    activeDays: uniqueDays,
    languages,
  }
}

function calculateStreak(allActiveDays) {
  const sortedDays = [...allActiveDays].sort().reverse()
  if (sortedDays.length === 0) return 0

  let streak = 1
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Start from today or yesterday
  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1])
    const curr = new Date(sortedDays[i])
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000
    if (diffDays <= 1.5) streak++
    else break
  }

  return streak
}

// ─── CLAUDE CODE ANALYSIS ─────────────────────────────────────────────────────

function analyzeClaudeCode() {
  const stats = { totalTokensIn: 0, totalTokensOut: 0, totalCacheTokens: 0, totalConversations: 0, totalCost: 0 }

  // Try to read Claude Code usage data
  const statsigDir = join(CLAUDE_DIR, 'statsig')
  if (existsSync(statsigDir)) {
    try {
      const files = readdirSync(statsigDir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        try {
          const data = JSON.parse(readFileSync(join(statsigDir, file), 'utf-8'))
          // Parse statsig events for token usage
          if (data?.events) {
            for (const event of data.events) {
              if (event?.metadata?.input_tokens) stats.totalTokensIn += parseInt(event.metadata.input_tokens) || 0
              if (event?.metadata?.output_tokens) stats.totalTokensOut += parseInt(event.metadata.output_tokens) || 0
              if (event?.metadata?.cache_read_tokens) stats.totalCacheTokens += parseInt(event.metadata.cache_read_tokens) || 0
            }
          }
        } catch { /* skip bad files */ }
      }
    } catch { /* skip */ }
  }

  // Try projects dir for conversation count
  const projectsDir = join(CLAUDE_DIR, 'projects')
  if (existsSync(projectsDir)) {
    try {
      const projects = readdirSync(projectsDir)
      for (const project of projects) {
        const projPath = join(projectsDir, project)
        try {
          if (!statSync(projPath).isDirectory()) continue
          const files = readdirSync(projPath).filter(f => f.endsWith('.jsonl'))
          stats.totalConversations += files.length
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }

  // Estimate cost (rough: $3 per 1M input, $15 per 1M output for Opus)
  stats.totalCost = (stats.totalTokensIn / 1_000_000) * 3 + (stats.totalTokensOut / 1_000_000) * 15

  return stats
}

// ─── GITHUB IDENTITY ──────────────────────────────────────────────────────────

function getGitHubIdentity() {
  // Try gh cli first
  const ghUser = exec('gh api user --jq ".login"')
  const ghId = exec('gh api user --jq ".id"')
  if (ghUser && ghId) return { username: ghUser, id: String(ghId) }

  // Fallback to git config
  const name = exec('git config --global user.name') || 'anonymous'
  const email = exec('git config --global user.email') || 'unknown'
  // Create a pseudo-ID from email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0
  }
  return { username: name.replace(/\s+/g, '-').toLowerCase(), id: String(Math.abs(hash)) }
}

// ─── SCORE DISPLAY ────────────────────────────────────────────────────────────

function getScoreBar(value, max = 1000, width = 20) {
  const filled = Math.round((value / max) * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return bar
}

function getTierDisplay(tier) {
  const tiers = {
    LEGENDARY: `${c.red}${c.bold}★ LEGENDARY${c.reset}`,
    DIAMOND:   `${c.cyan}${c.bold}◆ DIAMOND${c.reset}`,
    PLATINUM:  `${c.blue}${c.bold}◇ PLATINUM${c.reset}`,
    GOLD:      `${c.yellow}${c.bold}● GOLD${c.reset}`,
    SILVER:    `${c.white}○ SILVER${c.reset}`,
    BRONZE:    `${c.gray}○ BRONZE${c.reset}`,
  }
  return tiers[tier] || tier
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  printBanner()

  const since = new Date(Date.now() - periodDays * 86400000)
  const periodLabel = periodDays >= 1825 ? 'all time' : `last ${periodDays} days`

  log(`${c.gray}  Analyzing ${periodLabel}...${c.reset}`)

  // ── Step 1: Find Git repos ──
  logSection('Git Repositories')

  const searchDirs = reposDir ? [resolve(reposDir)] : [
    homedir(),
    join(homedir(), 'Desktop'),
    join(homedir(), 'Documents'),
    join(homedir(), 'Projects'),
    join(homedir(), 'projects'),
    join(homedir(), 'dev'),
    join(homedir(), 'code'),
    join(homedir(), 'src'),
    join(homedir(), 'repos'),
    join(homedir(), 'workspace'),
    join(homedir(), 'work'),
  ]

  const allRepos = new Set()
  for (const dir of searchDirs) {
    if (existsSync(dir)) {
      for (const repo of findGitRepos(dir)) {
        allRepos.add(repo)
      }
    }
  }

  // Also check if current directory is a repo
  if (existsSync(join(process.cwd(), '.git'))) {
    allRepos.add(process.cwd())
  }

  let totalCommits = 0
  let totalLinesAdded = 0
  let totalLinesRemoved = 0
  let totalFilesChanged = 0
  let totalFilesCreated = 0
  let allActiveDays = new Set()
  let allLanguages = new Set()
  let repoCount = 0

  for (const repoPath of allRepos) {
    const result = analyzeGitRepo(repoPath, since)
    if (!result) continue

    repoCount++
    totalCommits += result.commits
    totalLinesAdded += result.linesAdded
    totalLinesRemoved += result.linesRemoved
    totalFilesChanged += result.filesChanged
    totalFilesCreated += result.filesCreated
    for (const day of result.activeDays) allActiveDays.add(day)
    for (const lang of result.languages) allLanguages.add(lang)

    log(`  ${c.green}✓${c.reset} ${c.bold}${result.name}${c.reset} ${c.gray}— ${result.commits} commits, +${result.linesAdded}/-${result.linesRemoved} lines${c.reset}`)
  }

  if (repoCount === 0) {
    log(`  ${c.yellow}⚠${c.reset} No git repos with commits found in ${periodLabel}`)
  }

  const streakDays = calculateStreak(allActiveDays)

  // ── Step 2: Claude Code stats ──
  logSection('Claude Code Usage')

  const claudeStats = analyzeClaudeCode()

  if (claudeStats.totalConversations > 0) {
    log(`  ${c.cyan}Sessions:${c.reset}   ${claudeStats.totalConversations}`)
    if (claudeStats.totalTokensIn > 0) {
      log(`  ${c.cyan}Tokens in:${c.reset}  ${(claudeStats.totalTokensIn / 1_000_000).toFixed(1)}M`)
      log(`  ${c.cyan}Tokens out:${c.reset} ${(claudeStats.totalTokensOut / 1_000_000).toFixed(1)}M`)
      log(`  ${c.cyan}Est. cost:${c.reset}  $${claudeStats.totalCost.toFixed(2)}`)
    }
  } else {
    log(`  ${c.gray}No Claude Code data found in ~/.claude${c.reset}`)
  }

  // ── Step 3: Calculate score ──
  logSection('Score Calculation')

  const stats = {
    ...claudeStats,
    totalCommits,
    totalLinesAdded,
    totalLinesRemoved,
    totalFilesChanged,
    totalFilesCreated,
    totalRepos: repoCount,
    activeDays: allActiveDays.size,
    streakDays,
    languages: [...allLanguages],
    periodDays,
  }

  // Calculate locally (same algorithm as server)
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
  const normalize = (v, max) => clamp(Math.round((v / max) * 1000), 0, 1000)

  const velocityScore = stats.activeDays > 0 ? normalize(stats.totalCommits / stats.activeDays, 20) : 0

  let efficiencyScore
  const totalTokens = stats.totalTokensIn + stats.totalTokensOut
  if (totalTokens > 0) {
    efficiencyScore = normalize(stats.totalLinesAdded / totalTokens, 0.05)
  } else {
    efficiencyScore = normalize(stats.totalLinesAdded / Math.max(stats.periodDays, 1), 500)
  }

  const impactPoints = stats.totalFilesCreated * 50 + stats.totalFilesChanged * 10 +
    stats.totalLinesAdded * 0.5 + stats.totalLinesRemoved * 0.2 +
    stats.totalRepos * 100 + stats.languages.length * 30
  const impactScore = normalize(impactPoints / Math.max(stats.periodDays, 1), 1000)

  let consistencyScore = 0
  if (stats.periodDays > 0) {
    const ratio = stats.activeDays / stats.periodDays
    const streakBonus = Math.min(stats.streakDays / stats.periodDays, 1)
    consistencyScore = clamp(Math.round(ratio * 700 + streakBonus * 300), 0, 1000)
  }

  const overallScore = Math.round(
    velocityScore * 0.25 + efficiencyScore * 0.30 + impactScore * 0.25 + consistencyScore * 0.20
  )

  log('')
  log(`  ${c.green}Velocity${c.reset}     ${getScoreBar(velocityScore)}  ${c.bold}${velocityScore}${c.reset}`)
  log(`  ${c.blue}Efficiency${c.reset}   ${getScoreBar(efficiencyScore)}  ${c.bold}${efficiencyScore}${c.reset}`)
  log(`  ${c.purple}Impact${c.reset}       ${getScoreBar(impactScore)}  ${c.bold}${impactScore}${c.reset}`)
  log(`  ${c.yellow}Consistency${c.reset}  ${getScoreBar(consistencyScore)}  ${c.bold}${consistencyScore}${c.reset}`)
  log('')
  log(`  ${c.bold}${c.white}Overall:     ${overallScore} / 1000${c.reset}`)

  // ── Step 4: Submit ──
  if (dryRun) {
    log(`\n${c.yellow}  --dry-run: Skipping submission${c.reset}`)
    log('')
    return
  }

  logSection('Submitting to Leaderboard')

  const identity = getGitHubIdentity()
  log(`  ${c.gray}User: ${identity.username} (${identity.id})${c.reset}`)

  try {
    const response = await fetch(`${API_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer github:${identity.username}:${identity.id}`,
      },
      body: JSON.stringify({
        ...stats,
        periodStart: since.toISOString(),
        periodEnd: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    const result = await response.json()

    log('')
    log(`  ${c.green}${c.bold}✓ Submitted successfully!${c.reset}`)
    log('')
    log(`  ${c.bold}${c.white}╔══════════════════════════════════════╗${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}                                      ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}   Score: ${c.bold}${c.purple}${result.score.overall}${c.reset} / 1000                  ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}   Rank:  ${c.bold}#${result.rank}${c.reset} of ${result.totalPlayers}                   ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}   Top:   ${c.bold}${(100 - result.percentile).toFixed(1)}%${c.reset}                         ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}   Tier:  ${getTierDisplay(result.tier)}                     ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}║${c.reset}                                      ${c.bold}${c.white}║${c.reset}`)
    log(`  ${c.bold}${c.white}╚══════════════════════════════════════╝${c.reset}`)
    log('')
    log(`  ${c.gray}Profile: ${result.profileUrl}${c.reset}`)
    log(`  ${c.gray}Leaderboard: ${API_URL}/leaderboard${c.reset}`)

  } catch (error) {
    log(`  ${c.red}✗ Failed to submit: ${error.message}${c.reset}`)
    log(`  ${c.gray}Score calculated locally: ${overallScore}/1000${c.reset}`)
    log(`  ${c.gray}Run with --dry-run to skip submission${c.reset}`)
  }

  log('')

  // ── Summary stats ──
  log(`${c.gray}  ─────────────────────────────────────${c.reset}`)
  log(`  ${c.gray}${repoCount} repos · ${totalCommits} commits · +${totalLinesAdded.toLocaleString()} lines · ${allActiveDays.size} active days · ${streakDays}d streak${c.reset}`)
  if (allLanguages.size > 0) {
    log(`  ${c.gray}Languages: ${[...allLanguages].join(', ')}${c.reset}`)
  }
  log('')
}

main().catch(e => {
  console.error(`${c.red}Error: ${e.message}${c.reset}`)
  process.exit(1)
})
