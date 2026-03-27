import { SessionProvider } from '@/components/session-provider'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { HowItWorks } from '@/components/how-it-works'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <SessionProvider>
      <Navbar />
      <main>
        <Hero />
        <LeaderboardTable limit={10} />
        <HowItWorks />
      </main>
      <Footer />
    </SessionProvider>
  )
}
