```yaml
Title: UI Generation Prompts
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🎨 UI Generation Prompts

## 1. The Standard Component Prompt
Use this prompt when asking an LLM to generate a new React component:
> "Generate a React 19 functional component named `[ComponentName]`. Use Tailwind CSS 4 for styling. It should accept the following props: `[prop1, prop2]`. Ensure the UI aligns with a professional B2B e-commerce aesthetic (vibrant primary colors, clear focus states). Include a loading skeleton state if data is being fetched."

## 2. The Form Prompt
> "Generate a React form using Tailwind CSS. Include inputs for `[fields]`. Do not use a heavy form library like Formik; use standard React state. Add validation to ensure all fields are filled before enabling the submit button. Ensure all inputs have `focus:ring-2 focus:ring-blue-500`."
