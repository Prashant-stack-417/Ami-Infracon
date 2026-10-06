```yaml
Title: Analytics Engine
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📊 Analytics Engine

## 1. Data Aggregation
The SuperAdmin dashboard requires realtime metrics. We use MongoDB Aggregation Pipelines to calculate these efficiently without transferring massive datasets to Node.

## 2. Key Pipelines
- **Revenue Over Time:** Groups Orders by `$createdAt` (truncated to Day/Month) and `$sum`s the `totalAmount`.
- **Top Selling Products:** `$unwind`s the `items` array in Orders, `$group`s by product ID, and `$sum`s the quantities sold.
- **New Users:** Groups User creation timestamps.

## 3. Caching
- Aggregation is expensive. The results should be cached in memory (or Redis in the future) for 15-30 minutes to reduce database load.
