---
description: Trade Page — Wireframe Parity Audit & Fixes
status: Pending
---

# Milestone 11: Trade Page — Wireframe Parity Fixes

> **Created:** 2026-07-12
> **Priority:** HIGH — Production UI does not match approved wireframe.
> **Reference wireframe spec:** `docs/order_cards.md`
> **Implementation file:** `src/Trade.tsx`

---

## Gap Analysis Summary

The M010 checklist marked all Trade sub-tabs as `[x]` complete, but a
meticulous comparison of the live implementation against the wireframe
screenshots reveals **multiple missing fields, missing UI elements, and
layout discrepancies** across all three card types.

---

## 1. Delivery Order Card — Missing Items

**Wireframe spec** (from `docs/order_cards.md` §1):

| # | Field / Element | Wireframe | Current Implementation | Status |
|---|---|---|---|---|
| 1.1 | `rate of return` row | Shows `--%` for pending orders | Row is **hidden** for pending orders — only rendered when `isCompleted` (line 817-831) | ❌ MISSING |
| 1.2 | `settlement price` row | Shows `--` for pending orders | Row is **hidden** for pending orders — only rendered when `isCompleted` (line 836-838) | ❌ MISSING |
| 1.3 | `profit and loss` row | Not shown for pending in wireframe | Currently conditionally rendered only for completed — **correct** but see note | ✅ OK |
| 1.4 | Placeholder values `--` | Pending fields show `--` as placeholder | Pending orders render full numeric values (e.g. `0.00`) instead of `--` | ❌ WRONG |
| 1.5 | `time period` placeholder | Shows `--` for pending | Currently shows `periodStart ~ periodEnd` even for pending — wireframe shows `--` | ❌ WRONG |
| 1.6 | `opening price` placeholder | Shows `--` for pending | Currently shows numeric `openingPrice` for pending | ❌ WRONG |
| 1.7 | `order time` placeholder | Shows `--` for pending | Currently shows full date string for pending | ❌ WRONG |
| 1.8 | Card header `??? ??? ???` | Status text showing `??? ??? ???` (localized/encoded status) | No status header text is rendered at all — just the CALL/PUT tag + symbol + duration | ❌ MISSING |

**Summary:** Pending delivery order cards must show `--` placeholders for
unsettled fields and must include `rate of return` and `settlement price`
rows (with `--` values). A status header line is missing.

---

## 2. Invited Me Card — Missing Items

**Wireframe spec** (from `docs/order_cards.md` §2):

| # | Field / Element | Wireframe | Current Implementation | Status |
|---|---|---|---|---|
| 2.1 | `Title` field row | `Fidelity Capital Investment Group 07/11/2026-Fixed signals-01` — a descriptive title line at top of card | **Not rendered.** The `ReflectingCopyCard` component (line 855-902) has no `Title` row. The admin-generated code has no `title` field in schema. | ❌ MISSING (schema + UI) |
| 2.2 | `Trading pair` field row | Shows `-` | **Not rendered.** Card shows `order code`, `order amount`, `earned interest`, `total asset basis` — but no `Trading pair` row. | ❌ MISSING |
| 2.3 | `Purchase duration` field row | Shows `-` | **Not rendered.** No duration display on the invited-me card. | ❌ MISSING |
| 2.4 | `Release time` field row | Shows `7/11/2026, 3:03:01 PM` | **Not rendered.** No release time / creation timestamp. | ❌ MISSING |
| 2.5 | `Order amount` field row | Shows `12.87` | ✅ Rendered as `order amount` (line 898). | ✅ OK |
| 2.6 | `Action` field row | Present but empty value | **Not rendered.** No action row at bottom of card. | ❌ MISSING |
| 2.7 | `recognize` button color | Wireframe shows **blue filled** button | Current implementation uses **green** (`bg-[#26a69a]`) button (line 674) | ❌ WRONG COLOR |
| 2.8 | Card structure | Wireframe shows a **plain card** with Title + key-value rows (no "Reflecting" badge, no countdown) | Current implementation shows a completely different `ReflectingCopyCard` with a blue "Reflecting" badge and countdown timer — visually divergent from wireframe | ⚠️ DIVERGENT |
| 2.9 | Input always visible | Wireframe shows code input even when a card is present below it | ✅ Input is always visible in "initiate" sub-tab (line 662-688) | ✅ OK |

**Summary:** The Invited Me card is missing 5 field rows (`Title`,
`Trading pair`, `Purchase duration`, `Release time`, `Action`). The
`recognize` button is the wrong color. The schema `copyTradeCodes` needs
a `title` field. The card visual style is also divergent — wireframe shows
a simple bordered card, not the current "Reflecting" styled card.

---

## 3. Historical Orders Card — Missing Items

**Wireframe spec** (from `docs/order_cards.md` §3):

| # | Field / Element | Wireframe | Current Implementation | Status |
|---|---|---|---|---|
| 3.1 | **Date range filter** | Interactive date-range selector: `2026/07/08 - 2026/07/11` with right chevron `>` | **Completely missing.** Historical orders renders a flat list with no date filter UI. | ❌ MISSING |
| 3.2 | `profit and loss` color | Green for positive, red for negative (wireframe shows green for profits, including on PUT wins) | Implemented with `isGreen`/`isRed` logic (line 820-824) | ✅ OK |
| 3.3 | `rate of return` color | Green for positive returns | ✅ Implemented (line 825-830) | ✅ OK |
| 3.4 | Card header layout | `CALL` (green) + `BTCUSDT` (bold dark) + `60s` (gray) — inline | ✅ Implemented (line 805-815) | ✅ OK |
| 3.5 | `time period` | `10:34 ~ 10:35` | ✅ Implemented (line 816) | ✅ OK |
| 3.6 | `order quantity` | Shows value | ✅ Implemented (line 833) | ✅ OK |
| 3.7 | `the number of transactions` | Shows value | ✅ Implemented (line 834) | ✅ OK |
| 3.8 | `opening price` | Shows value | ✅ Implemented (line 835) | ✅ OK |
| 3.9 | `settlement price` | Shows value | ✅ Implemented for completed (line 836-838) | ✅ OK |
| 3.10 | `order time` | `2026-07-11 10:34:05` format | ✅ Implemented (line 839-850) | ✅ OK |
| 3.11 | Date filter — backend query | Filter orders by date range | **No backend support** — `getMyDeliveryOrders` fetches all orders, no date range args | ❌ MISSING |

**Summary:** The historical orders tab is missing the date-range filter
UI element and the corresponding backend query support for date filtering.

---

## Consolidated Task List

### Schema Changes (`convex/schema.ts`)

- [ ] **S1.** Add `title` field to `copyTradeCodes` table: `title: v.optional(v.string())` — admin-provided descriptive title for the code (e.g. "Fidelity Capital Investment Group 07/11/2026-Fixed signals-01").

### Backend Changes

- [ ] **B1.** Update `generateCopyTradeCode` mutation to accept optional `title` arg.
- [ ] **B2.** Update `redeemCopyTradeCode` to return `title`, `symbol`, `durationSeconds`, `createdAt` from the code record.
- [ ] **B3.** Update `getMyCopyHistory` to include `title`, `symbol`, `durationSeconds`, `codeCreatedAt` from joined code record.
- [ ] **B4.** Add date-range filter args to `getMyDeliveryOrders` query: `dateFrom: v.optional(v.number())`, `dateTo: v.optional(v.number())`.

### UI Changes (`src/Trade.tsx`)

#### Delivery Order Card (`OrderCard` component, pending state)
- [ ] **U1.** Show `rate of return` row for pending orders with value `--`.
- [ ] **U2.** Show `settlement price` row for pending orders with value `--`.
- [ ] **U3.** Show `--` placeholder for `time period` when order is pending.
- [ ] **U4.** Show `--` placeholder for `opening price` when order is pending.
- [ ] **U5.** Show `--` placeholder for `order time` when order is pending.
- [ ] **U6.** Add status header text above card fields (localized status string).

#### Historical Orders Tab
- [ ] **U7.** Add date-range picker UI component above historical order list.
- [ ] **U8.** Wire date-range picker to filter `getMyDeliveryOrders` query with `dateFrom`/`dateTo` args.
- [ ] **U9.** Default date range: last 7 days.

#### Invited Me Card (`ReflectingCopyCard` + code card)
- [ ] **U10.** Add `Title` row to copy trade card displaying the code's title.
- [ ] **U11.** Add `Trading pair` row showing the code's symbol (e.g. `BTCUSDT` or `-`).
- [ ] **U12.** Add `Purchase duration` row showing the code's duration (e.g. `60s` or `-`).
- [ ] **U13.** Add `Release time` row showing the code's `createdAt` formatted as localized date/time.
- [ ] **U14.** Add `Action` row (label present, value empty or contextual action).
- [ ] **U15.** Change `recognize` button color from green (`#26a69a`) to blue (`#1860F5`).
- [ ] **U16.** Match card visual style to wireframe: simple bordered card without "Reflecting" badge styling divergence.

#### Admin Copy Trade Page (`src/AdminCopyTrade.tsx`)
- [ ] **U17.** Add `Title` text input to code generation form.

---

## Implementation Order

1. **S1** → Schema: add `title` to `copyTradeCodes`.
2. **B1–B4** → Backend mutations/queries.
3. **U1–U6** → Delivery order card pending-state fixes.
4. **U7–U9** → Historical orders date-range filter.
5. **U10–U16** → Invited me card field additions + style fixes.
6. **U17** → Admin form title field.
7. `npm run build` verification.

---

## Acceptance Criteria

- Every field listed in `docs/order_cards.md` is visible in the corresponding card.
- Pending delivery orders show `--` for unsettled fields.
- Historical orders tab has a functional date-range picker.
- Invited me card shows Title, Trading pair, Purchase duration, Release time, Action rows.
- `recognize` button is blue, not green.
- `npm run build` passes with zero errors.
