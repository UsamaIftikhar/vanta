document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
const qr = document.querySelector('#GiftQR');
if (qr && window.QRCode)
  new window.QRCode(qr, { text: qr.dataset.identifier, width: 120, height: 120 });
