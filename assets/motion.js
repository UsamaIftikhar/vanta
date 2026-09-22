const tracked = new WeakSet();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const observers = new Map();
export function initializeMotion(scope) {
  if (reduced.matches) return;
  const mode = document.body.dataset.reveal;
  if (mode !== 'none') {
    observers.get(scope)?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const start = { opacity: 0 };
          if (mode === 'fade-up' || mode === 'stagger') start.transform = 'translateY(18px)';
          if (mode === 'scale-subtle') start.transform = 'scale(.98)';
          if (mode === 'clip') start.clipPath = 'inset(0 0 100% 0)';
          entry.target.animate([start, { opacity: 1, transform: 'none', clipPath: 'inset(0)' }], {
            duration:
              parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--duration-reveal'),
              ) || 600,
            easing: 'cubic-bezier(.16,1,.3,1)',
          });
        }
      },
      { threshold: 0.12 },
    );
    scope.querySelectorAll('[data-animate]').forEach((el) => {
      if (!tracked.has(el)) {
        tracked.add(el);
        observer.observe(el);
      }
    });
    observers.set(scope, observer);
  }
  if (
    matchMedia('(hover:hover) and (pointer:fine)').matches &&
    document.body.dataset.magnetic === 'true'
  ) {
    scope.querySelectorAll('[data-magnetic]').forEach((button) => {
      if (button.dataset.magneticReady) return;
      button.dataset.magneticReady = 'true';
      button.addEventListener('pointermove', (event) => {
        if (reduced.matches) return;
        const rect = button.getBoundingClientRect();
        button.style.translate = `${(event.clientX - rect.left - rect.width / 2) * 0.08}px ${(event.clientY - rect.top - rect.height / 2) * 0.08}px`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.translate = 'none';
      });
    });
  }
  if (
    document.body.dataset.cursor === 'true' &&
    matchMedia('(hover:hover) and (pointer:fine)').matches &&
    !document.querySelector('.cursor-halo')
  ) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-halo';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    document.addEventListener(
      'pointermove',
      (event) => {
        cursor.style.transform = `translate(${event.clientX - 12}px,${event.clientY - 12}px)`;
      },
      { passive: true },
    );
  }
}
document.addEventListener('shopify:section:unload', (event) => {
  for (const observer of observers.values())
    event.target.querySelectorAll('[data-animate]').forEach((el) => observer.unobserve(el));
  observers.get(event.target)?.disconnect();
  observers.delete(event.target);
});
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    for (const animation of document.getAnimations()) animation.cancel();
  }
});
