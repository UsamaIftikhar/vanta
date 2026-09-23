import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.THEME_BASE_URL || 'http://127.0.0.1:9292';
const productPath = process.env.THEME_PRODUCT_PATH;
if (!productPath) throw new Error('Set THEME_PRODUCT_PATH to a populated product URL path.');
const paths = [
  '/',
  '/collections/all',
  productPath,
];
await mkdir('docs/qa/lighthouse', { recursive: true });
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless', '--no-sandbox'],
});
const summary = [];
try {
  for (const desktop of [false, true])
    for (const [index, path] of paths.entries()) {
      const result = await lighthouse(base + path, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        ...(desktop ? { preset: 'desktop' } : {}),
      });
      const report = result.lhr;
      const name = ['home', 'collection', 'product'][index];
      await writeFile(
        `docs/qa/lighthouse/${name}-${desktop ? 'desktop' : 'mobile'}.json`,
        result.report,
      );
      summary.push({
        page: name,
        mode: desktop ? 'desktop' : 'mobile',
        scores: Object.fromEntries(
          Object.entries(report.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
        ),
        LCP: report.audits['largest-contentful-paint'].numericValue,
        CLS: report.audits['cumulative-layout-shift'].numericValue,
        TBT: report.audits['total-blocking-time'].numericValue,
      });
      console.log(summary.at(-1));
    }
  await writeFile('docs/qa/lighthouse-summary.json', JSON.stringify(summary, null, 2));
} finally {
  await chrome.kill();
}
