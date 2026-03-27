import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      users: userCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasGhClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGhClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        ghClientIdLength: process.env.GITHUB_CLIENT_ID?.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
      },
    }, { status: 500 })
  }
}
