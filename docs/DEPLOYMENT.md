# Cloudflare deployment

## What is configured in the repository (branch `site-rebuild`)
- `scripts/build-dist.js` builds `dist/` from an explicit allowlist: root `*.html`, `styles.css`, `home.css`, `site-header.css`, `site-header.js`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, and the `assets/` and `questions/` directories. A new top-level file is **not** published unless it is added to that list.
- `wrangler.jsonc`: Workers static assets, `directory: ./dist`, `html_handling: auto-trailing-slash` (clean URLs), `not_found_handling: 404-page` (uses `404.html`).
- `_redirects`: `/questions/unlike-jesus` and `/questions/unlike-jesus.html` -> `/questions/hypocrites` (301).
- `dist/` is git-ignored. If the build step is missing, the deploy fails instead of publishing the repository root.
- `scripts/check-dist.js` (`npm run check:dist`): dist contains only public files; no forbidden paths; no dangling links, assets, `url()`s, sitemap entries or redirect targets.
- `scripts/verify-deployment.js <url>` (`npm run verify:deployment -- <url>`): run against a deployed preview or production URL; asserts the developer paths return 404, public pages and clean URLs work, the retired page redirects, and security headers are present.

## Pages or Workers?
It is **Workers** (static assets), not Pages: the account has a Worker named `christianityapparently-com` and the Pages-to-Workers guide applies to the other direction. I could list Workers but have no tool that reads Pages projects, the Worker's build settings or its Git connection, so the existing dashboard settings are **not verified**.

## Dashboard changes needed (manual; I cannot make them)
Workers & Pages -> `christianityapparently-com` -> Settings -> Builds:
1. Root directory: `/`
2. Build command: `node scripts/build-dist.js` (no npm install needed)
3. Deploy command: `npx wrangler deploy`
4. Non-production branch deploy command: `npx wrangler versions upload`
5. **Remove any `--assets=...` flag or other override** from the deploy command. A command-line assets directory takes precedence over `wrangler.jsonc` and would keep publishing the repository root.
Do this before merging to `main`; until then the production worker still follows whatever it follows today.

## Verification status
| Check | Result |
|---|---|
| `check-dist` (allowlist, no forbidden paths, no dangling references) | PASS |
| Excluded paths (`/docs`, `/scripts`, `/tests`, `/questions-data.json`, `/package.json`, `/README.md`, `/wrangler.jsonc`, `/.git`, `/.github`, ...) against a static server serving only `dist/` | 404 (Playwright test, 3 viewports) |
| Public pages, assets, clean URLs against the same server | 200 |
| Full browser suite served from `dist/` | see report |
| `wrangler deploy` / `wrangler dev` of `wrangler.jsonc` | **NOT VERIFIED**: wrangler could not be installed here (npm registry unreachable from this sandbox) |
| `_redirects` actually redirecting; `_headers` applied; 404 page handling on the live Workers runtime | **NOT VERIFIED**: needs a deployed preview; run `npm run verify:deployment -- <preview-url>` |
| Production site unchanged | Not touched; `main` is unchanged |
