```yaml
Title: AI Agent Global Rules
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧠 AI Agent Global Rules

This document dictates how autonomous agents (e.g., Antigravity, AutoGPT) should interact with the repository.

## 1. Initialization Sequence
Every autonomous session MUST begin by reading:
1. `AGENTS.md`
2. `PROJECT_MEMORY.md`
3. `JIRA_BOARD.md`

## 2. Modifying Files
- Agents MUST NOT modify `package.json` dependencies without explicitly noting the addition in `PROJECT_MEMORY.md`.
- Agents MUST preserve existing docstrings and comments.
- Agents MUST prefer `grep_search` over generic Linux shell commands.

## 3. Communication
- If a user request contradicts the `PROJECT_MEMORY.md` architectural decisions (e.g., "Switch to PostgreSQL"), the agent MUST halt and ask the user for explicit confirmation before proceeding.
