import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.url().includes('.glb')) console.log('model response', r.status(), r.url());
});
await page.goto('http://127.0.0.1:9292');
const scene = page.locator('product-scene').first();
await scene.locator('canvas').waitFor({ timeout: 30000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'docs/qa/model-hero-desktop.png' });
console.log({
  errors,
  scene: await scene.getAttribute('class'),
  model: await scene.getAttribute('data-model'),
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'docs/qa/model-hero-mobile.png' });
await browser.close();
