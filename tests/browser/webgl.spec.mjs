import { test, expect } from '@playwright/test';
function triangleGLB() {
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]);
  const model = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'explode_test' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [0.8, 1, 0.3, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8,
        },
        doubleSided: true,
      },
    ],
    buffers: [{ byteLength: positions.byteLength }],
    bufferViews: [{ buffer: 0, byteLength: positions.byteLength }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [-1, -1, 0],
        max: [1, 1, 0],
      },
    ],
  };
  let json = Buffer.from(JSON.stringify(model));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
  const bin = Buffer.from(positions.buffer);
  const result = Buffer.alloc(12 + 8 + json.length + 8 + bin.length);
  result.writeUInt32LE(0x46546c67, 0);
  result.writeUInt32LE(2, 4);
  result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(json.length, 12);
  result.writeUInt32LE(0x4e4f534a, 16);
  json.copy(result, 20);
  result.writeUInt32LE(bin.length, 20 + json.length);
  result.writeUInt32LE(0x004e4942, 24 + json.length);
  bin.copy(result, 28 + json.length);
  return result;
}
async function inject(page, mode = 'normal') {
  await page.goto('/');
  await page.evaluate(
    ({ mode }) => {
      const original = document.querySelector('product-scene');
      const next = original.cloneNode(true);
      original.replaceWith(next);
      next.dataset.model = '/vanta-fixture.glb';
      next.dataset.mobile = 'interactive';
      next.dataset.reduced = 'static';
      next.innerHTML =
        '<div class="scene-poster"><p>Accessible product poster</p></div><div class="scene-canvas"></div><button data-scene-enable>Explore in 3D</button><div class="scene-controls" hidden><button data-scene-left>Left</button><button data-scene-right>Right</button><button data-scene-reset>Reset</button><button data-scene-fullscreen>Fullscreen</button></div><p class="scene-status" role="status" data-failure="3D unavailable"></p>';
      if (mode === 'no-webgl') {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          return type.includes('webgl') ? null : original.call(this, type, ...args);
        };
      }
      next.initialize(true);
    },
    { mode },
  );
}
test('3D loads on demand, rotates, disposes and survives context loss', async ({ page }) => {
  await page.route('**/vanta-fixture.glb', (route) =>
    route.fulfill({ contentType: 'model/gltf-binary', body: triangleGLB() }),
  );
  await inject(page);
  const scene = page.locator('product-scene').first();
  await expect(scene).toHaveClass(/scene-ready/);
  await expect(scene.locator('canvas')).toHaveCount(1);
  await scene.locator('[data-scene-right]').click();
  await scene.evaluate((el) =>
    el.querySelector('canvas').dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
  );
  await expect(scene).toHaveClass(/scene-failed/);
  await expect(scene.locator('canvas')).toHaveCount(0);
  await expect(scene.locator('.scene-poster')).toBeVisible();
  await page.locator('[data-open-cart]').click();
  await expect(page.locator('#CartDrawer')).toBeVisible();
});
for (const failure of ['404', 'invalid', 'oversized', 'no-webgl'])
  test(`3D ${failure} preserves commerce and fallback`, async ({ page }) => {
    await page.route('**/vanta-fixture.glb', (route) =>
      route.fulfill(
        failure === '404'
          ? { status: 404, body: '' }
          : failure === 'oversized'
            ? { status: 200, headers: { 'content-length': '30000000' }, body: 'x' }
            : failure === 'invalid'
              ? { contentType: 'model/gltf-binary', body: 'invalid model' }
              : { contentType: 'model/gltf-binary', body: triangleGLB() },
      ),
    );
    await inject(page, failure);
    const scene = page.locator('product-scene').first();
    await expect(scene).toHaveClass(/scene-failed/);
    await expect(scene.locator('.scene-status')).toHaveText('3D unavailable');
    await expect(scene.locator('.scene-poster')).toBeVisible();
    await page.locator('[data-open-cart]').click();
    await expect(page.locator('#CartDrawer')).toBeVisible();
  });
test('scene removal during a slow request leaves no canvas or uncaught error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/vanta-fixture.glb', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'model/gltf-binary', body: triangleGLB() }).catch(() => {});
  });
  await inject(page);
  await page
    .locator('product-scene')
    .first()
    .evaluate((el) => el.remove());
  await page.waitForTimeout(1200);
  expect(errors).toEqual([]);
  await expect(page.locator('canvas')).toHaveCount(0);
});
