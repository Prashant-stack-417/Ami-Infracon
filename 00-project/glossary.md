```yaml
Title: Project Glossary
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-19
Dependencies: None
Related Documents:
  - 00-project/vision.md
  - 00-project/product-overview.md
```

# 📖 Glossary — Ami Infracon LLP

## 1. Overview
This document defines the standard terminology used across the Ami Infracon LLP codebase, documentation, and communication. Consistent terminology is critical for ensuring alignment between design, engineering, and business teams.

## 2. Business Terms
- **B2B (Business-to-Business):** Our primary business model, catering to construction firms, contractors, and bulk buyers rather than individual retail consumers.
- **RFQ (Request for Quotation):** A workflow where a buyer requests bulk pricing instead of purchasing at the listed price. *(Note: Currently planned for future phases, but essential to the domain.)*
- **Net-30:** A common B2B payment term where the buyer has 30 days to pay the invoice after the goods are delivered.

## 3. Product & UI Terms
- **Storefront:** The public-facing portion of the application where users browse the catalog, view products, and manage their carts.
- **Back-Office / Admin Dashboard:** The restricted area of the application used by internal teams to manage inventory, process orders, and view analytics.
- **Knowledge Base:** The blog section of the platform used to share technical articles, safety data sheets, and product guides.
- **Order Timeline:** The visual UI component displaying the step-by-step status of an order (e.g., Pending → Processing → Shipped → Delivered).

## 4. Technical Terms
- **JWT (JSON Web Token):** Used for stateless authentication across the application.
- **Zustand Store:** The frontend global state management solution (`zwb_user_store`) used for caching user sessions and cart data.
- **Role-Based Access Control (RBAC):** The system dictating what actions a user can take based on their assigned role (`user`, `admin`, `superadmin`).
- **Mongoose ODM:** The Object Data Modeling library used to interact with the MongoDB database.
- **Multer:** The middleware used for handling `multipart/form-data`, primarily for uploading product images and CSV files.
- **Sharp:** The Node.js image processing library used to resize and optimize uploaded product images before they are saved.
- **Nodemailer:** The module used for sending transactional emails, specifically order confirmations.

## 5. Roles & Actors
- **User / Buyer:** A registered customer who can browse products, place orders, and track shipments.
- **Admin:** An internal employee capable of managing the product catalog, updating order statuses, and publishing blog posts.
- **SuperAdmin:** An elevated internal role (indicated by `role: "superadmin"` on the Admin model) with access to high-level analytics and the ability to manage other Admin accounts.

---
> **CTO Note:** If you introduce a new domain concept or architectural pattern, add it to this glossary. Do not invent new terms for existing concepts (e.g., do not call the "Storefront" the "Shop" in code or docs if this document says "Storefront").
