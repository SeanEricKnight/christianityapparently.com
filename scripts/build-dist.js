// Builds dist/: the ONLY directory that is deployed. Everything else in the repo
// (scripts, tests, source data, reports, config) stays out of the published site.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
// Explicit allowlist: a new top-level file is NOT published unless it is added here.
const FILES_BY_EXT = [".html"];                       // root pages
const FILES = ["styles.css", "home.css", "site-header.css", "site-header.js",
  "favicon.svg", "robots.txt", "sitemap.xml", "_headers", "_redirects"];
const DIRS = ["assets", "questions"];
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
let n = 0;
const copy = (src, dst) => { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); n++; };
for (const f of fs.readdirSync(ROOT)) {
  const p = path.join(ROOT, f);
  if (fs.statSync(p).isFile() && FILES_BY_EXT.includes(path.extname(f))) copy(p, path.join(DIST, f));
}
for (const f of FILES) { const p = path.join(ROOT, f); if (!fs.existsSync(p)) throw new Error("missing required public file: " + f); copy(p, path.join(DIST, f)); }
const walk = (dir, rel) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const s = path.join(dir, e.name), r = path.join(rel, e.name); if (e.isDirectory()) walk(s, r); else if (!e.name.startsWith(".")) copy(s, path.join(DIST, r)); } };
for (const d of DIRS) { if (!fs.existsSync(path.join(ROOT, d))) throw new Error("missing dir " + d); walk(path.join(ROOT, d), d); }
console.log("dist/ built: " + n + " files");
