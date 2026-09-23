import { test, expect } from '@playwright/test';

test('default hero renders dimensional image motion without loading WebGL', async ({ page }) => {
  const models = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.glb') || request.url().includes('three-runtime'))
      models.push(request.url());
  });
  await page.goto('/');
  const hero = page.locator('.immersive-hero motion-product');
  await expect(hero).toHaveAttribute('data-motion-ready', '');
  const image = hero.locator('.motion-product__image');
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0))
    .toBeTruthy();
  await hero.hover({ position: { x: 50, y: 50 } });
  await expect
    .poll(() => hero.evaluate((node) => node.style.getPropertyValue('--motion-ry')))
    .not.toBe('0deg');
  expect(models).toHaveLength(0);
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

test('story image responds to editorial detail frames', async ({ page }) => {
  await page.goto('/');
  const story = page.locator('.story-layout');
  await story.scrollIntoViewIfNeeded();
  const scene = story.locator('motion-product');
  await expect(scene).toHaveAttribute('data-motion-ready', '');
  await story.locator('[data-story-frame]').last().scrollIntoViewIfNeeded();
  await expect(story.locator('[data-story-frame]').last()).toBeInViewport();
  await expect
    .poll(() => scene.evaluate((node) => node.style.getPropertyValue('--motion-focus-x')))
    .not.toBe('50%');
});

test('reduced motion keeps a complete static image experience', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const models = [];
  page.on('request', (request) => {
    if (request.url().includes('vanta-concept.glb')) models.push(request.url());
  });
  await page.goto('/');
  const hero = page.locator('.immersive-hero motion-product');
  await expect(hero.locator('.motion-product__image')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(models).toHaveLength(0);
  await expect(hero).toHaveCSS('--motion-rx', '0deg');
});
