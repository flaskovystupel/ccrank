import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ccrank — Claude Code Developer Leaderboard',
  description: 'Ranked by what you BUILD, not what you spend. The first AI coding leaderboard that measures real developer output.',
  openGraph: {
    title: 'ccrank — Claude Code Developer Leaderboard',
    description: 'Ranked by what you BUILD, not what you spend.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ccrank — Claude Code Developer Leaderboard',
    description: 'Ranked by what you BUILD, not what you spend.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
