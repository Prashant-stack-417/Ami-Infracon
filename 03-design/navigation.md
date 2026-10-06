```yaml
Title: Navigation
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧭 Navigation Patterns

## 1. React Router
All routing is managed by React Router v7. No full-page reloads.

## 2. Navigation Types
- **Primary Navbar:** Horizontal. Used for public routes (Home, Products, Blog).
- **Sidebar (Dashboard):** Vertical. Used for deep navigation within User and Admin spaces.
- **Breadcrumbs:** Used in deep views (e.g., Admin -> Products -> Edit Product) to allow easy backward navigation.
- **Pagination:** Used on list views (Products list, Orders list) to handle large datasets gracefully.

## 3. Active States
- Navigation links must highlight when active.
- Utilize React Router's `<NavLink>` and apply classes based on the `isActive` prop (e.g., `isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"`).
