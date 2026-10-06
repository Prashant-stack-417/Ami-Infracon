```yaml
Title: Non-Functional Requirements
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - 01-product/functional-requirements.md
```

# 🛡️ Non-Functional Requirements (NFR)

## 1. Performance
- **NFR1.1:** API response times must not exceed 200ms at the 95th percentile under normal load.
- **NFR1.2:** The frontend React application must load the Largest Contentful Paint (LCP) in under 2.5 seconds on 4G networks.
- **NFR1.3:** Images must be compressed via `sharp` before storage to minimize bandwidth.

## 2. Scalability
- **NFR2.1:** The Node.js backend must remain stateless (excluding local image uploads) to allow horizontal scaling behind a load balancer.
- **NFR2.2:** Database queries must be indexed on frequently searched fields (e.g., product category, user email).

## 3. Security
- **NFR3.1:** All passwords must be hashed using `bcryptjs`.
- **NFR3.2:** APIs must implement rate limiting (`express-rate-shield`, 500 requests per 15 minutes) to prevent brute force attacks.
- **NFR3.3:** The application must restrict CORS to predefined `ALLOWED_ORIGINS`.

## 4. Maintainability
- **NFR4.1:** All backend code must use ES Modules (`import`/`export`).
- **NFR4.2:** All HTTP responses must use the uniform `ApiResponse` / `ApiError` structures.
