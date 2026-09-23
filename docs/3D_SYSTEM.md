# Optional 3D system

`three-loader.js` defines `product-scene`. `three-scene.js` imports the locally bundled `three-runtime.js` only when a scene can initialize. Pages with no configured scene never download the runtime. The poster remains the LCP candidate. No commerce logic depends on WebGL.

## Supported model contract

Self-contained GLB 2.0, embedded images and buffers, physically based materials. Recommended desktop model under 5 MB / 100k triangles; mobile under 2 MB / 40k triangles. Hard rejection: transfer over 20 MB, geometry over 250k triangles, invalid GLB, external resource URIs, failed response or 20-second fetch timeout. These bounds are defensive safeguards, not permission to ship oversized models. Decoding compressed textures can still consume substantial memory; keep textures at 1024px mobile / 2048px desktop, ideally fewer than 6 materials.

This implementation does not bundle Draco, Meshopt or KTX2 decoders. Export ordinary GLB for the current engine. These compression formats are future optimization candidates requiring locally served decoder artifacts and device QA; do not upload a compressed model and assume support. Native Shopify product models remain separate and use Shopify's media rendering.

## Lifecycle

An IntersectionObserver activates visible scenes. Visibility changes stop RAF. ResizeObserver sizes the camera and drawing buffer. At most one queued frame per scene; static scenes settle to render-on-demand. DPR is capped at 1.5 balanced/mobile and 2 high desktop. Save-data / low-memory / low-core hints defer automatic initialization; explicit controls remain available. Mobile and reduced-motion defaults use poster-first activation.

Disconnection aborts requests, disconnects observers, cancels RAF, disposes textures/materials/geometry, releases the WebGL context and removes its canvas. Context loss switches permanently to fallback for that component instance. Reinserted or editor-reloaded instances initialize anew.

## Story and interaction

Drag rotates with restrained momentum. Touch preserves vertical page scrolling. Left/right/reset controls provide a keyboard alternative; fullscreen is feature-detected. Story-frame intersections update camera distance, Y rotation, scale and X/Y position with smooth interpolation. Hotspots are practical image-space percentage coordinates; their semantic details stay accessible independently of WebGL. Opening a hotspot changes the model camera/rotation.

Exploded views require independent mesh nodes named `explode_…`. Their original translations are retained and restored as scroll progress reverses. The chosen axis and distance apply proportionally by node order. Unprepared models remain intact. This is not a general skeletal or animation-clip editor.

## Verification

Browser tests build an original minimal GLB fixture and test successful WebGL rendering, rotation, context loss, 404, invalid data, oversized header, unavailable WebGL and removal during loading. A prepared sneaker GLB, real texture budgets, lighting review, mobile GPU profiling and physical-device validation are still required for release. Procedural fixture success does not prove production model quality.

## Visible demo configuration

The default home page now configures `demo_model` on the hero, product story and hotspots. The bundled original `vanta-concept.glb` makes the actual engine visible without an external upload. Hero auto-rotation, drag, pause and fullscreen are enabled; mobile uses interactive loading on capable devices. Reduced motion still starts with the poster and requires explicit activation. Low-power/data-saver hints also retain activation controls.

The bundled model is a stylized sneaker with upper, sole, tread, laces and heel details. Its geometry is reproducible with `node scripts/create-demo-model.mjs`; original mesh details are batched to reduce draw calls. An uploaded model remains preferred for real product fidelity. New browser tests verify actual default canvas rendering and animation changes, distinct demo product images, story activation and reduced-motion behavior on desktop/mobile.
