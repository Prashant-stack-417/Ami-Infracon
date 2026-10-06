```yaml
Title: Authentication
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔐 Authentication

## 1. Strategy
Ami Infracon uses stateless authentication via **JSON Web Tokens (JWT)**.
- Passwords are one-way hashed using `bcryptjs` before being saved to MongoDB.
- Users can authenticate via standard Email/Password or via **Google OAuth** (`@react-oauth/google` and `google-auth-library`).

## 2. Token Delivery
- Currently, tokens are returned in the JSON payload of the login response and stored by the client (Zustand/localStorage).
- *Security Note:* While functional, consider moving to `httpOnly` cookies in the future to mitigate XSS risks, especially for admin tokens.

## 3. Token Verification
- Backend routes are protected by an `auth.middleware.js` interceptor.
- The middleware extracts the Bearer token from the `Authorization` header, verifies it against `JWT_SECRET`, and attaches the decoded `req.user`.
