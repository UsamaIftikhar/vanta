import { test, expect } from '@playwright/test';
test('native filters and sorting produce server-rendered results', async ({ page }) => {
  await page.goto('/collections/all');
  await page.locator('select[name=sort_by]').selectOption('price-descending');
  await page.locator('.facets button[type=submit]').click();
  await expect(page).toHaveURL(/sort_by=price-descending/);
  const available = page.locator('input[name="filter.v.availability"][value="1"]');
  if (await available.count()) {
    await available.locator('xpath=ancestor::details').locator('summary').click();
    await available.check();
    await page.locator('.facets button[type=submit]').click();
    await expect(page).toHaveURL(/filter.v.availability=1/);
    await expect(page.locator('.active-filters a')).not.toHaveCount(0);
  }
});
test('contact browser validation and newsletter validation do not send messages', async ({
  page,
}) => {
  await page.goto('/pages/contact?view=contact');
  const form = page.locator('form.contact-form');
  test.skip(!(await form.count()), 'Contact resource absent');
  await form.locator('button').click();
  expect(
    await form.locator('input[type=email]').evaluate((e) => e.validity.valueMissing),
  ).toBeTruthy();
  await form.locator('input[type=email]').fill('invalid-email');
  expect(
    await form.locator('input[type=email]').evaluate((e) => e.validity.typeMismatch),
  ).toBeTruthy();
  await page.goto('/');
  const newsletter = page.locator('.newsletter-form');
  await newsletter.locator('button').click();
  expect(
    await newsletter.locator('input[type=email]').evaluate((e) => e.validity.valueMissing),
  ).toBeTruthy();
});
test('without JavaScript, product options and native add-to-cart remain functional', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const catalog = await context.request
    .get(baseURL + '/products.json?limit=250')
    .then((response) => response.json());
  const product = catalog.products?.find((item) => item.variants.some((variant) => variant.available));
  test.skip(!product, 'Store requires a purchasable test product');
  await page.goto(baseURL + `/products/${product.handle}`);
  await expect(page.locator('.purchase-button')).toBeEnabled();
  const choice = page.locator('[data-option-link]:not(.selected)').first();
  if (await choice.count()) {
    await choice.click();
    await expect(page).toHaveURL(/option_values=/);
  }
  await expect(page.locator('product-form form')).toHaveAttribute('action', /cart\/add/);
  await page.locator('.purchase-button').press('Enter');
  await page.waitForURL(/\/cart(?:\?|$)/);
  await expect(page.locator('.cart-line')).not.toHaveCount(0);
  await context.close();
});

test('without JavaScript, mobile navigation remains usable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(baseURL + '/');
  const menu = page.locator('.mobile-menu');
  await menu.locator(':scope > summary').click();
  await expect(menu).toHaveAttribute('open', '');
  const catalog = menu.locator('details').filter({ hasText: 'Catalog' }).first();
  if (await catalog.count()) {
    await catalog.locator('summary').click();
    await expect(catalog).toHaveAttribute('open', '');
  }
  await expect(menu.locator('a[href="/collections/all"]').first()).toBeVisible();
  await context.close();
});
test('editor-style product section reload does not duplicate add requests', async ({ page }) => {
  const catalog = await page.request.get('/products.json?limit=250').then((response) => response.json());
  const product = catalog.products?.find((item) => item.variants.some((variant) => variant.available));
  test.skip(!product, 'Store requires a purchasable test product');
  await page.goto(`/products/${product.handle}`);
  await page.locator('product-detail').evaluate((el) => {
    for (let i = 0; i < 3; i++) {
      const clone = el.cloneNode(true);
      el.replaceWith(clone);
      el = clone;
      document.dispatchEvent(
        new CustomEvent('shopify:section:load', { detail: { sectionId: 'test' } }),
      );
    }
  });
  let requests = 0;
  await page.route('**/cart/add.js', (route) => {
    requests++;
    return route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ description: 'Editor fixture error' }),
    });
  });
  await page.locator('.purchase-button').click();
  await expect(page.locator('[data-form-error]').first()).toHaveText('Editor fixture error');
  expect(requests).toBe(1);
});
