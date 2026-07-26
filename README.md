# TruckYeah Trader — Website

A fast, static marketing website for **TruckYeah Trader**. No frameworks, no build step, no server code. Just plain HTML, CSS, and JavaScript.

To preview it on your computer, **double-click `index.html`** — it opens in your web browser.

---

## 📁 What's in this folder

```
truckyeah-site/
├── index.html          ← all the page text lives here
├── styles.css          ← colors, fonts, layout (rarely need to touch)
├── script.js           ← menu + contact form behavior
├── robots.txt          ← tells Google it can index the site
├── sitemap.xml         ← lists your page for search engines
├── README.md           ← this file
└── assets/
    ├── logo-full.jpg        ← your full logo (shown in the hero)
    ├── logo-mark.png        ← truck emblem cropped from your logo (nav + icons)
    ├── favicon.ico          ← tab icon (generated from your logo emblem)
    ├── apple-touch-icon.png ← iOS home-screen icon (from your logo emblem)
    └── og-image.jpg         ← social-share image, 1200×630 (from your logo)
```

All the image assets are already generated from the TruckYeah Traders logo you provided — nothing to add. To change them later, replace the file of the same name in `assets/` (see Section 4).

Tip: In `index.html`, anything you'll likely want to change is marked with a comment like `<!-- EDIT: ... -->`. Search the file for **EDIT** to jump between them.

---

## 1. ✅ Placeholders you MUST replace before going live

Open `index.html` in any text editor (even Notepad / TextEdit) and replace these. Some also appear in `script.js` and the structured-data block.

| Placeholder | Where (file) | Replace with |
|---|---|---|
| `[YOUR_FORMSPREE_ENDPOINT]` | `index.html` — form `action` | Your Formspree URL (see **Section 2**). Until you do this, the form shows a friendly "not connected yet" message. |
| `[YOUR FOUNDING OFFER ...]` | `index.html` — Founding Drivers section | Your real intro offer, e.g. `5% intro rate for the first 10 drivers`. |
| `[TEAM MEMBER NAME]` (×2) | `index.html` — Who We Are | Real first names/roles of your two dispatchers. |
| `[YOUR FEE %]` (×2) | `index.html` — Pricing card **and** FAQ | Your real percentage, e.g. `7%`. |
| `dispatch@truckyeahtraders.com` | `index.html` — Contact, Footer, JSON-LD | Your real email (3 spots). |
| Hours | `index.html` — Contact, Footer, JSON-LD | Currently set to **Open 24/7** to match the logo. If that ever changes, update all 3 spots. |
| `[YOUR STREET ADDRESS]`, `[YOUR CITY]`, `[YOUR STATE]`, `[YOUR ZIP]` | `index.html` — JSON-LD block in `<head>` | Your business address (helps local SEO). |
| `[CONFIRM: ...]` notes in FAQ | `index.html` — FAQ | Confirm the answer, then delete the `[CONFIRM ...]` note. |

**Phone number** is already set everywhere to **+1 970-788-2896** (`tel:+19707882896` / `sms:+19707882896`). If it ever changes, do a find-and-replace for `9707882896` across `index.html` and `script.js`, and update the JSON-LD (`+1-970-788-2896`).

> **Honesty rule (important):** This site intentionally contains **no statistics, no "loads booked" numbers, no years-in-business, and no reviews/testimonials** — because you're brand new. **Do not add fake numbers or reviews.** Your authority comes from being real, reachable, bilingual, and transparent. Keep it that way.

---

## 2. 📨 Turn on the contact form (no signup needed)

A static site can't email you on its own, so the form uses a free service called **FormSubmit** to email leads to you. **There's no account to create** — it's already wired up. You just need to activate it once.

**Where leads go right now:** `dispatch@truckyeahtraders.com`

### Activate it (one time, ~1 minute)
1. Put the site online (Vercel or GoDaddy), open it, and **submit the contact form once** yourself (any test info is fine).
2. FormSubmit will email an **activation link** to `dispatch@truckyeahtraders.com`. Open that email and click **"Activate Form."**
3. Done. From now on, every form submission is emailed straight to that inbox — no page reload, with a success message for the driver.

> ⚠️ You must be able to **receive email** at `dispatch@truckyeahtraders.com` to click the activation link. If that mailbox isn't set up yet, see below to point leads at an inbox you can open today.

### Change where leads are sent
Open `index.html`, search for `formsubmit.co`, and edit the email at the end of this line:
```html
action="https://formsubmit.co/ajax/dispatch@truckyeahtraders.com"
```
Swap in any inbox you check (e.g. your Gmail), save, re-upload/redeploy, then re-activate (step 1–2 above) for the new address.

### Prefer Formspree instead?
If you'd rather use Formspree: create a free form at **https://formspree.io**, copy your endpoint (looks like `https://formspree.io/f/abcdwxyz`), and replace the whole `action="..."` value with it. The rest of the form keeps working as-is (you can delete the three hidden `_subject` / `_template` / `_captcha` inputs — those are FormSubmit-only).

---

## 3. 🚀 Upload to GoDaddy (get it live at your domain)

### Option A — File Manager (easiest, no extra software)

1. Log in at **godaddy.com** → **My Products**.
2. Find your **Web Hosting** plan → click **Manage**.
3. Open **cPanel** (or "cPanel Admin").
4. In cPanel, open **File Manager**.
5. Go into the **`public_html`** folder. This is your website's home.
   - If there's a default `index.html` or "coming soon" file already in there, delete it.
6. Click **Upload** and select **all** the files from this `truckyeah-site` folder — including the `assets` folder's contents.
   - Easiest way: on your computer, **zip** the *contents* of `truckyeah-site` (select the files, right-click → Compress). Upload the `.zip` into `public_html`, then right-click it in File Manager → **Extract**. Delete the zip afterward.
   - ⚠️ Make sure `index.html` ends up **directly inside `public_html`**, not inside a sub-folder. The `assets` folder should sit next to it.
7. Visit **https://truckyeahtraders.com** — your site should load. (Give DNS a few minutes if it's a new domain.)

### Option B — FTP (if you prefer)

1. In GoDaddy, create/find your **FTP** username and password (cPanel → "FTP Accounts").
2. Download **FileZilla** (free) from filezilla-project.org.
3. Connect using the FTP host, username, and password from GoDaddy.
4. On the right side, navigate into **`public_html`**.
5. Drag all files from this folder (left side) into `public_html` (right side), keeping the `assets` folder structure.
6. Visit your domain to confirm.

---

## 4. 🖼️ Swapping images, logo, and icons

**Hero logo (the big image on the right):**
The hero shows your full logo, `assets/logo-full.jpg`. To use a different image, just replace that file with a new one of the same name (an optimized JPG, ideally under ~250 KB).

**Logo / business name:**
The name "TruckYeah **Traders**" is plain text in the top-left and footer (search `brand-name` in `index.html`). The little truck emblem next to it is `assets/logo-mark.png` (cropped from your logo). Swap that file to change the mark.

**Icons & social image (already generated from your logo):**
- `assets/favicon.ico` (browser tab) and `assets/apple-touch-icon.png` (iOS home screen) were made from your logo's truck emblem.
- `assets/og-image.jpg` (1200×630) is the picture shown when your link is shared on WhatsApp/Facebook/etc.
- To change any of them, replace the file of the same name. If you'd rather regenerate a crisp favicon set from scratch, upload your logo at **https://favicon.io** and drop the downloaded `favicon.ico` / `apple-touch-icon.png` into `assets/`.

**Stats & testimonials:**
There are **none** on this site, on purpose (you're new — see the honesty rule above). Don't add fake ones. When you genuinely have happy drivers later and their permission, you can add a simple quotes section then.

---

## 5. 🔒 Keep HTTPS on + final reminders

- **SSL/HTTPS:** GoDaddy hosting usually includes a free SSL certificate. Make sure your site loads with the **padlock** (`https://`). In GoDaddy you can turn on "Force HTTPS" so visitors always get the secure version. This is important for trust and Google ranking.
- **No fake numbers or reviews — ever.** It's the fastest way to lose driver trust (and it can violate advertising rules).
- **Compliance:** Confirm your dispatch model and fee arrangement follow current **FMCSA** rules and your state's laws before launch. The site text is general information, **not legal advice** — check with a transportation attorney or compliance pro if unsure. (There's a reminder comment in the Pricing section of `index.html` and a disclaimer in the footer.)
- After any edit, just re-upload the changed file(s) to `public_html` and refresh.

---

Questions while editing? Every section in `index.html` is labeled with a big comment header (e.g. `<!-- 7. PRICING / FEES -->`) so you can find and change text quickly.
