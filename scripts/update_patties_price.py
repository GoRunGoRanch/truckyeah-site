#!/usr/bin/env python3
"""
Re-price the GoRunGo Ranch cow dung patties to $251 and charge shipping.

- Archives the previous $39 product and its payment link (deactivates, never deletes).
- Creates a new premium product "GoRunGo Ranch Sacred Cow Dung Patties — Pack of 6"
  at $251.00, a flat $19 shipping rate, and a payment link that collects a US
  shipping address and lets the buyer adjust quantity.
Idempotent and key-safe (key read only from STRIPE_API_KEY / STRIPE_API_KEY_FILE,
never printed). Needs Products + Prices + Payment Links write.
"""

import csv, datetime, os, sys
try:
    import stripe
except ImportError:
    sys.exit("stripe not installed")

KEY = os.environ.get("STRIPE_API_KEY", "").strip()
if not KEY:
    kf = os.environ.get("STRIPE_API_KEY_FILE", "").strip()
    if kf and os.path.exists(os.path.expanduser(kf)):
        KEY = open(os.path.expanduser(kf)).read().strip()
if not KEY.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
    sys.exit("No valid Stripe key (set STRIPE_API_KEY or STRIPE_API_KEY_FILE).")
stripe.api_key = KEY
MODE = "LIVE" if "_live_" in KEY else "TEST"
BATCH_TAG = "gorungo_batch_v1"

OLD_NAME = "GoRunGo Ranch Cow Dung Patties — Pack of 6"
NEW_NAME = "GoRunGo Ranch Sacred Cow Dung Patties — Pack of 6"
SHIP_NAME = "Shipping — Cow Dung Patties"
AMOUNT_CENTS = 25100          # $251.00
SHIP_CENTS   = 1900           # $19.00 flat shipping (added as a line item)
PLACEMENT = "gorungo-cow-dung-patties.html"


def products_by_name(name):
    return [p for p in stripe.Product.list(active=True, limit=100).auto_paging_iter() if p.name == name]

def links_for(name):
    out = []
    for pl in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        md = pl.metadata.to_dict() if pl.metadata else {}
        if md.get("batch") == BATCH_TAG and md.get("product_name") == name:
            out.append(pl)
    return out

def find_one_time_price(pid, cents):
    for pr in stripe.Price.list(product=pid, active=True, limit=100).auto_paging_iter():
        if pr.currency == "usd" and pr.unit_amount == cents and pr.recurring is None and pr.type == "one_time":
            return pr
    return None

def find_shipping_rate(cents):
    for sr in stripe.ShippingRate.list(active=True, limit=100).auto_paging_iter():
        md = sr.metadata.to_dict() if sr.metadata else {}
        if md.get("batch") == BATCH_TAG and sr.fixed_amount and sr.fixed_amount.amount == cents:
            return sr
    return None


def main():
    print(f"\nStripe mode: {MODE}  (key never shown)\n")

    # 1. archive the old $39 links + product
    for pl in links_for(OLD_NAME):
        stripe.PaymentLink.modify(pl.id, active=False)
        print(f"  archived old link {pl.id}")
    for p in products_by_name(OLD_NAME):
        stripe.Product.modify(p.id, active=False)
        print(f"  archived old product {p.id}")

    # 2. new premium product (reuse if re-run)
    existing = products_by_name(NEW_NAME)
    if existing:
        product = existing[0]; print(f"  product reused {product.id}")
    else:
        product = stripe.Product.create(
            name=NEW_NAME,
            description="Sacred naturally dried cow dung patties from GoRunGo Ranch, Kiowa, Colorado — "
                        "from cows immersed in Srimad-Bhagavatam recitation for 12 months. For traditional "
                        "ceremonial, devotional, and purification use. Shipping billed separately.",
            metadata={"batch": BATCH_TAG})
        print(f"  product created {product.id}")

    # 3. $251 price
    price = find_one_time_price(product.id, AMOUNT_CENTS)
    if not price:
        price = stripe.Price.create(product=product.id, unit_amount=AMOUNT_CENTS, currency="usd",
                                    metadata={"batch": BATCH_TAG})
    print(f"  price {price.id}")

    # 4. shipping as a fixed line item (avoids needing the shipping-rate permission)
    sp = products_by_name(SHIP_NAME)
    ship_prod = sp[0] if sp else stripe.Product.create(name=SHIP_NAME, metadata={"batch": BATCH_TAG})
    ship_price = find_one_time_price(ship_prod.id, SHIP_CENTS)
    if not ship_price:
        ship_price = stripe.Price.create(product=ship_prod.id, unit_amount=SHIP_CENTS, currency="usd",
                                         metadata={"batch": BATCH_TAG})
    print(f"  shipping product {ship_prod.id}  price {ship_price.id}")

    # 5. new payment link (patties + flat shipping line item)
    links = links_for(NEW_NAME)
    if links:
        link = links[0]; print(f"  link reused {link.id}")
    else:
        link = stripe.PaymentLink.create(
            line_items=[
                {"price": price.id, "quantity": 1,
                 "adjustable_quantity": {"enabled": True, "minimum": 1, "maximum": 20}},
                {"price": ship_price.id, "quantity": 1},
            ],
            shipping_address_collection={"allowed_countries": ["US"]},
            metadata={"batch": BATCH_TAG, "product_name": NEW_NAME})
        print(f"  link created {link.id}")

    print(f"\n  {NEW_NAME}\n    $251 + $19 shipping\n    {link.url}")

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"stripe_patties_link_{MODE}_{stamp}.csv")
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["product_name","amount_usd","shipping_usd","product_id","price_id","payment_link_url","website_placement"])
        w.writerow([NEW_NAME, AMOUNT_CENTS//100, SHIP_CENTS//100, product.id, price.id, link.url, PLACEMENT])
    print(f"\nCSV: {out}")


if __name__ == "__main__":
    main()
