---
description: M009 Implementation Progress Checklist
status: Complete
---

# M009 Implementation Checklist

> **Last Updated:** 2026-07-10  
> **Reference:** `.gsd/milestones/M009/M009-RECHARGE.md`

---

## Step 1: Schema Updates
- [x] Add `recharges` table in `convex/schema.ts`
- [x] Include `userId`, `fundedByAdminId`, `currency`, `network`, `walletAddress`, `amount`, `status`, `createdAt`
- [x] Add indexes for `by_user` and `by_admin`

## Step 2: Backend Logic (`convex/recharges.ts`)
- [x] Implement `getMyRecharges` query for users
- [x] Implement `getAllSponsoredLogs` query for admins (expanding admin and target user details)
- [x] Implement `sponsorDeposit` mutation for admins (verifying fund password, updating exchangeBalance, logging address)

## Step 3: Components
- [x] Build `src/components/PickerModal.tsx` for iOS-style wheel picker with Cancel/Confirm header.

## Step 4: User Interface
- [x] Build `src/Recharge.tsx` (`/recharge`) with navigable asset list.
- [x] Build `src/RechargeDetails.tsx` (`/recharge/:currency`) with copyable QR code, dummy platform address, network picker, and warning guidelines. No form submission.
- [x] Build `src/RechargeRecords.tsx` (`/recharge-records`) mapping logs from backend.

## Step 5: Admin Interface
- [x] Build `src/AdminDeposit.tsx` (`/admin/deposit`) form requiring fund password and target address.
- [x] Build `src/AdminDepositLogs.tsx` (`/admin/deposit-logs`) to show audit trail of sponsored deposits.

## Step 6: Integration & Polish
- [x] Update `main.tsx` router with all 5 new routes.
- [x] Route "recharge" icon in `MyAssets.tsx` to `/recharge`.
- [x] Run `npm install qrcode.react` to fulfill dependency.
