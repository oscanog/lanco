import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Mock delivery order creation — deducts tradeBalance, inserts pending order
export const createDeliveryOrder = mutation({
  args: {
    symbol: v.string(),
    direction: v.union(v.literal("CALL"), v.literal("PUT")),
    durationSeconds: v.number(),
    amount: v.number(),
    openingPrice: v.number(),
    rateOfReturn: v.number(),
    periodStart: v.string(),
    periodEnd: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    if (wallets.tradeBalance < args.amount) {
      throw new Error("Insufficient trade balance");
    }

    // Deduct from tradeBalance
    await ctx.db.patch(userId, {
      wallets: {
        ...wallets,
        tradeBalance: wallets.tradeBalance - args.amount,
      },
    });

    const now = Date.now();
    await ctx.db.insert("deliveryOrders", {
      userId,
      symbol: args.symbol,
      direction: args.direction,
      durationSeconds: args.durationSeconds,
      amount: args.amount,
      openingPrice: args.openingPrice,
      rateOfReturn: args.rateOfReturn,
      status: "pending",
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      createdAt: now,
      settlesAt: now + args.durationSeconds * 1000,
    });

    return true;
  },
});

// Fetch user's delivery orders. Lazy-settles any expired pending ones (mock random outcome).
export const getMyDeliveryOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("deliveryOrders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    return orders;
  },
});

// Mutation to lazy-settle expired pending orders (called by client periodically)
export const settleExpiredOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const now = Date.now();
    const pendingOrders = await ctx.db
      .query("deliveryOrders")
      .withIndex("by_user_and_status", (q) => q.eq("userId", userId).eq("status", "pending"))
      .take(50);

    let settled = 0;
    for (const order of pendingOrders) {
      if (now < order.settlesAt) continue;

      // Mock settlement: random drift -0.5% to +0.5% from openingPrice
      const drift = (Math.random() - 0.5) * 0.01;
      const settlementPrice = order.openingPrice * (1 + drift);

      const isWin =
        (order.direction === "CALL" && settlementPrice > order.openingPrice) ||
        (order.direction === "PUT" && settlementPrice < order.openingPrice);

      const profitAndLoss = isWin
        ? order.amount * order.rateOfReturn
        : -order.amount;

      await ctx.db.patch(order._id, {
        status: "completed",
        settlementPrice: Math.round(settlementPrice * 100) / 100,
        profitAndLoss: Math.round(profitAndLoss * 100) / 100,
      });

      // Credit back if win
      if (isWin) {
        const user = await ctx.db.get(userId);
        if (user) {
          const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
          await ctx.db.patch(userId, {
            wallets: {
              ...wallets,
              tradeBalance: wallets.tradeBalance + order.amount + profitAndLoss,
            },
          });
        }
      }

      settled++;
    }
    return settled;
  },
});
