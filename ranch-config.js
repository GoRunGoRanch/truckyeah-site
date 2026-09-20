/* =========================================================
   GoRunGo Ranch — single source of truth for packages & flags
   ---------------------------------------------------------
   EDIT PRICES HERE ONLY. Do not hard-code dollar amounts in the
   pages — every card renders from this file (per the vision brief:
   "Prices ... must be editable in one configuration file ... Claude
   must not hard-code dollar amounts across multiple components").

   `available:true`  -> orderable now (Phase A: no ashes accepted).
   `physical:true`   -> requires county/insurance/legal approval; stays
                        OFF until the SERVER feature flag is enabled too
                        (RANCH_PHYSICAL_ENABLED=true in Vercel env). The
                        server is the real gate; this flag only hides the
                        button so nobody is misled.
   ========================================================= */
(function () {
  "use strict";
  window.RANCH = {
    currency: "USD",
    // Server is authoritative; this mirrors it so the UI matches reality.
    physicalEnabled: false,
    endorsement: "A Truck Yeah Traders project",

    packages: [
      {
        code: "DIGITAL_TRIBUTE",
        name: "Digital Rainbow Tribute",
        price: 149,
        physical: false,
        available: true,
        refundable: false,
        blurb: "A lasting online remembrance — may begin before the memorial wall is approved.",
        includes: [
          "Private or public memorial page",
          "One uploaded photo & written tribute",
          "Cow-welfare impact certificate"
        ]
      },
      {
        code: "FOUNDING_RESERVATION",
        name: "Founding Wall Reservation",
        price: 250,
        physical: false,
        available: true,
        refundable: true,
        blurb: "A fully refundable deposit that holds a priority selection window for an approved niche later. No ashes are accepted at this stage.",
        includes: [
          "Priority selection window",
          "Applied to an approved niche later",
          "Fully refundable — clear refund terms"
        ]
      },
      {
        code: "STANDARD_NICHE",
        name: "Standard Individual Niche",
        price: 995,
        physical: true,
        available: false,
        refundable: false,
        blurb: "Protected niche, standard urn system, photo plaque, installation, and memorial page.",
        includes: ["Protected individual niche", "Standard urn system & photo plaque", "Installation + memorial page"]
      },
      {
        code: "PREMIUM_NICHE",
        name: "Premium Eye-Level Niche",
        price: 1295,
        physical: true,
        available: false,
        refundable: false,
        blurb: "The standard package with preferred eye-level placement.",
        includes: ["Everything in Standard", "Preferred eye-level placement"]
      },
      {
        code: "COMPANION_NICHE",
        name: "Companion Niche",
        price: 1795,
        physical: true,
        available: false,
        refundable: false,
        blurb: "Placement for two companion animals with a shared plaque.",
        includes: ["Placement for two companions", "Shared memorial plaque"]
      },
      {
        code: "FAMILY_NICHE",
        name: "Family Niche",
        price: 2995,
        physical: true,
        available: false,
        refundable: false,
        blurb: "Placement for up to four companion animals, subject to size limits.",
        includes: ["Placement for up to four animals", "Subject to size limits"]
      }
    ],

    // Add-ons (Phase B / after approvals)
    addons: [
      { code: "PRIVATE_CEREMONY", name: "Private Remembrance Ceremony", price: 350, available: false, note: "After visitor-use approval" },
      { code: "ANNUAL_FLOWERS", name: "Annual Flowers & Photo", price: 75, per: "year", available: false, note: "After installation" }
    ]
  };
})();
