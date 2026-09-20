// POST /api/stripe-webhook
// Verifies the Stripe signature and marks orders PAID. Idempotent: a replayed
// event is recorded once. Never trusts the browser success redirect for payment.
const { supa, stripe, readRawBody, send } = require("./_lib");

const handler = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];
  if (!secret) return send(res, 500, { error: "Webhook secret not configured." });

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return send(res, 400, { error: `Signature verification failed: ${e.message}` });
  }

  const db = supa();
  try {
    // Idempotency: skip if we've already processed this event id.
    const { error: dupErr } = await db.from("gorungo_webhook_events").insert({ event_id: event.id, type: event.type });
    if (dupErr && (dupErr.code === "23505" || /duplicate/i.test(dupErr.message || ""))) {
      return send(res, 200, { received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const s = event.data.object;
      const memorial_id = s.metadata && s.metadata.memorial_id;
      if (memorial_id) {
        await db.from("gorungo_orders")
          .update({ payment_status: "PAID", stripe_payment_intent: s.payment_intent || null, updated_at: new Date().toISOString() })
          .eq("stripe_session_id", s.id);
        await db.from("gorungo_memorials")
          .update({ status: "PAID", updated_at: new Date().toISOString() })
          .eq("memorial_id", memorial_id);
      }
    } else if (event.type === "charge.refunded" || event.type === "checkout.session.async_payment_failed") {
      const s = event.data.object;
      const pi = s.payment_intent || s.id;
      const status = event.type === "charge.refunded" ? "REFUNDED" : "FAILED";
      await db.from("gorungo_orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("stripe_payment_intent", pi);
    }

    return send(res, 200, { received: true });
  } catch (e) {
    // Return 500 so Stripe retries; the idempotency row will guard the retry.
    return send(res, 500, { error: e.message || "Webhook handler error" });
  }
};

module.exports = handler;
// Raw body needed for signature verification (honored by Next-style parsers;
// this function also reads the raw stream directly, so it is correct either way).
module.exports.config = { api: { bodyParser: false } };
