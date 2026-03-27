# Community Posts — Copy & Paste

## Reddit r/ClaudeAI

**Title:** I built ccrank — a Claude Code leaderboard that ranks by OUTPUT, not token spend

**Body:**
Every existing Claude Code leaderboard (Viberank, CCgather, etc.) ranks you by how many tokens you consumed. More spending = higher rank. That tells you nothing about actual developer productivity.

So I built **ccrank** — the first leaderboard that measures what you actually BUILD:

- **Velocity** (25%) — commits per active day
- **Efficiency** (30%) — lines of code per token consumed
- **Impact** (25%) — files created, repos, scope of changes
- **Consistency** (20%) — active days + streak

Efficiency is weighted highest — it rewards developers who get MORE done with LESS tokens.

**How it works:**
```
npx ccrank
```

One command. It scans your git repos + Claude Code usage data, calculates your score (0-1000), and ranks you globally. Tiers from Bronze to Legendary.

GitHub: https://github.com/flaskovystupel/ccrank

Would love feedback on the scoring algorithm. What else should we measure?

---

## Reddit r/ChatGPTCoding

**Title:** Built a developer leaderboard for AI coding — ranks by actual code output, not spend

**Body:**
Saw people tracking Claude Code token usage on Viberank/CCgather, but they only measure how much you SPEND, not how productive you actually are.

Built **ccrank** — a leaderboard where your score comes from real git data:
- Commits shipped
- Lines of code
- Efficiency (output per token)
- Streak consistency

Run `npx ccrank` → get your score → see your global ranking.

https://github.com/flaskovystupel/ccrank

The scoring formula weights efficiency highest (30%) because someone shipping 10K lines with 500K tokens is objectively better than someone shipping 1K lines with 5M tokens.

---

## Reddit r/SideProject

**Title:** ccrank — Claude Code developer leaderboard ranked by real output

**Body:**
Built this over the weekend. Every AI coding leaderboard I found only tracks token consumption (more money spent = higher rank).

ccrank measures what actually matters — your git output:

✅ Commits per day
✅ Lines shipped per token (efficiency)
✅ Files created, repos, languages
✅ Active days and coding streaks

One command: `npx ccrank`

Score from 0-1000, global ranking, tiers from Bronze to Legendary.

Tech: Next.js 15, Prisma, PostgreSQL, pure Node.js CLI.

https://github.com/flaskovystupel/ccrank

---

## Twitter/X

**Post:**
I built ccrank — a Claude Code leaderboard that ranks developers by OUTPUT, not token spend.

Other leaderboards: "you spent $500 on tokens = you're #1"
ccrank: "you shipped 15K lines in 50 commits = you're #1"

One command: `npx ccrank`

Scores based on:
→ Velocity (commits/day)
→ Efficiency (lines/token)
→ Impact (scope)
→ Consistency (streaks)

https://github.com/flaskovystupel/ccrank

---

## Hacker News

**Title:** Show HN: ccrank – Claude Code leaderboard ranked by code output, not token spend

**Body:**
Every existing Claude Code leaderboard ranks developers by token consumption. More tokens burned = higher ranking. This incentivizes waste.

I built ccrank, which scores developers by actual output:

- Velocity: commits per active day
- Efficiency: lines of code shipped per token consumed (weighted highest at 30%)
- Impact: weighted file/line/repo changes
- Consistency: active coding days and streak

Run `npx ccrank` — it scans local git repos and Claude Code data, computes a 0-1000 score, and submits to the global leaderboard.

The CLI is zero-dependency Node.js. The web app is Next.js + PostgreSQL.

Key insight: efficiency being the highest weighted metric means the leaderboard rewards getting more done with fewer tokens — the opposite of what Viberank/CCgather measure.

https://github.com/flaskovystupel/ccrank

---

## Discord (Claude/Anthropic community servers)

**Message:**
🏆 **ccrank** — Claude Code developer leaderboard

Tired of leaderboards that just rank you by tokens spent? ccrank measures what you actually BUILD:

```
npx ccrank
```

→ Scans your git repos + Claude Code data
→ Scores you on Velocity, Efficiency, Impact, Consistency
→ Global ranking with tiers (Bronze → Legendary)
→ Efficiency weighted highest (more output per token = better)

GitHub: https://github.com/flaskovystupel/ccrank

Star ⭐ if you think output > spending!

---

## GitHub Discussions (awesome-claude-code, claude-code community)

**Title:** ccrank — Output-based Claude Code leaderboard

**Body:**
Existing tools like Viberank and CCgather track token consumption. ccrank takes a different approach — scoring developers by their actual git output relative to tokens used.

**Scoring (0-1000):**
| Dimension | Weight | Metric |
|-----------|--------|--------|
| Velocity | 25% | Commits per active day |
| Efficiency | 30% | Lines shipped / tokens consumed |
| Impact | 25% | Weighted file + line changes |
| Consistency | 20% | Active days + streak bonus |

**Usage:** `npx ccrank`

Zero dependencies CLI that reads local git history and `~/.claude/` data.

Repo: https://github.com/flaskovystupel/ccrank
