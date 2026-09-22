import { Component, request } from './core.js';
export class PredictiveSearch extends Component {
  connect() {
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('[data-results]');
    this.on(this.input, 'input', () => {
      clearTimeout(this.timer);
      this.fetcher?.abort();
      this.timer = setTimeout(() => this.search(), 180);
    });
    this.on(this, 'keydown', (event) => {
      if (event.key === 'Escape') {
        this.close();
        this.input.focus();
        return;
      }
      const links = [...this.results.querySelectorAll('a')];
      if (!links.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const index = links.indexOf(document.activeElement);
      links[(index + delta + links.length) % links.length].focus();
    });
    this.on(this, 'focusout', (event) => {
      if (!this.contains(event.relatedTarget)) this.close();
    });
  }
  close() {
    this.results.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
  }
  async search() {
    const query = this.input.value.trim();
    if (query.length < 2) {
      this.close();
      return;
    }
    this.fetcher = new AbortController();
    const url = new URL(this.dataset.url, location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('section_id', 'predictive-search');
    url.searchParams.set('resources[type]', 'product,page,article');
    try {
      const text = await (await request(url, { signal: this.fetcher.signal })).text();
      if (query !== this.input.value.trim()) return;
      const content = new DOMParser()
        .parseFromString(text, 'text/html')
        .querySelector('.shopify-section');
      if (!content) return;
      this.results.innerHTML = content.innerHTML;
      this.results.hidden = false;
      this.input.setAttribute('aria-expanded', 'true');
      this.querySelector('[data-search-status]').textContent =
        `${this.results.querySelectorAll('a').length} ${this.dataset.resultsLabel || ''}`;
    } catch {
      this.close();
    }
  }
  disconnect() {
    clearTimeout(this.timer);
    this.fetcher?.abort();
  }
}
