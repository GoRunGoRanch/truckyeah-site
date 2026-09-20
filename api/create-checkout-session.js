// POST /api/create-checkout-session
// Body: { memorial_id, access_token, package_code }
// Validates the package is orderable (physical products gated by env flag),
// creates a Stripe Checkout Session, records a PENDING order, returns { url }.
const { supa, stripe, readJson, send, packageAllowed, baseUrl } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const { memorial_id, access_token, package_code } = await readJson(req);
    if (!memorial_id || !access_token || !package_code) {
      return send(res, 400, { error: "Missing memorial, token, or package." });
    }

    const allowed = packageAllowed(package_code);
    if (!allowed.ok) return send(res, 403, { error: allowed.reason });
    const pkg = allowed.pkg;

    const priceId = pkg.priceId();
    if (!priceId) return send(res, 500, { error: `Stripe price for ${package_code} is not configured yet.` });

    const db = supa();
    const { data: mem, error: memErr } = await db
      .from("gorungo_memorials").select("memorial_id, access_token").eq("memorial_id", memorial_id).single();
    if (memErr || !mem) return send(res, 404, { error: "Memorial not found." });
    if (mem.access_token !== access_token) return send(res, 403, { error: "Invalid token." });

    const portal = `${baseUrl()}/gorungo-ranch-order.html?id=${encodeURIComponent(memorial_id)}&t=${encodeURIComponent(access_token)}`;

    const session = await stripe().checkout.sessions.create({
      mode: pkg.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${portal}&paid=1`,
      cancel_url: `${baseUrl()}/gorungo-ranch-start.html?canceled=1`,
      // Only non-sensitive internal identifiers go in metadata (per the brief).
      metadata: { memorial_id, order_type: "pet_memorial", package_code, schema_version: "1" },
      payment_intent_data: { metadata: { memorial_id, package_code } }
    });

    await db.from("gorungo_orders").insert({
      memorial_id,
      order_type: "pet_memorial",
      package_code,
      amount_cents: pkg.amountCents,
      currency: "usd",
      stripe_session_id: session.id,
      payment_status: "PENDING",
      schema_version: "1"
    });
    await db.from("gorungo_memorials").update({ status: "PAYMENT_PENDING", updated_at: new Date().toISOString() }).eq("memorial_id", memorial_id);

    return send(res, 200, { url: session.url });
  } catch (e) {
    return send(res, 500, { error: "Could not start checkout. " + (e.message || "") });
  }
};
