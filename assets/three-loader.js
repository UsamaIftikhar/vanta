import { Component } from './core.js';
export class ProductScene extends Component {
  connect() {
    this.visible = false;
    this.loading = false;
    this.failed = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.on(this.reduced, 'change', () => {
      this.scene?.setMotion(!this.reduced.matches);
    });
    this.observer = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0].isIntersecting;
        if (this.visible && this.shouldAutoLoad()) this.initialize();
        this.scene?.setActive(this.visible && !document.hidden);
      },
      { rootMargin: '0px' },
    );
    this.observer.observe(this);
    this.on(document, 'visibilitychange', () =>
      this.scene?.setActive(this.visible && !document.hidden),
    );
    if (document.body.getAttribute('data-enable-3d') === 'false') {
      const enable = this.querySelector('[data-scene-enable]');
      if (enable) enable.hidden = true;
    }
    this.on(this.querySelector('[data-scene-enable]'), 'click', () => this.initialize(true));
    this.on(this.querySelector('[data-scene-pause]'), 'click', (event) => {
      this.paused = !this.paused;
      this.scene?.setMotion(!this.paused && !this.reduced.matches);
      event.currentTarget.textContent = this.paused
        ? event.currentTarget.dataset.resume
        : event.currentTarget.dataset.pause;
    });
    this.on(this.querySelector('[data-scene-left]'), 'click', () => this.scene?.rotate(-0.3));
    this.on(this.querySelector('[data-scene-right]'), 'click', () => this.scene?.rotate(0.3));
    this.on(this.querySelector('[data-scene-reset]'), 'click', () => this.scene?.reset());
    this.on(this.querySelector('[data-scene-fullscreen]'), 'click', () => {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else this.requestFullscreen?.().catch(() => {});
    });
    const parent = this.closest('.marketing-section');
    parent?.querySelectorAll('.hotspot-dot').forEach((link) =>
      this.on(link, 'click', () => {
        const detail = parent.querySelector(link.getAttribute('href'));
        if (detail) detail.open = true;
      }),
    );
    parent?.querySelectorAll('[data-hotspot]').forEach((detail) =>
      this.on(detail, 'toggle', () => {
        if (detail.open) this.scene?.setFrame(detail.dataset);
      }),
    );
    const frames = parent?.querySelectorAll('[data-story-frame]');
    if (frames?.length) {
      this.frameObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) this.scene?.setFrame(entry.target.dataset);
        },
        { threshold: 0.5 },
      );
      frames.forEach((frame) => this.frameObserver.observe(frame));
    }
  }
  shouldAutoLoad() {
    const lowPower =
      navigator.connection?.saveData ||
      (navigator.deviceMemory && navigator.deviceMemory < 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    return (
      this.dataset.model &&
      document.body.getAttribute('data-enable-3d') !== 'false' &&
      document.body.dataset.quality !== 'poster' &&
      !lowPower &&
      !(innerWidth < 768 && this.dataset.mobile === 'poster') &&
      !(this.reduced.matches && this.dataset.reduced === 'poster')
    );
  }
  async initialize(explicit = false) {
    if (
      this.loading ||
      this.scene ||
      this.failed ||
      !this.dataset.model ||
      document.body.getAttribute('data-enable-3d') === 'false'
    )
      return;
    this.loading = true;
    const signal = this.signal;
    const button = this.querySelector('[data-scene-enable]');
    if (button) button.disabled = true;
    try {
      const { createScene } = await import('./three-scene.js');
      if (signal.aborted) return;
      const scene = await createScene(this, signal, explicit);
      if (signal.aborted) {
        scene.dispose();
        return;
      }
      this.scene = scene;
      this.classList.add('scene-ready');
      if (button) button.hidden = true;
      this.querySelector('.scene-controls').hidden = false;
      scene.setActive(this.visible && !document.hidden);
    } catch (error) {
      if (!signal.aborted) this.fallback();
    } finally {
      this.loading = false;
      if (button) button.disabled = false;
    }
  }
  fallback() {
    this.failed = true;
    this.scene?.dispose();
    this.scene = null;
    this.classList.remove('scene-ready');
    this.classList.add('scene-failed');
    const status = this.querySelector('.scene-status');
    if (status) status.textContent = status.dataset.failure;
    const controls = this.querySelector('.scene-controls');
    if (controls) controls.hidden = true;
    const button = this.querySelector('[data-scene-enable]');
    if (button) button.hidden = true;
  }
  disconnect() {
    this.observer?.disconnect();
    this.frameObserver?.disconnect();
    this.scene?.dispose();
    this.scene = null;
    this.classList.remove('scene-ready');
  }
}
if (!customElements.get('product-scene')) customElements.define('product-scene', ProductScene);
