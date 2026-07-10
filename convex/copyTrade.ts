import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate random alphanumeric code (uppercase, 8 chars)
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// ─── ADMIN: Generate a copy trade code ───
export const generateCopyTradeCode = mutation({
  args: {
    orderAmount: v.number(),
    direction: v.union(v.literal("CALL"), v.literal("PUT")),
    symbol: v.string(),
    durationSeconds: v.number(),
    interestRate: v.optional(v.number()), // default 0.004 (0.4%)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    if (args.orderAmount <= 0) throw new Error("Order amount must be positive");

    const rate = args.interestRate ?? 0.004;
    const now = Date.now();
    const code = generateCode();

    await ctx.db.insert("copyTradeCodes", {
      code,
      createdByAdminId: userId,
      interestRate: rate,
      orderAmount: args.orderAmount,
      direction: args.direction,
      symbol: args.symbol,
      durationSeconds: args.durationSeconds,
      status: "active",
      expiresAt: now + EXPIRY_MS,
      createdAt: now,
    });

    return code;
  },
});

// ─── ADMIN: List generated codes ───
export const getMyGeneratedCodes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const codes = await ctx.db
      .query("copyTradeCodes")
      .withIndex("by_createdByAdminId", (q) => q.eq("createdByAdminId", userId))
      .order("desc")
      .take(100);

    // Count followers per code
    const now = Date.now();
    const enriched = await Promise.all(
      codes.map(async (c) => {
        const follows = await ctx.db
          .query("copyTradeFollows")
          .withIndex("by_codeId", (q) => q.eq("codeId", c._id))
          .take(200);

        // Auto-expire if past time
        const effectiveStatus = c.status === "active" && now > c.expiresAt ? "expired" : c.status;

        return {
          ...c,
          effectiveStatus,
          followersCount: follows.length,
        };
      })
    );

    return enriched;
  },
});

// ─── ADMIN: Get followers for a specific code ───
export const getFollowersByCode = query({
  args: { codeId: v.id("copyTradeCodes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const follows = await ctx.db
      .query("copyTradeFollows")
      .withIndex("by_codeId", (q) => q.eq("codeId", args.codeId))
      .order("desc")
      .take(200);

    const enriched = await Promise.all(
      follows.map(async (f) => {
        const followUser = await ctx.db.get(f.userId);
        return {
          ...f,
          userName: followUser?.name || "Unknown",
          userEmail: followUser?.email || "No email",
        };
      })
    );

    return enriched;
  },
});

// ─── USER: Redeem a copy trade code ───
export const redeemCopyTradeCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const trimmed = args.code.trim().toUpperCase();
    if (!trimmed) throw new Error("Invalid parameter");

    // Look up code
    const codeDoc = await ctx.db
      .query("copyTradeCodes")
      .withIndex("by_code", (q) => q.eq("code", trimmed))
      .unique();

    if (!codeDoc) throw new Error("Invalid parameter");

    // Check validity
    const now = Date.now();
    if (codeDoc.status !== "active") throw new Error("Invalid parameter");
    if (now > codeDoc.expiresAt) {
      // Auto-expire
      await ctx.db.patch(codeDoc._id, { status: "expired" });
      throw new Error("Invalid parameter");
    }

    // ── Duplicate guard: one user can only follow a code ONCE ──
    const existingFollow = await ctx.db
      .query("copyTradeFollows")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("codeId"), codeDoc._id))
      .first();
    if (existingFollow) throw new Error("You have already followed this order");

    // Compute user total asset
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    const totalAsset = wallets.exchangeBalance + wallets.tradeBalance + wallets.perpetualBalance;

    // Snapshot interest rate — FROZEN at this moment, never changes retroactively
    const interestRateSnapshot = codeDoc.interestRate;
    const earnedInterest = Math.round(totalAsset * interestRateSnapshot * 100) / 100;

    const followId = await ctx.db.insert("copyTradeFollows", {
      userId,
      codeId: codeDoc._id,
      code: codeDoc.code,
      interestRateSnapshot,
      totalAssetSnapshot: totalAsset,
      orderAmount: codeDoc.orderAmount,
      direction: codeDoc.direction,
      symbol: codeDoc.symbol,
      earnedInterest,
      codeExpiresAt: codeDoc.expiresAt,
      status: "pending",
      createdAt: now,
    });

    return {
      followId,
      orderAmount: codeDoc.orderAmount,
      direction: codeDoc.direction,
      symbol: codeDoc.symbol,
      earnedInterest,
    };
  },
});

// ─── USER: Confirm copy trade (click "sure") ───
export const confirmCopyTrade = mutation({
  args: { followId: v.id("copyTradeFollows") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const follow = await ctx.db.get(args.followId);
    if (!follow) throw new Error("Follow record not found");
    if (follow.userId !== userId) throw new Error("Unauthorized");
    if (follow.status !== "pending") throw new Error("Already settled");

    // Credit earned interest to tradeBalance — IMMUTABLE once done
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    await ctx.db.patch(userId, {
      wallets: {
        ...wallets,
        tradeBalance: wallets.tradeBalance + follow.earnedInterest,
      },
    });

    await ctx.db.patch(args.followId, {
      status: "settled",
      settledAt: Date.now(),
    });

    return true;
  },
});

// ─── USER: Get copy trade history ("Copying history" sub-tab) ───
export const getMyCopyHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const follows = await ctx.db
      .query("copyTradeFollows")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    return follows;
  },
});
