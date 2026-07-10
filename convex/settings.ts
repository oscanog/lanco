import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    let settings = await ctx.db.query("settings").first();
    // Default to USD if no setup exists
    if (!settings) {
      return { displayCurrency: "USD" };
    }
    return settings;
  },
});

export const updateDisplayCurrency = mutation({
  args: { currency: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");

    let settings = await ctx.db.query("settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, { displayCurrency: args.currency });
    } else {
      await ctx.db.insert("settings", { displayCurrency: args.currency });
    }
  },
});
