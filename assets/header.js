import { Component } from './core.js';
export class VantaHeader extends Component {
  connect() {
    this.on(this, 'keydown', (event) => {
      if (event.key === 'Escape') {
        const detail = event.target.closest('details[open]');
        if (detail) {
          detail.open = false;
          detail.querySelector('summary').focus();
        }
      }
    });
    this.on(document, 'click', (event) => {
      if (!this.contains(event.target))
        this.querySelectorAll('details[open]').forEach((detail) => {
          detail.open = false;
        });
    });
    this.on(this, 'focusout', (event) => {
      if (!this.contains(event.relatedTarget))
        this.querySelectorAll('details[open]').forEach((detail) => {
          detail.open = false;
        });
    });
    let last = scrollY;
    this.on(
      window,
      'scroll',
      () => {
        this.classList.toggle('is-scrolled', scrollY > 24);
        if (this.dataset.mode === 'reveal')
          this.classList.toggle(
            'is-hidden',
            scrollY > last &&
              scrollY > 180 &&
              !this.contains(document.activeElement) &&
              !this.querySelector('details[open]'),
          );
        last = scrollY;
      },
      { passive: true },
    );
  }
}
