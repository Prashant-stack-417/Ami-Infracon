```yaml
Title: Product Requirements Document (PRD)
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - 00-project/vision.md
  - 01-product/trd.md
```

# 📄 Product Requirements Document (PRD) — Ami Infracon LLP

## 1. Objective
Ami Infracon LLP requires a scalable B2B e-commerce platform for construction chemicals. The platform must streamline bulk purchasing, inventory management, and B2B workflows.

## 2. Scope
### 2.1 In-Scope
- Public product catalogue with categories and search.
- User authentication and profiles (with `defaultAddress`).
- Shopping cart, checkout, and order tracking timeline.
- Admin dashboard for product, order, and inventory management.
- SuperAdmin dashboard for analytics and user administration.
- Blog/Knowledge base with an admin editor.
- Bulk product upload via CSV.

### 2.2 Out-of-Scope (Phase 1-3)
- Payment Gateway Integration (Net-30 / Offline invoicing used instead).
- Mobile application.
- Real-time ERP integration.

## 3. Core Features
- **User Personas:** B2B Buyer, Admin, SuperAdmin.
- **Product Management:** Complete CRUD, image uploads, low-stock alerts.
- **Order Flow:** Add to cart -> Checkout -> Email confirmation -> Admin updates status -> User sees timeline.
- **Analytics:** Revenue, top products, user growth charts.

## 4. Success Criteria
- Zero downtime for product catalog browsing.
- Order processing time reduced by 50%.
- Accurate inventory alerts preventing stock-outs.
