---
description: Implement User Profile / Personal Center Page
status: Done
---

# Milestone 4: Profile / Personal Center 

## Objective
Revamp the `src/Profile.tsx` page to match the "personal center" mobile-first wireframes provided, including the user details card and the actionable list menu.

## Requirements

### General Layout
- [x] Top navigation bar with a "back" arrow (returning to Dashboard) and title "personal center".
- [x] Implement light grey background (`#F5F5F5` or similar) with appropriate dark mode variants if applicable, adhering to the Lancotech app UI theme.

### User Information Card
- [x] Blue-outlined card with a slightly darker grey inner background.
- [x] Circular avatar (blue border) displaying the first letter of the user's email.
- [x] Display User's Email.
- [x] Display User ID with a "Click to copy" icon.
- [x] "VIP 2" golden badge.
- [x] "advanced certification" blue rounded badge.

### Settings List Menu
- All items should be styled as rounded rectangular buttons with a thin blue/grey border and a `>` arrow on the right.
- [x] **simulated trading:** Includes a toggle switch instead of an arrow.
- [x] **security center**
- [x] **authentication**
- [x] **language**
- [x] **invite friends**
- [x] **online service**
- [x] **platform introduction**
- [x] **help center**
- [x] **download**
- [x] **version number:** Shows text "2.9.6" next to the arrow.
- [x] **clear cache**
- [x] **log out:** Triggers Convex `signOut` and redirects to `/`.
