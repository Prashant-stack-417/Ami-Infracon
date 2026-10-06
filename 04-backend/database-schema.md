```yaml
Title: Database Schema
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🗄️ Database Schema

## 1. Overview
Ami Infracon uses MongoDB 8 via Mongoose. The schema is normalized where appropriate but denormalized for read performance (e.g., storing a snapshot of product prices inside the Order document).

## 2. Core Collections
- **Users:** Public buyers (`name`, `email`, `password`, `defaultAddress`).
- **Admins:** Staff & Execs (`name`, `email`, `password`, `role: "admin" | "superadmin"`).
- **Products:** The catalog (`title`, `sku`, `price`, `stock`, `category`, `images`, `technicalDetails`).
- **Orders:** Transaction history (`user_id`, `items`, `totalAmount`, `status`, `statusHistory`).
- **Blogs:** Knowledge base (`title`, `slug`, `content`, `author`, `status`).

## 3. Schema Options
- `timestamps: true` is enabled on all schemas (auto-manages `createdAt` and `updatedAt`).
