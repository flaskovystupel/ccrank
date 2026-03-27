import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateScore, getTier, type RawStats } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    // API key = "github:<username>:<github_id>"
    const parts = apiKey.split(':')
    if (parts.length !== 3 || parts[0] !== 'github') {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 })
    }

    const [, username, githubId] = parts

    // Find or create user
    let user = await prisma.user.findUnique({ where: { githubId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId,
          username,
        },
      })
    }

    const body = await req.json()
    const stats: RawStats = {
      totalTokensIn: body.totalTokensIn || 0,
      totalTokensOut: body.totalTokensOut || 0,
      totalCacheTokens: body.totalCacheTokens || 0,
      totalConversations: body.totalConversations || 0,
      totalCost: body.totalCost || 0,
      totalCommits: body.totalCommits || 0,
      totalLinesAdded: body.totalLinesAdded || 0,
      totalLinesRemoved: body.totalLinesRemoved || 0,
      totalFilesChanged: body.totalFilesChanged || 0,
      totalFilesCreated: body.totalFilesCreated || 0,
      totalRepos: body.totalRepos || 0,
      activeDays: body.activeDays || 0,
      streakDays: body.streakDays || 0,
      languages: body.languages || [],
      periodDays: body.periodDays || 30,
    }

    const period = stats.periodDays <= 7 ? 'DAYS_7' : stats.periodDays <= 30 ? 'DAYS_30' : 'ALL_TIME'

    // Save submission
    await prisma.submission.create({
      data: {
        userId: user.id,
        totalTokensIn: BigInt(stats.totalTokensIn),
        totalTokensOut: BigInt(stats.totalTokensOut),
        totalCacheTokens: BigInt(stats.totalCacheTokens),
        totalConversations: stats.totalConversations,
        totalCost: stats.totalCost,
        totalCommits: stats.totalCommits,
        totalLinesAdded: stats.totalLinesAdded,
        totalLinesRemoved: stats.totalLinesRemoved,
        totalFilesChanged: stats.totalFilesChanged,
        totalFilesCreated: stats.totalFilesCreated,
        totalRepos: stats.totalRepos,
        activeDays: stats.activeDays,
        streakDays: stats.streakDays,
        languages: stats.languages,
        periodStart: new Date(body.periodStart || Date.now() - stats.periodDays * 86400000),
        periodEnd: new Date(body.periodEnd || Date.now()),
        period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME',
      },
    })

    // Calculate score
    const scores = calculateScore(stats)

    // Get total users for percentile
    const totalUsers = await prisma.score.count({ where: { period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME' } })
    const usersBelow = await prisma.score.count({
      where: {
        period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME',
        overallScore: { lt: scores.overallScore },
      },
    })
    const percentile = totalUsers > 0 ? Math.round((usersBelow / totalUsers) * 100 * 10) / 10 : 50
    const tier = getTier(percentile)

    // Upsert score
    const rank = await prisma.score.count({
      where: {
        period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME',
        overallScore: { gt: scores.overallScore },
      },
    }) + 1

    const score = await prisma.score.upsert({
      where: {
        userId_period: {
          userId: user.id,
          period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME',
        },
      },
      update: {
        ...scores,
        rank,
        percentile,
        tier,
        calculatedAt: new Date(),
      },
      create: {
        userId: user.id,
        period: period as 'DAYS_7' | 'DAYS_30' | 'ALL_TIME',
        ...scores,
        rank,
        percentile,
        tier,
      },
    })

    return NextResponse.json({
      success: true,
      username: user.username,
      score: {
        overall: scores.overallScore,
        velocity: scores.velocityScore,
        efficiency: scores.efficiencyScore,
        impact: scores.impactScore,
        consistency: scores.consistencyScore,
      },
      rank,
      percentile,
      tier,
      totalPlayers: totalUsers + 1,
      profileUrl: `${req.nextUrl.origin}/u/${user.username}`,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
