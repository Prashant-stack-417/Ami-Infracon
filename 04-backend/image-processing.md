```yaml
Title: Image Processing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🖼️ Image Processing

## 1. The Pipeline
Image uploads (Products, Blog covers) flow through:
`Express Request -> Multer (MemoryStorage) -> Sharp -> File System (public/uploads)`

## 2. Sharp Configuration
- All images are converted to `.webp` format for optimal compression.
- Images are resized to a maximum dimension (e.g., 800x800 for products) to prevent massive payloads.
- **Benefits:** Saves server disk space and dramatically improves Frontend Largest Contentful Paint (LCP) times.

## 3. Future Scaling
Currently, images are saved locally. When scaling horizontally, the Sharp output buffer will be streamed directly to an AWS S3 bucket instead of the local filesystem.
