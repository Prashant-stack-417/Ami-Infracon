```yaml
Title: Accessibility Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ♿ Accessibility Testing

## 1. Automated Testing
- Use **axe-core** (via `cypress-axe`) in the E2E pipeline to automatically scan key pages (Home, Product, Checkout) for WCAG violations.
- Configure ESLint with `eslint-plugin-jsx-a11y` to catch missing `alt` tags and ARIA roles during development.

## 2. Manual Testing
Before a major UI release:
- **Keyboard Navigation:** Navigate the checkout flow entirely using the `Tab`, `Enter`, and `Space` keys.
- **Screen Reader:** Turn on VoiceOver (Mac) or NVDA (Windows) and attempt to complete a purchase. Ensure focus management on Modals/Drawers is working correctly.
