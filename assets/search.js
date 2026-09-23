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
      if (!this.results.querySelector('a')) await this.catalogFallback(query);
      this.results.hidden = false;
      this.input.setAttribute('aria-expanded', 'true');
      this.querySelector('[data-search-status]').textContent =
        `${this.results.querySelectorAll('a').length} ${this.dataset.resultsLabel || ''}`;
    } catch {
      this.close();
    }
  }
  async catalogFallback(query) {
    const response = await request('/products.json?limit=250', {
      signal: this.fetcher.signal,
    });
    const catalog = await response.json();
    const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = (catalog.products || [])
      .filter((product) => {
        const tags = Array.isArray(product.tags) ? product.tags : [product.tags || ''];
        const text = [product.title, product.vendor, product.product_type, ...tags]
          .join(' ')
          .toLocaleLowerCase();
        return terms.every((term) => text.includes(term));
      })
      .slice(0, 8);
    if (!matches.length || query !== this.input.value.trim()) return;
    const list = document.createElement('ul');
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', this.dataset.resultsLabel || 'Results');
    const root = window.Shopify?.routes?.root || '/';
    matches.forEach((product) => {
      const item = document.createElement('li');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      const link = document.createElement('a');
      link.href = `${root}products/${encodeURIComponent(product.handle)}`;
      link.textContent = product.title;
      item.append(link);
      list.append(item);
    });
    this.results.replaceChildren(list);
  }
  disconnect() {
    clearTimeout(this.timer);
    this.fetcher?.abort();
  }
}
