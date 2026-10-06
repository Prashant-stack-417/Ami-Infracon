```yaml
Title: Acceptance Criteria
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: 01-product/prd.md
Related Documents: 
  - 06-testing/qa-checklists.md
```

# ✅ Acceptance Criteria

## 1. User Profile & Address (AMI-101 to AMI-103)
- **Given** a logged-in user, **When** they update their profile, **Then** the `defaultAddress` must persist to MongoDB and reflect immediately in the Zustand store.

## 2. Order Timeline (AMI-104 to AMI-105)
- **Given** an order exists, **When** an Admin updates the status to "Shipped", **Then** the `statusHistory` array must receive a new entry with the timestamp, and the frontend Order Timeline must advance visually.

## 3. Analytics (AMI-201 to AMI-202)
- **Given** SuperAdmin access, **When** viewing the dashboard, **Then** the `recharts` components must accurately render total revenue and order volume based on backend aggregation pipelines.

## 4. Bulk Upload (AMI-204)
- **Given** a valid CSV of products, **When** an Admin uploads it, **Then** `csv-parser` must insert the rows into MongoDB and return a success count without crashing the event loop.

## 5. Related Products (AMI-304)
- **Given** a product view, **When** the page loads, **Then** the recommendation engine must return up to 5 products sharing the same category/tags.
