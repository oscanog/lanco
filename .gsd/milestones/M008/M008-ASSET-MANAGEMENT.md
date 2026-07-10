---
description: Asset Management — Withdraw, Fund Transfer, Security Center, Withdrawal Records
status: Pending
---

# Milestone 8: Asset Management (Withdraw, Fund Transfer, Security Center & Withdrawal Records)

> **Review Date:** 2026-07-10  
> **Reviewed By:** Senior Analyst  
> **Status:** Corrected — previous draft contained critical errors in fee logic, missing pages, and incomplete security architecture.

## Overview

This milestone covers **four** tightly coupled features:

| # | Feature | Route | Purpose |
|---|---------|-------|---------|
| 1 | **Withdraw** | `/withdraw` | External crypto off-ramp |
| 2 | **Fund Transfer** | `/transfer` | Internal sub-ledger movement |
| 3 | **Security Center** | `/security-center` | Fund password management + future security expansions |
| 4 | **Withdrawal Records** | `/withdrawal-records` | Withdrawal transaction history |

All four features depend on shared schema changes (wallet sub-ledgers, fund password hash, withdrawal transaction log).

---

## PART A: Database Schema Changes (`convex/schema.ts`)

These schema changes are **prerequisites** for everything below. The next AI agent MUST apply these first.

### A1. User Wallet Sub-Ledgers

Add to the `users` table:

```typescript
wallets: v.optional(v.object({
  exchangeBalance: v.number(),   // default 0
  tradeBalance: v.number(),      // default 0
  perpetualBalance: v.number(),  // default 0
})),
```

- These represent the three internal sub-accounts visible on the My Assets page (Exchange, Trade, Perpetual).
- Balances are denominated in the selected crypto asset (USDT by default).
- For QA testing, seed the dummy user's `tradeBalance` with `1261.55`.

### A2. Fund Password

Add to the `users` table:

```typescript
fundPasswordHash: v.optional(v.string()),
```

- When `fundPasswordHash` is `undefined`, the user has **never set** a fund password.
- The frontend Security Center page must detect this and dynamically render "Set New" vs "Change Existing" forms.
- **IMPORTANT:** Hash the fund password server-side using a proper hashing algorithm (e.g., SHA-256 or bcrypt). NEVER store plaintext.

### A3. Withdrawal Transactions Table

Create a new top-level table:

```typescript
withdrawals: defineTable({
  userId: v.id("users"),
  currency: v.string(),                    // "USDT" | "ETH" | "USDC"
  network: v.string(),                     // "TRC20" | "ERC20"
  walletAddress: v.string(),
  withdrawalAmount: v.number(),
  handlingFee: v.number(),                 // always = withdrawalAmount * 0.20
  amountReceived: v.number(),              // always = withdrawalAmount - handlingFee
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("disbursed"),
    v.literal("rejected")
  ),
  createdAt: v.number(),                   // Date.now() timestamp
}).index("by_user", ["userId"]),
```

---

## PART B: Backend Mutations & Queries (`convex/`)

### B1. `convex/wallets.ts` — Wallet Operations

```
getWallets(targetUserId?) → { exchangeBalance, tradeBalance, perpetualBalance }
```
- Returns the user's wallet sub-ledger balances.
- If `wallets` field is undefined, return all zeros.

```
transferFunds({ fromAccount, toAccount, amount, currency }) → void
```
- Validates: `amount > 0`, `fromAccount` has sufficient balance.
- Atomically decrements `fromAccount` and increments `toAccount`.
- `fromAccount` / `toAccount` must be one of: `"exchange"`, `"trade"`, `"perpetual"`.

### B2. `convex/withdrawals.ts` — Withdrawal Operations

```
submitWithdrawal({ currency, network, walletAddress, fundPassword, amount, sourceAccount }) → void
```
- **Step 1:** Validate fund password against stored `fundPasswordHash`. Reject if mismatch.
- **Step 2:** Validate `amount > 0` and `sourceAccount` has sufficient balance.
- **Step 3:** Calculate fee: `handlingFee = amount * 0.20` (FLAT 20%, NO EXCEPTIONS).
- **Step 4:** Calculate received: `amountReceived = amount - handlingFee`.
- **Step 5:** Deduct `amount` from user's wallet sub-ledger.
- **Step 6:** Insert withdrawal record into `withdrawals` table with status `"pending"`.

```
getWithdrawalHistory({ userId? }) → Withdrawal[]
```
- Returns all withdrawal records for the current user, sorted by `createdAt` descending (newest first).

### B3. `convex/security.ts` — Fund Password Operations

```
setFundPassword({ newPassword, confirmPassword }) → void
```
- Only callable when `fundPasswordHash` is `undefined` (user has no existing fund password).
- Validates `newPassword === confirmPassword` and min length requirements.
- Hashes and stores to `fundPasswordHash`.

```
changeFundPassword({ oldPassword, newPassword, confirmPassword }) → void
```
- Only callable when `fundPasswordHash` exists.
- Validates old password hash matches.
- Validates `newPassword === confirmPassword`.
- Overwrites `fundPasswordHash` with new hash.

```
hasFundPassword() → boolean
```
- Returns `true` if user's `fundPasswordHash` is defined, `false` otherwise.
- Used by the frontend to dynamically toggle between "Set" and "Change" forms.

---

## PART C: Withdraw Page (`/withdraw`)

### Route: `/withdraw`
### File: `src/Withdraw.tsx`

### C1. Header
- Left: `<ArrowLeft>` back button → navigates to `/my-assets`.
- Center: Title text **"withdraw"** (lowercase per wireframe).
- Right: Paper/document icon → navigates to `/withdrawal-records`.

### C2. Select Currency (Bottom Sheet Modal)
- Displays a tappable row showing the currently selected crypto with its icon.
- On tap, opens a **bottom-sheet modal** listing exactly 3 options:
  - ✅ **USDT** (teal diamond icon) — default selected, shows checkmark
  - ✅ **ETH** (grey diamond icon)
  - ✅ **USDC** (blue circle icon)
- **CRITICAL:** This list is HARDCODED to these 3 assets. It does NOT change based on admin fiat currency settings from M007. The admin's global currency (USD, PHP, etc.) is irrelevant here.

### C3. Withdrawal Network (Bottom Sheet Modal)
- Tappable row showing current network selection.
- Modal options:
  - **TRC20** (default)
  - **ERC20**
- The available networks may vary based on selected currency. For MVP: both networks available for all 3 currencies.

### C4. Form Fields

| Field | Type | Placeholder | Notes |
|-------|------|-------------|-------|
| Withdrawal Address | `text` | "please enter or paste your wallet address" | Free-form, validated for non-empty |
| Fund Password | `password` | "please enter the fund password" | Eye icon toggle for visibility. **If user has no fund password set, show an inline prompt linking to `/security-center` instead of the input.** |
| Quantity | `number` | "0" | Right-aligned `maximum` button auto-fills available balance. Above input: "available: {balance}" right-aligned. |

### C5. Handling Fee Display
- Below the quantity input: `handling fee({calculatedFee} {CURRENCY})`
- Calculation: **`fee = quantity * 0.20`** — FLAT 20%. ALWAYS.
- Updates dynamically as user types in quantity field.
- When quantity is 0 or empty: display `handling fee(-- USDT)`.

### C6. Important Notice Box
- Light blue rounded card at the bottom containing static text:

> After submitting the withdrawal application, the funds are in a frozen state because the withdrawal is in progress and the funds are temporarily under the custody of the system, which does not mean that you have lost the asset or the asset is abnormal.
>
> To prevent arbitrage, new members who attempt to withdraw funds within 40 days of joining may have their withdrawal requests rejected by the risk control system; please contact the general agent if you have any questions.
>
> Please first confirm whether your wallet supports the withdrawal currency or network. For example, search for "USDT". If there is no withdrawal function for this currency, it means it is not supported. Please check to avoid losses.
>
> The handling fee will be 20% of the withdrawal amount, which will be automatically deducted!

### C7. Action Button
- Full-width blue rounded button: **"next step"**
- Validates all fields → calls `submitWithdrawal` mutation → shows success toast → redirects to `/withdrawal-records`.

---

## PART D: Withdrawal Records Page (`/withdrawal-records`)

### Route: `/withdrawal-records`
### File: `src/WithdrawalRecords.tsx`

### D1. Header
- Left: `<ArrowLeft>` back button → navigates to `/withdraw`.
- Center: Title **"withdrawals record"** (per wireframe).

### D2. Record List
- Query `getWithdrawalHistory()` and render each record as a card.
- Each card displays a key-value table layout:

| Label | Value | Alignment |
|-------|-------|-----------|
| withdrawal amount | `{withdrawalAmount}` | right |
| Handling fee | `{handlingFee}` | right |
| amount received | `{amountReceived}` | right |
| withdrawal network | `{network}` (e.g., "TRC20") | right |
| withdrawal address | `{walletAddress}` (full address, small font) | right |
| withdrawal time | `{formattedDate}` (e.g., "6/30/2026, 9:29:01 PM") | left |

- **Status Badge** (right-aligned on the same line as withdrawal time):
  - `"disbursed"` → orange/amber badge text
  - `"pending"` → blue badge text
  - `"processing"` → yellow badge text
  - `"rejected"` → red badge text

### D3. Empty State
- If no records: centered text "No withdrawal records yet."

### D4. Styling
- Cards separated by subtle dividers or spacing.
- Labels are grey/muted, values are dark/bold, right-aligned.
- Wallet address uses monospace or smaller font to fit long strings.

---

## PART E: Fund Transfer Page (`/transfer`)

### Route: `/transfer`
### File: `src/Transfer.tsx`

### E1. Header
- Left: `<ArrowLeft>` back button → navigates to `/my-assets`.
- Center: Title **"fund transfer"** (per wireframe).
- Right: Transaction history icon (optional — can link to a future transfer history page, or omit for MVP).

### E2. Select Currency (Bottom Sheet Modal)
- Same visual pattern as Withdraw's currency selector.
- Options: **USDT, ETH, USDC** (same 3 as withdrawal — keep consistent).
- Default: USDT.

### E3. Wallet Routing Card (The Swap Box)

This is the core interaction of the transfer page. It's a vertically stacked card:

```
┌─────────────────────────────────────────────┐
│  ▽  Exchange                              > │
│      available : 0.00000000 USDT            │
│                                             │
│               🔄 (swap icon)                │
│                                             │
│  ●  Trade                                 > │
└─────────────────────────────────────────────┘
```

**Implementation Detail — The Swap Controller:**
- Use a single boolean state: `directionExchangeToTrade` (default: `true`).
- When `true`: **From** = Exchange (shows available balance), **To** = Trade.
- When `false`: **From** = Trade (shows available balance), **To** = Exchange.
- Clicking the central blue swap icon toggles this boolean.
- The "available" balance text ONLY appears on the **From** node, showing the exact balance to 8 decimal places.
- The `>` chevron on each row is decorative (tappable to select which sub-account, if we later add Perpetual as a third option).

### E4. Quantity Field
- Text input: `placeholder="please enter quantity"`.
- Right side shows: `{CURRENCY}` label + blue `maximum` text button.
- Tapping `maximum` auto-fills the From node's full available balance.

### E5. Action Button
- Full-width blue rounded button: **"exchange"**
- Validates `amount > 0`, sufficient balance → calls `transferFunds` mutation → shows success toast → updates balances in real-time.

---

## PART F: Security Center (`/security-center`)

### Route: `/security-center`
### File: `src/SecurityCenter.tsx`

### F1. Header
- Left: `<ArrowLeft>` back button → navigates to `/profile`.
- Center: Title **"security center"**.

### F2. Menu Items
A simple list of tappable rows with rounded borders (matching the wireframe styling):

| Row Label | Action | Priority |
|-----------|--------|----------|
| google verification | Future milestone (placeholder/disabled for now) | Low |
| change password | Navigate to existing password change flow or build new | Medium |
| **fund password** | Navigate to `/fund-password` | **HIGH — Required for M008** |

### F3. Profile Page Integration
- The existing `Profile.tsx` page must be updated to include a **"security center"** menu row that navigates to `/security-center`.
- Position it logically near the existing "authentication" link.

---

## PART G: Fund Password Page (`/fund-password`)

### Route: `/fund-password`
### File: `src/FundPassword.tsx`

### G1. Dynamic Form Detection

On page load, call `hasFundPassword()` query:

**Case A — No existing fund password (`hasFundPassword() === false`):**
- Title: **"set fund password"**
- Fields:
  - "new fund password" (password + eye toggle)
  - "confirm new fund password" (password + eye toggle)
- Button: **"confirm submission"** → calls `setFundPassword` mutation.

**Case B — Has existing fund password (`hasFundPassword() === true`):**
- Title: **"fund password modified successfully"** (matches wireframe title — this is the page title when the user is changing, the "successfully" is pre-emptive branding, confirmed from wireframe)
- Fields:
  - "old fund password" (password + eye toggle)
  - "new fund password" (password + eye toggle)
  - "confirm new fund password" (password + eye toggle)
- Button: **"confirm submission"** → calls `changeFundPassword` mutation.

### G2. Validation Rules
- New password minimum length: 6 characters.
- New password and confirm must match exactly.
- Old password (when changing) must match stored hash.
- On success: show toast "Fund password updated successfully!" and navigate back to `/security-center`.

---

## PART H: Routing Updates (`src/main.tsx`)

Add the following new routes and imports:

```typescript
import Withdraw from "./Withdraw.tsx";
import Transfer from "./Transfer.tsx";
import WithdrawalRecords from "./WithdrawalRecords.tsx";
import SecurityCenter from "./SecurityCenter.tsx";
import FundPassword from "./FundPassword.tsx";

// Inside Router():
if (path === "/withdraw") return <Withdraw />;
if (path === "/transfer") return <Transfer />;
if (path === "/withdrawal-records") return <WithdrawalRecords />;
if (path === "/security-center") return <SecurityCenter />;
if (path === "/fund-password") return <FundPassword />;
```

---

## PART I: My Assets Page Updates (`src/MyAssets.tsx`)

The existing My Assets page (M007) must be updated:

1. **"withdraw" action icon** → navigates to `/withdraw`.
2. **"transfer" action icon** → navigates to `/transfer`.
3. **"recharge" action icon** → placeholder for future milestone (show toast "Coming soon").
4. **"exchange" action icon** → placeholder for future milestone (show toast "Coming soon").
5. **Sub-account balances** (Exchange, Trade, Perpetual cards) must now query real data from `getWallets()` instead of hardcoded dummy values.

---

## PART J: Reusable Component — Bottom Sheet Modal

### File: `src/components/BottomSheetModal.tsx`

Build ONE reusable modal component that powers ALL selectors across Withdraw and Transfer:

```typescript
interface BottomSheetOption {
  value: string;
  label: string;
  icon?: React.ReactNode;  // optional icon element (crypto logos, etc.)
}

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: BottomSheetOption[];
  selectedValue: string;
}
```

**Behavior:**
- Renders as a centered floating card with backdrop overlay (matching wireframe).
- Selected option shows a blue checkmark.
- Clicking outside or selecting an option closes the modal.
- Smooth fade-in animation.

**Usage instances:**
1. Withdraw → Currency selector (USDT, ETH, USDC)
2. Withdraw → Network selector (TRC20, ERC20)
3. Transfer → Currency selector (USDT, ETH, USDC)

---

## PART K: Implementation Order (MANDATORY)

The next AI agent MUST follow this exact order to avoid dependency errors:

```
Step 1:  Schema changes (Part A) — wallets, fundPasswordHash, withdrawals table
Step 2:  Backend mutations (Part B) — wallets.ts, withdrawals.ts, security.ts
Step 3:  Reusable BottomSheetModal component (Part J)
Step 4:  Security Center + Fund Password pages (Parts F, G)
Step 5:  Withdraw page (Part C)
Step 6:  Withdrawal Records page (Part D)
Step 7:  Fund Transfer page (Part E)
Step 8:  My Assets page updates (Part I)
Step 9:  Routing updates (Part H)
Step 10: QA testing with dummy data
```

---

## PART L: QA Testing Checklist

- [ ] Withdraw: selecting USDT/ETH/USDC updates all labels and fee displays correctly.
- [ ] Withdraw: handling fee = exactly 20% of entered amount (e.g., 100 → fee 20, received 80).
- [ ] Withdraw: cannot submit without fund password set (prompts to Security Center).
- [ ] Withdraw: paper icon navigates to withdrawal records.
- [ ] Withdrawal Records: displays all past withdrawals with correct math and status badges.
- [ ] Transfer: swap button inverts From/To and recalculates available balance instantly.
- [ ] Transfer: maximum button fills exact balance from the From account.
- [ ] Transfer: Exchange → Trade deducts from exchange, adds to trade (and vice versa).
- [ ] Security Center: shows 3 menu items, fund password navigates correctly.
- [ ] Fund Password: when no password exists, shows "set new" form (2 fields).
- [ ] Fund Password: when password exists, shows "change" form (3 fields).
- [ ] Fund Password: validates old password, matching confirmation, min length.
- [ ] My Assets: action icons route to correct pages.
- [ ] My Assets: sub-account cards show real wallet balances from database.
- [ ] All pages: dark mode works correctly.
- [ ] All pages: back buttons route to correct parent pages.
