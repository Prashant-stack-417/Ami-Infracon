```yaml
Title: Storage Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🗄️ Storage Strategy

## 1. Structured Data
- All user, product, order, and blog data is stored in **MongoDB**.

## 2. Unstructured Data (Media)
- **Local Strategy (Current):** Images (product photos, blog banners) are saved to `backend/public/uploads` via `multer` + `sharp`. They are served statically by Express (`app.use('/uploads', express.static(...))`).
- **Cloud Strategy (Future):** Upon moving to production across multiple server instances, the local storage will be swapped for Amazon S3 (or Cloudflare R2). Multer will pipe the sharp output directly to the S3 bucket using `aws-sdk`.
