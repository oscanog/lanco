---
description: Implement User & Admin roles, Dashboard, and User Management
status: Done
---

# Milestone 3: Admin Pages & Dashboard

## Objective
Implement role-based access control (User vs. Admin), a dynamic authenticated dashboard based on wireframes, dark/light mode toggle, and an Admin User Management page.

## Requirements

### Roles & Database
- [x] Define `user` and `admin` roles in Convex schema.
- [x] Implement role-based checks for UI and backend queries.

### Dashboard Core (Landing Dashboard)
- [x] Implement Dashboard UI matching provided wireframe.
  - Top bar: Logo left, Chat/Message icon, User Icon, Globe/Language icon right.
  - Hero illustration: Vault and coin graphic.
  - Slogan: "The goal is to become the first choice for customers in commodity futures trading".
  - Crypto/Asset quotes list (BTCUSDT, ETHUSDT, etc.) with price and daily change.
- [x] App must support light/dark mode.

### Navigation / Footer Bar
- [x] Dynamic bottom navigation based on role:
  - **User:** Home, Quotes, Trade, My Assets
  - **Admin:** Home, Quotes, Trade, Manage Users, My Assets

### Settings / Dark Mode Toggle
- [x] Clicking the "top right user icon" on the dashboard navigates to a new page.
- [x] The user profile/settings page only contains a Light/Dark mode trigger.

### Admin Features
- [x] Create `/manage-users` page (accessible only to `admin`).
- [x] Admin can view a list of users.
- [x] Admin has the ability to create new users directly from this page.
