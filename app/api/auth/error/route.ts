import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const error = req.nextUrl.searchParams.get('error') || 'Unknown'
  return NextResponse.json({
    error,
    message: `Auth error: ${error}`,
    hint: 'Check Vercel function logs for details',
  })
}
