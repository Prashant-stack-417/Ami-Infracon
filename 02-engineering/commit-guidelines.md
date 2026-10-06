```yaml
Title: Commit Guidelines
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 💬 Commit Guidelines

## 1. Conventional Commits
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**
`<type>[optional scope]: <description>`

## 2. Allowed Types
- `feat:` A new feature.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting).
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools.

## 3. Examples
- `feat: add order timeline visualization`
- `fix(auth): resolve JWT expiration bug`
- `chore: update PROJECT_MEMORY.md`
