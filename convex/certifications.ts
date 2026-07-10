import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const submitJunior = mutation({
  args: {
    country: v.string(),
    city: v.string(),
    province: v.string(),
    fullName: v.string(),
    phoneNumber: v.string(),
    birthday: v.string(),
    idNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await ctx.db.patch(userId, {
      juniorCertification: {
        ...args,
        status: "pending",
      },
    });
  },
});

export const submitAdvanced = mutation({
  args: {
    idCardFrontStorageId: v.id("_storage"),
    holdingIdStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    // Double check junior certification is verified First
    const user = await ctx.db.get(userId);
    if (user?.juniorCertification?.status !== "verified") {
      throw new Error("You must pass Junior Certification before submitting Advanced.");
    }

    await ctx.db.patch(userId, {
      advancedCertification: {
        ...args,
        status: "pending",
      },
    });
  },
});

export const approveCertification = mutation({
  args: { targetUserId: v.id("users"), type: v.union(v.literal("junior"), v.literal("advanced")) },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("User not found");

    if (args.type === "junior" && targetUser.juniorCertification) {
      await ctx.db.patch(args.targetUserId, {
        juniorCertification: {
          ...targetUser.juniorCertification,
          status: "verified",
        },
      });
    } else if (args.type === "advanced" && targetUser.advancedCertification) {
      await ctx.db.patch(args.targetUserId, {
        advancedCertification: {
          ...targetUser.advancedCertification,
          status: "verified",
        },
      });
    }
  },
});

export const rejectCertification = mutation({
  args: { targetUserId: v.id("users"), type: v.union(v.literal("junior"), v.literal("advanced")) },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("User not found");

    if (args.type === "junior" && targetUser.juniorCertification) {
      await ctx.db.patch(args.targetUserId, {
        juniorCertification: { ...targetUser.juniorCertification, status: "rejected" },
      });
    } else if (args.type === "advanced" && targetUser.advancedCertification) {
      await ctx.db.patch(args.targetUserId, {
        advancedCertification: { ...targetUser.advancedCertification, status: "rejected" },
      });
    }
  },
});
