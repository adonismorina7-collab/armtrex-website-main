# Armtrex Website

React + Vite website for Armtrex Ltd.

## Project structure

- `src/` — React application source
- `public/assets/` — original Armtrex images and branding used by the site
- `worker/` — Cloudflare Worker API for KYC access verification and protected catalogue delivery
- `scripts/` — access-link utility
- `wrangler.jsonc` — Cloudflare Workers Static Assets configuration

## KYC / Products access

The Products routes remain protected by the existing KYC access flow. Visitors without a valid access token are sent to the KYC access page; approved access links are verified by the Worker.

Do not remove the `ProductGate`, `CatalogContext`, or Worker access verification when making future changes.

## Local development

```bash
npm install
npm run dev
```

## Check the code

```bash
npm run lint
npm run build
```

The production build is written to `dist/`.

## Cloudflare deployment

This project uses a Cloudflare Worker with Static Assets. The `wrangler.jsonc` file points Wrangler at `dist/` and enables SPA routing and Worker-first handling for `/api/*`.

```bash
npm run deploy
```

Before deploying, configure the required Worker secrets in Cloudflare. Never commit `.env` files, access-token secrets, API keys, SMTP credentials, or other private credentials.

## GitHub

Commit the source project, `package.json`, `package-lock.json`, `public/`, `src/`, `worker/`, `scripts/`, and configuration files.

Do **not** commit `node_modules/` or generated `dist/`.

If the repository contains the protected Worker catalogue in `worker/data/products.js`, keep the GitHub repository private unless you intentionally want that source data to be publicly accessible.
