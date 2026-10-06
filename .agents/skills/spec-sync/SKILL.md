---
name: spec-sync
description: Reconciles documentation drift, updates related specs after product or architecture decisions, records decisions, and keeps PROJECT_MEMORY.md current.
---

# Skill: Ami Infracon Spec Sync

Use this skill when documentation needs to become consistent.

## Process

1. Read `PROJECT_MEMORY.md`, `AGENTS.md`, `.agents/context-map.md`, and `.agents/workflows/spec-sync.md`.
2. Find all docs that mention the disputed behavior.
3. Apply the source authority order from `AGENTS.md`.
4. Patch the smallest set of files needed.
5. Record decisions in `PROJECT_MEMORY.md`.

## Decision Entry Shape

Use the existing style in `PROJECT_MEMORY.md`.

- date
- decision
- context
- alternatives considered
- consequences
- owner

## Guardrails

- Do not erase useful history.
- Do not hide unresolved conflicts.
- Do not rewrite unrelated docs for style only.

