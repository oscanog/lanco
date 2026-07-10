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
});
