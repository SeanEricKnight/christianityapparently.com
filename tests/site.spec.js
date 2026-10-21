const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ONLINE = !!process.env.ONLINE;

// Every HTML page in the repo (root + questions/).
const pages = [...fs.readdirSync(ROOT).filter(f => f.endsWith('.html')),
  ...fs.readdirSync(path.join(ROOT, 'questions')).map(f => 'questions/' + f)].sort();
test.describe.configure({ mode: 'parallel' });

const HEADER_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform', 'color', 'lineHeight'];
const measure = () => {
  const h = document.querySelector('header.ca-global-header'); if (!h) return null;
  const b = h.querySelector('.ca-brand'), em = b.querySelector('em'), r = h.getBoundingClientRect(), br = b.getBoundingClientRect();
  const cs = el => { const s = getComputedStyle(el); const o = {}; for (const k of ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform', 'color', 'lineHeight']) o[k] = s[k]; return o; };
  const links = [...h.querySelectorAll('.ca-site-nav a')];
  return { height: Math.round(r.height), position: getComputedStyle(h).position, bg: getComputedStyle(h).backgroundColor,
    brandLeft: Math.round(br.left), brand: cs(b), em: cs(em), linkText: links.map(a => a.textContent.trim()),
    navFont: links[0] ? cs(links[0]) : null };
};
const ref = {}, refShot = {};  // per-viewport homepage reference

async function open(page, file) {
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => { const u = r.url(); if (u.startsWith('http://localhost') || ONLINE) failed.push(u + ' ' + (r.failure() || {}).errorText); });
  page.on('response', r => { if (r.url().startsWith('http://localhost') && r.status() >= 400) failed.push(r.url() + ' ' + r.status()); });
  const resp = await page.goto('/' + file, { waitUntil: 'load' });
  expect(resp.status(), file + ' status').toBeLessThan(400);
  return { errors, failed };
}
const slug = f => f.replace(/[\/.]/g, '_');

for (const file of pages) {
  test(`page: ${file}`, async ({ page, browser }, info) => {
    const vw = info.project.use.viewport.width;
    const { errors, failed } = await open(page, file);
    await page.waitForTimeout(600);

    // 1. no console/page errors, no failed same-origin requests (third-party only if ONLINE=1)
    const realErrors = errors.filter(e => ONLINE || !/Failed to load resource|net::ERR/.test(e));
    expect(realErrors, 'console/page errors').toEqual([]);
    expect(failed, 'failed requests').toEqual([]);

    // 2. header identical to the homepage reference at this viewport
    if (!ref[vw]) { const p2 = await browser.newPage({ viewport: info.project.use.viewport }); await p2.goto('/index.html'); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(300); ref[vw] = await p2.evaluate(measure); refShot[vw] = await p2.locator('header.ca-global-header').screenshot({ animations: 'disabled' }); await p2.close(); }
    const m = await page.evaluate(measure);
    expect(m, 'shared header present').not.toBeNull();
    expect(m.height).toBe(ref[vw].height);
    expect(m.brandLeft).toBe(ref[vw].brandLeft);
    expect(m.brand).toEqual(ref[vw].brand);
    expect(m.em).toEqual(ref[vw].em);
    expect(m.navFont).toEqual(ref[vw].navFont);
    expect(m.linkText).toEqual(ref[vw].linkText);
    expect(m.position).toBe('sticky');
    // visual: the rendered header must be pixel-identical to the homepage's at this width
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.locator('header.ca-global-header').screenshot({ animations: 'disabled' });
    if (!shot.equals(refShot[vw])) { await info.attach('header-' + slug(file), { body: shot, contentType: 'image/png' }); await info.attach('header-home', { body: refShot[vw], contentType: 'image/png' }); }
    expect(shot.equals(refShot[vw]), 'header pixels differ from homepage').toBeTruthy();

    // 3. sticky: after scrolling 1200px the header is still at the top
    await page.evaluate(() => scrollTo(0, 1200)); await page.waitForTimeout(300);
    const top = await page.evaluate(() => Math.round(document.querySelector('header.ca-global-header').getBoundingClientRect().top));
    expect(top, 'header sticks to top').toBe(0);
    await page.evaluate(() => scrollTo(0, 0));

    // 4. mobile menu (<=700px): button visible, opens five links, Escape closes
    if (vw <= 700) {
      const btn = page.locator('.ca-menu-btn'); await expect(btn).toBeVisible();
      await btn.click(); await expect(btn).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.ca-site-nav a:visible')).toHaveCount(5);
      // focus: Tab from the button reaches the first nav link; Shift+Tab walks back; Escape closes and returns focus to the button
      await btn.focus(); await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement.closest('.ca-site-nav') !== null), 'Tab from menu button enters the nav').toBeTruthy();
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => document.activeElement.classList.contains('ca-menu-btn')), 'Shift+Tab returns to menu button').toBeTruthy();
      await page.keyboard.press('Escape'); await expect(btn).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('.ca-site-nav')).toBeHidden();
      expect(await page.evaluate(() => document.activeElement.classList.contains('ca-menu-btn')), 'Escape returns focus to the menu button').toBeTruthy();
      // closed menu links must not be focusable
      expect(await page.evaluate(() => [...document.querySelectorAll('.ca-site-nav a')].some(a => a.offsetParent !== null)), 'closed nav links hidden').toBeFalsy();
    } else {
      await expect(page.locator('.ca-menu-btn')).toBeHidden();
      await expect(page.locator('.ca-site-nav a:visible')).toHaveCount(5);
    }

    // 5. no horizontal overflow
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(ov, 'horizontal overflow px').toBeLessThanOrEqual(1);

    // 6. images: scroll every image into view (forces lazy-loading), then require it to have loaded
    //    (same-origin always; third-party only if ONLINE=1), be visibly sized, and stay inside the viewport width.
    await page.evaluate(async () => {
      for (const i of document.images) { i.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 60)); }
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 8000); })));
      scrollTo(0, 0);
    });
    const imgs = await page.evaluate(() => [...document.images].map(i => { const r = i.getBoundingClientRect(), cs = getComputedStyle(i);
      return { src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0, hidden: cs.display === 'none' || cs.visibility === 'hidden' || !!i.closest('[inert],[hidden]'),
        w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right + scrollX) }; }));
    for (const i of imgs) {
      if (!(i.src.startsWith('http://localhost') || ONLINE)) continue;
      expect(i.ok, 'image failed to load: ' + i.src).toBeTruthy();
      if (!i.hidden && i.w > 0) {
        expect(i.h, 'image has no rendered height: ' + i.src).toBeGreaterThan(8);
        expect(i.right, 'image overflows viewport: ' + i.src).toBeLessThanOrEqual(vw + 1);
      }
    }
    const empties = await page.evaluate(() => [...document.querySelectorAll('figure,.hero-photo,.hero-visual,.section-image,.council-art')].filter(f => !f.querySelector('img,svg,picture,video') && !f.textContent.trim()).length);
    expect(empties, 'empty image containers').toBe(0);

    // 7. record page height for the scroll-length report + screenshots for review
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    info.annotations.push({ type: 'scrollHeight', description: String(h) });
    const full = ['index.html', 'original-experience.html', 'councils.html', 'questions/canon.html'].includes(file);
    await page.screenshot({ path: `test-results/screens/${slug(file)}-${vw}.png`, fullPage: full });
  });
}

// ---- homepage cinematic: right image beside the right heading, in order, only visible controls focusable
test('home: "Is There a Creator?" scenes pair heading+image in order', async ({ page }, info) => {
  await open(page, 'index.html');
  const expected = [[/CREATOR/i, /Hubble/i], [/JESUS/i, /Galilee/i], [/ROME/i, /heel bone/i], [/TOMB/i, /Garden Tomb/i], [/TRUST/i, /Codex Sinaiticus/i]];
  for (let i = 0; i < 5; i++) {
    await page.evaluate(i => { const j = document.getElementById('cinematic'), st = j.querySelector('.cinematic-sticky'); const hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ca-header-h')) || 84; const total = j.offsetHeight - st.offsetHeight; scrollTo(0, j.getBoundingClientRect().top + scrollY - hh + total * ((i + .5) / 5)); }, i);
    await page.waitForTimeout(900);
    const heading = await page.locator('#cinematic .cinematic-panel.is-active h2').innerText();
    const alt = await page.locator('#cinematic .ca-real-scene.is-active img').getAttribute('alt');
    expect(heading.replace(/\s+/g, ' '), 'heading ' + i).toMatch(expected[i][0]);
    expect(alt, 'image alt ' + i).toMatch(expected[i][1]);
    const focusable = await page.evaluate(() => [...document.querySelectorAll('#cinematic a[href]')].filter(a => !a.closest('[inert]')).length);
    expect(focusable, 'only the visible scene link is focusable').toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/screens/home-cinematic-${i}-${info.project.name}.png` });
  }
});

test('home: reduced motion disables transforms and transitions', async ({ browser }, info) => {
  const ctx = await browser.newContext({ viewport: info.project.use.viewport, reducedMotion: 'reduce' }); const page = await ctx.newPage();
  await page.goto('/index.html'); await page.evaluate(() => scrollTo(0, document.getElementById('cinematic').offsetTop + 600)); await page.waitForTimeout(500);
  const t = await page.evaluate(() => getComputedStyle(document.querySelector('#cinematic .ca-real-scene.is-active img')).transform);
  expect(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy();
  await ctx.close();
});

// ---- Original Experience
test('original-experience: hero visible, dots navigate, tiles go to the right pages', async ({ page }, info) => {
  await open(page, 'original-experience.html'); await page.waitForTimeout(500);
  const op = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.scene-1')).opacity));
  expect(op, 'hero text visible at top').toBeGreaterThan(0.9);
  const want = [/wrong\s+questions/i, /extraordinary/i, /something\s+happened/i, /what\s+if\s+it/i];
  const dots = page.locator('.side-index a');
  for (let i = 0; i < 4; i++) {
    await dots.nth(i).click({ force: true }); await page.waitForTimeout(1500);
    const txt = await page.locator('.scene:not([inert])').first().innerText();
    expect(txt.replace(/\s+/g, ' '), 'chapter ' + i).toMatch(want[i]);
    const photoIdx = await page.evaluate(() => [...document.querySelectorAll('.ca-real-photo')].findIndex(p => parseFloat(p.style.opacity) === 1));
    expect(photoIdx, 'photo for chapter ' + i).toBe(i);
  }
  const targets = [/questions(\.html)?$/, /gospel(\.html)?$/, /life(\.html)?$/, /grow(\.html)?$/];
  for (let i = 0; i < 4; i++) {
    await page.goto('/original-experience.html');
    const tile = page.locator('#questions .tile').nth(i); await tile.scrollIntoViewIfNeeded(); await tile.click();
    await expect(page).toHaveURL(targets[i]); await expect(page.locator('h1').first()).toBeVisible();
  }
});

// ---- councils page works
test('councils: list renders, search filters, modal opens and closes', async ({ page }) => {
  await open(page, 'councils.html');
  await expect(page.locator('#councilList .council-row')).toHaveCount(21);
  await page.fill('#councilSearch', 'Nicaea'); expect(await page.locator('#councilList .council-row').count()).toBeGreaterThan(0);
  await page.locator('#councilList .council-row').first().click(); await expect(page.locator('#modal')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('#modal')).toBeHidden();
});

// ---- link crawl: every internal link on every page returns a page (no redirects to home for non-home targets)
test('links: every internal href resolves to the intended page', async ({ page, request }) => {
  const seen = new Map();
  for (const file of pages) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
    for (const m of src.matchAll(/<a\b[^>]*\shref="([^"#][^"]*)"/g)) {
      const h = m[1]; if (/^(https?:|mailto:|tel:)/.test(h)) continue;
      const url = new URL(h.split('#')[0], 'http://localhost:4173/' + file).pathname;
      if (!seen.has(url)) { const r = await request.get(url); seen.set(url, r.status()); }
      expect(seen.get(url), `${file} -> ${h}`).toBe(200);
    }
  }
});
