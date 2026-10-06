# Skill: Update Memory

Use this skill to keep `PROJECT_MEMORY.md` current and accurate.

## When to Update Memory

Update after:

- A new npm dependency is added to either package
- A new Mongoose model is created or an existing one changes significantly
- A new API route group is added
- A structural change like extracting the Services Layer
- A deployment target is chosen
- Any open question in section 5 of `PROJECT_MEMORY.md` gets resolved
- A new convention is established and agreed upon with Prashant

Do NOT update for:

- Minor bug fixes that don't change architecture
- Copy edits or cosmetic changes

## Step 1: Read Current Memory

Read `PROJECT_MEMORY.md` in full.

## Step 2: Identify What Changed

Compare the changed files/decisions against the current content of `PROJECT_MEMORY.md`.

List:
- What facts in the memory are now wrong or stale
- What new facts need to be added
- Which open questions have been resolved

## Step 3: Update

Patch only the affected sections. Follow the existing format.

## Step 4: Verify

Re-read the updated memory and confirm:
- No information contradicts the actual code
- No open question that is still open was removed
