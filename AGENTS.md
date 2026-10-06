# Ami Infracon LLP — Agent Operating Guide

This file is the universal entrypoint for any AI assistant working in this repository.
It is intentionally tool-agnostic: Antigravity, Cursor, Copilot, Gemini, ChatGPT,
and any future tools should all follow this guide.

## Developer

**Prashant** — sole developer. Full-stack ownership of frontend (React/Vite), backend
(Node.js/Express), database (MongoDB), auth, and deployment.

## What This Project Is

Ami Infracon LLP is a product/e-commerce web application for a construction chemicals
company. It has a public storefront, user authentication, cart/checkout/orders, and a
tiered admin/superadmin back-office to manage products, users, and orders.

---

## Required Startup Routine

At the start of every meaningful task:

1. Read `PROJECT_MEMORY.md`.
2. Read this file (`AGENTS.md`).
3. Read `.agents/context-map.md` to choose the relevant documents.
4. Read the specific source files for the task before editing or answering.

Do not implement from vibes. If requirements conflict, call out the conflict or ask
Prashant for a decision before building on top of it.

---

## Source Authority

Use this order when files disagree:

1. Prashant's latest explicit instruction
2. The code itself (always the final source of truth)
3. `PROJECT_MEMORY.md` — verified facts and decisions
4. This file (`AGENTS.md`) — how to behave
5. General framework/library conventions — only when 1–4 don't cover it

---

## Core Stack (verified from package.json)

### Backend (`backend/`)

- Node.js ≥ 20.6.0, ESM (`"type": "module"`) — use `import`/`export`, not `require`
- Express 4
- Mongoose 8 (MongoDB)
- `jsonwebtoken` + `bcryptjs` — auth
- `cookie-parser`, `cors`, `express-rate-shield`
- `multer` + `sharp` — image upload/processing to local `public/uploads/`
- `swagger-jsdoc` + `swagger-ui-express` — API docs at `/docs`
- `google-auth-library` — Google OAuth

### Frontend (`Frontend/`)

- React 19 + Vite 7
- React Router 7
- Zustand — global state (key: `zwb_user_store`)
- Tailwind CSS 4
- Axios — all HTTP via `Frontend/src/utils/axiosInstance.js`
- `@react-oauth/google` — Google sign-in
- `animejs` — animations
- `react-hot-toast` — notifications
- `react-leaflet` — maps

### Testing (`tests/`, `Frontend/cypress/`)

- **Backend**: `vitest`, `supertest`, `mongodb-memory-server`
- **Frontend**: `vitest`, `jsdom`
- **E2E**: `cypress`

---

## Conventions (do not deviate without updating PROJECT_MEMORY.md)

### Backend

- Every success response → `ApiResponse` (`backend/src/utils/apiResponse.js`)
- Every thrown error → `ApiError` (`backend/src/utils/apiError.js`)
- Async controllers → wrapped in `asyncHandler` (`backend/src/utils/asyncHandler.js`)
- New resources: add files to `routes/`, `controllers/`, and `models/`; mount under
  `/api/<resource>` in `app.js`. Follow the admin/order/product/users pattern.
- CORS origins from `ALLOWED_ORIGINS` env var (comma-separated); body limit `16kb`;
  rate limit 500 req / 15 min — all configured in `app.js` as single source of truth.
- Backend reads env from `../.env` (repo root) via `node --env-file=../.env`.

### Frontend

- All HTTP calls via `Frontend/src/utils/axiosInstance.js` — never raw axios/fetch.
- Three route-guard tiers: `ProtectedRoute` (user), `AdminProtectedRoute`,
  `SuperAdminProtectedRoute` — reuse these, don't build a fourth guard.
- Admin token stored in `localStorage` as `adminToken`; user state in Zustand store.
- Token refresh and 401 handling is built into `axiosInstance.js`.

### Testing

- **Isolation**: Unit tests and integration tests MUST be placed in the root `tests/` directory (`tests/backend/` and `tests/frontend/`), isolated from production source files.
- **E2E**: Cypress end-to-end tests live inside the `Frontend/cypress/` directory.

### Auth roles

| Role | Access |
|------|--------|
| `user` | Public storefront, own orders, checkout |
| `admin` | Product, order, user management |
| `superadmin` | Admin management + all admin capabilities |

SuperAdmin is a `role: "superadmin"` flag on the `Admin` model (same collection as
`Admin`, NOT a separate model). Confirmed in `backend/src/models/Admin.model.js`.

---

## Operating Rules

- Read before writing. Search code and docs first.
- Keep changes scoped to the request.
- Do not rewrite unrelated files.
- Preserve existing patterns and comments.
- Never hardcode secrets, credentials, API keys, or private endpoints.
- Do not add new npm dependencies without checking `PROJECT_MEMORY.md`'s stack list first.
- Do not restructure `Frontend/src` or `backend/src` without calling it out as a
  decision and logging it in `PROJECT_MEMORY.md`.

---

## Generic Commands

Common command intents:

- `/implement <feature>` — build a specific feature or fix
- `/review` — review code or docs
- `/sync-docs` — reconcile documentation drift
- `/update-memory` — update PROJECT_MEMORY.md after meaningful changes
- `/architecture-check` — verify a proposal matches the existing architecture

---

## Local Skills

Local skills live in `.agents/skills/`.

Important skills:

- `implement-feature`: implement a feature from a plain-language description.
- `code-review`: review code, catch bugs, and surface security/convention issues.
- `update-memory`: reconcile PROJECT_MEMORY.md after real changes.

When using a skill, read its `SKILL.md` completely before acting.

---

## Done Criteria

For implementation tasks:

- The relevant code files and docs were read first.
- The implementation follows existing patterns (ApiResponse, asyncHandler, axiosInstance, etc.).
- No secrets, no new unexplained dependencies.
- **MANDATORY**: `PROJECT_MEMORY.md` is updated to reflect any architectural, dependency, or structural changes.
- **MANDATORY**: The Jira tracker at `02-engineering/jira-tickets.md` is updated to mark the task as DONE or reflect current progress.
- **MANDATORY**: `CHANGELOG.md` is updated in the `[Unreleased]` section with the completed task details.

For documentation tasks:

- Claims are specific and traceable to actual code.
- Related files are cross-referenced.
- Conflicts are surfaced instead of hidden.
