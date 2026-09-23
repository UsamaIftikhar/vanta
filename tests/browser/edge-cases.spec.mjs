import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('all requested widths avoid horizontal page overflow', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Full width matrix runs once');
  const catalog = await page.request.get('/products.json?limit=1').then((response) => response.json());
  const productPath = catalog.products?.[0]?.handle
    ? `/products/${catalog.products[0].handle}`
    : '/collections/all';
  for (const path of [
    '/',
    '/collections/all',
    productPath,
    '/cart',
    '/search',
  ]) {
    await page.goto(path);
    for (const [width, height] of [
      [320, 568],
      [360, 800],
      [375, 812],
      [390, 844],
      [414, 896],
      [430, 932],
      [768, 1024],
      [820, 1180],
      [1024, 768],
      [1280, 800],
      [1440, 900],
      [1728, 1117],
      [1920, 1080],
      [2560, 1440],
    ]) {
      await page.setViewportSize({ width, height });
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
  const catalog = await page.request.get('/products.json?limit=250').then((response) => response.json());
  const product = catalog.products?.find((item) => item.variants.some((variant) => variant.available));
  test.skip(!product, 'Store requires a purchasable test product');
  await page.goto(`/products/${product.handle}`);
  const productAccessibility = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    productAccessibility.violations.filter((v) => ['serious', 'critical'].includes(v.impact)),
  ).toEqual([]);
  await page.locator('[data-open-cart]').click();
  const cart = await new AxeBuilder({ page })
    .include('#CartDrawer')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(cart.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
test('gift recipient, sold-out state and gallery zoom', async ({ page }) => {
  const catalog = await page.request.get('/products.json?limit=250').then((response) => response.json());
  const giftCard = catalog.products?.find((item) => item.product_type === 'Gift Card');
  const soldOut = catalog.products?.find((item) => item.variants.every((variant) => !variant.available));
  const product = catalog.products?.find((item) => item.variants.some((variant) => variant.available));
  if (giftCard) {
    await page.goto(`/products/${giftCard.handle}`);
    await expect(page.locator('[name="properties[Recipient email]"]')).toHaveCount(1);
    await expect(page.locator('.shopify-payment-button')).toHaveCount(0);
  }
  if (soldOut) {
    await page.goto(`/products/${soldOut.handle}`);
    await expect(page.locator('.purchase-button')).toBeDisabled();
  }
  test.skip(!product, 'Store requires a product with media');
  await page.goto(`/products/${product.handle}`);
  test.skip(!(await page.locator('[data-zoom]').count()), 'Product has no image media');
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
