import {
  Component,
  root,
  request,
  announce,
  errorMessage,
  openDialog,
  bindDialog,
} from './core.js';
let mutation = Promise.resolve();
export function queueMutation(work) {
  const task = mutation.then(work, work);
  mutation = task.catch(() => {});
  return task;
}
async function refreshCart() {
  const cart = await (await request(`${root()}cart.js`)).json();
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = cart.item_count;
  });
  const targets = [...document.querySelectorAll('cart-drawer, cart-page')];
  if (!targets.length) return;
  const url = new URL(root(), location.origin);
  url.searchParams.set('sections', targets.map((target) => target.dataset.section).join(','));
  const sections = await (await request(url)).json();
  for (const target of targets) {
    const html = sections[target.dataset.section];
    if (!html) throw new Error(errorMessage());
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const source = parsed.querySelector(
      target.localName === 'cart-drawer' ? '[data-cart-content]' : 'cart-page',
    );
    if (!source) throw new Error(errorMessage());
    (target.querySelector('[data-cart-content]') || target).innerHTML = source.innerHTML;
  }
}
export class ProductForm extends Component {
  connect() {
    this.on(this, 'submit', async (event) => {
      if (!document.querySelector('cart-drawer')) return;
      event.preventDefault();
      if (this.busy) return;
      const form = event.target;
      if (!form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      const data = new FormData(form);
      this.busy = true;
      const detail = this.closest('product-detail');
      detail?.querySelectorAll('.sticky-purchase button').forEach((control) => {
        control.disabled = true;
      });
      button.disabled = true;
      this.setAttribute('aria-busy', 'true');
      const error = this.querySelector('[data-form-error]');
      if (error) error.textContent = '';
      let added = false;
      try {
        await queueMutation(async () => {
          await request(`${root()}cart/add.js`, { method: 'POST', body: data });
          added = true;
          await refreshCart();
        });
        announce(document.body.dataset.added);
        document.querySelector('cart-drawer')?.open();
      } catch (err) {
        if (added) {
          location.assign(`${root()}cart`);
          return;
        }
        if (error) error.textContent = err.message;
      } finally {
        this.busy = false;
        button.disabled = false;
        detail?.querySelectorAll('.sticky-purchase button').forEach((control) => {
          control.disabled = false;
        });
        this.removeAttribute('aria-busy');
      }
    });
    this.querySelectorAll('[data-timezone]').forEach((input) => {
      input.value = new Date().getTimezoneOffset();
    });
  }
}
class CartBase extends Component {
  connect() {
    this.on(this, 'click', (event) => {
      const remove = event.target.closest('[data-remove-key]');
      if (remove) {
        event.preventDefault();
        this.change(remove.dataset.removeKey, 0);
      }
    });
    this.on(this, 'change', (event) => {
      if (event.target.matches('[data-line-key]') && event.target.reportValidity())
        this.change(event.target.dataset.lineKey, Number(event.target.value));
    });
  }
  async change(id, quantity) {
    if (this.busy) return;
    this.busy = true;
    this.setAttribute('aria-busy', 'true');
    const focusedKey = document.activeElement?.dataset.lineKey;
    const note = this.querySelector('[name="note"]')?.value;
    this.querySelectorAll('button,input,textarea').forEach((el) => {
      el.disabled = true;
    });
    try {
      await queueMutation(async () => {
        if (note !== undefined)
          await request(`${root()}cart/update.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note }),
          });
        await request(`${root()}cart/change.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, quantity }),
        });
        await refreshCart();
      });
      if (focusedKey) this.querySelector(`[data-line-key="${CSS.escape(focusedKey)}"]`)?.focus();
      announce(document.querySelector('[data-cart-count]')?.textContent || '');
    } catch (err) {
      const error = this.querySelector('[data-cart-error]');
      if (error) error.textContent = err.message;
    } finally {
      this.busy = false;
      this.removeAttribute('aria-busy');
      this.querySelectorAll('button,input,textarea').forEach((el) => {
        el.disabled = false;
      });
    }
  }
}
export class CartPage extends CartBase {}
export class CartDrawer extends CartBase {
  connect() {
    super.connect();
    this.dialog = this.querySelector('dialog');
    bindDialog(this, this.dialog);
    this.on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-open-cart]');
      if (trigger && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        this.open(trigger);
      }
    });
  }
  open(trigger) {
    if (!this.dialog.open) openDialog(this.dialog, trigger);
  }
  disconnect() {
    if (this.dialog?.open) this.dialog.close();
    document.documentElement.classList.remove('dialog-open');
  }
}
