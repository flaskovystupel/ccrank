import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') || 'DAYS_30'
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100)

  const validPeriods = ['DAYS_7', 'DAYS_30', 'ALL_TIME']
  if (!validPeriods.includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
  }

  const [scores, total] = await Promise.all([
    prisma.score.findMany({
      where: { period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME' },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { overallScore: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.score.count({
      where: { period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME' },
    }),
  ])

  const leaderboard = scores.map((s, i) => ({
    rank: (page - 1) * limit + i + 1,
    username: s.user.username,
    name: s.user.name,
    avatarUrl: s.user.avatarUrl,
    overallScore: s.overallScore,
    velocityScore: s.velocityScore,
    efficiencyScore: s.efficiencyScore,
    impactScore: s.impactScore,
    consistencyScore: s.consistencyScore,
    percentile: s.percentile,
    tier: s.tier,
  }))

  return NextResponse.json({
    period,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    leaderboard,
  })
}
