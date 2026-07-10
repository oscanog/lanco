import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyRecharges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const recharges = await ctx.db
      .query("recharges")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return recharges;
  },
});

export const getAllSponsoredLogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const recharges = await ctx.db
      .query("recharges")
      .order("desc")
      .collect();

    const expandedLogs = await Promise.all(
      recharges.map(async (r) => {
        const targetUser = await ctx.db.get(r.userId);
        const sponsorAdmin = await ctx.db.get(r.fundedByAdminId);
        
        return {
          ...r,
          targetUser: {
            name: targetUser?.name || "Unknown",
            email: targetUser?.email || "No email",
          },
          sponsorAdmin: {
            name: sponsorAdmin?.name || "Unknown Admin",
            email: sponsorAdmin?.email || "No email",
          },
        };
      })
    );

    return expandedLogs;
  },
});

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const adminUser = await ctx.db.get(userId);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // 2. Validate adminPassword
    if (adminUser.fundPasswordHash !== args.adminPassword) {
      // NOTE: Instead of bringing in `lucia` password hashing to match auth accounts,
      // the system requires users/admins to have a fund password set via security center.
      // So we check it against fundPasswordHash.
      if (!adminUser.fundPasswordHash) {
         throw new Error("You must set up a Fund Password in Security Center first to sponsor deposits.");
      }
      throw new Error("Invalid admin password/fund password.");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("Target user not found");

    if (args.amount <= 0) throw new Error("Amount must be greater than zero");

    // Initialize checking
    const currentWallets = targetUser.wallets || { exchangeBalance: 0, tradeBalance: 0, perpetualBalance: 0 };
    
    // Atomically increment exchange balance
    await ctx.db.patch(args.targetUserId, {
      wallets: {
        ...currentWallets,
        exchangeBalance: currentWallets.exchangeBalance + args.amount,
      }
    });

    // Insert record
    await ctx.db.insert("recharges", {
      userId: args.targetUserId,
      fundedByAdminId: userId,
      currency: args.currency,
      network: args.network,
      walletAddress: args.walletAddress,
      amount: args.amount,
      status: "completed",
      createdAt: Date.now(),
    });

    return true;
  },
});
