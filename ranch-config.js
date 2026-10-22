/* =========================================================
   GoRunGo Ranch — single source of truth for packages & flags
   ---------------------------------------------------------
   EDIT PRICES HERE ONLY. Do not hard-code dollar amounts in the
   pages — every card renders from this file (per the vision brief:
   "Prices ... must be editable in one configuration file ... Claude
   must not hard-code dollar amounts across multiple components").

   `available:true`  -> orderable now (a living memorial dedication).
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
        name: "Founding Memorial Dedication",
        price: 250,
        physical: false,
        available: true,
        refundable: true,
        blurb: "A fully refundable deposit that begins your living memorial tribute — applied to your dedication.",
        includes: [
          "Begins your living tribute",
          "Applied to your dedication",
          "Fully refundable — clear terms"
        ]
      },
      {
        code: "STANDARD_NICHE",
        name: "Memorial Planting",
        price: 995,
        physical: true,
        available: false,
        refundable: false,
        blurb: "A living plant dedicated to a pet or person, with a name plaque, tended in the greenhouse.",
        includes: ["A dedicated living plant", "A name plaque beside it", "Tended within the greenhouse", "Online memorial page"]
      },
      {
        code: "PREMIUM_NICHE",
        name: "Memorial Tree",
        price: 1295,
        physical: true,
        available: false,
        refundable: false,
        blurb: "A living tree dedicated to a loved one, in a prime spot within the greenhouse.",
        includes: ["A dedicated living tree", "A prime place in the greenhouse", "Name plaque + memorial page"]
      },
      {
        code: "COMPANION_NICHE",
        name: "Companion Planting",
        price: 1795,
        physical: true,
        available: false,
        refundable: false,
        blurb: "A shared living planting for two companions, with a shared plaque.",
        includes: ["A planting for two companions", "Shared name plaque", "Online memorial page"]
      },
      {
        code: "FAMILY_NICHE",
        name: "Family Garden",
        price: 2995,
        physical: true,
        available: false,
        refundable: false,
        blurb: "A garden bed grown in honor of up to four loved ones.",
        includes: ["A garden for up to four", "Name plaques for each", "Online memorial page"]
      }
    ],

    // Add-ons (Phase B / after approvals)
    addons: [
      { code: "PRIVATE_CEREMONY", name: "Private Remembrance Ceremony", price: 350, available: false, note: "After visitor-use approval" },
      { code: "ANNUAL_FLOWERS", name: "Annual Flowers & Photo", price: 75, per: "year", available: false, note: "After installation" }
    ]
  };
})();
