import { ProductForm, CartDrawer, CartPage } from './cart.js';
import { ProductDetail, MediaGallery, ProductRecommendations } from './product.js';
import { PredictiveSearch } from './search.js';
import { VantaHeader } from './header.js';
import { MotionProduct } from './image-motion.js';
for (const [name, component] of Object.entries({
  'product-form': ProductForm,
  'cart-drawer': CartDrawer,
  'cart-page': CartPage,
  'product-detail': ProductDetail,
  'media-gallery': MediaGallery,
  'product-recommendations': ProductRecommendations,
  'predictive-search': PredictiveSearch,
  'vanta-header': VantaHeader,
  'motion-product': MotionProduct,
})) {
  if (!customElements.get(name)) customElements.define(name, component);
}
const initialize = (scope = document) => {
  if (
    document.body.dataset.reveal !== 'none' ||
    document.body.dataset.magnetic === 'true' ||
    document.body.dataset.cursor === 'true'
  )
    import('./motion.js').then(({ initializeMotion }) => initializeMotion(scope)).catch(() => {});
  const scene = scope.querySelector('product-scene');
  if (scene?.dataset.model) import('./three-loader.js').catch(() => {});
};
initialize();
document.addEventListener('shopify:section:load', (event) => initialize(event.target));
document.addEventListener('shopify:block:select', (event) => {
  event.target.closest('details')?.setAttribute('open', '');
  event.target.scrollIntoView({ block: 'nearest' });
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('.hotspot-dot');
  if (link) {
    const target = document.getElementById(link.hash.slice(1));
    if (target?.localName === 'details') target.open = true;
  }
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-marquee-pause]');
  if (button) {
    const paused = button.closest('.marquee').classList.toggle('is-paused');
    button.textContent = paused ? button.dataset.resume : button.dataset.pause;
  }
});
