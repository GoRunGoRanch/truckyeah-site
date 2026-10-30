#!/usr/bin/env python3
"""
Add an "In memory of (name)" custom field to the 7 GoRunGo memorial payment
links (does NOT touch the 2 school links or create anything new).

Idempotent: if a link already has the field, it is left as-is.

Key handling is identical to create_stripe_links.py: read from STRIPE_API_KEY,
else the file named by STRIPE_API_KEY_FILE. The key is never printed. Only
needs the "Payment Links: Write" permission.

Usage:
    STRIPE_API_KEY_FILE=~/.gorungo_stripe_key python3 scripts/add_memory_field.py
"""

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

# product_name -> is the name field optional? (True = optional, False = required)
# Individual dedications require a name; group/sponsor ones leave it optional.
TARGETS = {
    "Pet Memorial Planting":    False,
    "Loved-One Memorial Tree":  False,
    "Memorial Planting":        False,
    "Memorial Tree":            False,
    "Companion Planting":       False,
    "Founding Garden Sponsor":  True,
    "Family Garden":            True,
}

MEMORY_FIELD_KEY = "inmemoryof"


def has_memory_field(link):
    for cf in (link.custom_fields or []):
        if getattr(cf, "key", None) == MEMORY_FIELD_KEY:
            return True
    return False


def main():
    print(f"\nStripe mode: {MODE}  (key never shown)\n")
    found = {}
    for pl in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        md = pl.metadata.to_dict() if pl.metadata else {}
        if md.get("batch") == BATCH_TAG and md.get("product_name") in TARGETS:
            found[md["product_name"]] = pl

    for name, optional in TARGETS.items():
        pl = found.get(name)
        if not pl:
            print(f"  {name:<28} NOT FOUND (skipped)")
            continue
        if has_memory_field(pl):
            print(f"  {name:<28} already has the field (skipped)")
            continue
        stripe.PaymentLink.modify(
            pl.id,
            custom_fields=[{
                "key": MEMORY_FIELD_KEY,
                "label": {"type": "custom", "custom": "In memory of (name)"},
                "type": "text",
                "optional": optional,
                "text": {"maximum_length": 120},
            }],
        )
        req = "optional" if optional else "required"
        print(f"  {name:<28} field added ({req})")

    print("\nDone. Reload any open Stripe checkout page to see the new field.")


if __name__ == "__main__":
    main()
