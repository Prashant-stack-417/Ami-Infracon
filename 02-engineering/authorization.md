```yaml
Title: Authorization
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🛡️ Authorization & RBAC

## 1. Role Definitions
The platform utilizes Role-Based Access Control (RBAC) with three primary tiers:
- **User:** Public buyer. Can manage own profile/cart, place orders, view own order history.
- **Admin:** Internal employee. Can manage the product catalog, process orders, and manage blog posts.
- **SuperAdmin:** Executive/Owner. Has all Admin privileges, plus access to aggregate analytics and the ability to create/manage other Admins.

## 2. Backend Enforcement
- The `Admin` collection is separate from the `User` collection.
- SuperAdmins are denoted by a `role: "superadmin"` field on the `Admin` schema (not a separate collection).
- Middleware validates the role before allowing access to `/api/admin/*` routes.

## 3. Frontend Enforcement
React Router guards restrict UI access:
- `<ProtectedRoute>` wraps User routes.
- `<AdminProtectedRoute>` wraps Admin routes.
- `<SuperAdminProtectedRoute>` wraps SuperAdmin analytics and management routes.
