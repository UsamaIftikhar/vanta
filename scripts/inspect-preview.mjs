import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:9292', { waitUntil: 'networkidle' });
await mkdir('docs/qa', { recursive: true });
await page.screenshot({ path: 'docs/qa/home-desktop.png', fullPage: true });
console.log(
  JSON.stringify({
    title: await page.title(),
    headings: await page.locator('h1').allTextContents(),
    errors,
    liquidErrors: await page
      .locator('body')
      .innerText()
      .then((x) => x.match(/Liquid error[^\n]*/g)),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  }),
);
const products = await page.request
  .get('http://127.0.0.1:9292/products.json?limit=250')
  .then((r) => r.json());
await writeFile('/tmp/vanta-catalog.json', JSON.stringify(products));
console.log(
  JSON.stringify(
    products.products
      ?.map((p) => ({
        handle: p.handle,
        title: p.title,
        variants: p.variants.length,
        images: p.images.length,
      }))
      .slice(0, 15),
  ),
);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'docs/qa/home-mobile.png', fullPage: true });
await browser.close();
