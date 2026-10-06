```yaml
Title: Coding Standards
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: None
Related Documents: 
  - 02-engineering/naming-conventions.md
```

# 💻 Coding Standards

## 1. General Principles
- **Clarity over Cleverness:** Write code that is easy to read. A junior developer should understand it.
- **DRY (Don't Repeat Yourself):** Extract repeated logic into hooks or utility functions.
- **Fail Fast:** Throw errors immediately when invalid data is encountered.

## 2. Frontend (React / Vite)
- Use functional components and hooks exclusively.
- Use `Zustand` for global state. Do not over-use global state for component-level UI state.
- Keep components small (under 200 lines if possible). Extract complex logic into custom hooks.
- Use Tailwind CSS for styling. Avoid inline `style={{}}` unless dynamically calculating values.

## 3. Backend (Node.js / Express)
- **ES Modules:** Use `import` / `export`. Never use `require()`.
- **Async/Await:** Avoid `.then()` chaining. Use `async/await` and wrap controller logic in `asyncHandler`.
- **Response Format:** All successful API responses must use the `ApiResponse` class.
- **Error Format:** All errors must be thrown as `ApiError` instances.
