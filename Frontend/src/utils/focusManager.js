/**
 * Get all focusable elements within a container.
 */
export const getFocusableElements = (container) => {
  if (!container) return [];
  const selectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]:not([contenteditable="false"])',
  ];
  return Array.from(container.querySelectorAll(selectors.join(',')));
};

/**
 * Trap focus within a container (useful for modals).
 * Returns a cleanup function.
 */
export const trapFocus = (container) => {
  if (!container) return () => {};

  const focusable = getFocusableElements(container);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  };

  first?.focus();
  container.addEventListener('keydown', handleTab);
  return () => container.removeEventListener('keydown', handleTab);
};

/**
 * Store and restore focus (used by Cart modal).
 */
export const focusManager = (() => {
  let prev = null;
  return {
    store: () => { prev = document.activeElement; },
    restore: () => { prev?.focus(); prev = null; },
  };
})();
