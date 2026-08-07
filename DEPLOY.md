# Armtrex website — deployment notes

## 1. Before going live — placeholders to fill in

`src/data/company.js` has the real details you've sent so far:

- ~~`registrationNumber`~~ ✅ `16573545`
- ~~`contact.website`, `contact.email`~~ ✅ `armtrex.co.uk` / `info@armtrex.co.uk`
- ~~`addresses.headquarters.lines`~~ ✅ Armtrex Ltd Office 3, 708 High Road, London, N12 9QL
- ~~`contact.kycEmail`~~ ✅ `info@armtrex.co.uk` (confirmed — same inbox as general contact)

The real Armtrex logo (`public/assets/brand/logo-badge.png`) is now in place —
extracted from the logo file you sent, using the dark-background badge
version (green square, white "A", white ARMTREX wordmark) since the whole
site is dark-themed. A light-background variant is also saved at
`public/assets/brand/logo-light-bg.jpg` if you ever need it for something
printed on a white/light background (e.g. a letterhead or light-mode doc).

## 2. What changed, architecturally

Product specifications (descriptions, calibers, velocities, ranges) no
longer ship in the public website bundle. They live only in
`worker/data/products.js`, served by the Cloudflare Worker's
`/api/products` endpoint, which requires a valid signed access token. This
was a deliberate, verified change — see the chat for how it was checked
(grepped the built JS bundle to confirm none of the 23 gated products'
data is present, only the 4 public hero teasers).

The site is now a **Cloudflare Worker with static assets** (`wrangler.jsonc`),
not a plain static site — the API routes need a real Worker runtime.

## 3. Deploying

```bash
npm install
npm run build          # outputs to dist/
npx wrangler deploy    # requires a Cloudflare account + `wrangler login`
```

### Required secret

```bash
npx wrangler secret put ACCESS_TOKEN_SECRET
# paste a long random value, e.g. output of: openssl rand -hex 32
```

This signs/verifies the 14-day access links. **Rotating it immediately
invalidates every outstanding link** — useful if one ever leaks somewhere
it shouldn't.

### KYC email delivery — pick ONE option

**Option A (recommended if you already run `server/contact_service.py`
on a VPS for the contact form):** forward KYC submissions to that same
relay, reusing your existing Proton SMTP credentials — no new accounts.

1. On the VPS, add to `/etc/armtrex-contact.env`:
   ```
   KYC_MAIL_TO=info@armtrex.co.uk
   KYC_RELAY_SECRET=<same long random value as below>
   ```
   Restart the service: `systemctl restart armtrex-contact`
   (the systemd unit doesn't need changes — same script, same port).
2. On Cloudflare:
   ```bash
   npx wrangler secret put KYC_RELAY_URL
   # e.g. https://your-vps-domain.example/api/kyc
   npx wrangler secret put KYC_RELAY_SECRET
   # same value as KYC_RELAY_SECRET on the VPS
   ```

**Option B (fully standalone Worker, no VPS):** send via the
[Resend](https://resend.com) REST API (free tier: 100 emails/day). Cloudflare
dropped free MailChannels access for Workers in Aug 2024, so a REST provider
is the standalone option now — swap the fetch call in `worker/index.js`
for a different provider (Postmark, SES, etc.) if you'd rather not use Resend.

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM      # e.g. "Armtrex KYC <kyc@armtrex.co.uk>"
npx wrangler secret put KYC_TO_EMAIL     # e.g. info@armtrex.co.uk
```

If both `KYC_RELAY_URL` and `RESEND_API_KEY` are set, the relay option wins.

## 4. Day-to-day: issuing access after KYC review

A submission arrives by email with all the buyer's details and their
passport copy attached. After your team reviews and clears it:

```bash
ACCESS_TOKEN_SECRET=<same value as wrangler secret> \
  node scripts/generate-access-link.mjs 14 https://your-real-domain.com
```

This prints a link like `https://your-real-domain.com/products?access=...`,
valid for 14 days (change the first argument for a different window). Send
it directly to the cleared individual — it's a bearer credential like a
magic link, so treat it the same way (don't post it anywhere public).

## 5. Rate limiting — one gap worth knowing about

The Worker's in-memory rate limiting on `/api/kyc` is best-effort only
(each Worker isolate has its own counters and isolates are ephemeral/
regional — this is not a hard global cap). For real protection against
abuse, add a **Cloudflare Rate Limiting rule** on `/api/*` from the
dashboard (Security → WAF → Rate limiting rules) once the site is live.

## 6. Still outstanding

I wasn't able to open the live `armtrex-website...workers.dev` link in a
browser this session (the Claude-in-Chrome extension wasn't connected), so
I haven't visually compared this build against whatever design changes
exist there. If that link has design differences you want carried over,
either share screenshots or reconnect the browser extension and I'll do a
side-by-side pass.
