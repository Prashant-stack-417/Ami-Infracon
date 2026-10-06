# 🏗️ Ami Infracon LLP

**Ami Infracon LLP** is a B2B product and e-commerce web application designed for a construction chemicals company. It features a public storefront, user authentication, a cart/checkout system, and a robust admin back-office to manage products, users, and orders.

---

## 👨‍💻 Developer
* **Prashant** — Sole Developer. Full-stack ownership of frontend (React/Vite), backend (Node.js/Express), database (MongoDB), authentication, and deployment.

---

## 🚀 Quick Start & Important Links
Before writing any code, review the architecture and design documents. Ensure all implementations strictly follow the established patterns.

* **🎯 Phase & Sprint Plan:** [02-engineering/phase-plan.md](./02-engineering/phase-plan.md)
* **📋 Jira Backlog:** [02-engineering/jira-tickets.md](./02-engineering/jira-tickets.md)
* **🎨 UI & Components:** [03-design/design-system.md](./03-design/design-system.md)
* **🗄️ Database Schema:** [04-backend/database-schema.md](./04-backend/database-schema.md)
* **🔌 API Specification:** [04-backend/api-specification.md](./04-backend/api-specification.md)
* **🧪 Testing Strategy:** [06-testing/testing-strategy.md](./06-testing/testing-strategy.md)

*(View the `documentgeneration.md` tracker to see the full list of generated documentation.)*

---

## 🛠️ Tech Stack
* **Frontend:** React 19, Vite 7, React Router 7, Zustand (global state), Tailwind CSS 4, Axios (via `axiosInstance.js`), `@react-oauth/google`.
* **Backend:** Node.js (≥ 20.6.0, ESM native), Express 4, Mongoose 8 (MongoDB).
* **Auth & Security:** JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `express-rate-shield`.
* **Media Processing:** `multer` and `sharp` for converting and resizing product images.
* **Documentation:** `swagger-jsdoc` and `swagger-ui-express`.

---

## 🤖 Using the AI Agent Workflows
This repository is configured with a `.agents` directory to supercharge your development speed.

### Global Rules
Any AI agent working in this repository **must** begin by reading:
1. `AGENTS.md`
2. `PROJECT_MEMORY.md`
3. `.agents/context-map.md`

### Custom Skills
You can instruct your AI to use the following custom skills defined in `.agents/skills/`:
1. **`implement-feature`**: Tell the AI *"Use the implement-feature skill to build..."*. The AI will read the relevant code, follow established patterns (`ApiResponse`, `axiosInstance`, etc.), and implement the feature in the smallest scoped change.
2. **`code-review`**: Tell the AI *"Use the code-review skill to audit this feature"*. The AI will review the code, catch bugs, and surface any deviations from the project's strict architecture conventions.
3. **`security-pentest`**: Tell the AI *"Use the security-pentest skill to audit this code"*. The AI will adopt a senior penetration tester persona, hunting for OWASP Top 10 vulnerabilities, IDORs, and broken access controls.
4. **`update-memory`**: Tell the AI *"Use the update-memory skill"*. The AI will update `PROJECT_MEMORY.md` to reflect real changes made to the codebase (e.g., adding a new dependency or schema).

### AI Capabilities
Agents should strictly adhere to the patterns laid out in the `07-prompts/` directory. All new backend code must utilize `ApiResponse`, `ApiError`, and `asyncHandler`. Frontend HTTP calls must flow exclusively through `axiosInstance.js`.

---

*“The best code is the code you never wrote.”*
