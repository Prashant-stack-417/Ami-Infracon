```yaml
Title: Information Architecture
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - 03-design/navigation.md
```

# 🏗️ Information Architecture

## 1. Public Sitemaps
- **/** (Home)
- **/about**
- **/products** (Catalog)
  - **/products/:id** (Product Detail)
- **/blog** (Knowledge Base)
  - **/blog/:slug** (Blog Post)
- **/cart**
- **/checkout**
- **/login**
- **/register**

## 2. Authenticated User Space
- **/dashboard** (Overview & Timeline)
- **/dashboard/orders**
- **/dashboard/profile**

## 3. Admin & SuperAdmin Space (Guarded)
- **/admin/login**
- **/admin/dashboard** (Analytics Overview)
- **/admin/products** (Management & CSV Upload)
- **/admin/orders** (Status Updates)
- **/admin/users** (User listing)
- **/admin/blog** (Rich-text editor)
- **/superadmin** (Elevated access, Admin creation)

## 4. Hierarchy Principles
- **Flat Navigation:** Key modules are never more than 2 clicks away.
- **Role Isolation:** Admin routes are strictly separated from user routes both in React Router and the Express API.
