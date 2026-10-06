```yaml
Title: Branching Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🌿 Branching Strategy

## 1. Overview
Ami Infracon LLP uses a simplified Trunk-Based Development approach adapted for a solo developer or small team.

## 2. Main Branch
- `main` is the primary branch. It should always reflect the production-ready state of the application.
- Direct commits to `main` are allowed for the solo developer (Prashant), but feature branches are recommended for significant changes.

## 3. Feature Branches
When branching is used, follow this naming convention:
- `feat/feature-name` (e.g., `feat/order-timeline`)
- `fix/bug-description` (e.g., `fix/image-upload-crash`)
- `chore/task-description` (e.g., `chore/update-deps`)
