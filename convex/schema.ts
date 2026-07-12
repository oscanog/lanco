import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    juniorCertification: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      province: v.string(),
      fullName: v.string(),
      phoneNumber: v.string(),
      birthday: v.string(),
      idNumber: v.string(),
      status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
      rejectionReason: v.optional(v.string()),
    })),
    advancedCertification: v.optional(v.object({
      idCardFrontStorageId: v.id("_storage"),
      holdingIdStorageId: v.id("_storage"),
      status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
      rejectionReason: v.optional(v.string()),
    })),
    mealAllowance: v.optional(v.object({
      status: v.union(v.literal("unverified"), v.literal("pending"), v.literal("verified"), v.literal("rejected")),
      storageId: v.optional(v.id("_storage")),
      rejectionReason: v.optional(v.string()),
    })),
    fundPasswordHash: v.optional(v.string()),
    wallets: v.optional(v.object({
      exchangeBalance: v.number(),   // default 0
      tradeBalance: v.number(),      // default 0
      perpetualBalance: v.number(),  // default 0
    })),
    depositAddresses: v.optional(v.object({
      TRC20: v.string(), // e.g. T...
      ERC20: v.string(), // e.g. 0x...
      ETH: v.string(),   // e.g. 0x...
    })),
  }).index("email", ["email"]).index("phone", ["phone"]),
  numbers: defineTable({
    value: v.number(),
  }),
  settings: defineTable({
    displayCurrency: v.string(), // ISO 4217, e.g. 'USD', 'EUR'
  }),
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
  recharges: defineTable({
    userId: v.id("users"),
    fundedByAdminId: v.id("users"),
    currency: v.string(),
    network: v.string(),
    walletAddress: v.string(),
    amount: v.number(),
    status: v.literal("completed"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_admin", ["fundedByAdminId"]),
  platformAddresses: defineTable({
    currency: v.string(),              // "USDT" | "ETH" | "USDC"
    network: v.string(),               // "TRC20" | "ERC20" | "ETH"
    address: v.string(),               // The wallet address
    qrStorageId: v.optional(v.id("_storage")), // Optional uploaded QR image
    updatedByAdminId: v.id("users"),
    updatedAt: v.number(),
  }).index("by_currency_network", ["currency", "network"]),

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
    .index("by_user_and_status", ["userId", "status"])
    .index("by_settlesAt", ["settlesAt"]),

  copyTradeCodes: defineTable({
    code: v.string(),
    title: v.optional(v.string()),
    createdByAdminId: v.id("users"),
    interestRate: v.number(),
    direction: v.union(v.literal("CALL"), v.literal("PUT")),
    symbol: v.string(),
    durationSeconds: v.number(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("consumed")),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_code", ["code"])
    .index("by_createdByAdminId", ["createdByAdminId"])
    .index("by_status", ["status"]),

  copyTradeFollows: defineTable({
    userId: v.id("users"),
    codeId: v.id("copyTradeCodes"),
    code: v.string(),
    title: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    codeCreatedAt: v.optional(v.number()),
    interestRateSnapshot: v.number(),
    totalAssetSnapshot: v.number(),
    orderAmount: v.number(),
    direction: v.union(v.literal("CALL"), v.literal("PUT")),
    symbol: v.string(),
    earnedInterest: v.number(),
    codeExpiresAt: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("settled")),
    settledAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_codeId", ["codeId"]),
});
