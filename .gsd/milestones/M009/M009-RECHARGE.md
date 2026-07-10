---
description: Asset Management — Recharge Setup & Admin Sponsored Deposits
status: Pending
---

# Milestone 9: Recharge & Sponsored Deposit Logs

> **Review Date:** 2026-07-10  
> **Reviewed By:** Senior Analyst Programmer  
> **Status:** OVERHAULED. Removed hallucinated user forms. Fixed missing schema fields. Corrected modal UI specifications.

## Objective
Implement a multi-role Recharge and Balance Crediting system based STRICTLY on the provided wireframes:
1. **User-Facing Recharge (`/recharge`):** purely informational screens. Users select a crypto and network to view the platform's deposit address and QR code. **USERS DO NOT SUBMIT RECHARGE REQUESTS ON THE APP.** They transfer funds externally from their own wallets.
2. **Admin-Only Deposit Panel (`/admin/deposit`):** A secure interface where platform admins manually credit users. Admins act as sponsors: they input the amount, select the crypto/network, dictate the address used, and verify their admin password to instantly fund the user's **Exchange** balance.
3. **Logs & Records:** 
   - Users view their credited recharges at `/recharge-records`.
   - Admins view an audit trail at `/admin/deposit-logs`.

---

## PART A: Database Schema Updates (`convex/schema.ts`)

Add the `recharges` table. *Note that `walletAddress` is REQUIRED to fulfill the user's `recharge-records` UI requirements.*

```typescript
recharges: defineTable({
  userId: v.id("users"),           // The user who receives the funds
  fundedByAdminId: v.id("users"),  // The admin who authored the deposit
  currency: v.string(),            // "USDT" | "ETH" | "USDC"
  network: v.string(),             // "TRC20" | "ERC20" | "ETH"
  walletAddress: v.string(),       // The address displayed to the user / logged by admin
  amount: v.number(),              // The amount credited (positive number)
  status: v.literal("completed"),  // All admin deposits are instantly completed
  createdAt: v.number(),           // Timestamp
}).index("by_user", ["userId"])
  .index("by_admin", ["fundedByAdminId"]),
```

---

## PART B: Backend Operations (`convex/recharges.ts`)

```typescript
// Query: Fetch recharge history for the CURRENT user
export const getMyRecharges = query({
  args: {},
  handler: async (ctx) => { ... } // sorts by createdAt desc
});

// Query: Fetch all sponsored deposit logs (Admins only)
export const getAllSponsoredLogs = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authorize admin
    // 2. Fetch all recharges
    // 3. Map over results to attach target user info (name/email) AND sponsor admin info (name/email)
    // 4. Return combined objects
  }
});

// Mutation: Sponsor a deposit (Admins only)
export const sponsorDeposit = mutation({
  args: {
    targetUserId: v.id("users"),
    currency: v.string(),
    network: v.string(),
    walletAddress: v.string(),
    amount: v.number(),
    adminPassword: v.string(), // Mandated password verification
  },
  handler: async (ctx, args) => {
    // 1. Authenticate caller & verify they are role === "admin"
    // 2. Validate adminPassword against caller's credentials or dedicated security password
    // 3. Increment target user's wallets.exchangeBalance by args.amount
    // 4. Insert completed record into `recharges`
  }
});
```

---

## PART C: User Interface — Recharge Screens

### C1. Currency Selector (`/recharge`)
* **Header:** Back arrow `<-` (to `/my-assets`), title "recharge", paper icon (to `/recharge-records`).
* **Search Bar:** Centered input (`placeholder="search"`) with magnifying glass icon. Dynamically filters the list below.
* **Asset List:** Tappable rows with right chevron `>` routing to `/recharge/:currency`.
  - **USDT** (green Tether diamond icon)
  - **ETH** (grey Ethereum diamond icon)
  - **USDC** (blue USD Coin circle icon)

### C2. Recharge Details Page (`/recharge/:currency`)
* **Header:** Back arrow `<-` (to `/recharge`), title e.g., "recharge ETH" or "recharge USDT".
* **Currency Row:** Read-only tile showing selected currency (e.g., ETH) with `>`. Tapping routes back or opens a generic selection sheet.
* **Network Row:** Shows selected network (e.g., TRC20) with `>`. Tapping opens the **Picker Modal** (see Part E).
* **Save QR Code Card:**
  - Center-aligned QR code image representing the platform's deposit address.
  - Deposit address text below. (Use a static dummy address for MVP, e.g., `0x3c80bc83B849e37fc90ddc9Ea00Fed892A9C4d6Eb`).
  - Native copy icon next to the address to trigger clipboard copy.
* **Guidelines Box:** Light blue container with standard crypto deposit warnings (network mismatch loss, confirmation times, platform official address verification).
* **CRUCIAL RULE:** There is NO amounts input field and NO submit button for users. This page is read-only.

### C3. Recharge Records Page (`/recharge-records`)
* **Header:** Back arrow `<-` (to `/recharge`), title "recharge record".
* **Cards:** Render rows for `recharge amount`, `recharge network`, `recharge address`.
* **Footer of card:** `recharge time` (left), and a light green `completed` pill badge (right).

---

## PART D: Admin Interface — Deposit Sponsorship

### D1. Admin Deposit Form (`/admin/deposit`)
* **Audience:** Strictly Admins.
* **Fields:**
  - Target User (Searchable Dropdown/Combobox).
  - Currency (USDT, ETH, USDC).
  - Network (TRC20, ERC20, ETH).
  - Platform Wallet Address (Auto-filled or manual string to indicate where funds arrived).
  - Amount (Number input).
  - Admin Password (Password input for security verification).
* **Action:** Submits `sponsorDeposit` mutation. Updates target user's `exchangeBalance`.

### D2. Admin Logs Viewer (`/admin/deposit-logs`)
* **Audience:** Strictly Admins.
* **Display:** A table or list of cards showing all `recharges`.
* **Crucial Detail:** Must explicitly display **WHO** funded the account (e.g., "Sponsored by Admin: john@lanco.com") alongside the receiving user ("Target: user2@email.com").

---

## PART E: Reusable Component — Picker Modal

* **File:** `src/components/PickerModal.tsx`
* **Requirement:** Based on the wireframes, the network selector uses a native-style bottom sheet with a header bar.
  - **Top Left:** "Cancel" (gray text, closes modal).
  - **Top Right:** "Confirm" (blue text, applies selection and closes modal).
  - **Body:** A list of selectable items (e.g., TRC20, ERC20). The selected item should be highlighted.
* Do NOT just reuse `BottomSheetModal.tsx` from M008, as it lacks the Cancel/Confirm top bar paradigm.

---

## Implementation Order
1. Build Schema (`recharges` table).
2. Build Backend (`convex/recharges.ts`).
3. Build new UI Component (`PickerModal.tsx`).
4. Build User Recharge Pages (`/recharge`, `/recharge/:currency`, `/recharge-records`).
5. Build Admin Security & Deposit Tools (`/admin/deposit`, `/admin/deposit-logs`).
