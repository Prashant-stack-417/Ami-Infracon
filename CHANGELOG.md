---
Title: Ami Infracon LLP — Changelog
Version: 1.0.0
Status: Active
Owner: Prashant
Last Updated: 2026-07-20
Dependencies: []
Related Documents:
  - README.md
  - 00-project/roadmap.md
---

# Changelog

All notable changes to the Ami Infracon B2B E-commerce platform are documented in this file.

This changelog adheres to [Keep a Changelog v1.1.0](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

> **Format:** Each version section lists changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security` headings. Entries are written in imperative mood, present tense, and reference issue/PR numbers where applicable.

---

## [Unreleased]

### Added
- Added dummy secrets to test setup (`tests/backend/setup.js`) to allow tests to run isolated from environment dependencies.

### Changed
- Migrated admin authentication refresh tokens from vulnerable `localStorage` to secure `HttpOnly` cookies.
- Re-architected checkout logic to enforce server-side price lookups rather than relying on client-provided product prices.
- Switched order inventory updates to use atomic Mongoose operations (`$inc`) to prevent race conditions on stock decrements and cancellations.
- Replaced custom Zod validation with standard native route-level express middleware validation.

### Removed
- Removed automatic sample-product database seeding from `db/index.js` to ensure clean production databases.
- Removed dead `swagger-jsdoc` imports and configurations from backend startup.
- Removed arbitrary user phone number generation from Google OAuth user creation.

### Fixed
- Fix signup form input focus when clicking field icons and ensure invalid fields show a consistent focus ring.
- Fix signup fields remounting after each keystroke, allowing users to enter complete names and other values.
- Fixed `index.controller.js` crashes by adding the missing `ApiResponse` import.
- Fixed admin refresh flow errors by resolving secret key mismatches and correctly loading the admin document over bare JWT payloads.
- Fixed `blog.controller.js` author references by using `req.admin.id` instead of `req.admin._id`.
- Fixed missing `doHydrate` exports in the frontend `UserContext` for Protected Routes.
- Fixed malformed state accesses in `AdminLogin.jsx`.
- Fixed `UserContext.createOrder` mismatch by removing obsolete checkout mapping dependencies.
- Fixed frontend/backend desynchronization in `PRODUCT_CATEGORIES` and units definitions.
- Fixed broken NPM scripts by implementing a robust `.env`-driven `createSuperAdmin.js` script.
- Fixed order authorization flaws to ensure customers can only modify their own orders and admins control processing states.
- Fixed missing HTML-escaping and error handling on fire-and-forget `sendEmail` promises for password resets.

### Security
- Enforced independent application secrets (`ADMIN_JWT_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET`) at startup, completely removing dangerous fallbacks.
- Hardened Google Authentication by verifying token audience (`aud`) against `CLIENT_ID` and strictly requiring `email_verified: true`.
- Added structural safeguards protecting the final SuperAdmin account from deletion or demotion, and restricted SuperAdmins from demoting/deleting themselves.
- Integrated file-upload Magic Byte detection to definitively verify image uploads beyond easily spoofed MIME extensions.
- Added `X-Content-Type-Options: nosniff` headers to the static `/uploads` route to prevent MIME-sniffing exploits.
- Upgraded Admin rate limiting on `/login` to `skipSuccessfulRequests`, precisely punishing brute-force attacks without locking out legitimate admins.
- Secured logout token clearance to use identical cookie domain/secure/sameSite specifications as login token generation.

---

## [0.2.0] — 2026-07-22

### Added
- Analytics links added to Admin Navbar and Dashboard Quick Actions for easier discoverability.
- Add complete backend testing infrastructure using `vitest`, `supertest`, and `mongodb-memory-server` (AMI-401, AMI-402).
- Add comprehensive API integration tests for authentication and role-based access control (AMI-403, AMI-404).
- Add frontend testing infrastructure using `vitest` and `jsdom` for unit testing the Zustand store (AMI-501, AMI-502).
- Add frontend E2E testing framework integration via `cypress` with a golden path checkout test (AMI-503, AMI-504).
- Add comprehensive architecture and design documentation across `00-project/` to `08-resources/`.
- Add project memory and agent instruction files (`AGENTS.md`, `PROJECT_MEMORY.md`).
- Add foundational repository structure for both Frontend (React/Vite) and Backend (Node.js/Express).

### Changed
- Complete repository rebranding from legacy project templates to Ami Infracon LLP.
- Relocate all unit test files to a centralized root `tests/` directory for better isolation from production code.
- Refactored backend to extract all Mongoose queries and business logic into a dedicated **Services Layer** (`backend/src/services/`), leaving controllers to handle only HTTP transport (AMI-702).
- Enforced the usage of `asyncHandler`, `ApiResponse`, and `ApiError` uniformly across all backend controllers to ensure robust and standardized error boundaries (AMI-701).
- Refactored frontend to replace `axios` with a lightweight, native `fetch`-based `apiClient` (AMI-703).
- Refactored frontend global state management to use native React Context (`UserContext`), eliminating the need for `zustand` (AMI-704).

### Removed
- Unused UI dependencies (`@emotion/react`, `@emotion/styled`) to reduce frontend bundle size.
- External libraries `axios` and `zustand`, alongside their legacy files (`axiosInstance.js`, `userStore.js`).

### Fixed
- Fixed strict regex validation in Checkout that rejected phone numbers with `+91` country code and postal codes with spaces, resolving the "Place Order" button failure.
- Fixed a major authentication conflict where Admins simultaneously logged in as regular users were incorrectly kicked to the login screen when accessing shared endpoints (like `/products`).
- Removed the public "Admin login" link from `Login.jsx` to enforce security through obscurity, ensuring regular users cannot see or access the admin entry portal.

### Security
- Add strict `express-rate-limit` for authentication routes to mitigate brute-force and DoS attacks (AMI-602, AMI-603).
- Patch Stored XSS vulnerability in `BlogDetail.jsx` by implementing `DOMPurify` to sanitize HTML content before rendering via `dangerouslySetInnerHTML` (AMI-604).
- Harden server against RCE attacks by restricting file uploads (`multer`) to specific MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforcing strict file size limits (AMI-601).
- Fix multiple high-severity vulnerabilities by auditing and updating NPM dependencies in both backend and frontend (AMI-605).
- Fix Critical Path Traversal vulnerability on image deletion endpoint (`product.controller.js`) using `path.basename` (AMI-606).
- Add file extension validation (`.png`, `.jpg`, `.jpeg`, `.webp`) to blog upload `fileFilter` in `blog.route.js` (AMI-607).
- Fix `ApiError` reference crash and restrict customer order status updates in `order.controller.js` (AMI-608).
- Cap `/api/products` query pagination limit to prevent memory/bandwidth DoS attacks (AMI-610).
- Apply strict `authLimiter` rate limiting to `/api/users/register` endpoint (AMI-611).
- Fix Potential DoS/Disk Exhaustion by moving CSV bulk upload `multer` config to `memoryStorage()` (AMI-612).

---

## [0.1.0] — 2026-07-20

### Added
- Initial project scaffold and documentation generation framework.
