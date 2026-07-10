import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  }
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    
    return await ctx.db.query("users").collect();
  }
});

export const getUser = query({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) return null;

    let advancedData = targetUser.advancedCertification;
    if (advancedData) {
      const idUrl = await ctx.storage.getUrl(advancedData.idCardFrontStorageId);
      const holdUrl = await ctx.storage.getUrl(advancedData.holdingIdStorageId);
      (advancedData as any).idCardFrontUrl = idUrl;
      (advancedData as any).holdingIdUrl = holdUrl;
    }

    let mealData = targetUser.mealAllowance;
    if (mealData && mealData.storageId) {
      const mealUrl = await ctx.storage.getUrl(mealData.storageId);
      (mealData as any).mealAllowanceUrl = mealUrl;
    }

    return targetUser;
  }
});

export const getSecureUserById = query({
  args: { userIdString: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const admin = await ctx.db.get(userId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    
    let targetId;
    try {
      targetId = ctx.db.normalizeId("users", args.userIdString);
    } catch {
      return null;
    }
    
    if (!targetId) return null;
    return await ctx.db.get(targetId);
  }
});

// Helper for generating random crypto addresses
function generateRandomAddress(network: "TRC20" | "ERC20") {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const hexChars = "0123456789abcdef";
  let addr = "";
  if (network === "TRC20") {
    addr = "T";
    for (let i = 0; i < 33; i++) {
        addr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } else {
    addr = "0x";
    for (let i = 0; i < 40; i++) {
        addr += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }
  }
  return addr;
}

import { mutation } from "./_generated/server";

export const generateDepositAddresses = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    let user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.depositAddresses) {
      return user.depositAddresses;
    }

    const newAddresses = {
      TRC20: generateRandomAddress("TRC20"),
      ERC20: generateRandomAddress("ERC20"),
      ETH: generateRandomAddress("ERC20"),
    };

    await ctx.db.patch(userId, { depositAddresses: newAddresses });
    return newAddresses;
  }
});

export const getUserByDepositAddress = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const admin = await ctx.db.get(userId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    
    // We have to iterate since we didn't index the object keys, but for admin query it's acceptable for now
    const allUsers = await ctx.db.query("users").collect();
    const target = allUsers.find(u => 
      u.depositAddresses?.TRC20 === args.address || 
      u.depositAddresses?.ERC20 === args.address || 
      u.depositAddresses?.ETH === args.address
    );
    
    return target || null;
  }
});

