```yaml
Title: Naming Conventions
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🏷️ Naming Conventions

## 1. JavaScript / TypeScript
- **Variables & Functions:** `camelCase` (e.g., `getUserData`, `isLoggedIn`).
- **Classes:** `PascalCase` (e.g., `ApiError`, `ApiResponse`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `ALLOWED_ORIGINS`).

## 2. React
- **Components:** `PascalCase` for both filename and function name (e.g., `UserProfile.jsx`, `function UserProfile() {}`).
- **Hooks:** Prefix with `use` and use `camelCase` (e.g., `useAnimeCartFx`).

## 3. Database (MongoDB / Mongoose)
- **Model Files:** `PascalCase.model.js` (e.g., `User.model.js`).
- **Collection Names:** Plural lowercase (e.g., `users`, `products`).
- **Mongoose Models:** Singular `PascalCase` (e.g., `mongoose.model("User", userSchema)`).

## 4. API Routes
- **Endpoints:** Plural nouns, `kebab-case` if multi-word (e.g., `/api/users`, `/api/order-history`).
