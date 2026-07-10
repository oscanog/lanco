---
description: M008 Implementation Progress Checklist
status: In Progress
---

# M008 Implementation Checklist

> **Last Updated:** 2026-07-10  
> **Reference:** `.gsd/milestones/M008/M008-ASSET-MANAGEMENT.md`

---

## Step 1: Schema Changes (Part A)
- [x] Add `wallets` object to `users` table (`exchangeBalance`, `tradeBalance`, `perpetualBalance`)
- [x] Add `fundPasswordHash` (optional string) to `users` table
- [x] Create `withdrawals` table with all fields (userId, currency, network, walletAddress, withdrawalAmount, handlingFee, amountReceived, status, createdAt)
- [x] Add index `by_user` on withdrawals table
- [ ] Seed QA dummy user with `tradeBalance: 1261.55`

## Step 2: Backend Mutations & Queries (Part B)
- [x] Create `convex/wallets.ts` → `getWallets` query
- [x] Create `convex/wallets.ts` → `transferFunds` mutation (validates balance, atomically moves funds)
- [x] Create `convex/withdrawals.ts` → `submitWithdrawal` mutation (validates fund password, calculates 20% fee, deducts balance, inserts record)
- [x] Create `convex/withdrawals.ts` → `getWithdrawalHistory` query (sorted by createdAt desc)
- [x] Create `convex/security.ts` → `hasFundPassword` query
- [x] Create `convex/security.ts` → `setFundPassword` mutation (only when no existing password)
- [x] Create `convex/security.ts` → `changeFundPassword` mutation (validates old, sets new)

## Step 3: Reusable BottomSheetModal Component (Part J)
- [x] Create `src/components/BottomSheetModal.tsx`
- [x] Accepts: `isOpen`, `onClose`, `onSelect`, `options[]`, `selectedValue`
- [x] Shows checkmark on selected option
- [x] Backdrop overlay + fade animation
- [x] Click outside to close

## Step 4: Security Center + Fund Password Pages (Parts F, G)
- [x] Create `src/SecurityCenter.tsx` at route `/security-center`
- [x] Render 3 menu rows: google verification, change password, fund password
- [x] Create `src/FundPassword.tsx` at route `/fund-password`
- [x] Dynamic detection: no password → "set new" form (2 fields) vs has password → "change" form (3 fields)
- [x] Eye toggle on all password inputs
- [x] Validation: min length, confirm match, old password check
- [x] Success toast + navigate back to `/security-center`
- [x] Update `src/Profile.tsx` to add "security center" menu link

## Step 5: Withdraw Page (Part C)
- [x] Create `src/Withdraw.tsx` at route `/withdraw`
- [x] Header: back arrow → `/my-assets`, title "withdraw", paper icon → `/withdrawal-records`
- [x] Currency selector using BottomSheetModal (USDT, ETH, USDC only)
- [x] Network selector using BottomSheetModal (TRC20, ERC20)
- [x] Withdrawal address text input
- [x] Fund password input with eye toggle (or prompt to set one if none exists)
- [x] Quantity input with "available: {balance}" and "maximum" button
- [x] Dynamic handling fee display: `fee = amount * 0.20` (FLAT 20%)
- [x] Important notice blue card with static disclaimer text
- [x] "next step" button → validates → calls submitWithdrawal → toast → redirect

## Step 6: Withdrawal Records Page (Part D)
- [x] Create `src/WithdrawalRecords.tsx` at route `/withdrawal-records`
- [x] Header: back arrow → `/withdraw`, title "withdrawals record"
- [x] Query and render all withdrawal records as cards
- [x] Each card: amount, fee, received, network, address, time, status badge
- [x] Status badges: disbursed (amber), pending (blue), processing (yellow), rejected (red)
- [x] Empty state: "No withdrawal records yet."

## Step 7: Fund Transfer Page (Part E)
- [x] Create `src/Transfer.tsx` at route `/transfer`
- [x] Header: back arrow → `/my-assets`, title "fund transfer"
- [x] Currency selector using BottomSheetModal (USDT, ETH, USDC)
- [x] Wallet swap box: From/To nodes with available balance on From
- [x] Swap controller icon toggles direction (Exchange↔Trade)
- [x] Balance displayed to 8 decimal places
- [x] Quantity input with "maximum" auto-fill
- [x] "exchange" button → validates → calls transferFunds → toast

## Step 8: My Assets Page Updates (Part I)
- [x] "withdraw" icon → navigates to `/withdraw`
- [x] "transfer" icon → navigates to `/transfer`
- [x] "recharge" icon → alert "Coming soon"
- [x] "exchange" icon → alert "Coming soon"
- [x] Sub-account cards query real balances from `getWallets()`

## Step 9: Routing Updates (Part H)
- [x] Import all 5 new page components in `src/main.tsx`
- [x] Add routes: `/withdraw`, `/transfer`, `/withdrawal-records`, `/security-center`, `/fund-password`

## Step 10: QA Verification
- [ ] Withdraw: USDT/ETH/USDC selection updates labels correctly
- [ ] Withdraw: fee = exactly 20% (e.g., 100 → fee 20, received 80)
- [ ] Withdraw: blocked without fund password → prompts Security Center
- [ ] Withdrawal Records: correct math, status badges render
- [ ] Transfer: swap inverts From/To + recalculates balance
- [ ] Transfer: maximum button fills exact From balance
- [ ] Security Center: 3 menu items render, fund password links work
- [ ] Fund Password: dynamic "set new" vs "change existing" form
- [ ] My Assets: action icons route correctly
- [ ] My Assets: real wallet balances displayed
- [ ] All pages: dark mode works
- [ ] All pages: back buttons route correctly
- [ ] Git commit and push

---

## Notes
- Handling fee is **FLAT 20%**. No tiered logic. Confirmed from production withdrawal records.
- Fund password is managed exclusively through Security Center → Fund Password page. NOT inline on the withdraw form.
- Withdrawal currencies are strictly USDT, ETH, USDC regardless of admin's global fiat display currency setting.
