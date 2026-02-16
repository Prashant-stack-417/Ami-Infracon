/**
 * Focus Management Utilities
 * Helpers for managing focus in the application for better accessibility
 */

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  if (!container) return [];

  const focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]:not([contenteditable="false"])',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(',')));
};

/**
 * Trap focus within a container (useful for modals)
 * @param {HTMLElement} container - Container element
 * @returns {Function} Cleanup function
 */
export const trapFocus = (container) => {
  if (!container) return () => {};

  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  // Set initial focus
  firstFocusable?.focus();

  // Add event listener
  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Store and restore focus
 * @returns {Object} Object with store and restore functions
 */
export const focusManager = (() => {
  let previouslyFocusedElement = null;

  return {
    /**
     * Store currently focused element
     */
    store: () => {
      previouslyFocusedElement = document.activeElement;
    },

    /**
     * Restore previously focused element
     */
    restore: () => {
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    },
  };
})();

/**
 * Set focus to element by ID or selector
 * @param {string} selector - Element selector or ID
 * @param {Object} options - Focus options
 */
export const setFocus = (selector, options = {}) => {
  const { delay = 0, preventScroll = false } = options;

  const focusElement = () => {
    const element = selector.startsWith('#')
      ? document.getElementById(selector.slice(1))
      : document.querySelector(selector);

    if (element && element.focus) {
      element.focus({ preventScroll });
    }
  };

  if (delay > 0) {
    setTimeout(focusElement, delay);
  } else {
    focusElement();
  }
};

/**
 * Create a roving tabindex for a list of elements
 * Useful for keyboard navigation in lists, menus, etc.
 * @param {HTMLElement[]} elements - Array of elements
 * @param {number} initialIndex - Initial focused index
 * @returns {Object} Object with navigation methods
 */
export const createRovingTabindex = (elements, initialIndex = 0) => {
  if (!elements || elements.length === 0) {
    return {
      focusNext: () => {},
      focusPrevious: () => {},
      focusFirst: () => {},
      focusLast: () => {},
      focusIndex: () => {},
    };
  }

  let currentIndex = initialIndex;

  const updateTabindex = (newIndex) => {
    elements.forEach((el, index) => {
      if (el) {
        el.tabIndex = index === newIndex ? 0 : -1;
      }
    });
    currentIndex = newIndex;
    elements[currentIndex]?.focus();
  };

  // Initialize
  updateTabindex(initialIndex);

  return {
    focusNext: () => {
      const nextIndex = (currentIndex + 1) % elements.length;
      updateTabindex(nextIndex);
    },
    focusPrevious: () => {
      const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
      updateTabindex(prevIndex);
    },
    focusFirst: () => {
      updateTabindex(0);
    },
    focusLast: () => {
      updateTabindex(elements.length - 1);
    },
    focusIndex: (index) => {
      if (index >= 0 && index < elements.length) {
        updateTabindex(index);
      }
    },
  };
};

/**
 * Check if an element is visible in the viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if visible
 */
export const isElementVisible = (element) => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll element into view if not visible
 * @param {HTMLElement} element - Element to scroll to
 * @param {Object} options - Scroll options
 */
export const scrollIntoViewIfNeeded = (element, options = {}) => {
  if (!element || isElementVisible(element)) return;

  const { behavior = 'smooth', block = 'nearest', inline = 'nearest' } = options;

  element.scrollIntoView({
    behavior,
    block,
    inline,
  });
};
