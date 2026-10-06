```yaml
Title: CI/CD Pipeline
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🔄 CI/CD Pipeline

## 1. Continuous Integration (GitHub Actions)
On every Push or Pull Request to the `main` branch, a workflow runs:
1. Checks out the code.
2. Sets up Node.js.
3. Runs `npm install` for both frontend and backend.
4. *(Future)* Runs linting and unit tests.

## 2. Continuous Deployment
If the CI pipeline passes on the `main` branch:
1. The GitHub Action SSHs into the production VPS.
2. Executes a deployment script that pulls the latest code (`git pull origin main`).
3. Rebuilds the Docker containers (`docker-compose up -d --build`).
4. Prunes old dangling images to save disk space (`docker image prune -f`).
