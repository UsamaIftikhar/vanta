import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.THEME_BASE_URL || 'http://127.0.0.1:9292';
const browser = await chromium.launch();
const findings = [];
await mkdir('docs/qa/screenshots', { recursive: true });
for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1440, 1000],
  [1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  for (const [name, path] of Object.entries({
    home: '/',
    product: '/products/the-complete-snowboard',
    collection: '/collections/all',
    cart: '/cart',
    search: '/search?q=snow',
  })) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `docs/qa/screenshots/${name}-${width}.png`, fullPage: true });
    findings.push({
      name,
      width,
      height,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      errors,
    });
  }
  await page.goto(base);
  if (width < 990) {
    await page.locator('.mobile-menu>summary').click();
    await page.screenshot({ path: `docs/qa/screenshots/menu-${width}.png` });
  }
  await page.locator('[data-open-cart]').click();
  await page.screenshot({ path: `docs/qa/screenshots/drawer-${width}.png` });
  await page.close();
}
await writeFile('docs/qa/visual-findings.json', JSON.stringify(findings, null, 2));
await browser.close();
console.log('Saved screenshots and overflow findings.');
