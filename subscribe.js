/* =========================================================
   TruckYeah Traders — email opt-in (subscribe.js)
   ---------------------------------------------------------
   Sends the signup to Supabase using the PUBLIC anon key and an
   insert-only RLS policy (see supabase/migrations/0001_subscribers.sql).
   No build step, no library — just fetch() to the Supabase REST API.

   EDIT: paste your Supabase project URL + PUBLIC anon key below.
   - The anon key is designed to be public and is safe in front-end code.
   - NEVER put the service_role key here — it bypasses RLS and would expose
     your whole database. It stays server-side only.
   ========================================================= */
(function () {
  "use strict";

  // ---- EDIT THESE TWO VALUES ----
  var SUPABASE_URL = "https://gggoeybvfktydgvykpdh.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_RJTbR38NANDNEHeeomtmDA_M6OSdfCw"; // public "publishable" key (safe in front-end)
  // --------------------------------

  var SOURCE = "trading-site-join"; // label so you know where a lead came from

  var form = document.getElementById("subscribe-form");
  if (!form) return;

  var emailEl = document.getElementById("sub-email");
  var consentEl = document.getElementById("sub-consent");
  var statusEl = document.getElementById("subscribe-status");
  var btn = form.querySelector('button[type="submit"]');

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.hidden = !msg;
    statusEl.textContent = msg || "";
    statusEl.classList.remove("is-success", "is-error");
    if (type) statusEl.classList.add("is-" + type);
  }

  function isConfigured() {
    return (
      SUPABASE_URL.indexOf("http") === 0 &&
      SUPABASE_ANON_KEY.indexOf("[") !== 0 &&
      SUPABASE_ANON_KEY.length > 20
    );
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = (emailEl.value || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      emailEl.focus();
      return;
    }
    if (consentEl && !consentEl.checked) {
      setStatus("Please tick the box so we have your permission to email you.", "error");
      return;
    }
    if (!isConfigured()) {
      setStatus("Signup isn't connected yet. Owner: add your Supabase URL + anon key in subscribe.js.", "error");
      return;
    }

    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Joining…";
    setStatus("", null);

    // Plain insert. return=minimal means no row is read back (anon can't SELECT).
    // A repeat email hits the unique constraint and returns 409 — we treat that
    // as "already subscribed" (a friendly success), so re-signups never error.
    fetch(SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/subscribers", {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        email: email,
        source: SOURCE,
        user_agent: navigator.userAgent
      })
    })
      .then(function (res) {
        // 201 = newly added, 409 = already on the list. Both are founding members,
        // so both unlock the full tool on this device.
        if (res.ok || res.status === 409) {
          form.reset();
          if (typeof window.tytUnlock === "function") window.tytUnlock();
          setStatus(
            res.ok
              ? "You're in — full access unlocked below. Watch your inbox for the first drill."
              : "You're already on the list — full access unlocked below.",
            "success"
          );
        } else {
          setStatus("Couldn't sign you up right now. Please try again in a bit.", "error");
        }
      })
      .catch(function () {
        setStatus("Network error — please try again.", "error");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = original;
      });
  });
})();
