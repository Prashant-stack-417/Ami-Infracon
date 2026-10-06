```yaml
Title: Folder Structure Guidelines
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - FOLDER.md
```

# 📁 Folder Structure Guidelines

## 1. Monorepo Organization
The repository is split into two primary applications:
- `/Frontend`: The React/Vite client application.
- `/backend`: The Express/Node.js server application.

## 2. Backend Organization (`backend/src/`)
- `controllers/`: Handles incoming requests, validates input, calls services/models, returns `ApiResponse`.
- `models/`: Mongoose schemas and model definitions.
- `routes/`: Express router definitions.
- `middleware/`: Auth guards, error handlers, rate limiters.
- `utils/`: Reusable helpers (`ApiError`, `ApiResponse`, `asyncHandler`).

## 3. Frontend Organization (`Frontend/src/`)
- `Components/`: Reusable UI components.
- `Pages/`: Top-level route components.
- `app/`: Zustand stores (e.g., `userStore.js`).
- `hooks/`: Custom React hooks (`useAnimeCartFx`, etc.).
- `utils/`: Network layer (`axiosInstance.js`), token helpers.
