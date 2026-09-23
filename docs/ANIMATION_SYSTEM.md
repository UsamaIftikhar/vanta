# Animation system

The base page is visible without JavaScript. `motion.js` observes marked headings and animates only as they enter view, once. It never places hidden styles on server-rendered content. Utility, normal and cinematic durations and easing curves live in `theme.css`; reveal duration and style are configurable.

Reveals: none, fade, fade-up, clip, scale-subtle and stagger. Stagger currently uses the same restrained individual reveal timing, rather than delaying reading. Magnetic CTAs and an additive pointer halo are off by default, fine-pointer only. Native cursor remains present. CSS cross-document view transitions progressively fade navigation in supporting browsers; no route interception.

Horizontal stories use native scroll snap and ordinary horizontal scrolling, including keyboard scrolling. They deliberately do not map vertical wheel gestures or lock the page. Mobile story frames use native horizontal scrolling; desktop frames live next to a sticky model.

Reduced motion suppresses CSS animation, cancels active Web Animations and disables automatic camera motion. Optional direct model rotation remains an explicit user action. A runtime preference change stops motion. Merchant animation settings must not override operating-system preferences.

The default VANTA experience uses `motion-product`, a lightweight image-depth component rather than WebGL. Pointer position produces restrained perspective, scroll adds shallow Z-like movement, story frames change the material-detail focal point, and hotspot expansion can guide the same visual. It renders a complete image before JavaScript, updates only through event-driven animation frames, has no continuous render loop and remains static under reduced motion. A configured GLB still opts a section into the separate Three.js path.

Editor sections initialize through `shopify:section:load`; section reveal observers disconnect on unload. Scene, header, cart and search web components own AbortControllers. Editor block selection scrolls the selected block into view and opens containing details.
