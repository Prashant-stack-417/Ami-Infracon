```yaml
Title: Experience Tokens
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ✨ Experience Tokens

## 1. Micro-Interactions
Experience tokens govern how the application *feels*.
- **Hover States:** All interactive elements (buttons, links, cards) must have a visible hover state (e.g., `hover:bg-gray-100`, `hover:shadow-md`).
- **Focus Rings:** Ensure high accessibility by using `focus:ring` on inputs and buttons.
- **Active States:** Buttons should have an `active:scale-95` to provide tactile feedback.

## 2. Feedback Timing
- **Toast Notifications:** Success/Error toasts (`react-hot-toast`) should display for exactly 3 seconds.
- **Loading:** Wait 200ms before showing a loading spinner to prevent UI flickering on fast network responses.

## 3. Animations
Handled via `animejs`:
- Cart Drawer slide-in.
- Item addition to cart (gentle bounce).
