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
test('without JavaScript, product options and native cart forms remain available', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + '/products/the-complete-snowboard');
  await expect(page.locator('.purchase-button')).toBeEnabled();
  const choice = page.locator('[data-option-link]:not(.selected)').first();
  if (await choice.count()) {
    await choice.click();
    await expect(page).toHaveURL(/option_values=/);
  }
  await expect(page.locator('product-form form')).toHaveAttribute('action', /cart\/add/);
  await context.close();
});
test('editor-style product section reload does not duplicate add requests', async ({ page }) => {
  await page.goto('/products/the-complete-snowboard');
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
