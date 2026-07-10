import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getWithdrawalHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc") // requires sorting by _creationTime descending usually unless otherwise stated
      .collect();
      
    // Sort manually by createdAt descending as the order() method uses _creationTime by default
    return withdrawals.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const submitWithdrawal = mutation({
  args: {
    currency: v.string(), // "USDT" | "ETH" | "USDC"
    network: v.string(), // "TRC20" | "ERC20"
    walletAddress: v.string(),
    fundPassword: v.string(),
    amount: v.number(),
    sourceAccount: v.union(v.literal("exchange"), v.literal("trade"), v.literal("perpetual")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Step 1: Validate fund password
    if (!user.fundPasswordHash) {
      throw new Error("No fund password set. Please setup a fund password in Security Center first.");
    }
    // In a real app we'd hash args.fundPassword and compare, for MVP we do a simple strict equality check on the basic stored hash.
    // Replace heavily in production!
    if (user.fundPasswordHash !== args.fundPassword) {
      throw new Error("Fund password incorrect.");
    }

    // Step 2: Validate amount and balance
    if (args.amount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero.");
    }
    const wallets = user.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    const sourceKey = `${args.sourceAccount}Balance` as keyof typeof wallets;
    if (wallets[sourceKey] < args.amount) {
      throw new Error(`Insufficient funds in ${args.sourceAccount} wallet.`);
    }

    // Step 3-4: Calculate fees
    const handlingFee = parseFloat((args.amount * 0.20).toFixed(8));
    const amountReceived = parseFloat((args.amount - handlingFee).toFixed(8));

    // Step 5: Deduct balance
    wallets[sourceKey] -= args.amount;
    await ctx.db.patch(userId, { wallets });

    // Step 6: Insert withdrawal record
    await ctx.db.insert("withdrawals", {
      userId,
      currency: args.currency,
      network: args.network,
      walletAddress: args.walletAddress,
      withdrawalAmount: args.amount,
      handlingFee,
      amountReceived,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
