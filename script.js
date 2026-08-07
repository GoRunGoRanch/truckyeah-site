/* =========================================================
   TruckYeah Trader — script.js
   Vanilla JS. No dependencies, no build step.
   Handles: mobile menu, footer year, and AJAX form submit.
   ========================================================= */
(function () {
  "use strict";

  /* -------- Footer year -------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -------- Mobile navigation toggle -------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close the menu after clicking any link (nice on mobile)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* -------- Lead form: client-side validation + AJAX submit -------- */
  var form = document.getElementById("lead-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector('button[type="submit"]');

  function showError(field, show) {
    var input = form.querySelector("#" + field);
    var msg = form.querySelector('[data-error-for="' + field + '"]');
    if (input) input.setAttribute("aria-invalid", show ? "true" : "false");
    if (msg) msg.hidden = !show;
  }

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.remove("is-success", "is-error");
    if (type) statusEl.classList.add("is-" + type);
  }

  function validate() {
    var ok = true;

    var name = form.querySelector("#name");
    if (!name.value.trim()) { showError("name", true); ok = false; }
    else { showError("name", false); }

    // Email: simple, forgiving format check
    var email = form.querySelector("#email");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { showError("email", true); ok = false; }
    else { showError("email", false); }

    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validate()) {
      setStatus("Please fix the highlighted fields and try again.", "error");
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var action = form.getAttribute("action");

    // If the form endpoint hasn't been configured yet, guide the owner instead of failing silently.
    if (!action || action.indexOf("[YOUR_") !== -1 || action.indexOf("http") !== 0) {
      setStatus(
        "Form not connected yet. Owner: set the form's action to your FormSubmit or Formspree endpoint (see README). Meanwhile, email hello@truckyeahtraders.com.",
        "error"
      );
      return;
    }

    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("Sending your details…", null);

    var data = new FormData(form);

    fetch(action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          setStatus(
            "Thanks! We got your message and will get back to you soon.",
            "success"
          );
        } else {
          return response.json().then(function (body) {
            var msg =
              body && body.errors && body.errors.length
                ? body.errors.map(function (err) { return err.message; }).join(", ")
                : "Something went wrong. Please email hello@truckyeahtraders.com.";
            setStatus(msg, "error");
          });
        }
      })
      .catch(function () {
        setStatus(
          "Network error — please try again, or email hello@truckyeahtraders.com.",
          "error"
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });

  // Clear a field's error as soon as the user starts fixing it
  ["name", "email"].forEach(function (id) {
    var el = form.querySelector("#" + id);
    if (el) {
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") showError(id, false);
      });
    }
  });
})();

/* =========================================================
   HONOR-SYSTEM UNLOCK (MVP)
   ---------------------------------------------------------
   This is NOT real security. It only remembers, in this browser's
   localStorage, that a valid-looking code was entered, and reveals the
   "access unlocked" panel. A determined user can bypass it trivially.
   That's an accepted trade-off for the MVP lead flow — real gating comes
   in v2 via Supabase auth (used on our other project).

   EDIT: put the codes you hand out after purchase in VALID_UNLOCK_CODES.
   Keep this list short; rotate it when needed. (Because it ships in the
   page source, treat these as convenience codes, not secrets.)
   ========================================================= */
(function () {
  "use strict";

  var VALID_UNLOCK_CODES = ["TYT-FOUNDER", "TYT-LAUNCH"]; // EDIT ME
  var STORAGE_KEY = "tyt_unlocked";

  var wrap = document.getElementById("unlock");
  if (!wrap) return;

  var lockedEl = wrap.querySelector("[data-unlock-locked]");
  var openEl = wrap.querySelector("[data-unlock-open]");
  var form = document.getElementById("unlock-form");
  var input = document.getElementById("unlock-code");
  var msg = document.getElementById("unlock-msg");
  var resetBtn = document.getElementById("unlock-reset");

  function isUnlocked() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
  }
  function setUnlocked(v) {
    try { v ? localStorage.setItem(STORAGE_KEY, "1") : localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }
  function render() {
    var open = isUnlocked();
    if (lockedEl) lockedEl.hidden = open;
    if (openEl) openEl.hidden = !open;
  }

  render();

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = (input.value || "").trim().toUpperCase();
      var ok = VALID_UNLOCK_CODES.map(function (c) { return c.toUpperCase(); }).indexOf(code) !== -1;
      if (ok) {
        setUnlocked(true);
        render();
      } else if (msg) {
        msg.hidden = false;
        msg.textContent = "That code didn't match. Check the email from your purchase, or contact us.";
        msg.classList.remove("is-success");
        msg.classList.add("is-error");
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      setUnlocked(false);
      if (input) input.value = "";
      if (msg) msg.hidden = true;
      render();
    });
  }
})();
