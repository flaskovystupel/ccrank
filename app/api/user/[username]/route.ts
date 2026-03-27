import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      scores: {
        orderBy: { calculatedAt: 'desc' },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const serialized = {
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    scores: user.scores.map(s => ({
      period: s.period,
      overallScore: s.overallScore,
      velocityScore: s.velocityScore,
      efficiencyScore: s.efficiencyScore,
      impactScore: s.impactScore,
      consistencyScore: s.consistencyScore,
      rank: s.rank,
      percentile: s.percentile,
      tier: s.tier,
      calculatedAt: s.calculatedAt,
    })),
    recentSubmissions: user.submissions.map(s => ({
      totalCommits: s.totalCommits,
      totalLinesAdded: s.totalLinesAdded,
      totalFilesCreated: s.totalFilesCreated,
      totalRepos: s.totalRepos,
      activeDays: s.activeDays,
      streakDays: s.streakDays,
      languages: s.languages,
      period: s.period,
      submittedAt: s.submittedAt,
    })),
  }

  return NextResponse.json(serialized)
}
