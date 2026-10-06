# Backend Architecture Review

I have reviewed the `backend/` directory applying both the structural constraints from the `backend-dev-guidelines` skill and the mandatory project rules from `AGENTS.md`. 

The backend currently suffers from **severe architectural drift**. Almost none of the established conventions are being followed in the current implementation.

## 🚨 BFRI Assessment: Risky (Score: 2)

According to the Backend Feasibility & Risk Index (BFRI), modifying this backend currently carries high operational risk because error boundaries are fragile and layers are tightly coupled.

---

## 1. Missing Layered Architecture

> **Guideline:** `Routes → Controllers → Services → Repositories → Database`
> **Current State:** `Routes → Controllers → Database`

The application entirely skips the **Services** and **Repositories** layers. 
- Controllers (e.g., `product.controller.js`, `order.controller.js`) are heavily bloated with business logic.
- They directly execute `Mongoose` queries (e.g., `Product.find(query).sort(...)`).
- **Risk:** This makes unit testing impossible without mocking the entire database, and heavily couples the HTTP transport layer to the data access layer.

## 2. Violation of Project Rules (`AGENTS.md`)

Despite the strict rules laid out in `AGENTS.md`, the actual code ignores them almost entirely:

### ❌ Missing `asyncHandler`
`AGENTS.md` mandates that all async controllers must be wrapped in `asyncHandler`. 
**Finding:** Not a single controller in the codebase uses it. Everything is written as bare `export const myController = async (req, res) => {}`. If a database query fails, it will likely crash the process or result in an unhandled promise rejection because there are no `try/catch` blocks or wrapper functions.

### ❌ Missing `ApiResponse`
`AGENTS.md` mandates that every success response must use the `ApiResponse` class (`backend/src/utils/apiResponse.js`).
**Finding:** Controllers are manually constructing raw objects:
```javascript
// Current Bad Pattern
return res.json({
  success: true,
  data: { products }, 
  message: "Products retrieved"
});
```

### ❌ Inconsistent Error Handling
`AGENTS.md` mandates throwing `ApiError`. 
**Finding:** While some controllers use `ApiError`, others throw standard JavaScript errors: `throw Object.assign(new Error("Blog not found"), { statusCode: 404 });`. This is fragile and bypasses the centralized error handling structure.

## 3. What is actually working well?

- **Routes only Route**: The `routes/` directory is relatively clean. The route files map cleanly to controller functions without inline business logic.
- **ESM Modules**: The backend correctly uses modern `import/export` syntax without falling back to `require()`.

---

> [!IMPORTANT]  
> **Recommendation**
> Before adding any more features, we should run a massive refactor across the `controllers/` directory to wrap every single function in `asyncHandler` and replace all raw `res.json` responses with `new ApiResponse()`. Would you like me to generate an implementation plan to clean up this technical debt?
