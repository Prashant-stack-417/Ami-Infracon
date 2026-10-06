```yaml
Title: Inventory Alerts
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ⚠️ Inventory Alerts

## 1. The `lowStockThreshold`
- The `Product` model contains a `stock` (Number) field.
- A global configuration or constant defines the `LOW_STOCK_THRESHOLD` (e.g., 10 units).

## 2. Dashboard Integration
- The Admin dashboard fetches `GET /api/v1/admin/products/low-stock`.
- This is a simple MongoDB query: `Product.find({ stock: { $lte: 10 } })`.
- Provides an actionable list for procurement managers to re-order inventory before stock-outs occur.
