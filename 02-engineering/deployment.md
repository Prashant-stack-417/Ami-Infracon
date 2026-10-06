```yaml
Title: Deployment Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🚀 Deployment Strategy

## 1. Target Environment (TBD)
The final production environment has not been definitively selected. The architecture supports two primary paths:
- **PaaS (Platform as a Service):** Frontend on Vercel/Netlify; Backend on Render/Railway.
- **IaaS (Infrastructure as a Service):** A single Linux VPS running Docker Compose, containing the frontend (served via Nginx), the backend API, and a local MongoDB instance.

## 2. Infrastructure as Code (Docker)
Regardless of the target, the application will be containerized.
- **Frontend Dockerfile:** Multi-stage build. Uses Node to build the Vite app, then uses Nginx to serve the static `dist/` folder.
- **Backend Dockerfile:** Node alpine image, exposing the Express port.

## 3. CI/CD Pipeline
- GitHub Actions will be configured to automatically trigger builds on commits to the `main` branch.
