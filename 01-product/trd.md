```yaml
Title: Technical Requirements Document (TRD)
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: 01-product/prd.md
Related Documents: 
  - 00-project/architecture-overview.md
```

# 🛠️ Technical Requirements Document (TRD)

## 1. System Architecture
The platform is a decoupled application:
- **Frontend:** React 19, Vite 7, React Router 7, Zustand.
- **Backend:** Node.js (ESM), Express 4, Mongoose 8.
- **Database:** MongoDB 8.

## 2. Infrastructure Requirements
- **Hosting:** Linux VPS or cloud provider (e.g., Vercel + Render).
- **Storage:** Local `multer` storage migrating to S3-compatible object storage.
- **Node Environment:** >= 20.6.0 with ESM support enabled.

## 3. Backend Technical Details
- **API Standard:** RESTful JSON APIs.
- **Error Handling:** Standardized via `ApiError` and `ApiResponse`.
- **Security:** JWT authentication, `express-rate-shield` (500 req / 15m), CORS restriction to `ALLOWED_ORIGINS`.
- **Background Tasks:** No dedicated queue yet; synchronous processing via Node event loop. Order emails via `nodemailer`.

## 4. Frontend Technical Details
- **State Management:** Zustand (`zwb_user_store`) for auth and cart.
- **Data Fetching:** Centralized `axiosInstance.js` with interceptors for token refresh.
- **Styling:** Tailwind CSS 4, utilizing utility-first paradigms.
- **Animations:** `animejs` for micro-interactions, `react-hot-toast` for notifications.
