import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_USERS = [
  {
    githubId: '1001',
    username: 'flaskovystupel',
    name: 'Marek',
    avatarUrl: null,
    bio: 'Building EntityPRO — Fansly agency CRM',
    scores: { velocity: 250, efficiency: 1000, impact: 949, consistency: 90, overall: 618, tier: 'GOLD', percentile: 78 },
    submission: { commits: 15, linesAdded: 37753, linesRemoved: 351, filesChanged: 85, filesCreated: 72, repos: 2, activeDays: 5, streakDays: 3, languages: ['TypeScript', 'CSS', 'Prisma', 'JavaScript'] },
  },
  {
    githubId: '1002',
    username: 'ai-speed-demon',
    name: 'Sarah K.',
    avatarUrl: null,
    bio: 'Full-stack dev, AI enthusiast',
    scores: { velocity: 600, efficiency: 750, impact: 820, consistency: 900, overall: 762, tier: 'PLATINUM', percentile: 89 },
    submission: { commits: 120, linesAdded: 45000, linesRemoved: 12000, filesChanged: 200, filesCreated: 80, repos: 5, activeDays: 25, streakDays: 18, languages: ['TypeScript', 'Python', 'Go', 'SQL'] },
  },
  {
    githubId: '1003',
    username: 'code-factory-42',
    name: 'Tomasz R.',
    avatarUrl: null,
    bio: 'Shipping features at lightspeed',
    scores: { velocity: 900, efficiency: 850, impact: 950, consistency: 950, overall: 909, tier: 'DIAMOND', percentile: 96 },
    submission: { commits: 250, linesAdded: 89000, linesRemoved: 15000, filesChanged: 400, filesCreated: 150, repos: 8, activeDays: 28, streakDays: 28, languages: ['Rust', 'TypeScript', 'Python', 'Go', 'SQL', 'Shell'] },
  },
  {
    githubId: '1004',
    username: 'legendary-builder',
    name: 'Yuki M.',
    avatarUrl: null,
    bio: 'Top 1% developer. Zero wasted tokens.',
    scores: { velocity: 950, efficiency: 980, impact: 970, consistency: 980, overall: 972, tier: 'LEGENDARY', percentile: 99.5 },
    submission: { commits: 300, linesAdded: 120000, linesRemoved: 25000, filesChanged: 500, filesCreated: 200, repos: 12, activeDays: 30, streakDays: 30, languages: ['TypeScript', 'Rust', 'Python', 'Go', 'C++', 'SQL', 'Shell', 'Zig'] },
  },
  {
    githubId: '1005',
    username: 'chill-coder',
    name: 'Alex P.',
    avatarUrl: null,
    bio: 'Weekend warrior',
    scores: { velocity: 100, efficiency: 400, impact: 200, consistency: 50, overall: 210, tier: 'BRONZE', percentile: 25 },
    submission: { commits: 8, linesAdded: 2000, linesRemoved: 500, filesChanged: 15, filesCreated: 5, repos: 1, activeDays: 4, streakDays: 1, languages: ['JavaScript', 'CSS'] },
  },
  {
    githubId: '1006',
    username: 'silver-shipper',
    name: 'Maria L.',
    avatarUrl: null,
    bio: 'Consistent builder',
    scores: { velocity: 300, efficiency: 500, impact: 400, consistency: 600, overall: 447, tier: 'SILVER', percentile: 55 },
    submission: { commits: 40, linesAdded: 12000, linesRemoved: 3000, filesChanged: 60, filesCreated: 20, repos: 3, activeDays: 15, streakDays: 7, languages: ['Python', 'TypeScript', 'SQL'] },
  },
  {
    githubId: '1007',
    username: 'gold-grinder',
    name: 'David C.',
    avatarUrl: null,
    bio: 'SaaS builder, indie hacker',
    scores: { velocity: 500, efficiency: 650, impact: 700, consistency: 750, overall: 652, tier: 'GOLD', percentile: 75 },
    submission: { commits: 80, linesAdded: 30000, linesRemoved: 8000, filesChanged: 120, filesCreated: 45, repos: 4, activeDays: 20, streakDays: 12, languages: ['TypeScript', 'JavaScript', 'CSS', 'SQL'] },
  },
  {
    githubId: '1008',
    username: 'diamond-dev',
    name: 'Chen W.',
    avatarUrl: null,
    bio: 'Open source contributor, 10x engineer',
    scores: { velocity: 800, efficiency: 900, impact: 880, consistency: 850, overall: 862, tier: 'DIAMOND', percentile: 95 },
    submission: { commits: 180, linesAdded: 75000, linesRemoved: 20000, filesChanged: 350, filesCreated: 130, repos: 10, activeDays: 27, streakDays: 25, languages: ['TypeScript', 'Rust', 'Go', 'Python', 'SQL'] },
  },
]

async function seed() {
  console.log('Seeding database...')

  for (const u of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        githubId: u.githubId,
        username: u.username,
        name: u.name,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      },
    })

    await prisma.submission.create({
      data: {
        userId: user.id,
        totalTokensIn: BigInt(5000000),
        totalTokensOut: BigInt(2000000),
        totalCacheTokens: BigInt(1000000),
        totalConversations: 50,
        totalCost: 45.0,
        totalCommits: u.submission.commits,
        totalLinesAdded: u.submission.linesAdded,
        totalLinesRemoved: u.submission.linesRemoved,
        totalFilesChanged: u.submission.filesChanged,
        totalFilesCreated: u.submission.filesCreated,
        totalRepos: u.submission.repos,
        activeDays: u.submission.activeDays,
        streakDays: u.submission.streakDays,
        languages: u.submission.languages,
        periodStart: new Date(Date.now() - 30 * 86400000),
        periodEnd: new Date(),
        period: 'DAYS_30',
      },
    })

    await prisma.score.create({
      data: {
        userId: user.id,
        period: 'DAYS_30',
        velocityScore: u.scores.velocity,
        efficiencyScore: u.scores.efficiency,
        impactScore: u.scores.impact,
        consistencyScore: u.scores.consistency,
        overallScore: u.scores.overall,
        rank: 0,
        percentile: u.scores.percentile,
        tier: u.scores.tier,
      },
    })

    console.log(`  ✓ ${u.username} (${u.scores.tier}) — ${u.scores.overall}/1000`)
  }

  // Update ranks
  const scores = await prisma.score.findMany({
    where: { period: 'DAYS_30' },
    orderBy: { overallScore: 'desc' },
  })

  for (let i = 0; i < scores.length; i++) {
    await prisma.score.update({
      where: { id: scores[i].id },
      data: { rank: i + 1 },
    })
  }

  console.log(`\nSeeded ${DEMO_USERS.length} users with scores and rankings.`)
}

seed()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
