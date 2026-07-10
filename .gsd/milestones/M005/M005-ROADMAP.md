---
description: Implement Certification Flow and Admin Approval
status: Done
---

# Milestone 5: Authentication & Certification

## Objective
Expand the user profile capability by adding a KYC / Certification flow consisting of Junior and Advanced modes with administrative approval constraints.

## Requirements

### Flow & Navigation
- [x] Create Convex schemas for `juniorCertification` and `advancedCertification`.
- [x] Create backend mutations for submitting and approving certifications.
- [x] Connect the "authentication" button in `Profile.tsx` to `/authentication`.

### Authentication Status Page (`/authentication`)
- [x] Top bar with back button pointing to `/profile` and title `authenticate`.
- [x] Shows two cards:
  - "junior certification" with Silver/Grey Trophy.
  - "advanced certification" with Golden Trophy.
- [x] For each card, show the current status (`unverified`, `pending`, `verified`, or `rejected`) inside a blue rounded pill.
- [x] Clicking a card opens its respective form if allowed.

### Junior Certification Form (`/junior-certification`)
- [x] Back button to `/authentication`.
- [x] Inputs required: Country, City, Province, Full name, Birthday, ID number.
- [x] Submit button triggers Convex mutation mapping to user doc.

### Advanced Certification Form (`/advanced-certification`)
- [x] Cannot be submitted/accessed if Junior is not yet `verified`.
- [x] Two file upload slots with '+' icon: "id card front photo" and "holding id photo".
- [x] Uses Convex `generateUploadUrl` and HTTP storage POST to upload.
- [x] Submit button triggers Convex mutation to save the returned storage IDs.

### Admin Tools (`/manage-users`)
- [x] Admin User Management view should be updated to display pending certifications and allow approval/rejection.
