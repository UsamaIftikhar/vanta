import { Component } from './core.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

export class MotionProduct extends Component {
  connectedCallback() {
    if (this.ready) return;
    super.connectedCallback();
    this.ready = true;
    this.frame = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.scrollProgress = 0;
    this.storyScale = 1;
    this.setAttribute('data-motion-ready', '');

    if (!reducedMotion.matches && finePointer.matches) {
      this.on(this, 'pointermove', (event) => this.onPointerMove(event), { passive: true });
      this.on(this, 'pointerleave', () => this.setTarget(0, 0));
    }
    if (!reducedMotion.matches) {
      this.on(window, 'scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    }
    this.bindStoryFrames();
    this.bindHotspots();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.storyObserver?.disconnect();
    cancelAnimationFrame(this.frame);
    this.ready = false;
  }

  bindStoryFrames() {
    const frames = this.closest('.story-layout')?.querySelectorAll('[data-story-frame]');
    if (!frames?.length) return;
    this.storyObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active) this.focusDetail(active.target);
      },
      { threshold: [0.35, 0.6, 0.85] },
    );
    frames.forEach((frame) => this.storyObserver.observe(frame));
  }

  bindHotspots() {
    this.closest('.hotspot-layout')
      ?.querySelectorAll('[data-hotspot]')
      .forEach((detail) => {
        this.on(detail, 'toggle', () => {
          if (detail.open) this.focusDetail(detail);
        });
      });
  }

  focusDetail(detail) {
    const rotation = Number(detail.dataset.rotation || 0);
    const scale = Number(detail.dataset.scale || 100);
    this.storyScale = Math.max(0.9, Math.min(1.2, scale / 100));
    this.style.setProperty('--motion-focus-x', `${Math.max(28, Math.min(72, 50 + rotation / 8))}%`);
    this.setTarget(Math.max(-1, Math.min(1, rotation / 90)), 0);
  }

  onPointerMove(event) {
    const rect = this.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    this.setTarget(x, y);
  }

  onScroll() {
    const rect = this.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    this.scrollProgress = Math.max(
      -1,
      Math.min(1, (viewport / 2 - (rect.top + rect.height / 2)) / viewport),
    );
    this.queueRender();
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.queueRender();
  }

  queueRender() {
    if (!this.frame) this.frame = requestAnimationFrame(() => this.renderMotion());
  }

  renderMotion() {
    this.frame = 0;
    this.currentX += (this.targetX - this.currentX) * 0.12;
    this.currentY += (this.targetY - this.currentY) * 0.12;
    this.style.setProperty('--motion-x', this.currentX.toFixed(3));
    this.style.setProperty('--motion-y', this.currentY.toFixed(3));
    this.style.setProperty('--motion-scroll', this.scrollProgress.toFixed(3));
    this.style.setProperty('--motion-rx', `${(this.currentY * -3).toFixed(2)}deg`);
    this.style.setProperty('--motion-ry', `${(this.currentX * 5).toFixed(2)}deg`);
    this.style.setProperty('--motion-tx', `${(this.currentX * 14).toFixed(2)}px`);
    this.style.setProperty(
      '--motion-ty',
      `${((this.currentY + this.scrollProgress) * 10).toFixed(2)}px`,
    );
    this.style.setProperty('--motion-scale', (1.02 + this.scrollProgress * 0.025).toFixed(3));
    this.style.setProperty(
      '--motion-media-scale',
      (1.04 * this.storyScale + this.scrollProgress * 0.035).toFixed(3),
    );
    this.style.setProperty(
      '--motion-orbit',
      `${(this.currentX * 5 + this.scrollProgress * 8).toFixed(2)}deg`,
    );
    this.style.setProperty('--motion-shadow-x', `${(this.currentX * -10).toFixed(2)}px`);
    this.style.setProperty('--motion-shadow-scale', (1 - this.currentY * 0.04).toFixed(3));
    if (
      Math.abs(this.targetX - this.currentX) > 0.002 ||
      Math.abs(this.targetY - this.currentY) > 0.002
    )
      this.queueRender();
  }
}
