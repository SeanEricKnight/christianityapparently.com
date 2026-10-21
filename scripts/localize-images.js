#!/usr/bin/env node
// Downloads every Wikimedia Commons image the pages hotlink, writes optimized local copies to
// assets/images/, records provenance in assets/images/MANIFEST.json, and rewrites the pages to
// use the local files. Needs internet and `sharp`:   npm install --no-save sharp
//   node scripts/localize-images.js --dry-run     list what would be fetched (no network)
//   node scripts/localize-images.js               download, optimize, rewrite
//   node scripts/localize-images.js --force       re-download files already in the manifest
// Credits are NOT modified: credits.html keeps the creator/source/licence text and the Commons file-page links.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, ".."), OUT = path.join(ROOT, "assets", "images");
const BASE = (process.env.COMMONS_BASE || "https://commons.wikimedia.org").replace(/\/$/, "");
const UA = process.env.IMAGE_UA || "ChristianityApparentlySiteBuild/1.0 (https://christianityapparently.com; seanericknight@hotmail.com) node-fetch";
const MAX_W = 1600, QUALITY = 80;
const dry = process.argv.includes("--dry-run"), force = process.argv.includes("--force");
const PAGES = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));
const RX = /https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^"'\s)<>?]+)(?:\?width=(\d+))?/g;
// 1. inventory: file -> widest width requested
const files = new Map();
for (const p of PAGES) for (const m of fs.readFileSync(path.join(ROOT, p), "utf8").matchAll(RX)) {
  const name = decodeURIComponent(m[1]).replace(/_/g, " "), w = +(m[2] || MAX_W);
  const e = files.get(name) || { name, width: 0, pages: new Set() }; e.width = Math.max(e.width, w); e.pages.add(p); files.set(name, e);
}
const slug = n => n.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 60);
const used = new Set(); for (const e of files.values()) { let s = slug(e.name), i = 2; while (used.has(s)) s = slug(e.name).slice(0, 56) + "-" + i++; used.add(s); e.slug = s; e.local = "/assets/images/" + s + ".jpg"; e.page = "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(e.name.replace(/ /g, "_")); }
console.log(files.size + " unique Commons images referenced by " + PAGES.length + " pages");
for (const e of files.values()) console.log("  " + e.name + "  (width " + e.width + ")  ->  " + e.local + "  [" + [...e.pages].join(", ") + "]");
if (dry) process.exit(0);
const sharp = require("sharp");
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fetchImage(name) {
  const url = BASE + "/wiki/Special:FilePath/" + encodeURIComponent(name.replace(/ /g, "_"));
  for (let a = 1; a <= 6; a++) {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (r.status === 429 || r.status >= 500) { const w = (+r.headers.get("retry-after") || 0) * 1000 || 3000 * a; console.log("  " + r.status + ", waiting " + w + "ms"); await sleep(w); continue; }
    if (!r.ok) throw new Error(name + ": HTTP " + r.status);
    const ct = r.headers.get("content-type") || "", buf = Buffer.from(await r.arrayBuffer());
    if (!/^image\//.test(ct) || buf.length < 5000) throw new Error(name + ": not an image (" + ct + ", " + buf.length + " bytes)");
    return buf;
  }
  throw new Error(name + ": gave up after retries");
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const mp = path.join(OUT, "MANIFEST.json"), manifest = fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp, "utf8")) : {};
  for (const e of files.values()) {
    const dest = path.join(OUT, e.slug + ".jpg");
    if (!force && manifest[e.slug] && fs.existsSync(dest)) { console.log("have " + e.slug); continue; }
    console.log("fetch " + e.name); const src = await fetchImage(e.name);
    const img = sharp(src, { failOn: "none" }).rotate(), meta = await sharp(src).metadata();
    const w = Math.min(e.width, MAX_W, meta.width || MAX_W);
    const out = await img.resize({ width: w, withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toBuffer();
    fs.writeFileSync(dest, out); const m2 = await sharp(out).metadata();
    manifest[e.slug] = { local: e.local, source_file_page: e.page, original_name: e.name, original_width: meta.width, original_height: meta.height, local_width: m2.width, local_height: m2.height, bytes: out.length, sha256: crypto.createHash("sha256").update(out).digest("hex"), fetched: new Date().toISOString() };
    await sleep(1500);
  }
  fs.writeFileSync(mp, JSON.stringify(manifest, null, 2) + "\n");
  // 3. rewrite pages only for images that now exist locally
  let changed = 0;
  for (const p of PAGES) {
    const fp = path.join(ROOT, p); let s = fs.readFileSync(fp, "utf8");
    const t = s.replace(RX, (all, enc) => { const e = files.get(decodeURIComponent(enc).replace(/_/g, " ")); return e && fs.existsSync(path.join(OUT, e.slug + ".jpg")) ? e.local : all; });
    if (t !== s) { fs.writeFileSync(fp, t); changed++; }
  }
  console.log("manifest: " + Object.keys(manifest).length + " images; rewrote " + changed + " pages. Now run: npm run build && node scripts/check-static.js && node scripts/build-dist.js && node scripts/check-dist.js && npx playwright test");
})().catch(e => { console.error(e.message); process.exit(1); });
