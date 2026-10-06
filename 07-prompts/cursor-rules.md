```yaml
Title: Cursor IDE Rules
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🖱️ Cursor IDE Rules

## 1. System Prompt Override
Cursor uses `.cursorrules`. The following should be appended to the project's `.cursorrules` file:
```text
You are an expert full-stack developer assisting with the Ami Infracon B2B e-commerce platform.
- Stack: React 19, Vite, Tailwind 4, Node.js, Express, Mongoose 8.
- Frontend HTTP: Always use `axiosInstance.js`.
- Backend Errors: Always throw `ApiError`.
- Backend Responses: Always return `ApiResponse`.
- State: Use Zustand (`userStore.js`), do not import Redux.
- Do not remove or alter existing `ROLE` enums without checking `authorization.md`.
```

## 2. Composer Usage
When using the Cursor Composer for multi-file generation:
- Provide the Composer with the `PROJECT_MEMORY.md` and `JIRA_BOARD.md` context files first.
- Instruct it to "Generate files strictly following the folder structure defined in FOLDER.md".
