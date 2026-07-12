import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  getAuthUserId,
  retrieveAccount,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";

export const changeLoginPassword = action({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    if (args.newPassword !== args.confirmPassword) {
      throw new Error("New passwords do not match.");
    }

    const missing = [];
    if (args.newPassword.length < 8) missing.push("8 characters");
    if (!/[a-zA-Z]/.test(args.newPassword)) missing.push("one letter");
    if (!/\d/.test(args.newPassword)) missing.push("one number");
    
    if (missing.length > 0) {
      throw new Error(`Password is too weak. It must contain at least: ${missing.join(", ")}.`);
    }

    // Look up the user to get their email (account ID for the password provider)
    const user = await ctx.runQuery(
      // @ts-ignore — internal query to fetch user doc
      (await import("./_generated/api")).api.users.getMe,
    );
    if (!user?.email) {
      throw new Error("Cannot determine account email.");
    }

    // Verify old password by retrieving the account with old credentials
    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: { id: user.email, secret: args.oldPassword },
      });
    } catch {
      throw new Error("Old password is incorrect.");
    }

    // Update to new password
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.email, secret: args.newPassword },
    });

    return true;
  },
});
