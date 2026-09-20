// GET /api/order-status?id=RM-2026-000123&t=<access_token>
// Returns a safe, minimal status for the private order portal. Requires the
// unguessable token. Never returns shipping addresses, custody notes, or
// anything sensitive — those live only in the authenticated staff system.
const { supa, send } = require("./_lib");

// Family-facing labels for the order-state machine.
const STEP_LABELS = {
  DRAFT: "Draft started",
  PHOTO_SUBMITTED: "Photo submitted",
  AGREEMENT_ACCEPTED: "Agreement accepted",
  PAYMENT_PENDING: "Awaiting payment",
  PAID: "Payment received",
  INTAKE_REVIEW: "Intake under review",
  INTAKE_APPROVED: "Intake approved",
  KIT_SENT: "Shipping kit sent",
  REMAINS_IN_TRANSIT: "In transit",
  REMAINS_RECEIVED: "Safely received",
  PROOF_APPROVED: "Plaque/photo proof approved",
  NICHE_READY: "Niche prepared",
  INSTALLED: "Placed in the memorial",
  FAMILY_NOTIFIED: "Complete — family notified"
};

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const id = url.searchParams.get("id");
    const t = url.searchParams.get("t");
    if (!id || !t) return send(res, 400, { error: "Missing id or token." });

    const db = supa();
    const { data: mem, error } = await db
      .from("gorungo_memorials")
      .select("memorial_id, access_token, pet_name, species, status, privacy, created_at")
      .eq("memorial_id", id).single();
    if (error || !mem) return send(res, 404, { error: "Not found." });
    if (mem.access_token !== t) return send(res, 403, { error: "Invalid link." });

    const { data: orders } = await db
      .from("gorungo_orders")
      .select("package_code, amount_cents, currency, payment_status, created_at")
      .eq("memorial_id", id).order("created_at", { ascending: false });

    return send(res, 200, {
      memorial_id: mem.memorial_id,
      pet_name: mem.pet_name,
      species: mem.species,
      status: mem.status,
      status_label: STEP_LABELS[mem.status] || mem.status,
      created_at: mem.created_at,
      orders: (orders || []).map(o => ({
        package_code: o.package_code,
        amount: o.amount_cents != null ? (o.amount_cents / 100) : null,
        currency: o.currency,
        payment_status: o.payment_status,
        created_at: o.created_at
      }))
    });
  } catch (e) {
    return send(res, 500, { error: e.message || "Could not load order." });
  }
};
