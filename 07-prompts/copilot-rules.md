```yaml
Title: GitHub Copilot Rules
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🤖 GitHub Copilot Rules

## 1. Copilot Chat Context
When querying GitHub Copilot Chat (via `@workspace`):
- Copilot often hallucinates imports. Remind it: `All backend modules use ESM (import/export), do NOT use require()`.
- If asking for a React component, specifically say: `Use Tailwind CSS 4 utility classes. Do not generate custom CSS files.`

## 2. Code Generation Exclusions
- Do not accept Copilot suggestions for hardcoded API keys or Secrets. Ensure it uses `process.env`.
- Ensure Copilot wraps async Express routes in `asyncHandler(async (req, res) => { ... })`. It frequently forgets this wrapper and falls back to manual `try/catch`.
