```yaml
Title: Design Tokens
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧩 Design Tokens

## 1. What are Design Tokens?
Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes like colors, spacing, and typography. In this project, Tailwind CSS acts as our design token dictionary.

## 2. Tailwind configuration (v4)
We utilize default Tailwind spacing, sizing, and color pallets unless specifically overridden in `index.css`.

- **Prefixes:** We do not use prefixes for Tailwind classes.
- **Dark Mode:** Toggled via class strategy (`className="dark"` on the `<html>` element).

## 3. Theming
All token overrides (if any) are defined as CSS variables at the `:root` level and consumed by Tailwind 4's new CSS-driven configuration.
