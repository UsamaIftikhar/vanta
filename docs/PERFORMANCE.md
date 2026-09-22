# Performance record

Diagnostic measurements on 2026-09-23 using Lighthouse 13.5.0 against Shopify CLI's HTTP localhost preview. Generated campaign imagery and Shopify's real test catalog were present. These are not production HTTPS or official benchmark scores. Measurements vary with the local proxy, network and concurrent browser work.

| Page | Mode | Performance | Accessibility | Best practices | SEO | LCP ms | CLS | TBT ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | Mobile | 73 | 100 | 54 | 100 | 5401 | 0.00038 | 216 |
| Collection | Mobile | 83 | 100 | 54 | 100 | 4220 | 0 | 12 |
| Product | Mobile | 90 | 100 | 77 | 100 | 3425 | 0 | 25 |
| Home | Desktop | 87 | 100 | 54 | 100 | 3680 | 0 | 16 |
| Collection | Desktop | 90 | 100 | 54 | 100 | 2470 | 0 | 42 |
| Product | Desktop | 88 | 100 | 77 | 100 | 3628 | 0 | 76 |

Raw reports: docs/qa/lighthouse/*.json; summary: docs/qa/lighthouse-summary.json.

Initial run surfaced missing meta descriptions, collection heading order and unbranded checkout button contrast. These were corrected; the subsequent run reports 100 accessibility and SEO across these pages. Best-practices failures include Shopify-injected HTTP/CORS scripts and Shop account/payment frame/cookie behavior on localhost. Do not rewrite content_for_header or disable required Shopify features to hide those results. Repeat on HTTPS before attributing or clearing each warning.

The project's mobile performance/LCP targets are **not met consistently**. Home remains a performance release gate. Fonts, real model assets, merchant content and Shopify integration costs must be measured on the final demo domain. INP requires field interaction data; TBT above is a lab proxy, not an INP measurement.

## Implemented budgets

Responsive image_tag widths/sizes with intrinsic dimensions; eager hero/first product media and first collection row; remaining imagery lazy. Campaign JPEG approximately 282 KB desktop/65 KB small; editorial 315 KB/88 KB. Fonts use swap and the display font is preloaded. Three.js is split from the normal commerce path and bundled locally; absence of a configured model means no runtime download. Models are capped at 20 MB transfer and 250k triangles; recommended budgets are much smaller. Balanced DPR 1.5; high desktop DPR 2. Offscreen and hidden-tab scenes stop rendering; static scenes settle.

Lighthouse automation: npm run lighthouse. Use THEME_BASE_URL and THEME_PRODUCT_PATH for representative HTTPS pages. Repeat each benchmark several times sequentially on idle hardware and report medians before release.
