```yaml
Title: API Specification
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔌 API Specification

## 1. Authentication
- `POST /api/v1/auth/register` (Public)
- `POST /api/v1/auth/login` (Public)
- `POST /api/v1/auth/google` (Public)

## 2. User/Profile
- `GET /api/v1/users/profile` (Protected)
- `PUT /api/v1/users/profile` (Protected) - Update `defaultAddress`.

## 3. Products
- `GET /api/v1/products` (Public)
- `GET /api/v1/products/:id` (Public)
- `POST /api/v1/admin/products` (Admin Protected)

## 4. Orders
- `POST /api/v1/orders` (Protected)
- `GET /api/v1/orders/my-orders` (Protected)
- `PUT /api/v1/admin/orders/:id/status` (Admin Protected)
