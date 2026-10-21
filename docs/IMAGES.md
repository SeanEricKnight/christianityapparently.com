# Self-hosting the images

The pages still hotlink 18 Wikimedia Commons images (the 19th, the Nicaea painting, is already local). The sandbox that prepared this work has no internet access, so the download step has **not** been run.

On a machine with internet access:
```bash
git checkout site-rebuild && git pull
npm install --no-save sharp
node scripts/localize-images.js --dry-run   # list the 18 files and the local names
node scripts/localize-images.js             # download, optimize (max 1600 px, JPEG q80), rewrite pages
npm run build && node scripts/check-static.js && node scripts/build-dist.js && node scripts/check-dist.js
npx playwright test                          # the "images are self-hosted" test switches on automatically
```
- Output: `assets/images/<slug>.jpg` plus `assets/images/MANIFEST.json` (source file page, original and local size, bytes, SHA-256, fetch time).
- The script sends a descriptive User-Agent, waits between requests and retries on HTTP 429 (Wikimedia rate-limits generic clients).
- `credits.html` is not touched: creator, source and licence text and the Commons file-page links stay. Check each credit against its Commons page; licences were not verified in the sandbox.
- Visually compare each local image with its Commons page (the script validates that the download is an image, not that it is the right one).
- Tested here only against a local mock server (retry, resize, manifest, page rewrite). Not tested against Commons.
