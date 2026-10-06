```yaml
Title: Product Roadmap
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-19
Dependencies: None
Related Documents:
  - 00-project/vision.md
  - 00-project/success-metrics.md
```

# 🗺️ Product Roadmap — Ami Infracon LLP

## 1. Overview
This document outlines the strategic roadmap for the Ami Infracon LLP platform. It defines what has been completed, what is currently in focus (Production Readiness), and the long-term vision for future phases.

## 2. Completed Phases (Foundation)

### Phase 1: UX Enhancements
- **User Profiles:** Implemented `defaultAddress` for faster checkout.
- **Order Tracking:** Created the visual Order Timeline UI and backend `statusHistory` tracking.
- **Transactional Emails:** Integrated `nodemailer` for instant order confirmations.

### Phase 2: Admin & SuperAdmin Tools
- **Analytics Dashboard:** Built backend aggregation and frontend charts (`recharts`) for revenue, orders, and users.
- **Inventory Management:** Implemented `lowStockThreshold` alerts.
- **Bulk Operations:** Enabled bulk product uploads via CSV (`csv-parser`).

### Phase 3: Content & SEO
- **Knowledge Base:** Built full CRUD for Blog posts with a rich-text editor for Admins.
- **Recommendation Engine:** Developed a related-products algorithm to cross-sell items on the product detail page.

## 3. Current Focus: Production Readiness (Deployment Phase)
Before the platform can accept live B2B traffic, the following infrastructural tasks must be completed:
- **Cloud Infrastructure Setup:** Select and provision a VPS or PaaS (e.g., Vercel + Render, or AWS EC2).
- **Persistent Object Storage:** Migrate image uploads from local disk (`multer` to `public/uploads`) to an S3-compatible storage bucket to ensure persistence across deployments.
- **CI/CD Pipeline:** Implement GitHub Actions for automated linting, building, and deployment.
- **Containerization:** Write `Dockerfile` and `docker-compose.yml` for isolated, reproducible environments.
- **Security Hardening:** Enforce strict CORS policies, rate limiting, and environment variable protection in the production environment.

## 4. Future Horizon (Post-Launch)

### Phase 4: Advanced B2B Features
- **Quotation Workflows (RFQ):** Allow users to request custom pricing for bulk orders instead of standard checkout.
- **Tiered Pricing:** Dynamic pricing logic based on user accounts or order volume.
- **ERP Integration:** Sync inventory and order data with backend accounting/ERP software.

### Phase 5: AI & Automation
- **Demand Forecasting:** Predict inventory needs based on historical sales data.
- **AI-Powered Search:** Implement vector embeddings to allow semantic search across the product catalog and safety data sheets.
- **Automated Reordering:** Notify suppliers automatically when specific raw materials drop below critical thresholds.

---
> **CTO Note:** The roadmap is a living document. While Phases 1-3 are complete in code, the "Production Readiness" phase is the immediate priority. Do not begin work on Phase 4 features until the platform is securely deployed and stabilized.
