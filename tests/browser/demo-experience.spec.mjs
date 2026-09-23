import { test, expect } from '@playwright/test';

test('default hero renders a real animated sneaker without manual configuration', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('.immersive-hero product-scene');
  await expect(hero).toHaveAttribute('data-model', /vanta-concept\.glb/);
  await expect(hero).toHaveClass(/scene-ready/, { timeout: 30000 });
  const canvas = hero.locator('canvas');
  await expect(canvas).toBeVisible();
  const before = await canvas.screenshot();
  await page.waitForTimeout(900); // Sample two different points in the running animation.
  const after = await canvas.screenshot();
  expect(before.equals(after)).toBeFalsy();
  await hero.locator('[data-scene-pause]').click();
  await expect(hero.locator('[data-scene-pause]')).toHaveText('Resume motion');
  await hero.locator('[data-scene-right]').click();
  await page.locator('.hero-copy .button').click();
  await expect(page.locator('#VantaProducts')).toBeInViewport();
});

test('four demo silhouettes use distinct product photos', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('[id^="VantaProducts-"] .product-card > img');
  await expect(images).toHaveCount(4);
  const sources = await images.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('src')),
  );
  expect(new Set(sources).size).toBe(4);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0))
      .toBeTruthy();
  }
});

test('story scene is lazy and responds to camera frames', async ({ page }) => {
  await page.goto('/');
  const story = page.locator('.story-layout');
  await story.scrollIntoViewIfNeeded();
  const scene = story.locator('product-scene');
  await expect(scene).toHaveClass(/scene-ready/, { timeout: 30000 });
  await expect(scene.locator('canvas')).toHaveCount(1);
  await story.locator('[data-story-frame]').last().scrollIntoViewIfNeeded();
  await expect(story.locator('[data-story-frame]').last()).toBeInViewport();
});

test('reduced motion keeps the hero poster until explicitly activated', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const models = [];
  page.on('request', (request) => {
    if (request.url().includes('vanta-concept.glb')) models.push(request.url());
  });
  await page.goto('/');
  const hero = page.locator('.immersive-hero product-scene');
  await expect(hero.locator('.scene-poster')).toBeVisible();
  await expect(hero.locator('canvas')).toHaveCount(0);
  expect(models).toHaveLength(0);
  await hero.locator('[data-scene-enable]').click();
  await expect(hero).toHaveClass(/scene-ready/, { timeout: 30000 });
});
