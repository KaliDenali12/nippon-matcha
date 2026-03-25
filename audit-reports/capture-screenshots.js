const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const SCENES = [
  { id: '#scene-1', name: 'scene-1-hero' },
  { id: '#scene-2', name: 'scene-2-origin' },
  { id: '#scene-3', name: 'scene-3-ritual' },
  { id: '#scene-4', name: 'scene-4-craft' },
  { id: '#scene-5', name: 'scene-5-testimony' },
  { id: '#scene-6', name: 'scene-6-promise' },
  { id: '#scene-7', name: 'scene-7-invitation' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`\n=== Capturing ${viewport.name} (${viewport.width}x${viewport.height}) ===`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000); // Wait for animations to settle

  // Full page screenshot
  const fullPagePath = path.join(SCREENSHOT_DIR, `${viewport.name}-full-page.png`);
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log(`  Full page: ${fullPagePath}`);

  // Individual scene screenshots
  for (const scene of SCENES) {
    try {
      const element = await page.$(scene.id);
      if (element) {
        await element.scrollIntoViewIfNeeded();
        await sleep(800); // Wait for scroll animations
        const scenePath = path.join(SCREENSHOT_DIR, `${viewport.name}-${scene.name}.png`);
        await page.screenshot({ path: scenePath });
        console.log(`  ${scene.name}: ${scenePath}`);
      } else {
        console.log(`  WARNING: ${scene.id} not found`);
      }
    } catch (err) {
      console.log(`  ERROR capturing ${scene.name}: ${err.message}`);
    }
  }

  await context.close();
}

async function captureInteractions(browser) {
  console.log('\n=== Capturing Interaction States ===');

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // 1. Floating header - scroll past scene 1
  console.log('  Capturing floating header...');
  await page.evaluate(() => {
    const scene2 = document.querySelector('#scene-2');
    if (scene2) scene2.scrollIntoView({ behavior: 'instant' });
  });
  await sleep(1500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'interaction-floating-header.png'),
  });
  console.log('  Floating header captured');

  // 2. CTA button hover states
  console.log('  Capturing CTA hover states...');
  // Scroll back to scene 1 for hero CTA
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);

  // Find the first CTA button
  const ctaButtons = await page.$$('a.cta-button, .cta-button');
  if (ctaButtons.length > 0) {
    await ctaButtons[0].hover();
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'interaction-cta-hover-scene1.png'),
    });
    console.log('  Scene 1 CTA hover captured');
  }

  // Scroll to Scene 7 for final CTA hover
  await page.evaluate(() => {
    const scene7 = document.querySelector('#scene-7');
    if (scene7) scene7.scrollIntoView({ behavior: 'instant' });
  });
  await sleep(1500);
  const scene7Ctas = await page.$$('#scene-7 a.cta-button, #scene-7 .cta-button');
  if (scene7Ctas.length > 0) {
    await scene7Ctas[0].hover();
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'interaction-cta-hover-scene7.png'),
    });
    console.log('  Scene 7 CTA hover captured');
  }

  // 3. Focus states via Tab key navigation
  console.log('  Capturing focus states...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);

  // Tab through focusable elements
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    await sleep(300);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'interaction-focus-state-tab5.png'),
  });
  console.log('  Focus state after 5 tabs captured');

  // Continue tabbing
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    await sleep(300);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'interaction-focus-state-tab8.png'),
  });
  console.log('  Focus state after 8 tabs captured');

  // 4. Mobile sticky CTA bar
  console.log('  Capturing mobile sticky CTA bar...');
  await context.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // Scroll past scene 3 to trigger mobile CTA bar
  await mobilePage.evaluate(() => {
    const scene4 = document.querySelector('#scene-4');
    if (scene4) scene4.scrollIntoView({ behavior: 'instant' });
  });
  await sleep(1500);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, 'interaction-mobile-sticky-cta.png'),
  });
  console.log('  Mobile sticky CTA bar captured');

  await mobileContext.close();
}

(async () => {
  console.log('Starting visual audit screenshot capture...');
  console.log(`Screenshots will be saved to: ${SCREENSHOT_DIR}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // Capture all viewports
    for (const viewport of VIEWPORTS) {
      await captureViewport(browser, viewport);
    }

    // Capture interaction states
    await captureInteractions(browser);

    console.log('\n=== All screenshots captured successfully! ===');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();
  }
})();
