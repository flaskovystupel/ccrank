'use client'

import { ArrowRight, GitCommit, Zap, Target, Flame } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[80px]" />
        <div className="absolute top-40 right-1/4 h-[250px] w-[250px] rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <div className="slide-up mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Zap className="h-3.5 w-3.5" />
          The first leaderboard that measures what you BUILD
        </div>

        {/* Headline */}
        <h1 className="slide-up slide-up-delay-1 text-5xl font-extrabold tracking-tight sm:text-7xl">
          Ranked by{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            output
          </span>
          <br />
          not by spend.
        </h1>

        {/* Subtitle */}
        <p className="slide-up slide-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
          Other leaderboards rank you by tokens consumed. <strong className="text-zinc-200">ccrank</strong> measures
          your real developer output — commits, lines shipped, code quality, consistency — and
          ranks you against every Claude Code developer on the planet.
        </p>

        {/* CTA */}
        <div className="slide-up slide-up-delay-3 mt-10 flex items-center justify-center gap-4">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 opacity-50 blur transition-opacity group-hover:opacity-100" />
            <code className="relative flex items-center gap-3 rounded-xl bg-[#111113] px-6 py-3.5 font-mono text-sm">
              <span className="text-zinc-500">$</span>
              <span className="text-violet-300">npx ccrank</span>
              <button
                onClick={() => navigator.clipboard?.writeText('npx ccrank')}
                className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
              >
                Copy
              </button>
            </code>
          </div>
        </div>

        {/* What we measure */}
        <div className="slide-up slide-up-delay-4 mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: GitCommit, label: 'Velocity', desc: 'Commits shipped per day' },
            { icon: Zap, label: 'Efficiency', desc: 'Output per token used' },
            { icon: Target, label: 'Impact', desc: 'Scope & complexity' },
            { icon: Flame, label: 'Consistency', desc: 'Active days & streaks' },
          ].map((item) => (
            <div
              key={item.label}
              className="group rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 text-center transition-all hover:border-violet-500/30 hover:bg-zinc-800/50"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
