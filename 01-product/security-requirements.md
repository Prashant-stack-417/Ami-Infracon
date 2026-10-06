```yaml
Title: Security Requirements
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - 02-engineering/authorization.md
```

# 🔒 Security Requirements

## 1. Authentication
- **JWT Lifespan:** Tokens must have a strict expiration time. 
- **Secret Management:** `JWT_SECRET` and `ADMIN_JWT_SECRET` must be securely stored in environment variables, never hardcoded.

## 2. Authorization & RBAC
- **Route Guards (Frontend):** 
  - `ProtectedRoute` for authenticated buyers.
  - `AdminProtectedRoute` for Admin panel access.
  - `SuperAdminProtectedRoute` for analytics and user creation.
- **Middleware (Backend):**
  - Verify tokens on every protected route.
  - Ensure operations on `/api/admin` routes validate the `role` enum.

## 3. Data Protection
- **Encryption at Rest:** Handled by MongoDB.
- **Data in Transit:** TLS/SSL (HTTPS) must be enforced in production.
- **Input Validation:** Request bodies must be validated to prevent NoSQL injection and XSS.

## 4. Infrastructure Security
- **Rate Limiting:** Enforced globally at 500 requests per 15 minutes.
- **Payload Limits:** Express body parser is limited to `16kb` to prevent payload-based DoS attacks.
