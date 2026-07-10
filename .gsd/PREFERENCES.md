---
version: 1
unique_milestone_ids: false
token_profile: balanced
context_mode:
  enabled: true
git:
  isolation: none
verification:
  commands:
    - npm run build
---

# GSD Preferences

Use the local GSD source at `C:\projects\ai\gsd-2` when running or extending
GSD for this project.

Primary project workflow:

- Plan user-facing work in `.gsd/milestones/`.
- Keep milestones small enough to ship and verify.
- Use `npm run build` as the baseline verification command for frontend work.
