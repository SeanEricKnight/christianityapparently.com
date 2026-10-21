// Verifies dist/ (the deployed directory) contains only public site files and is self-contained.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), DIST = path.join(ROOT, "dist");
const fails = []; const fail = m => fails.push(m);
if (!fs.existsSync(DIST)) { console.error("dist/ missing: run node scripts/build-dist.js"); process.exit(1); }
const all = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : all.push(path.relative(DIST, p).replace(/\\/g, "/")); } })(DIST);
const ALLOWED_ROOT_FILES = new Set(["styles.css","home.css","site-header.css","site-header.js","favicon.svg","robots.txt","sitemap.xml","_headers","_redirects"]);
for (const f of all) {
  const top = f.split("/")[0], isRootFile = !f.includes("/");
  if (isRootFile && !(f.endsWith(".html") || ALLOWED_ROOT_FILES.has(f))) fail("unexpected root file in dist: " + f);
  if (!isRootFile && !["assets","questions"].includes(top)) fail("unexpected directory in dist: " + f);
  if (top === "questions" && !f.endsWith(".html")) fail("non-html in questions/: " + f);
  if (/(^|\/)\./.test(f)) fail("dotfile in dist: " + f);
}
const FORBIDDEN = ["docs","scripts","tests","test-results","test-report","node_modules",".git",".github","questions-data.json","package.json","package-lock.json","README.md","playwright.config.js","wrangler.jsonc","wrangler.toml"];
for (const n of FORBIDDEN) if (fs.existsSync(path.join(DIST, n))) fail("forbidden path in dist: " + n);
// every local href/src/url() in public HTML/CSS resolves inside dist
const exists = rel => { rel = rel.replace(/[?#].*$/, ""); if (!rel || rel === "/") return true; const clean = rel.replace(/^\//, ""); return all.includes(clean) || all.includes(clean + ".html") || all.includes(clean.replace(/\/$/, "") + "/index.html") || all.some(f => f.startsWith(clean.replace(/\/$/, "") + "/")); };
for (const f of all.filter(x => x.endsWith(".html"))) {
  const s = fs.readFileSync(path.join(DIST, f), "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""), base = path.posix.dirname(f);
  for (const m of s.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) { const u = m[1]; if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u)) continue; const r = u.startsWith("/") ? u.slice(1) : path.posix.normalize(base + "/" + u); if (!exists(r)) fail(f + ": dangling reference " + u); }
}
for (const f of all.filter(x => x.endsWith(".css"))) { const s = fs.readFileSync(path.join(DIST, f), "utf8"); for (const m of s.matchAll(/url\(([^)]+)\)/g)) { const u = m[1].replace(/['"]/g, ""); if (/^(https?:|data:)/.test(u)) continue; if (!exists(path.posix.normalize(path.posix.dirname(f) + "/" + u))) fail(f + ": dangling url() " + u); } }
// sitemap and redirects point at things that exist
const sm = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
for (const m of sm.matchAll(/<loc>https:\/\/christianityapparently\.com\/?([^<]*)<\/loc>/g)) { const r = m[1]; if (r && !exists(r)) fail("sitemap URL not in dist: /" + r); }
for (const l of fs.readFileSync(path.join(DIST, "_redirects"), "utf8").split("\n")) { const t = l.trim(); if (!t || t.startsWith("#")) continue; const [from, to, code] = t.split(/\s+/); if (!/^30[1278]$/.test(code || "")) fail("bad redirect status: " + t); if (!exists(to)) fail("redirect target missing: " + t); if (exists(from.replace(/\.html$/, "")) && !from.endsWith(".html")) fail("redirect source still exists as a page: " + from); }
if (fails.length) { console.error(fails.join("\n")); process.exit(1); }
console.log("dist check passed: " + all.length + " files, only public site files, no dangling references");
