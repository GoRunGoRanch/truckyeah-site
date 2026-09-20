# GoRunGo Ranch — going-live setup

The pages and backend are deployed. To make **ordering actually work**, do the
one-time setup below. Nothing here needs code changes — it's Stripe, Supabase,
and Vercel environment variables. Physical-niche / ashes checkout stays **OFF**
until you deliberately enable it (see the last section).

Everything runs inside the **existing** truckyeahtraders.com Vercel project,
Supabase project, and Stripe account — no second website or payment stack.

---

## 1. Supabase — create the tables (2 min)
Open Supabase → SQL Editor → paste the contents of
`supabase/migrations/0002_gorungo_ranch.sql` → Run.
This creates `gorungo_memorials`, `gorungo_orders`, and `gorungo_webhook_events`
with Row-Level Security locked to server-only access.

*(Optional, for photo uploads)* Supabase → Storage → **New bucket** named
`ranch-memorials`, keep it **Private**. Then set `SUPABASE_STORAGE_BUCKET` below.
If you skip this, ordering still works — families just add photos later.

## 2. Stripe — create the two live products (5 min)
Stripe Dashboard (Test mode OFF for real money) → **Product catalog → + Add product**:

| Product name | Price | Recurring? | Copy the Price ID → env var |
|---|---|---|---|
| GoRunGo Ranch — Digital Rainbow Tribute | $149.00 | One-time | `PRICE_DIGITAL_TRIBUTE` |
| GoRunGo Ranch — Founding Wall Reservation | $250.00 | One-time | `PRICE_FOUNDING_RESERVATION` |

Each product's price has an ID like `price_1AbC...`. Copy it — you'll paste it in step 4.

## 3. Stripe — add the webhook (2 min)
Stripe → **Developers → Webhooks → + Add endpoint**:
- **Endpoint URL:** `https://truckyeahtraders.com/api/stripe-webhook`
- **Events:** `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`
- Save, then copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

## 4. Vercel — add environment variables (5 min)
Vercel → your truckyeahtraders project → **Settings → Environment Variables**
(add to Production). Then **redeploy** so they take effect.

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | your Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | from step 3 (`whsec_...`) |
| `PRICE_DIGITAL_TRIBUTE` | from step 2 |
| `PRICE_FOUNDING_RESERVATION` | from step 2 |
| `SUPABASE_URL` | `https://gggoeybvfktydgvykpdh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** key (server-only, never in the browser) |
| `PUBLIC_BASE_URL` | `https://truckyeahtraders.com` |
| `SUPABASE_STORAGE_BUCKET` | `ranch-memorials` *(only if you made the bucket)* |
| `RANCH_PHYSICAL_ENABLED` | leave unset / `false` for now |

> ⚠️ The **service_role** key bypasses security — it lives only in Vercel env,
> never in any file or the front-end. The public site keeps using the existing
> publishable key for the newsletter; the ranch backend uses service_role.

## 5. Test the flow
1. Visit `https://truckyeahtraders.com/gorungo-ranch.html` → **Start a Memorial**.
2. Fill the form → **Review & pay** → you land on Stripe Checkout.
3. Use a real card ($149) or, in a Stripe **test** deployment, card `4242 4242 4242 4242`.
4. After paying you're redirected to your private order page showing **Payment received**.
5. In Supabase, `gorungo_orders.payment_status` should read `PAID` (set by the webhook, not the browser).

---

## Where prices live
All package prices/labels are in **`ranch-config.js`** (front-end display) and the
authoritative amounts + Stripe price IDs are server-side in `api/_lib.js` via env.
Edit `ranch-config.js` to change what visitors see; update the Stripe price + env
var to change what's actually charged.

## Enabling physical memorials later (Phase B — only after approvals)
Do **not** enable until you have, in writing: Elbert County EDZ approval, building/
public-access approvals, insurance for custody of remains, an attorney-approved
memorial + custody agreement, and defined permanence/maintenance terms.

When ready:
1. Create the four niche products in Stripe → set `PRICE_STANDARD_NICHE`,
   `PRICE_PREMIUM_NICHE`, `PRICE_COMPANION_NICHE`, `PRICE_FAMILY_NICHE`.
2. Set `RANCH_PHYSICAL_ENABLED=true` in Vercel and flip `physicalEnabled:true`
   in `ranch-config.js`, then redeploy.
3. Build out (separate work): niche inventory with a no-double-assignment DB
   constraint, agreement signing, intake review, the USPS shipping workflow,
   two-person custody logging, placement confirmation, and the staff admin
   dashboard. These are scoped but intentionally **not** built yet, because they
   must not exist as live checkout paths before the approvals above.

Ashes are **never** collected at checkout — a shipping address is released only
in the private portal after manual intake approval.
