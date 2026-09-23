# VANTA QA results

Audit date: 2026-09-23  
State: post-fix release-candidate evidence  

## Environment

| Item | Value |
| --- | --- |
| Store / draft theme | `test1-st8x0er8.myshopify.com` / `192804028695` |
| Local workspace | `/Users/macbook/Desktop/workspace/vanta` |
| Base Git revision | `f461ce0ef2b5a5707e14b6f9b78207fa8a9135bc` plus the audited working-tree changes |
| Node / Shopify CLI / Playwright | `22.14.0` / `4.8.0` / `1.63.0` |

## Automated results

| Check | Result | Evidence |
| --- | --- | --- |
| Shopify Theme Check | PASS | `npm run check`; zero offenses. |
| Structural tests | PASS | `npm test`; 5/5. |
| Chromium browser suite | PASS | 92 passed, 4 deliberate duplicate-coverage skips. Core commerce, search, contact, blog, cart, checkout handoff, account components, a11y, 3D and all current variants pass. |
| Responsive matrix | PASS | Home, collection, product, cart and search at 320×568, 360×800, 375×812, 390×844, 414×896, 430×932, 768×1024, 820×1180, 1024×768, 1280×800, 1440×900, 1728×1117, 1920×1080 and 2560×1440. |
| Cross-browser | PASS | Firefox 14/14 and WebKit 14/14: 28/28 total. The console assertion excludes only Shopify CLI's HTTP development-proxy `origin_trials` redirect, a proxy-only CORS message not emitted by the hosted HTTPS storefront. |
| Accessibility | PASS | axe serious/critical violations: 0 on tested main/product/cart surfaces. Lighthouse accessibility: 100 for all six page/device runs. |
| No JavaScript | PASS | Native mobile navigation, variant URL selection and actual native add-to-cart pass with JavaScript disabled. |
| WebGL/lifecycle | PASS | Load/rotate, 404, invalid, oversized, disabled WebGL, context loss, slow removal, multi-scene reload, data saver and reduced-motion poster policies pass. |
| Theme Editor simulation | PASS | Repeated product-section reload causes one add request; model scene following a poster-only scene initializes once and disposes on removal. Authenticated editor UI smoke test remains manual. |
| Draft deployment | PASS | Strict push to development theme `192804028695`; no publish command used. |
| Package | PASS | `VANTA-0.1.0.zip`; 140 files; 3,989,708 bytes; only `assets`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`. |

## Lighthouse matrix

| Page | Device | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | Mobile | 85 | 100 | 54 | 100 | 2552 ms | 0.00035 | 352 ms |
| Collection | Mobile | 84 | 100 | 54 | 100 | 2823 ms | 0 | 283 ms |
| Product | Mobile | 82 | 100 | 77 | 100 | 3178 ms | 0 | 259 ms |
| Home | Desktop | 71 | 100 | 54 | 100 | 5350 ms | 0 | 242 ms |
| Collection | Desktop | 83 | 100 | 54 | 100 | 2944 ms | 0 | 287 ms |
| Product | Desktop | 65 | 100 | 77 | 100 | 5020 ms | 0 | 480 ms |

Performance averages: **83.7 mobile**, **73.0 desktop**. Accessibility averages: **100 mobile**, **100 desktop**. The Shopify minimum averages (60 performance, 90 accessibility) are met. Mobile also meets the internal 80+ performance aspiration; desktop does not meet the 90+ aspiration. Best Practices is reduced mainly by the HTTP Shopify CLI proxy and Shopify-injected resources; it is recorded, not hidden. Raw reports are in `docs/qa/lighthouse/` and the normalized summary is `docs/qa/lighthouse-summary.json`.

The WebP conversion raised mobile home performance from 34 to 85 and reduced measured mobile home LCP from roughly 9.9 s to 2.6 s. Three.js remains a lazy model-scene-only payload and is not downloaded by the default homepage.

## Deliberate test boundaries

- Automated checkout stops at Shopify's checkout handoff; it does not place an order or charge a payment method.
- Contact/newsletter validation is tested without sending merchant/customer messages.
- Current store data has no configured gift-card product, unit-priced product, rich product video/model set, pickup location, Shop Pay Installments eligibility or populated article comments. Code paths are present; representative admin data is an owner action.
- Physical Safari/iOS/Android webviews, assistive-technology screen-reader passes and the authenticated Theme Editor UI require manual device/admin testing.
- The draft remains unpublished.

## Artifact

- File: `VANTA-0.1.0.zip`
- Size: 3,989,708 bytes
- SHA-256: `d1df6f86fa85db9b119afb8a500989bd8915f084f97ed42fc9eb985481962b9d`
- Contents: 140 files under the seven supported theme directories only
- Excluded: docs, tests, scripts, dependencies, package metadata, JPG delivery duplicates and `config/markets.json`
- Draft preview: `https://test1-st8x0er8.myshopify.com?preview_theme_id=192804028695`
- Draft role after final strict push: `development` (unpublished)
