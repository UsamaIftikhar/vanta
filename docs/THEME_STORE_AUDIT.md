# VANTA Theme Store audit

Audit date: 2026-09-23  
Theme version: 0.1.0  
Scope: repository, draft theme `192804028695`, and final package.  

Status meanings: **PASS** has repository/test evidence; **NEEDS REVIEW** requires human judgement or a configured benchmark; **BLOCKED** requires an owner action outside the theme repository.

## Requirement matrix

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Original, differentiated architecture | NEEDS REVIEW | VANTA has original editorial sections, motion, hotspots and optional 3D. Shopify makes the final originality determination. Owner must confirm exclusive rights. |
| Required templates and OS 2.0 JSON | PASS | Required layout/templates, JSON templates, gift-card Liquid template, settings files and header/footer section groups are present. |
| Custom Liquid and app blocks | PASS | Custom Liquid is available; main and featured product sections expose `@app` blocks. |
| Theme settings and `theme_info` | PASS | Name/version/author and public documentation/support URLs are present and Theme Check accepts the schema. Owner must keep the URLs public and staffed. |
| Preset/listing structure | PASS | One preset is included; Shopify does not require `/listings` for a single preset. `config/markets.json` is absent. |
| Portable defaults | PASS | Store-specific collection/product handles were removed from homepage defaults. Empty-store states use bundled, original demo assets and portable `/collections/all` routes. |
| Account component | PASS | `<shopify-account>` is visible in desktop and mobile headers and is asserted in browser tests. |
| Header/menu/search keyboard behavior | PASS | Native details/summary fallbacks, Escape handling, predictive search and mobile navigation pass browser/no-JS tests. |
| Footer | PASS | Merchant menu, dynamic collections, contact/blog/account links, policies, localization, payments, newsletter, Follow on Shop and configured-only social links are supported. Placeholder social URLs were removed. |
| Product variants and availability | PASS | First available variant, variant URLs, price/media/availability state, sold-out state and all existing store variants pass tests. |
| Product media/swatches/zoom | PASS | Image/video/external video/model media, thumbnails, zoom and Shopify swatch data are supported. Current store image zoom is tested; benchmark data is still needed for every optional media type. |
| Recommendations and pickup | PASS | Product Recommendations API and pickup availability are implemented, including empty states. Store configuration controls whether they populate. |
| Accelerated checkout/payment terms | NEEDS REVIEW | Dynamic checkout, additional cart checkout buttons and payment terms are rendered. Eligibility and a real test transaction require Shopify Payments/store configuration. |
| Unit prices | PASS | Unit prices render in product price and cart line markup; requires benchmark unit-priced product for visual confirmation. |
| Gift-card recipient and template | PASS | Accessible recipient fields use Shopify-recognized names, persisted values and `gift_card.send_on`; gift-card template includes code, QR, balance, print and Apple Wallet support. End-to-end recipient testing needs a gift-card product in the store. |
| Collections, categories, filtering, sorting | PASS | Catalog menu, category cards and category links derive from merchant collections. Native Shopify facets, category navigation, sorting and pagination are present; runtime filtering/sorting pass. |
| Predictive/full search | PASS | Predictive search, full results, empty results, sorting and facets pass browser tests against actual catalog data. |
| Cart and checkout handoff | PASS | Add/update/remove/quantity/error/subtotal/drawer/page/no-JS forms and checkout handoff pass. Payment capture is intentionally not automated. |
| Contact | PASS | Malformed markup was fixed; labels and browser validation pass. No message is sent during automated QA. |
| Blog/article/comments/404/password | PASS | Templates exist and article comment labels/IDs were corrected. 404 and password rendering pass; article/comment populated-state review needs store content. |
| Localization | PASS | Section-scoped unique IDs and matching labels are present; country selector is browser tested. Multiple-language behavior requires configured languages. |
| SEO/structured data | PASS | Canonical, metadata, Open Graph/Twitter and product JSON-LD are present. Lighthouse SEO is 100 on all measured pages. |
| Images/alt/responsiveness | PASS | Image helper emits dimensions/srcsets/alt text; original demo images are WebP with small variants. Requested viewport matrix has no horizontal overflow. |
| Accessibility | PASS | Unique ID/label fixes, skip link, visible focus, dialogs, live regions, reduced motion and axe checks pass. Lighthouse accessibility is 100 across the measured matrix. |
| No-JavaScript commerce | PASS | Native mobile navigation, variant links and an actual server-submitted add-to-cart pass with JavaScript disabled. |
| Theme Editor lifecycle | PASS | Abortable listeners and scene disposal are implemented; repeated section reload and multi-scene discovery tests show no duplicate requests/canvases. Final authenticated editor interaction remains a manual smoke test. |
| Three.js loading/fallback | PASS | Three is local and loaded only for model scenes. Missing/invalid/oversized/slow/no-WebGL/context-loss/data-saver/reduced-motion/mobile/removal cases retain poster and commerce. |
| Three.js lifecycle/performance | PASS | Demand rendering, offscreen/visibility pause, low-power renderer preference, DPR cap, explicit disposal and no permanent RAF unless auto-rotate is selected are implemented. |
| Performance thresholds | PASS | Average Lighthouse performance is 83.7 mobile and 73.0 desktop; accessibility averages 100 for each. Every page is above Shopify's minimum. See `QA_RESULTS.md`. |
| Browser compatibility | PASS | Chromium viewport suite plus Firefox/WebKit cross-browser suites pass. Real iOS/Android webviews and latest physical devices remain manual coverage. |
| Asset hosting/licenses/provenance | PASS | Theme assets are Shopify-hosted; Three license and original image provenance are included; redundant JPG delivery copies were removed after WebP conversion. |
| Theme Check | PASS | Final Theme Check reports no offenses. |
| Package validity | PASS | Final ZIP contains only supported theme directories and files; hash/size are recorded in `QA_RESULTS.md`. |
| Theme/preset naming | BLOCKED | Owner must confirm VANTA is legally usable, distinct from the Partner company name, and not confusingly similar to an existing Theme Store theme. |
| Exclusivity/IP/Partner account | BLOCKED | Owner must attest Theme Store exclusivity, ownership/licensing, Partner details and support obligations. |
| Demo store and submission listing | BLOCKED | Owner must confirm eligible transfer-store status, finish benchmark content/configuration, capture compliant screenshots, set price/listing copy and submit in Partner Dashboard. |

## Official sources

- [Theme Store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)
- [Testing a theme for the Theme Store](https://shopify.dev/docs/storefronts/themes/store/test-theme)
- [Theme Store submission process](https://shopify.dev/docs/storefronts/themes/store/review-process/submit-theme)
- [Theme Store listing pages](https://shopify.dev/docs/storefronts/themes/store/review-process/listings)
- [Accessibility best practices](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility)
- [Gift-card recipient form](https://shopify.dev/docs/storefronts/themes/product-merchandising/gift-cards)
