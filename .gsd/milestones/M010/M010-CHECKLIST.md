---
description: M010 Implementation Progress Checklist
status: In Progress
---

# M010 Implementation Checklist

> **Last Updated:** 2026-07-10
> **Reference:** `.gsd/milestones/M010/M010-DELIVERY-TRADE.md`

---

## Step 1: Schema Updates
- [x] Add `deliveryOrders` table (mock trades).
- [x] Add `copyTradeCodes` table (admin-generated codes with 30min expiry).
- [x] Add `copyTradeFollows` table (tracks user copy trade confirmations with frozen interest snapshots).

## Step 2: Backend — Mock Trade (`convex/trade.ts`)
- [x] `createDeliveryOrder` mutation (deduct tradeBalance, insert pending).
- [x] `getMyDeliveryOrders` query (fetch user orders).
- [x] `settleExpiredOrders` mutation (lazy mock settlement with random outcome).

## Step 3: Backend — Copy Trade Engine (`convex/copyTrade.ts`)
- [x] `generateCopyTradeCode` mutation (admin-only, 30min expiry, configurable interest default 0.4%).
- [x] `redeemCopyTradeCode` mutation (validate code, check expiry, snapshot total asset + interest rate).
- [x] `confirmCopyTrade` mutation (credit earned interest to tradeBalance, mark settled, IMMUTABLE).
- [x] `getMyGeneratedCodes` query (admin: list codes + follower counts).
- [x] `getMyCopyHistory` query (user: settled copy trade history).
- [x] `getFollowersByCode` query (admin: who followed a specific code).

## Step 4: Admin Copy Trade Page (`src/AdminCopyTrade.tsx`)
- [x] Code generation form (symbol, direction, duration, amount, interest %).
- [x] Display generated code with copy-to-clipboard + 30min countdown.
- [x] Generated codes history table with status + follower tracking.

## Step 5: Trade Main Page (`src/Trade.tsx`)
- [x] Live Binance WebSocket chart (real BTC/USDT data via `wss://stream.binance.com`).
- [x] Ticker header with countdown.
- [x] Canvas-rendered candlestick + volume chart with MA5/MA10/MA20 legends.
- [x] Duration/period selectors.
- [x] Amount input + percentage slider (1%/10%/25%/50%/100%).
- [x] CALL/PUT buttons (static mock settlement).

## Step 6: Trade Sub-Tabs
- [x] **Delivery order** tab: pending orders or empty state.
- [x] **Historical orders** tab: settled cards.
- [x] **Invited me** tab:
  - [x] "Initiate follow" sub-tab: code input + "recognize" button.
  - [x] Validation: "Invalid parameter" red error toast on bad/expired code.
  - [x] Confirmation modal: "Confirm to follow the order" + "Order amount(X)" + "sure" button.
  - [x] "Copying history" sub-tab: list of user's copy trade follows.
- [x] **Invited** tab:
  - [x] "Initiate follow" sub-tab.
  - [x] "Release history" sub-tab placeholder.

## Step 7: Routing & Nav Integration
- [x] Register `/trade` in `src/main.tsx`.
- [x] Register `/admin/copy-trade` in `src/main.tsx`.
- [x] Wire bottom nav "trade" icon in Dashboard + MyAssets to `/trade`.
- [x] `npm run build` verification — PASS.
