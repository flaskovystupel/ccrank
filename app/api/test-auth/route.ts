import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simulate what signIn callback does
    const githubId = '265927576'
    const username = 'flaskovystupel'

    // Step 1: Delete demo user with same username but different githubId
    const deleted = await prisma.user.deleteMany({
      where: {
        username,
        githubId: { not: githubId },
      },
    })

    // Step 2: Upsert
    const user = await prisma.user.upsert({
      where: { githubId },
      update: {
        username,
        name: 'Marek',
        email: 'test@test.com',
        avatarUrl: null,
        bio: null,
      },
      create: {
        githubId,
        username,
        name: 'Marek',
        email: 'test@test.com',
        avatarUrl: null,
        bio: null,
      },
    })

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      user: { id: user.id, username: user.username, githubId: user.githubId },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 })
  }
}
