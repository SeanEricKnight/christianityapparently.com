# Site rebuild — branch `site-rebuild` (not merged)

Base: `main` @ `389ac39`. `main` untouched. **Do not merge until the screenshots have been reviewed by eye and the `ONLINE=1` run is done.**

## RECOMMENDATION: NOT READY TO MERGE (one gate left)
Everything that can be verified without internet passes. The one gate left is **a pass with real internet access**: this environment blocks Wikimedia, Unsplash and Google Fonts, so no external image or font has ever been loaded or looked at in this work. Merge once someone with internet has (1) run `ONLINE=1 npm run test:browser` and (2) looked at the pages with the real images and fonts loaded (checklist under "Needs a networked pass").

**Browser suite, final run: 300 of 300 passed, 0 failed, 0 flaky, 3.2 min** (Chromium via Playwright 1.56, 4 workers, offline for third parties). 300 = 95 pages x 3 widths (1440/768/390) + 15 behaviour tests. Raw results `docs/test-run/results.json`; screenshots `docs/test-run/screens/`. `main` untouched, nothing merged.

### Progression
First browser run 21/297 -> 295/297 -> 297/297 -> after the final-review changes below 300/300 (three more pages/tests were added: credits page).

### Three review areas, kept separate

**1. Historical / content accuracy** (read all 95 pages; checked high-risk claims against sources)
Verified OK: Bible references on the 50 question pages and the main pages point to the passages they name; council dates and decisions match standard chronology; textual-criticism claims on `bible-problems` (Mark 16:8 ending, John 7:53-8:11, 1 John 5:7-8, P52 dating) match scholarly consensus; "18 problems" count is correct.
Fixed:
- **Wrong phone number**: `hurting.html` listed the Billy Graham prayer line as 855-255-PRAY (7729); no source supports that. The ministry's own article (June 2023) gives **888-388-2683**; replaced. Worth a human re-check since numbers change.
- **Heel bone image is a replica**: Biblical Archaeology Review says the displayed Givat ha-Mivtar heel bone at the Israel Museum is a replica; captions/alt/homepage text now say so, and mention that the find's date and interpretation are debated.
- **Garden Tomb**: "most archaeologists date it before the first century" was stronger than sources support; now "archaeologists such as Gabriel Barkay date it centuries earlier, to the Iron Age" (Barkay: 8th-7th c. BCE).
- **Book of Kells** (c. 800 AD) was shown under "Did Jesus actually exist? Historical sources" with a generic alt; the tile now says it is later medieval art, not evidence.
- **Hell and fairness**: already covered by six question pages (`hell-finite-life`, `created-for-hell`, `never-hear`, `loving-judge`, `honest-unbelief`, `geography`), linked from the afterlife page. The short answer on `hell-finite-life` was thin, so I added one paragraph on how each position answers the fairness objection (eternal conscious punishment; conditional immortality, citing Stott's tentative 1988 view; hopeful/universal-restoration, with Origenist forms condemned in the 6th century) and links to the never-heard / honest-unbelief pages. No new page or section.
- **Image credits**: new small `credits.html` (linked from About, in sitemap) lists all 19 external images with what each is (photo / replica / painting / medieval art) and a link to its Commons file page, where author and licence are recorded. **Licences and authors were not verified** (Commons is unreachable from here); attribution is by link, which may not satisfy every CC licence's attribution wording.
Not verified: whether each Wikimedia image actually depicts what its caption claims (never loaded). Judged from filenames, captions and general knowledge only. Known imperfect pairing kept and captioned: the Chalcedon painting under "Why did the churches divide?" (East-West schism was 1054).

**2. Functionality**: 300/300 browser tests (above); static checks pass for 95 pages (identical header, every internal link and anchor resolves, JS parses, alt text, no profanity, no numbering, sitemap coverage, **and now CSS checks**); regenerating the 50 question pages changes nothing.

**3. Visual design** (screenshots viewed; offline, so photos absent)
Found and fixed:
- **Stock photography was still on the site.** Every interior page carried a 150-240px decorative banner under its title, drawn by CSS from 13 Unsplash photos. My earlier "no Unsplash" check only scanned HTML. All of it removed (46 rules, 13 custom properties, the Unsplash credit comment), plus the course-card photo strips. Question pages are ~260px shorter on desktop. `check-static` now fails on any Unsplash/photo reference or external `url()` in CSS; confirmed it fails on the old stylesheet.
- **Inconsistent heroes**: question/Bible/About pages had full-width bands; Life, Courses, Grow, Basics, Gospel and course pages had narrower inset boxes (820px inside a 976px column). All are now full-width bands with text aligned to the content column (measured at 1440/768/390, zero horizontal overflow).
- Header: identical across all 95 pages (pixel-compared to the homepage).
Judged fine: Councils layout, homepage cards, question pages, footers.
Not changed (noted): homepage is the longest page (9,491 px desktop, 14,841 px mobile). Cards are already compacted on mobile (210px image cap); the rest is content (5 card sections + the scroll-driven section). Further shortening means restructuring, which I did not do.
Minor, left alone: hero text sits 26px right of body text on question pages; the Original Experience photo caption sits tight above the scroll cue on mobile; Original Experience's scroll sequence can't be judged from static screenshots (tests confirm its end states only).

### Visitor experience (read through, navigating as a first-time visitor)
Works: homepage "Where do you start?" routes to Basics, Questions and the Gospel; Basics lists every doctrine page; evidence, manuscript and Bible-problem material is reachable from homepage cards; the Jesus / resurrection path (jesus -> resurrection evidence question) is clear; practical following-Jesus pages are reachable from Gospel -> "I did this" -> Grow, and from the footer.
Friction (documented, not changed; these are structural decisions for the owner):
- **Header nav has no Basics / Gospel / Life / Grow entry.** "What does Christianity teach?" and "how do I follow Jesus?" are reachable only from the homepage's last section or the footer of inner pages. Adding "Start here" to the nav is the single most useful change.
- Overlap: `grow`, `following` and the four `course-*` pages cover similar ground.
- Homepage repeats some destinations (e.g. "Has the Bible been changed?" appears as an evidence tile and again in the Bible section).
- `bible-problems` (12.7k px mobile) is long by design (18 case files); a table of contents or accordions would help.

### Needs a networked pass (cannot be done here)
1. `ONLINE=1 npm run test:browser`.
2. Look at the homepage, Councils, Original Experience and a few question pages with real images: each image matches its heading/caption; fonts (Space Grotesk, Source Serif) render; no broken Wikimedia links (`Special:FilePath` hotlinks can be rate-limited).
3. Confirm each image's author/licence on its Commons page and adjust `credits.html` attribution wording if needed.
4. Re-confirm the prayer-line number.

## What changed
| Area | Change |
|---|---|
| Shared header | One header (homepage values) generated by `scripts/shell.js`, injected into all 94 pages between `<!--SHELL:HEADER-->` markers by `scripts/build-shell.js`. Styles in `site-header.css`, menu in `site-header.js`. Container width, border, ≤1050px compaction, mobile hamburger now match the homepage. Skip link added. |
| Legacy header code | Deleted 48 `.site-header/.site-nav/.nav-cta` selectors from `styles.css` (`!important` 114→71), the homepage's own header CSS/JS, the Original Experience topbar + overlay menu. |
| Generator | `scripts/build-questions.js` now finishes by applying the shell; question footer/hub footer templates match the committed ones. **Regenerating gives 0 changed files** (checked in a scratch copy). |
| Homepage | CSS moved to shared `home.css`. Cinematic: photo-as-link overlays removed, inactive scenes/panels `inert`, ticker duplicates hidden from keyboard/AT, sticky stage offset for the header, `svh` units, dead CSS (nail/tomb/etc.) removed, heights 250svh/260svh. Copy: "WAS THE TOMB EMPTY?", hedged heel-bone and Garden Tomb text, CTA "EXAMINE THE ROMAN SOURCES". |
| Story cards | Every image now has a caption saying artifact / location / later artwork; crucifixion card uses the heel-bone photo instead of Rembrandt; image link no longer a duplicate tab stop. |
| Councils | `councils.html` rebuilt (64 KB → 19 KB): real council list/search/modal/regional cases + labelled Surikov paintings, shared header, same `home.css`. All 12 Unsplash stock photos gone. Added to sitemap. |
| Original Experience | Shared header; overlay removed (mobile now has the 5 site links); side dots scroll to their scenes; **fixed hero text being opacity 0 at top of page** (scene 1 `data-start` was 0); chapter/text fades aligned; reduced-motion handled live; dead book/nail/tomb markup+CSS removed; one `.journey` height (270svh); lower-section padding compacted; meta description + canonical. |
| Content | Numbering elements removed (`gospel`, 4 course pages, `bible-problems`) with their grid columns; sitemap +3; `bible-problems` canonical extensionless. (Profanity and the 2 dead links were already fixed on `main` by ChatGPT.) |
| Tooling | `npm run build`, `npm run check` (build + `git diff --exit-code` + static checks), `npm run test:browser`. |

## Verified (static, run in this session)
`node scripts/check-static.js` → **PASS on all 94 pages**: exactly one shared header, identical across pages; no competing header classes; every internal link and `#anchor` resolves; inline JS parses and every `getElementById` target exists; every `<img>` has `alt`; no profanity; no numbering elements; no Unsplash; sitemap covers all pages; canonicals extensionless.
`bash regen check` → generator output identical to committed files (0 differences).

## To re-run
```bash
git checkout site-rebuild && npm install && npx playwright install chromium
npm run test:browser           # offline for third parties
ONLINE=1 npm run test:browser  # also require Wikimedia images/fonts
```

## Where to look by eye (tests cannot judge these)
1. Legacy interior pages after deleting `.site-header` CSS: top spacing under the new header.
2. Original Experience: sticky stage now starts below the header (`top/height` use `--ca-header-h`); scroll math changed.
3. Homepage after moving inline CSS to `home.css` (should be identical; check hero and ticker).
4. Councils row grid (4 columns, no id column).

## Decisions / things I did not do
- **Images not self-hosted** (downloads are blocked here). All imagery still hot-links Wikimedia; no credits page yet.
- **"Why did the churches divide?"** still shows the 1876 Chalcedon painting (now honestly captioned). A better image (e.g. Hagia Sophia) needs a verified Commons file; I did not guess a URL. Same for Hammurabi/Muratorian/Constantine-head ideas from the audit.
- Heel-bone photo: confirm whether the museum object is original or a replica.
- Gospel page keeps its numbered stepper buttons ("1 God, 2 Broken…") as functional navigation; only the large decorative numerals were removed. Say if you want those gone too.
- Footers are not unified (only the header is shared); question-page footers are generated.
- Live deployment/Cloudflare behavior (clean-URL redirects) not checked.
