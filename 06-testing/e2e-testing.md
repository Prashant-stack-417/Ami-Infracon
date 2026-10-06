```yaml
Title: End-to-End (E2E) Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🛤️ End-to-End Testing

## 1. Tooling
- **Cypress:** The primary tool for driving the browser and testing complete user journeys.

## 2. The Golden Path Test
The most critical E2E test must run on every deployment:
1. Visit the Homepage.
2. Click on a Category -> View Product Detail.
3. Click "Add to Cart".
4. Open Cart Drawer -> Click "Checkout".
5. Fill in dummy credentials to login.
6. Submit Address.
7. Confirm Order.
8. Assert the "Order Success" page appears and the Cart is empty.

## 3. Environment
E2E tests should be run against a Staging environment or a locally spun-up Docker instance, NOT production, to avoid creating fake orders in the real database.
