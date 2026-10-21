# Image localization verification — 21 October 2026

Inspected the remote branches before work. `main` was `f4d83bf`; `self-host-images` was already `66205cb`, containing the localization work after `4683b5e`. No merge or production deployment was performed.

## Fresh verification

- Ran `scripts/localize-images.js` against real Commons in a disposable checkout of `4683b5e`. All 17 images downloaded, the manifest was written, and three pages were rewritten. All 17 resulting SHA-256 hashes exactly match the files already committed at `66205cb`.
- Fully decoded all 19 images with Sharp and verified every manifest hash. The existing Nicaea and Luther image bytes are preserved.
- Fetched fresh Commons imageinfo/extmetadata records for all 19 source files. License labels match the manifest; reviewed creator/source credits and the attribution, license links, modification disclosures and image-specific share-alike statement in `credits.html`. Visually reviewed the 19-image contact sheet against the source descriptions.
- `npm run build:dist`, `node scripts/check-static.js`, and `node scripts/check-dist.js` pass: 99 checked pages and 130 distribution files. Repeated after the requested wording changes.
- Reviewed screenshots in the in-app browser at 1440×900 and 390×844: homepage history, Councils, Original Experience, and the canon and God-exists question pages. Local images appeared and the revised headings fit. This is representative visual review, not a substitute for the automated browser suite.

## Browser suite remains blocked

Attempted the full suite with `ONLINE=1 npm run test:browser`. Playwright reported **6 passed, 321 failed, 0 skipped**. All 321 failures contain the same macOS Chromium startup denial: `bootstrap_check_in ... Permission denied (1100)` in `mach_port_rendezvous_mac.cc`. They occur before browser page assertions can run. The six passing cases do not require a browser.

The three self-hosted-image cases were selected (not skipped), but each failed at browser startup. They have **not passed**. A complete passing run on a host where Playwright can launch Chromium remains required. No test expectations or browser security settings were weakened to obtain a pass.

## Requested wording updates

- Homepage history: “Including the mess.” → “In context.”
- Original Experience opening: “What if we've been asking the wrong questions?” → “Explore the claims. Examine the evidence.”

All changes remain confined to `self-host-images`.
