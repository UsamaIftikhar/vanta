export const announce = (message) => {
  const status = document.querySelector('#StoreStatus');
  if (status) status.textContent = message;
};
export const root = () => window.Shopify?.routes?.root || '/';
export const errorMessage = () => document.body.dataset.error;
export async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.description === 'string' ? body.description : errorMessage());
  }
  return response;
}
export class Component extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.connect?.();
  }
  disconnectedCallback() {
    this.controller?.abort();
    this.disconnect?.();
  }
  on(target, type, listener, options = {}) {
    target?.addEventListener(type, listener, { ...options, signal: this.signal });
  }
}
export function closeDialog(dialog) {
  dialog.close();
  document.documentElement.classList.remove('dialog-open');
}
export function openDialog(dialog, trigger = document.activeElement) {
  dialog.returnFocus = trigger;
  dialog.showModal();
  document.documentElement.classList.add('dialog-open');
}
export function bindDialog(owner, dialog) {
  owner.on(dialog, 'click', (event) => {
    if (event.target.closest('[data-close-dialog]') || event.target === dialog) closeDialog(dialog);
  });
  owner.on(dialog, 'close', () => {
    document.documentElement.classList.remove('dialog-open');
    if (dialog.returnFocus?.isConnected) dialog.returnFocus.focus({ preventScroll: true });
  });
}
