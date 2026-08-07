# TruckYeah Traders — Trading-Discipline Training Site

A fast, static site (plain HTML/CSS/JS, no build step) for a **trading-discipline practice tool**. Message: *develop the skills so you don't blow your account.* It embeds our simulator, explains what it trains, and sells a one-time unlock through a hosted checkout.

Preview it locally by double-clicking `index.html`.

> **This is the pivoted version.** It lives on the `trading-discipline` git branch. The previous truck-dispatch site is still on `main` and fully recoverable (`git checkout main`).

---

## 🚦 Positioning rules (do not break these)

This site's credibility depends on staying honest and anti-hype. **Never** add:

- Income or profit claims, or "returns" of any kind
- Backtested/hypothetical performance figures
- Testimonials, reviews, star ratings, or user counts
- "Quit your job and trade for a living" messaging
- Anything that reads as a signal, prediction, or investment advice

The product trains **behavior** (sizing, patience, anti-tilt) on **simulated** data. That's the whole pitch. A visible disclaimer is on the page (hero, near the simulator, and in the footer) — keep it.

---

## 📁 Files

```
index.html    ← all page copy
styles.css    ← dark theme (reused from the original build)
script.js     ← menu, contact form, and the honor-system unlock
robots.txt / sitemap.xml
assets/       ← logo-full.jpg, logo-mark.png, favicon.ico, apple-touch-icon.png, og-image.jpg
```

Search `index.html` for **EDIT** to jump between the things you'll want to change.

---

## 1. ✅ Placeholders to set before production

| Placeholder | Where | Replace with |
|---|---|---|
| `[SET PRICE]` | `index.html` — Pricing card | Your price, e.g. `$29` |
| `[CHECKOUT_URL]` | `index.html` — "Unlock full access" button | Your Gumroad / Lemon Squeezy product URL (see Section 3) |
| `[LAUNCH OFFER …]` | `index.html` — Launch section | Your launch wording, e.g. "Founding price for the first 50 users" (price/access only — never returns) |
| `[CONFIRM your refund policy…]` | `index.html` — FAQ | Your refund policy, or delete and let the checkout provider's policy stand |
| `hello@truckyeahtraders.com` | `index.html` (contact link, FormSubmit action, footer) | Your real inbox |
| `VALID_UNLOCK_CODES` | `script.js` | The code(s) you hand out after purchase |

---

## 2. 🎮 The embedded simulator

The "Try It" section embeds the live simulator (`https://mu-reversal-sim.vercel.app/`) in an `<iframe>`. **Two things must be true for it to show publicly** — please confirm on the preview:

1. **Deployment Protection is OFF** for that simulator's Vercel project. (It was off at build time — the demo rendered. If it ever shows a Vercel login wall instead of the app, turn Deployment Protection off in that project's Vercel settings.)
2. **The centering feature uses the neutral built-in image — no personal photos.** This demo is public, so nothing personal should appear.

Do **not** edit the simulator's trading logic — it's a finished app in its own repo (`GoRunGoRanch/mu-reversal-sim`). To point the embed at a different URL, edit the `src` on the `<iframe>` in `index.html` (search `mu-reversal-sim`).

---

## 3. 💳 Money: hosted checkout (no card handling here)

This site **never** collects card numbers. Payment is handled by a hosted checkout that also does tax and delivery:

1. Create a free seller account at **Gumroad** (gumroad.com) or **Lemon Squeezy** (lemonsqueezy.com).
2. Add one product (your one-time unlock). Set the price.
3. In the product's delivery/receipt, include the **unlock code** (one of the codes in `VALID_UNLOCK_CODES`) and a link back to the site's Pricing section.
4. Copy the product's public URL and paste it into `index.html` as the `[CHECKOUT_URL]` on the "Unlock full access" button.
5. Test with the provider's sandbox/test mode before going live.

**How access works (MVP):** After buying, the customer gets an unlock code, enters it in the "Already bought?" box, and the page reveals the full-access panel. This is **honor-system** — it's a convenience, not real security (the code ships in the page). Real gating comes in **v2 via Supabase auth** (used on our other project). This is noted in the code comments.

---

## 4. 📨 Contact form

Uses **FormSubmit** (no account needed). Same as before: the first time the form is submitted on the live site, FormSubmit emails a one-time **activation link** to the address in the form's `action` — click it once, and submissions flow to that inbox after that. Change the inbox by editing the email at the end of the `action="https://formsubmit.co/ajax/…"` line.

---

## 5. 🚀 Deploy: PREVIEW first, production only after approval

This branch is meant to go to a **Vercel preview**, not production. With the repo connected to Vercel, **pushing the `trading-discipline` branch (or opening a PR) creates a preview deployment automatically** — a temporary URL you can review on desktop and phone. The live domain keeps serving the old site until you decide.

When you approve the preview and want it live:
```bash
git checkout main
git merge trading-discipline
git push origin main
```
Vercel redeploys `main` to `truckyeahtraders.com`. **No DNS changes are needed** — the domain already points at this Vercel project. To roll back, revert the merge or redeploy a previous `main` deployment in Vercel.

---

## 6. 📇 Email opt-in list (Supabase) — steps 1–2 of the funnel

The "Get a free discipline drill every week" section captures **consenting** subscribers into Supabase. It's opt-in only (email + a ticked consent box) — no scraping, no unsolicited mail.

**Set it up (~10 min):**
1. **Create a NEW Supabase project** at supabase.com. Do **not** reuse the Guru Seva Meds (medical) project — this list is publicly insertable and must not share a database with health data.
2. In the project: **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_subscribers.sql`, and click **Run**. This creates the `subscribers` table with **insert-only** Row-Level Security (the public can add themselves; the list can't be read with the public key).
3. In **Project Settings → API**, copy the **Project URL** and the **`anon` public key**.
4. Open `subscribe.js` and paste them into `SUPABASE_URL` and `SUPABASE_ANON_KEY`. ⚠️ Use the **anon** key only — never the `service_role` key in the website; it bypasses security.
5. Redeploy/refresh, submit the form, and confirm a row appears in **Table Editor → subscribers** in Supabase.

**Why this is safe/legal:** every row is a person who typed their email and ticked consent. That's the difference between a list you own and a spam complaint. You read/manage the list inside Supabase Studio; the site can only add to it.

## Reminders

- Keep HTTPS on (Vercel issues it automatically).
- Never add fake stats, reviews, or income claims — the honesty *is* the brand.
- The simulator's logic is owned by its own repo; don't rebuild it here.
