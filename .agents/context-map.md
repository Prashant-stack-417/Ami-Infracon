# Ami Infracon — Context Map

Use this file to decide what to read before answering or editing a task.

---

## Always Read First

- `PROJECT_MEMORY.md`
- `AGENTS.md` (root)
- `.agents/context-map.md`

---

## Product or Planning Questions

Read:

- `PROJECT_MEMORY.md` — the ground truth of what exists and what decisions were made
- `AGENTS.md` — conventions and stack

Answer based on code, not assumptions. If something is marked as an open question in `PROJECT_MEMORY.md`, read the relevant source file before answering.

---

## Feature Implementation

Read:

- `PROJECT_MEMORY.md`
- `AGENTS.md`
- Relevant source files in `backend/src/` and/or `Frontend/src/`
- `02-engineering/jira-tickets.md` (for active tasks)

Steps:

1. Read the relevant existing controller/service/route/model for the closest similar feature.
2. Follow its exact pattern (ApiResponse, asyncHandler, ApiError, Services Layer).
3. Read the relevant frontend page/component for similar UI patterns (Tailwind, context API).
4. Implement. Scope changes tightly.
5. Record changes in `CHANGELOG.md`, `PROJECT_MEMORY.md`, and `jira-tickets.md`.

---

## Backend Work

Read:

- `backend/src/app.js` — CORS, rate limit, body limit, route mounts (single source of truth)
- `backend/src/utils/apiResponse.js` — success response shape
- `backend/src/utils/apiError.js` — error shape
- `backend/src/utils/asyncHandler.js` — async controller wrapper
- `backend/src/middleware/auth.middleware.js` — all auth middlewares
- Relevant model in `backend/src/models/`
- Relevant service in `backend/src/services/`
- Relevant controller in `backend/src/controllers/`
- Relevant route in `backend/src/routes/`

Expected implementation style:

- ESM: `import`/`export` only — never `require()`
- Routes mounted under `/api/<resource>` in `app.js`
- Controller functions wrapped with `asyncHandler`
- Services layer used for all DB queries
- Auth: use existing middleware from `auth.middleware.js`

---

## Frontend Work

Read:

- `Frontend/src/utils/apiClient.js` — HTTP client (native fetch)
- `Frontend/src/app/userStore.js` — Deprecated! Use React Context
- `Frontend/src/context/UserContext.jsx` — React Context for user state
- `Frontend/src/Components/ProtectedRoute.jsx` — user route guard
- `Frontend/src/Components/AdminProtectedRoute.jsx` — admin route guard
- Relevant page in `Frontend/src/Pages/`
- Relevant component in `Frontend/src/Components/`
- `Frontend/src/App.jsx` — routing and route guards

Expected implementation style:

- All HTTP via `apiClient` — never raw `axios` or `fetch`
- Tailwind CSS 4 classes for styling
- `react-hot-toast` for notifications
- React Context for shared state; local React state for component-only state
- Route guards: wrap pages in the correct `ProtectedRoute` variant
