import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const hasFundPassword = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    
    const user = await ctx.db.get(userId);
    return !!user?.fundPasswordHash;
  },
});

export const setFundPassword = mutation({
  args: {
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.fundPasswordHash) {
      throw new Error("Fund password already exists. Use change fund password instead.");
    }

    if (args.newPassword !== args.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (args.newPassword.length < 6) {
      throw new Error("Fund password must be at least 6 characters.");
    }

    // In a real app, hash this properly. MVP saves plaintext simulation as "hash".
    await ctx.db.patch(userId, { fundPasswordHash: args.newPassword });
  },
});

export const changeFundPassword = mutation({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (!user.fundPasswordHash) {
      throw new Error("No existing fund password detected.");
    }

    if (user.fundPasswordHash !== args.oldPassword) {
      throw new Error("Old fund password is incorrect.");
    }

    if (args.newPassword !== args.confirmPassword) {
      throw new Error("New passwords do not match.");
    }

    if (args.newPassword.length < 6) {
      throw new Error("Fund password must be at least 6 characters.");
    }

    await ctx.db.patch(userId, { fundPasswordHash: args.newPassword });
  },
});
