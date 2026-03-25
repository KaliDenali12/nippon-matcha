const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:8000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    // === 1. Floating header ===
    console.log('=== Capturing floating header ===');
    const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1 = await ctx1.newPage();
    await page1.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Scroll to scene 2 to trigger floating header
    await page1.evaluate(() => {
      const scene2 = document.querySelector('#scene-2');
      if (scene2) scene2.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1500);
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-floating-header.png') });
    console.log('  Floating header captured');
    await ctx1.close();

    // === 2. CTA hover states ===
    console.log('=== Capturing CTA hover states ===');
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    await page2.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Scene 1 CTA hover - use page.locator for better reliability
    const scene1Cta = page2.locator('#scene-1 .cta-button').first();
    if (await scene1Cta.count() > 0) {
      await scene1Cta.scrollIntoViewIfNeeded();
      await sleep(500);
      await scene1Cta.hover({ timeout: 5000 });
      await sleep(500);
      await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-cta-hover-scene1.png') });
      console.log('  Scene 1 CTA hover captured');
    } else {
      console.log('  No CTA button found in scene 1, trying broader selector');
      const anyCta = page2.locator('.cta-button').first();
      await anyCta.scrollIntoViewIfNeeded();
      await sleep(500);
      await anyCta.hover({ timeout: 5000 });
      await sleep(500);
      await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-cta-hover-scene1.png') });
      console.log('  First CTA hover captured');
    }

    // Scene 7 CTA hover
    await page2.evaluate(() => {
      const scene7 = document.querySelector('#scene-7');
      if (scene7) scene7.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1500);
    const scene7Cta = page2.locator('#scene-7 .cta-button').first();
    if (await scene7Cta.count() > 0) {
      await scene7Cta.hover({ timeout: 5000 });
      await sleep(500);
      await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-cta-hover-scene7.png') });
      console.log('  Scene 7 CTA hover captured');
    } else {
      console.log('  No CTA button found in scene 7');
    }
    await ctx2.close();

    // === 3. Focus states via Tab navigation ===
    console.log('=== Capturing focus states ===');
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page3 = await ctx3.newPage();
    await page3.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Tab 1 - should focus skip link
    await page3.keyboard.press('Tab');
    await sleep(400);
    await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-focus-tab1-skiplink.png') });
    console.log('  Focus state tab 1 (skip link) captured');

    // Tab through a few more elements
    await page3.keyboard.press('Tab');
    await sleep(400);
    await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-focus-tab2.png') });
    console.log('  Focus state tab 2 captured');

    await page3.keyboard.press('Tab');
    await sleep(400);
    await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-focus-tab3.png') });
    console.log('  Focus state tab 3 captured');

    await page3.keyboard.press('Tab');
    await sleep(400);
    await page3.keyboard.press('Tab');
    await sleep(400);
    await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-focus-tab5.png') });
    console.log('  Focus state tab 5 captured');

    await ctx3.close();

    // === 4. Mobile sticky CTA bar ===
    console.log('=== Capturing mobile sticky CTA bar ===');
    const ctx4 = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page4 = await ctx4.newPage();
    await page4.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Scroll past scene 3 to trigger mobile CTA bar
    await page4.evaluate(() => {
      const scene5 = document.querySelector('#scene-5');
      if (scene5) scene5.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1500);
    await page4.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-mobile-sticky-cta.png') });
    console.log('  Mobile sticky CTA bar captured');

    // Also capture at scene 4 where it should appear
    await page4.evaluate(() => {
      const scene4 = document.querySelector('#scene-4');
      if (scene4) scene4.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1500);
    await page4.screenshot({ path: path.join(SCREENSHOT_DIR, 'interaction-mobile-sticky-cta-scene4.png') });
    console.log('  Mobile sticky CTA at scene 4 captured');

    await ctx4.close();

    console.log('\n=== All interaction screenshots captured! ===');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
})();
