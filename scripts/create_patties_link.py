#!/usr/bin/env python3
"""
Create the GoRunGo Ranch Cow Dung Patties product, a one-time USD price, and a
payment link. Physical product: the link collects a US shipping address and
lets the buyer adjust quantity (1-20).

Idempotent and key-safe, exactly like the other scripts: the key is read only
from STRIPE_API_KEY or the file named by STRIPE_API_KEY_FILE, and is never
printed. Needs Products + Prices + Payment Links write.

Usage:
    STRIPE_API_KEY_FILE=~/.gorungo_stripe_key python3 scripts/create_patties_link.py
"""

import csv
import datetime
import os
import sys

try:
    import stripe
except ImportError:
    sys.exit("stripe library not installed. Run:  pip install stripe")

KEY = os.environ.get("STRIPE_API_KEY", "").strip()
if not KEY:
    kf = os.environ.get("STRIPE_API_KEY_FILE", "").strip()
    if kf and os.path.exists(os.path.expanduser(kf)):
        with open(os.path.expanduser(kf)) as f:
            KEY = f.read().strip()
if not KEY:
    sys.exit("No key found. Set STRIPE_API_KEY or STRIPE_API_KEY_FILE.")
if not KEY.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
    sys.exit("STRIPE_API_KEY does not look like a Stripe secret key.")

stripe.api_key = KEY
MODE = "LIVE" if "_live_" in KEY else "TEST"
BATCH_TAG = "gorungo_batch_v1"

NAME = "GoRunGo Ranch Cow Dung Patties — Pack of 6"
AMOUNT_CENTS = 3900  # $39.00
PLACEMENT = "gorungo-cow-dung-patties.html"


def find_product(name):
    for p in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if p.name == name:
            return p
    return None


def find_one_time_price(product_id, cents):
    for pr in stripe.Price.list(product=product_id, active=True, limit=100).auto_paging_iter():
        if pr.currency == "usd" and pr.unit_amount == cents and pr.recurring is None and pr.type == "one_time":
            return pr
    return None


def find_payment_link(name):
    for pl in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        md = pl.metadata.to_dict() if pl.metadata else {}
        if md.get("batch") == BATCH_TAG and md.get("product_name") == name:
            return pl
    return None


def main():
    print(f"\nStripe mode: {MODE}  (key never shown)\n")

    product = find_product(NAME)
    if product:
        prod_status = "reused"
    else:
        product = stripe.Product.create(
            name=NAME,
            description="Naturally dried cow dung patties from GoRunGo Ranch, Kiowa, Colorado. "
                        "For traditional ceremonial, devotional, and purification use. Free continental-US shipping.",
            metadata={"batch": BATCH_TAG},
        )
        prod_status = "created"

    price = find_one_time_price(product.id, AMOUNT_CENTS)
    if price:
        price_status = "reused"
    else:
        price = stripe.Price.create(
            product=product.id, unit_amount=AMOUNT_CENTS, currency="usd",
            metadata={"batch": BATCH_TAG},
        )
        price_status = "created"

    link = find_payment_link(NAME)
    if link:
        link_status = "reused"
    else:
        link = stripe.PaymentLink.create(
            line_items=[{
                "price": price.id,
                "quantity": 1,
                "adjustable_quantity": {"enabled": True, "minimum": 1, "maximum": 20},
            }],
            shipping_address_collection={"allowed_countries": ["US"]},
            metadata={"batch": BATCH_TAG, "product_name": NAME},
        )
        link_status = "created"

    print(f"  {NAME}")
    print(f"    product:{prod_status}  price:{price_status}  link:{link_status}")
    print(f"    {link.url}")

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       f"stripe_patties_link_{MODE}_{stamp}.csv")
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["product_name", "amount_usd", "product_id", "price_id", "payment_link_url", "website_placement"])
        w.writerow([NAME, AMOUNT_CENTS // 100, product.id, price.id, link.url, PLACEMENT])
    print(f"\nCSV written: {out}")


if __name__ == "__main__":
    main()
