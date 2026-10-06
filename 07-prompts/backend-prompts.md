```yaml
Title: Backend Generation Prompts
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ⚙️ Backend Generation Prompts

## 1. The Controller Prompt
> "Create an Express controller named `[controllerName]` using Node.js ESM syntax. The controller must be wrapped in `asyncHandler`. It will perform `[action]`. If an error occurs, throw an `ApiError` with an appropriate HTTP status code. On success, return an `ApiResponse` object."

## 2. The Mongoose Model Prompt
> "Create a Mongoose 8 schema for a `[ModelName]`. It should include `[fields]`. Enable `timestamps: true`. Add a pre-save hook to `[action]`. Export the model using ESM."
