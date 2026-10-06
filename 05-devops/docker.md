```yaml
Title: Docker Configuration
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🐳 Docker Configuration

## 1. Containerization
The platform utilizes Docker to ensure parity between local development and production environments.

## 2. Docker Compose
The `docker-compose.yml` orchestrates the stack:
- **`frontend`:** Multi-stage build. Node image for building the Vite bundle, Nginx alpine image for serving it.
- **`backend`:** Node alpine image running `node app.js`. Exposes port 5000.
- **`mongo`:** Official MongoDB image. Requires volume mapping for data persistence.

## 3. Persistent Volumes
- `mongo_data`: Ensures database records survive container restarts.
- `uploads_data`: Maps the `backend/public/uploads` directory to the host so product images aren't lost when the backend container is rebuilt.
