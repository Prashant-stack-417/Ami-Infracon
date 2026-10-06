```yaml
Title: Secrets Management
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔑 Secrets Management

## 1. Environment Variables
No secrets (API keys, database URIs, JWT secrets) are ever committed to the Git repository.

## 2. Local Development
- Secrets are stored in a `.env` file at the root of the repository.
- The `backend/app.js` runs with the `node --env-file=../.env` flag to inject these variables.

## 3. Production Deployment
- On a VPS, the `.env` file is manually created on the server and injected into the Docker containers via the `env_file` directive in `docker-compose.yml`.
- If using a PaaS (Vercel/Render), secrets are managed through the provider's secure UI dashboard.

## 4. Secret Rotation
- `JWT_SECRET` and `ADMIN_JWT_SECRET` should be rotated immediately if there is any suspicion of compromise (Note: rotating these will log out all currently active users).
