```yaml
Title: Error Handling
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🚨 Error Handling

## 1. Backend Centralized Handling
- Never use `res.status(500).json(...)` manually in controllers.
- Always throw a new `ApiError(statusCode, message)`.
- Wrap every async controller in `asyncHandler`. This catches rejected promises and passes them to Express's `next()`.
- Express's global error middleware in `app.js` intercepts all `ApiError` instances and formats them into a uniform JSON response.

## 2. Frontend Interception
- All HTTP requests go through `axiosInstance.js`.
- Axios interceptors catch global errors (e.g., 401 Unauthorized).
- On 401, the interceptor automatically triggers a logout or token refresh flow to prevent the user from being stuck in a dead state.
- User-facing errors are displayed using `react-hot-toast` notifications.
