```yaml
Title: Testing Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧪 Overall Testing Strategy

## 1. Overview
The testing strategy for Ami Infracon is pragmatic, focusing heavily on critical paths (Authentication, Cart, Checkout, Order Status) rather than aiming for arbitrary 100% code coverage. 

## 2. The Test Pyramid
- **E2E (Top):** Tests the full flow from UI to Database via Cypress. Highest value for a solo developer.
- **Integration (Middle):** API contract testing using Supertest against a memory-based MongoDB.
- **Unit (Base):** Tests isolated utility functions, complex Zustand store logic, and price calculations via Vitest/Jest.

## 3. CI/CD Integration
- Tests are executed automatically via GitHub Actions on every Pull Request.
- A failed test blocks deployment to production.
