---
description: Trade — Delivery Trading, Copy Trade System & Interest Engine
status: Pending
---

# Milestone 10: Delivery Trading, Copy Trade & Interest Engine

> **Review Date:** 2026-07-10
> **Reviewed By:** Senior Analyst Programmer
> **Status:** OVERHAULED. Previous draft had placeholder tabs, no copy trade logic, no admin code generation, no interest engine. Fixed everything from wireframes and business rules.

## Critical Business Rules (READ FIRST)

1. **Chart is DISPLAY-ONLY.** Candlestick/volume chart is cosmetic for user learning. No real market data integration. Static simulation.
2. **Buy/Sell (CALL/PUT) is STATIC for now.** Traditional delivery order feature renders but settlement is mock. Do NOT over-engineer this.
3. **Copy Trade via "Invited me" is the REAL revenue feature.** This is where interest accrual happens.
4. **Admin generates copy trade codes** from a dedicated admin page. Codes expire after **30 minutes**. Invalid/expired codes show `"Invalid parameter"` error toast.
5. **Interest rate default is 0.4%.** Admin can configure per code. Interest is calculated on user's **total asset** (sum of all wallet balances) at the moment they click "sure" to confirm the copy.
6. **Earned interest is IMMUTABLE.** Once a copy trade settles and interest is credited, it cannot be retroactively changed even if admin changes global interest rate later. Snapshot the rate at confirmation time.

---

## PART A: Database Schema Updates (`convex/schema.ts`)

### A1. Market Display (cosmetic)

```typescript
marketPrices: defineTable({
  symbol: v.string(),        // "BTC/USDT"
  price: v.number(),         // Simulated display price
  change: v.number(),        // 24h change %
  updatedAt: v.number(),
}).index("by_symbol", ["symbol"]),
```

### A2. Delivery Orders (static/mock for now)

```typescript
deliveryOrders: defineTable({
  userId: v.id("users"),
  symbol: v.string(),
  direction: v.union(v.literal("CALL"), v.literal("PUT")),
  durationSeconds: v.number(),
  amount: v.number(),
  openingPrice: v.number(),
  settlementPrice: v.optional(v.number()),
  profitAndLoss: v.optional(v.number()),
  rateOfReturn: v.number(),
  status: v.union(v.literal("pending"), v.literal("completed")),
  periodStart: v.string(),
  periodEnd: v.string(),
  createdAt: v.number(),
  settlesAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_user_status", ["userId", "status"])
  .index("by_settles_at", ["settlesAt"]),
```

### A3. Copy Trade Codes (admin-generated)

```typescript
copyTradeCodes: defineTable({
  code: v.string(),                       // e.g. "1RG8IDF48" — alphanumeric, uppercase
  createdByAdminId: v.id("users"),        // Admin who generated it
  interestRate: v.number(),               // e.g. 0.004 for 0.4% (stored as decimal)
  orderAmount: v.number(),               // Fixed order amount for this code (e.g. 12.68)
  direction: v.union(v.literal("CALL"), v.literal("PUT")),
  symbol: v.string(),                     // e.g. "BTCUSDT"
  durationSeconds: v.number(),           // e.g. 60
  expiresAt: v.number(),                  // createdAt + 30min (1_800_000 ms)
  status: v.union(
    v.literal("active"),                   // Valid, waiting for users
    v.literal("expired"),                  // Past 30min window
    v.literal("consumed"),                 // Fully used (optional cap)
  ),
  createdAt: v.number(),
}).index("by_code", ["code"])
  .index("by_admin", ["createdByAdminId"])
  .index("by_status", ["status"]),
```

### A4. Copy Trade Follows (user follows a code)

```typescript
copyTradeFollows: defineTable({
  userId: v.id("users"),                   // User who clicked "sure"
  codeId: v.id("copyTradeCodes"),          // Reference to the code used
  code: v.string(),                        // Denormalized for display
  interestRateSnapshot: v.number(),        // FROZEN rate at confirmation time — NEVER changes
  totalAssetSnapshot: v.number(),          // User's total asset at confirmation (basis for interest)
  orderAmount: v.number(),                 // Copy of code's orderAmount
  direction: v.union(v.literal("CALL"), v.literal("PUT")),
  symbol: v.string(),
  earnedInterest: v.number(),              // Calculated: totalAssetSnapshot * interestRateSnapshot
  status: v.union(v.literal("pending"), v.literal("settled")),
  settledAt: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_code", ["codeId"]),
```

---

## PART B: Backend Operations

### B1. Price Display (`convex/trade.ts`) — cosmetic only

* **Query `getCurrentPrice`**: Return latest `marketPrices` row for symbol. Static seed data, no real ticker.
* **Query `getCandleData`**: Return hardcoded array of OHLC points for chart rendering. **No real market feed.**

### B2. Delivery Orders (`convex/trade.ts`) — static/mock

* **Mutation `createDeliveryOrder`**: Deducts from `tradeBalance`, inserts pending order. Settlement is lazy mock (random win/loss on next query).
* **Query `getMyDeliveryOrders`**: Returns user's orders. Lazy-settles expired pending ones with random outcome.

### B3. Copy Trade Code Management (`convex/copyTrade.ts`)

#### Admin-only mutations:
* **Mutation `generateCopyTradeCode`**:
  ```
  args: {
    interestRate: v.optional(v.number()),  // default 0.004 (0.4%)
    orderAmount: v.number(),
    direction: "CALL" | "PUT",
    symbol: v.string(),
    durationSeconds: v.number(),
  }
  ```
  1. Verify caller is admin.
  2. Generate random alphanumeric code (8-10 chars, uppercase).
  3. Set `expiresAt = Date.now() + 1_800_000` (30 minutes).
  4. Insert into `copyTradeCodes` with status `"active"`.
  5. Return generated code string for admin to distribute.

* **Query `getMyGeneratedCodes`**: Admin fetches all codes they created, sorted by `createdAt` desc. Shows status, how many follows, expiry countdown.

#### User-facing:
* **Mutation `redeemCopyTradeCode`**:
  ```
  args: { code: v.string() }
  ```
  1. Authenticate user.
  2. Look up code in `copyTradeCodes` by `by_code` index.
  3. **Validation — if ANY fail, throw `"Invalid parameter"` error:**
     - Code not found.
     - Code status is not `"active"`.
     - `Date.now() > expiresAt` — code expired. Also flip status to `"expired"`.
  4. Compute user's **total asset**: `exchangeBalance + tradeBalance + perpetualBalance`.
  5. Snapshot `interestRateSnapshot` from code's `interestRate`.
  6. Compute `earnedInterest = totalAssetSnapshot * interestRateSnapshot`.
  7. Insert `copyTradeFollows` record with status `"pending"`.
  8. Return follow record with `orderAmount` for confirmation modal display.

* **Mutation `confirmCopyTrade`**:
  ```
  args: { followId: v.id("copyTradeFollows") }
  ```
  1. Verify follow belongs to caller and status is `"pending"`.
  2. Credit `earnedInterest` to user's `wallets.tradeBalance` (or `exchangeBalance` — TBD by business).
  3. Mark follow as `"settled"`, set `settledAt`.

* **Query `getMyCopyHistory`**: User's settled copy trade follows. For "Copying history" sub-tab.

* **Query `getFollowersByCode`**: Admin query. Given a code ID, return list of all users who followed it with timestamps and amounts. For admin tracking.

---

## PART C: UI Design Specs (`src/Trade.tsx` & `/trade`)

### C1. Price Header & Countdown (display-only)

* Top-left: `BTC/USDT` with "delivery" label and `▼` dropdown (non-functional, single symbol for now).
* Right: `countdown 00:00:XX` ticking display.
* Large green/red price text: e.g. `64309.63`, `+1.68%`.
* Pink pill: active period range `16:33 ~ 16:34`.
* Timeframe tabs: `time sharing | 1 min | 5 min | 15 min | 30 min | 1D | 1Week | month`. Default `1 min`. Visual toggle only — chart data is static.

### C2. Chart (DISPLAY-ONLY for learning)

* Candlestick chart with hardcoded data. Red/green candles.
* Dashed horizontal line at current price level.
* Below chart: `MA5`, `MA10`, `MA20` legends + `VOLUME` bar chart row.
* **No interactive trading off chart. Purely educational display.**

### C3. Execution Form (static mock)

* **Duration selector**: `60s` | `120s` | `300s`.
* **Period selector**: Shows current minute window.
* **Amount input**: `0.00 USDT`, available balance from `tradeBalance`.
* **Percentage slider**: `1% | 10% | 25% | 50% | 100%` preset tappable markers.
* **CALL button** (green): Shows dynamic percentage e.g. `CALL 53%`.
* **PUT button** (red/pink): Shows dynamic percentage e.g. `PUT 47%`.
* Percentages are mock sentiment — random or 50/50 with slight jitter.

---

## PART D: Sub-Tabs & Order Records

4 tabs below execution area: `delivery order` | `historical orders` | `Invited me` | `Invited`.

### D1. Delivery Order (active/pending) — renders mock pending orders or empty state.

### D2. Historical Orders — settled order cards per wireframe:
* Date range picker: `2026/07/07 - 2026/07/10` with `>` chevron.
* Cards with: `PUT`/`CALL` color tag, `BTCUSDT 60s`, then key-value pairs:
  - `time period`, `profit and loss` (green/red), `rate of return` (green/red %), `order quantity`, `the number of transactions`, `opening price`, `settlement price`, `order time`.

### D3. Invited Me Tab (COPY TRADE — this is the real feature)

**Sub-tabs within "Invited me":**
* **"Initiate follow"** (default): Shows code input UI.
  - Text input: placeholder `"Please enter the order code"`.
  - Right-aligned green rounded button: `"recognize"`.
  - On tap "recognize":
    1. Calls `redeemCopyTradeCode` mutation.
    2. **If code invalid/expired**: Show red error toast at top of screen: `"⚠ Invalid parameter"` with `X` close button. Matches wireframe exactly.
    3. **If code valid**: Show confirmation modal:
       - Title: `"Confirm to follow the order"`
       - Body: `"Order amount(12.68)"` — amount from code.
       - Blue text button: `"sure"` — calls `confirmCopyTrade`.
       - Close `X` icon top-right.
* **"Copying history"**: List of user's past copy trade follows with earned interest displayed.

### D4. Invited Tab (admin/publisher perspective for future)

**Sub-tabs within "Invited":**
* **"Initiate follow"**: Same code input UI or empty.
* **"Release history"**: Shows codes the current user published (if admin). Empty for normal users.

---

## PART E: Admin Copy Trade Code Generator (`src/AdminCopyTrade.tsx` & `/admin/copy-trade`)

Dedicated admin page. **NOT inside the trade page.** Separate route.

### E1. Code Generation Form
* **Fields:**
  - Symbol: `BTCUSDT` (default, dropdown).
  - Direction: `CALL` | `PUT` toggle.
  - Duration: `60s` | `120s` | `300s` selector.
  - Order Amount: Number input (e.g. `12.68`).
  - Interest Rate %: Number input, default pre-filled `0.4`. Admin can change per code.
* **Generate button**: Calls `generateCopyTradeCode`. Displays generated code string prominently with copy-to-clipboard.
* **Expiry warning**: Shows `"This code expires in 30 minutes"` with live countdown.

### E2. Generated Codes History
* Table/list of all codes this admin generated.
* Columns: `Code`, `Direction`, `Amount`, `Interest %`, `Status` (active/expired/consumed), `Followers Count`, `Created`, `Expires In`.
* Tapping a code row expands to show follower list (users who clicked "sure") with: user name/email, total asset snapshot, earned interest, timestamp.

---

## PART F: Interest Calculation Rules (IMMUTABLE)

```
On user clicking "sure" to confirm copy trade:

  totalAsset = user.wallets.exchangeBalance
             + user.wallets.tradeBalance
             + user.wallets.perpetualBalance

  interestRateSnapshot = copyTradeCode.interestRate  // frozen at this moment
  earnedInterest = totalAsset * interestRateSnapshot

  → Credit earnedInterest to user's tradeBalance
  → Record is FINAL. No retroactive changes.
```

**Even if admin changes global interest later, already-settled follows keep their original snapshot rate and earned amount. This is non-negotiable.**

---

## PART G: Global Routing Integration

* `/trade` → `src/Trade.tsx` (main trading page with chart, execution, tabs).
* `/admin/copy-trade` → `src/AdminCopyTrade.tsx` (admin code generator + history).
* Wire bottom nav "trade" icon across `Dashboard.tsx`, `MyAssets.tsx`, `Profile.tsx` to `/trade`.
* Add "Copy Trade Codes" link in admin navigation/manage-users sidebar.

---

## Implementation Order

1. Schema: `marketPrices`, `deliveryOrders`, `copyTradeCodes`, `copyTradeFollows`.
2. Backend: `convex/trade.ts` (mock price + delivery orders), `convex/copyTrade.ts` (code gen + redeem + settle).
3. Admin page: `src/AdminCopyTrade.tsx`.
4. Trade page: `src/Trade.tsx` with all 4 tabs wired.
5. Routing + nav bar integration.
6. `npm run build` verification.
