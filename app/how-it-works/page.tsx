import { SessionProvider } from '@/components/session-provider'
import { Navbar } from '@/components/navbar'
import { HowItWorks } from '@/components/how-it-works'
import { Footer } from '@/components/footer'

export default function HowItWorksPage() {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-20">
        <HowItWorks />
      </main>
      <Footer />
    </SessionProvider>
  )
}
