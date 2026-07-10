import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    juniorCertification: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      province: v.string(),
      fullName: v.string(),
      phoneNumber: v.string(),
      birthday: v.string(),
      idNumber: v.string(),
      status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    })),
    advancedCertification: v.optional(v.object({
      idCardFrontStorageId: v.id("_storage"),
      holdingIdStorageId: v.id("_storage"),
      status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    })),
  }).index("email", ["email"]).index("phone", ["phone"]),
  numbers: defineTable({
    value: v.number(),
  }),
});
