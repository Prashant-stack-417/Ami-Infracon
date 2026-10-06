```yaml
Title: Authentication Flow
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔐 Authentication Flow

## 1. Email & Password
1. User submits credentials.
2. Backend finds user and compares hashed password using `bcryptjs`.
3. If valid, backend generates a JWT (signed with `JWT_SECRET`).
4. `ApiResponse` returns the JWT and user object to the client.
5. Zustand stores the token and user data.

## 2. Google OAuth
1. Frontend uses `@react-oauth/google` to get an ID token from Google.
2. Token is sent to `POST /api/v1/auth/google`.
3. Backend verifies the token using `google-auth-library`.
4. If the user doesn't exist, they are implicitly registered.
5. Backend issues a standard Ami Infracon JWT to the client.
