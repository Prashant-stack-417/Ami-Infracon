# Ami Infracon Global Agent Rules

This file is kept for agents that explicitly read `.agents/AGENTS.md`.

The canonical, tool-agnostic agent guide is now located at the root of the project:

- `AGENTS.md`
- `PROJECT_MEMORY.md`
- `.agents/context-map.md`
- `.agents/commands.md`
- `.agents/workflows/`

## Required Behavior

1. Read `PROJECT_MEMORY.md` and root `AGENTS.md` before meaningful work.
2. Use `.agents/context-map.md` to choose task-specific docs.
3. Do not implement before reading the relevant acceptance criteria and specifications.
4. Keep changes scoped.
5. Update `CHANGELOG.md`, `02-engineering/jira-tickets.md`, and `PROJECT_MEMORY.md` upon completing tasks.

## Stack Snapshot

- Frontend: React 19, Vite 7, Tailwind CSS 4, React Router 7.
- Backend: Node.js, Express 4, Mongoose 8, MongoDB.
- Testing: Vitest, Supertest, Cypress.

## Non-Negotiables

- No hardcoded secrets.
- Always use the Services Layer (`backend/src/services/`) for business logic and queries.
- Use `ApiResponse`, `ApiError`, and `asyncHandler` uniformly in backend controllers.
- Frontend must use `apiClient` (native fetch) rather than raw fetch/axios.
