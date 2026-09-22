import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
await build({
  entryPoints: ['scripts/three-entry.js'],
  outfile: 'assets/three-runtime.js',
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2022',
  legalComments: 'eof',
});
await mkdir('docs/licenses', { recursive: true });
await copyFile('node_modules/three/LICENSE', 'docs/licenses/THREE.txt');
console.log('Built local, dynamically imported Three.js runtime.');

await copyFile('node_modules/three/LICENSE', 'assets/three-license.txt');
