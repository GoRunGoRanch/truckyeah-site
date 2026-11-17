#!/usr/bin/env python3
"""
Create the GoRunGo Ranch FRESH (non-dried) cow dung patties product at $1,000,
a flat $39 shipping line item, and a payment link (US shipping address,
adjustable quantity). Idempotent and key-safe (key read only from
STRIPE_API_KEY / STRIPE_API_KEY_FILE, never printed). Needs Products + Prices +
Payment Links write.
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
    sys.exit("No valid Stripe key.")
stripe.api_key = KEY
MODE = "LIVE" if "_live_" in KEY else "TEST"
BATCH_TAG = "gorungo_batch_v1"

NAME = "GoRunGo Ranch Fresh Cow Dung Patties (Non-Dried)"
SHIP_NAME = "Shipping — Fresh Cow Dung Patties"
AMOUNT_CENTS = 100000   # $1,000.00
SHIP_CENTS   = 3900     # $39.00 flat (fresh / expedited handling)
PLACEMENT = "gorungo-cow-dung-patties.html"


def products_by_name(name):
    return [p for p in stripe.Product.list(active=True, limit=100).auto_paging_iter() if p.name == name]

def find_one_time_price(pid, cents):
    for pr in stripe.Price.list(product=pid, active=True, limit=100).auto_paging_iter():
        if pr.currency == "usd" and pr.unit_amount == cents and pr.recurring is None and pr.type == "one_time":
            return pr
    return None

def links_for(name):
    out = []
    for pl in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        md = pl.metadata.to_dict() if pl.metadata else {}
        if md.get("batch") == BATCH_TAG and md.get("product_name") == name:
            out.append(pl)
    return out


def main():
    print(f"\nStripe mode: {MODE}  (key never shown)\n")

    pl = products_by_name(NAME)
    product = pl[0] if pl else stripe.Product.create(
        name=NAME,
        description="Fresh (non-dried) cow dung patties from GoRunGo Ranch, Kiowa, Colorado. "
                    "For external ritual placement (e.g., front and back door). Not for consumption. "
                    "Shipping billed separately.",
        metadata={"batch": BATCH_TAG})
    print(f"  product {product.id}")

    price = find_one_time_price(product.id, AMOUNT_CENTS) or stripe.Price.create(
        product=product.id, unit_amount=AMOUNT_CENTS, currency="usd", metadata={"batch": BATCH_TAG})
    print(f"  price {price.id}")

    sp = products_by_name(SHIP_NAME)
    ship_prod = sp[0] if sp else stripe.Product.create(name=SHIP_NAME, metadata={"batch": BATCH_TAG})
    ship_price = find_one_time_price(ship_prod.id, SHIP_CENTS) or stripe.Price.create(
        product=ship_prod.id, unit_amount=SHIP_CENTS, currency="usd", metadata={"batch": BATCH_TAG})
    print(f"  shipping {ship_prod.id} {ship_price.id}")

    links = links_for(NAME)
    if links:
        link = links[0]; print(f"  link reused {link.id}")
    else:
        link = stripe.PaymentLink.create(
            line_items=[
                {"price": price.id, "quantity": 1,
                 "adjustable_quantity": {"enabled": True, "minimum": 1, "maximum": 10}},
                {"price": ship_price.id, "quantity": 1},
            ],
            shipping_address_collection={"allowed_countries": ["US"]},
            metadata={"batch": BATCH_TAG, "product_name": NAME})
        print(f"  link created {link.id}")

    print(f"\n  {NAME}\n    $1000 + $39 shipping\n    {link.url}")

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"stripe_patties_link_{MODE}_{stamp}.csv")
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["product_name","amount_usd","shipping_usd","product_id","price_id","payment_link_url","website_placement"])
        w.writerow([NAME, AMOUNT_CENTS//100, SHIP_CENTS//100, product.id, price.id, link.url, PLACEMENT])
    print(f"\nCSV: {out}")


if __name__ == "__main__":
    main()
