/**
 * Playwright script to capture all audit screenshots.
 * Run: npx playwright test --config=audit-reports/capture-all-screenshots.js
 * Or:  node audit-reports/capture-all-screenshots.js
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:8080/';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

const scenes = [
  { id: '#scene-1', name: 'scene1-hero', label: 'Scene 1 Hero' },
  { id: '#scene-2', name: 'scene2-origin', label: 'Scene 2 Origin' },
  { id: '#scene-3', name: 'scene3-ritual', label: 'Scene 3 Ritual' },
  { id: '#scene-4', name: 'scene4-craft', label: 'Scene 4 Craft' },
  { id: '#scene-5', name: 'scene5-testimony', label: 'Scene 5 Testimony' },
  { id: '#scene-6', name: 'scene6-promise', label: 'Scene 6 Promise' },
  { id: '#scene-7', name: 'scene7-invitation', label: 'Scene 7 Invitation' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollToScene(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, selector);
  // Wait for scroll to settle and animations to trigger
  await sleep(1500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const failures = [];

  // ============================================================
  // 1. Full-page screenshots at 4 widths
  // ============================================================
  console.log('\n=== FULL PAGE SCREENSHOTS ===');
  const fullPageConfigs = [
    { width: 1440, height: 900, name: 'desktop-1440-fullpage.png' },
    { width: 1280, height: 800, name: 'laptop-1280-fullpage.png' },
    { width: 768, height: 1024, name: 'tablet-768-fullpage.png' },
    { width: 375, height: 812, name: 'mobile-375-fullpage.png' },
  ];

  for (const cfg of fullPageConfigs) {
    try {
      const context = await browser.newContext({
        viewport: { width: cfg.width, height: cfg.height },
      });
      const page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(2000); // Let animations/videos settle

      // Scroll through all scenes to trigger animations, then scroll back
      for (const scene of scenes) {
        await scrollToScene(page, scene.id);
      }
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(1000);

      const filePath = path.join(SCREENSHOT_DIR, cfg.name);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  [OK] ${cfg.name}`);
      results.push(cfg.name);
      await context.close();
    } catch (err) {
      console.error(`  [FAIL] ${cfg.name}: ${err.message}`);
      failures.push({ name: cfg.name, error: err.message });
    }
  }

  // ============================================================
  // 2. Per-scene viewport screenshots at desktop (1440px)
  // ============================================================
  console.log('\n=== DESKTOP SCENE SCREENSHOTS (1440px) ===');
  try {
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    for (const scene of scenes) {
      try {
        await scrollToScene(desktopPage, scene.id);
        const fileName = `${scene.name}-1440.png`;
        const filePath = path.join(SCREENSHOT_DIR, fileName);
        await desktopPage.screenshot({ path: filePath });
        console.log(`  [OK] ${fileName}`);
        results.push(fileName);
      } catch (err) {
        const fileName = `${scene.name}-1440.png`;
        console.error(`  [FAIL] ${fileName}: ${err.message}`);
        failures.push({ name: fileName, error: err.message });
      }
    }
    await desktopCtx.close();
  } catch (err) {
    console.error(`  [FAIL] Desktop context: ${err.message}`);
    failures.push({ name: 'desktop-scenes', error: err.message });
  }

  // ============================================================
  // 3. Per-scene mobile screenshots (375px)
  // ============================================================
  console.log('\n=== MOBILE SCENE SCREENSHOTS (375px) ===');
  try {
    const mobileCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    for (const scene of scenes) {
      try {
        await scrollToScene(mobilePage, scene.id);
        const fileName = `${scene.name}-375.png`;
        const filePath = path.join(SCREENSHOT_DIR, fileName);
        await mobilePage.screenshot({ path: filePath });
        console.log(`  [OK] ${fileName}`);
        results.push(fileName);
      } catch (err) {
        const fileName = `${scene.name}-375.png`;
        console.error(`  [FAIL] ${fileName}: ${err.message}`);
        failures.push({ name: fileName, error: err.message });
      }
    }
    await mobileCtx.close();
  } catch (err) {
    console.error(`  [FAIL] Mobile context: ${err.message}`);
    failures.push({ name: 'mobile-scenes', error: err.message });
  }

  // ============================================================
  // 4. Interactive state screenshots at desktop
  // ============================================================
  console.log('\n=== INTERACTIVE STATE SCREENSHOTS ===');

  // 4a. CTA hover state
  try {
    const hoverCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const hoverPage = await hoverCtx.newPage();
    await hoverPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Find the first CTA button ("Discover Nippon Matcha" in scene 1)
    const ctaBtn = hoverPage.locator('.scene-1__cta').first();
    if (await ctaBtn.count() > 0) {
      await ctaBtn.hover();
      await sleep(500);
      const filePath = path.join(SCREENSHOT_DIR, 'cta-hover-state.png');
      await hoverPage.screenshot({ path: filePath });
      console.log('  [OK] cta-hover-state.png');
      results.push('cta-hover-state.png');
    } else {
      // Try generic CTA selector
      const genericCta = hoverPage.locator('a.cta-button, .cta-button, a[href*="amazon"]').first();
      if (await genericCta.count() > 0) {
        await genericCta.hover();
        await sleep(500);
        const filePath = path.join(SCREENSHOT_DIR, 'cta-hover-state.png');
        await hoverPage.screenshot({ path: filePath });
        console.log('  [OK] cta-hover-state.png (via generic selector)');
        results.push('cta-hover-state.png');
      } else {
        throw new Error('No CTA button found');
      }
    }
    await hoverCtx.close();
  } catch (err) {
    console.error(`  [FAIL] cta-hover-state.png: ${err.message}`);
    failures.push({ name: 'cta-hover-state.png', error: err.message });
  }

  // 4b. Floating header visible (scroll past scene 1)
  try {
    const headerCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const headerPage = await headerCtx.newPage();
    await headerPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Scroll past scene 1 to trigger floating header
    await scrollToScene(headerPage, '#scene-2');
    await sleep(1000);

    const filePath = path.join(SCREENSHOT_DIR, 'floating-header-visible.png');
    await headerPage.screenshot({ path: filePath });
    console.log('  [OK] floating-header-visible.png');
    results.push('floating-header-visible.png');
    await headerCtx.close();
  } catch (err) {
    console.error(`  [FAIL] floating-header-visible.png: ${err.message}`);
    failures.push({ name: 'floating-header-visible.png', error: err.message });
  }

  // 4c. Focus state on CTA (tab to it)
  try {
    const focusCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const focusPage = await focusCtx.newPage();
    await focusPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Use keyboard Tab to focus the CTA. The skip-link comes first, then the CTA.
    // Tab once for skip-link, then again for CTA
    await focusPage.keyboard.press('Tab'); // skip-link
    await sleep(300);
    await focusPage.keyboard.press('Tab'); // first focusable link (likely header or CTA)
    await sleep(300);
    await focusPage.keyboard.press('Tab'); // CTA button
    await sleep(300);

    // Try to focus the CTA directly via JS as a backup approach
    await focusPage.evaluate(() => {
      const cta = document.querySelector('#scene-1 a[href*="amazon"], #scene-1 .cta-button, .scene-1__cta');
      if (cta) cta.focus();
    });
    await sleep(500);

    const filePath = path.join(SCREENSHOT_DIR, 'cta-focus-state.png');
    await focusPage.screenshot({ path: filePath });
    console.log('  [OK] cta-focus-state.png');
    results.push('cta-focus-state.png');
    await focusCtx.close();
  } catch (err) {
    console.error(`  [FAIL] cta-focus-state.png: ${err.message}`);
    failures.push({ name: 'cta-focus-state.png', error: err.message });
  }

  // ============================================================
  // 5. Mobile sticky CTA bar
  // ============================================================
  console.log('\n=== MOBILE STICKY CTA BAR ===');
  try {
    const stickyCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const stickyPage = await stickyCtx.newPage();
    await stickyPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Scroll past scene 3 to trigger mobile sticky CTA bar
    await scrollToScene(stickyPage, '#scene-4');
    await sleep(1500);

    // Scroll a bit more to ensure the sticky CTA is triggered
    await stickyPage.evaluate(() => {
      const scene4 = document.querySelector('#scene-4');
      if (scene4) {
        const rect = scene4.getBoundingClientRect();
        window.scrollBy(0, rect.height / 2);
      }
    });
    await sleep(1000);

    const filePath = path.join(SCREENSHOT_DIR, 'mobile-sticky-cta.png');
    await stickyPage.screenshot({ path: filePath });
    console.log('  [OK] mobile-sticky-cta.png');
    results.push('mobile-sticky-cta.png');
    await stickyCtx.close();
  } catch (err) {
    console.error(`  [FAIL] mobile-sticky-cta.png: ${err.message}`);
    failures.push({ name: 'mobile-sticky-cta.png', error: err.message });
  }

  // ============================================================
  // Summary
  // ============================================================
  await browser.close();

  console.log('\n========================================');
  console.log(`SUMMARY: ${results.length} succeeded, ${failures.length} failed`);
  console.log('========================================');
  if (failures.length > 0) {
    console.log('\nFailures:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
  console.log('\nSuccessful captures:');
  results.forEach(r => console.log(`  - ${r}`));
})();
