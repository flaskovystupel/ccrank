'use client'

import { Terminal, GitBranch, BarChart3, Trophy } from 'lucide-react'

const steps = [
  {
    icon: Terminal,
    title: 'Run the CLI',
    desc: 'One command. That\'s it. The CLI scans your Claude Code sessions and git history locally.',
    code: '$ npx ccrank',
  },
  {
    icon: GitBranch,
    title: 'We analyze your output',
    desc: 'Commits, lines shipped, files created, languages used, active days, streaks — all from your local git repos.',
    code: null,
  },
  {
    icon: BarChart3,
    title: 'Score calculated',
    desc: 'Your score is based on 4 dimensions: Velocity, Efficiency, Impact, and Consistency. Not token spend.',
    code: null,
  },
  {
    icon: Trophy,
    title: 'Get your rank',
    desc: 'See your global percentile, tier badge, and how you stack up against other Claude Code developers.',
    code: null,
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold">How it works</h2>
        <p className="mt-3 text-zinc-400">One command. Real scores. No bullshit.</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="relative">
            {i < steps.length - 1 && (
              <div className="absolute top-8 left-full hidden w-full lg:block">
                <div className="h-px w-full bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
            )}
            <div className="group rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 transition-all hover:border-violet-500/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="mb-1 text-xs font-medium text-violet-400">Step {i + 1}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              {step.code && (
                <code className="mt-3 block rounded-lg bg-black/50 px-3 py-2 text-xs text-violet-300 font-mono">
                  {step.code}
                </code>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scoring formula */}
      <div className="mt-16 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8">
        <h3 className="text-xl font-bold mb-6 text-center">The Score Formula</h3>
        <div className="mx-auto max-w-3xl">
          <code className="block rounded-lg bg-black/50 p-6 text-sm leading-loose">
            <span className="text-zinc-500">// Your overall score (0-1000)</span>{'\n'}
            <span className="text-violet-400">overallScore</span> ={'\n'}
            {'  '}<span className="text-green-400">velocity</span>    <span className="text-zinc-500">× 0.25</span>  <span className="text-zinc-600">// commits per active day</span>{'\n'}
            {'  '}<span className="text-blue-400">+ efficiency</span>  <span className="text-zinc-500">× 0.30</span>  <span className="text-zinc-600">// lines shipped per token</span>{'\n'}
            {'  '}<span className="text-purple-400">+ impact</span>     <span className="text-zinc-500">× 0.25</span>  <span className="text-zinc-600">// weighted file & line changes</span>{'\n'}
            {'  '}<span className="text-orange-400">+ consistency</span><span className="text-zinc-500"> × 0.20</span>  <span className="text-zinc-600">// active days + streak bonus</span>
          </code>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Efficiency is weighted highest (30%) — we reward developers who get MORE done with LESS tokens.
        </p>
      </div>
    </section>
  )
}
