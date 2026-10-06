```yaml
Title: Motion
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🎬 Motion & Animation

## 1. Guidelines
- Animations must be purposeful (guiding attention, providing feedback), not purely decorative.
- Keep durations short (150ms - 300ms) so the UI feels snappy.

## 2. CSS Transitions (Tailwind)
- **Hover Effects:** Use `transition-all duration-200 ease-in-out` on buttons and cards.
- **Fade Ins:** Modals and dropdowns should enter with `opacity-0` -> `opacity-100`.

## 3. Complex Animations (Anime.js)
`animejs` is reserved for specific, complex orchestrations:
- The "Add to Cart" trajectory (flying item to cart icon).
- Staggered list reveals (e.g., loading a grid of products).
- Number counting (e.g., animating the total revenue counter on the Admin dashboard).
