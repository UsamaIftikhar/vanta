# VANTA architecture

Repository inspection: empty directory, no package, CLI, Skeleton, existing theme or assets. Original implementation; no Dawn/Horizon-derived code. Shopify requirements and architecture reviewed on 2026-09-23.

Native Liquid renders commerce and semantic content. JSON templates and header/footer section groups make pages editable. Product information is block-based with app and Custom Liquid insertion points. Native forms remain usable without enhancements. Option value URLs and server-rendered sections avoid the 250-variant serialization ceiling. Cart mutations are serialized and rendered from Shopify section responses; no browser-calculated prices.

CSS uses merchant tokens and mobile-first layouts. Web components own lifecycle cleanup. A small module entry registers commerce; optional animation and WebGL modules load on demand. All dependencies ship as local assets. 3D never contains essential product information.

Source: assets/*.js, Liquid directories. Generated: assets/three-runtime.js (esbuild bundles Three.js and GLTFLoader). Development dependencies never enter theme archive.

Required architecture: JSON templates; section groups; product/app blocks; Custom Liquid; native discounts/unit pricing/installments/payment buttons; native swatches and rich media; pickup; related/complementary recommendations; facets on search and collection; localization; gift card recipient; account component. Reference: https://shopify.dev/docs/storefronts/themes/store/requirements and https://shopify.dev/docs/storefronts/themes/architecture.

Release gates: connected Shopify preview, representative catalog, original licensed photography and GLBs, manual device/browser review, benchmark Lighthouse and checkout verification. Local fixtures do not establish Shopify compatibility or production scores.
