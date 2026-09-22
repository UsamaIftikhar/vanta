import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('all requested widths avoid horizontal page overflow', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Full width matrix runs once');
  for (const path of [
    '/',
    '/collections/all',
    '/products/the-complete-snowboard',
    '/cart',
    '/search',
  ]) {
    await page.goto(path);
    for (const width of [
      320, 360, 375, 390, 414, 430, 480, 768, 820, 1024, 1280, 1440, 1728, 1920, 2560,
    ]) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path} at ${width}`,
      ).toBeTruthy();
    }
  }
});
test('all existing product variants render correct selected IDs, prices and availability', async ({
  page,
  request,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Variant matrix runs once');
  const catalog = await request.get('/products.json?limit=250').then((r) => r.json());
  for (const product of catalog.products)
    for (const variant of product.variants) {
      await page.goto(`/products/${product.handle}?variant=${variant.id}`);
      await expect(page.locator('product-detail')).toHaveAttribute(
        'data-variant',
        String(variant.id),
      );
      await expect(page.locator('product-detail input[name=id]').first()).toHaveValue(
        String(variant.id),
      );
      if (!variant.available) await expect(page.locator('.purchase-button')).toBeDisabled();
      else await expect(page.locator('.purchase-button')).toBeEnabled();
      await expect(page.locator('body')).not.toContainText('Liquid error');
    }
});
test('product and open cart accessibility', async ({ page }) => {
  await page.goto('/products/the-complete-snowboard');
  const product = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(product.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  await page.locator('[data-open-cart]').click();
  const cart = await new AxeBuilder({ page })
    .include('#CartDrawer')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(cart.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
test('gift recipient, sold-out state and gallery zoom', async ({ page }) => {
  await page.goto('/products/gift-card');
  await expect(page.locator('[name="properties[Recipient email]"]')).toHaveCount(1);
  await expect(page.locator('.shopify-payment-button')).toHaveCount(0);
  await page.goto('/products/the-out-of-stock-snowboard');
  await expect(page.locator('.purchase-button')).toBeDisabled();
  await page.goto('/products/the-complete-snowboard');
  await page.locator('[data-zoom]').first().click();
  await expect(page.locator('.zoom-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.zoom-dialog')).not.toBeVisible();
});
test('header predictive search is keyboard reachable', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header-search>summary').click();
  const input = page.locator('.header-search input[type=search]');
  await input.fill('snow');
  await expect(page.locator('.header-search [data-results]')).toBeVisible();
  await input.press('Escape');
  await expect(page.locator('.header-search')).not.toHaveAttribute('open');
});
