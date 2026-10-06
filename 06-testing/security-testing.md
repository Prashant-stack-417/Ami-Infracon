```yaml
Title: Security Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔒 Security Testing

## 1. Automated Scanning
- **Dependabot:** GitHub Dependabot is enabled to automatically scan `package.json` for known CVEs in NPM dependencies.
- **`npm audit`:** Run as a step in the CI pipeline.

## 2. Manual Penetration Verification
- **RBAC Checks:** Attempt to hit `PUT /api/v1/admin/...` using a standard User's JWT token. Ensure a 403 Forbidden is returned.
- **Rate Limit Checks:** Write a script to hit the login endpoint 600 times in 1 minute to ensure `express-rate-shield` kicks in and returns 429 Too Many Requests.
- **XSS Prevention:** Attempt to input `<script>alert(1)</script>` into the Shipping Address field and ensure it is sanitized or safely rendered by React.
