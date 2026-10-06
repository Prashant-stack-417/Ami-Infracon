```yaml
Title: Environments
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🌍 Environments

## 1. Development (`NODE_ENV=development`)
- **Location:** Local machine (`localhost`).
- **Database:** Local MongoDB instance or free-tier Atlas cluster.
- **Behavior:** Detailed error stack traces are returned in API responses. Frontend runs via Vite HMR (`npm run dev`).

## 2. Staging (`NODE_ENV=staging`) (Optional)
- **Location:** Subdomain (e.g., `staging.ami-infracon.com`).
- **Database:** Separate staging database to test migrations and CSV uploads safely.
- **Behavior:** Mirrors production infrastructure to catch deployment bugs before they affect real users.

## 3. Production (`NODE_ENV=production`)
- **Location:** Main domain (`www.ami-infracon.com`).
- **Database:** Production database with strict backup policies.
- **Behavior:** Error stack traces are obfuscated. Frontend is built (`npm run build`) and served statically.
