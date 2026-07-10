import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, createAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getRole = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.role;
  }
});

export const adminCreateUser = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const role = await ctx.runQuery(api.admin.getRole, { userId });
    if (role !== "admin") throw new Error("Unauthorized");

    await createAccount(ctx, {
      provider: "password",
      account: { id: args.email, secret: args.password },
      profile: { email: args.email, role: "user" }
    });
  }
});

export const adminResetPassword = action({
  args: { email: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const role = await ctx.runQuery(api.admin.getRole, { userId });
    if (role !== "admin") throw new Error("Unauthorized");

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: args.email, secret: args.newPassword }
    });
  }
});
