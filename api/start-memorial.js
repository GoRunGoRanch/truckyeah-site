// POST /api/start-memorial
// Creates a DRAFT memorial record and returns its memorial_id + portal token.
// Called before checkout so the pet details/photo attach to one memorial ID.
const { supa, readJson, send, newMemorialId, token } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const body = await readJson(req);
    const pet_name = (body.pet_name || "").toString().slice(0, 120).trim();
    if (!pet_name) return send(res, 400, { error: "Please enter your pet's name." });

    const privacy = ["private", "unlisted", "public"].includes(body.privacy) ? body.privacy : "private";
    const consent = body.consent_owns_image === true;
    if (!consent) return send(res, 400, { error: "Please confirm you own this photo or have permission to use it." });

    const memorial_id = newMemorialId();
    const access_token = token();

    const { error } = await supa().from("gorungo_memorials").insert({
      memorial_id,
      access_token,
      owner_email: (body.owner_email || "").toString().slice(0, 200).trim() || null,
      pet_name,
      species: (body.species || "").toString().slice(0, 60).trim() || null,
      date_from: (body.date_from || "").toString().slice(0, 40).trim() || null,
      date_to: (body.date_to || "").toString().slice(0, 40).trim() || null,
      tribute: (body.tribute || "").toString().slice(0, 4000).trim() || null,
      privacy,
      consent_owns_image: consent,
      status: "DRAFT"
    });
    if (error) throw error;

    // Optional: a signed upload URL so the family can attach a photo to
    // Supabase Storage without the service key ever reaching the browser.
    let upload = null;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (bucket && body.photo_ext) {
      const ext = String(body.photo_ext).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      const objectKey = `memorials/${memorial_id}/original-${token(8)}.${ext}`;
      const { data, error: upErr } = await supa().storage.from(bucket).createSignedUploadUrl(objectKey);
      if (!upErr && data) {
        await supa().from("gorungo_memorials").update({ photo_key: objectKey }).eq("memorial_id", memorial_id);
        upload = { path: objectKey, token: data.token, signedUrl: data.signedUrl, bucket };
      }
    }

    return send(res, 200, { memorial_id, access_token, upload });
  } catch (e) {
    return send(res, 500, { error: "Could not start the memorial. " + (e.message || "") });
  }
};
