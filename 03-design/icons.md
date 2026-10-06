```yaml
Title: Icons
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🖼️ Icons

## 1. Icon Library
- We utilize **Lucide React** (`lucide-react`) for all UI icons.
- Lucide provides clean, consistent, 24x24 stroke-based SVGs.

## 2. Sizing
- **Small (Inline):** `size={16}` (`w-4 h-4` in Tailwind).
- **Standard (Buttons/Nav):** `size={20}` (`w-5 h-5`).
- **Large (Hero/Empty States):** `size={48}` (`w-12 h-12`).

## 3. Stroke & Color
- Stroke width defaults to `2` (or `1.5` for large icons to prevent them from looking heavy).
- Icon color should generally inherit from the parent text color (`currentColor`), except when explicitly colored for status (e.g., `text-green-500` for a success checkmark).
