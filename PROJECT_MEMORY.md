# PROJECT_MEMORY.md — Ami Infracon LLP

This is the **ground-truth log** of what actually exists in this repository and what
decisions have been made. It is not a spec or a wishlist — every line here is either
verified against the code or explicitly marked as a decision made on a given date.

Any agent or contributor working in this repo should update this file whenever they
make an architectural decision, add a dependency, or change a convention. Do not let
this file drift from reality — if code and this file disagree, fix whichever is wrong.

---

## 1. What this project is

Ami Infracon LLP — a product/e-commerce style web application with public storefront
pages, user auth, cart/checkout/orders, and a tiered admin/superadmin back office.

Stack (verified from `package.json` in both dirs):

- **Frontend** (`Frontend/`): React 19 + Vite 7, React Router 7, **native React Context** (state — Zustand removed),
  Tailwind CSS 4, **native fetch via `apiClient.js`** (axios removed), `react-leaflet` (maps),
  `@react-oauth/google`, `animejs`, `react-hot-toast`.
- **Backend** (`backend/`): Node.js (>=20.6.0, ESM `"type": "module"`), **Express 5** (native async error handling),
  Mongoose 8 (MongoDB), JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`,
  `multer` + `sharp` (image upload/processing to local `public/uploads/`), `express-rate-limit` (rate limiting),
  `helmet` + `morgan` (security headers + logging), `google-auth-library`.
  ⚠️ `cloudinary` and `multer-storage-cloudinary` have been **removed** — all image storage is local disk.
  ⚠️ `express-mongo-sanitize` and `xss-clean` are **NOT installed** — both are incompatible with Express 5's
  read-only `req.query` getter. Protection is provided by Mongoose strict schemas (NoSQL) and React auto-escaping (XSS).

## 2. Current repo state (as of this file's creation)

- No `README.md` existed at the repo root before this pass.
- No `.env.example` is committed — `backend/src/index.js` reads `process.env.PORT`
  and `db/index.js` presumably reads a Mongo URI; env vars are consumed via
  `node --env-file=../.env` (see `backend/package.json` scripts), meaning the
  backend expects a `.env` file **one directory above** `backend/` (i.e. at repo
  root or a shared location) — confirm exact path before assuming.
- Backend tests run via `vitest` and use `mongodb-memory-server` for isolated tests (`npm run test` in `backend/`).
- Frontend tests run via `vitest` and `jsdom` (`npm run test` in `Frontend/`). Cypress is also configured for E2E testing.
- No CI/CD config (no `.github/workflows`) found in the repo.
- No Dockerfile / containerization found in the repo.

## 3. Backend structure (verified)

```
backend/src/
  app.js                 — Express app: helmet, morgan, rate limiting, CORS, body parsing,
                            cookie-parser, route mounting, 404 handler, global error handler.
                            ⚠️ No Swagger at /docs — swagger deps removed during refactor.
  index.js                — entry point: connects DB, starts server, handles
                            EADDRINUSE and SIGTERM gracefully
  db/index.js              — Mongo connection
  controllers/            — admin, healthCheck, index, order, product, users, analytics, blog
  middleware/              — auth.middleware.js, validate.middleware.js
  models/                  — Admin, Order, Product, User (Mongoose)
  routes/                  — admin, healthCheck, index, order, product, users, analytics, blog
  swagger.config.js        — still present but swagger UI route removed from app.js
```

**Conventions confirmed by reading code:**

- All API routes mounted under `/api/...` (`/api/users`, `/api/admin`, `/api/order`,
  `/api/products`, `/api/analytics`, `/api/blogs`), plus `/api` for health check.
- **Layered Architecture**: The backend uses a distinct Services Layer (`backend/src/services/`). Controllers only handle HTTP transport, while Services handle database/Mongoose logic.
- Success responses use the **`ApiResponse`** wrapper class.
- Async controllers rely on the **`asyncHandler`** wrapper.
- Errors are explicitly thrown using the **`ApiError`** class.
- In production (`NODE_ENV=production`), 500 errors are masked to a generic message;
  stack traces only log in non-production.
- CORS origins from `ALLOWED_ORIGINS` env var (comma-separated), default `http://localhost:5173`.
- Request body size capped at `16kb`. Rate limiting: 500 req / 15 min via `express-rate-limit`.
- Role tiers: `user`, `admin`, `superadmin` (flag on `Admin` model — confirmed).

## 4. Frontend structure (verified)

```
Frontend/src/
  Components/     — Navbar, Cart, Checkout, Product, Login, Register, AdminLogin,
                     AdminProductForm, FilterPanel, SearchBar, ProtectedRoute,
                     AdminProtectedRoute, SuperAdminProtectedRoute, ErrorBoundary,
                     PageTransition, ScrollProgressBar, DotGridBackground, Toaster,
                     HomeComponents/{Hero,Footer}
  Pages/           — Home, About, Dashboard, ProductDetail, OrderSuccess, NotFound,
                     AdminDashboard(+Home), ProductManagement, OrderManagement,
                     UserManagement, CreateAdmin, EditAdmin, SuperAdminDashboard,
                     ForgotPassword, BlogList, BlogDetail, BlogManagement, ResetPassword
  app/UserContext.jsx — Native React Context (replaces Zustand userStore.js — deleted)
  hooks/            — useAnimeCartFx, useAnimeScroll, useCustomHooks, useParallax
  utils/            — apiClient.js (native fetch wrapper — replaces axiosInstance.js, deleted),
                     errorHandler.js, focusManager.js, imageUtils.js, tokenUtils.js
  config/constants.js
```

- Three route-guard tiers: `ProtectedRoute`, `AdminProtectedRoute`, `SuperAdminProtectedRoute`.
- **All HTTP calls go through `utils/apiClient.js`** (native fetch). Never use raw `fetch` or `axios`.
- Global state (user, cart) lives in `app/UserContext.jsx` — use `useUserContext()` hook.
- Admin token: `localStorage` key `adminToken`. User state: React Context (no Zustand).

## 5. Open questions / things NOT to assume

These are unresolved and should be confirmed by reading the actual file or asking
Prashant, not guessed at:

- **Deployment target** — no config for Vercel/Render/Railway/EC2 found in-repo.
  Do not assume a platform until a decision is logged here.
- **Image storage** — `express.static("public")` + local multer writes to
  `backend/public/uploads/`. This will not survive ephemeral production filesystems.
  S3-compatible store decision is needed before deploying.
- **Test runner** — ✅ RESOLVED: `vitest` is used for backend and frontend unit tests, and `cypress` for E2E frontend tests.
- ✅ **ADMIN_JWT_SECRET** — Enforced to be present at startup in `backend/src/index.js` to ensure the admin secret is always secured in production.

## 6. Decision log

| Date | Decision | Why |
|------|----------|-----|
| 2026-09-30 | Signup field icons use `pointer-events-none` and invalid inputs use an explicit focus ring. | Prevent decorative icons from intercepting field clicks and keep validation focus visible. |
| 2026-09-30 | Move the signup field component outside `Register` so controlled inputs retain focus while typing. | Nested component definitions remounted fields after every state update, limiting input to one character. |
| 2026-07-18 | Created `PROJECT_MEMORY.md` and `AGENTS.md` as ground-truth docs; no prior docs existed in the repo. | Repo was documentation-first only in intent — no docs actually existed yet. |
| 2026-07-18 | Confirmed SuperAdmin is `role: "superadmin"` on `Admin` model (not a separate model). | Read `Admin.model.js` directly — schema has `role: { enum: ["admin", "superadmin"] }` and `isSuperAdmin: Boolean`. |
| 2026-07-18 | Added `.agents/` directory with `AGENTS.md`, `context-map.md`, `commands.md`, skills, and workflows. | Prashant requested MeetingMind-style AI agent infrastructure for solo development. |
| 2026-07-20 | Set up testing infrastructure (Epics 4 & 5). Installed `vitest` + `mongodb-memory-server` (backend); `vitest`, `jsdom`, `cypress` (frontend). | Implemented testing harnesses. |
| 2026-07-20 | Changed backend `extractToken` to prefer `Authorization` header over `accessToken` cookie. Updated frontend axiosInstance to determine admin context via `window.location.pathname`. | Fixed critical role conflict where Admins logged in as users were blocked from admin API routes. |
| 2026-07-20 | Removed "Admin login" link from public `Login.jsx`. Added Analytics links to Admin navs. | Security through obscurity for the admin portal. |
| 2026-07-21 | **Backend**: Upgraded from Express 4 → Express 5.0.1. Removed `asyncHandler` wrapper (Express 5 handles async natively). Removed `ApiResponse`/`ApiError` wrapper classes — controllers now use `res.status(N).json(...)` directly. Replaced `express-rate-shield` with `express-rate-limit`. Added `helmet` + `morgan`. | Ponytail refactor: remove over-engineering and rely on Express 5 standard library. |
| 2026-07-21 | **Frontend**: Removed `axios` → replaced with native `fetch` wrapper `utils/apiClient.js`. Removed `zustand` → replaced with native React Context `app/UserContext.jsx`. Deleted `utils/axiosInstance.js` and `app/userStore.js`. Removed `@emotion/react`, `@emotion/styled`. Updated `vite.config.js` manualChunks to remove deleted deps. | Ponytail refactor: reduce bundle size, remove 5+ unnecessary third-party dependencies. |
| 2026-07-21 | `express-mongo-sanitize` and `xss-clean` confirmed **incompatible** with Express 5 (`req.query` is a read-only getter in Express 5; both packages crash trying to reassign it). Removed from project. NoSQL injection protection relies on Mongoose strict schemas; XSS relies on React auto-escaping and `DOMPurify` in `BlogDetail.jsx`. | Technical constraint — packages are unmaintained and incompatible with Express 5. |
| 2026-07-21 | Patched all pentest vulnerabilities (AMI-606 to AMI-611): sanitized `deleteProductImage` path traversal via `path.basename`, added blog upload extension filters, fixed `ApiError` reference crash in order controller, capped `/products` limit, added `/register` rate limiting, enforced `ADMIN_JWT_SECRET` at startup. | Resolution of security audit findings. |
| 2026-07-21 | Fixed 401 Unauthorized console spam on frontend during `/refresh-token` and `/logout`. Added local `localStorage` check to skip hydration if no session exists, and skipped 401 retries for logout endpoints. | Ponytail fix for network errors without adding complex server-side error mapping. |
| 2026-07-21 | Fixed `setLoading is not a function` crash in `Login.jsx`. | Replaced global context loading state setter with a local component state. |
| 2026-07-22 | Released `v0.2.0` and closed Sprint 7 (Architecture Refactor) and Sprint 6 (Security Hardening) in `JIRA_BOARD.md`. | Formalized the completion of the backend Express 5 migration and frontend React Context migration, closing out the refactoring epics. |
| 2026-07-22 | Re-introduced `asyncHandler`, `ApiResponse`, and `ApiError` across all backend controllers. | Alignment with strict `AGENTS.md` and `backend-dev-guidelines` constraints for standardized error boundaries. |
| 2026-07-22 | Extracted all Mongoose queries and business logic from controllers into a new `services/` layer (`admin.service.js`, `product.service.js`, etc.). | Decoupled HTTP transport from data access logic, establishing a true Layered Architecture for better testability and maintainability. |
| 2026-07-22 | Consolidated Jira tracking by removing the root `JIRA_BOARD.md` and establishing `02-engineering/jira-tickets.md` as the Single Source of Truth (SSOT). | Resolves documentation duplication and drift between the root tracker and the formal enterprise documentation suite. |
| 2026-07-22 | Refactored `multer` CSV bulk upload to use `memoryStorage()` and Node streams (`Readable.from()`). | Security hardening against Disk Exhaustion / DoS vectors. Temporary files are no longer orphaned on the disk if the parse fails. |
| 2026-09-30 | Removed `cloudinary` and `multer-storage-cloudinary` from backend. Replaced with local `multer.diskStorage()` writing to `public/uploads/`. Deleted `config/cloudinary.js`. | Cloudinary SDK had ESM import incompatibility with Node 22 and was an unnecessary dependency — the service layer already used local disk storage. |
| 2026-10-06 | Hardened auth (Google OAuth aud/email verification, Admin tokens moved to HttpOnly cookies, superadmin self-demote guards), secured e-commerce logic (server-side price lookup, atomic stock increment/decrement), and implemented magic-byte file upload validation. | Addressed 24 distinct security and logical vulnerabilities to stabilize the application for production. |
| 2026-10-07 | Refactored Zod schemas to strip unknown payload fields (removed `.strict()`), added server-side refresh token invalidation via `tokenVersion` on Admin model, and migrated the `phone` DB index to sparse. | Allowed UI to safely send records with DB fields (`_id`, `__v`) without throwing 400s, securely invalidate admin sessions even after access token expiry, and fix unique constraint bugs on optional fields. |

*(Add a row every time a real decision is made — dependency swap, schema change,
deployment choice, etc. Keep entries short and dated.)*
