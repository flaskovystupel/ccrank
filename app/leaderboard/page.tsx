import { SessionProvider } from '@/components/session-provider'
import { Navbar } from '@/components/navbar'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { Footer } from '@/components/footer'

export default function LeaderboardPage() {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-20">
        <LeaderboardTable limit={50} />
      </main>
      <Footer />
    </SessionProvider>
  )
}
