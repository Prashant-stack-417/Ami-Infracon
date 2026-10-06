```yaml
Title: Task Breakdown Methodology
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📝 Jira Task Breakdown

## 1. Methodology
As a solo developer, heavy Agile ceremonies are unnecessary, but structured work tracking is vital for momentum. We follow a simplified Epic -> Task breakdown.

## 2. Hierarchy
- **Epic:** A large, thematic goal spanning frontend, backend, and design (e.g., "Content & SEO").
- **Story/Task:** A discrete, shippable unit of work that can be completed in 1-2 days (e.g., "Build Admin panel Blog Editor UI").

## 3. Definition of Done (DoD)
A task is considered "Done" when:
1. The backend API is implemented and handles errors cleanly (`ApiError`).
2. The frontend UI is implemented, responsive, and styled with Tailwind.
3. The feature integrates successfully with the global state (if applicable).
4. `PROJECT_MEMORY.md` has been updated if the architecture or dependencies changed.
5. `CHANGELOG.md` has been updated with the task's completion details in the `[Unreleased]` section.
