import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const themeErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};
test('home, reduced motion, navigation and empty cart dialog', async ({ page }, info) => {
  const errors = themeErrors(page);
  const webgl = [];
  page.on('request', (request) => {
    if (request.url().includes('three-runtime')) webgl.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('BUILT');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  expect(webgl).toEqual([]);
  await page.locator('[data-open-cart]').click();
  await expect(page.locator('#CartDrawer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#CartDrawer')).not.toBeVisible();
  await expect(page.locator('[data-open-cart]')).toBeFocused();
  if (page.viewportSize().width < 990) {
    await page.locator('.mobile-menu>summary').click();
    await expect(page.locator('.mobile-menu')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('.mobile-menu')).not.toHaveAttribute('open');
  }
  expect(errors).toEqual([]);
});
test('home and collection have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/collections/all']) {
    await page.goto(path);
    await page.locator('main').waitFor();
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual(
      [],
    );
  }
});
test('collection, options, add, quantity, remove and cart error', async ({ page, request }) => {
  const catalog = await request.get('/products.json?limit=250').then((r) => r.json());
  const product =
    catalog.products?.find((p) => p.variants.some((v) => v.available) && p.variants.length > 1) ||
    catalog.products?.find((p) => p.variants.some((v) => v.available));
  test.skip(!product, 'Store requires a purchasable test product');
  await page.goto(`/products/${product.handle}`);
  await expect(page.locator('h1')).toHaveText(product.title);
  await expect(page.locator('body')).not.toContainText('Liquid error');
  const links = page.locator('[data-option-link]:not(.selected):not(.unavailable)');
  if (await links.count()) {
    const id = await links.first().getAttribute('data-option-id');
    await links.first().click();
    await expect(page.locator(`.selected[data-option-id="${id}"]`)).toBeVisible();
  }
  const add = page.locator('.purchase-button');
  if (await add.isDisabled()) {
    test.skip(true, 'Selected option combination is unavailable');
    return;
  }
  await add.click();
  await expect(page.locator('#CartDrawer')).toBeVisible();
  const quantity = page.locator('#CartDrawer [data-line-key]').first();
  await expect(quantity).toBeVisible();
  const before = Number(await quantity.inputValue());
  await quantity.fill(String(before + 1));
  await quantity.dispatchEvent('change');
  await expect(page.locator('#CartDrawer [data-line-key]').first()).toHaveValue(String(before + 1));
  await expect(page.locator('cart-drawer')).not.toHaveAttribute('aria-busy');
  await page.route('**/cart/change.js', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ description: 'Test inventory error' }),
    }),
  );
  await page.locator('#CartDrawer [data-remove-key]').first().click();
  await expect(page.locator('#CartDrawer [data-cart-error]')).toHaveText('Test inventory error');
  await page.unroute('**/cart/change.js');
  await page.locator('#CartDrawer [data-remove-key]').first().click();
  await expect(page.locator('#CartDrawer .empty-state')).toBeVisible();
});
test('search suggestions and full search remain usable', async ({ page, request }) => {
  const catalog = await request.get('/products.json?limit=1').then((r) => r.json());
  const query = catalog.products?.[0]?.title.split(' ').find((word) => word.length > 3) || 'snow';
  await page.goto('/search');
  const input = page.locator('main input[type=search]');
  await input.fill(query);
  await expect(page.locator('main [data-results]')).toBeVisible();
  const links = page.locator('main [data-results] a');
  if (await links.count()) {
    await input.press('ArrowDown');
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(input).toBeFocused();
  }
  await input.press('Enter');
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator('body')).not.toContainText('Liquid error');
});
test('404, cart, collections and empty search render semantic pages', async ({ page }) => {
  for (const path of [
    '/pages/vanta-does-not-exist',
    '/cart',
    '/collections',
    '/search?q=VANTA-no-results-9173',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('body')).not.toContainText('Liquid error');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
  }
});
