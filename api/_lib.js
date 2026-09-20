// Shared helpers for GoRunGo Ranch serverless functions.
// CommonJS so it works on Vercel's Node runtime without a build step.

const { createClient } = require("@supabase/supabase-js");

// --- Supabase (service role — SERVER ONLY, never ship this key to the client) ---
function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, key, { auth: { persistSession: false } });
}

// --- Stripe ---
function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing.");
  return require("stripe")(key);
}

// Read the raw request body (needed for Stripe webhook signature verification,
// and reliable JSON parsing on Vercel Node functions).
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const raw = await readRawBody(req);
  if (!raw || !raw.length) return {};
  try { return JSON.parse(raw.toString("utf8")); }
  catch { throw new Error("Invalid JSON body."); }
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

// Which packages may be purchased right now. Physical products require BOTH
// the config flag AND the server env flag — the server is the real gate.
const PHYSICAL_ENABLED = String(process.env.RANCH_PHYSICAL_ENABLED || "").toLowerCase() === "true";

// Server-side catalog: price is authoritative here (never trust the client).
// Stripe Price IDs come from env so nothing sensitive is committed.
const CATALOG = {
  DIGITAL_TRIBUTE: {
    priceId: () => process.env.PRICE_DIGITAL_TRIBUTE,
    physical: false, mode: "payment", amountCents: 14900, name: "Digital Rainbow Tribute"
  },
  FOUNDING_RESERVATION: {
    priceId: () => process.env.PRICE_FOUNDING_RESERVATION,
    physical: false, mode: "payment", amountCents: 25000, name: "Founding Wall Reservation"
  },
  // Physical niches — defined but gated OFF until approvals + env flag.
  STANDARD_NICHE: { priceId: () => process.env.PRICE_STANDARD_NICHE, physical: true, mode: "payment", amountCents: 99500, name: "Standard Individual Niche" },
  PREMIUM_NICHE:  { priceId: () => process.env.PRICE_PREMIUM_NICHE,  physical: true, mode: "payment", amountCents: 129500, name: "Premium Eye-Level Niche" },
  COMPANION_NICHE:{ priceId: () => process.env.PRICE_COMPANION_NICHE,physical: true, mode: "payment", amountCents: 179500, name: "Companion Niche" },
  FAMILY_NICHE:   { priceId: () => process.env.PRICE_FAMILY_NICHE,   physical: true, mode: "payment", amountCents: 299500, name: "Family Niche" }
};

function packageAllowed(code) {
  const p = CATALOG[code];
  if (!p) return { ok: false, reason: "Unknown package." };
  if (p.physical && !PHYSICAL_ENABLED) {
    return { ok: false, reason: "This memorial requires county, insurance, and legal approvals before it can be ordered. It is not yet available." };
  }
  return { ok: true, pkg: p };
}

// RM-2026-000123 style id + an unguessable portal token.
function newMemorialId() {
  const year = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `RM-${year}-${n}`;
}
function token(len = 24) {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz";
  let s = "";
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

function baseUrl() {
  return (process.env.PUBLIC_BASE_URL || "https://truckyeahtraders.com").replace(/\/$/, "");
}

module.exports = {
  supa, stripe, readRawBody, readJson, send,
  CATALOG, packageAllowed, PHYSICAL_ENABLED,
  newMemorialId, token, baseUrl
};
