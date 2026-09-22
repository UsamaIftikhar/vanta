import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const required = [
  '404',
  'article',
  'blog',
  'cart',
  'collection',
  'index',
  'list-collections',
  'page',
  'page.contact',
  'password',
  'product',
  'search',
];
test('required templates resolve sections and valid block orders', async () => {
  for (const name of required) {
    const template = await json(`templates/${name}.json`);
    assert.ok(template.order.length > 0 && template.order.length <= 25);
    assert.equal(new Set(template.order).size, template.order.length);
    for (const id of template.order) {
      const section = template.sections[id];
      assert.ok(section);
      const source = await readFile(`sections/${section.type}.liquid`, 'utf8');
      const schema = JSON.parse(source.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
      for (const block of section.block_order || []) {
        assert.ok(section.blocks[block]);
        assert.ok(
          schema.blocks.some((definition) => definition.type === section.blocks[block].type),
        );
      }
      for (const key of Object.keys(section.settings || {}))
        assert.ok(
          schema.settings.some((setting) => setting.id === key),
          `${section.type}: ${key}`,
        );
    }
  }
  await access('templates/gift_card.liquid');
});
test('schemas have unique settings and valid range defaults', async () => {
  for (const file of await readdir('sections')) {
    if (!file.endsWith('.liquid')) continue;
    const source = await readFile(`sections/${file}`, 'utf8');
    const schema = JSON.parse(source.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
    assert.ok(schema.name.length <= 25, file);
    for (const settings of [
      schema.settings,
      ...(schema.blocks || []).map((block) => block.settings || []),
    ]) {
      const ids = settings.filter((setting) => setting.id).map((setting) => setting.id);
      assert.equal(ids.length, new Set(ids).size, file);
      for (const setting of settings) {
        if (setting.type === 'range') {
          assert.ok(
            setting.default >= setting.min && setting.default <= setting.max,
            `${file}/${setting.id}`,
          );
          assert.ok(
            (setting.max - setting.min) / setting.step <= 100,
            `${file}/${setting.id} range too large`,
          );
        }
      }
    }
  }
});
test('all snippet and asset references exist', async () => {
  for (const directory of ['layout', 'templates', 'sections', 'snippets']) {
    for (const file of await readdir(directory)) {
      if (!file.endsWith('.liquid')) continue;
      const source = await readFile(`${directory}/${file}`, 'utf8');
      for (const [, name] of source.matchAll(/{%[-\s]*render\s+'([^']+)'/g))
        await access(`snippets/${name}.liquid`);
      for (const [, name] of source.matchAll(/'([^']+)'\s*\|\s*asset_url/g))
        await access(`assets/${name}`);
    }
  }
});
test('translations resolve and no full variant payload is serialized', async () => {
  const locale = await json('locales/en.default.json');
  for (const directory of ['layout', 'templates', 'sections', 'snippets'])
    for (const file of await readdir(directory)) {
      const source = await readFile(`${directory}/${file}`, 'utf8');
      for (const [, path] of source.matchAll(/'([^']+)'\s*\|\s*t\b/g))
        assert.ok(
          path.split('.').reduce((value, part) => value?.[part], locale),
          `${file}: ${path}`,
        );
      assert.doesNotMatch(source, /product(?:\.variants)?\s*\|\s*json/, file);
    }
});
test('Three runtime is reachable only from optional scene imports', async () => {
  const global = await readFile('assets/theme.js', 'utf8');
  assert.doesNotMatch(global, /import .* from ['"].*three/);
  assert.match(global, /querySelector\('product-scene'\)/);
  const runtime = await readFile('assets/three-runtime.js');
  assert.ok(runtime.length < 900_000);
});
