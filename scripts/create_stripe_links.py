#!/usr/bin/env python3
"""
Create GoRunGo Ranch + School Stripe products, one-time USD prices, and one
payment link each. Idempotent: safe to re-run — it reuses anything it already
created instead of making duplicates.

SECURITY
--------
The Stripe secret key is read ONLY from the STRIPE_API_KEY environment variable.
It is never hard-coded, logged, printed, or written to the CSV.

MODE is decided by the key you supply:
    sk_test_... / rk_test_...  -> Stripe TEST mode   (run this FIRST)
    sk_live_... / rk_live_...  -> Stripe LIVE mode   (only after you approve)
There is no "switch to test" API call — the key *is* the mode selector.

USAGE
-----
    export STRIPE_API_KEY=sk_test_xxxxx        # test key first
    python3 scripts/create_stripe_links.py

    # after you verify the test results and approve going live:
    export STRIPE_API_KEY=sk_live_xxxxx
    python3 scripts/create_stripe_links.py

Output: a CSV next to this run and the 9 buy.stripe.com URLs printed to the
terminal.
"""

import csv
import datetime
import os
import sys

try:
    import stripe
except ImportError:
    sys.exit("stripe library not installed. Run:  pip install stripe")

# --- key handling (never printed) --------------------------------------------
# Key source, in order: STRIPE_API_KEY env var, else the file named by
# STRIPE_API_KEY_FILE. The key is never echoed, logged, or written anywhere.
KEY = os.environ.get("STRIPE_API_KEY", "").strip()
if not KEY:
    key_file = os.environ.get("STRIPE_API_KEY_FILE", "").strip()
    if key_file and os.path.exists(key_file):
        with open(key_file) as _f:
            KEY = _f.read().strip()
if not KEY:
    sys.exit("No key found. Set STRIPE_API_KEY, or STRIPE_API_KEY_FILE pointing "
             "at a file containing the key (never commit or paste it).")
if not KEY.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
    sys.exit("STRIPE_API_KEY does not look like a Stripe secret key.")

stripe.api_key = KEY
MODE = "LIVE" if "_live_" in KEY else "TEST"

# A marker stamped on everything we create so re-runs recognise our own objects.
BATCH_TAG = "gorungo_batch_v1"

# --- hard guard: never touch the two existing live products -------------------
PROTECTED_PRODUCT_IDS = {"prod_VIOLpjozSM1nOd", "prod_VIOMvZGy9qhihe"}
PROTECTED_PRICE_IDS = {
    "price_1UHncoEIDiwwGMjFmdkjlXhj",  # Digital Tribute $149
    "price_1UHnbpEIDiwwGMjFCuKSbWlk",  # Founding Reservation $250
}

# name, amount in whole USD dollars, where it goes on the site
ITEMS = [
    ("AI Project School (3-month)",       1000, "school.html#ai-school  (+ homepage What-We-Teach card)"),
    ("Medical Field Immersion (6-month)", 2000, "school.html#med-immersion  (+ homepage card)"),
    ("Pet Memorial Planting",              250, "gorungo-ranch.html  Dedicate-a-tribute (#bricks)"),
    ("Loved-One Memorial Tree",           1000, "gorungo-ranch.html  Dedicate-a-tribute (#bricks)"),
    ("Founding Garden Sponsor",           5000, "gorungo-ranch.html  Dedicate-a-tribute (#bricks)"),
    ("Memorial Planting",                  995, "gorungo-ranch.html  Commemorate grid (#choose)"),
    ("Memorial Tree",                     1295, "gorungo-ranch.html  Commemorate grid (#choose)"),
    ("Companion Planting",                1795, "gorungo-ranch.html  Commemorate grid (#choose)"),
    ("Family Garden",                     2995, "gorungo-ranch.html  Commemorate grid (#choose)"),
]


def find_product(name):
    """Return an existing product with this exact name, else None.
    Never returns a protected product."""
    for p in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if p.id in PROTECTED_PRODUCT_IDS:
            continue
        if p.name == name:
            return p
    return None


def find_one_time_price(product_id, amount_cents):
    """Return an existing active one-time USD price for this product/amount."""
    for pr in stripe.Price.list(product=product_id, active=True, limit=100).auto_paging_iter():
        if pr.id in PROTECTED_PRICE_IDS:
            continue
        if (pr.currency == "usd"
                and pr.unit_amount == amount_cents
                and pr.recurring is None
                and pr.type == "one_time"):
            return pr
    return None


def find_payment_link(name):
    """Return an existing active payment link we previously created for this item."""
    for pl in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        md = pl.metadata.to_dict() if pl.metadata else {}
        if md.get("batch") == BATCH_TAG and md.get("product_name") == name:
            return pl
    return None


def main():
    print(f"\nStripe mode: {MODE}  (determined by your key; key itself is never shown)\n")
    rows = []

    for name, dollars, placement in ITEMS:
        amount_cents = dollars * 100

        # 1. product (reuse or create)
        product = find_product(name)
        if product:
            prod_status = "reused"
        else:
            product = stripe.Product.create(
                name=name,
                metadata={"batch": BATCH_TAG},
            )
            prod_status = "created"

        # 2. one-time USD price (reuse or create)
        price = find_one_time_price(product.id, amount_cents)
        if price:
            price_status = "reused"
        else:
            price = stripe.Price.create(
                product=product.id,
                unit_amount=amount_cents,
                currency="usd",
                metadata={"batch": BATCH_TAG},
            )
            price_status = "created"

        # 3. payment link, quantity 1 (reuse or create)
        link = find_payment_link(name)
        if link:
            link_status = "reused"
        else:
            link = stripe.PaymentLink.create(
                line_items=[{"price": price.id, "quantity": 1}],
                metadata={"batch": BATCH_TAG, "product_name": name},
            )
            link_status = "created"

        print(f"  {name:<34} ${dollars:<5} "
              f"product:{prod_status} price:{price_status} link:{link_status}")
        print(f"      {link.url}")

        rows.append({
            "product_name": name,
            "amount_usd": dollars,
            "product_id": product.id,
            "price_id": price.id,
            "payment_link_url": link.url,
            "website_placement": placement,
        })

    # 4. CSV export
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       f"stripe_payment_links_{MODE}_{stamp}.csv")
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "product_name", "amount_usd", "product_id",
            "price_id", "payment_link_url", "website_placement",
        ])
        w.writeheader()
        w.writerows(rows)

    print(f"\nCSV written: {out}")
    print(f"\n--- {MODE} mode: the 9 payment-link URLs ---")
    for r in rows:
        print(f"{r['product_name']:<34} {r['payment_link_url']}")
    if MODE == "TEST":
        print("\nThese are TEST links (test cards only). Verify them in the Stripe "
              "dashboard (test mode), then re-run with your sk_live_ key AFTER you approve.")


if __name__ == "__main__":
    main()
