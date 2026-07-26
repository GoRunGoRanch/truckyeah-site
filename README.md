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
    ├── favicon.svg      ← the little tab icon (placeholder — swap for your logo)
    ├── favicon.ico      ← (YOU ADD — see step 4)
    ├── apple-touch-icon.png ← (YOU ADD — see step 4)
    ├── og-image.jpg     ← (YOU ADD — social-share image, 1200×630)
    └── hero.jpg         ← (OPTIONAL — your highway/truck photo)
```

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
| `dispatch@truckyeahtrader.com` | `index.html` — Contact, Footer, JSON-LD | Your real email (3 spots). |
| `Mon–Sat, 7am–9pm CT` | `index.html` — Contact, Footer, JSON-LD | Your real hours (3 spots). |
| `[YOUR STREET ADDRESS]`, `[YOUR CITY]`, `[YOUR STATE]`, `[YOUR ZIP]` | `index.html` — JSON-LD block in `<head>` | Your business address (helps local SEO). |
| `[CONFIRM: ...]` notes in FAQ | `index.html` — FAQ | Confirm the answer, then delete the `[CONFIRM ...]` note. |

**Phone number** is already set everywhere to **+1 970-788-2896** (`tel:+19707882896` / `sms:+19707882896`). If it ever changes, do a find-and-replace for `9707882896` across `index.html` and `script.js`, and update the JSON-LD (`+1-970-788-2896`).

> **Honesty rule (important):** This site intentionally contains **no statistics, no "loads booked" numbers, no years-in-business, and no reviews/testimonials** — because you're brand new. **Do not add fake numbers or reviews.** Your authority comes from being real, reachable, bilingual, and transparent. Keep it that way.

---

## 2. 📨 Set up the contact form (free Formspree)

The form needs a free service to email you submissions (a static site can't email on its own).

1. Go to **https://formspree.io** and create a free account.
2. Click **+ New Form**. Name it (e.g. "TruckYeah Leads") and set the email where you want leads sent.
3. Formspree gives you an endpoint URL like: `https://formspree.io/f/abcdwxyz`
4. Open `index.html`, find this line (search for `YOUR_FORMSPREE`):
   ```html
   action="[YOUR_FORMSPREE_ENDPOINT]"
   ```
   Replace it with your URL:
   ```html
   action="https://formspree.io/f/abcdwxyz"
   ```
5. Save, re-upload `index.html` (see Section 3), and send yourself a test submission. Formspree may ask you to confirm your email the first time.

That's it — the form already submits without reloading the page and shows a success/error message. A hidden anti-spam field is included.

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
7. Visit **https://truckyeahtrader.com** — your site should load. (Give DNS a few minutes if it's a new domain.)

### Option B — FTP (if you prefer)

1. In GoDaddy, create/find your **FTP** username and password (cPanel → "FTP Accounts").
2. Download **FileZilla** (free) from filezilla-project.org.
3. Connect using the FTP host, username, and password from GoDaddy.
4. On the right side, navigate into **`public_html`**.
5. Drag all files from this folder (left side) into `public_html` (right side), keeping the `assets` folder structure.
6. Visit your domain to confirm.

---

## 4. 🖼️ Swapping images, logo, and icons

**Hero image (the big banner):**
By default the hero uses a clean CSS gradient so the page loads fast. To use a real photo:
1. Find a free, royalty-free highway/truck photo (try **Unsplash**, **Pexels**, or **Pixabay** — all free for commercial use).
2. Save it optimized (compressed JPG, under ~200 KB, ~1600px wide) as `assets/hero.jpg`.
3. Open `styles.css`, find `.hero-art` and add this line inside it:
   ```css
   background-image: url("assets/hero.jpg");
   background-size: cover;
   background-position: center;
   ```
   (You can remove the placeholder gradient lines if you like.)

**Logo / business name:**
The name "TruckYeah **Trader**" is plain text in the top-left and footer (search `brand-name` in `index.html`). If you have a real logo, replace the small inline SVG in the header (search `brand-mark`) with an `<img src="assets/logo.svg" ...>`.

**Icons (favicon, apple icon, social image):**
- **favicon.ico** — go to **https://favicon.io**, upload your logo, download the pack, and put `favicon.ico` and `apple-touch-icon.png` into `assets/`.
- **og-image.jpg** — the picture shown when your link is shared on WhatsApp/Facebook/etc. Make one **1200×630 px**, save as `assets/og-image.jpg`. (Your name + tagline on your brand navy background works great.)
- Until you add these, the site still works — browsers just use the SVG icon and skip the share image.

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
