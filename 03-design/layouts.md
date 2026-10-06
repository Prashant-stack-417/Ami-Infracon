```yaml
Title: Layouts
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📐 Layouts

## 1. Public App Layout
- **Header:** Sticky top navbar. Contains Logo, Search, User Auth, and Cart toggle.
- **Main:** Centered container. Standard max-width (`max-w-7xl mx-auto`).
- **Footer:** Standard multi-column footer at the bottom of the viewport.

## 2. Dashboard / Admin Layout
- **Sidebar:** Fixed left navigation. Collapsible on mobile/tablet. Contains management links.
- **Header:** Top bar containing breadcrumbs, user profile dropdown, and theme toggle.
- **Main Area:** Fluid width taking up remaining space (`flex-1`). Background `bg-gray-50`.

## 3. Grid Systems
- **Products Grid:** CSS Grid. `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- **Forms:** 1-column on mobile, up to 2-columns on desktop.
