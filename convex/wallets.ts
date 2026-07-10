import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getWallets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    
    const user = await ctx.db.get(userId);
    if (!user || !user.wallets) {
      return { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    }
    
    return user.wallets;
  },
});

export const transferFunds = mutation({
  args: {
    fromAccount: v.union(v.literal("exchange"), v.literal("trade"), v.literal("perpetual")),
    toAccount: v.union(v.literal("exchange"), v.literal("trade"), v.literal("perpetual")),
    amount: v.number(),
    currency: v.string(), // Currently just passed through for UI feedback, assumed USDT internally for MVP
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    if (args.amount <= 0) throw new Error("Transfer amount must be greater than zero");
    if (args.fromAccount === args.toAccount) throw new Error("Cannot transfer to the same account");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };

    const fromKey = `${args.fromAccount}Balance` as keyof typeof wallets;
    const toKey = `${args.toAccount}Balance` as keyof typeof wallets;

    if (wallets[fromKey] < args.amount) {
      throw new Error(`Insufficient funds in ${args.fromAccount} wallet.`);
    }

    wallets[fromKey] -= args.amount;
    wallets[toKey] += args.amount;

    await ctx.db.patch(userId, { wallets });
  },
});
