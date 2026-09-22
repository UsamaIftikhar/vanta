# Development

Node 24+, npm and an authenticated Shopify CLI are required. Run `npm ci`, `npm run build`, `npm run check`, `npm test`. Start an isolated development preview with `npm run dev -- --store your-store.myshopify.com`; enter the storefront password locally if prompted. Never commit a password or session. VANTA was tested on development theme 192804028695; live themes were not modified.

`npm run test:browser` targets http://127.0.0.1:9292. Override THEME_BASE_URL for another test storefront. Browser tests mutate only their own anonymous test carts. They do not complete orders, contact forms or newsletters. Install browsers with `npx playwright install chromium firefox webkit`.

`npm run lighthouse` measures home, all-products collection and the test product. Override THEME_PRODUCT_PATH and THEME_BASE_URL to point to representative pages. Reports are diagnostic until run on HTTPS with realistic assets and the official benchmark. `node scripts/screenshots.mjs` captures 390, 768, 1440 and 1920 widths. Review before accepting visual baselines.

`npm run package` builds, checks and creates a Shopify theme ZIP. docs, tests, node_modules and scripts are excluded by .shopifyignore. CI runs build, tests, Theme Check and runtime dependency auditing. Storefront CI runs only when THEME_BASE_URL is configured; it requires a reachable test storefront.

## Conventions

Liquid remains the source of product prices, variants, availability, discounts and cart totals. Do not calculate these in JavaScript. New sections need a valid schema, meaningful presets, responsive media, empty states and sensible settings. Use unique section/block IDs. Product sections support app and Custom Liquid blocks.

Extend Component from core.js for abortable event listeners; clean up observers, timers and requests on disconnect. Use textContent for API error text. Only inject HTML from same-origin Shopify section rendering. Use section-rendered option values for high-variant products; never serialize the full product/variant collection.

Keep CSS token-based, mobile-first and logical where practical. Avoid hiding essential content pending JS. Merchant images go through image_url/image_tag with sizes/widths and intrinsic dimensions. Optional JavaScript uses import() inside an element-existence or interaction boundary.

Three.js is MIT-licensed; build copies its license into docs/licenses. No React, external app or required third-party animation runtime. Dependencies are pinned and lockfile-controlled.
