// Run against a DEPLOYED URL (preview or production):
//   node scripts/verify-deployment.js https://<preview-or-domain>
// Confirms developer paths are NOT served, public pages/clean URLs/redirects/headers work.
const base = (process.argv[2] || "").replace(/\/$/, "");
if (!base) { console.error("usage: node scripts/verify-deployment.js <base-url>"); process.exit(2); }
const fails = []; let n = 0;
const get = async (p, opt = {}) => fetch(base + p, { redirect: "manual", ...opt });
const expectStatus = async (p, want, label) => { n++; const r = await get(p); const ok = Array.isArray(want) ? want.includes(r.status) : r.status === want; if (!ok) fails.push(`${label || p}: expected ${want}, got ${r.status}`); return r; };
// Must be blocked. A soft-404 (200 with the 404 page) also counts as a failure.
const BLOCKED = ["/docs/REBUILD-REPORT.md","/docs/REBUILD-REPORT","/docs/","/scripts/build-dist.js","/scripts/shell.js","/tests/site.spec.js","/questions-data.json","/package.json","/README.md","/playwright.config.js","/wrangler.jsonc","/.git/config","/.github/ISSUE_TEMPLATE/config.yml","/test-report/index.html","/test-results/results.json","/node_modules/","/dist/index.html"];
(async () => {
  for (const p of BLOCKED) await expectStatus(p, 404, "BLOCKED " + p);
  for (const p of ["/", "/index.html", "/questions", "/questions.html", "/questions/hypocrites", "/questions/pagan-myths", "/basics", "/credits", "/councils", "/life", "/robots.txt", "/sitemap.xml", "/styles.css", "/site-header.css", "/home.css", "/site-header.js", "/favicon.svg"]) await expectStatus(p, [200, 307, 308], "PUBLIC " + p);
  const old = await expectStatus("/questions/unlike-jesus", [301, 308], "retired page redirect");
  if (old.status && ![301, 308].includes(old.status)) { /* already recorded */ } else if (!/\/questions\/hypocrites$/.test(old.headers.get("location") || "")) fails.push("retired page redirect target: " + old.headers.get("location"));
  const nf = await get("/definitely-not-a-page-xyz"); n++; if (nf.status !== 404) fails.push("unknown path should be 404, got " + nf.status);
  const h = await get("/"); n++; const hdr = k => h.headers.get(k); if (hdr("x-content-type-options") !== "nosniff") fails.push("missing X-Content-Type-Options header"); if (!/DENY/i.test(hdr("x-frame-options") || "")) fails.push("missing X-Frame-Options header");
  console.log(`${n} checks, ${fails.length} failure(s)`); if (fails.length) { console.error(fails.join("\n")); process.exit(1); }
  console.log("deployment verification passed for " + base);
})().catch(e => { console.error(e); process.exit(1); });
