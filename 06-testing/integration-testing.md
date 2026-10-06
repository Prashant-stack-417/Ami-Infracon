```yaml
Title: Integration Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔗 Integration Testing

## 1. Focus
Integration tests verify that the Express router, middleware, controllers, and MongoDB models work together correctly.

## 2. Tooling
- `Supertest` for simulating HTTP requests.
- `mongodb-memory-server` to spin up an ephemeral database per test run (ensures tests don't pollute the dev/prod databases).

## 3. Critical Paths to Test
- `POST /api/v1/auth/login`: Ensure invalid passwords return 401 and valid return JWTs.
- `POST /api/v1/orders`: Ensure an order deducts from the product stock correctly.
- `PUT /api/v1/admin/orders/:id`: Ensure RBAC middleware blocks a regular User from updating an order status.
