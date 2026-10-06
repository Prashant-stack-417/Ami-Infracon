```yaml
Title: Functional Requirements
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: 01-product/prd.md
Related Documents: 
  - 01-product/non-functional-requirements.md
```

# ⚙️ Functional Requirements

## 1. Authentication & Identity
- **FR1.1:** The system must allow users to register and log in using Email/Password or Google OAuth.
- **FR1.2:** The system must issue JWT tokens for session management.
- **FR1.3:** The system must allow users to save a `defaultAddress` in their profile.

## 2. E-Commerce Flow
- **FR2.1:** The system must calculate cart totals based on bulk quantities.
- **FR2.2:** The system must deduct inventory upon order confirmation.
- **FR2.3:** The system must send a confirmation email via `nodemailer` when an order is placed.
- **FR2.4:** The system must provide a visual timeline of `statusHistory` for every order.

## 3. Product & Inventory Management
- **FR3.1:** The system must support product creation with image uploads (`multer` + `sharp`).
- **FR3.2:** The system must allow bulk CSV import of products.
- **FR3.3:** The system must flag products with stock levels below `lowStockThreshold`.
- **FR3.4:** The system must dynamically recommend related products based on category.

## 4. Content Management
- **FR4.1:** The system must allow admins to create, edit, and delete blog posts using a rich-text editor.
