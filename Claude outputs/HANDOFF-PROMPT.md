# The prompt

Copy everything below the line into a **new Claude Code session**, opened in an
empty folder that has `asymmetry-engine/` sitting inside it.

Do it in Claude Code rather than a Claude Project — the build needs to write
files, run `npm`, and push to GitHub, and a Project can only talk.

---

I'm building a private web tool for myself. I'm a physician, not an engineer —
assume I will not enjoy debugging, and optimise every choice for "this just
works without me opening a terminal."

Read `asymmetry-engine/BUILD-SPEC.md` first and in full. It is the complete
brief: architecture, schema, page-by-page UI, and the constraints behind each
default. Follow it. Where it says not to change something, don't.

Short version of what exists: `asymmetry-engine/` is a working, tested Python
package (31 passing tests) that scans ~500 US large caps for catalyst-driven
moves and prices the option chain on each one into three reward tiers — 5x, 10x,
25x — each with the underlying move it would require. It runs from a terminal
today, which is why I don't run it. I want it as a web app I open on my phone.

The architecture in the spec is GitHub Actions for the scheduled scan, Supabase
for storage, and Next.js on Vercel for the interface. That split exists because
Vercel's free-tier cron only fires once a day with an hour of slop, and the scan
makes 500+ sequential HTTP calls that won't fit in a serverless timeout. Don't
re-litigate it unless you find something genuinely wrong with it — and if you
do, tell me before you build.

**Work in this order, and stop to show me after step 4:**

1. Supabase project, schema, row-level security
2. Add a `--json` output flag to `scripts/scan_live.py` plus a
   `scripts/push_to_supabase.py`
3. The GitHub Action, proven by one manual run
4. The Next.js dashboard at `/`, reading real rows from Supabase

I want to see it working end to end before we build the catalyst upload, the
history page, and the trade log.

**Things I care about, in order:**

- **Every tier tile leads with the required move**, in bigger type than the
  multiple. "Needs +8.7%" is the number that decides the trade; "25x" is just
  the prize. A tier needing more than 15% renders grey, not green. Getting this
  backwards would make the tool worse than nothing.
- I open it on my phone at 7am. Mobile layout is the primary one.
- The empty state — no names cleared the screen — must read as normal, not as
  an error. That's the outcome most days.
- It never recommends. No BUY buttons, no scores, no "strong setup". It shows
  what moved and what the chain pays; I decide.

**Ask me before you assume:** my Supabase and Vercel accounts, the GitHub repo
name, and whether the repo should be private (it should).

I'll give you the ORATS token as a secret when you need it — not in chat, and
I'm rotating it first.

Start by reading the spec and telling me what you'd do in step 1, and what you
need from me before you can.
