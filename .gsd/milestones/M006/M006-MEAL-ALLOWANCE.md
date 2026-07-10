---
description: Meal Allowance Reimbursement Feature
status: In Progress
---

# Milestone 6: Meal Allowance Reimbursement

## Objective
Add a new "meal allowance reimbursement" section to the user's authentication page. This section cannot be interacted with by regular users, but its status is visible to them. Admins are solely responsible for uploading the necessary picture and managing the status (unverified, pending, verified) from the Manage Users page.

## Requirements

### Database Schema
- [ ] Add `mealAllowance` to the `users` schema:
  - `status`: `"unverified" | "pending" | "verified"` (default: unverified)
  - `storageId`: optional storage reference for the uploaded picture.

### User Interface (`/authentication`)
- [ ] Add a new card for "meal allowance reimbursement".
- [ ] Render the status badge logic (unverified, pending, verified).
- [ ] Disable clicking for the user (they cannot upload or view the picture).

### Admin Interface (`/manage-users`)
- [ ] Add a "Meal Allowance Reimbursement" management section for a selected user.
- [ ] If status is `unverified` or picture is missing: Provide an upload button mapping to a Convex mutation that uploads the file, stores `storageId`, and sets status to `pending`.
- [ ] If status is `pending`: Admin can see the picture, verify it (setting it to `verified`), or reject/re-upload it.
- [ ] If status is `verified`: Display it as verified to the Admin as well.
