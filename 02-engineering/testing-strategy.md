```yaml
Title: Testing Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧪 Testing Strategy

## 1. Current State
- Currently, there is no automated test harness configured. `npm test` yields an error in both frontend and backend repositories.

## 2. Testing Tiers (Planned)
When automated testing is introduced, it will follow this pyramid:
- **Unit Tests (Backend):** Test complex utility functions, aggregations, and formatting logic. (Tool: `Jest` or `Vitest`).
- **Unit Tests (Frontend):** Test pure functions and complex hooks. (Tool: `Vitest`).
- **Integration Tests:** Test API endpoints against an in-memory MongoDB instance (`mongodb-memory-server`) using `Supertest`.
- **E2E Tests:** Test the critical B2B buyer flow (Login -> Add to Cart -> Checkout) using `Cypress` or `Playwright`.

## 3. Pull Request Gates
- Eventually, tests must pass in a GitHub Actions workflow before a branch can be merged into `main`.
