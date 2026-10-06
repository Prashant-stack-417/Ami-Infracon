```yaml
Title: Jira Tickets
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-22
Dependencies:
Related Documents:
```

# Ami Infracon Jira Board

## 📌 Epics
- **EPIC-7**: Backend Architectural Refactor (Phase 7) 🏗️
- **EPIC-6**: Security & Hardening (Phase 6) 🚨
- **EPIC-4**: Backend Testing Infrastructure (Phase 4)
- **EPIC-5**: Frontend Testing Infrastructure (Phase 5)
- **EPIC-1**: User Experience (UX) Enhancements (Phase 1)
- **EPIC-2**: Admin & SuperAdmin Tools (Phase 2)
- **EPIC-3**: Content & SEO (Phase 3)
- **EPIC-8**: Final Bug & Hardening Sweep (Phase 8) 🧹

---

## 📋 Board
| Ticket | Type | Summary | Epic | Status | Assignee |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AMI-704** | Task | Refactor frontend state to React Context (remove zustand) | EPIC-7 | ✅ DONE | Antigravity |
| **AMI-703** | Task | Refactor frontend HTTP client to native fetch (remove axios) | EPIC-7 | ✅ DONE | Antigravity |
| **AMI-702** | Task | Extract database queries to `services/` layer | EPIC-7 | ✅ DONE | Antigravity |
| **AMI-701** | Task | Enforce `asyncHandler` and `ApiResponse` across all controllers | EPIC-7 | ✅ DONE | Antigravity |
| **AMI-601** | Task | 🚨 File Upload Security Patch (MIME & Extensions) | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-602** | Task | 🚨 Dedicated Auth Rate Limits | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-603** | Task | 🚨 Input Validation & DoS Prevention | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-604** | Task | 🚨 Fix Stored XSS in BlogDetail (`dangerouslySetInnerHTML`) | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-605** | Task | 🚨 Patch High-Severity NPM Vulnerabilities | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-606** | Task | 🚨 Fix Path Traversal on Image Delete Endpoint | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-607** | Task | 🚨 Fix Blog File Upload Extension Validation | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-608** | Task | 🚨 Fix `ApiError` Reference Crash in `updateOrderStatus` | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-609** | Task | 🚨 Enforce Strict `ADMIN_JWT_SECRET` | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-610** | Task | 🚨 Cap Product Pagination Limit (DoS Protection) | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-611** | Task | 🚨 Apply Rate Limiter to `/register` Route | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-612** | Task | 🚨 Fix CSV Disk Exhaustion DoS (`memoryStorage`) | EPIC-6 | ✅ DONE | Antigravity |
| **AMI-401** | Task | Install backend testing dependencies (vitest, supertest) | EPIC-4 | ✅ DONE | Antigravity |
| **AMI-402** | Task | Write unit tests for utility functions (ApiError, etc.) | EPIC-4 | ✅ DONE | Antigravity |
| **AMI-403** | Task | Write API contract tests for Auth (supertest) | EPIC-4 | ✅ DONE | Antigravity |
| **AMI-404** | Task | Write API contract tests for RBAC on products | EPIC-4 | ✅ DONE | Antigravity |
| **AMI-501** | Task | Install frontend testing dependencies (vitest, jsdom) | EPIC-5 | ✅ DONE | Antigravity |
| **AMI-502** | Task | Write unit tests for `zwb_user_store` | EPIC-5 | ✅ DONE | Antigravity |
| **AMI-503** | Task | Install cypress and configure E2E testing | EPIC-5 | ✅ DONE | Antigravity |
| **AMI-504** | Task | Write Golden Path Cypress E2E test | EPIC-5 | ✅ DONE | Antigravity |
| **AMI-101 - AMI-106** | Epics | UX Enhancements | EPIC-1 | ✅ DONE | Antigravity |
| **AMI-201 - AMI-204** | Epics | Admin Tools | EPIC-2 | ✅ DONE | Antigravity |
| **AMI-301 - AMI-304** | Epics | Content & SEO | EPIC-3 | ✅ DONE | Antigravity |
| **AMI-705** | Bug | Fix signup field focus interaction | EPIC-1 | ✅ DONE | Copilot |
| **AMI-801** | Task | 🧹 Resolve 24 critical security, architecture, and logical bugs | EPIC-8 | ✅ DONE | Antigravity |

---

## 🏃 Active Sprint details
**Sprint 8: Final Sweep & Stabilization**
- Successfully resolved 24 identified bugs spanning authentication, architecture alignment, file uploads, missing scripts, and e-commerce business logic (checkout prices, stock tracking).
- Implemented test dummy variables to isolate vitest execution from `.env` requirements.
- Hardened Google Auth, Admin cookie management, and superadmin safeguards.
- System is now fully stabilized and secured for production.
