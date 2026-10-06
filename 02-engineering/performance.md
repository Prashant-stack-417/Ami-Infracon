```yaml
Title: Performance Optimization
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ⚡ Performance Optimization

## 1. Frontend Optimizations
- **Code Splitting:** React Router enables route-level code splitting, ensuring users only download JavaScript necessary for the current page.
- **Animations:** `animejs` is lightweight and uses `requestAnimationFrame` for smooth, high-performance UI transitions without locking the main thread.

## 2. Backend Optimizations
- **Image Processing:** Uploaded images are notoriously large. The `sharp` library intercepts all image uploads via `multer`, resizing them and compressing them to WebP/JPEG formats before saving, drastically reducing payload size for clients.
- **Rate Limiting:** `express-rate-shield` drops excessive requests early in the middleware chain, saving CPU cycles and database lookups.
- **Database Indexes:** MongoDB indexes must be applied to frequently queried fields (e.g., `email`, `category`) to ensure fast read times as the catalog grows.
