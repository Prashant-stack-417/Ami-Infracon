```yaml
Title: State Management
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧠 State Management

## 1. Frontend State (Zustand)
- We use **Zustand** for global application state, located in `Frontend/src/app/userStore.js`.
- **Key:** `zwb_user_store`.
- **Stored Data:** Authenticated user profile, JWT token status, and shopping cart contents.
- **Why Zustand:** It provides a simpler, un-opinionated API compared to Redux, resulting in less boilerplate.

## 2. Local Component State
- Use `useState` or `useReducer` for state that does not need to be shared across the application (e.g., form inputs, toggle switches, local loading spinners).

## 3. Server State
- API data fetching is currently handled directly via `axiosInstance`.
- Responses are stored in local component state.
- *(Future Enhancement: Adopt TanStack Query for robust server-state caching, deduping, and background updates if data fetching complexity increases).*
