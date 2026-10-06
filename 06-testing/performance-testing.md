```yaml
Title: Performance Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ⚡ Performance Testing

## 1. Frontend Profiling
- **Lighthouse:** Run Chrome Lighthouse audits locally before merging UI changes. Target >90 for Performance.
- **React Profiler:** Use the React DevTools Profiler to identify unnecessary re-renders in heavy components (like the Product Grid or Cart Drawer).

## 2. Backend Load Testing
- **Artillery or k6:** Write basic load test scripts to simulate 500 concurrent users hitting the `GET /api/v1/products` endpoint.
- **Goal:** Ensure the event loop doesn't block and response times remain under 200ms. If they degrade, investigate adding MongoDB indexes or caching (Redis).
