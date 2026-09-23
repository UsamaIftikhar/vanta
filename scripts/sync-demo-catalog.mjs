import { spawnSync } from 'node:child_process';

const store = process.env.SHOPIFY_STORE || 'test1-st8x0er8.myshopify.com';
const archiveDemoProducts = process.argv.includes('--archive-demo');
const assetBase = `https://${store}/cdn/shop/t/4/assets`;

const products = [
  {
    title: 'VANTA X1',
    handle: 'vanta-x1',
    price: 185,
    color: 'Volt / Chalk',
    image: 'vanta-hero-cutout.webp',
    description:
      '<p>The VANTA X1 is our statement everyday runner, pairing an expressive sculpted profile with a breathable engineered upper and a stable, cushioned platform.</p><p>Designed for daily movement from first step to last.</p>',
  },
  {
    title: 'VANTA Aero',
    handle: 'vanta-aero',
    price: 160,
    color: 'Ice / Cobalt',
    image: 'vanta-aero.webp',
    description:
      '<p>VANTA Aero brings a lighter visual language to everyday movement with an airy knit upper, confident cushioning, and a cool blue finish.</p><p>Clean, responsive, and easy to wear.</p>',
  },
  {
    title: 'VANTA Flux',
    handle: 'vanta-flux',
    price: 170,
    color: 'Black / Volt',
    image: 'vanta-flux.webp',
    description:
      '<p>VANTA Flux is a monochrome performance silhouette punctuated with high-visibility accents and a grounded, flowing sole geometry.</p><p>Made for motion after dark.</p>',
  },
  {
    title: 'VANTA Terra',
    handle: 'vanta-terra',
    price: 175,
    color: 'Sand / Clay',
    image: 'vanta-terra.webp',
    description:
      '<p>VANTA Terra balances a warm neutral palette with an everyday technical shape, breathable texture, and a supportive sculpted platform.</p><p>Built to move naturally across the city.</p>',
  },
];

function parseCliJson(output) {
  for (let index = output.indexOf('{'); index >= 0; index = output.indexOf('{', index + 1)) {
    try {
      return JSON.parse(output.slice(index));
    } catch {
      // Shopify CLI can print progress messages before its JSON response.
    }
  }
  throw new Error(`Shopify CLI did not return JSON:\n${output}`);
}

function execute(query, variables = {}, mutation = false) {
  const args = [
    'shopify',
    'store',
    'execute',
    '--store',
    store,
    '--query',
    query,
    '--variables',
    JSON.stringify(variables),
    '--json',
    '--no-color',
  ];
  if (mutation) args.push('--allow-mutations');
  const result = spawnSync('npx', args, { encoding: 'utf8' });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0) throw new Error(output);
  return parseCliJson(result.stdout || output);
}

const publicationResult = execute(`query {
  publications(first: 20) { nodes { id name } }
}`);
const onlineStore = publicationResult.publications.nodes.find(
  (publication) => publication.name === 'Online Store',
);
if (!onlineStore) throw new Error('Online Store publication was not found.');

const sizeValues = ['7', '8', '9', '10', '11', '12'];
const productMutation = `mutation UpsertVantaProduct(
  $identifier: ProductSetIdentifiers,
  $input: ProductSetInput!
) {
  productSet(identifier: $identifier, input: $input, synchronous: true) {
    product { id title handle status media(first: 5) { nodes { status alt } } variants(first: 20) { nodes { title price availableForSale } } }
    userErrors { field message code }
  }
}`;
const publishMutation = `mutation PublishVantaProduct($id: ID!, $publicationId: ID!) {
  publishablePublish(id: $id, input: [{ publicationId: $publicationId }]) {
    publishable { availablePublicationsCount { count } }
    userErrors { field message }
  }
}`;

for (const product of products) {
  const file = {
    originalSource: `${assetBase}/${product.image}`,
    alt: `${product.title} sneaker in ${product.color}`,
    filename: product.image,
    contentType: 'IMAGE',
  };
  const input = {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.description,
    vendor: 'VANTA',
    productType: 'Sneakers',
    status: 'ACTIVE',
    tags: ['VANTA', 'Sneakers', 'Footwear', 'New arrival', product.title.replace('VANTA ', '')],
    seo: {
      title: `${product.title} Premium Sneaker | VANTA`,
      description: `${product.title} in ${product.color}, designed for everyday movement.`,
    },
    productOptions: [
      { name: 'Size', position: 1, values: sizeValues.map((name) => ({ name })) },
    ],
    files: [file],
    variants: sizeValues.map((size) => ({
      optionValues: [{ optionName: 'Size', name: size }],
      price: product.price,
      file,
    })),
  };
  const result = execute(
    productMutation,
    { identifier: { handle: product.handle }, input },
    true,
  ).productSet;
  if (result.userErrors.length) {
    throw new Error(`${product.title}: ${JSON.stringify(result.userErrors)}`);
  }
  const published = execute(
    publishMutation,
    { id: result.product.id, publicationId: onlineStore.id },
    true,
  ).publishablePublish;
  if (published.userErrors.length) {
    throw new Error(`${product.title} publication: ${JSON.stringify(published.userErrors)}`);
  }
  console.log(`Synced ${result.product.title} (${result.product.variants.nodes.length} sizes)`);
}

if (archiveDemoProducts) {
  const catalog = execute(`query {
    products(first: 100) { nodes { id title handle status vendor } }
  }`).products.nodes;
  const vantaHandles = new Set(products.map((product) => product.handle));
  const archiveMutation = `mutation ArchiveDemoProduct($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id title status }
      userErrors { field message }
    }
  }`;
  for (const product of catalog) {
    if (vantaHandles.has(product.handle) || product.status === 'ARCHIVED') continue;
    const result = execute(
      archiveMutation,
      { product: { id: product.id, status: 'ARCHIVED' } },
      true,
    ).productUpdate;
    if (result.userErrors.length) {
      throw new Error(`${product.title}: ${JSON.stringify(result.userErrors)}`);
    }
    console.log(`Archived demo product: ${result.product.title}`);
  }
}
