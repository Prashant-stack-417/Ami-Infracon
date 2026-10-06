```yaml
Title: Accessibility (a11y)
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ♿ Accessibility

## 1. Contrast
- Ensure all text passes WCAG AA contrast ratios (4.5:1 for normal text).
- Be especially careful with gray text on light gray backgrounds (`text-gray-500` on `bg-gray-100` often fails).

## 2. Keyboard Navigation
- Every interactive element (button, link, input) must be focusable via `Tab`.
- Provide visible focus rings (`focus:ring-2 focus:ring-blue-500 focus:outline-none`).

## 3. ARIA & Screen Readers
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`).
- Provide `aria-label` for icon-only buttons.
- Ensure modals trap focus and can be closed with the `Escape` key.
- Toast notifications must use `role="alert"`.
