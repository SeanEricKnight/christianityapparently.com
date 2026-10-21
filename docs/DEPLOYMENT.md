# Cloudflare deployment

The `site-rebuild` branch uses Cloudflare Workers static assets. `wrangler.jsonc` publishes only `./dist`; do not override it with a command-line `--assets` argument.

## Build and deploy

- Repository: `SeanEricKnight/christianityapparently.com`; root directory: `/`.
- Preview build command: `npm run build:dist && node scripts/check-dist.js`.
- Preview deployment command: `npx wrangler preview`.
- `previews: {}` in Wrangler configuration is required by the Workers Previews workflow.
- `build.command` in `wrangler.jsonc` runs `npm run build:dist && node scripts/check-dist.js` before Wrangler uploads assets, including when an existing branch preview skips the dashboard build step.
- Production remains on `main` with deployment command `npx wrangler deploy`. Its build command must be reviewed before merging the rebuild into production.

The preview build command is saved in the Cloudflare dashboard's Builds → Previews Base settings. Production settings were not changed. Preview branch builds are enabled, so pushing a branch can automatically build its preview. Previews are public by default; private previews require Cloudflare Access / Zero Trust setup.

## Published files

`scripts/build-dist.js` builds `dist/` from an explicit allowlist: root HTML, public styles/scripts, favicon, robots, sitemap, `_headers`, `_redirects`, `assets/`, and `questions/`. Developer files, source JSON, docs, tests, reports, Git metadata and dependencies are excluded. `dist/` is git-ignored.

The Nicaea painting is served locally at `/assets/images/first-council-nicaea-surikov.jpg` to avoid Wikimedia request throttling. Its existing credit and Commons source remain on the credits page; other images continue to use their existing sources.

## Checks

```sh
npm run check
npm run check:dist
npm run test:browser
npm run verify:deployment -- https://<deployed-preview-host>
```

The deployment verifier checks real 404s for developer files, public routes, both retired-page redirects, four security headers, homepage navigation staying on the current host, and the local Nicaea image. The browser suite checks layout and interaction at desktop, tablet and mobile sizes; its local static server does not emulate Workers headers or redirect rules.

Local Workers checks passed after these fixes (43 checks). Static checks cover 99 HTML pages. The full Playwright suite was attempted but Chromium launch is blocked by macOS sandbox permissions in this environment; a complete browser pass and remote deployment verification must not be inferred from the local checks.

Reference: https://developers.cloudflare.com/workers/previews/configuration/
Image source: https://commons.wikimedia.org/wiki/File:First_Council_of_Nicea_by_V.Surikov_(1876).jpg
