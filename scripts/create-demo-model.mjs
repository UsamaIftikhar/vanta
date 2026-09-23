import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';
// Reproducible original concept mesh; no downloaded model or branded geometry.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((value) => {
      this.result = value;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((value) => {
      this.result = `data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;
      this.onloadend?.();
    });
  }
};
const shoe = new T.Group();
shoe.name = 'VANTA_original_concept';
const material = (color, roughness = 0.8) =>
  new T.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
const knit = material('#deded2'),
  foam = material('#eeeade'),
  rubber = material('#242925'),
  lime = material('#cfef48'),
  trim = material('#8d978e'),
  dark = material('#343b35');
function mesh(geometry, mat, name, parent = shoe) {
  const node = new T.Mesh(geometry, mat);
  node.name = name;
  parent.add(node);
  return node;
}
const profile = [
  [-1.55, 0.02, 0.28],
  [-1.43, 0.28, 0.23],
  [-1.15, 0.44, 0.16],
  [-0.7, 0.48, 0.12],
  [-0.2, 0.43, 0.1],
  [0.35, 0.35, 0.1],
  [0.85, 0.34, 0.12],
  [1.2, 0.31, 0.15],
  [1.4, 0.2, 0.19],
  [1.47, 0.02, 0.24],
];
function shapeAt(x) {
  for (let i = 1; i < profile.length; i++)
    if (x <= profile[i][0]) {
      const a = profile[i - 1],
        b = profile[i],
        t = (x - a[0]) / (b[0] - a[0]);
      return [T.MathUtils.lerp(a[1], b[1], t), T.MathUtils.lerp(a[2], b[2], t)];
    }
  return profile.at(-1).slice(1);
}
function sole(name, y, height, expand, mat) {
  const vertices = [],
    indices = [],
    nx = 70,
    nr = 32;
  for (let i = 0; i <= nx; i++) {
    const x = -1.55 + (3.02 * i) / nx;
    const [width, lift] = shapeAt(x);
    for (let j = 0; j <= nr; j++) {
      const angle = (j / nr) * Math.PI * 2;
      const z = Math.cos(angle) * (width + expand);
      const yy = y + lift + Math.sin(angle) * height * 0.5;
      vertices.push(x, yy, z);
    }
  }
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nr; j++) {
      const a = i * (nr + 1) + j,
        b = a + nr + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return mesh(geo, mat, name);
}
sole('explode_outsole', -0.2, 0.12, 0.035, rubber);
sole('explode_foam', -0.02, 0.31, 0.035, foam);
sole('Sculpted_lower_edge', -0.13, 0.055, 0.046, trim);
sole('Sculpted_upper_edge', 0.115, 0.04, 0.018, foam);
// A fitted upper rises from the toe box into the tongue and heel collar.
const upperProfile = [
  [-1.48, 0.01, 0.3],
  [-1.35, 0.25, 0.39],
  [-1.0, 0.39, 0.48],
  [-0.6, 0.43, 0.58],
  [-0.2, 0.39, 0.77],
  [0.2, 0.32, 1.0],
  [0.5, 0.31, 1.1],
  [0.85, 0.3, 1.05],
  [1.15, 0.25, 1.08],
  [1.35, 0.16, 0.92],
  [1.42, 0.01, 0.5],
];
function upperAt(x) {
  for (let i = 1; i < upperProfile.length; i++)
    if (x <= upperProfile[i][0]) {
      const a = upperProfile[i - 1],
        b = upperProfile[i],
        t = (x - a[0]) / (b[0] - a[0]);
      return [T.MathUtils.lerp(a[1], b[1], t), T.MathUtils.lerp(a[2], b[2], t)];
    }
  return upperProfile.at(-1).slice(1);
}
const verts = [],
  indices = [],
  nx = 80,
  nr = 40;
for (let i = 0; i <= nx; i++) {
  const x = -1.48 + (2.9 * i) / nx;
  const [w, h] = upperAt(x);
  for (let j = 0; j <= nr; j++) {
    const angle = (j / nr) * Math.PI;
    const z = w * Math.cos(angle);
    let y = 0.21 + (h - 0.21) * Math.pow(Math.sin(angle), 0.72);
    if (x > 0.44 && x < 1.17) {
      const opening = Math.sin(((x - 0.44) / 0.73) * Math.PI);
      y -= 0.39 * opening * Math.pow(Math.sin(angle), 7);
    }
    verts.push(x, y, z);
  }
}
for (let i = 0; i < nx; i++)
  for (let j = 0; j < nr; j++) {
    const a = i * (nr + 1) + j,
      b = a + nr + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
const geo = new T.BufferGeometry();
geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
geo.setIndex(indices);
geo.computeVertexNormals();
mesh(geo, knit, 'explode_upper');
function line(points, radius, mat, name) {
  return mesh(
    new T.TubeGeometry(
      new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
      Math.max(12, points.length * 5),
      radius,
      6,
      false,
    ),
    mat,
    name,
  );
}
// Recessed inner footbed and cushioned oval opening.
const bed = mesh(new T.SphereGeometry(1, 24, 12), dark, 'Inner_footbed');
bed.scale.set(0.32, 0.035, 0.205);
bed.position.set(0.79, 0.72, 0);
const collarPoints = [];
for (let i = 0; i <= 64; i++) {
  const a = (i / 64) * Math.PI * 2;
  collarPoints.push([0.81 + 0.39 * Math.cos(a), 0.98 + 0.075 * Math.cos(a), 0.235 * Math.sin(a)]);
}
line(collarPoints, 0.047, trim, 'Padded_collar');
// Lace rows follow the rising vamp. Rounded eyelets and cross-lacing are separate geometry.
for (let i = 0; i < 6; i++) {
  const x = -0.64 + i * 0.15;
  const [w, h] = upperAt(x);
  const z = w * 0.57,
    y = 0.21 + (h - 0.21) * 0.89 + 0.03;
  for (const side of [-1, 1]) {
    const eye = mesh(
      new T.TorusGeometry(0.043, 0.013, 6, 12),
      i % 2 ? trim : lime,
      `Eyelet_${i}_${side}`,
    );
    eye.position.set(x, y, side * z);
    eye.rotation.x = -Math.PI / 2;
  }
  line(
    [
      [x - 0.035, y + 0.02, -z],
      [x + 0.03, y + 0.085, 0],
      [x + 0.1, y + 0.07, z],
    ],
    0.017,
    foam,
    `Lace_${i}`,
  );
  line(
    [
      [x + 0.1, y + 0.07, -z],
      [x + 0.035, y + 0.1, 0],
      [x - 0.035, y + 0.02, z],
    ],
    0.015,
    foam,
    `Lace_cross_${i}`,
  );
}
// Heel stabilizer, side panels and original abstract V details on both sides.
for (const side of [-1, 1]) {
  line(
    [
      [0.49, 0.24, side * 0.34],
      [0.81, 0.45, side * 0.33],
      [1.19, 0.86, side * 0.22],
      [1.35, 0.61, side * 0.16],
    ],
    0.038,
    dark,
    `Heel_cage_${side}`,
  );
  line(
    [
      [-1.32, 0.28, side * 0.27],
      [-0.91, 0.32, side * 0.41],
      [-0.37, 0.39, side * 0.41],
      [0.11, 0.65, side * 0.32],
    ],
    0.014,
    trim,
    `Seam_${side}`,
  );
  line(
    [
      [-0.17, 0.54, side * 0.397],
      [0.04, 0.36, side * 0.371],
      [0.33, 0.7, side * 0.321],
    ],
    0.024,
    dark,
    `V_mark_${side}`,
  );
  for (let i = 0; i < 5; i++)
    line(
      [
        [-0.55 + i * 0.29, -0.09, side * 0.45],
        [-0.3 + i * 0.25, 0.04, side * 0.41],
        [0.1 + i * 0.21, 0.11, side * 0.36],
      ],
      0.012,
      trim,
      `Foam_channel_${side}_${i}`,
    );
}
line(
  [
    [1.17, 0.89, -0.07],
    [1.35, 1.15, -0.06],
    [1.4, 1.21, 0],
    [1.35, 1.15, 0.06],
    [1.17, 0.89, 0.07],
  ],
  0.035,
  lime,
  'Heel_pull',
);
// Raised small knit stitches give the mesh real dimensional detail without textures.
const stitchGeo = new T.SphereGeometry(1, 5, 3);
for (let i = 0; i < 30; i++) {
  const x = -1.3 + i * 0.084;
  const [w, h] = upperAt(x);
  for (let j = 1; j < 15; j++) {
    const angle = (j / 15) * Math.PI;
    if (x > 0.4 && j > 4 && j < 11) continue;
    const y = 0.21 + (h - 0.21) * Math.pow(Math.sin(angle), 0.72);
    const stitch = mesh(stitchGeo, knit, `Knit_${i}_${j}`);
    stitch.scale.set(0.009, 0.004, 0.017);
    stitch.position.set(x, y + 0.006, w * Math.cos(angle));
  }
}
// Rubber traction pods beneath the sole.
for (let i = 0; i < 12; i++) {
  const x = -1.3 + i * 0.22;
  const [w, lift] = shapeAt(x);
  for (const side of [-1, 1]) {
    const pod = mesh(new T.BoxGeometry(0.13, 0.045, w * 0.65), rubber, `Tread_${i}_${side}`);
    pod.position.set(x, -0.26 + lift, side * w * 0.48);
    pod.rotation.y = side * 0.16;
  }
}
// Batch small details by material and construction layer to keep GPU draw calls low.
const batches = new Map();
for (const node of [...shoe.children]) {
  node.updateMatrix();
  const layer = /outsole|Tread/.test(node.name)
    ? 'outsole'
    : /foam|Foam|Sculpted/.test(node.name)
      ? 'foam'
      : 'upper';
  const key = `${layer}:${node.material.uuid}`;
  if (!batches.has(key)) batches.set(key, { layer, material: node.material, geometries: [] });
  const geometry = node.geometry.clone().applyMatrix4(node.matrix);
  geometry.deleteAttribute('uv');
  batches.get(key).geometries.push(geometry);
  shoe.remove(node);
}
for (const [index, batch] of [...batches.values()].entries()) {
  mesh(mergeGeometries(batch.geometries), batch.material, `explode_${batch.layer}_${index}`);
}
shoe.rotation.z = 0.08;
const result = await new GLTFExporter().parseAsync(shoe, { binary: true, onlyVisible: true });
await writeFile('assets/vanta-concept.glb', Buffer.from(result));
console.log(`Original sneaker GLB: ${Math.round(result.byteLength / 1024)} KiB`);
