import { Component, request, errorMessage, openDialog, bindDialog } from './core.js';
export class ProductDetail extends Component {
  observePurchase() {
    this.purchaseObserver?.disconnect();
    const button = this.querySelector('.purchase-button');
    const sticky = this.querySelector('.sticky-purchase');
    if (!button || !sticky) return;
    this.purchaseObserver = new IntersectionObserver(([entry]) => {
      sticky.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
    });
    this.purchaseObserver.observe(button);
  }
  connect() {
    this.observePurchase();
    this.on(this, 'click', async (event) => {
      const link = event.target.closest('[data-option-link]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      this.fetchController?.abort();
      this.fetchController = new AbortController();
      const pending = this.fetchController;
      const url = new URL(link.href);
      url.searchParams.set('section_id', this.dataset.section);
      this.setAttribute('aria-busy', 'true');
      this.querySelectorAll('button[type="submit"]').forEach((button) => {
        button.disabled = true;
      });
      const quantity = this.querySelector('[name="quantity"]')?.value;
      try {
        const html = await (await request(url, { signal: pending.signal })).text();
        if (pending.signal.aborted || pending !== this.fetchController) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const next = doc.querySelector('product-detail');
        if (!next) throw new Error(errorMessage());
        this.innerHTML = next.innerHTML;
        this.dataset.variant = next.dataset.variant;
        this.dataset.productUrl = next.dataset.productUrl;
        const input = this.querySelector('[name="quantity"]');
        if (input && quantity) {
          input.value = quantity;
          if (!input.checkValidity()) input.value = input.min || 1;
        }
        this.querySelector(`[data-option-id="${CSS.escape(link.dataset.optionId)}"]`)?.focus({
          preventScroll: true,
        });
        if (
          document.querySelector('main > .shopify-section product-detail') === this &&
          location.pathname.includes('/products/')
        ) {
          const stateURL = new URL(link.href);
          if (next.dataset.variant) {
            stateURL.search = '';
            stateURL.searchParams.set('variant', next.dataset.variant);
          }
          history.replaceState({}, '', stateURL);
        }
        window.Shopify?.PaymentButton?.init();
        this.observePurchase();
      } catch (err) {
        if (err.name !== 'AbortError') location.assign(link.href);
      } finally {
        if (pending === this.fetchController) this.removeAttribute('aria-busy');
      }
    });
  }
  disconnect() {
    this.fetchController?.abort();
    this.purchaseObserver?.disconnect();
  }
}
export class MediaGallery extends Component {
  connect() {
    this.track = this.querySelector('.media-track');
    const dialog = this.querySelector('dialog');
    if (dialog) bindDialog(this, dialog);
    this.on(this, 'click', (event) => {
      const thumb = event.target.closest('[data-media-target]');
      if (thumb) {
        event.preventDefault();
        this.select(thumb.dataset.mediaTarget);
      }
      const zoom = event.target.closest('[data-zoom]');
      if (zoom && dialog) {
        event.preventDefault();
        const image = dialog.querySelector('img');
        image.src = zoom.href;
        image.alt = zoom.querySelector('img')?.alt || '';
        openDialog(dialog, zoom);
      }
    });
    this.on(this, 'keydown', (event) => {
      if (
        !event.target.closest('.media-thumbnails') ||
        !['ArrowLeft', 'ArrowRight'].includes(event.key)
      )
        return;
      const links = [...this.querySelectorAll('[data-media-target]')];
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const next = links[(links.indexOf(event.target) + offset + links.length) % links.length];
      event.preventDefault();
      next.focus();
      next.click();
    });
    if (this.dataset.featured)
      requestAnimationFrame(() => {
        if (this.isConnected) this.select(this.dataset.featured, false);
      });
  }
  select(id, smooth = true) {
    const target = this.querySelector(`[data-media-id="${CSS.escape(id)}"]`);
    if (!target) return;
    if (getComputedStyle(this.track).display === 'flex')
      this.track.scrollTo({
        left: target.offsetLeft - this.track.offsetLeft,
        behavior:
          smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
      });
    else if (smooth) target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    this.querySelectorAll('[data-media-target]').forEach((link) => {
      link.setAttribute('aria-current', String(link.dataset.mediaTarget === id));
    });
    this.querySelectorAll('video').forEach((video) => video.pause());
  }
}
export class ProductRecommendations extends Component {
  connect() {
    if (this.loaded) return;
    this.observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer.disconnect();
        try {
          const text = await (await request(this.dataset.url, { signal: this.signal })).text();
          const content = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('product-recommendations');
          if (content && this.isConnected) {
            this.innerHTML = content.innerHTML;
            this.loaded = true;
          }
        } catch {
          /* Recommendations never block purchasing. */
        }
      },
      { rootMargin: '200px' },
    );
    this.observer.observe(this);
  }
  disconnect() {
    this.observer?.disconnect();
  }
}
