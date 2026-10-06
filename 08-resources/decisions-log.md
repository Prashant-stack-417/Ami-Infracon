```yaml
Title: Architecture Decisions Log (ADR)
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📓 Architecture Decisions Log

## ADR-001: Use Zustand over Redux
**Date:** 2026-07-20
**Context:** Needed global state for User Auth and Shopping Cart.
**Decision:** Adopted Zustand for its minimal boilerplate and hook-based API.
**Consequences:** Faster frontend development, smaller bundle size.

## ADR-002: Offline B2B Payments
**Date:** 2026-07-20
**Context:** B2B buyers frequently rely on Net-30 credit terms.
**Decision:** Phase 1 will not integrate Stripe/Razorpay. Orders are placed as "Pending" and fulfilled offline.
**Consequences:** Saved 2 weeks of development time. Requires manual status updates by Admin.
