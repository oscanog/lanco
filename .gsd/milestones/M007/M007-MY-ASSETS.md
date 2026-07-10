---
description: My Assets Page — Dynamic Currency Display
status: In Progress
---

# Milestone 7: My Assets Page

## Objective
Create a "My Assets" page that mirrors the wireframe design. The page must dynamically display all monetary values formatted in whichever currency the admin configures globally. A searchable dropdown (like the country selector in Junior Certification) allows admins to select a display currency from the full ISO 4217 list.

## Requirements

### Database Schema
- [x] Add a `settings` table to the schema with a `displayCurrency` string (ISO 4217 code, default: `"USD"`).
- [x] Backend query: `getSettings` — returns the current global settings.
- [x] Backend mutation: `updateDisplayCurrency` — admin-only, sets the global currency code.

### My Assets Page (`/my-assets`)
- [x] Hero gradient banner showing:
  - "my assets" title
  - Asset valuation card with dummy data `1261.55` formatted in the admin-selected currency.
  - "today's earnings" row formatted identically.
- [x] Quick-action icons: withdraw, recharge, transfer, exchange.
- [x] "my account" section with sub-cards: Exchange, Trade, Perpetual.
- [x] All monetary values dynamically reflect the admin-configured currency symbol + formatting.
- [x] Route wired up at `/my-assets` and linked in bottom navigation.

### Admin Panel (`/manage-users`)
- [x] New "Platform Settings" section with a searchable currency dropdown.
- [x] Dropdown includes all world currencies (ISO 4217).
- [x] Selection persists to the `settings` table and reflects globally in real time.

### Routing
- [x] `main.tsx` updated with `MyAssets` import and `/my-assets` route.
- [x] Bottom nav in `Dashboard.tsx` wired to `/my-assets`.
