# QA release gates

Unchecked items are unverified, not passed.

- [ ] Theme Check and structural tests
- [ ] Home, product, collection, cart, search, blog, article, contact, page, 404, password, gift card rendered on Shopify
- [ ] Editor add/remove/reorder/reload/select; no duplicate canvases/listeners
- [ ] All options, unavailable combinations, sold out, 1/250/1000+ variants, combined listings
- [ ] Add/change/remove cart, discounts, properties, selling plans, notes, checkout, errors and slow network
- [ ] Facets, sorting, pagination and predictive search keyboard operation
- [ ] Media: zero/one/many, video, external video, model, zoom
- [ ] Keyboard, dialog focus, Escape, reduced motion, axe, screen reader
- [ ] 320/360/375/390/414/430/480/768/820/1024/1280/1440/1728/1920/2560 widths; portrait/landscape
- [ ] Chrome, Firefox, Edge, Safari/macOS/iOS, Android Chrome, Samsung Internet, commerce webviews
- [ ] WebGL unavailable/context loss/404/invalid/slow/large model, low power; commerce unaffected
- [ ] Lighthouse home/product/collection mobile and desktop with realistic assets
- [ ] Long translations, names and prices; empty catalog; failed images; touch and safe areas
- [ ] Original assets, licenses, complete demo catalog, merchant documentation
- [ ] Theme Store requirements audited; no critical unresolved issues

## Executed evidence — 2026-09-23

- Theme Check: 92 files, zero offenses, no suppressions.
- Structural tests: 5 passed (templates/block orders/schema ranges/references/translations/lazy runtime boundary).
- Core purchasing/browser tests passed independently on Chromium mobile/tablet/desktop.
- All existing test catalog variants rendered matching IDs and availability.
- Width matrix passed: 320 through 2560 across five main page types.
- 3D fixture success, context loss, missing WebGL, 404, malformed/oversized GLB and request removal passed.
- Product/card heading order and unbranded checkout contrast corrected; targeted axe rerun passed.
- Contact/newsletter HTML validation tested without sending messages. No-JS product option navigation tested.
- Section replacement tested for duplicate request listeners; authenticated editor QA remains separate.
- Lighthouse recorded in PERFORMANCE.md; performance and best-practices gates remain open.

- Cross-browser: Firefox commerce/filter/search/no-JS/editor-replacement checks passed; corrected navigation test passed. WebKit corresponding flows passed; drawer trigger focus fixed and verified. Strict WebKit console gate still fails on Shopify's localhost CORS script; recheck HTTPS.
- Concurrent test runs originally collided in Playwright's artifact directory. Cross-browser output is now isolated; affected Chromium variant matrix passed on rerun.
