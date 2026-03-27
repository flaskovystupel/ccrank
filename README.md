# ccrank — Claude Code Developer Leaderboard

**Ranked by what you BUILD, not what you spend.**

Other leaderboards rank you by token consumption. ccrank measures your **real developer output** — commits shipped, lines of code, efficiency per token, consistency — and ranks you against every Claude Code developer on the planet.

## Quick Start

```bash
npx ccrank
```

That's it. The CLI:
1. Scans your git repos for commits, lines, files created
2. Reads Claude Code usage data from `~/.claude/`
3. Calculates your score across 4 dimensions
4. Submits to the global leaderboard

## The Score

Your score (0-1000) is based on:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| **Velocity** | 25% | Commits shipped per active day |
| **Efficiency** | 30% | Lines of code per token consumed |
| **Impact** | 25% | Scope: files created, repos, languages |
| **Consistency** | 20% | Active coding days + streak |

**Efficiency is weighted highest** — we reward developers who get MORE done with LESS tokens.

## Tiers

| Tier | Percentile |
|------|-----------|
| Legendary | Top 1% |
| Diamond | Top 5% |
| Platinum | Top 15% |
| Gold | Top 30% |
| Silver | Top 60% |
| Bronze | Everyone else |

## CLI Options

```bash
npx ccrank                    # Analyze last 30 days (default)
npx ccrank --period 7         # Last 7 days
npx ccrank --period all       # All time
npx ccrank --dry-run          # Calculate score without submitting
npx ccrank --repos ~/projects # Scan specific directory
npx ccrank --verbose          # Show debug info
```

## Self-hosting

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in:
   - PostgreSQL connection string (Neon free tier works great)
   - GitHub OAuth app credentials
   - NextAuth secret
3. Run:
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```

## How it's different from Viberank / CCgather

| | ccrank | Viberank | CCgather |
|---|---|---|---|
| Measures | **What you built** | Tokens spent | Tokens spent |
| Score based on | Commits, lines, efficiency | Token count | Token count |
| Rewards | Efficiency (less tokens = better) | More spending | More spending |
| Git analysis | Yes | No | No |

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth v5 with GitHub OAuth
- **CLI**: Pure Node.js, zero dependencies

## License

MIT
