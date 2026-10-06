```yaml
Title: CSV Bulk Upload
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📑 CSV Bulk Upload

## 1. Purpose
Admins need to manage large inventory catalogs (hundreds of SKUs) rapidly without manual data entry.

## 2. Implementation
- Endpoint: `POST /api/v1/admin/products/bulk-upload`
- Accepts `multipart/form-data` containing a `.csv` file via `multer`.
- Processed using the `csv-parser` package.

## 3. Validation Rules
- Each row must have a `sku`, `title`, `price`, and `stock`.
- If a `sku` already exists, the record is **updated** (Upsert).
- If a `sku` is new, a new product is created.
