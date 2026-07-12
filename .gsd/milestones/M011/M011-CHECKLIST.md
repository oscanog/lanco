---
description: M011 Wireframe Parity — Implementation Checklist
status: Complete
---

# M011 Wireframe Parity Checklist

> **Created:** 2026-07-12
> **Reference:** `.gsd/milestones/M011/M011-WIREFRAME-PARITY.md`

---

## Schema
- [x] **S1.** Add `title: v.optional(v.string())` to `copyTradeCodes` table.

## Backend
- [x] **B1.** `generateCopyTradeCode` — accept optional `title` arg.
- [x] **B2.** `redeemCopyTradeCode` — return `title`, `symbol`, `durationSeconds`, `createdAt` from code.
- [x] **B3.** `getMyCopyHistory` — include `title`, `symbol`, `durationSeconds`, `codeCreatedAt`.
- [x] **B4.** `getMyDeliveryOrders` — add `dateFrom`/`dateTo` optional filter args.

## UI — Delivery Order Card (pending state)
- [x] **U1.** Show `rate of return` row with value `--`.
- [x] **U2.** Show `settlement price` row with value `--`.
- [x] **U3.** Show `--` for `time period` on pending.
- [x] **U4.** Show `--` for `opening price` on pending.
- [x] **U5.** Show `--` for `order time` on pending.
- [x] **U6.** Add status header text above card fields.

## UI — Historical Orders Tab
- [x] **U7.** Add date-range picker component.
- [x] **U8.** Wire picker to `getMyDeliveryOrders` with date args.
- [x] **U9.** Default range: last 7 days.

## UI — Invited Me Card
- [x] **U10.** Add `Title` row.
- [x] **U11.** Add `Trading pair` row.
- [x] **U12.** Add `Purchase duration` row.
- [x] **U13.** Add `Release time` row.
- [x] **U14.** Add `Action` row.
- [x] **U15.** Change `recognize` button from green to blue (`#1860F5`).
- [x] **U16.** Match card style to wireframe (simple border, no "Reflecting" badge).

## UI — Admin Copy Trade Page
- [x] **U17.** Add `Title` text input to code generation form.

## Verification
- [x] `npm run build` — zero errors.
