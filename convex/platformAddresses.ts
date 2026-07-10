import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Fetch all configured platform addresses
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("platformAddresses").collect();
  },
});

// Fetch a specific address by currency + network
export const getAddress = query({
  args: { currency: v.string(), network: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("platformAddresses")
      .withIndex("by_currency_network", (q) =>
        q.eq("currency", args.currency).eq("network", args.network)
      )
      .first();
    return record;
  },
});

// Upsert a platform address (Admin only)
export const upsertAddress = mutation({
  args: {
    currency: v.string(),
    network: v.string(),
    address: v.string(),
    qrStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    // Check if record already exists
    const existing = await ctx.db
      .query("platformAddresses")
      .withIndex("by_currency_network", (q) =>
        q.eq("currency", args.currency).eq("network", args.network)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        address: args.address,
        qrStorageId: args.qrStorageId,
        updatedByAdminId: userId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new
      await ctx.db.insert("platformAddresses", {
        currency: args.currency,
        network: args.network,
        address: args.address,
        qrStorageId: args.qrStorageId,
        updatedByAdminId: userId,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// Delete a platform address (Admin only)
export const deleteAddress = mutation({
  args: { currency: v.string(), network: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("platformAddresses")
      .withIndex("by_currency_network", (q) =>
        q.eq("currency", args.currency).eq("network", args.network)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return true;
  },
});

// Generate upload URL for QR image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});
